"""Multi-criteria buyer ranking utility for matching harvest lots with purchase orders."""

from __future__ import annotations

from typing import Any, Dict, List

from intelligence_layer.module_c_pricing.net_returns.pricing_engine import CROP_BENCHMARKS

DEFAULT_BENCHMARK_MAX_NET = 30.0  # ₹/kg default benchmark for normalization


def get_crop_benchmark(crop_or_variety: str) -> float:
    """Returns benchmark price for normalizing buyer price bids."""
    key = crop_or_variety.lower().strip()
    return CROP_BENCHMARKS.get(key, DEFAULT_BENCHMARK_MAX_NET)


def score_buyer_match(
    net_rate: float,
    distance_km: float,
    payment_terms_days: int,
    is_exact_grade_match: bool,
    benchmark_max_net: float = DEFAULT_BENCHMARK_MAX_NET
) -> Dict[str, Any]:
    """
    Computes normalized sub-scores and composite match score:
    Score = 0.50*S_net + 0.20*S_dist + 0.20*S_pay + 0.10*S_grade
    """
    effective_benchmark = max(1.0, benchmark_max_net)

    # 1. S_net: normalized net price (higher is better)
    s_net = min(1.0, max(0.0, net_rate / effective_benchmark))

    # 2. S_dist: normalized geographic proximity (closer is better, max 120km corridor)
    s_dist = max(0.0, 1.0 - (distance_km / 120.0))

    # 3. S_pay: payment immediacy (0 days=1.0, 7 days=0.7, 14 days=0.3)
    if payment_terms_days == 0:
        s_pay = 1.0
    elif payment_terms_days <= 7:
        s_pay = 0.7
    else:
        s_pay = 0.3

    # 4. S_grade: exact quality compliance
    s_grade = 1.0 if is_exact_grade_match else 0.6

    composite_score = (0.50 * s_net) + (0.20 * s_dist) + (0.20 * s_pay) + (0.10 * s_grade)

    return {
        "composite_score": round(composite_score, 3),
        "s_net": round(s_net, 3),
        "s_dist": round(s_dist, 3),
        "s_pay": round(s_pay, 3),
        "s_grade": round(s_grade, 3),
        "net_rate": net_rate,
        "distance_km": distance_km,
        "payment_terms_days": payment_terms_days,
        "is_exact_grade_match": is_exact_grade_match,
        "benchmark_max_net": effective_benchmark
    }


def rank_buyer_orders(
    lot_data: Dict[str, Any],
    active_orders: List[Dict[str, Any]],
    calculate_returns_fn
) -> List[Dict[str, Any]]:
    """Ranks active buyer orders for a given harvest lot by composite match score."""
    ranked = []
    lot_weight = float(lot_data.get("quantity_kg", 0.0))
    lot_grade = lot_data.get("quality_grade", "grade_a").lower()
    lot_variety = lot_data.get("variety", "queen").lower()
    lot_crop = lot_data.get("crop", "pineapple").lower()

    # Determine appropriate pricing benchmark
    benchmark = get_crop_benchmark(lot_variety)
    if benchmark == DEFAULT_BENCHMARK_MAX_NET:
        benchmark = get_crop_benchmark(lot_crop)

    for order in active_orders:
        # Check variety / crop compatibility
        order_variety = order.get("variety_preference", order.get("variety_required", "all")).lower()
        if order_variety not in ("all", "any", lot_variety, lot_crop):
            continue

        gross_rate = float(order.get("unit_price_offered", order.get("offered_gross_rate", 25.0)))
        distance_km = float(order.get("distance_km", 30.0))
        payment_terms = int(order.get("payment_terms_days", 0))
        required_grade = order.get("target_grade", order.get("min_grade", "grade_a")).lower()
        is_exact = (required_grade == lot_grade)

        returns = calculate_returns_fn(
            gross_rate=gross_rate,
            lot_weight_kg=lot_weight,
            distance_km=distance_km,
            payment_terms_days=payment_terms,
            crop=lot_crop
        )

        match_eval = score_buyer_match(
            net_rate=returns["net_rate"],
            distance_km=distance_km,
            payment_terms_days=payment_terms,
            is_exact_grade_match=is_exact,
            benchmark_max_net=benchmark
        )

        ranked.append({
            "order_id": order.get("id"),
            "buyer_name": order.get("buyer_name", "Verified Institutional Buyer"),
            "buyer_type": order.get("buyer_type", "processor"),
            "composite_score": match_eval["composite_score"],
            "financial_breakdown": returns,
            "match_metrics": match_eval
        })

    ranked.sort(key=lambda item: item["composite_score"], reverse=True)
    return ranked

