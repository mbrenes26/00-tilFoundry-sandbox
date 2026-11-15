import { describe, expect, it } from 'vitest';
import { createNetwork, forward, huber, batchGradient, applySGD, cloneNetwork } from '../../src/learning/network';
import { chooseAction, toPolicy } from '../../src/learning/policy';

const observation = () => Array.from({ length: 36 }, (_, i) => (i + 1) / 36);
describe('red 36/64 ReLU/4 e inferencia portátil', () => {
  it('inicializa de forma repetible, no nula y con arrays independientes', () => {
    const a = createNetwork(42), b = createNetwork(42), c = createNetwork(43);
    expect(a).toEqual(b); expect(a.w1).not.toEqual(c.w1);
    expect([a.w1.length, a.b1.length, a.w2.length, a.b2.length]).toEqual([2304, 64, 256, 4]);
    const clone = cloneNetwork(a); clone.w1[0]++;
    expect(clone.w1[0]).not.toBe(a.w1[0]);
  });
  it('calcula forward en orden salida×entrada, ReLU y salidas lineales sin mutación', () => {
    const n = createNetwork(1); n.w1.fill(0); n.b1.fill(0); n.w2.fill(0); n.b2.fill(0);
    n.w1[0] = 2; n.b1[0] = 1; n.w1[36 + 1] = -1;
    n.w2[0] = 3; n.w2[64] = -2; n.b2[2] = -7;
    const x = Array(36).fill(0); x[0] = 2; x[1] = 4;
    const before = cloneNetwork(n);
    expect(Array.from(forward(n, x))).toEqual([15, -10, -7, 0]); expect(n).toEqual(before);
  });
  it('Huber delta=1 y derivada en sus fronteras', () => {
    for (const [e, loss, derivative] of [[0, 0, 0], [.5, .125, .5], [-.5, .125, -.5], [1, .5, 1], [-1, .5, -1], [2, 1.5, 1], [-2, 1.5, -1]]) {
      expect(huber(e)).toEqual({ loss, derivative });
    }
  });
  it('contrasta TODOS los gradientes con diferencias finitas y promedio del lote', () => {
    const n = createNetwork(17); n.b1.fill(2); // Lejos del punto no derivable de ReLU.
    const examples = [{ observation: observation(), action: 1 as const, target: .2 }, { observation: observation().map(x => -x / 2), action: 3 as const, target: -.1 }];
    const before = cloneNetwork(n), result = batchGradient(n, examples), delta = 1e-5;
    for (const key of ['w1', 'b1', 'w2', 'b2'] as const) {
      for (let i = 0; i < n[key].length; i++) {
        const original = n[key][i]; n[key][i] = original + delta;
        const plus = batchGradient(n, examples).loss; n[key][i] = original - delta;
        const minus = batchGradient(n, examples).loss; n[key][i] = original;
        expect(result.gradient[key][i]).toBeCloseTo((plus - minus) / (2 * delta), 7);
      }
    }
    expect(n).toEqual(before);
    const one = batchGradient(n, [examples[0]]), two = batchGradient(n, [examples[1]]);
    expect(result.loss).toBeCloseTo((one.loss + two.loss) / 2, 12);
    expect(result.gradient.w1[0]).toBeCloseTo((one.gradient.w1[0] + two.gradient.w1[0]) / 2, 12);
  });
  it('ReLU negativa tiene gradiente cero; SGD recorta la norma global a 10', () => {
    const n = createNetwork(2); n.w1.fill(0); n.b1.fill(-1); n.w2.fill(1); n.b2.fill(0);
    const g = batchGradient(n, [{ observation: observation(), action: 0, target: 2 }]);
    expect(g.gradient.w1.every(x => x === 0)).toBe(true); expect(g.gradient.w2.every(x => x === 0)).toBe(true);
    expect(g.gradient.b2[0]).toBe(-1);
    applySGD(n, g.gradient); expect(n.b2[0]).toBe(.001);
    const gradient = cloneNetwork(n); for (const key of ['w1', 'b1', 'w2', 'b2'] as const) gradient[key].fill(0);
    gradient.w1[0] = 30; gradient.b2[0] = 40;
    const before = cloneNetwork(n), update = applySGD(n, gradient);
    expect(update.norm).toBe(50); expect(update.scale).toBe(.2);
    expect(n.w1[0]).toBeCloseTo(before.w1[0] - .006, 12);
    expect(n.b2[0]).toBeCloseTo(before.b2[0] - .008, 12);
    expect(gradient.w1[0]).toBe(30);
  });
  it('PolicyV1 documenta pesos/arquitectura y chooseAction respeta legales/empates sin explorar', () => {
    const n = createNetwork(3); n.w2.fill(0); n.b2.set([100, 5, 5, -2]);
    const p = toPolicy(n, { seed: 3, trainingSteps: 0, updates: 0 });
    expect(p.schemaVersion).toBe(1); expect(p.rulesVersion).toBe('lumina-rules-1'); expect(p.mapVersion).toBe('lumina-map-1');
    expect(p.architecture).toEqual({ input: 36, hidden: 64, output: 4, activation: 'relu', outputActivation: 'linear', weightOrder: 'output-major' });
    expect(p.metadata.trainingSteps).toBe(0);
    const before = JSON.stringify(p), x = observation();
    expect(chooseAction(p, x, [3, 2, 1])).toBe(1); expect(chooseAction(p, x, [])).toBe(0);
    expect(chooseAction(p, x, [3])).toBe(3); expect(JSON.stringify(p)).toBe(before);
    n.b2[0] = -100; expect(p.parameters.b2[0]).toBe(100);
    expect(Array.from(forward(p.parameters, x))).toEqual([100, 5, 5, -2]);
    expect(() => forward(n, [1])).toThrow();
  });
});
