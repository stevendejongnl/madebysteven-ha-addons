export interface Ingredient {
  id: string
  name: string
  image_url: string | null
  unit_quantity: string | null
  price: number | null
}

export interface Recipe {
  id: string
  name: string
  image_url: string | null
  description: string | null
  ingredients: Ingredient[]
  preparation_time: string | null
}

export interface CartItem {
  id: string
  name: string
  image_url: string | null
  unit_quantity: string | null
  price: number | null
  quantity: number
}

export interface Basket {
  items: CartItem[]
  total_price: number
  total_count: number
}

export interface DeliverySlot {
  slot_id: string | null
  window_start: string | null
  window_end: string | null
  state: string | null
}

export interface DeliveryInfo {
  next_slot: DeliverySlot | null
  current_order_status: string | null
  eta: string | null
}

export interface SearchResult {
  id: string
  name: string
  image_url: string | null
  unit_quantity: string | null
  price: number | null
}
