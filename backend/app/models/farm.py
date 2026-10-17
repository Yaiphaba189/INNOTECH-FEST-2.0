import uuid
from sqlalchemy import Column, String, Float, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    farmer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_name = Column(String(150), nullable=False)
    district = Column(String(100), index=True, nullable=False)
    sub_division = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_area_ha = Column(Numeric(6, 2), nullable=False)
    elevation_meters = Column(Integer, nullable=True)

    # Relationships
    farmer = relationship("User", back_populates="farms")
    crops = relationship("CropRecord", back_populates="farm", cascade="all, delete-orphan")
