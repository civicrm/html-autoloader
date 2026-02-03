class HtmlAutoloader {

  constructor(importMeta) {
    this.importMeta = importMeta;
    this.elementRules = [];
    this.resourceTypes = {};
    this.loadedElements = new Set();
    this.loadedRules = new Set();

    this.addResourceType({
      name: 'js',
      onLoad: (resource, elementName, elementRule) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = resource;
          script.onload = () => resolve(`JS loaded: ${resource}`);
          script.onerror = () => reject(new Error(`Failed to load JS: ${resource}`));
          document.head.appendChild(script);
        });
      }
    });
    this.addResourceType({
      name: 'css',
      onLoad: (resource, elementName, elementRule) => {
        return new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = resource;
          link.type = 'text/css';
          link.onload = () => resolve(`CSS loaded: ${resource}`);
          link.onerror = () => reject(new Error(`Failed to load CSS: ${resource}`));
          document.head.appendChild(link);
        });
      }
    });
    this.addResourceType({
      name: 'html',
      onLoad: (resource, elementName, elementRule) => {
        return fetch(resource)
          .then(response => response.text())
          .then(html => {
            document.head.insertAdjacentHTML('beforeend', html);
            return `HTML loaded: ${resource}`;
          });
      }
    });
    this.addResourceType({
      name: 'module',
      onLoad: (resource, elementName, elementRule) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.type = 'module';
          script.src = resource;
          script.onload = () => resolve(`Module loaded: ${resource}`);
          script.onerror = () => reject(new Error(`Failed to load module: ${resource}`));
          document.head.appendChild(script);
        });
      }
    });
    this.addResourceType({
      name: 'import',
      onLoad: (resource, elementName, elementRule) => {
        const resolvedResource = this.importMeta.resolve(resource);
        return import(resolvedResource)
          .then(() => `Import loaded: ${resolvedResource}`);
      }
    });
  }

  addElement(elementRule) {
    this.elementRules.push(elementRule);
    return this;
  }

  addElements(elementRules) {
    this.elementRules.push(...elementRules);
    return this;
  }

  addResourceType(resourceTypeDef) {
    this.resourceTypes[resourceTypeDef.name] = resourceTypeDef;
    return this;
  }

  register() {
    // Scan for existing elements
    this.scan(document.body);

    // Watch for new elements
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scan(node);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return this;
  }

  scan(rootNode) {
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

    const rule = this.findRuleFor(name);
    if (!rule) {
      return;
    }

    if (this.loadedRules.has(rule)) {
      return;
    }
    this.loadedRules.add(rule);

    const promises = [];
    for (const resourceType in rule.resources) {
      if (this.resourceTypes[resourceType]) {
        const resource = rule.resources[resourceType];
        promises.push(this.resourceTypes[resourceType].onLoad(resource, name, rule));
      }
    }
    return Promise.all(promises);
  }

  findRuleFor(name) {
    // Exact match
    for (const rule of this.elementRules) {
      if (rule.element === name) {
        return rule;
      }
    }
    // Prefix match
    for (const rule of this.elementRules) {
      if (rule.prefix && name.startsWith(rule.prefix)) {
        return rule;
      }
    }
    return null;
  }
}

export default HtmlAutoloader;
