.PHONY: start stop logs build test lint typecheck

start:
	docker compose up -d

stop:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

# Backend targets (run from backend/)
test:
	cd backend && uv run pytest

lint:
	cd backend && uv run ruff check .
	cd frontend && npm run lint

typecheck:
	cd backend && uv run mypy src
	cd frontend && npm run typecheck

# Frontend dev (without docker)
frontend-dev:
	cd frontend && npm run dev

# Backend dev (without docker)
backend-dev:
	cd backend && uv run src.main:main
