import { describe, expect, it } from 'vitest';
import { parseTrainArgs, runTraining } from '../../src/learning/training';
import { createTrainingState, restoreCheckpoint, toCheckpoint } from '../../src/learning/checkpoint';

describe('A-2 argumentos CLI', () => {
  it('acepta contrato nuevo y resume sin renovar presupuesto', () => {
    expect(parseTrainArgs(['--seed','42','--budget-seconds','21600','--output','runs/experimento'])).toEqual({ seed:42, budgetSeconds:21600, output:'runs/experimento' });
    expect(parseTrainArgs(['--resume','runs/experimento/checkpoint.json'])).toEqual({ resume:'runs/experimento/checkpoint.json' });
  });
  it.each([[], ['--seed','-1','--output','x'], ['--seed','1.5','--output','x'], ['--seed','Infinity','--output','x'], ['--seed','1','--output','x','--budget-seconds','0'], ['--seed','1','--output','x','--budget-seconds','21601'], ['--seed','1','--output','x','--budget-seconds','NaN'], ['--resume','x','--budget-seconds','10'], ['--resume','x','--output','y'], ['--output'], ['--other','x'], ['--resume','x','--resume','y']].map(args=>({args})))('rechaza $args', ({args}) => expect(() => parseTrainArgs(args)).toThrow());
});

describe('A-2 reloj activo y persistencia', () => {
  it('comprueba antes de lote, registra exceso y conserva presupuesto al restaurar', async () => {
    let clock=9000, batches=0; const saved:number[]=[];
    const state=createTrainingState(42); state.budgetSeconds=1; state.activeSeconds=.75;
    const result=await runTraining(state,{ now:()=>clock, batch:()=>{ batches++; clock+=.5; }, save:async()=>{ saved.push(state.activeSeconds); clock+=100; }, yield:async()=>{ clock+=1000; } });
    expect(batches).toBe(1); expect(result.reason).toBe('budget'); expect(result.excessSeconds).toBe(.25);
    expect(state.activeSeconds).toBe(1.25); expect(saved).toEqual([1.25]);
    const restored=restoreCheckpoint(toCheckpoint(state)); expect(restored.budgetSeconds).toBe(1);
    const resumed=await runTraining(restored,{ now:()=>clock, batch:()=>{ throw Error('no debe entrenar'); }, save:async()=>{}, yield:async()=>{} });
    expect(resumed.reason).toBe('budget'); expect(restored.activeSeconds).toBe(1.25);
  });
  it('frontera exacta, cada 300 segundos activos y guardado final; carga/guardado/esperas no cuentan', async () => {
    let clock=5000, batches=0; const saved:number[]=[]; const state=createTrainingState(2); state.budgetSeconds=600;
    await runTraining(state,{now:()=>clock,batch:()=>{ batches++; clock+=150; },save:async()=>{ saved.push(state.activeSeconds); clock+=800; },yield:async()=>{clock+=900;} });
    expect(batches).toBe(4); expect(saved).toEqual([300,600,600]); expect(state.activeSeconds).toBe(600);
  });
  it.each(['SIGINT','pause'] as const)('guarda entre lotes al %s', async reason => {
    let clock=0, stop: 'SIGINT'|'pause'|undefined; const state=createTrainingState(3); state.budgetSeconds=100;
    let saves=0,batches=0;
    const result=await runTraining(state,{now:()=>clock,batch:()=>{batches++;clock+=2;stop=reason;},stop:()=>stop,save:async()=>{saves++;},yield:async()=>{clock+=500;} });
    expect(result.reason).toBe(reason); expect(state.activeSeconds).toBe(2); expect(batches).toBe(1); expect(saves).toBe(1);
  });
  it('guarda al finalizar por error y no cuenta espera externa', async()=>{
    const state=createTrainingState(4); state.budgetSeconds=10; let clock=0,saves=0;
    await expect(runTraining(state,{now:()=>clock,batch:()=>{clock+=1;throw Error('fallo');},save:async()=>{saves++;},yield:async()=>{} })).rejects.toThrow('fallo');
    expect(saves).toBe(1); expect(state.activeSeconds).toBe(1);
  });
  it('valida presupuesto persistido y conserva snapshots antiguos',()=>{
    const state=createTrainingState(1); expect(restoreCheckpoint(toCheckpoint(state)).budgetSeconds).toBeUndefined();
    for(const n of [0,21601,NaN,Infinity]){state.budgetSeconds=n;expect(()=>toCheckpoint(state)).toThrow();}
  });
});
