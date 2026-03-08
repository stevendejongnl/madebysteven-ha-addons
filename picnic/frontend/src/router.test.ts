import { describe, expect, it, vi, beforeEach } from 'vitest'

// We need to mock document.getElementById before importing router
const mockOutlet = document.createElement('div')
mockOutlet.id = 'app'
document.body.appendChild(mockOutlet)

describe('router', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('navigates to basket and sets title', async () => {
    const { router } = await import('./router')
    router.navigate('/basket')
    expect(document.title).toContain('Mandje')
  })

  it('navigates to search', async () => {
    const { router } = await import('./router')
    router.navigate('/search')
    expect(document.title).toContain('Zoeken')
  })

  it('navigates to delivery', async () => {
    const { router } = await import('./router')
    router.navigate('/delivery')
    expect(document.title).toContain('Bezorging')
  })

  it('falls back to not-found for unknown paths', async () => {
    const { router } = await import('./router')
    router.navigate('/unknown-path-xyz')
    expect(document.title).toContain('Niet gevonden')
  })

  it('handles popstate event', async () => {
    const { router } = await import('./router')
    router.navigate('/basket')
    window.history.pushState({}, '', '/search')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(document.title).toContain('Zoeken')
  })

  it('global window.router is accessible', async () => {
    await import('./router')
    expect(window.router).toBeDefined()
    expect(typeof window.router.navigate).toBe('function')
  })

  it('navigate to / shows swipe page title', async () => {
    const { router } = await import('./router')
    router.navigate('/')
    expect(document.title).toContain('Recepten')
  })
})

// Suppress unused var warning in vitest
void vi
