"""Transparent Net-Return pricing formulation for smallholder farmers in Manipur.

Eliminates deceptive middleman deductions by computing exact take-home pay before deal acceptance:
Net Return = Gross Rate - Unit Freight - Handling/Crates - Platform Fee.
Supports Pineapple, Rice (Chak-hao & white rice), Orange (Tamenglong mandarin), and high-value crops.
"""

from __future__ import annotations

from typing import Any, Dict

# Regional handling and packaging costs per kg in Manipur
CROP_HANDLING_RATES = {
    "pineapple": 0.80,          # Plastic crate rentals and washing (₹0.80/kg)
    "queen": 0.80,
    "kew": 0.80,
    "rice": 0.50,              # Standard gunny / woven poly bags (₹0.50/kg)
    "white_rice": 0.50,
    "meitei_phou": 0.50,
    "chak_hao": 1.20,          # Specialized moisture-barrier / vacuum jute bags for GI black rice (₹1.20/kg)
    "orange": 1.40,            # Corrugated telescopic cartons with ventilation dividers (₹1.40/kg)
    "tamenglong_mandarin": 1.40,
    "chilli": 2.50,            # High-grade aerated punnets for Umorok king chilli (₹2.50/kg)
    "umorok": 2.50
}

DEFAULT_HANDLING_PER_KG = 0.80
DEFAULT_PLATFORM_FEE_PCT = 0.015  # 1.5% sustainability protocol fee

# Market benchmark gross prices per kg in Manipur
CROP_BENCHMARKS = {
    "pineapple": 30.0,
    "queen": 30.0,
    "kew": 28.0,
    "chak_hao": 150.0,
    "rice": 40.0,
    "white_rice": 40.0,
    "meitei_phou": 42.0,
    "orange": 60.0,
    "tamenglong_mandarin": 65.0,
    "chilli": 350.0,
    "umorok": 350.0
}


def calculate_freight_deduction(distance_km: float, terrain_corridor: str = "valley") -> float:
    """
    Computes shared freight rate per kg based on regional Manipur transit corridors.
    Consolidated truck pooling keeps freight between ₹1.80 and ₹4.20/kg.
    """
    corridor_lower = terrain_corridor.lower().strip()
    is_hill = corridor_lower in ("hill", "high_hill", "tamenglong", "churachandpur", "senapati", "ukhrul")

    if is_hill:
        if distance_km <= 20.0:
            return 2.40
        elif distance_km <= 50.0:
            return round(2.40 + ((distance_km - 20.0) / 30.0) * (3.60 - 2.40), 2)
        return 4.20
    else:  # Valley corridor (Thoubal, Bishnupur, Imphal, Kakching)
        if distance_km <= 20.0:
            return 1.80
        elif distance_km <= 50.0:
            return round(1.80 + ((distance_km - 20.0) / 30.0) * (3.00 - 1.80), 2)
        return 3.20


def compute_net_returns(
    gross_rate: float,
    lot_weight_kg: float,
    distance_km: float = 35.0,
    handling_per_kg: float | None = None,
    platform_fee_pct: float = DEFAULT_PLATFORM_FEE_PCT,
    payment_terms_days: int = 0,
    crop: str = "pineapple",
    terrain_corridor: str = "valley"
) -> Dict[str, Any]:
    """
    Computes itemized deductions, true net realized rate per kg, and guaranteed farmer payout.
    Accommodates crop-specific packaging requirements and transit corridors.
    """
    crop_clean = crop.lower().strip()
    if handling_per_kg is None:
        unit_handling = CROP_HANDLING_RATES.get(crop_clean, DEFAULT_HANDLING_PER_KG)
    else:
        unit_handling = round(handling_per_kg, 2)

    unit_freight = calculate_freight_deduction(distance_km, terrain_corridor=terrain_corridor)
    unit_platform_fee = round(gross_rate * platform_fee_pct, 2)

    total_deductions_per_kg = round(unit_freight + unit_handling + unit_platform_fee, 2)
    net_rate_per_kg = round(max(0.0, gross_rate - total_deductions_per_kg), 2)
    total_farmer_take_home = round(net_rate_per_kg * lot_weight_kg, 2)

    # Traditional middleman deductions baseline (typically 18-25% of gross rate or high flat fee)
    traditional_deductions = round(unit_freight * 1.8 + unit_handling * 1.5 + (gross_rate * 0.05), 2)
    traditional_net_rate = max(0.0, round(gross_rate - traditional_deductions, 2))
    savings_vs_traditional = round((net_rate_per_kg - traditional_net_rate) * lot_weight_kg, 2)

    return {
        "crop": crop_clean,
        "terrain_corridor": terrain_corridor,
        "gross_rate": round(gross_rate, 2),
        "freight_deduction": unit_freight,
        "handling_deduction": unit_handling,
        "platform_fee": unit_platform_fee,
        "total_deductions_per_kg": total_deductions_per_kg,
        "net_rate": net_rate_per_kg,
        "total_take_home": total_farmer_take_home,
        "lot_weight_kg": lot_weight_kg,
        "distance_km": round(distance_km, 1),
        "payment_terms_days": payment_terms_days,
        "savings_vs_middlemen_total": max(0.0, savings_vs_traditional)
    }

