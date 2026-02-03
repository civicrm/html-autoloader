# html-autoloader: Draft specification

The `html-autoloader` library provides a service for loading Web Components in web-browsers.  It facilitates _dynamic-linking_,
where one Web Component can reference another Web Component *without* knowledge of its physical file-layout.

## Requirements

* __Browser Runtime__: Baseline 2022 (or newer)
* __Testing__ NodeJS v22 LTS (or newer), Playwright

## Comparison: PHP Classes and HTML Web Components

The concept can be loosely compared to PHP's mechanism for class-loading:

* In PHP, `spl_autoload_register()` allows you to listen+respond whenever  someone accesses an unrecognized class.

* In a browser, `MutationObserver` allows you to listen+respond whenever someone accesses an unrecognized Web Component.

In both cases, there can be multiple listeners, but it is *best* to have a small number of listeners; ideally, one listener has
the *map* or *index*.  Whenever the application is updated (to add/upgrade/remove Web Components), we build a new index.

For PHP, the application builds an instance of \Composer\Autoload\ClassLoader()` and configures a map of
classes/namespaces/folders/files.  For the browser, the `html-autoloader` provides a similar utility (`HtmlAutoloader`).

## General Usage

Consider this example:

```html
<!-- FILE: index.html -->
<script type="importmap">
{
  "imports": {
    "html-autoloader": "https://cdn.example.com/html-autoloader-1.0.0.js"
  }
}
</script>
<script type="module">
import HtmlAutoloader from "html-autoloader";
import elementMap from './dist/elements.json' with { type: 'json' };
(new HtmlAutoloader(import.meta))
  .addElements(elementMap)
  .register();
</script>
```
```javascript
// FILE: dist/elements.json
const elementMap = [
  {element: 'apple-fuji',         resources: {js: 'https://example.com/apple/fuji.js', css: 'https://example.com/apple/fuji.css'},
  {element: 'apple-delicious',    resources: {html: '/elements/apple-delicious.html'},
  {element: 'apple-gala',         resources: {module: 'https://example.com/apple/gala.esm.js'},
  {element: 'apple-honey-crisp',  resources: {import: '/elements/apple-honey-crisp.js'},
  {prefix: 'banana-',             resources: {js: 'https://example.com/banana-bundle.js'}, css: 'https://example.com/banana-bundle.css'},
  {prefix: 'cherry-',             resources: {module: 'https://example.com/cherry.esm.js'}},
  {prefix: 'date-',               resources: {import: 'date/bundle.js'}},
  {prefix: 'elderberry-',         resources: {import: 'elderberry/bundle.html}},
];
export { elementMap };
```

Observe:

* In this example, we load the element-map from a JSON file (`elements.json`). There are several rules.
* Some rules match an exact `element` name, and others rules match by `prefix`.
    * __Exact match__: If the DOM ever includes an `<apple-fuji>`, then load the JS+CSS file.
    * __Prefix match__: If the DOM ever includes a `<banana-*>` (such as `<banana-cavendish` or `<banana-mysore>`), then it activates the relevant rule.
* To load a Web Component, one fetches a mix of resources. These resource-types are included in the standard implementation:
    * `import`: Load ESM resource from the importmap (`import(...)`).
    * `js`: Load resource from URL (`<script type="javascript" src="...">`)
    * `module`: Loadresource from URL (`<script type="module" src="...">`)
    * `css`: Load resource from URL (`<link rel="stylesheet" href="...">`)
    * `html`: Fetch resource (`fetch(...)`) and append to DOM. 
* Each resource (element, prefix, JS URL, CSS URL, etc) is only loaded once.

## APIs

The `HtmlAutoloader` has several methods, with fluent style.

* __`addElement(ELEMENT_RULE): HtmlAutoloader`__: Define one new element-rule. Example:
    
    ```javascript
    loader.addElement({prefix: 'cherry-', resources: {module: 'https://example.com/cherry.esm.js'}})
    ```

* __`addElements(ELEMENT_RULES): HtmlAutoloader`__:  Define several element-rules

* __`addResourceType({name: RESOURCE_TYPE, loader: CALLBACK}): HtmlAutoloader`__:  Define a resource type and its loading mechanism. Example:

    ```javascript
    loader.addResourceType({
      name: 'css',
      onLoad: function(resource, elementName, elementRule) {
        return new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = resource;
          link.type = 'text/css';
          link.onload = () => resolve(`CSS loaded: ${href}`);
          link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
          document.head.appendChild(link);
        });
      },

    });
    loader.addElements([
      {element: 'foo-bar', resources: {css: 'dist/foo-bar.css'}}
    ]);
    ```
    
    Observe that the `onLoad` is a callback which recieves the `resource` info and returns a `Promise`.
    
    <!-- TODO: Add support for `resourceType.weight` -->

* __`register(): HtmlAutoloader`__: Scan DOM for WebComponents that are referenced (but not yet loaded). Register `MutationObserver` to load future ones.
    
* __`loadElement(NAME): Promise`__:  Activate a specific element, based on its name. Example:

    ```javascript
    await loader.loadElement('apple-fuji');
    ```

    Logic:
    
    * If the element `apple-fuji` has already loaded, return completion.
    * Mark the element as loaded.
    * Find the `rule` for the element. If the rule has already been loaded, return completion.
    * Mark the rule as loaded.
    * Examine the `resources`. Fire the `resourceType[type].onLoad` for each resource.
    * Return a single `Promise.all()` for the set of resources.

    For example, `apple-fuji` requires calling two calls to `onLoad`:
    
    ```
    let rule = rules[1];
    promises.push(resourceTypes['js'].onLoad('https://example.com/apple/fuji.js', 'apple-fuji', rule));
    promises.push(resourceTypes['css'].onLoad('https://example.com/apple/fuji.css', 'apple-fuji', rule));
    return Promise.all(promises);
    ```

    <!-- TODO: Add support for fetching in phaess, grouping by `resourceType.weight` -->

## Testing

The test-suite is based Playright. It includes a series of example WebComponents, example HTML pages, and Playwright specs for each example page.

* `tests/*.html`: Example HTML web-pages which use `html-autoloader`. Each page instantiates `HtmlAutoloader` with an example element-map.
* `tests/*.spec.js`: Playwright scenarios. Each loads the HTML page and asserts that the elements are working.
* `tests/resources/*`: A set of resource-files (JS, CSS, etc). These are referenced by the elmement maps.
