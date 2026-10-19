import pytest

from app.api.v1.endpoints.sync import compute_payload_checksum

pytestmark = pytest.mark.asyncio


def _packet(payload, checksum=None, packet_id="PKT-1"):
    return {
        "packet_id": packet_id,
        "payload_data": payload,
        "payload_checksum": checksum or compute_payload_checksum(payload),
    }


async def test_sync_requires_auth(client):
    res = await client.post("/api/sync/mesh-relay", json=_packet([{"a": 1}]))
    assert res.status_code in (401, 403)


async def test_sync_accepts_valid_packet_and_is_idempotent(client, farmer_token):
    headers = {"Authorization": f"Bearer {farmer_token}"}
    pkt = _packet([{"scan": "a"}, {"scan": "b"}], packet_id="PKT-IDEMP")

    first = await client.post("/api/sync/mesh-relay", json=pkt, headers=headers)
    assert first.status_code == 200
    assert first.json()["records_processed"] == 2

    replay = await client.post("/api/sync/mesh-relay", json=pkt, headers=headers)
    assert replay.status_code == 200
    assert replay.json()["records_processed"] == 0


async def test_sync_rejects_corrupted_payload(client, farmer_token):
    headers = {"Authorization": f"Bearer {farmer_token}"}
    pkt = _packet([{"scan": "a"}], checksum="0" * 64, packet_id="PKT-BAD")
    res = await client.post("/api/sync/mesh-relay", json=pkt, headers=headers)
    assert res.status_code == 422
