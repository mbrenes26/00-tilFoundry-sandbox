import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1920, height: 600 }, { width: 390, height: 844 }]) {
  test(`I-1: el panel de inicio permanece dentro del canvas a ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Observa una red neuronal' })).toBeVisible();
    if (viewport.width === 390) await page.screenshot({ path: 'test-results/mobile-step-9.png', fullPage: true });
    const canvas = await page.locator('canvas').boundingBox();
    const panel = await page.locator('#launch-panel').boundingBox();
    expect(canvas).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(panel!.x).toBeGreaterThanOrEqual(canvas!.x);
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(canvas!.x + canvas!.width + 1);
    expect(panel!.y + panel!.height).toBeLessThanOrEqual(canvas!.y + canvas!.height + 1);
    await expect(page.getByRole('button', { name: 'Iniciar partida' })).toBeDisabled();
  });
}
