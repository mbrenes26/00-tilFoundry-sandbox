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

/** Contorno opaco compartido por los dos fotogramas de public/assets/star.svg.
 * Unión de tres rectángulos centrados: 8×32, 16×16 y 32×8.
 * Conserva los extremos del tamaño táctil, sin aceptar las esquinas transparentes.
 */
export function starCaptureRects(zone: StarZone): readonly (PlayArea & { readonly right: number; readonly bottom: number })[] {
  return [[zone.size / 8, zone.size / 2], [zone.size / 4, zone.size / 4],
    [zone.size / 2, zone.size / 8]].map(([halfWidth, halfHeight]) => ({
    x: zone.x - halfWidth, y: zone.y - halfHeight,
    width: halfWidth * 2, height: halfHeight * 2,
    // Límites absolutos: conserva bordes inclusivos a escala FIT fraccionaria.
    right: zone.x + halfWidth, bottom: zone.y + halfHeight,
  }));
}

export function containsPoint(zone: StarZone, point: Point): boolean {
  return starCaptureRects(zone).some(rect =>
    point.x >= rect.x && point.x <= rect.right
    && point.y >= rect.y && point.y <= rect.bottom);
}
