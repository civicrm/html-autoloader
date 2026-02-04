const { test, expect } = require('@playwright/test');
const path = require('path');
const TEST_NAME = path.parse(__filename).base.replace(/\.spec\.js/, '');

test.describe(TEST_NAME + ".html", () => {
  test('should render default greeting when no name attribute is provided', async ({ page }) => {
    await page.goto('/tests/' + TEST_NAME + '.html');

    const component = page.locator('hello-world-combined').first();
    await expect(component).toHaveText('Hello, World!');
  });

  test('should render greeting with provided name attribute', async ({ page }) => {
    await page.goto('/tests/' + TEST_NAME + '.html');

    const aliceComponent = page.locator('hello-world-combined[name="Alice"]');
    await expect(aliceComponent).toHaveText('Hello, Alice!');

    const bobComponent = page.locator('hello-world-combined[name="Bob"]');
    await expect(bobComponent).toHaveText('Hello, Bob!');
  });
});
