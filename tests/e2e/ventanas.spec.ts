import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.setTimeout(90000);
for (const [width, height] of [[1280, 720], [1600, 900], [360, 800], [390, 844]]) {
  test.describe(`${width}×${height}`, () => {
    test.use({ viewport: { width, height }, hasTouch: width < 400 });
    test('juego-5: medidas, FIT, clic/toque y tres pantallas sin recortes', async ({ page }, info) => {
      const epoch = new Date('2030-01-01');
      await page.clock.install({ time: epoch });
      await page.clock.pauseAt(new Date(+epoch + 1000));
      await page.addInitScript(() => { Math.random = () => 0; });
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
          // Límites lógicos verificados por Vitest y por capturas en ambos extremos.
          const scale = canvas.width / 1600;
          const star = { x: canvas.x + 112 * scale, y: canvas.y + 200 * scale, width: 224 * scale, height: 224 * scale };
          expect(star.width).toBeGreaterThanOrEqual(44); expect(star.height).toBeGreaterThanOrEqual(44);
          expect((680 - 200) * scale).toBeGreaterThanOrEqual(star.height);
          for (const hud of data.items) {
            const area = { x: canvas.x + 112 * scale, y: canvas.y + 200 * scale, width: 1376 * scale, height: 480 * scale };
            expect(area.x < hud.x + hud.width && hud.x < area.x + area.width && area.y < hud.y + hud.height && hud.y < area.y + area.height, hud.label ?? '').toBe(false);
          }
          measurements.push({ star });
        }
        measurements.push({ screen, canvas, ...data });
        await page.screenshot({ path: info.outputPath(`${screen}.png`) });
        return canvas;
      }
      await measure('inicio');
      const start = page.getByRole('button', { name: 'Jugar', exact: true });
      if (width < 400) await start.tap(); else await start.click();
      await page.clock.runFor(32);
      const canvas = await measure('partida');
      const x = canvas.x + 224 * canvas.width / 1600, y = canvas.y + 312 * canvas.height / 900;
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
      console.log(`${width}×${height}: ${JSON.stringify(measurements)}`);
    });
  });
}
