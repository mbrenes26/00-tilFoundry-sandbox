import type Phaser from 'phaser';
import type { GameState, PlayArea } from '../../src/game/types';
import { starCaptureRects } from '../../src/game/geometry';
import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.setTimeout(90000);
for (const [width, height] of [[1280, 720], [1600, 900], [360, 800], [390, 844]]) {
  test.describe(`${width}×${height}`, () => {
    test.use({ viewport: { width, height }, hasTouch: width < 400 });
    for (const random of [0, 0.5, 1]) test(`azar ${random}: juego-5: medidas, FIT, clic/toque y tres pantallas sin recortes`, async ({ page }, info) => {
      const epoch = new Date('2030-01-01');
      await page.clock.install({ time: epoch });
      await page.clock.pauseAt(new Date(+epoch + 1000));
      await page.addInitScript(value => { Math.random = () => value; }, random);
      // Interceptar boot solo desde la prueba; no hay API de trampas en producción.
      await page.addInitScript(() => {
        const target = window as unknown as { Phaser: typeof Phaser; testGame: Phaser.Game };
        let phaser: typeof Phaser;
        Object.defineProperty(window, 'Phaser', {
          configurable: true, get: () => phaser,
          set: (value: typeof Phaser) => {
            phaser = value;
            const prototype = value.Game.prototype as unknown as { boot(this: Phaser.Game): void };
            const boot = prototype.boot;
            prototype.boot = function () { target.testGame = this; return boot.call(this); };
          },
        });
      });
      await page.goto('/');
      await expect.poll(async () => {
        await page.clock.runFor(100);
        return page.getByRole('button', { name: 'Jugar', exact: true }).count();
      }).toBe(1);
      await page.evaluate(() => {
        const control = window as unknown as { testNow: number };
        control.testNow = 0;
        Object.defineProperty(performance, 'now', { value: () => control.testNow, configurable: true });
      });
      const measurements: unknown[] = [];
      const observedFrames = new Set<string | number>();
      async function measure(screen: string) {
        const data = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll<HTMLElement>('h1, .game-card p, .game-card h2, button, .game-hud span, .game-note'));
          return {
            scroll: document.documentElement.scrollWidth,
            items: elements.map(el => {
              const rect = el.getBoundingClientRect();
              const range = document.createRange(); range.selectNodeContents(el);
              const text = range.getBoundingClientRect();
              return { label: el.textContent, button: el.tagName === 'BUTTON', font: parseFloat(getComputedStyle(el).fontSize),
                x: rect.x, y: rect.y, width: rect.width, height: rect.height,
                text: { x: text.x, y: text.y, right: text.right, bottom: text.bottom } };
            }),
          };
        });
        expect(data.scroll).toBeLessThanOrEqual(width);
        for (const item of data.items) {
          expect(item.font).toBeGreaterThanOrEqual(16);
          expect(item.x).toBeGreaterThanOrEqual(0); expect(item.y).toBeGreaterThanOrEqual(0);
          expect(item.x + item.width).toBeLessThanOrEqual(width + 0.1);
          expect(item.y + item.height).toBeLessThanOrEqual(height + 0.1);
          expect(item.text.x).toBeGreaterThanOrEqual(item.x - 0.1);
          expect(item.text.right).toBeLessThanOrEqual(item.x + item.width + 0.1);
          expect(item.text.y).toBeGreaterThanOrEqual(item.y - 0.1);
          expect(item.text.bottom).toBeLessThanOrEqual(item.y + item.height + 0.1);
          if (item.button) { expect(item.width).toBeGreaterThanOrEqual(44); expect(item.height).toBeGreaterThanOrEqual(44); }
        }
        for (let i = 0; i < data.items.length; i++) for (let j = i + 1; j < data.items.length; j++) {
          const a = data.items[i], b = data.items[j];
          const overlaps = a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
          expect(overlaps, `${a.label} / ${b.label}`).toBe(false);
        }
        const canvas = (await page.locator('canvas').boundingBox())!;
        expect(canvas.width / canvas.height).toBeCloseTo(1600 / 900, 2);
        await expect(page.locator('canvas')).toHaveAttribute('width', '1600');
        await expect(page.locator('canvas')).toHaveAttribute('height', '900');
        expect(canvas.x).toBeGreaterThanOrEqual(-0.1); expect(canvas.y).toBeGreaterThanOrEqual(0);
        expect(canvas.x + canvas.width).toBeLessThanOrEqual(width + 0.1);
        expect(canvas.y + canvas.height).toBeLessThanOrEqual(height + 0.1);
        if (screen === 'partida') {
          const observed = await page.evaluate(() => {
            const game = (window as unknown as { testGame: Phaser.Game }).testGame;
            const scene = game.scene.getScene('LaunchScene') as Phaser.Scene & { state: GameState };
            const sprite = scene.children.list.find(object =>
              object instanceof (window as unknown as { Phaser: typeof Phaser }).Phaser.GameObjects.Sprite) as Phaser.GameObjects.Sprite;
            const frame = sprite.frame;
            const camera = scene.cameras.main;
            const matrix = sprite.getWorldTransformMatrix();
            const raster = document.createElement('canvas');
            raster.width = frame.cutWidth; raster.height = frame.cutHeight;
            const context = raster.getContext('2d')!;
            context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
              frame.cutWidth, frame.cutHeight, 0, 0, raster.width, raster.height);
            const rgba = context.getImageData(0, 0, raster.width, raster.height).data;
            const transform = (x: number, y: number) => {
              const point = matrix.transformPoint(x - sprite.displayOriginX, y - sprite.displayOriginY);
              return { x: point.x, y: point.y };
            };
            const pixels = [];
            const corners = [];
            for (let y = 0; y < raster.height; y++) for (let x = 0; x < raster.width; x++) {
              const opaque = rgba[(y * raster.width + x) * 4 + 3] > 0;
              pixels.push({ ...transform(x + 0.5, y + 0.5), opaque });
              if (opaque) corners.push(transform(x, y), transform(x + 1, y + 1));
            }
            return { star: scene.state.star!, area: scene.state.config.area, pixels,
              visible: { x: Math.min(...corners.map(p => p.x)), y: Math.min(...corners.map(p => p.y)),
                width: Math.max(...corners.map(p => p.x)) - Math.min(...corners.map(p => p.x)),
                height: Math.max(...corners.map(p => p.y)) - Math.min(...corners.map(p => p.y)) },
              spriteBounds: sprite.getBounds(),
              frame: { name: frame.name, x: frame.cutX, y: frame.cutY, width: frame.cutWidth, height: frame.cutHeight },
              transform: { a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d, e: matrix.e, f: matrix.f },
              camera: { scrollX: camera.scrollX, scrollY: camera.scrollY, zoom: camera.zoom, rotation: (camera as unknown as { rotation: number }).rotation },
            };
          });
          // Este juego no desplaza ni gira la cámara: coordenadas mundiales = lógicas del lienzo.
          expect(observed.camera).toEqual({ scrollX: 0, scrollY: 0, zoom: 1, rotation: 0 });
          observedFrames.add(observed.frame.name);
          const rects = starCaptureRects(observed.star);
          for (const pixel of observed.pixels) {
            expect(rects.some(r => pixel.x >= r.x && pixel.x <= r.right
              && pixel.y >= r.y && pixel.y <= r.bottom),
            `fotograma ${observed.frame.name}, píxel ${pixel.x},${pixel.y}`).toBe(pixel.opaque);
          }
          const interactive = { x: Math.min(...rects.map(r => r.x)), y: Math.min(...rects.map(r => r.y)),
            width: Math.max(...rects.map(r => r.right)) - Math.min(...rects.map(r => r.x)),
            height: Math.max(...rects.map(r => r.bottom)) - Math.min(...rects.map(r => r.y)) };
          for (const key of ['x', 'y', 'width', 'height'] as const) {
            expect(observed.visible[key], `visible / captura: ${key}`).toBeCloseTo(interactive[key], 6);
            expect(observed.spriteBounds[key], `sprite / visible: ${key}`).toBeCloseTo(observed.visible[key], 6);
          }
          const project = (r: PlayArea) => ({ x: canvas.x + r.x * canvas.width / 1600,
            y: canvas.y + r.y * canvas.height / 900,
            width: r.width * canvas.width / 1600, height: r.height * canvas.height / 900 });
          const area = project(observed.area);
          const overlaps = (a: PlayArea, b: PlayArea) => a.x < b.x + b.width && b.x < a.x + a.width
            && a.y < b.y + b.height && b.y < a.y + a.height;
          for (const target of [project(observed.visible), project(interactive)]) {
            expect(target.width).toBeGreaterThanOrEqual(44); expect(target.height).toBeGreaterThanOrEqual(44);
            for (const container of [canvas, area]) {
              expect(target.x).toBeGreaterThanOrEqual(container.x - 0.01);
              expect(target.y).toBeGreaterThanOrEqual(container.y - 0.01);
              expect(target.x + target.width).toBeLessThanOrEqual(container.x + container.width + 0.01);
              expect(target.y + target.height).toBeLessThanOrEqual(container.y + container.height + 0.01);
            }
            for (const hud of data.items) expect(overlaps(target, hud), hud.label ?? '').toBe(false);
          }
          expect(area.width).toBeGreaterThanOrEqual(project(interactive).width);
          expect(area.height).toBeGreaterThanOrEqual(project(interactive).height);
          for (const hud of data.items) expect(overlaps(area, hud), hud.label ?? '').toBe(false);
          const { pixels, ...details } = observed;
          measurements.push({ random, ...details, testedPixels: pixels.length, rects,
            css: { visible: project(observed.visible), interactive: project(interactive), area } });
        }
        measurements.push({ screen, canvas, ...data });
        await page.screenshot({ path: info.outputPath(`${screen}-${measurements.length}.png`) });
        return canvas;
      }
      await measure('inicio');
      const start = page.getByRole('button', { name: 'Jugar', exact: true });
      if (width < 400) await start.tap(); else await start.click();
      await page.clock.runFor(32);
      const canvas = await measure('partida');
      await page.clock.runFor(300);
      await measure('partida'); // También observar el segundo fotograma animado.
      expect([...observedFrames].sort()).toEqual([0, 1]);
      const center = await page.evaluate(() => {
        const scene = (window as unknown as { testGame: Phaser.Game }).testGame.scene.getScene('LaunchScene') as Phaser.Scene & { state: GameState };
        return scene.state.star!;
      });
      const x = canvas.x + center.x * canvas.width / 1600, y = canvas.y + center.y * canvas.height / 900;
      if (width < 400) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y);
      await expect(page.getByText('Puntos: 1', { exact: true })).toBeVisible();
      for (const time of [1900, 3800, 5700]) {
        await page.evaluate(time => { (window as unknown as { testNow: number }).testNow = time; }, time);
        await page.clock.runFor(32);
      }
      await expect(page.getByText('Puntaje final: 1', { exact: true })).toBeVisible();
      await measure('resultado');
      await writeFile(info.outputPath('medidas.json'), JSON.stringify(measurements, null, 2));
      await info.attach('medidas', { path: info.outputPath('medidas.json'), contentType: 'application/json' });
      console.log(`${width}×${height}, azar ${random}: medidas.json; ambos fotogramas, 1024 píxeles por fotograma, contención y mínimo táctil verificados`);
    });
  });
}
