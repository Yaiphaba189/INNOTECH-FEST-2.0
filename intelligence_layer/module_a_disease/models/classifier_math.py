"""Probability calibration helpers shared by the CNN and colour-analysis inference paths."""

from __future__ import annotations

import math
from typing import List

TEMPERATURE = 1.25  # Calibrated temperature scaling parameter


def apply_temperature_scaling(logits: List[float], temperature: float = TEMPERATURE) -> List[float]:
    """Applies temperature scaling to raw logits and returns calibrated probabilities."""
    scaled_logits = [z / temperature for z in logits]
    max_logit = max(scaled_logits)
    exp_logits = [math.exp(z - max_logit) for z in scaled_logits]
    sum_exp = sum(exp_logits)
    return [round(e / sum_exp, 4) for e in exp_logits]
