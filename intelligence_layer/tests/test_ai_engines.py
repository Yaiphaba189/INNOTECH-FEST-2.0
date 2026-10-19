"""Comprehensive unit test suite for HARVESTLINK AI intelligence layer (Member 1).

Covers all 4 modules:
- Module A: Vision preprocessing, triage rules, temperature scaling, and remedies.
- Module B: GDD thermal accumulation, phenological stages, and 48h downpour alerts.
- Module C: Transparent net-return deductions and multi-criteria buyer ranking.
- Module D: CVRPTW solver, 75% vehicle payload saturation constraint, and QR gate-pass.
"""

from __future__ import annotations

import io
from datetime import date, timedelta
import pytest
from PIL import Image

from intelligence_layer.pipelines.disease_pipeline import predict_crop_disease, DISEASE_REMEDIES
from intelligence_layer.pipelines.harvest_pipeline import calculate_harvest_forecast
from intelligence_layer.pipelines.pricing_pipeline import calculate_net_returns, score_buyer_order, match_and_rank_orders
from intelligence_layer.pipelines.logistics_pipeline import solve_cvrp_dispatch
from intelligence_layer.module_a_disease.models.classifier import apply_temperature_scaling
from intelligence_layer.module_a_disease.preprocessing.transforms import validate_image_bytes, preprocess_image
from intelligence_layer.module_a_disease.triage.triage_rules import synthesize_triage
from intelligence_layer.module_b_harvest.phenology.gdd_calculator import calculate_daily_gdd, compute_harvest_timeline
from intelligence_layer.module_b_harvest.weather_risk.risk_synthesis import evaluate_weather_risk


# ─────────────────────────────────────────────────────────────
# MODULE A: DISEASE VISION INTELLIGENCE & TRIAGE
# ─────────────────────────────────────────────────────────────

def _create_sample_jpeg(size=(300, 300), color=(100, 180, 50)) -> bytes:
    img = Image.new("RGB", size, color=color)
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    return buffer.getvalue()


from PIL import ImageDraw

_G, _B, _D, _Y = (60, 140, 40), (140, 90, 40), (25, 20, 20), (225, 200, 60)
_R, _W, _GR = (190, 60, 50), (245, 245, 245), (130, 130, 130)

# Tissue-colour recipes: the analyzer must infer the disease from these pixels alone.
TISSUE = {
    "heart_rot": [(_B, .6), (_G, .4)], "black_rot": [(_D, .6), (_G, .4)],
    "mealybug_wilt": [(_R, .5), (_Y, .2), (_G, .3)],
    "blast": [(_GR, .3), (_B, .3), (_G, .4)],
    "bacterial_leaf_blight": [(_Y, .45), (_B, .2), (_G, .35)],
    "sheath_blight": [(_W, .3), (_B, .3), (_G, .4)] , "tungro": [(_Y, .8), (_G, .2)],
    "citrus_canker": [(_G, .7), (_B, .3)], "citrus_greening_hlb": [(_Y, .6), (_G, .4)],
    "powdery_mildew": [(_W, .55), (_G, .45)], "root_rot": [(_B, .6), (_D, .2), (_G, .2)],
    "anthracnose": [(_D, .5), (_B, .3), (_G, .2)], "leaf_curl": [(_Y, .6), (_G, .4)],
    "bacterial_wilt": [(_Y, .4), (_B, .4), (_G, .2)],
}


def _tissue_jpeg(kind: str) -> bytes:
    img = Image.new("RGB", (224, 224), _W)
    draw = ImageDraw.Draw(img)
    x = 0
    for colour, frac in TISSUE[kind]:
        w = int(224 * frac)
        draw.rectangle([x, 0, x + w, 224], fill=colour)
        x += w
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=95)
    return buffer.getvalue()


def test_image_preprocessing_and_hash():
    img_bytes = _create_sample_jpeg()
    processed_img, sha256_hash = preprocess_image(img_bytes)

    assert processed_img.size == (224, 224)
    assert len(sha256_hash) == 64  # Valid SHA-256


def test_corrupted_image_rejection():
    corrupted_bytes = b"NOT_A_VALID_IMAGE_HEADER"
    with pytest.raises(ValueError, match="IMAGE_CORRUPTED"):
        validate_image_bytes(corrupted_bytes)


def test_temperature_scaling_calibration():
    # Large gap logits
    raw_logits = [4.0, 1.0, 0.5, 0.0]
    calibrated_probs = apply_temperature_scaling(raw_logits, temperature=1.25)

    assert sum(calibrated_probs) == pytest.approx(1.0, abs=0.01)
    assert calibrated_probs[0] > calibrated_probs[1] > calibrated_probs[2] > calibrated_probs[3]
    # Calibration softens overconfidence
    assert calibrated_probs[0] < 0.95


def test_triage_decision_confirmed_screening():
    res = synthesize_triage("heart_rot", confidence_score=0.914)
    assert res["diagnostic_status"] == "confirmed"
    assert res["severity_rating"] == "moderate"
    assert res["refer_to_expert"] is True  # Heart rot is destructive
    assert "Copper Oxychloride" in res["recommended_actions"]["chemical"]
    assert "মপন শাবা" in res["local_name"]


