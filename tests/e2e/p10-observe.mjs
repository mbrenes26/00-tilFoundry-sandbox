// Sonda visual/temporal del comportamiento existente; no sustituye las pruebas de aceptación.
// Ejecutar con Vite en 4173: node tests/e2e/p10-observe.mjs work|success|failure
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const mode=process.argv[2];
if(!['work','success','failure'].includes(mode))throw Error('Lote requerido: work|success|failure');
const root=process.env.P10_OUTPUT??'tests/e2e/p10-evidence';await mkdir(root,{recursive:true});
const browser=await chromium.launch();
try{
 for(const width of [1600,1280]){
  const page=await browser.newPage({viewport:{width,height:width*9/16}});const errors=[],events=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('requestfailed',r=>errors.push(`${r.url()} ${r.failure()?.errorText}`));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('http://127.0.0.1:4173');await page.getByTestId('clock').waitFor();
  const snapshot=()=>page.evaluate(async()=>{
   const {session}=await import('/src/game/Session.ts');const g=window.__game,b=g.scene.getScene('BaseScene'),l=g.scene.getScene('LaunchScene');
   return {state:session.state,busy:session.busy,warning:session.warning,
    characters:b.characters.map(s=>({key:s.anims.currentAnim?.key,frame:s.frame.name,playing:s.anims.isPlaying})),
    launch:l.children.list.map(s=>({type:s.type,key:s.texture?.key,frame:s.frame?.name,anim:s.anims?.currentAnim?.key,y:s.y,visible:s.visible,tint:s.tintTopLeft,text:s.text})),
    active:g.scene.getScenes(true).map(s=>s.scene.key),timing:window.__p10Timing,progress:document.querySelector('[data-testid="progress"] .bar span')?.style.width};
  });
  const record=async(label,started)=>{events.push({label,elapsed:started?Date.now()-started:0,...await snapshot()});};
  const capture=async label=>{await page.screenshot({path:`${root}/${mode}-${width}-${label}.png`});};
  const close=async()=>{if(await page.getByTestId('close-panel').isVisible())await page.getByTestId('close-panel').click();};
  const room=async id=>{await close();await page.getByTestId('room-'+id).click();};
  const action=async id=>{await page.getByTestId(id).click();await page.getByTestId('confirm-action').click();await page.getByTestId('progress').waitFor({state:'hidden',timeout:5000});};
  const armTiming=async(control,endSelector,endInitial)=>page.evaluate(({control,endSelector,endInitial})=>{
   window.__p10Observer?.disconnect();window.__p10Timing={};
   document.querySelector(`[data-testid="${control}"]`).addEventListener('click',()=>{window.__p10Timing.start=performance.now();},{once:true,capture:true});
   window.__p10Observer=new MutationObserver(()=>{const end=document.querySelector(endSelector);if(window.__p10Timing.start&&end&&end.textContent!==endInitial){window.__p10Timing.end=performance.now();window.__p10Timing.duration=window.__p10Timing.end-window.__p10Timing.start;window.__p10Observer.disconnect();}});
   window.__p10Observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  },{control,endSelector,endInitial});
  const timed=async(id,index)=>{
   await close();if(id==='load')await room('fuel');else await room('engineering');
   await page.getByTestId(id).click();events.push({label:id+'-preview',text:await page.getByTestId('confirmation').innerText()});
   await record(id+'-before');await armTiming('confirm-action','[data-testid="clock"]',await page.getByTestId('clock').innerText());const started=Date.now();
   await page.getByTestId('confirm-action').dblclick();await page.getByTestId('progress').waitFor();
   await close();await record(id+'-start',started);await capture(id+'-base-a');
   await page.waitForTimeout(300);await record(id+'-middle',started);await capture(id+'-base-b');
   // Intento DOM de otro control mutante: debe seguir deshabilitado y sin segunda tarea.
   events.push({label:id+'-disabled',antenna:await page.getByTestId('repair-antenna').isDisabled(),wait:await page.getByTestId('wait-5').isDisabled(),index});
   await page.getByTestId('wait-5').dispatchEvent('click');await record(id+'-second-attempt',started);
   await page.getByTestId('progress').waitFor({state:'hidden',timeout:5000});await record(id+'-complete',started);
   await capture(id+'-idle');await page.waitForTimeout(250);await record(id+'-stable',started);await close();
  };
  await record('initial');
  if(mode==='work'){
   await timed('repair-pump',3);await timed('repair-antenna',3);
   await room('design');await action('design-balanced');await room('control');await action('trajectory');await timed('load',4);
   // Astronaut work no está asociado a una acción jugable: solo sonda explícita de spritesheet.
   await page.evaluate(()=>window.__game.scene.getScene('BaseScene').characters[7].play('astronaut-work'));
   await capture('astronaut-probe-a');await page.waitForTimeout(300);await capture('astronaut-probe-b');await record('astronaut-work-TECHNICAL-PROBE');
   await page.evaluate(()=>window.__game.scene.getScene('BaseScene').characters[7].play('astronaut-idle'));
  }else{
   await room('design');await action('design-balanced');await room('control');await action('trajectory');await room('weather');await action('weather');await close();
   await action('repair-pump');await action('repair-antenna');await room('fuel');await action('load');await close();
   if(mode==='failure')for(let i=72;i<80;i++)await page.getByTestId('angle-plus').click();
   await action('angle-confirm');await room('systems');await action('verify');await close();await record('prelaunch');
   if(mode==='success')await armTiming('launch','[data-testid="result"]','');await page.getByTestId('launch').click();
   if(mode==='failure'){events.push({label:'warning',text:await page.getByTestId('risk-warning').innerText()});await armTiming('launch-anyway','[data-testid="result"]','');await page.getByTestId('launch-anyway').click();}
   await page.getByTestId('launch-animation').waitFor();const started=Date.now();
   await record('ignition-a',started);await capture('ignition-a');await page.waitForTimeout(300);await record('ignition-b',started);await capture('ignition-b');
   await page.waitForTimeout(mode==='success'?2600:2200);await record('ascent',started);await capture(mode==='success'?'ascent':'anomaly');
   await page.getByTestId('result').waitFor({timeout:10000});await record('result',started);events.push({label:'result-text',text:await page.getByTestId('result').innerText()});await capture('result');
   await page.getByTestId('restart').click();await page.getByTestId('clock').waitFor();await record('restart');await capture('restart');await page.waitForTimeout(2400);await record('restart-stable');
  }
  const output={mode,width,events,errors};await writeFile(`${root}/${mode}-${width}.json`,JSON.stringify(output,null,2));
  console.log(JSON.stringify({mode,width,errors,timings:events.filter(e=>e.label.endsWith('-complete')||e.label==='result').map(e=>({label:e.label,elapsed:e.elapsed,browserDuration:e.timing?.duration})),result:events.find(e=>e.label==='result-text')?.text}));
  await page.close();
 }
}finally{await browser.close();}
