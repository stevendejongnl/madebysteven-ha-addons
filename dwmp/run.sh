#!/bin/bash
# shellcheck disable=SC2155
set -euo pipefail

OPTS=/data/options.json

read_opt() {
  /app/.venv/bin/python -c "import json; print(json.load(open('${OPTS}')).get('$1', '$2'))"
}

PASSWORD=$(read_opt password "")
POLL_INTERVAL=$(read_opt poll_interval_minutes 30)
TZ_OPT=$(read_opt timezone "Europe/Amsterdam")

# JWT secret is persisted so cookies survive addon restarts.
if [[ ! -s /data/jwt_secret ]]; then
  /app/.venv/bin/python -c "import secrets; print(secrets.token_hex(32))" > /data/jwt_secret
fi
JWT_SECRET=$(cat /data/jwt_secret)

# Argon2-hash the user's password, but cache the hash on disk and reuse it when
# the plaintext is unchanged. Detection uses argon2.verify() against the cached
# hash — no plaintext fingerprint on disk.
PASSWORD_HASH=""
if [[ -n "${PASSWORD}" ]]; then
  PASSWORD_HASH=$(DWMP_PW="${PASSWORD}" /app/.venv/bin/python - <<'PY'
import os
import sys
from pathlib import Path

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

ph = PasswordHasher()
pw = os.environ["DWMP_PW"]
cache = Path("/data/pw.hash")

if cache.exists():
    cached = cache.read_text()
    try:
        ph.verify(cached, pw)
        sys.stdout.write(cached)
        sys.exit(0)
    except (VerifyMismatchError, InvalidHashError):
        pass

new_hash = ph.hash(pw)
cache.write_text(new_hash)
sys.stdout.write(new_hash)
PY
)
else
  rm -f /data/pw.hash
fi

export JWT_SECRET PASSWORD_HASH
export POLL_INTERVAL_MINUTES="${POLL_INTERVAL}"
export TZ="${TZ_OPT}"
export DB_PATH=/data/dwmp.db

auth_state="open"
[[ -n "${PASSWORD_HASH}" ]] && auth_state="password-protected"
echo "[dwmp-addon] starting on :8000 (poll=${POLL_INTERVAL}m, tz=${TZ_OPT}, auth=${auth_state})"

cd /app
exec uv run uvicorn dwmp.api.app:app \
  --host 0.0.0.0 \
  --port 8000 \
  --proxy-headers \
  --forwarded-allow-ips='*'