def test_triage_decision_preliminary_alert():
    res = synthesize_triage("mealybug_wilt", confidence_score=0.72)
    assert res["diagnostic_status"] == "preliminary"
    assert "re-scan in 48 hours" in res["triage_action"]


def test_triage_decision_inconclusive():
    res = synthesize_triage("heart_rot", confidence_score=0.42)
    assert res["diagnostic_status"] == "inconclusive"
    assert res["refer_to_expert"] is True


def test_full_disease_pipeline_execution():
    img_bytes = _create_sample_jpeg()
    diag = predict_crop_disease(img_bytes, image_angle="crown", crop="pineapple")

    assert "diagnostic_status" in diag
    assert "confidence_score" in diag
    assert "image_hash_sha256" in diag
    assert diag["confidence_score"] > 0.50
    assert len(diag["image_hash_sha256"]) == 64


# ─────────────────────────────────────────────────────────────
# MODULE B: HARVEST READINESS & WEATHER RISK
# ─────────────────────────────────────────────────────────────

def test_daily_gdd_calculation():
    # T_max=28.0, T_min=18.0, T_avg=23.0 -> GDD = 23.0 - 16.0 = 7.0
    gdd = calculate_daily_gdd(t_max=28.0, t_min=18.0)
    assert gdd == 7.0

    # Sub-baseline temperature (T_max=15.0, T_min=10.0 -> T_avg=12.5 < 16.0 -> 0.0)
    gdd_cold = calculate_daily_gdd(t_max=15.0, t_min=10.0)
    assert gdd_cold == 0.0


def test_phenological_progression_mature():
    planting = date.today() - timedelta(days=485)
    timeline = compute_harvest_timeline("queen", planting_date=planting, elevation_meters=900)

    assert timeline["current_stage"] == "mature"
    assert timeline["estimated_brix"] >= 14.0
    assert timeline["gdd_accumulated"] > 2400.0


def test_weather_risk_critical_downpour():
    eval_res = evaluate_weather_risk(
        current_stage="mature",
        rainfall_forecast_48h_mm=65.0,
        district="Churachandpur"
    )

    assert eval_res["risk_level"] == "high"
    assert eval_res["urgent_harvest_recommended"] is True
    assert eval_res["action_code"] == "URGENT_PRE_DOWNPOUR_HARVEST"
    assert "sugar dilution" in eval_res["advisory"]


def test_weather_risk_vegetative_stage_safe():
    eval_res = evaluate_weather_risk(
        current_stage="vegetative",
        rainfall_forecast_48h_mm=65.0,
        district="Churachandpur"
    )

    assert eval_res["risk_level"] == "low"
    assert eval_res["urgent_harvest_recommended"] is False


def test_full_harvest_forecast_pipeline():
    planting = date.today() - timedelta(days=470)
    forecast = calculate_harvest_forecast(
        crop_variety="queen",
        planting_date=planting,
        elevation_meters=850,
        rainfall_forecast_48h_mm=55.0,
        district="Churachandpur"
    )

    assert forecast["current_stage"] in ("color_break", "mature")
    assert forecast["weather_risk_level"] == "high"
    assert forecast["urgent_harvest_recommended"] is True


# ─────────────────────────────────────────────────────────────
# MODULE C: TRANSPARENT NET RETURNS & BUYER MATCHING
# ─────────────────────────────────────────────────────────────

def test_net_return_itemized_deductions():
    # ₹28.00 gross rate, 450 kg lot, 35 km distance
    returns = calculate_net_returns(
        gross_rate=28.00,
        lot_weight_kg=450.0,
        distance_km=35.0,
        handling_per_kg=0.80,
        platform_fee_pct=0.015
    )

    # Freight for 35km is 1.80 + (15/30)*1.20 = 2.40
    assert returns["freight_deduction"] == 2.40
    assert returns["handling_deduction"] == 0.80
    # Platform fee = 1.5% of 28.00 = 0.42
    assert returns["platform_fee"] == 0.42
    # Total deductions = 2.40 + 0.80 + 0.42 = 3.62
    assert returns["total_deductions_per_kg"] == 3.62
    # Net rate = 28.00 - 3.62 = 24.38
    assert returns["net_rate"] == 24.38
    # Total take-home = 24.38 * 450 = 10,971.00
    assert returns["total_take_home"] == 10971.00


def test_buyer_scoring_prefers_higher_net_and_closer():
    # Close buyer with instant cash payment
    score_high = score_buyer_order(net_rate=25.0, distance_km=15.0, payment_terms_days=0, is_exact_grade_match=True)
    # Far buyer with 14-day credit
    score_low = score_buyer_order(net_rate=22.0, distance_km=85.0, payment_terms_days=14, is_exact_grade_match=False)

    assert score_high > score_low


