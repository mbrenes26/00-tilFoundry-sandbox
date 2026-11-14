// Montaje de tres capturas existentes: no toma capturas nuevas ni ejecuta el juego.
import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const root='tests/e2e/p10a-evidence';
const images=await Promise.all(['pump-work-a.png','pump-work-b.png','pump-idle.png'].map(async name=>({name,src:'data:image/png;base64,'+(await readFile(`${root}/${name}`)).toString('base64')})));
const browser=await chromium.launch();
try{const page=await browser.newPage();const png=await page.evaluate(async images=>{const c=document.createElement('canvas');c.width=900;c.height=210;const ctx=c.getContext('2d');ctx.fillStyle='#0a1326';ctx.fillRect(0,0,900,210);ctx.font='16px monospace';ctx.fillStyle='white';for(let i=0;i<images.length;i++){const img=new Image();img.src=images[i].src;await img.decode();ctx.drawImage(img,285,340,270,145,i*300,30,270,145);ctx.fillText(images[i].name,i*300+8,20);}return c.toDataURL('image/png').split(',')[1];},images);await writeFile(`${root}/pump-sequence.png`,Buffer.from(png,'base64'));}finally{await browser.close();}
