import os
import uuid
from typing import Dict, Any, List
from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.errors import ImageCorruptedError, EntityNotFoundError
from app.models.crop import CropRecord
from app.models.assessment import DiseaseAssessment
from intelligence_layer.pipelines.disease_pipeline import predict_crop_disease, DISEASE_REMEDIES


class AssessmentService:
    @staticmethod
    async def screen_crop(
        db: AsyncSession,
        crop_record_id: str,
        image_file: UploadFile,
        image_angle: str = "crown"
    ) -> Dict[str, Any]:
        # 1. Verify crop record exists
        crop_res = await db.execute(select(CropRecord).where(CropRecord.id == crop_record_id))
        crop = crop_res.scalars().first()
        if not crop:
            raise EntityNotFoundError("CropRecord", f"Crop record '{crop_record_id}' not found.")

        # 2. Read image bytes and validate size
        content = await image_file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE_BYTES or len(content) < 100:
            raise ImageCorruptedError("Image file size is out of valid bounds (max 5MB).")

        # 3. Predict disease via Module A vision pipeline
        try:
            crop_name = getattr(crop, "crop_type", "pineapple") or "pineapple"
            diag_result = predict_crop_disease(content, image_angle=image_angle, crop=crop_name)
        except ValueError as ex:
            raise ImageCorruptedError(str(ex))

        # 4. Save image file locally
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid.uuid4().hex[:12]}_{image_file.filename}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        image_url = f"/data/demo/sample_images/{filename}"

        # 5. Persist assessment record in database
        assessment = DiseaseAssessment(
            id=str(uuid.uuid4()),
            crop_record_id=crop_record_id,
            image_url=image_url,
            image_angle=image_angle,
            predicted_class=diag_result["predicted_class"],
            confidence_score=diag_result["confidence_score"],
            severity_rating=diag_result["severity_rating"],
            expert_referred=diag_result["refer_to_expert"],
            model_version=diag_result["model_version"],
            image_hash_sha256=diag_result["image_hash_sha256"],
            remedy_notes=diag_result["recommended_actions"]["organic"]
        )
        db.add(assessment)
        await db.commit()
        await db.refresh(assessment)

        return {
            "id": assessment.id,
            "crop_record_id": assessment.crop_record_id,
            "image_url": assessment.image_url,
            "image_angle": assessment.image_angle,
            "predicted_class": assessment.predicted_class,
            "confidence_score": float(assessment.confidence_score),
            "severity_rating": assessment.severity_rating,
            "symptoms_detected": diag_result["symptoms_detected"],
            "recommended_actions": diag_result["recommended_actions"],
            "refer_to_expert": assessment.expert_referred,
            "model_version": assessment.model_version,
            "image_hash_sha256": assessment.image_hash_sha256,
            "created_at": assessment.created_at
        }

    @staticmethod
    async def escalate_assessment(
        db: AsyncSession,
        assessment_id: str,
        notes: str = None
    ) -> Dict[str, Any]:
        result = await db.execute(select(DiseaseAssessment).where(DiseaseAssessment.id == assessment_id))
        assessment = result.scalars().first()
        if not assessment:
            raise EntityNotFoundError("DiseaseAssessment", f"Assessment '{assessment_id}' does not exist.")

        assessment.expert_referred = True
        if notes:
            assessment.remedy_notes = f"{assessment.remedy_notes or ''} [Farmer Note: {notes}]"

        await db.commit()
        await db.refresh(assessment)

        referral_id = f"KVK-REF-{uuid.uuid4().hex[:8].upper()}"
        return {
            "assessment_id": assessment.id,
            "referral_id": referral_id,
            "status": "assigned_to_officer",
            "message": "Assessment escalated to district Krishi Vigyan Kendra (KVK) extension officer."
        }

    @staticmethod
    async def list_by_crop(db: AsyncSession, crop_id: str) -> List[DiseaseAssessment]:
        result = await db.execute(
            select(DiseaseAssessment)
            .where(DiseaseAssessment.crop_record_id == crop_id)
            .order_by(DiseaseAssessment.created_at.desc())
        )
        return list(result.scalars().all())
