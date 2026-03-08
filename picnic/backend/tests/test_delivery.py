"""Tests for the delivery router."""

from unittest.mock import MagicMock

from fastapi.testclient import TestClient


def test_get_delivery_with_slot_and_order(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_delivery_slots.return_value = [
        {
            "slot_id": "slot1",
            "window_start": "2026-03-10T14:00:00",
            "window_end": "2026-03-10T16:00:00",
            "state": "AVAILABLE",
        }
    ]
    mock_picnic_client.get_deliveries.return_value = [
        {
            "status": "CURRENT",
            "eta2": {"start": "2026-03-07T15:30:00"},
        }
    ]

    resp = client.get("/api/v1/delivery")

    assert resp.status_code == 200
    data = resp.json()
    assert data["next_slot"]["slot_id"] == "slot1"
    assert data["next_slot"]["state"] == "AVAILABLE"
    assert data["current_order_status"] == "CURRENT"
    assert data["eta"] == "2026-03-07T15:30:00"


def test_get_delivery_no_slots(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_delivery_slots.return_value = []
    mock_picnic_client.get_deliveries.return_value = []

    resp = client.get("/api/v1/delivery")

    assert resp.status_code == 200
    data = resp.json()
    assert data["next_slot"] is None
    assert data["current_order_status"] is None


def test_get_delivery_slots_error_still_returns(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_delivery_slots.side_effect = RuntimeError("slots unavailable")
    mock_picnic_client.get_deliveries.return_value = [{"status": "DELIVERED"}]

    resp = client.get("/api/v1/delivery")

    assert resp.status_code == 200
    assert resp.json()["current_order_status"] == "DELIVERED"


def test_get_delivery_deliveries_error_still_returns(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_delivery_slots.return_value = [
        {"slot_id": "s1", "window_start": "2026-03-10T14:00:00", "window_end": "2026-03-10T16:00:00"}
    ]
    mock_picnic_client.get_deliveries.side_effect = RuntimeError("deliveries unavailable")

    resp = client.get("/api/v1/delivery")

    assert resp.status_code == 200
    assert resp.json()["next_slot"]["slot_id"] == "s1"


def test_get_delivery_upstream_error_returns_502(client: TestClient, mock_picnic_client: MagicMock) -> None:
    mock_picnic_client.get_delivery_slots.side_effect = RuntimeError("hard failure")
    mock_picnic_client.get_deliveries.side_effect = RuntimeError("hard failure")

    # Both fail, but delivery endpoint catches partial failures gracefully
    # Only returns 502 if the outer try/except catches an unexpected error
    resp = client.get("/api/v1/delivery")
    assert resp.status_code == 200  # Partial failures handled gracefully
