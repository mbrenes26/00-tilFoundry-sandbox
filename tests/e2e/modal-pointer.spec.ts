import {test,expect,type Page} from '@playwright/test';

async function action(page:Page,id:string){
 await page.getByTestId(id).click();await page.getByTestId('confirm-action').click();
 await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});
}
async function roomAction(page:Page,room:string,id:string){
 await page.getByTestId('room-'+room).click();await action(page,id);await page.getByTestId('close-panel').click();
}
async function snapshot(page:Page){
 return page.evaluate(()=>{
  const scene=(window as any).__game.scene.getScene('UIScene');
  return {pending:scene.pending,room:scene.room,draft:scene.draft,chosen:scene.chosen,
   background:Array.from(document.querySelector('.game-ui')!.children)
    .filter(el=>el.getAttribute('role')!=='dialog').map(el=>el.textContent),
   dialog:document.querySelector('[role=dialog]')?.textContent};
 });
}
async function backgroundClicks(page:Page,dialog:string){
 const before=await snapshot(page);
 for(const id of ['wait-5','wait-20','repair-antenna','angle-plus','room-weather','launch']){
  const box=await page.getByTestId(id).boundingBox();expect(box).not.toBeNull();
  const modal=await page.getByTestId(dialog).boundingBox();expect(modal).not.toBeNull();
  const x=box!.x+box!.width/2,y=box!.y+box!.height/2;
  // Reproduce un clic físico fuera del diálogo, no una llamada a las reglas.
  expect(x<modal!.x||x>modal!.x+modal!.width||y<modal!.y||y>modal!.y+modal!.height).toBe(true);
  await page.mouse.click(x,y);expect(await snapshot(page)).toEqual(before);
 }
 // También se protege el manejador delegado ante activación DOM de un control de fondo.
 await page.getByTestId('wait-5').dispatchEvent('click');expect(await snapshot(page)).toEqual(before);
}
for(const width of [1600,1280]){
 test(`REWORK puntero confirmación bloquea fondo y conserva reparación ${width}`,async({page})=>{
  await page.setViewportSize({width,height:width*9/16});await page.goto('http://127.0.0.1:4173');
  await page.getByTestId('repair-pump').click();await backgroundClicks(page,'confirmation');
  await page.getByTestId('confirm-action').click();await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});
  await expect(page.getByTestId('repair-pump')).toBeDisabled();await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:50');
  await page.getByTestId('wait-5').click();await page.getByTestId('cancel-action').click();
  await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:50');
  await action(page,'wait-5');await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:55');
 });
 test(`REWORK puntero aviso bloquea fondo y libera acciones al cancelar ${width}`,async({page})=>{
  await page.setViewportSize({width,height:width*9/16});await page.goto('http://127.0.0.1:4173');
  await roomAction(page,'design','design-balanced');await roomAction(page,'control','trajectory');
  await roomAction(page,'weather','weather');await action(page,'repair-pump');
  await roomAction(page,'fuel','load');await action(page,'angle-confirm');await roomAction(page,'systems','verify');
  await page.getByTestId('launch').click();await backgroundClicks(page,'risk-warning');
  await page.getByTestId('cancel-warning').click();await expect(page.getByTestId('risk-warning')).toBeHidden();
  await action(page,'wait-20');await expect(page.getByTestId('clock')).toHaveText('Día 1, 10:20');
  await page.getByTestId('launch').click();await expect(page.getByTestId('risk-warning')).toContainText('68 %');
  await page.getByTestId('launch-anyway').click();await expect(page.getByTestId('result')).toBeVisible({timeout:11000});
  await expect(page.getByTestId('result')).toContainText('68 %');
 });
}
