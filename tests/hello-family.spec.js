import { test, expect } from '@playwright/test';

const TEST_NAME = require('path').parse(__filename).base.replace(/\.spec\.js/, '');

test.describe('hello-family', () => {
  test('should load and render transitive dependencies', async ({ page }) => {
    await page.goto('/tests/' + TEST_NAME + '.html');

    const carolComponent = page.locator('li#li-carol');
    await expect(carolComponent).toHaveText('Hello, Carol!');

    const daveComponent = page.locator('li#li-dave');
    await expect(daveComponent).toHaveText('Hello, Dave!');
  });
});
