// Conquistas, easter eggs (The Binding of Isaac + Guaraciaba do Norte) e recompensas. Camada independente.
const KEY='qh-conquistas-v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}}};
let S=load();S.got=S.got||{};S.apps=S.apps||[];S.days=S.days||[];S.wall=S.wall||'padrao';S.frame=S.frame||'';
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch{}};
const A=[
 ['ligou','Primeiro expediente','Ligou o Trambique OS pela primeira vez.','💼'],
 ['curioso','Estagiário curioso','Abriu 5 apps diferentes.','🔎'],
 ['explorador','Fuçador oficial','Abriu 10 apps diferentes.','🗂️'],
 ['acessivel','Jogo pra todo mundo','Abriu os ajustes de Acessibilidade.','♿'],
 ['backup','Precavido','Abriu o app Salvamento.','💾'],
 ['coruja','Plantão da madrugada','Jogou entre 22h e 5h.','🦉'],
 ['assiduo','Bate o ponto','Jogou em 3 dias diferentes de verdade.','📅'],
 ['selfie','Vaidoso','Clicou 7 vezes na própria foto.','🤳'],
 ['guaraciaba','Terra da Serra','Descobriu de onde vem o Trambique OS.','⛰️'],
 ['lagrima','A primeira lágrima','Achou uma lágrima perdida no porão da firma.','💧'],
 ['pilula','Pílula surpresa','Achou uma pílula misteriosa. Aqui é só um segredo de jogo: não tome nada sem saber o que é.','💊'],
 ['chave','Chave do porão','Achou uma chave para abrir a próxima porta da firma.','🗝️'],
 ['coracao','Coração extra','Achou um coração vermelho escondido no porão.','❤️'],
 ['cacador','Caçador de segredos','Achou todos os segredos dos 6 dias.','🔦'],
 ['mae','Mãe tá vendo','Fugiu da mãe por trás da cortina.','👁️'],
 ['colecionador','Colecionador','Desbloqueou 10 conquistas.','🏆'],
 ['platina','Quase Honesto de ouro','Desbloqueou todas as outras conquistas.','👑'],
];
const REWARDS=[
 {at:3,id:'porao',type:'wall',name:'Papel de parede: Porão'},
 {at:5,id:'serra',type:'wall',name:'Papel de parede: Serra da Ibiapaba'},
 {at:7,id:'ouro',type:'frame',name:'Moldura dourada na foto'},
 {at:9,id:'noite',type:'wall',name:'Papel de parede: Noite estrelada'},
 {at:12,id:'lagrima',type:'frame',name:'Moldura lágrima azul'},
 {at:14,id:'porao-pedra',type:'frame',name:'Moldura de Pedra do Porão'},
 {at:15,id:'bau',type:'wall',name:'Papel de parede: Baú dourado'},
];
const SECRET=['lagrima','pilula','chave','coracao','mae','guaraciaba','cacador'];
const count=()=>Object.keys(S.got).length;
// Som (Web Audio, sem arquivos)
let ac;function tone(notes,type='triangle',vol=.08){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();let t=ac.currentTime;for(const [f,d] of notes){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d+.05);t+=d*.7;}}catch{}}
const sndAch=()=>tone([[523,.18],[659,.18],[784,.18],[1047,.4]]);
const sndEgg=()=>tone([[880,.12],[1320,.25]],'sine',.06);
// Fila de avisos: um por vez, com tempo para ler e para o leitor de tela falar
const Q=[];let busy=false;
function toast(html,snd){Q.push([html,snd]);if(!busy)next();}
function next(){const it=Q.shift();if(!it){busy=false;return;}busy=true;const [html,snd]=it;snd?.();
 const t=document.createElement('div');t.className='qh-ach-toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');t.innerHTML=html;document.body.append(t);
 const ms=Math.max(5000,t.textContent.length*90);setTimeout(()=>t.classList.add('out'),ms);setTimeout(()=>{t.remove();setTimeout(next,1200);},ms+450);}
function unlock(id){if(S.got[id])return;const a=A.find(x=>x[0]===id);if(!a)return;S.got[id]=Date.now();save();
 toast(`<span>${a[3]}</span><div><small>CONQUISTA DESBLOQUEADA</small><b>${a[1]}</b></div>`,sndAch);
 const r=REWARDS.find(r=>r.at===count());if(r)toast(`<span>🎁</span><div><small>RECOMPENSA NOVA</small><b>${r.name}</b></div>`,sndAch);
 if(count()>=10)unlock('colecionador');if(count()>=A.length-1)unlock('platina');refresh();}
