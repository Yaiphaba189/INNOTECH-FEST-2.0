from typing import Optional
from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class CropCreate(BaseModel):
    farm_id: str
    crop_type: str = "pineapple"
    variety: str = Field(..., description="queen or kew")
    planting_date: date
    current_stage: str = Field("vegetative", description="vegetative, inflorescence, fruit_development, color_break, mature")
    estimated_plant_count: int = Field(..., gt=0)


class CropResponse(BaseModel):
    id: str
    farm_id: str
    crop_type: str
    variety: str
    planting_date: date
    current_stage: str
    estimated_plant_count: int

    model_config = ConfigDict(from_attributes=True)


class HarvestForecastResponse(BaseModel):
    crop_id: str
    variety: str
    current_stage: str
    days_in_field: int
    gdd_accumulated: float
    optimal_harvest_start: str
    optimal_harvest_end: str
    estimated_brix: float
    weather_risk_level: str  # low, moderate, high
    weather_advisory: str
    rainfall_forecast_48h_mm: float
