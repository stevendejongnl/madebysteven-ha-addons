#!/bin/bash

# shellcheck source=/dev/null
source /usr/lib/bashio/bashio.sh

# Verify HA Picnic integration is available (token + country_code are read at runtime by the backend)
bashio::log.info "Starting Picnic Swipe backend..."

exec python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000