def test_buyer_orders_ranking():
    lot = {"quantity_kg": 500.0, "quality_grade": "grade_a", "variety": "queen"}
    orders = [
        {"id": "o1", "buyer_name": "Far Buyer", "unit_price_offered": 26.0, "distance_km": 80.0, "payment_terms_days": 14, "target_grade": "grade_a"},
        {"id": "o2", "buyer_name": "Nilakuthi Food Park", "unit_price_offered": 28.0, "distance_km": 30.0, "payment_terms_days": 0, "target_grade": "grade_a"}
    ]
    ranked = match_and_rank_orders(lot, orders)

    assert ranked[0]["order_id"] == "o2"
    assert ranked[0]["financial_breakdown"]["net_rate"] > ranked[1]["financial_breakdown"]["net_rate"]


# ─────────────────────────────────────────────────────────────
# MODULE D: COLLECTIVE LOGISTICS & CAPACITY SOLVER
# ─────────────────────────────────────────────────────────────

def test_logistics_threshold_failure_below_75_percent():
    # 1,200 kg load on a 2,500 kg truck = 48% (fails < 75%)
    small_lots = [
        {"id": "lot-1", "quantity_kg": 600.0, "farm_name": "Farm A"},
        {"id": "lot-2", "quantity_kg": 600.0, "farm_name": "Farm B"}
    ]
    result = solve_cvrp_dispatch(
        cluster_district="Churachandpur",
        vehicle_type="pickup_407",
        destination_hub="Nilakuthi Food Park",
        farm_lots=small_lots,
        enforce_threshold=True
    )

    assert result["success"] is False
    assert result["error_code"] == "CAPACITY_THRESHOLD_FAIL"
    assert result["capacity_fill_pct"] == 48.0


def test_logistics_threshold_success_above_75_percent():
    # 2,050 kg load on a 2,500 kg truck = 82% (passes >= 75%)
    lots = [
        {"id": "lot-1", "quantity_kg": 600.0, "farm_name": "Churachandpur Farm 1"},
        {"id": "lot-2", "quantity_kg": 550.0, "farm_name": "Churachandpur Farm 2"},
        {"id": "lot-3", "quantity_kg": 450.0, "farm_name": "Churachandpur Farm 3"},
        {"id": "lot-4", "quantity_kg": 450.0, "farm_name": "Churachandpur Farm 4"},
    ]
    result = solve_cvrp_dispatch(
        cluster_district="Churachandpur",
        vehicle_type="pickup_407",
        destination_hub="Nilakuthi Food Park",
        farm_lots=lots,
        enforce_threshold=True
    )

    assert result["success"] is True
    assert result["capacity_fill_pct"] == 82.0
    assert result["total_loaded_kg"] == 2050.0
    assert len(result["stops"]) == 4
    # Savings calculation: ₹4.50 solo vs ₹1.85 pooled = ₹2.65/kg savings * 2050kg = ₹5,432.50
    assert result["estimated_savings_total"] == 5432.50
    assert result["digital_gate_pass"].startswith("HL-PASS-2026-")


# ─────────────────────────────────────────────────────────────
# PHASE 2 QUALITY GATES & ACCEPTANCE BENCHMARKS
# ─────────────────────────────────────────────────────────────

def test_evaluation_metrics_and_calibration():
    from intelligence_layer.module_a_disease.evaluation.metrics import (
        compute_classification_metrics,
        compute_expected_calibration_error
    )
    y_true = ["heart_rot"] * 100 + ["black_rot"] * 50 + ["mealybug_wilt"] * 50 + ["healthy"] * 100
    # Simulate high performance classifier matching target specs
    y_pred = ["heart_rot"] * 94 + ["black_rot"] * 6 + ["black_rot"] * 46 + ["mealybug_wilt"] * 4 + ["mealybug_wilt"] * 45 + ["healthy"] * 5 + ["healthy"] * 98 + ["black_rot"] * 2

    metrics = compute_classification_metrics(y_true, y_pred, target_class="heart_rot")
    assert metrics["meets_accuracy_target"] is True
    assert metrics["meets_heart_rot_recall_target"] is True
    assert metrics["target_recall"] >= 0.92
    assert metrics["accuracy"] >= 0.88

    # Calibration error
    confidences = [0.92] * 280 + [0.55] * 20
    accuracies = [True] * 270 + [False] * 30
    ece = compute_expected_calibration_error(confidences, accuracies)
    assert 0.0 <= ece < 0.15


def test_vision_inference_latency_under_800ms():
    """Phase 2 Verification Gate: Vision inference < 800ms on CPU."""
    from intelligence_layer.module_a_disease.evaluation.metrics import benchmark_inference_latency
    sample_jpeg = _create_sample_jpeg(size=(224, 224))
    
    benchmark = benchmark_inference_latency(predict_crop_disease, sample_jpeg, iterations=10)
    assert benchmark["meets_target_under_800ms"] is True
    # Typical execution on modern commodity CPU is < 50ms
    assert benchmark["avg_latency_ms"] < 200.0


