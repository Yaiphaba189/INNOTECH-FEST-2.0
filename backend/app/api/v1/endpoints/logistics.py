from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.logistics_service import LogisticsService
from app.schemas.dispatch import DispatchPlanRequest, DispatchPlanResponse, DispatchRunView, GatePassVerificationResponse
from app.api.deps import get_current_user, get_current_fpo
from app.models.user import User

router = APIRouter(prefix="/logistics", tags=["Logistics & Fleet Aggregation"])


@router.post("/dispatch-plans/generate", response_model=DispatchPlanResponse, status_code=status.HTTP_201_CREATED)
async def generate_dispatch_plan(
    plan_req: DispatchPlanRequest,
    current_user: User = Depends(get_current_fpo),
    db: AsyncSession = Depends(get_db)
):
    """
    Module D: Collective Logistics & Vehicle Capacity Optimizer.
    Pools smallholder farm lots into full vehicle loads (Tata 407, 3-wheeler, etc.).
    Enforces minimum 75% payload saturation constraint and issues a digital QR gate-pass.
    """
    plan = await LogisticsService.generate_dispatch_plan(db, plan_req=plan_req)
    return DispatchPlanResponse(**plan)


@router.get("/dispatch-passes/{token}", response_model=GatePassVerificationResponse)
async def verify_gate_pass(
    token: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Weighbridge and checkpost verification for digital QR gate-pass token.
    Returns complete consignment manifest.
    """
    pass_data = await LogisticsService.verify_gate_pass(db, token=token)
    return GatePassVerificationResponse(**pass_data)


@router.get("/dispatch-runs/{district}", response_model=DispatchRunView)
async def get_latest_dispatch_run(
    district: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Latest consolidated truck run for a district cluster, as shown on the FPO dispatch console."""
    return DispatchRunView(**await LogisticsService.latest_run_for_district(db, district=district))
