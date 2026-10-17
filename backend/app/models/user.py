import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="farmer")  # farmer, buyer, fpo, admin
    preferred_language = Column(String(15), nullable=False, default="en")  # en, mn_bengali, mn_mayek
    is_simulated = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    farms = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan")
    harvest_lots = relationship("HarvestLot", back_populates="farmer")
    buyer_orders = relationship("BuyerOrder", back_populates="buyer")
