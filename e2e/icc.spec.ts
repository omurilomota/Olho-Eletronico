import { test, expect } from '@playwright/test';

test.describe('ICC Command Center', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/usuario|username/i).fill('admin');
    await page.getByPlaceholder(/senha|password/i).fill('admin');
    await page.getByRole('button', { name: /entrar|sign in/i }).click();
    await expect(page.getByText(/SAOT|ICC/i).first()).toBeVisible();
  });

  test('should display ICC Command Center tab', async ({ page }) => {
    const iccTab = page.getByRole('button', { name: /ICC|Center/i }).last();
    await expect(iccTab).toBeVisible();
    await iccTab.click();
    await expect(page.getByText(/operacoes|operations/i).first()).toBeVisible();
  });

  test('should display Digital Twin map', async ({ page }) => {
    const iccTab = page.getByRole('button', { name: /ICC|Center/i }).last();
    await iccTab.click();
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should display AI Chat', async ({ page }) => {
    const iccTab = page.getByRole('button', { name: /ICC|Center/i }).last();
    await iccTab.click();
    await expect(page.getByText('FIFA AI Pro')).toBeVisible();
  });

  test('should send a message in AI Chat', async ({ page }) => {
    const iccTab = page.getByRole('button', { name: /ICC|Center/i }).last();
    await iccTab.click();
    const input = page.getByPlaceholder(/pergunte|ask/i).first();
    await input.fill('ataque');
    await page.getByRole('button', { name: /enviar|send/i }).first().click();
    await expect(page.getByText(/ataque|attack/i).first()).toBeVisible();
  });

  test('should display Risk Gauge', async ({ page }) => {
    const iccTab = page.getByRole('button', { name: /ICC|Center/i }).last();
    await iccTab.click();
    await expect(page.getByText(/risco|risk/i).first()).toBeVisible();
  });

  test('should display Weather Widget', async ({ page }) => {
    const iccTab = page.getByRole('button', { name: /ICC|Center/i }).last();
    await iccTab.click();
    await expect(page.getByText(/clima|weather/i).first()).toBeVisible();
  });

  test('should display Sales Panel', async ({ page }) => {
    const iccTab = page.getByRole('button', { name: /ICC|Center/i }).last();
    await iccTab.click();
    await expect(page.getByText(/vendas|sales/i).first()).toBeVisible();
  });
});
