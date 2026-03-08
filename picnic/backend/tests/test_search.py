"""Tests for the search router."""

from unittest.mock import MagicMock

from fastapi.testclient import TestClient

SEARCH_RESULTS = [
    {
        "items": [
            {"id": "p1", "name": "Melk", "image_id": "img1", "unit_quantity": "1L", "price": 120},
            {"id": "p2", "name": "Halfvolle melk", "image_id": "img2", "unit_quantity": "1L", "price": 110},
        ]
    }
]


def test_search_returns_results(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.search.return_value = SEARCH_RESULTS

    resp = client.get("/api/v1/search?q=melk")

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["name"] == "Melk"
    mock_picnic_client.search.assert_called_once_with("melk")


def test_search_handles_dict_response(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.search.return_value = {"items": [
        {"id": "p1", "name": "Melk", "price": 120},
    ]}

    resp = client.get("/api/v1/search?q=melk")

    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_search_missing_query_returns_422(client: TestClient) -> None:
    resp = client.get("/api/v1/search")

    assert resp.status_code == 422


def test_search_upstream_error_returns_502(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.search.side_effect = RuntimeError("network error")

    resp = client.get("/api/v1/search?q=melk")

    assert resp.status_code == 502
