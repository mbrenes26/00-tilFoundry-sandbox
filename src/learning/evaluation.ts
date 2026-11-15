import type { Action } from '../game/contracts';
import { createGame, legalActions, observe, step } from '../game/engine';
import { nextRandom, normalizeSeed } from '../game/random';
import { chooseAction, type PolicyV1 } from './policy';

export const EVALUATION_SEEDS: readonly number[] = Object.freeze(Array.from({length:30},(_,i)=>1001+i));
export const EVALUATION_STEP_LIMIT = 3000;
const METRICS = ['points','wins','livesLost','steps'] as const;
export interface Statistics { mean: number; median: number; populationStdDev: number }
export interface Episode { seed: number; points: number; wins: number; livesLost: number; steps: number }
export interface ReferenceResult { episodes: Episode[]; statistics: Record<typeof METRICS[number], Statistics> }
export interface EvaluationReport {
  schemaVersion: 1; stepLimit: 3000; seeds: readonly number[];
  references: Record<'initial'|'policy'|'random',ReferenceResult>;
}
export function aggregate(values: readonly number[]): Statistics {
  if (!values.length || !values.every(Number.isFinite)) throw new Error('Las estadísticas necesitan datos finitos no vacíos.');
  const sorted=[...values].sort((a,b)=>a-b), mean=values.reduce((s,v)=>s+v,0)/values.length;
  const mid=Math.floor(values.length/2);
  return {mean,median:values.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2,
    populationStdDev:Math.sqrt(values.reduce((s,v)=>s+(v-mean)**2,0)/values.length)};
}
/** Una tirada PRNG; intervalos de igual anchura para cada acción legal. PRNG separado del motor. */
export function uniformLegalAction(legal: readonly Action[], rngState: number): {action: Action; rngState: number} {
  if (!legal.length || new Set(legal).size!==legal.length || legal.some(a=>!Number.isInteger(a)||a<0||a>3)) throw new Error('Se requieren acciones legales distintas.');
  const random=nextRandom(rngState);
  return {action:legal[Math.floor(random.value*legal.length)],rngState:random.state};
}
function reference(policy?: PolicyV1): ReferenceResult {
  const episodes=EVALUATION_SEEDS.map(seed=>{
    let game=createGame(seed), rng=normalizeSeed(seed);
    while(game.status==='running' && game.tick<EVALUATION_STEP_LIMIT) {
      const legal=legalActions(game);
      let action: Action;
      if(policy) action=chooseAction(policy,observe(game),legal);
      else {const selected=uniformLegalAction(legal,rng);action=selected.action;rng=selected.rngState;}
      game=step(game,action).state;
    }
    return {seed,points:game.points,wins:Number(game.status==='won'),livesLost:3-game.lives,steps:game.tick};
  });
  const statistics=Object.fromEntries(METRICS.map(metric=>[metric,aggregate(episodes.map(e=>e[metric]))])) as ReferenceResult['statistics'];
  return {episodes,statistics};
}
/** Inferencia exclusivamente. No depende del entrenador, no actualiza pesos ni usa epsilon. */
export function evaluate(initial: PolicyV1, policy: PolicyV1): EvaluationReport {
  return {schemaVersion:1,stepLimit:EVALUATION_STEP_LIMIT,seeds:EVALUATION_SEEDS,
    references:{initial:reference(initial),policy:reference(policy),random:reference()}};
}
export function parseEvaluateArgs(args: readonly string[]): {initial:string;policy:string;output:string} {
  const result: Record<string,string>={};
  for(let i=0;i<args.length;i+=2) {
    const key=args[i]?.slice(2), value=args[i+1];
    if(!args[i]?.startsWith('--')||!['initial','policy','output'].includes(key)||key in result||!value||value.startsWith('--')) throw new Error('Usa --initial archivo --policy archivo --output archivo.');
    result[key]=value;
  }
  if(Object.keys(result).length!==3) throw new Error('Faltan --initial, --policy o --output.');
  return result as {initial:string;policy:string;output:string};
}
