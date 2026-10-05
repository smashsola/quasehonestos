import {defenseScenes} from './dialogue.js';
const senders={prize:'Equipe Batata Dourada',support:'Plantão Torradeira Digital',club:'Convites · Clube da Colher',update:'Central · Skins Cósmicas'};
const delay=(random,min,max)=>min+Math.floor(random()*(max-min));
export function checkIncoming(state,now=Date.now(),random=Math.random){
 if(!state.active?.log.length||state.finished)return false;
 state.incoming??={nextAt:null,pending:null,history:[],seen:[]};const inbox=state.incoming;
 if(inbox.pending||inbox.history.length>=3)return false;
 if(!Number.isFinite(inbox.nextAt)){inbox.nextAt=now+delay(random,35000,70000);return false;}
 if(now<inbox.nextAt)return false;
 const candidates=Object.keys(defenseScenes).filter(id=>!inbox.seen.includes(id));
 if(!candidates.length)return false;
 const scene=candidates[Math.floor(random()*candidates.length)];
 inbox.pending={id:scene+'-'+now,scene,sender:senders[scene],arrivedAt:now,open:false,result:null};inbox.seen.push(scene);return true;
}
export function answerIncoming(state,choiceId){
 const pending=state.incoming?.pending;if(!pending||pending.result)return false;
 const scene=defenseScenes[pending.scene],choice=scene.choices.find(c=>c.id===choiceId);if(!choice)return false;
 pending.result={label:choice.label,safe:choice.safe,feedback:choice.feedback,signal:scene.signal};
 state.incoming.history.push({id:pending.id,scene:pending.scene,sender:pending.sender,...pending.result});return true;
}
export function dismissIncoming(state,now=Date.now(),random=Math.random){
 const inbox=state.incoming;if(!inbox?.pending?.result)return false;
 inbox.pending=null;inbox.nextAt=now+delay(random,90000,150000);return true;
}
export function snoozeIncoming(state){const p=state.incoming?.pending;if(!p||p.result)return false;p.open=false;p.snoozedUntil=Date.now()+20000;return true;}
