# html-autoloader (*proof of concept*)

The `html-autoloader` library provides a service for loading Web Components in web-browsers.  It facilitates _dynamic-linking_,
where one Web Component can reference another Web Component *without* knowledge of its physical file-layout.

## Requirements

* __Browser Runtime__: [Baseline](https://web.dev/baseline) 2022 (or newer)
* __Testing__: NodeJS v22 LTS (or newer), Playwright

## Comparisons

<details>
  <summary><b>PHP Classes and HTML Web Components...</b></summary>

The concept can be loosely compared to PHP's mechanism for class-loading:

* In PHP, `spl_autoload_register()` allows you to listen+respond whenever someone accesses an unrecognized class.

* In a browser, `MutationObserver` allows you to listen+respond whenever someone accesses an unrecognized Web Component.

In both cases, there can be multiple listeners, but it is *best* to have a small number of listeners; ideally, one listener has
the *map* or *index*.  Whenever the application is updated (to add/upgrade/remove Web Components), we build a new index.

For PHP, the application builds an instance of `\Composer\Autoload\ClassLoader()` and configures a map of
classes/namespaces/folders/files.  For the browser, the `html-autoloader` provides a similar utility (`HtmlAutoloader`) with a map of web-components/custom-elements.

</details>

<details>
  <summary><b>Module-bundlers and Autoloaders</b></summary>

  Many Javascript applications use *bundlers*, like `webpack` or `esbuild`. These provide a mechanism to load several units of code into a web-browser, and they focus on *static-linking for Javascript modules*.

  In `html-autoloader`, it also provides a mechanism to load several units of code into a web-browser, but it focuses on *dynamic-linking of Web Components*.

  Static-linking and dynamic-linking have trade-offs, which are about as old as electronic computers. For example, static-linking can help performance (*e.g. it doesn't need to do any runtime searches*), but it can also hinder performance (*if the application has large subsystems that are infrequently accessed, then that creates bloat*).

  The practices are not mutually exclusive; they can be complementary. For example, in Debian, the application `bin/curl` uses `libcurl` and `libssl`. In a broad sense, these three artifacts are linked dynamically -- but at lower level, each individual artifact is the result of static linking.

  Similarly, the main web-application could use dynamic-linking for WebComponents, and many specific subsystems (such as the "rich text editor") could use statically-linked bundles.

</details>

## Illustration

Consider this example:

```html
<!-- FILE: index.html -->
<script type="module">
  import HtmlAutoloader from "https://cdn.example.com/html-autoloader@1.0";
  import elementMap from './elements.json' with { type: 'json' };

  (new HtmlAutoloader(import.meta)).addElements(elementMap).register();
</script>
<body>
  I like to eat <apple-fuji></apple-fuji>.

  The <banana-cavendish></banana-cavendish> is also pretty good.
</body>
```
```javascript
// FILE: dist/elements.json
[
  {"element": "apple-fuji",         "resources": {"js": "https://example.com/apple/fuji.js", "css": "https://example.com/apple/fuji.css"}},
  {"element": "apple-delicious",    "resources": {"html": "/elements/apple-delicious.html"}},
  {"element": "apple-gala",         "resources": {"module": "https://example.com/apple/gala.esm.js"}},
  {"element": "apple-honey-crisp",  "resources": {"import": "elements/apple-honey-crisp.js"}},
  {"prefix": "banana-",             "resources": {"js": "https://example.com/banana-bundle.js", "css": "https://example.com/banana-bundle.css"}},
  {"prefix": "cherry-",             "resources": {"module": "https://example.com/cherry.esm.js"}},
  {"prefix": "date-",               "resources": {"import": "date/bundle.js"}},
  {"prefix": "elderberry-",         "resources": {"import": "elderberry/bundle.html"}}
]

```

Observe:

* In this example, we load the element-map from a JSON file (`elements.json`). 
* Most resources (including the element-map) benefit from browser caching.
* Some rules match an exact `element` name, and others rules match by `prefix`.
    * __Exact match__: The DOM references `<apple-fuji>`, so we autoload `fuji.js` and `fuji.css`.
    * __Prefix match__: The DOM references `<banana-cavendish>`, which matches the prefix `banana-*`, so we autoload `banana-bundle.js` and `banana-bundle.css`.
* To load a Web Component, one fetches a list of resources. There are several standard resource-types (JS files, ECMAScript modules, CSS files, etc).
* If a rule is activated, it will only loads once (within the page-view).
* The element-map should be auto-generated during deployment. The generator can use file-conventions or basic JSON. You don't need a full Javascript parser to build the map.

## APIs

The `HtmlAutoloader` has several methods, with fluent style.

* __`addElement(ELEMENT_RULE): HtmlAutoloader`__: Define one new element-rule. Example:
    
    ```javascript
    loader.addElement({
      prefix: 'cherry-',
      resources: {module: 'https://example.com/cherry.esm.js'}
    });
    ```

    Each rule includes a mix of the following parameters:

    * `element` (string): Match an element by exact name. Load resources for that one element.
    * `prefix` (string): Match a group of elements based on a shared prefix. Load the bundle of resources.
    * `resources` (object): List of resources, keyed by type. These are standard resource-types:
        * `import`: Import an ECMAScript Module (ESM). This respects the import-map. (`import()`).
        * `js`: Load resource from URL (`<script type="javascript" src="...">`)
        * `module`: Load resource from URL (`<script type="module" src="...">`)
        * `css`: Load resource from URL (`<link rel="stylesheet" href="...">`)
        * `html`: Fetch resource (`fetch(...)`) and append to DOM. 

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

    This loads all `resource`s declared for `apple-fuji` or `apple-*` The `Promise` returns true after loading.

    <!-- TODO: Add support for fetching in phaess, grouping by `resourceType.weight` -->

## Testing

The test-suite is based Playwright. It includes a series of example WebComponents, example HTML pages, and Playwright specs for each example page.

* `tests/*.html`: Example HTML web-pages which use `html-autoloader`. Each page instantiates `HtmlAutoloader` with an example element-map.
    * (*For manual testing and debugging, simply the open the HTML file in your favorite web-browser.*)
* `tests/*.spec.js`: Playwright scenarios. Each loads the HTML page and asserts that the elements are working.
* `tests/resources/*`: The resource-files (JS, CSS, etc) for sample WebComponents. These are referenced by the elmement maps.

## TODO

* Weighted resource activation. (Insert `*.css` and `*.html` before inserting `*.js`.)
* Background warmup. (During idle periods, check for elements with `warmup:INT` and fetch them. Requires ServiceWorker with Cache API.)
* Prefix/Element ordering. (Sort by match-length. If `<foo-bar-whiz>` matches rules for `foo-` and `foo-bar-` and `foo-bar-whiz`, then activate in that order. Warmup en masse.)
* Add assertions about #file operations. (Irrelevant files are not loaded.)
* Full deduping of resources (e.g. if multiple rules refer to the same resources). This is implict for ESM `import`s, but HTML files, CSS files, and others are different.
* `Promises` for loaded resources should provide structured information.
