import io
import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from PIL import Image


@pytest.mark.asyncio
async def test_complete_competition_pitch_closed_loop(client: AsyncClient):
    """
    Simulates the exact 5-minute live judging demonstration sequence:
    0:00 - 0:45: Overview
    0:45 - 1:45: Module A Live Disease Scan (Heart Rot diagnosis & remedies)
    1:45 - 2:30: Module B Harvest Radar & 48h Monsoon Downpour Alert
    2:30 - 3:30: Module C Transparent Net Returns & 1-Tap Deal Lock
    3:30 - 4:30: Module D FPO Collective Truck Consolidation & QR Gate-Pass
    4:30 - 5:00: Verification at destination weighbridge
    """
    # Step 1: Farmer authentication
    auth_res = await client.post("/api/auth/login", json={
        "phone_number": "+919862000001",
        "password": "innotech2026"
    })
    assert auth_res.status_code == 200
    farmer_token = auth_res.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # Step 2: Module A - Disease Screening
    img = Image.new("RGB", (224, 224), color=(150, 100, 45))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    screen_res = await client.post(
        "/api/assessments/screen",
        data={"crop_record_id": "crop-queen-tombi-001", "image_angle": "crown_rot"},
        files={"image_file": ("pineapple_rot.jpg", buf.getvalue(), "image/jpeg")},
        headers=farmer_headers
    )
    assert screen_res.status_code == 200
    diagnosis = screen_res.json()
    assert diagnosis["predicted_class"] == "heart_rot"
    assert diagnosis["confidence_score"] >= 0.85
    assert "Copper Oxychloride" in diagnosis["recommended_actions"]["chemical"]

    # Step 3: Module B - Harvest Readiness Radar & Monsoon Alert
    forecast_res = await client.get(
        "/api/crops/crop-queen-tombi-001/forecast?target_brix=14.5&simulated_rainfall_mm=65.0",
        headers=farmer_headers
    )
    assert forecast_res.status_code == 200
    forecast = forecast_res.json()
    assert forecast["weather_risk_level"] == "high"
    assert "Downpour alert" in forecast["weather_advisory"]

    # Step 4: Module C - Register Harvest Lot & Inspect Transparent Deductions
    today = date.today()
    lot_res = await client.post("/api/lots", json={
        "crop_record_id": "crop-queen-tombi-001",
        "quantity_kg": 450.0,
        "quality_grade": "grade_a",
        "brix_reading": 14.8,
        "harvest_window_start": today.isoformat(),
        "harvest_window_end": (today + timedelta(days=3)).isoformat()
    }, headers=farmer_headers)
    assert lot_res.status_code == 201
    lot_id = lot_res.json()["id"]

    # Get transparent buyer quotes
    matches_res = await client.get(f"/api/lots/{lot_id}/matches", headers=farmer_headers)
    assert matches_res.status_code == 200
    matches = matches_res.json()
    assert len(matches) >= 1
    best_match = matches[0]

    # Verify gross vs net transparency
    assert best_match["gross_rate"] > best_match["net_rate"]
    assert best_match["freight_deduction"] > 0
    assert best_match["total_take_home"] > 0

    # 1-Tap Deal Lock
    accept_res = await client.post(f"/api/matches/{best_match['match_id']}/accept", headers=farmer_headers)
    assert accept_res.status_code == 200
    assert accept_res.json()["contract_status"] == "locked"

    # Step 5: Module D - FPO Collective Truck Dispatch & QR Gate-Pass
    fpo_login = await client.post("/api/auth/login", json={
        "phone_number": "+919862000006",
        "password": "innotech2026"
    })
    fpo_token = fpo_login.json()["access_token"]
    fpo_headers = {"Authorization": f"Bearer {fpo_token}"}

    plan_res = await client.post(
        "/api/logistics/dispatch-plans/generate",
        json={
            "cluster_district": "Churachandpur",
            "vehicle_type": "pickup_407",
            "destination_hub": "Nilakuthi Food Park Processing Unit",
            "enforce_threshold": False,  # Allow single-cluster demo
            "lot_ids": [lot_id]
        },
        headers=fpo_headers
    )
    assert plan_res.status_code == 201
    dispatch_plan = plan_res.json()
    gate_pass = dispatch_plan["digital_gate_pass"]
    assert "HL-PASS" in gate_pass

    # FPO console reads the persisted run back, in the shape the dispatch screen renders
    run_res = await client.get("/api/logistics/dispatch-runs/Churachandpur", headers=fpo_headers)
    assert run_res.status_code == 200
    run_view = run_res.json()
    assert run_view["digital_gate_pass_token"] == gate_pass
    assert run_view["stops"][0]["quantity_kg"] == 450.0
    assert run_view["stops"][0]["contact_phone"].startswith("+91")

    latest = await client.get("/api/logistics/dispatch-runs/latest", headers=fpo_headers)
    assert latest.status_code == 200 and latest.json()["cluster_district"] == "Churachandpur"

    missing = await client.get("/api/logistics/dispatch-runs/Nowhereland", headers=fpo_headers)
    assert missing.status_code == 404

    # Step 6: Destination Weighbridge Gate-Pass Scan
    verify_res = await client.get(f"/api/logistics/dispatch-passes/{gate_pass}", headers=fpo_headers)
    assert verify_res.status_code == 200
    verification = verify_res.json()
    assert verification["valid"] is True
    assert verification["destination_facility"] == "Nilakuthi Food Park Processing Unit"
    assert len(verification["manifest_stops"]) >= 1

    print("\n>>> FULL END-TO-END COMPETITION LOOP VERIFIED SUCCESSFULLY! <<<")
