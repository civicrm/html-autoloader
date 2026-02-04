const { test, expect } = require('@playwright/test');
const path = require('path');
const TEST_NAME = path.parse(__filename).base.replace(/\.spec\.js/, '');

test.describe(TEST_NAME + '.html', () => {
  test('should load elements on demand', async ({ page }) => {
    await page.goto('/tests/' + TEST_NAME + '.html');

    const component = page.locator('hello-world-combined').first();
    await expect(component).toHaveText('Hello, World!');

    const aliceComponent = page.locator('hello-world-combined[name="Monde"]');
    await expect(aliceComponent).toHaveText('Hello, Monde!');
  });
});
