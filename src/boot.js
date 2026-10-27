import {showLogin} from './login.js';
import {nextSkipLine} from './boot-copy.js';
import {localStore} from './safe-storage.js';
export function startBoot({screen,app,storage=localStore,reduceMotion=false,schedule=setTimeout,cancel=clearTimeout,ready=()=>{}}){
 if(!screen||!app)return;
 screen.style?.removeProperty('display');
 if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('qh-boot-music-start'));
 const button=screen.querySelector('button'),status=screen.querySelector('[data-boot-status]');
 const track=screen.querySelector('.boot-track span');
 const progress=track?.animate?.([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:5500,easing:'linear',fill:'forwards'});
 let finished=false,endTimer;const timers=[];
 function finish(){
  if(finished)return;finished=true;
  if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('qh-boot-music-stop'));
  if(progress){progress.finish();}timers.forEach(cancel);cancel(endTimer);
  app.inert=false;screen.classList.add('boot-finished');ready();
  schedule(()=>screen.remove(),reduceMotion?0:400);
 }
 button?.addEventListener('click',finish);
 if(button){button.textContent=nextSkipLine(storage);button.setAttribute('aria-label','Pular inicialização: '+button.textContent);button.title='Pular inicialização';}
 app.inert=true;
 for(const [delay,text] of [[1400,'Conferindo o café…'],[2800,'Abrindo os aplicativos da firma…'],[4400,'Tudo quase pronto.']])timers.push(schedule(()=>{if(status)status.textContent=text;},delay));
 endTimer=schedule(finish,5500);return finish;
}
if(typeof document!=='undefined')showLogin(document.querySelector('#app'),()=>startBoot({screen:document.querySelector('#os-boot'),app:document.querySelector('#app'),reduceMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches,ready:()=>{
 document.documentElement.dataset.bootReady='true';
 const app=document.querySelector('#app');
 if(!app.children.length){const recovery=document.createElement('section');recovery.className='startup-recovery';recovery.innerHTML='<h1>Os apps ainda não abriram.</h1><p>O salvamento foi mantido. Confira a conexão e tente abrir novamente.</p><button type="button">Tentar novamente</button>';recovery.querySelector('button').addEventListener('click',()=>location.reload());app.append(recovery);}
 document.dispatchEvent(new CustomEvent('qh-boot-ready'));
}}));
