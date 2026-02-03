class PrefixComponent extends HTMLElement {
  
  connectedCallback() {
    this.textContent = 'Prefix Component';
  }
}

customElements.define('prefix-component', PrefixComponent);
