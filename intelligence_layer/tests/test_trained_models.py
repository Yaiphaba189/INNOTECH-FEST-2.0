"""Sanity checks that shipped checkpoints really classify their held-out test images.

Skipped on machines without data/models checkpoints or data/training images.
"""

from __future__ import annotations

import io
import json
from pathlib import Path

import pytest
from PIL import Image

from intelligence_layer.module_a_disease.models.classifier import DiseaseClassifier
from intelligence_layer.module_a_disease.preprocessing.transforms import preprocess_image

ROOT = Path(__file__).resolve().parents[2]
MODELS = ROOT / "data" / "models"
SAMPLES_PER_CLASS = 12


def _trained_crops():
    return [c for c in ("pineapple", "rice", "orange")
            if (MODELS / f"disease_mobilenetv3_{c}.pt").exists() and (MODELS / f"{c}_split.json").exists()]


@pytest.fixture(autouse=True)
def enable_trained_models(monkeypatch):
    monkeypatch.delenv("HARVESTLINK_DISABLE_TRAINED_MODELS", raising=False)


@pytest.mark.parametrize("crop", _trained_crops() or [pytest.param("none", marks=pytest.mark.skip("no trained checkpoints"))])
def test_checkpoint_classifies_heldout_images(crop):
    pytest.importorskip("torch")
    classifier = DiseaseClassifier(crop)
    assert classifier._model is not None and classifier.metrics["accuracy"] > 0

    test_paths = json.loads((MODELS / f"{crop}_split.json").read_text())["test"]
    per_class: dict[str, list[str]] = {}
    for rel in test_paths:
        per_class.setdefault(Path(rel).parent.name, []).append(rel)

    correct = total = 0
    for cls, paths in per_class.items():
        for rel in paths[:SAMPLES_PER_CLASS]:
            if not (ROOT / rel).exists():
                pytest.skip("training images not present on this machine")
            image, _ = preprocess_image((ROOT / rel).read_bytes())
            total += 1
            correct += classifier.predict_detailed(image)["predicted_class"] == cls
    assert correct / total >= 0.80, f"{crop}: {correct}/{total} correct on held-out samples"


@pytest.mark.skipif("pineapple" not in _trained_crops(), reason="no pineapple checkpoint")
def test_pineapple_rot_colours_use_colour_rules_not_model_guess():
    """The model has no heart_rot class; rot-coloured photos must not be answered 'healthy'."""
    classifier = DiseaseClassifier("pineapple")
    assert "heart_rot" in classifier.uncovered_classes and classifier.inference_mode == "hybrid"
    buf = io.BytesIO()
    Image.new("RGB", (224, 224), (150, 100, 45)).save(buf, format="JPEG")
    image, _ = preprocess_image(buf.getvalue())
    result = classifier.predict_detailed(image)
    assert result["predicted_class"] == "heart_rot" and result["mode"] == "colour_heuristic"