function apply(){document.documentElement.dataset.qhWall=S.wall;document.documentElement.dataset.qhFrame=S.frame;}
// ---- App Conquistas
let win;const trophy=`<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="#173b3a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M14 14h-6c0 10 5 15 10 15M50 14h6c0 10-5 15-10 15" fill="none"/><path d="M16 10h32v12c0 10-7 17-16 17S16 32 16 22z" fill="#e9b45a"/><path d="M27 39h10v8H27z" fill="#dfb777"/><rect x="19" y="47" width="26" height="8" rx="2" fill="#81c8b1"/></g><path d="m32 17 2.4 5 5.4.6-4 3.7 1.1 5.3L32 29l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z" fill="#fff6dc"/></svg>`;
function body(){const n=count();return `<small class="eyebrow">TRAMBIQUE OS · CONQUISTAS</small>
 <fieldset><legend>${n} de ${A.length} conquistas</legend><div class="qh-ach-bar"><span style="width:${n/A.length*100}%"></span></div>
 <ul class="qh-ach-list">${A.map(a=>{const g=S.got[a[0]];return `<li class="${g?'got':''}"><span>${g?a[3]:'🔒'}</span><div><b>${g||!SECRET.includes(a[0])?a[1]:'???'}</b><small>${g?a[2]:(SECRET.includes(a[0])?'Segredo escondido por aí…':a[2])}</small></div></li>`}).join('')}</ul></fieldset>
 <fieldset><legend>Recompensas</legend><div class="qh-ach-rew">
 <button type="button" data-wall="padrao" aria-pressed="${S.wall==='padrao'}">Padrão</button>
 ${REWARDS.map(r=>{const ok=n>=r.at;const on=r.type==='wall'?S.wall===r.id:S.frame===r.id;return `<button type="button" ${ok?'':'disabled'} data-${r.type}="${r.id}" aria-pressed="${on}">${ok?r.name.replace(/^.*?: /,''):'🔒 '+r.at+' conquistas'}</button>`}).join('')}
 <button type="button" data-frame="" aria-pressed="${!S.frame}">Sem moldura</button></div></fieldset>
 <div class="qh-a11y-foot"><button type="button" class="primary" data-close>Pronto</button></div>`;}
function refresh(){if(win)win.querySelector('.qh-a11y-body').innerHTML=body();}
function openAch(){if(win)return;const prev=document.activeElement;win=document.createElement('div');win.className='qh-a11y-panel';
 win.innerHTML=`<section class="qh-a11y-win qh-win-pop" role="dialog" aria-modal="true" aria-labelledby="qh-ach-t"><header>${trophy}<strong id="qh-ach-t">Conquistas</strong><button type="button" data-close aria-label="Fechar">×</button></header><div class="qh-a11y-body">${body()}</div></section>`;
 document.body.append(win);const close=()=>{win.remove();win=null;prev?.focus?.();};
 win.addEventListener('click',e=>{if(e.target===win||e.target.closest('[data-close]'))return close();const w=e.target.closest('[data-wall]');if(w&&!w.disabled){S.wall=w.dataset.wall;save();apply();refresh();}const f=e.target.closest('[data-frame]');if(f&&!f.disabled){S.frame=f.dataset.frame;save();apply();refresh();}});
 win.addEventListener('keydown',e=>{if(e.key==='Escape')close();});win.querySelector('[data-close]').focus();}
