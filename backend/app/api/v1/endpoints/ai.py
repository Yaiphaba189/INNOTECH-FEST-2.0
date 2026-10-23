"""API Endpoints for OpenRouter Free LLM Agronomic & Decision Intelligence."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services.llm_service import LLMService

router = APIRouter(prefix="/ai", tags=["AI Copilot & OpenRouter LLM"])


class AIAdvisorRequest(BaseModel):
    prompt: str = Field(..., description="Farmer or FPO question or advisory prompt")
    query_type: str = Field(
        "general_copilot",
        description="disease_triage, harvest_decision, market_negotiation, general_copilot"
    )
    crop: str = Field("pineapple", description="pineapple, rice, citrus, or general")
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Telemetry context such as disease diagnosis, brix, rain_mm, buyer rate, cost of waiting"
    )
    include_manipuri: bool = Field(True, description="Include romanized Manipuri (Meiteilon) summary")
    preferred_model: Optional[str] = Field(
        None,
        description="Optional override for OpenRouter free model (e.g. meta-llama/llama-3.3-70b-instruct:free)"
    )


class AIAdvisorResponse(BaseModel):
    source: str = Field(..., description="'openrouter' or 'expert_fallback'")
    model: str = Field(..., description="LLM model identifier used for response")
    response: str = Field(..., description="Comprehensive agronomic or economic advisory")
    actionable_steps: List[str] = Field(default_factory=list, description="Immediate practical steps for farmer")
    urgency: str = Field("medium", description="low, medium, high, critical")
    manipuri_summary: Optional[str] = Field(None, description="Localized Manipuri summary")
    cached: bool = Field(False, description="True if served instantly from in-memory TTL cache")


class AIStatusResponse(BaseModel):
    openrouter_configured: bool
    primary_model: str
    available_models: List[str]
    cache_ttl_seconds: int
    environment: str


@router.get("/status", response_model=AIStatusResponse)
async def get_ai_status():
    """Returns the operational status of OpenRouter Free LLM and agronomic engines."""
    return AIStatusResponse(
        openrouter_configured=bool(settings.OPENROUTER_API_KEY.strip()),
        primary_model=settings.OPENROUTER_MODEL,
        available_models=LLMService.get_configured_models(),
        cache_ttl_seconds=settings.LLM_CACHE_TTL_SECONDS,
        environment=settings.ENVIRONMENT,
    )


@router.get("/models")
async def list_free_models():
    """Lists recommended free-tier models on OpenRouter."""
    return {
        "primary": settings.OPENROUTER_MODEL,
        "recommended_free_models": [
            {
                "id": "meta-llama/llama-3.3-70b-instruct:free",
                "name": "Llama 3.3 70B Instruct (Free)",
                "provider": "Meta via OpenRouter",
                "context_length": 131072,
                "best_for": "Complex agronomic reasoning and disease protocol formulation",
            },
            {
                "id": "mistralai/mistral-7b-instruct:free",
                "name": "Mistral 7B Instruct (Free)",
                "provider": "Mistral via OpenRouter",
                "context_length": 32768,
                "best_for": "Lightweight and resilient fallback",
            },
            {
                "id": "deepseek/deepseek-r1:free",
                "name": "DeepSeek R1 (Free)",
                "provider": "DeepSeek via OpenRouter",
                "context_length": 65536,
                "best_for": "Chain-of-thought economic and Shapley dividend calculations",
            },
        ],
    }


@router.post("/advisor", response_model=AIAdvisorResponse, status_code=status.HTTP_200_OK)
async def query_ai_advisor(payload: AIAdvisorRequest):
    """
    Query the HARVESTLINK AI Agronomic & Decision Copilot.
    Powered by OpenRouter Free LLMs with zero-latency caching and guaranteed ICAR/CAU expert fallback.
    """
    result = await LLMService.generate_advice(
        prompt=payload.prompt,
        query_type=payload.query_type,
        crop=payload.crop,
        context=payload.context,
        include_manipuri=payload.include_manipuri,
        preferred_model=payload.preferred_model,
    )
    return AIAdvisorResponse(**result)