def test_logistics_25_farm_cluster_solver_convergence_under_3_seconds():
    """Phase 2 Verification Gate: Solver completes consolidation plans for a 25-farm cluster within 3.0s."""
    import time
    farms_25 = [
        {
            "id": f"lot-{i:03d}",
            "quantity_kg": 250.0 + (i * 10),
            "farm_name": f"Churachandpur Cluster Farm #{i}",
            "farmer_name": f"Farmer #{i}",
            "district": "Churachandpur",
            "quality_grade": "grade_a",
            "variety": "queen"
        }
        for i in range(1, 26)
    ]

    t0 = time.perf_counter()
    result = solve_cvrp_dispatch(
        cluster_district="Churachandpur",
        vehicle_type="medium_truck",
        destination_hub="Nilakuthi Food Park Processing Plant",
        farm_lots=farms_25,
        enforce_threshold=True
    )
    elapsed_seconds = time.perf_counter() - t0

    assert elapsed_seconds < 3.0
    assert result["success"] is True
    assert len(result["stops"]) == 25
    assert result["capacity_fill_pct"] >= 75.0


# ─────────────────────────────────────────────────────────────
# MULTI-CROP INTELLIGENCE: RICE, ORANGE, AND CHILLI
# ─────────────────────────────────────────────────────────────

def test_rice_disease_screening_and_triage():
    """Validates Rice (Chak-hao & white rice) disease screening and Meiteilon triage remedies."""
    sample_jpeg = _create_sample_jpeg(size=(224, 224), color=(60, 140, 40))

    # 1. Rice Blast (Magnaporthe oryzae)
    diag_blast = predict_crop_disease(_tissue_jpeg("blast"), image_angle="leaf_top_blast", crop="rice")
    assert diag_blast["predicted_class"] == "blast"
    assert diag_blast["confidence_score"] >= 0.55  # grey/brown lesions are inherently ambiguous
    assert "চেকপোকপা" in diag_blast["local_name"]
    assert "Magnaporthe oryzae" in diag_blast["scientific_name"]
    assert "Tricyclazole" in diag_blast["recommended_actions"]["chemical"]

    # 2. Bacterial Leaf Blight (Xanthomonas oryzae)
    diag_blb = predict_crop_disease(_tissue_jpeg("bacterial_leaf_blight"), image_angle="margin_bacterial_ooze", crop="rice")
    assert diag_blb["predicted_class"] == "bacterial_leaf_blight"
    assert "নাহা শাবা" in diag_blb["local_name"]
    assert "Streptocycline" in diag_blb["recommended_actions"]["chemical"]

    # 3. Sheath Blight (Rhizoctonia solani)
    diag_sheath = predict_crop_disease(_tissue_jpeg("sheath_blight"), image_angle="sheath_waterline", crop="rice")
    assert diag_sheath["predicted_class"] == "sheath_blight"
    assert "মখোং শাবা" in diag_sheath["local_name"]
    assert "Hexaconazole" in diag_sheath["recommended_actions"]["chemical"]

    # 4. Rice Tungro Virus (RTBV)
    diag_tungro = predict_crop_disease(_tissue_jpeg("tungro"), image_angle="tungro_stunt_yellow", crop="rice")
    assert diag_tungro["predicted_class"] == "tungro"
    assert "অঙাংবা মচিংশিনবা" in diag_tungro["local_name"]
    assert "Thiamethoxam" in diag_tungro["recommended_actions"]["chemical"]


def test_orange_disease_screening_and_triage():
    """Validates Tamenglong Orange disease screening and Meiteilon triage remedies."""
    sample_jpeg = _create_sample_jpeg(size=(224, 224), color=(220, 150, 30))

    # 1. Citrus Canker (Xanthomonas axonopodis)
    diag_canker = predict_crop_disease(_tissue_jpeg("citrus_canker"), image_angle="canker_cork_halo", crop="orange")
    assert diag_canker["predicted_class"] == "citrus_canker"
    assert diag_canker["confidence_score"] >= 0.85
    assert "হৈব্রু ঘা" in diag_canker["local_name"]
    assert "Bordeaux" in diag_canker["recommended_actions"]["organic"]
    assert "Copper Oxychloride" in diag_canker["recommended_actions"]["chemical"]

    # 2. Huanglongbing / Citrus Greening (HLB)
    diag_hlb = predict_crop_disease(_tissue_jpeg("citrus_greening_hlb"), image_angle="hlb_mottle_yellow_leaf", crop="orange")
    assert diag_hlb["predicted_class"] == "citrus_greening_hlb"
    assert "কমলা হালবা" in diag_hlb["local_name"]
    assert "Liberibacter" in diag_hlb["scientific_name"]
    assert "psyllid" in diag_hlb["recommended_actions"]["chemical"]

    # 3. Powdery Mildew
    diag_mildew = predict_crop_disease(_tissue_jpeg("powdery_mildew"), image_angle="mildew_white_powder", crop="orange")
    assert diag_mildew["predicted_class"] == "powdery_mildew"
    assert "অঙৌবা খুপপা" in diag_mildew["local_name"]

    # 4. Root / Collar Rot
    diag_root = predict_crop_disease(_tissue_jpeg("root_rot"), image_angle="root_collar_bark_twig_base", crop="orange")
    assert diag_root["predicted_class"] == "root_rot"
    assert "মরী শাবা" in diag_root["local_name"]
    assert "Trichoderma" in diag_root["recommended_actions"]["organic"]


