import {expressions,expressionNames} from './mood.js';
import {voiceProfiles,speechTiming} from './speech-timing.js';
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
  const caller=avatar.dataset.caller,emotion=avatar.dataset.expression,img=avatar.querySelector('img'),talking=avatar.dataset.speaking==='true'||speech?.caller===caller&&speech.emotion===emotion;
  if(img){const active=speech?.caller===caller&&speech.emotion===emotion,source=avatar.dataset.speaking==='true'&&active&&speech.mouthOpen?`/src/portraits/${caller}-${emotion}-talking.svg`:portraitSource(caller,emotion);if(!img.src.endsWith(source))img.src=source;preload(`/src/portraits/${caller}-${emotion}-talking.svg`);}
  avatar.classList.toggle('is-speaking',talking);
  const label=avatar.parentElement.querySelector('.portrait-emotion');if(label)label.textContent=talking?'falando…':expressionNames[emotion];
 });
}
function stopSpeech(){clearTimeout(timer);clearInterval(frameTimer);speech=null;updatePortraits();}
document.addEventListener('qh-murmur',e=>{
 if(document.hidden||!voiceProfiles[e.detail?.caller]||!expressions.includes(e.detail?.emotion))return;
 stopSpeech();speech={caller:e.detail.caller,emotion:e.detail.emotion,mouthOpen:true};updatePortraits();
 // Toggle between the same face at rest and with its mouth open. This makes
 // speech visible even in browsers that do not animate CSS inside SVG images.
 frameTimer=setInterval(()=>{if(!speech)return;speech.mouthOpen=!speech.mouthOpen;updatePortraits();},Math.max(320,speechTiming(speech.caller,speech.emotion,e.detail.duration).pace*700));
 timer=setTimeout(stopSpeech,speechTiming(speech.caller,speech.emotion,e.detail.duration).duration*1000);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();});
document.addEventListener('qh-speaking-stop',stopSpeech);
