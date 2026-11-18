// Limites do saldo: aviso em C$ -500 e demissão em C$ -1000 (com recomeço do dia). Camada independente.
const KEY='quase-honestos-v1',SNAP='qh-day-snapshot',WARN='qh-money-warned';
export const WARN_AT=-500,FIRE_AT=-1000;
let shown=null;
const read=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const write=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
const remove=key=>{try{localStorage.removeItem(key);}catch{}};
function modal(kind){
 if(shown)return;const fire=kind==='fire';shown=document.createElement('div');shown.className='qh-money-shade';
 shown.innerHTML=`<section class="defense-feedback defense-reaction is-miss qh-money-modal" role="alertdialog" aria-modal="true" aria-labelledby="qh-money-t"><span class="defense-reaction-burst" aria-hidden="true">${fire?'📛':'🐷'}</span><small class="defense-reaction-kicker">${fire?'VOCÊ FOI DEMITIDO':'AVISO DO CHEFE'}</small><h2 id="qh-money-t">${fire?'Crachá recolhido!':'Cuidado, estagiário!'}</h2><p class="defense-reaction-note">${fire?'Você caiu em tantos golpes que o cofrinho da firma ficou no negativo! O chefe pegou seu crachá de papelão e usou de apoio pro pé da mesa manca dele.':'Estagiário... o porquinho da firma esvaziou! Mais um vacilo desses e você vai ter que pagar o prejuízo limpando a máquina de café.'}</p><p class="defense-reaction-feedback">Na próxima, lembre-se: se a mensagem for estranha ou pedir dinheiro com pressa, pare e confira antes de clicar!</p><div class="defense-feedback-actions">${fire?'<button class="primary" data-money-retry>Tentar de novo (Recomeçar o dia)</button>':'<button class="primary" data-money-ok>Entendi</button>'}</div></section>`;
 document.body.append(shown);const live=document.getElementById('announcement');if(live)live.textContent=shown.innerText;
 shown.querySelector('button').focus();
 shown.addEventListener('click',e=>{if(e.target.closest('[data-money-ok]')){shown.remove();shown=null;}
  if(e.target.closest('[data-money-retry]')){const snap=read(SNAP);if(snap)write(KEY,snap);remove(WARN);location.reload();}});
}
function check(){const s=window.qhState;if(!s||s.mode!=='defense')return;
 const day=Math.floor((s.cursor||0)/5);let snapDay=-1;try{snapDay=JSON.parse(read(SNAP)||'null')?.__day??-1}catch{}
 if(snapDay!==day&&!s.active){const c=JSON.parse(JSON.stringify(s));c.__day=day;write(SNAP,JSON.stringify(c));}
 const cr=Number(s.credits)||0;
 if(cr<=FIRE_AT)return modal('fire');
 if(cr<=WARN_AT&&read(WARN)!==String(day)){write(WARN,String(day));modal('warn');}
}
addEventListener('qh-render',()=>setTimeout(check,1200));
