"""Singleton PicnicAPI client manager."""

import logging
import os
from pathlib import Path

import requests
from python_picnic_api2 import PicnicAPI

from .config import settings

logger = logging.getLogger(__name__)

TOKEN_FILE = Path("/data/auth_token.txt")
BASE_URL = "https://storefront-prod.nl.picnicinternational.com/api/15"
_HEADERS = {
    "User-Agent": "okhttp/4.9.0",
    "Content-Type": "application/json; charset=UTF-8",
}


def _load_stored_token() -> str | None:
    try:
        if TOKEN_FILE.exists():
            return TOKEN_FILE.read_text().strip() or None
    except OSError:
        pass
    return None


def _save_token(token: str) -> None:
    try:
        TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
        TOKEN_FILE.write_text(token)
    except OSError as exc:
        logger.warning("Could not save auth token: %s", exc)


def _fetch_token_from_ha_integration() -> str | None:
    """Read the Picnic access_token from the HA Picnic integration via Supervisor API."""
    supervisor_token = os.environ.get("SUPERVISOR_TOKEN")
    if not supervisor_token:
        return None
    try:
        resp = requests.get(
            "http://supervisor/core/api/config/config_entries/entry",
            headers={"Authorization": f"Bearer {supervisor_token}"},
            timeout=5,
        )
        if resp.status_code != 200:
            return None
        entries = resp.json()
        for entry in entries:
            if entry.get("domain") == "picnic":
                # The access_token is in entry data but not exposed via this API
                # Use the config entries storage directly via HA REST API
                break

        # Try the states API to find picnic sensor with token info
        # Actually use the services/config_entries approach
        resp2 = requests.get(
            "http://supervisor/core/api/states",
            headers={"Authorization": f"Bearer {supervisor_token}"},
            timeout=5,
        )
        # Token not in states — need different approach
        return None
    except Exception as exc:
        logger.debug("Could not fetch token from HA integration: %s", exc)
        return None


def _get_token_from_ha_storage() -> str | None:
    """Read Picnic token from HA config storage file directly (add-on has /config access)."""
    try:
        import json
        storage_path = Path("/homeassistant/.storage/core.config_entries")
        if not storage_path.exists():
            storage_path = Path("/config/.storage/core.config_entries")
        if not storage_path.exists():
            return None
        with open(storage_path) as f:
            data = json.load(f)
        for entry in data["data"]["entries"]:
            if entry.get("domain") == "picnic":
                token = entry.get("data", {}).get("access_token")
                if token:
                    logger.info("Loaded Picnic auth token from HA integration")
                    return token
    except Exception as exc:
        logger.debug("Could not read HA storage: %s", exc)
    return None


class PicnicClientManager:
    _client: PicnicAPI | None = None
    _pending_token: str | None = None

    def is_authenticated(self) -> bool:
        if self._client is not None:
            return True
        # Check if a stored token exists (lazy init indicator)
        token = _load_stored_token() or _get_token_from_ha_storage()
        return token is not None

    async def get_client(self) -> PicnicAPI:
        if self._client is None:
            # 1. Try stored token (previously verified)
            token = _load_stored_token()
            # 2. Try HA integration storage
            if not token:
                token = _get_token_from_ha_storage()
                if token:
                    _save_token(token)
            if token:
                logger.info("Initializing Picnic client with stored token")
                self._client = PicnicAPI(country_code=settings.picnic_country, auth_token=token)
            else:
                raise RuntimeError("Not authenticated. Complete login first.")
        return self._client

    def raw_request(self, method: str, path: str, token: str | None = None, json: dict | None = None) -> requests.Response:
        headers = {**_HEADERS}
        if token:
            headers["x-picnic-auth"] = token
        url = f"{BASE_URL}{path}"
        return requests.request(method, url, headers=headers, json=json, timeout=15)

    async def start_login(self) -> dict:
        from hashlib import md5
        secret = md5(settings.picnic_password.encode()).hexdigest()
        resp = self.raw_request("POST", "/user/login", json={
            "key": settings.picnic_username,
            "secret": secret,
            "client_id": 30100,
        })
        token = resp.headers.get("x-picnic-auth")
        data = resp.json()
        if not token:
            raise RuntimeError("Login failed: no auth token returned")
        self._pending_token = token
        return {
            "requires_2fa": data.get("second_factor_authentication_required", False),
            "user_id": data.get("user_id"),
        }

    async def send_2fa_code(self, channel: str = "SMS") -> None:
        if not self._pending_token:
            raise RuntimeError("No pending login. Call start_login first.")
        resp = self.raw_request("POST", "/user/2fa/generate", token=self._pending_token, json={"channel": channel})
        if resp.status_code not in (200, 204):
            raise RuntimeError(f"Failed to send 2FA code: {resp.text}")

    async def verify_2fa_code(self, otp: str) -> None:
        if not self._pending_token:
            raise RuntimeError("No pending login. Call start_login first.")
        resp = self.raw_request("POST", "/user/2fa/verify", token=self._pending_token, json={"otp": otp})
        verified_token = resp.headers.get("x-picnic-auth") or self._pending_token
        if resp.status_code not in (200, 204):
            raise RuntimeError(f"2FA verification failed: {resp.text}")
        _save_token(verified_token)
        self._client = PicnicAPI(country_code=settings.picnic_country, auth_token=verified_token)
        self._pending_token = None

    async def set_token(self, token: str) -> None:
        resp = self.raw_request("GET", "/user", token=token)
        if resp.status_code == 403:
            raise RuntimeError("Token rejected by Picnic API")
        _save_token(token)
        self._client = PicnicAPI(country_code=settings.picnic_country, auth_token=token)
        self._pending_token = None

    async def complete_login_no_2fa(self) -> None:
        if not self._pending_token:
            raise RuntimeError("No pending login. Call start_login first.")
        _save_token(self._pending_token)
        self._client = PicnicAPI(country_code=settings.picnic_country, auth_token=self._pending_token)
        self._pending_token = None

    def logout(self) -> None:
        self._client = None
        self._pending_token = None
        try:
            TOKEN_FILE.unlink(missing_ok=True)
        except OSError:
            pass


picnic_client_manager = PicnicClientManager()
