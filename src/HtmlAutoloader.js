class HtmlAutoloader {

  constructor(importMeta) {
    this.importMeta = importMeta;
    this.elementRules = [];
    this.resourceTypes = {};
    this.loadedElements = new Set();
    this.loadedRules = new Set();
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
    // TODO: Scan DOM for existing elements
    // TODO: Register MutationObserver
    return this;
  }

  async loadElement(name) {
    // TODO: Implement element loading logic
  }
}

export default HtmlAutoloader;
