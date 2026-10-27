import {revengeMusicTheme} from './revenge-music-themes.js';
import {localStore as localStorage} from './safe-storage.js';
import {speechPlan,replyDuration} from './speech-timing.js';
let ctx,fanGain,reactionLimiter,computerDead=false;
// Cartoon syllables: each caller has a different pitch, pace and vowel color.
const speakingNodes=new Set();
let murmurRun=0;
const softVoices=new Set(['nino','yara','bia','luana','maya','duda','golpista2','golpista3']);
const grittyVoices=new Set(['davi','bento','caio','igor','rafa','golpista1','golpista5']);
const quieterVoices=new Set(['davi','bento','caio','igor','rafa','golpista1','golpista5']);
function stopMurmurs(){murmurRun++;for(const node of speakingNodes){try{node.stop();}catch{}}speakingNodes.clear();}
document.addEventListener('qh-speaking-stop',stopMurmurs);
document.addEventListener('qh-computer-restart',()=>{computerDead=false;if(ctx?.state==='suspended')ctx.resume().then(updateFan).catch(()=>{});});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMurmurs();});
document.addEventListener('click',e=>{if(e.target.closest('[data-sound-mute]'))stopMurmurs();},true);
document.addEventListener('qh-murmur',async e=>{
 const detail=e.detail||{},skip=()=>document.dispatchEvent(new CustomEvent('qh-murmur-skipped',{detail:{caller:detail.caller}}));stopMurmurs();const run=murmurRun;
 if(computerDead||muted||document.hidden||!characterVolume){skip();return;}
 try{
  await ensureAudio();if(run!==murmurRun)return;if(!ctx||ctx.state!=='running'||computerDead||muted||document.hidden){skip();return;}
  const {caller,emotion,duration:durationMs}=detail,{pitch,pace,f1,f2,duration,syllables}=speechPlan(caller,emotion,durationMs),start=ctx.currentTime+.02;let remaining=syllables;
  for(let i=0;i<syllables;i++){
   const t=start+i*pace,voice=ctx.createOscillator(),envelope=ctx.createGain();
   voice.type=softVoices.has(caller)?'triangle':grittyVoices.has(caller)?'sawtooth':'square';voice.frequency.setValueAtTime(pitch*(1+.09*Math.sin(i*2.4)),t);
   voice.frequency.exponentialRampToValueAtTime(pitch*(i%3===0?1.16:.93),t+pace*.55);
   envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(.46*(quieterVoices.has(caller)?1.2:1)*characterVolume/100,t+.015);envelope.gain.exponentialRampToValueAtTime(.0001,t+pace*.94);
   const filters=[f1,f2].map((frequency,j)=>{const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=frequency*(1+.15*Math.sin(i+j*2));filter.Q.value=2.5;voice.connect(filter);filter.connect(envelope);return filter;});
   envelope.connect(ctx.destination);speakingNodes.add(voice);
   voice.onended=()=>{speakingNodes.delete(voice);voice.disconnect();filters.forEach(filter=>filter.disconnect());envelope.disconnect();if(run===murmurRun&&--remaining===0)document.dispatchEvent(new CustomEvent('qh-speaking-end',{detail:{caller}}));};
   voice.start(t);voice.stop(t+pace);
  }
  document.dispatchEvent(new CustomEvent('qh-speaking-start',{detail:{caller,emotion,duration:duration*1000,pace,audioStart:start,syllables}}));
 }catch{if(run===murmurRun)skip();}
});
let muted=localStorage.getItem('qh-muted')==='true';
const setting=(key,fallback)=>{const raw=localStorage.getItem(key),value=Number(raw);return raw!==null&&Number.isFinite(value)?Math.max(0,Math.min(100,value)):fallback;};
let clickVolume=setting('qh-click-volume',65),fanVolume=setting('qh-fan-volume',30),characterVolume=setting('qh-character-volume',100),keyboardVolume=setting('qh-keyboard-volume',55),messageVolume=setting('qh-message-volume',65),panelOpen=false;
// The boss uses the same cartoon syllables, timing and volume as the characters.
let bossPanel=null,bossMouthFrame=0,bossSpeechTiming=null;
function updateBossMouth(){
 if(!bossPanel||!bossSpeechTiming||!ctx)return;
 const elapsed=ctx.currentTime-bossSpeechTiming.start,beat=bossSpeechTiming.pace;
 const open=elapsed>=0&&elapsed<bossSpeechTiming.duration&&elapsed%beat<beat*.75;
 const image=bossPanel.querySelector('img'),source=open?'/src/portraits/boss-speaking.svg':'/src/portraits/boss.svg';
 if(image?.getAttribute('src')!==source)image?.setAttribute('src',source);
 bossMouthFrame=requestAnimationFrame(updateBossMouth);
}

