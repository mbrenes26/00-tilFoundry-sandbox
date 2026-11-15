import { describe, expect, it } from 'vitest';
import { containsPoint, randomStarPosition } from '../../src/game/geometry';

const area = { x: 120, y: 240, width: 1360, height: 540 };
const size = 200;

describe('juego-2: zona visible y azar inyectado', () => {
  it.each([0, 0.5, 1 - Number.EPSILON, 1])('mantiene la estrella completa dentro del área con azar %s', (value) => {
    const position = randomStarPosition(area, size, () => value);
    expect(position.x - size / 2).toBeGreaterThanOrEqual(area.x);
    expect(position.y - size / 2).toBeGreaterThanOrEqual(area.y);
    expect(position.x + size / 2).toBeLessThanOrEqual(area.x + area.width);
    expect(position.y + size / 2).toBeLessThanOrEqual(area.y + area.height);
  });

  it('usa dos muestras independientes y respeta los extremos exactos', () => {
    const values = [0, 1];
    expect(randomStarPosition(area, size, () => values.shift()!)).toEqual({ x: 220, y: 680 });
  });

  it('admite una zona del mismo tamaño que la estrella', () => {
    expect(randomStarPosition({ x: 10, y: 20, width: size, height: size }, size, () => 0.8))
      .toEqual({ x: 110, y: 120 });
  });

  it('rechaza áreas insuficientes y dimensiones inválidas', () => {
    for (const invalidSize of [0, -1, NaN, Infinity, 600]) {
      expect(() => randomStarPosition(area, invalidSize, () => 0)).toThrow(RangeError);
    }
    expect(() => randomStarPosition({ ...area, width: NaN }, size, () => 0)).toThrow(RangeError);
  });

  it('rechaza fuentes de azar fuera de [0, 1]', () => {
    for (const value of [-0.1, 1.1, NaN, Infinity]) {
      expect(() => randomStarPosition(area, size, () => value)).toThrow(RangeError);
    }
  });

  // Coordenadas del contorno opaco de star.svg (32×32 por fotograma).
  it.each([100, 224, 44 / (360 / 1600)])('acepta centro, brazos y bordes visibles a tamaño %s', (size) => {
    const zone = { x: 200, y: 300, size };
    const visible = [[16,16], [16,0], [16,32], [0,16], [32,16],
      [12,4], [20,4], [8,8], [24,8], [8,24], [24,24], [12,28], [20,28]];
    for (const [x,y] of visible) {
      expect(containsPoint(zone, { x: zone.x + (x / 32 - 0.5) * size,
        y: zone.y + (y / 32 - 0.5) * size }), `${x},${y}`).toBe(true);
    }
  });

  it.each([100, 224, 44 / (360 / 1600)])('rechaza esquinas y escalones transparentes a tamaño %s', (size) => {
    const zone = { x: 200, y: 300, size };
    const transparent = [[0,0], [32,32], [4,4], [28,28], [11,4], [21,4],
      [7,10], [25,10], [7,22], [25,22], [11,28], [21,28], [-1,16], [16,33]];
    for (const [x,y] of transparent) {
      expect(containsPoint(zone, { x: zone.x + (x / 32 - 0.5) * size,
        y: zone.y + (y / 32 - 0.5) * size }), `${x},${y}`).toBe(false);
    }
    expect(containsPoint(zone, { x: NaN, y: zone.y })).toBe(false);
  });
});
