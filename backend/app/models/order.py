import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class BuyerOrder(Base):
    __tablename__ = "buyer_orders"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    buyer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    variety_required = Column(String(50), nullable=False, default="any")  # queen, kew, any
    min_grade = Column(String(20), nullable=False, default="grade_b")  # grade_a, grade_b
    target_quantity_kg = Column(Numeric(10, 2), nullable=False)
    offered_gross_rate = Column(Numeric(8, 2), nullable=False)  # INR per kg
    delivery_hub_district = Column(String(100), nullable=False)
    required_by_date = Column(Date, nullable=False)
    payment_terms_days = Column(Integer, nullable=False, default=0)
    status = Column(String(30), nullable=False, default="open")  # open, matched, fulfilled, cancelled
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    buyer = relationship("User", back_populates="buyer_orders")
    matches = relationship("LotMatch", back_populates="order", cascade="all, delete-orphan")
