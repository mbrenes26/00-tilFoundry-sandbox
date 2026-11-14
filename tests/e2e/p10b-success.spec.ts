import {test,expect,type Page} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
// P10b únicamente: controles reales, reloj Phaser sin acelerar; sondeo de solo lectura.
const root=process.env.P10B_OUTPUT??'tests/e2e/p10b-evidence';
async function action(page:Page,id:string){await page.getByTestId(id).click();await page.getByTestId('confirm-action').click();await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});}
async function roomAction(page:Page,room:string,id:string){await page.getByTestId('room-'+room).click();await action(page,id);await page.getByTestId('close-panel').click();}
async function state(page:Page){return page.evaluate(async()=> (await import('/src/game/Session.ts' as string)).session.state);}
for(const width of [1600,1280])test(`P10b éxito y reinicio exacto ${width}`,async({page})=>{
 await mkdir(root,{recursive:true});await page.setViewportSize({width,height:width*9/16});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>errors.push(`${r.url()} ${r.failure()?.errorText}`));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto('http://127.0.0.1:4173');await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');
 const initial=await state(page);
 const preparation=[];
 for(const [room,id,minute] of [['design','design-balanced',520],['control','trajectory',530],['weather','weather',535],['','repair-pump',555],['','repair-antenna',575],['fuel','load',605],['','angle-confirm',610],['systems','verify',620]] as const){
  if(room)await roomAction(page,room,id);else await action(page,id);
  const s=await state(page);expect(s.minute).toBe(minute);preparation.push({id,state:s});
 }
 const prelaunch=await state(page);expect(prelaunch.budget).toBe(640000);expect(prelaunch.inventory.parts).toBe(35);expect(prelaunch.cargo.fuel).toBe(100000);
 await expect(page.getByTestId('launch')).toBeEnabled();
 await page.evaluate(async()=>{
  const session=(await import('/src/game/Session.ts' as string)).session,w=window as any;
  const g=w.__game;w.__p10b={trace:[],captures:[],running:false};
  w.__p10b.snapshot=()=>{
   const l=g.scene.getScene('LaunchScene');
   return {ms:performance.now()-w.__p10b.start,active:g.scene.getScenes(true).map((s:any)=>s.scene.key),
    sprites:l.children.list.filter((s:any)=>s.texture).map((s:any)=>({key:s.texture.key,frame:s.frame.name,anim:s.anims?.currentAnim?.key,playing:s.anims?.isPlaying,y:s.y,scaleX:s.scaleX,alpha:s.alpha,visible:s.visible})),
    tweenCount:l.tweens.getTweens().length,resultVisible:!!document.querySelector('[data-testid="result"]'),state:JSON.stringify(session.state)};
  };
  const observer=new MutationObserver(()=>{if(w.__p10b.start&&document.querySelector('[data-testid="result"]')){w.__p10b.durationMs=performance.now()-w.__p10b.start;observer.disconnect();}});
  observer.observe(document.body,{subtree:true,childList:true});
  document.querySelector('[data-testid="launch"]')!.addEventListener('click',()=>{
   w.__p10b.start=performance.now();w.__p10b.running=true;
   const sample=()=>{if(!w.__p10b.running)return;w.__p10b.trace.push(w.__p10b.snapshot());requestAnimationFrame(sample);};requestAnimationFrame(sample);
  },{once:true,capture:true});
 });
 await page.getByTestId('launch').click();await expect(page.getByTestId('launch-animation')).toBeVisible();await expect(page.getByTestId('risk-warning')).toBeHidden();
 await expect(page.locator('.platform-label')).toBeHidden();await expect(page.locator('.launch-reasons')).toHaveText('Despegue en curso. El diagnóstico se mostrará al finalizar.');
 for(const id of ['launch','angle-confirm','angle-plus','repair-pump','wait-20'])await expect(page.getByTestId(id)).toBeDisabled();
 const focal=async(label:string)=>{
  const before=await page.evaluate(()=> (window as any).__p10b.snapshot());
  await page.screenshot({path:`${root}/success-${width}-${label}.png`,...(label==='ascent'?{}:{clip:{x:1120*width/1600,y:180*width/1600,width:480*width/1600,height:480*width/1600}})});
  const after=await page.evaluate(()=> (window as any).__p10b.snapshot());
  return {label,before,after};
 };
 const captures=[];captures.push(await focal('ignition-a'));await page.waitForTimeout(270);captures.push(await focal('ignition-b'));
 await page.waitForFunction(()=> (window as any).__p10b.snapshot().ms>=3100);captures.push(await focal('ascent'));
 await expect(page.getByTestId('result')).toBeVisible({timeout:10000});await expect(page.getByTestId('score')).toHaveText('712 / 1.000');
 await expect(page.getByTestId('result')).toContainText('Misión completada');
 const resultText=await page.getByTestId('result').innerText();
 for(const text of ['Hora de preparación: 10:20','Presupuesto restante $640.000 · Repuestos 35 u.','Combustible restante a bordo: 8000 L.','Sin riesgos.'])expect(resultText).toContain(text);
 await expect(page.getByTestId('breakdown').locator('strong')).toHaveText(['256','140','166','150']);
 const launched=await state(page);expect(launched.cargo.fuel).toBe(8000);expect(launched.result?.outcome).toBe('success');expect(launched.minute).toBe(620);expect(launched.budget).toBe(640000);expect(launched.inventory.parts).toBe(35);
 await page.screenshot({path:`${root}/success-${width}-result.png`});
 const timing=await page.evaluate(()=>{const w=window as any;w.__p10b.running=false;return {durationMs:w.__p10b.durationMs,trace:w.__p10b.trace,final:w.__p10b.snapshot()};});
 // Guardar antes de las aserciones temporales permite diagnosticar cualquier regresión.
 await writeFile(`${root}/success-${width}.json`,JSON.stringify({width,preparation,initial,prelaunch,launched,captures,resultText,timing,errors},null,2));
 expect(timing.durationMs).toBeGreaterThanOrEqual(6000);expect(timing.durationMs).toBeLessThanOrEqual(8000);
 const launchFrames=timing.trace.filter((s:any)=>s.active.includes('LaunchScene'));
 expect(launchFrames.length).toBeGreaterThan(100);
 for(const [key,anim] of [['flame','flame-burn'],['smoke','smoke-burn']]){
  const sprites=launchFrames.flatMap((s:any)=>s.sprites.filter((p:any)=>p.key===key));
  expect([...new Set(sprites.map((s:any)=>s.frame))].sort()).toEqual([0,1,2]);
  expect(sprites.every((s:any)=>s.anim===anim&&s.playing&&s.visible)).toBe(true);
 }
 const ys=launchFrames.map((s:any)=>s.sprites.find((p:any)=>p.key==='rocket').y);
 expect(ys[0]).toBeGreaterThan(560);expect(Math.min(...ys)).toBeLessThan(-175);expect(ys.every((y:number,i:number)=>!i||y<=ys[i-1])).toBe(true);
 expect(launchFrames.some((s:any)=>s.tweenCount===2)).toBe(true);
 expect(timing.final.active).toEqual(['ResultScene']);expect(timing.final.tweenCount).toBe(0);
 const terminal=JSON.stringify(launched);expect(timing.trace.every((s:any)=>s.state===terminal)).toBe(true);
 await page.getByTestId('restart').click();await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');expect(await state(page)).toEqual(initial);
 await expect(page.getByTestId('result')).toBeHidden();await expect(page.getByTestId('launch-animation')).toBeHidden();await expect(page.getByTestId('confirmation')).toBeHidden();await expect(page.getByTestId('progress')).toBeHidden();await expect(page.getByTestId('objectives').locator('li.ok')).toHaveCount(0);await expect(page.locator('.platform-label')).toBeVisible();await expect(page.getByTestId('budget')).toHaveText('$1.000.000');await expect(page.getByTestId('launch')).toBeDisabled();
 await page.screenshot({path:`${root}/success-${width}-restart.png`});
 const restart=await page.evaluate(async()=>{
  const session=(await import('/src/game/Session.ts' as string)).session,w=window as any,g=w.__game;
  const baseline=JSON.stringify(session.state),start=performance.now();let count=0;const deviations:any[]=[];
  await new Promise<void>(resolve=>{const sample=()=>{count++;if(JSON.stringify(session.state)!==baseline||session.busy||session.warning||document.querySelector('[data-testid="result"], [data-testid="progress"], [data-testid="risk-warning"], [data-testid="launch-animation"]'))deviations.push({ms:performance.now()-start,state:session.state});if(performance.now()-start>=8200)resolve();else requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  return {observedMs:performance.now()-start,count,deviations,state:session.state,busy:session.busy,warning:session.warning,active:g.scene.getScenes(true).map((s:any)=>s.scene.key),cleanup:['LaunchScene','UIScene','BaseScene','ResultScene'].map(key=>{const s=g.scene.getScene(key);return {key,tweens:s.tweens.getTweens().length,activeTimers:s.time._active.length,pendingTimers:s.time._pendingInsertion.length};}),ui:{draft:g.scene.getScene('UIScene').draft,room:g.scene.getScene('UIScene').room,pending:g.scene.getScene('UIScene').pending,progress:g.scene.getScene('UIScene').progress},rocketVisible:g.scene.getScene('BaseScene').rocket.visible};
 });
 await writeFile(`${root}/restart-${width}.json`,JSON.stringify({restart,errors},null,2));
 expect(restart.deviations).toEqual([]);expect(restart.state).toEqual(initial);expect(restart.active).toEqual(['BaseScene','UIScene']);expect(restart.busy).toBe(false);expect(restart.warning).toBe(false);expect(restart.rocketVisible).toBe(true);expect(restart.ui).toEqual({draft:72,room:null,pending:null,progress:0});
 for(const scene of restart.cleanup){expect(scene.tweens).toBe(0);expect(scene.activeTimers).toBe(0);expect(scene.pendingTimers).toBe(0);}
 expect(errors).toEqual([]);
 console.log(JSON.stringify({width,durationMs:timing.durationMs,score:712,frames:[0,1,2],restartObservedMs:restart.observedMs,restartSamples:restart.count,errors}));
});
