import type { Action, GameState, Guardian, Position } from './contracts';
import { HEIGHT, WIDTH, isWalkable } from './map';

export const SCATTER_STEPS = 70;
export const CHASE_STEPS = 200;
export const POWER_STEPS = 60;
export const RESPAWN_STEPS = 20;
const OFFSETS: readonly Readonly<Position>[] = [
  { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
];
const PRIORITY: readonly Action[] = [0, 3, 2, 1];
export const SCATTER_TARGETS: readonly Readonly<Position>[] = Object.freeze([
  Object.freeze({ x: WIDTH - 2, y: 1 }), Object.freeze({ x: 1, y: HEIGHT - 2 }),
  Object.freeze({ x: WIDTH - 2, y: HEIGHT - 2 }), Object.freeze({ x: 1, y: 1 }),
]);
export function destination(position: Readonly<Position>, action: Action): Position {
  const offset = OFFSETS[action];
  return { x: position.x + offset.x, y: position.y + offset.y };
}
const manhattan = (a: Readonly<Position>, b: Readonly<Position>) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/** Consume la instantánea después de mover al jugador, antes de mover guardianes. */
export function guardianTarget(state: GameState, guardian: Guardian): Position {
  const corner = SCATTER_TARGETS[guardian.id - 1];
  if (state.phase === 'scatter') return { ...corner };
  const player = state.player.position;
  const offset = OFFSETS[state.player.direction];
  const ahead = { x: player.x + 2 * offset.x, y: player.y + 2 * offset.y };
  switch (guardian.id) {
    case 1: return { ...player };
    case 2: return ahead;
    case 3: {
      const first = state.guardians.find(g => g.id === 1)!;
      return { x: 2 * ahead.x - first.position.x, y: 2 * ahead.y - first.position.y };
    }
    case 4: return manhattan(guardian.position, player) > 6 ? { ...player } : { ...corner };
  }
}

/** Orden estable también para el muestreo vulnerable; invertir solo si está permitido o no hay otra salida. */
export function guardianActions(guardian: Guardian, allowReverse: boolean): Action[] {
  const legal = PRIORITY.filter(a => isWalkable(destination(guardian.position, a)));
  const forward = legal.filter(a => a !== (guardian.direction + 2) % 4);
  return allowReverse || forward.length === 0 ? legal : forward;
}
export function chooseGuardianAction(guardian: Guardian, target: Position, allowReverse: boolean): Action {
  const candidates = guardianActions(guardian, allowReverse);
  let best = candidates[0];
  let bestDistance = Infinity;
  for (const action of candidates) {
    const distance = manhattan(destination(guardian.position, action), target);
    if (distance < bestDistance) { best = action; bestDistance = distance; }
  }
  return best;
}
