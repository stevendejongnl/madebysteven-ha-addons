import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import type { CartItem } from '../types'

@customElement('basket-item')
export class BasketItem extends LitElement {
  @property({ type: Object }) item!: CartItem

  static styles = css`
    :host {
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--picnic-border);
    }

    .item-image {
      width: 48px;
      height: 48px;
      object-fit: contain;
      border-radius: 8px;
      background: var(--picnic-bg-subtle);
      flex-shrink: 0;
    }

    .item-image-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: var(--picnic-bg-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--picnic-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-qty {
      font-size: 12px;
      color: var(--picnic-text-muted);
      margin-top: 2px;
    }

    .item-price {
      font-size: 14px;
      font-weight: 600;
      color: var(--picnic-text-primary);
      white-space: nowrap;
    }

    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--picnic-text-muted);
      font-size: 18px;
      line-height: 1;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.12s;
      flex-shrink: 0;
    }

    .remove-btn:hover {
      color: #f44336;
    }
  `

  private onRemove(): void {
    this.dispatchEvent(new CustomEvent('remove', {
      detail: { productId: this.item.id },
      bubbles: true,
      composed: true,
    }))
  }

  render() {
    const { item } = this
    const priceStr = item.price != null
      ? `€${((item.price * item.quantity) / 100).toFixed(2)}`
      : ''

    return html`
      <div class="item">
        ${item.image_url
          ? html`<img class="item-image" src="${item.image_url}" alt="${item.name}" loading="lazy" />`
          : html`<div class="item-image-placeholder">🛒</div>`}
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-qty">
            ${item.unit_quantity ?? ''}${item.quantity > 1 ? ` × ${item.quantity}` : ''}
          </div>
        </div>
        ${priceStr ? html`<div class="item-price">${priceStr}</div>` : ''}
        <button class="remove-btn" @click="${this.onRemove}" title="Verwijder">×</button>
      </div>
    `
  }
}
