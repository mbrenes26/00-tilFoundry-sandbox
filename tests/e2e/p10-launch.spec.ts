import {test,expect,type Page} from '@playwright/test';
// Regresión de los defectos observados en las capturas P10, con controles reales.
async function action(page:Page,id:string){await page.getByTestId(id).click();await page.getByTestId('confirm-action').click();await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});}
async function roomAction(page:Page,room:string,id:string){await page.getByTestId('room-'+room).click();await action(page,id);await page.getByTestId('close-panel').click();}
for(const width of [1600,1280])test(`P10 lanzamiento sin diagnóstico prematuro ni rótulo sobre trayectoria ${width}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.setViewportSize({width,height:width*9/16});await page.goto('http://127.0.0.1:4173');await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');
 await expect(page.locator('.platform-label')).toBeVisible();
 await roomAction(page,'design','design-balanced');await roomAction(page,'control','trajectory');await roomAction(page,'weather','weather');await action(page,'repair-pump');await action(page,'repair-antenna');await roomAction(page,'fuel','load');await action(page,'angle-confirm');await roomAction(page,'systems','verify');
 await page.getByTestId('launch').click();await expect(page.getByTestId('launch-animation')).toBeVisible();
 await expect.soft(page.locator('.launch-reasons')).not.toContainText('La partida terminó',{timeout:500});
 await expect.soft(page.locator('.launch-reasons')).not.toContainText('Combustible insuficiente',{timeout:500});
 await expect.soft(page.locator('.platform-label')).toBeHidden({timeout:500});
 await expect(page.getByTestId('score')).toHaveText('712 / 1.000',{timeout:11000});
 await page.getByTestId('restart').click();await expect(page.getByTestId('clock')).toHaveText('Día 1, 08:30');await expect(page.locator('.platform-label')).toBeVisible();await expect(page.locator('.launch-reasons')).toContainText('Bloqueos:');expect(errors).toEqual([]);
});
