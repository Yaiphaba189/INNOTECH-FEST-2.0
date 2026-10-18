"""Unified net-returns and buyer matching pipeline connecting Module C AI engines."""

from __future__ import annotations

from typing import Any, Dict, List

from intelligence_layer.module_c_pricing.net_returns.pricing_engine import compute_net_returns
from intelligence_layer.module_c_pricing.ranking.buyer_matcher import (
    get_crop_benchmark,
    rank_buyer_orders,
    score_buyer_match,
)


def calculate_net_returns(
    gross_rate: float,
    lot_weight_kg: float,
    distance_km: float = 35.0,
    handling_per_kg: float | None = None,
    platform_fee_pct: float = 0.015,
    payment_terms_days: int = 0,
    crop: str = "pineapple",
    terrain_corridor: str = "valley"
) -> Dict[str, Any]:
    """Computes transparent net-returns pricing per kg and total farmer take-home pay."""
    return compute_net_returns(
        gross_rate=gross_rate,
        lot_weight_kg=lot_weight_kg,
        distance_km=distance_km,
        handling_per_kg=handling_per_kg,
        platform_fee_pct=platform_fee_pct,
        payment_terms_days=payment_terms_days,
        crop=crop,
        terrain_corridor=terrain_corridor
    )


def score_buyer_order(
    net_rate: float,
    distance_km: float,
    payment_terms_days: int,
    is_exact_grade_match: bool,
    max_market_net: float | None = None,
    crop: str = "pineapple"
) -> float:
    """Computes multi-criteria buyer ranking utility score."""
    benchmark = max_market_net if max_market_net is not None else get_crop_benchmark(crop)
    res = score_buyer_match(
        net_rate=net_rate,
        distance_km=distance_km,
        payment_terms_days=payment_terms_days,
        is_exact_grade_match=is_exact_grade_match,
        benchmark_max_net=benchmark
    )
    return res["composite_score"]


def match_and_rank_orders(
    lot_data: Dict[str, Any],
    active_orders: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Ranks active buyer orders for a lot using net pricing and multi-criteria scoring."""
    return rank_buyer_orders(lot_data, active_orders, calculate_net_returns)

