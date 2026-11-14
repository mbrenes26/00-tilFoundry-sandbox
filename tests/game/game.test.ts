import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {Session} from '../../src/game/Session';
it('J3 tarea exclusiva, rechazo y exactamente una transición',()=>{const g=new Session();const original=g.state;expect(g.begin({type:'load'}).allowed).toBe(false);expect(g.state).toBe(original);const t=g.begin({type:'repair',system:'pump'});expect(t.allowed).toBe(true);expect(g.busy).toBe(true);expect(g.begin({type:'repair',system:'antenna'}).allowed).toBe(false);g.complete(t.token);g.complete(t.token);expect(g.state.minute).toBe(530);expect(g.state.inventory.parts).toBe(40);});
it('J4 aviso actual, cancelar, invalidación y omitir revisión',()=>{const g=new Session();for(const a of [{type:'design',profile:'balanced'},{type:'trajectory'},{type:'repair',system:'pump'},{type:'load'},{type:'wait',minutes:20},{type:'verify'}] as any[]) {const p=g.begin(a);g.complete(p.token);}expect(g.state.minute).toBe(610);expect(g.requestLaunch()).toBe('warning');const s=g.state;g.cancelWarning();expect(g.state).toBe(s);expect(g.requestLaunch()).toBe('warning');const p=g.begin({type:'wait',minutes:5});g.complete(p.token);expect(g.confirmLaunch()).toBe(false);expect(g.requestLaunch()).toBe('warning');expect(g.confirmLaunch()).toBe(true);expect(g.state.result?.causes.map(x=>x.code)).toEqual(['antenna']);});
it('J5 reinicio invalida callbacks y avisos',()=>{const g=new Session();const p=g.begin({type:'repair',system:'pump'});g.reset();g.complete(p.token);expect(g.state.minute).toBe(510);expect(g.busy).toBe(false);expect(g.state.budget).toBe(1000000);expect(g.confirmLaunch()).toBe(false);});
it('J1/J6 configuración, cinco escenas reales y timers Phaser',()=>{const main=readFileSync('src/main.ts','utf8');expect(main).toContain('pixelArt: true');expect(main).toContain('Phaser.Scale.FIT');expect(main).toContain('width: 1600');expect(main).toContain('height: 900');const code=readFileSync('src/game/scenes.ts','utf8');for(const name of ['BootScene','BaseScene','UIScene','LaunchScene','ResultScene'])expect(code).toContain(`class ${name} extends Phaser.Scene`);expect(code).toContain('this.anims');expect(code).toContain('this.tweens');expect(code).toContain('this.time');expect(code).not.toContain('setInterval');});
it('J7 documentación de HTTP, comandos, fórmula, fases y exclusiones',()=>{const doc=readFileSync('README.md','utf8');for(const word of ['Node.js 22','npm ci','npm run dev','npm run build','npm run preview','npm test','npm run test:e2e','HTTP','riesgos','orientativas','floor','docs/assets.md','10–15','pendiente','backend'])expect(doc).toContain(word);});
it('J1 servidores locales limitados a loopback y Chromium usa la misma dirección',()=>{
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 for(const name of ['dev','preview']){
  expect(pkg.scripts[name]).toContain('--host 127.0.0.1');
  expect(pkg.scripts[name]).not.toContain('0.0.0.0');
 }
 const config=readFileSync('playwright.config.ts','utf8');
 expect(config).toContain('http://127.0.0.1:4173');
});


