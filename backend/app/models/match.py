import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class LotMatch(Base):
    __tablename__ = "lot_matches"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    lot_id = Column(String(36), ForeignKey("harvest_lots.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(String(36), ForeignKey("buyer_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    gross_rate = Column(Numeric(8, 2), nullable=False)
    freight_deduction = Column(Numeric(8, 2), nullable=False)
    handling_deduction = Column(Numeric(8, 2), nullable=False)
    platform_fee = Column(Numeric(8, 2), nullable=False)
    net_rate = Column(Numeric(8, 2), nullable=False)
    total_take_home = Column(Numeric(10, 2), nullable=False)
    match_score = Column(Numeric(5, 3), nullable=False, default=1.000)
    status = Column(String(30), nullable=False, default="offered")  # offered, accepted, rejected, expired
    pickup_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    lot = relationship("HarvestLot", back_populates="matches")
    order = relationship("BuyerOrder", back_populates="matches")
