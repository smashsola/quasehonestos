import {defenseScenes} from './dialogue.js';

// Fictional messages aimed at the player, separate from the NPC proposals.
export const incomingScenes={
 prize:{sender:'Entrega Expressa de Quase Tudo',loss:90,message:'Sua encomenda foi retida: uma caneca com a frase “funcionário quase exemplar”. Pague C$ 90 neste recado para liberar hoje. Se esperar, ela vira presente do porteiro.',signal:'Cobrança inesperada de entrega com ameaça de prazo curto.',choices:[
  {id:'send',label:'Pagar para salvar minha caneca',safe:false,feedback:'A caneca era só a desculpa para cobrar. Uma mensagem não comprova uma encomenda nem uma taxa.'},
  {id:'check',label:'Conferir meu pedido no app da loja que já conheço',safe:true,feedback:'Você verificou por fora da mensagem. Não havia encomenda nem taxa registrada. O porteiro segue sem caneca.'},
  {id:'link',label:'Conferir pelo endereço que esse contato mandou',safe:false,feedback:'O endereço veio de quem pediu o pagamento. A aparência de uma página não torna a confirmação independente.'}
 ]},
 support:{sender:'Chefia · número novíssimo',loss:140,message:'Sou eu, seu chefe. Troquei de número porque o antigo cansou de trabalhar. Preciso de C$ 140 AGORA para uma reunião sigilosa. Não liga, estou preso numa apresentação de 83 slides.',signal:'Pessoa alegando ser conhecida, número novo e pedido urgente de dinheiro.',choices:[
  {id:'known',label:'Confirmar com o chefe pelo contato que eu já tinha',safe:true,feedback:'Você confirmou a identidade por outro canal. O chefe de verdade estava discutindo com a impressora.'},
  {id:'open',label:'Mandar os C$ porque parece o jeito dele falar',safe:false,feedback:'Imitar o jeito de alguém não comprova identidade. O pedido urgente veio de um contato que se passou pelo chefe.'},
  {id:'hide',label:'Pedir uma foto do crachá e mandar depois',safe:false,feedback:'Foto e crachá enviados pelo próprio contato podem ser copiados. Confirme com a pessoa pelo contato conhecido.'}
 ]},
 club:{sender:'Devolução de C$ · setor quase oficial',loss:110,message:'Temos um reembolso de C$ 900 para você! Para devolver, precisamos que envie C$ 110 como taxa de desbloqueio. O sistema só sabe devolver dinheiro depois que recebe dinheiro. Moderníssimo.',signal:'Promessa de reembolso condicionada a um pagamento antecipado.',choices:[
  {id:'fast',label:'Pagar C$ 110 para receber os C$ 900',safe:false,feedback:'O valor prometido tentou justificar uma taxa inventada. A devolução nunca foi comprovada.'},
  {id:'badge',label:'Confiar no selo “setor quase oficial” e pagar',safe:false,feedback:'Nome e selo não validam uma cobrança. Consulte a empresa por um canal conhecido antes de pagar.'},
  {id:'pause',label:'Conferir a devolução direto na empresa, sem pagar aqui',safe:true,feedback:'Você verificou a promessa antes do pagamento. Os C$ 900 só existiam na criatividade desse contato.'}
 ]},
 update:{sender:'Financeiro · Boleto do Café',loss:120,message:'Segue a nova cobrança do café da firma: C$ 120. Trocamos o destinatário hoje. Ignore o boleto anterior e pague este; o chefe pediu café com prioridade máxima e caráter mínimo.',signal:'Troca inesperada de destinatário de uma cobrança.',choices:[
  {id:'open',label:'Pagar a nova cobrança porque tem o logo da firma',safe:false,feedback:'O logo não comprova o destinatário. A mensagem desviou uma cobrança conhecida para outro recebedor.'},
  {id:'official',label:'Comparar o destinatário e confirmar com o financeiro conhecido',safe:true,feedback:'Você conferiu a mudança por outro canal. O café era ruim, mas o pagamento ficou com você.'},
  {id:'allow',label:'Pagar sem conferir para o café não atrasar',safe:false,feedback:'A urgência tentou pular a conferência. Confira o destinatário e a origem antes de confirmar um pagamento.'}
 ]}
};
export function incomingScene(pending){return pending?.variant==='office'?incomingScenes[pending.scene]:defenseScenes[pending?.scene];}
export function refreshIncoming(state){
 const p=state.incoming?.pending;
 if(!p||p.result||p.variant==='office'||!incomingScenes[p.scene])return false;
 p.variant='office';p.sender=incomingScenes[p.scene].sender;return true;
}
export function incomingReport(history=[]){
 if(!history.length)return '';
 return '\nRECADOS RECEBIDOS\n'+history.map(h=>`${h.sender}\nEscolha: ${h.label}\n${h.feedback}\n${Number.isFinite(h.penalty)?'Perda: C$ '+h.penalty+' · saldo após a resposta: C$ '+h.after:'Sem desconto registrado neste recado antigo.'}`).join('\n\n');
}
