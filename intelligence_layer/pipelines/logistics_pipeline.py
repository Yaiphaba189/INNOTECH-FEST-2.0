"""Unified logistics and vehicle consolidation pipeline connecting Module D AI engines."""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

from intelligence_layer.module_d_logistics.clustering.spatial_clustering import (
    cluster_farm_lots,
    haversine_distance_km,
)
from intelligence_layer.module_d_logistics.vrp_solver.cvrptw_solver import (
    VEHICLE_PROFILES,
    solve_vehicle_dispatch,
)


def cluster_regional_lots(
    farm_lots: List[Dict[str, Any]],
    max_radius_km: float = 20.0,
    depot_coords: Tuple[float, float] = (24.8170, 93.9368)
) -> List[Dict[str, Any]]:
    """Groups geographically proximate farm lots into pickup clusters."""
    return cluster_farm_lots(farm_lots, max_radius_km=max_radius_km, depot_coords=depot_coords)


def solve_cvrp_dispatch(
    cluster_district: str,
    vehicle_type: str,
    destination_hub: str,
    farm_lots: List[Dict[str, Any]],
    enforce_threshold: bool = True,
    corridor_type: str = "valley"
) -> Dict[str, Any]:
    """
    Optimizes multi-farm lot consolidation for FPO collective transport.
    Enforces minimum 75% vehicle payload saturation constraint.
    """
    return solve_vehicle_dispatch(
        cluster_district=cluster_district,
        vehicle_type=vehicle_type,
        destination_hub=destination_hub,
        farm_lots=farm_lots,
        enforce_threshold=enforce_threshold,
        corridor_type=corridor_type
    )

