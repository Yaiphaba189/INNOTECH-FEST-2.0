"""Unified disease screening pipeline interfacing backend services to Module A AI engines."""

from __future__ import annotations

from typing import Any, Dict

from intelligence_layer.module_a_disease.preprocessing.transforms import preprocess_image
from intelligence_layer.module_a_disease.models.classifier import DiseaseClassifier
from intelligence_layer.module_a_disease.triage.triage_rules import (
    DISEASE_REMEDIES,
    synthesize_triage,
)

from intelligence_layer.module_a_disease.models.acoustic_grader import (
    evaluate_acoustic_resonance,
    analyze_audio_samples,
    calculate_firmness_index,
)

# Shared classifiers cache by crop
_CLASSIFIERS: Dict[str, DiseaseClassifier] = {}


def get_classifier(crop: str = "pineapple") -> DiseaseClassifier:
    crop_clean = crop.lower()
    if crop_clean not in _CLASSIFIERS:
        _CLASSIFIERS[crop_clean] = DiseaseClassifier(crop=crop_clean)
    return _CLASSIFIERS[crop_clean]


def predict_crop_disease(
    image_bytes: bytes,
    image_angle: str = "crown",
    crop: str = "pineapple",
    peak_frequency_hz: float | None = None,
    damping_ratio: float = 0.045,
    mass_kg: float = 1.20
) -> Dict[str, Any]:
    """
    End-to-end crop disease screening pipeline:
    1. Validates and preprocesses image bytes to 224x224 RGB.
    2. Computes SHA-256 forensic audit hash.
    3. Runs calibrated vision model classification.
    4. Integrates multimodal Acoustic Thumb-Thump resonance if provided.
    5. Synthesizes diagnostic triage status, action protocols, and regional remedies.
    """
    # 1 & 2. Preprocess and compute SHA-256
    processed_img, image_hash = preprocess_image(image_bytes)

    # 3. Predict class with calibrated probabilities
    classifier = get_classifier(crop)
    detail = classifier.predict_detailed(processed_img)
    predicted_class = detail["predicted_class"]
    confidence_score = detail["confidence"]
    probabilities = detail["probabilities"]

    # 4. Synthesize diagnostic triage & remedies
    triage_result = synthesize_triage(
        predicted_class=predicted_class,
        confidence_score=confidence_score
    )

    result = {
        "diagnostic_status": triage_result["diagnostic_status"],
        "predicted_class": triage_result["predicted_class"],
        "local_name": triage_result["local_name"],
        "scientific_name": triage_result["scientific_name"],
        "confidence_score": triage_result["confidence_score"],
        "severity_rating": triage_result["severity_rating"],
        "refer_to_expert": triage_result["refer_to_expert"],
        "triage_action": triage_result["triage_action"],
        "symptoms_detected": triage_result["symptoms_detected"],
        "recommended_actions": triage_result["recommended_actions"],
        "all_class_probabilities": probabilities,
        "model_version": classifier.model_version,
        "inference_mode": detail["mode"],
        "evidence": detail["evidence"],
        "image_hash_sha256": image_hash,
        "image_angle": image_angle,
        "crop": crop
    }

    # 5. Multimodal Acoustic Thumb-Thump integration
    if peak_frequency_hz is not None:
        acoustic = evaluate_acoustic_resonance(
            peak_frequency_hz=peak_frequency_hz,
            damping_ratio=damping_ratio,
            mass_kg=mass_kg,
            crop=crop
        )
        result["acoustic_grading"] = acoustic
        # If acoustic detects internal water blister (< 85 Hz), elevate triage even if outer shell looks normal!
        if acoustic["internal_status"] == "internal_water_blister":
            result["diagnostic_status"] = "confirmed"
            result["severity_rating"] = "severe"
            result["predicted_class"] = "internal_water_blister"
            result["local_name"] = "ঈশিং থম্লিবা হৈনোম (Osmotic Water Blister)"
            result["triage_action"] = (
                f"Acoustic Bio-Resonance Alert ({peak_frequency_hz:.1f} Hz < 85 Hz): "
                f"Severe internal waterlogging detected. Divert from long-haul transit immediately."
            )

    return result


def describe_models() -> list[Dict[str, Any]]:
    """Model cards: which engine serves each crop, what it covers, and its held-out test metrics."""
    cards = []
    for crop in ("pineapple", "rice", "orange"):
        clf = get_classifier(crop)
        m = clf.metrics
        cards.append({
            "crop": crop,
            "inference_mode": clf.inference_mode,
            "model_version": clf.model_version,
            "trained_classes": clf.model_classes,
            "colour_rule_classes": clf.uncovered_classes if clf.inference_mode != "colour_heuristic" else clf.classes,
            "test_accuracy": m.get("accuracy"),
            "test_macro_f1": m.get("macro_f1"),
            "test_images": (m.get("images") or {}).get("test"),
            "train_images": (m.get("images") or {}).get("train"),
            "split_method": m.get("split_method"),
            "per_class": m.get("per_class"),
            "caveats": m.get("caveats", []),
        })
    return cards
