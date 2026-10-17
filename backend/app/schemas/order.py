from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class BuyerOrderCreate(BaseModel):
    variety_required: str = Field("any", description="queen, kew, any")
    min_grade: str = Field("grade_b", description="grade_a, grade_b")
    target_quantity_kg: float = Field(..., ge=500.0, description="Minimum institutional purchase volume is 500kg")
    offered_gross_rate: float = Field(..., gt=0.0, description="Headline gross rate in INR/kg")
    delivery_hub_district: str = Field(..., description="Destination district e.g. Imphal East, Nilakuthi")
    required_by_date: date
    payment_terms_days: int = Field(0, ge=0, description="0 for instant weighment pay, 7, 14, etc.")


class BuyerOrderResponse(BaseModel):
    id: str
    buyer_id: str
    variety_required: str
    min_grade: str
    target_quantity_kg: float
    offered_gross_rate: float
    delivery_hub_district: str
    required_by_date: date
    payment_terms_days: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
