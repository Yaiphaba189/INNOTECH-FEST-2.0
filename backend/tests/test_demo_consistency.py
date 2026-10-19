import pytest
from datetime import date, timedelta
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_decision_numbers_trace_back_to_the_best_match(client: AsyncClient, farmer_token: str):
    headers = {"Authorization": f"Bearer {farmer_token}"}
    today = date.today()
    lot_res = await client.post("/api/lots", json={
        "crop_record_id": "crop-queen-tombi-001",
        "quantity_kg": 450.0,
        "quality_grade": "grade_a",
        "brix_reading": 14.8,
        "harvest_window_start": today.isoformat(),
        "harvest_window_end": (today + timedelta(days=4)).isoformat(),
    }, headers=headers)
    assert lot_res.status_code == 201, lot_res.text
    lot_id = lot_res.json()["id"]

    res = await client.get(f"/api/lots/{lot_id}/decision", params={"demo_storm": "true"}, headers=headers)
    assert res.status_code == 200, res.text
    body = res.json()
    best, decision = body["best_match"], body["decision"]

    # Header net price, rupees now and the best buyer card are the same number.
    assert decision["net_rate_now"] == best["net_rate"]
    assert decision["rupees_now"] == round(best["net_rate"] * body["lot_kg"])
    assert decision["rupees_at_risk"] == decision["rupees_now"] - decision["rupees_if_wait"] > 0
    assert body["rain"]["source"] == "demo" and decision["rain_mm"] == body["rain"]["rain_mm"]

    # Every buyer's advantage is measured against the one shared broker baseline.
    matches = (await client.get(f"/api/lots/{lot_id}/matches", headers=headers)).json()
    for m in matches:
        assert m["advantage_vs_broker"] == round(m["net_rate"] - m["broker_net_rate"], 2)
        assert m["distance_km"] > 0
    assert best["net_rate"] == max(m["net_rate"] for m in matches)


@pytest.mark.asyncio
async def test_weather_falls_back_to_cache_then_unavailable(client: AsyncClient, farmer_token: str, monkeypatch):
    from app.services.weather_service import WeatherService
    from app.db.session import get_db

    calls = {"n": 0}

    async def fake_ok(lat, lng):
        calls["n"] += 1
        return 31.5, 12.0

    async def fake_down(lat, lng):
        raise RuntimeError("offline")

    async for db in get_db():
        monkeypatch.setattr(WeatherService, "_fetch_open_meteo", staticmethod(fake_ok))
        live = await WeatherService.get_rain_outlook(db, 24.75, 94.04)
        assert live["source"] == "live" and live["rain_mm"] == 31.5

        monkeypatch.setattr(WeatherService, "_fetch_open_meteo", staticmethod(fake_down))
        cached = await WeatherService.get_rain_outlook(db, 24.75, 94.04)
        assert cached["source"] == "cached" and cached["rain_mm"] == 31.5

        nothing = await WeatherService.get_rain_outlook(db, 10.0, 10.0)
        assert nothing["source"] == "unavailable"
        break