function stopBossVoice(){
 cancelAnimationFrame(bossMouthFrame);bossMouthFrame=0;bossSpeechTiming=null;
 if(bossPanel)stopMurmurs();
 bossPanel?.classList.remove('is-speaking');
 bossPanel?.querySelector('img')?.setAttribute('src','/src/portraits/boss.svg');
 const button=bossPanel?.querySelector('[data-boss-speak]');if(button){button.textContent='Ouvir o chefe';button.setAttribute('aria-pressed','false');}
 bossPanel=null;
}
function speakBoss(panel){
 stopBossVoice();if(!panel||muted||document.hidden||!characterVolume)return;
 const text=panel.querySelector('[data-boss-line]')?.textContent;if(!text)return;
 bossPanel=panel;
 document.dispatchEvent(new CustomEvent('qh-murmur',{detail:{caller:'bento',emotion:'neutral',duration:replyDuration(text)}}));
}
document.addEventListener('qh-speaking-start',e=>{
 if(!bossPanel||e.detail?.caller!=='bento')return;
 bossSpeechTiming={start:e.detail.audioStart,pace:e.detail.pace,duration:e.detail.duration/1000};
 cancelAnimationFrame(bossMouthFrame);updateBossMouth();
 bossPanel.classList.add('is-speaking');bossPanel.style.setProperty('--boss-mouth-pace',e.detail.pace+'s');
 const button=bossPanel.querySelector('[data-boss-speak]');if(button){button.textContent='Parar fala';button.setAttribute('aria-pressed','true');}
});
for(const event of ['qh-speaking-end','qh-murmur-skipped'])document.addEventListener(event,e=>{if(bossPanel&&e.detail?.caller==='bento')stopBossVoice();});
document.addEventListener('qh-speaking-stop',stopBossVoice);
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-boss-speak]');
 if(button){const panel=button.closest('.defense-boss-report');if(panel.classList.contains('is-speaking')){stopBossVoice();stopMurmurs();}else speakBoss(panel);}
 else if(e.target.closest('[data-action="reset"],[data-sound-mute],[data-show-desktop],[data-app],[data-window]'))stopBossVoice();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopBossVoice();});
