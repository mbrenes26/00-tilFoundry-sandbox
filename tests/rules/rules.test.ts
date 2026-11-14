import {describe,it,expect} from 'vitest';
import {createInitialState,applyAction,previewAction,getView,evaluateLaunch,getScore,isUnfavorable,type GameState,type Action} from '../../src/rules';
const step=(s:GameState,a:Action)=>{const r=applyAction(s,a);expect(r.ok,JSON.stringify(r)).toBe(true);return r.state;};
const initial=createInitialState;
function prepared({pump=true,antenna=true,angle=72,verify=true,weather=true}={}){let s=initial();const actions:Action[]=[{type:'design',profile:'balanced'},{type:'trajectory'}];if(weather)actions.push({type:'weather'});if(pump)actions.push({type:'repair',system:'pump'});if(antenna)actions.push({type:'repair',system:'antenna'});actions.push({type:'load'},{type:'angle',angle});if(verify)actions.push({type:'verify'});for(const a of actions)s=step(s,a);return s;}
describe('R1 estado, inmutabilidad, inventarios',()=>{
 it('inicio exacto y copia nueva',()=>{const s=initial();expect(s.minute).toBe(510);expect(s.budget).toBe(1000000);expect(s.inventory).toEqual({fuel:120000,oxygen:30000,water:10000,food:2000,parts:50});expect(s.cargo).toEqual({fuel:0,oxygen:0,water:0,food:0});expect(s).toEqual(initial());expect(s).not.toBe(initial());expect(getView(s).general).toEqual({ship:86,systems:90,resources:100});});
 it('no mutación, rechazo original y únicos idempotentes',()=>{const s=initial(),copy=JSON.stringify(s);let next=step(s,{type:'repair',system:'pump'});expect(JSON.stringify(s)).toBe(copy);expect(next.budget).toBe(940000);expect(next.inventory.parts).toBe(40);expect(step(next,{type:'repair',system:'pump'})).toEqual(next);next=step(next,{type:'weather'});expect(step(next,{type:'weather'})).toEqual(next);const r=applyAction(s,{type:'load'});expect(r.ok).toBe(false);expect(r.state).toBe(s);});
 it('insuficiencia de todos los recursos no consume',()=>{for(const [action,field] of [[{type:'repair',system:'pump'},'parts'],[{type:'load'},'fuel'],[{type:'load'},'oxygen'],[{type:'load'},'water'],[{type:'load'},'food']] as [Action,string][]){let s=step(step(initial(),{type:'design',profile:'balanced'}),{type:'trajectory'});s={...s,inventory:{...s.inventory,[field]:0}};const r=applyAction(s,action);expect(r.ok).toBe(false);expect(r.state).toBe(s);}const s={...initial(),budget:1};expect(applyAction(s,{type:'design',profile:'power'}).ok).toBe(false);});
});
describe('R2 costos, perfiles y prerrequisitos',()=>{
 it.each([['balanced',200000,86,80,85,86,92000,8],['power',260000,92,90,85,88,98000,7],['reinforced',240000,90,80,95,92,96000,9]] as const)('perfil %s', (profile,cost,mass,power,resistance,ship,fuel,orbit)=>{const p=previewAction(initial(),{type:'design',profile});expect([p.budgetCost,p.durationMinutes]).toEqual([cost,10]);let s=step(initial(),{type:'design',profile});expect(getView(s).profile).toMatchObject({mass,power,resistance,ship});for(const angle of [45,70,72,74,90]){const v=getView(s,angle);expect(v.estimates.fuel).toBe(fuel+1000*Math.abs(angle-72));expect(v.estimates.orbitMinutes).toBeCloseTo(orbit+.1*Math.abs(angle-72));}s=step(s,{type:'trajectory'});expect(s.minute).toBe(530);expect(s.budget).toBe(1000000-cost-20000);expect(step(s,{type:'trajectory'})).toEqual(s);s=step(s,{type:'design',profile});expect(s.trajectory).toBe(false);});
 it('duraciones, transferencia, carga única y diseño bloqueado después',()=>{for(const pump of [false,true]){let s=step(step(initial(),{type:'design',profile:'balanced'}),{type:'trajectory'});if(pump)s=step(s,{type:'repair',system:'pump'});expect(previewAction(s,{type:'load'}).durationMinutes).toBe(pump?30:40);s=step(s,{type:'load'});expect(s.cargo).toEqual({fuel:100000,oxygen:6000,water:2000,food:400});expect(s.inventory).toMatchObject({fuel:20000,oxygen:24000,water:8000,food:1600});expect(applyAction(s,{type:'load'}).ok).toBe(false);expect(applyAction(s,{type:'design',profile:'power'}).ok).toBe(false);}});
 it('ángulo entero y confirmación idempotente',()=>{for(const angle of [44,91,72.5,NaN])expect(applyAction(initial(),{type:'angle',angle}).ok).toBe(false);for(const angle of [45,70,72,74,90]){const s=step(initial(),{type:'angle',angle});expect(s.minute).toBe(515);expect(s.angleConfirmed).toBe(true);expect(step(s,{type:'angle',angle})).toEqual(s);}expect(applyAction(initial(),{type:'trajectory'}).ok).toBe(false);expect(applyAction(initial(),{type:'verify'}).ok).toBe(false);});
});
describe('R3 reloj y clima',()=>{
 it.each([600,660])('lanzamiento aplicado en límite inclusivo %i',minute=>{
  const s={...prepared(),minute};const before=JSON.stringify(s);
  const launched=step(s,{type:'launch'});
  expect(JSON.stringify(s)).toBe(before);expect(launched.minute).toBe(minute);
  expect(launched.launched).toBe(true);expect(launched.result?.outcome).toBe(minute===600?'success':'failure');
  expect(launched.result?.causes.map(c=>c.code)).toEqual(minute===600?[]:['weather']);
  expect(launched.cargo.fuel).toBe(8000);
 });
 it.each([[599,12,true],[600,20,false],[639,20,false],[640,45,false],[660,45,false],[661,45,false]])('límite %i',(minute,wind,early)=>{const s={...prepared(),minute};expect(getView(s).weather.current.wind).toBe(wind);expect(evaluateLaunch(s).blockedReasons.some(x=>x.code==='early')).toBe(early);const copy=JSON.stringify(s);getView(s,90);expect(JSON.stringify(s)).toBe(copy);});
 it('umbrales clima, ventana perdida y terminal',()=>{expect(isUnfavorable({wind:40,rain:30})).toBe(false);expect(isUnfavorable({wind:41,rain:0})).toBe(true);expect(isUnfavorable({wind:0,rain:31})).toBe(true);let s={...prepared(),minute:660};s=step(s,{type:'wait',minutes:5});expect(s.result?.causes[0].code).toBe('time');expect(s.launched).toBe(false);expect(getScore(s).total).toBe(0);expect(applyAction(s,{type:'wait',minutes:5}).ok).toBe(false);expect(initial().result).toBeNull();});
});
describe('R4 derivados',()=>{
 it('fases, checks y barras',()=>{let s=initial();expect(getView(s).phase).toBe('Planificación');for(const system of ['pump','antenna'] as const){s=step(s,{type:'repair',system});expect(getView(s).repairCount).toBe(system==='pump'?1:2);}expect(getView(s).general.systems).toBe(100);expect(getView(s).systems).toMatchObject({propulsion:true,communication:true,energy:true,lifeSupport:false,navigation:false});s=prepared({verify:false});expect(getView(s).phase).toBe('Verificaciones');expect(getView(s).general.resources).toBe(65);expect(getView(s).objectives.verify).toBe(false);expect(evaluateLaunch(s).outcome).toBe('success');s=step(s,{type:'launch'});expect(getView(s).phase).toBe('Lanzamiento');expect(getView(s).objectives.launch).toBe(true);});
});
describe('R5 secuencias y puntaje',()=>{
 it('ganadora 712 y snapshot',()=>{let s=prepared();expect([s.minute,s.budget,s.inventory.parts,s.cargo.fuel]).toEqual([620,640000,35,100000]);expect(evaluateLaunch(s)).toMatchObject({outcome:'success',risks:[],blockedReasons:[]});s=step(s,{type:'launch'});expect(s.cargo.fuel).toBe(8000);expect(getScore(s)).toMatchObject({budget:256,parts:140,time:166,precision:150,total:712});expect(getScore({...s,minute:660,budget:0})).toEqual(getScore(s));expect(initial()).toEqual(createInitialState());});
 it.each([[{angle:80},620,['angle']],[{pump:false},610,['pump']],[{antenna:false},600,['antenna']],[{angle:90,antenna:false},600,['angle','antenna','fuel']]] as const)('fallo %o',(options,minute,codes)=>{let s=prepared(options);expect(s.minute).toBe(minute);expect(evaluateLaunch(s).risks.map(x=>x.code)).toEqual(codes);s=step(s,{type:'launch'});expect(s.result?.outcome).toBe('failure');expect(s.result?.causes.map(x=>x.code)).toEqual(codes);expect(getScore(s).total).toBe(0);expect(initial().result).toBeNull();});
 it('clima y tiempo',()=>{let s=step(prepared(),{type:'wait',minutes:20});expect(s.minute).toBe(640);expect(evaluateLaunch(s).risks.map(x=>x.code)).toEqual(['weather']);s=step(s,{type:'launch'});expect(s.result?.causes[0].text).toContain('45');s=prepared();for(let i=0;i<3;i++)s=step(s,{type:'wait',minutes:20});expect(s.minute).toBe(680);expect(s.result?.causes[0].text).toContain('11:20');});
 it('omisiones no inventan riesgos ni bloqueos',()=>{let s=prepared({antenna:false,verify:false});expect(s.minute).toBe(590);s=step(s,{type:'wait',minutes:10});expect(evaluateLaunch(s).risks.map(x=>x.code)).toEqual(['antenna']);expect(step(s,{type:'launch'}).result?.outcome).toBe('failure');s=prepared({verify:false});expect(s.minute).toBe(610);expect(step(s,{type:'launch'}).result?.outcome).toBe('success');s=prepared({weather:false,verify:false});expect(evaluateLaunch(s).outcome).toBe('success');});
 it('cargar antes de reparar cuesta 10 min extra y redondeos',()=>{let s=initial();for(const a of [{type:'design',profile:'balanced'},{type:'trajectory'},{type:'weather'},{type:'load'},{type:'repair',system:'pump'},{type:'repair',system:'antenna'},{type:'angle',angle:72},{type:'verify'}] as Action[])s=step(s,a);expect(s.minute).toBe(630);expect(evaluateLaunch(s).outcome).toBe('success');expect(getScore({...s,minute:600,angle:70,budget:999999})).toMatchObject({budget:399,time:250,precision:133});});
});

