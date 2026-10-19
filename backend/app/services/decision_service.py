from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.errors import EntityNotFoundError
from app.models.crop import CropRecord
from app.models.farm import Farm
from app.services.market_service import MarketService
from app.services.weather_service import WeatherService
from intelligence_layer.module_b_harvest.weather_risk.cost_of_waiting import compute_cost_of_waiting


class DecisionService:
    @staticmethod
    async def get_lot_decision(db: AsyncSession, lot_id: str, demo_storm: bool = False) -> Dict[str, Any]:
        """Rain-to-Rupee: one response with the weather, the best buyer and the cost of waiting."""
        lot = await MarketService.get_lot(db, lot_id)
        crop = (await db.execute(select(CropRecord).where(CropRecord.id == lot.crop_record_id))).scalars().first()
        farm = None
        if crop:
            farm = (await db.execute(select(Farm).where(Farm.id == crop.farm_id))).scalars().first()
        if not farm:
            raise EntityNotFoundError("Farm", f"No farm is linked to lot '{lot_id}'.")

        matches = await MarketService.match_lot_with_buyers(db, lot_id)
        if not matches:
            raise EntityNotFoundError("BuyerMatch", f"No open buyer orders match lot '{lot_id}'.")
        best = max(matches, key=lambda m: m["net_rate"])

        rain = await WeatherService.get_rain_outlook(db, farm.latitude, farm.longitude, demo_storm=demo_storm)
        decision = compute_cost_of_waiting(
            brix_now=float(lot.brix_reading or 14.5),
            lot_kg=float(lot.quantity_kg),
            net_rate_grade_a=best["net_rate"],
            rain_mm=rain["rain_mm"],
            rain_eta_hours=rain["eta_hours"],
        )
        return {
            "lot_id": lot.id,
            "lot_kg": float(lot.quantity_kg),
            "district": farm.district,
            "rain": rain,
            "best_match": best,
            "decision": decision,
        }
