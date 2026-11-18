// Acessibilidade do Trambique OS. Começa ligado (estilo Minecraft) com botão para desligar.
const KEY='qh-a11y-v1';
const defaults={narrate:true,captions:true,text:'md',contrast:false,focus:false,calm:false,rate:1,instant:false};
let s,seen;
try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');seen=!!raw;s={...defaults,...(raw||{})};}catch{s={...defaults};seen=false;}
if(!seen&&matchMedia('(prefers-reduced-motion: reduce)').matches)s.calm=true;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}};
const icon=`<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#e3c17c" stroke="#173b3a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><rect x="10" y="10" width="44" height="44" rx="10"/></g><g fill="none" stroke="#173b3a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="19" r="5" fill="#173b3a" stroke="none"/><path d="M20 27q12 8 24 0"/><path d="M32 31v9"/><path d="M32 40l-7 9m7-9 7 9"/></g></svg>`;
function apply(){const h=document.documentElement;h.dataset.qhText=s.text;h.classList.toggle('qh-contrast',s.contrast);h.classList.toggle('qh-focus',s.focus||s.narrate);h.classList.toggle('qh-calm',s.calm);if(!s.narrate)speechSynthesis?.cancel();}
apply();

// Narração
let voice=null;
function pickVoice(){const v=speechSynthesis?.getVoices?.()||[];voice=v.find(x=>/pt[-_]BR/i.test(x.lang))||v.find(x=>/^pt/i.test(x.lang))||null;}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function say(text,{force=false,queue=false}={}){
 if(!('speechSynthesis' in window)||(!s.narrate&&!force))return;
 text=String(text||'').replace(/\s+/g,' ').trim().slice(0,600);if(!text)return;
 if(!queue)speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';if(voice)u.voice=voice;u.rate=s.rate;speechSynthesis.speak(u);
}
function labelOf(el){
 const t=el.getAttribute('aria-label')||(el.labels&&el.labels[0]?.innerText)||el.getAttribute('placeholder')||el.innerText||el.getAttribute('title')||el.alt||'';
 let role='';if(el.matches('button,[role=button]'))role='botão';else if(el.matches('a'))role='link';else if(el.matches('input[type=radio]'))role=el.checked?'opção marcada':'opção';else if(el.matches('input[type=checkbox]'))role=el.checked?'marcado':'desmarcado';else if(el.matches('input,textarea'))role='campo de texto';
 const pressed=el.getAttribute('aria-pressed')==='true'?', selecionado':'';
 return `${t}${role?', '+role:''}${pressed}`;
}
document.addEventListener('focusin',e=>{const el=e.target;if(el.closest?.('.qh-a11y-win')&&!s.narrate)return;if(el.matches?.('button,a,input,textarea,select,[tabindex]'))say(labelOf(el));});
document.addEventListener('pointerup',e=>{if(!s.narrate)return;const el=e.target.closest?.('button,a,label,p,li,h1,h2,h3,strong,small,[role=status]');if(!el||el.matches('input,textarea'))return;if(el.matches('button,a'))return;say(el.innerText);},true);

// Legendas + leitura do que o jogo anuncia
let cap,capTimer;
function caption(text){
 if(!s.captions||!text)return;
 if(!cap){cap=document.createElement('div');cap.className='qh-a11y-caption';cap.setAttribute('aria-hidden','true');document.body.append(cap);}
 cap.textContent=text;cap.classList.add('show');clearTimeout(capTimer);capTimer=setTimeout(()=>cap.classList.remove('show'),Math.min(8000,2500+text.length*45));
}
function watchLive(){
 const seenNodes=new WeakSet();
 new MutationObserver(muts=>{for(const m of muts){const t=m.target.nodeType===1?m.target:m.target.parentElement;const live=t?.closest?.('[aria-live],[role=status],[role=alert]');if(!live||live.closest('.qh-a11y-win,.qh-a11y-banner'))continue;const text=live.innerText?.trim()||live.textContent?.trim();if(!text||seenNodes.has(live)&&live.dataset.qhLast===text)continue;seenNodes.add(live);live.dataset.qhLast=text;caption(text);say(text,{queue:true});}}).observe(document.body,{subtree:true,childList:true,characterData:true});
}
// Legenda para sons do jogo
const C=window.AudioContext||window.webkitAudioContext;
if(C){let last=0;const orig=C.prototype.createOscillator;C.prototype.createOscillator=function(){const now=Date.now();if(now-last>4000){last=now;const ctx=document.querySelector('.desktop-window[data-window-id="calls"]')?'[♪ Som do Zape]':'[♪ Efeito sonoro]';caption(ctx);}return orig.apply(this,arguments);};}

// Taskbar / botão flutuante
function fab(){
 const b=document.createElement('button');b.type='button';b.className='qh-a11y-fab';b.setAttribute('aria-label','Acessibilidade: abrir ajustes');b.innerHTML=icon+'<span>Acessibilidade</span>';b.onclick=openPanel;document.body.append(b);
}
function syncTaskbar(){
 const bar=document.querySelector('.taskbar');document.body.classList.toggle('qh-has-taskbar',!!bar);
 window.qhA11y={icon,open:openPanel};
}

