import {nextSkipLine} from './boot-copy.js';
const screen=document.querySelector('#os-boot');
const app=document.querySelector('#app');
if(screen){
 screen.querySelector('button').textContent=nextSkipLine(localStorage);
 const status=screen.querySelector('[data-boot-status]');
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let finished=false;
 app.inert=true;
 const steps=[[1400,'Conferindo o café…'],[2800,'Abrindo os aplicativos da firma…'],[4400,'Tudo quase pronto.']];
 const timers=steps.map(([delay,text])=>setTimeout(()=>{status.textContent=text;},delay));
 function finish(){
  if(finished)return;finished=true;timers.forEach(clearTimeout);clearTimeout(endTimer);
  app.inert=false;screen.classList.add('boot-finished');
  document.dispatchEvent(new CustomEvent('qh-boot-ready'));
  setTimeout(()=>screen.remove(),reduceMotion?0:400);
 }
 const endTimer=setTimeout(finish,5500);
 screen.querySelector('button').addEventListener('click',finish);
}
