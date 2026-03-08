import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { api } from '../api'
import type { DeliveryInfo } from '../types'

@customElement('delivery-page')
export class DeliveryPage extends LitElement {
  @state() private info: DeliveryInfo | null = null
  @state() private loading = true
  @state() private error = ''

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--picnic-bg);
    }

    .content {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card {
      background: var(--picnic-surface);
      border: 1px solid var(--picnic-border);
      border-radius: 12px;
      padding: 16px 20px;
    }

    .card-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--picnic-text-muted);
      margin-bottom: 8px;
    }

    .card-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--picnic-text-primary);
    }

    .card-sub {
      font-size: 13px;
      color: var(--picnic-text-secondary);
      margin-top: 4px;
    }

    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      background: color-mix(in srgb, var(--picnic-green) 15%, transparent);
      color: var(--picnic-green);
    }

    .loading-hint {
      text-align: center;
      color: var(--picnic-text-muted);
      padding: 40px 0;
    }

    .error-hint {
      text-align: center;
      color: #f44336;
      padding: 40px 0;
    }
  `

  connectedCallback(): void {
    super.connectedCallback()
    void this._load()
  }

  private async _load(): Promise<void> {
    this.loading = true
    this.error = ''
    try {
      this.info = await api.getDelivery()
    } catch {
      this.error = 'Bezorginformatie laden mislukt'
    } finally {
      this.loading = false
    }
  }

  private _formatWindow(start: string | null, end: string | null): string {
    if (!start) return 'Onbekend'
    try {
      const s = new Date(start)
      const e = end ? new Date(end) : null
      const dayStr = s.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
      const startTime = s.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
      const endTime = e?.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) ?? ''
      return `${dayStr}, ${startTime}${endTime ? `–${endTime}` : ''}`
    } catch {
      return start
    }
  }

  render() {
    if (this.loading) {
      return html`<div class="content"><div class="loading-hint">Laden…</div></div>`
    }

    if (this.error) {
      return html`<div class="content"><div class="error-hint">${this.error}</div></div>`
    }

    const { info } = this

    return html`
      <div class="content">
        ${info?.next_slot
          ? html`
            <div class="card">
              <div class="card-label">Volgende bezorging</div>
              <div class="card-value">
                ${this._formatWindow(info.next_slot.window_start, info.next_slot.window_end)}
              </div>
              ${info.next_slot.state
                ? html`<div class="card-sub"><span class="status-badge">${info.next_slot.state}</span></div>`
                : ''}
            </div>
          `
          : html`
            <div class="card">
              <div class="card-label">Volgende bezorging</div>
              <div class="card-value">Geen bezorgmoment gepland</div>
            </div>
          `}

        ${info?.current_order_status
          ? html`
            <div class="card">
              <div class="card-label">Huidige bestelling</div>
              <div class="card-value">
                <span class="status-badge">${info.current_order_status}</span>
              </div>
              ${info.eta
                ? html`<div class="card-sub">ETA: ${this._formatWindow(info.eta, null)}</div>`
                : ''}
            </div>
          `
          : ''}
      </div>
    `
  }
}
