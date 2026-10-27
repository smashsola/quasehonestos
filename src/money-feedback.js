// Presentation only: the game settles the real balance before this clock starts.
export function createMoneyTween(initial=0){
 let target=initial,run=null,sequence=0;
 function sample(now){
  if(!run)return {value:target,delta:0,progress:1,done:true,id:sequence};
  const progress=Math.max(0,Math.min(1,(now-run.start)/run.duration)),ease=progress*progress*(3-2*progress);
  return {...run,value:progress===1?target:Math.round(run.from+(target-run.from)*ease),count:Math.round(run.delta*ease),progress,done:progress===1};
 }
 return {sample,
  retarget(next,now,delay=0){
   if(!Number.isFinite(next)||next===target)return null;
   const from=sample(now).value,delta=next-target;target=next;
   run={id:++sequence,from,to:next,delta,start:now+delay,duration:Math.min(1900,1050+Math.sqrt(Math.abs(delta))*35)};
   return sample(now);
  },
  reset(next){target=next;run=null;sequence++;},
 };
}
export function installMoneyFeedback(initial){
 const clock=createMoneyTween(initial);let frame=0,removal=0,banner=null,lastBeat=-1,inlineResult=null;
 const currency=value=>'C$ '+Math.round(value).toLocaleString('pt-BR');
 const signed=(value,direction=value)=>(direction<0?'−':'+')+' C$ '+Math.abs(Math.round(value)).toLocaleString('pt-BR');
 const emit=(name,detail)=>document.dispatchEvent(new CustomEvent(name,{detail}));
 function paint(sample){
  document.querySelectorAll('[data-balance-value]').forEach(node=>{const text=currency(sample.value);if(node.textContent!==text)node.textContent=text;});
  if(banner){banner.querySelector('strong').textContent=signed(sample.count??sample.delta,sample.delta);banner.querySelector('[data-money-total]').textContent=currency(sample.value);banner.style.setProperty('--money-progress',sample.progress);}
  document.querySelectorAll('[data-money-delta]').forEach(node=>{const amount=Number(node.dataset.moneyDelta);if(amount===sample.delta)node.textContent=signed(sample.count??amount,sample.delta);});
  if(inlineResult&&!inlineResult.isConnected)inlineResult=primaryResult();
  if(inlineResult&&!sample.done)inlineResult.classList.add('is-money-counting');
 }
 function primaryResult(){return document.querySelector('.incoming-message .incoming-money')||document.querySelector('.tutorial-grant')||document.querySelector('.revenge-final .revenge-receipt')||(!document.querySelector('.revenge-window')?document.querySelector('.defense-reaction .defense-loss'):null);}
 function tick(now){
  const sample=clock.sample(now);paint(sample);
  const beat=Math.floor((now-sample.start)/85);
  if(now>=sample.start&&beat!==lastBeat&&!sample.done){lastBeat=beat;emit('qh-money-beat',{id:sample.id,progress:sample.progress,gain:sample.delta>0});}
  if(!sample.done){frame=requestAnimationFrame(tick);return;}
  frame=0;banner?.classList.add('is-settled');
  inlineResult?.classList.remove('is-money-counting');
  for(const node of document.querySelectorAll('[data-balance-value]'))node.animate([{scale:'1'},{scale:'1.09'},{scale:'1'}],{duration:260});
  emit('qh-money-finish',{id:sample.id,gain:sample.delta>0});
  const finished=banner;removal=setTimeout(()=>{finished?.remove();if(banner===finished)banner=null;},1350);
 }
 return {
  sync(next){
   const now=performance.now(),sample=clock.retarget(next,now,document.querySelector('.revenge-final')?650:document.querySelector('.incoming-message .incoming-money')?350:document.querySelector('.defense-reaction')?220:0);
   if(!sample){paint(clock.sample(now));return;}
   cancelAnimationFrame(frame);clearTimeout(removal);banner?.remove();lastBeat=-1;
   inlineResult?.classList.remove('is-money-counting');inlineResult=primaryResult();banner=null;
   if(inlineResult){
    inlineResult.classList.add('is-money-counting');
    paint(sample);emit('qh-money-start',{id:sample.id,gain:sample.delta>0});frame=requestAnimationFrame(tick);return;
   }
   banner=document.createElement('aside');banner.className='money-burst '+(sample.delta>0?'is-gain':'is-loss');banner.dataset.moneyRun=sample.id;banner.setAttribute('role','status');banner.setAttribute('aria-label',(sample.delta>0?'Entraram ':'Saíram ')+Math.abs(sample.delta)+' créditos. Saldo: '+next+' créditos.');
   // The live-region announces the settled value once, not every counting frame.
   banner.innerHTML=`<div class="money-burst-art" aria-hidden="true"><i></i><i></i><i></i><span>C$</span></div><div aria-hidden="true"><small>${sample.delta>0?'DINHEIRO NA CONTA!':'SAIU DA CONTA'}</small><strong>${signed(0,sample.delta)}</strong><span>Saldo <b data-money-total>${currency(sample.from)}</b></span></div>`;
   document.body.append(banner);paint(sample);emit('qh-money-start',{id:sample.id,gain:sample.delta>0});frame=requestAnimationFrame(tick);
  },
  reset(next){cancelAnimationFrame(frame);clearTimeout(removal);banner?.remove();banner=null;inlineResult?.classList.remove('is-money-counting');inlineResult=null;clock.reset(next);},
 };
}

export function revengeMissFeedback(){
 const panel=document.querySelector('.revenge-window');if(!panel)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches,shift=reduced?3:7;
 panel.animate([{translate:'0px 0px'},{translate:`-${shift}px 2px`},{translate:`${shift}px -2px`},{translate:`-${shift*.6}px 1px`},{translate:`${shift*.4}px 0px`},{translate:'0px 0px'}],{duration:320,easing:'ease-out'});
 document.dispatchEvent(new CustomEvent('qh-revenge-miss'));
}
