import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { api } from '../api'
import type { SearchResult } from '../types'
import '../components/search-bar'
import '../components/toast-message'
import type { ToastMessage } from '../components/toast-message'

@customElement('search-page')
export class SearchPage extends LitElement {
  @state() private results: SearchResult[] = []
  @state() private loading = false

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
      padding: 16px 20px;
    }
  `

  private get _toast(): ToastMessage | null {
    return this.shadowRoot?.querySelector('toast-message') as ToastMessage | null
  }

  private async _onSearch(e: CustomEvent<{ query: string }>): Promise<void> {
    this.loading = true
    this.results = []
    try {
      this.results = await api.search(e.detail.query)
    } catch {
      this._toast?.show('Zoeken mislukt', 'error')
    } finally {
      this.loading = false
    }
  }

  private async _onAddProduct(e: CustomEvent<{ productId: string; name: string }>): Promise<void> {
    try {
      await api.addToBasket(e.detail.productId)
      this._toast?.show(`${e.detail.name} toegevoegd aan mandje`, 'success')
    } catch {
      this._toast?.show('Toevoegen mislukt', 'error')
    }
  }

  render() {
    return html`
      <div class="content">
        <search-bar
          .results="${this.results}"
          .loading="${this.loading}"
          @search="${this._onSearch}"
          @add-product="${this._onAddProduct}"
        ></search-bar>
      </div>

      <toast-message></toast-message>
    `
  }
}
