from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field


class DispatchPlanRequest(BaseModel):
    cluster_district: str = Field(..., description="Cluster district e.g. Thoubal, Churachandpur")
    vehicle_type: str = Field("pickup_407", description="3_wheeler, pickup_407, medium_truck")
    destination_hub: str = Field(..., description="Destination processing facility or market hub")
    enforce_threshold: bool = Field(True, description="Enforce minimum 75% payload saturation constraint")
    lot_ids: Optional[List[str]] = Field(None, description="Specific harvest lot IDs to include, or None to auto-pool")


class StopManifest(BaseModel):
    stop_order: int
    farm_name: str
    farmer_name: str
    district: str
    lot_id: Optional[str] = None
    quantity_kg: float
    variety: str
    grade: str
    accumulated_vehicle_load_kg: float


class DispatchPlanResponse(BaseModel):
    id: str
    vehicle_type: str
    vehicle_name: str
    max_capacity_kg: int
    total_loaded_kg: float
    capacity_fill_pct: float
    estimated_cost_per_kg: float
    estimated_savings_total: float
    destination_facility: str
    cluster_district: str
    digital_gate_pass: str
    stops: List[StopManifest]
    status: str
    created_at: datetime


class GatePassVerificationResponse(BaseModel):
    valid: bool
    digital_gate_pass: str
    dispatch_id: str
    vehicle_type: str
    driver_name: str
    driver_phone: str
    destination_facility: str
    total_loaded_kg: float
    capacity_fill_pct: float
    manifest_stops: List[Any]
    status: str
    created_at: datetime
