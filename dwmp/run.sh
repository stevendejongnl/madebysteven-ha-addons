#!/bin/bash
# shellcheck disable=SC2155
set -euo pipefail

OPTS=/data/options.json

read_opt() {
  /app/.venv/bin/python -c "import json; print(json.load(open('${OPTS}')).get('$1', '$2'))"
}

POLL_INTERVAL=$(read_opt poll_interval_minutes 30)
TZ_OPT=$(read_opt timezone "Europe/Amsterdam")

# JWT secret is persisted so any cookies issued by upstream survive restarts.
# We don't set PASSWORD_HASH — upstream's open mode lets every request through,
# and HA ingress is the auth boundary (the addon only ever sees port 8000 via
# HA's authenticated ingress tunnel).
if [[ ! -s /data/jwt_secret ]]; then
  /app/.venv/bin/python -c "import secrets; print(secrets.token_hex(32))" > /data/jwt_secret
fi
JWT_SECRET=$(cat /data/jwt_secret)

# Clean up the legacy argon2 hash cache left by <=1.0.1 so upgrades don't
# carry forward dead state on disk.
rm -f /data/pw.hash

export JWT_SECRET
export POLL_INTERVAL_MINUTES="${POLL_INTERVAL}"
export TZ="${TZ_OPT}"
export DB_PATH=/data/dwmp.db

echo "[dwmp-addon] starting on :8000 (poll=${POLL_INTERVAL}m, tz=${TZ_OPT}, auth=ha-ingress)"

cd /app
exec uv run uvicorn dwmp.api.app:app \
  --host 0.0.0.0 \
  --port 8000 \
  --proxy-headers \
  --forwarded-allow-ips='*'