// P4: Session real + API real. No dobles del motor, DOM, Phaser o temporizadores.
import {createInitialState,evaluateLaunch,getScore,type Action} from '../../src/rules';
const sessionActions=(options:{pump?:boolean;antenna?:boolean;angle?:number;verify?:boolean;weather?:boolean;confirmAngle?:boolean;loadFirst?:boolean}={}):Action[]=>{
 const actions:Action[]=[{type:'design',profile:'balanced'},{type:'trajectory'}];
 if(options.weather!==false)actions.push({type:'weather'});
 if(options.loadFirst)actions.push({type:'load'});
 if(options.pump!==false)actions.push({type:'repair',system:'pump'});
 if(options.antenna!==false)actions.push({type:'repair',system:'antenna'});
 if(!options.loadFirst)actions.push({type:'load'});
 if(options.confirmAngle!==false)actions.push({type:'angle',angle:options.angle??72});
 if(options.verify!==false)actions.push({type:'verify'});
 return actions;
};
function runSession(g:Session,actions:Action[]){
 for(const action of actions){const p=g.begin(action);expect(p.allowed).toBe(true);expect(g.complete(p.token)).toBe(true);expect(g.complete(p.token)).toBe(false);}
}
const sessionRefs=[
 {name:'1 ganadora',options:{},waits:[],minute:620,risks:[],path:'launched',score:712},
 {name:'2 ángulo',options:{angle:80},waits:[],minute:620,risks:['angle'],path:'warning',score:0},
 {name:'3 bomba',options:{pump:false},waits:[],minute:610,risks:['pump'],path:'warning',score:0},
 {name:'4 antena',options:{antenna:false},waits:[],minute:600,risks:['antenna'],path:'warning',score:0},
 {name:'5 clima',options:{},waits:[20],minute:640,risks:['weather'],path:'warning',score:0},
 {name:'6 tiempo',options:{},waits:[20,20,20],minute:680,risks:['time'],path:'blocked',score:0},
 {name:'7 omitir revisión con fallo',options:{antenna:false,verify:false},waits:[10],minute:600,risks:['antenna'],path:'launched',score:0},
 {name:'7 omitir revisión con éxito',options:{verify:false},waits:[],minute:610,risks:[],path:'launched',score:758},
 {name:'8 múltiples riesgos',options:{antenna:false,angle:90},waits:[],minute:600,risks:['angle','antenna','fuel'],path:'warning',score:0},
 {name:'9 cargar primero',options:{loadFirst:true},waits:[],minute:630,risks:[],path:'launched',score:671}
] as const;
it.each(sessionRefs)('P4 R5 Session referencia $name y reset terminal exacto',ref=>{
 const g=new Session();runSession(g,sessionActions(ref.options));
 runSession(g,ref.waits.map(minutes=>({type:'wait',minutes})));
 expect(g.state.minute).toBe(ref.minute);
 const before=g.state,snapshot=structuredClone(before);
 expect(g.requestLaunch()).toBe(ref.path);
 if(ref.path==='warning'){
  expect(g.state).toBe(before);expect(g.state).toEqual(snapshot);expect(g.warning).toBe(true);
  expect(evaluateLaunch(g.state).risks.map(r=>r.code)).toEqual(ref.risks);
  g.cancelWarning();expect(g.warning).toBe(false);expect(g.state).toBe(before);expect(g.state).toEqual(snapshot);expect(g.confirmLaunch()).toBe(false);
  expect(g.requestLaunch()).toBe('warning');expect(g.confirmLaunch()).toBe(true);expect(g.confirmLaunch()).toBe(false);
 }
 expect(g.state.result?.causes.map(r=>r.code)).toEqual(ref.risks);
 expect(g.state.result?.outcome).toBe(ref.score?'success':'failure');expect(g.state.launched).toBe(ref.path!=='blocked');
 expect(getScore(g.state).total).toBe(ref.score);expect(g.warning).toBe(false);expect(g.busy).toBe(false);
 if(ref.name==='7 omitir revisión con éxito')expect(getScore(g.state)).toMatchObject({budget:260,parts:140,time:208,precision:150,total:758});
 const terminal=g.state,score=getScore(terminal);expect(g.requestLaunch()).toBe('blocked');expect(g.state).toBe(terminal);expect(getScore(g.state)).toEqual(score);
 g.reset();expect(g.state).toEqual(createInitialState());expect(g.state).not.toBe(terminal);
 for(const key of ['inventory','cargo','repairs'] as const)expect(g.state[key]).not.toBe(terminal[key]);
 expect(g.warning).toBe(false);expect(g.busy).toBe(false);expect(g.confirmLaunch()).toBe(false);expect(getScore(g.state).metrics.minute).toBe(510);
 // La nueva partida también funciona, no conserva resultado ni puntaje previo.
 runSession(g,[{type:'repair',system:'pump'}]);expect(g.state.minute).toBe(530);expect(g.state.result).toBeNull();
});
it.each([false,true])('P4 R5 sin riesgos no hay aviso con revisión %s',verify=>{
 const g=new Session();runSession(g,sessionActions({verify}));expect(evaluateLaunch(g.state).risks).toEqual([]);
 expect(g.requestLaunch()).toBe('launched');expect(g.warning).toBe(false);expect(g.confirmLaunch()).toBe(false);expect(g.state.result?.outcome).toBe('success');
});
it('P4 R4/R5 omitir clima y confirmación del ángulo inicial y revisión no inventa aviso',()=>{
 const g=new Session();runSession(g,sessionActions({weather:false,confirmAngle:false,verify:false}));
 expect(g.state.minute).toBe(600);expect(g.state).toMatchObject({angle:72,angleConfirmed:false,weatherConsulted:false,verified:false});
 expect(evaluateLaunch(g.state)).toEqual({blockedReasons:[],risks:[],outcome:'success'});expect(g.requestLaunch()).toBe('launched');expect(g.warning).toBe(false);
});
it('P4 R5 aviso recalculado al cambiar clima y ángulo después de revisar',()=>{
 const g=new Session();runSession(g,sessionActions({angle:80}));expect(g.requestLaunch()).toBe('warning');
 const wait=g.begin({type:'wait',minutes:20});expect(wait.allowed).toBe(true);expect(g.warning).toBe(false);expect(g.confirmLaunch()).toBe(false);
 expect(g.requestLaunch()).toBe('blocked');expect(g.complete(wait.token)).toBe(true);expect(g.confirmLaunch()).toBe(false);
 expect(g.requestLaunch()).toBe('warning');expect(evaluateLaunch(g.state).risks.map(r=>r.code)).toEqual(['angle','weather']);
 runSession(g,[{type:'angle',angle:72}]);expect(g.warning).toBe(false);expect(g.confirmLaunch()).toBe(false);
 expect(g.requestLaunch()).toBe('warning');expect(evaluateLaunch(g.state).risks.map(r=>r.code)).toEqual(['weather']);
 expect(g.confirmLaunch()).toBe(true);expect(g.state.result?.causes.map(r=>r.code)).toEqual(['weather']);
});
it('P4 R5 reparación después de revisión elimina riesgo; aviso viejo no autoriza',()=>{
 const g=new Session();runSession(g,sessionActions({antenna:false}));expect(g.requestLaunch()).toBe('warning');
 runSession(g,[{type:'repair',system:'antenna'}]);expect(g.state.verified).toBe(true);expect(g.warning).toBe(false);expect(g.confirmLaunch()).toBe(false);
 expect(g.requestLaunch()).toBe('launched');expect(g.state.result?.outcome).toBe('success');expect(g.state.result?.causes).toEqual([]);
});
it('P4 R5 confirmar revalida bloqueos actuales incluso si la referencia del aviso permanece',()=>{
 const g=new Session();runSession(g,sessionActions({antenna:false}));expect(g.requestLaunch()).toBe('warning');
 // Estado sintético: prueba la revalidación defensiva, no una acción jugable.
 g.state.trajectory=false;const before=structuredClone(g.state);
 expect(g.confirmLaunch()).toBe(false);expect(g.state).toEqual(before);expect(g.state.result).toBeNull();
});
it('P4 R5 reemplazar estado invalida aviso; la siguiente evaluación usa riesgos actuales',()=>{
 const g=new Session();runSession(g,sessionActions({antenna:false}));expect(g.requestLaunch()).toBe('warning');
 g.state={...g.state,minute:640};expect(g.warning).toBe(false);expect(g.confirmLaunch()).toBe(false);
 expect(g.requestLaunch()).toBe('warning');expect(g.confirmLaunch()).toBe(true);expect(g.state.result?.causes.map(r=>r.code)).toEqual(['antenna','weather']);
});
it('P4 R5 busy es bloqueo del juego, no riesgo de reglas; reset invalida token y aviso',()=>{
 const g=new Session();runSession(g,sessionActions({antenna:false}));expect(g.requestLaunch()).toBe('warning');
 const p=g.begin({type:'repair',system:'antenna'});expect(g.busy).toBe(true);expect(g.warning).toBe(false);
 const before=g.state;expect(evaluateLaunch(before).blockedReasons).toEqual([]);expect(evaluateLaunch(before).risks.map(r=>r.code)).toEqual(['antenna']);
 expect(g.requestLaunch()).toBe('blocked');const blocked=g.begin({type:'wait',minutes:5});expect(blocked.reasons.map(r=>r.code)).toEqual(['busy']);expect(g.state).toBe(before);
 g.reset();expect(g.complete(p.token)).toBe(false);expect(g.state).toEqual(createInitialState());expect(g.busy).toBe(false);expect(g.warning).toBe(false);
 const next=g.begin({type:'repair',system:'pump'});expect(next.token).toBeGreaterThan(p.token);
 expect(g.complete(p.token)).toBe(false);expect(g.busy).toBe(true);expect(g.complete(next.token)).toBe(true);expect(g.state.minute).toBe(530);
});
