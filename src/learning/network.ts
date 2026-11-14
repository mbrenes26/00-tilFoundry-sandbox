import { nextRandom, normalizeSeed } from '../game/random';
import type { Action } from '../game/contracts';

export const INPUTS = 36;
export const HIDDEN = 64;
export const OUTPUTS = 4;
/** Matrices en orden salida-major: w1[h*36+i], w2[a*64+h]. Sesgos por salida.
 * Float64 mantiene precisión en SGD/gradientes y al restaurar números JSON. */
export interface Parameters {
  w1: ArrayLike<number>; b1: ArrayLike<number>; w2: ArrayLike<number>; b2: ArrayLike<number>;
}
export interface Network extends Parameters {
  w1: Float64Array; b1: Float64Array; w2: Float64Array; b2: Float64Array;
}
function zeros(): Network {
  return { w1: new Float64Array(HIDDEN * INPUTS), b1: new Float64Array(HIDDEN),
    w2: new Float64Array(OUTPUTS * HIDDEN), b2: new Float64Array(OUTPUTS) };
}
export function cloneNetwork(n: Parameters): Network {
  return { w1: Float64Array.from(n.w1), b1: Float64Array.from(n.b1), w2: Float64Array.from(n.w2), b2: Float64Array.from(n.b2) };
}
/** Inicialización uniforme con varianza He en ReLU y 1/fanIn en la salida. Sin Math.random. */
export function createNetwork(seed: number): Network {
  const n = zeros(); let rng = normalizeSeed(seed);
  for (const [weights, limit] of [[n.w1, Math.sqrt(6 / INPUTS)], [n.w2, Math.sqrt(3 / HIDDEN)]] as const) {
    for (let i = 0; i < weights.length; i++) {
      const random = nextRandom(rng); rng = random.state; weights[i] = (2 * random.value - 1) * limit;
    }
  }
  return n;
}
function activations(n: Parameters, x: ArrayLike<number>): { hidden: Float64Array; output: Float64Array } {
  if (x.length !== INPUTS) throw new Error('La observación debe contener 36 entradas.');
  if (n.w1.length !== INPUTS * HIDDEN || n.b1.length !== HIDDEN || n.w2.length !== HIDDEN * OUTPUTS || n.b2.length !== OUTPUTS)
    throw new Error('Dimensiones de red incompatibles.');
  for (let i = 0; i < INPUTS; i++) if (!Number.isFinite(x[i])) throw new Error('Observación no finita.');
  const hidden = new Float64Array(HIDDEN), output = new Float64Array(OUTPUTS);
  for (let h = 0; h < HIDDEN; h++) {
    let z = n.b1[h];
    for (let i = 0; i < INPUTS; i++) z += n.w1[h * INPUTS + i] * x[i];
    hidden[h] = Math.max(0, z);
  }
  for (let a = 0; a < OUTPUTS; a++) {
    let q = n.b2[a];
    for (let h = 0; h < HIDDEN; h++) q += n.w2[a * HIDDEN + h] * hidden[h];
    output[a] = q;
  }
  return { hidden, output };
}
/** Solo inferencia: no modifica parámetros/observación ni consume PRNG. Sin Node/Phaser. */
export function forward(n: Parameters, observation: ArrayLike<number>): Float64Array {
  return activations(n, observation).output;
}
export function huber(error: number): { loss: number; derivative: number } {
  const absolute = Math.abs(error);
  return { loss: absolute <= 1 ? error * error / 2 : absolute - .5,
    derivative: absolute <= 1 ? error : Math.sign(error) };
}
export interface TrainingExample { observation: ArrayLike<number>; action: Action; target: number }
/** Promedio de Huber sobre Q(s,a) seleccionado; el target Bellman se trata como constante. */
export function batchGradient(n: Parameters, examples: readonly TrainingExample[]): { loss: number; gradient: Network } {
  if (!examples.length) throw new Error('El lote no puede estar vacío.');
  const gradient = zeros(); let loss = 0;
  for (const example of examples) {
    const { observation: x, action, target } = example;
    if (!Number.isFinite(target) || !Number.isInteger(action) || action < 0 || action >= OUTPUTS) throw new Error('Ejemplo de entrenamiento inválido.');
    const { hidden, output } = activations(n, x);
    const result = huber(output[action] - target); loss += result.loss / examples.length;
    const dq = result.derivative / examples.length;
    gradient.b2[action] += dq;
    for (let h = 0; h < HIDDEN; h++) {
      gradient.w2[action * HIDDEN + h] += dq * hidden[h];
      // Derivada elegida en z=0: cero.
      const dz = hidden[h] > 0 ? dq * n.w2[action * HIDDEN + h] : 0;
      gradient.b1[h] += dz;
      for (let i = 0; i < INPUTS; i++) gradient.w1[h * INPUTS + i] += dz * x[i];
    }
  }
  return { loss, gradient };
}
/** SGD in-place, recorte global L2 después de promediar el lote; no modifica gradientes. */
export function applySGD(n: Network, gradient: Network, learningRate = .001, maxNorm = 10): { norm: number; scale: number } {
  const keys = ['w1', 'b1', 'w2', 'b2'] as const;
  let norm = 0;
  for (const key of keys) for (const value of gradient[key]) norm = Math.hypot(norm, value);
  if (!Number.isFinite(norm)) throw new Error('Gradiente no finito.');
  const scale = norm > maxNorm ? maxNorm / norm : 1;
  for (const key of keys) for (let i = 0; i < n[key].length; i++) n[key][i] -= learningRate * scale * gradient[key][i];
  return { norm, scale };
}
