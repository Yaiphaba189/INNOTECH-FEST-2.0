from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class HarvestLotCreate(BaseModel):
    crop_record_id: str
    quantity_kg: float = Field(..., gt=0.0)
    quality_grade: str = Field("grade_a", description="grade_a, grade_b, processing")
    brix_reading: Optional[float] = Field(None, ge=8.0, le=20.0)
    harvest_window_start: date
    harvest_window_end: date


class HarvestLotResponse(BaseModel):
    id: str
    farmer_id: str
    crop_record_id: str
    quantity_kg: float
    quality_grade: str
    brix_reading: Optional[float] = None
    harvest_window_start: date
    harvest_window_end: date
    status: str
    dispatch_run_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BuyerMatchResponse(BaseModel):
    match_id: str
    order_id: str
    buyer_name: str
    buyer_phone: Optional[str] = None
    delivery_hub_district: str
    gross_rate: float
    freight_deduction: float
    handling_deduction: float
    platform_fee: float
    net_rate: float
    total_take_home: float
    match_score: float
    payment_terms_days: int
    pickup_date: date
    status: str


class AcceptMatchResponse(BaseModel):
    match_id: str
    lot_id: str
    lot_status: str
    contract_status: str
    message: str