// P3: expectativas tomadas de la spec base, no de las constantes del motor.
const EXPECTED_INITIAL:GameState={
 minute:510,budget:1000000,inventory:{fuel:120000,oxygen:30000,water:10000,food:2000,parts:50},
 cargo:{fuel:0,oxygen:0,water:0,food:0},profile:null,trajectory:false,weatherConsulted:false,
 repairs:{pump:false,antenna:false},loaded:false,angle:72,angleConfirmed:false,
 verified:false,launched:false,result:null
};
function freezeDeep<T>(value:T):T{
 if(value!==null&&typeof value==='object'){
  for(const child of Object.values(value))freezeDeep(child);
  Object.freeze(value);
 }
 return value;
}
function planned(){return step(step(initial(),{type:'design',profile:'balanced'}),{type:'trajectory'});}
function expectRejected(s:GameState,a:Action,codes:string[]){
 const before=structuredClone(s);freezeDeep(s);
 const preview=previewAction(s,a),result=applyAction(s,a);
 expect(preview.allowed).toBe(false);expect(result.ok).toBe(false);
 expect(preview.reasons.map(r=>r.code)).toEqual(expect.arrayContaining(codes));
 if(!result.ok){expect(result.reasons).toEqual(preview.reasons);for(const reason of result.reasons)expect(reason.text.length).toBeGreaterThan(0);}
 expect(result.state).toBe(s);expect(result.state).toEqual(before);expect(s).toEqual(before);
 for(const amount of [s.budget,...Object.values(s.inventory),...Object.values(s.cargo)])expect(amount).toBeGreaterThanOrEqual(0);
}
const costCases:{name:string;setup:()=>GameState;action:Action;duration:number;cost:number;inventory:Partial<GameState['inventory']>}[]=[
 {name:'diseño Equilibrada',setup:initial,action:{type:'design',profile:'balanced'},duration:10,cost:200000,inventory:{}},
 {name:'diseño Potente',setup:initial,action:{type:'design',profile:'power'},duration:10,cost:260000,inventory:{}},
 {name:'diseño Reforzada',setup:initial,action:{type:'design',profile:'reinforced'},duration:10,cost:240000,inventory:{}},
 {name:'trayectoria',setup:()=>step(initial(),{type:'design',profile:'balanced'}),action:{type:'trajectory'},duration:10,cost:20000,inventory:{}},
 {name:'consulta inicial clima',setup:initial,action:{type:'weather'},duration:5,cost:0,inventory:{}},
 {name:'bomba',setup:initial,action:{type:'repair',system:'pump'},duration:20,cost:60000,inventory:{parts:10}},
 {name:'antena',setup:initial,action:{type:'repair',system:'antenna'},duration:20,cost:40000,inventory:{parts:5}},
 {name:'carga bomba averiada',setup:planned,action:{type:'load'},duration:40,cost:30000,inventory:{fuel:100000,oxygen:6000,water:2000,food:400}},
 {name:'carga bomba reparada',setup:()=>step(planned(),{type:'repair',system:'pump'}),action:{type:'load'},duration:30,cost:30000,inventory:{fuel:100000,oxygen:6000,water:2000,food:400}},
 {name:'confirmación ángulo',setup:initial,action:{type:'angle',angle:72},duration:5,cost:0,inventory:{}},
 {name:'verificaciones sin reparaciones/clima/ángulo',setup:()=>step(planned(),{type:'load'}),action:{type:'verify'},duration:10,cost:10000,inventory:{}},
 {name:'lanzamiento',setup:prepared,action:{type:'launch'},duration:0,cost:0,inventory:{}}
];
describe('P3 R1 trazabilidad API y recursos',()=>{
 it('estado y reinicio exactos después de preparación y cada terminación',()=>{
  const states=[initial(),planned(),step(prepared(),{type:'launch'}),step(prepared({angle:80}),{type:'launch'}),step({...prepared(),minute:660},{type:'wait',minutes:5})];
  for(const previous of states){
   const snapshot=structuredClone(previous),reset=createInitialState();
   expect(reset).toEqual(EXPECTED_INITIAL);expect(previous).toEqual(snapshot);expect(reset).not.toBe(previous);
   for(const key of ['inventory','cargo','repairs'] as const)expect(reset[key]).not.toBe(previous[key]);
  }
  const first=createInitialState(),second=createInitialState();
  first.inventory.fuel=0;first.cargo.fuel=1;first.repairs.pump=true;
  expect(second).toEqual(EXPECTED_INITIAL);expect(createInitialState()).toEqual(EXPECTED_INITIAL);
 });
 it.each(costCases)('previewAction/applyAction inmutables: $name',({setup,action})=>{
  const s=freezeDeep(setup()),before=structuredClone(s),a=freezeDeep(structuredClone(action));
  const preview=previewAction(s,a);expect(preview.allowed).toBe(true);expect(s).toEqual(before);
  const next=step(s,a);expect(s).toEqual(before);expect(a).toEqual(action);expect(next).not.toBe(s);
  for(const key of ['inventory','cargo','repairs'] as const)expect(next[key]).not.toBe(s[key]);
 });
 it('getView/evaluateLaunch/getScore inmutables en inicio, preparación y resultados',()=>{
  for(const input of [initial(),prepared(),step(prepared(),{type:'launch'}),step(prepared({angle:80}),{type:'launch'}),step({...prepared(),minute:660},{type:'wait',minutes:5})]){
   const s=freezeDeep(input),before=structuredClone(s);
   expect(getView(s,90)).toEqual(getView(s,90));expect(evaluateLaunch(s)).toEqual(evaluateLaunch(s));expect(getScore(s)).toEqual(getScore(s));
   expect(s).toEqual(before);
   const view=getView(s),score=getScore(s);view.inventory.fuel=0;view.cargo.fuel=0;score.metrics.budget=0;
   expect(s).toEqual(before);
  }
 });
 it.each(costCases.filter(c=>c.cost>0))('presupuesto un peso insuficiente y exacto: $name',({setup,action,cost})=>{
  const input=setup();expectRejected({...input,budget:cost-1},action,['budget']);
  const next=step({...input,budget:cost},action);expect(next.budget).toBe(0);
  for(const amount of [...Object.values(next.inventory),...Object.values(next.cargo)])expect(amount).toBeGreaterThanOrEqual(0);
 });
 it.each([
  ['pump','parts',10],['antenna','parts',5],['load','fuel',100000],['load','oxygen',6000],['load','water',2000],['load','food',400]
 ] as const)('inventario insuficiente y exacto: %s/%s', (system,field,cost)=>{
  const input=system==='load'?planned():initial();
  const action:Action=system==='load'?{type:'load'}:{type:'repair',system};
  for(const amount of [0,cost-1])expectRejected({...input,inventory:{...input.inventory,[field]:amount}},action,['inventory-'+field]);
  const next=step({...input,inventory:{...input.inventory,[field]:cost}},action);expect(next.inventory[field]).toBe(0);
  for(const amount of [next.budget,...Object.values(next.inventory),...Object.values(next.cargo)])expect(amount).toBeGreaterThanOrEqual(0);
 });
 it.each([{type:'repair',system:'pump'},{type:'repair',system:'antenna'},{type:'weather'},{type:'trajectory'},{type:'angle',angle:72}] as Action[])('completada sin doble consumo: %o',action=>{
  const first=step(action.type==='trajectory'?planned():initial(),action),before=structuredClone(first);
  const preview=previewAction(first,action);expect(preview).toMatchObject({allowed:true,durationMinutes:0,budgetCost:0,inventoryCosts:{},reasons:[]});
  for(let i=0;i<3;i++)expect(step(first,action)).toEqual(before);
 });
 it('carga repetida rechazada sin doble consumo',()=>{
  const s=step(planned(),{type:'load'});for(let i=0;i<3;i++)expectRejected(s,{type:'load'},['loaded']);
 });
});
describe('P3 R2 trazabilidad tablas y prerrequisitos',()=>{
 it.each(costCases)('costo/duración/inventario preview y transición: $name',({setup,action,duration,cost,inventory})=>{
  const s=setup(),p=previewAction(s,action);expect(p).toMatchObject({allowed:true,durationMinutes:duration,budgetCost:cost,inventoryCosts:inventory,reasons:[]});
  expect(p.effects.length).toBeGreaterThan(0);const next=step(s,action);
  expect(next.minute).toBe(s.minute+duration);expect(next.budget).toBe(s.budget-cost);
  for(const key of ['fuel','oxygen','water','food','parts'] as const)expect(next.inventory[key]).toBe(s.inventory[key]-(inventory[key]??0));
  if(action.type==='repair')expect(next.repairs[action.system]).toBe(true);
  if(action.type==='weather')expect(next.weatherConsulted).toBe(true);
  if(action.type==='verify')expect(next.verified).toBe(true);
 });
 it.each([
  ['balanced','Equilibrada',200000,86,80,85,86,92000,8],
  ['power','Potente',260000,92,90,85,88,98000,7],
  ['reinforced','Reforzada',240000,90,80,95,92,96000,9]
 ] as const)('perfil completo y fórmulas confirmadas/borrador: %s',(profile,name,cost,mass,power,resistance,ship,fuel,orbit)=>{
  const s=step(initial(),{type:'design',profile});
  expect(getView(s).profile).toEqual({name,cost,mass,power,resistance,ship,fuel,orbit});
  expect(getView(s).general.ship).toBe(ship);
  for(const angle of [45,70,72,74,90]){
   const draft=getView(s,angle);expect(s.angle).toBe(72);expect(s.angleConfirmed).toBe(false);
   expect(draft.estimates).toMatchObject({angle,preview:true,correct:angle>=70&&angle<=74,fuel:fuel+1000*Math.abs(angle-72)});
   expect(draft.estimates.orbitMinutes).toBeCloseTo(orbit+.1*Math.abs(angle-72));
   expect(draft.confirmedEstimates).toMatchObject({angle:72,fuel,orbitMinutes:orbit});
   const confirmed=step(s,{type:'angle',angle}),v=getView(confirmed);
   expect(confirmed.angle).toBe(angle);expect(confirmed.angleConfirmed).toBe(true);
   expect(v.confirmedEstimates.fuel).toBe(fuel+1000*Math.abs(angle-72));
   expect(v.confirmedEstimates.orbitMinutes).toBeCloseTo(orbit+.1*Math.abs(angle-72));
   expect(v.estimates.preview).toBe(false);expect(v.confirmedEstimates.correct).toBe(angle>=70&&angle<=74);
  }
 });
 it.each([44,91,45.5,72.5,89.5,NaN,Infinity,-Infinity])('ángulo rechazado sin cambios: %s',angle=>expectRejected(initial(),{type:'angle',angle},['angle-value']));
 it('cambiar ángulo confirmado cobra cinco minutos; reconfirmar es gratis',()=>{
  const s=step(initial(),{type:'angle',angle:72}),next=step(s,{type:'angle',angle:74});
  expect(next.minute).toBe(520);expect(next.budget).toBe(1000000);expect(next.angle).toBe(74);
  expect(step(next,{type:'angle',angle:74})).toEqual(next);
 });
 it('prerrequisitos trayectoria/carga/verificaciones y rediseño',()=>{
  expectRejected(initial(),{type:'trajectory'},['design']);expectRejected(initial(),{type:'load'},['design','trajectory']);
  const designed=step(initial(),{type:'design',profile:'balanced'});expectRejected(designed,{type:'load'},['trajectory']);
  expectRejected(initial(),{type:'verify'},['design','trajectory','load']);expectRejected(planned(),{type:'verify'},['load']);
  const prior=planned(),redesigned=step(prior,{type:'design',profile:'power'});
  expect(redesigned).toMatchObject({profile:'power',trajectory:false,minute:540,budget:520000});expect(prior.trajectory).toBe(true);
  expectRejected(redesigned,{type:'load'},['trajectory']);
  const recalculated=step(redesigned,{type:'trajectory'});expect(recalculated).toMatchObject({trajectory:true,minute:550,budget:500000});
  const loaded=step(recalculated,{type:'load'});expectRejected(loaded,{type:'design',profile:'reinforced'},['loaded']);
 });
 it.each([false,true])('carga conserva almacén+a bordo y duración con bomba %s',pump=>{
  let s=planned();if(pump)s=step(s,{type:'repair',system:'pump'});
  const next=step(s,{type:'load'});expect(next.minute-s.minute).toBe(pump?30:40);expect(s.budget-next.budget).toBe(30000);
  expect(next.inventory).toEqual({fuel:20000,oxygen:24000,water:8000,food:1600,parts:pump?40:50});
  expect(next.cargo).toEqual({fuel:100000,oxygen:6000,water:2000,food:400});
  for(const key of ['fuel','oxygen','water','food'] as const)expect(next.inventory[key]+next.cargo[key]).toBe(s.inventory[key]+s.cargo[key]);
 });
 it('verificar puede repetirse pagando sin exigir reparación, clima ni ángulo',()=>{
  const s=step(planned(),{type:'load'});expect(s).toMatchObject({repairs:{pump:false,antenna:false},weatherConsulted:false,angleConfirmed:false});
  const once=step(s,{type:'verify'}),twice=step(once,{type:'verify'});
  expect(twice.verified).toBe(true);expect(twice.minute-once.minute).toBe(10);expect(once.budget-twice.budget).toBe(10000);
 });
});
const EXPECTED_FORECAST=[
 {start:510,end:599,label:'08:30–09:59',wind:12,rain:0,cloud:18},
 {start:600,end:639,label:'10:00–10:39',wind:20,rain:0,cloud:25},
 {start:640,end:660,label:'10:40–11:00',wind:45,rain:0,cloud:40}
];
describe('P3 R3 trazabilidad reloj, pronóstico y ventana',()=>{
 it.each([
  [599,'09:59',0,['early'],[], 'blocked'],[600,'10:00',1,[],[],'success'],[639,'10:39',1,[],[],'success'],
  [640,'10:40',2,[],['weather'],'failure'],[660,'11:00',2,[],['weather'],'failure'],[661,'11:01',2,['time'],['weather'],'blocked']
 ] as const)('pronóstico/bloqueos completos %s %s',(minute,time,index,blocked,risks,outcome)=>{
  const s=freezeDeep({...prepared(),minute}),before=structuredClone(s);
  for(let i=0;i<3;i++){
   const v=getView(s,90),e=evaluateLaunch(s);expect(v.minute).toBe(minute);expect(v.time).toBe(time);
   expect(v.weather.forecast).toEqual(EXPECTED_FORECAST);expect(v.weather.current).toEqual(EXPECTED_FORECAST[index]);
   expect(v.weather.unfavorable).toBe(index===2);expect(e.blockedReasons.map(r=>r.code)).toEqual(blocked);expect(e.risks.map(r=>r.code)).toEqual(risks);expect(e.outcome).toBe(outcome);
   const p=previewAction(s,{type:'launch'});expect(p.allowed).toBe(blocked.length===0);expect(p.durationMinutes).toBe(0);expect(s).toEqual(before);
  }
  if(blocked.length)expectRejected(s,{type:'launch'},[...blocked]);
 });
 it('lectura de vista y pronóstico ya consultado no avanza reloj',()=>{
  const s=initial();for(let i=0;i<10;i++){getView(s);getView(s,45);previewAction(s,{type:'weather'});}expect(s).toEqual(EXPECTED_INITIAL);
  const consulted=step(s,{type:'weather'});expect(consulted.minute).toBe(515);expect(consulted.weatherConsulted).toBe(true);
  for(let i=0;i<10;i++){getView(consulted);expect(step(consulted,{type:'weather'})).toEqual(consulted);}
 });
 it.each([5,10,20] as const)('espera %i minutos sin costo material',minutes=>{
  const s=prepared(),p=previewAction(s,{type:'wait',minutes});expect(p).toMatchObject({allowed:true,durationMinutes:minutes,budgetCost:0,inventoryCosts:{}});
  expect(step(s,{type:'wait',minutes})).toEqual({...s,minute:s.minute+minutes});
 });
 it.each([
  [40,30,false],[40.001,0,true],[0,30.001,true],[41,30,true],[40,31,true],[0,0,false]
 ] as const)('umbrales estrictos viento %s lluvia %s',(wind,rain,unfavorable)=>expect(isUnfavorable({wind,rain})).toBe(unfavorable));
 it('660 no termina; 661 produce fallo inmediato, advertido e irreversible',()=>{
  const atClose=step({...prepared(),minute:650},{type:'wait',minutes:10});expect(atClose.minute).toBe(660);expect(atClose.result).toBeNull();
  const s={...prepared(),minute:656},action:Action={type:'wait',minutes:5},preview=previewAction(s,action);
  expect(preview.allowed).toBe(true);expect(preview.effects.join(' ')).toContain('sobrepasará las 11:00');
  const terminal=step(s,action);expect(terminal.minute).toBe(661);expect(terminal.launched).toBe(false);
  expect(terminal.result).toEqual({outcome:'failure',causes:[{code:'time',text:'Ventana perdida: hora final 11:01, cierre 11:00.'}],metrics:{minute:661,budget:640000,parts:35,angle:72}});
  expect(getScore(terminal).total).toBe(0);
  for(const {action:next} of costCases)expectRejected(terminal,next,['finished']);
  for(const minutes of [5,10,20] as const)expectRejected(terminal,{type:'wait',minutes},['finished']);
  expect(initial()).toEqual(EXPECTED_INITIAL);
 });
 it('una tarea no espera sobre ventana también termina al completarse',()=>{
  const s={...initial(),minute:655},action:Action={type:'repair',system:'pump'};
  expect(previewAction(s,action).effects.join(' ')).toContain('sobrepasará las 11:00');
  const terminal=step(s,action);expect(terminal).toMatchObject({minute:675,budget:940000,inventory:{parts:40},repairs:{pump:true},launched:false,result:{outcome:'failure',metrics:{minute:675,budget:940000,parts:40,angle:72}}});
  expect(terminal.result?.causes.map(r=>r.code)).toEqual(['time']);
 });
});


