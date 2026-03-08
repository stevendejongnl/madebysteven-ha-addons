import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
  }),
})

describe('theme', () => {
  beforeEach(() => {
    localStorageMock.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('getEffectiveTheme returns light by default', async () => {
    const { getEffectiveTheme } = await import('./theme')
    expect(getEffectiveTheme()).toBe('light')
  })

  it('getEffectiveTheme returns stored value', async () => {
    localStorageMock.setItem('picnic_theme', 'dark')
    const { getEffectiveTheme } = await import('./theme')
    expect(getEffectiveTheme()).toBe('dark')
  })

  it('toggleTheme switches from light to dark', async () => {
    const { toggleTheme, getEffectiveTheme } = await import('./theme')
    toggleTheme()
    expect(getEffectiveTheme()).toBe('dark')
  })

  it('initTheme sets data-theme attribute', async () => {
    const { initTheme } = await import('./theme')
    initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
