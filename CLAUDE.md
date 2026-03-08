# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Home Assistant addon repository containing the **Picnic Swipe** addon — a mobile-first swipe-based UI for managing a Picnic grocery delivery basket, integrated into Home Assistant as an ingress app.

## Addon Structure: `picnic/`

- `backend/` — FastAPI Python backend (Python 3.12, uv)
- `frontend/` — Lit web components + TypeScript (Node 22, Vite)
- `config.yaml` — Home Assistant addon manifest
- `compose.yml` — Local dev Docker Compose
- `Dockerfile` — Production multi-stage build for HA
- `run.sh` — HA container startup script

## Development Commands (run from `picnic/`)

```bash
make start          # Start local dev with Docker Compose
make stop           # Stop Docker Compose
make logs           # Follow Docker Compose logs
make build          # Build production Docker image

make test           # Run pytest (backend)
make lint           # Ruff (backend) + ESLint (frontend)
make typecheck      # mypy (backend) + tsc (frontend)

make backend-dev    # Run backend without Docker (uv run)
make frontend-dev   # Run frontend without Docker (npm run dev)
```

### Backend only

```bash
cd picnic/backend
uv sync
uv run pytest                          # All tests
uv run pytest tests/test_basket.py    # Single test file
uv run ruff check .
uv run mypy .
```

### Frontend only

```bash
cd picnic/frontend
npm install
npm test                   # Vitest
npm run lint               # ESLint
npm run typecheck          # tsc --noEmit
npm run build              # TypeScript compile + Vite build
```

## Architecture

### Backend (FastAPI)

- **Entry point:** `backend/src/main.py` — mounts routers, serves static frontend in production
- **`PicnicClientManager`** (`backend/src/picnic_client.py`) — singleton managing Picnic API authentication; reads `access_token` and `country_code` from HA Picnic integration storage (`/config/.storage/core.config_entries`), caches both to `/data/picnic_auth.json`; no `config.py` — country is dynamic
- **Routers:** `backend/src/routers/` — auth (status + logout only), basket, delivery, health, recipes, search
- **Production static serving:** Frontend is built to `backend/static/` and served by FastAPI

### Frontend (Lit + TypeScript)

- **Entry point:** `frontend/src/main.ts` — registers `<app-shell>` web component
- **Router:** `frontend/src/router.ts` — client-side SPA router; handles HA ingress path prefix (e.g. `/api/hassio_ingress/<token>`)
- **API client:** `frontend/src/api.ts` — centralized fetch wrapper with `BASE_PATH` support for HA ingress
- **Pages:** login-page, swipe-page, basket-page, search-page, delivery-page, not-found-page
- **Dev proxy:** Vite proxies `/api` and `/health` to `VITE_BACKEND_URL` (default: `http://localhost:8002`)

### Docker / HA Integration

- **Local dev:** `compose.yml` runs backend on `8002`, frontend dev server on `3002`
- **Production:** `Dockerfile` uses multi-stage build — frontend built to `backend/static/`, served via FastAPI on port 8000; HA ingress connects to this port
- **HA config options:** `picnic_username`, `picnic_password`, `picnic_country` (mapped to env vars in `run.sh`)
- **Note:** Production Dockerfile uses `pip` (not `uv`) to avoid conflicts with HA's `UV_INDEX` environment variable

## Code Conventions

- **Ruff:** line length 100, rules E, F, I, UP, B, SIM
- **mypy:** strict mode
- **ESLint:** no explicit `any`, unused vars allowed if prefixed with `_`
- **TypeScript:** strict mode, ES2022 target, experimental decorators for Lit
- **Tests:** pytest with `asyncio_mode = "auto"`, Vitest with jsdom; use dependency injection overrides for mocking backend
