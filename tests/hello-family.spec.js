const { test, expect } = require('@playwright/test');
const path = require('path');
const TEST_NAME = path.parse(__filename).base.replace(/\.spec\.js/, '');

test.describe(TEST_NAME + '.html', () => {
  test('should load and render transitive dependencies', async ({ page }) => {
    await page.goto('/tests/' + TEST_NAME + '.html');

    const carolComponent = page.locator('li#li-carol');
    await expect(carolComponent).toHaveText('Hello, Carol!');

    const daveComponent = page.locator('li#li-dave');
    await expect(daveComponent).toHaveText('Hello, Dave!');
  });
});
