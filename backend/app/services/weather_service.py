from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.weather_cache import WeatherCache

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
DEMO_STORM_MM = 65.0
DEMO_STORM_ETA_HOURS = 41.0
MIN_ALERT_MM = 20.0


class WeatherService:
    @staticmethod
    async def _fetch_open_meteo(lat: float, lng: float) -> Tuple[float, float]:
        """Returns (rain_48h_mm, hours_until_first_wet_hour) from the next 48 hourly values."""
        params = {
            "latitude": lat,
            "longitude": lng,
            "hourly": "precipitation",
            "forecast_days": 3,
            "timezone": "UTC",
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(OPEN_METEO_URL, params=params)
            res.raise_for_status()
        hourly = res.json()["hourly"]
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        start = next((i for i, t in enumerate(hourly["time"]) if datetime.fromisoformat(t) >= now), 0)
        window = [p or 0.0 for p in hourly["precipitation"][start:start + 48]]
        first_wet = next((i for i, p in enumerate(window) if p >= 1.0), len(window))
        return round(sum(window), 2), float(max(1, first_wet))

    @staticmethod
    async def get_rain_outlook(
        db: AsyncSession, lat: float, lng: float, demo_storm: bool = False
    ) -> Dict[str, Any]:
        """48h rain at a farm: live Open-Meteo, else last cached reading, else the labelled demo storm."""
        if demo_storm:
            return {
                "rain_mm": DEMO_STORM_MM,
                "eta_hours": DEMO_STORM_ETA_HOURS,
                "source": "demo",
                "as_of": datetime.now(timezone.utc).isoformat(),
            }

        key = f"{lat:.2f},{lng:.2f}"
        try:
            mm, eta = await WeatherService._fetch_open_meteo(lat, lng)
            row = await db.get(WeatherCache, key)
            if row:
                row.rain_48h_mm, row.first_wet_hour = mm, eta
                row.fetched_at = datetime.now(timezone.utc)
            else:
                db.add(WeatherCache(location_key=key, rain_48h_mm=mm, first_wet_hour=eta))
            await db.commit()
            return {"rain_mm": mm, "eta_hours": eta, "source": "live", "as_of": datetime.now(timezone.utc).isoformat()}
        except Exception:
            row = await db.get(WeatherCache, key)
            if row:
                return {
                    "rain_mm": row.rain_48h_mm,
                    "eta_hours": row.first_wet_hour,
                    "source": "cached",
                    "as_of": row.fetched_at.isoformat(),
                }
            return {"rain_mm": 0.0, "eta_hours": 48.0, "source": "unavailable", "as_of": datetime.now(timezone.utc).isoformat()}
