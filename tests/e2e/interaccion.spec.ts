import { expect, test, type Page } from '@playwright/test';

test.setTimeout(90000);
async function prepare(page: Page, random = 0.5, touch = false) {
  const epoch = new Date('2030-01-01');
  await page.clock.install({ time: epoch });
  await page.clock.pauseAt(new Date(+epoch + 1000));
  await page.addInitScript(value => { Math.random = () => value; }, random);
  await page.goto('/');
  await expect.poll(async () => {
    await page.clock.runFor(100);
    return page.getByRole('button', { name: 'Jugar', exact: true }).count();
  }).toBe(1);
  // Solo la prueba controla el reloj monotónico; no hay API de trampa en producción.
  await page.evaluate(() => {
    const control = window as unknown as { testNow: number };
    control.testNow = 0;
    Object.defineProperty(performance, 'now', { configurable: true, value: () => control.testNow });
  });
  const start = page.getByRole('button', { name: 'Jugar', exact: true });
  if (touch) await start.tap(); else await start.click();
  await page.clock.runFor(32);
}
async function now(page: Page, value: number) {
  await page.evaluate(value => { (window as unknown as { testNow: number }).testNow = value; }, value);
}
async function point(page: Page, x = 800, y = 440) {
  const box = (await page.locator('canvas').boundingBox())!;
  return { x: box.x + x * box.width / 1600, y: box.y + y * box.height / 900 };
}
async function status(page: Page, points: number, misses: number) {
  await expect(page.getByText(`Puntos: ${points}`, { exact: true })).toBeVisible();
  await expect(page.getByText(`Fallos: ${misses} / 3`, { exact: true })).toBeVisible();
}

test('juego-2/3: exterior, entrada repetida, duración reducida y frontera exacta', async ({ page }) => {
  await prepare(page);
  const outside = await point(page, 50, 450);
  await now(page, 1999);
  await page.mouse.click(outside.x, outside.y);
  await status(page, 0, 0);
  const center = await point(page);
  // Se redistribuye el MISMO objeto Event dos veces, no dos clics distintos.
  await page.evaluate(({ x, y }) => {
    const canvas = document.querySelector('canvas')!;
    const event = new MouseEvent('mousedown', { clientX: x, clientY: y, bubbles: true, buttons: 1 });
    canvas.dispatchEvent(event);
    canvas.dispatchEvent(event);
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, bubbles: true }));
  }, center);
  await status(page, 1, 0);
  await now(page, 3899); // 1999 + 1900: vence antes de capturar, sin una actualización intermedia.
  await page.mouse.click(center.x, center.y);
  await status(page, 1, 1);
  await now(page, 5798);
  await page.clock.runFor(32);
  await status(page, 1, 1);
  await now(page, 5799);
  await page.clock.runFor(32);
  await status(page, 1, 2);
});

test('juego-3: primera actualización tras el plazo; no acumula fallos por frames retrasados', async ({ page }) => {
  await prepare(page);
  await now(page, 1999);
  await page.clock.runFor(32);
  await status(page, 0, 0);
  await now(page, 2000);
  await page.clock.runFor(17);
  await status(page, 0, 1);
  await now(page, 20000);
  await page.clock.runFor(17);
  await status(page, 0, 2);
  await page.clock.runFor(32);
  await status(page, 0, 2);
});

for (const random of [0, 0.5, 1]) {
  test(`juego-2: posición determinista ${random} y clic en zona visible`, async ({ page }) => {
    await prepare(page, random);
    const center = await point(page, 224 + random * 1152, 312 + random * 256);
    await page.mouse.click(center.x, center.y);
    await status(page, 1, 0);
  });
}


test.describe('teléfono: entradas reales emuladas y evento repetido', () => {
  test.use({ viewport: { width: 360, height: 800 }, hasTouch: true });
  for (const random of [0, 0.5, 1]) {
    test(`juego-2/3: toque con azar ${random}, exterior y vencimiento`, async ({ page }) => {
      await prepare(page, random, true);
      const outside = await point(page, 50, 450);
      await now(page, 1999);
      await page.touchscreen.tap(outside.x, outside.y);
      await status(page, 0, 0);
      const center = await point(page, 224 + random * 1152, 312 + random * 256);
      await page.touchscreen.tap(center.x, center.y);
      await status(page, 1, 0);
      await now(page, 3899);
      await page.touchscreen.tap(center.x, center.y);
      await status(page, 1, 1);
    });
  }
  test('juego-2: el mismo TouchEvent no captura la sucesora', async ({ page }) => {
    await prepare(page, 0.5, true);
    await page.evaluate(({ x, y }) => {
      const canvas = document.querySelector('canvas')!;
      const touch = new Touch({ identifier: 7, target: canvas, clientX: x, clientY: y, pageX: x, pageY: y });
      const event = new TouchEvent('touchstart', { touches: [touch], targetTouches: [touch], changedTouches: [touch], bubbles: true });
      canvas.dispatchEvent(event);
      canvas.dispatchEvent(event);
      canvas.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch], bubbles: true }));
    }, await point(page));
    await status(page, 1, 0);
  });
});

test('juego-3: el navegador respeta el mínimo de 500 ms', async ({ page }) => {
  await prepare(page);
  const center = await point(page);
  for (let i = 0; i < 20; i++) await page.mouse.click(center.x, center.y);
  await status(page, 20, 0);
  await now(page, 499);
  await page.clock.runFor(17);
  await status(page, 20, 0);
  await now(page, 500);
  await page.clock.runFor(17);
  await status(page, 20, 1);
});
