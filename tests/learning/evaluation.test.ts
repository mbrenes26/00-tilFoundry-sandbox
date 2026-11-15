import { describe, expect, it, vi } from 'vitest';
import { aggregate, evaluate, EVALUATION_SEEDS, parseEvaluateArgs, uniformLegalAction } from '../../src/learning/evaluation';
import { createNetwork } from '../../src/learning/network';
import { toPolicy } from '../../src/learning/policy';
import { createGame, legalActions, observe, step } from '../../src/game/engine';
import { chooseAction } from '../../src/learning/policy';

describe('A-4 evaluación', () => {
  it('agregados recalculables: media, mediana y desviación poblacional', () => {
    expect(aggregate([1, 2, 3, 4])).toEqual({mean:2.5, median:2.5, populationStdDev:Math.sqrt(1.25)});
    expect(aggregate([3, 1, 2]).median).toBe(2);
    expect(aggregate([7])).toEqual({mean:7,median:7,populationStdDev:0});
    expect(() => aggregate([])).toThrow(); expect(() => aggregate([NaN])).toThrow();
  });
  it('referencia uniforme legal reproducible, una tirada por acción', () => {
    const counts = [0,0,0,0]; let rng = 42;
    for (let i=0;i<30000;i++) {
      const result=uniformLegalAction([0,2,3],rng); rng=result.rngState; counts[result.action]++;
      expect([0,2,3]).toContain(result.action);
    }
    expect(counts[1]).toBe(0);
    for (const id of [0,2,3]) expect(Math.abs(counts[id]-10000)).toBeLessThan(400);
    expect(uniformLegalAction([2],42).action).toBe(2);
    expect(() => uniformLegalAction([],42)).toThrow();
  });
  it('30 semillas comunes, límite 3000, greedy exacto sin exploración ni mutación', () => {
    const policy=toPolicy(createNetwork(42),{seed:42,trainingSteps:0,updates:0});
    const before=JSON.stringify(policy);
    const random=vi.spyOn(Math,'random').mockImplementation(()=>{throw Error('Exploración prohibida');});
    try {
      const report=evaluate(policy,policy);
      expect(EVALUATION_SEEDS).toEqual(Array.from({length:30},(_,i)=>1001+i));
      expect(report.stepLimit).toBe(3000);
      for (const name of ['initial','policy','random'] as const) {
        const result=report.references[name]; expect(result.episodes.map(e=>e.seed)).toEqual(EVALUATION_SEEDS);
        for(const e of result.episodes){expect(e.steps).toBeLessThanOrEqual(3000);expect(e.steps).toBeGreaterThan(0);expect(e.livesLost).toBeGreaterThanOrEqual(0);}
        for(const metric of ['points','wins','livesLost','steps'] as const) expect(result.statistics[metric]).toEqual(aggregate(result.episodes.map(e=>e[metric])));
      }
      expect(report.references.initial).toEqual(report.references.policy);
      let game=createGame(1001);
      while(game.status==='running') game=step(game,chooseAction(policy,observe(game),legalActions(game))).state;
      expect(report.references.initial.episodes[0]).toEqual({seed:1001,points:game.points,wins:Number(game.status==='won'),livesLost:3-game.lives,steps:game.tick});
      expect(JSON.stringify(policy)).toBe(before);
      expect(evaluate(policy,policy)).toEqual(report);
    } finally {random.mockRestore();}
  },30000);
  it('CLI contratado y rechaza argumentos ambiguos', () => {
    expect(parseEvaluateArgs(['--initial','a','--policy','b','--output','c'])).toEqual({initial:'a',policy:'b',output:'c'});
    for(const args of [[],['--initial','a'],['--seed','1'],['--initial','a','--initial','b']]) expect(()=>parseEvaluateArgs(args)).toThrow();
  });
});
