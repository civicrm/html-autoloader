class HelloWorldJs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = '<p>Hello, World!</p>';
  }
}

customElements.define('hello-world-js', HelloWorldJs);
