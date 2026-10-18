"""Unified disease screening pipeline interfacing backend services to Module A AI engines."""

from __future__ import annotations

from typing import Any, Dict

from intelligence_layer.module_a_disease.preprocessing.transforms import preprocess_image
from intelligence_layer.module_a_disease.models.classifier import DiseaseClassifier
from intelligence_layer.module_a_disease.triage.triage_rules import (
    DISEASE_REMEDIES,
    synthesize_triage,
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
    crop: str = "pineapple"
) -> Dict[str, Any]:
    """
    End-to-end crop disease screening pipeline:
    1. Validates and preprocesses image bytes to 224x224 RGB.
    2. Computes SHA-256 forensic audit hash.
    3. Runs calibrated vision model classification.
    4. Synthesizes diagnostic triage status, action protocols, and regional remedies.
    """
    # 1 & 2. Preprocess and compute SHA-256
    processed_img, image_hash = preprocess_image(image_bytes)

    # 3. Predict class with calibrated probabilities
    classifier = get_classifier(crop)
    predicted_class, confidence_score, probabilities = classifier.predict(
        image=processed_img,
        image_angle=image_angle,
        image_hash=image_hash
    )

    # 4. Synthesize diagnostic triage & remedies
    triage_result = synthesize_triage(
        predicted_class=predicted_class,
        confidence_score=confidence_score
    )

    return {
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
        "image_hash_sha256": image_hash,
        "image_angle": image_angle,
        "crop": crop
    }
