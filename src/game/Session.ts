import {createInitialState,previewAction,applyAction,evaluateLaunch,type GameState,type Action,type ActionPreview} from '../rules';
/** Un solo propietario de tareas y avisos; los tokens nunca se reutilizan al reiniciar. */
export class Session {
 state:GameState=createInitialState();
 private sequence=0;
 private pending:{token:number;action:Action}|null=null;
 private warningState:GameState|null=null;
 get busy(){return this.pending!==null;}
 get warning(){return this.warningState===this.state;}
 begin(action:Action):ActionPreview & {token:number}{
  if(this.busy)return {allowed:false,durationMinutes:0,budgetCost:0,inventoryCosts:{},effects:[],reasons:[{code:'busy',text:'Hay una tarea en curso. Espera a que termine.'}],token:-1};
  const p=previewAction(this.state,action);if(!p.allowed)return {...p,token:-1};
  this.warningState=null;const token=++this.sequence;this.pending={token,action};return {...p,token};
 }
 complete(token:number){if(this.pending?.token!==token)return false;const {action}=this.pending;this.pending=null;const r=applyAction(this.state,action);if(r.ok)this.state=r.state;return r.ok;}
 requestLaunch():'blocked'|'warning'|'launched'{
  const e=evaluateLaunch(this.state);if(this.busy||e.outcome==='blocked')return 'blocked';
  if(this.state.verified&&e.risks.length){this.warningState=this.state;return 'warning';}
  const p=this.begin({type:'launch'});return this.complete(p.token)?'launched':'blocked';
 }
 cancelWarning(){this.warningState=null;}
 confirmLaunch(){if(!this.warning||this.busy||evaluateLaunch(this.state).outcome==='blocked')return false;this.warningState=null;const p=this.begin({type:'launch'});return this.complete(p.token);}
 reset(){++this.sequence;this.pending=null;this.warningState=null;this.state=createInitialState();}
}
export const session=new Session();
