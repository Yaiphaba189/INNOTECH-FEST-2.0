from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.market_service import MarketService
from app.schemas.lot import HarvestLotCreate, HarvestLotResponse, BuyerMatchResponse, AcceptMatchResponse
from app.schemas.order import BuyerOrderCreate, BuyerOrderResponse
from app.api.deps import get_current_user, get_current_farmer_or_fpo, get_current_buyer
from app.models.user import User

router = APIRouter(tags=["Marketplace & Net-Returns"])


@router.post("/lots", response_model=HarvestLotResponse, status_code=status.HTTP_201_CREATED)
async def register_harvest_lot(
    lot_in: HarvestLotCreate,
    current_user: User = Depends(get_current_farmer_or_fpo),
    db: AsyncSession = Depends(get_db)
):
    """
    Module C: Register a ready harvest consignment for market matching.
    Sets status to 'registered'.
    """
    lot = await MarketService.create_lot(db, farmer_id=current_user.id, lot_in=lot_in)
    return HarvestLotResponse.model_validate(lot)


@router.get("/lots", response_model=List[HarvestLotResponse])
async def list_harvest_lots(
    status: Optional[str] = Query(None, description="registered, committed, collected"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List marketplace harvest lots. Farmers see their own lots; FPOs/Buyers see active lots.
    """
    farmer_id = current_user.id if current_user.role == "farmer" else None
    lots = await MarketService.list_lots(db, farmer_id=farmer_id, status=status)
    return [HarvestLotResponse.model_validate(l) for l in lots]


@router.get("/lots/{id}", response_model=HarvestLotResponse)
async def get_harvest_lot(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve single consignment details.
    """
    lot = await MarketService.get_lot(db, lot_id=id)
    return HarvestLotResponse.model_validate(lot)


@router.get("/lots/{id}/matches", response_model=List[BuyerMatchResponse])
async def get_lot_matches(
    id: str,
    current_user: User = Depends(get_current_farmer_or_fpo),
    db: AsyncSession = Depends(get_db)
):
    """
    Module C: Transparent Net-Returns & Buyer Matching Engine.
    Reveals true take-home earning per kg by subtracting freight, crates, and fees
    from buyer gross offers. Ranks bids using multi-criteria composite score.
    """
    matches = await MarketService.match_lot_with_buyers(db, lot_id=id)
    return [BuyerMatchResponse(**m) for m in matches]


@router.post("/matches/{id}/accept", response_model=AcceptMatchResponse)
async def accept_buyer_match(
    id: str,
    current_user: User = Depends(get_current_farmer_or_fpo),
    db: AsyncSession = Depends(get_db)
):
    """
    Module C: 1-Tap Deal Acceptance & Contract Lock.
    Atomically locks lot status to 'committed' and confirms pickup date.
    """
    return await MarketService.accept_match(db, match_id=id, farmer_id=current_user.id)


@router.post("/orders", response_model=BuyerOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_buyer_order(
    order_in: BuyerOrderCreate,
    current_user: User = Depends(get_current_buyer),
    db: AsyncSession = Depends(get_db)
):
    """
    Post institutional wholesale purchasing demand (canning plants, juice processors).
    """
    order = await MarketService.create_buyer_order(db, buyer_id=current_user.id, order_in=order_in)
    return BuyerOrderResponse.model_validate(order)


@router.get("/orders", response_model=List[BuyerOrderResponse])
async def list_buyer_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all active buyer purchase orders.
    """
    orders = await MarketService.list_orders(db)
    return [BuyerOrderResponse.model_validate(o) for o in orders]
