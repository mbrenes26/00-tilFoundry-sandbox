import { MAP_VERSION, RULES_VERSION, type Action, type GameState, type GuardianId, type Position, type StepResult } from './contracts';
import { GUARDIAN_STARTS, HEIGHT, PLAYER_START, POWER_STARTS, WIDTH, isWalkable } from './map';
import { nextRandom, normalizeSeed } from './random';
import { CHASE_STEPS, POWER_STEPS, SCATTER_STEPS, chooseGuardianAction, destination, guardianActions, guardianTarget } from './guardians';

const samePosition = (a: Readonly<Position>, b: Readonly<Position>) => a.x === b.x && a.y === b.y;

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
    phase: 'scatter', phaseRemaining: SCATTER_STEPS, powerRemaining: 0, captureChain: 0,
    status: 'running',
  };
}

/** Acciones legales del jugador, ordenadas por id, sin envolvimiento. */
export function legalActions(state: GameState): Action[] {
  return ([0, 1, 2, 3] as Action[]).filter(a => isWalkable(destination(state.player.position, a)));
}

/** Motor puro: jugador, poder, guardianes, [colisiones/final pendientes M-3], temporizadores. */
export function step(state: GameState, action: Action): StepResult {
  const next = structuredClone(state);
  const events: StepResult['events'] = [];
  const target = destination(state.player.position, action);
  if (isWalkable(target)) {
    next.player.position = target;
    next.player.direction = action;
    events.push({ type: 'move', actor: 'player', from: { ...state.player.position }, to: { ...target } });
  }
  const powerIndex = next.powers.findIndex(p => samePosition(p, next.player.position));
  if (powerIndex >= 0) {
    const [position] = next.powers.splice(powerIndex, 1);
    next.powerRemaining = POWER_STEPS;
    next.captureChain = 0;
    // La aplicación de puntos, píldoras y capturas corresponde a M-3.
    events.push({ type: 'power', position: { ...position }, points: 50 });
  }

  // La duración completa solo existe al iniciar o inmediatamente tras cambiar de fase.
  // El cambio al final del paso habilita (no fuerza) inversión en el siguiente.
  const allowReverse = state.tick > 0 && state.phaseRemaining ===
    (state.phase === 'scatter' ? SCATTER_STEPS : CHASE_STEPS);
  // Todos los objetivos usan la misma instantánea; el id 3 no ve al id 1 ya movido.
  const targets = next.guardians.map(g => guardianTarget(next, g));
  for (let i = 0; i < next.guardians.length; i++) {
    const guardian = next.guardians[i];
    if (!guardian.active) {
      if (guardian.respawnRemaining === 1) {
        guardian.active = true;
        guardian.respawnRemaining = 0;
        guardian.position = { ...GUARDIAN_STARTS[guardian.id - 1] };
        guardian.direction = 0;
        events.push({ type: 'respawn', guardianId: guardian.id });
      }
      continue; // Reaparece sin movimiento ni colisión este paso.
    }
    let direction: Action;
    if (next.powerRemaining > 0) {
      const candidates = guardianActions(guardian, allowReverse);
      const random = nextRandom(next.rngState);
      next.rngState = random.state;
      direction = candidates[Math.floor(random.value * candidates.length)];
    } else direction = chooseGuardianAction(guardian, targets[i], allowReverse);
    const from = { ...guardian.position };
    guardian.position = destination(guardian.position, direction);
    guardian.direction = direction;
    events.push({ type: 'move', actor: guardian.id, from, to: { ...guardian.position } });
  }

  // M-3 insertará colisiones/final aquí. No decrementar guardianes recién capturados.
  for (const guardian of next.guardians) {
    if (!guardian.active && guardian.respawnRemaining > 0) guardian.respawnRemaining--;
  }
  if (next.powerRemaining > 0) {
    next.powerRemaining--;
    if (next.powerRemaining === 0) next.captureChain = 0;
  }
  next.phaseRemaining--;
  if (next.phaseRemaining === 0) {
    next.phase = next.phase === 'scatter' ? 'chase' : 'scatter';
    next.phaseRemaining = next.phase === 'scatter' ? SCATTER_STEPS : CHASE_STEPS;
    events.push({ type: 'phase', phase: next.phase });
  }
  next.tick++;
  return { state: next, events };
}
