"""Search router — search for products."""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from ..models.picnic import SearchResult
from ..picnic_client import PicnicClientManager, picnic_client_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["search"])


def get_client_manager() -> PicnicClientManager:
    return picnic_client_manager


def _parse_search_result(item: Any) -> SearchResult:
    image_id = item.get("image_id") or (item.get("images") or [{}])[0].get("image_id")
    image_url = (
        f"https://storefront-prod.nl.picnicinternational.com/static/images/{image_id}/large.png"
        if image_id else None
    )
    return SearchResult(
        id=item.get("id", ""),
        name=item.get("name", ""),
        image_url=image_url,
        unit_quantity=item.get("unit_quantity"),
        price=item.get("price"),
    )


@router.get("/search", response_model=list[SearchResult])
async def search_products(
    q: str = Query(..., min_length=1),
    manager: PicnicClientManager = Depends(get_client_manager),
) -> list[SearchResult]:
    try:
        client = await manager.get_client()
        raw = client.search(q)
        results: list[Any] = []
        if isinstance(raw, list):
            for section in raw:
                results.extend(section.get("items", []))
        elif isinstance(raw, dict):
            results = raw.get("items", [])
        return [_parse_search_result(r) for r in results]
    except Exception as exc:
        logger.exception("Failed to search products")
        raise HTTPException(status_code=502, detail="Failed to search Picnic products") from exc
