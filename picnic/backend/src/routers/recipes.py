"""Recipes router — browse and add to basket."""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from ..models.picnic import Ingredient, Recipe
from ..picnic_client import PicnicClientManager, picnic_client_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["recipes"])


def get_client_manager() -> PicnicClientManager:
    return picnic_client_manager


def _extract_image_url(item: Any) -> str | None:
    image_id = item.get("image_id") or (item.get("images") or [{}])[0].get("image_id")
    if image_id:
        return (
            f"https://storefront-prod.nl.picnicinternational.com/static/images/{image_id}/large.png"
        )
    return None


def _parse_recipe(raw: Any) -> Recipe | None:
    recipe_id = raw.get("id") or raw.get("recipe_id")
    name = raw.get("name") or raw.get("title")
    if not recipe_id or not name:
        return None

    ingredients: list[Ingredient] = []
    for ing in raw.get("ingredients", []):
        ingredients.append(Ingredient(
            id=ing.get("id", ""),
            name=ing.get("name", ""),
            image_url=_extract_image_url(ing),
            unit_quantity=ing.get("unit_quantity"),
            price=ing.get("price"),
        ))

    return Recipe(
        id=str(recipe_id),
        name=str(name),
        image_url=_extract_image_url(raw),
        description=raw.get("description"),
        ingredients=ingredients,
        preparation_time=raw.get("preparation_time"),
    )


def _parse_recipes(data: Any) -> list[Recipe]:
    """Parse a list or dict response from get_recipes() into Recipe objects."""
    items: list[Any] = []
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = data.get("items", [])

    recipes: list[Recipe] = []
    seen: set[str] = set()
    for raw in items:
        r = _parse_recipe(raw)
        if r and r.id not in seen:
            seen.add(r.id)
            recipes.append(r)
    return recipes


@router.get("/recipes", response_model=list[Recipe])
async def list_recipes(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    manager: PicnicClientManager = Depends(get_client_manager),
) -> list[Recipe]:
    try:
        client = await manager.get_client()
        raw = client.get_recipes()
        recipes = _parse_recipes(raw)
        return recipes[offset: offset + limit]
    except Exception as exc:
        logger.exception("Failed to fetch recipes")
        raise HTTPException(status_code=502, detail="Failed to fetch recipes from Picnic") from exc


@router.post("/recipes/{recipe_id}/add-to-basket")
async def add_recipe_to_basket(
    recipe_id: str,
    manager: PicnicClientManager = Depends(get_client_manager),
) -> dict[str, object]:
    try:
        client = await manager.get_client()
        raw_recipes = client.get_recipes()
        all_recipes = _parse_recipes(raw_recipes)
        recipe = next((r for r in all_recipes if r.id == recipe_id), None)
        if recipe is None:
            raise HTTPException(status_code=404, detail="Recipe not found")

        added = 0
        for ingredient in recipe.ingredients:
            if ingredient.id:
                try:
                    client.add_product(ingredient.id, count=1)
                    added += 1
                except Exception:
                    logger.warning("Failed to add ingredient %s", ingredient.id)

        return {"added_count": added, "recipe_name": recipe.name}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to add recipe to basket")
        raise HTTPException(status_code=502, detail="Failed to add recipe to basket") from exc
