import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByPlaceholder(/usuario|username/i)).toBeVisible();
    await expect(page.getByPlaceholder(/senha|password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar|sign in/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder(/usuario|username/i).fill('wrong');
    await page.getByPlaceholder(/senha|password/i).fill('wrong');
    await page.getByRole('button', { name: /entrar|sign in/i }).click();
    await expect(page.getByText(/incorretos|incorrect/i)).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.getByPlaceholder(/usuario|username/i).fill('admin');
    await page.getByPlaceholder(/senha|password/i).fill('admin');
    await page.getByRole('button', { name: /entrar|sign in/i }).click();
    await expect(page.getByText(/SAOT|ICC/i).first()).toBeVisible();
  });
});
