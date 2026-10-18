"""Spatial clustering engine for smallholder farm consolidation across Manipur terrain.

Implements:
1. Haversine spherical distance calculation between farm coordinates.
2. Density-based / greedy proximity clustering of smallholder farms.
3. Nearest-neighbor TSP stop sequencing within each cluster.
4. Payload saturation evaluation against FPO vehicle fleet profiles.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Tuple


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes the great-circle distance between two GPS coordinates in kilometers."""
    radius_earth_km = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(radius_earth_km * c, 2)


def sequence_nearest_neighbor_stops(
    stops: List[Dict[str, Any]],
    start_lat: float,
    start_lon: float
) -> List[Dict[str, Any]]:
    """Orders collection stops starting from depot/hub using greedy nearest-neighbor TSP."""
    if not stops:
        return []

    unvisited = list(stops)
    current_lat, current_lon = start_lat, start_lon
    ordered = []

    step = 1
    accumulated_weight = 0.0

    while unvisited:
        # Pick nearest unvisited stop
        nearest_idx = min(
            range(len(unvisited)),
            key=lambda i: haversine_distance_km(
                current_lat, current_lon,
                float(unvisited[i].get("latitude", 0.0)),
                float(unvisited[i].get("longitude", 0.0))
            )
        )
        selected = unvisited.pop(nearest_idx)
        qty = float(selected.get("quantity_kg", 0.0))
        accumulated_weight += qty

        stop_record = dict(selected)
        stop_record["stop_order"] = step
        stop_record["accumulated_weight_kg"] = round(accumulated_weight, 1)
        stop_record["dist_from_prev_km"] = haversine_distance_km(
            current_lat, current_lon,
            float(selected.get("latitude", 0.0)),
            float(selected.get("longitude", 0.0))
        )
        ordered.append(stop_record)

        current_lat = float(selected.get("latitude", current_lat))
        current_lon = float(selected.get("longitude", current_lon))
        step += 1

    return ordered


def cluster_farm_lots(
    farm_lots: List[Dict[str, Any]],
    max_radius_km: float = 20.0,
    depot_coords: Tuple[float, float] = (24.8170, 93.9368)  # Imphal FPO Hub default
) -> List[Dict[str, Any]]:
    """
    Groups farm lots into spatial clusters based on geographic proximity.
    Each cluster aggregates smallholder supply and orders stops by optimal routing.
    """
    if not farm_lots:
        return []

    unassigned = [dict(lot) for lot in farm_lots]
    clusters = []
    cluster_idx = 1

    while unassigned:
        # Seed cluster with the first unassigned lot
        seed = unassigned.pop(0)
        seed_lat = float(seed.get("latitude", 24.8170))
        seed_lon = float(seed.get("longitude", 93.9368))

        cluster_members = [seed]
        remaining = []

        for candidate in unassigned:
            cand_lat = float(candidate.get("latitude", seed_lat))
            cand_lon = float(candidate.get("longitude", seed_lon))
            dist = haversine_distance_km(seed_lat, seed_lon, cand_lat, cand_lon)
            if dist <= max_radius_km:
                cluster_members.append(candidate)
            else:
                remaining.append(candidate)

        unassigned = remaining

        # Calculate cluster centroid
        avg_lat = sum(float(m.get("latitude", 0.0)) for m in cluster_members) / len(cluster_members)
        avg_lon = sum(float(m.get("longitude", 0.0)) for m in cluster_members) / len(cluster_members)
        total_weight = sum(float(m.get("quantity_kg", 0.0)) for m in cluster_members)

        # Sequence stops from depot to cluster
        ordered_stops = sequence_nearest_neighbor_stops(
            cluster_members,
            start_lat=depot_coords[0],
            start_lon=depot_coords[1]
        )

        # Distances
        dist_to_depot = haversine_distance_km(depot_coords[0], depot_coords[1], avg_lat, avg_lon)

        clusters.append({
            "cluster_id": f"CLUSTER-{cluster_idx:03d}",
            "district": seed.get("district", "Manipur"),
            "stop_count": len(cluster_members),
            "total_weight_kg": round(total_weight, 2),
            "centroid_latitude": round(avg_lat, 6),
            "centroid_longitude": round(avg_lon, 6),
            "distance_to_hub_km": dist_to_depot,
            "stops": ordered_stops,
            "eligible_vehicles": {
                "3_wheeler_600kg": total_weight >= (600.0 * 0.75),
                "pickup_407_2500kg": total_weight >= (2500.0 * 0.75),
                "medium_truck_7000kg": total_weight >= (7000.0 * 0.75)
            }
        })
        cluster_idx += 1

    return clusters
