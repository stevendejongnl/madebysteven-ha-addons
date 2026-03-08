import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'

const mockFetch = vi.fn()
global.fetch = mockFetch

function mockOk<T>(data: T): Response {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as unknown as Response
}

function mockError(status: number): Response {
  return {
    ok: false,
    status,
    text: () => Promise.resolve('Error'),
  } as unknown as Response
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('api.getRecipes', () => {
  it('fetches recipes with default pagination', async () => {
    mockFetch.mockResolvedValue(mockOk([{ id: 'r1', name: 'Pasta' }]))
    const result = await api.getRecipes()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/v1/recipes?offset=0&limit=20')
    expect(result).toHaveLength(1)
  })

  it('fetches recipes with custom pagination', async () => {
    mockFetch.mockResolvedValue(mockOk([]))
    await api.getRecipes(10, 5)
    expect(mockFetch.mock.calls[0][0]).toBe('/api/v1/recipes?offset=10&limit=5')
  })

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValue(mockError(502))
    await expect(api.getRecipes()).rejects.toThrow('HTTP 502')
  })
})

describe('api.addRecipeToBasket', () => {
  it('posts to correct URL', async () => {
    mockFetch.mockResolvedValue(mockOk({ added_count: 3, recipe_name: 'Pasta' }))
    const result = await api.addRecipeToBasket('r1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/recipes/r1/add-to-basket', { method: 'POST' })
    expect(result.added_count).toBe(3)
  })
})

describe('api.getBasket', () => {
  it('fetches basket', async () => {
    mockFetch.mockResolvedValue(mockOk({ items: [], total_price: 0, total_count: 0 }))
    const result = await api.getBasket()
    expect(mockFetch.mock.calls[0][0]).toBe('/api/v1/basket')
    expect(result.items).toHaveLength(0)
  })
})

describe('api.addToBasket', () => {
  it('posts product with count', async () => {
    mockFetch.mockResolvedValue(mockOk({ status: 'added' }))
    await api.addToBasket('p1', 2)
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/basket/items', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ product_id: 'p1', count: 2 }),
    }))
  })

  it('defaults count to 1', async () => {
    mockFetch.mockResolvedValue(mockOk({ status: 'added' }))
    await api.addToBasket('p1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/basket/items', expect.objectContaining({
      body: JSON.stringify({ product_id: 'p1', count: 1 }),
    }))
  })
})

describe('api.removeFromBasket', () => {
  it('sends DELETE request', async () => {
    mockFetch.mockResolvedValue(mockOk({ status: 'removed' }))
    await api.removeFromBasket('p1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/basket/items/p1', { method: 'DELETE' })
  })
})

describe('api.search', () => {
  it('URL-encodes the query', async () => {
    mockFetch.mockResolvedValue(mockOk([]))
    await api.search('halvolle melk')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/v1/search?q=halvolle%20melk')
  })
})

describe('api.getDelivery', () => {
  it('fetches delivery info', async () => {
    mockFetch.mockResolvedValue(mockOk({ next_slot: null, current_order_status: null, eta: null }))
    const result = await api.getDelivery()
    expect(result.next_slot).toBeNull()
  })
})
