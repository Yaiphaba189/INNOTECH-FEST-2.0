import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_registration_and_login(client: AsyncClient):
    # 1. Register new farmer
    new_phone = f"+9198{uuid.uuid4().int % 1000000000:09d}"
    reg_res = await client.post("/api/auth/register", json={
        "phone_number": new_phone,
        "full_name": "Test Regional Grower",
        "password": "strongpassword123",
        "role": "farmer",
        "preferred_language": "en"
    })
    assert reg_res.status_code == 201, reg_res.text
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["phone_number"] == new_phone

    # 2. Duplicate registration rejection
    dup_res = await client.post("/api/auth/register", json={
        "phone_number": new_phone,
        "full_name": "Duplicate Person",
        "password": "strongpassword123",
        "role": "farmer",
        "preferred_language": "en"
    })
    assert dup_res.status_code == 409
    assert dup_res.json()["detail"]["code"] == "PHONE_ALREADY_REGISTERED"

    # 3. Successful login
    login_res = await client.post("/api/auth/login", json={
        "phone_number": new_phone,
        "password": "strongpassword123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # 4. Access /api/auth/me
    me_res = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["phone_number"] == new_phone


@pytest.mark.asyncio
async def test_auth_invalid_credentials(client: AsyncClient):
    res = await client.post("/api/auth/login", json={
        "phone_number": "+919862000001",
        "password": "wrongpassword"
    })
    assert res.status_code == 401
    assert res.json()["detail"]["code"] == "INVALID_CREDENTIALS"
