import { test, expect } from '@playwright/test';

test('I-1: selector de archivo muestra textos propios en español', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Seleccionar archivo JSON', { exact: true })).toBeVisible();
  await expect(page.getByText('Ningún archivo seleccionado', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Importar política JSON')).toBeDisabled();
});
