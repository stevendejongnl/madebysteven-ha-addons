#!/bin/bash

# shellcheck source=/dev/null
source /usr/lib/bashio/bashio.sh

# Verify HA Picnic integration is available (token + country_code are read at runtime by the backend)
python3 -c "
import json, sys
for path in ['/homeassistant/.storage/core.config_entries', '/config/.storage/core.config_entries']:
    try:
        with open(path) as f:
            data = json.load(f)
        for e in data['data']['entries']:
            if e.get('domain') == 'picnic' and e.get('data', {}).get('access_token'):
                sys.exit(0)
    except:
        pass
sys.exit(1)
" 2>/dev/null || {
    bashio::log.error "No HA Picnic integration found — please set up the Picnic integration first"
    exit 1
}
bashio::log.info "HA Picnic integration found, starting backend..."

exec python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000