// P4: tablas de referencia independientes del motor, API reglas v1 R4/R5.
const WIN_ACTIONS:Action[]=[
 {type:'design',profile:'balanced'},{type:'trajectory'},{type:'weather'},
 {type:'repair',system:'pump'},{type:'repair',system:'antenna'},
 {type:'load'},{type:'angle',angle:72},{type:'verify'}
];
const WIN_TIMES=[520,530,535,555,575,605,610,620];
function referenceActions(options:{pump?:boolean;antenna?:boolean;angle?:number;verify?:boolean;loadFirst?:boolean}={}):Action[]{
 const actions=WIN_ACTIONS.filter(a=>!(a.type==='repair'&&options[a.system]===false)&&!(a.type==='verify'&&options.verify===false))
  .map(a=>a.type==='angle'?{...a,angle:options.angle??72}:a);
 if(options.loadFirst){const load=actions.splice(actions.findIndex(a=>a.type==='load'),1)[0];actions.splice(3,0,load);}
 return actions;
}
const REFERENCES:{name:string;actions:Action[];times:number[];causes:string[];texts:string[][];metrics:{minute:number;budget:number;parts:number;angle:number};components:number[];fuel:number;total:number;launched:boolean}[]=[
 {name:'1 ganadora',actions:WIN_ACTIONS,times:WIN_TIMES,causes:[],texts:[],metrics:{minute:620,budget:640000,parts:35,angle:72},components:[256,140,166,150],fuel:8000,total:712,launched:true},
 {name:'2 ángulo',actions:referenceActions({angle:80}),times:WIN_TIMES,causes:['angle'],texts:[['80°','72°']],metrics:{minute:620,budget:640000,parts:35,angle:80},components:[256,140,166,83],fuel:0,total:0,launched:true},
 {name:'3 bomba',actions:referenceActions({pump:false}),times:[520,530,535,555,595,600,610],causes:['pump'],texts:[['76 %']],metrics:{minute:610,budget:700000,parts:45,angle:72},components:[280,180,208,150],fuel:8000,total:0,launched:true},
 {name:'4 antena',actions:referenceActions({antenna:false}),times:[520,530,535,555,585,590,600],causes:['antenna'],texts:[['68 %']],metrics:{minute:600,budget:680000,parts:40,angle:72},components:[272,160,250,150],fuel:8000,total:0,launched:true},
 {name:'5 clima',actions:[...WIN_ACTIONS,{type:'wait',minutes:20}],times:[...WIN_TIMES,640],causes:['weather'],texts:[['10:40','45 km/h','0 %']],metrics:{minute:640,budget:640000,parts:35,angle:72},components:[256,140,83,150],fuel:8000,total:0,launched:true},
 {name:'6 tiempo',actions:[...WIN_ACTIONS,{type:'wait',minutes:20},{type:'wait',minutes:20},{type:'wait',minutes:20}],times:[...WIN_TIMES,640,660,680],causes:['time'],texts:[['11:20','11:00']],metrics:{minute:680,budget:640000,parts:35,angle:72},components:[256,140,0,150],fuel:100000,total:0,launched:false},
 {name:'7 verificación omitida',actions:[...referenceActions({antenna:false,verify:false}),{type:'wait',minutes:10}],times:[520,530,535,555,585,590,600],causes:['antenna'],texts:[['68 %']],metrics:{minute:600,budget:690000,parts:40,angle:72},components:[276,160,250,150],fuel:8000,total:0,launched:true},
 {name:'8 riesgos simultáneos',actions:referenceActions({antenna:false,angle:90}),times:[520,530,535,555,585,590,600],causes:['angle','antenna','fuel'],texts:[['90°','72°'],['68 %'],['110.000','100.000']],metrics:{minute:600,budget:680000,parts:40,angle:90},components:[272,160,250,0],fuel:0,total:0,launched:true},
 {name:'9 carga antes de bomba',actions:referenceActions({loadFirst:true}),times:[520,530,535,575,595,615,620,630],causes:[],texts:[],metrics:{minute:630,budget:640000,parts:35,angle:72},components:[256,140,125,150],fuel:8000,total:671,launched:true}
];
describe('P4 R4 checklist, fases, barras y cinco sistemas',()=>{
 it('ocho objetivos en cada transición, reparaciones 0/2→2/2 y fases completadas por objetivos',()=>{
  const keys=['design','trajectory','weather','repairs','load','angle','verify','launch'];
  const completed=[[],['design'],['design','trajectory'],['design','trajectory','weather'],['design','trajectory','weather'],['design','trajectory','weather','repairs'],['design','trajectory','weather','repairs','load'],['design','trajectory','weather','repairs','load','angle'],['design','trajectory','weather','repairs','load','angle','verify'],keys];
  const counts=[0,0,0,0,1,2,2,2,2,2];
  const phases=['Planificación','Planificación','Planificación','Preparación','Preparación','Preparación','Preparación','Verificaciones','Lanzamiento','Lanzamiento'];
  const phaseCompletion=[[false,false,false,false],[false,false,false,false],[false,false,false,false],[true,false,false,false],[true,false,false,false],[true,false,false,false],[true,false,false,false],[true,true,false,false],[true,true,true,false],[true,true,true,true]];
  let s=initial();
  for(let i=0;i<completed.length;i++){
   if(i)s=step(s,[...WIN_ACTIONS,{type:'launch'} as Action][i-1]);
   const v=getView(s);expect(v.objectives).toEqual(Object.fromEntries(keys.map(k=>[k,completed[i].includes(k)])));
   expect(Object.keys(v.objectives)).toHaveLength(8);expect(v.repairCount).toBe(counts[i]);expect(v.general.systems).toBe(90+5*counts[i]);
   expect(v.phase).toBe(phases[i]);expect(v.phases.map(p=>p.complete)).toEqual(phaseCompletion[i]);
   expect(v.systems).toEqual({propulsion:i>=4,communication:i>=5,energy:true,lifeSupport:i>=6,navigation:i>=2});
  }
 });
 it('rediseño invalida objetivo y sistema de trayectoria y devuelve guía a planificación',()=>{
  let s=initial();for(const a of WIN_ACTIONS.slice(0,3))s=step(s,a);
  expect(getView(s).phase).toBe('Preparación');s=step(s,{type:'design',profile:'reinforced'});
  const v=getView(s);expect(v.objectives).toMatchObject({design:true,trajectory:false,weather:true});expect(v.systems.navigation).toBe(false);
  expect(v.phase).toBe('Planificación');expect(v.phases[0].complete).toBe(false);
  expect(evaluateLaunch(s).blockedReasons.map(r=>r.code)).toEqual(['trajectory','load','early']);
 });
 it.each([['balanced',86],['power',88],['reinforced',92]] as const)('barra Nave %s, independiente de verificaciones', (profile,ship)=>{
  const s=step(initial(),{type:'design',profile});expect(getView(s).general).toEqual({ship,systems:90,resources:100});
 });
 it('Recursos promedia cinco fracciones, redondea y excluye presupuesto/carga',()=>{
  const s={...initial(),budget:1,inventory:{fuel:60000,oxygen:7500,water:7500,food:200,parts:20}};
  expect(getView(s).general.resources).toBe(40); // (0.5+0.25+0.75+0.1+0.4)/5*100
  expect(getView({...s,budget:1000000,cargo:{fuel:100000,oxygen:6000,water:2000,food:400}}).general.resources).toBe(40);
  expect(getView({...initial(),inventory:{fuel:0,oxygen:0,water:0,food:0,parts:1}}).general.resources).toBe(0); // 0.4 → 0
  expect(getView({...initial(),inventory:{fuel:0,oxygen:0,water:0,food:0,parts:2}}).general.resources).toBe(1); // 0.8 → 1
  expect(getView(prepared()).general.resources).toBe(65);
 });
 it('éxito con clima, ángulo inicial y revisión omitidos, sin riesgos inventados ni barreras de fase',()=>{
  let s=initial();for(const a of WIN_ACTIONS.filter(a=>!['weather','angle','verify'].includes(a.type)))s=step(s,a);
  expect(s.minute).toBe(600);expect(getView(s).phase).toBe('Planificación');
  expect(getView(s).objectives).toEqual({design:true,trajectory:true,weather:false,repairs:true,load:true,angle:false,verify:false,launch:false});
  expect(evaluateLaunch(s)).toEqual({blockedReasons:[],risks:[],outcome:'success'});
  s=step(s,{type:'launch'});expect(s.result?.outcome).toBe('success');expect(getView(s).phase).toBe('Lanzamiento');
  expect(getView(s).phases.map(p=>p.complete)).toEqual([false,false,false,true]);expect(getView(s).objectives.launch).toBe(true);
 });
});
describe('P4 R5 nueve secuencias, causas completas, instantánea y reinicio',()=>{
 it.each(REFERENCES)('$name: reloj de cada acción, evaluación, consumo, causas, diagnóstico y reinicio',ref=>{
  let s=initial();ref.actions.forEach((a,i)=>{s=step(s,a);expect(s.minute).toBe(ref.times[i]);});
  expect(s.inventory.fuel).toBe(20000);expect(s.cargo.fuel).toBe(100000);
  if(ref.launched){
   expect(s.result).toBeNull();const e=evaluateLaunch(s);expect(e.blockedReasons).toEqual([]);expect(e.risks.map(r=>r.code)).toEqual(ref.causes);
   expect(e.outcome).toBe(ref.total?'success':'failure');expect(previewAction(s,{type:'launch'}).allowed).toBe(true);
   s=step(s,{type:'launch'});
  }
  expect(s.launched).toBe(ref.launched);expect(getView(s).objectives.launch).toBe(ref.launched);
  expect(s.result?.outcome).toBe(ref.total?'success':'failure');expect(s.result?.causes.map(r=>r.code)).toEqual(ref.causes);
  ref.texts.forEach((fragments,i)=>fragments.forEach(fragment=>expect(s.result?.causes[i].text).toContain(fragment)));
  expect(s.result?.metrics).toEqual(ref.metrics);expect(s.cargo).toEqual({fuel:ref.fuel,oxygen:6000,water:2000,food:400});
  const score=getScore(s);expect([score.budget,score.parts,score.time,score.precision]).toEqual(ref.components);expect(score.total).toBe(ref.total);expect(score.metrics).toEqual(ref.metrics);
  // Cambiar los campos de preparación no modifica la instantánea terminal.
  const changed={...s,minute:510,budget:1,inventory:{...s.inventory,parts:0},angle:45,cargo:{...s.cargo,fuel:0}};
  expect(getScore(changed)).toEqual(score);const exposed=getScore(s);exposed.metrics.angle=45;expect(getScore(s)).toEqual(score);
  const original=structuredClone(s);expectRejected(s,{type:'launch'},['finished']);expect(createInitialState()).toEqual(EXPECTED_INITIAL);expect(s).toEqual(original);
 });
 it('márgenes ganadores y éxito sin revisión de la referencia 7',()=>{
  const winner=prepared();expect(640-winner.minute).toBe(20);expect(660-winner.minute).toBe(40);
  const s=prepared({verify:false});expect(s.minute).toBe(610);expect(evaluateLaunch(s)).toEqual({blockedReasons:[],risks:[],outcome:'success'});
  expect(step(s,{type:'launch'}).result?.outcome).toBe('success');
 });
 it('bloqueos contractuales separados de riesgos, sin códigos de omisiones',()=>{
  const cases:[GameState,string[],string[]][]=[
   [initial(),['design','trajectory','load','early'],['pump','antenna']],
   [{...prepared(),profile:null},['design'],[]],[{...prepared(),trajectory:false},['trajectory'],[]],
   [{...prepared(),loaded:false},['load'],[]],[{...prepared(),minute:599},['early'],[]],
   [{...prepared(),minute:661},['time'],['weather']],
   [step(prepared(),{type:'launch'}),['finished'],['fuel']]
  ];
  for(const [s,blocks,risks] of cases){
   const e=evaluateLaunch(s);expect(e.blockedReasons.map(r=>r.code)).toEqual(blocks);expect(e.risks.map(r=>r.code)).toEqual(risks);expect(e.outcome).toBe('blocked');
   expect(previewAction(s,{type:'launch'}).allowed).toBe(false);expectRejected(s,{type:'launch'},blocks);
  }
 });
 it('código fuel aislado en un estado de contrato con carga insuficiente, no nueva secuencia jugable',()=>{
  const s=prepared();s.cargo.fuel=91999;const e=evaluateLaunch(s);
  expect(e.blockedReasons).toEqual([]);expect(e.risks.map(r=>r.code)).toEqual(['fuel']);expect(e.risks[0].text).toContain('92.000');expect(e.risks[0].text).toContain('91.999');
  expect(previewAction(s,{type:'launch'}).allowed).toBe(true);const end=step(s,{type:'launch'});expect(end.cargo.fuel).toBe(0);expect(getScore(end).total).toBe(0);
 });
 it('los cinco riesgos simultáneos son exhaustivos, sin azar',()=>{
  const s={...prepared({pump:false,antenna:false,angle:90}),minute:640};
  for(let i=0;i<3;i++){
   const e=evaluateLaunch(s);expect(e.blockedReasons).toEqual([]);expect(e.risks.map(r=>r.code)).toEqual(['angle','pump','antenna','weather','fuel']);
   const end=step(s,{type:'launch'});expect(end.result?.causes).toEqual(e.risks);expect(getScore(end).total).toBe(0);
  }
 });
 it.each([
  [600,999999,49,70,[399,196,250,133],978],
  [599,0,0,72,[0,0,250,150],400],
  [660,0,0,45,[0,0,0,0],0],
  [661,0,0,90,[0,0,0,0],0],
  [619,1,1,71,[0,4,170,142],316],
  [510,1000000,50,72,[400,200,250,150],1000],
  [510,2000000,100,72,[800,400,250,150],1000]
 ] as const)('floor/round/clamp minute %i budget %i parts %i angle %i',(minute,budget,parts,angle,components,total)=>{
  // Estados métricos sintéticos para límites, no victorias jugadas.
  const s={...initial(),minute,budget,inventory:{...initial().inventory,parts},angle};const score=getScore(s);
  expect([score.budget,score.parts,score.time,score.precision]).toEqual(components);expect(score.total).toBe(total);expect(Number.isInteger(score.total)).toBe(true);
  expect(getScore({...s,result:{outcome:'failure',causes:[],metrics:{minute,budget,parts,angle}}})).toEqual({...score,total:0});
 });
});


it.each(['pump','antenna'] as const)('P4 R4 reparación aislada %s y revisión no esconden los cinco sistemas',system=>{
 const repaired=step(initial(),{type:'repair',system});
 expect(getView(repaired).repairCount).toBe(1);expect(getView(repaired).general.systems).toBe(95);
 expect(getView(repaired).systems).toEqual({propulsion:system==='pump',communication:system==='antenna',energy:true,lifeSupport:false,navigation:false});
 const loaded=step(planned(),{type:'load'}),before=getView(loaded).systems;
 expect(before).toEqual({propulsion:false,communication:false,energy:true,lifeSupport:true,navigation:true});
 const verified=step(loaded,{type:'verify'});expect(getView(verified).systems).toEqual(before);expect(getView(verified).objectives.verify).toBe(true);
 expect(evaluateLaunch(verified).risks.map(r=>r.code)).toEqual(['pump','antenna']);
});
