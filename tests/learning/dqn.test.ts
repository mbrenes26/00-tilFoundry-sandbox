import { describe, expect, it } from 'vitest';
import { createGame, legalActions, observe, step } from '../../src/game/engine';
import { nextRandom } from '../../src/game/random';
import { cloneNetwork, createNetwork } from '../../src/learning/network';
import { ReplayBuffer, type Transition } from '../../src/learning/replay';
import { DQN, DQN_CONFIG, epsilonAt, selectTrainingAction, reward, bellmanTarget } from '../../src/learning/dqn';

function transition(index = 0): Transition {
  return { observation: Array(36).fill(index / 10000), action: (index % 4) as 0 | 1 | 2 | 3,
    reward: index, nextObservation: Array(36).fill((index + 1) / 10000), terminal: false, nextLegalActions: [1, 3] };
}
describe('selección y recompensa compartidas', () => {
  it('epsilon lineal 1→0,1, saturado a partir de 100000', () => {
    expect(epsilonAt(0)).toBe(1); expect(epsilonAt(50000)).toBeCloseTo(.55, 14);
    expect(epsilonAt(100000)).toBe(.1); expect(epsilonAt(200000)).toBe(.1);
    expect(() => epsilonAt(-1)).toThrow();
  });
  it('exploración uniforme legal reproducible; greedy desempata sin consumir RNG extra', () => {
    const n = createNetwork(1); n.w2.fill(0); n.b2.set([100, 5, 5, 0]); const x = Array(36).fill(0);
    const counts = [0, 0, 0, 0]; let rng = 42;
    for (let i = 0; i < 10000; i++) {
      const selection = selectTrainingAction(n, x, [3, 1], 1, rng);
      expect(selection).toEqual(selectTrainingAction(n, x, [3, 1], 1, rng));
      counts[selection.action]++; rng = selection.rngState;
    }
    expect(counts[0] + counts[2]).toBe(0); expect(counts[1]).toBeGreaterThan(4700); expect(counts[1]).toBeLessThan(5300);
    const greedy = selectTrainingAction(n, x, [2, 1], 0, 42);
    expect(greedy).toEqual({ action: 1, rngState: nextRandom(42).state });
    expect(selectTrainingAction(n, x, [], 0, 42).action).toBe(0);
    expect([0, 1, 2, 3]).toContain(selectTrainingAction(n, x, [], 1, 42).action);
  });
  it('incremento puntos/100 -0,01 -5 por vida +10 solo al ganar', () => {
    const before = createGame(1);
    expect(reward(before, { ...before, tick: 1, points: 50 })).toBeCloseTo(.49);
    expect(reward(before, { ...before, tick: 1, points: 200, lives: 2 })).toBeCloseTo(-3.01);
    expect(reward(before, { ...before, tick: 1, status: 'won' })).toBeCloseTo(9.99);
    expect(reward(before, { ...before, tick: 1, status: 'timeout' })).toBe(-.01);
    expect(reward(before, { ...before, tick: 1, lives: 0, status: 'lost' })).toBeCloseTo(-15.01);
  });
});
describe('replay circular tipado y objetivos', () => {
  it('descarta más antiguo al superar 10000, copia entradas y no acumula episodios', () => {
    const r = new ReplayBuffer(); const t = transition(0); r.push(t); t.observation[0] = 999;
    expect(r.get(0).observation[0]).toBe(0);
    for (let i = 1; i <= 10005; i++) r.push(transition(i));
    expect(r.capacity).toBe(10000); expect(r.size).toBe(10000); expect(r.cursor).toBe(6);
    expect(r.get(0).reward).toBe(6); expect(r.get(9999).reward).toBe(10005);
    const last = r.get(9999); last.observation[0] = -1;
    expect(r.get(9999).observation[0]).toBe(10005 / 10000);
    expect(r.observations).toBeInstanceOf(Float64Array); expect(r.actions).toBeInstanceOf(Uint8Array);
    expect(r.terminals).toBeInstanceOf(Uint8Array); expect(r.nextLegalMasks).toBeInstanceOf(Uint8Array);
    expect(() => r.get(10000)).toThrow();
  });
  it('lotes uniformes con reemplazo de 32 y PRNG explícito, incluyendo datos posteriores al wrap', () => {
    const r = new ReplayBuffer(4); for (let i = 0; i < 7; i++) r.push(transition(i));
    const before = [r.size, r.cursor], sampled = r.sample(32, 42);
    expect(sampled).toEqual(r.sample(32, 42)); expect(sampled.transitions).toHaveLength(32);
    expect(sampled.transitions.every(t => t.reward >= 3 && t.reward <= 6)).toBe(true);
    expect(new Set(sampled.transitions.map(t => t.reward)).size).toBe(4);
    expect([r.size, r.cursor]).toEqual(before);
    let rng = 42; for (let i = 0; i < 32; i++) rng = nextRandom(rng).state;
    expect(sampled.rngState).toBe(rng); expect(() => new ReplayBuffer().sample(32, 1)).toThrow();
  });
  it('Bellman usa gamma0,99, objetivo y máscara legal; terminal nunca hace forward', () => {
    const n = createNetwork(1); n.w2.fill(0); n.b2.set([100, 5, 7, 2]);
    const t = transition(); t.reward = 2;
    expect(bellmanTarget(n, t)).toBeCloseTo(2 + .99 * 5);
    t.nextLegalActions = []; expect(bellmanTarget(n, t)).toBeCloseTo(101);
    t.terminal = true; t.nextObservation = [NaN]; expect(bellmanTarget(n, t)).toBe(2);
  });
});
describe('actualización DQN real', () => {
  it('configuración fija y fronteras: 1000 transiciones, cada4 pasos, objetivo cada1000 actualizaciones', () => {
    expect(DQN_CONFIG).toEqual({ gamma: .99, replayCapacity: 10000, batchSize: 32, warmup: 1000, updateEvery: 4, targetEvery: 1000, learningRate: .001, maxGradientNorm: 10 });
    const d = new DQN(42), initial = cloneNetwork(d.online), target = cloneNetwork(d.target);
    for (let i = 0; i < 999; i++) expect(d.record(transition(1))).toBeNull();
    expect(d.online).toEqual(initial); expect(d.steps).toBe(999);
    const first = d.record(transition(1)); expect(first?.updates).toBe(1); expect(first?.batchSize).toBe(32);
    expect(d.online).not.toEqual(initial); expect(d.target).toEqual(target);
    for (let i = 0; i < 3; i++) expect(d.record(transition(1))).toBeNull();
    expect(d.record(transition(1))?.updates).toBe(2);
    // Contador restaurable, frontera exacta de sincronización, sin 1000 lotes innecesarios.
    d.updates = 998;
    for (let i = 0; i < 4; i++) d.record(transition(1));
    expect(d.updates).toBe(999); expect(d.target).toEqual(target);
    for (let i = 0; i < 4; i++) d.record(transition(1));
    expect(d.updates).toBe(1000); expect(d.target).toEqual(d.online); expect(d.target.w1).not.toBe(d.online.w1);
    const again = new DQN(42); for (let i = 0; i < 1000; i++) again.record(transition(1));
    expect(again.online).not.toEqual(initial); expect(again.rngState).not.toBe(42);
  });
  it('fixture motor real: pesos cambian y misma semilla reproduce lotes/pesos, sin afirmar mejora', () => {
    function train() {
      const d = new DQN(17); const initial = cloneNetwork(d.online); let state = createGame(42), rng = 19;
      for (let i = 0; i < 1040; i++) {
        if (state.status !== 'running') state = createGame(i);
        const x = observe(state), a = selectTrainingAction(d.online, x, legalActions(state), epsilonAt(d.steps), rng);
        rng = a.rngState; const after = step(state, a.action).state;
        d.record({ observation: x, action: a.action, reward: reward(state, after), nextObservation: observe(after), nextLegalActions: legalActions(after), terminal: after.status !== 'running' });
        state = after;
      }
      expect(d.online).not.toEqual(initial); expect(d.updates).toBe(11);
      for (const values of Object.values(d.online)) expect(values.every(Number.isFinite)).toBe(true);
      return d;
    }
    const a = train(), b = train(); expect(a.online).toEqual(b.online); expect(a.rngState).toBe(b.rngState);
  });
});
