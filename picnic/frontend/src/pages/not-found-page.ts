import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('not-found-page')
export class NotFoundPage extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      background: var(--picnic-bg);
      color: var(--picnic-text-muted);
      text-align: center;
    }

    .emoji { font-size: 56px; }
    .title { font-size: 20px; font-weight: 700; color: var(--picnic-text-primary); }
    .btn {
      margin-top: 8px;
      background: var(--picnic-green);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
    }
  `

  render() {
    return html`
      <div class="emoji">🥦</div>
      <div class="title">Pagina niet gevonden</div>
      <button class="btn" @click="${() => window.router.navigate('/')}">Terug naar huis</button>
    `
  }
}
