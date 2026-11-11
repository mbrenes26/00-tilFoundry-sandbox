/* Verificación adicional real con Chromium headless y su protocolo de depuración.
   Opcional para desarrollar: node tests/browser.cjs. No requerido para jugar. */
const {spawn} = require('node:child_process');
const {writeFileSync, mkdtempSync, rmSync} = require('node:fs');
const {tmpdir} = require('node:os');
const {resolve, join} = require('node:path');
const {pathToFileURL} = require('node:url');
const delay = ms => new Promise(r => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'nave-chromium-'));
const browser = spawn('chromium', ['--headless', '--no-sandbox', '--disable-background-networking', '--no-first-run', '--remote-debugging-port=9222', `--user-data-dir=${profile}`, 'about:blank'], {stdio: 'ignore'});
let socket, id = 0; const pending = new Map(), errors = [], external = [], local = new Set();
function assert(value, message) { if (!value) throw new Error(message); }
function send(method, params = {}) { return new Promise((resolve, reject) => { const n = ++id; pending.set(n, {resolve,reject}); socket.send(JSON.stringify({id:n,method,params})); }); }
async function evaluate(expression) { const r = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true}); assert(!r.exceptionDetails, JSON.stringify(r.exceptionDetails)); return r.result.value; }
async function navigate(file) { await send('Page.navigate', {url:pathToFileURL(resolve(file)).href}); await delay(450); }
async function key(type, key) { await send('Input.dispatchKeyEvent', {type, key, code:key.length === 1 ? `Key${key.toUpperCase()}` : key, windowsVirtualKeyCode:key === 'e' ? 69 : undefined}); }
async function hold(keyName, ms) { await key('keyDown',keyName); await delay(ms); await key('keyUp',keyName); await delay(40); }
async function position() { return evaluate('window.__position'); }
async function moveTo(x,y) {
  for (let i=0;i<8;i++) { const p = await position(); if (Math.abs(p.x-x)<=2 && Math.abs(p.y-y)<=2) return;
    if (Math.abs(p.x-x)>2) await hold(p.x<x?'d':'a', Math.max(15, Math.abs(p.x-x)/160*1000));
    const q=await position(); if (Math.abs(q.y-y)>2) await hold(q.y<y?'s':'w', Math.max(15, Math.abs(q.y-y)/160*1000));
  }
  const p=await position(); assert(Math.abs(p.x-x)<=4 && Math.abs(p.y-y)<=4, `recorrido no llegó ${JSON.stringify(p)}`);
}
async function capture(file) { const shot=await send('Page.captureScreenshot', {format:'png'}); writeFileSync(file, Buffer.from(shot.data,'base64')); console.log(`CAPTURA ${file}`); }
(async () => {
  let targets;
  for (let n=0;n<80;n++) { try { targets=await (await fetch('http://127.0.0.1:9222/json')).json(); if(targets.length) break; } catch {} await delay(100); }
  assert(targets?.length, 'Chromium no inició');
  socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  socket.addEventListener('message', event=>{const data=JSON.parse(event.data); if(data.id) {const p=pending.get(data.id); pending.delete(data.id); if(data.error)p.reject(new Error(JSON.stringify(data.error)));else p.resolve(data.result);}
    if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails);
    if(data.method==='Runtime.consoleAPICalled' && data.params.type==='error')errors.push(data.params);
    if(data.method==='Network.requestWillBeSent') {const url=data.params.request.url; if(/^https?:/.test(url))external.push(url); else local.add(url.split('/').pop());}
  });
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
  await navigate('tests/index.html');
  const results=await evaluate('testResults'); assert(results.length===12 && results.every(r=>r.ok), JSON.stringify(results)); console.log('PASS ejecutor HTML local offline: 12/12');
  await navigate('index.html');
  const data=await evaluate(`({url:location.protocol, resources:[...document.querySelectorAll('.resource')].map(e=>e.innerText.replace(/\\s+/g,' ').trim()), objectives:[...document.querySelectorAll('#objective-list li')].map(e=>e.textContent), bars:[...document.querySelectorAll('.bar-fill')].map(e=>e.getBoundingClientRect().width/e.parentElement.clientWidth), meters:[...document.querySelectorAll('[role=meter]')].map(e=>e.getAttribute('aria-valuenow')), icons:[...document.querySelectorAll('.resource-icon')].map(e=>e.textContent)})`);
  assert(data.url==='file:', 'no abrió file://'); assert(data.meters.join(',')==='85,70,60,90,75','porcentajes DOM');
  assert(data.objectives.join('|')==='Revisar los sistemas de la nave|Recoger muestras lunares|Preparar el despegue','objetivos DOM');
  const ratios=await evaluate(`[...document.querySelectorAll('.bar-fill')].map(e=>parseFloat(getComputedStyle(e).width)/(e.parentElement.clientWidth-2))`);
  ratios.forEach((r,i)=>assert(Math.abs(r-Number(data.meters[i])/100)<.01,'barra no proporcional'));
  assert(new Set(data.icons).size===5,'iconos DOM'); console.log('PASS C1/C3: file:// offline, recursos/iconos/barras y objetivos DOM exactos');
  // Instrumentar solo el navegador de prueba: identificar el rectángulo del traje en el canvas.
  await evaluate(`(() => {const ctx=document.getElementById('scene').getContext('2d'); const original=ctx.fillRect; ctx.fillRect=function(x,y,w,h){if(this.fillStyle==='#a0acc4' && w===14 && h===14)window.__position={x:x+7,y:y+5}; return original.call(this,x,y,w,h);};})()`); await delay(60);
  for(const size of [[1280,720],[1600,900]]) {
    await send('Emulation.setDeviceMetricsOverride',{width:size[0],height:size[1],deviceScaleFactor:1,mobile:false}); await delay(120);
    const layout=await evaluate(`(() => {const ids=['stage','scene','resources','objectives'];return {rects:ids.map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {id,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};}),scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],pixel:getComputedStyle(document.getElementById('scene')).imageRendering,viewport:[innerWidth,innerHeight]};})()`);
    for(const r of layout.rects)assert(r.x>=-.01&&r.y>=-.01&&r.right<=size[0]+.01&&r.bottom<=size[1]+.01,`panel recortado ${JSON.stringify(r)}`);
    assert(layout.scroll[0]===size[0]&&layout.scroll[1]===size[1],'scroll'); assert(layout.pixel==='pixelated','sin pixelated');
    const scene=layout.rects[1];assert(Math.abs(scene.width/scene.height-1200/675)<1e-8,'escala desigual');
    await capture(`tests/nave-${size[0]}x${size[1]}.png`); console.log(`PASS C2/C7 geometría DOM, sin scroll y escala uniforme ${size.join('x')} (captura no revisada visualmente)`);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false}); await delay(80);
  for(const [k,axis,sign] of [['ArrowLeft','x',-1],['a','x',-1],['ArrowRight','x',1],['d','x',1],['ArrowUp','y',-1],['w','y',-1],['ArrowDown','y',1],['s','y',1]]) {
    await moveTo(468,366); const before=await position(); await hold(k,100); const after=await position(); assert((after[axis]-before[axis])*sign>=8,`tecla ${k}`);
    await delay(100); assert(JSON.stringify(await position())===JSON.stringify(after),`soltar ${k}`);
  }
  await moveTo(468,366); await key('keyDown','d'); await delay(70); await evaluate('window.dispatchEvent(new Event("blur"))'); await delay(60); const stopped=await position(); await delay(120); assert(JSON.stringify(await position())===JSON.stringify(stopped),'blur no detiene'); await key('keyUp','d');
  assert(await evaluate('scrollX===0 && scrollY===0'),'flechas desplazan página'); console.log('PASS C4: ocho controles mantenidos, soltar, blur sintético y sin scroll en Chromium');
  for(const [keys,x,y] of [[['a','w'],70,336],[['a','s'],70,396],[['d','w'],866,336],[['d','s'],866,396]]) {
    for(const k of keys)await key('keyDown',k);await delay(7400);for(const k of keys)await key('keyUp',k);await delay(40); const p=await position();assert(p.x===x&&p.y===y,`esquina ${JSON.stringify(p)}`);
  }
  console.log('PASS C5: cuatro esquinas con teclas mantenidas, límites del cuerpo 20x28');
  for(const door of await evaluate('NaveGame.doors')) {
    await moveTo(door.x,door.y===322?336:396);await key('keyDown','e');await key('keyUp','e');await delay(60);
    assert(await evaluate('document.getElementById("message").textContent')===door.name,`puerta ${door.name}`);
    assert(await evaluate('!document.getElementById("message").hidden'),'mensaje oculto');console.log(`PASS C6 puerta mediante controles: ${door.name}`);
  }
  await moveTo(600,366); assert(await evaluate('document.getElementById("message").hidden'),'salida no oculta');await key('keyDown','e');await key('keyUp','e');await delay(30);assert(await evaluate('document.getElementById("message").hidden'),'E lejana activa');
  assert(await evaluate(`JSON.stringify([...document.querySelectorAll('.resource')].map(e=>e.innerText.replace(/\\s+/g,' ').trim()))` )===JSON.stringify(data.resources),'recursos cambiaron');
  assert(errors.length===0,`errores consola ${JSON.stringify(errors)}`);assert(external.length===0,`red externa ${JSON.stringify(external)}`);
  console.log(`PASS consola sin errores y 0 solicitudes externas necesarias; archivos locales: ${[...local].join(', ')}`);
  console.log('Navegador: '+(await send('Browser.getVersion')).product+'; CSS 1280x720 y 1600x900, DPR 1. Revisión visual y control manual humano pendientes.');
})().catch(e=>{console.error('FAIL',e.stack);process.exitCode=1;}).finally(async()=>{if(socket)socket.close();browser.kill();await delay(200);rmSync(profile,{recursive:true,force:true});});
