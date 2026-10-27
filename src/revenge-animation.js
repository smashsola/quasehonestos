import {expandedRevengeArt} from './revenge-extension-art.js';
import {officeIcon} from './office-icons.js';

const cursor='<svg class="rv-cursor" viewBox="0 0 24 30" aria-hidden="true"><path d="M2 2v22l6-6 5 10 4-2-5-10h9z" fill="#fff9e8" stroke="#193a34" stroke-width="2" stroke-linejoin="round"/></svg>';
const lines='<i></i><i></i><i></i>';
const cake='<svg viewBox="0 0 180 140" aria-hidden="true"><ellipse cx="90" cy="120" rx="76" ry="12" fill="#bbcbb9"/><path d="M30 63h120v49q-60 25-120 0z" fill="#b87453"/><path d="M30 82q60 23 120 0M30 100q60 23 120 0" stroke="#f0c08b" stroke-width="8" fill="none"/><ellipse cx="90" cy="63" rx="60" ry="21" fill="#fff1ce"/><path d="M30 63v17q8 13 17 0t18 0t18 0t18 0t18 0t18 0t13-2V63" fill="#fff1ce"/><path d="M90 43V18" stroke="#5c9478" stroke-width="7"/><path d="M90 18q-12-11 0-18q12 9 0 18" fill="#e4a951"/></svg>';
const parcel='<div class="rv-parcel"><div class="rv-box-lid"></div><div class="rv-box-front"><span class="rv-parcel-tape" aria-hidden="true"></span><div class="rv-shipping-label"><small>FIRMA · ENTREGA FICTÍCIA</small><b>FRETE DO FRETE</b><i aria-hidden="true"></i></div><span class="rv-parcel-handling" aria-hidden="true">↑ ↑</span></div></div>';
const printer='<div class="rv-printer-slot" aria-hidden="true"><div class="rv-printer-panel"><i></i><i></i><span>FIRMA</span></div><div class="rv-printer-mouth"></div></div>';
const phone='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m14 7-6 5c-2 12 16 30 28 28l5-6-10-8-5 5c-5-2-9-6-11-11l5-5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
function paper(title,detail,extra=''){return `<div class="rv-paper"><div class="rv-document-brand"><span aria-hidden="true">QH</span><small>DEPARTAMENTO<br>DE QUASE TUDO</small></div><strong>${title}</strong><span>${detail}</span><div class="rv-paper-lines" aria-hidden="true">${lines}</div>${extra}<div class="rv-document-foot"><span>Via do golpista</span><b>FICTÍCIO</b></div></div>`;}
function receipt(label,detail){return `<div class="rv-receipt"><span class="rv-check"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="m11 25 9 9 18-21" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><small>OPERAÇÃO CENOGRÁFICA</small><strong>${label}</strong><p>${detail}</p><span class="rv-receipt-seal">Registrado na firma · só no jogo</span></div>`;}
function stamp(label){return `<div class="rv-stamp-tool" aria-hidden="true"><i></i><span></span></div><b class="rv-stamp">${label}</b>`;}
function chatBubble(label,text,out=false){return `<div class="rv-chat-bubble ${out?'rv-outgoing':''}"><small>${label}</small><p>${text}</p>${out?'<b>✓✓</b>':''}</div>`;}

