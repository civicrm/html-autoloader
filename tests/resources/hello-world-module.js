import greetings from './greetings.module.js';

class HelloWorldModule extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = '<p>' + greetings.fr_FR + '</p>';
  }
}

customElements.define('hello-world-module', HelloWorldModule);
