"""Delivery router — delivery slots and order status."""

import logging

from fastapi import APIRouter, Depends, HTTPException

from ..models.picnic import DeliveryInfo, DeliverySlot
from ..picnic_client import PicnicClientManager, picnic_client_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["delivery"])


def get_client_manager() -> PicnicClientManager:
    return picnic_client_manager


@router.get("/delivery", response_model=DeliveryInfo)
async def get_delivery(
    manager: PicnicClientManager = Depends(get_client_manager),
) -> DeliveryInfo:
    try:
        client = await manager.get_client()

        next_slot: DeliverySlot | None = None
        try:
            slots_raw = client.get_delivery_slots()
            slots = slots_raw if isinstance(slots_raw, list) else \
                slots_raw.get("delivery_slots", [])
            if slots:
                s = slots[0]
                next_slot = DeliverySlot(
                    slot_id=s.get("slot_id"),
                    window_start=s.get("window_start"),
                    window_end=s.get("window_end"),
                    state=s.get("state"),
                )
        except Exception:
            logger.warning("Could not fetch delivery slots")

        current_order_status: str | None = None
        eta: str | None = None
        try:
            deliveries = client.get_deliveries()
            if deliveries:
                latest = deliveries[0]
                current_order_status = latest.get("status")
                eta = latest.get("eta2", {}).get("start") if latest.get("eta2") else None
        except Exception:
            logger.warning("Could not fetch deliveries")

        return DeliveryInfo(
            next_slot=next_slot,
            current_order_status=current_order_status,
            eta=eta,
        )
    except Exception as exc:
        logger.exception("Failed to fetch delivery info")
        raise HTTPException(
            status_code=502, detail="Failed to fetch delivery info from Picnic"
        ) from exc
