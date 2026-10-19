from intelligence_layer.module_b_harvest.weather_risk.cost_of_waiting import (
    brix_drop_for_rain,
    compute_cost_of_waiting,
)
from intelligence_layer.module_c_pricing.net_returns.geo_baseline import (
    advantage_vs_broker,
    broker_net_rate,
    road_distance_km,
)


def test_no_loss_below_threshold():
    assert brix_drop_for_rain(10) == 0.0
    r = compute_cost_of_waiting(14.8, 450, 28.5, 10, 30)
    assert not r["urgent"] and r["rupees_at_risk"] == 0


def test_demo_storm_downgrades_grade_and_costs_rupees():
    r = compute_cost_of_waiting(14.8, 450, 28.5, 65, 41)
    assert r["brix_drop"] == 2.5
    assert r["brix_if_wait"] == 12.3
    assert (r["grade_now"], r["grade_if_wait"]) == ("grade_a", "grade_b")
    assert r["rupees_now"] == 12825
    assert r["rupees_at_risk"] == r["rupees_now"] - r["rupees_if_wait"] > 0
    assert r["hours_left"] == 35


def test_drop_is_monotonic_and_capped():
    drops = [brix_drop_for_rain(mm) for mm in range(0, 200, 5)]
    assert drops == sorted(drops)
    assert max(drops) == 2.5


def test_broker_baseline_gap_differs_per_net_rate():
    assert broker_net_rate() == 23.25
    assert advantage_vs_broker(28.5)[0] == 5.25
    assert advantage_vs_broker(26.1)[0] == 2.85


def test_road_distance_uses_coordinates_and_falls_back():
    far = road_distance_km(24.7523, 94.0418, "Guwahati Cargo Hub")
    near = road_distance_km(24.7523, 94.0418, "Imphal East (Nilakuthi)")
    assert far > 300 > near > 5
    assert road_distance_km(None, None, "Imphal West") == 38.0
    assert road_distance_km(24.75, 94.04, "Unknown Hub") == 38.0
