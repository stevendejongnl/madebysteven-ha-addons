"""Auth router."""

import logging

from fastapi import APIRouter, Depends

from ..picnic_client import PicnicClientManager, picnic_client_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def get_client_manager() -> PicnicClientManager:
    return picnic_client_manager


@router.get("/status")
async def auth_status(
    manager: PicnicClientManager = Depends(get_client_manager),
) -> dict[str, object]:
    return {"authenticated": manager.is_authenticated()}


@router.post("/logout")
async def logout(manager: PicnicClientManager = Depends(get_client_manager)) -> dict[str, object]:
    manager.logout()
    return {"status": "logged_out"}
