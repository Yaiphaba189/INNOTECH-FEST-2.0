import json
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.errors import EntityNotFoundError, CapacityThresholdFailError
from app.models.dispatch import DispatchRun
from app.models.lot import HarvestLot
from app.models.farm import Farm
from app.models.user import User
from app.models.crop import CropRecord
from app.schemas.dispatch import DispatchPlanRequest
from intelligence_layer.pipelines.logistics_pipeline import solve_cvrp_dispatch, VEHICLE_PROFILES


class LogisticsService:
    @staticmethod
    async def generate_dispatch_plan(
        db: AsyncSession,
        plan_req: DispatchPlanRequest
    ) -> Dict[str, Any]:
        # 1. Gather candidate lots
        if plan_req.lot_ids:
            query = (
                select(HarvestLot, Farm, User, CropRecord)
                .join(CropRecord, HarvestLot.crop_record_id == CropRecord.id)
                .join(Farm, CropRecord.farm_id == Farm.id)
                .join(User, HarvestLot.farmer_id == User.id)
                .where(HarvestLot.id.in_(plan_req.lot_ids))
            )
        else:
            query = (
                select(HarvestLot, Farm, User, CropRecord)
                .join(CropRecord, HarvestLot.crop_record_id == CropRecord.id)
                .join(Farm, CropRecord.farm_id == Farm.id)
                .join(User, HarvestLot.farmer_id == User.id)
                .where(
                    and_(
                        Farm.district.ilike(f"%{plan_req.cluster_district}%"),
                        HarvestLot.status.in_(["committed", "registered"]),
                        HarvestLot.dispatch_run_id.is_(None)
                    )
                )
            )

        results = (await db.execute(query)).all()
        farm_lots = []
        lot_objects = []
        for lot, farm, farmer, crop in results:
            lot_objects.append(lot)
            farm_lots.append({
                "id": lot.id,
                "quantity_kg": float(lot.quantity_kg),
                "farm_name": farm.farm_name,
                "farmer_name": farmer.full_name,
                "district": farm.district,
                "variety": crop.variety,
                "quality_grade": lot.quality_grade
            })

        # 2. Run OR-Tools / CVRPTW solver
        solution = solve_cvrp_dispatch(
            cluster_district=plan_req.cluster_district,
            vehicle_type=plan_req.vehicle_type,
            destination_hub=plan_req.destination_hub,
            farm_lots=farm_lots,
            enforce_threshold=plan_req.enforce_threshold
        )

        if not solution.get("success"):
            raise CapacityThresholdFailError(solution.get("message"))

        # 3. Create DispatchRun database record
        dispatch_run = DispatchRun(
            id=str(uuid.uuid4()),
            vehicle_type=solution["vehicle_type"],
            max_capacity_kg=solution["max_capacity_kg"],
            driver_name="Rajen Meitei",
            driver_phone="+919862123456",
            total_loaded_kg=solution["total_loaded_kg"],
            destination_facility=solution["destination_facility"],
            digital_gate_pass=solution["digital_gate_pass"],
            capacity_fill_pct=solution["capacity_fill_pct"],
            estimated_cost_per_kg=solution["estimated_cost_per_kg"],
            route_stops_json=json.dumps(solution["stops"]),
            status="scheduled"
        )
        db.add(dispatch_run)

        # 4. Associate lots with this dispatch run
        for lot in lot_objects:
            lot.dispatch_run_id = dispatch_run.id
            if lot.status == "registered":
                lot.status = "committed"

        await db.commit()
        await db.refresh(dispatch_run)

        return {
            "id": dispatch_run.id,
            "vehicle_type": dispatch_run.vehicle_type,
            "vehicle_name": solution["vehicle_name"],
            "max_capacity_kg": dispatch_run.max_capacity_kg,
            "total_loaded_kg": float(dispatch_run.total_loaded_kg),
            "capacity_fill_pct": float(dispatch_run.capacity_fill_pct),
            "estimated_cost_per_kg": float(dispatch_run.estimated_cost_per_kg),
            "estimated_savings_total": solution["estimated_savings_total"],
            "destination_facility": dispatch_run.destination_facility,
            "cluster_district": solution["cluster_district"],
            "digital_gate_pass": dispatch_run.digital_gate_pass,
            "stops": solution["stops"],
            "status": dispatch_run.status,
            "created_at": dispatch_run.created_at
        }

    @staticmethod
    async def verify_gate_pass(db: AsyncSession, token: str) -> Dict[str, Any]:
        result = await db.execute(select(DispatchRun).where(DispatchRun.digital_gate_pass == token))
        run = result.scalars().first()
        if not run:
            raise EntityNotFoundError("GatePass", f"Gate-Pass token '{token}' is invalid or expired.")

        stops = json.loads(run.route_stops_json) if run.route_stops_json else []

        return {
            "valid": True,
            "digital_gate_pass": run.digital_gate_pass,
            "dispatch_id": run.id,
            "vehicle_type": run.vehicle_type,
            "driver_name": run.driver_name,
            "driver_phone": run.driver_phone,
            "destination_facility": run.destination_facility,
            "total_loaded_kg": float(run.total_loaded_kg),
            "capacity_fill_pct": float(run.capacity_fill_pct),
            "manifest_stops": stops,
            "status": run.status,
            "created_at": run.created_at
        }
