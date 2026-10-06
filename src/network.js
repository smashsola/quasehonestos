// A fictional network panel for Trambique OS; it does not change device settings.
const wifi='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0M9 16a4.5 4.5 0 0 1 6 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="20" r="1.5" fill="currentColor"/></svg>';
const diagnoses=['O roteador está funcionando. A firma é que precisa de assistência.','Sinal excelente. O chefe continua culpando a internet pela planilha.','Nenhum cabo solto. Só o estagiário, que já quer ir embora.'];
let open=false,diagnostic=-1;
function controls(){
 const bar=document.querySelector('.taskbar');if(!bar)return;
 let button=bar.querySelector('[data-network-toggle]');
 if(!button){button=document.createElement('button');button.dataset.networkToggle='true';button.className='network-toggle';button.innerHTML=wifi;button.title='Internet da firma · conectada por um milagre';button.setAttribute('aria-label','Internet da firma: conectada. Ver rede');button.setAttribute('aria-controls','network-panel');bar.insertBefore(button,bar.querySelector('[data-sound-panel]')||bar.querySelector('small'));}
 button.setAttribute('aria-expanded',String(open));
 if(open&&!document.querySelector('#network-panel')){
  const panel=document.createElement('section');panel.id='network-panel';panel.className='network-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-labelledby','network-title');
  panel.innerHTML=`<div class="network-heading"><div><small>TRAMBIQUE OS</small><h2 id="network-title">Internet da firma</h2></div><button data-network-close aria-label="Fechar painel de internet">×</button></div><div class="network-connected"><span class="network-symbol">${wifi}</span><div><strong>FIRMA_5G_QUASE_6G</strong><span><i></i> Conectado por um milagre</span></div></div><p class="network-tagline">Sinal forte. Reputação fraca.</p><dl class="network-details"><div><dt>Velocidade</dt><dd>Até o chefe abrir 37 abas</dd></div><div><dt>Estabilidade</dt><dd>Maior que a do estagiário</dd></div></dl><button class="network-diagnose" data-network-diagnose>Diagnosticar a gambiarra</button><p class="network-diagnostic" role="status">${diagnostic<0?'A impressora já tentou culpar o Wi-Fi.':diagnoses[diagnostic]}</p><footer>Rede fictícia do jogo · nenhum ajuste no seu Wi-Fi</footer>`;
  panel.querySelector('footer').textContent='Trambique Net · rede fictícia, desculpas ilimitadas';
  document.querySelector('.desktop').append(panel);
 }
 if(!open)document.querySelector('#network-panel')?.remove();
}
function close(returnFocus=false){open=false;controls();if(returnFocus)document.querySelector('[data-network-toggle]')?.focus({preventScroll:true});}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-network-toggle]')){open=!open;if(open)document.dispatchEvent(new CustomEvent('qh-tray-open',{detail:'network'}));controls();}
 else if(e.target.closest('[data-network-close]'))close(true);
 else if(e.target.closest('[data-network-diagnose]')){diagnostic=(diagnostic+1)%diagnoses.length;document.querySelector('.network-diagnostic').textContent=diagnoses[diagnostic];}
 else if(open&&!e.target.closest('#network-panel'))close();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)close(true);});
document.addEventListener('qh-tray-open',e=>{if(e.detail!=='network'&&open)close();});
new MutationObserver(()=>{if(!document.querySelector('[data-network-toggle]')||(open&&!document.querySelector('#network-panel')))controls();}).observe(document.querySelector('#app'),{childList:true,subtree:true});
controls();
