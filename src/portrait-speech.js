import {expressions,expressionNames} from './mood.js';
import {voiceProfiles,speechTiming} from './speech-timing.js';
let speech=null,timer;
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
 if(speech?.caller===caller&&speech.emotion===valid&&preload(animated))return animated;
 return preload(base+'.svg')?base+'.svg':`/src/portraits/${caller}-neutral.svg`;
}
export function updatePortraits(){
 document.querySelectorAll('.avatar[data-caller]').forEach(avatar=>{
  const caller=avatar.dataset.caller,emotion=avatar.dataset.expression,img=avatar.querySelector('img');
  if(img){const source=portraitSource(caller,emotion);if(!img.src.endsWith(source))img.src=source;preload(`/src/portraits/${caller}-${emotion}-talking.svg`);}
  const talking=speech?.caller===caller&&speech.emotion===emotion;avatar.classList.toggle('is-speaking',talking);
  const label=avatar.parentElement.querySelector('.portrait-emotion');if(label)label.textContent=talking?'falando…':expressionNames[emotion];
 });
}
function stopSpeech(){clearTimeout(timer);speech=null;updatePortraits();}
document.addEventListener('qh-murmur',e=>{
 if(document.hidden||!voiceProfiles[e.detail?.caller]||!expressions.includes(e.detail?.emotion))return;
 stopSpeech();speech={caller:e.detail.caller,emotion:e.detail.emotion};updatePortraits();
 timer=setTimeout(stopSpeech,speechTiming(speech.caller,speech.emotion,e.detail.duration).duration*1000);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();});
document.addEventListener('qh-speaking-stop',stopSpeech);
