import Phaser from 'phaser';
import {getView,getScore,previewAction,formatTime,type Action,type ProfileId,type GameView} from '../rules';
import {session} from './Session';
interface Asset {path:string;width:number;height:number;frameWidth?:number;frameHeight?:number;frames?:number;animations?:Record<string,number[]>;crops?:Record<string,{x:number;y:number;width:number;height:number}>}
interface Manifest {version:1;assets:Record<string,Asset>}
const assetUrl=(path:string)=>`${import.meta.env.BASE_URL}assets/${path}`;
const rooms=[['design','Diseño de la Nave'],['control','Control de Misión'],['weather','Meteorología'],['engineering','Ingeniería y Reparaciones'],['fuel','Combustible'],['systems','Sistemas Críticos'],['storage','Almacén y Recursos'],['airlock','Pasillo / Esclusa'],['observation','Sala de Observación']] as const;
const nf=(n:number)=>n.toLocaleString('es-ES');
const money=(n:number)=>'$'+nf(n);
const text=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export class BootScene extends Phaser.Scene {
 constructor(){super('BootScene');}
 preload(){this.load.json('manifest',assetUrl('manifest.json'));this.load.on('loaderror',(file:Phaser.Loader.File)=>{document.querySelector('#app')!.textContent=`No se pudo cargar ${file.key}. Ejecuta el juego por HTTP y revisa los archivos.`;});}
 create(){
  const manifest=this.cache.json.get('manifest') as Manifest;
  for(const [key,a] of Object.entries(manifest.assets)){if(a.frameWidth)this.load.spritesheet(key,assetUrl(a.path),{frameWidth:a.frameWidth,frameHeight:a.frameHeight!});else this.load.image(key,assetUrl(a.path));}
  this.load.once('complete',()=>{
   for(const [key,a] of Object.entries(manifest.assets)){
    this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    for(const [name,frames] of Object.entries(a.animations??{}))if(!this.anims.exists(`${key}-${name}`))this.anims.create({key:`${key}-${name}`,frames:frames.map(frame=>({key,frame})),frameRate:name==='work'?5:4,repeat:-1});
    for(const [name,crop] of Object.entries(a.crops??{}))this.textures.get(key).add(name,0,crop.x,crop.y,crop.width,crop.height);
   }
   this.scene.start('BaseScene');this.scene.launch('UIScene');
  });this.load.start();
 }
}
export class BaseScene extends Phaser.Scene {
 characters:Phaser.GameObjects.Sprite[]=[];
 rocket!:Phaser.GameObjects.Image;
 constructor(){super('BaseScene');}
 create(){
  this.cameras.main.setBackgroundColor('#0a1326');this.characters=[];
  const g=this.add.graphics();g.fillStyle(0x17273c).fillRect(280,180,830,475);g.lineStyle(3,0x496980).strokeRect(280,180,830,475);
  rooms.forEach(([id],i)=>{const x=290+(i%3)*270,y=190+Math.floor(i/3)*150;this.add.image(x,y,'base-rooms',id).setOrigin(0).setDisplaySize(260,140);const kind=i>=7?'astronaut':'technician';const sprite=this.add.sprite(x+205,y+105,kind).setScale(2.5).play(`${kind}-idle`);this.characters.push(sprite);});
  this.add.image(1130,190,'terrain').setOrigin(0).setDisplaySize(450,450);
  this.add.image(1280,250,'tower').setOrigin(0).setDisplaySize(115,340);
  this.rocket=this.add.image(1410,570,'rocket').setOrigin(.5,1).setScale(3);
  this.events.once('shutdown',()=>{this.tweens.killAll();this.time.removeAllEvents();this.characters=[];});
 }
 work(active:boolean,action?:Action){this.characters.forEach((s,i)=>{const kind=i>=7?'astronaut':'technician';const working=active&&((action?.type==='repair'&&i===3)||(action?.type==='load'&&i===4));s.play(`${kind}-${working?'work':'idle'}`,true);});}
}
const systemLabels:Record<keyof GameView['systems'],string>={propulsion:'Propulsión',energy:'Energía',lifeSupport:'Soporte vital',communication:'Comunicación',navigation:'Navegación'};
const objectiveLabels={design:'Diseñar la nave',trajectory:'Calcular trayectoria',weather:'Consultar clima',repairs:'Reparar fallas',load:'Cargar combustible',angle:'Confirmar ángulo',verify:'Completar verificaciones',launch:'Ejecutar despegue'};
export class UIScene extends Phaser.Scene {
 private root!:HTMLDivElement;
 private room:string|null=null;
 private draft=72;
 private chosen:ProfileId='balanced';
 private pending:Action|null=null;
 private message='Explora la base. Las fases orientan: no son barreras de lanzamiento.';
 private progress=0;
 private launchAnimating=false;
 private handler=(event:Event)=>this.click(event);
 private modalOrigin:string|null=null;
 private modalId:string|null=null;
 private keyboardHandler=(event:KeyboardEvent)=>{
  if(event.key!=='Tab')return;
  const dialog=this.root.querySelector<HTMLElement>('[role=dialog]');if(!dialog)return;
  const buttons=Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
  const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
  event.preventDefault();buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();
 };
 private focusKey(element:Element|null){
  if(!element||!this.root.contains(element))return null;
  const el=element as HTMLElement;
  if(el.dataset.testid)return `[data-testid="${el.dataset.testid}"]`;
  if(el.dataset.profile)return `[data-profile="${el.dataset.profile}"]`;
  return null;
 }
 private restoreFocus(previous:string|null){
  const dialog=this.root.querySelector<HTMLElement>('[role=dialog]');
  const id=dialog?.dataset.testid??null;
  const find=(key:string|null)=>key?this.root.querySelector<HTMLElement>(key):null;
  const available=(el:HTMLElement|null)=>el&&!el.matches(':disabled')?el:null;
  let target:HTMLElement|null=null;
  if(dialog){
   const saved=available(find(previous));
   target=id===this.modalId&&saved&&dialog.contains(saved)?saved:dialog.querySelector('button:not(:disabled)');
  }else{
   target=available(find(this.modalId?this.modalOrigin:previous));
   // Los controles deshabilitados no pueden recibir foco nativo. Durante una
   // tarea o un despegue se enfoca su estado; después, el panel de origen.
   if(!target&&(this.modalId||previous))target=this.root.querySelector<HTMLElement>('[data-testid=progress], [data-testid=launch-animation]')
    ??available(find(this.modalOrigin))
    ??this.root.querySelector<HTMLElement>('[data-testid=repairs-panel]');
  }
  this.modalId=id;target?.focus({preventScroll:true});
 }
 constructor(){super('UIScene');}
 create(){
  this.room=null;this.draft=72;this.chosen='balanced';this.pending=null;this.progress=0;this.launchAnimating=false;this.message='Explora la base. Las fases orientan: no son barreras de lanzamiento.';
  this.modalOrigin=null;this.modalId=null;
  this.root=document.createElement('div');this.root.className='game-ui';this.root.addEventListener('click',this.handler);this.root.addEventListener('keydown',this.keyboardHandler);this.add.dom(0,0,this.root).setOrigin(0);this.render();
  this.events.once('shutdown',()=>{this.root.removeEventListener('click',this.handler);this.root.removeEventListener('keydown',this.keyboardHandler);this.tweens.killAll();this.time.removeAllEvents();this.root.remove();});
 }
 private actionButton(id:string,label:string,action:Action){const p=previewAction(session.state,action);const complete=(action.type==='repair'&&session.state.repairs[action.system])||(action.type==='weather'&&session.state.weatherConsulted)||(action.type==='trajectory'&&session.state.trajectory);const disabled=session.busy||!!session.state.result||complete;return `<button data-testid="${id}" ${disabled?'disabled':''} title="${text([...p.effects,...p.reasons.map(r=>r.text)].join(' '))}">${label}${complete?' ✓':` <small>${p.durationMinutes} min · ${money(p.budgetCost)}${p.inventoryCosts.parts?` · ${p.inventoryCosts.parts} rep.`:''}</small>`}</button>`;}
 private details(v:GameView){
  if(!this.room)return '';const a=this.actionButton.bind(this);let content='';
  switch(this.room){
   case 'design':{const p=v.profiles[this.chosen];content=`<p>Perfiles cerrados. Rediseñar paga de nuevo e invalida la trayectoria. No se rediseña después de cargar.</p><div class="row">${Object.entries(v.profiles).map(([id,p])=>`<button data-profile="${id}" class="${this.chosen===id?'selected':''}" ${session.busy?'disabled':''}>${p.name}<small>${money(p.cost)} · 10 min</small></button>`).join('')}</div><div class="blueprint">◇ NAVE / ${p.name}<br>Masa ${p.mass} % · Potencia ${p.power} % · Resistencia ${p.resistance} %<br>Estado Nave ${p.ship} % · Base ${nf(p.fuel)} L · ${p.orbit} min</div>${a('design-'+this.chosen,'Confirmar diseño',{type:'design',profile:this.chosen})}`;break;}
   case 'control':content=`<p>Trayectoria terrestre, mecánica de juego (no física orbital real).</p><div class="orbit">◉ · · · · · · · · · · · ◇<br>TIERRA · · · · · · · ÓRBITA</div><p>${session.state.trajectory?'Trayectoria válida. Recalcular no cobra ni consume tiempo.':'Falta calcular una trayectoria válida para el diseño.'}</p>${a('trajectory','Calcular trayectoria',{type:'trajectory'})}`;break;
   case 'weather':content=`<p>${v.weather.unfavorable?'DESFAVORABLE':'FAVORABLE'} ahora, ${v.time}: viento ${v.weather.current.wind} km/h · lluvia ${v.weather.current.rain} % · nubes ${v.weather.current.cloud} %.</p><table><thead><tr><th>Horario fijo</th><th>Viento</th><th>Lluvia</th><th>Nubes</th></tr></thead><tbody>${v.weather.forecast.map(w=>`<tr><td>${w.label}</td><td>${w.wind} km/h</td><td>${w.rain} %</td><td>${w.cloud} %</td></tr>`).join('')}</tbody></table><p>Desfavorable con viento &gt;40 o lluvia &gt;30. Nubosidad informativa. Esperar no introduce azar.</p>${a('weather','Consultar clima',{type:'weather'})}`;break;
   case 'engineering':content=`<p>Reparar es opcional para lanzar, pero cada falla sin reparar causa fallo determinista. El trabajo dura 2 segundos reales, no 20 minutos reales.</p><p>Bomba: ${session.state.repairs.pump?'100':'76'} % · Antena: ${session.state.repairs.antenna?'100':'68'} %.</p><p>Usa los controles de Reparaciones Pendientes en el panel inferior. Progreso y personal de trabajo se muestran al confirmar.</p>`;break;
   case 'fuel':content=`<p>Almacén: ${nf(v.inventory.fuel)} L. A bordo: ${nf(v.cargo.fuel)} L.</p><p>Transferencia: 100.000 L combustible, 6.000 L O₂, 2.000 L agua, 400 kg alimentos. Sin bomba reparada tarda 40 minutos, con bomba 30.</p><p>${session.state.loaded?'Carga completada, no repetible.':'Requiere diseño y trayectoria.'}</p>${a('load','Cargar nave',{type:'load'})}`;break;
   case 'systems':content=`<ul class="systems">${Object.entries(v.systems).map(([key,ok])=>`<li class="${ok?'ok':'danger'}">${ok?'✓':'✕'} ${systemLabels[key as keyof typeof systemLabels]}</li>`).join('')}</ul><p>Revisión formal ${session.state.verified?'realizada':'pendiente'}. Los datos siempre están visibles. Omitir la revisión no es un riesgo por sí solo.</p>${a('verify','Verificar sistemas críticos',{type:'verify'})}<p>Riesgos actuales: ${v.launch.risks.map(r=>r.text).join(' ')||'ninguno'}.</p>`;break;
   case 'storage':content=`<h3>Inventario restante / carga a bordo</h3><table><tbody>${(['fuel','oxygen','water','food'] as const).map((k,i)=>`<tr><td>${['Combustible L','Oxígeno L','Agua L','Alimentos kg'][i]}</td><td>${nf(v.inventory[k])}</td><td>${nf(v.cargo[k])}</td></tr>`).join('')}<tr><td>Repuestos u.</td><td>${v.inventory.parts}</td><td>—</td></tr></tbody></table><p>Los consumibles cargados se transfieren; no desaparecen. La barra Recursos mide inventario restante, no aptitud de vuelo.</p>`;break;
   case 'airlock':content='<div class="orbit">▣ ESCLUSA / ACCESO A PLATAFORMA</div><p>La tripulación espera autorización. Explorar esta sala no consume tiempo ni recursos. Usa Lanzar misión cuando estés listo.</p>';break;
   case 'observation':content='<div class="orbit">✦ HORIZONTE / VENTANA DE OBSERVACIÓN ✦</div><p>Desde aquí se observa la plataforma. No hay acciones ficticias ni avance del reloj. Lee el pronóstico antes de decidir esperar.</p>';break;
  }
  const title=rooms.find(([id])=>id===this.room)?.[1];return `<section class="detail panel" data-testid="detail"><header><h2>${title}</h2><button data-testid="close-panel">Cerrar</button></header>${content}</section>`;
 }
 render(){
  const focused=this.focusKey(document.activeElement);
  const s=session.state,v=getView(s,this.draft),a=this.actionButton.bind(this);
  const launchReasons=[...v.launch.blockedReasons.map(r=>r.text),...(session.busy?['Hay una tarea en curso.']:[])];
  this.root.innerHTML=`
   <header class="top panel"><div><h1>🚀 Nivel 1: Despegue</h1><p>Preparación de la misión</p></div><nav>${v.phases.map((p,i)=>`<span class="${v.phase===p.name?'active':''}">${p.complete?'✓':i+1} ${p.name}</span>`).join('')}</nav><strong data-testid="clock">Día 1, ${v.time}</strong></header>
   <section class="resources panel">${[money(v.budget),nf(v.inventory.fuel)+' L',nf(v.inventory.oxygen)+' L',nf(v.inventory.water)+' L',nf(v.inventory.food)+' kg',v.inventory.parts+' u.'].map((val,i)=>`<div><i style="background-image:url('${assetUrl('resource-icons.png')}');background-position:${-i*32}px 0"></i><span>${['Presupuesto','Combustible','Oxígeno O₂','Agua','Alimentos','Repuestos'][i]}<strong ${i===0?'data-testid="budget"':''}>${val}</strong></span></div>`).join('')}</section>
   <aside class="objectives panel" data-testid="objectives"><h2>Objetivos del Nivel</h2><ul>${Object.entries(objectiveLabels).map(([k,label])=>`<li class="${v.objectives[k as keyof typeof v.objectives]?'ok':''}">${v.objectives[k as keyof typeof v.objectives]?'✓':'□'} ${label}${k==='repairs'?` (${v.repairCount}/2)`:''}</li>`).join('')}</ul><p>La ejecución de despegue no significa éxito.</p><p>Ventana: 10:00–11:00<br>Clima favorable: hasta 10:39</p><p>Fase orientativa:<br><b>${v.phase}</b></p></aside>
   <div class="room-grid" ${this.launchAnimating?'hidden':''}>${rooms.map(([id,label])=>`<button class="room-button" data-testid="room-${id}"><span>${label}${id==='engineering'&&v.repairCount<2?' !':''}</span></button>`).join('')}</div>
   <div class="platform-label">PLATAFORMA DE LANZAMIENTO<br>Cohete ${s.profile?v.profile.name:'sin diseñar'}</div>
   <div class="status panel" role="status">${text(this.message)}</div>
   <section class="parameters panel"><h2>Parámetros de Lanzamiento</h2><div class="row"><button data-testid="angle-minus" ${session.busy||this.draft<=45||s.result?'disabled':''}>−</button><b>${this.draft}° borrador</b><button data-testid="angle-plus" ${session.busy||this.draft>=90||s.result?'disabled':''}>+</button>${a('angle-confirm','Confirmar ángulo',{type:'angle',angle:this.draft})}</div><p>45–90° · Recomendado 72° ±2° ${v.estimates.correct?'✓':'✕'}<br>Previsualización: ${nf(v.estimates.fuel)} L · ${v.estimates.orbitMinutes.toFixed(1)} min a órbita<br>Confirmado: ${s.angle}° ${s.angleConfirmed?'✓':'(inicial, no confirmado)'}</p><div class="row"><span>Esperar:</span>${([5,10,20] as const).map(minutes=>a('wait-'+minutes,`${minutes} min`,{type:'wait',minutes})).join('')}</div></section>
   <section class="repairs panel" data-testid="repairs-panel" tabindex="-1"><h2>Reparaciones Pendientes (${2-v.repairCount})</h2><p>Bomba de combustible: ${s.repairs.pump?100:76} % → 100 %</p>${a('repair-pump','Reparar bomba',{type:'repair',system:'pump'})}<p>Antena de comunicación: ${s.repairs.antenna?100:68} % → 100 %</p>${a('repair-antenna','Reparar antena',{type:'repair',system:'antenna'})}</section>
   <section class="general panel"><h2>Estado General</h2>${Object.entries(v.general).map(([k,n])=>`<div class="bar-label">${({ship:'Nave',systems:'Sistemas',resources:'Recursos'})[k as keyof typeof v.general]} ${n} %<div class="bar"><span style="width:${n}%"></span></div></div>`).join('')}<small>Recursos = inventario restante.</small><button class="launch" data-testid="launch" ${launchReasons.length||this.launchAnimating?'disabled':''}>LANZAR MISIÓN</button></section>
   <div class="launch-reasons panel">${launchReasons.length?'Bloqueos: '+launchReasons.join(' '):'Sin bloqueos físicos.'}<br>${v.launch.risks.length?'Riesgos (permiten lanzar): '+v.launch.risks.map(r=>r.text).join(' '):'Sin riesgos actuales.'}</div>
   ${this.launchAnimating?'<div class="animation-label" data-testid="launch-animation" tabindex="-1">DESPEGUE EN CURSO</div>':this.details(v)}
   ${session.busy?`<div class="progress panel" data-testid="progress" tabindex="-1">Tarea confirmada en curso · sin cancelación <div class="bar"><span style="width:${Math.round(this.progress*100)}%"></span></div></div>`:''}
   ${this.pending?this.confirmation(this.pending):''}
   ${session.warning?`<section class="dialog panel" data-testid="risk-warning" role="dialog" aria-modal="true" aria-labelledby="risk-title"><h2 id="risk-title">Riesgos detectados en la revisión</h2><ul>${v.launch.risks.map(r=>`<li>${r.text}</li>`).join('')}</ul><p>Estos riesgos provocarán fallo. Cancelar no consume tiempo.</p><button data-testid="cancel-warning">Cancelar</button><button data-testid="launch-anyway" class="danger">Lanzar de todos modos</button></section>`:''}`;
  const dialog=this.root.querySelector<HTMLElement>('[role=dialog]');
  // El fondo modal no recibe puntero ni foco; cada render recrea los controles.
  for(const child of Array.from(this.root.children)) (child as HTMLElement).inert=!!dialog&&child!==dialog;
  this.restoreFocus(focused);
 }
 private confirmation(action:Action){const p=previewAction(session.state,action);return `<section class="dialog panel" data-testid="confirmation" role="dialog" aria-modal="true" aria-labelledby="confirmation-title"><h2 id="confirmation-title">Confirmar acción</h2><p>${p.durationMinutes} min de juego · ${money(p.budgetCost)}${p.inventoryCosts.parts?` · ${p.inventoryCosts.parts} repuestos`:''}</p><p>${p.effects.map(text).join('<br>')}</p><p class="danger">${p.reasons.map(r=>text(r.text)).join(' ')}</p><button data-testid="cancel-action">Cancelar</button><button data-testid="confirm-action" ${p.allowed?'':'disabled'}>Confirmar</button></section>`;}
 private click(event:Event){
  const dialog=this.root.querySelector<HTMLElement>('[role=dialog]');
  if(dialog&&!dialog.contains(event.target as Node)){event.preventDefault();return;}
  const button=(event.target as HTMLElement).closest('button');if(!button||button.disabled)return;const id=button.dataset.testid;
  if(id?.startsWith('room-')){this.room=id.slice(5);this.render();return;}
  if(id==='close-panel'){this.room=null;this.render();return;}
  if(id==='cancel-warning'){session.cancelWarning();this.render();return;}
  if(id==='cancel-action'){this.pending=null;this.render();return;}
  if(session.busy||session.state.result)return;
  if(button.dataset.profile){this.chosen=button.dataset.profile as ProfileId;this.render();return;}
  if(id==='angle-minus'||id==='angle-plus'){this.draft+=id==='angle-plus'?1:-1;this.render();return;}
  if(id==='confirm-action'&&this.pending){const action=this.pending;this.pending=null;this.execute(action);return;}
  if(id==='launch'){this.modalOrigin=this.focusKey(button);this.pending=null;this.room=null;const result=session.requestLaunch();if(result==='launched')this.startLaunch();else if(result==='blocked')this.message=getView(session.state).launch.blockedReasons.map(r=>r.text).join(' ');this.render();return;}
  if(id==='launch-anyway'){if(session.confirmLaunch())this.startLaunch();this.render();return;}
  let action:Action|undefined;
  if(id?.startsWith('design-'))action={type:'design',profile:this.chosen};
  if(id==='trajectory')action={type:'trajectory'};if(id==='weather')action={type:'weather'};
  if(id==='repair-pump'||id==='repair-antenna')action={type:'repair',system:id==='repair-pump'?'pump':'antenna'};
  if(id==='load')action={type:'load'};if(id==='angle-confirm')action={type:'angle',angle:this.draft};if(id==='verify')action={type:'verify'};
  if(id?.startsWith('wait-'))action={type:'wait',minutes:Number(id.slice(5)) as 5|10|20};
  if(action){this.modalOrigin=this.focusKey(button);this.pending=action;session.cancelWarning();this.render();}
 }
 private execute(action:Action){
  const p=session.begin(action);if(!p.allowed){this.message=p.reasons.map(r=>r.text).join(' ');this.render();return;}
  const finish=()=>{if(!session.complete(p.token))return;this.progress=0;(this.scene.get('BaseScene') as BaseScene).work(false);this.message=p.effects.join(' ');this.render();if(session.state.result)this.showResult();};
  if(action.type==='repair'||action.type==='load'){
   this.progress=0;(this.scene.get('BaseScene') as BaseScene).work(true,action);this.render();
   const target={value:0};this.tweens.add({targets:target,value:1,duration:2000,onUpdate:()=>{this.progress=target.value;const bar=this.root.querySelector<HTMLElement>('[data-testid="progress"] .bar span');if(bar)bar.style.width=`${Math.round(this.progress*100)}%`;}});
   this.time.delayedCall(2000,finish);
  }else finish();
 }
 private startLaunch(){this.room=null;this.launchAnimating=true;this.scene.launch('LaunchScene');}
 showResult(){this.launchAnimating=false;this.scene.stop('LaunchScene');this.scene.stop('BaseScene');this.scene.launch('ResultScene');this.scene.stop();}
}
export class LaunchScene extends Phaser.Scene {
 constructor(){super('LaunchScene');}
 create(){
  const base=this.scene.get('BaseScene') as BaseScene;base.rocket.setVisible(false);
  const rocket=this.add.image(1410,570,'rocket').setOrigin(.5,1).setScale(3);
  const flame=this.add.sprite(1410,590,'flame').setScale(3).play('flame-burn');
  const smoke=this.add.sprite(1410,600,'smoke').setScale(4).play('smoke-burn');
  const successful=session.state.result?.outcome==='success';
  this.tweens.add({targets:[rocket,flame],y:successful?'-=750':'-=140',duration:successful?6500:2200,ease:'Cubic.easeIn'});
  this.tweens.add({targets:smoke,scaleX:7,alpha:.2,duration:successful?6500:3500});
  if(!successful)this.time.delayedCall(2200,()=>{rocket.setTint(0xff9955);flame.setVisible(false);this.add.text(1230,300,'ANOMALÍA DETECTADA',{fontFamily:'monospace',fontSize:'22px',color:'#f3cc62'});});
  this.time.delayedCall(successful?7000:4000,()=>{(this.scene.get('UIScene') as UIScene).showResult();});
  this.events.once('shutdown',()=>{this.tweens.killAll();this.time.removeAllEvents();});
 }
}
export class ResultScene extends Phaser.Scene {
 constructor(){super('ResultScene');}
 create(){
  this.cameras.main.setBackgroundColor('#0a1326');const score=getScore(session.state),r=session.state.result!;
  const root=document.createElement('div');root.className='result-ui';root.innerHTML=`<section class="panel result" data-testid="result"><h1>${r.outcome==='success'?'Misión completada':'Misión fallida'}</h1><p>Hora de preparación: ${formatTime(score.metrics.minute)}</p><p>Presupuesto restante ${money(score.metrics.budget)} · Repuestos ${score.metrics.parts} u.</p><ul>${r.causes.map(c=>`<li>${text(c.text)}</li>`).join('')}</ul><h2 data-testid="score">${nf(score.total)} / 1.000</h2><div data-testid="breakdown" class="score-grid"><div>Presupuesto<strong>${score.budget}</strong></div><div>Repuestos<strong>${score.parts}</strong></div><div>Tiempo<strong>${score.time}</strong></div><div>Precisión<strong>${score.precision}</strong></div></div><p>${r.outcome==='failure'?'Componentes de diagnóstico: una misión fallida no obtiene puntaje.':'Sin riesgos. La preparación hizo posible el éxito.'}</p><p>Combustible restante a bordo: ${nf(session.state.cargo.fuel)} L.</p><button data-testid="restart">Reiniciar</button></section>`;
  const restart=()=>{session.reset();this.scene.stop('LaunchScene');this.scene.stop('UIScene');this.scene.stop('BaseScene');this.scene.start('BaseScene');this.scene.launch('UIScene');};root.querySelector('button')!.addEventListener('click',restart);this.add.dom(0,0,root).setOrigin(0);root.querySelector<HTMLButtonElement>('button')!.focus({preventScroll:true});
  this.events.once('shutdown',()=>{this.time.removeAllEvents();this.tweens.killAll();root.querySelector('button')?.removeEventListener('click',restart);root.remove();});
 }
}