def test_chilli_disease_screening_and_triage():
    """Validates King Chilli / Umorok disease screening and triage remedies."""
    sample_jpeg = _create_sample_jpeg(size=(224, 224), color=(180, 40, 30))

    # 1. Anthracnose
    diag_anth = predict_crop_disease(_tissue_jpeg("anthracnose"), image_angle="anthracnose_pod_spot", crop="chilli")
    assert diag_anth["predicted_class"] == "anthracnose"
    assert "উ-মোরোক অমোৎপা" in diag_anth["local_name"]
    assert "Azoxystrobin" in diag_anth["recommended_actions"]["chemical"]

    # 2. Leaf Curl Virus
    diag_curl = predict_crop_disease(_tissue_jpeg("leaf_curl"), image_angle="curl_pucker_leaf", crop="chilli")
    assert diag_curl["predicted_class"] == "leaf_curl"
    assert "উ-মোরোক মনা কুংশিনবা" in diag_curl["local_name"]

    # 3. Bacterial Wilt
    diag_wilt = predict_crop_disease(_tissue_jpeg("bacterial_wilt"), image_angle="wilt_bacterial_stem", crop="chilli")
    assert diag_wilt["predicted_class"] == "bacterial_wilt"
    assert "উ-মোরোক মরা শাবা" in diag_wilt["local_name"]


def test_rice_chak_hao_phenology_and_lodging_risk():
    """Validates Chak-hao black rice 150-day phenological cycle and monsoon lodging alert."""
    planting = date.today() - timedelta(days=140)
    forecast = calculate_harvest_forecast(
        crop_variety="chak_hao",
        planting_date=planting,
        elevation_meters=780,  # Imphal / Thoubal valley
        rainfall_forecast_48h_mm=55.0,
        district="Thoubal"
    )

    assert forecast["crop"] == "rice"
    assert forecast["current_stage"] == "mature"
    assert forecast["metric_name"] == "estimated_moisture_pct"
    assert 14.0 <= forecast["metric_value"] <= 16.5
    assert forecast["weather_risk_level"] == "high"
    assert forecast["weather_action_code"] == "URGENT_PRE_LODGING_HARVEST"
    assert "Downpour alert" in forecast["weather_advisory"]
    assert "lodging in standing water" in forecast["weather_advisory"]


def test_orange_tamenglong_phenology_and_fruit_drop_risk():
    """Validates Tamenglong mandarin 270-day phenology and peel splitting downpour alert."""
    planting = date.today() - timedelta(days=250)
    forecast = calculate_harvest_forecast(
        crop_variety="tamenglong_mandarin",
        planting_date=planting,
        elevation_meters=1260,  # Tamenglong hill elevation
        rainfall_forecast_48h_mm=60.0,
        district="Tamenglong"
    )

    assert forecast["crop"] == "orange"
    assert forecast["current_stage"] == "mature"
    assert forecast["metric_name"] == "estimated_brix"
    assert 10.5 <= forecast["metric_value"] <= 13.0
    assert forecast["weather_risk_level"] == "high"
    assert forecast["weather_action_code"] == "URGENT_CITRUS_PICKING"
    assert "Downpour alert" in forecast["weather_advisory"]
    assert "peel splitting" in forecast["weather_advisory"]


