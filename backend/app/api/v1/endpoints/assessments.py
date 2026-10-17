from typing import List
from fastapi import APIRouter, Depends, Form, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.assessment_service import AssessmentService
from app.schemas.assessment import AssessmentResponse, EscalationRequest, EscalationResponse
from app.api.deps import get_current_user, get_current_farmer_or_fpo
from app.models.user import User

router = APIRouter(prefix="/assessments", tags=["Disease Screening & Triage"])


@router.post("/screen", response_model=AssessmentResponse)
async def screen_crop_photo(
    crop_record_id: str = Form(..., description="Target crop record ID"),
    image_angle: str = Form("crown", description="crown, fruit_base, or lateral"),
    image_file: UploadFile = File(..., description="Uploaded diagnostic photo (PNG/JPEG, max 5MB)"),
    current_user: User = Depends(get_current_farmer_or_fpo),
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