document.addEventListener('qh-boss-report',()=>speakBoss(document.querySelector('.defense-boss-report')));
document.addEventListener('input',e=>{if(e.target.dataset.volume==='character')stopBossVoice();});
new MutationObserver(()=>{if(bossPanel&&!bossPanel.isConnected){const replacement=document.querySelector('.defense-boss-report');if(replacement&&replacement.dataset.bossTier===bossPanel.dataset.bossTier){bossPanel=replacement;bossPanel.classList.add('is-speaking');const button=bossPanel.querySelector('[data-boss-speak]');if(button){button.textContent='Parar fala';button.setAttribute('aria-pressed','true');}}else stopBossVoice();}}).observe(document.querySelector('#app'),{childList:true,subtree:true});
new MutationObserver(()=>updateFan()).observe(document.querySelector('#app'),{childList:true,subtree:true});
const clickBuffers=new Map();
function playClick(release=false){
 if(computerDead||muted||!ctx||document.hidden||!clickVolume)return;
 const key=release?'up':'down';let buffer=clickBuffers.get(key);
 if(!buffer){buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.035),ctx.sampleRate);const data=buffer.getChannelData(0);let seed=release?39:17;
 for(let i=0;i<data.length;i++){const t=i/ctx.sampleRate;seed=(seed*1664525+1013904223)>>>0;const noise=seed/2147483648-1;const snap=noise*Math.exp(-t/.0012);const body=Math.sin(2*Math.PI*(release?2100:1550)*t)*Math.exp(-t/.0015)*.16;const shell=t>.002?noise*.13*Math.exp(-(t-.002)/.003):0;data[i]=Math.min(1,t/.0002)*(snap*.65+body+shell);}
 clickBuffers.set(key,buffer);}
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='highpass';filter.frequency.value=650;gain.gain.value=(release?.16:.24)*clickVolume/65;source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start();
}
async function ensureAudio(allowCrashSound=false){if(muted||(computerDead&&!allowCrashSound)||document.hidden)return;if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')await ctx.resume();fan();updateFan();}
function fan(){
 if(fanGain)return;fanGain=ctx.createGain();fanGain.gain.value=0;fanGain.connect(ctx.destination);
 const buffer=ctx.createBuffer(1,ctx.sampleRate*6,ctx.sampleRate),data=buffer.getChannelData(0);let previous=0;
 for(let i=0;i<data.length;i++){const noise=Math.random()*2-1;previous=(previous+.035*noise)/1.035;data[i]=(previous*2.2+noise*.08)*(1+.035*Math.sin(2*Math.PI*i/(ctx.sampleRate*3)));}
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=1450;source.connect(filter);filter.connect(fanGain);source.start();
}
function updateFan(){if(!fanGain)return;fanGain.gain.cancelScheduledValues(ctx.currentTime);fanGain.gain.setTargetAtTime(muted||computerDead||document.hidden||document.querySelector('.revenge-window')?0:.05*fanVolume/30,ctx.currentTime,.12);}
let mousePressed=false;
document.addEventListener('pointerdown',async e=>{if(e.button!==0||muted||computerDead)return;mousePressed=true;try{await ensureAudio();if(mousePressed)playClick();}catch{}},true);
document.addEventListener('pointerup',async e=>{if(e.button!==0||!mousePressed)return;mousePressed=false;try{await ensureAudio();playClick(true);}catch{}},true);
document.addEventListener('pointercancel',()=>mousePressed=false,true);
document.addEventListener('visibilitychange',()=>{mousePressed=false;if(!ctx)return;if(document.hidden)ctx.suspend().catch(()=>{});else if(!muted)ctx.resume().then(updateFan).catch(()=>{});});
function returnAudioFocus(){const mobile=document.querySelector('.mobile-dock [data-mobile-apps]');(mobile?.getBoundingClientRect().height?mobile:document.querySelector('[data-sound-panel]'))?.focus();}
function controls(){
 const bar=document.querySelector('.taskbar');if(!bar)return;
 let button=bar.querySelector('[data-sound-panel]');if(!button){button=document.createElement('button');button.dataset.soundPanel='true';button.className='sound-toggle';bar.insertBefore(button,bar.querySelector('small'));}
 const title=muted?'Som silenciado · ajustar áudio':'Ajustar áudio';button.textContent=muted?'♪ ×':'♪';button.title=title;button.setAttribute('aria-label',title);button.setAttribute('aria-expanded',String(panelOpen));
 if(panelOpen&&!document.querySelector('.sound-panel')){const panel=document.createElement('section');panel.className='sound-panel';panel.setAttribute('aria-label','Sons do computador');panel.innerHTML=`<div><strong>Sons do computador</strong><button data-sound-close aria-label="Fechar ajustes de áudio">×</button></div><label>Clique do mouse <output>${clickVolume}%</output><input aria-label="Volume do clique do mouse" data-volume="click" type="range" min="0" max="100" value="${clickVolume}"></label><label>Teclado <output>${keyboardVolume}%</output><input aria-label="Volume do teclado" data-volume="keyboard" type="range" min="0" max="100" value="${keyboardVolume}"></label><label>Murmúrio dos personagens <output>${characterVolume}%</output><input aria-label="Volume do murmúrio dos personagens" data-volume="character" type="range" min="0" max="100" value="${characterVolume}"></label><label>Mensagens <output>${messageVolume}%</output><input aria-label="Volume das mensagens" data-volume="message" type="range" min="0" max="100" value="${messageVolume}"></label><label>Ventoinha <output>${fanVolume}%</output><input aria-label="Volume da ventoinha" data-volume="fan" type="range" min="0" max="100" value="${fanVolume}"></label><button data-sound-mute>${muted?'Ativar sons':'Silenciar tudo'}</button>`;document.querySelector('.desktop').append(panel);panel.querySelector('[data-sound-close]').focus({preventScroll:true});}
 if(!panelOpen)document.querySelector('.sound-panel')?.remove();
}
new MutationObserver(()=>{if(!document.querySelector('[data-sound-panel]')||(panelOpen&&!document.querySelector('.sound-panel')))controls();}).observe(document.querySelector('#app'),{childList:true,subtree:true});controls();
document.addEventListener('input',e=>{const kind=e.target.dataset.volume;if(!kind)return;const value=Number(e.target.value);if(kind==='click')clickVolume=value;else if(kind==='keyboard')keyboardVolume=value;else if(kind==='message')messageVolume=value;else if(kind==='character'){characterVolume=value;stopMurmurs();}else fanVolume=value;localStorage.setItem(kind==='click'?'qh-click-volume':kind==='character'?'qh-character-volume':kind==='keyboard'?'qh-keyboard-volume':kind==='message'?'qh-message-volume':'qh-fan-volume',String(value));e.target.previousElementSibling.textContent=value+'%';updateFan();});
document.addEventListener('change',async e=>{if(e.target.dataset.volume==='message'){playMessage();}else if(e.target.dataset.volume==='keyboard'){try{await ensureAudio();playKey();}catch{}}else if(e.target.dataset.volume==='click'){try{await ensureAudio();playClick();}catch{}}});
document.addEventListener('click',async e=>{
 if(e.target.closest('[data-sound-panel]')){panelOpen=!panelOpen;if(panelOpen)document.dispatchEvent(new CustomEvent('qh-tray-open',{detail:'sound'}));controls();}
 else if(e.target.closest('[data-sound-close]')){panelOpen=false;controls();returnAudioFocus();}
 else if(e.target.closest('[data-sound-mute]')){muted=!muted;localStorage.setItem('qh-muted',String(muted));e.target.closest('button').textContent=muted?'Ativar sons':'Silenciar tudo';controls();updateFan();if(muted&&ctx)ctx.suspend().catch(()=>{});}
 try{await ensureAudio();if(e.detail===0&&e.target.closest('button')&&!muted){playClick();setTimeout(()=>playClick(true),60);}}catch{}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panelOpen){panelOpen=false;controls();returnAudioFocus();}});
document.addEventListener('qh-tray-open',e=>{if(e.detail!=='sound'&&panelOpen){panelOpen=false;controls();}});
document.addEventListener('qh-earned',async()=>{if(computerDead||muted)return;try{await ensureAudio();if(computerDead||!ctx)return;const now=ctx.currentTime;[1320,1760,2217].forEach((frequency,i)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,now+i*.065);gain.gain.linearRampToValueAtTime(.08,now+i*.065+.006);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.065+.28);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(now+i*.065);oscillator.stop(now+i*.065+.3);});}catch{}});

