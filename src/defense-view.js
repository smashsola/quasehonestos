import {tutorialGrantLine} from './tutorial.js';
import {mailDayRecap} from './mail-view.js';
import {childGlossary} from './audience.js';
import {defenseCaseFor} from './defense-round.js';
import {shuffledChoices} from './choice-order.js';
import {categoryForCase} from './case-categories.js';
import {caseInvitations,campaignOutcomeCopy} from './case-copy.js';
import {campaignDay,campaignAdvanceLabel} from './campaign-days.js';
import {expandedScams,expandedAction,expandedDemo} from './expanded-scams.js';
import {scamInteractionView} from './scam-interaction.js';
import {revengeView} from './revenge-view.js';
import {canRevenge} from './revenge.js';
import {officeIcon} from './office-icons.js';
import {defensePeople,scammerPeople,defenseCases,defenseMechanics,defenseFailures,defenseActionScenes,defenseActionSounds} from './defense-round.js';
import {defenseBossPanel} from './defense-boss.js';

const demoIconKey=kind=>({expanded:'shield',contacts:'calls',bank:'wallet',messages:'calls',security:'support',shop:'shop',files:'files',portal:'help',wallet:'wallet',visitor:'club',terminal:'link'}[kind]||'help');
function demoStepIcon(index){const art=index===1?'<circle cx="26" cy="26" r="14"/><path d="m37 37 15 15"/>':index===2?'<path d="m24 13 25 19-13 3-6 14-6-36Z"/>':'<path d="m14 32 12 12 25-27"/>';return `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;}

export const revengeTeasers=defensePeople.map(person=>caseInvitations[person.caseId]);
export function revengeTeaserIndex(active){
 if(Number.isInteger(active.revengeTeaserIndex)&&active.revengeTeaserIndex>=0&&active.revengeTeaserIndex<revengeTeasers.length)return active.revengeTeaserIndex;
 // A campaign position spreads the ten invitations out without rerolling on render.
 const index=defensePeople.findIndex(person=>person.caseId===active.caseId);
 return Math.max(0,index)%revengeTeasers.length;
}

const responseIcons={
 'Resposta direta':'💬',
 'Pedido de código':'🔐',
 'Decisão pela imagem':'🧾',
 'Pagamento direto':'💸',
 'Resposta por mensagem':'✉️',
 'Abertura do arquivo':'📎',
 'Entrega de cartão e senha':'💳',
 'Pagamento fora da plataforma':'🛍️',
 'Pagamento por link recebido':'🔗',
 'Cartão não conferido':'👀'
};

const demoApps=[
 {kind:'contacts',ids:['verify-person','pause-family','ask-adult','call-bank','give-code','hangup-official'],title:'Telefone e contatos',icon:'♙',nav:['Contatos','Favoritos','Chamadas'],label:'Chamada simulada'},
 {kind:'bank',ids:['send-pix','transfer-safe','check-statement','wait-settle','check-beneficiary','pay-qr','open-known-app','pay-direct','pay-fee','refund-other','pay-link'],title:'Banco Quase Digital',icon:'▣',nav:['Início','Pix','Cartões'],label:'Conta de demonstração · C$ 0'},
 {kind:'messages',ids:['ask-secret','reply-cpf','send-cpf'],title:'Mensagens',icon:'▰',nav:['Conversas','Arquivadas','Nova mensagem'],label:'Conversa não verificada'},
 {kind:'security',ids:['install-remote','block-app'],title:'Central de segurança',icon:'⬡',nav:['Proteção','Dispositivos','Cartões'],label:'Aparelho de demonstração'},
 {kind:'shop',ids:['deliver-proof','track-official','ask-store','check-platform','search-official','send-document'],title:'Loja e entregas',icon:'▱',nav:['Pedidos','Rastreio','Ajuda'],label:'Pedido em análise'},
 {kind:'files',ids:['dont-open-report','open-attachment','enable-macros','ask-it','send-doc'],title:'Arquivos da firma',icon:'▤',nav:['Recentes','Downloads','Compartilhados'],label:'Arquivo recebido'},
 {kind:'portal',ids:['official-gov'],title:'Portal de serviços',icon:'⌂',nav:['Início','Consultar','Atendimento'],label:'Consulta de demonstração'},
 {kind:'wallet',ids:['use-wallet'],title:'Carteira digital',icon:'◈',nav:['Cartões','Aproximação','Histórico'],label:'Pagamento fictício'},
 {kind:'visitor',ids:['ask-id','hand-card'],title:'Visita à porta',icon:'▣',nav:['Visita','Identificação','Pedido'],label:'Identidade não confirmada'},
 {kind:'terminal',ids:['watch-card','leave-card','repeat-pin'],title:'Pagamento na maquininha',icon:'▣',nav:['Valor','Teclado','Cartão'],label:'Terminal fictício'}
];
function defenseDemoApp(id){const extra=expandedAction(id);if(extra)return {kind:'expanded',title:extra.app,nav:['Atividade','Conferência','Resultado'],label:extra.title};return demoApps.find(app=>app.ids.includes(id))||{kind:'files',title:'Computador da firma',icon:'▦',nav:['Início','Atividades','Ajuda'],label:'Simulação de atendimento'};}

const scammerTyping={
 'ask-secret':['Me manda o código que chegou por SMS.','Pode enviar o código de confirmação?','Preciso do código para continuar.'],
 'give-code':['804 271','Código de confirmação: 390 614','Seu código fictício é 728 053'],
 'install-remote':['Acesso remoto autorizado.','Instalador de suporte aberto.','Permissão de acesso concedida.'],
 'repeat-pin':['Senha digitada novamente: ••••','PIN repetido no teclado.','Confirmei a senha mais uma vez.'],
 'reply-cpf':['CPF: 123.456.789-00 · Endereço: Rua das Flores, 123','Meus dados: CPF 987.654.321-00, endereço fictício.','CPF 321.654.987-00 · Rua de Exemplo, 45'],
 'send-cpf':['CPF: 123.456.789-00 · Nascimento: 10/10/1990','Cadastro: CPF 987.654.321-00 · 01/01/1985','Meus dados: 321.654.987-00 · 22/08/1992'],
 'send-doc':['[foto fictícia do documento anexada]','[RG de exemplo enviado como anexo]','[documento pessoal fictício · imagem anexada]'],
 'send-document':['[foto do CPF fictício anexada]','[documento para reserva · arquivo anexado]','CPF 123.456.789-00 · [foto fictícia anexada]'],
 'pay-link':['[dados fictícios do cartão enviados no link]','Cartão de demonstração: •••• 0042 · formulário enviado','[pagamento fictício confirmado no link]'],
 'enable-macros':['Ativei o conteúdo solicitado.','Permiti que o arquivo executasse o conteúdo.','[conteúdo do documento ativado]'],
 'open-attachment':['[anexo aberto: nota-fiscal-urgente.pdf]','Abri o arquivo que você enviou.','[arquivo fictício executado na simulação]'],
 'send-pix':['[Pix fictício enviado para chave recebida]','Transferência de demonstração iniciada: C$ 480.','[Pix de teste preparado para o destinatário]'],
 'pay-qr':['[QR Code fictício pago · C$ 86]','Pagamento de demonstração enviado pelo QR.','[pagamento-teste · QR recebido]'],
 'pay-direct':['[Pix fictício enviado para a chave do vendedor]','Transferência de teste iniciada: C$ 950.','[pagamento fictício realizado fora do app]'],
 'pay-fee':['[suposta taxa de regularização paga: C$ 81]','Pagamento de teste enviado pelo link.','[taxa de demonstração · transação iniciada]']
};
function scammerTypingPanel(id,escape){
 const choices=scammerTyping[id];if(!choices)return '';
 const phrase=choices[0],isTyping=['ask-secret','give-code','repeat-pin','reply-cpf','send-cpf','send-doc','send-document','pay-link'].includes(id),isMessage=['ask-secret','give-code','reply-cpf','send-cpf','send-doc','send-document','pay-link'].includes(id),isAttachment=['send-doc','send-document'].includes(id);
 const activityLabel=isTyping?'Você está digitando':id==='install-remote'?'Você está mexendo no computador':id==='open-attachment'?'Abrindo o anexo':id==='enable-macros'?'Ativando o conteúdo do arquivo':'Preparando a ação';
 const letters=[...phrase].map((char,index)=>`<i style="--letter:${index}" aria-hidden="true">${char===' '?' ':escape(char)}</i>`).join('');
 const typingTime=`${Math.max(2.2,phrase.length*.045).toFixed(2)}s`,attachmentName=id==='send-document'?'foto-cpf-ficticia.jpg':id==='send-doc'?'documento-ficticio.jpg':null;
 return `<div class="demo-scammer-control${isMessage?' is-message':''}${isAttachment?' has-attachment':''}${isTyping?' is-typing':''}" style="--typing-time:${typingTime}"><span class="demo-scammer-status"><i></i><span class="demo-status-typing">${activityLabel}${isTyping?' · Eu':''}</span><span class="demo-status-legacy">${activityLabel}</span>${isMessage?`<span class="demo-status-sending">Enviando…</span><span class="demo-status-sent">${isAttachment?'Anexo enviado':'Mensagem enviada'} ✓</span>`:''}</span><div class="demo-scammer-entry"><small>${isMessage?'EU · MENSAGEM FICTÍCIA':isTyping?'EU · AÇÃO SIMULADA':'AÇÃO SIMULADA'}</small><span class="demo-scammer-text" ${isTyping?'aria-label="Eu: conteúdo fictício sendo digitado"':''}>${letters}${isTyping?'<b aria-hidden="true"></b>':''}</span></div>${isMessage&&!isAttachment?`<div class="demo-sent-message"><small>EU</small><span>${escape(phrase)}</span><b>✓✓ Enviada</b></div>`:''}${isAttachment?`<div class="demo-attachment-send"><span class="demo-attachment-icon" aria-hidden="true">📎</span><span><b>${attachmentName}</b><small>Imagem fictícia · ${id==='send-document'?'86':'128'} KB</small></span><strong><i></i><span class="demo-attach-progress">Anexando…</span><span class="demo-attach-done">Anexado ✓</span></strong></div>`:''}</div>`;
}
export function defenseActionDuration(id){
 const phrase=scammerTyping[id]?.[0]||'',isAttachment=['send-doc','send-document'].includes(id),isMessage=['ask-secret','give-code','reply-cpf','send-cpf','send-doc','send-document','pay-link'].includes(id);
 const finishTime=Math.max(2.2,phrase.length*.045)+(isAttachment?2.4:isMessage?1.2:.5);
 return Math.max(7,Math.ceil(finishTime*10)/10);
}

// A concrete object changes state in each demonstration, rather than a generic progress screen.
export const demoEvidence={
 'verify-person':['Identidade do contato','Número novo, identidade incerta','Chamada pelo número que já estava salvo'],
 'send-pix':['Transferência Pix · C$ 480','Destinatário recebido na mensagem','C$ 480 enviados à chave não confirmada'],
 'ask-secret':['Código de segurança','Nenhum código compartilhado','Você pediu um código; isso não comprova a identidade'],
 'pause-family':['Conferência da pessoa','Pedido urgente no número novo','Contato antigo chamado antes de qualquer pagamento'],
 'hangup-official':['Ligação suspeita','Contato se apresenta como banco','Chamada encerrada; próximo passo: canal oficial'],
 'give-code':['Código SMS · fictício','804 271 · somente para você','804 271 · compartilhado com a ligação'],
 'install-remote':['Permissões do instalador','Sem acesso ao aparelho','Instalador aberto solicitando controle remoto'],
 'transfer-safe':['Destino da transferência','Sua conta → conta indicada na ligação','Destino externo escolhido; conta não verificada'],
 'check-statement':['Crédito do pedido','Comprovante recebido por mensagem','Extrato consultado: Pix não localizado'],
 'deliver-proof':['Pedido de bolo · C$ 81','Pagamento ainda não confirmado','Pedido entregue sem crédito no extrato'],
 'refund-other':['Devolução do Pix','Pedido de devolver para outra chave','Chave externa escolhida, fora da transação original'],
 'wait-settle':['Liberação do pedido','Pedido aguardando pagamento','Entrega mantida em espera até o crédito aparecer'],
 'check-beneficiary':['Recebedor do boleto','QR recebido sem conferência','Nome do beneficiário aberto para comparação'],
 'pay-qr':['Cobrança · C$ 120','Recebedor do QR não conferido','Pagamento iniciado para o destinatário do QR'],
 'open-known-app':['Origem da cobrança','Boleto recebido na conversa','Cobranças consultadas dentro do app conhecido'],
 'send-doc':['Documento pessoal','Imagem fictícia guardada no aparelho','Imagem anexada para envio à conversa'],
 'track-official':['Encomenda','SMS alega que a entrega está retida','Pedido consultado no rastreio oficial'],
 'pay-link':['Formulário recebido por SMS','Cartão ainda não informado','Dados fictícios enviados à página recebida'],
 'reply-cpf':['Dados pessoais','CPF e endereço não compartilhados','Resposta com dados enviada ao contato'],
 'ask-store':['Histórico da compra','Taxa extra cobrada por mensagem','Pedido aberto diretamente no app da loja'],
 'dont-open-report':['Anexo inesperado','Arquivo fechado','Arquivo continua fechado; cobrança será conferida'],
 'open-attachment':['Anexo de nota fiscal','Arquivo recebido, não executado','Anexo executado; alerta de bloqueio iniciado'],
 'enable-macros':['Conteúdo do documento','Execução bloqueada','Permissão concedida; alerta de bloqueio iniciado'],
 'ask-it':['Chamado de suporte','Anexo inesperado, ainda fechado','Suporte acionado para verificar a origem'],
 'call-bank':['Confirmação do banco','Visita diz que precisa do cartão','Ligação feita pelo canal oficial do banco'],
 'hand-card':['Cartão e senha','Cartão em sua posse · senha protegida','Cartão e senha entregues à visita'],
 'block-app':['Cartão no aplicativo','Cartão disponível para uso','Solicitação de bloqueio registrada no app'],
 'ask-id':['Identificação da visita','Pessoa desconhecida se apresenta','Crachá solicitado; vínculo ainda exige confirmação'],
 'check-platform':['Perfil do vendedor','Oferta recebida fora da plataforma','Perfil aberto no app para conferir histórico'],
 'pay-direct':['Compra por Pix','Loja pede pagamento por fora','Pix preparado para uma chave externa'],
 'search-official':['Busca da oferta','Promoção com prazo urgente','Produto pesquisado dentro da loja conhecida'],
 'send-document':['Documentos para reserva','Arquivos ainda no aparelho','Documentos anexados ao pedido da suposta loja'],
 'official-gov':['Consulta do CPF','Mensagem ameaça bloqueio imediato','Serviço consultado pelo endereço oficial'],
 'pay-fee':['Suposta regularização · C$ 81','Taxa exigida no link recebido','Pagamento da taxa preparado na página recebida'],
 'ask-adult':['Segunda opinião','Aviso urgente ainda não confirmado','Pessoa de confiança chamada para conferir o aviso'],
 'send-cpf':['Cadastro solicitado','CPF e nascimento guardados','Dados enviados ao contato não confirmado'],
 'watch-card':['Compra presencial · C$ 42','Valor e cartão aguardando conferência','Valor conferido; cartão permanece com você'],
 'leave-card':['Cartão devolvido','Nome do titular ainda não conferido','Cartão guardado sem verificar de quem é'],
 'use-wallet':['Aproximação · C$ 42','Celular afastado do terminal','Valor conferido antes de aproximar'],
 'repeat-pin':['Senha na maquininha','Teclado sem proteção','Senha redigitada à vista de outras pessoas']
};
function demoActivity(app,scene,demo,escape){

 const button=`<span class="demo-action-control"><span class="defense-action-appbutton">${escape(demo.button)}</span><svg class="defense-action-cursor" aria-hidden="true" viewBox="0 0 24 30" focusable="false"><path d="M3 2 3 25 9 19.2 13.5 28 17 26.2 12.4 17.7 21.5 17.7Z" fill="#fff" stroke="#173f32" stroke-width="1.7" stroke-linejoin="round"/></svg></span>`;
 const extra=expandedAction(demo.id);if(extra)return `<div class="expanded-demo-result"><span>${officeIcon(extra.icon)}</span><small>${escape(extra.app)}</small><strong>${escape(extra.title)}</strong><div>${extra.evidence.map(text=>`<p>${escape(text)}</p>`).join('')}</div><b>${escape(scene.target)}</b>${button}<div class="defense-action-appresult"><span class="defense-action-working"><i></i>Aplicando a escolha…</span></div></div>`;
 const progress=scene.motion==='send'?'Enviando…':scene.motion==='close'?'Encerrando…':scene.motion==='call'?'Chamando…':'Conferindo a ação…';
 const evidence=demoEvidence[demo.id];
 const object=evidence?`<div class="demo-evidence"><small>${escape(evidence[0])}</small><div class="demo-evidence-before"><span aria-hidden="true">○</span><b>${escape(evidence[1])}</b></div><div class="demo-evidence-after"><span aria-hidden="true">↳</span><b>${escape(evidence[2])}</b></div></div>`:'';
 const result=`${object}<div class="defense-action-appresult"><span class="defense-action-working"><i></i>${escape(progress)}</span></div>`;
 const context=escape(demo.context);
 if(app.kind==='contacts'){
  const incoming=['give-code','hangup-official'].includes(demo.id),bank=demo.id==='call-bank';
  return `<div class="demo-contacts"><div class="demo-contact-row"><span class="demo-contact-face">☎</span><span><b>${incoming?'Ligação recebida':bank?'Banco · contato oficial':'Contato já salvo'}</b><small>${context}</small></span><span class="demo-presence">${incoming?'não confirmado':'canal conhecido'}</span></div><div class="demo-call-card"><span class="demo-call-rings" aria-hidden="true"><i></i><i></i><b>${scene.icon}</b></span><strong>${incoming?'Chamada em andamento':bank?'Central do banco':demo.id==='ask-adult'?'Pessoa de confiança':'Pessoa da sua agenda'}</strong><small>${incoming?'Chamada suspeita em andamento':'Ligação pelo contato escolhido'}</small>${demo.id==='give-code'?'<div class="demo-code-display"><small>CÓDIGO FICTÍCIO INFORMADO NA LIGAÇÃO</small><b>804 271</b></div>':''}<div class="demo-call-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>${button}${result}</div></div>`;
 }
 if(app.kind==='visitor')return `<div class="demo-visitor"><div class="demo-visitor-id"><span aria-hidden="true">♙</span><div><small>CRACHÁ APRESENTADO</small><strong>Visita não confirmada</strong><p>Um crachá, sozinho, não confirma vínculo com o banco.</p></div></div>${demo.id==='hand-card'?'<div class="demo-handover"><b>CARTÃO</b><span>Senha: ••••</span><small>Itens fictícios entregues à visita</small></div>':'<p class="demo-visitor-check">Compare a identificação e confirme com o banco por outro canal.</p>'}${button}${result}</div>`;
 if(app.kind==='terminal')return `<div class="demo-terminal"><div class="demo-terminal-display"><small>VISOR DA MAQUININHA · EXEMPLO</small><strong>C$ 42,00</strong><span>${demo.id==='repeat-pin'?'Senha digitada sem proteger o teclado':demo.id==='leave-card'?'Cartão devolvido: nome não conferido':'Confira o valor e o nome no cartão'}</span></div><div class="demo-terminal-keypad" aria-hidden="true">${Array.from({length:9},(_,i)=>`<span>${i+1}</span>`).join('')}</div><div class="demo-terminal-card"><small>CARTÃO DE DEMONSTRAÇÃO</small><b>•••• 0042</b></div>${button}${result}</div>`;
 if(app.kind==='bank'&&demo.id==='pay-link')return `<div class="demo-bank demo-link-form"><div class="demo-bank-balance"><small>LINK RECEBIDO NA MENSAGEM</small><strong>Formulário de pagamento</strong><span>Dados inventados para demonstrar a escolha</span></div><dl><div><dt>Cartão de demonstração</dt><dd>•••• •••• •••• 0042</dd></div><div><dt>Validade</dt><dd>•• / ••</dd></div><div><dt>Código</dt><dd>•••</dd></div></dl>${button}${result}</div>`;
 if(app.kind==='bank'&&['check-statement','wait-settle','check-beneficiary','open-known-app'].includes(demo.id))return `<div class="demo-bank"><div class="demo-bank-balance"><small>APP ABERTO POR VOCÊ</small><strong>${demo.id==='check-beneficiary'?'Dados da cobrança':'Extrato e cobranças'}</strong><span>${context}</span></div><div class="demo-bank-ledger"><span>Saldo de demonstração <b>C$ 0,00</b></span><span>${demo.id==='check-beneficiary'?'Nome do recebedor':'Pix recebido'}<b>${demo.id==='check-beneficiary'?'Conferir com a cobrança':'Nenhum novo crédito'}</b></span></div>${button}${result}</div>`;
 if(app.kind==='files'&&demo.id==='ask-it')return `<div class="demo-support-ticket"><small>SUPORTE DA FIRMA · NOVO CHAMADO</small><strong>Arquivo inesperado</strong><p>O anexo continua fechado enquanto você pede uma verificação.</p><div class="demo-ticket-status">Anexo: não executado</div>${button}${result}</div>`;
 if(app.kind==='bank')return `<div class="demo-bank"><div class="demo-bank-balance"><small>OPERAÇÃO DE DEMONSTRAÇÃO</small><strong>${demo.id==='send-pix'?'C$ 480,00':demo.id==='pay-qr'?'C$ 120,00':demo.id==='pay-fee'?'C$ 81,00':demo.id==='pay-direct'?'Pix para a loja':demo.id==='refund-other'?'Devolução solicitada':'Transferência entre contas'}</strong><span>Revisão do destino · créditos fictícios</span></div><div class="demo-bank-route"><span><small>ORIGEM</small><b>Minha conta</b></span><i aria-hidden="true">→</i><span><small>DESTINO</small><b>${escape(scene.target)}</b></span></div><div class="demo-bank-task"><span class="demo-bank-lock" aria-hidden="true">▣</span><span><b>Dados da operação</b><small>${context}</small></span><span class="demo-bank-tag">REVISÃO</span></div><div class="demo-bank-footer">${button}<small>Confira nome e valor antes de confirmar</small></div>${result}</div>`;
 if(app.kind==='messages')return `<div class="demo-messages"><div class="demo-chat-meta"><span>●</span><b>Contato não salvo</b><small>Conversa simulada</small></div><div class="demo-message-in">${context}</div><div class="demo-message-compose"><span>Mensagem fictícia</span>${button}</div>${result}</div>`;
 if(app.kind==='security')return `<div class="demo-security"><div class="demo-device"><span class="demo-shield" aria-hidden="true">⬡</span><span><b>Este aparelho</b><small>${context}</small></span><span class="demo-device-state">VERIFICANDO</span></div><div class="demo-security-checks">${demo.id==='install-remote'?'<span><i>!</i> Controle de tela solicitado</span><span><i>!</i> Acesso ao aparelho solicitado</span>':'<span><i>▣</i> Cartão final 0042</span><span><i>…</i> Solicitação no app oficial</span>'}</div><div class="demo-security-footer">${button}<span class="demo-security-orbit" aria-hidden="true">${scene.icon}</span></div>${result}</div>`;
 if(app.kind==='shop'&&['check-platform','search-official','send-document'].includes(demo.id))return `<div class="demo-storefront"><div class="demo-store-search">⌕ <span>${demo.id==='check-platform'?'Perfil do vendedor':demo.id==='search-official'?'Pesquisar produto na loja':'Reserva de produto'}</span></div><div class="demo-store-listing"><span class="demo-product-icon" aria-hidden="true">${officeIcon('shop')}</span><div><small>OFERTA DE DEMONSTRAÇÃO</small><strong>Produto anunciado na mensagem</strong><p>${demo.id==='check-platform'?'Histórico e avaliações precisam ser conferidos':demo.id==='search-official'?'Confira se a oferta existe dentro da plataforma':'Vendedor pede documentos para reservar a oferta'}</p></div></div>${button}${result}</div>`;
 if(app.kind==='shop')return `<div class="demo-shop"><div class="demo-order-head"><span class="demo-box-icon" aria-hidden="true">${officeIcon('shop')}</span><span><small>ACOMPANHAMENTO</small><b>${context}</b></span><strong>TESTE</strong></div><div class="demo-delivery-track"><i></i><span class="is-done">Pedido</span><span class="is-current">Conferência</span><span>Entrega</span></div><div class="demo-shop-detail">${button}</div>${result}</div>`;
 if(app.kind==='files')return `<div class="demo-files"><aside><span>Recentes</span><span>Downloads</span><span>Compartilhados</span></aside><div class="demo-file-preview"><div class="demo-file-row"><b aria-hidden="true">${officeIcon('files')}</b><span><strong>${context}</strong><small>Arquivo de exemplo · somente simulação</small></span><span class="demo-file-badge">PENDENTE</span></div><div class="demo-file-scan"><i aria-hidden="true"></i><span>Prévia do arquivo indisponível</span></div>${button}${result}</div></div>`;
 if(app.kind==='portal')return `<div class="demo-portal"><div class="demo-portal-brand"><b>gov.br</b><span>Serviços digitais</span><small>AMBIENTE FICTÍCIO</small></div><div class="demo-portal-form"><small>CONSULTA DE SERVIÇO</small><strong>${context}</strong><div class="demo-protocol"><span>Protocolo</span><b>•••-•••</b></div>${button}${result}</div></div>`;
 return `<div class="demo-wallet"><div class="demo-nfc" aria-hidden="true"><i></i><i></i><i></i><span>◈</span></div><div class="demo-wallet-card"><small>CARTEIRA DE TREINO</small><b>• • • •　0042</b><span>Saldo fictício · C$ 0</span></div><div class="demo-wallet-pay"><b>${context}</b><small>Aproxime apenas após conferir o valor</small>${button}</div>${result}</div>`;
}

