"""Shared pytest fixtures for picnic backend tests."""

from collections.abc import Generator
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from src.main import create_app
from src.picnic_client import PicnicClientManager


@pytest.fixture
def mock_picnic_client() -> MagicMock:
    return MagicMock()


@pytest.fixture
def mock_manager(mock_picnic_client: MagicMock) -> PicnicClientManager:
    manager = PicnicClientManager()
    manager.get_client = AsyncMock(return_value=mock_picnic_client)  # type: ignore[method-assign]
    return manager


@pytest.fixture
def client(mock_manager: PicnicClientManager) -> Generator[TestClient, None, None]:
    from src.routers import basket, delivery, recipes, search

    app = create_app()

    # Override dependency injection for all routers
    def override_manager() -> PicnicClientManager:
        return mock_manager

    app.dependency_overrides[recipes.get_client_manager] = override_manager
    app.dependency_overrides[basket.get_client_manager] = override_manager
    app.dependency_overrides[search.get_client_manager] = override_manager
    app.dependency_overrides[delivery.get_client_manager] = override_manager

    with TestClient(app) as c:
        yield c
