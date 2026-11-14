// API reglas v1. No dependencias de renderizado, reloj real ni efectos externos.
export type ProfileId = 'balanced'|'power'|'reinforced';
export type Inventory = {fuel:number;oxygen:number;water:number;food:number;parts:number};
export type Cargo = Omit<Inventory,'parts'>;
export type Reason = {code:string;text:string};
export type RiskCode = 'angle'|'pump'|'antenna'|'weather'|'fuel';
export type Risk = {code:RiskCode;text:string};
export type Metrics = {minute:number;budget:number;parts:number;angle:number};
export type Result = {outcome:'success'|'failure';causes:Reason[];metrics:Metrics};
export interface GameState {minute:number;budget:number;inventory:Inventory;cargo:Cargo;profile:ProfileId|null;trajectory:boolean;weatherConsulted:boolean;repairs:{pump:boolean;antenna:boolean};loaded:boolean;angle:number;angleConfirmed:boolean;verified:boolean;launched:boolean;result:Result|null}
export type Action = {type:'design';profile:ProfileId}|{type:'trajectory'|'weather'|'load'|'verify'|'launch'}|{type:'repair';system:'pump'|'antenna'}|{type:'angle';angle:number}|{type:'wait';minutes:5|10|20};
export type ActionPreview = {allowed:boolean;durationMinutes:number;budgetCost:number;inventoryCosts:Partial<Inventory>;effects:string[];reasons:Reason[]};
export type ActionResult = {ok:true;state:GameState}|{ok:false;state:GameState;reasons:Reason[]};
export type LaunchEvaluation = {blockedReasons:Reason[];risks:Risk[];outcome:'blocked'|'success'|'failure'};
export type ScoreBreakdown = {budget:number;parts:number;time:number;precision:number;total:number;metrics:Metrics};
export const PROFILES = {
 balanced:{name:'Equilibrada',cost:200000,mass:86,power:80,resistance:85,ship:86,fuel:92000,orbit:8},
 power:{name:'Potente',cost:260000,mass:92,power:90,resistance:85,ship:88,fuel:98000,orbit:7},
 reinforced:{name:'Reforzada',cost:240000,mass:90,power:80,resistance:95,ship:92,fuel:96000,orbit:9}
} as const;
const INVENTORY:Inventory={fuel:120000,oxygen:30000,water:10000,food:2000,parts:50};
const LOAD:Cargo={fuel:100000,oxygen:6000,water:2000,food:400};
const labels:Record<keyof Inventory,string>={fuel:'combustible',oxygen:'oxígeno',water:'agua',food:'alimentos',parts:'repuestos'};
const number=(n:number)=>n.toLocaleString('es-ES');
export const formatTime=(minute:number)=>`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
export function createInitialState():GameState{return {minute:510,budget:1000000,inventory:{...INVENTORY},cargo:{fuel:0,oxygen:0,water:0,food:0},profile:null,trajectory:false,weatherConsulted:false,repairs:{pump:false,antenna:false},loaded:false,angle:72,angleConfirmed:false,verified:false,launched:false,result:null};}
export const isUnfavorable=(weather:{wind:number;rain:number})=>weather.wind>40||weather.rain>30;
const forecast=[{start:510,end:599,label:'08:30–09:59',wind:12,rain:0,cloud:18},{start:600,end:639,label:'10:00–10:39',wind:20,rain:0,cloud:25},{start:640,end:660,label:'10:40–11:00',wind:45,rain:0,cloud:40}];
function weatherAt(minute:number){return {...forecast[minute<600?0:minute<640?1:2]};}
function estimates(s:GameState,angle=s.angle){const p=PROFILES[s.profile??'balanced'],d=Math.abs(angle-72);return {fuel:p.fuel+1000*d,orbitMinutes:p.orbit+.1*d,correct:angle>=70&&angle<=74,angle,preview:angle!==s.angle};}
export function evaluateLaunch(s:GameState):LaunchEvaluation{
 const blockedReasons:Reason[]=[],risks:Risk[]=[];const block=(code:string,text:string)=>blockedReasons.push({code,text});
 if(s.result)block('finished','La partida terminó. Reinicia para preparar otra misión.');
 if(!s.profile)block('design','Falta confirmar el diseño.');if(!s.trajectory)block('trajectory','Falta calcular una trayectoria válida.');if(!s.loaded)block('load','Falta cargar combustible y consumibles.');
 if(s.minute<600)block('early','La ventana abre a las 10:00.');if(s.minute>660)block('time','La ventana cerró a las 11:00.');
 const e=estimates(s),w=weatherAt(s.minute);
 if(!e.correct)risks.push({code:'angle',text:`Desvío: ángulo ${s.angle}°; recomendado 72° (70–74°).`});
 if(!s.repairs.pump)risks.push({code:'pump',text:'Bomba sin reparar: eficiencia 76 %.'});
 if(!s.repairs.antenna)risks.push({code:'antenna',text:'Pérdida de comunicación: señal 68 %.'});
 if(isUnfavorable(w))risks.push({code:'weather',text:`Clima desfavorable a las ${formatTime(s.minute)}: viento ${w.wind} km/h y lluvia ${w.rain} %.`});
 if(s.loaded&&e.fuel>s.cargo.fuel)risks.push({code:'fuel',text:`Combustible insuficiente: requerido ${number(e.fuel)} L, disponible ${number(s.cargo.fuel)} L.`});
 return {blockedReasons,risks,outcome:blockedReasons.length?'blocked':risks.length?'failure':'success'};
}
export function previewAction(s:GameState,a:Action):ActionPreview{
 const p:ActionPreview={allowed:true,durationMinutes:0,budgetCost:0,inventoryCosts:{},effects:[],reasons:[]};
 const reject=(code:string,text:string)=>p.reasons.push({code,text});
 if(s.result)reject('finished','La partida terminó. Solo puedes reiniciar.');
 switch(a.type){
 case 'design':{
  const profile=PROFILES[a.profile];if(!profile){reject('profile','Selecciona un perfil válido.');break;}if(s.loaded)reject('loaded','No se puede rediseñar después de cargar.');
  p.durationMinutes=10;p.budgetCost=profile.cost;p.effects=[`Diseño ${profile.name}; invalida la trayectoria anterior.`];break;}
 case 'trajectory':if(!s.profile)reject('design','Primero confirma un diseño.');if(!s.trajectory){p.durationMinutes=10;p.budgetCost=20000;}p.effects=[s.trajectory?'Trayectoria ya calculada, sin costo.':'Trayectoria terrestre calculada.'];break;
 case 'weather':p.durationMinutes=s.weatherConsulted?0:5;p.effects=[s.weatherConsulted?'Consulta ya completada: releer no consume tiempo.':'Pronóstico consultado.'];break;
 case 'repair':if(a.system!=='pump'&&a.system!=='antenna'){reject('system','Sistema desconocido.');break;}if(!s.repairs[a.system]){p.durationMinutes=20;p.budgetCost=a.system==='pump'?60000:40000;p.inventoryCosts.parts=a.system==='pump'?10:5;}p.effects=[s.repairs[a.system]?'Reparación ya completada, sin costo.':`${a.system==='pump'?'Bomba':'Antena'} al 100 %.`];break;
 case 'load':if(!s.profile)reject('design','Primero confirma un diseño.');if(!s.trajectory)reject('trajectory','Primero calcula la trayectoria.');if(s.loaded)reject('loaded','La carga ya se realizó.');p.durationMinutes=s.repairs.pump?30:40;p.budgetCost=30000;p.inventoryCosts={...LOAD};p.effects=['Transferir a bordo 100.000 L combustible, 6.000 L O₂, 2.000 L agua y 400 kg alimentos.'];break;
 case 'angle':if(!Number.isInteger(a.angle)||a.angle<45||a.angle>90)reject('angle-value','El ángulo debe ser entero entre 45 y 90°.');p.durationMinutes=s.angleConfirmed&&s.angle===a.angle?0:5;p.effects=[`Confirmar ${a.angle}°; recomendado 72° ±2°.`];break;
 case 'verify':if(!s.profile)reject('design','Primero confirma un diseño.');if(!s.trajectory)reject('trajectory','Primero calcula la trayectoria.');if(!s.loaded)reject('load','Primero carga la nave.');p.durationMinutes=10;p.budgetCost=10000;p.effects=['Revisión formal de sistemas; riesgos actuales visibles.'];break;
 case 'wait':if(![5,10,20].includes(a.minutes))reject('wait-value','Solo puedes esperar 5, 10 o 20 minutos.');p.durationMinutes=a.minutes;p.effects=[`Esperar ${a.minutes} minutos sin costo material.`];break;
 case 'launch':p.reasons.push(...evaluateLaunch(s).blockedReasons);p.effects=['Ejecutar despegue; consumir combustible estimado de la carga.'];break;
 default:reject('action','Acción desconocida.');
 }
 if(s.budget<p.budgetCost)reject('budget',`Presupuesto insuficiente: necesitas $${number(p.budgetCost)}.`);
 for(const [key,cost] of Object.entries(p.inventoryCosts) as [keyof Inventory,number][])if(s.inventory[key]<cost)reject('inventory-'+key,`No hay ${labels[key]} suficiente: necesitas ${number(cost)}.`);
 if(s.minute+p.durationMinutes>660&&a.type!=='launch')p.effects.push('Advertencia: esta tarea sobrepasará las 11:00 y perderás la ventana.');
 p.allowed=p.reasons.length===0;return p;
}
const metrics=(s:GameState):Metrics=>({minute:s.minute,budget:s.budget,parts:s.inventory.parts,angle:s.angle});
export function applyAction(s:GameState,a:Action):ActionResult{
 const p=previewAction(s,a);if(!p.allowed)return {ok:false,state:s,reasons:p.reasons};
 const n:GameState={...s,inventory:{...s.inventory},cargo:{...s.cargo},repairs:{...s.repairs}};
 n.minute+=p.durationMinutes;n.budget-=p.budgetCost;
 for(const [key,cost] of Object.entries(p.inventoryCosts) as [keyof Inventory,number][])n.inventory[key]-=cost;
 switch(a.type){
 case 'design':n.profile=a.profile;n.trajectory=false;break;
 case 'trajectory':n.trajectory=true;break;
 case 'weather':n.weatherConsulted=true;break;
 case 'repair':n.repairs[a.system]=true;break;
 case 'load':n.loaded=true;n.cargo={...LOAD};break;
 case 'angle':n.angle=a.angle;n.angleConfirmed=true;break;
 case 'verify':n.verified=true;break;
 case 'launch':{const e=evaluateLaunch(s);n.launched=true;n.result={outcome:e.outcome==='success'?'success':'failure',causes:e.risks.map(r=>({...r})),metrics:metrics(s)};n.cargo.fuel-=Math.min(n.cargo.fuel,estimates(s).fuel);break;}
 }
 if(n.minute>660&&!n.result)n.result={outcome:'failure',causes:[{code:'time',text:`Ventana perdida: hora final ${formatTime(n.minute)}, cierre 11:00.`}],metrics:metrics(n)};
 return {ok:true,state:n};
}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function getScore(s:GameState):ScoreBreakdown{
 const m=s.result?.metrics??metrics(s),budget=Math.floor(400*m.budget/1000000),parts=Math.floor(200*m.parts/50),time=Math.floor(250*clamp((660-m.minute)/60)),precision=Math.round(150*clamp(1-Math.abs(m.angle-72)/18));
 return {budget,parts,time,precision,total:s.result?.outcome==='failure'?0:Math.max(0,Math.min(1000,budget+parts+time+precision)),metrics:{...m}};
}
export function getView(s:GameState,draftAngle?:number){
 const repairCount=Number(s.repairs.pump)+Number(s.repairs.antenna);
 const objectives={design:!!s.profile,trajectory:s.trajectory,weather:s.weatherConsulted,repairs:repairCount===2,load:s.loaded,angle:s.angleConfirmed,verify:s.verified,launch:s.launched};
 const planning=objectives.design&&objectives.trajectory&&objectives.weather,preparation=objectives.repairs&&objectives.load&&objectives.angle;
 const phase=s.launched?'Lanzamiento':!planning?'Planificación':!preparation?'Preparación':!s.verified?'Verificaciones':'Lanzamiento';
 const resources=Math.round((Object.keys(INVENTORY) as (keyof Inventory)[]).reduce((sum,k)=>sum+s.inventory[k]/INVENTORY[k],0)/5*100);
 return {minute:s.minute,time:formatTime(s.minute),budget:s.budget,inventory:{...s.inventory},cargo:{...s.cargo},profile:PROFILES[s.profile??'balanced'],profiles:PROFILES,objectives,repairCount,phase,phases:[{name:'Planificación',complete:planning},{name:'Preparación',complete:preparation},{name:'Verificaciones',complete:s.verified},{name:'Lanzamiento',complete:s.launched}],general:{ship:s.profile?PROFILES[s.profile].ship:86,systems:90+5*repairCount,resources},systems:{propulsion:s.repairs.pump,energy:true,lifeSupport:s.loaded,communication:s.repairs.antenna,navigation:s.trajectory},weather:{current:weatherAt(s.minute),forecast:forecast.map(w=>({...w})),unfavorable:isUnfavorable(weatherAt(s.minute))},estimates:{...estimates(s,draftAngle??s.angle),preview:draftAngle!==undefined},confirmedEstimates:estimates(s),launch:evaluateLaunch(s)};
}
export type GameView = ReturnType<typeof getView>;
