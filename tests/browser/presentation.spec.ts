import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('I-1: arranque HTTP, escenas, arte y configuración real', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Lúmina' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Seleccionar archivo JSON' })).toBeVisible();
  await expect(page.getByLabel('Importar política JSON')).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Iniciar partida' })).toBeDisabled();
  await expect(page.getByText('Ningún archivo seleccionado', { exact: true })).toBeVisible();
  await expect.poll(async () => page.evaluate(async () => {
    const { game } = await import('/src/main.ts' as string);
    const base = game.scene.getScene('BaseScene');
    return { width: game.scale.gameSize.width, height: game.scale.gameSize.height,
      fit: game.scale.scaleMode === 3, pixelArt: game.config.pixelArt,
      scenes: game.scene.getScenes(false).map((s: any) => s.sys.settings.key).sort(),
      ready: base.ready, loaded: ['actors', 'tiles'].every(k => game.textures.exists(k)),
      animation: game.anims.exists('lumina-flutter'), tick: base.state?.tick };
  })).toEqual({ width: 1600, height: 900, fit: true, pixelArt: true,
    scenes: ['BaseScene', 'BootScene', 'LaunchScene', 'ResultScene', 'UIScene'],
    ready: true, loaded: true, animation: true, tick: 0 });
  await page.screenshot({ path: 'test-results/presentation.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('I-1: dibujo de fixture puro, indicadores, tweens, ritmo y resumen final', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect.poll(() => page.evaluate(async () => (await import('/src/main.ts' as string)).game.scene.getScene('BaseScene').ready)).toBe(true);
  const result = await page.evaluate(async () => {
    const { game } = await import('/src/main.ts' as string);
    const { createGame } = await import('/src/game/engine.ts' as string);
    const state = createGame(42);
    state.player.position = { x: 2, y: 1 }; state.points = 1230; state.tick = 120;
    state.lives = 2; state.phase = 'chase'; state.powerRemaining = 25;
    const before = JSON.stringify(state);
    const base = game.scene.getScene('BaseScene');
    base.present(state, true);
    const ui = game.scene.getScene('UIScene');
    const tweening = base.tweens.isTweening(base.playerSprite) && ui.tweens.isTweening(ui.progress);
    let pulses = 0;
    base.setRhythm(() => pulses++);
    await new Promise(resolve => game.scene.getScene('LaunchScene').time.delayedCall(350, resolve));
    base.stopRhythm();
    return { unchanged: before === JSON.stringify(state), tweening, pulses,
      playerX: base.playerSprite.x, expectedX: base.cellCenter(state.player.position).x,
      animated: base.playerSprite.anims.isPlaying, tick: base.state.tick };
  });
  expect(result.unchanged).toBe(true); expect(result.tweening).toBe(true);
  expect(result.pulses).toBeGreaterThanOrEqual(2); expect(result.animated).toBe(true);
  expect(result.playerX).toBe(result.expectedX); expect(result.tick).toBe(120);
  await expect(page.getByTestId('points')).toHaveText('Puntos: 1230');
  await expect(page.getByTestId('lives')).toHaveText('Vidas: 2');
  await expect(page.getByTestId('phase')).toHaveText('Fase: persecución');
  await expect(page.getByTestId('power')).toHaveText('Poder: 25 pasos');
  await expect(page.getByTestId('steps')).toHaveText('Pasos: 120 / 3000');
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts' as string);
    const base = game.scene.getScene('BaseScene');
    const final = structuredClone(base.state); final.status = 'timeout'; final.tick = 3000;
    base.present(final, false);
    game.scene.start('ResultScene', { state: final });
  });
  await expect(page.getByRole('heading', { name: 'Límite de pasos alcanzado' })).toBeVisible();
  await expect(page.getByTestId('result-summary')).toContainText('1230 puntos · 2 vidas · 3000 pasos');
  await page.screenshot({ path: 'test-results/result.png', fullPage: true });
});

test('I-1: inventario original completo y APIs de presentación sin setInterval', async ({ request }) => {
  const inventory = await (await request.get('/assets/inventory.json')).json();
  expect(inventory.resources.map((r: any) => r.file).sort()).toEqual(['actors.svg', 'tiles.svg']);
  for (const resource of inventory.resources) {
    expect(resource.author).toBeTruthy(); expect(resource.provenance).toContain('original'); expect(resource.use).toBeTruthy();
    expect((await request.get(`/assets/${resource.file}`)).ok()).toBe(true);
  }
  const sources = ['BootScene', 'BaseScene', 'UIScene', 'LaunchScene', 'ResultScene'].map(n => readFileSync(`src/scenes/${n}.ts`, 'utf8')).join('\n');
  expect(sources).toContain('this.anims'); expect(sources).toContain('this.tweens'); expect(sources).toContain('this.time');
  expect(sources).not.toContain('setInterval');
});
