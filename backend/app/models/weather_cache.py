from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, String
from app.db.base import Base


class WeatherCache(Base):
    """Last good Open-Meteo reading per farm location, so the hills still get an answer offline."""

    __tablename__ = "weather_cache"

    location_key = Column(String(32), primary_key=True)  # "lat,lng" rounded to 2 dp
    rain_48h_mm = Column(Float, nullable=False)
    first_wet_hour = Column(Float, nullable=False)
    fetched_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
