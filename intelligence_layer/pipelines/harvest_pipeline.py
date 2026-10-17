from datetime import date, timedelta
from typing import Dict, Any


def calculate_harvest_forecast(
    crop_variety: str,
    planting_date: date,
    current_stage: str,
    elevation_meters: int = 800,
    rainfall_forecast_48h_mm: float = 65.0,
    target_brix: float = 14.5
) -> Dict[str, Any]:
    """
    Calculates phenological development, GDD thermal units, optimal harvest window,
    sugar content (Brix), and 48-hour monsoon weather risk alert.
    """
    today = date.today()
    days_in_field = max(1, (today - planting_date).days)

    # Base temperature T_base = 16.0 C for pineapple
    # Average daily temperature in Manipur mid-altitude ~ 22.5 C (so ~6.5 GDD/day during active growth)
    daily_gdd_rate = 6.2 if elevation_meters > 1000 else 6.8
    gdd_accumulated = round(days_in_field * daily_gdd_rate, 1)

    # Determine stage progression and optimal harvest window
    # Queen lifecycle target is ~470-490 days, Kew is ~500-530 days
    maturity_target_days = 480 if crop_variety.lower() == "queen" else 520
    days_to_maturity = maturity_target_days - days_in_field

    if days_to_maturity <= 0:
        optimal_start = today
        optimal_end = today + timedelta(days=5)
        estimated_brix = 15.2
    elif days_to_maturity <= 15:
        optimal_start = today + timedelta(days=days_to_maturity)
        optimal_end = optimal_start + timedelta(days=6)
        estimated_brix = 14.6
    else:
        optimal_start = today + timedelta(days=days_to_maturity)
        optimal_end = optimal_start + timedelta(days=7)
        estimated_brix = max(9.0, round(10.0 + (days_in_field / maturity_target_days) * 4.5, 1))

    # Stage auto-progression if needed
    stage = current_stage
    if days_in_field >= 480:
        stage = "mature"
    elif days_in_field >= 455:
        stage = "color_break"
    elif days_in_field >= 400:
        stage = "fruit_development"
    elif days_in_field >= 360:
        stage = "inflorescence"

    # Meteorological Risk Synthesis (Part 2 Section 3.3)
    is_vulnerable_stage = stage in ["color_break", "mature"]
    if is_vulnerable_stage:
        if rainfall_forecast_48h_mm >= 50.0:
            weather_risk_level = "high"
            weather_advisory = (
                f"Downpour alert ({rainfall_forecast_48h_mm}mm in 48h). Harvest within 48 hours to prevent "
                "sugar dilution and waterlogging. Connect to FPO truck immediately."
            )
        elif rainfall_forecast_48h_mm >= 20.0:
            weather_risk_level = "moderate"
            weather_advisory = (
                f"Forecast rainfall ({rainfall_forecast_48h_mm}mm). Monitor field drainage and prepare crates."
            )
        else:
            weather_risk_level = "low"
            weather_advisory = "Favorable weather. Standard harvest schedule recommended."
    else:
        weather_risk_level = "low"
        weather_advisory = f"Vegetative/fruit expansion phase. Forecast rain ({rainfall_forecast_48h_mm}mm) supports crop development."

    return {
        "current_stage": stage,
        "days_in_field": days_in_field,
        "gdd_accumulated": gdd_accumulated,
        "optimal_harvest_start": optimal_start.isoformat(),
        "optimal_harvest_end": optimal_end.isoformat(),
        "estimated_brix": estimated_brix,
        "weather_risk_level": weather_risk_level,
        "weather_advisory": weather_advisory,
        "rainfall_forecast_48h_mm": rainfall_forecast_48h_mm
    }
