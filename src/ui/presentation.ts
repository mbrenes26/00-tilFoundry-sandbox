import type { GameState } from '../game/contracts';

/** Presentation consumes the shared state. It never chooses an action or advances rules. */
export const STATE_PRESENTED = 'state-presented';
export interface ResultData { state: GameState }
export function element(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Falta el contenedor de interfaz: ${id}`);
  return found;
}
export const statusTitles = {
  running: 'Partida en curso', won: 'Laberinto iluminado',
  lost: 'Sin vidas restantes', timeout: 'Límite de pasos alcanzado',
} as const;
