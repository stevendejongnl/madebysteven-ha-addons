import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import type { SearchResult } from '../types'
import './recipe-card'

const COMMIT_THRESHOLD = 120
const BADGE_THRESHOLD = 40

export type SwipeDirection = 'like' | 'skip'

@customElement('swipe-deck')
export class SwipeDeck extends LitElement {
  @property({ type: Array }) recipes: SearchResult[] = []
  @property({ type: Boolean }) loading = false

  @state() private dx = 0
  @state() private snapping = false
  @state() private flyingOut: SwipeDirection | null = null

  private startX = 0
  private isDragging = false

  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      max-width: 400px;
      height: 500px;
      margin: 0 auto;
    }

    .deck-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .background-card {
      position: absolute;
      inset: 0;
      background: var(--picnic-surface);
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transform: scale(0.96) translateY(8px);
      opacity: 0.7;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
      color: var(--picnic-text-muted);
      font-size: 16px;
      text-align: center;
    }

    .empty-emoji {
      font-size: 48px;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--picnic-text-muted);
      font-size: 15px;
    }

    recipe-card {
      transition: none;
    }

    recipe-card.snapping {
      transition: transform 0.3s ease;
    }

    recipe-card.flying-out-like {
      transition: transform 0.4s ease, opacity 0.4s ease;
      transform: translateX(120vw) rotate(20deg) !important;
      opacity: 0;
    }

    recipe-card.flying-out-skip {
      transition: transform 0.4s ease, opacity 0.4s ease;
      transform: translateX(-120vw) rotate(-20deg) !important;
      opacity: 0;
    }
  `

  private get currentRecipe(): SearchResult | undefined {
    return this.recipes[0]
  }

  private get nextRecipe(): SearchResult | undefined {
    return this.recipes[1]
  }

  private onPointerDown(e: PointerEvent): void {
    if (this.flyingOut) return
    this.isDragging = true
    this.startX = e.clientX
    this.dx = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return
    this.dx = e.clientX - this.startX
  }

  private onPointerUp(_e: PointerEvent): void {
    if (!this.isDragging) return
    this.isDragging = false

    if (this.dx > COMMIT_THRESHOLD) {
      this._commitSwipe('like')
    } else if (this.dx < -COMMIT_THRESHOLD) {
      this._commitSwipe('skip')
    } else {
      this._snapBack()
    }
  }

  private _snapBack(): void {
    this.snapping = true
    this.dx = 0
    setTimeout(() => { this.snapping = false }, 300)
  }

  private _commitSwipe(direction: SwipeDirection): void {
    this.flyingOut = direction
    setTimeout(() => {
      this.flyingOut = null
      this.dx = 0
      this.dispatchEvent(new CustomEvent('swiped', {
        detail: { direction, item: this.currentRecipe },
        bubbles: true,
        composed: true,
      }))
    }, 400)
  }

  /** Programmatic swipe — used by keyboard shortcuts */
  swipe(direction: SwipeDirection): void {
    if (this.flyingOut || !this.currentRecipe) return
    this.dx = direction === 'like' ? BADGE_THRESHOLD + 10 : -(BADGE_THRESHOLD + 10)
    setTimeout(() => this._commitSwipe(direction), 50)
  }

  render() {
    if (this.loading) {
      return html`<div class="loading-state">Producten laden…</div>`
    }

    if (!this.currentRecipe) {
      return html`
        <div class="empty-state">
          <div class="empty-emoji">🎉</div>
          <div>Dat was alles!</div>
        </div>
      `
    }

    const cardClass = [
      this.snapping ? 'snapping' : '',
      this.flyingOut === 'like' ? 'flying-out-like' : '',
      this.flyingOut === 'skip' ? 'flying-out-skip' : '',
    ].filter(Boolean).join(' ')

    return html`
      <div class="deck-container">
        ${this.nextRecipe ? html`<div class="background-card"></div>` : nothing}
        <recipe-card
          class="${cardClass}"
          .recipe="${this.currentRecipe}"
          .dx="${this.flyingOut ? 0 : this.dx}"
          @pointerdown="${this.onPointerDown}"
          @pointermove="${this.onPointerMove}"
          @pointerup="${this.onPointerUp}"
          @pointercancel="${this.onPointerUp}"
        ></recipe-card>
      </div>
    `
  }
}
