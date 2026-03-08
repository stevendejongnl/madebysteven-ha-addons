"""Singleton PicnicAPI client manager."""

import json
import logging
from pathlib import Path

from python_picnic_api2 import PicnicAPI

logger = logging.getLogger(__name__)

CACHE_FILE = Path("/data/picnic_auth.json")


def _load_cache() -> tuple[str, str] | None:
    """Return (token, country_code) from cache, or None."""
    try:
        if CACHE_FILE.exists():
            data = json.loads(CACHE_FILE.read_text())
            token = data.get("access_token", "").strip()
            country_code = data.get("country_code", "NL")
            return (token, country_code) if token else None
    except (OSError, json.JSONDecodeError):
        pass
    return None


def _save_cache(token: str, country_code: str) -> None:
    try:
        CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
        CACHE_FILE.write_text(json.dumps({"access_token": token, "country_code": country_code}))
    except OSError as exc:
        logger.warning("Could not save auth cache: %s", exc)


def _get_config_from_ha_storage() -> tuple[str, str] | None:
    """Read Picnic token and country code from HA config storage (add-on has /config access).

    Returns a (token, country_code) tuple, or None if not found.
    """
    for path in ["/homeassistant/.storage/core.config_entries", "/config/.storage/core.config_entries"]:
        try:
            with open(path) as f:
                data = json.load(f)
            for entry in data["data"]["entries"]:
                if entry.get("domain") == "picnic":
                    entry_data = entry.get("data", {})
                    token = entry_data.get("access_token")
                    country_code = entry_data.get("country_code", "NL")
                    if token:
                        logger.info("Loaded Picnic config from HA integration (country: %s)", country_code)
                        return token, country_code
        except Exception as exc:
            logger.debug("Could not read HA storage at %s: %s", path, exc)
    return None


class PicnicClientManager:
    _client: PicnicAPI | None = None

    def is_authenticated(self) -> bool:
        if self._client is not None:
            return True
        return _load_cache() is not None or _get_config_from_ha_storage() is not None

    async def get_client(self) -> PicnicAPI:
        if self._client is None:
            config = _load_cache()
            if not config:
                config = _get_config_from_ha_storage()
                if config:
                    _save_cache(*config)
            if config:
                token, country_code = config
                logger.info("Initializing Picnic client with stored token (country: %s)", country_code)
                self._client = PicnicAPI(country_code=country_code, auth_token=token)
            else:
                raise RuntimeError("Not authenticated. Ensure the HA Picnic integration is configured.")
        return self._client

    def logout(self) -> None:
        self._client = None
        try:
            CACHE_FILE.unlink(missing_ok=True)
        except OSError:
            pass


picnic_client_manager = PicnicClientManager()
