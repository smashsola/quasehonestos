import {expressions,expressionNames} from './mood.js';
import {voiceProfiles,speechPlan} from './speech-timing.js';
let speech=null,timer,frameTimer;
const readyImages=new Map();
function preload(src){
 if(typeof Image==='undefined')return true;
 if(!readyImages.has(src)){
  const image=new Image();readyImages.set(src,false);
  image.onload=()=>{readyImages.set(src,true);updatePortraits();};
  image.onerror=()=>{readyImages.set(src,false);};image.src=src;
 }
 return readyImages.get(src);
}
export function portraitSource(caller,emotion){
 const valid=expressions.includes(emotion)?emotion:'neutral',base=`/src/portraits/${caller}-${valid}`;
 const animated=base+'-talking.svg';
 if(speech?.caller===caller&&speech.emotion===valid&&speech.mouthOpen&&preload(animated))return animated;
 return preload(base+'.svg')?base+'.svg':`/src/portraits/${caller}-neutral.svg`;
}
export function updatePortraits(){
 document.querySelectorAll('.avatar[data-caller],.defense-sender-avatar[data-caller]').forEach(avatar=>{
  const caller=avatar.dataset.caller,emotion=avatar.dataset.expression,img=avatar.querySelector('img'),active=speech?.caller===caller&&speech.emotion===emotion,talking=active;
  if(img){const source=portraitSource(caller,emotion);if(!img.src.endsWith(source))img.src=source;preload(`/src/portraits/${caller}-${emotion}-talking.svg`);}
  avatar.classList.toggle('is-speaking',talking);
  const label=avatar.parentElement.querySelector('.portrait-emotion');if(label)label.textContent=talking?'falando…':expressionNames[emotion];
 });
}
function stopSpeech(){clearTimeout(timer);clearInterval(frameTimer);speech=null;updatePortraits();}
document.addEventListener('qh-speaking-expression',e=>{if(!speech||speech.caller!==e.detail?.caller||!expressions.includes(e.detail?.emotion))return;speech.emotion=e.detail.emotion;updatePortraits();});
document.addEventListener('qh-speaking-start',e=>{
 const {caller,emotion,duration,pace}=e.detail||{};if(document.hidden||!voiceProfiles[caller]||!expressions.includes(emotion))return;
 stopSpeech();const reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;speech={caller,emotion,mouthOpen:!reducedMotion};updatePortraits();
 const beat=Number(pace)||speechPlan(caller,emotion,duration).pace;
 if(!reducedMotion)frameTimer=setInterval(()=>{if(!speech)return;speech.mouthOpen=!speech.mouthOpen;updatePortraits();},beat*500);
 timer=setTimeout(stopSpeech,Number(duration)||speechPlan(caller,emotion).duration*1000);
});
document.addEventListener('qh-murmur',e=>{
 stopSpeech();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();});
document.addEventListener('qh-speaking-stop',stopSpeech);
