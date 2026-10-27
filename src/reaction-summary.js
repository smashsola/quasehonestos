// One reveal clock per completed action, retained across DOM reconstruction.
const clocks=new WeakMap();
export const reactionSummaryDelays={
 'defense-consequence-icon':0,'defense-reaction-burst':0,
 'defense-reaction-kicker':0,'defense-reaction-title':40,
 'defense-reaction-note':70,'defense-reaction-feedback':100,
 'defense-consequence-footnote':150,'defense-loss':220,
 'defense-tutorial-finish':260,'revenge-invitation':320,
 'defense-feedback-actions':420,
};
export function reactionSummaryDelay(element){
 if(element.id==='defense-reaction-title')return 40;
 for(const name of element.classList)if(name in reactionSummaryDelays)return reactionSummaryDelays[name];
 return 100;
}
export function createReactionSummary({requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame}={}){
 let frame=0;
 return function sync(panel,active,now=performance.now()){
  cancelFrame(frame);frame=0;if(!panel||!active)return;
  let started=clocks.get(active);if(started===undefined){started=now;clocks.set(active,started);}
  const elapsed=Math.max(0,now-started),entries=[];
  for(const element of panel.children){
   const delay=reactionSummaryDelay(element),animation=element.animate([{filter:'opacity(0)'},{filter:'opacity(1)'}],{duration:650,delay,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'});
   animation.currentTime=elapsed;
   const interactive=element.matches('.revenge-invitation,.defense-feedback-actions');
   if(interactive){element.inert=elapsed<delay+650;entries.push({element,until:started+delay+650});}
  }
  function tick(time){let waiting=false;for(const {element,until} of entries){if(!element.isConnected)continue;element.inert=time<until;waiting ||= element.inert;}if(waiting)frame=requestFrame(tick);}
  tick(now);
 };
}
