import {test,expect,type Page} from '@playwright/test';
const errors=new WeakMap<Page,string[]>();
test.beforeEach(async({page})=>{const list:string[]=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message));page.on('console',m=>{if(m.type()==='error')list.push(m.text());});page.on('requestfailed',r=>list.push(`${r.method()} ${r.url()} ${r.failure()?.errorText}`));page.on('response',r=>{if(r.status()>=400)list.push(`${r.status()} ${r.url()}`);});await page.goto('http://127.0.0.1:4173');await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');});
test.afterEach(async({page})=>{expect(errors.get(page)).toEqual([]);});
async function room(page:Page,id:string){await close(page);await page.getByTestId('room-'+id).click();}
async function close(page:Page){const b=page.getByTestId('close-panel');if(await b.isVisible())await b.click();}
async function action(page:Page,id:string){await page.getByTestId(id).click();await expect(page.getByTestId('confirmation')).toBeVisible();await page.getByTestId('confirm-action').click();await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});}
async function prepare(page:Page,o:{pump?:boolean,antenna?:boolean,angle?:number,verify?:boolean}={}){await room(page,'design');await page.locator('[data-profile=balanced]').click();await action(page,'design-balanced');await close(page);await room(page,'control');await action(page,'trajectory');await close(page);await room(page,'weather');await action(page,'weather');await close(page);if(o.pump!==false)await action(page,'repair-pump');if(o.antenna!==false)await action(page,'repair-antenna');await room(page,'fuel');await action(page,'load');await close(page);const angle=o.angle??72;for(let i=72;i<angle;i++)await page.getByTestId('angle-plus').click();await action(page,'angle-confirm');if(o.verify!==false){await room(page,'systems');await action(page,'verify');await close(page);}}
async function launch(page:Page,warning=false){await page.getByTestId('launch').click();if(warning){await expect(page.getByTestId('risk-warning')).toBeVisible();await page.getByTestId('launch-anyway').click();}await expect(page.getByTestId('launch-animation')).toBeVisible();await expect(page.getByTestId('result')).toBeVisible({timeout:11000});}
async function reset(page:Page){await page.getByTestId('restart').click();await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');await expect(page.getByTestId('budget')).toContainText('1.000.000');await expect(page.getByTestId('result')).toBeHidden();await page.waitForTimeout(2200);await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');}
test('J1/J2/A4/J6 nueve salas, FIT, assets, animaciones y capturas en escritorio',async({page},info)=>{for(const size of [{width:1600,height:900},{width:1280,height:720}]){await page.setViewportSize(size);for(const id of ['design','control','weather','engineering','fuel','systems','storage','airlock','observation']){await room(page,id);await expect(page.getByTestId('detail')).toBeVisible();await close(page);}await expect(page.getByTestId('launch')).toBeDisabled();const bounds=await page.getByTestId('launch').boundingBox();expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(size.width);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(size.height);await page.screenshot({path:info.outputPath(`base-${size.width}.png`)});}const inspected=await page.evaluate(()=>{const g=(window as any).__game;const b=g.scene.getScene('BaseScene');return {width:g.config.width,height:g.config.height,pixel:g.config.pixelArt,rooms:g.textures.get('base-rooms').getFrameNames().length,characters:b.children.list.filter((o:any)=>o.type==='Sprite'&&o.anims.isPlaying).length};});expect(inspected).toMatchObject({width:1600,height:900,pixel:true,characters:9});expect(inspected.rooms).toBeGreaterThanOrEqual(9);await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');});
test('J3 progreso exclusivo y lectura sin tiempo',async({page})=>{await page.getByTestId('repair-pump').click();await expect(page.getByTestId('confirmation')).toContainText('20 min');await expect(page.getByTestId('confirmation')).toContainText('60.000');await page.getByTestId('confirm-action').dblclick();await expect(page.getByTestId('progress')).toBeVisible();await expect(page.getByTestId('repair-antenna')).toBeDisabled();await room(page,'systems');await expect(page.getByTestId('detail')).toContainText('Propulsión');await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');await expect(page.getByTestId('progress')).toBeHidden();await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:50');await expect(page.getByTestId('budget')).toContainText('940.000');await expect(page.getByTestId('objectives')).toContainText('1/2');});
test('J4/J5 ganadora, componentes, animación y reinicio',async({page},info)=>{await prepare(page);await expect(page.getByTestId('clock')).toHaveText('Día 1, 10:20');await expect(page.getByTestId('launch')).toBeEnabled();await page.getByTestId('launch').click();await expect(page.getByTestId('launch-animation')).toBeVisible();await page.waitForTimeout(1000);await page.screenshot({path:info.outputPath('launch.png')});await expect(page.getByTestId('result')).toBeVisible({timeout:10000});await expect(page.getByTestId('result')).toContainText('Misión completada');await expect(page.getByTestId('score')).toHaveText('712 / 1.000');for(const c of ['256','140','166','150'])await expect(page.getByTestId('breakdown')).toContainText(c);await page.screenshot({path:info.outputPath('success.png')});await reset(page);});
for(const scenario of [{name:'ángulo',o:{angle:80},cause:'80°'},{name:'bomba',o:{pump:false},cause:'76 %'},{name:'antena',o:{antenna:false},cause:'68 %'},{name:'clima',o:{},cause:'45 km/h'},{name:'múltiples y combustible',o:{antenna:false,angle:90},cause:'110.000'}])test(`J4/J5 fallo por ${scenario.name}`,async({page})=>{await prepare(page,scenario.o);if(scenario.name==='clima')await action(page,'wait-20');await expect(page.getByTestId('launch')).toBeEnabled();await page.getByTestId('launch').click();await expect(page.getByTestId('risk-warning')).toContainText(scenario.cause);const clock=await page.getByTestId('clock').innerText();await page.getByTestId('cancel-warning').click();await expect(page.getByTestId('clock')).toHaveText(clock);await expect(page.getByTestId('result')).toBeHidden();await launch(page,true);await expect(page.getByTestId('result')).toContainText(scenario.cause);if(scenario.name==='múltiples y combustible')for(const c of ['90°','68 %','110.000'])await expect(page.getByTestId('result')).toContainText(c);await expect(page.getByTestId('score')).toHaveText('0 / 1.000');await reset(page);});
test('J5 omisión de verificaciones falla directo, también permite éxito',async({page})=>{await prepare(page,{antenna:false,verify:false});await action(page,'wait-10');await launch(page);await expect(page.getByTestId('risk-warning')).toBeHidden();await expect(page.getByTestId('result')).toContainText('68 %');await reset(page);await prepare(page,{verify:false});await launch(page);await expect(page.getByTestId('result')).toContainText('Misión completada');});
test('J5 ventana perdida sin iniciar lanzamiento',async({page})=>{await prepare(page);await action(page,'wait-20');await action(page,'wait-20');await page.getByTestId('wait-20').click();await expect(page.getByTestId('confirmation')).toContainText('11:00');await page.getByTestId('confirm-action').click();await expect(page.getByTestId('result')).toContainText('11:20');await expect(page.getByTestId('launch-animation')).toBeHidden();await expect(page.getByTestId('score')).toHaveText('0 / 1.000');await reset(page);});

async function essentialBounds(page:Page){
 const size=page.viewportSize()!;
 for(const button of await page.locator('button:visible').all()){
  const box=await button.boundingBox();expect(box,await button.innerText()).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x+box!.width).toBeLessThanOrEqual(size.width);
  expect(box!.y+box!.height).toBeLessThanOrEqual(size.height);
  // Comprueba también recortes de paneles con overflow, no solo el viewport.
  expect(await button.evaluate(el=>{const b=el.getBoundingClientRect();for(let p=el.parentElement;p;p=p.parentElement){const style=getComputedStyle(p),r=p.getBoundingClientRect();if(/auto|hidden|scroll|clip/.test(style.overflowX)&& (b.left<r.left||b.right>r.right))return false;if(/auto|hidden|scroll|clip/.test(style.overflowY)&&(b.top<r.top||b.bottom>r.bottom))return false;}return true;})).toBe(true);
 }
}
test('J2 todos los controles esenciales caben a 1280x720',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await essentialBounds(page);
 for(const id of ['design','control','weather','engineering','fuel','systems','storage','airlock','observation']){await room(page,id);await essentialBounds(page);await close(page);}
 await room(page,'design');
 for(const profile of ['balanced','power','reinforced']){await page.locator(`[data-profile="${profile}"]`).click();await essentialBounds(page);await page.getByTestId('design-'+profile).click();await essentialBounds(page);await page.getByTestId('cancel-action').click();}
 await close(page);await prepare(page,{antenna:false});await page.getByTestId('launch').click();await essentialBounds(page);await page.getByTestId('launch-anyway').click();await expect(page.getByTestId('result')).toBeVisible({timeout:11000});await essentialBounds(page);await reset(page);
});
test('J4 aviso se invalida y revalida tras controles reales de espera',async({page})=>{
 await prepare(page,{antenna:false});await page.getByTestId('launch').click();
 await expect(page.getByTestId('risk-warning')).toContainText('68 %');
 // Para cambiar el estado hay que cerrar primero el aviso modal.
 await page.getByTestId('cancel-warning').click();
 await action(page,'wait-20');await expect(page.getByTestId('risk-warning')).toBeHidden();
 await expect(page.getByTestId('launch-anyway')).toHaveCount(0);await expect(page.getByTestId('result')).toBeHidden();
 await action(page,'wait-20');await expect(page.getByTestId('clock')).toHaveText('Día 1, 10:40');
 await page.getByTestId('launch').click();
 for(const cause of ['68 %','45 km/h'])await expect(page.getByTestId('risk-warning')).toContainText(cause);
 await page.getByTestId('launch-anyway').click();await expect(page.getByTestId('launch-animation')).toBeVisible();
 await expect(page.getByTestId('result')).toBeVisible({timeout:11000});
 for(const cause of ['68 %','45 km/h'])await expect(page.getByTestId('result')).toContainText(cause);
});
for(const time of ['10:00','11:00'])test(`R3 lanzamiento real en ${time} inclusivo`,async({page})=>{
 await prepare(page,time==='10:00'?{antenna:false}:{});
 if(time==='11:00'){await action(page,'wait-20');await action(page,'wait-20');}
 await expect(page.getByTestId('clock')).toHaveText('Día 1, '+time);
 await expect(page.getByTestId('launch')).toBeEnabled();await launch(page,true);
 await expect(page.getByTestId('result')).toContainText('Hora de preparación: '+time);
 await expect(page.getByTestId('result')).not.toContainText('Ventana perdida');
 await expect(page.getByTestId('result')).toContainText(time==='10:00'?'68 %':'45 km/h');
});

