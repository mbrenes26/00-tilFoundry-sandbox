import type { Action } from '../game/contracts';
import { nextRandom } from '../game/random';
import { INPUTS } from './network';
import { actionCandidates } from './policy';

export interface Transition {
  observation: number[];
  action: Action;
  reward: number;
  nextObservation: number[];
  terminal: boolean;
  nextLegalActions: Action[];
}
/** Almacenamiento acotado, nunca retiene GameState/episodios. Máscara bit a para acciones legales.
 * Vacía=0 representa fallback a las cuatro. cursor apunta al próximo slot físico a escribir.
 * get(i) usa índice lógico del más antiguo al más reciente. Float64 evita redondear el contrato. */
export class ReplayBuffer {
  readonly observations: Float64Array;
  readonly nextObservations: Float64Array;
  readonly actions: Uint8Array;
  readonly rewards: Float64Array;
  readonly terminals: Uint8Array;
  readonly nextLegalMasks: Uint8Array;
  size = 0;
  cursor = 0;
  constructor(readonly capacity = 10000) {
    if (!Number.isSafeInteger(capacity) || capacity <= 0 || capacity > 10000) throw new Error('Capacidad de replay inválida.');
    this.observations = new Float64Array(capacity * INPUTS);
    this.nextObservations = new Float64Array(capacity * INPUTS);
    this.actions = new Uint8Array(capacity); this.rewards = new Float64Array(capacity);
    this.terminals = new Uint8Array(capacity); this.nextLegalMasks = new Uint8Array(capacity);
  }
  push(t: Transition): void {
    if (t.observation.length !== INPUTS || t.nextObservation.length !== INPUTS ||
        !t.observation.every(Number.isFinite) || !t.nextObservation.every(Number.isFinite) || !Number.isFinite(t.reward) ||
        !Number.isInteger(t.action) || t.action < 0 || t.action > 3 ||
        t.nextLegalActions.some(a => !Number.isInteger(a) || a < 0 || a > 3)) throw new Error('Transición inválida.');
    const slot = this.cursor;
    this.observations.set(t.observation, slot * INPUTS); this.nextObservations.set(t.nextObservation, slot * INPUTS);
    this.actions[slot] = t.action; this.rewards[slot] = t.reward; this.terminals[slot] = Number(t.terminal);
    this.nextLegalMasks[slot] = t.nextLegalActions.reduce<number>((mask, a) => mask | (1 << a), 0);
    this.cursor = (slot + 1) % this.capacity; this.size = Math.min(this.size + 1, this.capacity);
  }
  get(index: number): Transition {
    if (!Number.isInteger(index) || index < 0 || index >= this.size) throw new Error('Índice de replay fuera de rango.');
    const slot = ((this.size === this.capacity ? this.cursor : 0) + index) % this.capacity;
    const start = slot * INPUTS, mask = this.nextLegalMasks[slot];
    return { observation: Array.from(this.observations.subarray(start, start + INPUTS)),
      nextObservation: Array.from(this.nextObservations.subarray(start, start + INPUTS)),
      action: this.actions[slot] as Action, reward: this.rewards[slot], terminal: this.terminals[slot] === 1,
      nextLegalActions: mask === 0 ? [] : actionCandidates([0, 1, 2, 3]).filter(a => (mask & (1 << a)) !== 0) };
  }
  /** Muestreo uniforme con reemplazo. Una llamada PRNG por transición; devuelve estado para continuidad. */
  sample(batchSize: number, rngState: number): { transitions: Transition[]; rngState: number } {
    if (this.size === 0 || !Number.isSafeInteger(batchSize) || batchSize <= 0) throw new Error('No se puede muestrear este lote.');
    const transitions: Transition[] = [];
    for (let i = 0; i < batchSize; i++) {
      const random = nextRandom(rngState); rngState = random.state;
      transitions.push(this.get(Math.floor(random.value * this.size)));
    }
    return { transitions, rngState };
  }
}
