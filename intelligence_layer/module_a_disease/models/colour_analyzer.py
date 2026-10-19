"""Explainable colour-pathology analyzer used when no trained CNN weights are present.

Reads the actual pixels of the preprocessed 224x224 image, bins foreground pixels into
tissue-colour classes in HSV space, and scores each disease with transparent rules
(e.g. brown necrosis -> heart rot, black/dark water-soaked tissue -> black rot).
It is a screening heuristic, not a trained network: the result depends on the photo, the
per-class evidence is returned for display, and low plant coverage forces low confidence
so the triage layer escalates to a KVK officer instead of guessing.
"""

from __future__ import annotations

from typing import Dict, Tuple

from PIL import Image

from .classifier_math import apply_temperature_scaling

ANALYSIS_SIZE = (112, 112)
SCORE_GAIN = 5.0          # sharpens rule scores into logits before temperature scaling
MAX_CONFIDENCE = 0.95     # a colour heuristic must never claim near-certainty
MIN_PLANT_COVERAGE = 0.35  # below this share of recognisable tissue, force escalation
LOW_COVERAGE_CONFIDENCE = 0.40


def colour_fractions(image: Image.Image) -> Dict[str, float]:
    """Fractions of foreground pixels per tissue-colour bin (sum to ~1), plus coverage stats."""
    small = image.convert("RGB").resize(ANALYSIS_SIZE)
    hsv = small.convert("HSV")
    w, h = ANALYSIS_SIZE
    counts = {"green": 0, "yellow": 0, "brown": 0, "dark": 0, "red": 0, "grey": 0, "other": 0}
    centre_light = 0
    background = 0
    centre_total = 0

    raw = hsv.tobytes()
    for idx in range(w * h):
        hh, ss, vv = raw[3 * idx], raw[3 * idx + 1], raw[3 * idx + 2]
        x, y = idx % w, idx // w
        in_centre = w * 0.25 <= x < w * 0.75 and h * 0.25 <= y < h * 0.75
        if in_centre:
            centre_total += 1
        light = ss < 40 and vv > 190
        if light:
            background += 1
            if in_centre:
                centre_light += 1
            continue
        shadowed_leaf = 48 < hh <= 120 and ss >= 60 and vv >= 35  # dark green = shaded foliage, not necrosis
        if shadowed_leaf:
            counts["green"] += 1
        elif vv < 70:
            counts["dark"] += 1
        elif ss < 50:
            counts["grey"] += 1
        elif (hh <= 10 or hh >= 235) and ss >= 90:
            counts["red"] += 1
        elif 10 < hh <= 30 and vv < 170:
            counts["brown"] += 1
        elif 22 <= hh <= 48 and vv >= 110:
            counts["yellow"] += 1
        elif 48 < hh <= 120 and vv >= 60:
            counts["green"] += 1
        else:
            counts["other"] += 1

    total = w * h
    foreground = max(total - background, 1)
    out = {k: v / foreground for k, v in counts.items()}
    out["white_centre"] = centre_light / max(centre_total, 1)
    out["foreground"] = foreground / total
    out["plant_coverage"] = (foreground - counts["other"]) / total
    return out


def _scores(crop: str, f: Dict[str, float]) -> Dict[str, float]:
    g, y, b, d, r, grey, white = (
        f["green"], f["yellow"], f["brown"], f["dark"], f["red"], f["grey"], f["white_centre"],
    )
    lesion = b + d
    if crop == "rice":
        return {
            "healthy": 1.2 * g - 2.5 * lesion - 1.5 * y,
            "blast": 1.0 * b + 0.9 * grey + 0.4 * d + 0.3 * g - 0.8 * y,
            "bacterial_leaf_blight": 0.9 * y + 0.7 * b - 0.5 * grey,
            "sheath_blight": 0.7 * b + 0.8 * white + 0.5 * grey + 0.4 * g - 0.6 * y,
            "tungro": 1.3 * y - 0.8 * b - 0.5 * g,
        }
    if crop == "orange":
        return {
            "healthy": 1.2 * g - 2.5 * lesion - 1.5 * y,
            "citrus_canker": 1.0 * g + 0.9 * b - 1.5 * y,
            "citrus_greening_hlb": 1.1 * y + 0.5 * g - 0.8 * lesion,
            "powdery_mildew": 2.2 * white + 0.5 * g + 0.4 * grey - 1.5 * lesion,
            "root_rot": 1.3 * b + 1.0 * d - 0.6 * g - 0.5 * y,
        }
    if crop == "chilli":
        return {
            "healthy": 0.8 * g + 1.0 * r - 2.5 * lesion - 1.5 * y,
            "anthracnose": 1.1 * d + 0.9 * b - 0.3 * g,
            "leaf_curl": 0.9 * y + 0.5 * g - 0.8 * lesion,
            "bacterial_wilt": 0.8 * y + 0.8 * b - 0.8 * g,
        }
    # pineapple (default)
    return {
        "healthy": 1.2 * g - 2.5 * lesion - 1.5 * y - 2.0 * r,
        "heart_rot": 1.3 * b + 0.5 * d + 0.4 * y - 0.8 * g,
        "black_rot": 1.4 * d + 0.5 * b - 0.8 * g,
        "mealybug_wilt": 1.5 * r + 0.8 * y + 0.2 * b - 0.6 * g,
    }


def analyze_colour_pathology(
    image: Image.Image, crop: str
) -> Tuple[str, float, Dict[str, float], Dict[str, float]]:
    """Returns (predicted_class, confidence, class_probabilities, evidence)."""
    fractions = colour_fractions(image)
    scores = _scores(crop, fractions)
    classes = list(scores)
    probs = apply_temperature_scaling([scores[c] * SCORE_GAIN for c in classes])
    prob_dict = dict(zip(classes, probs))
    top = max(prob_dict, key=prob_dict.get)
    confidence = min(prob_dict[top], MAX_CONFIDENCE)

    if fractions["plant_coverage"] < MIN_PLANT_COVERAGE:
        confidence = min(confidence, LOW_COVERAGE_CONFIDENCE)

    evidence = {k: round(v, 3) for k, v in fractions.items()}
    return top, round(confidence, 4), prob_dict, evidence
