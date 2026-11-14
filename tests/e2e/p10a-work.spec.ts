import {test,expect,type Page} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
// Verificación focal: controles reales para acciones; acceso a Phaser/Session solo para observar.
const root='tests/e2e/p10a-evidence';
async function close(page:Page){if(await page.getByTestId('close-panel').isVisible())await page.getByTestId('close-panel').click();}
async function room(page:Page,id:string){await close(page);await page.getByTestId('room-'+id).click();}
async function immediate(page:Page,id:string){await page.getByTestId(id).click();await page.getByTestId('confirm-action').click();await expect(page.getByTestId('progress')).toBeHidden();}
async function state(page:Page){return page.evaluate(async()=> (await import('/src/game/Session.ts' as string)).session.state);}
async function timed(page:Page,id:string,index:number,minutes:number,cost:number,parts:number,capture:boolean){
 await close(page);if(id==='load')await room(page,'fuel');
 const before=await state(page);
 await page.getByTestId(id).click();
 const preview=await page.getByTestId('confirmation').innerText();
 expect(preview).toContain(`${minutes} min de juego`);expect(preview).toContain('$'+cost.toLocaleString('es-ES'));
 if(parts)expect(preview).toContain(`${parts} repuestos`);
 if(id==='load')for(const text of ['100.000 L combustible','6.000 L O₂','2.000 L agua','400 kg alimentos'])expect(preview).toContain(text);
 await page.evaluate(async(index)=>{
  const session=(await import('/src/game/Session.ts' as string)).session;
  const w=window as any;w.__p10a={samples:[],running:false};
  document.querySelector('[data-testid="confirm-action"]')!.addEventListener('click',()=>{
   w.__p10a.start=performance.now();w.__p10a.running=true;
   const sample=()=>{if(!w.__p10a.running)return;const s=w.__game.scene.getScene('BaseScene').characters[index];
    w.__p10a.samples.push({ms:performance.now()-w.__p10a.start,state:JSON.parse(JSON.stringify(session.state)),busy:session.busy,animation:s.anims.currentAnim?.key,frame:s.frame.name,playing:s.anims.isPlaying,progress:document.querySelector<HTMLElement>('[data-testid="progress"] .bar span')?.style.width??null});requestAnimationFrame(sample);
   };requestAnimationFrame(sample);
  },{once:true,capture:true});
 },index);
 await page.getByTestId('confirm-action').dblclick();
 await expect(page.getByTestId('progress')).toBeVisible();await close(page);
 if(capture)await page.screenshot({path:`${root}/pump-work-a.png`});
 await page.waitForTimeout(230);
 if(capture)await page.screenshot({path:`${root}/pump-work-b.png`});
 // Lectura/exploración permanece disponible; mutantes de cada panel y del HUD quedan bloqueados.
 for(const panel of ['storage','systems','weather']){
  await room(page,panel);await expect(page.getByTestId('detail')).toBeVisible();
  if(panel==='systems')await expect(page.getByTestId('verify')).toBeDisabled();
  if(panel==='weather')await expect(page.getByTestId('weather')).toBeDisabled();
  expect(await state(page)).toEqual(before);
 }
 for(const control of ['repair-pump','repair-antenna','wait-5','angle-plus','angle-confirm','launch'])await expect(page.getByTestId(control)).toBeDisabled();
 await close(page);await expect(page.getByTestId('confirmation')).toBeHidden();
 await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});
 if(capture)await page.screenshot({path:`${root}/pump-idle.png`});
 await page.waitForTimeout(350);
 const trace=await page.evaluate(()=>{const w=window as any;w.__p10a.running=false;return w.__p10a.samples;});
 await writeFile(`${root}/${test.info().title.replaceAll(' ','-')}-${id}.json`,JSON.stringify({before,preview,trace},null,2));
 const busy=trace.filter((s:any)=>s.busy),done=trace.filter((s:any)=>!s.busy);
 expect(busy.length).toBeGreaterThan(10);expect(done.length).toBeGreaterThan(2);
 for(const sample of busy){expect(sample.state).toEqual(before);expect(sample.animation).toBe('technician-work');expect(sample.playing).toBe(true);}
 expect([...new Set(busy.map((s:any)=>s.frame))].sort()).toEqual([2,3]);
 expect([...new Set(done.map((s:any)=>s.frame))].sort()).toEqual([0,1]);
 for(const sample of done)expect(sample.animation).toBe('technician-idle');
 const progress=busy.map((s:any)=>parseFloat(s.progress)).filter(Number.isFinite);
 expect(Math.max(...progress)).toBeGreaterThan(90);expect(Math.min(...progress)).toBeLessThan(10);
 expect(progress.every((p:number,i:number)=>i===0||p>=progress[i-1])).toBe(true);
 const expected=structuredClone(before);expected.minute+=minutes;expected.budget-=cost;expected.inventory.parts-=parts;
 if(id==='load'){expected.loaded=true;expected.cargo={fuel:100000,oxygen:6000,water:2000,food:400};for(const k of ['fuel','oxygen','water','food'])expected.inventory[k]-=expected.cargo[k];}
 else expected.repairs[id==='repair-pump'?'pump':'antenna']=true;
 expect(await state(page)).toEqual(expected);for(const sample of done)expect(sample.state).toEqual(expected);
 const states=trace.map((s:any)=>JSON.stringify(s.state));expect(states.filter((s:string,i:number)=>i>0&&s!==states[i-1])).toHaveLength(1);
 // Diferencia de dos frames de navegador acota la resolución de la medida del timer real.
 expect(done[0].ms).toBeGreaterThanOrEqual(1980);expect(done[0].ms).toBeLessThan(2250);
 console.log(JSON.stringify({id,minutes,cost,parts,durationMs:done[0].ms,frames:[2,3],transitions:1}));
}
for(const width of [1600,1280])for(const repaired of [true,false])test(`P10a work ${width} pump-${repaired}`,async({page})=>{
 await mkdir(root,{recursive:true});await page.setViewportSize({width,height:width*9/16});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto('http://127.0.0.1:4173');await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');
 if(repaired){await timed(page,'repair-pump',3,20,60000,10,width===1600);await timed(page,'repair-antenna',3,20,40000,5,false);await expect(page.getByTestId('objectives')).toContainText('(2/2)');await room(page,'systems');await expect(page.getByTestId('detail')).toContainText('✓ Propulsión');await expect(page.getByTestId('detail')).toContainText('✓ Comunicación');}
 await room(page,'design');await immediate(page,'design-balanced');await room(page,'control');await immediate(page,'trajectory');
 await timed(page,'load',4,repaired?30:40,30000,0,false);
 await room(page,'systems');await expect(page.getByTestId('detail')).toContainText('✓ Soporte vital');await expect(page.getByTestId('objectives').locator('li.ok')).toContainText(['Diseñar la nave','Calcular trayectoria',...(repaired?['Reparar fallas']:[]),'Cargar combustible']);
 expect(errors).toEqual([]);
});
