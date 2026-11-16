import { expect, test } from '@playwright/test';

test('juego-7: carga por HTTP sin errores ni recursos faltantes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Atrapa la estrella');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  const canvas = page.locator('#game canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('width', '1600');
  await expect(canvas).toHaveAttribute('height', '900');
  await expect(page.getByRole('heading', { name: 'Atrapa la estrella' })).toBeVisible();
  // Esperar una actualización de renderizado antes de comprobar errores de carga.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(errors).toEqual([]);
});