def test_multi_crop_pricing_and_buyer_ranking():
    """Validates multi-crop net returns formula and buyer ranking across different price scales."""
    # 1. Chak-hao black rice pricing (₹135 gross vs ₹150 benchmark)
    chakhao_pricing = calculate_net_returns(
        gross_rate=135.0,
        lot_weight_kg=1000.0,
        distance_km=40.0,
        crop="chak_hao",
        terrain_corridor="valley"
    )
    # Unit freight: ₹2.47/kg, unit handling: ₹1.20/kg, platform fee: ₹2.02/kg
    assert chakhao_pricing["crop"] == "chak_hao"
    assert chakhao_pricing["handling_deduction"] == 1.20
    assert chakhao_pricing["net_rate"] > 125.0
    assert chakhao_pricing["total_take_home"] > 125000.0

    # 2. Tamenglong mandarin pricing on hill corridor
    orange_pricing = calculate_net_returns(
        gross_rate=55.0,
        lot_weight_kg=2000.0,
        distance_km=45.0,
        crop="tamenglong_mandarin",
        terrain_corridor="hill"
    )
    assert orange_pricing["crop"] == "tamenglong_mandarin"
    assert orange_pricing["handling_deduction"] == 1.40
    # Hill corridor freight deduction is higher
    assert orange_pricing["freight_deduction"] >= 3.00

    # 3. Buyer ranking for Chak-hao lot with ₹150 benchmark
    chakhao_lot = {
        "id": "lot-chk-1",
        "crop": "rice",
        "variety": "chak_hao",
        "quantity_kg": 1000.0,
        "quality_grade": "grade_a"
    }
    buyer_orders = [
        {
            "id": "bo-local",
            "buyer_name": "Thoubal Cooperative Mill",
            "unit_price_offered": 130.0,
            "distance_km": 15.0,
            "payment_terms_days": 0,
            "target_grade": "grade_a",
            "variety_preference": "chak_hao"
        },
        {
            "id": "bo-export",
            "buyer_name": "Organic Export House Imphal",
            "unit_price_offered": 142.0,
            "distance_km": 40.0,
            "payment_terms_days": 0,
            "target_grade": "grade_a",
            "variety_preference": "chak_hao"
        }
    ]
    ranked = match_and_rank_orders(chakhao_lot, buyer_orders)
    # Local buyer wins on proximity (15km vs 40km), while export buyer provides higher net rate
    assert ranked[0]["order_id"] == "bo-local"
    assert ranked[0]["composite_score"] > 0.85
    assert ranked[1]["order_id"] == "bo-export"
    assert ranked[1]["financial_breakdown"]["net_rate"] > ranked[0]["financial_breakdown"]["net_rate"]


def test_spatial_clustering_and_cvrptw_multi_crop():
    """Validates spatial farm clustering with Haversine distance, packaging units, and vehicle eligibility."""
    from intelligence_layer.pipelines.logistics_pipeline import cluster_regional_lots

    # 4 farms in Churachandpur pineapple belt
    lots = [
        {"id": "l1", "farm_name": "Khousabung A", "latitude": 24.4600, "longitude": 93.6700, "quantity_kg": 500.0, "crop": "pineapple"},
        {"id": "l2", "farm_name": "Khousabung B", "latitude": 24.4650, "longitude": 93.6750, "quantity_kg": 600.0, "crop": "pineapple"},
        {"id": "l3", "farm_name": "Ngaloi Farm", "latitude": 24.4400, "longitude": 93.6900, "quantity_kg": 500.0, "crop": "pineapple"},
        {"id": "l4", "farm_name": "Bunglon Stand", "latitude": 24.4300, "longitude": 93.6800, "quantity_kg": 450.0, "crop": "pineapple"},
    ]

    clusters = cluster_regional_lots(lots, max_radius_km=15.0)
    assert len(clusters) == 1
    cluster = clusters[0]
    assert cluster["stop_count"] == 4
    assert cluster["total_weight_kg"] == 2050.0
    assert cluster["eligible_vehicles"]["pickup_407_2500kg"] is True  # 2050kg >= 1875kg (75%)

    # Dispatch solver for this multi-stop cluster with hill corridor metrics
    dispatch = solve_cvrp_dispatch(
        cluster_district="Churachandpur",
        vehicle_type="pickup_407",
        destination_hub="Nilakuthi Food Park",
        farm_lots=cluster["stops"],
        enforce_threshold=True,
        corridor_type="hill"
    )
    assert dispatch["success"] is True
    assert dispatch["total_packaging_units"] == 82  # 2050kg / 25kg plastic crates = 82 crates
    assert dispatch["stops"][0]["packaging_type"] == "plastic_crates"
    assert dispatch["estimated_transit_hours"] > 0.0
    assert dispatch["digital_gate_pass"].startswith("HL-PASS-2026-")


# ─────────────────────────────────────────────────────────────
# SIGNATURE INNOVATIONS (INNOTECH FEST 2.0 BREAKTHROUGHS)
# ─────────────────────────────────────────────────────────────

def test_acoustic_bio_resonance_grading():
    """Innovation 1: Validates smartphone acoustic spectrometer formulas and resonance thresholds."""
    from intelligence_layer.module_a_disease.models.acoustic_grader import (
        calculate_firmness_index,
        evaluate_acoustic_resonance,
        analyze_audio_samples
    )
    # Firmness Index: S = f_peak^2 * m^(2/3)
    # 125 Hz, 1.2 kg -> S = 125^2 * 1.2^(2/3) = 15625 * 1.12924 = 17644.42
    s_idx = calculate_firmness_index(125.0, 1.20)
    assert s_idx == pytest.approx(17644.42, rel=1e-2)

    # 1. Crisp, dense Grade-A core (110 - 145 Hz)
    grade_a = evaluate_acoustic_resonance(peak_frequency_hz=128.0, damping_ratio=0.038, mass_kg=1.20)
    assert grade_a["internal_status"] == "crisp_dense_core"
    assert grade_a["quality_grade"] == "grade_a"
    assert grade_a["water_blister_risk_pct"] < 10.0

    # 2. Osmotic Water Blister & Translucent Fermentation (< 85 Hz)
    blistered = evaluate_acoustic_resonance(peak_frequency_hz=74.5, damping_ratio=0.092, mass_kg=1.35)
    assert blistered["internal_status"] == "internal_water_blister"
    assert blistered["quality_grade"] == "reject_fermenting"
    assert blistered["water_blister_risk_pct"] > 80.0
    assert "water-blister" in blistered["description"].lower()

    # 3. Soft processing core (85 - 110 Hz)
    soft = evaluate_acoustic_resonance(peak_frequency_hz=98.0, damping_ratio=0.050, mass_kg=1.15)
    assert soft["internal_status"] == "soft_processing"
    assert soft["quality_grade"] == "grade_b"

    # 4. Audio PCM sample FFT analysis
    import math
    sr = 44100
    # Synthesize 120 Hz sine tone
    samples = [math.sin(2.0 * math.pi * 120.0 * (i / sr)) for i in range(2048)]
    analysis = analyze_audio_samples(samples, sample_rate=sr, mass_kg=1.20)
    assert analysis["peak_frequency_hz"] == pytest.approx(120.0, abs=4.0)
    assert analysis["internal_status"] == "crisp_dense_core"


