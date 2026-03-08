#!/bin/bash

# shellcheck source=/dev/null
source /usr/lib/bashio/bashio.sh

# Read credentials from HA add-on options (only override if bashio succeeds)
_username=$(bashio::config picnic_username 2>/dev/null) && export PICNIC_USERNAME="$_username"
_password=$(bashio::config picnic_password 2>/dev/null) && export PICNIC_PASSWORD="$_password"
_country=$(bashio::config picnic_country 2>/dev/null) && [ -n "$_country" ] && export PICNIC_COUNTRY="$_country"
export PICNIC_COUNTRY="${PICNIC_COUNTRY:-NL}"

bashio::log.info "Starting Picnic app for user: ${PICNIC_USERNAME}"

# Bootstrap auth token from HA Picnic integration if not already stored
if [ ! -f /data/auth_token.txt ] || [ ! -s /data/auth_token.txt ]; then
    bashio::log.info "No stored token found, trying to load from HA Picnic integration..."
    TOKEN=$(python3 -c "
import json, sys
for path in ['/homeassistant/.storage/core.config_entries', '/config/.storage/core.config_entries']:
    try:
        with open(path) as f:
            data = json.load(f)
        for e in data['data']['entries']:
            if e.get('domain') == 'picnic':
                t = e.get('data', {}).get('access_token', '')
                if t:
                    print(t)
                    sys.exit(0)
    except:
        pass
" 2>/dev/null)
    if [ -n "$TOKEN" ]; then
        echo "$TOKEN" > /data/auth_token.txt
        bashio::log.info "Loaded auth token from HA Picnic integration"
    else
        bashio::log.warning "No HA Picnic integration found — manual login required"
    fi
fi

exec python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000
