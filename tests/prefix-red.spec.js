const { test, expect } = require('@playwright/test');

const TEST_NAME = require('path').parse(__filename).base.replace(/\.spec\.js/, '');

test('prefix-red loads and renders with CSS', async ({ page }) => {
  await page.goto('/tests/' + TEST_NAME + '.html');

  // Wait for the component to be loaded and rendered
  await page.locator('prefix-red').waitFor();

  // Check that the component's shadow DOM contains the correct text
  const text = await page.evaluate(() => {
    const el = document.querySelector('prefix-red');
    return el.textContent;
  });

  expect(text).toBe('Prefix Red');

  // Check that the CSS is applied
  const color = await page.evaluate(() => {
    const el = document.querySelector('prefix-red');
    return window.getComputedStyle(el).color;
  });

  expect(color).toBe('rgb(255, 0, 0)');
});
