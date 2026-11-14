import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { evaluate, parseEvaluateArgs } from '../src/learning/evaluation';
import { atomicSave, loadPolicy } from '../src/learning/files';

async function main(): Promise<void> {
  const args=parseEvaluateArgs(process.argv.slice(2));
  const initial=await loadPolicy(args.initial), policy=await loadPolicy(args.policy);
  const start=performance.now();
  const report=evaluate(initial,policy);
  const output=resolve(args.output);
  await mkdir(dirname(output),{recursive:true});
  await atomicSave(output,JSON.stringify(report,null,2));
  console.log(JSON.stringify({evento:'evaluacion',episodes:90,stepLimit:report.stepLimit,
    durationSeconds:(performance.now()-start)/1000,statistics:Object.fromEntries(Object.entries(report.references).map(([name,result])=>[name,result.statistics]))}));
  console.log('Evaluación guardada. Los resultados no garantizan mejora de la red.');
}
main().catch(error=>{console.error(`No se pudo evaluar: ${error instanceof Error ? error.message : String(error)}`);process.exitCode=1;});
