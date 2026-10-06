import {speechTiming} from './speech-timing.js';
let ctx,fanGain;
// Cartoon syllables: each caller has a different pitch, pace and vowel color.
const speakingNodes=new Set();
function stopMurmurs(){for(const node of speakingNodes){try{node.stop();}catch{}}speakingNodes.clear();}
document.addEventListener('qh-speaking-stop',stopMurmurs);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMurmurs();});
document.addEventListener('click',e=>{if(e.target.closest('[data-sound-mute]'))stopMurmurs();},true);
document.addEventListener('qh-murmur',async e=>{
 if(muted||document.hidden||!characterVolume)return;
 try{
  await ensureAudio();if(!ctx||muted||document.hidden)return;stopMurmurs();
  const {pitch,pace,f1,f2,duration}=speechTiming(e.detail.caller,e.detail.emotion,e.detail.duration),start=ctx.currentTime+.02;
  for(let i=0;i<Math.floor(duration/pace);i++){
   const t=start+i*pace,voice=ctx.createOscillator(),envelope=ctx.createGain();
   voice.type='sawtooth';voice.frequency.setValueAtTime(pitch*(1+.09*Math.sin(i*2.4)),t);
   voice.frequency.exponentialRampToValueAtTime(pitch*(i%3===0?1.16:.93),t+pace*.65);
   envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(.16*characterVolume/100,t+.015);envelope.gain.exponentialRampToValueAtTime(.0001,t+pace*.78);
   const filters=[f1,f2].map((frequency,j)=>{const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=frequency*(1+.15*Math.sin(i+j*2));filter.Q.value=2.5;voice.connect(filter);filter.connect(envelope);return filter;});
   envelope.connect(ctx.destination);speakingNodes.add(voice);
   voice.onended=()=>{speakingNodes.delete(voice);voice.disconnect();filters.forEach(filter=>filter.disconnect());envelope.disconnect();};
   voice.start(t);voice.stop(t+pace*.82);
  }
 }catch{}
});
let muted=localStorage.getItem('qh-muted')==='true';
const setting=(key,fallback)=>{const raw=localStorage.getItem(key),value=Number(raw);return raw!==null&&Number.isFinite(value)?Math.max(0,Math.min(100,value)):fallback;};
let clickVolume=setting('qh-click-volume',65),fanVolume=setting('qh-fan-volume',30),characterVolume=setting('qh-character-volume',75),keyboardVolume=setting('qh-keyboard-volume',55),messageVolume=setting('qh-message-volume',65),panelOpen=false;
const clickBuffers=new Map();
function playClick(release=false){
 if(muted||!ctx||document.hidden||!clickVolume)return;
 const key=release?'up':'down';let buffer=clickBuffers.get(key);
 if(!buffer){buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.035),ctx.sampleRate);const data=buffer.getChannelData(0);let seed=release?39:17;
 for(let i=0;i<data.length;i++){const t=i/ctx.sampleRate;seed=(seed*1664525+1013904223)>>>0;const noise=seed/2147483648-1;const snap=noise*Math.exp(-t/.0012);const body=Math.sin(2*Math.PI*(release?2100:1550)*t)*Math.exp(-t/.0015)*.16;const shell=t>.002?noise*.13*Math.exp(-(t-.002)/.003):0;data[i]=Math.min(1,t/.0002)*(snap*.65+body+shell);}
 clickBuffers.set(key,buffer);}
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='highpass';filter.frequency.value=650;gain.gain.value=(release?.16:.24)*clickVolume/65;source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start();
}
async function ensureAudio(){if(muted||document.hidden)return;if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')await ctx.resume();fan();updateFan();}
function fan(){
 if(fanGain)return;fanGain=ctx.createGain();fanGain.gain.value=0;fanGain.connect(ctx.destination);
 const buffer=ctx.createBuffer(1,ctx.sampleRate*6,ctx.sampleRate),data=buffer.getChannelData(0);let previous=0;
 for(let i=0;i<data.length;i++){const noise=Math.random()*2-1;previous=(previous+.035*noise)/1.035;data[i]=(previous*2.2+noise*.08)*(1+.035*Math.sin(2*Math.PI*i/(ctx.sampleRate*3)));}
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=1450;source.connect(filter);filter.connect(fanGain);source.start();
}
function updateFan(){if(!fanGain)return;fanGain.gain.cancelScheduledValues(ctx.currentTime);fanGain.gain.setTargetAtTime(muted||document.hidden?0:.05*fanVolume/30,ctx.currentTime,.12);}
let mousePressed=false;
document.addEventListener('pointerdown',async e=>{if(e.button!==0||muted)return;mousePressed=true;try{await ensureAudio();if(mousePressed)playClick();}catch{}},true);
document.addEventListener('pointerup',async e=>{if(e.button!==0||!mousePressed)return;mousePressed=false;try{await ensureAudio();playClick(true);}catch{}},true);
document.addEventListener('pointercancel',()=>mousePressed=false,true);
document.addEventListener('visibilitychange',()=>{mousePressed=false;if(!ctx)return;if(document.hidden)ctx.suspend().catch(()=>{});else if(!muted)ctx.resume().then(updateFan).catch(()=>{});});
function controls(){
 const bar=document.querySelector('.taskbar');if(!bar)return;
 let button=bar.querySelector('[data-sound-panel]');if(!button){button=document.createElement('button');button.dataset.soundPanel='true';button.className='sound-toggle';bar.insertBefore(button,bar.querySelector('small'));}
 const title=muted?'Som silenciado · ajustar áudio':'Ajustar áudio';button.textContent=muted?'♪ ×':'♪';button.title=title;button.setAttribute('aria-label',title);button.setAttribute('aria-expanded',String(panelOpen));
 if(panelOpen&&!document.querySelector('.sound-panel')){const panel=document.createElement('section');panel.className='sound-panel';panel.setAttribute('aria-label','Sons do computador');panel.innerHTML=`<div><strong>Sons do computador</strong><button data-sound-close aria-label="Fechar ajustes de áudio">×</button></div><label>Clique do mouse <output>${clickVolume}%</output><input aria-label="Volume do clique do mouse" data-volume="click" type="range" min="0" max="100" value="${clickVolume}"></label><label>Teclado <output>${keyboardVolume}%</output><input aria-label="Volume do teclado" data-volume="keyboard" type="range" min="0" max="100" value="${keyboardVolume}"></label><label>Murmúrios dos personagens <output>${characterVolume}%</output><input aria-label="Volume dos personagens" data-volume="character" type="range" min="0" max="100" value="${characterVolume}"></label><label>Mensagens <output>${messageVolume}%</output><input aria-label="Volume das mensagens" data-volume="message" type="range" min="0" max="100" value="${messageVolume}"></label><label>Ventoinha <output>${fanVolume}%</output><input aria-label="Volume da ventoinha" data-volume="fan" type="range" min="0" max="100" value="${fanVolume}"></label><button data-sound-mute>${muted?'Ativar sons':'Silenciar tudo'}</button>`;document.querySelector('.desktop').append(panel);}
 if(!panelOpen)document.querySelector('.sound-panel')?.remove();
}
new MutationObserver(()=>{if(!document.querySelector('[data-sound-panel]')||(panelOpen&&!document.querySelector('.sound-panel')))controls();}).observe(document.querySelector('#app'),{childList:true,subtree:true});controls();
document.addEventListener('input',e=>{const kind=e.target.dataset.volume;if(!kind)return;const value=Number(e.target.value);if(kind==='click')clickVolume=value;else if(kind==='keyboard')keyboardVolume=value;else if(kind==='message')messageVolume=value;else if(kind==='character'){characterVolume=value;stopMurmurs();}else fanVolume=value;localStorage.setItem(kind==='click'?'qh-click-volume':kind==='character'?'qh-character-volume':kind==='keyboard'?'qh-keyboard-volume':kind==='message'?'qh-message-volume':'qh-fan-volume',String(value));e.target.previousElementSibling.textContent=value+'%';updateFan();});
document.addEventListener('change',async e=>{if(e.target.dataset.volume==='message'){playMessage();}else if(e.target.dataset.volume==='keyboard'){try{await ensureAudio();playKey();}catch{}}else if(e.target.dataset.volume==='click'){try{await ensureAudio();playClick();}catch{}}});
document.addEventListener('click',async e=>{
 if(e.target.closest('[data-sound-panel]')){panelOpen=!panelOpen;if(panelOpen)document.dispatchEvent(new CustomEvent('qh-tray-open',{detail:'sound'}));controls();}
 else if(e.target.closest('[data-sound-close]')){panelOpen=false;controls();}
 else if(e.target.closest('[data-sound-mute]')){muted=!muted;localStorage.setItem('qh-muted',String(muted));e.target.closest('button').textContent=muted?'Ativar sons':'Silenciar tudo';controls();updateFan();if(muted&&ctx)ctx.suspend().catch(()=>{});}
 try{await ensureAudio();if(e.detail===0&&e.target.closest('button')&&!muted){playClick();setTimeout(()=>playClick(true),60);}}catch{}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panelOpen){panelOpen=false;controls();document.querySelector('[data-sound-panel]')?.focus();}});
