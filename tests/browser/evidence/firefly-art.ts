import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { createNetwork } from '../../../src/learning/network';
import { toPolicy } from '../../../src/learning/policy';

// These pixel checks preserve the chosen visual cues; human recognition is
// reviewed separately on unchanged 390×844 screenshots, never inferred here.
test.describe('arte luciérnaga 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('I-1/I-2: alas marfil y abdomen ámbar distintos del prisma en ambos frames', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    const policy = toPolicy(createNetwork(123), { seed: 123, trainingSteps: 0, updates: 0 });
    await page.locator('#policy-file').setInputFiles({ name: 'fixture-sintetica-no-entrenada.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(policy)) });
    await expect(page.locator('#start')).toBeEnabled();
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    const stage = process.env.FIREFLY_ART_STAGE === 'before' ? 'before' : 'after';
    const cues = await page.evaluate(async () => {
      const { game } = await import('/src/main.ts' as string);
      const raster = (key: string, frame: number) => {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 16;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(game.textures.get(key).getSourceImage(), frame * 16, 0, 16, 16, 0, 0, 16, 16);
        const pixels = ctx.getImageData(0, 0, 16, 16).data;
        const coords = (r: number, g: number, b: number) => {
          const result: { x: number; y: number }[] = [];
          for (let i = 0; i < pixels.length; i += 4) if (pixels[i] === r && pixels[i + 1] === g && pixels[i + 2] === b && pixels[i + 3] === 255) result.push({ x: (i / 4) % 16, y: Math.floor(i / 64) });
          return result;
        };
        return { amber: coords(255, 196, 71), ivory: coords(255, 244, 214), turquoise: coords(105, 216, 205) };
      };
      return { frames: [raster('actors', 0), raster('actors', 1)], power: raster('tiles', 3) };
    });
    for (const phase of (stage === 'before' ? ['import'] : ['import', 'playback'])) {
      if (phase === 'playback') {
        await page.locator('#seed').fill('42');
        await page.locator('#start').click(); await page.locator('#pause').click(); await page.locator('#restart').click();
        await page.evaluate(async () => {
          const { game } = await import('/src/main.ts' as string);
          const launch = game.scene.getScene('LaunchScene');
          for (let i = 0; i < 100; i++) { launch.playback.paused = false; launch.pulse(); launch.playback.paused = true; }
        });
      }
      await page.clock.runFor(150); // settle drawing tweens, no simulated movement
      for (const frame of [0, 1]) {
        const data = await page.evaluate(async frame => {
          const { game } = await import('/src/main.ts' as string);
          const base = game.scene.getScene('BaseScene');
          base.playerSprite.anims.stop(); base.playerSprite.setFrame(frame);
          return { state: base.state, frame, animationExists: game.anims.exists('lumina-flutter'), logical: { width: game.scale.width, height: game.scale.height }, displayWidth: base.playerSprite.displayWidth, cues: 'art texture regression, not recognition proof' };
        }, frame);
        await page.clock.runFor(20); // render this actual spritesheet frame
        await page.evaluate(() => window.scrollTo(0, 0));
        const prefix = `tests/browser/evidence/firefly-art-390/${stage}-${phase}-${frame}`;
        await page.screenshot({ path: `${prefix}-viewport.png` });
        writeFileSync(`${prefix}.json`, JSON.stringify({ ...data, cues }, null, 2) + '\n');
      }
    }
    console.log('Señales rasterizadas HTTP Chromium:', JSON.stringify(cues));
    for (const [frame, cue] of cues.frames.entries()) {
      expect(cue.amber.length, `frame ${frame}: abdomen ámbar, no prisma turquesa`).toBeGreaterThanOrEqual(12);
      expect(cue.ivory.filter(p => p.x <= 4).length, `frame ${frame}: ala izquierda marfil`).toBeGreaterThanOrEqual(12);
      expect(cue.ivory.filter(p => p.x >= 11).length, `frame ${frame}: ala derecha marfil`).toBeGreaterThanOrEqual(12);
      expect(cue.amber.every(p => p.x >= 5 && p.x <= 10 && p.y >= 9)).toBe(true);
    }
    expect(cues.power.amber).toHaveLength(0); expect(cues.power.ivory).toHaveLength(0);
    expect(cues.power.turquoise.length).toBeGreaterThan(0);
  });
});
