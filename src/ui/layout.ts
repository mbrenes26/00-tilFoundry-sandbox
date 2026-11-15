import type { GameConfig } from '../game/types';

/** Coordenadas lógicas FIT. Las bandas superior e inferior quedan libres para UI y progreso. */
export function playLayout(scale: number): GameConfig {
  const starSize = Math.max(224, 44 / scale);
  if (!Number.isFinite(scale) || scale <= 0 || starSize > 480) {
    throw new RangeError('La escala no deja espacio para una estrella táctil.');
  }
  return { area: { x: 112, y: 200, width: 1376, height: 480 }, starSize };
}
