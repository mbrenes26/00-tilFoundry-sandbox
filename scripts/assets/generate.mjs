// Arte original de issue-6: raster entero, RGBA sin suavizado, PNG con zlib de Node.
import {writeFileSync,mkdirSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
const dir='public/assets/';mkdirSync(dir,{recursive:true});
const C={navy:'#101e35',wall:'#263951',steel:'#4d6679',light:'#90b3bb',white:'#e7efdf',cyan:'#54d9e2',orange:'#ed8842',yellow:'#f3cc62',green:'#71c991',red:'#b84c50',black:'#0a1326'};
function crc(b){let c=0xffffffff;for(const v of b){c^=v;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([n,t,data,c]);}
class Canvas {
 constructor(w,h){this.w=w;this.h=h;this.p=Buffer.alloc(w*h*4);}
 rect(x,y,w,h,c){const rgb=c.startsWith('#')?[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16),255]:c;for(let j=Math.max(0,y);j<Math.min(this.h,y+h);j++)for(let i=Math.max(0,x);i<Math.min(this.w,x+w);i++)for(let k=0;k<4;k++)this.p[(j*this.w+i)*4+k]=rgb[k];}
 line(x,y,x2,y2,c){const n=Math.max(Math.abs(x2-x),Math.abs(y2-y));for(let i=0;i<=n;i++)this.rect(Math.round(x+(x2-x)*i/(n||1)),Math.round(y+(y2-y)*i/(n||1)),1,1,c);}
 circle(x,y,r,c){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r)this.rect(x+i,y+j,1,1,c);}
 png(path){const header=Buffer.alloc(13);header.writeUInt32BE(this.w,0);header.writeUInt32BE(this.h,4);header[8]=8;header[9]=6;const scan=Buffer.alloc(this.h*(this.w*4+1));for(let y=0;y<this.h;y++)this.p.copy(scan,y*(this.w*4+1)+1,y*this.w*4,(y+1)*this.w*4);writeFileSync(dir+path,Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',deflateSync(scan)),chunk('IEND',Buffer.alloc(0))]));}
}
const assets={};function save(key,c,meta={}){const path=key+'.png';c.png(path);assets[key]={path,width:c.w,height:c.h,...meta};}
const rooms=new Canvas(384,192);const names=['design','control','weather','engineering','fuel','systems','storage','airlock','observation'],crops={};
for(let n=0;n<9;n++){
 const x=(n%3)*128,y=Math.floor(n/3)*64;const r=(a,b,w,h,c)=>rooms.rect(x+a,y+b,w,h,c),l=(a,b,a2,b2,c)=>rooms.line(x+a,y+b,x+a2,y+b2,c),circ=(a,b,rad,c)=>rooms.circle(x+a,y+b,rad,c);
 crops[names[n]]={x,y,width:128,height:64};r(0,0,128,64,C.black);r(2,2,124,58,C.wall);r(3,48,122,12,C.steel);for(let i=6;i<124;i+=14)r(i,50,1,8,C.wall);r(5,5,118,2,C.light);r(55,7,18,2,C.yellow);
 const desk=(a,b)=>{r(a,b,35,3,C.light);r(a+3,b+3,3,12,C.steel);r(a+29,b+3,3,12,C.steel);};
 const screen=(a,b,w=30,h=22)=>{r(a,b,w,h,C.black);r(a+2,b+2,w-4,h-4,C.navy);r(a+3,b+3,w-6,1,C.cyan);};
 if(n===0){screen(10,12,48,32);for(let j=17;j<39;j+=5)l(14,j,52,j,C.steel);for(let i=14;i<55;i+=6)l(i,17,i,40,C.steel);r(32,21,6,15,C.cyan);l(35,15,30,22,C.cyan);l(35,15,40,22,C.cyan);desk(72,35);screen(76,19,27,15);}
 if(n===1){screen(12,11,58,34);circ(36,29,11,C.cyan);circ(34,27,8,C.steel);r(32,20,7,4,C.green);r(35,28,8,6,C.green);for(let i=0;i<12;i++)rooms.rect(x+14+i*4,y+17+Math.round(i*i/15),1,1,C.yellow);desk(78,36);screen(79,20,27,15);}
 if(n===2){screen(9,12,55,31);r(17,24,29,10,C.cyan);r(25,19,13,16,C.cyan);l(67,35,106,35,C.white);l(88,17,88,42,C.light);l(88,17,107,25,C.orange);r(85,42,7,6,C.light);}
 if(n===3){r(9,12,40,24,C.navy);for(let i=15;i<47;i+=9){r(i,17,2,13,C.light);r(i-2,15,6,3,C.orange);}desk(59,36);r(64,26,22,10,C.orange);r(87,30,11,6,C.steel);r(105,16,7,28,C.yellow);r(101,26,15,3,C.steel);}
 if(n===4){for(let i=12;i<87;i+=25){r(i,16,19,31,C.steel);r(i+2,20,15,25,C.cyan);r(i+4,13,11,4,C.light);r(i+2,28,15,2,C.navy);}r(92,31,23,14,C.orange);l(98,18,98,31,C.light);l(65,46,106,46,C.orange);}
 if(n===5){for(let i=9;i<107;i+=25){r(i,12,20,34,C.black);for(let j=16;j<45;j+=7){r(i+2,j,16,5,C.steel);r(i+4,j+1,2,2,C.green);r(i+11,j+1,4,1,C.cyan);}}}
 if(n===6){for(let j=19;j<48;j+=14){r(8,j,53,2,C.light);r(11,j-10,14,10,C.orange);r(30,j-8,12,8,C.yellow);r(45,j-11,12,11,C.steel);}r(8,11,2,38,C.steel);r(60,11,2,38,C.steel);for(let i=77;i<110;i+=15){r(i,17,11,30,C.light);r(i+1,27,9,17,C.green);}}
 if(n===7){r(40,10,48,40,C.steel);r(43,13,42,35,C.black);r(46,16,16,29,C.wall);r(64,16,17,29,C.wall);r(59,27,3,7,C.cyan);r(65,27,3,7,C.cyan);for(let i=12;i<119;i+=10){r(i,49,5,3,C.yellow);r(i+5,49,5,3,C.black);}}
 if(n===8){r(9,12,107,32,C.black);r(12,15,101,26,C.navy);r(12,29,101,12,'#565774');for(let i=13;i<111;i+=3){const h=Math.round(8+6*Math.sin(i*.1));r(i,41-h,3,h,C.steel);}r(44,15,2,27,C.light);r(80,15,2,27,C.light);r(16,45,96,3,C.light);}
}
save('base-rooms',rooms,{crops});
const rocket=new Canvas(40,112);for(let y=3;y<20;y++){const w=Math.floor(y/2);rocket.rect(20-w,y,2*w,1,C.white);}rocket.rect(12,20,16,66,C.white);rocket.rect(12,27,16,6,C.orange);rocket.rect(12,70,16,12,C.orange);rocket.rect(15,44,10,12,C.navy);rocket.rect(17,46,6,7,C.cyan);for(const x of [3,30]){rocket.rect(x,45,7,50,C.white);rocket.rect(x,74,7,12,C.orange);rocket.rect(x+1,95,5,5,C.steel);}rocket.rect(11,83,18,14,C.steel);rocket.rect(14,97,12,7,C.black);save('rocket',rocket);
const tower=new Canvas(40,112);for(const x of [5,32])tower.rect(x,5,3,105,C.red);for(let y=8;y<110;y+=16){tower.rect(5,y,30,3,C.orange);tower.line(7,y,32,y+16,C.red);tower.line(32,y,7,y+16,C.red);}tower.rect(5,16,35,4,C.red);save('tower',tower);
const terrain=new Canvas(224,224);terrain.rect(0,0,224,224,C.navy);for(let y=24;y<160;y+=12)terrain.rect(0,y,224,12,['#28354e','#394359','#4d4c65','#63546a','#865b64','#ad7065','#ca8867','#dc9c72','#dbad7c','#af9677','#6d7972','#4d6666'][Math.floor((y-24)/12)]);terrain.circle(165,84,20,C.yellow);for(let x=0;x<224;x++){const h=Math.round(42+21*Math.sin(x*.041)+10*Math.sin(x*.093));terrain.rect(x,183-h,1,h,C.steel);terrain.rect(x,194-Math.round(16+11*Math.sin(x*.057)),1,45,C.wall);}terrain.rect(0,199,224,25,C.navy);terrain.rect(27,197,174,4,C.light);for(const x of [24,199]){terrain.rect(x,177,2,20,C.light);terrain.rect(x-5,175,12,3,C.yellow);terrain.line(x,178,x-10,194,C.steel);terrain.line(x,178,x+10,194,C.steel);}save('terrain',terrain);
for(const kind of ['technician','astronaut']){const c=new Canvas(64,24);for(let f=0;f<4;f++){const x=f*16,dy=f%2;const r=(a,b,w,h,color)=>c.rect(x+a,b,w,h,color);r(5,2+dy,7,7,kind==='astronaut'?C.white:C.yellow);r(6,4+dy,5,3,C.cyan);r(5,9+dy,7,8,kind==='astronaut'?C.white:C.orange);r(3,10+dy,2,7,C.steel);r(12,10+dy,2,f>=2?3:7,C.light);if(f>=2)r(13,8+dy,3,3,C.yellow);r(5,17,3,5,C.navy);r(9,17,3,5,C.navy);r(4,21,4,2,C.light);r(9,21,4,2,C.light);}save(kind,c,{frameWidth:16,frameHeight:24,frames:4,animations:{idle:[0,1],work:[2,3]}});}
for(const kind of ['smoke','flame']){const c=new Canvas(96,32);for(let f=0;f<3;f++){const x=f*32;if(kind==='smoke'){for(const [a,b,r] of [[9,22,6],[22,23,7],[15,15,8],[19,9,5]]){c.circle(x+a,b+f%2,r+f,C.steel);c.circle(x+a-2,b-2+f%2,r-2,C.light);}}else{for(let y=0;y<30;y++){const width=Math.max(1,Math.round((30-y)/4)+f%2);c.rect(x+16-width,y,width*2,1,C.orange);if(y<23)c.rect(x+14,y,4,1,C.yellow);}}}save(kind,c,{frameWidth:32,frameHeight:32,frames:3,animations:{burn:[0,1,2]}});}
const icons=new Canvas(96,16);for(let i=0;i<6;i++){const x=i*16;icons.rect(x+3,4,10,9,[C.yellow,C.orange,C.cyan,C.light,C.green,C.steel][i]);icons.rect(x+5,2,6,2,C.white);icons.rect(x+5,7,6,1,C.navy);}save('resource-icons',icons,{frameWidth:16,frameHeight:16,frames:6});
writeFileSync(dir+'manifest.json',JSON.stringify({version:1,author:'Arte original generado para issue-6 por TIL Foundry',assets},null,2)+'\n');
console.log('9 PNG originales y manifiesto Assets v1 generados.');
