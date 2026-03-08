import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { api } from '../api'

type Step = 'idle' | 'sending' | '2fa' | 'verifying' | 'token' | 'done' | 'error'

@customElement('login-page')
export class LoginPage extends LitElement {
  @state() private step: Step = 'idle'
  @state() private otp = ''
  @state() private manualToken = ''
  @state() private error = ''

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 2rem;
      box-sizing: border-box;
    }
    .card {
      background: var(--surface);
      border-radius: 1rem;
      padding: 2rem;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      text-align: center;
    }
    h1 { margin: 0 0 0.5rem; font-size: 1.8rem; }
    p { color: var(--text-secondary, #666); margin: 0 0 1.5rem; }
    button {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 0.5rem;
      background: var(--picnic-green, #4CAF50);
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      font-size: 1rem;
      box-sizing: border-box;
      margin-bottom: 0.5rem;
    }
    input[type="text"][inputmode="numeric"] {
      font-size: 1.5rem;
      text-align: center;
      letter-spacing: 0.3rem;
    }
    textarea { font-size: 0.75rem; height: 80px; resize: none; }
    .divider { color: #aaa; margin: 1rem 0; font-size: 0.85rem; }
    .link { background: none; color: var(--picnic-green, #4CAF50); font-size: 0.85rem; padding: 0; width: auto; margin-top: 0; }
    .error { color: #e53e3e; margin-top: 0.5rem; font-size: 0.9rem; }
    .logo { font-size: 3rem; margin-bottom: 1rem; }
  `

  private async startLogin() {
    this.step = 'sending'
    this.error = ''
    try {
      const result = await api.login()
      if (!result.requires_2fa) {
        this.step = 'done'
        this.dispatchEvent(new CustomEvent('authenticated', { bubbles: true, composed: true }))
        return
      }
      await api.send2FA()
      this.step = '2fa'
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Login failed'
      this.step = 'error'
    }
  }

  private async submitToken() {
    this.step = 'verifying'
    this.error = ''
    try {
      await api.setToken(this.manualToken.trim())
      this.step = 'done'
      this.dispatchEvent(new CustomEvent('authenticated', { bubbles: true, composed: true }))
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Token rejected'
      this.step = 'token'
    }
  }

  private async verify() {
    this.step = 'verifying'
    this.error = ''
    try {
      await api.verify2FA(this.otp)
      this.step = 'done'
      this.dispatchEvent(new CustomEvent('authenticated', { bubbles: true, composed: true }))
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Verification failed'
      this.step = '2fa'
    }
  }

  render() {
    return html`
      <div class="card">
        <div class="logo">🥕</div>
        <h1>Picnic</h1>
        ${this.step === 'idle' || this.step === 'sending' || this.step === 'error' ? html`
          <p>Sign in with your Picnic account credentials configured in the add-on settings.</p>
          <button @click=${this.startLogin} ?disabled=${this.step === 'sending'}>
            ${this.step === 'sending' ? 'Signing in…' : 'Sign in'}
          </button>
          <p class="divider">— or —</p>
          <button class="link" @click=${() => { this.step = 'token'; this.error = '' }}>
            Paste auth token manually
          </button>
        ` : ''}
        ${this.step === 'token' ? html`
          <p>Paste your Picnic auth token (x-picnic-auth header value).</p>
          <textarea
            placeholder="eyJhbGci..."
            .value=${this.manualToken}
            @input=${(e: Event) => { this.manualToken = (e.target as HTMLTextAreaElement).value }}
          ></textarea>
          <button @click=${this.submitToken} ?disabled=${this.manualToken.length < 10}>
            Use this token
          </button>
          <button class="link" @click=${() => { this.step = 'idle' }}>Back</button>
        ` : ''}
        ${this.step === '2fa' || this.step === 'verifying' ? html`
          <p>Enter the verification code sent to your phone via SMS.</p>
          <input
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            .value=${this.otp}
            @input=${(e: Event) => { this.otp = (e.target as HTMLInputElement).value }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.verify() }}
            autofocus
          />
          <button @click=${this.verify} ?disabled=${this.step === 'verifying' || this.otp.length < 4}>
            ${this.step === 'verifying' ? 'Verifying…' : 'Verify'}
          </button>
          <button style="background:#888;margin-top:0.5rem" @click=${this.startLogin}>
            Resend code
          </button>
        ` : ''}
        ${this.error ? html`<p class="error">${this.error}</p>` : ''}
      </div>
    `
  }
}
