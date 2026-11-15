// Measure opaque artwork, not only the transparent 16×16 sprite frame.
export async function boardGeometry(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const { game } = await import('/src/main.ts' as string);
    const base = game.scene.getScene('BaseScene');
    const canvas = game.canvas.getBoundingClientRect();
    const camera = base.cameras.main;
    const scale = canvas.width / 1600;
    const corner = base.cellCenter({ x: 0, y: 0 });
    const actors: { visible: boolean; width: number; height: number }[] = base.children.list.filter((o: any) => o.texture?.key === 'actors').map((sprite: any) => {
      const frame = sprite.frame;
      const scratch = document.createElement('canvas'); scratch.width = frame.cutWidth; scratch.height = frame.cutHeight;
      const ctx = scratch.getContext('2d')!;
      ctx.drawImage(frame.source.image, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, frame.cutWidth, frame.cutHeight);
      const pixels = ctx.getImageData(0, 0, scratch.width, scratch.height).data;
      const xs: number[] = []; const ys: number[] = [];
      for (let y = 0; y < scratch.height; y++) for (let x = 0; x < scratch.width; x++) {
        if (pixels[(y * scratch.width + x) * 4 + 3]) { xs.push(x); ys.push(y); }
      }
      return { visible: sprite.visible, width: (Math.max(...xs) - Math.min(...xs) + 1) * sprite.scaleX * scale,
        height: (Math.max(...ys) - Math.min(...ys) + 1) * sprite.scaleY * scale };
    });
    return { board: { x: canvas.x + (corner.x - 20 - camera.scrollX) * scale,
      y: canvas.y + (corner.y - 20 - camera.scrollY) * scale, width: 760 * scale, height: 600 * scale },
      cell: 40 * scale, actors, canvas: { x: canvas.x, y: canvas.y, width: canvas.width, height: canvas.height } };
  });
}

