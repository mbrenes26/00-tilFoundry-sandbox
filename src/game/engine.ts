import { MAP_VERSION, RULES_VERSION, type Action, type GameState, type GuardianId, type Position, type StepResult } from './contracts';
import { GUARDIAN_STARTS, HEIGHT, PLAYER_START, POWER_STARTS, WIDTH, isWalkable } from './map';
import { nextRandom, normalizeSeed } from './random';
import { CHASE_STEPS, POWER_STEPS, RESPAWN_STEPS, SCATTER_STEPS, chooseGuardianAction, destination, guardianActions, guardianTarget } from './guardians';

const samePosition = (a: Readonly<Position>, b: Readonly<Position>) => a.x === b.x && a.y === b.y;
const CAPTURE_POINTS = [200, 400, 800, 1600] as const;
const MAX_STEPS = 3000;
const MAX_LIVES = 3;

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
    pills, powers: POWER_STARTS.map(p => ({ ...p })), points: 0, lives: MAX_LIVES,
    phase: 'scatter', phaseRemaining: SCATTER_STEPS, phaseChangePending: false,
    powerRemaining: 0, captureChain: 0, status: 'running',
  };
}

/** Acciones legales del jugador, ordenadas por id, sin envolvimiento. */
export function legalActions(state: GameState): Action[] {
  return ([0, 1, 2, 3] as Action[]).filter(a => isWalkable(destination(state.player.position, a)));
}

/** Reinicia solo el estado de la vida; conserva objetos, puntaje, reloj y PRNG. */
function resetLife(state: GameState): void {
  state.player = { position: { ...PLAYER_START }, direction: 1 };
  for (const guardian of state.guardians) {
    guardian.position = { ...GUARDIAN_STARTS[guardian.id - 1] };
    guardian.direction = 0;
    guardian.active = true;
    guardian.respawnRemaining = 0;
  }
  state.powerRemaining = 0;
  state.captureChain = 0;
  state.phase = 'scatter';
  state.phaseRemaining = SCATTER_STEPS;
  state.phaseChangePending = false;
}

/** Motor puro: jugador, objetos/poder, guardianes, colisiones, final, temporizadores. */
export function step(state: GameState, action: Action): StepResult {
  const next = structuredClone(state);
  const events: StepResult['events'] = [];
  if (state.status !== 'running') return { state: next, events };
  const target = destination(state.player.position, action);
  if (isWalkable(target)) {
    next.player.position = target;
    next.player.direction = action;
    events.push({ type: 'move', actor: 'player', from: { ...state.player.position }, to: { ...target } });
  }
  const pillIndex = next.pills.findIndex(p => samePosition(p, next.player.position));
  if (pillIndex >= 0) {
    const [position] = next.pills.splice(pillIndex, 1);
    next.points += 10;
    events.push({ type: 'pill', position: { ...position }, points: 10 });
  }
  const powerIndex = next.powers.findIndex(p => samePosition(p, next.player.position));
  if (powerIndex >= 0) {
    const [position] = next.powers.splice(powerIndex, 1);
    next.points += 50;
    next.powerRemaining = POWER_STEPS;
    next.captureChain = 0;
    events.push({ type: 'power', position: { ...position }, points: 50 });
  }

  // Solo una transición real habilita inversión; iniciar o reiniciar la vida no lo hace.
  const allowReverse = state.phaseChangePending;
  next.phaseChangePending = false;
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

  // Solo los guardianes activos al entrar pueden colisionar (excluye reapariciones).
  const collisions = next.guardians.filter(g => {
    const previous = state.guardians.find(before => before.id === g.id)!;
    return previous.active && g.active && (samePosition(g.position, next.player.position) ||
      (samePosition(previous.position, next.player.position) && samePosition(g.position, state.player.position)));
  });
  // Vulnerabilidad es global para todos los activos; resolver mortalidad antes de cualquier captura.
  const died = collisions.length > 0 && next.powerRemaining === 0;
  const captured = new Set<GuardianId>();
  if (died) {
    next.lives--;
    resetLife(next);
    events.push({ type: 'death', lives: next.lives });
  } else {
    for (const guardian of collisions.sort((a, b) => a.id - b.id)) {
      const points = CAPTURE_POINTS[Math.min(next.captureChain, CAPTURE_POINTS.length - 1)];
      next.points += points;
      next.captureChain++;
      guardian.position = { ...GUARDIAN_STARTS[guardian.id - 1] };
      guardian.direction = 0;
      guardian.active = false;
      guardian.respawnRemaining = RESPAWN_STEPS;
      captured.add(guardian.id);
      events.push({ type: 'capture', guardianId: guardian.id, points });
    }
  }

  next.tick++;
  if (next.lives === 0) next.status = 'lost';
  else if (next.pills.length === 0 && next.powers.length === 0) next.status = 'won';
  else if (next.tick >= MAX_STEPS) next.status = 'timeout';
  if (next.status !== 'running') events.push({ type: 'end', status: next.status });

  // Un reinicio deja la fase con sus 70 pasos completos. Capturas nuevas conservan los 20.
  if (!died) {
    for (const guardian of next.guardians) {
      if (!guardian.active && guardian.respawnRemaining > 0 && !captured.has(guardian.id)) guardian.respawnRemaining--;
    }
    if (next.powerRemaining > 0) {
      next.powerRemaining--;
      if (next.powerRemaining === 0) next.captureChain = 0;
    }
    next.phaseRemaining--;
    if (next.phaseRemaining === 0) {
      next.phase = next.phase === 'scatter' ? 'chase' : 'scatter';
      next.phaseRemaining = next.phase === 'scatter' ? SCATTER_STEPS : CHASE_STEPS;
      next.phaseChangePending = true;
      events.push({ type: 'phase', phase: next.phase });
    }
  }
  return { state: next, events };
}

