import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import type { SearchResult } from '../types'

@customElement('search-bar')
export class SearchBar extends LitElement {
  @property({ type: Array }) results: SearchResult[] = []
  @property({ type: Boolean }) loading = false

  @state() private query = ''

  private debounceTimer = 0

  static styles = css`
    :host {
      display: block;
    }

    .search-input-wrap {
      position: relative;
    }

    .search-input {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 16px;
      font-size: 15px;
      font-family: inherit;
      border: 2px solid var(--picnic-border);
      border-radius: 12px;
      background: var(--picnic-surface);
      color: var(--picnic-text-primary);
      outline: none;
      transition: border-color 0.15s;
    }

    .search-input:focus {
      border-color: var(--picnic-green);
    }

    .results-list {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: var(--picnic-surface);
      border: 1px solid var(--picnic-border);
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.1s;
    }

    .result-item:hover {
      background: var(--picnic-bg-subtle);
    }

    .result-image {
      width: 44px;
      height: 44px;
      object-fit: contain;
      border-radius: 6px;
      background: var(--picnic-bg-subtle);
      flex-shrink: 0;
    }

    .result-image-placeholder {
      width: 44px;
      height: 44px;
      background: var(--picnic-bg-subtle);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .result-info {
      flex: 1;
      min-width: 0;
    }

    .result-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--picnic-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result-qty {
      font-size: 12px;
      color: var(--picnic-text-muted);
    }

    .result-price {
      font-size: 14px;
      font-weight: 600;
      color: var(--picnic-text-primary);
      white-space: nowrap;
    }

    .add-btn {
      background: var(--picnic-green);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: opacity 0.12s;
    }

    .add-btn:hover {
      opacity: 0.85;
    }

    .loading-hint {
      text-align: center;
      color: var(--picnic-text-muted);
      font-size: 14px;
      padding: 20px 0;
    }
  `

  private onInput(e: Event): void {
    const q = (e.target as HTMLInputElement).value
    this.query = q
    clearTimeout(this.debounceTimer)
    this.debounceTimer = window.setTimeout(() => {
      if (q.trim().length >= 2) {
        this.dispatchEvent(new CustomEvent('search', {
          detail: { query: q.trim() },
          bubbles: true,
          composed: true,
        }))
      }
    }, 350)
  }

  private onAdd(result: SearchResult): void {
    this.dispatchEvent(new CustomEvent('add-product', {
      detail: { productId: result.id, name: result.name },
      bubbles: true,
      composed: true,
    }))
  }

  render() {
    return html`
      <div class="search-input-wrap">
        <input
          class="search-input"
          type="search"
          placeholder="Zoek producten…"
          .value="${this.query}"
          @input="${this.onInput}"
          autocomplete="off"
        />
      </div>

      ${this.loading
        ? html`<div class="loading-hint">Zoeken…</div>`
        : this.results.length > 0
          ? html`
            <div class="results-list">
              ${this.results.map((r) => html`
                <div class="result-item">
                  ${r.image_url
                    ? html`<img class="result-image" src="${r.image_url}" alt="${r.name}" loading="lazy" />`
                    : html`<div class="result-image-placeholder">🛍</div>`}
                  <div class="result-info">
                    <div class="result-name">${r.name}</div>
                    ${r.unit_quantity ? html`<div class="result-qty">${r.unit_quantity}</div>` : ''}
                  </div>
                  ${r.price != null ? html`<div class="result-price">€${(r.price / 100).toFixed(2)}</div>` : ''}
                  <button class="add-btn" @click="${() => this.onAdd(r)}">+ Voeg toe</button>
                </div>
              `)}
            </div>
          `
          : ''}
    `
  }
}
