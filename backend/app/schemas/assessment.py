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
    inference_mode: str = "colour_heuristic"
    evidence: Dict[str, float] = {}
    image_hash_sha256: Optional[str] = None
    created_at: datetime


class EscalationRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=500)


class EscalationResponse(BaseModel):
    assessment_id: str
    referral_id: str
    status: str = "assigned_to_officer"
    message: str


class AutoDiagnosisDetail(BaseModel):
    predicted_class: str
    display_name: str
    local_name: str
    scientific_name: str
    confidence_score: float
    severity_rating: str
    symptoms_detected: List[str]
    organic_treatment: str
    chemical_treatment: str
    cultural_practices: str
    refer_to_expert: bool = False
    triage_status: str = "confirmed"


class AutoDetectResponse(BaseModel):
    detected_crop: str  # pineapple, rice, orange
    crop_display_name: str
    crop_confidence: float
    crop_source: str = "user_selected"  # user_selected | unidentified
    detected_part: str  # crown, base_stalk, lateral, leaf_blade, sheath, panicle, fruit_peel, foliage, root_rot
    part_display_name: str
    part_confidence: float
    part_source: str = "user_selected"  # user_selected | defaulted | unidentified
    diagnosis: AutoDiagnosisDetail
    image_hash_sha256: Optional[str] = None
    model_version: str = "MultiCrop-MobileNetV3-Live"
    inference_mode: str = "colour_heuristic"
    evidence: Dict[str, float] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AcousticGradeRequest(BaseModel):
    peak_frequency_hz: float = Field(..., description="Peak resonant frequency extracted via browser FFT (Hz)")
    damping_ratio: float = Field(0.045, description="Acoustic damping ratio zeta")
    mass_kg: float = Field(1.20, description="Estimated fruit mass in kg")
    crop: str = Field("pineapple", description="Crop variety (queen, kew)")


class AcousticGradeResponse(BaseModel):
    crop: str
    peak_frequency_hz: float
    damping_ratio: float
    mass_kg: float
    firmness_index: float
    internal_status: str
    quality_grade: str
    water_blister_risk_pct: float
    is_damping_abnormal: bool
    description: str
    recommendation: str



class ModelCard(BaseModel):
    crop: str
    inference_mode: str
    model_version: str
    trained_classes: List[str] = []
    colour_rule_classes: List[str] = []
    test_accuracy: Optional[float] = None
    test_macro_f1: Optional[float] = None
    test_images: Optional[int] = None
    train_images: Optional[int] = None
    split_method: Optional[str] = None
    per_class: Optional[Dict[str, Dict[str, float]]] = None
    caveats: List[str] = []
