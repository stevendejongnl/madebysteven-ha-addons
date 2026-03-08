export interface Route {
  path: string
  component: string
  title: string
}

const routes: Route[] = [
  { path: '/', component: 'swipe-page', title: 'Picnic Swipe — Ontdekken' },
  { path: '/basket', component: 'basket-page', title: 'Picnic — Mandje' },
  { path: '/search', component: 'search-page', title: 'Picnic — Zoeken' },
  { path: '/delivery', component: 'delivery-page', title: 'Picnic — Bezorging' },
  { path: '*', component: 'not-found-page', title: 'Niet gevonden — Picnic' },
]

// Detect HA ingress base path (e.g. /api/hassio_ingress/<token>)
// Empty string when running locally.
function detectBasePath(): string {
  const match = window.location.pathname.match(/^(\/api\/hassio_ingress\/[^/]+)/)
  return match ? match[1] : ''
}

export const BASE_PATH = detectBasePath()

function matchRoute(fullPath: string): { route: Route; params: Record<string, string> } {
  // Strip ingress prefix before matching against route definitions
  const path = BASE_PATH && fullPath.startsWith(BASE_PATH)
    ? fullPath.slice(BASE_PATH.length) || '/'
    : fullPath

  for (const route of routes) {
    if (route.path === path) return { route, params: {} }

    if (route.path.includes(':')) {
      const paramNames = (route.path.match(/:[^/]+/g) ?? []).map((p) => p.slice(1))
      const pattern = route.path.replace(/:[^/]+/g, '([^/]+)')
      const match = path.match(new RegExp(`^${pattern}$`))
      if (match) {
        const params = Object.fromEntries(paramNames.map((name, i) => [name, match[i + 1]]))
        return { route, params }
      }
    }
  }
  return { route: routes[routes.length - 1], params: {} }
}

class Router {
  outlet: HTMLElement

  constructor(outlet: HTMLElement) {
    this.outlet = outlet
    window.addEventListener('popstate', () => this.handleRoute())
  }

  navigate(path: string): void {
    // Prepend ingress base so the URL stays under the ingress subpath
    window.history.pushState({}, '', BASE_PATH + path)
    this.handleRoute()
  }

  handleRoute(): void {
    const { route } = matchRoute(window.location.pathname)
    document.title = route.title
    const el = document.createElement(route.component)
    this.outlet.replaceChildren(el)
    // Sync active nav item on the shell
    const shell = document.querySelector('app-shell') as (HTMLElement & { active: string }) | null
    if (shell) {
      const map: Record<string, string> = {
        'swipe-page': 'swipe', 'basket-page': 'basket',
        'search-page': 'search', 'delivery-page': 'delivery',
      }
      shell.active = map[route.component] ?? 'swipe'
    }
  }

  start(): void {
    this.handleRoute()
  }
}

export const router = new Router(document.getElementById('app')!)

declare global {
  interface Window {
    router: Router
  }
}
window.router = router
