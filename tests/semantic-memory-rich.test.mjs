import test from 'node:test';
import assert from 'node:assert/strict';
import {readMessage} from '../src/dialogue.js';
import {messageClauses,normalizeMessage} from '../src/language.js';
import {statedFacts,memoryConflict,rememberConversation,pendingQuestion,answersPendingQuestion,repeatedMeaning} from '../src/conversation-memory.js';
import {contextualReply} from '../src/conversation-replies.js';
const names=['nino','olga','davi','yara','pri','bento'];
function active(caller='nino',topic='origem'){return {caller,scheme:'prize',stage:'question',used:['pitch'],audit:[],log:[{speaker:caller,text:topic==='origem'?'Quem organizou o concurso?':'Qual é o custo para participar?'}],facts:{claims:{},question:{topic,status:'asked'}}};}
const verificationCases=[
 ['Vou conferir pelo aplicativo que eu já conheço antes.','intended','protect'],
 ['Confirme pelo número salvo antes de decidir.','suggested','protect'],
 ['Eu conferiria pelo contato conhecido.','hypothetical','doubt'],
 ['Quem sabe eu consulte o portal oficial.','hypothetical','doubt'],
 ['Vai que eu confirme no perfil oficial antes.','hypothetical','doubt'],
 ['Não pretendo conferir pelo contato salvo.','negated','unclear'],
 ['Vou compartilhar antes de verificar no portal oficial.','negated','unclear'],
 ['Minha colega afirmou que confirmou pelo site oficial.','reported','unclear'],
 ['Eu já conferi no app oficial.','reported','unclear'],
 ['Como você confirmaria sem depender desse contato?','hypothetical','question']
];
for(const [text,verification,intent]of verificationCases)test('Semântica de verificação: '+text,()=>{const a=active(),before=JSON.stringify(a),result=readMessage(text,a.scheme,a.stage,a);assert.equal(result.analysis.verification,verification);assert.equal(result.intent,intent);assert.equal(JSON.stringify(a),before);assert.notEqual(result.analysis.verification,'completed');});
for(const caller of names)test('Sinais coexistem sem consequência implícita: '+caller,()=>{const a=active(caller),r=readMessage('pdp mano, mas me explica melhor porque isso tá estranho',a.scheme,a.stage,a);assert.equal(r.intent,'question');assert.equal(r.analysis.rapport,1);assert.equal(r.analysis.uncertainty,true);assert.equal(r.analysis.answersQuestion,false);assert.equal(r.analysis.verification,'none');assert.equal(a.facts.claims.origin,undefined);});
test('Fatos respeitam relato, condicional, pergunta e escopo da negação',()=>{
 assert.deepEqual(statedFacts('O organizador disse que é grátis'),{});
 assert.deepEqual(statedFacts('Caso a escola organize, será gratuito'),{});
 assert.deepEqual(statedFacts('Você não falou que era gratuito?'),{});
 assert.deepEqual(statedFacts('Não foi feito pela prefeitura'),{});
 assert.deepEqual(statedFacts('Não é grátis'),{price:'com cobrança'});
 assert.deepEqual(statedFacts('Não precisa pagar'),{price:'gratuito'});
 assert.deepEqual(statedFacts('Uma colega disse que é grátis, mas a firma organizou.'),{origin:'firma'});
});
test('Responde a pergunta concreta e distingue afirmação de prova',()=>{
 const a=active();assert.equal(answersPendingQuestion(a,'É gratuito'),false);assert.equal(answersPendingQuestion(a,'Meu colega disse que é verdadeiro'),false);
 assert.equal(answersPendingQuestion(a,'Foi o pessoal do torneio'),true);
 const r=readMessage('Foi o pessoal do torneio','prize','question',a);assert.equal(r.analysis.answersQuestion,true);assert.equal(r.analysis.verification,'none');
 rememberConversation(a,'Foi o pessoal do torneio','answer','question',r.analysis);assert.equal(a.facts.claims.origin,'equipe do torneio');assert.equal(a.facts.verification,undefined);
 const cost=active('pri','custo');assert.equal(answersPendingQuestion(cost,'Não precisa pagar taxa'),true);assert.equal(answersPendingQuestion(cost,'Foi a escola'),false);
});
test('A pergunta posterior vale mais que o tópico genérico da proposta',()=>{
 const a=active();a.facts.claims.origin='firma';a.log.push({speaker:'Nino',text:'Sobre a origem, ouvi sua explicação. Por que o prêmio precisa do meu identificador BatataPay?'});
 assert.equal(pendingQuestion(a).topic,'dados');assert.equal(answersPendingQuestion(a,'A firma organizou'),false);assert.equal(answersPendingQuestion(a,'O identificador BatataPay serve para registrar o prêmio'),true);
});
test('Condição corrigida preserva versões e o caráter declarado',()=>{
 const a=active();rememberConversation(a,'É gratuito','answer','question');assert.equal(memoryConflict(a,'Custa 15').previous,'gratuito');
 const r=readMessage('Corrigindo: custa 15','prize','question',a);assert.equal(r.intent,'correction');rememberConversation(a,'Corrigindo: custa 15','correction','question',r.analysis);
 assert.equal(a.facts.claims.price,'com cobrança');assert.equal(a.facts.corrections[0].previous.price,'gratuito');assert.match(a.facts.provenance,/não verificação independente/);
});
test('Promessas e relatos não criam ações do jogo',()=>{
 const a=active();const r=readMessage('Vou conferir no canal oficial','prize','question',a);rememberConversation(a,'Vou conferir no canal oficial','protect','question',r.analysis);
 assert.equal(a.facts.verificationEvents[0].status,'intended');assert.equal(a.facts.verificationEvents[0].source,'player-statement');assert.equal(a.paymentCompleted,undefined);assert.equal(a.item,undefined);
 assert.equal(readMessage('Já te paguei','prize','question',a).intent,'state-conflict');assert.notEqual(readMessage('Não te paguei','prize','question',a).intent,'state-conflict');
});
test('Item compartilhado não equivale a arquivo instalado nem formulário enviado',()=>{
 const a=active();a.item={token:'QH-DEMO-NINO-PRIZE'};
 for(const text of ['Você já instalou o pacote','O formulário já foi enviado','Eu mandei o arquivo','O link já abriu'])assert.equal(readMessage(text,'prize','question',a).intent,'state-conflict',text);
 a.linkOpened=true;assert.notEqual(readMessage('O link já abriu','prize','question',a).intent,'state-conflict');
 rememberConversation(a,'Eu não vou enviar o arquivo','refusal','question');assert.equal(a.facts.promises,undefined);
});
test('Paráfrases factuais e reconhecimento social não renovam informação',()=>{
 const a=active();a.audit.push({intent:'answer',text:'A equipe do concurso organizou a premiação'});
 assert.equal(repeatedMeaning(a,'O pessoal do concurso realizou o prêmio','answer'),true);
 assert.equal(repeatedMeaning(a,'O clube organizou o concurso','answer'),false);
 a.audit.push({intent:'smalltalk',text:'pdp'});assert.equal(repeatedMeaning(a,'aham','smalltalk'),true);
});
test('Fallback reconhece a parte respondida e pergunta pelo que falta',()=>{
 const a=active('olga');const reply=contextualReply(a,'unclear','','É gratuito');assert.match(reply,/gratuito.*custo.*quem organiza/);
 a.facts.claims.origin='firma';const next=contextualReply(a,'refuse');assert.match(next,/Por que.*identificador/);assert.doesNotMatch(next,/Quem organiza/);
});
test('Normalização corrige typo curto sem trocar uma forma verbal válida',()=>{
 assert.match(normalizeMessage('qm organizo esse prêmio'),/quem organizou/);assert.equal(normalizeMessage('explica melhor'),'explica melhor');assert.match(normalizeMessage('confrir no site ofical'),/conferir no site oficial/);assert.equal(messageClauses('Ele disse que é oficial, mas vou conferir.').length,2);
});
test('Marca interrogativa de cortesia não transforma ordem em pergunta informacional',()=>{
 const a=active();a.stage='request';
 for(const text of ['Me passa o identificador BatataPay?','Manda aquele código?','Por favor, envie o cartão do jogo?','Pode compartilhar o cartão BatataPay?'])assert.equal(readMessage(text,'prize','request',a).intent,'request',text);
 for(const text of ['Por que eu preciso enviar o cartão?','Qual dado você pretende usar?','Como vou mandar isso?'])assert.equal(readMessage(text,'prize','request',a).intent,'question',text);
});
test('Novos organizadores são extraídos pela estrutura sem criar verificação',()=>{
 for(const text of ['A comissão que selecionou os desenhos preparou essa premiação','O coletivo Aurora realizou o concurso','A coordenação do Festival das Colheres organizou o evento','O concurso foi organizado pelo coletivo Aurora']){
  const a=active(),r=readMessage(text,'prize','question',a);assert.equal(r.intent,'answer',text);assert.equal(r.analysis.answersQuestion,true);assert.equal(r.analysis.verification,'none');assert.ok(statedFacts(text).origin);
 }
 assert.equal(statedFacts('A comissão não preparou essa premiação').origin,undefined);
 assert.equal(statedFacts('Me disseram que o coletivo Aurora organizou').origin,undefined);
 assert.equal(statedFacts('O vizinho realizou uma cirurgia').origin,undefined);
});