function reactionTone(frequency,start,duration,level,type='sine',endFrequency){
 const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,start);if(endFrequency)oscillator.frequency.exponentialRampToValueAtTime(endFrequency,start+duration*.88);gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(Math.min(.9,level*1.5*messageVolume/65),start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);oscillator.connect(gain);if(!reactionLimiter){reactionLimiter=ctx.createDynamicsCompressor();reactionLimiter.threshold.value=-8;reactionLimiter.knee.value=4;reactionLimiter.ratio.value=12;reactionLimiter.attack.value=.003;reactionLimiter.release.value=.16;reactionLimiter.connect(ctx.destination);}gain.connect(reactionLimiter);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(start);oscillator.stop(start+duration+.015);
}
document.addEventListener('qh-defense-action',async e=>{
 const type=e.detail?.sound;if(computerDead||!['call','hangup','message','keypad','payment','connect','file','delivery','click','terminal'].includes(type)||muted||document.hidden||!messageVolume)return;
 try{await ensureAudio();if(!ctx||ctx.state!=='running'||computerDead||muted||document.hidden||!messageVolume)return;const start=ctx.currentTime+.035;
  if(type==='call'){for(const offset of [0,.28,.5,.78,1.55,1.83,2.05,2.33,3.1,3.38,3.6,3.88,4.65,4.93,5.15,5.43]){reactionTone(440,start+offset,.22,.2,'sine');reactionTone(480,start+offset,.22,.17,'sine');}}
  else if(type==='hangup'){reactionTone(480,start,.17,.15,'sine',340);reactionTone(340,start+.18,.23,.13,'sine',220);}
  else if(type==='message'){reactionTone(880,start,.11,.12,'triangle');reactionTone(1174.66,start+.105,.14,.105,'triangle');}
  else if(type==='keypad'){reactionTone(697,start,.13,.1,'sine');reactionTone(1209,start,.13,.1,'sine');reactionTone(770,start+.19,.13,.09,'sine');reactionTone(1336,start+.19,.13,.09,'sine');}
  else if(type==='payment'){reactionTone(659.25,start,.095,.11,'sine');reactionTone(523.25,start+.11,.16,.1,'sine');}
  else if(type==='connect'){reactionTone(660,start,.09,.11,'triangle');reactionTone(880,start+.11,.16,.12,'sine');reactionTone(1046.5,start+.34,.2,.09,'sine');}
  else if(type==='file'){reactionTone(310,start,.12,.1,'triangle',220);reactionTone(620,start+.14,.1,.075,'sine');}
  else if(type==='delivery'){reactionTone(740,start,.13,.12,'sine');reactionTone(988,start+.12,.18,.1,'sine');}
  else if(type==='click'){reactionTone(510,start,.035,.055,'triangle');reactionTone(730,start+.06,.045,.045,'sine');}
  else if(type==='terminal'){reactionTone(1209,start,.12,.11,'sine');reactionTone(697,start+.16,.12,.1,'sine');}
 }catch{}
});
document.addEventListener('qh-defense-reaction',async e=>{
 const tier=e.detail?.tier;if(computerDead||!['success','almost','miss'].includes(tier)||muted||document.hidden||!messageVolume)return;
 try{await ensureAudio();if(!ctx||ctx.state!=='running'||computerDead||muted||document.hidden)return;const start=ctx.currentTime+.34;
  if(tier==='success'){[523.25,659.25,783.99,1046.5].forEach((frequency,i)=>{reactionTone(frequency,start+i*.15,.28,.3,'triangle');reactionTone(frequency*2,start+i*.15,.19,.075,'sine');});[523.25,659.25,783.99,1046.5].forEach(frequency=>reactionTone(frequency,start+.72,.68,.18,'sine'));}
  else if(tier==='almost'){[440,554.37,659.25].forEach((frequency,i)=>reactionTone(frequency,start+i*.14,.24,.2,'triangle'));reactionTone(739.99,start+.52,.38,.12,'sine',698.46);}
  else{reactionTone(392,start,.58,.3,'triangle',110);reactionTone(146.83,start+.08,.48,.23,'sawtooth',98);reactionTone(164.81,start+.55,.28,.13,'sine',123.47);}
 }catch{}
});

