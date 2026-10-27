import {requiresScamInteraction} from './interaction-policy.js';
import {expandedById} from './expanded-scams.js';
import {officeIcon} from './office-icons.js';

export function beginScamInteraction(active,choice,now=Date.now()){
 const s=expandedById[active?.caseId];
 if(!s||!requiresScamInteraction(active.caseId,choice)||active.mode!=='defense'||active.outcome||active.actionPending||active.interaction||!['ready','speaking'].includes(active.chatStage)||!s.id||!['verify','accept','trust','joke'].some(x=>choice===s.id+'--'+x))return false;
 active.chatStage='ready';active.interaction={choice,step:s.kind==='middleman'?0:s.checks.length,view:choice.endsWith('--accept')?'contain':'inspect',disabled:[],startedAt:now,...(choice.endsWith('--accept')?{deadline:now+12000}:{})};return true;
}
export function actScamInteraction(active,command,now=Date.now()){
 const s=expandedById[active?.caseId],i=active?.interaction;if(!s||!i||active.outcome||active.actionPending)return null;
 if(command==='inspect'&&i.step<s.checks.length){i.step++;return {changed:true};}
 if(command.startsWith('read:')&&s.kind==='middleman'){
  const side=command.slice(5);if(!['buyer','seller'].includes(side))return null;i.reviewed??=[];if(i.reviewed.includes(side))return null;i.reviewed.push(side);i.step=i.reviewed.length;return {changed:true};
 }
 if(command.startsWith('select:')&&['donation','mei'].includes(s.kind)){
  const target=command.slice(7),allowed=s.kind==='donation'?['official','forwarded']:['guide','received'];if(!allowed.includes(target))return null;i.selected=target;return {changed:true};
 }
 if(command==='toggle:items'&&s.kind==='inventory'){i.disabled=i.disabled.includes('items')?[]:['items'];return {changed:true};}

 if(command.startsWith('toggle:')&&s.kind==='terms'){
  const key=command.slice(7);if(!['contacts','sms','renewal'].includes(key))return null;
  i.disabled=i.disabled.includes(key)?i.disabled.filter(x=>x!==key):[...i.disabled,key];return {changed:true};
 }
 if(command==='cancel'){if(i.view==='contain')return null;active.interaction=null;return {changed:true};}
 if(command==='risk'&&i.view==='inspect'){
  i.view='confirm';return {changed:true};
 }
 if(command==='back'&&i.view==='confirm'){i.view='inspect';return {changed:true};}
 let safe=false;
 if(command==='safe'){
  if(i.view!=='inspect'||i.step<s.checks.length||s.kind==='terms'&&i.disabled.length!==3||s.kind==='inventory'&&!i.disabled.includes('items')||s.kind==='donation'&&i.selected!=='official'||s.kind==='mei'&&i.selected!=='guide')return null;
  safe=true;
 }else if(command==='confirm-risk'&&i.view==='confirm'){
  if(['updates','sessions','inventory'].includes(s.kind)){i.view='contain';i.deadline=now+12000;return {changed:true};}
 }else if(command==='rescue'&&i.view==='contain'&&now<i.deadline){safe=true;}
 else return null;
 const initialSafe=/--(?:verify|joke)$/.test(i.choice),id=(safe===initialSafe?i.choice:s.id+(safe?'--verify':'--accept'));
 active.interactionAudit={steps:i.step,permissions:[...i.disabled],rescued:i.view==='contain',initialChoice:i.choice};active.interaction=null;return {changed:true,choice:id};
}
export function expireScamInteraction(active,now=Date.now()){
 const i=active?.interaction;if(!i||i.view!=='contain'||!Number.isFinite(i.deadline)||now<i.deadline)return null;
 const id=active.caseId+'--accept';active.interactionAudit={steps:i.step,expired:true,initialChoice:i.choice};active.interaction=null;return {changed:true,choice:id};
}
function board(s,i,escape){
 const rows=s.evidence.map((text,index)=>`<div class="scam-evidence-row ${(index<i.step||i.step>=s.checks.length)?'is-reviewed':''}"><span>${officeIcon((index<i.step||i.step>=s.checks.length)?'shield':s.icon)}</span><p>${escape(text)}</p><b aria-label="${(index<i.step||i.step>=s.checks.length)?'Conferido':'A conferir'}">${(index<i.step||i.step>=s.checks.length)?'✓':'·'}</b></div>`).join('');
 let special='';
 if(s.kind==='middleman')special=`<div class="scam-two-conversations">${[['buyer','Comprador','O intermediário pediu um Pix para a conta dele e mandou esconder o valor do dono.'],['seller','Proprietário','Não conheço esse desconto e não autorizei outra conta a receber pelo bem.']].map(([key,label,text])=>`<article><button data-scam-command="read:${key}" ${i.reviewed?.includes(key)?'disabled':''}>${officeIcon('calls')} Ler conversa · ${label}</button><p>${i.reviewed?.includes(key)?escape(text):'Abra o relato desta parte para comparar as histórias.'}</p></article>`).join('')}</div>`;
 if(s.kind==='donation'||s.kind==='mei')special=`<div class="scam-destination-picker"><p>${s.kind==='donation'?'Selecione o destino depois de comparar os canais:':'Escolha qual guia corresponde à consulta independente:'}</p>${(s.kind==='donation'?[['official','Campanha no canal do organizador','Destino confirmado pela organização'],['forwarded','Chave nova do post encaminhado','Destino diferente da campanha original']]:[['guide','Guia consultada no portal conhecido','Obrigação verificada por você'],['received','Boleto que chegou por mensagem','Taxa não confirmada na consulta']]).map(([key,label,detail])=>`<button data-scam-command="select:${key}" aria-pressed="${i.selected===key}" class="${i.selected===key?'is-selected':''}"><span>${officeIcon(key==='official'||key==='guide'?'shield':s.icon)}</span><span><b>${label}</b><small>${detail}</small></span><strong aria-hidden="true">${i.selected===key?'✓':'○'}</strong></button>`).join('')}</div>`;
 if(s.kind==='inventory')special=`<div class="scam-inventory"><div>${[['prize','Skin lendária'],['wallet','Moedas do jogo'],['club','Itens guardados']].map(([icon,label])=>`<span>${officeIcon(icon)}<b>${label}</b></span>`).join('')}</div><label><input type="checkbox" data-scam-toggle="items" ${i.disabled.includes('items')?'':'checked'}><span>Autorizar transferência de todos os itens para outra conta</span></label><small>Desmarque a autorização de troca que veio no pedido. Nenhuma conta de jogo real é acessada.</small></div>`;
 if(s.kind==='terms')special=`<div class="scam-permissions"><p><b>O app só troca o papel de parede.</b> Tire os acessos e a renovação que vieram marcados antes de decidir.</p>${[['contacts','Ler seus contatos'],['sms','Ler suas mensagens'],['renewal','Renovar assinatura · C$ 40 por semana']].map(([id,label])=>`<label><input type="checkbox" data-scam-toggle="${id}" ${i.disabled.includes(id)?'':'checked'}><span>${label}</span></label>`).join('')}</div>`;
 if(s.kind==='tasks')special=`<div class="scam-task-board"><span>Tarefas demonstradas <b>${i.step} / ${s.checks.length}</b></span><div class="scam-meter"><i style="width:${i.step/s.checks.length*100}%"></i></div><strong>Saldo na plataforma: C$ ${i.step?30:0}</strong><small>${i.step===2?'Saque bloqueado: depósito obrigatório':'Este painel não é o extrato do banco.'}</small></div>`;
 if(s.kind==='investment')special='<div class="scam-chart" aria-label="Gráfico promocional sem comprovação de rentabilidade"><i></i><i></i><i></i><i></i><i></i><span>Lucro prometido não é lucro recebido</span></div>';
 if(s.kind==='prize')special=`<div class="scam-prize">${officeIcon('prize')}<strong>${i.step?'Sorteio não localizado':'Cupom recebido'}</strong><span>${i.step?'A imagem de um prêmio não comprova a premiação.':'Abra os detalhes antes de pagar qualquer taxa.'}</span></div>`;
 if(s.kind==='ticket')special='<div class="scam-ticket"><span>SHOW DA FIRMA</span><b>QR EM IMAGEM</b><small>Um desenho não confirma titularidade.</small><svg viewBox="0 0 80 30" aria-hidden="true"><path d="M2 2h16v16H2zM24 2h16v16H24zM46 2h16v16H46zM8 24h64" fill="none" stroke="currentColor" stroke-width="4"/></svg></div>';
 if(s.kind==='camera')special='<div class="scam-selfie"><span>'+officeIcon('club')+'</span><p>Imagem pronta de personagem<br><b>Nenhuma câmera ou documento real é pedido.</b></p></div>';
 if(s.kind==='sessions')special=`<div class="scam-sessions"><span>${officeIcon('support')} Este computador <b>Sua sessão</b></span><span>${officeIcon('link')} Aparelho desconhecido <b>${i.step===2?'Selecionado para revogar':'Solicitando acesso'}</b></span></div>`;
 if(s.kind==='voice')special='<div class="scam-audio-note">'+officeIcon('calls')+'<div><b>Áudio recebido · identidade não confirmada</b><p>“Não liga, só faz o Pix.”</p></div></div>';
 return special || `<article class="scam-transaction"><small>EXTRATO · BANCO QUASE DIGITAL</small><h3>Pix recebido · C$ ${s.loss||250}</h3><p>${escape(s.evidence[0])}</p><dl><dt>Transação original</dt><dd>Conta de origem A · verificada no extrato</dd><dt>Pedido na conversa</dt><dd>Outra conta B · destino diferente</dd></dl><p>Use a função Devolver da própria transação. Não faça um novo Pix para a chave recebida no chat.</p></article>`;
}
export function scamInteractionView(active,escape){
 const s=expandedById[active?.caseId],i=active?.interaction;if(!s||!i)return '';
 const ready=i.step>=s.checks.length&&(s.kind!=='terms'||i.disabled.length===3)&&(s.kind!=='inventory'||i.disabled.includes('items'))&&(s.kind!=='donation'||i.selected==='official')&&(s.kind!=='mei'||i.selected==='guide');
 let body;
 if(i.view==='contain')body=`<div class="scam-containment ${s.kind==='updates'?'has-alerts':''}">${s.kind==='updates'?'<div class="scam-fake-alerts" aria-hidden="true"><span>AVISO DO SITE · limpar agora?</span><span>PERMISSÃO DO SITE · enviar mais avisos</span><span>OUTRO AVISO · compra de limpeza</span></div>':s.kind==='inventory'?'<div class="scam-inventory-trade" aria-hidden="true"><span>SKIN</span><span>MOEDAS</span><span>ITENS</span><b>Troca em andamento</b></div>':'<div class="scam-session-alert" aria-hidden="true">APARELHO DESCONHECIDO · sessão autorizada</div>'}<span class="scam-hazard-icon">${officeIcon(s.kind==='updates'?'support':'calls')}</span><h2 id="scam-interaction-title" tabindex="-1">${s.kind==='updates'?'O site encheu a tela de avisos falsos.':s.kind==='inventory'?'Uma troca dos seus itens foi autorizada.':'Uma sessão desconhecida entrou.'}</h2><p>Isso está acontecendo apenas no computador do jogo. Ainda dá para interromper.</p><div class="scam-containment-bar" style="--scam-until:${Math.max(0,i.deadline-Date.now())}ms"><i></i></div><button class="scam-primary" data-scam-command="rescue">${s.kind==='updates'?'Fechar a página e revogar notificações':s.kind==='inventory'?'Cancelar a troca e revogar a autorização':'Revogar a sessão desconhecida'}</button></div>`;
 else if(i.view==='confirm')body=`<h2 id="scam-interaction-title" tabindex="-1">Você vai autorizar isto:</h2><div class="scam-confirm"><strong>${escape(s.unsafeLabel)}</strong><p>${escape(s.evidence.at(-1))}</p><small>Somente dados e créditos fictícios. Nenhuma permissão real será pedida.</small></div><button class="scam-primary" data-scam-command="back">Voltar e conferir</button><button class="scam-risk" data-scam-command="confirm-risk">Autorizar na simulação</button>`;
 else body=`<small class="scam-eyebrow">AGORA É COM VOCÊ</small><h2 id="scam-interaction-title" tabindex="-1">${escape(s.app)}</h2><p class="scam-instruction">${s.kind==='terms'?'Revise as cláusulas e desmarque as opções desnecessárias.':'Use os controles do app para conferir antes de autorizar.'}</p>${board(s,i,escape)}${i.step<s.checks.length&&s.kind!=='middleman'?`<button class="scam-inspect" data-scam-command="inspect">${officeIcon('search')}<span>${escape(s.checks[i.step])}</span></button>`:''}<div class="scam-decisions"><button class="scam-primary" data-scam-command="safe" ${ready?'':'disabled'}>${escape(s.safeLabel)}</button><button class="scam-risk" data-scam-command="risk">${escape(s.unsafeLabel)}</button></div>${!ready?'<small class="scam-review-note">Confira os itens acima para liberar a decisão com os dados em mãos.</small>':''}`;
 return `<div class="defense-reaction-shade" aria-hidden="true"></div><section class="scam-interaction" role="dialog" aria-modal="true" aria-labelledby="scam-interaction-title" data-scam-case="${s.id}"><header><span class="scam-brand">${officeIcon('brand')} <b>QUASE HONESTOS</b></span><button data-scam-command="cancel" aria-label="Voltar às opções" ${i.view==='contain'?'disabled':''}><svg class="scam-close-symbol" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></header><div class="scam-interaction-scroll">${body}</div><footer>Ambiente de treino · nenhuma operação real</footer></section>`;
}
