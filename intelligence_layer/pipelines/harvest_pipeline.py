"""Unified harvest forecasting pipeline connecting Module B phenology and risk engines."""

from __future__ import annotations

from datetime import date
from typing import Any, Dict

from intelligence_layer.module_b_harvest.phenology.gdd_calculator import compute_harvest_timeline
from intelligence_layer.module_b_harvest.weather_risk.risk_synthesis import evaluate_weather_risk


def calculate_harvest_forecast(
    crop_variety: str,
    planting_date: date,
    current_stage: str = "vegetative",
    elevation_meters: int = 800,
    rainfall_forecast_48h_mm: float = 65.0,
    target_brix: float = 14.5,
    district: str = "Churachandpur"
) -> Dict[str, Any]:
    """
    Unified harvest readiness assessment:
    1. Computes thermal units (GDD) accumulated since planting and stage progression.
    2. Determines optimal harvest window and estimated Brix sweetness.
    3. Synthesizes 48-hour meteorological risk and triggers urgent pre-downpour alerts.
    """
    # 1 & 2. Phenological progression and GDD
    timeline = compute_harvest_timeline(
        crop_variety=crop_variety,
        planting_date=planting_date,
        elevation_meters=elevation_meters
    )

    stage = timeline["current_stage"]

    # 3. Weather risk synthesis
    weather_eval = evaluate_weather_risk(
        current_stage=stage,
        rainfall_forecast_48h_mm=rainfall_forecast_48h_mm,
        district=district,
        crop_type=timeline.get("crop", "pineapple")
    )

    return {
        "crop": timeline.get("crop", "pineapple"),
        "crop_variety": crop_variety,
        "current_stage": stage,
        "stage_description": timeline["stage_description"],
        "days_in_field": timeline["days_in_field"],
        "gdd_accumulated": timeline["gdd_accumulated"],
        "target_gdd": timeline["target_gdd"],
        "optimal_harvest_start": timeline["optimal_harvest_start"],
        "optimal_harvest_end": timeline["optimal_harvest_end"],
        "estimated_brix": timeline["estimated_brix"],
        "metric_name": timeline.get("metric_name", "estimated_brix"),
        "metric_value": timeline.get("metric_value", timeline["estimated_brix"]),
        "days_to_maturity": timeline["days_to_maturity"],
        "weather_risk_level": weather_eval["risk_level"],
        "weather_action_code": weather_eval["action_code"],
        "weather_advisory": weather_eval["advisory"],
        "rainfall_forecast_48h_mm": rainfall_forecast_48h_mm,
        "urgent_harvest_recommended": weather_eval["urgent_harvest_recommended"],
        "district": district
    }
