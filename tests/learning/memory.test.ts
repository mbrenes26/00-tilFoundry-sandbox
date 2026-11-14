import { expect, it } from 'vitest';
import { trainingMemoryBudget, trainingArrayBytes, ARRAY_LIMIT_BYTES } from '../../src/learning/memory';
import { advanceTraining, createTrainingState } from '../../src/learning/checkpoint';
import { DQN_CONFIG } from '../../src/learning/dqn';

it('A-5 cuenta arrays persistentes y temporales explícitos por debajo de 128 MiB',()=>{
  const state=createTrainingState(42), budget=trainingMemoryBudget();
  const replayBytes=Object.values(state.dqn.replay).filter(v=>ArrayBuffer.isView(v)).reduce((sum,v)=>sum+(v as ArrayBufferView).byteLength,0);
  const networkBytes=Object.values(state.dqn.online).reduce((sum,v)=>sum+v.byteLength,0);
  expect(budget.replay).toBe(replayBytes); expect(budget.networks).toBe(2*networkBytes);
  expect(budget.gradient).toBe(networkBytes); expect(budget.targetReplacement).toBe(networkBytes);
  expect(budget.sampledBatch).toBe(DQN_CONFIG.batchSize*(2*36+4+3)*8);
  expect(budget.total).toBe(Object.entries(budget).filter(([k])=>k!=='total').reduce((s,[,v])=>s+v,0));
  expect(trainingArrayBytes(state)).toBe(replayBytes+2*networkBytes);
  expect(budget.total).toBeLessThanOrEqual(ARRAY_LIMIT_BYTES);
});
it('A-5 conserva un solo episodio y replay circular incluso al superar capacidad',()=>{
  const state=createTrainingState(42), before=trainingArrayBytes(state);
  const buffers=Object.values(state.dqn.replay).filter(v=>ArrayBuffer.isView(v));
  const keys=Object.keys(state).sort(), dqnKeys=Object.keys(state.dqn).sort();
  for(let i=0;i<10032;i++){state.game.status='timeout'; advanceTraining(state);}
  expect(state.episodes).toBe(10032); expect(state.dqn.steps).toBe(10032);
  expect(state.dqn.replay.size).toBe(10000); expect(state.dqn.replay.cursor).toBe(32);
  expect(Object.keys(state).sort()).toEqual(keys);
  expect(trainingArrayBytes(state)).toBe(before);
  Object.values(state.dqn.replay).filter(v=>ArrayBuffer.isView(v)).forEach((v,i)=>expect(v).toBe(buffers[i]));
  expect(Object.keys(state.dqn).sort()).toEqual(dqnKeys);
  expect(Object.values(state).filter(Array.isArray)).toHaveLength(0);
},30000);
