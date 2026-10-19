"""Delivery-hub geography and the conventional-broker baseline used to price the farmer's advantage.

Distance is great-circle distance scaled by a hill-road detour factor (no routing API needed offline).
The broker baseline is one shared definition: the broker quotes a high gross rate, then docks a
transit-shrinkage percentage, so the farmer's cash is far below the quote.
"""

from __future__ import annotations

from math import asin, cos, radians, sin, sqrt
from typing import Optional, Tuple

ROAD_DETOUR_FACTOR = 1.35
DEFAULT_HUB_DISTANCE_KM = 38.0

BROKER_GROSS_PER_KG = 31.0
BROKER_SHRINKAGE_PCT = 0.25

# (lat, lng) of delivery hubs, matched by lowercase substring of the order's hub district.
HUB_COORDS = {
    "nilakuthi": (24.8170, 93.9650),
    "imphal east": (24.8170, 93.9650),
    "imphal west": (24.8080, 93.9320),
    "imphal": (24.8170, 93.9368),
    "guwahati": (26.1445, 91.7362),
    "thoubal": (24.6400, 94.0100),
    "bishnupur": (24.6300, 93.7640),
    "churachandpur": (24.3330, 93.6800),
}


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    dlat, dlng = radians(lat2 - lat1), radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 2 * 6371.0 * asin(sqrt(a))


def hub_coords(hub_district: str) -> Optional[Tuple[float, float]]:
    key = hub_district.lower()
    for name, coords in HUB_COORDS.items():
        if name in key:
            return coords
    return None


def road_distance_km(farm_lat: Optional[float], farm_lng: Optional[float], hub_district: str) -> float:
    hub = hub_coords(hub_district)
    if farm_lat is None or farm_lng is None or hub is None:
        return DEFAULT_HUB_DISTANCE_KM
    return round(haversine_km(farm_lat, farm_lng, hub[0], hub[1]) * ROAD_DETOUR_FACTOR, 1)


def broker_net_rate() -> float:
    return round(BROKER_GROSS_PER_KG * (1 - BROKER_SHRINKAGE_PCT), 2)


def advantage_vs_broker(net_rate: float) -> Tuple[float, float]:
    base = broker_net_rate()
    adv = round(net_rate - base, 2)
    return adv, round(adv / base * 100, 1)