function typedLine(text,escape){let letter=0;return text.split(' ').map(word=>`<span class="rv-typed-word">${[...word].map(char=>`<i style="--rv-letter:${letter++}" aria-hidden="true">${escape(char)}</i>`).join('')}</span>`).join(' ');}
// Each scene is an application with a changing object, not a decorative icon.
// The three stages use the same persisted clock as the reward settlement.
export function revengeAnimation(caseId,step,scene,escape){
 const playbackStep=step,part=scene.steps[Math.min(step,scene.steps.length-1)];step=Math.floor(step/2);const control=`<div class="rv-control"><span>${escape(part[0])}</span>${cursor}</div>`;
 let content='',nav='',kind='';
 if(caseId==='whatsapp'){
  kind='chat';nav='Conversas · Departamento de taxas';
  content=`<div class="rv-chat-head">${officeIcon('calls')}<div><b>Golpista · número de mentirinha</b><small>online na própria pressa</small></div></div><div class="rv-chat-log">${chatBubble('GOLPISTA','E o meu Pix? Tá demorando!')}${step===0?`<div class="rv-compose"><small>VOCÊ ESTÁ ESCREVENDO</small><p class="rv-type" aria-label="Para receber a taxa, pague a taxa da taxa.">${typedLine('Para receber a taxa, pague a taxa da taxa.',escape)}</p></div>`:chatBubble('EU','Para receber a taxa, pague a taxa da taxa.',true)}${step===2?receipt('Taxa da taxa recebida','O golpista pagou pela própria pressa.'):''}</div>`;
 }else if(caseId==='bank-call'){
  kind='support';nav='Atendimento · Central quase autorizada';
  content=step===0?`<div class="rv-call"><span class="rv-phone">${phone}</span><small>FALSA CENTRAL NA ESPERA</small><strong>Você é o próximo...</strong><div class="rv-wave">${Array.from({length:9},(_,i)=>`<i style="--beat:${i}"></i>`).join('')}</div><div class="rv-queue"><span>Senha do golpista</span><b>A-404</b><small>Atendendo agora: ninguém</small></div></div>`:step===1?paper('Atendimento premium','Serviço: aguardar o próprio atendimento','<div class="rv-ticket"><b>A-404</b><span>Taxa de espera emitida</span></div>'):receipt('Chamado encerrado','O falso suporte caiu no próprio atendimento.');
 }else if(caseId==='fake-pix'){
  kind='bakery';nav='Pedidos · Confeitaria de comprovantes';
  content=`<div class="rv-bakery"><div class="rv-cake-photo">${cake}<small>BOLO.JPG · APENAS UMA FOTO</small></div>${step===0?printer:`<div class="rv-cake-box"><span>${step===1?'EMBALANDO O PRINT':'ENTREGA: SÓ A IMAGEM'}</span></div>`}${step===2?stamp('PRINT ENTREGUE'):''}</div>`;
 }else if(caseId==='boleto'){
  kind='billing';nav='Cobranças · Boleto do boleto';
  content=step===2?receipt('Boleto do boleto quitado','Serviço prestado: emitir o próprio boleto.'):paper('Taxa de emissão da taxa','Beneficiário: Departamento da Palhaçada',`<div class="rv-barcode"></div>${step===1?'<div class="rv-beneficiary"><span>RECEBEDOR CONFERIDO</span><b>Departamento da Palhaçada ✓</b></div>':''}`);
 }else if(caseId==='delivery'){
  kind='delivery';nav='Expedição · Transportadora de mentirinha';
  content=`<div class="rv-dispatch"><div class="rv-belt"></div>${parcel}${step===2?'<div class="rv-inner-note"><small>DENTRO DO PACOTE</small><b>Mais uma cobrança de frete.</b></div>':''}<span class="rv-route-label">${['Montando a encomenda','A caminho do golpista','Encomenda entregue'][step]}</span></div>`;
 }else if(caseId==='ransomware'){
  kind='license';nav='Licenças · Prefeitura dos arquivos';
  content=`<div class="rv-license-desk"><div class="rv-file-lock">${officeIcon('files')}<span>SEUS ARQUIVOS</span><b>Continuam protegidos</b></div>${paper('Alvará de vírus','Atividade: bloquear arquivos imaginários',step===1?'<div class="rv-ticket"><b>TAXA</b><span>Licença para trabalhar</span></div>':'')}${step===2?stamp('INDEFERIDO'):''}</div>`;
 }else if(caseId==='fake-motoboy'){
  kind='collection';nav='Coletas · Cartão invisível';
  content=`<div class="rv-collection"><div class="rv-safe-card"><small>SEU CARTÃO</small><b>•••• 0042</b><span>Fica com você ✓</span></div><div class="rv-shopping-bag"><div class="rv-bag-handle"></div><b>${step===2?'NÃO':'CARTÃO INVISÍVEL'}</b><small>${step===2?'Era isso que tinha aqui.':'Conteúdo: absolutamente nada'}</small></div>${step===1?'<div class="rv-collection-pass"><small>PASSE DE COLETA</small><b>Retirar: nada</b></div>':''}</div>`;
 }else if(caseId==='fake-store'){
  kind='store';nav='Vitrine · Reserva da reserva';
  content=`<div class="rv-store"><div class="rv-store-awning"></div><div class="rv-listing">${officeIcon('shop')}<div><small>OFERTA EXCLUSIVA PARA GOLPISTA</small><strong>Direito de reservar uma reserva</strong><span>Estoque inicial: zero unidades</span></div></div>${step===1?'<div class="rv-reservation"><small>RESERVA CONFIRMADA</small><b>Você reservou a espera.</b></div>':''}${step===2?'<div class="rv-store-shutter"><b>ESGOTADO</b><span>desde antes de abrir</span></div>':''}</div>`;
 }else if(caseId==='fake-government'){
  kind='government';nav='Guichê · Regularização infinita';
  content=`<div class="rv-government">${printer}${paper('Regularização da taxa','Solicitante: o próprio golpista',step===1?'<div class="rv-ticket"><b>QUASE</b><span>Taxa da taxa paga</span></div>':'')}${step===2?stamp('REGULARIZAR NOVAMENTE'):''}</div>`;
 }else if(caseId==='card-swap'){
  kind='warranty';nav='Garantias · Maquininha da firma';
  content=step===1?`<div class="rv-terminal"><div class="rv-terminal-screen"><small>GARANTIA IMAGINÁRIA</small><strong>APROVADA</strong><span>Cobertura: quase nenhuma</span></div><div class="rv-terminal-keys" aria-hidden="true">${Array.from({length:9},(_,i)=>`<i>${i+1}</i>`).join('')}</div><div class="rv-insert-card"><small>CARTÃO DO GOLPISTA</small><b>•••• NADA</b></div></div>`:`<div class="rv-policy">${paper('Garantia antivergonha','Cobertura: quase nenhuma',`<div class="rv-policy-clause">${step===2?'Exclusão: falta de vergonha.':'Validade: até perceber o golpe.'}</div>`)}${step===2?stamp('GARANTIA VENCIDA'):''}</div>`;
 }else{kind='extended';nav='Teatro da firma · '+escape(scene.prop);content=expandedRevengeArt(caseId,playbackStep,part,escape);}
 if(playbackStep%2)content=`<div class="rv-preparation"><span>${officeIcon('shield')}</span><b>${escape(part[0])}</b><small>Conferência da peça cenográfica</small><div class="rv-preparation-scan"></div></div>`+content;
 const revealObjects=new Set(['rv-chat-head','rv-chat-bubble','rv-compose','rv-call','rv-paper','rv-receipt','rv-cake-photo','rv-printer-slot','rv-cake-box','rv-parcel','rv-inner-note','rv-file-lock','rv-safe-card','rv-shopping-bag','rv-collection-pass','rv-listing','rv-reservation','rv-store-shutter','rv-terminal']);
 let revealIndex=0;
 content=content.replace(/class="([^"]+)"/g,(attribute,classes)=>revealObjects.has(classes.split(' ')[0])?`${attribute} data-rv-enter="${Math.min(850,100+revealIndex++*250)}"`:attribute);
 return `<div class="rv-app" style="--rv-from:${playbackStep/scene.steps.length};--rv-to:${(playbackStep+1)/scene.steps.length}" data-revenge-case="${escape(caseId)}" data-revenge-stage="${playbackStep}" data-revenge-art-stage="${step}"><header class="rv-appbar">${officeIcon(scene.icon)}<strong>${escape(scene.prop)}</strong><span>SIMULAÇÃO</span></header><div class="rv-appnav">${nav}</div><div class="rv-workspace rv-${kind}">${content}</div><div class="rv-toolbar" data-rv-enter="650">${control}</div><div class="rv-live-result" data-rv-enter="1700" role="status"><span>✓</span><p>${escape(part[2])}</p></div><div class="rv-timebar" aria-hidden="true"><i></i></div></div>`;
}