// Derivado de la misma inicialización que usa step, no de objetos presentes en la partida.
const initialObjects = createGame(0);
const INITIAL_OBJECT_COUNT = initialObjects.pills.length + initialObjects.powers.length;

/** Distancias mínimas sobre caminos transitables (BFS), sin consumir PRNG. */
function pathDistances(origin: Readonly<Position>): Int16Array {
  const distances = new Int16Array(WIDTH * HEIGHT).fill(-1);
  const queue: Position[] = [{ ...origin }];
  distances[origin.y * WIDTH + origin.x] = 0;
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    for (const action of [0, 1, 2, 3] as const) {
      const next = destination(current, action);
      if (!isWalkable(next)) continue;
      const index = next.y * WIDTH + next.x;
      if (distances[index] !== -1) continue;
      distances[index] = distances[current.y * WIDTH + current.x] + 1;
      queue.push(next);
    }
  }
  return distances;
}

function nearestOffset(origin: Readonly<Position>, objects: readonly Position[], distances: Int16Array): number[] {
  let best: Position | undefined;
  let bestDistance = Infinity;
  for (const object of objects) {
    const distance = distances[object.y * WIDTH + object.x];
    if (distance < 0) continue;
    if (distance < bestDistance || (distance === bestDistance && best &&
        (object.y < best.y || (object.y === best.y && object.x < best.x)))) {
      best = object;
      bestDistance = distance;
    }
  }
  return best ? [(best.x - origin.x) / WIDTH, (best.y - origin.y) / HEIGHT] : [0, 0];
}

/**
 * Contrato de inferencia: array nuevo de 36 números, sin mutación ni aleatoriedad.
 * Índices: 0–1 jugador x/y; 2–17 guardianes por id (x/y/activo/vulnerable);
 * 18–21 dirección y 22–25 legalidad, ambas en orden de Action;
 * 26–27 desplazamiento a píldora y 28–29 a poder, por camino mínimo y empate fila/columna;
 * 30 vidas, 31 poder restante, 32 fase (scatter=0/chase=1), 33 tiempo de fase,
 * 34 fracción de objetos pendientes, 35 pasos restantes.
 * x/dx se dividen por WIDTH, y/dy por HEIGHT (no dimensión menos uno).
 * Tiempo de fase dividido por duración de la fase actual; los demás contadores por su máximo.
 * GameState válido es serializable directamente con JSON.stringify/JSON.parse;
 * conservar TODOS los campos, incluyendo rngState y phaseChangePending, no solo la observación.
 */
export function observe(state: GameState): number[] {
  const origin = state.player.position;
  const values = [origin.x / WIDTH, origin.y / HEIGHT];
  for (const guardian of state.guardians) {
    const position = guardian.active ? guardian.position : GUARDIAN_STARTS[guardian.id - 1];
    values.push(position.x / WIDTH, position.y / HEIGHT,
      Number(guardian.active), Number(guardian.active && state.powerRemaining > 0));
  }
  const legal = legalActions(state);
  for (const action of [0, 1, 2, 3] as const) values.push(Number(state.player.direction === action));
  for (const action of [0, 1, 2, 3] as const) values.push(Number(legal.includes(action)));
  const distances = pathDistances(origin);
  values.push(...nearestOffset(origin, state.pills, distances), ...nearestOffset(origin, state.powers, distances),
    state.lives / MAX_LIVES, state.powerRemaining / POWER_STEPS, Number(state.phase === 'chase'),
    state.phaseRemaining / (state.phase === 'scatter' ? SCATTER_STEPS : CHASE_STEPS),
    (state.pills.length + state.powers.length) / INITIAL_OBJECT_COUNT, (MAX_STEPS - state.tick) / MAX_STEPS);
  return values;
}
