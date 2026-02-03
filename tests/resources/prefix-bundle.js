class PrefixRed extends HTMLElement {
  connectedCallback() {
    this.textContent = 'Prefix Red';
  }
}

class PrefixGreen extends HTMLElement {
  connectedCallback() {
    this.textContent = 'Prefix Green';
  }
}

customElements.define('prefix-red', PrefixRed);
customElements.define('prefix-green', PrefixGreen);
