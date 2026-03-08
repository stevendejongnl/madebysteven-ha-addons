"""Tests for the recipes router."""

from unittest.mock import MagicMock

from fastapi.testclient import TestClient

RECIPE_RAW = {
    "id": "r1",
    "name": "Pasta Bolognese",
    "image_id": "img123",
    "description": "Classic Italian pasta",
    "preparation_time": "30 min",
    "ingredients": [
        {"id": "p1", "name": "Spaghetti", "image_id": "img1", "unit_quantity": "500g", "price": 150},
        {"id": "p2", "name": "Tomato sauce", "image_id": "img2", "unit_quantity": "400ml", "price": 120},
    ],
}


def test_list_recipes_returns_recipes(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_recipes.return_value = [RECIPE_RAW]

    resp = client.get("/api/v1/recipes")

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == "r1"
    assert data[0]["name"] == "Pasta Bolognese"
    assert len(data[0]["ingredients"]) == 2


def test_list_recipes_with_pagination(client: TestClient, mock_picnic_client: MagicMock) -> None:
    recipes = [{"id": f"r{i}", "name": f"Recipe {i}", "ingredients": []} for i in range(10)]
    mock_picnic_client.get_recipes.return_value = recipes

    resp = client.get("/api/v1/recipes?offset=5&limit=3")

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3
    assert data[0]["id"] == "r5"


def test_list_recipes_handles_dict_response(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_recipes.return_value = {"items": [RECIPE_RAW]}

    resp = client.get("/api/v1/recipes")

    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_list_recipes_upstream_error_returns_502(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_recipes.side_effect = RuntimeError("network error")

    resp = client.get("/api/v1/recipes")

    assert resp.status_code == 502


def test_add_recipe_to_basket(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_recipes.return_value = [RECIPE_RAW]

    resp = client.post("/api/v1/recipes/r1/add-to-basket")

    assert resp.status_code == 200
    data = resp.json()
    assert data["added_count"] == 2
    assert data["recipe_name"] == "Pasta Bolognese"
    assert mock_picnic_client.add_product.call_count == 2


def test_add_recipe_to_basket_not_found(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_recipes.return_value = [RECIPE_RAW]

    resp = client.post("/api/v1/recipes/nonexistent/add-to-basket")

    assert resp.status_code == 404


def test_add_recipe_to_basket_upstream_error(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_recipes.side_effect = RuntimeError("network error")

    resp = client.post("/api/v1/recipes/r1/add-to-basket")

    assert resp.status_code == 502


def test_add_recipe_skips_failed_ingredient(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_recipes.return_value = [RECIPE_RAW]
    mock_picnic_client.add_product.side_effect = [None, RuntimeError("failed")]

    resp = client.post("/api/v1/recipes/r1/add-to-basket")

    assert resp.status_code == 200
    assert resp.json()["added_count"] == 1
