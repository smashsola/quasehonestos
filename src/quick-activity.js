const KEY='qh-quick-invite';
let shown=false;
function wasAnswered(){try{return localStorage.getItem(KEY)==='yes';}catch{return true;}}
function remember(){try{localStorage.setItem(KEY,'yes');}catch{}}
function closeInvite(){document.querySelector('.qh-quick-invite')?.remove();}
function invite(){
 if(shown||wasAnswered()||!document.querySelector('.desktop'))return;
 shown=true;
 const panel=document.createElement('section');panel.className='qh-quick-invite';panel.setAttribute('aria-labelledby','qh-quick-invite-title');panel.innerHTML='<div><small>MANUAL · ATIVIDADE OPCIONAL</small><h2 id="qh-quick-invite-title">Quer fazer uma atividade rápida antes de começar?</h2><p>Você pode responder quatro situações no Manual e depois comparar com um atendimento.</p></div><div class="qh-quick-invite-actions"><button type="button" data-quick-start>Fazer a atividade</button><button type="button" data-quick-later>Agora não</button></div>';
 document.body.append(panel);
 panel.addEventListener('click',event=>{
  if(event.target.closest('[data-quick-later]')){remember();closeInvite();const toast=document.createElement('div');toast.className='qh-quick-toast';toast.setAttribute('role','status');toast.textContent='Tudo bem! Dá uma olhada no Manual depois para saber mais sobre cada dia.';document.body.append(toast);setTimeout(()=>toast.remove(),5000);return;}
  if(!event.target.closest('[data-quick-start]'))return;
  remember();closeInvite();
  const manual=document.querySelector('.desktop-icons [data-app="help"],.taskbar [data-task-app="help"],.mobile-app-switcher [data-app="help"]');
  manual?.click();
  document.querySelector('[data-classroom-start]')?.click();
 });
}
document.addEventListener('qh-render',invite);
queueMicrotask(invite);