document.addEventListener('qh-computer-burnout',async()=>{
 computerDead=true;stopMurmurs();mousePressed=false;updateFan();if(muted||document.hidden||!messageVolume)return;
 try{
  await ensureAudio(true);if(!ctx||ctx.state!=='running'||muted||document.hidden)return;
  const now=ctx.currentTime,level=messageVolume/65,duration=.52,sampleCount=Math.ceil(ctx.sampleRate*duration),buffer=ctx.createBuffer(1,sampleCount,ctx.sampleRate),samples=buffer.getChannelData(0);let previous=0;
  if(!reactionLimiter){reactionLimiter=ctx.createDynamicsCompressor();reactionLimiter.threshold.value=-8;reactionLimiter.knee.value=4;reactionLimiter.ratio.value=12;reactionLimiter.attack.value=.003;reactionLimiter.release.value=.16;reactionLimiter.connect(ctx.destination);}
  for(let i=0;i<sampleCount;i++){const white=Math.random()*2-1;previous=(previous+.12*white)/1.12;samples[i]=Math.max(-1,Math.min(1,white*.42+previous*.9));}
  const noise=ctx.createBufferSource(),staticFilter=ctx.createBiquadFilter(),staticGain=ctx.createGain();noise.buffer=buffer;staticFilter.type='bandpass';staticFilter.frequency.value=1550;staticFilter.Q.value=.7;staticGain.gain.setValueAtTime(.0001,now);staticGain.gain.linearRampToValueAtTime(Math.min(.9,.48*level),now+.012);staticGain.gain.exponentialRampToValueAtTime(.0001,now+duration);noise.connect(staticFilter);staticFilter.connect(staticGain);staticGain.connect(reactionLimiter);noise.onended=()=>{noise.disconnect();staticFilter.disconnect();staticGain.disconnect();};noise.start(now);noise.stop(now+duration+.02);
  const tone=ctx.createOscillator(),toneFilter=ctx.createBiquadFilter(),toneGain=ctx.createGain();tone.type='sawtooth';tone.frequency.setValueAtTime(210,now);tone.frequency.exponentialRampToValueAtTime(38,now+.68);toneFilter.type='lowpass';toneFilter.frequency.value=520;toneGain.gain.setValueAtTime(.0001,now);toneGain.gain.linearRampToValueAtTime(Math.min(.9,.34*level),now+.018);toneGain.gain.exponentialRampToValueAtTime(.0001,now+.7);tone.connect(toneFilter);toneFilter.connect(toneGain);toneGain.connect(reactionLimiter);tone.onended=()=>{tone.disconnect();toneFilter.disconnect();toneGain.disconnect();};tone.start(now);tone.stop(now+.72);setTimeout(()=>{if(computerDead&&ctx?.state==='running')ctx.suspend().catch(()=>{});},850);
 }catch{}
});



let keyBuffer,lastKeyAt=0;
function playKey(backspace=false){
 if(!ctx||computerDead||muted||document.hidden||!keyboardVolume)return;
 if(!keyBuffer){keyBuffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.045),ctx.sampleRate);const samples=keyBuffer.getChannelData(0);let seed=91;for(let i=0;i<samples.length;i++){const t=i/ctx.sampleRate;seed=(seed*1664525+1013904223)>>>0;const noise=seed/2147483648-1;samples[i]=noise*.55*Math.exp(-t/.0035)+Math.sin(2*Math.PI*340*t)*.2*Math.exp(-t/.013);}}
 const source=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();source.buffer=keyBuffer;source.playbackRate.value=backspace?.82:.94+Math.random()*.12;filter.type='lowpass';filter.frequency.value=2900;gain.gain.value=.2*keyboardVolume/100;source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start();
}
document.addEventListener('keydown',async e=>{
 if(!e.target.matches?.('textarea,input[type="text"]')||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||!(e.key.length===1||['Backspace','Enter'].includes(e.key))||computerDead||muted)return;
 const now=performance.now();if(now-lastKeyAt<28)return;lastKeyAt=now;
 try{await ensureAudio();playKey(e.key==='Backspace');}catch{}
},true);
async function playMessage(surprise=false){
 if(computerDead||muted||document.hidden||!messageVolume)return;
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

// Original five-second startup tune, paced to the loading bar.
let bootMusicRun=0;
const bootMusicNodes=new Set();
function stopBootMusic(){bootMusicRun++;for(const node of bootMusicNodes){try{node.stop();}catch{}}bootMusicNodes.clear();}
document.addEventListener('qh-player-login',()=>{ensureAudio().catch(()=>{});});
document.addEventListener('qh-boot-music-start',async()=>{
 stopBootMusic();const run=bootMusicRun;
 if(muted||document.hidden)return;
 try{await ensureAudio();if(run!==bootMusicRun||!ctx||ctx.state!=='running'||muted)return;
 const start=ctx.currentTime+.025;
 function note(midi,offset,length,volume,type='triangle'){
  const voice=ctx.createOscillator(),gain=ctx.createGain();voice.type=type;voice.frequency.value=440*2**((midi-69)/12);
  const at=start+offset;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
  voice.connect(gain);gain.connect(ctx.destination);bootMusicNodes.add(voice);voice.onended=()=>{bootMusicNodes.delete(voice);voice.disconnect();gain.disconnect();};voice.start(at);voice.stop(at+length+.02);
 }
 // Warm chords beneath a little ascending, playful melody.
 for(const [offset,chord] of [[0,[50,57,62,66]],[1.35,[47,54,59,62]],[2.7,[55,62,67,71]],[4.05,[50,57,62,69]]])for(const pitch of chord)note(pitch,offset,1.25,.013,'sine');
 [74,78,81,0,78,76,74,69,71,74,78,81,85,81,78,74].forEach((pitch,i)=>{if(pitch)note(pitch,i*.315,.42,.029,'sine');});
 }catch{stopBootMusic();}
});
document.addEventListener('qh-boot-music-stop',stopBootMusic);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopBootMusic();});
document.addEventListener('click',event=>{if(event.target.closest('[data-sound-mute]'))stopBootMusic();},true);

