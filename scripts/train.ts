import { performance } from 'node:perf_hooks';
import { dirname, join, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { setImmediate as yieldImmediate } from 'node:timers/promises';
import { createTrainingState, toCheckpoint } from '../src/learning/checkpoint';
import { loadCheckpoint, saveCheckpoint, savePolicy } from '../src/learning/files';
import { toPolicy } from '../src/learning/policy';
import { parseTrainArgs, runTraining } from '../src/learning/training';

async function main(): Promise<void> {
  const args = parseTrainArgs(process.argv.slice(2));
  let interrupted = false;
  const onInterrupt = () => { interrupted = true; };
  process.on('SIGINT', onInterrupt);
  try {
    const resumed = 'resume' in args;
    const checkpointPath = resumed ? resolve(args.resume) : resolve(args.output, 'checkpoint.json');
    const output = dirname(checkpointPath);
    const state = resumed ? await loadCheckpoint(checkpointPath) : createTrainingState(args.seed);
    if (!resumed) state.budgetSeconds = args.budgetSeconds;
    await mkdir(output, { recursive: true });
    // Solo una ejecución nueva exporta la referencia inicial; resume nunca la reemplaza.
    if (!resumed) await savePolicy(join(output, 'initial-policy.json'), toPolicy(state.dqn.online, {seed:state.seed,trainingSteps:0,updates:0}));
    const save = async () => {
      await saveCheckpoint(checkpointPath, toCheckpoint(state));
      await savePolicy(join(output, 'policy.json'), toPolicy(state.dqn.online, {seed:state.seed,trainingSteps:state.dqn.steps,updates:state.dqn.updates}));
    };
    console.log(JSON.stringify({ evento:'inicio', reanudado:resumed, seed:state.seed, activeSeconds:state.activeSeconds, budgetSeconds:state.budgetSeconds ?? 21600, steps:state.dqn.steps }));
    const wallStart = performance.now();
    const report = await runTraining(state, {now:()=>performance.now()/1000, save, yield:()=>yieldImmediate(),stop:()=>interrupted ? 'SIGINT' : undefined});
    console.log(JSON.stringify({ evento:'fin', ...report, durationSeconds:(performance.now()-wallStart)/1000,
      stepsPerSecond:report.sessionActiveSeconds > 0 ? report.sessionSteps/report.sessionActiveSeconds : 0 }));
    console.log('Guardado completo. Ctrl+C pausa; --resume conserva el presupuesto activo acumulado.');
  } finally { process.off('SIGINT', onInterrupt); }
}
main().catch(error => { console.error(`No se pudo entrenar: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
