from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class FarmCreate(BaseModel):
    farm_name: str = Field(..., min_length=2, max_length=150)
    district: str = Field(..., description="Manipur district e.g. Churachandpur, Thoubal")
    sub_division: Optional[str] = None
    latitude: float = Field(..., ge=23.5, le=26.0, description="Manipur latitude boundary")
    longitude: float = Field(..., ge=92.5, le=95.5, description="Manipur longitude boundary")
    total_area_ha: float = Field(..., gt=0.0)
    elevation_meters: Optional[int] = Field(None, ge=400, le=3000)


class FarmResponse(BaseModel):
    id: str
    farmer_id: str
    farm_name: str
    district: str
    sub_division: Optional[str] = None
    latitude: float
    longitude: float
    total_area_ha: float
    elevation_meters: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
