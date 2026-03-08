"""Basket router — view and modify the shopping basket."""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..models.picnic import Basket, CartItem
from ..picnic_client import PicnicClientManager, picnic_client_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["basket"])


class AddItemRequest(BaseModel):
    product_id: str
    count: int = 1


def get_client_manager() -> PicnicClientManager:
    return picnic_client_manager


def _parse_basket(raw: Any) -> Basket:
    items: list[CartItem] = []
    total_price = 0

    for item_data in raw.get("items", []):
        for article in item_data.get("items", [item_data]):
            image_id = article.get("image_id") or ""
            image_url = (
                f"https://storefront-prod.nl.picnicinternational.com/static/images/{image_id}/large.png"
                if image_id else None
            )
            cart_item = CartItem(
                id=article.get("id", ""),
                name=article.get("name", ""),
                image_url=image_url,
                unit_quantity=article.get("unit_quantity"),
                price=article.get("price"),
                quantity=article.get("decorators", [{}])[0].get("quantity", 1)
                if article.get("decorators") else 1,
            )
            items.append(cart_item)
            if cart_item.price:
                total_price += cart_item.price * cart_item.quantity

    return Basket(
        items=items,
        total_price=raw.get("total_price", total_price),
        total_count=len(items),
    )


@router.get("/basket", response_model=Basket)
async def get_basket(
    manager: PicnicClientManager = Depends(get_client_manager),
) -> Basket:
    try:
        client = await manager.get_client()
        raw = client.get_cart()
        return _parse_basket(raw)
    except Exception as exc:
        logger.exception("Failed to fetch basket")
        raise HTTPException(status_code=502, detail="Failed to fetch basket from Picnic") from exc


@router.post("/basket/items")
async def add_item(
    req: AddItemRequest,
    manager: PicnicClientManager = Depends(get_client_manager),
) -> dict[str, str]:
    try:
        client = await manager.get_client()
        client.add_product(req.product_id, count=req.count)
        return {"status": "added"}
    except Exception as exc:
        logger.exception("Failed to add item to basket")
        raise HTTPException(status_code=502, detail="Failed to add item to basket") from exc


@router.delete("/basket/items/{product_id}")
async def remove_item(
    product_id: str,
    manager: PicnicClientManager = Depends(get_client_manager),
) -> dict[str, str]:
    try:
        client = await manager.get_client()
        client.add_product(product_id, count=0)
        return {"status": "removed"}
    except Exception as exc:
        logger.exception("Failed to remove item from basket")
        raise HTTPException(status_code=502, detail="Failed to remove item from basket") from exc
