from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.market_service import MarketService
from app.services.decision_service import DecisionService
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


@router.get("/lots/{id}/decision")
async def get_lot_decision(
    id: str,
    demo_storm: bool = Query(False, description="Force the labelled 65 mm demo storm instead of the live forecast"),
    current_user: User = Depends(get_current_farmer_or_fpo),
    db: AsyncSession = Depends(get_db)
):
    """
    Rain-to-Rupee: live (or cached) 48h rain at the farm, the best buyer's net rate, and the
    rupee cost of waiting out the downpour instead of harvesting now.
    """
    return await DecisionService.get_lot_decision(db, lot_id=id, demo_storm=demo_storm)


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


@router.get("/lots/cooperative/shapley-breakdown")
async def get_cooperative_shapley_breakdown(
    vehicle_type: str = Query("pickup_407", description="pickup_407, 3_wheeler, medium_truck"),
    base_corridor_rate: float = Query(1.85, description="Highway line-haul rate per kg"),
    solo_transit_rate: float = Query(4.80, description="Solo transit rate per kg")
):
    """
    Signature Innovation 4: Shapley-Value Fair Freight Dividend Engine.
    Computes fair freight splitting using Cooperative Game Theory:
    phi_i(v) = Base Corridor Rate + Detour Penalty_i - Consolidation Bonus_i.
    Guarantees stable FPO coalitions: Highway anchors receive consolidation rebates,
    while remote hilltop farmers save 45% over solo private hire.
    """
    from intelligence_layer.module_c_pricing.net_returns.shapley_freight import compute_shapley_freight_allocation

    # Exemplar realistic Manipur FPO collective transport pool
    sample_participants = [
        {
            "id": "lot-khousabung-01",
            "farmer_name": "M. Tombi Singh (Khousabung)",
            "farm_name": "Khousabung Ridge Stand",
            "quantity_kg": 850.0,
            "detour_km": 0.8,
            "terrain_difficulty": 1.05
        },
        {
            "id": "lot-ngaloi-02",
            "farmer_name": "L. Chaoba Meitei (Ngaloi)",
            "farm_name": "Ngaloi Terraced Furrow",
            "quantity_kg": 650.0,
            "detour_km": 3.2,
            "terrain_difficulty": 1.30
        },
        {
            "id": "lot-bunglon-03",
            "farmer_name": "Haokip Farmstead (Bunglon)",
            "farm_name": "Bunglon Hilltop Spur",
            "quantity_kg": 550.0,
            "detour_km": 6.4,
            "terrain_difficulty": 1.75
        }
    ]

    return compute_shapley_freight_allocation(
        participants=sample_participants,
        vehicle_type=vehicle_type,
        vehicle_capacity_kg=2500.0,
        base_corridor_rate=base_corridor_rate,
        solo_transit_rate=solo_transit_rate
    )

