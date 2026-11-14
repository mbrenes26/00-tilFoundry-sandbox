import type { Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';

// Diagnostic capture only: no forced frames, actors, colors or game state.
export async function captureIdentity(page: Page, phase: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  for (let sample = 0; sample < 2; sample++) {
    // Advance only presentation; caller has paused simulation. Complete tweens
    // and sample the natural 5 fps animation at different times.
    await page.clock.runFor(sample === 0 ? 100 : 200);
    const data = await page.evaluate(async () => {
      const { game } = await import('/src/main.ts' as string);
      const base = game.scene.getScene('BaseScene');
      const canvas = game.canvas.getBoundingClientRect();
      const scale = canvas.width / 1600;
      const camera = base.cameras.main;
      const actors = base.children.list.filter((o: any) => o.texture?.key === 'actors').map((s: any, index: number) => {
        const position = index === 0 ? base.state.player.position : base.state.guardians[index - 1].position;
        const center = base.cellCenter(position);
        return { identity: index === 0 ? 'luciérnaga' : `guardián-${index}`, position, visible: s.visible,
          animation: s.anims.currentAnim.key, frame: s.frame.name,
          center: { x: canvas.x + (s.x - camera.scrollX) * scale, y: canvas.y + (s.y - camera.scrollY) * scale },
          expectedCenter: { x: canvas.x + (center.x - camera.scrollX) * scale, y: canvas.y + (center.y - camera.scrollY) * scale },
          frameSize: { width: s.displayWidth * scale, height: s.displayHeight * scale } };
      });
      return { viewport: { width: innerWidth, height: innerHeight }, state: base.state, actors,
        tweens: base.tweens.getTweensOf(base.playerSprite).length };
    });
    const prefix = `tests/browser/evidence/identity-${data.viewport.width}-${phase}-${sample}`;
    await page.screenshot({ path: `${prefix}-viewport.png` });
    await page.screenshot({ path: `${prefix}-document.png`, fullPage: true });
    const p = data.actors[0].center;
    const clip = { x: Math.max(0, Math.floor(p.x - 48)), y: Math.max(0, Math.floor(p.y - 48)), width: 96, height: 96 };
    const crop = await page.screenshot({ path: `${prefix}-crop.png`, clip });
    // Supplemental nearest-neighbour magnification, never a replacement for
    // the unchanged viewport/document screenshots above.
    const detail = await page.context().newPage();
    await detail.setViewportSize({ width: 384, height: 384 });
    await detail.setContent(`<style>body{margin:0}img{width:384px;height:384px;image-rendering:pixelated}</style><img src="data:image/png;base64,${crop.toString('base64')}">`);
    await detail.locator('img').evaluate((img: HTMLImageElement) => img.decode());
    await detail.screenshot({ path: `${prefix}-crop-4x.png` });
    await detail.close();
    writeFileSync(`${prefix}.json`, JSON.stringify({ ...data, clip, magnification: 4 }, null, 2) + '\n');
    console.log(`Identidad ${phase} muestra ${sample}:`, JSON.stringify({ viewport: data.viewport, tick: data.state.tick, status: data.state.status, actors: data.actors, tweens: data.tweens }));
  }
}
