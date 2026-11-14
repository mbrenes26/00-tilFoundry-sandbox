import { expect, test } from '@playwright/test';

test('I-1: escritorio conserva el panel dentro del canvas FIT', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 600 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Observa una red neuronal' })).toBeVisible();
  const canvas = (await page.locator('canvas').boundingBox())!;
  expect(canvas.width / canvas.height).toBeCloseTo(16 / 9, 2);
  const panel = (await page.locator('#launch-panel').boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(canvas.x);
  expect(panel.x + panel.width).toBeLessThanOrEqual(canvas.x + canvas.width + 1);
  expect(panel.y + panel.height).toBeLessThanOrEqual(canvas.y + canvas.height + 1);
  await expect(page.getByRole('button', { name: 'Iniciar partida' })).toBeDisabled();
  await page.screenshot({ path: 'tests/browser/evidence/rework-desktop-start.png', fullPage: true });
});

test('I-1: teléfono tiene inicio fuera del canvas sin scroll interno', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Observa una red neuronal' })).toBeVisible();
  const canvas = (await page.locator('canvas').boundingBox())!;
  expect(canvas.width / canvas.height).toBeCloseTo(16 / 9, 2);
  const panel = (await page.locator('#launch-panel').boundingBox())!;
  expect(panel.y, 'El panel no debe cubrir el canvas').toBeGreaterThanOrEqual(canvas.y + canvas.height);
  expect(await page.locator('#launch-panel').evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  for (const button of await page.locator('#launch-panel button:visible').all()) {
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  const config = await page.evaluate(async () => {
    const { game } = await import('/src/main.ts' as string);
    return { width: game.config.width, height: game.config.height, pixelArt: game.config.pixelArt,
      scenes: game.scene.scenes.map((scene: any) => scene.sys.settings.key) };
  });
  expect(config).toEqual({ width: 1600, height: 900, pixelArt: true,
    scenes: ['BootScene', 'BaseScene', 'UIScene', 'LaunchScene', 'ResultScene'] });
  await page.screenshot({ path: 'tests/browser/evidence/rework-mobile-start.png', fullPage: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'tests/browser/evidence/rework-mobile-start-viewport.png' });
});

test('I-1/I-2: teléfono tiene indicadores legibles fuera del canvas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByTestId('steps')).toHaveText('Pasos: 0 / 3000');
  const font = await page.getByTestId('steps').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(font, 'El HUD no puede reducirse a 9px').toBeGreaterThanOrEqual(14);
  const canvas = (await page.locator('canvas').boundingBox())!;
  const hud = (await page.locator('#hud').boundingBox())!;
  expect(hud.y).toBeGreaterThanOrEqual(canvas.y + canvas.height);
  expect(hud.y + hud.height).toBeLessThanOrEqual((await page.locator('#launch-panel').boundingBox())!.y);
});
