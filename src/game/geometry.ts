import type { PlayArea, Point, RandomSource, StarZone } from './types';

/** El área permitida excluye la interfaz; la estrella nunca la rebasa. */
export function randomStarPosition(area: PlayArea, size: number, random: RandomSource): Point {
  if (![area.x, area.y, area.width, area.height, size].every(Number.isFinite)
    || size <= 0 || area.width < size || area.height < size) {
    throw new RangeError('El área debe contener la estrella completa.');
  }
  const sample = () => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new RangeError('El azar debe estar entre 0 y 1.');
    }
    return value;
  };
  return {
    x: area.x + size / 2 + sample() * (area.width - size),
    y: area.y + size / 2 + sample() * (area.height - size),
  };
}

export function containsPoint(zone: StarZone, point: Point): boolean {
  return Math.abs(point.x - zone.x) <= zone.size / 2
    && Math.abs(point.y - zone.y) <= zone.size / 2;
}
