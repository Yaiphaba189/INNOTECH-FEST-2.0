import math
from typing import List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.farm import Farm


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points
    on the earth (specified in decimal degrees).
    """
    # Convert decimal degrees to radians
    lat1_rad, lon1_rad = math.radians(lat1), math.radians(lon1)
    lat2_rad, lon2_rad = math.radians(lat2), math.radians(lon2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat / 2.0) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2.0) ** 2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371.0  # Radius of earth in kilometers
    return round(c * r, 2)


async def find_farms_within_radius(
    session: AsyncSession,
    center_lat: float,
    center_lon: float,
    radius_km: float = 15.0
) -> List[Tuple[Farm, float]]:
    """
    Retrieves all farms located within radius_km of the provided center coordinates,
    sorted by proximity. Works on PostgreSQL, PostGIS, and SQLite.
    """
    result = await session.execute(select(Farm))
    all_farms = result.scalars().all()

    nearby_farms: List[Tuple[Farm, float]] = []
    for farm in all_farms:
        dist = haversine_distance_km(center_lat, center_lon, farm.latitude, farm.longitude)
        if dist <= radius_km:
            nearby_farms.append((farm, dist))

    nearby_farms.sort(key=lambda x: x[1])
    return nearby_farms
