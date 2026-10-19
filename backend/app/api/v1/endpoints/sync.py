"""Delay-Tolerant Networking (DTN) Vehicular SneakerNet Mesh-Relay Sync Endpoint.

Signature Innovation 5:
Ingests offline field telemetry, disease screening hashes, and harvest commitments
collected in remote hill villages with zero cellular connectivity via Animated QR-Burst
or local WebRTC mesh relays carried by visiting FPO trucks. Flushes to backend when
the vehicle enters 4G/5G highway corridors.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/sync", tags=["DTN Mesh-Relay Edge Synchronization"])

# packet_id -> records processed. Replays of an already-flushed packet are acknowledged, not re-applied.
_PROCESSED_PACKETS: Dict[str, int] = {}


def compute_payload_checksum(payload_data: List[Dict[str, Any]]) -> str:
    """SHA-256 over the canonical (sorted-key, compact) JSON encoding of the payload."""
    canonical = json.dumps(payload_data, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()


class MeshRelayPacket(BaseModel):
    packet_id: str = Field(..., description="Unique DTN batch sequence ID")
    chunk_index: int = Field(0, description="Chunk frame index in burst")
    total_chunks: int = Field(1, description="Total chunks in animated burst")
    source_village: str = Field("Andro East Terraces", description="Village cluster of origin")
    relay_carrier_id: str = Field("TRK-TATA-407-MN01", description="Vehicle ID or courier device")
    network_corridor: str = Field("NH-2 Mantripukhri Gateway", description="4G/5G corridor where sync occurred")
    payload_checksum: str = Field(..., description="SHA-256 integrity checksum")
    payload_data: List[Dict[str, Any]] = Field(..., description="Buffered offline scans and crop telemetry")


class MeshRelayResponse(BaseModel):
    success: bool
    packet_id: str
    records_processed: int
    source_village: str
    relay_carrier: str
    network_corridor: str
    checksum_verified: bool
    sync_mode: str
    message: str
    synced_at: datetime = Field(default_factory=datetime.utcnow)


@router.post("/mesh-relay", response_model=MeshRelayResponse, status_code=status.HTTP_200_OK)
async def ingest_mesh_relay_burst(
    packet: MeshRelayPacket,
    current_user: User = Depends(get_current_user),
):
    """
    Ingests store-and-forward Vehicular SneakerNet packets buffered during zero-connectivity village visits.
    Rejects packets whose SHA-256 payload checksum does not match, and treats replays as idempotent.
    """
    if packet.payload_checksum.lower() != compute_payload_checksum(packet.payload_data):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Payload checksum mismatch: packet corrupted in transit, retry on next relay.",
        )

    replay = packet.packet_id in _PROCESSED_PACKETS
    if not replay:
        _PROCESSED_PACKETS[packet.packet_id] = len(packet.payload_data)
    records = _PROCESSED_PACKETS[packet.packet_id]

    return MeshRelayResponse(
        success=True,
        packet_id=packet.packet_id,
        records_processed=0 if replay else records,
        source_village=packet.source_village,
        relay_carrier=packet.relay_carrier_id,
        network_corridor=packet.network_corridor,
        checksum_verified=True,
        sync_mode="DTN Store-and-Forward Vehicular SneakerNet",
        message=(
            f"Packet {packet.packet_id} already synced; replay acknowledged."
            if replay else
            f"Successfully ingested {records} queued village assessments "
            f"from {packet.source_village} via vehicle {packet.relay_carrier_id} at {packet.network_corridor}."
        )
    )
