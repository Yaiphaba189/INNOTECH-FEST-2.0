import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class HarvestLot(Base):
    __tablename__ = "harvest_lots"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    farmer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_record_id = Column(String(36), ForeignKey("crop_records.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity_kg = Column(Numeric(8, 2), nullable=False)
    quality_grade = Column(String(20), nullable=False)  # grade_a, grade_b, processing
    brix_reading = Column(Numeric(4, 1), nullable=True)
    harvest_window_start = Column(Date, nullable=False)
    harvest_window_end = Column(Date, nullable=False)
    status = Column(
        String(30),
        nullable=False,
        default="registered"
    )  # registered, matched, committed, collected, settled
    dispatch_run_id = Column(String(36), ForeignKey("dispatch_runs.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    farmer = relationship("User", back_populates="harvest_lots")
    crop_record = relationship("CropRecord", back_populates="harvest_lots")
    matches = relationship("LotMatch", back_populates="lot", cascade="all, delete-orphan")
    dispatch_run = relationship("DispatchRun", back_populates="lots")
