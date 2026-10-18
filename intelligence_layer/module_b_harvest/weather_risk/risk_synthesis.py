"""Meteorological risk synthesis algorithm for harvest timing in Manipur.

Synthesizes:
- Phenological vulnerability (Color-Break, Mature vs Vegetative).
- 48-hour forecasted precipitation volume.
- Downpour alerts to prevent post-harvest sugar dilution, cracking, and rot.
"""

from __future__ import annotations

from typing import Any, Dict


def evaluate_weather_risk(
    current_stage: str,
    rainfall_forecast_48h_mm: float,
    district: str = "Churachandpur",
    crop_type: str = "pineapple"
) -> Dict[str, Any]:
    """
    Evaluates meteorological risk against crop developmental stage.
    Triggers urgent harvest protocol when mature stands face critical monsoon downpours.
    Supports Pineapple, Rice (Chak-hao & white rice), and Orange (Tamenglong mandarin).
    """
    crop_lower = crop_type.lower().strip()
    stage_lower = current_stage.lower().strip()

    # Determine stage vulnerability per crop
    if crop_lower == "rice":
        is_vulnerable = stage_lower in ("milking_dough", "mature")
        critical_rain_threshold = 40.0
        moderate_rain_threshold = 20.0
    elif crop_lower == "orange":
        is_vulnerable = stage_lower in ("color_break", "mature")
        critical_rain_threshold = 45.0
        moderate_rain_threshold = 20.0
    elif crop_lower == "chilli":
        is_vulnerable = stage_lower in ("color_break", "mature", "flowering_bud")
        critical_rain_threshold = 35.0
        moderate_rain_threshold = 18.0
    else:  # pineapple / default
        is_vulnerable = stage_lower in ("color_break", "mature")
        critical_rain_threshold = 50.0
        moderate_rain_threshold = 20.0

    if is_vulnerable:
        if rainfall_forecast_48h_mm >= critical_rain_threshold:
            risk_level = "high"
            urgent_harvest_recommended = True
            if crop_lower == "rice":
                action_code = "URGENT_PRE_LODGING_HARVEST"
                advisory = (
                    f"Downpour alert ({rainfall_forecast_48h_mm:.1f}mm in 48h for {district}). "
                    "Mature grain stands face severe risk of lodging in standing water, pre-harvest panicle sprouting, "
                    "and black mold discoloration. Open field perimeter drainage channels and accelerate immediate harvest."
                )
            elif crop_lower == "orange":
                action_code = "URGENT_CITRUS_PICKING"
                advisory = (
                    f"Downpour alert ({rainfall_forecast_48h_mm:.1f}mm in 48h for {district}). "
                    "Mature Tamenglong mandarin orchards face high risk of peel splitting, hydrostatic fruit drop, "
                    "and Phytophthora brown rot. Complete picking and crate packing within 48 hours."
                )
            elif crop_lower == "chilli":
                action_code = "URGENT_CHILLI_PICKING"
                advisory = (
                    f"Downpour alert ({rainfall_forecast_48h_mm:.1f}mm in 48h for {district}). "
                    "Ripe Umorok chilli pods face extreme risk of anthracnose fruit rot, water-spotting, "
                    "and pedicel detachment. Harvest all breaker/mature pods immediately and shelter indoors."
                )
            else:
                action_code = "URGENT_PRE_DOWNPOUR_HARVEST"
                advisory = (
                    f"Downpour alert ({rainfall_forecast_48h_mm:.1f}mm in 48h for {district}). "
                    "Immediate harvest recommended within 48 hours to prevent sugar dilution (up to 2.5 Brix loss) "
                    "and waterlogged fruit cracking. Connect to FPO truck run immediately."
                )

        elif rainfall_forecast_48h_mm >= moderate_rain_threshold:
            risk_level = "moderate"
            urgent_harvest_recommended = False
            action_code = "MONITOR_DRAINAGE_AND_CRATES"
            advisory = (
                f"Moderate rainfall alert ({rainfall_forecast_48h_mm:.1f}mm in 48h). "
                "Inspect field drainage channels and stage transport crates/bags for rapid mobilization."
            )
        else:
            risk_level = "low"
            urgent_harvest_recommended = False
            action_code = "STANDARD_HARVEST_SCHEDULE"
            advisory = "Favorable weather conditions. Proceed with regular phased harvest schedule."
    else:
        if rainfall_forecast_48h_mm >= 100.0:
            risk_level = "moderate"
            action_code = "DRAINAGE_CHECK"
            advisory = (
                f"Heavy rain forecast ({rainfall_forecast_48h_mm:.1f}mm). Stand is in vegetative expansion; "
                "ensure drainage channels are cleared to prevent root waterlogging."
            )
            urgent_harvest_recommended = False
        else:
            risk_level = "low"
            action_code = "FAVORABLE_GROWTH_CONDITIONS"
            advisory = (
                f"Favorable conditions. Forecasted rain ({rainfall_forecast_48h_mm:.1f}mm) supports "
                "healthy crop vegetative development."
            )
            urgent_harvest_recommended = False

    return {
        "risk_level": risk_level,
        "action_code": action_code,
        "advisory": advisory,
        "rainfall_forecast_48h_mm": rainfall_forecast_48h_mm,
        "urgent_harvest_recommended": urgent_harvest_recommended,
        "is_stage_vulnerable": is_vulnerable,
        "district": district
    }
