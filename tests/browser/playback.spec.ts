import { expect, test, type Page } from '@playwright/test';
import { toPolicy } from '../../src/learning/policy';
import { boardGeometry } from './evidence/geometry';
import { createNetwork } from '../../src/learning/network';

// Synthetic, untrained PolicyV1 fixture. Never evidence of learned behaviour.
const fixture = toPolicy(createNetwork(123), { seed: 123, trainingSteps: 0, updates: 0 });
async function upload(page: Page, text = JSON.stringify(fixture)) {
  await page.locator('#policy-file').setInputFiles({ name: 'fixture-prueba-no-entrenada.json', mimeType: 'application/json', buffer: Buffer.from(text) });
}
async function start(page: Page) {
  await page.clock.install();
  await page.goto('/'); await upload(page);
  await expect(page.getByRole('button', { name: 'Iniciar partida', exact: true })).toBeEnabled();
  // Freeze presentation time before starting: slow workers must not spend the
  // fixture's 114-step lifetime while Playwright scrolls to mobile controls.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.getByLabel('Semilla de partida').fill('42');
  await page.getByRole('button', { name: 'Iniciar partida', exact: true }).click();
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
}

for (const width of [390, 1600]) {
test.describe(`rework ${width}px · fixture sintética no entrenada`, () => {
  test.setTimeout(60000);
  test.use({ viewport: { width, height: width === 390 ? 844 : 900 } });

test('I-3: importación inválida, límites, recuperación y semilla segura', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  const startButton = page.getByRole('button', { name: 'Iniciar partida', exact: true });
  await expect(startButton).toBeDisabled();
  const cases = [
    ['{', /JSON corrupto/],
    [JSON.stringify({ ...fixture, schemaVersion: 2 }), /versiones/],
    [JSON.stringify({ ...fixture, rulesVersion: 'otra' }), /versiones/],
    [JSON.stringify({ ...fixture, mapVersion: 'otro' }), /versiones/],
    [JSON.stringify({ ...fixture, architecture: { ...fixture.architecture, hidden: 32 } }), /arquitectura/],
    [JSON.stringify({ ...fixture, parameters: { ...fixture.parameters, b2: [0] } }), /dimensiones/],
    [JSON.stringify(fixture).replace(/("w1":\[)[^,]+/, '$11e999'), /inválido.*w1\./],
    [' '.repeat(2 * 1024 * 1024 + 1), /2 MiB/],
    [JSON.stringify({ checkpointVersion: 1 }), /inválido/],
  ] as const;
  for (const [text, message] of cases) {
    await upload(page); await expect(startButton).toBeEnabled();
    const oversized = Buffer.byteLength(text) > 2 * 1024 * 1024;
    if (oversized) await page.evaluate(() => {
      (window as any).fileReads = 0;
      const original = File.prototype.text;
      File.prototype.text = function () { (window as any).fileReads++; return original.call(this); };
    });
    await upload(page, text);
    await expect(page.getByRole('status')).toContainText(message);
    await expect(startButton).toBeDisabled();
    if (oversized) expect(await page.evaluate(() => (window as any).fileReads)).toBe(0);
    await expect(page.getByTestId('steps')).toHaveText('Pasos: 0 / 3000');
  }
  await upload(page); await expect(startButton).toBeEnabled();
  await expect(page.getByRole('status')).toContainText('sin entrenamiento');
  for (const seed of ['', '-1', '1.5', '4294967296']) {
    await page.getByLabel('Semilla de partida').fill(seed);
    await expect(startButton).toBeDisabled();
    await expect(page.locator('#seed-message')).toContainText('entero');
  }
  await page.getByLabel('Semilla de partida').fill('0'); await expect(startButton).toBeEnabled();
  expect(errors).toEqual([]);
  await checkLayout(page, '#launch-panel', 'import');
});

test('I-2: acciones, trayectoria y pesos coinciden con inferencia/motor; controles no cambian simulación', async ({ page }) => {
  await start(page);
  const result = await page.evaluate(async () => {
    const { game } = await import('/src/main.ts' as string);
    const { createGame, legalActions, step } = await import('/src/game/engine.ts' as string);
    const { observe } = await import('/src/game/engine.ts' as string);
    const { chooseAction } = await import('/src/learning/policy.ts' as string);
    const launch = game.scene.getScene('LaunchScene');
    const player = launch.playback;
    const original = JSON.stringify(player.policy);
    let expected = createGame(42), matches = true;
    for (let i = 0; i < 100 && expected.status === 'running'; i++) {
      const action = chooseAction(player.policy, observe(expected), legalActions(expected));
      // Execute the exact callback used by the Phaser timer, not an alternative test runner.
      player.paused = false; launch.pulse(); player.paused = true;
      expected = step(expected, action).state;
      matches &&= player.lastAction === action && JSON.stringify(player.state) === JSON.stringify(expected);
    }
    return { matches, unchanged: original === JSON.stringify(player.policy), state: expected };
  });
  expect(result.matches).toBe(true); expect(result.unchanged).toBe(true);
  await expect(page.getByTestId('points')).toHaveText(`Puntos: ${result.state.points}`);
  await expect(page.getByTestId('lives')).toHaveText(`Vidas: ${result.state.lives}`);
  await expect(page.getByTestId('phase')).toHaveText(`Fase: ${result.state.phase === 'scatter' ? 'dispersión' : 'persecución'}`);
  await expect(page.getByTestId('power')).toHaveText(`Poder: ${result.state.powerRemaining} pasos`);
  await expect(page.getByTestId('steps')).toHaveText(`Pasos: ${result.state.tick} / 3000`);
  await page.clock.runFor(100); // Finish drawing tweens while simulation is paused.
  await checkLayout(page, '#launch-panel', 'playback');
  const state = () => page.evaluate(async () => { const { game } = await import('/src/main.ts' as string); return JSON.stringify(game.scene.getScene('LaunchScene').playback.state); });
  const before = await state(); await page.clock.runFor(250); expect(await state()).toBe(before);
  await page.getByLabel('Velocidad').selectOption('4'); await page.clock.runFor(180); expect(await state()).toBe(before);
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  await expect(page.getByTestId('steps')).toHaveText('Pasos: 0 / 3000');
  // At each real timed pulse, compare against one pure step at either speed.
  await page.evaluate(async () => {
    const { game } = await import('/src/main.ts' as string);
    const { createGame, legalActions, step } = await import('/src/game/engine.ts' as string);
    const { observe } = await import('/src/game/engine.ts' as string);
    const { chooseAction } = await import('/src/learning/policy.ts' as string);
    const launch = game.scene.getScene('LaunchScene'); let expected = createGame(42);
    (window as any).timed = { matches: true, count: 0 };
    const pulse = launch.pulse.bind(launch);
    launch.pulse = () => {
      const old = launch.playback.state.tick; pulse();
      if (old === launch.playback.state.tick) return;
      expected = step(expected, chooseAction(launch.playback.policy, observe(expected), legalActions(expected))).state;
      (window as any).timed.matches &&= JSON.stringify(expected) === JSON.stringify(launch.playback.state);
      (window as any).timed.count++;
    };
  });
  await page.getByRole('button', { name: 'Reanudar', exact: true }).click();
  await page.clock.runFor(250);
  expect(await page.evaluate(async () => { const { game } = await import('/src/main.ts' as string); return game.scene.getScene('BaseScene').rhythm.delay; })).toBe(25);
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  const fast = await page.evaluate(() => (window as any).timed.count); expect(fast).toBeGreaterThanOrEqual(4);
  await page.getByLabel('Velocidad').selectOption('1');
  await page.getByRole('button', { name: 'Reanudar', exact: true }).click();
  expect(await page.evaluate(async () => { const { game } = await import('/src/main.ts' as string); return game.scene.getScene('BaseScene').rhythm.delay; })).toBe(100);
  await page.clock.runFor(350);
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  const timed = await page.evaluate(() => (window as any).timed);
  expect(timed.matches).toBe(true); expect(timed.count - fast).toBeGreaterThanOrEqual(2); expect(await page.evaluate(async () => { const { game } = await import('/src/main.ts' as string); return game.scene.getScene('LaunchScene').playback.speed; })).toBe(1);
  await page.screenshot({ path: 'test-results/step-10-playback.png', fullPage: true });
});

test('I-3: final real resume y permite reiniciar con la misma política', async ({ page }) => {
  await start(page);
  const final = await page.evaluate(async () => {
    const { game } = await import('/src/main.ts' as string);
    const launch = game.scene.getScene('LaunchScene');
    const before = JSON.stringify(launch.playback.policy); launch.playback.paused = false;
    for (let i = 0; i < 3000 && launch.playback.state.status === 'running'; i++) launch.pulse();
    return { state: launch.playback.state, unchanged: before === JSON.stringify(launch.playback.policy) };
  });
  // Phaser queues ResultScene until its next frame. Advance that frame explicitly.
  await page.clock.runFor(100);
  expect(final.state.status).not.toBe('running'); expect(final.unchanged).toBe(true);
  await expect(page.getByTestId('result-summary')).toHaveText(`${final.state.points} puntos · ${final.state.lives} vidas · ${final.state.tick} pasos`);
  await checkLayout(page, '#result-panel', 'final');
  await page.getByRole('button', { name: 'Reiniciar partida', exact: true }).click();
  await expect(page.getByTestId('steps')).toHaveText('Pasos: 0 / 3000');
  await expect(page.getByRole('button', { name: 'Reanudar', exact: true })).toBeVisible();
});

});
}