document.addEventListener('qh-tray-open',e=>{if(e.detail!=='sound'&&panelOpen){panelOpen=false;controls();}});
document.addEventListener('qh-earned',async()=>{if(muted)return;try{await ensureAudio();if(!ctx)return;const now=ctx.currentTime;[1320,1760,2217].forEach((frequency,i)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,now+i*.065);gain.gain.linearRampToValueAtTime(.08,now+i*.065+.006);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.065+.28);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(now+i*.065);oscillator.stop(now+i*.065+.3);});}catch{}});



let keyBuffer,lastKeyAt=0;
function playKey(backspace=false){
 if(!ctx||muted||document.hidden||!keyboardVolume)return;
 if(!keyBuffer){keyBuffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.045),ctx.sampleRate);const samples=keyBuffer.getChannelData(0);let seed=91;for(let i=0;i<samples.length;i++){const t=i/ctx.sampleRate;seed=(seed*1664525+1013904223)>>>0;const noise=seed/2147483648-1;samples[i]=noise*.55*Math.exp(-t/.0035)+Math.sin(2*Math.PI*340*t)*.2*Math.exp(-t/.013);}}
 const source=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();source.buffer=keyBuffer;source.playbackRate.value=backspace?.82:.94+Math.random()*.12;filter.type='lowpass';filter.frequency.value=2900;gain.gain.value=.2*keyboardVolume/100;source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start();
}
document.addEventListener('keydown',async e=>{
 if(!e.target.matches?.('textarea,input[type="text"]')||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||!(e.key.length===1||['Backspace','Enter'].includes(e.key))||muted)return;
 const now=performance.now();if(now-lastKeyAt<28)return;lastKeyAt=now;
 try{await ensureAudio();playKey(e.key==='Backspace');}catch{}
},true);
async function playMessage(surprise=false){
 if(muted||document.hidden||!messageVolume)return;
 try{
  await ensureAudio();if(!ctx||ctx.state!=='running'||muted||document.hidden)return;
  const now=ctx.currentTime;
  (surprise?[660,880]:[830,1108]).forEach((frequency,i)=>{
   const osc=ctx.createOscillator(),gain=ctx.createGain(),start=now+i*.095;
   osc.type='sine';osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(frequency*.96,start+.15);
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.075*messageVolume/100,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+.2);
   osc.connect(gain);gain.connect(ctx.destination);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(start);osc.stop(start+.22);
  });
 }catch{}
}
document.addEventListener('qh-message',()=>playMessage());
document.addEventListener('qh-notification',()=>playMessage(true));
