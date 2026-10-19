import uuid
from typing import List, Dict, Any, Optional
from datetime import date, timedelta
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.errors import EntityNotFoundError, LotAlreadyCommittedError
from app.models.lot import HarvestLot
from app.models.crop import CropRecord
from app.models.order import BuyerOrder
from app.models.match import LotMatch
from app.models.user import User
from app.models.farm import Farm
from app.schemas.lot import HarvestLotCreate
from app.schemas.order import BuyerOrderCreate
from intelligence_layer.module_c_pricing.net_returns.geo_baseline import (
    advantage_vs_broker,
    broker_net_rate,
    road_distance_km,
)
from intelligence_layer.pipelines.pricing_pipeline import calculate_net_returns, score_buyer_order


class MarketService:
    @staticmethod
    async def create_lot(db: AsyncSession, farmer_id: str, lot_in: HarvestLotCreate) -> HarvestLot:
        # Verify crop record exists
        crop_res = await db.execute(select(CropRecord).where(CropRecord.id == lot_in.crop_record_id))
        crop = crop_res.scalars().first()
        if not crop:
            raise EntityNotFoundError("CropRecord", f"Crop record '{lot_in.crop_record_id}' not found.")

        lot = HarvestLot(
            id=str(uuid.uuid4()),
            farmer_id=farmer_id,
            crop_record_id=lot_in.crop_record_id,
            quantity_kg=lot_in.quantity_kg,
            quality_grade=lot_in.quality_grade.lower(),
            brix_reading=lot_in.brix_reading,
            harvest_window_start=lot_in.harvest_window_start,
            harvest_window_end=lot_in.harvest_window_end,
            status="registered"
        )
        db.add(lot)
        await db.commit()
        await db.refresh(lot)
        return lot

    @staticmethod
    async def list_lots(db: AsyncSession, farmer_id: Optional[str] = None, status: Optional[str] = None) -> List[HarvestLot]:
        query = select(HarvestLot)
        if farmer_id:
            query = query.where(HarvestLot.farmer_id == farmer_id)
        if status:
            query = query.where(HarvestLot.status == status)
        query = query.order_by(HarvestLot.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_lot(db: AsyncSession, lot_id: str) -> HarvestLot:
        result = await db.execute(select(HarvestLot).where(HarvestLot.id == lot_id))
        lot = result.scalars().first()
        if not lot:
            raise EntityNotFoundError("HarvestLot", f"Harvest lot '{lot_id}' was not found.")
        return lot

    @staticmethod
    async def create_buyer_order(db: AsyncSession, buyer_id: str, order_in: BuyerOrderCreate) -> BuyerOrder:
        order = BuyerOrder(
            id=str(uuid.uuid4()),
            buyer_id=buyer_id,
            variety_required=order_in.variety_required.lower(),
            min_grade=order_in.min_grade.lower(),
            target_quantity_kg=order_in.target_quantity_kg,
            offered_gross_rate=order_in.offered_gross_rate,
            delivery_hub_district=order_in.delivery_hub_district,
            required_by_date=order_in.required_by_date,
            payment_terms_days=order_in.payment_terms_days,
            status="open"
        )
        db.add(order)
        await db.commit()
        await db.refresh(order)
        return order

    @staticmethod
    async def list_orders(db: AsyncSession, buyer_id: Optional[str] = None) -> List[BuyerOrder]:
        query = select(BuyerOrder)
        if buyer_id:
            query = query.where(BuyerOrder.buyer_id == buyer_id)
        query = query.order_by(BuyerOrder.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def match_lot_with_buyers(db: AsyncSession, lot_id: str) -> List[Dict[str, Any]]:
        lot = await MarketService.get_lot(db, lot_id)
        crop_res = await db.execute(select(CropRecord).where(CropRecord.id == lot.crop_record_id))
        crop = crop_res.scalars().first()
        crop_variety = crop.variety if crop else "queen"
        farm = None
        if crop:
            farm = (await db.execute(select(Farm).where(Farm.id == crop.farm_id))).scalars().first()

        # Find compatible open buyer orders
        query = select(BuyerOrder, User).join(User, BuyerOrder.buyer_id == User.id).where(
            BuyerOrder.status == "open"
        )
        results = (await db.execute(query)).all()

        match_records = []
        for order, buyer in results:
            # Variety check
            if order.variety_required not in ["any", crop_variety]:
                continue
            # Quality grade check (grade_a satisfies grade_b, but not vice-versa)
            if order.min_grade == "grade_a" and lot.quality_grade != "grade_a":
                continue

            # Calculate deterministic Net Returns breakdown
            dist = road_distance_km(
                farm.latitude if farm else None,
                farm.longitude if farm else None,
                order.delivery_hub_district,
            )
            pricing = calculate_net_returns(
                gross_rate=float(order.offered_gross_rate),
                lot_weight_kg=float(lot.quantity_kg),
                distance_km=dist,
                handling_per_kg=0.80,
                platform_fee_pct=0.015,
                payment_terms_days=order.payment_terms_days
            )

            score = score_buyer_order(
                net_rate=pricing["net_rate"],
                distance_km=dist,
                payment_terms_days=order.payment_terms_days,
                is_exact_grade_match=(order.min_grade == lot.quality_grade)
            )

            pickup_date = lot.harvest_window_start + timedelta(days=2)

            # Check if match record already exists or create new one
            existing_match = (await db.execute(
                select(LotMatch).where(
                    and_(LotMatch.lot_id == lot.id, LotMatch.order_id == order.id)
                )
            )).scalars().first()

            if not existing_match:
                match_obj = LotMatch(
                    id=str(uuid.uuid4()),
                    lot_id=lot.id,
                    order_id=order.id,
                    gross_rate=pricing["gross_rate"],
                    freight_deduction=pricing["freight_deduction"],
                    handling_deduction=pricing["handling_deduction"],
                    platform_fee=pricing["platform_fee"],
                    net_rate=pricing["net_rate"],
                    total_take_home=pricing["total_take_home"],
                    match_score=score,
                    status="offered",
                    pickup_date=pickup_date
                )
                db.add(match_obj)
                await db.commit()
                await db.refresh(match_obj)
                match_id = match_obj.id
                match_status = match_obj.status
            else:
                match_id = existing_match.id
                match_status = existing_match.status

            advantage, advantage_pct = advantage_vs_broker(pricing["net_rate"])
            match_records.append({
                "match_id": match_id,
                "order_id": order.id,
                "buyer_name": buyer.full_name,
                "buyer_phone": buyer.phone_number,
                "delivery_hub_district": order.delivery_hub_district,
                "gross_rate": pricing["gross_rate"],
                "freight_deduction": pricing["freight_deduction"],
                "handling_deduction": pricing["handling_deduction"],
                "platform_fee": pricing["platform_fee"],
                "net_rate": pricing["net_rate"],
                "total_take_home": pricing["total_take_home"],
                "match_score": score,
                "payment_terms_days": order.payment_terms_days,
                "pickup_date": pickup_date,
                "status": match_status,
                "distance_km": dist,
                "broker_net_rate": broker_net_rate(),
                "advantage_vs_broker": advantage,
                "advantage_pct": advantage_pct,
            })

        # Sort matches by match_score descending (best net income & terms first)
        match_records.sort(key=lambda x: x["match_score"], reverse=True)
        return match_records

    @staticmethod
    async def accept_match(db: AsyncSession, match_id: str, farmer_id: str) -> Dict[str, Any]:
        result = await db.execute(select(LotMatch).where(LotMatch.id == match_id))
        match = result.scalars().first()
        if not match:
            raise EntityNotFoundError("LotMatch", f"Match offer '{match_id}' was not found.")

        # Check lot status
        lot = await MarketService.get_lot(db, match.lot_id)
        if lot.farmer_id != farmer_id:
            # Farmer authorization check
            raise EntityNotFoundError("HarvestLot", "You do not own this harvest lot.")

        if lot.status in ["committed", "collected", "settled"]:
            raise LotAlreadyCommittedError("This lot has already been accepted and locked in contract.")

        # Atomically update statuses
        lot.status = "committed"
        match.status = "accepted"

        # Mark other offers for this lot as expired
        other_matches = (await db.execute(
            select(LotMatch).where(
                and_(LotMatch.lot_id == lot.id, LotMatch.id != match.id)
            )
        )).scalars().all()
        for m in other_matches:
            m.status = "expired"

        await db.commit()
        await db.refresh(lot)
        await db.refresh(match)

        return {
            "match_id": match.id,
            "lot_id": lot.id,
            "lot_status": lot.status,
            "contract_status": "locked",
            "message": "Market contract locked. FPO consolidation schedule generated."
        }
