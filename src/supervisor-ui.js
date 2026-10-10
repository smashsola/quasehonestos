// Operational guidance belongs to the Supervisor. The Chef only appears in the
// end-of-shift report rendered by shift-ending.js.
const shiftNotes=[
 'Primeiro turno: conheça a interface, converse do seu jeito e use só dados fictícios.',
 'Segundo turno: confira o contexto antes de pedir qualquer item da proposta.',
 'Último turno: termine o atendimento e revise o que aconteceu nos Resultados.'
];

function shiftNumber(root){
 const text=root.querySelector('.shift')?.textContent||root.querySelector('.desktop-top span')?.textContent||'';
 const match=text.match(/Turno\s+(\d+)/i);
 return Math.max(1,Math.min(3,Number(match?.[1])||1));
}

export function applySupervisorRole(root=document){
 const boss=root.querySelector('.boss');
 if(boss){
  const small=boss.querySelector('small'),title=boss.querySelector('h2'),body=boss.querySelector('p:not(.scribble)'),scribble=boss.querySelector('.scribble');
  if(small)small.textContent='RECADO DO SUPERVISOR';
  if(title)title.textContent='Supervisor de turno.';
  if(body)body.textContent=shiftNotes[shiftNumber(root)-1];
  if(scribble)scribble.textContent='“Vai por etapas.”';
 }
 const onboarding=root.querySelector('.welcome.onboarding');
 if(onboarding){
  const intro=onboarding.querySelector('.intro-copy p');
  if(intro)intro.textContent='O café é duvidoso. O treinamento também. Seu computador já está ligado e a primeira chamada está esperando.';
  const note=onboarding.querySelector('.first-day-note');
  if(note){
   const label=note.querySelector('div > small'),message=note.querySelector('div > p'),signature=note.querySelector('div > span');
   if(label)label.textContent='RECADO DO SUPERVISOR';
   if(message)message.textContent='“Eu te mostro o caminho no primeiro atendimento. A conversa é sua.”';
   if(signature)signature.textContent='— Supervisor';
  }
 }
}

const app=document.querySelector('#app');
if(app){
 const observer=new MutationObserver(()=>applySupervisorRole(app));
 observer.observe(app,{childList:true,subtree:true});
 applySupervisorRole(app);
}
