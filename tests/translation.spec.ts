
import { test, expect } from '@playwright/test';

test('has title and translation UI', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/noLimitTranslate/);

    // Check header
    await expect(page.getByRole('heading', { name: 'noLimitTranslate' })).toBeVisible();

    // Check for input area
    const inputArea = page.getByPlaceholder('Enter text...');
    await expect(inputArea).toBeVisible();

    // Check for translate button
    const translateButton = page.getByRole('button', { name: 'Translate' });
    await expect(translateButton).toBeVisible();

    // Since WebGPU might not be available in CI headless mode, check for potential error or just UI load.
    // We can try to type something.
    await inputArea.fill('Test translation');

    // Verify language selectors
    await expect(page.locator('select').first()).toHaveValue('English');
    await expect(page.locator('select').nth(1)).toHaveValue('Japanese');
});
