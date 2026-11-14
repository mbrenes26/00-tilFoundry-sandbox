import {test,expect,type Page} from '@playwright/test';

test.beforeEach(async({page})=>{
 await page.goto('http://127.0.0.1:4173');
 await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');
});
async function action(page:Page,id:string){
 await page.getByTestId(id).click();await page.getByTestId('confirm-action').click();
 await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});
}
async function roomAction(page:Page,room:string,id:string){
 await page.getByTestId('room-'+room).click();await action(page,id);await page.getByTestId('close-panel').click();
}
async function riskyPreparation(page:Page){
 await roomAction(page,'design','design-balanced');await roomAction(page,'control','trajectory');
 await roomAction(page,'weather','weather');await action(page,'repair-pump');
 await roomAction(page,'fuel','load');await action(page,'angle-confirm');await roomAction(page,'systems','verify');
}
async function rerender(page:Page){
 await page.evaluate(()=>{(window as any).__game.scene.getScene('UIScene').render();});
}
async function dialogKeyboard(page:Page,id:string,name:string,cancel:string,confirm:string){
 const dialog=page.getByTestId(id);
 await expect.soft(dialog).toHaveAttribute('role','dialog');
 await expect.soft(dialog).toHaveAccessibleName(name);await expect.soft(dialog).toHaveAttribute('aria-modal','true');
 await expect.soft(page.getByTestId(cancel)).toBeFocused();
 for(const key of ['Tab','Shift+Tab']){
  for(let i=0;i<20;i++){
   await page.keyboard.press(key);
   expect.soft(await page.getByTestId(i%2===0?confirm:cancel).evaluate(el=>el===document.activeElement)).toBe(true);
   if(i===0){await rerender(page);await expect(page.getByTestId(confirm)).toBeFocused();}
  }
 }
}
async function objectiveGeometry(page:Page){
 const geometry=await page.getByTestId('objectives').evaluate(panel=>{
  const bounds=panel.getBoundingClientRect();const problems:string[]=[];let textRects=0;
  const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
   const node=walker.currentNode;if(!node.textContent?.trim())continue;
   const range=document.createRange();range.selectNodeContents(node);
   for(const r of Array.from(range.getClientRects())){
    textRects++;
    if(r.left<bounds.left+2||r.right>bounds.right-2||r.top<bounds.top+2||r.bottom>bounds.bottom-2)problems.push('Fuera del panel: '+node.textContent);
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    if(!hit||!panel.contains(hit))problems.push('Texto tapado: '+node.textContent);
   }
  }
  return {client:panel.clientHeight,scroll:panel.scrollHeight,textRects,problems};
 });
 expect(geometry.textRects).toBeGreaterThan(0);
 expect(geometry.problems).toEqual([]);expect(geometry.scroll).toBeLessThanOrEqual(geometry.client);
 return geometry;
}
for(const size of [{width:1600,height:900},{width:1280,height:720}]){
 test(`REWORK objetivos completos sin solapamiento ${size.width}x${size.height}`,async({page},info)=>{
  await page.setViewportSize(size);
  for(const state of ['initial','prepared'] as const){
   if(state==='prepared')await riskyPreparation(page);
   const geometry=await objectiveGeometry(page);
   console.log(`UI-1 ${size.width}x${size.height} ${state}: ${JSON.stringify(geometry)}`);
   const path=`tests/e2e/rework-captures/p1-objectives-${size.width}x${size.height}-${state}.png`;
   await page.screenshot({path});
   await info.attach(`UI-1 ${state}`,{path,contentType:'image/png'});
  }
 });
}
test('REWORK confirmación: semántica, teclado, cancelar, confirmar y foco tras render',async({page})=>{
 await page.getByTestId('repair-pump').focus();await page.keyboard.press('Enter');
 await dialogKeyboard(page,'confirmation','Confirmar acción','cancel-action','confirm-action');
 await page.keyboard.press('Enter');await expect(page.getByTestId('confirmation')).toBeHidden();
 await expect(page.getByTestId('repair-pump')).toBeFocused();
 await page.keyboard.press('Enter');await page.keyboard.press('Tab');await page.keyboard.press('Enter');
 await expect(page.getByTestId('progress')).toBeFocused();
 await rerender(page);await expect(page.getByTestId('progress')).toBeFocused();
 await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});
 // Una reparación completada deshabilita su control: el panel de origen es el destino disponible.
 await expect(page.locator('.repairs')).toBeFocused();
 await page.getByTestId('wait-5').focus();await page.keyboard.press('Enter');
 await page.keyboard.press('Tab');await rerender(page);await expect(page.getByTestId('confirm-action')).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.getByTestId('wait-5')).toBeFocused();
 await rerender(page);await expect(page.getByTestId('wait-5')).toBeFocused();
 await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:55');
});
test('REWORK riesgo: semántica, teclado, cancelar, confirmar y foco tras render',async({page})=>{
 await riskyPreparation(page);await page.getByTestId('launch').focus();await page.keyboard.press('Enter');
 await dialogKeyboard(page,'risk-warning','Riesgos detectados en la revisión','cancel-warning','launch-anyway');
 await page.keyboard.press('Enter');await expect(page.getByTestId('risk-warning')).toBeHidden();
 await expect(page.getByTestId('launch')).toBeFocused();await rerender(page);await expect(page.getByTestId('launch')).toBeFocused();
 await page.keyboard.press('Enter');await page.keyboard.press('Tab');await rerender(page);
 await expect(page.getByTestId('launch-anyway')).toBeFocused();await page.keyboard.press('Enter');
 await expect(page.getByTestId('risk-warning')).toBeHidden();await expect(page.getByTestId('launch-animation')).toBeFocused();
 await rerender(page);await expect(page.getByTestId('launch-animation')).toBeFocused();
 await expect(page.getByTestId('result')).toBeVisible({timeout:11000});await expect(page.getByTestId('restart')).toBeFocused();
});
