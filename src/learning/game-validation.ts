import type { GameState, Position } from '../game/contracts';
import { createGame } from '../game/engine';
import { CHASE_STEPS, POWER_STEPS, RESPAWN_STEPS, SCATTER_STEPS } from '../game/guardians';
import { GUARDIAN_STARTS, isWalkable } from '../game/map';
import { compatible, integer, object, requireValid } from './policy-format';

function position(value: unknown): asserts value is Position {
  const p = object(value, 'posición'); integer(p.x, 0, 18, 'x'); integer(p.y, 0, 14, 'y');
  requireValid(isWalkable({ x: p.x, y: p.y }), 'posición transitable');
}
function actor(value: unknown): Record<string, unknown> {
  const a = object(value, 'actor'); position(a.position); integer(a.direction, 0, 3, 'dirección'); return a;
}
/** Valida el contrato del motor, sin recrear movimientos, puntuación ni observación. */
export function validateGame(value: unknown): asserts value is GameState {
  const g = object(value, 'partida'); compatible(g);
  integer(g.seed, 0, 0xffffffff, 'semilla de partida'); integer(g.rngState, 0, 0xffffffff, 'PRNG motor');
  integer(g.tick, 0, 3000, 'tick'); integer(g.lives, 0, 3, 'vidas');
  integer(g.points, 0, Number.MAX_SAFE_INTEGER, 'puntos'); requireValid(g.points % 10 === 0, 'puntos'); actor(g.player);
  requireValid(g.phase === 'scatter' || g.phase === 'chase', 'fase');
  integer(g.phaseRemaining, 1, g.phase === 'scatter' ? SCATTER_STEPS : CHASE_STEPS, 'tiempo de fase');
  requireValid(typeof g.phaseChangePending === 'boolean', 'cambio pendiente');
  integer(g.powerRemaining, 0, POWER_STEPS - 1, 'tiempo de poder'); integer(g.captureChain, 0, POWER_STEPS * 4, 'cadena');
  requireValid(g.powerRemaining !== 0 || g.captureChain === 0, 'cadena sin poder');
  requireValid(Array.isArray(g.guardians) && g.guardians.length === 4, 'guardianes');
  g.guardians.forEach((value, index) => {
    const a = actor(value); requireValid(a.id === index + 1 && typeof a.active === 'boolean', 'id/actividad de guardián');
    integer(a.respawnRemaining, a.active ? 0 : 1, a.active ? 0 : RESPAWN_STEPS, 'reaparición');
    if (!a.active) {
      const p = a.position as Position, start = GUARDIAN_STARTS[index];
      requireValid(p.x === start.x && p.y === start.y && a.direction === 0, 'guardián inactivo');
    }
  });
  const initial = createGame(g.seed);
  for (const key of ['pills', 'powers'] as const) {
    const items = g[key]; requireValid(Array.isArray(items) && items.length <= initial[key].length, key);
    let previous = -1;
    for (const item of items) {
      position(item);
      const index = initial[key].findIndex(p => p.x === item.x && p.y === item.y);
      requireValid(index > previous, `${key}: objeto permitido, único y en orden`); previous = index;
    }
  }
  const count = (g.pills as Position[]).length + (g.powers as Position[]).length;
  const expected = g.lives === 0 ? 'lost' : count === 0 ? 'won' : g.tick === 3000 ? 'timeout' : 'running';
  requireValid(g.status === expected, 'prioridad de estado final');
}
