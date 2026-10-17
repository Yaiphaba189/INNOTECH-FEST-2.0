from typing import Dict, Any, List


def calculate_net_returns(
    gross_rate: float,
    lot_weight_kg: float,
    distance_km: float = 35.0,
    handling_per_kg: float = 0.80,
    platform_fee_pct: float = 0.015,
    payment_terms_days: int = 0
) -> Dict[str, Any]:
    """
    Computes transparent net-returns pricing per kg and total farmer take-home pay,
    eliminating hidden middlemen deductions.
    """
    # Shared freight cost based on consolidated transport distance
    # Between ₹1.80 to ₹3.20/kg for Manipur regional corridors
    if distance_km <= 20.0:
        unit_freight = 1.80
    elif distance_km <= 50.0:
        unit_freight = round(1.80 + ((distance_km - 20.0) / 30.0) * (3.00 - 1.80), 2)
    else:
        unit_freight = 3.20

    unit_handling = round(handling_per_kg, 2)
    unit_platform_fee = round(gross_rate * platform_fee_pct, 2)
    total_deductions_per_kg = round(unit_freight + unit_handling + unit_platform_fee, 2)
    net_rate_per_kg = round(max(0.0, gross_rate - total_deductions_per_kg), 2)
    total_farmer_take_home = round(net_rate_per_kg * lot_weight_kg, 2)

    return {
        "gross_rate": round(gross_rate, 2),
        "freight_deduction": unit_freight,
        "handling_deduction": unit_handling,
        "platform_fee": unit_platform_fee,
        "total_deductions_per_kg": total_deductions_per_kg,
        "net_rate": net_rate_per_kg,
        "total_take_home": total_farmer_take_home,
        "distance_km": round(distance_km, 1)
    }


def score_buyer_order(
    net_rate: float,
    distance_km: float,
    payment_terms_days: int,
    is_exact_grade_match: bool,
    max_market_net: float = 30.0
) -> float:
    """
    Multi-criteria buyer ranking utility function:
    Match Score = 0.50*S_net + 0.20*S_dist + 0.20*S_pay + 0.10*S_grade
    """
    # S_net: normalized net rate
    s_net = min(1.0, max(0.0, net_rate / max_market_net))
    
    # S_dist: normalized proximity (closer is better, max 100km)
    s_dist = max(0.0, 1.0 - (distance_km / 100.0))
    
    # S_pay: payment immediacy (0 days=1.0, 7 days=0.7, 14 days=0.3)
    if payment_terms_days == 0:
        s_pay = 1.0
    elif payment_terms_days <= 7:
        s_pay = 0.7
    else:
        s_pay = 0.3
        
    # S_grade: exact quality match
    s_grade = 1.0 if is_exact_grade_match else 0.6

    score = (0.50 * s_net) + (0.20 * s_dist) + (0.20 * s_pay) + (0.10 * s_grade)
    return round(score, 3)
