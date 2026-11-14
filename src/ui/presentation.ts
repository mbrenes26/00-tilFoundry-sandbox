import type { GameState } from '../game/contracts';
export const textStyle = { fontFamily: 'monospace', fontSize: '24px', color: '#dce8ee', lineSpacing: 14 };
export function indicators(state: GameState): string {
  return `Puntos: ${state.points}\nVidas: ${state.lives}\nFase: ${state.phase === 'scatter' ? 'Dispersión' : 'Persecución'}\nPoder: ${state.powerRemaining} pasos\nPasos: ${state.tick}`;
}
