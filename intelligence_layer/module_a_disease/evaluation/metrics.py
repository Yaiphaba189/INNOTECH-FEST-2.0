"""Evaluation metrics, calibration error, and latency benchmark utilities for crop disease models.

Enforces:
- Top-1 Categorical Accuracy (target >= 88%).
- Macro Recall for Phytophthora Heart Rot (target >= 92% to prevent false negatives).
- Expected Calibration Error (ECE) for temperature scaling.
- Inference latency benchmarking (< 800 ms on CPU).
"""

from __future__ import annotations

import math
import time
from typing import Any, Dict, List, Tuple


def compute_classification_metrics(
    y_true: List[str],
    y_pred: List[str],
    target_class: str = "heart_rot"
) -> Dict[str, Any]:
    """Computes Top-1 Accuracy, Target Class Recall (e.g. Heart Rot), and Precision."""
    if len(y_true) != len(y_pred):
        raise ValueError("y_true and y_pred must have identical lengths.")
    if not y_true:
        return {"accuracy": 0.0, "target_recall": 0.0, "total_samples": 0}

    total = len(y_true)
    correct = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp)
    accuracy = round(correct / total, 4)

    # Compute target class recall and precision
    tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == target_class and yp == target_class)
    fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == target_class and yp != target_class)
    fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt != target_class and yp == target_class)

    target_recall = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 1.0
    target_precision = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 1.0

    return {
        "accuracy": accuracy,
        "target_class": target_class,
        "target_recall": target_recall,
        "target_precision": target_precision,
        "total_samples": total,
        "correct": correct,
        "meets_accuracy_target": accuracy >= 0.88,
        "meets_heart_rot_recall_target": target_recall >= 0.92
    }


def compute_expected_calibration_error(
    confidences: List[float],
    accuracies: List[bool],
    num_bins: int = 10
) -> float:
    """Computes Expected Calibration Error (ECE) across confidence bins."""
    bin_size = 1.0 / num_bins
    total_samples = len(confidences)
    ece = 0.0

    for i in range(num_bins):
        bin_lower = i * bin_size
        bin_upper = (i + 1) * bin_size
        
        in_bin = [
            (conf, acc) for conf, acc in zip(confidences, accuracies)
            if bin_lower <= conf < bin_upper or (i == num_bins - 1 and conf == bin_upper)
        ]
        
        if in_bin:
            bin_acc = sum(acc for _, acc in in_bin) / len(in_bin)
            bin_conf = sum(conf for conf, _ in in_bin) / len(in_bin)
            bin_weight = len(in_bin) / total_samples
            ece += bin_weight * abs(bin_acc - bin_conf)

    return round(ece, 4)


def benchmark_inference_latency(predict_fn, sample_input: bytes, iterations: int = 20) -> Dict[str, Any]:
    """Measures single-image inference latency on CPU to verify < 800 ms target."""
    latencies_ms = []
    
    # Warmup
    predict_fn(sample_input)
    
    for _ in range(iterations):
        t0 = time.perf_counter()
        predict_fn(sample_input)
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        latencies_ms.append(elapsed_ms)

    avg_ms = round(sum(latencies_ms) / len(latencies_ms), 2)
    max_ms = round(max(latencies_ms), 2)
    p95_ms = round(sorted(latencies_ms)[int(len(latencies_ms) * 0.95)], 2)

    return {
        "avg_latency_ms": avg_ms,
        "max_latency_ms": max_ms,
        "p95_latency_ms": p95_ms,
        "iterations": iterations,
        "meets_target_under_800ms": p95_ms < 800.0
    }
