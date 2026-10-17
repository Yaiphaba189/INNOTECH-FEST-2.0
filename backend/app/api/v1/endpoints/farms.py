from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.farm_service import FarmService
from app.schemas.farm import FarmCreate, FarmResponse
from app.api.deps import get_current_user, get_current_farmer_or_fpo
from app.models.user import User

router = APIRouter(prefix="/farms", tags=["Farms & Geography"])


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
async def register_farm(
    farm_in: FarmCreate,
    current_user: User = Depends(get_current_farmer_or_fpo),
    db: AsyncSession = Depends(get_db)
):
    """
    Registers a new farm boundary and GPS coordinates.
    Restricted to Farmer or FPO Coordinator roles.
    """
    farm = await FarmService.create_farm(db, farmer_id=current_user.id, farm_in=farm_in)
    return FarmResponse.model_validate(farm)


@router.get("", response_model=List[FarmResponse])
async def list_user_farms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all registered farms for the current user (or all if admin/fpo).
    """
    if current_user.role in ["admin", "fpo"]:
        farms = await FarmService.list_all_farms(db)
    else:
        farms = await FarmService.list_farms_by_farmer(db, current_user.id)
    return [FarmResponse.model_validate(f) for f in farms]


@router.get("/nearby", response_model=List[dict])
async def find_nearby_farms(
    lat: float = Query(..., description="Center latitude"),
    lon: float = Query(..., description="Center longitude"),
    radius_km: float = Query(15.0, description="Search radius in kilometers"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Spatial radius search retrieving farms within radius_km, sorted by proximity.
    """
    nearby = await FarmService.get_nearby_farms(db, lat=lat, lon=lon, radius_km=radius_km)
    return [
        {
            "farm": FarmResponse.model_validate(farm),
            "distance_km": dist
        }
        for farm, dist in nearby
    ]


@router.get("/{id}", response_model=FarmResponse)
async def get_farm_by_id(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve single farm entity details.
    """
    farm = await FarmService.get_farm(db, farm_id=id)
    return FarmResponse.model_validate(farm)
