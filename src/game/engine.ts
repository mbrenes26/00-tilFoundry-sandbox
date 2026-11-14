import { MAP_VERSION, RULES_VERSION, type Action, type GameState, type GuardianId, type Position, type StepResult } from './contracts';
import { GUARDIAN_STARTS, HEIGHT, PLAYER_START, POWER_STARTS, WIDTH, isWalkable } from './map';
import { normalizeSeed } from './random';

const OFFSETS: readonly Readonly<Position>[] = [
  { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
];
const samePosition = (a: Readonly<Position>, b: Readonly<Position>) => a.x === b.x && a.y === b.y;
function destination(position: Position, action: Action): Position {
  const offset = OFFSETS[action];
  return { x: position.x + offset.x, y: position.y + offset.y };
}

export function createGame(seed: number): GameState {
  const normalized = normalizeSeed(seed);
  const starts = [PLAYER_START, ...GUARDIAN_STARTS];
  const pills: Position[] = [];
  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
    const position = { x, y };
    if (isWalkable(position) && !starts.some(p => samePosition(p, position)) &&
        !POWER_STARTS.some(p => samePosition(p, position))) pills.push(position);
  }
  return {
    schemaVersion: 1, rulesVersion: RULES_VERSION, mapVersion: MAP_VERSION,
    seed: normalized, rngState: normalized, tick: 0,
    player: { position: { ...PLAYER_START }, direction: 1 },
    guardians: GUARDIAN_STARTS.map((position, i) => ({
      id: (i + 1) as GuardianId, position: { ...position }, direction: 0,
      active: true, respawnRemaining: 0,
    })),
    pills, powers: POWER_STARTS.map(p => ({ ...p })), points: 0, lives: 3,
    phase: 'scatter', phaseRemaining: 70, powerRemaining: 0, captureChain: 0,
    status: 'running',
  };
}

/** Acciones legales del jugador, ordenadas por id, sin envolvimiento. */
export function legalActions(state: GameState): Action[] {
  return ([0, 1, 2, 3] as Action[]).filter(a => isWalkable(destination(state.player.position, a)));
}

/** Paso 1: movimiento puro. Resolución de guardianes/objetos/finales pendiente de pasos 2–3. */
export function step(state: GameState, action: Action): StepResult {
  const next = structuredClone(state);
  const events: StepResult['events'] = [];
  const target = destination(state.player.position, action);
  if (isWalkable(target)) {
    next.player.position = target;
    next.player.direction = action;
    events.push({ type: 'move', actor: 'player', from: { ...state.player.position }, to: { ...target } });
  }
  next.tick++;
  return { state: next, events };
}
