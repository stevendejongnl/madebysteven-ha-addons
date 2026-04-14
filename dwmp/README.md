# Dude, Where's My Package? — Home Assistant Addon

A wrapper around the [`dude-wheres-my-package`](https://github.com/stevendejongnl/dude-wheres-my-package)
service: track parcels from **PostNL, DHL, DPD, GLS, and Amazon NL** from inside Home Assistant.

The addon pulls the upstream image (`ghcr.io/stevendejongnl/dude-wheres-my-package`),
mounts `/data` for the SQLite database and persisted secrets, and exposes the web UI
through HA ingress so it shows up in the sidebar.

> **amd64 only.** The upstream image isn't built multi-arch yet — Raspberry Pi
> users will need to wait until the upstream build matrix grows.

## Install

1. Add this repo (`Settings → Add-ons → Add-on Store → ⋮ → Repositories`):
   `https://github.com/stevendejongnl/madebysteven-ha-addons`
2. Install **Dude, Where's My Package?**
3. Start the addon. Open it from the sidebar.

## Options

| Option | Default | Description |
|---|---|---|
| `dhl_api_key` | _(empty)_ | DHL Unified Tracking API key from [developer.dhl.com](https://developer.dhl.com). Optional — enables rich event timelines (6+ events per DHL package). |
| `dwmp_public_url` | _(empty)_ | Public URL for this instance (e.g. `https://dwmp.example.com`). Required for the DPD browser-push bookmarklet when running behind a reverse proxy or Cloudflare. |
| `poll_interval_minutes` | `30` | How often the background scheduler refreshes parcels. 5–1440. |
| `timezone` | `Europe/Amsterdam` | Used by the scheduler for time-of-day display. |

## Authentication

The addon has no login of its own — auth is handled by Home Assistant. The
container only exposes its web UI through HA ingress, and reaching an ingress
URL already requires a logged-in HA user, so anyone who can open the addon
from the sidebar is authenticated by HA.

## Pair with the HA integration

The companion HA custom component reads parcels into HA sensors:
[`stevens-home-assistant-integrations/custom_components/dwmp`](https://github.com/stevendejongnl/stevens-home-assistant-integrations/tree/main/custom_components/dwmp).
Point it at the addon's ingress URL.

## Carrier setup

Each carrier needs its own one-time auth dance (browser-captured tokens for PostNL,
credentials for DHL/Amazon, no auth for GLS). The full instructions live in the
[upstream README](https://github.com/stevendejongnl/dude-wheres-my-package#carrier-setup).

**DPD** uses a browser-push bookmarklet: drag a "Sync DPD" bookmarklet from the
accounts page to your bookmarks bar, then click it while logged in on DPD's parcels
page. Your browser captures the page and sends it to the addon — no cookies or
Playwright needed. Requires `dwmp_public_url` to be set in the addon options.
