import { expect, test } from '@playwright/test';

// El panel HTML debe mantenerse dentro del área lógica del juego cuando FIT escala el canvas.
test('el panel de inicio no se sale del juego al cambiar tamaño y proporción de ventana', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Observar una política' })).toBeVisible();
  for (const viewport of [{ width: 1920, height: 600 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const canvas = await page.locator('canvas').boundingBox();
    const panel = await page.locator('#launch-panel').boundingBox();
    expect(canvas).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(panel!.x).toBeGreaterThanOrEqual(canvas!.x);
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(canvas!.x + canvas!.width + 1);
    expect(panel!.y + panel!.height).toBeLessThanOrEqual(canvas!.y + canvas!.height + 1);
    await expect(page.getByRole('button', { name: 'Iniciar partida' })).toBeDisabled();
  }
});
