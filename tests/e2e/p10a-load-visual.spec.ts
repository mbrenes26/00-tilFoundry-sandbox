import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

// Inspección visual focal independiente: solo carga; no altera reglas ni sprites.
test('P10a carga: dos instantes de trabajo y retorno idle por controles reales',async({page})=>{
 const dir='tests/e2e/p10a-load-visual-evidence';await mkdir(dir,{recursive:true});
 await page.setViewportSize({width:1600,height:900});
 await page.goto('http://127.0.0.1:4173');
 const open=async(id:string)=>{if(await page.getByTestId('close-panel').isVisible())await page.getByTestId('close-panel').click();await page.getByTestId('room-'+id).click();};
 for(const [room,action] of [['design','design-balanced'],['control','trajectory']]){await open(room);await page.getByTestId(action).click();await page.getByTestId('confirm-action').click();}
 await open('fuel');await page.getByTestId('load').click();await expect(page.getByTestId('confirmation')).toContainText('30.000');
 await page.getByTestId('confirm-action').click();await expect(page.getByTestId('progress')).toBeVisible();
 const observation=async()=>page.evaluate(()=>{const w=window as any;const s=w.__game.scene.getScene('BaseScene').characters[4];return {animation:s.anims.currentAnim?.key,frame:s.frame.name,playing:s.anims.isPlaying,progress:document.querySelector<HTMLElement>('[data-testid="progress"] .bar span')?.style.width,clock:document.querySelector('[data-testid="clock"]')?.textContent};});
 await page.waitForFunction(()=>{const w=window as any;return w.__game.scene.getScene('BaseScene').characters[4].frame.name===2;});
 const first=await observation();await page.screenshot({path:`${dir}/load-work-frame-2.png`});
 await page.waitForFunction(()=>{const w=window as any;return w.__game.scene.getScene('BaseScene').characters[4].frame.name===3;});
 const second=await observation();await page.screenshot({path:`${dir}/load-work-frame-3.png`});
 await expect(page.getByTestId('progress')).toBeHidden({timeout:5000});
 const idle=await observation();await page.screenshot({path:`${dir}/load-idle.png`});
 expect(first.animation).toBe('technician-work');expect(second.animation).toBe('technician-work');expect(first.frame).toBe(2);expect(second.frame).toBe(3);expect(idle.animation).toBe('technician-idle');expect([0,1]).toContain(idle.frame);
 await writeFile(`${dir}/observations.json`,JSON.stringify({first,second,idle},null,2));
 console.log(JSON.stringify({first,second,idle}));
});
