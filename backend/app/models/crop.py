import uuid
from sqlalchemy import Column, String, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class CropRecord(Base):
    __tablename__ = "crop_records"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_type = Column(String(50), default="pineapple", nullable=False)
    variety = Column(String(50), nullable=False)  # queen, kew
    planting_date = Column(Date, nullable=False)
    current_stage = Column(
        String(30),
        nullable=False,
        default="vegetative"
    )  # vegetative, inflorescence, fruit_development, color_break, mature
    estimated_plant_count = Column(Integer, nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="crops")
    disease_assessments = relationship("DiseaseAssessment", back_populates="crop_record", cascade="all, delete-orphan")
    harvest_lots = relationship("HarvestLot", back_populates="crop_record")
