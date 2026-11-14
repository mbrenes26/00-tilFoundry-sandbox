import { MAP_VERSION, RULES_VERSION, type Action } from '../game/contracts';
import { forward, type Parameters } from './network';

export interface PolicyMetadata {
  seed: number;
  /** Cero identifica una política inicial, no una red entrenada. Contadores, no calidad. */
  trainingSteps: number;
  updates: number;
}
/** Contrato JSON de inferencia compartido navegador/Node. No contiene replay, PRNG ni entrenador.
 * w1[h*36+i], w2[a*64+h]: salida-major; b1[h], b2[a]. Acciones del motor 0/1/2/3.
 * Arrays JSON normales; policy-format.ts valida arquitectura/versiones/dimensiones antes de importar. */
export interface PolicyV1 {
  schemaVersion: 1;
  rulesVersion: string;
  mapVersion: string;
  architecture: {
    input: 36; hidden: 64; output: 4; activation: 'relu'; outputActivation: 'linear'; weightOrder: 'output-major';
  };
  parameters: { w1: number[]; b1: number[]; w2: number[]; b2: number[] };
  metadata: PolicyMetadata;
}
export function toPolicy(n: Parameters, metadata: PolicyMetadata): PolicyV1 {
  return { schemaVersion: 1, rulesVersion: RULES_VERSION, mapVersion: MAP_VERSION,
    architecture: { input: 36, hidden: 64, output: 4, activation: 'relu', outputActivation: 'linear', weightOrder: 'output-major' },
    parameters: { w1: Array.from(n.w1), b1: Array.from(n.b1), w2: Array.from(n.w2), b2: Array.from(n.b2) },
    metadata: { ...metadata } };
}
/** Orden id menor; sin alternativas legales se consideran las cuatro (acción ilegal queda inmóvil). */
export function actionCandidates(legal: readonly Action[]): Action[] {
  return ([0, 1, 2, 3] as Action[]).filter(a => legal.length === 0 || legal.includes(a));
}
export function greedyAction(values: ArrayLike<number>, legal: readonly Action[]): Action {
  const candidates = actionCandidates(legal); let best = candidates[0];
  for (const action of candidates) if (values[action] > values[best]) best = action;
  return best;
}
export function chooseAction(policy: PolicyV1, observation: ArrayLike<number>, legal: readonly Action[]): Action {
  return greedyAction(forward(policy.parameters, observation), legal);
}
