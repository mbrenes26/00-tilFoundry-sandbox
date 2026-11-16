import type Phaser from 'phaser';
import type { GameState } from '../../src/game/types';
import { expect, test, type Page } from '@playwright/test';

test.setTimeout(90000);
async function prepare(page: Page, random = 0.5, touch = false) {
  const epoch = new Date('2030-01-01');
  await page.clock.install({ time: epoch });
  await page.clock.pauseAt(new Date(+epoch + 1000));
  await page.addInitScript(value => { Math.random = () => value; }, random);
  // Observación del estado real sin añadir interfaces de prueba a producción.
  await page.addInitScript(() => {
    const target = window as unknown as { Phaser: typeof Phaser; testGame: Phaser.Game };
    let phaser: typeof Phaser;
    Object.defineProperty(window, 'Phaser', {
      configurable: true,
      get: () => phaser,
      set: (value: typeof Phaser) => {
        phaser = value;
        const prototype = value.Game.prototype as unknown as { boot(this: Phaser.Game): void };
        const boot = prototype.boot;
        prototype.boot = function () {
          target.testGame = this;
          return boot.call(this);
        };
      },
    });
  });
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

async function activeStar(page: Page) {
  return page.evaluate(() => {
    const game = (window as unknown as { testGame: Phaser.Game }).testGame;
    const scene = game.scene.getScene('LaunchScene') as unknown as { state: GameState };
    return scene.state.star!;
  });
}

async function activeFrame(page: Page) {
  return page.evaluate(() => {
    const game = (window as unknown as { testGame: Phaser.Game }).testGame;
    const scene = game.scene.getScene('LaunchScene') as unknown as { star: Phaser.GameObjects.Sprite };
    return String(scene.star.frame.name);
  });
}

for (const touch of [false, true]) {
  test.describe(touch ? 'silueta: teléfono táctil' : 'silueta: ratón de escritorio', () => {
    test.use({ viewport: touch ? { width: 360, height: 800 } : { width: 1280, height: 720 }, hasTouch: touch });
    test('juego-2/3/5: transparencia conserva identidad y plazo; brazos capturan una vez', async ({ page }) => {
      await prepare(page, 0.5, touch);
      const initial = await activeStar(page);
      const canvas = (await page.locator('canvas').boundingBox())!;
      expect(initial.size * canvas.width / 1600).toBeGreaterThanOrEqual(44);
      expect(initial.size * canvas.height / 900).toBeGreaterThanOrEqual(44);
      const enter = async (x: number, y: number) => {
        const position = await point(page, initial.x + (x / 32 - 0.5) * initial.size,
          initial.y + (y / 32 - 0.5) * initial.size);
        if (touch) await page.touchscreen.tap(position.x, position.y);
        else await page.mouse.click(position.x, position.y);
      };
      await now(page, 1999);
      const frames = new Set<string>();
      for (let frame = 0; frame < 2; frame++) {
        frames.add(await activeFrame(page));
        for (const [x,y] of [[2,2], [30,30], [7,10], [-2,16]]) {
          await enter(x,y);
          await status(page, 0, 0);
          expect(await activeStar(page)).toEqual(initial);
        }
        await page.clock.runFor(250); // Animación real; el reloj activo sigue en 1999.
      }
      expect([...frames].sort()).toEqual(['0', '1']);
      await status(page, 0, 0);
      await now(page, 2000);
      await page.clock.runFor(17);
      await status(page, 0, 1);
      expect(await activeStar(page)).toMatchObject({ id: initial.id + 1, startedAt: 2000, durationMs: 2000 });
      // Los cuatro brazos y el centro son visibles en ambos fotogramas.
      for (const [x,y] of [[16,2], [2,16], [30,16], [16,30], [16,16]]) {
        await enter(x,y);
        await page.clock.runFor(250);
      }
      await status(page, 5, 1);
      expect(await activeStar(page)).toMatchObject({ id: initial.id + 6, startedAt: 2000, durationMs: 1500 });
    });
  });
}

for (const touch of [false, true]) {
  test.describe(touch ? 'teclado en teléfono emulado' : 'teclado en escritorio', () => {
    test.use({ viewport: touch ? { width: 360, height: 800 } : { width: 1280, height: 720 }, hasTouch: touch });
    test('juego-2/3/5: acción accesible, repetición, frontera, pausa y reinicio', async ({ page }) => {
      await prepare(page, 0.5, touch);
      const action = page.getByRole('button', { name: 'Atrapar estrella', exact: true });
      await expect(action).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(action).toBeFocused();
      expect(await action.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
      await page.keyboard.down('Enter');
      await status(page, 1, 0);
      await page.keyboard.down('Enter'); // repeat=true: no captura la sucesora.
      await status(page, 1, 0);
      await page.keyboard.up('Enter');
      await page.keyboard.press('Space');
      await status(page, 2, 0);
      await action.evaluate(el => {
        const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        el.dispatchEvent(event);
        el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
        el.dispatchEvent(event); // misma identidad aun después de soltar.
        el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
      });
      await status(page, 3, 0);
      await now(page, 1700);
      await page.keyboard.press('Enter');
      await status(page, 3, 1); // vencimiento prevalece sin frame intermedio.
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await now(page, 10000);
      await page.keyboard.press('Space');
      await status(page, 3, 1);
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.keyboard.press('Space');
      await status(page, 4, 1);
      const oldControl = await action.elementHandle();
      await now(page, 11600);
      await page.clock.runFor(32);
      await status(page, 4, 2);
      await now(page, 13200);
      await page.clock.runFor(32);
      await expect(action).toHaveCount(0);
      await page.getByRole('button', { name: 'Jugar otra vez' }).click();
      await page.clock.runFor(32);
      await status(page, 0, 0);
      await oldControl!.evaluate(el => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        (el as HTMLButtonElement).click();
      });
      await status(page, 0, 0);
      await expect(action).toHaveCount(1);
      await action.focus();
      await page.keyboard.press('Enter');
      await status(page, 1, 0);
    });
  });
}
