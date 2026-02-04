class HtmlAutoloader {
  constructor(importMeta) {
    this.importMeta = importMeta;
    this.availableElements = {};
    this.availablePrefixes = {};
    this.resourceTypes = {};
    this.loadedElements = new Set();
    this.isRegistered = false;

    for (const resourceType of this.#createDefaultResourceTypes()) {
      this.addResourceType(resourceType);
    }
  }

  #createDefaultResourceTypes() {
    return [
      {
        name: 'js',
        onLoad: (resource) => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = resource;
            script.onload = () => resolve(`JS loaded: ${resource}`);
            script.onerror = () => reject(new Error(`Failed to load JS: ${resource}`));
            document.head.appendChild(script);
          });
        },
      },
      {
        name: 'css',
        onLoad: (resource) => {
          return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = resource;
            link.type = 'text/css';
            link.onload = () => resolve(`CSS loaded: ${resource}`);
            link.onerror = () => reject(new Error(`Failed to load CSS: ${resource}`));
            document.head.appendChild(link);
          });
        },
      },
      {
        name: 'html',
        onLoad: (resource) => {
          return fetch(resource)
            .then((response) => response.text())
            .then((html) => {
              appendHtmlWithScripts(html);
              return `HTML loaded: ${resource}`;
            });
        },
      },
      {
        name: 'module',
        onLoad: (resource) => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = resource;
            script.onload = () => resolve(`Module loaded: ${resource}`);
            script.onerror = () => reject(new Error(`Failed to load module: ${resource}`));
            document.head.appendChild(script);
          });
        },
      },
      {
        name: 'import',
        onLoad: (resource) => {
          const resolvedResource = this.importMeta.resolve(resource);
          return import(resolvedResource).then(() => `Import loaded: ${resolvedResource}`);
        },
      },
    ];
  }

  addElement(elementRule) {
    if (this.isRegistered) {
      throw new Error('Cannot add new rules after registration.');
    }
    if (elementRule.element) {
      this.availableElements[elementRule.element] = elementRule;
    } else if (elementRule.prefix) {
      if (!elementRule.prefix.endsWith('-')) {
        throw new Error(`Prefix must end with a hyphen: ${elementRule.prefix}`);
      }
      const char = elementRule.prefix.charAt(0);
      this.availablePrefixes[char] = this.availablePrefixes[char] || [];
      this.availablePrefixes[char].push(elementRule);
    }
    return this;
  }

  addElements(elementRules) {
    if (this.isRegistered) {
      throw new Error('Cannot add new rules after registration.');
    }
    for (const elementRule of elementRules) {
      this.addElement(elementRule);
    }
    return this;
  }

  addResourceType(resourceTypeDef) {
    if (this.isRegistered) {
      throw new Error('Cannot add new resource types after registration.');
    }
    this.resourceTypes[resourceTypeDef.name] = resourceTypeDef;
    return this;
  }

  register() {
    this.isRegistered = true;

    // Scan for existing elements
    this.#scan(document.body);

    // Watch for new elements
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.#scan(node);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return this;
  }

  #scan(rootNode) {
    const elements = rootNode.querySelectorAll('*');
    for (const element of elements) {
      if (element.localName.includes('-')) {
        this.loadElement(element.localName);
      }
    }
  }

  async loadElement(name) {
    if (this.loadedElements.has(name)) {
      return;
    }
    this.loadedElements.add(name);

    const rules = this.#claimRulesFor(name);
    if (!rules.length) {
      return;
    }

    const promises = [];
    for (const rule of rules) {
      for (const resourceType in rule.resources) {
        if (this.resourceTypes[resourceType]) {
          const resource = rule.resources[resourceType];
          promises.push(this.resourceTypes[resourceType].onLoad(resource, name, rule));
        }
      }
    }
    return Promise.all(promises);
  }

  #claimRulesFor(name) {
    const foundRules = [];

    if (this.availableElements[name]) {
      foundRules.push(this.availableElements[name]);
      delete this.availableElements[name];
    }

    const char = name.charAt(0);
    const prefixes = this.availablePrefixes[char] || [];
    for (const offset in prefixes) {
      const rule = prefixes[offset];
      if (name.startsWith(rule.prefix)) {
        foundRules.push(rule);
        delete prefixes[offset];
      }
    }
    return foundRules;
  }
}

function appendHtmlWithScripts(htmlData) {
  const template = document.createElement('template');
  template.innerHTML = htmlData;

  const fragment = template.content;

  // Move nodes one by one so scripts execute
  Array.from(fragment.childNodes).forEach((node) => {
    if (node.nodeName === 'SCRIPT') {
      const script = document.createElement('script');

      Array.from(node.attributes).forEach((attr) => {
        script.setAttribute(attr.name, attr.value);
      });

      if (node.textContent) {
        script.textContent = node.textContent;
      }

      document.body.appendChild(script);
    } else {
      document.body.appendChild(node);
    }
  });
}

export default HtmlAutoloader;
