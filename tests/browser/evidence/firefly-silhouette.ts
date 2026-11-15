import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createNetwork } from '../../../src/learning/network';
import { toPolicy } from '../../../src/learning/policy';

// Protect a four-lobed wing silhouette, not human recognition. Review the
// native viewport separately. Unique paths preserve all previous evidence.
test.describe('silueta insecto 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('I-1/I-2: cuatro lóbulos separados y cola luminosa en ambos frames', async ({ page }) => {
    await page.clock.install(); await page.goto('/');
    const policy = toPolicy(createNetwork(123), { seed: 123, trainingSteps: 0, updates: 0 });
    await page.locator('#policy-file').setInputFiles({ name: 'fixture-no-entrenada.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(policy)) });
    await expect(page.locator('#start')).toBeEnabled();
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await page.locator('#seed').fill('42'); await page.locator('#start').click();
    await page.locator('#pause').click(); await page.locator('#restart').click();
    const stage = process.env.FIREFLY_SILHOUETTE_STAGE === 'before' ? 'before' : 'after';
    const directory = 'tests/browser/evidence/firefly-silhouette-390'; mkdirSync(directory, { recursive: true });
    const cues = await page.evaluate(async () => {
      const { game } = await import('/src/main.ts' as string);
      return [0, 1].map(frame => {
        const c = document.createElement('canvas'); c.width = c.height = 16;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(game.textures.get('actors').getSourceImage(), frame * 16, 0, 16, 16, 0, 0, 16, 16);
        const pixels = ctx.getImageData(0, 0, 16, 16).data;
        const alpha = (x: number, y: number) => pixels[(y * 16 + x) * 4 + 3];
        const count = (x0: number, x1: number, y0: number, y1: number) => {
          let n = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (alpha(x, y) === 255) n++; return n;
        };
        return { frame, wingGap: [...Array(5).keys()].every(x => alpha(x, 7) === 0 && alpha(15 - x, 7) === 0),
          lobes: [count(0, 4, 2, 6), count(11, 15, 2, 6), count(0, 4, 8, 10), count(11, 15, 8, 10)],
          tail: count(6, 9, 14, 15) };
      });
    });
    for (const phase of (stage === 'before' ? ['inicio'] : ['inicio', 'reproduccion'])) {
      if (phase === 'reproduccion') await page.evaluate(async () => {
        const { game } = await import('/src/main.ts' as string); const launch = game.scene.getScene('LaunchScene');
        for (let i = 0; i < 100; i++) { launch.playback.paused = false; launch.pulse(); launch.playback.paused = true; }
      });
      await page.clock.runFor(150);
      for (const frame of [0, 1]) {
        const metadata = await page.evaluate(async frame => {
          const { game } = await import('/src/main.ts' as string); const base = game.scene.getScene('BaseScene');
          base.playerSprite.anims.stop(); base.playerSprite.setFrame(frame);
          return { state: base.state, frame, displayWidth: base.playerSprite.displayWidth, resolution: [game.scale.width, game.scale.height], animationExists: game.anims.exists('lumina-flutter') };
        }, frame);
        await page.clock.runFor(20); await page.evaluate(() => window.scrollTo(0, 0));
        const prefix = `${directory}/${stage}-${phase}-${frame}`;
        await page.screenshot({ path: `${prefix}-viewport.png` });
        writeFileSync(`${prefix}.json`, JSON.stringify({ ...metadata, cues, recognition: 'pendiente de revisión visual independiente' }, null, 2) + '\n');
      }
    }
    console.log('Silueta cargada por HTTP Chromium:', JSON.stringify(cues));
    for (const cue of cues) {
      expect.soft(cue.wingGap, `frame ${cue.frame}: separación transparente entre alas superiores e inferiores`).toBe(true);
      for (const [lobe, count] of cue.lobes.entries()) expect.soft(count, `frame ${cue.frame}, lóbulo ${lobe}`).toBeGreaterThanOrEqual(8);
      expect.soft(cue.tail, `frame ${cue.frame}: cola alargada fuera de alas`).toBeGreaterThanOrEqual(4);
    }
  });
});
