"""Tests for the basket router."""

from unittest.mock import MagicMock

from fastapi.testclient import TestClient

CART_RAW = {
    "items": [
        {
            "items": [
                {
                    "id": "p1",
                    "name": "Milk",
                    "image_id": "img1",
                    "unit_quantity": "1L",
                    "price": 120,
                    "decorators": [{"quantity": 2}],
                }
            ]
        }
    ],
    "total_price": 240,
}


def test_get_basket_returns_items(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_cart.return_value = CART_RAW

    resp = client.get("/api/v1/basket")

    assert resp.status_code == 200
    data = resp.json()
    assert data["total_price"] == 240
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Milk"
    assert data["items"][0]["quantity"] == 2


def test_get_basket_empty(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_cart.return_value = {"items": [], "total_price": 0}

    resp = client.get("/api/v1/basket")

    assert resp.status_code == 200
    assert resp.json()["total_count"] == 0


def test_get_basket_upstream_error_returns_502(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_cart.side_effect = RuntimeError("network error")

    resp = client.get("/api/v1/basket")

    assert resp.status_code == 502


def test_add_item_to_basket(client: TestClient, mock_picnic_client: MagicMock) -> None:
    resp = client.post("/api/v1/basket/items", json={"product_id": "p1", "count": 1})

    assert resp.status_code == 200
    assert resp.json()["status"] == "added"
    mock_picnic_client.add_product.assert_called_once_with("p1", count=1)


def test_add_item_upstream_error_returns_502(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.add_product.side_effect = RuntimeError("network error")

    resp = client.post("/api/v1/basket/items", json={"product_id": "p1", "count": 1})

    assert resp.status_code == 502


def test_remove_item_from_basket(client: TestClient, mock_picnic_client: MagicMock) -> None:
    resp = client.delete("/api/v1/basket/items/p1")

    assert resp.status_code == 200
    assert resp.json()["status"] == "removed"
    mock_picnic_client.add_product.assert_called_once_with("p1", count=0)


def test_remove_item_upstream_error_returns_502(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.add_product.side_effect = RuntimeError("network error")

    resp = client.delete("/api/v1/basket/items/p1")

    assert resp.status_code == 502
