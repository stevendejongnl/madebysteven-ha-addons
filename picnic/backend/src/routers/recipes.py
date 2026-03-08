"""Recipes router — browse and add to basket via Picnic Fusion pages."""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from ..models.picnic import Ingredient, Recipe
from ..picnic_client import BASE_URL, PicnicClientManager, picnic_client_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["recipes"])


def get_client_manager() -> PicnicClientManager:
    return picnic_client_manager


def _extract_image_url(item: Any) -> str | None:
    image_id = item.get("image_id") or (item.get("images") or [{}])[0].get("image_id")
    if image_id:
        return f"https://storefront-prod.nl.picnicinternational.com/static/images/{image_id}/large.png"
    return None


def _parse_component(comp: Any) -> Recipe | None:
    """Try to extract a Recipe from a Fusion page component."""
    # Fusion pages nest data inside components with various types
    ctype = comp.get("type", "")
    items = comp.get("items") or comp.get("products") or []

    # Look for recipe cards in decorators/content
    recipe_id = comp.get("id") or comp.get("recipe_id")
    name = comp.get("name") or comp.get("title")
    if not recipe_id or not name:
        return None

    ingredients: list[Ingredient] = []
    for ing in comp.get("ingredients", []):
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
        image_url=_extract_image_url(comp),
        description=comp.get("description"),
        ingredients=ingredients,
        preparation_time=comp.get("preparation_time"),
    )


def _extract_recipes_from_fusion(data: Any) -> list[Recipe]:
    """Walk the Fusion page tree and collect all recognisable recipe entries."""
    recipes: list[Recipe] = []
    seen: set[str] = set()

    def walk(node: Any) -> None:
        if isinstance(node, list):
            for item in node:
                walk(item)
        elif isinstance(node, dict):
            r = _parse_component(node)
            if r and r.id not in seen:
                seen.add(r.id)
                recipes.append(r)
            for v in node.values():
                if isinstance(v, (dict, list)):
                    walk(v)

    walk(data)
    return recipes


@router.get("/recipes", response_model=list[Recipe])
async def list_recipes(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    manager: PicnicClientManager = Depends(get_client_manager),
) -> list[Recipe]:
    try:
        client = await manager.get_client()
        resp = manager.raw_request("GET", "/pages/meals-page-root", token=client.session.auth_token)
        if resp.status_code != 200:
            raise RuntimeError(f"Fusion page returned {resp.status_code}: {resp.text[:200]}")
        recipes = _extract_recipes_from_fusion(resp.json())
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
        token = client.session.auth_token

        # Fetch recipe detail page
        resp = manager.raw_request("GET", f"/pages/recipe-details-page-root?recipe_id={recipe_id}", token=token)
        if resp.status_code != 200:
            raise HTTPException(status_code=404, detail="Recipe not found")

        recipe = _parse_component(resp.json()) or Recipe(id=recipe_id, name="Unknown", ingredients=[])

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
