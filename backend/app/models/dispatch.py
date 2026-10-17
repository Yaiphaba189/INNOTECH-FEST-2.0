import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class DispatchRun(Base):
    __tablename__ = "dispatch_runs"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    vehicle_type = Column(String(50), nullable=False)  # 3_wheeler, pickup_407, medium_truck
    max_capacity_kg = Column(Integer, nullable=False)
    driver_name = Column(String(150), nullable=False)
    driver_phone = Column(String(15), nullable=False)
    total_loaded_kg = Column(Numeric(8, 2), nullable=False)
    destination_facility = Column(String(200), nullable=False)
    digital_gate_pass = Column(String(100), unique=True, index=True, nullable=False)
    capacity_fill_pct = Column(Numeric(5, 2), nullable=False)
    estimated_cost_per_kg = Column(Numeric(6, 2), nullable=False)
    route_stops_json = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="scheduled")  # scheduled, in_transit, completed
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    lots = relationship("HarvestLot", back_populates="dispatch_run")
