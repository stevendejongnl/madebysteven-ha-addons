import { initTheme } from './theme'
import { api } from './api'

import './pages/login-page'
import './pages/swipe-page'
import './pages/basket-page'
import './pages/search-page'
import './pages/delivery-page'
import './pages/not-found-page'
import './components/app-shell'
import type { AppShell } from './components/app-shell'
import { router } from './router'

// Inject global CSS variables
const style = document.createElement('style')
style.textContent = `
  :root {
    --picnic-green: #4CAF50;
    --picnic-bg: #f5f7f5;
    --picnic-surface: #ffffff;
    --picnic-bg-subtle: #f0f4f0;
    --picnic-border: #e0e8e0;
    --picnic-text-primary: #1a2e1a;
    --picnic-text-secondary: #4a6a4a;
    --picnic-text-muted: #8aaa8a;
    --surface: var(--picnic-surface);
    --text-secondary: var(--picnic-text-secondary);
  }

  [data-theme="dark"] {
    --picnic-bg: #0f1f0f;
    --picnic-surface: #1a2e1a;
    --picnic-bg-subtle: #1f3a1f;
    --picnic-border: #2a4a2a;
    --picnic-text-primary: #e8f5e8;
    --picnic-text-secondary: #a8c8a8;
    --picnic-text-muted: #6a8a6a;
  }

  html, body, #app {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  #app {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
  }
`
document.head.appendChild(style)

initTheme()

async function boot() {
  const appEl = document.getElementById('app')!
  try {
    const status = await api.getAuthStatus()
    if (status.authenticated) {
      startWithShell(appEl)
    } else {
      showLogin(appEl)
    }
  } catch {
    startWithShell(appEl)
  }
}

function startWithShell(appEl: HTMLElement) {
  const shell = document.createElement('app-shell') as AppShell
  shell.style.cssText = 'flex:1;min-height:0;'
  appEl.appendChild(shell)
  // Router outlet is the shell's slot host — we need an inner div
  const outlet = document.createElement('div')
  outlet.style.cssText = 'height:100%;display:flex;flex-direction:column;'
  shell.appendChild(outlet)
  router.outlet = outlet
  router.start()
}

function showLogin(appEl: HTMLElement) {
  const login = document.createElement('login-page')
  appEl.appendChild(login)
  login.addEventListener('authenticated', () => {
    appEl.removeChild(login)
    startWithShell(appEl)
  })
}

boot()
