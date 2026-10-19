import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from app.main import app
from app.services.llm_service import LLMService


@pytest.mark.asyncio
async def test_ai_status_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/ai/status")
        assert response.status_code == 200
        data = response.json()
        assert "primary_model" in data
        assert "available_models" in data
        assert len(data["available_models"]) >= 1


@pytest.mark.asyncio
async def test_ai_models_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/ai/models")
        assert response.status_code == 200
        data = response.json()
        assert "recommended_free_models" in data
        models = [m["id"] for m in data["recommended_free_models"]]
        assert "meta-llama/llama-3.3-70b-instruct:free" in models


@pytest.mark.asyncio
async def test_ai_advisor_expert_fallback_disease():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "prompt": "How to treat leaf rot in Khousabung pineapple stand?",
            "query_type": "disease_triage",
            "crop": "pineapple",
            "context": {
                "disease_name": "Heart Rot (Phytophthora)",
                "confidence": 0.94,
            },
            "include_manipuri": True,
        }
        response = await client.post("/api/ai/advisor", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["source"] in ("openrouter", "expert_fallback")
        assert len(data["actionable_steps"]) > 0
        assert data["urgency"] in ("high", "critical", "medium")
        assert data["manipuri_summary"] is not None
        assert "Trichoderma" in " ".join(data["actionable_steps"]) or "Trichoderma" in data["response"]


@pytest.mark.asyncio
async def test_ai_advisor_expert_fallback_harvest():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "prompt": "Should I harvest before tomorrow's rain?",
            "query_type": "harvest_decision",
            "crop": "pineapple",
            "context": {
                "rain_mm": 65.0,
                "brix": 14.8,
                "cost_of_waiting_rupees": 14250.0,
                "best_buyer": "Manipur Fresh Canning Ltd",
                "net_rate": 28.50,
            },
            "include_manipuri": True,
        }
        response = await client.post("/api/ai/advisor", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["urgency"] == "critical"
        assert "14.8" in data["response"]
        assert len(data["actionable_steps"]) > 0


@pytest.mark.asyncio
async def test_ai_advisor_caching_efficiency():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "prompt": "Explain Shapley fair freight pooling for remote Churachandpur farmers",
            "query_type": "market_negotiation",
            "crop": "pineapple",
            "context": {"freight_solo": 4.80, "freight_shapley": 2.75},
        }
        # First query: populates cache
        r1 = await client.post("/api/ai/advisor", json=payload)
        assert r1.status_code == 200
        # Second identical query: must hit in-memory cache
        r2 = await client.post("/api/ai/advisor", json=payload)
        assert r2.status_code == 200
        data2 = r2.json()
        assert data2["cached"] is True


@pytest.mark.asyncio
async def test_ai_advisor_openrouter_mock_success(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.OPENROUTER_API_KEY", "test-key-openrouter-free")
    mock_llm_response = (
        "Summary: The pineapple stand in Khousabung displays acute Phytophthora symptoms.\n"
        "Immediate Action Steps:\n"
        "1. Dig 30cm contour interceptor trenches\n"
        "2. Spray Trichoderma viride bio-fungicide @ 10g/L\n"
        "3. Quarantine infected slips\n"
        "Economic & Risk Impact: Saves ₹12,000 in yield loss\n"
        "Meiteilon Note: Nongju matamda thuna chengkhat-u."
    )

    with patch.object(LLMService, "_call_openrouter", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = mock_llm_response
        result = await LLMService.generate_advice(
            prompt="Test prompt",
            query_type="disease_triage",
            crop="pineapple",
            context={"disease_name": "Heart Rot", "confidence": 0.95},
        )
        assert result["source"] == "openrouter"
        assert len(result["actionable_steps"]) == 3
        assert "30cm contour" in result["actionable_steps"][0]
