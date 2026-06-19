import { test, expect } from '@playwright/test';

test.describe('SAOT Lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/usuario|username/i).fill('admin');
    await page.getByPlaceholder(/senha|password/i).fill('admin');
    await page.getByRole('button', { name: /entrar|sign in/i }).click();
    await expect(page.getByText(/SAOT|ICC/i).first()).toBeVisible();
  });

  test('should display SAOT Lab tab', async ({ page }) => {
    const saotTab = page.getByRole('button', { name: /SAOT|3D/i }).first();
    await expect(saotTab).toBeVisible();
    await saotTab.click();
    await expect(page.getByText(/controles|controls/i).first()).toBeVisible();
  });

  test('should display canvas with 3D scene', async ({ page }) => {
    const saotTab = page.getByRole('button', { name: /SAOT|3D/i }).first();
    await saotTab.click();
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should switch to Playbook tab', async ({ page }) => {
    const saotTab = page.getByRole('button', { name: /SAOT|3D/i }).first();
    await saotTab.click();
    const playbookTab = page.getByRole('button', { name: /playbook/i }).first();
    await playbookTab.click();
    await expect(page.getByText(/playbook|simulador/i).first()).toBeVisible();
  });

  test('should have simulation controls', async ({ page }) => {
    const saotTab = page.getByRole('button', { name: /SAOT|3D/i }).first();
    await saotTab.click();
    await expect(page.getByRole('button', { name: /iniciar|play/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /reset/i }).first()).toBeVisible();
  });
});
