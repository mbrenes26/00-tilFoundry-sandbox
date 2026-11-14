import { MAP_VERSION, RULES_VERSION, type GameState } from '../game/contracts';
import { createGame, legalActions, observe, step } from '../game/engine';
import { normalizeSeed } from '../game/random';
import { DQN, DQN_CONFIG, epsilonAt, reward, selectTrainingAction } from './dqn';
import { cloneNetwork } from './network';
import { toPolicy, type PolicyV1 } from './policy';
import { ARCHITECTURE, checkBytes, compatible, exactKeys, finite, integer, numericArray, object, parseLimited, requireValid, utf8Bytes, validateArchitecture, validateParameters } from './policy-format';
import { validateGame } from './game-validation';

export const CHECKPOINT_MAX_BYTES = 128 * 1024 * 1024;
const REPLAY_KEYS = ['observations', 'nextObservations', 'actions', 'rewards', 'terminals', 'nextLegalMasks'] as const;
interface ReplaySnapshot {
  capacity: number; size: number; cursor: number;
  observations: number[]; nextObservations: number[]; actions: number[]; rewards: number[]; terminals: number[]; nextLegalMasks: number[];
}
/** v1 usa índices físicos completos del replay (incluidos slots vacíos), no orden lógico.
 * Float64 -> números JSON sin redondeo. PRNG de acciones independiente del muestreo de lotes.
 * episodes = partidas completadas antes de la partida actual; game conserva incluso terminales.
 * Tiempo activo acumulado en segundos: el controlador del paso 7 es quien lo mide/actualiza.
 * config/epsilon son fijos en v1: cambios requieren nueva versión, nunca se ignoran al restaurar.
 * JSON y parseo requieren memoria adicional al límite de arrays/replay. */
export interface CheckpointV1 {
  schemaVersion: 1; mapVersion: string; rulesVersion: string;
  architecture: PolicyV1['architecture']; config: typeof DQN_CONFIG;
  exploration: { start: 1; end: 0.1; decaySteps: 100000 };
  online: PolicyV1['parameters']; target: PolicyV1['parameters']; replay: ReplaySnapshot;
  game: GameState; seed: number; actionRngState: number; rngState: number;
  steps: number; updates: number; episodes: number; activeSeconds: number; budgetSeconds?: number;
}
export interface TrainingState {
  dqn: DQN; game: GameState; seed: number; actionRngState: number; episodes: number; activeSeconds: number; budgetSeconds?: number;
}
export function createTrainingState(seed: number, gameSeed = seed): TrainingState {
  return { dqn: new DQN(seed), game: createGame(gameSeed), seed: normalizeSeed(seed), actionRngState: normalizeSeed(seed), episodes: 0, activeSeconds: 0 };
}
/** Un paso sin E/S/reloj. Reinicio de episodio conserva pesos/replay/PRNG y usa semilla sucesiva.
 * No guarda historial de episodios. Se puede guardar tras cualquier llamada, siempre entre lotes. */
