import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export type NavItem = 'swipe' | 'search' | 'basket' | 'delivery'

@customElement('app-shell')
export class AppShell extends LitElement {
  @property({ type: String }) active: NavItem = 'swipe'

  static styles = css`
    :host {
      display: flex;
      height: 100%;
      background: var(--picnic-bg);
    }

    /* ── Sidebar (desktop) ── */
    .sidebar {
      display: none;
      flex-direction: column;
      width: 220px;
      flex-shrink: 0;
      background: var(--picnic-surface);
      border-right: 1px solid var(--picnic-border);
      padding: 24px 0 16px;
    }

    .logo {
      font-size: 22px;
      font-weight: 800;
      color: var(--picnic-green);
      padding: 0 24px 28px;
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 24px;
      background: none;
      border: none;
      font-size: 14px;
      font-family: inherit;
      font-weight: 500;
      color: var(--picnic-text-secondary);
      cursor: pointer;
      text-align: left;
      border-radius: 0;
      transition: background 0.1s, color 0.1s;
    }

    .nav-item:hover {
      background: var(--picnic-bg-subtle);
      color: var(--picnic-text-primary);
    }

    .nav-item.active {
      background: color-mix(in srgb, var(--picnic-green) 12%, transparent);
      color: var(--picnic-green);
      font-weight: 600;
    }

    .nav-icon {
      font-size: 18px;
      width: 22px;
      text-align: center;
    }

    /* ── Main content ── */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    /* ── Top bar (mobile only) ── */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: var(--picnic-surface);
      border-bottom: 1px solid var(--picnic-border);
    }

    .topbar-logo {
      font-size: 20px;
      font-weight: 800;
      color: var(--picnic-green);
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* ── Bottom nav (mobile only) ── */
    .bottom-nav {
      display: flex;
      border-top: 1px solid var(--picnic-border);
      background: var(--picnic-surface);
    }

    .bottom-nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 10px 0 12px;
      background: none;
      border: none;
      font-family: inherit;
      cursor: pointer;
      color: var(--picnic-text-muted);
      font-size: 10px;
      font-weight: 500;
      transition: color 0.1s;
    }

    .bottom-nav-item .icon {
      font-size: 20px;
    }

    .bottom-nav-item.active {
      color: var(--picnic-green);
    }

    /* ── Responsive breakpoint ── */
    @media (min-width: 768px) {
      .sidebar { display: flex; }
      .topbar { display: none; }
      .bottom-nav { display: none; }
    }
  `

  private _nav(route: string, item: NavItem) {
    window.router.navigate(route)
    // active will update via re-render from router
    this.active = item
  }

  render() {
    const nav = (icon: string, label: string, item: NavItem, route: string) => html`
      <button
        class="nav-item ${this.active === item ? 'active' : ''}"
        @click="${() => this._nav(route, item)}"
      >
        <span class="nav-icon">${icon}</span>
        ${label}
      </button>
    `

    const bottomNav = (icon: string, label: string, item: NavItem, route: string) => html`
      <button
        class="bottom-nav-item ${this.active === item ? 'active' : ''}"
        @click="${() => this._nav(route, item)}"
      >
        <span class="icon">${icon}</span>
        ${label}
      </button>
    `

    return html`
      <nav class="sidebar">
        <div class="logo">Picnic</div>
        <div class="nav-list">
          ${nav('🥕', 'Ontdekken', 'swipe', '/')}
          ${nav('🔍', 'Zoeken', 'search', '/search')}
          ${nav('🛒', 'Mandje', 'basket', '/basket')}
          ${nav('🚲', 'Bezorging', 'delivery', '/delivery')}
        </div>
      </nav>

      <div class="main">
        <div class="topbar">
          <div class="topbar-logo">Picnic</div>
        </div>

        <div class="page-content">
          <slot></slot>
        </div>

        <nav class="bottom-nav">
          ${bottomNav('🥕', 'Ontdekken', 'swipe', '/')}
          ${bottomNav('🔍', 'Zoeken', 'search', '/search')}
          ${bottomNav('🛒', 'Mandje', 'basket', '/basket')}
          ${bottomNav('🚲', 'Bezorging', 'delivery', '/delivery')}
        </nav>
      </div>
    `
  }
}