// The original four-second intro grows into a full theme and follows the whole revenge.
let revengeMusicRun=0,revengeMusicTimer=0,revengeMusicButton=null,revengeMusicPinned=false;
const revengeMusicNodes=new Set();
function stopRevengeMusic(){revengeMusicRun++;clearTimeout(revengeMusicTimer);revengeMusicButton?.classList.remove('revenge-music-playing');revengeMusicButton=null;revengeMusicPinned=false;delete document.documentElement.dataset.revengeMusic;for(const node of revengeMusicNodes){try{node.stop();}catch{}}revengeMusicNodes.clear();}
async function startRevengeMusic(button,pin=false){
 if(revengeMusicButton===button&&ctx?.state==='running'){if(pin)revengeMusicPinned=true;return;}
 if(muted||document.hidden)return;
 stopRevengeMusic();revengeMusicButton=button;revengeMusicPinned=pin;const run=revengeMusicRun,theme=revengeMusicTheme(button.dataset?.revengeDay||document.querySelector('.revenge-window')?.dataset?.revengeDay||1);let bar=0;
 try{await ensureAudio();if(run!==revengeMusicRun||!ctx||ctx.state!=='running'||muted){if(run===revengeMusicRun)stopRevengeMusic();return;}
 button.classList.add('revenge-music-playing');
 function phrase(){
  if(run!==revengeMusicRun)return;
  if((revengeMusicPinned?!document.querySelector('.revenge-window'):!button.isConnected)||document.hidden||muted){stopRevengeMusic();return;}
  const cycle=bar%13,section=cycle===0?0:2,beatScale=cycle===0?1:120/theme.bpm,phraseLength=cycle===0?5:4*beatScale;
  const start=ctx.currentTime+.025,finale=false,level=cycle,scale=section===0?1.2:section===1?.92:1;
  document.documentElement.dataset.revengeMusic=level?'layered':'intro';
  function note(midi,offset,length,volume,type){
   offset*=beatScale;length*=beatScale;
   if(offset>=phraseLength)return;length=Math.min(length,phraseLength-offset);
   const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type=type;oscillator.frequency.value=440*2**((midi-69)/12);const at=start+offset;
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(Math.max(.0001,volume*scale*messageVolume/100),at+.02);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
   oscillator.connect(gain);gain.connect(ctx.destination);revengeMusicNodes.add(oscillator);oscillator.onended=()=>{revengeMusicNodes.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start(at);oscillator.stop(at+length+.02);
  }
  function guitar(root,offset,length){
   offset*=beatScale;length*=beatScale;
   if(offset>=phraseLength)return;length=Math.min(length,phraseLength-offset);
   // Palm-muted power chords: root, fifth and octave into a soft-clipped amp.
   const amp=ctx.createWaveShaper(),tone=ctx.createBiquadFilter(),gain=ctx.createGain(),curve=new Float32Array(2048),at=start+offset;
   for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(theme.drive*x);}
   amp.curve=curve;amp.oversample='2x';tone.type='lowpass';tone.frequency.value=theme.tone;
   gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(.038*scale*messageVolume/100,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
   amp.connect(tone);tone.connect(gain);gain.connect(ctx.destination);let remaining=6;
   for(const interval of [0,7,12,0,7,12]){const voice=ctx.createOscillator();voice.type='sawtooth';voice.detune.value=remaining%2?6:-6;voice.frequency.value=440*2**((root+interval-69)/12);voice.connect(amp);revengeMusicNodes.add(voice);voice.onended=()=>{revengeMusicNodes.delete(voice);voice.disconnect();if(!--remaining){amp.disconnect();tone.disconnect();gain.disconnect();}};voice.start(at);voice.stop(at+length+.015);}
  }
  function kick(offset){
   offset*=beatScale;
   if(offset>=phraseLength)return;
   const at=start+offset,voice=ctx.createOscillator(),gain=ctx.createGain();voice.type='sine';
   voice.frequency.setValueAtTime(155,at);voice.frequency.exponentialRampToValueAtTime(43,at+.09);
   gain.gain.setValueAtTime(.115*scale*messageVolume/100,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.2);
   voice.connect(gain);gain.connect(ctx.destination);revengeMusicNodes.add(voice);voice.onended=()=>{revengeMusicNodes.delete(voice);voice.disconnect();gain.disconnect();};voice.start(at);voice.stop(at+.21);
   percussion(offset,.025,.017,3200);
  }
  function percussion(offset,length,volume,frequency){
   offset*=beatScale;length*=beatScale;
   if(offset>=phraseLength)return;length=Math.min(length,phraseLength-offset);
   const source=ctx.createBufferSource(),buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*length),ctx.sampleRate),data=buffer.getChannelData(0),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
   for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);
   source.buffer=buffer;filter.type='highpass';filter.frequency.value=frequency;const at=start+offset;
   gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(Math.max(.0001,volume*scale*messageVolume/100),at+.004);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
   source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);revengeMusicNodes.add(source);source.onended=()=>{revengeMusicNodes.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(at);source.stop(at+length+.01);
  }
  const melodies=[
   [64,67,71,72,71,67,66,63,64,67,74,72,71,66,63,59],
   [64,0,67,69,71,0,74,71,69,67,0,66,64,0,67,71],
   [72,0,71,69,67,0,64,67,69,0,71,74,76,0,74,71],
   [71,0,74,76,79,0,76,74,71,69,0,67,66,0,64,0]
  ];
  const soaring=[
   [76,0,74,71,79,0,78,74,76,0,71,69,67,0,71,74],
   [79,0,76,74,72,0,71,67,72,0,76,79,81,0,79,76],
   [74,0,71,67,74,0,76,79,78,0,74,71,69,0,67,0],
   [78,0,76,74,71,0,69,66,71,74,76,78,76,74,71,0]
  ];
  const heavyLeads=[[64,0,64,67,70,71,0,67,64,62,64,0,71,70,67,0],[60,0,67,0,70,67,63,60,0,63,67,70,72,70,67,0],[67,0,70,74,0,72,70,67,66,0,67,70,74,0,70,66],[62,0,65,66,69,0,66,65,62,60,62,0,66,65,62,0]];
  const melody=cycle===0?theme.intro:theme.lead.map(pitch=>pitch?pitch+theme.roots[(cycle-1)%4]-theme.roots[0]:0);
  melody.forEach((pitch,i)=>{if(pitch)note(pitch,i*.25,level?.21:.7,level?.031:.028,level?'sawtooth':'sine');});
  const bass=level?Array.from({length:8},(_,i)=>theme.roots[(cycle-1)%4]+(i%4===3?7:0)):[theme.roots[0],theme.roots[0]+7,theme.roots[0]+12,theme.roots[0]+19,theme.roots[0]+12,theme.roots[0]+7,theme.roots[0],theme.roots[0]+7];
  bass.forEach((pitch,i)=>note(pitch,i*.5+(0),level?.25:.4,level?.065:.045,level?'sawtooth':'sine'));
  const chordRoot=level?theme.roots[(cycle-1)%4]:theme.roots[0];
  const chords=[[0,[chordRoot+12,chordRoot+19,chordRoot+24]],[2,[chordRoot+12,chordRoot+19,chordRoot+24]]];
  for(const [offset,chord]of chords)for(const pitch of chord)note(pitch,offset,1.8,.012,'sine');
  if(section>0){
   const root=theme.roots[(cycle-1)%4];
   const riff=theme.riff;
   riff.forEach((offset,i)=>guitar(root-12+(i===4||i===9?1:0),offset,i===4||i===9?.34:.14));
   theme.kicks.forEach(kick);
   for(let i=0;i<16;i++)percussion(i*.25,.055,i%2?.012:.019,6500);
   [1,3].forEach(offset=>{percussion(offset,.19,.065,1000);note(50,offset,.13,.04,'triangle');});
   if(bar%2===1)percussion(0,.8,.035,4100);
   if(cycle%4===0){guitar(35,0,.7);[3,3.25,3.5,3.75].forEach((offset,i)=>{note(48-i*3,offset,.18,.055,'triangle');percussion(offset,.09,.027,1200);});}
   if(bar%4===3)[3.25,3.5,3.75].forEach((offset,i)=>note(48-i*3,offset,.13,.045,'triangle'));
  }
  if(section===0&&cycle>0)[52,59,64,67,71,67,64,59].forEach((pitch,i)=>note(pitch,i*.5,.65,.014,'triangle'));
  if(section===2){[76,79,78,74].forEach((pitch,i)=>{if(cycle>4)note(pitch,i,.5,.008,'triangle');});[.5,1.5,2.5,3.5].forEach(offset=>note(33,offset,.12,.035,'sine'));}
  if(cycle===0)[4,4.25,4.5,4.75].forEach((offset,i)=>percussion(offset,.09,.012+i*.006,1500));
  bar++;revengeMusicTimer=setTimeout(phrase,phraseLength*1000);
 }
 phrase();
 }catch{if(run===revengeMusicRun)stopRevengeMusic();}
}
// A touch is a user gesture: unlock playback before the subsequent click opens the panel.
document.addEventListener('pointerdown',event=>{
 if(event.pointerType!=='touch')return;
 const button=event.target.closest?.('.revenge-button');
 if(button)startRevengeMusic(button);
 else if(!revengeMusicPinned)stopRevengeMusic();
},{passive:true});
document.addEventListener('pointerover',event=>{const button=event.target.closest?.('.revenge-button');if(button&&!revengeMusicPinned&&event.pointerType!=='touch'&&!button.contains(event.relatedTarget))startRevengeMusic(button);});
document.addEventListener('pointerout',event=>{const button=event.target.closest?.('.revenge-button');if(button&&!revengeMusicPinned&&event.pointerType!=='touch'&&!button.contains(event.relatedTarget))stopRevengeMusic();});
document.addEventListener('focusin',event=>{if(event.target.matches?.('.revenge-button')&&!revengeMusicPinned)startRevengeMusic(event.target);});
document.addEventListener('focusout',event=>{if(event.target.matches?.('.revenge-button')&&!revengeMusicPinned)stopRevengeMusic();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopRevengeMusic();else{const panel=document.querySelector('.revenge-window');if(panel)startRevengeMusic(panel,true);}});
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-revenge-start]');if(button){startRevengeMusic(button,true);return;}
 if(event.target.closest('[data-sound-mute],[data-revenge-close],[data-action="finish"],[data-show-desktop],[data-action="reset"]'))stopRevengeMusic();
},true);
new MutationObserver(()=>{if(!revengeMusicButton)return;if(revengeMusicPinned){if(!document.querySelector('.revenge-window'))stopRevengeMusic();}else if(!revengeMusicButton.isConnected)stopRevengeMusic();}).observe(document.querySelector('#app'),{childList:true,subtree:true});



