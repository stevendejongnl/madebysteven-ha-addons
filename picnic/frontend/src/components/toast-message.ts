import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('toast-message')
export class ToastMessage extends LitElement {
  @property({ type: String }) message = ''
  @property({ type: String }) type: 'success' | 'error' = 'success'
  @state() private visible = false

  private hideTimer = 0

  static styles = css`
    :host {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      pointer-events: none;
    }

    .toast {
      padding: 12px 20px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .toast.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .toast.success {
      background: var(--picnic-green);
    }

    .toast.error {
      background: #f44336;
    }
  `

  show(message: string, type: 'success' | 'error' = 'success', duration = 3000): void {
    clearTimeout(this.hideTimer)
    this.message = message
    this.type = type
    this.visible = true
    this.hideTimer = window.setTimeout(() => { this.visible = false }, duration)
  }

  render() {
    return html`
      <div class="toast ${this.type} ${this.visible ? 'visible' : ''}">
        ${this.message}
      </div>
    `
  }
}
