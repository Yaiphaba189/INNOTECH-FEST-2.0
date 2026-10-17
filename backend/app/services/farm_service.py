import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.errors import EntityNotFoundError
from app.models.farm import Farm
from app.models.crop import CropRecord
from app.schemas.farm import FarmCreate
from app.schemas.crop import CropCreate
from app.db.spatial import find_farms_within_radius


class FarmService:
    @staticmethod
    async def create_farm(db: AsyncSession, farmer_id: str, farm_in: FarmCreate) -> Farm:
        farm = Farm(
            id=str(uuid.uuid4()),
            farmer_id=farmer_id,
            farm_name=farm_in.farm_name,
            district=farm_in.district,
            sub_division=farm_in.sub_division,
            latitude=farm_in.latitude,
            longitude=farm_in.longitude,
            total_area_ha=farm_in.total_area_ha,
            elevation_meters=farm_in.elevation_meters,
        )
        db.add(farm)
        await db.commit()
        await db.refresh(farm)
        return farm

    @staticmethod
    async def get_farm(db: AsyncSession, farm_id: str) -> Farm:
        result = await db.execute(select(Farm).where(Farm.id == farm_id))
        farm = result.scalars().first()
        if not farm:
            raise EntityNotFoundError("Farm", f"Farm ID '{farm_id}' does not exist.")
        return farm

    @staticmethod
    async def list_farms_by_farmer(db: AsyncSession, farmer_id: str) -> List[Farm]:
        result = await db.execute(select(Farm).where(Farm.farmer_id == farmer_id))
        return list(result.scalars().all())

    @staticmethod
    async def list_all_farms(db: AsyncSession, district: Optional[str] = None) -> List[Farm]:
        query = select(Farm)
        if district:
            query = query.where(Farm.district.ilike(f"%{district}%"))
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_nearby_farms(
        db: AsyncSession,
        lat: float,
        lon: float,
        radius_km: float = 15.0
    ) -> List[Tuple[Farm, float]]:
        return await find_farms_within_radius(db, lat, lon, radius_km)

    @staticmethod
    async def create_crop(db: AsyncSession, crop_in: CropCreate) -> CropRecord:
        # Verify farm exists
        await FarmService.get_farm(db, crop_in.farm_id)

        crop = CropRecord(
            id=str(uuid.uuid4()),
            farm_id=crop_in.farm_id,
            crop_type=crop_in.crop_type,
            variety=crop_in.variety.lower(),
            planting_date=crop_in.planting_date,
            current_stage=crop_in.current_stage.lower(),
            estimated_plant_count=crop_in.estimated_plant_count,
        )
        db.add(crop)
        await db.commit()
        await db.refresh(crop)
        return crop

    @staticmethod
    async def get_crop(db: AsyncSession, crop_id: str) -> CropRecord:
        result = await db.execute(select(CropRecord).where(CropRecord.id == crop_id))
        crop = result.scalars().first()
        if not crop:
            raise EntityNotFoundError("CropRecord", f"CropRecord ID '{crop_id}' does not exist.")
        return crop

    @staticmethod
    async def list_crops_by_farm(db: AsyncSession, farm_id: str) -> List[CropRecord]:
        result = await db.execute(select(CropRecord).where(CropRecord.farm_id == farm_id))
        return list(result.scalars().all())