async function checkLayout(page: Page, selector: string, phase: string) {
  await expect(page.locator(selector)).toBeVisible();
  // One DOM snapshot avoids exhausting the test deadline through a separate
  // protocol/actionability round trip for every mobile control.
  const layout = await page.locator(selector).evaluate(panel => {
    const rect = (el: Element) => {
      const { x, y, width, height } = el.getBoundingClientRect();
      return { x, y, width, height };
    };
    const controls = [...panel.querySelectorAll('button, select, input')]
      .filter(el => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden');
    return {
      canvas: rect(document.querySelector('canvas')!), panel: rect(panel),
      hud: rect(document.querySelector('#hud')!),
      noInternalScroll: panel.scrollHeight <= panel.clientHeight + 1,
      fontSize: parseFloat(getComputedStyle(panel).fontSize),
      controls: controls.map(el => ({ id: el.id || el.textContent, ...rect(el) })),
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  const { canvas, panel, hud } = layout;
  expect(canvas.width).toBeGreaterThan(0); expect(panel.width).toBeGreaterThan(0);
  if (page.viewportSize()!.width === 390) {
    expect(panel.y, `${phase}: panel fuera del canvas`).toBeGreaterThanOrEqual(canvas.y + canvas.height);
    expect(hud.y).toBeGreaterThanOrEqual(canvas.y + canvas.height);
    expect(hud.y + hud.height).toBeLessThanOrEqual(panel.y);
    expect(layout.noInternalScroll).toBe(true);
    expect(layout.fontSize).toBeGreaterThanOrEqual(14);
    // Assert the snapshot includes every expected control, not just a possibly
    // empty filtered list, before checking the existing 44px touch targets.
    expect(layout.controls.map(control => control.id).sort()).toEqual((phase === 'import'
      ? ['select-file', 'seed', 'start']
      : phase === 'playback' ? ['pause', 'speed', 'restart', 'change-policy']
      : ['Reiniciar partida']).sort());
    for (const control of layout.controls) {
      expect(control.height, control.id).toBeGreaterThanOrEqual(44);
    }
    expect(layout.scrollWidth).toBe(390);
  } else {
    expect(panel.x).toBeGreaterThanOrEqual(canvas.x);
    expect(panel.x + panel.width).toBeLessThanOrEqual(canvas.x + canvas.width + 1);
    expect(panel.y + panel.height).toBeLessThanOrEqual(canvas.y + canvas.height + 1);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  const geometry = await boardGeometry(page);
  console.log(`Geometría ${page.viewportSize()!.width} ${phase}:`, JSON.stringify(geometry));
  if (page.viewportSize()!.width === 390) {
    expect(geometry.board.width).toBeGreaterThanOrEqual(350);
    expect(geometry.board.x).toBeGreaterThanOrEqual(0);
    expect(geometry.board.x + geometry.board.width).toBeLessThanOrEqual(390);
  } else {
    expect(geometry.board.x + geometry.board.width).toBeLessThanOrEqual(panel.x);
  }
  expect(geometry.board.y + geometry.board.height).toBeLessThanOrEqual(geometry.canvas.y + geometry.canvas.height);
  await page.screenshot({ path: `tests/browser/evidence/observable-${page.viewportSize()!.width}-${phase}.png`, fullPage: true });
}
