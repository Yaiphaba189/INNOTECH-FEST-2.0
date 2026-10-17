from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field


class RemediationActions(BaseModel):
    organic: str
    chemical: str
    cultural: str


class AssessmentResponse(BaseModel):
    id: str
    crop_record_id: str
    image_url: str
    image_angle: str
    predicted_class: str
    confidence_score: float
    severity_rating: str
    symptoms_detected: List[str]
    recommended_actions: RemediationActions
    refer_to_expert: bool
    model_version: str
    image_hash_sha256: Optional[str] = None
    created_at: datetime


class EscalationRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=500)


class EscalationResponse(BaseModel):
    assessment_id: str
    referral_id: str
    status: str = "assigned_to_officer"
    message: str
