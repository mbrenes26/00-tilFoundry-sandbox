import { advanceTraining, type TrainingState } from './checkpoint';

export const MAX_ACTIVE_SECONDS = 21600;
export type TrainArgs = { seed: number; budgetSeconds: number; output: string } | { resume: string };
export function parseTrainArgs(args: string[]): TrainArgs {
  const values = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    if (!['--seed', '--budget-seconds', '--output', '--resume'].includes(key) || values.has(key) || !value?.trim() || value.startsWith('--')) {
      throw new Error('Argumentos inválidos: usa --seed, --budget-seconds y --output, o solo --resume.');
    }
    values.set(key, value);
  }
  if (values.has('--resume')) {
    if (values.size !== 1) throw new Error('Reanudar conserva semilla, salida y presupuesto; usa solo --resume.');
    return { resume: values.get('--resume')! };
  }
  const seedText = values.get('--seed'), seed = Number(seedText);
  const budgetSeconds = Number(values.get('--budget-seconds') ?? MAX_ACTIVE_SECONDS);
  if (!seedText || !/^\d+$/.test(seedText) || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff || !values.has('--output')) {
    throw new Error('Indica --seed (entero uint32) y --output (carpeta).');
  }
  if (!Number.isFinite(budgetSeconds) || budgetSeconds <= 0 || budgetSeconds > MAX_ACTIVE_SECONDS) throw new Error('El presupuesto debe ser positivo y como máximo 21600 segundos activos.');
  return { seed, budgetSeconds, output: values.get('--output')! };
}
export type StopReason = 'budget' | 'SIGINT' | 'pause';
export interface TrainingHooks {
  /** Reloj monotónico en segundos; solo se mide dentro del lote síncrono. */
  now: () => number;
  save: () => Promise<void>;
  yield: () => Promise<void>;
  batch?: () => void;
  stop?: () => Exclude<StopReason, 'budget'> | undefined;
}
export interface TrainingReport {
  reason: StopReason; activeSeconds: number; sessionActiveSeconds: number;
  budgetSeconds: number; excessSeconds: number; steps: number; sessionSteps: number;
}
/** Controlador independiente de Node/renderizado. E/S, esperas, carga y evaluación no cuentan.
 * Un lote ya iniciado termina; nunca se inicia otro al alcanzar el presupuesto.
 * La pausa es una parada con guardado; reanudar vuelve a invocar con el estado restaurado. */
export async function runTraining(state: TrainingState, hooks: TrainingHooks): Promise<TrainingReport> {
  const budget = state.budgetSeconds ?? MAX_ACTIVE_SECONDS;
  if (!Number.isFinite(budget) || budget <= 0 || budget > MAX_ACTIVE_SECONDS || !Number.isFinite(state.activeSeconds) || state.activeSeconds < 0) throw new Error('Presupuesto o tiempo activo inválido.');
  state.budgetSeconds = budget;
  const initialActive = state.activeSeconds, initialSteps = state.dqn.steps;
  let lastSave = state.activeSeconds, reason: StopReason = 'budget';
  const batch = hooks.batch ?? (() => { for (let i = 0; i < 32; i++) advanceTraining(state); });
  try {
    while (true) {
      const stop = hooks.stop?.();
      if (stop) { reason = stop; break; }
      if (state.activeSeconds >= budget) break;
      const start = hooks.now();
      try { batch(); }
      finally {
        const elapsed = hooks.now() - start;
        if (!Number.isFinite(elapsed) || elapsed < 0) throw new Error('El reloj activo no es monotónico.');
        state.activeSeconds += elapsed;
      }
      if (state.activeSeconds - lastSave >= 300) { await hooks.save(); lastSave = state.activeSeconds; }
      // Permite entregar SIGINT entre lotes sin medir la espera del event loop.
      await hooks.yield();
    }
  } finally { await hooks.save(); }
  return { reason, activeSeconds: state.activeSeconds, sessionActiveSeconds: state.activeSeconds - initialActive,
    budgetSeconds: budget, excessSeconds: Math.max(0, state.activeSeconds - budget), steps: state.dqn.steps, sessionSteps: state.dqn.steps - initialSteps };
}
