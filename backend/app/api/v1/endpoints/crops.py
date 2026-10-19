from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.farm_service import FarmService
from app.services.forecast_service import ForecastService
from app.schemas.crop import CropCreate, CropResponse, HarvestForecastResponse, FieldEvaluationResponse
from app.api.deps import get_current_user, get_current_farmer_or_fpo
from app.models.user import User

router = APIRouter(prefix="/crops", tags=["Crops & Phenology"])


@router.post("", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
async def register_crop(
    crop_in: CropCreate,
    current_user: User = Depends(get_current_farmer_or_fpo),
    db: AsyncSession = Depends(get_db)
):
    """
    Register a biological pineapple planting stand (Queen or Kew variety).
    """
    crop = await FarmService.create_crop(db, crop_in=crop_in)
    return CropResponse.model_validate(crop)


@router.get("/farm/{farm_id}", response_model=List[CropResponse])
async def list_crops_by_farm(
    farm_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all active crop stands for a farm.
    """
    crops = await FarmService.list_crops_by_farm(db, farm_id=farm_id)
    return [CropResponse.model_validate(c) for c in crops]


@router.get("/{id}", response_model=CropResponse)
async def get_crop_by_id(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get planting record details.
    """
    crop = await FarmService.get_crop(db, crop_id=id)
    return CropResponse.model_validate(crop)


@router.get("/{id}/forecast", response_model=HarvestForecastResponse)
async def get_crop_harvest_forecast(
    id: str,
    target_brix: Optional[float] = Query(14.5, description="Target sugar content in Brix"),
    simulated_rainfall_mm: Optional[float] = Query(65.0, description="48h rainfall forecast in mm"),
    current_user: User = Depends(get_current_farmer_or_fpo),
    db: AsyncSession = Depends(get_db)
):
    """
    Module B: Harvest Readiness Radar & Weather Risk Engine.
    Computes GDD thermal accumulation, optimal harvest window, estimated Brix,
    and 48-hour monsoon downpour advisories.
    """
    forecast = await ForecastService.get_crop_forecast(
        db,
        crop_id=id,
        target_brix=target_brix,
        simulated_rainfall_mm=simulated_rainfall_mm
    )
    return HarvestForecastResponse(**forecast)


@router.post("/evaluate-frame", response_model=FieldEvaluationResponse)
async def evaluate_field_frame(
    image_file: UploadFile = File(...),
    crop_hint: Optional[str] = Form(None),
):
    """
    Evaluates live field video frame or snapshot for Harvest Readiness Radar:
    - Determines if the frame has an established planted stand or unplanted fallow soil
    - Detects crop species (Pineapple, Rice, Orange)
    - Assesses crop health & stress conditions: water deficit (lacking water) or root rot onset
    - Projects exact harvest readiness, Brix sweetness, GDD accumulation, and optimal pick date
    """
    content = await image_file.read()
    result = await ForecastService.evaluate_field_frame(
        content=content,
        filename=image_file.filename or "field_frame.jpg",
        crop_hint=crop_hint
    )
    return FieldEvaluationResponse(**result)

