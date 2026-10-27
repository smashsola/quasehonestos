import {incomingScenes,incomingScene} from './incoming-scenes.js';
export const incomingDay=state=>state.dayBreak?.completedDay||Math.min(6,Math.floor((state.cursor||0)/5)+1);
const delay=(random,min,max)=>min+Math.floor(random()*(max-min));
export function checkIncoming(state,now=Date.now(),random=Math.random){
 const active=state.active,ready=active?.mode==='defense'?active.chatStage==='ready'&&active.murmurHeard&&!active.actionPending&&!active.ransomwareDeadline:!!active?.log.length;
 if(!ready||active.outcome||state.finished||(state.cursor===0&&['active','defense'].includes(state.tutorial)))return false;
 state.incoming??={nextAt:null,pending:null,history:[],seen:[]};const inbox=state.incoming;
 const day=incomingDay(state);if(inbox.pending||inbox.history.length>=12||inbox.history.filter(h=>(h.day||1)===day).length>=2)return false;
 if(!Number.isFinite(inbox.nextAt)){inbox.nextAt=now+delay(random,25000,80000);return false;}
 if(now<inbox.nextAt)return false;
 const candidates=Object.keys(incomingScenes).filter(id=>!inbox.seen.includes(id));
 if(!candidates.length)return false;
 const scene=candidates[Math.floor(random()*candidates.length)];
 inbox.pending={id:scene+'-'+now,scene,variant:'office',sender:incomingScenes[scene].sender,subject:incomingScenes[scene].subject||'Recado do expediente',audience:state.audience,day,arrivedAt:now,open:false,result:null};inbox.seen.push(scene);return true;
}
export function markIncomingSeen(state){
 const pending=state.incoming?.pending;if(!pending||pending.seen)return false;
 pending.seen=true;return true;
}
export function answerIncoming(state,choiceId){
 const pending=state.incoming?.pending;if(!pending||pending.result)return false;
 const scene=incomingScene(pending),choice=scene?.choices.find(c=>c.id===choiceId);if(!choice)return false;
 const before=Number.isFinite(state.credits)?state.credits:0,penalty=choice.safe||choice.partial?0:Math.max(0,scene.loss||100),reward=choice.safe?(scene.reward||20):0;
 state.credits=before+reward-penalty;
 pending.result={label:choice.label,safe:choice.safe,partial:!!choice.partial,feedback:choice.feedback,signal:scene.signal,penalty,reward,before,after:state.credits};
 state.incoming.tutorialSeen=true;
 state.incoming.history.push({id:pending.id,scene:pending.scene,variant:pending.variant,sender:pending.sender,subject:pending.subject,audience:pending.audience,arrivedDay:pending.day,day:incomingDay(state),answeredAt:Date.now(),...pending.result});return true;
}
export function dismissIncoming(state,now=Date.now(),random=Math.random){
 const inbox=state.incoming;if(!inbox?.pending?.result)return false;
 inbox.pending=null;inbox.nextAt=now+delay(random,90000,180000);return true;
}
export function snoozeIncoming(state){const p=state.incoming?.pending;if(!p||p.result)return false;p.open=false;p.snoozedUntil=Date.now()+20000;return true;}
