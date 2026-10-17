import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_logistics_solver_and_qr_gate_pass(client: AsyncClient, fpo_token: str, farmer_token: str):
    fpo_headers = {"Authorization": f"Bearer {fpo_token}"}
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # 1. Generate dispatch plan for Thoubal cluster
    # Using the seeded 4 lots totaling 2,050 kg (82% of Tata 407 2,500 kg capacity)
    dispatch_req = {
        "cluster_district": "Thoubal",
        "vehicle_type": "pickup_407",
        "destination_hub": "Nilakuthi Food Park, Imphal East",
        "enforce_threshold": True
    }

    plan_res = await client.post(
        "/api/logistics/dispatch-plans/generate",
        json=dispatch_req,
        headers=fpo_headers
    )
    assert plan_res.status_code == 201, plan_res.text
    plan_data = plan_res.json()
    assert plan_data["vehicle_type"] == "pickup_407"
    assert plan_data["capacity_fill_pct"] >= 75.0
    assert len(plan_data["stops"]) >= 1
    assert "digital_gate_pass" in plan_data
    gate_pass_token = plan_data["digital_gate_pass"]

    # 2. Verify digital gate-pass at weighbridge
    pass_res = await client.get(
        f"/api/logistics/dispatch-passes/{gate_pass_token}",
        headers=farmer_headers
    )
    assert pass_res.status_code == 200
    pass_data = pass_res.json()
    assert pass_data["valid"] is True
    assert pass_data["digital_gate_pass"] == gate_pass_token
    assert pass_data["capacity_fill_pct"] >= 75.0
    assert len(pass_data["manifest_stops"]) >= 1


@pytest.mark.asyncio
async def test_logistics_capacity_threshold_failure(client: AsyncClient, fpo_token: str):
    fpo_headers = {"Authorization": f"Bearer {fpo_token}"}

    # Attempting to assign a medium truck (7,000 kg capacity) with very small specific lot
    # to trigger CAPACITY_THRESHOLD_FAIL (<75%)
    plan_req = {
        "cluster_district": "NonExistentDistrict",
        "vehicle_type": "medium_truck",
        "destination_hub": "Guwahati",
        "enforce_threshold": True,
        "lot_ids": []
    }

    fail_res = await client.post(
        "/api/logistics/dispatch-plans/generate",
        json=plan_req,
        headers=fpo_headers
    )
    assert fail_res.status_code == 422
    assert fail_res.json()["detail"]["code"] == "CAPACITY_THRESHOLD_FAIL"
