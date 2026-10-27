from io import BytesIO
from typing import Dict, Any, Optional
from app.core.errors import ImageCorruptedError
from datetime import date, timedelta
from PIL import Image
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

    @staticmethod
    async def evaluate_field_frame(
        content: bytes,
        filename: str = "field_frame.jpg",
        crop_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates a live camera video frame or captured photo for the Harvest Radar:
        1. Planted or Unplanted (Fallow Soil vs Established Stand)
        2. Crop Condition (Optimal, Water Deficit, Root Rot Onset)
        3. Water Status (Lacking Water, Optimal, Waterlogged)
        4. Root Rot Warning (Started or Healthy)
        5. When to Harvest (Readiness %, GDD, Brix, Pick Date, Rain Advisory)
        """
        # Analyze vegetation, moisture proxy, and discoloration via PIL
        green_pct = dry_pct = dark_pct = soil_pct = 0.0

        try:
            im = Image.open(BytesIO(content)).convert('RGB')
            im.thumbnail((160, 160))
            pixels = list(im.getdata())
            total = len(pixels)
            green_count = 0
            dry_count = 0
            dark_count = 0
            soil_count = 0

            for r, g, b in pixels:
                if g > r * 1.15 and g > b * 1.15 and g > 45:
                    green_count += 1
                elif r > 130 and g > 105 and b < 85:
                    dry_count += 1
                elif r < 40 and g < 40 and b < 40:
                    dark_count += 1
                elif r > g and g > b and r < 140:
                    soil_count += 1

            if total > 0:
                green_pct = (green_count / total) * 100
                dry_pct = (dry_count / total) * 100
                dark_pct = (dark_count / total) * 100
                soil_pct = (soil_count / total) * 100
        except Exception:
            raise ImageCorruptedError("Could not read the field photo.")

        # Only what pixels can show: canopy cover and visual stress. Soil moisture, readiness, Brix,
        # GDD and pick dates are NOT measurable from a photo, so they are returned as None.
        vegetation = green_pct + dry_pct
        visible = vegetation + dark_pct
        health = round(100.0 * green_pct / visible, 1) if visible > 0 else 0.0
        not_measured = "Not measurable from a photo; use the crop forecast for harvest timing."

        common = {
            "soil_moisture_pct": None,
            "harvest_readiness_pct": None,
            "estimated_brix": None,
            "gdd_accumulated": None,
            "gdd_target": None,
            "optimal_harvest_window": None,
            "recommended_pick_date": None,
        }

        if vegetation < 12:
            return {
                **common,
                "is_planted": False,
                "planting_status": "No Vegetation Visible",
                "canopy_coverage_pct": round(vegetation, 1),
                "detected_crop": None,
                "crop_display_name": "No crop identified",
                "crop_condition": "FALLOW",
                "condition_score": 0.0,
                "water_status": "UNKNOWN",
                "root_rot_status": "N/A",
                "root_rot_details": "No plant tissue visible, so no root or collar assessment is possible.",
                "harvest_recommendation": not_measured,
                "weather_risk": "Not assessed from a photo",
                "agronomic_advisory": f"Only {vegetation:.0f}% of the frame looks like vegetation. Frame the crop canopy in daylight and retake.",
            }

        crop_names = {
            "rice": "Chak-hao & Valley Rice (Oryza sativa)",
            "orange": "Tamenglong Mandarin Orange (GI #498)",
            "pineapple": "Manipur Queen Pineapple (GI #497)",
        }
        detected_crop = crop_hint if crop_hint in crop_names else None  # the crop is never guessed from pixels
        crop_name = crop_names.get(detected_crop, "Crop not identified (select a crop)")
        canopy_cov = round(min(100.0, vegetation), 1)

        if dark_pct > 22:
            condition, water, rot = "ROOT_ROT_ONSET", "WATERLOGGED", "EARLY_ONSET"
            rot_details = f"{dark_pct:.0f}% of the frame is very dark/water-soaked tissue, a visual sign only. Inspect the stem collar."
            advisory = "Dark water-soaked areas visible. Check drainage and inspect the basal collar; confirm with a KVK officer."
        elif dry_pct > 28 and green_pct < 45:
            condition, water, rot = "WATER_DEFICIT", "LACKING_WATER", "HEALTHY"
            rot_details = "No dark water-soaked tissue visible."
            advisory = f"{dry_pct:.0f}% of the canopy looks dry or yellowed against {green_pct:.0f}% green: possible moisture stress."
        else:
            condition, water, rot = "OPTIMAL", "OPTIMAL", "HEALTHY"
            rot_details = "No dark water-soaked tissue visible."
            advisory = f"Canopy looks healthy ({green_pct:.0f}% green). This is a visual check only."

        return {
            **common,
            "is_planted": True,
            "planting_status": "Established Stand" if canopy_cov >= 40 else "Sparse Vegetation",
            "canopy_coverage_pct": canopy_cov,
            "detected_crop": detected_crop,
            "crop_display_name": crop_name,
            "crop_condition": condition,
            "condition_score": health,
            "water_status": water,
            "root_rot_status": rot,
            "root_rot_details": rot_details,
            "harvest_recommendation": not_measured,
            "weather_risk": "Not assessed from a photo",
            "agronomic_advisory": advisory,
        }
