const { test, expect } = require('@playwright/test');
const path = require('path');
const TEST_NAME = path.parse(__filename).base.replace(/\.spec\.js/, '');

test('prefix-red loads and renders with CSS', async ({ page }) => {
  await page.goto('/tests/' + TEST_NAME + '.html');

  await page.locator('prefix-red').waitFor();
  const text1 = await page.evaluate(() => {
    const el = document.querySelector('prefix-red');
    return el.textContent;
  });
  expect(text1).toBe('Prefix Red');

  const color1 = await page.evaluate(() => {
    const el = document.querySelector('prefix-red');
    return window.getComputedStyle(el).color;
  });
  expect(color1).toBe('rgb(255, 0, 0)');

  await page.locator('prefix-green').waitFor();
  const text2 = await page.evaluate(() => {
    const el = document.querySelector('prefix-green');
    return el.textContent;
  });
  expect(text2).toBe('Prefix Green');

  const color2 = await page.evaluate(() => {
    const el = document.querySelector('prefix-green');
    return window.getComputedStyle(el).color;
  });
  expect(color2).toBe('rgb(0, 255, 0)');
});