export const defenseActionDemos={
 'verify-person':{context:'Contato já salvo',button:'Ligar agora',result:'Ligação iniciada para o número conhecido.'},
 'send-pix':{context:'Pix · chave recebida na mensagem',button:'Enviar Pix de teste',result:'Pix fictício enviado para a chave recebida.'},
 'ask-secret':{context:'Conversa · código de segurança',button:'Pedir código SMS',result:'Campo do código aberto no chat simulado.'},
 'pause-family':{context:'Pessoa da agenda',button:'Fazer ligação',result:'Chamada iniciada pelo contato conhecido.'},
 'hangup-official':{context:'Ligação suspeita em andamento',button:'Desligar',result:'Ligação encerrada antes de informar dados.'},
 'give-code':{context:'Código recebido por SMS',button:'Informar código',result:'Código digitado na chamada simulada.'},
 'install-remote':{context:'Instalador de suporte remoto',button:'Abrir instalador',result:'Instalador aberto e pedindo acesso ao aparelho.'},
 'transfer-safe':{context:'Nova transferência · destino informado',button:'Escolher destinatário',result:'Conta indicada na ligação selecionada como destino.'},
 'check-statement':{context:'Extrato da conta · saldo de teste C$ 0',button:'Abrir extrato',result:'Extrato aberto: nenhum Pix novo identificado.'},
 'deliver-proof':{context:'Pedido de bolo · pagamento pendente',button:'Marcar como entregue',result:'Pedido liberado sem confirmar o crédito.'},
 'refund-other':{context:'Devolução Pix · chave recebida no chat',button:'Preparar devolução',result:'Outra chave selecionada para receber o Pix.'},
 'wait-settle':{context:'Extrato da conta · pedido aguardando',button:'Conferir saldo',result:'Extrato conferido antes de liberar o pedido.'},
 'check-beneficiary':{context:'Boleto · dados de quem recebe',button:'Ver recebedor',result:'Nome do recebedor exibido para conferência.'},
 'pay-qr':{context:'Cobrança · QR Code recebido',button:'Pagar agora',result:'Pagamento iniciado sem conferir quem recebe.'},
 'open-known-app':{context:'App oficial do banco · cobranças',button:'Abrir app do banco',result:'A tela de cobranças está aberta para conferência.'},
 'send-doc':{context:'Documento pessoal · imagem para enviar',button:'Anexar documento',result:'Imagem de demonstração incluída na conversa.'},
 'track-official':{context:'Pedido · página de rastreio',button:'Consultar pedido',result:'O número do pedido apareceu no app conhecido.'},
 'pay-link':{context:'Link de pagamento · formulário de cartão',button:'Preencher cartão',result:'Dados fictícios do cartão enviados no link recebido.'},
 'reply-cpf':{context:'Conversa · resposta com dados pessoais',button:'Enviar resposta',result:'CPF e endereço foram enviados à conversa simulada.'},
 'ask-store':{context:'Loja conhecida · seus pedidos',button:'Abrir meus pedidos',result:'O histórico de compras apareceu no app da loja.'},
 'dont-open-report':{context:'Arquivo inesperado · fechado',button:'Fechar anexo',result:'Arquivo mantido fechado enquanto o suporte é chamado.'},
 'open-attachment':{context:'Arquivo inesperado · download',button:'Abrir arquivo',result:'A simulação executou o anexo.'},
 'enable-macros':{context:'Documento · conteúdo bloqueado',button:'Ativar conteúdo',result:'O arquivo recebeu permissão para executar conteúdo.'},
 'ask-it':{context:'Suporte da firma · novo chamado',button:'Pedir ajuda',result:'Chamado aberto sem executar o arquivo.'},
 'call-bank':{context:'Banco · canal oficial do cartão',button:'Ligar para o banco',result:'Chamada iniciada pelo canal oficial.'},
 'hand-card':{context:'Visita à porta · cartão e senha',button:'Entregar cartão',result:'Cartão e senha passados à visita na simulação.'},
 'block-app':{context:'Cartões · controles de segurança',button:'Bloquear cartão',result:'Cartão marcado para bloqueio no app fictício.'},
 'ask-id':{context:'Visita · identificação solicitada',button:'Conferir crachá',result:'Identificação pedida antes de entregar o cartão.'},
 'check-platform':{context:'Compra protegida · perfil do vendedor',button:'Ver vendedor',result:'O perfil do vendedor foi carregado para conferência.'},
 'pay-direct':{context:'Pix · pagamento fora da plataforma',button:'Preparar Pix',result:'O Pix fictício ficou preparado para uma chave externa.'},
 'search-official':{context:'Loja conhecida · campo de busca',button:'Pesquisar oferta',result:'A busca exibiu a oferta dentro do app conhecido.'},
 'send-document':{context:'Reserva de produto · dados solicitados',button:'Anexar documentos',result:'Os arquivos fictícios foram incluídos no pedido.'},
 'official-gov':{context:'Serviço público · consulta de protocolo',button:'Consultar protocolo',result:'A página de consulta abriu com um protocolo fictício.'},
 'pay-fee':{context:'Suposta taxa para evitar bloqueio do CPF · link recebido',button:'Pagar taxa',result:'A taxa fictícia ficou preparada para pagamento.'},
 'ask-adult':{context:'Contatos · pessoa de confiança',button:'Iniciar chamada',result:'Ligação iniciada para pedir outra opinião.'},
 'send-cpf':{context:'Cadastro · dados pessoais',button:'Enviar dados',result:'CPF e nascimento foram enviados à conversa simulada.'},
 'watch-card':{context:'Pagamento presencial · valor no visor',button:'Conferir valor',result:'Valor conferido; cartão continua com você.'},
 'leave-card':{context:'Cartão devolvido · nome não conferido',button:'Guardar cartão',result:'Cartão aceito sem conferir o nome.'},
 'use-wallet':{context:'Carteira digital · pagamento por aproximação',button:'Conferir e aproximar',result:'Valor consultado antes de aproximar o celular.'},
 'repeat-pin':{context:'Teclado · senha visível',button:'Digitar senha',result:'O PIN fictício foi enviado sem cobrir as teclas.'}
};