// P6: capturas para inspección visual; las aserciones no certifican estética.
const captureRoot='tests/e2e/rework-captures';
async function p6Capture(page:Page,name:string){await page.screenshot({path:`${captureRoot}/p6-${name}.png`});}
async function characterState(page:Page){return page.evaluate(()=>{
 const b=(window as any).__game.scene.getScene('BaseScene');
 return b.characters.map((s:any)=>({key:s.texture.key,animation:s.anims.currentAnim.key,frame:s.frame.name,playing:s.anims.isPlaying,visible:s.visible}));
});}
test('P6 A2/A4/J6 salas y ciclos idle/work a escala de juego',async({page})=>{
 await expect.poll(async()=> (await characterState(page)).length).toBe(9);
 const idle=await characterState(page);expect(idle.every((s:any)=>s.playing&&s.visible&&s.animation.endsWith('-idle'))).toBe(true);
 await p6Capture(page,'base-idle-1600-a');await page.waitForTimeout(270);await p6Capture(page,'base-idle-1600-b');
 for(const id of ['design','control','weather','engineering','fuel','systems','storage','airlock','observation']){
  await room(page,id);await expect(page.getByTestId('detail')).toBeVisible();await p6Capture(page,`room-${id}`);
 }
 await close(page);await page.setViewportSize({width:1280,height:720});await p6Capture(page,'base-idle-1280');await page.setViewportSize({width:1600,height:900});
 await page.getByTestId('repair-pump').click();await page.getByTestId('confirm-action').click();
 await expect(page.getByTestId('progress')).toBeVisible();
 expect((await characterState(page))[3].animation).toBe('technician-work');
 await p6Capture(page,'repair-work-a');await page.waitForTimeout(220);await p6Capture(page,'repair-work-b');
 await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});
 expect((await characterState(page))[3].animation).toBe('technician-idle');
 // La base solo activa trabajo de técnicos en reparación/carga. Sonda de render
 // para astronaut-work: API real de animación, sin inyectar estado de reglas.
 await page.evaluate(()=>{const b=(window as any).__game.scene.getScene('BaseScene');b.characters[7].play('astronaut-work');b.characters[8].play('astronaut-work');});
 expect((await characterState(page))[7].animation).toBe('astronaut-work');
 await p6Capture(page,'astronaut-work-probe-a');await page.waitForTimeout(220);await p6Capture(page,'astronaut-work-probe-b');
 await page.evaluate(()=>{const b=(window as any).__game.scene.getScene('BaseScene');b.characters[7].play('astronaut-idle');b.characters[8].play('astronaut-idle');});
});
for(const success of [true,false])test(`P6 J6 ascenso ${success?'exitoso':'fallido'}, humo/llama y reinicio`,async({page})=>{
 const label=success?'success':'failure';await prepare(page,success?{}:{angle:80});
 await page.getByTestId('launch').click();if(!success)await page.getByTestId('launch-anyway').click();
 await expect(page.getByTestId('launch-animation')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>(window as any).__game.scene.getScene('LaunchScene').children.list.filter((o:any)=>o.texture?.key==='smoke').length)).toBe(1);
 const start=await page.evaluate(()=>performance.now());
 const sample=()=>page.evaluate(()=>{const s=(window as any).__game.scene.getScene('LaunchScene');return s.children.list.filter((o:any)=>['rocket','smoke','flame'].includes(o.texture?.key)).map((o:any)=>({key:o.texture.key,y:o.y,frame:o.frame.name,visible:o.visible,animation:o.anims?.currentAnim?.key,playing:o.anims?.isPlaying}));});
 const first=await sample();expect(first.find((s:any)=>s.key==='smoke')).toMatchObject({animation:'smoke-burn',playing:true,visible:true});expect(first.find((s:any)=>s.key==='flame')).toMatchObject({animation:'flame-burn',playing:true,visible:true});
 await p6Capture(page,`${label}-launch-a`);await page.waitForTimeout(350);await p6Capture(page,`${label}-launch-b`);
 await page.waitForTimeout(850);const later=await sample();expect(later.find((s:any)=>s.key==='rocket')!.y).toBeLessThan(first.find((s:any)=>s.key==='rocket')!.y);await p6Capture(page,`${label}-ascent`);
 if(!success){await page.waitForTimeout(1300);expect((await sample()).find((s:any)=>s.key==='flame')!.visible).toBe(false);await p6Capture(page,'failure-anomaly');}
 // Timestamp DOM del resultado, independiente del intervalo de consulta de Playwright.
 const end=await page.evaluate(()=>new Promise<number>(resolve=>{const check=()=>{if(document.querySelector('[data-testid=result]')){observer.disconnect();resolve(performance.now());}};const observer=new MutationObserver(check);observer.observe(document.body,{childList:true,subtree:true});check();}));
 const duration=end-start;expect(duration).toBeGreaterThanOrEqual(success?6000:3000);expect(duration).toBeLessThanOrEqual(success?8000:5000);
 console.log(`P6 ${label}: primera observación de animación a resultado ${duration.toFixed(1)} ms`);
 await expect(page.getByTestId('result')).toContainText(success?'Misión completada':'Misión fallida');await p6Capture(page,`${label}-result`);
 await reset(page);await p6Capture(page,`${label}-restart`);expect((await characterState(page)).every((s:any)=>s.animation.endsWith('-idle'))).toBe(true);
 await room(page,'observation');await close(page);await expect(page.getByTestId('launch-animation')).toBeHidden();
});
