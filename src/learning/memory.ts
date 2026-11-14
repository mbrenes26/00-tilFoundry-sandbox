import { WIDTH, HEIGHT } from '../game/map';
import type { TrainingState } from './checkpoint';
import { DQN_CONFIG } from './dqn';
import { INPUTS, HIDDEN, OUTPUTS } from './network';

export const ARRAY_LIMIT_BYTES=128*1024*1024;
/** Cota de payload numérico/referencias vivos, no cota de heap/RSS ni del GC.
 * Arrays JS: 8 bytes por slot numérico/referencia; cabeceras/objetos/runtime son adicionales.
 * Se cuenta simultaneidad conservadora incluso de temporales usados secuencialmente.
 * Serialización/parseo de checkpoint quedan fuera: generan copias JSON adicionales. */
export function trainingMemoryBudget() {
  const network=(INPUTS*HIDDEN+HIDDEN+HIDDEN*OUTPUTS+OUTPUTS)*Float64Array.BYTES_PER_ELEMENT;
  const cells=WIDTH*HEIGHT, batch=DQN_CONFIG.batchSize;
  const parts={
    replay:DQN_CONFIG.replayCapacity*(2*INPUTS*8+8+3), // obs/next, rewards; action/terminal/legal-mask uint8
    networks:2*network,
    gradient:network,
    targetReplacement:network, // old target + new clone at synchronization
    sampledBatch:batch*(2*INPUTS+OUTPUTS+3)*8, // copied observations, legal ids, action/reward/terminal
    batchReferences:batch*(1+1+3)*8, // transitions + examples arrays, example observation/action/target
    activations:2*(HIDDEN+OUTPUTS)*8, // Bellman forward and gradient forward, conservative overlap
    stepObservations:2*INPUTS*8,
    actionWorkspace:8*OUTPUTS*8, // legal/candidates/directions/filter/map small arrays
    distances:cells*Int16Array.BYTES_PER_ELEMENT,
    pathQueue:cells*3*8, // queue refs and x/y payload, at most one entry per cell
    gameWorkspace:8*cells*3*8+4*32*8, // conservative old/new object lists, positions, actors/events
  };
  return {...parts,total:Object.values(parts).reduce((s,v)=>s+v,0)};
}
/** Bytes reales de buffers persistentes: excluye JS/GC y copias JSON. */
export function trainingArrayBytes(state: TrainingState): number {
  const networks=[state.dqn.online,state.dqn.target].flatMap(n=>Object.values(n));
  const replay=Object.values(state.dqn.replay).filter(v=>ArrayBuffer.isView(v)) as ArrayBufferView[];
  return [...networks,...replay].reduce((s,v)=>s+v.byteLength,0);
}
