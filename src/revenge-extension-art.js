import {officeIcon} from './office-icons.js';
const props={
 'pix-return':['ROTA DO PIX CENOGRÁFICO','transaction','wallet','DEVOLUÇÃO DE NADA','Conta original → recibo de mentirinha'],
 'task-income':['PLATAFORMA DE TAREFAS','tasks','ledger','C$ 0','Trabalho para liberar mais trabalho'],
 'fake-job':['SELEÇÃO DA FIRMA','badge','club','CANDIDATO A GOLPISTA','Cargo: pagar para procurar emprego'],
 'loan-fee':['SEGURADORA DO SEGURO','stack','wallet','TAXA DO SEGURO DA TAXA','Empréstimo: somente papel'],
 'fake-investment':['BOLSA DE PROMESSAS','graph','results','LUCRO EM DESENHO','O gráfico sobe; o saque não existe'],
 'prize-fee':['PREMIAÇÃO IMAGINÁRIA','prize','prize','TROFÉU DO NADA','Um prêmio embrulhado em mais taxa'],
 'marketplace-sale':['EXPEDIÇÃO DE EMBALAGENS','parcel','package','CAIXA SEM PAGAMENTO','Entrega de embalagem vazia'],
 'account-takeover':['PORTARIA DAS SESSÕES','door','shield','ACESSO AO NADA','Chave cenográfica · porta cenográfica'],
 'fake-lawyer':['PROCESSO DE PAPEL','stack','files','PROCESSO DA PRÓPRIA TAXA','Autos: duas folhas e uma desculpa'],
 'fake-voice':['SECRETÁRIA QUASE ELETRÔNICA','voice','calls','AGUARDE A ESPERA','O áudio urgente encontrou uma fila'],
 'romance-money':['CONTABILIDADE DO ROMANCE','heart','club','CORAÇÃO EM 12 VEZES','Fatura cenográfica de um amor de mensagem'],
 'fake-rental':['IMOBILIÁRIA DE MAQUETES','house','shop','IMÓVEL TAMANHO BOLSO','A chave não abre nem a conversa'],
 'fake-ticket':['BILHETERIA DO LUGAR NENHUM','gate','prize','SESSÃO: NUNCA','Entrada cenográfica · fila infinita'],
 'gift-selfie':['PRESENTES DE PAPELÃO','selfie','package','SELFIE IMPRESSA','Um retrato de papel para um presente de papel'],
 'fake-update':['ATUALIZADOR DE AVISOS','alerts','support','ATUALIZAR A ATUALIZAÇÃO','O próprio aviso foi para a lixeira'],
 'terms-permissions':['CONTRATOS DA FIRMA','switches','files','PERMISSÃO PARA NADA','Ler, revisar e desligar a cláusula absurda'],
 'fake-middleman':['CENTRAL DAS DUAS HISTÓRIAS','chats','calls','AS PONTAS SE ENCONTRARAM','Comprador e dono comparam a mesma conversa'],
 'fake-donation':['COFRINHO TRANSPARENTE','donation','wallet','DOAÇÃO DE VENTO','Destino: campanha imaginária do nada'],
 'fake-mei':['GUIAS DO DEPARTAMENTO','stamp','files','IMPOSTO DO IMPOSTO','Guia cenográfica · nenhuma obrigação real'],
 'free-skins':['ARMÁRIO DO ITEM INVISÍVEL','inventory','club','SKIN: ABSOLUTAMENTE NADA','Troca cenográfica sem uma conta real']
};
function object(kind,icon,phase){const mark=officeIcon(icon);switch(kind){
 case 'transaction':return `${mark}<i class="rv-route"></i><div class="rv-unique-slip"><small>EXTRATO DO NADA</small><b>C$ 0</b></div>`;
 case 'tasks':return `<div class="rv-unique-slip"><small>TAREFAS FEITAS</small><b>${phase+1}</b><small>SAQUE: MAIS TAREFAS</small></div>${mark}`;
 case 'badge':return `<div class="rv-unique-badge">${mark}<small>CRACHÁ FICTÍCIO</small></div>`;
 case 'stack':return `<div class="rv-unique-stack">${[0,10,20].map(n=>`<i style="--n:${n}px"></i>`).join('')}</div>${mark}`;
 case 'graph':return `<div class="rv-unique-graph">${[25,40,60,80,95].map(n=>`<i style="height:${n}px"></i>`).join('')}</div>`;
 case 'prize':return `<div class="rv-unique-badge">${mark}<small>PRÊMIO VAZIO</small></div>`;
 case 'parcel':return `${mark}<div class="rv-unique-slip"><small>CONTEÚDO</small><b>VAZIO</b></div>`;
 case 'door':return `<div class="rv-unique-door">${mark}</div><i class="rv-route"></i>${officeIcon('link')}`;
 case 'voice':return `${mark}<div class="rv-unique-graph">${[40,75,30,65,45].map(n=>`<i style="height:${n}px"></i>`).join('')}</div>`;
 case 'heart':return `<svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 85 13 48C-12 17 27-2 50 24 73-2 112 17 87 48Z" fill="#bf7774" stroke="#86514e" stroke-width="3"/><path d="m58 25-15 24 17 9-19 23" fill="none" stroke="#ffe4bb" stroke-width="4"/></svg>`;
 case 'house':return `<div class="rv-unique-house">${officeIcon('shop')}</div>${officeIcon('link')}`;
 case 'gate':return `<div class="rv-unique-door">${mark}</div><div class="rv-unique-slip"><small>INGRESSO</small><b>SEM EVENTO</b></div>`;
 case 'selfie':return `<div class="rv-unique-badge">${officeIcon('club')}</div><i class="rv-route"></i>${mark}`;
 case 'alerts':return `<div class="rv-unique-stack">${[0,10,20].map(n=>`<i style="--n:${n}px">AVISO</i>`).join('')}</div>${mark}`;
 case 'switches':return `<div class="rv-unique-switches"><i></i><i></i><i></i></div>${mark}`;
 case 'chats':return `<div class="rv-unique-slip"><small>COMPRADOR</small><b>?</b></div><i class="rv-route"></i><div class="rv-unique-slip"><small>DONO</small><b>!</b></div>`;
 case 'donation':return `<div class="rv-unique-door">${mark}<small>VENTO</small></div>`;
 case 'stamp':return `<div class="rv-unique-slip"><small>GUIA DO NADA</small><b>ISENTO</b></div>${mark}`;
 case 'inventory':return `<div class="rv-unique-door">${mark}<small>VAZIO</small></div>`;
 default:return mark;
}}
export function expandedRevengeArt(id,phase,part,escape){const [label,kind,icon,title,detail]=props[id]||['TEATRO','stack','files',part[1],part[2]];return `<section class="rv-unique-scene rv-prop-${kind}" data-rv-enter="100" data-prop-phase="${phase}"><small>${label}</small><div class="rv-unique-prop">${object(kind,icon,phase)}</div><strong>${escape(title)}</strong><p>${escape(phase%2?part[0]:detail)}</p>${phase===4?'<span class="rv-unique-final">ENCENAÇÃO CONCLUÍDA</span>':''}</section>`;}
