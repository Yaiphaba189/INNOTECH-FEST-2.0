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
