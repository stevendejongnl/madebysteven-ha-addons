"""Auth router — login and 2FA flow."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..picnic_client import PicnicClientManager, picnic_client_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def get_client_manager() -> PicnicClientManager:
    return picnic_client_manager


class Verify2FARequest(BaseModel):
    otp: str


class SetTokenRequest(BaseModel):
    token: str


@router.get("/status")
async def auth_status(manager: PicnicClientManager = Depends(get_client_manager)) -> dict:
    return {"authenticated": manager.is_authenticated()}


@router.post("/login")
async def login(manager: PicnicClientManager = Depends(get_client_manager)) -> dict:
    try:
        result = await manager.start_login()
        if not result["requires_2fa"]:
            await manager.complete_login_no_2fa()
            return {"status": "authenticated", "requires_2fa": False}
        return {"status": "2fa_required", "requires_2fa": True}
    except Exception as exc:
        logger.exception("Login failed")
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/2fa/send")
async def send_2fa(manager: PicnicClientManager = Depends(get_client_manager)) -> dict:
    try:
        await manager.send_2fa_code(channel="SMS")
        return {"status": "sent"}
    except Exception as exc:
        logger.exception("Failed to send 2FA code")
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/2fa/verify")
async def verify_2fa(
    req: Verify2FARequest,
    manager: PicnicClientManager = Depends(get_client_manager),
) -> dict:
    try:
        await manager.verify_2fa_code(req.otp)
        return {"status": "authenticated"}
    except Exception as exc:
        logger.exception("2FA verification failed")
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/token")
async def set_token(
    req: SetTokenRequest,
    manager: PicnicClientManager = Depends(get_client_manager),
) -> dict:
    """Directly set an auth token (e.g. extracted from Picnic app session)."""
    try:
        await manager.set_token(req.token)
        return {"status": "authenticated"}
    except Exception as exc:
        logger.exception("Failed to set token")
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/logout")
async def logout(manager: PicnicClientManager = Depends(get_client_manager)) -> dict:
    manager.logout()
    return {"status": "logged_out"}
