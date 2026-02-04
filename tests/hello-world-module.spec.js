const { test, expect } = require('@playwright/test');
const path = require('path');
const TEST_NAME = path.parse(__filename).base.replace(/\.spec\.js/, '');

test(TEST_NAME + ' loads and renders', async ({ page }) => {
  await page.goto('/tests/' + TEST_NAME + '.html');

  // Wait for the component to be loaded and rendered
  await page.locator('hello-world-module').waitFor();

  // Check that the component's shadow DOM contains the correct text
  const text = await page.evaluate(() => {
    const el = document.querySelector('hello-world-module');
    return el.shadowRoot.querySelector('p').textContent;
  });

  expect(text).toBe('Bon jour, tout le monde');
});
