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


class FieldEvaluationResponse(BaseModel):
    is_planted: bool
    planting_status: str  # Established Stand, Sparse Vegetation, Unplanted Fallow Ground
    canopy_coverage_pct: float
    detected_crop: Optional[str] = None
    crop_display_name: Optional[str] = None
    crop_condition: str  # OPTIMAL, WATER_DEFICIT, ROOT_ROT_ONSET, MATURE_HARVEST, FALLOW
    condition_score: float
    water_status: str  # OPTIMAL, LACKING_WATER, WATERLOGGED
    soil_moisture_pct: float
    root_rot_status: str  # HEALTHY, EARLY_ONSET, CRITICAL_ROT
    root_rot_details: str
    harvest_readiness_pct: float
    harvest_recommendation: str
    estimated_brix: float
    gdd_accumulated: float
    gdd_target: float
    optimal_harvest_window: str
    recommended_pick_date: str
    weather_risk: str
    agronomic_advisory: str

