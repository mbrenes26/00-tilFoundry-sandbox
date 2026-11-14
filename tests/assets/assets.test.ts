import {it,expect} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {resolve,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';

// Pruebas originales conservadas; P5 añade comprobaciones independientes debajo.
it('A1 manifiesto v1, PNG reales y recortes válidos',()=>{const m=JSON.parse(readFileSync('public/assets/manifest.json','utf8'));expect(m.version).toBe(1);for(const key of ['base-rooms','rocket','tower','terrain','technician','astronaut','smoke','flame','resource-icons']){const a=m.assets[key];expect(a).toBeTruthy();expect(a.path).toMatch(/^[\w-]+\.png$/);const png=readFileSync('public/assets/'+a.path);expect(png.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');expect(png.readUInt32BE(16)).toBe(a.width);expect(png.readUInt32BE(20)).toBe(a.height);const chunks:Buffer[]=[];for(let p=8;p<png.length;){const n=png.readUInt32BE(p),t=png.toString('ascii',p+4,p+8);if(t==='IDAT')chunks.push(png.subarray(p+8,p+8+n));p+=n+12;}expect(inflateSync(Buffer.concat(chunks)).length).toBe(a.height*(1+a.width*4));for(const f of Object.values(a.crops??{}) as any[]){expect(f.x+f.width).toBeLessThanOrEqual(a.width);expect(f.y+f.height).toBeLessThanOrEqual(a.height);}}expect(Object.keys(m.assets['base-rooms'].crops)).toHaveLength(9);});
it('A3 sprites animables e inventario original',()=>{const m=JSON.parse(readFileSync('public/assets/manifest.json','utf8'));for(const k of ['technician','astronaut']){const a=m.assets[k];expect(a.animations.idle.length).toBeGreaterThanOrEqual(2);expect(a.animations.work.length).toBeGreaterThanOrEqual(2);expect(a.width).toBe(a.frameWidth*a.frames);for(const frames of Object.values(a.animations) as number[][])for(const f of frames)expect(f).toBeLessThan(a.frames);}for(const k of ['smoke','flame'])expect(m.assets[k].frames).toBeGreaterThanOrEqual(3);expect(existsSync('scripts/assets/generate.mjs')).toBe(true);expect(readFileSync('docs/assets.md','utf8')).toContain('original');});

interface Crop {x:number; y:number; width:number; height:number}
interface Asset {
  path:string; width:number; height:number;
  crops?:Record<string,Crop>;
  frameWidth?:number; frameHeight?:number; frames?:number;
  animations?:Record<string,number[]>;
}
const keys=['base-rooms','rocket','tower','terrain','technician','astronaut','smoke','flame','resource-icons'];
const roomKeys=['design','control','weather','engineering','fuel','systems','storage','airlock','observation'];
const manifest=JSON.parse(readFileSync('public/assets/manifest.json','utf8')) as {version:number; author:string; assets:Record<string,Asset>};
const check=(condition:boolean,message:string):void=>{if(!condition)throw new Error(message);};
function localPath(path:string):string {
  check(typeof path==='string' && /^[\w-]+\.png$/.test(path),'ruta PNG local');
  const root=resolve('public/assets'),file=resolve(root,path),rel=relative(root,file);
  check(!isAbsolute(rel) && !rel.startsWith('..'),'ruta fuera del inventario');
  return file;
}
function validateGeometry(a:Asset):void {
  const positive=(value:number|undefined)=>check(typeof value==='number' && Number.isInteger(value) && value>0,'dimensión entera positiva');
  const coordinate=(value:number)=>check(Number.isInteger(value) && value>=0,'coordenada entera no negativa');
  positive(a.width);positive(a.height);
  for(const crop of Object.values(a.crops??{})) {
    coordinate(crop.x);coordinate(crop.y);positive(crop.width);positive(crop.height);
    check(crop.x+crop.width<=a.width && crop.y+crop.height<=a.height,'recorte fuera de PNG');
  }
  if(a.frames!==undefined || a.frameWidth!==undefined || a.frameHeight!==undefined || a.animations!==undefined) {
    positive(a.frames);positive(a.frameWidth);positive(a.frameHeight);
    // Todos los spritesheets actuales son una fila, según manifiesto/generador/docs.
    // Es validación del inventario actual, no una nueva restricción de Assets v1.
    check(a.width===a.frameWidth!*a.frames!,'ancho spritesheet');
    check(a.height===a.frameHeight,'alto spritesheet');
    for(const frames of Object.values(a.animations??{}))for(const frame of frames) {
      check(Number.isInteger(frame) && frame>=0 && frame<a.frames!,'índice entero dentro de frames');
    }
  }
}

function crc32(bytes:Buffer):number {
  let crc=0xffffffff;
  for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return (crc^0xffffffff)>>>0;
}
// Decodificador independiente del generador: perfil PNG RGBA8 no entrelazado
// del inventario, CRC de cada chunk y reconstrucción de filtros PNG 0–4.
function decodePng(png:Buffer):{width:number;height:number;pixels:Buffer} {
  check(png.subarray(0,8).toString('hex')==='89504e470d0a1a0a','firma PNG');
  const idat:Buffer[]=[];
  let width=0,height=0,pos=8,ended=false,header=false;
  while(pos<png.length) {
    check(pos+12<=png.length,'chunk truncado');
    const size=png.readUInt32BE(pos),end=pos+12+size;
    check(end<=png.length,'datos truncados');
    const type=png.toString('ascii',pos+4,pos+8),data=png.subarray(pos+8,end-4);
    check(crc32(png.subarray(pos+4,end-4))===png.readUInt32BE(end-4),'CRC PNG');
    if(!header)check(type==='IHDR','IHDR inicial');
    if(type==='IHDR') {
      check(!header && size===13,'IHDR único de 13 bytes');header=true;
      width=data.readUInt32BE(0);height=data.readUInt32BE(4);
      check(width>0 && height>0 && width*height<=1_000_000,'dimensiones PNG acotadas');
      check(data[8]===8 && data[9]===6 && data[10]===0 && data[11]===0 && data[12]===0,'perfil RGBA8 no entrelazado');
    } else if(type==='IDAT')idat.push(data);
    else if(type==='IEND') {check(size===0 && end===png.length,'IEND final');ended=true;pos=end;break;}
    else check((png[pos+4]&32)!==0,'chunk crítico desconocido');
    pos=end;
  }
  check(header && ended && idat.length>0,'PNG completo');
  const stride=width*4,scan=inflateSync(Buffer.concat(idat),{maxOutputLength:height*(stride+1)});
  check(scan.length===height*(stride+1),'longitud scanlines');
  const pixels=Buffer.alloc(width*height*4);
  for(let y=0;y<height;y++) {
    const filter=scan[y*(stride+1)];check(filter<=4,'filtro PNG');
    for(let x=0;x<stride;x++) {
      const at=y*stride+x,left=x>=4?pixels[at-4]:0,up=y>0?pixels[at-stride]:0,ul=y>0&&x>=4?pixels[at-stride-4]:0;
      const p=left+up-ul,pa=Math.abs(p-left),pb=Math.abs(p-up),pc=Math.abs(p-ul);
      const predictor=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):pa<=pb&&pa<=pc?left:pb<=pc?up:ul;
      pixels[at]=(scan[y*(stride+1)+1+x]+predictor)&255;
    }
  }
  return {width,height,pixels};
}
function cropPixels(image:ReturnType<typeof decodePng>,crop:Crop):Buffer {
  const result=Buffer.alloc(crop.width*crop.height*4);
  for(let y=0;y<crop.height;y++)image.pixels.copy(result,y*crop.width*4,((crop.y+y)*image.width+crop.x)*4,((crop.y+y)*image.width+crop.x+crop.width)*4);
  return result;
}
const digest=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');

it('P5 A1 contrato mínimo y nueve claves exactas de salas',()=>{
  expect(manifest.version).toBe(1);
  for(const key of keys)expect(manifest.assets).toHaveProperty(key);
  expect(Object.keys(manifest.assets['base-rooms'].crops!).sort()).toEqual([...roomKeys].sort());
});
it.each(Object.keys(manifest.assets))('P5 A1 PNG local %s: CRC, decodificación RGBA, tamaño y geometría',key=>{
  const a=manifest.assets[key];validateGeometry(a);
  const image=decodePng(readFileSync(localPath(a.path)));
  expect([image.width,image.height]).toEqual([a.width,a.height]);
  expect(image.pixels.length).toBe(a.width*a.height*4);
});
it('P5 A1 nueve fondos con recortes y datos RGBA distintos',()=>{
  const a=manifest.assets['base-rooms'];validateGeometry(a);
  const image=decodePng(readFileSync(localPath(a.path)));
  const crops=roomKeys.map(key=>a.crops![key]);
  expect(new Set(crops.map(c=>JSON.stringify(c))).size).toBe(9);
  expect(new Set(crops.map(c=>digest(cropPixels(image,c)))).size).toBe(9);
});
it.each(['technician','astronaut','smoke','flame','resource-icons'])('P5 A3 geometría y contenido de todos los frames: %s',key=>{
  const a=manifest.assets[key];validateGeometry(a);
  expect(a.frames).toBeGreaterThanOrEqual(key==='resource-icons'?6:key==='smoke'||key==='flame'?3:4);
  const image=decodePng(readFileSync(localPath(a.path)));
  const hashes=[];
  for(let frame=0;frame<a.frames!;frame++) {
    const pixels=cropPixels(image,{x:frame*a.frameWidth!,y:0,width:a.frameWidth!,height:a.frameHeight!});
    expect(pixels.some((byte,index)=>index%4===3 && byte>0)).toBe(true);
    hashes.push(digest(pixels));
  }
  // Un ciclo puede repetir su primer frame al cerrar (flame 0 y 2).
  // Assets v1 exige tres frames, no tres dibujos únicos.
  expect(new Set(hashes).size).toBeGreaterThanOrEqual(2);
  for(const name of key==='technician'||key==='astronaut'?['idle','work']:key==='smoke'||key==='flame'?['burn']:[]) {
    const frames=a.animations![name];expect(frames.length).toBeGreaterThanOrEqual(name==='burn'?3:2);
    expect(new Set(frames).size).toBeGreaterThanOrEqual(name==='burn'?3:2);
  }
});

const invalidGeometry:Array<[string,(a:Asset)=>void,string]>=[
  ['ancho cero',a=>{a.width=0;},'dimensión'],
  ['alto negativo',a=>{a.height=-1;},'dimensión'],
  ['ancho fraccionario',a=>{a.width=64.5;},'dimensión'],
  ['alto no finito',a=>{a.height=Infinity;},'dimensión'],
  ['recorte x negativo',a=>{a.crops!.sample.x=-1;},'coordenada'],
  ['recorte y negativo',a=>{a.crops!.sample.y=-1;},'coordenada'],
  ['recorte x fraccionario',a=>{a.crops!.sample.x=0.5;},'coordenada'],
  ['recorte ancho cero',a=>{a.crops!.sample.width=0;},'dimensión'],
  ['recorte alto negativo',a=>{a.crops!.sample.height=-1;},'dimensión'],
  ['recorte alto fraccionario',a=>{a.crops!.sample.height=1.5;},'dimensión'],
  ['recorte desborda ancho',a=>{a.crops!.sample.x=64;},'recorte'],
  ['recorte desborda alto',a=>{a.crops!.sample.y=24;},'recorte'],
  ['frameWidth cero',a=>{a.frameWidth=0;},'dimensión'],
  ['frameHeight cero',a=>{a.frameHeight=0;},'dimensión'],
  ['frameHeight negativo',a=>{a.frameHeight=-24;},'dimensión'],
  ['frameWidth fraccionario',a=>{a.frameWidth=16.5;},'dimensión'],
  ['frameHeight fraccionario',a=>{a.frameHeight=24.5;},'dimensión'],
  ['frames cero',a=>{a.frames=0;},'dimensión'],
  ['frames fraccionarios',a=>{a.frames=4.5;},'dimensión'],
  ['frames negativos',a=>{a.frames=-1;},'dimensión'],
  ['frameWidth ausente',a=>{delete a.frameWidth;},'dimensión'],
  ['frames ausentes',a=>{delete a.frames;},'dimensión'],
  ['alto de sheet distinto',a=>{a.height=25;},'alto spritesheet'],
  ['ancho de sheet distinto',a=>{a.width=65;},'ancho spritesheet'],
  ['índice negativo',a=>{a.animations!.idle=[-1,1];},'índice'],
  ['índice fraccionario',a=>{a.animations!.work=[2.5,3];},'índice'],
  ['índice no finito',a=>{a.animations!.idle=[NaN,1];},'índice'],
  ['índice igual a frames',a=>{a.animations!.work=[2,4];},'índice'],
  ['índice mayor a frames',a=>{a.animations!.work=[2,5];},'índice']
];
it.each(invalidGeometry)('P5 validador rechaza fixture en memoria: %s',(name,mutate,reason)=>{
  const a:Asset={...structuredClone(manifest.assets.technician),crops:{sample:{x:0,y:0,width:16,height:24}}};
  mutate(a);expect(()=>validateGeometry(a)).toThrow(reason);
});
it('P5 límites válidos: recorte completo e índices primero/último',()=>{
  const a=structuredClone(manifest.assets.technician);
  a.crops={full:{x:0,y:0,width:a.width,height:a.height}};a.animations={edge:[0,a.frames!-1]};
  expect(()=>validateGeometry(a)).not.toThrow();
});
it.each(['../rocket.png','/rocket.png','https://example.org/a.png','//example.org/a.png','data:image/png;base64,AA','a\\b.png','a.png?x=1','%2e%2e/a.png'])('P5 rutas inválidas en memoria: %s',path=>{
  expect(()=>localPath(path)).toThrow('ruta PNG local');
});
it.each(['truncado','CRC alterado','firma alterada'])('P5 decodificador rechaza PNG en memoria: %s',kind=>{
  const original=readFileSync(localPath(manifest.assets.rocket.path)),png=Buffer.from(original);
  if(kind==='truncado')expect(()=>decodePng(png.subarray(0,png.length-1))).toThrow('truncado');
  else {png[kind==='CRC alterado'?29:0]^=1;expect(()=>decodePng(png)).toThrow(kind==='CRC alterado'?'CRC':'firma');}
  expect(readFileSync(localPath(manifest.assets.rocket.path))).toEqual(original);
});
it('P5 A3 documentación: inventario dimensional, animaciones y procedencia declarada',()=>{
  const doc=readFileSync('docs/assets.md','utf8');
  for(const [key,a] of Object.entries(manifest.assets)) {
    const row=doc.split('\n').find(line=>line.startsWith(`| ${key} |`));expect(row).toBeDefined();
    expect(row).toContain(`${a.width}×${a.height}`);
    if(a.frames!==undefined)expect(row).toContain(`${a.frames} frames ${a.frameWidth}×${a.frameHeight}`);
    for(const [name,frames] of Object.entries(a.animations??{}))expect(row).toContain(`${name} [${frames.join(',')}]`);
  }
  expect(doc).toContain('nueve recortes 128×64, mapa `crops`');
  expect(doc).toContain('Autoría: constructor TIL Foundry de issue-6.');
  expect(manifest.author).toBe('Arte original generado para issue-6 por TIL Foundry');
  expect(doc).toContain('sin imágenes, fuentes ni bibliotecas gráficas de terceros');
  expect(doc).toContain('No se ha inspeccionado el mockup adjunto; se siguió la descripción textual aprobada.');
  for(const text of ['scripts/assets/generate.mjs','npm run assets','Node.js 22','Buffer, zlib','coordenadas enteras, RGBA 8 bits','No hay interpolación ni suavizado'])expect(doc).toContain(text);
  const generator=readFileSync('scripts/assets/generate.mjs','utf8');
  expect(generator).toContain("from 'node:fs'");expect(generator).toContain("from 'node:zlib'");
  expect(generator).toContain("save('base-rooms',rooms,{crops})");
  expect(generator).toContain('rect(x,y,w,h,c)');expect(generator).toContain('circle(x,y,r,c)');
  expect(generator).toContain('line(x,y,x2,y2,c)');expect(generator).toContain('header[8]=8;header[9]=6');
  // Evidencia de contenido documental y revisión del procedimiento; no prueba jurídica ni ejecución del generador.
});