def test_multimodal_vision_and_acoustic_screening():
    """Innovation 1: Multimodal pipeline upgrades optical triage with acoustic thumb-thump."""
    sample_jpeg = _create_sample_jpeg()
    
    # Healthy photo with normal acoustic tone
    healthy_multi = predict_crop_disease(sample_jpeg, crop="pineapple", peak_frequency_hz=126.0)
    assert "acoustic_grading" in healthy_multi
    assert healthy_multi["acoustic_grading"]["internal_status"] == "crisp_dense_core"

    # Visually normal photo but internal acoustic water blister (<85 Hz) triggers critical alert!
    blistered_multi = predict_crop_disease(sample_jpeg, crop="pineapple", peak_frequency_hz=72.0)
    assert blistered_multi["acoustic_grading"]["internal_status"] == "internal_water_blister"
    assert blistered_multi["diagnostic_status"] == "confirmed"
    assert blistered_multi["severity_rating"] == "severe"
    assert "Osmotic Water Blister" in blistered_multi["local_name"]


def test_3d_micro_topographic_solar_radiation_factor():
    """Innovation 2: Validates DEM solar-aspect ray tracing and GDD microclimate divergence."""
    from intelligence_layer.module_b_harvest.phenology.gdd_calculator import (
        calculate_topographic_solar_factor,
        calculate_micro_topographic_gdd,
        compute_harvest_timeline
    )

    # South-West ridge (18 deg incline, 210 deg SW aspect) -> direct solar radiation boost
    alpha_sw = calculate_topographic_solar_factor(slope_deg=18.0, aspect_deg=210.0)
    assert alpha_sw > 1.10  # ~1.13

    # North-East shaded valley furrow (16 deg slope, 45 deg NE aspect) -> deep topographic shadow
    alpha_ne = calculate_topographic_solar_factor(slope_deg=16.0, aspect_deg=45.0)
    assert alpha_ne < 0.90  # ~0.84

    # Flat valley floor baseline
    alpha_flat = calculate_topographic_solar_factor(slope_deg=0.0, aspect_deg=180.0)
    assert alpha_flat == 1.0

    # True micro-topographic corrected GDD:
    # 28 deg C max, 18 deg C min -> base GDD = 7.0
    gdd_sw = calculate_micro_topographic_gdd(t_max=28.0, t_min=18.0, slope_deg=18.0, aspect_deg=210.0)
    gdd_ne = calculate_micro_topographic_gdd(t_max=28.0, t_min=18.0, slope_deg=16.0, aspect_deg=45.0)
    assert gdd_sw > 7.5
    assert gdd_ne < 6.5

    # 18-day maturity divergence between SW ridge and NE valley furrow
    planting = date.today() - timedelta(days=460)
    zone_a_timeline = compute_harvest_timeline("queen", planting, elevation_meters=850, slope_deg=18.0, aspect_deg=210.0)
    zone_c_timeline = compute_harvest_timeline("queen", planting, elevation_meters=818, slope_deg=16.0, aspect_deg=45.0)

    assert zone_a_timeline["gdd_accumulated"] > zone_c_timeline["gdd_accumulated"]
    assert zone_a_timeline["estimated_brix"] > zone_c_timeline["estimated_brix"]
    assert zone_a_timeline["topographic_solar_factor"] > zone_c_timeline["topographic_solar_factor"]