window.qhOpenAchievements=openAch;
// ---- Easter eggs Isaac: 4 por dia (6 dias), aparecem em tempos aleatórios
const EGGS=[
 [1,'d1a','💧','lagrima','Uma lágrima perdida. Até o Isaac chora com golpe do Pix!'],
 [1,'d1b','🪙','','Uma moeda! Guarde: dinheiro fácil demais costuma ser golpe.'],
 [1,'d1c','💣','','Uma bomba! Exploda as mensagens suspeitas antes de clicar.'],
 [1,'d1d','🗝️','chave','A chave do porão abre portas, não links estranhos.'],
 [2,'d2a','💊','pilula','Pílula misteriosa: nunca tome nada sem ler a bula!'],
 [2,'d2b','❤️','coracao','+1 coração vermelho. Sua confiança foi restaurada.'],
 [2,'d2c','🃏','','Uma carta de tarô. O futuro diz: confira antes de pagar.'],
 [2,'d2d','🧪','','Um frasco estranho. Igual link estranho: não abra!'],
 [3,'d3a','🪦','','Uma lápide do porão. Aqui jaz a senha que alguém compartilhou.'],
 [3,'d3b','🕷️','','Uma aranha do porão! Ela também tece golpes.'],
 [3,'d3c','🧸','','Um ursinho perdido. Mantenha seus dados bem guardados.'],
 [3,'d3d','🔑','','Uma chave dourada. Senha boa é senha que só você conhece.'],
 [4,'d4a','👑','','Uma coroa. Promessa de prêmio grande demais? Desconfie.'],
 [4,'d4b','🎲','','Um dado. Na sorte, não: na dúvida, ligue para confirmar.'],
 [4,'d4c','🪰','','Uma mosca chata. Igual mensagem que insiste demais.'],
 [4,'d4d','📖','','Um livro velho. Ler com calma salva o dia.'],
 [5,'d5a','🛡️','','Um escudo sagrado. Sua dúvida é sua proteção.'],
 [5,'d5b','💩','','Um cocô. Assim fica o golpe quando você não cai nele.'],
 [5,'d5c','🦴','','Um osso. Até o cachorro do porão sabe: não confie em estranho.'],
 [5,'d5d','⭐','','Uma estrela. Você está ficando bom nisso!'],
 [6,'d6a','😇','','Asas de anjo. Ajudar alguém a não cair em golpe é coisa de anjo.'],
 [6,'d6b','😈','','Um pacto do diabo. Oferta boa demais sempre cobra caro.'],
 [6,'d6c','🍼','','Uma mamadeira. Até bebê desconfia de boleto falso.'],
 [6,'d6d','🏆','','O troféu do porão. Você chegou ao fim do expediente!'],
];
window.qhEggs=EGGS;S.eggs=S.eggs||{};
function gameDay(){const m=(document.querySelector('.desktop')?.innerText||'').match(/Dia\s+(\d)/i);return Math.min(6,Math.max(1,m?+m[1]:1));}
let eggEl=null;
function collect(e){if(!eggEl)return;S.eggs[e[1]]=Date.now();save();eggEl.remove();eggEl=null;const live=document.getElementById('announcement');if(live)live.textContent=`Segredo do dia ${e[0]} encontrado: ${e[2]}. ${e[4]}`;toast(`<span aria-hidden="true">${e[2]}</span><div><small>SEGREDO DO DIA ${e[0]}</small><b>${e[4]}</b></div>`,sndEgg);if(e[3])unlock(e[3]);if(EGGS.every(x=>S.eggs[x[1]]))unlock('cacador');}
function spawnEgg(){schedule();if(eggEl||!document.querySelector('.desktop .desktop-top')||document.querySelector('.os-boot:not([style*="none"])')||document.hidden)return;const d=gameDay();const pool=EGGS.filter(e=>e[0]===d&&!S.eggs[e[1]]);if(!pool.length)return;const e=pool[Math.random()*pool.length|0];
 eggEl=document.createElement('button');eggEl.type='button';eggEl.className='qh-egg';eggEl.textContent=e[2];eggEl.setAttribute('aria-label',`Segredo do dia ${e[0]}: ${e[2]}. Aperte E ou Enter para pegar.`);eggEl.setAttribute('aria-keyshortcuts','E');eggEl.title='Aperte E ou Enter para pegar este segredo';
 eggEl.style.left=(25+Math.random()*60)+'vw';eggEl.style.top=(22+Math.random()*50)+'vh';
 eggEl.onclick=()=>collect(e);eggEl._e=e;document.body.append(eggEl);sndEgg();
 const live=document.getElementById('announcement');if(live)live.textContent='Um objeto misterioso apareceu na tela! Aperte a tecla E para pegar.';
 const mine=eggEl;setTimeout(()=>{if(eggEl===mine){eggEl.remove();eggEl=null;}},30000);}
