import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

test('HTTP: Boot carga arte, Base dibuja motor, UI informa y Launch prepara importación', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('heading', { name: 'Observar una política' })).toBeVisible();
  await expect(page.getByLabel('Archivo de política JSON')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Iniciar partida' })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('Sin política');
  const report = await page.evaluate(async () => {
    // @ts-ignore Import HTTP en Chromium, no en Node.
    const { game } = await import('/src/main.ts');
    const base = game.scene.getScene('BaseScene');
    const ui = game.scene.getScene('UIScene');
    return { size: [game.scale.width, game.scale.height], fit: game.scale.scaleMode,
      pixelArt: game.config.pixelArt, keys: game.scene.getScenes(false).map((s: any) => s.scene.key),
      textures: ['tiles', 'actors'].map(k => game.textures.exists(k)),
      actorCount: base.actors.length, pillCount: base.objects.getChildren().length,
      stats: ui.summary.text, timer: base.ambienceTimer.delay,
      animated: base.actors.every((s: any) => s.anims.isPlaying), tick: base.state.tick };
  });
  expect(report).toMatchObject({ size: [1600, 900], fit: 3, pixelArt: true, textures: [true, true],
    actorCount: 5, timer: 100, animated: true, tick: 0 });
  expect(report.keys.sort()).toEqual(['BaseScene', 'BootScene', 'LaunchScene', 'ResultScene', 'UIScene'].sort());
  expect(report.pillCount).toBeGreaterThan(100);
  expect(report.stats).toContain('Vidas: 3');
  await page.waitForTimeout(500);
  expect(await page.evaluate(async () => {
    // @ts-ignore
    const { game } = await import('/src/main.ts');
    return game.scene.getScene('BaseScene').state.tick;
  })).toBe(0);
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/presentation.png' });
});

test('Base interpola un estado real, UI anima progreso y Result resume finales', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Observar una política' })).toBeVisible();
  const transition = await page.evaluate(async () => {
    // @ts-ignore
    const { game } = await import('/src/main.ts');
    // @ts-ignore
    const { step } = await import('/src/game/engine.ts');
    const base = game.scene.getScene('BaseScene');
    const next = step(base.state, 1).state;
    base.present(next);
    const ui = game.scene.getScene('UIScene');
    return { tween: base.tweens.getTweensOf(base.actors[0]).length,
      progressTween: ui.tweens.getTweensOf(ui.progress).length, stats: ui.summary.text, next };
  });
  expect(transition.tween).toBeGreaterThan(0);
  expect(transition.progressTween).toBeGreaterThan(0);
  expect(transition.stats).toContain('Puntos: 10');
  await page.waitForTimeout(180);
  const positions = await page.evaluate(async () => {
    // @ts-ignore
    const { game } = await import('/src/main.ts');
    const base = game.scene.getScene('BaseScene');
    return [base.actors[0].x, base.actors[0].y];
  });
  expect(positions).toEqual([64 + 2 * 44 + 22, 150 + 44 + 22]);
  for (const [status, title] of [['won', 'Laberinto completado'], ['lost', 'Sin vidas'], ['timeout', 'Límite de pasos']] as const) {
    const summary = await page.evaluate(async ({ state, status }) => {
      // @ts-ignore
      const { game } = await import('/src/main.ts');
      game.scene.stop('ResultScene');
      game.scene.run('ResultScene', { ...state, status });
      return new Promise<string>(resolve => game.events.once('poststep', () => resolve(game.scene.getScene('ResultScene').summary.text)));
    }, { state: transition.next, status });
    expect(summary).toContain(title);
    expect(summary).toContain('Puntos: 10');
    expect(summary).toContain('Pasos: 1');
  }
  await page.screenshot({ path: 'test-results/result.png' });
});

test('cada recurso de pixel art tiene autor, procedencia y uso original', () => {
  const inventory = JSON.parse(readFileSync('public/assets/inventory.json', 'utf8'));
  expect(inventory.length).toBeGreaterThan(0);
  expect(inventory.map((entry: any) => entry.file).sort()).toEqual(readdirSync('public/assets').filter(f => f.endsWith('.svg')).sort());
  for (const entry of inventory) {
    expect(entry.author).toBeTruthy();
    expect(entry.origin).toContain('original');
    expect(entry.use).toBeTruthy();
    expect(readFileSync(`public/assets/${entry.file}`, 'utf8')).toContain('shape-rendering="crispEdges"');
  }
});
