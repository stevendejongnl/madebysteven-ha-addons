# Picnic Swipe

A mobile-first Home Assistant addon that integrates with the [Picnic](https://picnic.app) grocery delivery service. Browse recipes and products using a swipe-based UI, and manage your Picnic basket directly from Home Assistant.

## Features

- Swipe through recipes and add all ingredients to your basket in one tap
- Search for individual products and add them to your basket
- View and manage your current basket
- Check your next delivery slot and order status
- Supports all Picnic countries (NL, DE, BE) — country is read automatically from the HA integration

## Installation

1. Add the repository to Home Assistant:
   **Settings → Add-ons → Add-on Store → ⋮ → Repositories**
   Add: `https://github.com/stevendejongnl/madebysteven-ha-addons`

2. Find **Picnic Swipe** in the store and install it.

3. Ensure the [Picnic integration](https://www.home-assistant.io/integrations/picnic/) is installed and authenticated in Home Assistant.

4. Start the addon and open the web UI via the **Open Web UI** button.

## Authentication

Authentication is handled entirely via the [Home Assistant Picnic integration](https://www.home-assistant.io/integrations/picnic/). The addon reads the stored token directly from HA's config storage — no credentials need to be configured in the addon itself. The token and country code are cached at `/data/picnic_auth.json` after first boot.

## Architecture

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.12) on port 8000 |
| Frontend | Lit web components + TypeScript (served as static files) |
| HA integration | Ingress on port 8000 |
| Supported architectures | amd64, aarch64, armhf, armv7 |

## Development

See [CLAUDE.md](../CLAUDE.md) for full development setup and commands.

```bash
# Start local dev environment
cd picnic
make start
make logs

# Run tests and linting
make test
make lint
make typecheck
```
