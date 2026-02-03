const { test, expect } = require('@playwright/test');

import HtmlAutoloader from '../src/HtmlAutoloader.js';

// Mock import.meta for the test environment
const mockImportMeta = {
  url: 'file:///path/to/test.js', // Just a placeholder URL
  resolve: (specifier) => specifier // A simple resolve that returns the specifier
};

test('addElement throws error if prefix does not end with hyphen', async () => {
  const autoloader = new HtmlAutoloader(mockImportMeta);

  // Expect an error to be thrown when adding a prefix without a hyphen
  expect(() => {
    autoloader.addElement({ prefix: 'my-prefix' });
  }).toThrow('Prefix must end with a hyphen: my-prefix');

  // Ensure it works correctly when the hyphen is present
  expect(() => {
    autoloader.addElement({ prefix: 'my-prefix-' });
  }).not.toThrow();
});
