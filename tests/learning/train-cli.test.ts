import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { loadCheckpoint, loadPolicy } from '../../src/learning/files';

function cli(args: string[], interrupt = false): Promise<{code:number|null;out:string;err:string}> {
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,['--import','tsx','scripts/train.ts',...args],{stdio:['ignore','pipe','pipe']});
    let out='',err='',sent=false;
    const timeout=setTimeout(()=>{child.kill('SIGKILL');reject(Error('CLI excedió 20 segundos'));},20000);
    child.stdout.on('data',data=>{
      out+=data.toString();
      if(interrupt&&!sent&&out.includes('"evento":"inicio"')){sent=true;setTimeout(()=>child.kill('SIGINT'),100);}
    });
    child.stderr.on('data',data=>{err+=data.toString();});
    child.on('error',error=>{clearTimeout(timeout);reject(error);});
    child.on('close',code=>{clearTimeout(timeout);resolve({code,out,err});});
  });
}
it('A-2 CLI real: SIGINT guarda y resume no renueva presupuesto ni política inicial',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'lumina-cli-'));
  try{
    const first=await cli(['--seed','42','--budget-seconds','1','--output',directory],true);
    expect(first.code,first.err).toBe(0); expect(first.out).toContain('"reason":"SIGINT"');
    const path=join(directory,'checkpoint.json'), saved=await loadCheckpoint(path);
    expect(saved.budgetSeconds).toBe(1); expect(saved.activeSeconds).toBeGreaterThan(0); expect(saved.activeSeconds).toBeLessThan(1);
    const initial=await readFile(join(directory,'initial-policy.json'),'utf8');
    expect((await loadPolicy(join(directory,'initial-policy.json'))).metadata.trainingSteps).toBe(0);
    expect((await loadPolicy(join(directory,'policy.json'))).metadata.trainingSteps).toBe(saved.dqn.steps);
    const second=await cli(['--resume',path]);
    expect(second.code,second.err).toBe(0); expect(second.out).toContain('"reason":"budget"');
    const final=await loadCheckpoint(path); expect(final.budgetSeconds).toBe(1);
    expect(final.activeSeconds).toBeGreaterThanOrEqual(1); expect(final.dqn.steps).toBeGreaterThan(saved.dqn.steps);
    expect(await readFile(join(directory,'initial-policy.json'),'utf8')).toBe(initial);
    const third=await cli(['--resume',path]);expect(third.code,third.err).toBe(0);
    expect((await loadCheckpoint(path)).dqn.steps).toBe(final.dqn.steps);
    expect((await loadCheckpoint(path)).activeSeconds).toBe(final.activeSeconds);
  }finally{await rm(directory,{recursive:true,force:true});}
},30000);
it('CLI devuelve error español y código 1 ante argumentos inválidos',async()=>{
  const result=await cli(['--resume','x','--budget-seconds','1']);
  expect(result.code).toBe(1); expect(result.err).toContain('Reanudar conserva');
});
