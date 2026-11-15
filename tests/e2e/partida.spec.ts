import { expect, test, type Page } from '@playwright/test';

test.setTimeout(120000);

async function prepare(page: Page) {
  const epoch = new Date('2030-01-01T00:00:00Z');
  await page.clock.install({ time: epoch });
  await page.clock.pauseAt(new Date(epoch.getTime() + 1000));
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.goto('/');
  await expect.poll(async () => {
    await page.clock.runFor(100);
    return page.getByRole('button', { name: 'Jugar', exact: true }).count();
  }, { timeout: 15000 }).toBe(1);
  await expect(page.getByRole('button', { name: 'Jugar', exact: true })).toBeVisible();
}
async function capture(page: Page, touch = false) {
  const box = (await page.locator('canvas').boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height * 440 / 900;
  if (touch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}
async function hidden(page: Page, value: boolean) {
  await page.evaluate(value => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => value });
    document.dispatchEvent(new Event('visibilitychange'));
  }, value);
}

test('juego-1/4/6: escenas, captura, tercer fallo, resultado y reinicio limpio', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  await prepare(page);
  await page.screenshot({ path: info.outputPath('inicio.png') });
  await page.getByRole('button', { name: 'Jugar', exact: true }).click();
  await page.clock.runFor(32);
  await expect(page.getByText('Puntos: 0', { exact: true })).toBeVisible();
  await expect(page.getByText('Fallos: 0 / 3', { exact: true })).toBeVisible();
  await capture(page);
  await expect(page.getByText('Puntos: 1', { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('partida.png') });
  for (let i = 1; i <= 3; i++) {
    await page.clock.runFor(1950);
    if (i < 3) await expect(page.getByText(`Fallos: ${i} / 3`, { exact: true })).toBeVisible();
  }
  await expect(page.getByText('Puntaje final: 1', { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('resultado.png') });
  await page.clock.fastForward(5000);
  await page.getByRole('button', { name: 'Jugar otra vez' }).click();
  await page.clock.runFor(32);
  await page.clock.runFor(32);
  await expect(page.getByText('Puntos: 0', { exact: true })).toBeVisible();
  await expect(page.getByText('Fallos: 0 / 3', { exact: true })).toBeVisible();
  await page.clock.runFor(1000);
  await expect(page.getByText('Fallos: 0 / 3', { exact: true })).toBeVisible();
  await capture(page);
  await expect(page.getByText('Puntos: 1', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('juego-4: visibilitychange conserva el tiempo restante sin fallos ocultos', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Jugar', exact: true }).click();
  await page.clock.runFor(1032);
  await hidden(page, true);
  await expect(page.getByText('Partida en pausa')).toBeVisible();
  await page.clock.fastForward(10000);
  await expect(page.getByText('Fallos: 0 / 3', { exact: true })).toBeVisible();
  await hidden(page, false);
  await page.clock.runFor(500);
  await expect(page.getByText('Fallos: 0 / 3', { exact: true })).toBeVisible();
  await page.clock.runFor(600);
  await expect(page.getByText('Fallos: 1 / 3', { exact: true })).toBeVisible();
});

test.describe('entrada táctil', () => {
  test.use({ viewport: { width: 360, height: 800 }, hasTouch: true });
  test('juego-1: toque inicia y captura una estrella', async ({ page }) => {
    await prepare(page);
    await page.getByRole('button', { name: 'Jugar', exact: true }).tap();
    await page.clock.runFor(32);
    await expect(page.getByText('Puntos: 0', { exact: true })).toBeVisible();
    await capture(page, true);
    await expect(page.getByText('Puntos: 1', { exact: true })).toBeVisible();
  });
});
