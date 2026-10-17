import pytest
from datetime import date, timedelta
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_farms_and_spatial_search(client: AsyncClient, farmer_token: str):
    headers = {"Authorization": f"Bearer {farmer_token}"}

    # 1. Register a new farm
    res = await client.post("/api/farms", json={
        "farm_name": "Wangbal Terraced Pineapple Ridge",
        "district": "Thoubal",
        "sub_division": "Wangbal",
        "latitude": 24.6300,
        "longitude": 94.0100,
        "total_area_ha": 2.50,
        "elevation_meters": 795
    }, headers=headers)
    assert res.status_code == 201
    farm_id = res.json()["id"]

    # 2. List farmer's farms
    list_res = await client.get("/api/farms", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Spatial radius search near Thoubal (24.63, 94.01)
    nearby_res = await client.get(
        "/api/farms/nearby?lat=24.63&lon=94.01&radius_km=10.0",
        headers=headers
    )
    assert nearby_res.status_code == 200
    nearby_list = nearby_res.json()
    assert len(nearby_list) >= 1
    assert nearby_list[0]["distance_km"] <= 10.0


@pytest.mark.asyncio
async def test_crop_registration_and_harvest_forecast(client: AsyncClient, farmer_token: str):
    headers = {"Authorization": f"Bearer {farmer_token}"}

    # 1. Get farmer's farm
    farms_res = await client.get("/api/farms", headers=headers)
    farm_id = farms_res.json()[0]["id"]

    # 2. Register Queen pineapple planting stand
    crop_res = await client.post("/api/crops", json={
        "farm_id": farm_id,
        "crop_type": "pineapple",
        "variety": "queen",
        "planting_date": (date.today() - timedelta(days=470)).isoformat(),
        "current_stage": "color_break",
        "estimated_plant_count": 25000
    }, headers=headers)
    assert crop_res.status_code == 201
    crop_id = crop_res.json()["id"]

    # 3. Request Module B Harvest Readiness & Downpour Risk Alert
    forecast_res = await client.get(
        f"/api/crops/{crop_id}/forecast?target_brix=14.5&simulated_rainfall_mm=65.0",
        headers=headers
    )
    assert forecast_res.status_code == 200
    data = forecast_res.json()
    assert data["crop_id"] == crop_id
    assert data["weather_risk_level"] == "high"
    assert "Downpour alert" in data["weather_advisory"]
    assert data["estimated_brix"] >= 14.0