// The selected player voice answers after the villain, using the shared mouth timing.
let revengeDialogue=null;
function playRevengeDialogue(){
 const panel=document.querySelector('.revenge-final');if(!panel)return;
 const enemy=panel.querySelector('.revenge-comic-enemy .avatar'),player=panel.querySelector('.revenge-player-speaker');
 if(!enemy||!player)return;
 revengeDialogue={panel,enemy:enemy.dataset.caller,player:player.dataset.caller,phase:'enemy'};
 const text=panel.querySelector('.revenge-comic-enemy p')?.textContent||'';
 document.dispatchEvent(new CustomEvent('qh-murmur',{detail:{caller:enemy.dataset.caller,emotion:'hurt',text,duration:replyDuration(text)}}));
}
document.addEventListener('qh-revenge-dialogue',playRevengeDialogue);
document.addEventListener('qh-speaking-end',e=>{
 const dialogue=revengeDialogue;if(!dialogue||dialogue.phase!=='enemy'||e.detail?.caller!==dialogue.enemy)return;
 if(!dialogue.panel.isConnected){revengeDialogue=null;return;}
 dialogue.phase='player';const text=dialogue.panel.querySelector('.revenge-comic-player p')?.textContent||'';
 document.dispatchEvent(new CustomEvent('qh-murmur',{detail:{caller:dialogue.player,emotion:'amused',text,duration:replyDuration(text)}}));
});
document.addEventListener('qh-speaking-stop',()=>{revengeDialogue=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)revengeDialogue=null;});

