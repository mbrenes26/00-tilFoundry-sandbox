import { boardGeometry } from './evidence/geometry';
import { expect, test } from '@playwright/test';
import { toPolicy } from '../../src/learning/policy';
import { createNetwork } from '../../src/learning/network';

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
  await page.screenshot({ path: 'test-results/rework-desktop-start.png', fullPage: true });
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
      fit: game.scale.scaleMode === 3, // Phaser.Scale.FIT (SCALE_MODE_CONST).
      scenes: game.scene.scenes.map((scene: any) => scene.sys.settings.key) };
  });
  expect(config).toEqual({ width: 1600, height: 900, pixelArt: true, fit: true,
    scenes: ['BootScene', 'BaseScene', 'UIScene', 'LaunchScene', 'ResultScene'] });
  await page.screenshot({ path: 'test-results/rework-mobile-start.png', fullPage: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/rework-mobile-start-viewport.png' });
});

test('I-1/I-2: teléfono tiene indicadores legibles fuera del canvas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const values = { points: 'Puntos: 0', lives: 'Vidas: 3', phase: 'Fase: dispersión',
    power: 'Poder: 0 pasos', steps: 'Pasos: 0 / 3000' };
  for (const [id, value] of Object.entries(values)) {
    await expect(page.getByTestId(id)).toHaveText(value);
    const font = await page.getByTestId(id).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(font, 'El HUD no puede reducirse a 9px').toBeGreaterThanOrEqual(14);
  }
  const canvas = (await page.locator('canvas').boundingBox())!;
  const hud = (await page.locator('#hud').boundingBox())!;
  expect(hud.y).toBeGreaterThanOrEqual(canvas.y + canvas.height);
  expect(hud.y + hud.height).toBeLessThanOrEqual((await page.locator('#launch-panel').boundingBox())!.y);
});

test('I-3: teléfono valida y recupera importaciones sin iniciar reproducción', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Iniciar partida', exact: true });
  await expect(start).toBeDisabled();
  // Fixture sintética, sin entrenamiento. Este test nunca inicia una partida.
  const fixture = toPolicy(createNetwork(123), { seed: 123, trainingSteps: 0, updates: 0 });
  const upload = async (text: string) => {
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Seleccionar archivo JSON' }).click();
    await (await chooser).setFiles({ name: 'fixture-prueba-no-entrenada.json',
      mimeType: 'application/json', buffer: Buffer.from(text) });
  };
  for (const [text, message] of [
    ['{', /JSON corrupto/],
    [JSON.stringify({ ...fixture, schemaVersion: 2 }), /versiones/],
  ] as const) {
    await upload(JSON.stringify(fixture));
    await expect(start).toBeEnabled();
    await upload(text);
    await expect(page.getByRole('status')).toContainText(message);
    await expect(start).toBeDisabled();
    await expect(page.getByTestId('steps')).toHaveText('Pasos: 0 / 3000');
  }
  await upload(JSON.stringify(fixture));
  await expect(start).toBeEnabled();
  await expect(page.getByRole('status')).toContainText('sin entrenamiento');
  await page.getByLabel('Semilla de partida').fill('-1');
  await expect(start).toBeDisabled();
  await expect(page.locator('#seed-message')).toContainText('entero entre 0 y 4294967295');
  await page.getByLabel('Semilla de partida').fill('42');
  await expect(start).toBeEnabled();
  await expect(page.getByTestId('steps')).toHaveText('Pasos: 0 / 3000');
  expect(await page.locator('#launch-panel').evaluate(el => ({
    font: parseFloat(getComputedStyle(el).fontSize), noScroll: el.scrollHeight <= el.clientHeight + 1,
  }))).toEqual({ font: 16, noScroll: true });
  for (const control of await page.locator('#launch-panel button:visible, #launch-panel input:visible').all()) {
    await control.scrollIntoViewIfNeeded();
    await expect(control).toBeInViewport();
    expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/rework-mobile-start-valid.png', fullPage: true });
});


test('I-1/I-2: redimensionar en ambos sentidos conserva tablero, actores y estado', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('steps')).toHaveText('Pasos: 0 / 3000');
  const state = () => page.evaluate(async () => {
    const { game } = await import('/src/main.ts' as string);
    return JSON.stringify(game.scene.getScene('BaseScene').state);
  });
  const original = await state();
  for (const width of [390, 1600, 390, 1600]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await expect.poll(async () => (await boardGeometry(page)).board.width).toBe(width === 390 ? 370.5 : 760);
    const geometry = await boardGeometry(page);
    expect(geometry.board.x).toBeGreaterThanOrEqual(0);
    expect(geometry.board.x + geometry.board.width).toBeLessThanOrEqual(width);
    expect(geometry.actors.every(actor => actor.visible && actor.width >= 12 && actor.height >= 12)).toBe(true);
    const hud = (await page.locator('#hud').boundingBox())!;
    const panel = (await page.locator('#launch-panel').boundingBox())!;
    if (width === 390) {
      expect(geometry.board.y + geometry.board.height).toBeLessThanOrEqual(hud.y);
      expect(hud.y + hud.height).toBeLessThanOrEqual(panel.y);
    } else {
      expect(hud.y + hud.height).toBeLessThanOrEqual(geometry.board.y);
      expect(geometry.board.x + geometry.board.width).toBeLessThanOrEqual(panel.x);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await state()).toBe(original);
  }
});

test('I-2: teléfono permite iniciar, pausar, velocidad y reinicio con teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install();
  await page.goto('/');
  await page.locator('#policy-file').setInputFiles({ name: 'fixture-no-entrenada.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(toPolicy(createNetwork(123), { seed: 123, trainingSteps: 0, updates: 0 }))) });
  await expect(page.locator('#start')).toBeEnabled();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.locator('#select-file').focus();
  await page.keyboard.press('Tab'); await expect(page.locator('#seed')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.locator('#start')).toBeFocused();
  await page.keyboard.press('Enter');
  await page.locator('#pause').focus(); await page.keyboard.press('Space');
  await expect(page.locator('#pause')).toHaveText('Reanudar');
  await page.keyboard.press('Tab'); await expect(page.locator('#speed')).toBeFocused();
  await page.keyboard.press('ArrowDown'); await expect(page.locator('#speed')).toHaveValue('4');
  await page.keyboard.press('ArrowUp'); await expect(page.locator('#speed')).toHaveValue('1');
  await page.keyboard.press('Tab'); await expect(page.locator('#restart')).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.getByTestId('steps')).toHaveText('Pasos: 0 / 3000');
  expect(await page.locator('#restart').evaluate(el => el.matches(':focus-visible'))).toBe(true);
});