function schedule(){clearTimeout(window.__qhEggT);window.__qhEggT=setTimeout(spawnEgg,25000+Math.random()*95000);}
setTimeout(spawnEgg,10000+Math.random()*30000);
addEventListener('keydown',ev=>{if(ev.key.toLowerCase()!=='e'||!eggEl||ev.target.closest?.('input,textarea,[contenteditable]'))return;ev.preventDefault();collect(eggEl._e);});
// Apresentação e Manual: mostra os segredos
function eggList(){return `<section class="qh-eggs-manual"><h3>Segredos encontrados (${Object.keys(S.eggs).length} de ${EGGS.length})</h3><p>A cada dia aparecem 4 segredos do porão em momentos aleatórios. Quando um aparecer, o jogo avisa: aperte E ou Enter para pegar. Você também pode focar o objeto com Tab e pressionar Enter.</p><ul>${[1,2,3,4,5,6].map(d=>`<li><b>Dia ${d}:</b> ${EGGS.filter(e=>e[0]===d).map(e=>S.eggs[e[1]]?`<span title="${e[4]}">${e[2]}</span>`:'<span aria-label="não encontrado">❔</span>').join(' ')}</li>`).join('')}</ul></section>`;}
new MutationObserver(()=>{const w=document.querySelector('.welcome');if(w&&!w.querySelector('.qh-eggs-intro')){const p=document.createElement('p');p.className='qh-eggs-intro';p.textContent='🔦 Segredo: em cada um dos 6 dias, 4 objetos misteriosos aparecem na tela em horas aleatórias. Ache todos! Eles ficam guardados no Manual.';w.append(p);}
 document.querySelectorAll('.desktop-window').forEach(win=>{if(!/manual/i.test(win.querySelector('.windowbar')?.textContent||''))return;const old=win.querySelector('.qh-eggs-manual');const html=eggList();if(old){if(old.outerHTML!==html)old.outerHTML=html;return;}const host=win.querySelector('.windowbar')?.nextElementSibling||win;host.insertAdjacentHTML('beforeend',html);});}).observe(document.body,{childList:true,subtree:true});
let typed='';addEventListener('keydown',e=>{if(e.key.length!==1)return;typed=(typed+e.key.toLowerCase()).slice(-4);if(/mom$|mae$|mãe$/.test(typed)){const m=document.createElement('div');m.className='qh-mom';m.textContent='👁️';document.body.append(m);setTimeout(()=>m.remove(),2600);toast(`<span>👁️</span><div><small>SEGREDO</small><b>A mãe tá olhando… melhor fechar esse link suspeito!</b></div>`,sndEgg);unlock('mae');}});
// ---- Ganchos
let clockClicks=0,photoClicks=0;
document.addEventListener('click',e=>{const app=e.target.closest('[data-app]');if(app){const id=app.dataset.app;if(!S.apps.includes(id)){S.apps.push(id);save();}if(S.apps.length>=5)unlock('curioso');if(S.apps.length>=10)unlock('explorador');}
 if(e.target.closest('.qh-desk,[data-qh-a11y],.qh-a11y-fab')){const t=e.target.closest('.qh-desk')?.textContent||'';if(/Salva/.test(t))unlock('backup');else unlock('acessivel');}
 if(e.target.closest('[data-clock]')){if(++clockClicks>=5){clockClicks=0;toast(`<span>⛰️</span><div><small>GUARACIABA DO NORTE, CEARÁ</small><b>O Trambique OS nasceu lá na Serra da Ibiapaba!</b></div>`,sndEgg);unlock('guaraciaba');}}
 if(e.target.closest('.session-owner-photo')){if(++photoClicks>=7){photoClicks=0;unlock('selfie');}}},true);
function inject(){const top=document.querySelector('.desktop-top');if(top&&!top.querySelector('.qh-ach-btn')){const b=document.createElement('button');b.type='button';b.className='qh-ach-btn';b.innerHTML=trophy+`<span>${count()}</span>`;b.setAttribute('aria-label','Conquistas');b.onclick=openAch;const own=top.querySelector('.session-owner-details')?.parentElement;own?own.before(b):top.append(b);}
 const c=document.querySelector('.qh-ach-btn span');if(c&&c.textContent!=String(count()))c.textContent=count();}
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
apply();{const w=()=>document.querySelector('.desktop-top')?unlock('ligou'):setTimeout(w,1500);w();}const h=new Date().getHours();if(h>=22||h<5)unlock('coruja');
const d=new Date().toISOString().slice(0,10);if(!S.days.includes(d)){S.days.push(d);save();}if(S.days.length>=3)unlock('assiduo');
// Rótulo "PC de nome"
new MutationObserver(()=>{const s=document.querySelector('.session-owner-details>span');if(s&&!s.dataset.pc){s.dataset.pc=1;const name=s.textContent.replace(/^(?:Computador|PC) de\s*/i,'').trim();s.textContent=`PC de ${name}`;}}).observe(document.body,{childList:true,subtree:true});
