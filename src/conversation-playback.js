// Presentation only: game rules have already run. Never applies credits or permissions.
import {a11yDelay} from './a11y-timing.js';
export function playConversation({start,total,speaker,text='',ended=false,current=()=>true,frame,done,schedule=setTimeout,cancel=clearTimeout}){
 let timer,stopped=false;
 const later=(callback,delay)=>{timer=schedule(()=>{if(!stopped&&current())callback();},delay);};
 frame({phase:'sending',speaker:'Você',visible:start});
 later(()=>{
  frame({phase:'reply',speaker,visible:Math.min(start+1,total)});
  later(()=>{
   frame({phase:'reading',speaker:'',visible:total});
   later(done,a11yDelay(ended?1800:380));
  },a11yDelay(Math.min(1050,550+text.length*2)));
 },a11yDelay(180));
 return ()=>{stopped=true;cancel(timer);};
}

export function defenseVisible(a){return !!(a?.defenseOpened||a?.learningDefense);}
