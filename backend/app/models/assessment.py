import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class DiseaseAssessment(Base):
    __tablename__ = "disease_assessments"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    crop_record_id = Column(String(36), ForeignKey("crop_records.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    image_angle = Column(String(30), nullable=False)  # crown, fruit_base, lateral
    predicted_class = Column(String(50), nullable=False)  # healthy, heart_rot, black_rot, mealybug_wilt
    confidence_score = Column(Numeric(4, 3), nullable=False)
    severity_rating = Column(String(20), nullable=False)  # none, mild, moderate, severe
    expert_referred = Column(Boolean, nullable=False, default=False)
    model_version = Column(String(50), nullable=False, default="pineapple-mobilenet-v1.0")
    image_hash_sha256 = Column(String(64), nullable=True)
    remedy_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    crop_record = relationship("CropRecord", back_populates="disease_assessments")
