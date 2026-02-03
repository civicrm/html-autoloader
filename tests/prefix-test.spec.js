const { test, expect } = require('@playwright/test');

test('prefix-component loads and renders with CSS', async ({ page }) => {
  await page.goto('/tests/prefix-test.html');

  // Wait for the component to be loaded and rendered
  await page.waitForSelector('prefix-component');

  // Check that the component's shadow DOM contains the correct text
  const text = await page.evaluate(() => {
    const el = document.querySelector('prefix-component');
    return el.textContent;
  });

  expect(text).toBe('Prefix Component');

  // Check that the CSS is applied
  const color = await page.evaluate(() => {
    const el = document.querySelector('prefix-component');
    return window.getComputedStyle(el).color;
  });

  expect(color).toBe('rgb(255, 0, 0)');
});
