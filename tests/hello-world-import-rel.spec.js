const { test, expect } = require('@playwright/test');

const TEST_NAME = require('path').parse(__filename).base.replace(/\.spec\.js/, '');

test('hello-world component loads and renders', async ({ page }) => {
  await page.goto('/tests/' + TEST_NAME + '/index.html');

  // Wait for the component to be loaded and rendered
  await page.waitForSelector('hello-world-module');

  // Check that the component's shadow DOM contains the correct text
  const text = await page.evaluate(() => {
    const el = document.querySelector('hello-world-module');
    return el.shadowRoot.querySelector('p').textContent;
  });

  expect(text).toBe('Bon jour, tout le monde');
});
