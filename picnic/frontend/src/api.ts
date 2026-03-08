import type { AuthStatus, Basket, DeliveryInfo, Recipe, SearchResult } from './types'
import { BASE_PATH } from './router'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // BASE_PATH is the stable ingress prefix (e.g. /api/hassio_ingress/<token>)
  // path starts with 'api/v1/...' (no leading slash)
  const resp = await fetch(`${BASE_PATH}/${path}`, init)
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${await resp.text()}`)
  }
  return resp.json() as Promise<T>
}

export const api = {
  getAuthStatus(): Promise<AuthStatus> {
    return request('api/v1/auth/status')
  },

  login(): Promise<{ status: string; requires_2fa: boolean }> {
    return request('api/v1/auth/login', { method: 'POST' })
  },

  send2FA(): Promise<{ status: string }> {
    return request('api/v1/auth/2fa/send', { method: 'POST' })
  },

  verify2FA(otp: string): Promise<{ status: string }> {
    return request('api/v1/auth/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    })
  },

  setToken(token: string): Promise<{ status: string }> {
    return request('api/v1/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
  },

  getRecipes(offset = 0, limit = 20): Promise<Recipe[]> {
    return request(`api/v1/recipes?offset=${offset}&limit=${limit}`)
  },

  addRecipeToBasket(recipeId: string): Promise<{ added_count: number; recipe_name: string }> {
    return request(`api/v1/recipes/${recipeId}/add-to-basket`, { method: 'POST' })
  },

  getBasket(): Promise<Basket> {
    return request('api/v1/basket')
  },

  addToBasket(productId: string, count = 1): Promise<{ status: string }> {
    return request('api/v1/basket/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, count }),
    })
  },

  removeFromBasket(productId: string): Promise<{ status: string }> {
    return request(`api/v1/basket/items/${productId}`, { method: 'DELETE' })
  },

  search(q: string): Promise<SearchResult[]> {
    return request(`api/v1/search?q=${encodeURIComponent(q)}`)
  },

  getDelivery(): Promise<DeliveryInfo> {
    return request('api/v1/delivery')
  },
}
