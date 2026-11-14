import { dirname, join, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { setImmediate as yieldImmediate } from 'node:timers/promises';
import { advanceTraining, createTrainingState, toCheckpoint } from '../src/learning/checkpoint';
import { loadCheckpoint, saveCheckpoint, savePolicy } from '../src/learning/files';
import { toPolicy } from '../src/learning/policy';
import { parseTrainArgs, runTraining } from '../src/learning/training';
import { ARRAY_LIMIT_BYTES, trainingMemoryBudget } from '../src/learning/memory';

async function main(): Promise<void> {
  const args = parseTrainArgs(process.argv.slice(2));
  const memory=trainingMemoryBudget();
  if(memory.total>ARRAY_LIMIT_BYTES) throw new Error('Los arrays superan el límite algorítmico de 128 MiB.');
  let sampledMaxRSSBytes=process.memoryUsage().rss;
  const sampleMemory=()=>{sampledMaxRSSBytes=Math.max(sampledMaxRSSBytes,process.memoryUsage().rss);};
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
    sampleMemory();
    const save = async () => {
      await saveCheckpoint(checkpointPath, toCheckpoint(state));
      sampleMemory();
      await savePolicy(join(output, 'policy.json'), toPolicy(state.dqn.online, {seed:state.seed,trainingSteps:state.dqn.steps,updates:state.dqn.updates}));
      sampleMemory();
    };
    console.log(JSON.stringify({ evento:'inicio', reanudado:resumed, seed:state.seed, activeSeconds:state.activeSeconds, budgetSeconds:state.budgetSeconds ?? 21600, steps:state.dqn.steps }));
    const wallStart = performance.now();
    const report = await runTraining(state, {now:()=>performance.now()/1000, save,
      batch:()=>{for(let i=0;i<32;i++) advanceTraining(state);},
      yield:async()=>{sampleMemory();await yieldImmediate();},stop:()=>interrupted ? 'SIGINT' : undefined});
    const durationSeconds=(performance.now()-wallStart)/1000;
    sampleMemory();
    console.log(JSON.stringify({ evento:'fin', ...report, durationSeconds,
      stepsPerSecond:report.sessionActiveSeconds > 0 ? report.sessionSteps/report.sessionActiveSeconds : 0,
      wallStepsPerSecond:durationSeconds>0 ? report.sessionSteps/durationSeconds : 0,
      maxRSSBytes:process.resourceUsage().maxRSS*1024,sampledMaxRSSBytes,
      memoryMethod:'process.resourceUsage().maxRSS en KiB convertido a bytes: máximo del proceso desde inicio, incluye carga/guardado; process.memoryUsage().rss muestreado entre lotes y tras guardados.',
      arrayPayloadBytes:memory.total,
      memoryLimitations:'JSON, serialización/parseo, objetos, GC y runtime consumen memoria adicional; RSS no es el límite de arrays. Windows con 4 GB no certificado.' }));
    console.log('Guardado completo. Ctrl+C pausa; --resume conserva el presupuesto activo acumulado.');
  } finally { process.off('SIGINT', onInterrupt); }
}
main().catch(error => { console.error(`No se pudo entrenar: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
