export function captureRevengeLayout(panel,width){
 if(!panel)return null;
 const scroll=panel.querySelector('.revenge-window-scroll'),body=panel.querySelector('.revenge-body');
 if(!scroll||!body)return null;
 return {caseId:panel.dataset.revengeCase,phase:panel.dataset.revengePhase,playback:!!panel.querySelector('.revenge-scene'),width:Number(panel.dataset.revengeLayoutWidth)||width,top:scroll.scrollTop,height:body.offsetHeight};
}
export function restoreRevengeLayout(panel,previous,width){
 if(!panel)return;
 panel.dataset.revengeLayoutWidth=String(width);
 if(!previous||previous.width!==width||previous.caseId!==panel.dataset.revengeCase)return;
 const scroll=panel.querySelector('.revenge-window-scroll'),body=panel.querySelector('.revenge-body'),phase=panel.dataset.revengePhase;
 if(!scroll||!body)return;
 const playback=!!panel.querySelector('.revenge-scene');
 // Keep the scroll range as well as scrollTop. A shorter result must not clamp
 // the viewport upward when the last animated stage is replaced.
 if(previous.playback&&(playback||phase==='won')||previous.phase==='won'&&phase==='won')body.style.minHeight=Math.max(previous.height,body.offsetHeight)+'px';
 if(previous.phase===phase||previous.phase==='quiz'&&phase==='answered'||previous.playback&&phase==='won')scroll.scrollTop=previous.top;
}

// Filter opacity composes with each prop's own transform/opacity animation.
// Every object occupies its final space from frame one.
const entrances=new WeakMap();
export function syncRevengeEntrances(root,elapsed){
 for(const element of root.querySelectorAll('[data-rv-enter]')){
  let animation=entrances.get(element);
  if(!animation){animation=element.animate([{filter:'opacity(0)'},{filter:'opacity(1)'}],{duration:500,delay:Number(element.dataset.rvEnter),easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});entrances.set(element,animation);}
  animation.currentTime=elapsed;
 }
}