// Faixa de primeiro acesso
function banner(){
 const el=document.createElement('section');el.className='qh-a11y-banner';el.setAttribute('role','region');el.setAttribute('aria-label','Acessibilidade');
 el.innerHTML=`${icon}<p><strong>Leitura em voz alta e legendas ligadas</strong>Não precisa? Desligue com um toque. Dá para mudar depois no ícone de acessibilidade.</p><div><button type="button" class="primary" data-off>Desativar</button><button type="button" data-adjust>Ajustar</button></div>`;
 document.body.append(el);document.body.classList.add('qh-has-banner');
 const done=()=>{seen=true;save();el.remove();document.body.classList.remove('qh-has-banner');};
 el.querySelector('[data-off]').onclick=()=>{s.narrate=false;s.captions=false;apply();done();};
 el.querySelector('[data-adjust]').onclick=()=>{el.hidden=true;openPanel(()=>{el.hidden=false;el.querySelector('[data-adjust]').focus();});};
 window.__qhBannerDone=done;
 setTimeout(()=>say('Bem-vindo ao Quase Honestos. Leitura em voz alta e legendas estão ligadas. Para desativar, use o botão Desativar no rodapé.',{force:true}),600);
 addEventListener('keydown',function k(e){if(e.ctrlKey&&e.key.toLowerCase()==='b'){e.preventDefault();s.narrate=!s.narrate;apply();save();say(s.narrate?'Narração ligada':'Narração desligada',{force:true});}});
}

// Janela Ajustes
let panel;
function row(id,title,desc){return `<label class="qh-a11y-row"><span>${title}<small>${desc}</small></span><input type="checkbox" data-k="${id}" ${s[id]?'checked':''}></label>`;}
function seg(k,opts){return `<div class="qh-a11y-seg" role="group">${opts.map(([v,l])=>`<button type="button" data-seg="${k}" data-v="${v}" aria-pressed="${String(s[k])===String(v)}">${l}</button>`).join('')}</div>`;}
function openPanel(onCancel){if(typeof onCancel!=='function')onCancel=null;
 if(panel)return;let changed=false;const prev=document.activeElement;
 panel=document.createElement('div');panel.className='qh-a11y-panel';
 panel.innerHTML=`<section class="qh-a11y-win" role="dialog" aria-modal="true" aria-labelledby="qh-a11y-t"><header>${icon}<strong id="qh-a11y-t">Ajustes de acessibilidade</strong><button type="button" data-close aria-label="Fechar">×</button></header><div class="qh-a11y-body"><small class="eyebrow">TRAMBIQUE OS · AJUSTES</small>
 <fieldset><legend>Leitura e visão</legend>${row('narrate','Leitura em voz alta','Lê botões, textos tocados e avisos do jogo. Atalho: Ctrl + B.')}<span>Velocidade da voz</span>${seg('rate',[[0.8,'Devagar'],[1,'Normal'],[1.3,'Rápida']])}<span>Tamanho do texto</span>${seg('text',[['md','Padrão'],['lg','Grande'],['xl','Muito grande']])}</fieldset>
 <fieldset><legend>Contraste</legend>${row('contrast','Alto contraste','Cores mais fortes para ler melhor.')}${row('focus','Foco reforçado','Contorno amarelo bem visível em quem está selecionado.')}</fieldset>
 <fieldset><legend>Movimento</legend>${row('calm','Menos movimento','Desliga animações, pulos e transições.')}</fieldset>
 <fieldset><legend>Ritmo</legend>${row('instant','Texto instantâneo','As falas aparecem na hora, sem esperar o digitando…')}</fieldset>
 <fieldset><legend>Áudio e legendas</legend>${row('captions','Legendas na tela','Mostra no topo os avisos e sons do jogo.')}</fieldset>
 <div class="qh-a11y-foot"><button type="button" data-test>Testar voz</button><button type="button" data-reset>Restaurar</button><button type="button" class="primary" data-close>Pronto</button></div></div></section>`;
 document.body.append(panel);
 const close=()=>{panel.remove();panel=null;if(onCancel&&!changed)onCancel();else{window.__qhBannerDone?.();window.__qhBannerDone=null;prev?.focus?.();}};panel.addEventListener('change',()=>changed=true,true);panel.addEventListener('click',e=>{if(e.target.closest('[data-seg],[data-reset]'))changed=true;},true);
 panel.addEventListener('click',e=>{if(e.target===panel||e.target.closest('[data-close]'))return close();const sg=e.target.closest('[data-seg]');if(sg){const k=sg.dataset.seg;s[k]=k==='rate'?Number(sg.dataset.v):sg.dataset.v;panel.querySelectorAll(`[data-seg="${k}"]`).forEach(b=>b.setAttribute('aria-pressed',b===sg));apply();save();}
  if(e.target.closest('[data-test]'))say('Olá! Esta é a voz do Trambique OS.',{force:true});
  if(e.target.closest('[data-reset]')){s={...defaults};apply();save();close();openPanel();}});
 panel.addEventListener('change',e=>{const k=e.target.dataset.k;if(k){s[k]=e.target.checked;apply();save();}});
 panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const f=[...panel.querySelectorAll('button,input')];const i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f.at(-1).focus();}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus();}}});
 panel.querySelector('[data-close]').focus();
}

function init(){fab();syncTaskbar();new MutationObserver(syncTaskbar).observe(document.body,{childList:true,subtree:true});watchLive();if(!seen)banner();else addEventListener('keydown',e=>{if(e.ctrlKey&&e.key.toLowerCase()==='b'){e.preventDefault();s.narrate=!s.narrate;apply();save();say(s.narrate?'Narração ligada':'Narração desligada',{force:true});}});}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
