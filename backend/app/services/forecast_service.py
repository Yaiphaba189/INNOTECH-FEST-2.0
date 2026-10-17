from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.errors import EntityNotFoundError
from app.models.crop import CropRecord
from app.models.farm import Farm
from intelligence_layer.pipelines.harvest_pipeline import calculate_harvest_forecast


class ForecastService:
    @staticmethod
    async def get_crop_forecast(
        db: AsyncSession,
        crop_id: str,
        target_brix: Optional[float] = 14.5,
        simulated_rainfall_mm: Optional[float] = 65.0
    ) -> Dict[str, Any]:
        # 1. Fetch crop record
        crop_res = await db.execute(select(CropRecord).where(CropRecord.id == crop_id))
        crop = crop_res.scalars().first()
        if not crop:
            raise EntityNotFoundError("CropRecord", f"Crop record '{crop_id}' was not found.")

        # 2. Fetch parent farm for elevation
        farm_res = await db.execute(select(Farm).where(Farm.id == crop.farm_id))
        farm = farm_res.scalars().first()
        elevation = farm.elevation_meters if farm and farm.elevation_meters else 800

        # 3. Compute phenology & risk
        forecast = calculate_harvest_forecast(
            crop_variety=crop.variety,
            planting_date=crop.planting_date,
            current_stage=crop.current_stage,
            elevation_meters=elevation,
            rainfall_forecast_48h_mm=simulated_rainfall_mm or 0.0,
            target_brix=target_brix or 14.5
        )

        # 4. Synchronize stage on crop record if it advanced
        if forecast["current_stage"] != crop.current_stage:
            crop.current_stage = forecast["current_stage"]
            await db.commit()

        return {
            "crop_id": crop.id,
            "variety": crop.variety,
            **forecast
        }
