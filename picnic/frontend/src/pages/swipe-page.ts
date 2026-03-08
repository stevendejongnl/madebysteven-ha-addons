import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { api } from '../api'
import type { SearchResult } from '../types'
import '../components/swipe-deck'
import '../components/toast-message'
import type { SwipeDeck } from '../components/swipe-deck'
import type { ToastMessage } from '../components/toast-message'

const SUGGESTIONS = ['pasta', 'soep', 'salade', 'kip', 'vis', 'snack', 'ontbijt', 'kaas', 'brood', 'fruit']

@customElement('swipe-page')
export class SwipePage extends LitElement {
  @state() private items: SearchResult[] = []
  @state() private loading = false

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 100%;
      background: var(--picnic-bg);
    }

    .search-bar {
      display: flex;
      gap: 8px;
      padding: 0 20px 12px;
    }

    .search-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid var(--picnic-border);
      border-radius: 10px;
      font-size: 15px;
      font-family: inherit;
      background: var(--picnic-surface);
      color: var(--picnic-text-primary);
      outline: none;
    }

    .search-input:focus {
      border-color: var(--picnic-green);
    }

    .search-btn {
      padding: 10px 16px;
      background: var(--picnic-green);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      cursor: pointer;
    }

    .suggestions {
      display: flex;
      gap: 8px;
      padding: 0 20px 12px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .suggestion {
      white-space: nowrap;
      padding: 6px 12px;
      background: var(--picnic-bg-subtle);
      border: 1px solid var(--picnic-border);
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      color: var(--picnic-text-secondary);
      font-family: inherit;
      flex-shrink: 0;
    }

    .suggestion:hover {
      border-color: var(--picnic-green);
      color: var(--picnic-green);
    }

    .deck-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 20px;
    }

    .empty-prompt {
      text-align: center;
      color: var(--picnic-text-muted);
      font-size: 15px;
      line-height: 1.6;
    }

    .empty-emoji { font-size: 48px; margin-bottom: 12px; }

    .action-bar {
      display: flex;
      justify-content: center;
      gap: 24px;
      padding: 24px 20px 32px;
    }

    .action-btn {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: none;
      font-size: 28px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transition: transform 0.12s, box-shadow 0.12s;
    }

    .action-btn:hover { transform: scale(1.08); }
    .action-btn:active { transform: scale(0.96); }
    .btn-skip { background: white; }
    .btn-like { background: var(--picnic-green); }

    .hint {
      text-align: center;
      font-size: 12px;
      color: var(--picnic-text-muted);
      padding-bottom: 8px;
    }
  `

  connectedCallback(): void {
    super.connectedCallback()
    window.addEventListener('keydown', this._onKeydown)
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    window.removeEventListener('keydown', this._onKeydown)
  }

  private readonly _onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowRight') this._deck?.swipe('like')
    if (e.key === 'ArrowLeft') this._deck?.swipe('skip')
  }

  private get _deck(): SwipeDeck | null {
    return this.shadowRoot?.querySelector('swipe-deck') as SwipeDeck | null
  }

  private get _toast(): ToastMessage | null {
    return this.shadowRoot?.querySelector('toast-message') as ToastMessage | null
  }

  private async _search(q: string): Promise<void> {
    if (!q.trim()) return
    this.loading = true
    this.items = []
    try {
      this.items = await api.search(q)
    } catch {
      this._toast?.show('Zoeken mislukt', 'error')
    } finally {
      this.loading = false
    }
  }

  private _onInputKey(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement
      void this._search(input.value)
    }
  }

  private async _onSwiped(e: CustomEvent<{ direction: string; item: SearchResult }>): Promise<void> {
    const { direction, item } = e.detail
    this.items = this.items.slice(1)

    if (direction === 'like') {
      try {
        await api.addToBasket(item.id, 1)
        this._toast?.show(`${item.name} toegevoegd! 🛒`, 'success')
      } catch {
        this._toast?.show('Toevoegen mislukt', 'error')
      }
    }
  }

  render() {
    return html`
      <div class="search-bar">
        <input
          class="search-input"
          type="text"
          placeholder="Zoek een product…"
          @keydown="${this._onInputKey}"
        />
        <button class="search-btn" @click="${(e: Event) => {
          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
          void this._search(input.value)
        }}">🔍</button>
      </div>

      <div class="suggestions">
        ${SUGGESTIONS.map(s => html`
          <button class="suggestion" @click="${() => void this._search(s)}">${s}</button>
        `)}
      </div>

      <div class="deck-area">
        ${this.items.length > 0 || this.loading ? html`
          <swipe-deck
            .recipes="${this.items}"
            .loading="${this.loading}"
            @swiped="${this._onSwiped}"
          ></swipe-deck>
        ` : html`
          <div class="empty-prompt">
            <div class="empty-emoji">🥕</div>
            <div>Zoek een product en swipe<br>om toe te voegen aan je mandje</div>
          </div>
        `}
      </div>

      <div class="action-bar">
        <button class="action-btn btn-skip" title="Skip (←)" @click="${() => this._deck?.swipe('skip')}">✕</button>
        <button class="action-btn btn-like" title="Toevoegen (→)" @click="${() => this._deck?.swipe('like')}">🛒</button>
      </div>

      <div class="hint">← overslaan &nbsp;|&nbsp; toevoegen aan mandje →</div>

      <toast-message></toast-message>
    `
  }
}
