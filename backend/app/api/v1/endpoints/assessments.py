from typing import List, Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.assessment_service import AssessmentService
from app.schemas.assessment import (
    AssessmentResponse,
    EscalationRequest,
    EscalationResponse,
    AutoDetectResponse,
    AcousticGradeRequest,
    AcousticGradeResponse,
    ModelCard,
)
from app.api.deps import get_current_user, get_current_farmer_or_fpo
from app.core.errors import ImageCorruptedError
from app.models.user import User
from intelligence_layer.module_a_disease.models.acoustic_grader import evaluate_acoustic_resonance
from intelligence_layer.pipelines.disease_pipeline import describe_models

router = APIRouter(prefix="/assessments", tags=["Disease Screening & Triage"])


@router.get("/model-info", response_model=List[ModelCard])
async def get_model_cards():
    """Per-crop model cards: serving engine, class coverage and held-out test accuracy (public)."""
    return describe_models()


@router.post("/acoustic-grade", response_model=AcousticGradeResponse)
async def grade_pineapple_acoustic_resonance(req: AcousticGradeRequest):
    """
    Signature Innovation 1: Acoustic 'Thumb-Thump' Bio-Resonance Spectrometer.
    Transforms smartphone microphone into a non-destructive acoustic spectrometer:
    - Captures the farmer's thumb-tap impulse response.
    - Computes FFT to extract Peak Resonant Frequency f_peak and Damping Ratio zeta.
    - Firmness Index: S = f_peak^2 * m^(2/3).
    - Detects internal Osmotic Water Blister (<85 Hz) before outer signs appear.
    """
    result = evaluate_acoustic_resonance(
        peak_frequency_hz=req.peak_frequency_hz,
        damping_ratio=req.damping_ratio,
        mass_kg=req.mass_kg,
        crop=req.crop
    )
    return AcousticGradeResponse(**result)


@router.post("/auto-detect", response_model=AutoDetectResponse)
async def auto_detect_live_frame(
    image_file: UploadFile = File(..., description="Live camera frame stream for multi-crop & part auto-detection"),
    crop_hint: Optional[str] = Form(None, description="Optional focus hint: pineapple, rice, or orange"),
    part_hint: Optional[str] = Form(None, description="Optional plant part hint"),
):
    """
    Module A Live AI Engine:
    Zero-click automated live camera recognition:
    1. Identifies crop species (Pineapple, Rice, or Orange).
    2. Identifies biological plant organ (Crown Whorl, Basal Sheath, Leaf Blade, Panicle, Fruit Peel, etc.).
    3. Diagnoses pathology in real time with calibrated confidence and ICAR/CAU remedies.
    """
    content = await image_file.read()
    if len(content) < 100:
        raise ImageCorruptedError("Invalid frame payload.")

    result = await AssessmentService.auto_detect_crop_and_disease(
        content=content,
        crop_hint=crop_hint,
        part_hint=part_hint
    )
    return AutoDetectResponse(**result)


@router.post("/screen", response_model=AssessmentResponse)
async def screen_crop_photo(
    crop_record_id: str = Form(..., description="Target crop record ID"),
    image_angle: str = Form("crown", description="crown, fruit_base, or lateral"),
    image_file: UploadFile = File(..., description="Uploaded diagnostic photo (PNG/JPEG, max 5MB)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Module A: Computer Vision Disease Screening Intelligence.
    Screens leaf, crown, and basal rot symptoms for Phytophthora Heart Rot,
    Thielaviopsis Black Rot, Mealybug Wilt, or Healthy stands.
    Returns calibrated confidence, symptoms, and organic/chemical remedies.
    """
    result = await AssessmentService.screen_crop(
        db,
        crop_record_id=crop_record_id,
        image_file=image_file,
        image_angle=image_angle
    )
    return AssessmentResponse(**result)


@router.post("/{id}/escalate", response_model=EscalationResponse)
async def escalate_assessment_to_officer(
    id: str,
    req: EscalationRequest = EscalationRequest(),
    current_user: User = Depends(get_current_farmer_or_fpo),
    db: AsyncSession = Depends(get_db)
):
    """
    Escalate an inconclusive or severe diagnosis to a district KVK extension officer.
    """
    return await AssessmentService.escalate_assessment(db, assessment_id=id, notes=req.notes)


@router.get("/crop/{crop_id}", response_model=List[AssessmentResponse])
async def list_assessments_for_crop(
    crop_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Audit log of all past diagnostic screenings on a specific crop stand.
    """
    assessments = await AssessmentService.list_by_crop(db, crop_id=crop_id)
    return [
        AssessmentResponse(
            id=a.id,
            crop_record_id=a.crop_record_id,
            image_url=a.image_url,
            image_angle=a.image_angle,
            predicted_class=a.predicted_class,
            confidence_score=float(a.confidence_score),
            severity_rating=a.severity_rating,
            symptoms_detected=[],
            recommended_actions={
                "organic": a.remedy_notes or "N/A",
                "chemical": "Consult regional package of practices.",
                "cultural": "Maintain ridge drainage."
            },
            refer_to_expert=a.expert_referred,
            model_version=a.model_version,
            image_hash_sha256=a.image_hash_sha256,
            created_at=a.created_at
        )
        for a in assessments
    ]
