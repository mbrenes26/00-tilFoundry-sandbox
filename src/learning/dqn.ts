import type { Action, GameState } from '../game/contracts';
import { nextRandom, normalizeSeed } from '../game/random';
import { applySGD, batchGradient, cloneNetwork, createNetwork, forward, type Network, type Parameters } from './network';
import { actionCandidates, greedyAction } from './policy';
import { ReplayBuffer, type Transition } from './replay';

export const DQN_CONFIG = Object.freeze({ gamma: .99, replayCapacity: 10000, batchSize: 32,
  warmup: 1000, updateEvery: 4, targetEvery: 1000, learningRate: .001, maxGradientNorm: 10 });
export function epsilonAt(steps: number): number {
  if (!Number.isSafeInteger(steps) || steps < 0) throw new Error('Contador de pasos inválido.');
  return steps >= 100000 ? .1 : 1 - .9 * steps / 100000;
}
/** Entrenamiento solamente: PRNG explícito, nunca Math.random; greedy usa el mismo desempate que PolicyV1.
 * Una tirada decide explorar, y solo explorando una segunda selecciona acción uniforme legal. */
export function selectTrainingAction(n: Parameters, observation: ArrayLike<number>, legal: readonly Action[], epsilon: number,
  rngState: number): { action: Action; rngState: number } {
  if (!Number.isFinite(epsilon) || epsilon < 0 || epsilon > 1) throw new Error('Epsilon inválido.');
  const decision = nextRandom(rngState);
  if (decision.value < epsilon) {
    const random = nextRandom(decision.state), candidates = actionCandidates(legal);
    return { action: candidates[Math.floor(random.value * candidates.length)], rngState: random.state };
  }
  return { action: greedyAction(forward(n, observation), legal), rngState: decision.state };
}
/** Recompensa por una transición real del motor. Muerte no implica terminal si quedan vidas. */
export function reward(before: GameState, after: GameState): number {
  return (after.points - before.points) / 100 - .01 - 5 * (before.lives - after.lives) +
    (before.status !== 'won' && after.status === 'won' ? 10 : 0);
}
export function bellmanTarget(target: Parameters, transition: Transition): number {
  if (transition.terminal) return transition.reward;
  const values = forward(target, transition.nextObservation);
  return transition.reward + DQN_CONFIG.gamma * values[greedyAction(values, transition.nextLegalActions)];
}
export interface UpdateResult { loss: number; norm: number; scale: number; updates: number; batchSize: number; targetSynced: boolean }
/** Núcleo numérico CPU, sin reloj/E/S/Phaser. Contadores/PRNG/redes/replay explícitos para futuro checkpoint.
 * record añade una transición por paso. Lotes son temporales y no se conservan. */
export class DQN {
  online: Network;
  target: Network;
  readonly replay = new ReplayBuffer(DQN_CONFIG.replayCapacity);
  steps = 0;
  updates = 0;
  rngState: number;
  constructor(seed: number) {
    this.rngState = normalizeSeed(seed); this.online = createNetwork(seed); this.target = cloneNetwork(this.online);
  }
  record(transition: Transition): UpdateResult | null {
    this.replay.push(transition); this.steps++;
    if (this.replay.size < DQN_CONFIG.warmup || this.steps % DQN_CONFIG.updateEvery !== 0) return null;
    const sampled = this.replay.sample(DQN_CONFIG.batchSize, this.rngState); this.rngState = sampled.rngState;
    const examples = sampled.transitions.map(t => ({ observation: t.observation, action: t.action, target: bellmanTarget(this.target, t) }));
    const { loss, gradient } = batchGradient(this.online, examples);
    const clipping = applySGD(this.online, gradient, DQN_CONFIG.learningRate, DQN_CONFIG.maxGradientNorm);
    this.updates++;
    const targetSynced = this.updates % DQN_CONFIG.targetEvery === 0;
    if (targetSynced) this.target = cloneNetwork(this.online);
    return { loss, ...clipping, updates: this.updates, batchSize: sampled.transitions.length, targetSynced };
  }
}