export function advanceTraining(state: TrainingState) {
  if (state.game.status !== 'running') { state.episodes++; state.game = createGame((state.game.seed + 1) >>> 0); }
  const before = state.game;
  const selected = selectTrainingAction(state.dqn.online, observe(before), legalActions(before), epsilonAt(state.dqn.steps), state.actionRngState);
  state.actionRngState = selected.rngState;
  const result = step(before, selected.action); state.game = result.state;
  const update = state.dqn.record({ observation: observe(before), action: selected.action, reward: reward(before, result.state),
    nextObservation: observe(result.state), terminal: result.state.status !== 'running', nextLegalActions: legalActions(result.state) });
  return { action: selected.action, events: result.events, update };
}
export function toCheckpoint(state: TrainingState): CheckpointV1 {
  const d = state.dqn, r = d.replay;
  const replay: ReplaySnapshot = { capacity: r.capacity, size: r.size, cursor: r.cursor,
    observations: Array.from(r.observations), nextObservations: Array.from(r.nextObservations), actions: Array.from(r.actions),
    rewards: Array.from(r.rewards), terminals: Array.from(r.terminals), nextLegalMasks: Array.from(r.nextLegalMasks) };
  const c: CheckpointV1 = { schemaVersion: 1, mapVersion: MAP_VERSION, rulesVersion: RULES_VERSION,
    architecture: { ...ARCHITECTURE } as PolicyV1['architecture'], config: { ...DQN_CONFIG }, exploration: { start: 1, end: .1, decaySteps: 100000 },
    online: toPolicy(d.online, { seed: state.seed, trainingSteps: d.steps, updates: d.updates }).parameters,
    target: toPolicy(d.target, { seed: state.seed, trainingSteps: d.steps, updates: d.updates }).parameters,
    replay, game: structuredClone(state.game), seed: state.seed, actionRngState: state.actionRngState, rngState: d.rngState,
    steps: d.steps, updates: d.updates, episodes: state.episodes, activeSeconds: state.activeSeconds };
  if (state.budgetSeconds !== undefined) c.budgetSeconds = state.budgetSeconds;
  validateCheckpoint(c); return c;
}
export function validateCheckpoint(value: unknown): asserts value is CheckpointV1 {
  const c = object(value, 'checkpoint');
  exactKeys(c, ['schemaVersion', 'mapVersion', 'rulesVersion', 'architecture', 'config', 'exploration', 'online', 'target', 'replay', 'game', 'seed', 'actionRngState', 'rngState', 'steps', 'updates', 'episodes', 'activeSeconds', ...('budgetSeconds' in c ? ['budgetSeconds'] : [])], 'checkpoint'); compatible(c); validateArchitecture(c.architecture);
  if ('budgetSeconds' in c) { finite(c.budgetSeconds, 0, 21600, 'presupuesto activo'); requireValid((c.budgetSeconds as number) > 0, 'presupuesto positivo'); }
  validateParameters(c.online); validateParameters(c.target);
  const config = object(c.config, 'configuración DQN'); exactKeys(config, Object.keys(DQN_CONFIG), 'configuración');
  for (const [key, expected] of Object.entries(DQN_CONFIG)) requireValid(config[key] === expected, `configuración ${key}`);
  const exploration = object(c.exploration, 'exploración'); exactKeys(exploration, ['start', 'end', 'decaySteps'], 'exploración');
  requireValid(exploration.start === 1 && exploration.end === .1 && exploration.decaySteps === 100000, 'programa epsilon');
  for (const key of ['seed', 'actionRngState', 'rngState']) integer(c[key], 0, 0xffffffff, key);
  integer(c.steps, 0, Number.MAX_SAFE_INTEGER, 'pasos'); integer(c.updates, 0, c.steps, 'actualizaciones');
  const expectedUpdates = c.steps < DQN_CONFIG.warmup ? 0 : Math.floor(c.steps / DQN_CONFIG.updateEvery) - DQN_CONFIG.warmup / DQN_CONFIG.updateEvery + 1;
  requireValid(c.updates === expectedUpdates, 'actualizaciones/pasos');
  integer(c.episodes, 0, c.steps, 'episodios'); finite(c.activeSeconds, 0, Number.MAX_SAFE_INTEGER, 'tiempo activo');
  validateGame(c.game); requireValid(c.game.tick <= c.steps && c.episodes + c.game.tick <= c.steps, 'partida/pasos');
  const r = object(c.replay, 'replay'), capacity = DQN_CONFIG.replayCapacity;
  exactKeys(r, ['capacity', 'size', 'cursor', ...REPLAY_KEYS], 'replay');
  requireValid(r.capacity === capacity, 'capacidad replay');
  integer(r.size, 0, capacity, 'tamaño replay'); integer(r.cursor, 0, capacity - 1, 'cursor replay');
  requireValid(r.size === Math.min(c.steps, capacity) && r.cursor === c.steps % capacity, 'replay/pasos');
  for (const key of REPLAY_KEYS) {
    const observation = key === 'observations' || key === 'nextObservations';
    numericArray(r[key], capacity * (observation ? 36 : 1), observation ? -1 : key === 'rewards' ? -Number.MAX_VALUE : 0,
      observation ? 1 : key === 'actions' ? 3 : key === 'terminals' ? 1 : key === 'nextLegalMasks' ? 15 : Number.MAX_VALUE,
      key, key === 'actions' || key === 'terminals' || key === 'nextLegalMasks');
  }
  // Orden/rangos del contrato observe: solo desplazamientos 26..29 admiten negativos.
  // Actividad/vulnerabilidad/dirección/legalidad/fase son valores binarios.
  const binary = new Set([4, 5, 8, 9, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 32]);
  for (const key of ['observations', 'nextObservations'] as const) {
    const values = r[key] as number[];
    for (let slot = 0; slot < r.size; slot++) {
      for (let index = 0; index < 36; index++) {
        const n = values[slot * 36 + index];
        if (index < 26 || index > 29) requireValid(n >= 0, 'rango de observación');
        if (binary.has(index)) requireValid(n === 0 || n === 1, 'observación binaria');
      }
      const start = slot * 36;
      requireValid(values[start + 18] + values[start + 19] + values[start + 20] + values[start + 21] === 1, 'dirección one-hot');
      for (let id = 0; id < 4; id++) requireValid(values[start + 5 + id * 4] <= values[start + 4 + id * 4], 'vulnerabilidad/actividad');
    }
  }
  // legalActions/observe conservan la legalidad geométrica incluso en terminales.
  // Cero solo es coherente sin alternativas: ReplayBuffer lo interpreta como fallback.
  for (let slot = 0; slot < r.size; slot++) {
    const start = slot * 36;
    let currentMask = 0, nextMask = 0;
    for (let action = 0; action < 4; action++) {
      currentMask |= (r.observations as number[])[start + 22 + action] << action;
      nextMask |= (r.nextObservations as number[])[start + 22 + action] << action;
    }
    requireValid((r.nextLegalMasks as number[])[slot] === nextMask, 'máscara legal/observación siguiente');
    requireValid(currentMask === 0 || (currentMask & (1 << (r.actions as number[])[slot])) !== 0, 'acción/observación actual');
  }
  // Slots no usados deben ser cero; evita convertir basura finita en transiciones al reanudar.
  if (r.size < capacity) for (const key of REPLAY_KEYS) {
    const values = r[key] as number[], width = key === 'observations' || key === 'nextObservations' ? 36 : 1;
    for (let i = r.size * width; i < values.length; i++) requireValid(values[i] === 0, 'slot vacío del replay');
  }
}
export function restoreCheckpoint(checkpoint: CheckpointV1): TrainingState {
  validateCheckpoint(checkpoint);
  const state = createTrainingState(checkpoint.seed, checkpoint.game.seed), d = state.dqn;
  d.online = cloneNetwork(checkpoint.online); d.target = cloneNetwork(checkpoint.target);
  d.steps = checkpoint.steps; d.updates = checkpoint.updates; d.rngState = checkpoint.rngState;
  for (const key of REPLAY_KEYS) d.replay[key].set(checkpoint.replay[key]);
  d.replay.size = checkpoint.replay.size; d.replay.cursor = checkpoint.replay.cursor;
  state.game = structuredClone(checkpoint.game); state.actionRngState = checkpoint.actionRngState;
  state.episodes = checkpoint.episodes; state.activeSeconds = checkpoint.activeSeconds;
  if (checkpoint.budgetSeconds !== undefined) state.budgetSeconds = checkpoint.budgetSeconds;
  return state;
}
export function parseCheckpoint(text: string): CheckpointV1 {
  const c = parseLimited(text, CHECKPOINT_MAX_BYTES); validateCheckpoint(c); return c;
}
export function serializeCheckpoint(checkpoint: CheckpointV1): string {
  validateCheckpoint(checkpoint); const text = JSON.stringify(checkpoint); checkBytes(utf8Bytes(text), CHECKPOINT_MAX_BYTES); return text;
}
