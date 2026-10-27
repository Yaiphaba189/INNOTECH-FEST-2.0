import io
import pytest
from httpx import AsyncClient
from PIL import Image


@pytest.mark.asyncio
async def test_disease_screening_and_escalation(client: AsyncClient, farmer_token: str):
    headers = {"Authorization": f"Bearer {farmer_token}"}

    # 1. Create a dummy test image in memory
    img = Image.new("RGB", (224, 224), color=(140, 90, 40))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    image_bytes = buf.getvalue()

    # 2. Upload photo for Module A Disease Screening
    files = {"image_file": ("crown_test.jpg", image_bytes, "image/jpeg")}
    data = {
        "crop_record_id": "crop-queen-tombi-001",
        "image_angle": "crown"
    }

    screen_res = await client.post("/api/assessments/screen", data=data, files=files, headers=headers)
    assert screen_res.status_code == 200, screen_res.text
    result = screen_res.json()
    assert result["crop_record_id"] == "crop-queen-tombi-001"
    assert result["confidence_score"] >= 0.85
    assert result["predicted_class"] in ["heart_rot", "black_rot", "mealybug_wilt", "healthy"]
    assert "organic" in result["recommended_actions"]
    assert "chemical" in result["recommended_actions"]

    assessment_id = result["id"]

    # 3. Escalate assessment to district extension officer
    esc_res = await client.post(
        f"/api/assessments/{assessment_id}/escalate",
        json={"notes": "Central leaves easily detaching. Waterlogged terrace."},
        headers=headers
    )
    assert esc_res.status_code == 200
    esc_data = esc_res.json()
    assert esc_data["status"] == "assigned_to_officer"
    assert "referral_id" in esc_data


@pytest.mark.asyncio
async def test_auto_detect_reports_triage_and_evidence_from_pixels(client):
    import io
    from PIL import Image

    def upload(color):
        buf = io.BytesIO()
        Image.new("RGB", (224, 224), color).save(buf, format="JPEG")
        return {"image_file": ("f.jpg", buf.getvalue(), "image/jpeg")}

    rot = (await client.post("/api/assessments/auto-detect", data={"crop_hint": "pineapple"}, files=upload((150, 100, 45)))).json()
    blank = (await client.post("/api/assessments/auto-detect", data={"crop_hint": "pineapple"}, files=upload((245, 245, 245)))).json()

    assert rot["diagnosis"]["predicted_class"] == "heart_rot"
    assert rot["diagnosis"]["triage_status"] == "confirmed"
    assert rot["inference_mode"] == "colour_heuristic"
    assert blank["diagnosis"]["triage_status"] == "inconclusive"
    assert blank["diagnosis"]["refer_to_expert"] is True


@pytest.mark.asyncio
async def test_model_info_reports_engine_and_coverage(client):
    cards = {c["crop"]: c for c in (await client.get("/api/assessments/model-info")).json()}
    assert set(cards) == {"pineapple", "rice", "orange"}
    # tests run with trained weights disabled, so every crop reports the colour-rule engine
    assert cards["pineapple"]["inference_mode"] == "colour_heuristic"
    assert cards["pineapple"]["test_accuracy"] is None


@pytest.mark.asyncio
async def test_auto_detect_without_crop_hint_does_not_guess_a_crop(client):
    import io
    from PIL import Image

    buf = io.BytesIO()
    Image.new("RGB", (64, 64), (200, 160, 40)).save(buf, "JPEG")
    res = (await client.post("/api/assessments/auto-detect", files={"image_file": ("f.jpg", buf.getvalue(), "image/jpeg")})).json()
    assert res["detected_crop"] == "unknown"
    assert res["crop_confidence"] == 0.0
    assert res["diagnosis"]["triage_status"] == "inconclusive"
