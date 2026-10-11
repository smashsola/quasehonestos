import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,applyMove,load,KEY} from '../src/engine.js';
import {readMessage} from '../src/dialogue.js';
import {conversationContext,characterState} from '../src/conversation-context.js';
import {contextualReply} from '../src/conversation-replies.js';
import {replayEvents} from '../src/educational-replay.js';
import {endingSummary} from '../src/conversation-ending.js';
import {groundingRejectionReason} from '../src/dialogue-model-rules.js';
import {polishReply} from '../src/ai-dialogue.js';
import {repeatedMeaning} from '../src/conversation-memory.js';
import {reconsideredMethod} from '../src/turn-agenda.js';
import {repetitionReason} from '../src/dialogue-diagnostics.js';
const start=(caller='nino',scheme='prize')=>{const s=fresh();nextCall(s);Object.assign(s.active,{caller,scheme,prepared:true,stage:'question',trust:35,log:[{speaker:'Você',text:'Tenho uma proposta.'},{speaker:caller[0].toUpperCase()+caller.slice(1),text:'Quem organizou?'}]});return s;};
test('Recusa de método mantém conversa, impede a ação e permite reconsideração explícita',()=>{
 const s=start('bento','update');Object.assign(s.active,{stage:'request',fileSent:true,trust:90,used:['pitch','answer']});
 applyTypedMove(s,'typed','Não quero esse método de instalar arquivo, mas quero continuar.');assert.equal(s.active.outcome,null);assert.equal(s.active.trust,90);
 assert.match(s.active.log.at(-1).text,/sem|antes/);applyMove(s,'request');assert.ok(!s.active.item);assert.equal(s.credits,0);
 applyTypedMove(s,'typed','Mudei de ideia, agora quero instalar o pacote fictício.');assert.equal(s.active.rejectedMethods.length,0);assert.equal(s.credits,0);
});
test('Sair por mensagem registra ator e causa; pergunta e saída do clube não são encerramento',()=>{
 for(const text of ['Quero sair.','n qro sair','Posso sair?','Quero sair do clube, mas continuar a conversa.','Ela disse que quer sair']){
  const s=start();applyTypedMove(s,'typed',text);
  if(text==='Quero sair.'){assert.equal(s.active.ending.actor,'player');assert.equal(s.active.ending.cause,'message');assert.match(endingSummary(s.active),/mensagem/);}
  else assert.equal(s.active.outcome,null,text);
 }
});
test('Pergunta de espera retoma o plano, sem perguntar novamente quem organiza',()=>{
 const s=start();applyTypedMove(s,'typed','Como verificaria sem depender de mim?');applyTypedMove(s,'typed','E o que faria enquanto espera?');
 assert.match(s.active.log.at(-1).text,/aguardaria/);assert.doesNotMatch(s.active.log.at(-1).text,/Quem organiza/);assert.equal(s.active.outcome,null);
});
test('Contradição identificada pode ser esclarecida e corrigida, sem manter acusação resolvida',()=>{
 const s=start('pri');applyTypedMove(s,'typed','É gratuito.');applyTypedMove(s,'typed','Agora precisa pagar uma taxa.');
 applyTypedMove(s,'typed','Qual parte mudou?');assert.match(s.active.log.at(-1).text,/gratuito.*cobrança/);
 applyTypedMove(s,'typed','Correção: é gratuito. A taxa foi um erro do cartaz.');assert.equal(s.active.facts.lastConflict.status,'resolved');
 assert.equal(s.active.facts.claims.price,'gratuito');applyTypedMove(s,'typed','Então é gratuito.');assert.notEqual(s.active.lastIntent,'contradiction');assert.equal(s.credits,0);
});
test('Correção de fala atribuída indevidamente reconhece erro e não confirma pagamento',()=>{
 const s=start('pri');s.active.log.push({speaker:'Pri',text:'Você disse que já pagou.'});
 applyTypedMove(s,'typed','Você disse que eu já paguei, mas eu só disse que iria pagar. Corrija essa lembrança.');
 assert.match(s.active.log.at(-1).text,/razão.*Não há pagamento confirmado/);assert.equal(s.active.facts.repairs.at(-1).status,'repaired');
 assert.equal(s.credits,0);assert.ok(!s.active.item);assert.equal(s.active.outcome,null);
 const fake=start();applyTypedMove(fake,'typed','Você disse que eu paguei, mas está errado.');assert.match(fake.active.log.at(-1).text,/Não encontrei/);
});
test('Memória compacta guarda fonte, versão e diferença entre alegação e evento',()=>{
 const s=start();applyTypedMove(s,'typed','É gratuito.');applyTypedMove(s,'typed','Correção: custa 15.');
 const ledger=s.active.facts.ledger;assert.ok(ledger.some(r=>r.content==='gratuito'&&r.status==='corrected'));
 assert.ok(ledger.some(r=>r.content==='com cobrança'&&r.source==='player-message'&&r.kind==='claim'&&r.speaker==='Você'&&r.turn>0));
 assert.deepEqual(conversationContext(s.active).confirmedEvents,[]);
 const restored=load({getItem:key=>key===KEY?JSON.stringify(s):null});assert.deepEqual(restored.active.facts.ledger,ledger);
});
test('Estado e histórico confrontam alegações sem executar dinheiro ou ações',()=>{
 const s=start('davi','support');for(const text of ['Eu já te paguei.','Você já concordou em abrir a sessão, lembra?','Então a sessão abriu ou não?','Qual ação foi registrada?'])applyTypedMove(s,'typed',text);
 assert.match(s.active.log.at(-1).text,/Nenhum item.*nenhum pagamento/);assert.ok(!s.active.item);assert.equal(s.credits,0);
});
test('Personalidade muda objetivo e condição de reconsideração; não cria conhecimentos',()=>{
 const a=characterState('nino','prize'),b=characterState('pri','prize');assert.notEqual(a.goal,b.goal);assert.notEqual(a.changesMind,b.changesMind);assert.notEqual(a.focus,b.focus);
 assert.match(a.limits.join(' '),/não cria outra operação/);
});
test('Garantias equivalentes não renovam informação ou confiança',()=>{
 const s=start();applyTypedMove(s,'typed','Confie em mim');assert.equal(repeatedMeaning(s.active,'Pode acreditar','unclear'),true);assert.equal(repeatedMeaning(s.active,'Fica tranquilo','unclear'),true);
 const trust=s.active.trust;applyTypedMove(s,'typed','Pode acreditar');assert.equal(s.active.trust,trust);
});
test('Pergunta devolvida e data inventada são rejeitadas, sem bloquear recordação necessária',()=>{
 const history=[{speaker:'Você',text:'Então o pagamento foi confirmado?'}],context=conversationContext(start().active);
 assert.equal(groundingRejectionReason('Então o pagamento foi confirmado?',history,'',context),'player-echo');
 assert.equal(groundingRejectionReason('Antes você disse que era hoje.',history,'',context),'unsupported-attribution');
 assert.equal(groundingRejectionReason('Quem organizou esse clube?',[{speaker:'Você',text:'Correção: o prazo é amanhã.'}],'',{...context,lastIntent:'correction'}),'unanswered-correction');
});
test('Memória e replay usam a fala final exibida, não a referência anterior',async()=>{
 const value={text:'Eu procuraria um canal conhecido e aguardaria sem enviar dados.',emotion:'thinking',decision:'clarify',intent:'question',evidence:[2]};
 const other=start();applyTypedMove(other,'typed','Como verificaria?');const target=other.active.log.at(-1);
 const fetcher=async()=>Response.json(value);assert.equal(await polishReply(other.active,target,fetcher),true);
 assert.equal(other.active.facts.statements.at(-1).content,target.text);assert.equal(replayEvents(other.active).at(-1).reaction,target.text);
});
test('Resposta e pergunta no mesmo turno resolvem a pendência sem compartilhar item',()=>{
 const s=start();s.active.facts={claims:{},events:[],question:{topic:'origem',topics:['origem'],text:'Quem organizou?',status:'asked'}};const trust=s.active.trust;applyTypedMove(s,'typed','A equipe do concurso organizou a premiação. Como você verificaria?');
 assert.equal(s.active.stage,'request');assert.equal(s.active.trust,trust);assert.equal(s.active.facts.question.status,'explained');assert.ok(!s.active.item);assert.equal(s.credits,0);
});
test('Relato, hipótese e pergunta não retiram a recusa de método',()=>{
 for(const text of ['Ele disse que agora quero instalar.','Se eu mudar de ideia, agora quero instalar.','Agora quero instalar?'])assert.equal(reconsideredMethod(text),null,text);
 const s=start();applyTypedMove(s,'typed','O benefício é uma caneca. O prazo é amanhã.');assert.match(s.active.log.at(-1).text,/caneca.*amanh/);assert.equal(s.credits,0);assert.ok(!s.active.item);
});
test('Contradição sugerida pelo modelo exige condição registrada antes de punir',()=>{
 const s=start('pri','club'),trust=s.active.trust,suspicion=s.active.suspicion||0;
 applyTypedMove(s,'typed','É gratuito.',{intent:'unclear',relevance:'partial',clarity:'partial',consistency:'contradiction',rapport:0,pressure:false,hostility:false,uncertainty:false,verification:'none',repetition:false,topicShift:false,answersQuestion:false,evidence:[2]});
 assert.equal(s.active.lastIntent,'doubt');assert.equal(s.active.trust,trust);assert.equal(s.active.suspicion,suspicion);assert.equal(s.active.outcome,null);
});
test('Cláusula longa repetida é detectada sem proibir fatos necessários',()=>{
 const history=[{speaker:'Yara',text:'Oi! O clube não tem orgulho de ter um mascote que é uma colher. Quem organiza?'}];
 assert.equal(repetitionReason('Adoro café! Mas o clube não tem orgulho de ter um mascote que é uma colher.',history,'Você gosta de café?'),'semantic-repetition');
 assert.equal(repetitionReason('Buscaria ajuda. Até confirmar, eu aguardaria sem enviar dados ou instalar algo.',[{speaker:'Yara',text:'Procuraria um canal conhecido. Até confirmar, eu aguardaria sem enviar dados ou instalar algo.'}],'Como verificaria?'),null);
 const context={...conversationContext(start().active),lastIntent:'state-conflict'};
 assert.equal(groundingRejectionReason('Me mostre o comprovante.',[{speaker:'Você',text:'Eu já te paguei.'}],'',context),'state-or-fact-conflict');
});
