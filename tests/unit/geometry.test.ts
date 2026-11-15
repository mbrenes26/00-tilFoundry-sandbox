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

  it('incluye los bordes de la zona visible, pero no su exterior', () => {
    const zone = { x: 200, y: 300, size: 100 };
    for (const point of [{ x: 150, y: 250 }, { x: 250, y: 350 }, { x: 200, y: 300 }]) {
      expect(containsPoint(zone, point)).toBe(true);
    }
    for (const point of [{ x: 149, y: 300 }, { x: 200, y: 351 }, { x: NaN, y: 300 }]) {
      expect(containsPoint(zone, point)).toBe(false);
    }
  });
});