def test_dynamic_shelf_life_clock_and_bio_thermal_routing():
    """Innovation 3: Validates Q10 biological decay rate and pickup sequencing (fragile lots picked up LAST)."""
    from intelligence_layer.module_d_logistics.vrp_solver.cvrptw_solver import (
        calculate_biological_decay_rate,
        calculate_lot_shelf_life_hours,
        solve_vehicle_dispatch
    )

    # Q10 respiratory rate: at 29.5 deg C under hot tarpaulin, decay is ~2.2x faster than 20 deg C baseline
    decay_rate = calculate_biological_decay_rate(crate_temp_c=29.5, q10=2.3)
    assert decay_rate == pytest.approx(2.21, rel=1e-2)

    # Lot shelf life: 15.0 Brix post-rain lot has <= 6h remaining, 13.8 Brix lot has >= 15h
    fragile_shelf_life = calculate_lot_shelf_life_hours(brix=15.0, crate_temp_c=29.5, is_post_rain=True)
    sturdy_shelf_life = calculate_lot_shelf_life_hours(brix=13.8, crate_temp_c=29.5, is_post_rain=False)
    assert fragile_shelf_life <= 6.5
    assert sturdy_shelf_life >= 15.0

    # Solver sequencing test:
    # Lot A is sturdy (13.5 Brix, 20h shelf-life)
    # Lot B is medium (14.2 Brix, 10h shelf-life)
    # Lot C is fragile (15.2 Brix post-rain, 4h shelf-life)
    lots = [
        {"id": "lot-fragile", "farm_name": "Hill Crest Fragile", "quantity_kg": 650.0, "estimated_brix": 15.2, "post_rain": True},
        {"id": "lot-sturdy", "farm_name": "Valley Sturdy", "quantity_kg": 800.0, "estimated_brix": 13.5, "post_rain": False},
        {"id": "lot-medium", "farm_name": "Mid-Slope Medium", "quantity_kg": 650.0, "estimated_brix": 14.2, "post_rain": False},
    ]

    dispatch = solve_vehicle_dispatch(
        cluster_district="Churachandpur",
        vehicle_type="pickup_407",
        destination_hub="Nilakuthi Food Park",
        farm_lots=lots,
        crate_temp_c=29.5
    )

    assert dispatch["success"] is True
    assert dispatch["bio_thermal_routing_active"] is True
    # Fragile lot with lowest shelf life MUST be sequenced as the LAST stop
    stops = dispatch["stops"]
    assert len(stops) == 3
    assert stops[0]["lot_id"] == "lot-sturdy"      # First pickup
    assert stops[-1]["lot_id"] == "lot-fragile"    # Last pickup!
    assert "LAST" in stops[-1]["pickup_priority_rationale"]


def test_shapley_value_fair_freight_dividend():
    """Innovation 4: Validates Cooperative Game Theory Shapley value freight allocation."""
    from intelligence_layer.module_c_pricing.net_returns.shapley_freight import compute_shapley_freight_allocation

    participants = [
        {"id": "farmer-highway", "farmer_name": "Highway Anchor Farmer", "quantity_kg": 900.0, "detour_km": 0.0, "terrain_difficulty": 1.0},
        {"id": "farmer-midslope", "farmer_name": "Mid-Slope Farmer", "quantity_kg": 600.0, "detour_km": 2.5, "terrain_difficulty": 1.2},
        {"id": "farmer-hilltop", "farmer_name": "Remote Hilltop Farmer", "quantity_kg": 550.0, "detour_km": 6.8, "terrain_difficulty": 1.7},
    ]

    result = compute_shapley_freight_allocation(
        participants=participants,
        vehicle_type="pickup_407",
        vehicle_capacity_kg=2500.0,
        base_corridor_rate=1.85,
        solo_transit_rate=4.80
    )

    assert result["success"] is True
    assert result["capacity_fill_pct"] == 82.0  # 2050 / 2500 = 82%
    allocations = result["allocations"]
    assert len(allocations) == 3

    # Highway anchor receives consolidation bonus rebate (rate < base_corridor_rate)
    highway = allocations[0]
    assert highway["farmer_role"] == "Highway Anchor"
    assert highway["consolidation_bonus"] > 0.0
    assert highway["shapley_freight_rate_per_kg"] <= 1.85

    # Remote hilltop farmer pays detour penalty but still saves > 40% vs hiring solo truck (₹4.80)
    hilltop = allocations[2]
    assert hilltop["farmer_role"] == "Hill Spur Farmer"
    assert hilltop["detour_penalty"] > 0.40
    assert hilltop["shapley_freight_rate_per_kg"] < 3.00
    assert hilltop["savings_percentage"] > 40.0




def test_pineapple_diagnosis_depends_on_pixels_not_angle_label():
    """The same angle label must yield different diagnoses for different photos."""
    for disease in ("heart_rot", "black_rot", "mealybug_wilt"):
        diag = predict_crop_disease(_tissue_jpeg(disease), image_angle="crown", crop="pineapple")
        assert diag["predicted_class"] == disease
        assert diag["inference_mode"] == "colour_heuristic"
        assert diag["evidence"]["plant_coverage"] > 0.5


def test_non_plant_image_is_escalated_not_guessed():
    blank = Image.new("RGB", (224, 224), (245, 245, 245))
    buf = io.BytesIO()
    blank.save(buf, format="JPEG")
    diag = predict_crop_disease(buf.getvalue(), image_angle="crown_rot", crop="pineapple")
    assert diag["diagnostic_status"] == "inconclusive"
    assert diag["refer_to_expert"] is True
