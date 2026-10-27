// A single clock owns each demonstration. Re-rendering the desktop must never
// restart its click, sound, or completion callback.
export function createActionPlayback({now=Date.now,schedule=setTimeout,cancel=clearTimeout,onPhase=()=>{},onPress=()=>{},onFinish=()=>{}}={}){
 let run=null,timers=[];
 const clear=()=>{timers.forEach(cancel);timers=[];};
 function refresh(){
  if(!run)return;
  const current=run,elapsed=Math.max(0,now()-current.startedAt);
  if(elapsed>=current.duration){clear();run=null;onFinish(current.key);return;}
  if(elapsed>=current.duration*.18&&!current.pressed){current.pressed=true;onPhase('acting',current.key);onPress(current.key);}
  if(elapsed>=current.duration*.76&&!current.result){current.result=true;onPhase('result',current.key);}
 }
 return {
  start(key,duration,startedAt=now()){
   if(run?.key===key){refresh();return false;}
   clear();run={key,duration:Math.max(7000,duration),startedAt,pressed:false,result:false};
   onPhase('preparing',key);
   for(const fraction of [.18,.76,1])timers.push(schedule(refresh,Math.max(0,startedAt+run.duration*fraction-now())));
   return true;
  },
  refresh,
  stop(){clear();run=null;},
  get current(){return run;}
 };
}
