"""Rain-to-Rupee: the rupee cost of waiting out a downpour instead of harvesting now.

Deterministic and explainable. Mirrors frontend/src/lib/decision.ts.
- Rain below 20 mm: no sugar dilution.
- 20-50 mm: linear ramp to 2.0 Brix loss; 50 mm and above: 2.0-2.5 Brix loss (capped at 2.5).
- Grade A needs >= 14.0 Brix, Grade B >= 12.0; Grade B sells at 75% of the Grade A net rate.
- Waiting through a downpour also loses ~5% of fruit to water-blister rot.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

GRADE_A_MIN_BRIX = 14.0
GRADE_B_MIN_BRIX = 12.0
GRADE_B_PRICE_FACTOR = 0.75
WAIT_SPOILAGE_PCT = 0.05
HAUL_BUFFER_HOURS = 6.0

FORMULA = (
    "Rain >= 50 mm dilutes sugar by 2.0-2.5 Brix (none below 20 mm). Grade A needs >= 14.0 Brix, "
    "Grade B >= 12.0 sells at 75% of the Grade A net rate, and ~5% of fruit is lost to blister rot."
)


def brix_drop_for_rain(rain_mm: float) -> float:
    if rain_mm < 20.0:
        return 0.0
    if rain_mm < 50.0:
        return round((rain_mm - 20.0) / 30.0 * 2.0, 2)
    return round(2.0 + min(0.5, (rain_mm - 50.0) / 30.0), 2)


def grade_for_brix(brix: float) -> str:
    if brix >= GRADE_A_MIN_BRIX:
        return "grade_a"
    if brix >= GRADE_B_MIN_BRIX:
        return "grade_b"
    return "grade_c"


def compute_cost_of_waiting(
    brix_now: float,
    lot_kg: float,
    net_rate_grade_a: float,
    rain_mm: float,
    rain_eta_hours: float,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    now = now or datetime.now(timezone.utc)
    drop = brix_drop_for_rain(rain_mm)
    brix_if_wait = round(brix_now - drop, 2)
    grade_now = grade_for_brix(brix_now)
    grade_if_wait = grade_for_brix(brix_if_wait)

    net_if_wait = net_rate_grade_a if grade_if_wait == "grade_a" else round(net_rate_grade_a * GRADE_B_PRICE_FACTOR, 2)
    kg_if_wait = lot_kg * (1.0 - WAIT_SPOILAGE_PCT) if drop > 0 else lot_kg

    rupees_now = round(net_rate_grade_a * lot_kg)
    rupees_if_wait = round(net_if_wait * kg_if_wait)
    hours_left = max(0.0, rain_eta_hours - HAUL_BUFFER_HOURS)

    return {
        "rain_mm": rain_mm,
        "hours_left": hours_left,
        "harvest_by": (now + timedelta(hours=hours_left)).isoformat(),
        "brix_now": brix_now,
        "brix_if_wait": brix_if_wait,
        "brix_drop": drop,
        "grade_now": grade_now,
        "grade_if_wait": grade_if_wait,
        "net_rate_now": net_rate_grade_a,
        "net_rate_if_wait": net_if_wait,
        "rupees_now": rupees_now,
        "rupees_if_wait": rupees_if_wait,
        "rupees_at_risk": max(0, rupees_now - rupees_if_wait),
        "urgent": drop > 0,
        "formula": FORMULA,
    }
