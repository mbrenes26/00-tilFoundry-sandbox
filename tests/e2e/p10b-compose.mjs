// Montaje de capturas existentes, sin ejecutar el juego ni tomar nuevas capturas.
import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const root='tests/e2e/p10b-evidence/final';
const images=[];
for(const width of [1600,1280]){
 const evidence=JSON.parse(await readFile(`${root}/success-${width}.json`,'utf8'));
 for(const label of ['ignition-a','ignition-b']){const capture=evidence.captures.find(c=>c.label===label);images.push({label:`${width}: ${label} ${Math.round(capture.before.ms)}–${Math.round(capture.after.ms)} ms`,src:'data:image/png;base64,'+(await readFile(`${root}/success-${width}-${label}.png`)).toString('base64')});}
}
const browser=await chromium.launch();
try{const page=await browser.newPage();const png=await page.evaluate(async images=>{
 const c=document.createElement('canvas');c.width=960;c.height=930;const ctx=c.getContext('2d');ctx.fillStyle='#0a1326';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='white';ctx.font='17px monospace';ctx.imageSmoothingEnabled=false;
 for(let i=0;i<images.length;i++){const img=new Image();img.src=images[i].src;await img.decode();const x=i%2*480,y=Math.floor(i/2)*510;ctx.fillText(images[i].label,x+8,y+22);ctx.drawImage(img,x,y+30);}
 return c.toDataURL('image/png').split(',')[1];
},images);await writeFile(`${root}/ignition-sequence.png`,Buffer.from(png,'base64'));}finally{await browser.close();}
