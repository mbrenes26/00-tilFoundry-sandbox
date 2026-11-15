import { describe, expect, it } from 'vitest';
import { playLayout } from '../../src/ui/layout';
import { randomStarPosition } from '../../src/game/geometry';

describe('juego-2/5: geometría FIT y espacio reservado a la interfaz', () => {
  it.each([1, 0.8, 390 / 1600, 360 / 1600, 0.18])('garantiza zona táctil de 44px a escala %s', scale => {
    const { area, starSize } = playLayout(scale);
    expect(starSize * scale).toBeGreaterThanOrEqual(44);
    expect(area.x).toBeGreaterThanOrEqual(112);
    expect(area.y).toBeGreaterThanOrEqual(200);
    expect(area.x + area.width).toBeLessThanOrEqual(1488);
    expect(area.y + area.height).toBeLessThanOrEqual(680);
    for (const random of [0, 0.5, 1]) {
      const star = randomStarPosition(area, starSize, () => random);
      expect(star.x - starSize / 2).toBeGreaterThanOrEqual(area.x);
      expect(star.x + starSize / 2).toBeLessThanOrEqual(area.x + area.width);
      expect(star.y - starSize / 2).toBeGreaterThanOrEqual(area.y);
      expect(star.y + starSize / 2).toBeLessThanOrEqual(area.y + area.height);
    }
  });
  it.each([0, -1, NaN, Infinity, 0.01])('rechaza escalas inválidas o sin espacio: %s', scale => {
    expect(() => playLayout(scale)).toThrow(RangeError);
  });
});