// Original, short game effects. They share the message-volume and mute controls.
let moneySoundRun=0;
document.addEventListener('qh-money-start',async event=>{moneySoundRun=event.detail.id;const {id,gain}=event.detail;if(!gain||muted||computerDead||document.hidden||!messageVolume)return;try{await ensureAudio();if(id!==moneySoundRun||muted||computerDead||document.hidden||ctx?.state!=='running')return;const at=ctx.currentTime+.02;[1320,1760,2093].forEach((pitch,i)=>reactionTone(pitch,at+i*.065,.15,.055,'triangle'));}catch{}});
document.addEventListener('qh-money-beat',async event=>{
 const {id,progress,gain}=event.detail;if(muted||computerDead||document.hidden||!messageVolume)return;
 try{await ensureAudio();if(id!==moneySoundRun||muted||computerDead||document.hidden||!ctx||ctx.state!=='running')return;
  const frequency=gain?600+progress*460:480-progress*210;
  reactionTone(frequency,ctx.currentTime+.008,.045,.027,'triangle',frequency*(gain?1.08:.92));
 }catch{}
});
document.addEventListener('qh-money-finish',async event=>{
 const {id,gain}=event.detail;if(muted||computerDead||document.hidden||!messageVolume)return;
 try{await ensureAudio();if(id!==moneySoundRun||muted||computerDead||document.hidden||!ctx||ctx.state!=='running')return;
  const start=ctx.currentTime+.01;
  if(gain){[784,988,1175].forEach((pitch,i)=>reactionTone(pitch,start+i*.055,.22,.055,'sine'));}
  else{reactionTone(240,start,.18,.045,'triangle',150);reactionTone(120,start+.08,.15,.035,'sine');}
 }catch{}
});
document.addEventListener('qh-revenge-miss',async()=>{
 if(muted||computerDead||document.hidden||!messageVolume)return;
 try{await ensureAudio();if(muted||computerDead||document.hidden||!ctx||ctx.state!=='running')return;
  const start=ctx.currentTime+.008,duration=.16,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),samples=buffer.getChannelData(0);let seed=401;
  for(let i=0;i<samples.length;i++){seed=(seed*1664525+1013904223)>>>0;samples[i]=(seed/2147483648-1)*Math.sin(Math.PI*i/samples.length)*Math.exp(-i/samples.length*3);}
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.Q.value=.65;filter.frequency.setValueAtTime(3500,start);filter.frequency.exponentialRampToValueAtTime(700,start+duration);gain.gain.setValueAtTime(.12*messageVolume/100,start);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(start);source.stop(start+duration);
  reactionTone(720,start,.12,.085,'sawtooth',130);reactionTone(150,start+.025,.19,.065,'triangle',65);
 }catch{}
});
