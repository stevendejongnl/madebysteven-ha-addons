"""Pydantic models for Picnic API responses."""

from pydantic import BaseModel


class Ingredient(BaseModel):
    id: str
    name: str
    image_url: str | None = None
    unit_quantity: str | None = None
    price: int | None = None  # cents


class Recipe(BaseModel):
    id: str
    name: str
    image_url: str | None = None
    description: str | None = None
    ingredients: list[Ingredient] = []
    preparation_time: str | None = None


class CartItem(BaseModel):
    id: str
    name: str
    image_url: str | None = None
    unit_quantity: str | None = None
    price: int | None = None  # cents
    quantity: int = 1


class Basket(BaseModel):
    items: list[CartItem] = []
    total_price: int = 0  # cents
    total_count: int = 0


class DeliverySlot(BaseModel):
    slot_id: str | None = None
    window_start: str | None = None
    window_end: str | None = None
    state: str | None = None


class DeliveryInfo(BaseModel):
    next_slot: DeliverySlot | None = None
    current_order_status: str | None = None
    eta: str | None = None


class SearchResult(BaseModel):
    id: str
    name: str
    image_url: str | None = None
    unit_quantity: str | None = None
    price: int | None = None  # cents
