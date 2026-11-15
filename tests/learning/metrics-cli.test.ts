import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, it } from 'vitest';
const exec=promisify(execFile);
it('A-5 CLI informa memoria de proceso, payload y ritmo',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'lumina-metrics-'));
  try {
    const {stdout}=await exec(process.execPath,['--import','tsx','scripts/train.ts','--seed','42','--budget-seconds','0.1','--output',dir]);
    const fin=stdout.split('\n').filter(s=>s.startsWith('{')).map(s=>JSON.parse(s)).find(v=>v.evento==='fin');
    expect(fin.maxRSSBytes).toBeGreaterThan(0); expect(fin.sampledMaxRSSBytes).toBeGreaterThan(0);
    expect(fin.memoryMethod).toContain('resourceUsage');
    expect(fin.arrayPayloadBytes).toBeLessThanOrEqual(128*1024*1024);
    expect(fin.durationSeconds).toBeGreaterThanOrEqual(fin.sessionActiveSeconds);
    expect(fin.stepsPerSecond).toBeCloseTo(fin.sessionSteps/fin.sessionActiveSeconds,8);
    expect(fin.wallStepsPerSecond).toBeCloseTo(fin.sessionSteps/fin.durationSeconds,8);
    expect(fin.memoryLimitations).toContain('Windows');
  } finally {await rm(dir,{recursive:true,force:true});}
},20000);
it('A-4 CLI real exporta 90 episodios y conserva salida válida ante política corrupta',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'lumina-eval-'));
  try {
    await exec(process.execPath,['--import','tsx','scripts/train.ts','--seed','42','--budget-seconds','0.01','--output',dir]);
    const args=['--import','tsx','scripts/evaluate.ts','--initial',join(dir,'initial-policy.json'),'--policy',join(dir,'policy.json'),'--output',join(dir,'evaluation.json')];
    await exec(process.execPath,args);
    const before=await readFile(join(dir,'evaluation.json'),'utf8'), report=JSON.parse(before);
    expect(Object.values(report.references).reduce((s,v:any)=>s+v.episodes.length,0)).toBe(90);
    await writeFile(join(dir,'policy.json'),'{corrupto');
    await expect(exec(process.execPath,args)).rejects.toThrow('No se pudo evaluar');
    expect(await readFile(join(dir,'evaluation.json'),'utf8')).toBe(before);
  }finally{await rm(dir,{recursive:true,force:true});}
},30000);
