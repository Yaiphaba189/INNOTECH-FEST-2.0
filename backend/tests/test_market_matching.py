import pytest
from datetime import date, timedelta
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_transparent_net_return_matching_and_contract_lock(
    client: AsyncClient,
    farmer_token: str,
    buyer_token: str
):
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # 1. Post a new harvest lot
    today = date.today()
    lot_res = await client.post("/api/lots", json={
        "crop_record_id": "crop-queen-tombi-001",
        "quantity_kg": 450.0,
        "quality_grade": "grade_a",
        "brix_reading": 14.8,
        "harvest_window_start": today.isoformat(),
        "harvest_window_end": (today + timedelta(days=4)).isoformat()
    }, headers=farmer_headers)
    assert lot_res.status_code == 201, lot_res.text
    lot_id = lot_res.json()["id"]

    # 2. Query Module C Transparent Net Returns & Buyer Matches
    matches_res = await client.get(f"/api/lots/{lot_id}/matches", headers=farmer_headers)
    assert matches_res.status_code == 200, matches_res.text
    matches = matches_res.json()
    assert len(matches) >= 1

    top_match = matches[0]
    # Check transparent net calculation: Net = Gross - Freight - Handling - Platform Fee
    gross = top_match["gross_rate"]
    freight = top_match["freight_deduction"]
    handling = top_match["handling_deduction"]
    platform = top_match["platform_fee"]
    expected_net = round(gross - freight - handling - platform, 2)
    assert abs(top_match["net_rate"] - expected_net) < 0.05
    assert top_match["total_take_home"] == round(top_match["net_rate"] * 450.0, 2)

    # 3. 1-Tap Deal Acceptance
    accept_res = await client.post(f"/api/matches/{top_match['match_id']}/accept", headers=farmer_headers)
    assert accept_res.status_code == 200
    accept_data = accept_res.json()
    assert accept_data["lot_status"] == "committed"
    assert accept_data["contract_status"] == "locked"

    # 4. Attempting to accept again should fail with LOT_ALREADY_COMMITTED (HTTP 409)
    conflict_res = await client.post(f"/api/matches/{top_match['match_id']}/accept", headers=farmer_headers)
    assert conflict_res.status_code == 409
    assert conflict_res.json()["detail"]["code"] == "LOT_ALREADY_COMMITTED"
