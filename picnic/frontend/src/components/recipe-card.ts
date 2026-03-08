import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import type { SearchResult } from '../types'

@customElement('recipe-card')
export class RecipeCard extends LitElement {
  @property({ type: Object }) recipe!: SearchResult
  @property({ type: Number }) dx = 0

  static styles = css`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      user-select: none;
      touch-action: none;
    }

    .card {
      position: relative;
      width: 100%;
      height: 100%;
      background: var(--picnic-surface);
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
      overflow: hidden;
      cursor: grab;
    }

    .card:active {
      cursor: grabbing;
    }

    .card-image {
      width: 100%;
      height: 60%;
      object-fit: contain;
      background: var(--picnic-bg-subtle);
      display: block;
      padding: 16px;
      box-sizing: border-box;
    }

    .card-image-placeholder {
      width: 100%;
      height: 60%;
      background: var(--picnic-bg-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 64px;
    }

    .card-body {
      padding: 16px 20px;
    }

    .card-name {
      font-size: 20px;
      font-weight: 700;
      color: var(--picnic-text-primary);
      margin-bottom: 6px;
      line-height: 1.2;
    }

    .card-meta {
      display: flex;
      gap: 12px;
      align-items: center;
      color: var(--picnic-text-muted);
      font-size: 14px;
      margin-top: 8px;
    }

    .card-price {
      font-size: 22px;
      font-weight: 700;
      color: var(--picnic-green);
    }

    .badge {
      position: absolute;
      top: 24px;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 2px;
      padding: 6px 14px;
      border-radius: 8px;
      border: 3px solid;
      opacity: 0;
      transition: opacity 0.1s ease;
      text-transform: uppercase;
      pointer-events: none;
    }

    .badge-like {
      left: 20px;
      color: #4CAF50;
      border-color: #4CAF50;
      transform: rotate(-10deg);
    }

    .badge-skip {
      right: 20px;
      color: #f44336;
      border-color: #f44336;
      transform: rotate(10deg);
    }
  `

  render() {
    const { recipe, dx } = this
    const rotation = dx * 0.08
    const transform = `translateX(${dx}px) rotate(${rotation}deg)`
    const likeOpacity = Math.min(1, Math.max(0, (dx - 40) / 80))
    const skipOpacity = Math.min(1, Math.max(0, (-dx - 40) / 80))
    const price = recipe.price != null ? `€ ${(recipe.price / 100).toFixed(2)}` : ''

    return html`
      <div class="card" style="transform: ${transform}">
        ${recipe.image_url
          ? html`<img class="card-image" src="${recipe.image_url}" alt="${recipe.name}" loading="lazy" />`
          : html`<div class="card-image-placeholder">🛒</div>`}

        <div class="badge badge-like" style="opacity: ${likeOpacity}">VOEG TOE</div>
        <div class="badge badge-skip" style="opacity: ${skipOpacity}">SKIP</div>

        <div class="card-body">
          <div class="card-name">${recipe.name}</div>
          <div class="card-meta">
            ${recipe.unit_quantity ? html`<span>${recipe.unit_quantity}</span>` : ''}
            ${price ? html`<span class="card-price">${price}</span>` : ''}
          </div>
        </div>
      </div>
    `
  }
}
