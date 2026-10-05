import {expressions,expressionNames} from './mood.js';
import {voiceProfiles,speechTiming} from './speech-timing.js';
let speech=null,timer;
export function portraitSource(caller,emotion){const valid=expressions.includes(emotion)?emotion:'neutral';return `/src/portraits/${caller}-${valid}${speech?.caller===caller&&speech.emotion===valid?'-talking':''}.svg`;}
export function updatePortraits(){
 document.querySelectorAll('.avatar[data-caller]').forEach(avatar=>{
  const caller=avatar.dataset.caller,emotion=avatar.dataset.expression,img=avatar.querySelector('img');
  if(img)img.src=portraitSource(caller,emotion);
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
