import {incomingScenes,incomingScene} from './incoming-scenes.js';
const delay=(random,min,max)=>min+Math.floor(random()*(max-min));
export function checkIncoming(state,now=Date.now(),random=Math.random){
 if(!state.active?.log.length||state.active.outcome||state.finished||(state.cursor===0&&state.tutorial==='active'))return false;
 state.incoming??={nextAt:null,pending:null,history:[],seen:[]};const inbox=state.incoming;
 if(inbox.pending||inbox.history.length>=3)return false;
 if(!Number.isFinite(inbox.nextAt)){inbox.nextAt=now+delay(random,35000,70000);return false;}
 if(now<inbox.nextAt)return false;
 const candidates=Object.keys(incomingScenes).filter(id=>!inbox.seen.includes(id));
 if(!candidates.length)return false;
 const scene=candidates[Math.floor(random()*candidates.length)];
 inbox.pending={id:scene+'-'+now,scene,variant:'office',sender:incomingScenes[scene].sender,arrivedAt:now,open:false,result:null};inbox.seen.push(scene);return true;
}
export function answerIncoming(state,choiceId){
 const pending=state.incoming?.pending;if(!pending||pending.result)return false;
 const scene=incomingScene(pending),choice=scene?.choices.find(c=>c.id===choiceId);if(!choice)return false;
 const before=state.credits,penalty=choice.safe?0:Math.min(before,scene.loss||100);
 state.credits=before-penalty;
 pending.result={label:choice.label,safe:choice.safe,feedback:choice.feedback,signal:scene.signal,penalty,before,after:state.credits};
 state.incoming.history.push({id:pending.id,scene:pending.scene,variant:pending.variant,sender:pending.sender,...pending.result});return true;
}
export function dismissIncoming(state,now=Date.now(),random=Math.random){
 const inbox=state.incoming;if(!inbox?.pending?.result)return false;
 inbox.pending=null;inbox.nextAt=now+delay(random,90000,150000);return true;
}
export function snoozeIncoming(state){const p=state.incoming?.pending;if(!p||p.result)return false;p.open=false;p.snoozedUntil=Date.now()+20000;return true;}