for(const s of expandedScams)for(const suffix of ['verify','accept','trust','joke'])defenseActionDemos[s.id+'--'+suffix]=expandedDemo(s,suffix);

function responseTag(choice,escape){
 if(choice.witty)return '<small class="defense-response-tag is-witty"><span aria-hidden="true">😄</span> Resposta engraçadinha</small>';
 if(!choice.classification)return '';
 const icon=responseIcons[choice.classification]||'🧭';
 return `<small class="defense-response-tag is-classified"><span aria-hidden="true">${icon}</span> ${escape(choice.classification)}</small>`;
}

export function defenseView(state,{escape,portraitSource}){
 const a=state.active,c=defensePeople.find(p=>p.id===a?.caller),scenario=defenseCaseFor(a),scammer=scammerPeople.find(p=>p.id===a?.scammerId)||scammerPeople.find(p=>p.id===c?.scammerId)||scammerPeople[0];
 if(!a||!c||!scenario)return '';
 const remaining=a.ransomwareDeadline?Math.max(0,Math.ceil((a.ransomwareDeadline-Date.now())/1000)):0;
 const finished=!!a.outcome,chatVisible=a.chatVisible??2,chatStage=a.chatStage||'ready';
 const scammerExpression=a.scammerExpression||scammer.emotion||'confused';
 const senderTalking=chatStage==='speaking',talking=senderTalking;
 const scammerPortrait=`/src/portraits/${scammer.id}-${scammerExpression}.svg`;
 const speakerPortrait=portraitSource(scammer.id,scammerExpression);
 const mechanic=defenseMechanics[a.caseId];
 const pendingChoice=scenario.choices.find(c=>c.id===a.actionPending),adaptive=pendingChoice&&['help','partial'].includes(pendingChoice.adaptiveRole)?pendingChoice.adaptiveRole:null;
 const actionScene=a.actionPending?(adaptive?{icon:'◉',title:adaptive==='help'?'Pedindo ajuda para conferir':'Pausando a conversa',detail:adaptive==='help'?'Um adulto de confiança ajuda a conferir o pedido pelo canal conhecido.':'Nada foi enviado. Ainda falta conferir o pedido.',motion:'check',target:'Conversa'}:defenseActionScenes[a.actionPending]):null;
 const actionApp=actionScene?(adaptive?{kind:'contacts',title:adaptive==='help'?'Ajuda de confiança':'Conversa pausada',nav:['Mensagem','Conferir','Resultado']}:defenseDemoApp(a.actionPending)):null;
 const actionDemo=actionScene?(adaptive?{id:a.actionPending,context:actionApp.title,button:actionScene.title,result:actionScene.detail}:{...defenseActionDemos[a.actionPending],id:a.actionPending}):null;
 const actionAppContent=actionScene?(adaptive?`<div class="audience-demo"><span>${officeIcon(adaptive==='help'?'club':'calls')}</span><h3>${escape(actionScene.title)}</h3><p>${escape(actionScene.detail)}</p><div class="audience-demo-chat">${adaptive==='help'?'Vamos conferir juntos antes de responder.':'Conversa pausada. Nenhum dinheiro ou dado foi enviado.'}</div></div>`:demoActivity(actionApp,actionScene,actionDemo,escape)):'';
 const scammerActivity=actionScene&&!adaptive?scammerTypingPanel(a.actionPending,escape):'';
 const actionVerb={call:'LIGANDO',hangup:'DESLIGANDO',message:'ENVIANDO MENSAGEM',keypad:'DIGITANDO CÓDIGO',payment:'FAZENDO PAGAMENTO',connect:'CONECTANDO',file:'ABRINDO ARQUIVO',delivery:'ATUALIZANDO PEDIDO',click:'CONSULTANDO',terminal:'NO CAIXA'};
 const actionSteps=actionScene?[
  {icon:'▣',label:'ABRINDO APP',detail:actionApp.title},
  {icon:'⌕',label:'LOCALIZANDO',detail:actionDemo.context},
  {icon:actionScene.icon,label:adaptive?(adaptive==='help'?'PEDINDO AJUDA':'PAUSANDO'):actionVerb[defenseActionSounds[a.actionPending]]||'FAZENDO A AÇÃO',detail:actionDemo.button},
  {icon:'✓',label:'O QUE ACONTECEU',detail:actionDemo.result}
 ]:[];
 const actionDuration=actionScene?defenseActionDuration(a.actionPending):0;
 const actionStepDuration=Math.min(1.05,actionDuration/4);
 const actionStepDelay=index=>`${actionDuration*[0,.1,.18,.76][index]}s`;
 const displayChoices=shuffledChoices(a,scenario.choices);
 const reaction=a.reactionTier==='almost'?{title:'QUASE LÁ!',icon:'🟡',note:'Boa pausa! Falta só confirmar pelo canal oficial.'}:a.reactionTier==='success'?{title:'PARABÉNS!',icon:'🎉',note:'Mandou bem: você escolheu um caminho seguro.'}:{title:'OPS, VACILOU!',icon:'😬',note:'Dá para corrigir: veja o que fazer agora.'};
 const typing=chatStage==='typing';
 const responseReady=chatStage==='ready'||senderTalking;
 const typingLabel='O contato não salvo está digitando';
 const chatMessages=`${chatVisible>0?`<article class="defense-chat-bubble defense-sender${senderTalking?' is-speaking':''}"><div class="defense-chat-sender"><div class="defense-sender-avatar${senderTalking?' is-speaking':''}" data-speaking="${senderTalking}" data-expression="${scammerExpression}" data-caller="${scammer.id}" aria-hidden="true"><img draggable="false" src="${speakerPortrait}" alt="" width="48" height="48"></div><small>Contato não salvo</small></div><p>${escape(scenario.message)}</p></article>`:''}${typing?`<div class="defense-typing" role="status" aria-label="${escape(typingLabel)}"><span></span><span></span><span></span></div>`:''}`;
 const quickMechanic=!finished&&responseReady&&chatVisible>0&&mechanic?`<section class="defense-quick-mechanic" aria-label="Dica rápida desta situação">${a.mechanicUsed?`<span class="defense-mechanic-icon" aria-hidden="true">${mechanic.icon}</span><div><small>DICA</small><p role="status" tabindex="-1" data-mechanic-status>${escape(a.mechanicFeedback||mechanic.result)}</p></div>`:`<button type="button" data-defense-mechanic><span class="defense-mechanic-icon" aria-hidden="true">${mechanic.icon}</span><span><small>DICA · OPCIONAL</small><strong>${escape(mechanic.title)}</strong><em>Toque para ver uma pista</em></span><span class="defense-mechanic-arrow" aria-hidden="true">›</span></button>`}</section>`:'';
 const total=defensePeople.length,last=state.cursor===total-1,day=campaignDay(state,total);
 const tutorialFinish=state.mode==='defense'&&state.cursor===0&&state.tutorial==='defense'?'<p class="defense-tutorial-finish"><strong class="tutorial-finish-title">Tutorial concluído!</strong><span>Você está no rumo! Boa sorte no restante do expediente. Quando quiser, clique em <strong>Próxima situação</strong>.</span></p>'+ (state.tutorialGrant?`<aside class="tutorial-grant"><img src="/src/portraits/supervisor-lia.svg" alt="Lia, supervisora" width="64" height="64"><div><strong>Lia · bônus de boas-vindas</strong><p>${escape(tutorialGrantLine)}</p><b data-money-delta="100">+ C$ 100</b></div></aside>`:''):'';
 const category=categoryForCase(a.caseId);
 const clues=`<details class="defense-clues"><summary><span class="defense-clues-icon" aria-hidden="true">✦</span><span class="defense-clues-copy"><strong>O que observar nesta mensagem</strong><small>Três pistas para conferir antes de agir</small></span><span class="defense-clues-arrow" aria-hidden="true"></span></summary><ul>${scenario.cues.map(cue=>`<li>${escape(cue)}</li>`).join('')}</ul></details>`;
 const actions=`<section class="defense-actions"><h2>Como você reage?</h2><p>Escolha uma ação concreta. Se ficar em dúvida, pause e confirme por outro canal.</p><div class="defense-action-grid">${displayChoices.map((choice,index)=>`<button class="defense-action-option" data-defense-choice="${choice.id}" style="--option-order:${index}" ${a.ransomwareDeadline||a.actionPending||a.interaction?'disabled':''}><span class="defense-action-badge">AÇÃO</span><div class="defense-choice-copy"><strong>${escape(choice.label.replace(/^AÇÃO — /,''))}</strong>${responseTag(choice,escape)}</div></button>`).join('')}</div><button type="button" class="defense-exit" data-defense-exit ${a.actionPending?'disabled':''}><span class="defense-exit-icon" aria-hidden="true">↩</span><span class="defense-exit-copy"><strong>Quer interromper por aqui?</strong><small>Feche a conversa e confirme por um canal oficial</small></span><span class="defense-exit-arrow" aria-hidden="true">›</span></button></section>`;
 const failure=a.reactionTier==='miss'?(a.audience==='child'?{...defenseFailures[a.caseId],title:'Faltou conferir o pedido',result:a.feedback}:defenseFailures[a.caseId]):null;
 const money=a.balanceSettlement?.requested?`<div class="defense-loss" role="status"><strong data-money-delta="${-a.balanceSettlement.loss}" aria-live="off">− C$ ${a.balanceSettlement.loss}</strong><span>${a.balanceSettlement.loss?'Descontado do seu saldo fictício':'Sem saldo disponível para descontar'} · saldo <b data-balance-value aria-live="off">C$ ${a.balanceSettlement.after}</b></span></div>`:'';
 const revengePrompt=canRevenge(a)?`<aside class="revenge-invitation" aria-label="Convite para a revanche"><small class="revenge-question">Deseja se vingar?</small><p>${escape(revengeTeasers[revengeTeaserIndex(a)])}</p><button type="button" class="revenge-button" data-revenge-day="${day.number}" data-revenge-start><span>${a.revenge?.credited?'Rever revanche':a.revenge?'Continuar revanche':'Vingança'}</span></button><small>${a.revenge?.credited?'Revanche concluída · + C$ '+a.revenge.award:'Desmonte o golpe e ganhe créditos fictícios.'}</small></aside>`:'';
 let feedback=finished&&!a.gameOver?`<div class="defense-reaction-shade" aria-hidden="true"></div>${failure?`<section class="defense-feedback defense-reaction defense-consequence is-miss consequence-${a.caseId}" role="dialog" aria-modal="true" aria-labelledby="defense-reaction-title"><span class="defense-consequence-icon" aria-hidden="true">${failure.icon}</span><small class="defense-reaction-kicker">NA SIMULAÇÃO</small><h2 id="defense-reaction-title">${escape(failure.title)}</h2><p class="defense-reaction-feedback">${escape(failure.result)}</p>${a.humor?`<p class="audience-humor">Seu personagem: “${escape(a.humor)}”</p>`:''}<p class="defense-consequence-footnote">Isso aconteceu só no jogo. Na vida real, fale com o banco ou serviço pelo canal oficial.</p>${money}${tutorialFinish}${revengePrompt}<div class="defense-feedback-actions"><button class="defense-return-pc" data-show-desktop>Voltar ao PC</button><button class="primary" data-action="finish">${campaignAdvanceLabel(state,total)}</button></div></section>`:`<section class="defense-feedback defense-reaction is-${a.reactionTier||'miss'}" role="dialog" aria-modal="true" aria-labelledby="defense-reaction-title"><span class="defense-reaction-burst" aria-hidden="true">${reaction.icon}</span><small class="defense-reaction-kicker">RESULTADO DA ESCOLHA</small><h2 id="defense-reaction-title">${reaction.title}</h2><p class="defense-reaction-note">${reaction.note}</p><p class="defense-reaction-feedback">${escape(a.feedback||'')}</p>${a.humor?`<p class="audience-humor">Seu personagem: “${escape(a.humor)}”</p>`:''}${money}${tutorialFinish}${revengePrompt}<div class="defense-feedback-actions"><button class="defense-return-pc" data-show-desktop>Voltar ao PC</button><button class="primary" data-action="finish">${campaignAdvanceLabel(state,total)}</button></div></section>`}`:a.gameOver?`<section class="pc-crash-screen" role="alertdialog" aria-modal="true" aria-labelledby="pc-crash-title"><div class="pc-crash-panel"><span class="pc-crash-symbol" aria-hidden="true"><svg viewBox="0 0 64 64"><rect x="8" y="9" width="48" height="36" rx="4"/><path d="M24 55h16M32 45v10M17 18h30M21 27h7m7 0h8"/><path d="m35 21-6 9h7l-6 9"/></svg></span><small>SIMULAÇÃO ENCERRADA</small><h2 id="pc-crash-title">O computador apagou.</h2><p>${a.choice==='enable-macros'?'Você permitiu que o anexo suspeito executasse algo no computador.':'Você abriu o anexo suspeito.'} O tempo acabou antes de você interromper a ação. No jogo, os arquivos fictícios foram bloqueados, como se um vírus tivesse entrado. Seu computador e seus arquivos reais continuam intactos.</p><p class="pc-crash-lesson"><strong>Na vida real:</strong> desconecte o aparelho da internet e peça ajuda ao suporte de confiança. Não pague nenhum resgate.</p><div class="pc-crash-actions"><button class="primary" data-retry-ransomware>Tentar novamente</button></div></div></section>`:'';
 if(a.revenge?.open)feedback=revengeView(state,escape);
 feedback=feedback.replace(/(<section class="defense-feedback defense-reaction\b[^>]*>)([\s\S]*?)(<\/section>)/g,'$1<div class="reaction-scroll">$2</div>$3');
 const confetti=finished&&!a.revenge?.open&&a.reactionTier==='success'?`<div class="defense-confetti" aria-hidden="true">${[['top-left',1,1],['top-right',-1,1],['bottom-left',1,-1],['bottom-right',-1,-1]].map(([corner,xSign,ySign])=>`<span class="defense-confetti-corner ${corner}">${Array.from({length:18},(_,i)=>{const x=8+(i*13%42),y=7+(i*17%38),rotation=(i*47)%360,delay=(i%6)*24;return `<i style="--dx:${xSign*x}vw;--dy:${ySign*y}vh;--spin:${rotation}deg;--wait:${delay}ms"></i>`;}).join('')}</span>`).join('')}</div>`:'';
 const ransomware=a.ransomwareDeadline?`<div class="ransomware-alert" role="alert"><strong>⚠ Arquivos simulados em risco · <span data-ransomware-countdown>${remaining}</span>s</strong><p>A máquina do jogo começou a bloquear arquivos. Isso é uma encenação: o jogo não toca no seu computador.</p><button class="primary" data-defense-stop><span class="ransomware-stop-icon" aria-hidden="true">⏻</span><span class="ransomware-stop-copy"><strong>Parar o bloqueio</strong><small>Desconectar da rede e chamar o suporte</small></span></button></div>`:'';
 const actionPlayback=actionScene?`<div class="defense-action-playback-shade" aria-hidden="true"></div><section class="defense-action-playback" data-action-scene="${a.actionPending}" style="--action-duration:${actionDuration}s" role="status" aria-live="assertive" aria-label="${escape(actionScene.title)}"><div class="defense-action-playback-card"><div class="defense-action-pc" aria-hidden="true"><div class="defense-action-osbar"><span class="defense-os-lights"><i></i><i></i><i></i></span><b class="demo-os-brand">${officeIcon('brand')} TRAMBIQUE OS</b><small>COMPUTADOR DO ESTAGIÁRIO</small></div><section class="defense-action-app" data-demo-app="${a.actionPending}" data-demo-kind="${actionApp.kind}"><header class="defense-action-appbar"><span class="defense-action-appicon motion-${actionScene.motion}">${officeIcon(expandedAction(a.actionPending)?.icon||demoIconKey(actionApp.kind))}</span><b>${escape(actionApp.title)}</b><span class="defense-app-controls" aria-hidden="true"><svg viewBox="0 0 64 20"><path d="M3 14h10M27 5h10v10H27zM51 5l10 10m0-10L51 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span></header><nav class="defense-action-appnav">${actionApp.nav.map((item,index)=>`<span class="${index===0?'is-active':''}">${escape(item)}</span>`).join('')}</nav>${actionAppContent}${scammerActivity}</section><div class="defense-action-taskbar"><span class="demo-brand-icon">${officeIcon('brand')}</span><span>${officeIcon(expandedAction(a.actionPending)?.icon||demoIconKey(actionApp.kind))} ${escape(actionApp.title)}</span><small>SIMULAÇÃO LOCAL · DADOS FICTÍCIOS</small></div></div><small>AÇÃO EM ANDAMENTO</small><h2>${escape(actionScene.title)}</h2><p>${escape(actionScene.detail)}</p><ol class="defense-action-steps" aria-label="Etapas da ação">${actionSteps.map((step,index)=>`<li class="defense-action-step step-${index+1}" style="--step-delay:${actionStepDelay(index)};--step-duration:${actionStepDuration}s"><span aria-hidden="true">${index===0?officeIcon(expandedAction(a.actionPending)?.icon||demoIconKey(actionApp.kind)):demoStepIcon(index)}</span><div><small>${escape(step.label)}</small><strong>${escape(step.detail)}</strong></div></li>`).join('')}</ol><div class="defense-action-progress" aria-hidden="true"><i></i></div></div></section>`:'';
 return `<header><a class="logo" href="/">QUASE<span>HONESTOS</span><small>SIMULAÇÃO EDUCATIVA · RODADA DE DEFESA</small></a><span class="shift">Dia ${day.number} de ${day.total} · ${day.position}/5</span></header><main><aside><div class="boss"><small>GUIA RÁPIDO</small><h2>Recebeu uma mensagem?</h2><p>Não faça nada no impulso. Confira quem enviou por um canal que você já conhece.</p></div><section class="notes"><h3>Seu objetivo</h3><p>Identifique o sinal de risco e escolha uma ação segura. As opções começam com <b>AÇÃO —</b>.</p><p>Você pode encerrar a conversa a qualquer momento. Nenhum pagamento é real.</p><strong>Confiança não é nota de segurança.</strong></section></aside><section class="computer defense-computer"><div class="windowbar"><span>● ● ●</span> ZAPE ZAPE 2 <span>SIMULAÇÃO DE DEFESA</span></div><nav><span>✉ Conversa</span><span>⚠ Analisar golpe</span><span>☰ Guia</span></nav><section class="defense-round" aria-labelledby="defense-title"><div class="defense-round-intro"><small>DIA ${day.number} · CASO ${day.position} DE 5</small><span class="case-category-label">${officeIcon(category.icon)}${escape(category.name)}</span><h1 id="defense-title">${escape(scenario.title)}</h1><p class="case-person-context"><b>Contexto do caso:</b> ${escape(c.name==='Seu personagem'?'Você':c.name)} · ${escape(c.role)}</p><p><b>O que pode acontecer:</b> ${escape(scenario.technique)}</p>${a.audience==='child'?childGlossary(scenario.title+scenario.message+scenario.technique+scenario.choices.map(c=>c.label).join(' '),escape):''}</div><div class="defense-contact"><div class="avatar${senderTalking?' is-speaking':''}" data-speaking="${senderTalking}" data-expression="${scammerExpression}" data-caller="${scammer.id}" aria-hidden="true" style="--person:${c.color}"><img draggable="false" src="${scammerPortrait}" alt="" width="64" height="64"></div><div><strong>Contato não salvo</strong><span>Remetente com identidade não confirmada</span></div><span class="defense-contact-status">contato não confirmado</span></div><div class="defense-chat${talking?' is-speaking':''}" role="log" tabindex="0" aria-live="polite" aria-label="Mensagem de contato não salvo">${chatMessages}</div>${quickMechanic}${responseReady?clues:''}${ransomware}${confetti}${feedback}${!finished&&responseReady?actions:''}${actionPlayback}${scamInteractionView(a,escape)}<p class="defense-footnote">Tudo nesta rodada é fictícia. Nunca informe códigos, senhas ou dados pessoais.</p></section></section></main><footer>Quase Honestos · jogo educativo. A simulação não altera arquivos nem configurações do dispositivo.</footer>`;
}

export function defenseCampaignEnding(state,escape){
 const campaign=state.history.filter(item=>item.caseId),outcomeCopy=campaignOutcomeCopy(state.history),protectedCount=campaign.filter(item=>item.outcome==='blocked'&&item.choice!=='end-contact'&&!item.partial).length;
 const sharedEffects={
  'end-contact':'[conversa encerrada; nenhum dado enviado]',
  'ask-secret':'[pedido de confirmação; nenhum código seu enviado]',
  'give-code':'[código SMS fictício: 804 271]',
  'install-remote':'[instalação do app de acesso remoto iniciada]',
  'transfer-safe':'[transferência fictícia iniciada para a conta indicada]',
  'send-pix':'[Pix fictício iniciado para a chave da mensagem]',
  'deliver-proof':'[pedido liberado antes de confirmar o Pix]',
  'refund-other':'[devolução iniciada para outra chave do chat]',
  'pay-qr':'[pagamento fictício iniciado pelo QR recebido]',
  'send-doc':'[foto de documento fictício anexada]',
  'pay-link':'[dados fictícios do cartão preenchidos no link]',
  'reply-cpf':'[CPF e endereço fictícios enviados]',
  'open-attachment':'[anexo aberto: nota-fiscal-urgente.pdf fictício]',
  'enable-macros':'[permissão para executar o arquivo fictício concedida]',
  'hand-card':'[cartão fictício entregue; senha informada]',
  'ask-id':'[identificação pedida; nenhum dado enviado]',
  'pay-direct':'[Pix fictício iniciado para a chave do vendedor]',
  'send-document':'[CPF e foto de documento fictícios anexados]',
  'pay-fee':'[pagamento fictício da taxa iniciado pelo link]',
  'send-cpf':'[CPF e data de nascimento fictícios enviados]',
  'leave-card':'[cartão da simulação aceito sem conferência]',
  'repeat-pin':'[senha fictícia digitada novamente]'
 };
 return `<section class="welcome shift-ending defense-ending"><div class="shift-stamp"><span></span> ${state.cursor>=defensePeople.length?'CAMPANHA CONCLUÍDA · SEIS DIAS':'RODADA ENCERRADA'}</div><h1>${campaign.some(item=>item.gameOver)?'Fim de jogo. O RH já sabe.':state.cursor>=defensePeople.length?'Campanha concluída.':'Expediente concluído.'}</h1><p>${campaign.some(item=>item.gameOver)?'O ransomware fictício terminou a rodada. O chefe vai com certeza descontar do seu salário inexistente de estagiário.':`Você concluiu as ${defensePeople.length} situações. ${protectedCount} risco(s) foram interrompidos.`}</p><div class="campaign-result-story"><h2>${escape(outcomeCopy.title)}</h2><p>${escape(outcomeCopy.text)}</p><small>${outcomeCopy.paused} conversa(s) pausada(s) · ${outcomeCopy.revenge} vingança(s) concluída(s)</small></div><p>Na vida real, confirme por canais oficiais, não compartilhe códigos e procure o banco ou suporte rapidamente se houver prejuízo.</p>${defenseBossPanel(state,escape)}${campaign.some(item=>item.revenge?.credited)?`<p class="revenge-campaign-summary"><strong>Créditos das revanches: C$ ${campaign.reduce((sum,item)=>sum+(item.revenge?.credited?item.revenge.award:0),0)}</strong><br>Recompensas dos desafios fictícios. Os resultados e prejuízos originais continuam registrados.</p>`:''}<section class="defense-recap" aria-labelledby="defense-recap-title"><h2 id="defense-recap-title">O que você praticou</h2><p>Abra uma conversa para ver sua escolha e a mensagem fictícia enviada.</p><div class="defense-recap-list">${campaign.map((item,i)=>{const scenario=defenseCaseFor(item),person=defensePeople.find(p=>p.id===item.caller),choice=scenario?.choices.find(option=>option.id===item.choice),shared=sharedEffects[item.choice]|| (choice?.safe?'[nenhum código, CPF ou anexo enviado]':`[ação da simulação: ${choice?.label?.replace(/^AÇÃO — /,'')||'escolha registrada'}]`);return `<details class="defense-recap-card"><summary class="defense-recap-heading"><span>${i+1}</span><div><strong>${escape(person?.name||'Atendimento')}</strong><small>${escape(scenario?.title||'')}</small></div><b class="${item.outcome==='blocked'?'recap-safe':'recap-risk'}">${(item.choice==='end-contact'||!!item.partial)?'Contato pausado':item.outcome==='blocked'?'Risco interrompido':'Risco passou'}</b></summary><div class="defense-recap-body"><div class="defense-recap-choice"><small>Sua escolha</small><p>${escape(choice?.label?.replace(/^AÇÃO — /,'')||item.choice||'')}</p></div><div class="defense-recap-message ${item.outcome==='blocked'?'is-safe':'is-risk'}"><span class="defense-recap-message-avatar" aria-hidden="true">EU</span><div><small>Mensagem fictícia enviada</small><p>Eu: ${escape(shared)}</p></div><span class="defense-recap-message-status" aria-label="Mensagem simulada">✓</span></div><div class="defense-recap-feedback"><small>Resultado</small><p>${escape(item.feedback||'')}</p>${item.balanceSettlement?.loss?`<p>Prejuízo fictício: − C$ ${item.balanceSettlement.loss}</p>`:''}${item.revenge?.credited?`<p>Revanche concluída: + C$ ${item.revenge.award} · ${item.revenge.answers.filter(answer=>answer.firstTry).length} acertos de primeira.</p>`:''}</div></div></details>`;}).join('')}</div></section><p><b>Missão de aprendizado:</b> suspeitou? Pause, confirme por um canal conhecido e só então decida.</p>${mailDayRecap(state,campaignDay(state,defensePeople.length).number,escape)}<div class="defense-ending-actions"><button class="defense-ending-desktop" data-show-desktop>Voltar para o computador</button><button class="primary" data-action="reset">Começar outra rodada</button></div></section>`;
}
