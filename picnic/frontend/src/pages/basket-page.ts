import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { api } from '../api'
import type { Basket } from '../types'
import '../components/basket-item'
import '../components/toast-message'
import type { ToastMessage } from '../components/toast-message'

@customElement('basket-page')
export class BasketPage extends LitElement {
  @state() private basket: Basket | null = null
  @state() private loading = true

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--picnic-bg);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 0 20px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      gap: 10px;
      color: var(--picnic-text-muted);
    }

    .empty-emoji {
      font-size: 40px;
    }

    .footer {
      padding: 16px 20px;
      border-top: 1px solid var(--picnic-border);
      background: var(--picnic-surface);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 700;
      color: var(--picnic-text-primary);
    }

    .loading-hint {
      text-align: center;
      color: var(--picnic-text-muted);
      padding: 40px 0;
    }
  `

  connectedCallback(): void {
    super.connectedCallback()
    void this._loadBasket()
  }

  private get _toast(): ToastMessage | null {
    return this.shadowRoot?.querySelector('toast-message') as ToastMessage | null
  }

  private async _loadBasket(): Promise<void> {
    this.loading = true
    try {
      this.basket = await api.getBasket()
    } catch {
      this._toast?.show('Mandje laden mislukt', 'error')
    } finally {
      this.loading = false
    }
  }

  private async _onRemove(e: CustomEvent<{ productId: string }>): Promise<void> {
    try {
      await api.removeFromBasket(e.detail.productId)
      await this._loadBasket()
      this._toast?.show('Product verwijderd', 'success')
    } catch {
      this._toast?.show('Verwijderen mislukt', 'error')
    }
  }

  render() {
    const total = this.basket ? `€${(this.basket.total_price / 100).toFixed(2)}` : '—'

    return html`
      <div class="content">
        ${this.loading
          ? html`<div class="loading-hint">Mandje laden…</div>`
          : !this.basket || this.basket.items.length === 0
            ? html`
              <div class="empty-state">
                <div class="empty-emoji">🛒</div>
                <div>Je mandje is leeg</div>
              </div>
            `
            : this.basket.items.map((item) => html`
              <basket-item .item="${item}" @remove="${this._onRemove}"></basket-item>
            `)}
      </div>

      ${!this.loading && this.basket && this.basket.items.length > 0
        ? html`
          <div class="footer">
            <div class="total-row">
              <span>${this.basket.total_count} producten</span>
              <span>${total}</span>
            </div>
          </div>
        `
        : ''}

      <toast-message></toast-message>
    `
  }
}
