import { test, expect } from '@playwright/test';

const TEST_NAME = require('path').parse(__filename).base.replace(/\.spec\.js/, '');

test.describe('External element map', () => {
  test('should load elements on demand', async ({ page }) => {
    await page.goto('/tests/' + TEST_NAME + '.html');

    const component = page.locator('hello-world-combined').first();
    await expect(component).toHaveText('Hello, World!');

    const aliceComponent = page.locator('hello-world-combined[name="Monde"]');
    await expect(aliceComponent).toHaveText('Hello, Monde!');
  });
});
