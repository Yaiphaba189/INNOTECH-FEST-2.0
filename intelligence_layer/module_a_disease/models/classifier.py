"""Computer vision model loading and calibrated inference engine.

Implements:
- MobileNetV3-Small checkpoints trained by `training/train.py` (class list, temperature and
  held-out test metrics travel inside the checkpoint).
- Hybrid coverage: classes the trained model never saw (no licensed public data, e.g. pineapple
  heart/black rot) are screened by the explainable colour analyzer, never by guesswork.
- Colour-analyzer-only fallback when no checkpoint exists.
"""

from __future__ import annotations

import math
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple
from PIL import Image

from .classifier_math import TEMPERATURE, apply_temperature_scaling  # noqa: F401
from .colour_analyzer import LOW_COVERAGE_CONFIDENCE, MIN_PLANT_COVERAGE, analyze_colour_pathology
from ..triage.triage_rules import PRELIMINARY_THRESHOLD

ROOT_DIR = Path(__file__).resolve().parents[3]
MODELS_DIR = ROOT_DIR / "data" / "models"

CROP_CLASSES: Dict[str, List[str]] = {
    "pineapple": ["heart_rot", "black_rot", "mealybug_wilt", "healthy"],
    "rice": ["blast", "bacterial_leaf_blight", "sheath_blight", "tungro", "healthy"],
    "orange": ["citrus_canker", "citrus_greening_hlb", "powdery_mildew", "root_rot", "healthy"],
    "chilli": ["anthracnose", "leaf_curl", "bacterial_wilt", "healthy"]
}

class DiseaseClassifier:
    """Manages inference and calibration for crop disease screening models."""

    def __init__(self, crop: str = "pineapple"):
        self.crop = crop.lower()
        self.classes = CROP_CLASSES.get(self.crop, CROP_CLASSES["pineapple"])
        self.weights_path = MODELS_DIR / f"disease_mobilenetv3_{self.crop}.pt"
        self._model = None
        self.model_classes: List[str] = []
        self.temperature = TEMPERATURE
        self.metrics: Dict[str, Any] = {}
        self.last_evidence: Dict[str, float] = {}
        self._load_weights_if_available()
        if self._model is not None:
            self.model_version = f"MobileNetV3-Small-trained-{self.crop}-{self.metrics.get('trained_on', 'unknown')}"
        else:
            self.model_version = f"MobileNetV3-Small-v1.0.0-{self.crop}-colour-heuristic"

    @property
    def uncovered_classes(self) -> List[str]:
        """Classes this crop screens for that the trained model has no data for."""
        return [c for c in self.classes if c not in self.model_classes] if self._model is not None else []

    @property
    def inference_mode(self) -> str:
        """'trained_model' (full coverage), 'hybrid' (model + colour rules for uncovered classes),
        or 'colour_heuristic' (no checkpoint: explainable pixel-colour rules only)."""
        if self._model is None:
            return "colour_heuristic"
        return "hybrid" if self.uncovered_classes else "trained_model"

    def _load_weights_if_available(self) -> None:
        """Loads a PyTorch checkpoint if torch is installed and weights exist."""
        if os.environ.get("HARVESTLINK_DISABLE_TRAINED_MODELS") or not self.weights_path.exists():
            return
        try:
            import torch
            import torchvision.models as models

            checkpoint = torch.load(self.weights_path, map_location="cpu")
            if "state_dict" in checkpoint:
                classes = list(checkpoint["classes"])
                state = checkpoint["state_dict"]
                self.temperature = float(checkpoint.get("temperature", TEMPERATURE))
                self.metrics = dict(checkpoint.get("metrics", {}))
            else:  # legacy bare state_dict over the crop's full class list
                classes, state = list(self.classes), checkpoint
            model = models.mobilenet_v3_small(weights=None)
            model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, len(classes))
            model.load_state_dict(state)
            model.eval()
            self._model = model
            self.model_classes = classes
        except Exception:
            self._model = None
            self.model_classes = []

    def _model_probabilities(self, image: Image.Image) -> Dict[str, float]:
        import torch
        import torchvision.transforms as transforms

        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        with torch.no_grad():
            logits = self._model(transform(image).unsqueeze(0)).squeeze(0).tolist()
        probs = apply_temperature_scaling(logits, self.temperature)
        return dict(zip(self.model_classes, probs))

    def predict_detailed(self, image: Image.Image) -> Dict[str, Any]:
        """Executes inference over a preprocessed 224x224 RGB image.

        Returns {predicted_class, confidence, probabilities, evidence, mode}; `mode` is the engine that
        produced this particular answer ('trained_model' or 'colour_heuristic').
        """
        colour_cls, colour_conf, colour_probs, evidence = analyze_colour_pathology(image, self.crop)
        if self._model is None:
            return {"predicted_class": colour_cls, "confidence": colour_conf,
                    "probabilities": colour_probs, "evidence": evidence, "mode": "colour_heuristic"}

        # The model has never seen the uncovered classes, so its "healthy"/other answer is no evidence
        # against them. If the colour rules lean towards one at preliminary confidence, report that
        # (triage then tells the grower to re-scan / escalate) instead of the model's guess.
        if colour_cls in self.uncovered_classes and colour_conf >= PRELIMINARY_THRESHOLD:
            return {"predicted_class": colour_cls, "confidence": colour_conf,
                    "probabilities": colour_probs, "evidence": evidence, "mode": "colour_heuristic"}

        probs = self._model_probabilities(image)
        top = max(probs, key=probs.get)
        confidence = probs[top]
        if evidence["plant_coverage"] < MIN_PLANT_COVERAGE:  # not a plant photo: never claim confidence
            confidence = min(confidence, LOW_COVERAGE_CONFIDENCE)
        return {"predicted_class": top, "confidence": confidence, "probabilities": probs,
                "evidence": evidence, "mode": "trained_model"}

    def predict(
        self,
        image: Image.Image,
        image_angle: str = "crown",
        image_hash: str = ""
    ) -> Tuple[str, float, Dict[str, float]]:
        """Backward-compatible tuple form of predict_detailed()."""
        result = self.predict_detailed(image)
        self.last_evidence = result["evidence"]
        return result["predicted_class"], result["confidence"], result["probabilities"]
