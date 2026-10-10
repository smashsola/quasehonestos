import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,finishCall,load} from '../src/engine.js';
import {defenseCase,defensePanel,defenseSourcePanel,inspectDefense,resolveDefense} from '../src/defense-investigation.js';
import {statedFacts,repeatedMeaning} from '../src/conversation-memory.js';
function start(cursor=0){const s=fresh();s.cursor=cursor;nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'pitch',log:[{speaker:'Você',text:'Olá, tenho uma proposta.'}]});return s;}
function end(cursor=0){const s=start(cursor);applyTypedMove(s,'typed','Confira no canal oficial');return s;}
test('Paráfrases protetivas usam o sentido de confirmação e não uma frase específica',()=>{
 for(const text of ['Verifica no aplicativo oficial antes de continuar','Confirma pelo contato salvo e não envie seu cartão','Use o aplicativo que você já conhece para conferir','Mantenha sua senha em segredo','Não precisa compartilhar seu cartão']){
  const s=start();s.active.trust=2;applyTypedMove(s,'typed',text);assert.equal(s.active.lastIntent,'protect',text);assert.equal(s.active.trust,2);assert.equal(s.credits,0);assert.ok(!s.active.item);
 }
});
test('Relato, negação, assunto inesperado e frase mista não criam consequências',()=>{
 for(const text of ['Ele disse para conferir no canal oficial','Não confira no canal oficial','Confira no canal oficial e me envie o cartão','Hoje choveu no futebol','Não envie seu cartão?']){const s=start();s.active.trust=2;applyTypedMove(s,'typed',text);assert.equal(s.active.outcome,null,text);assert.equal(s.active.trust,2);assert.ok(!s.active.item);}
});
test('Fatos declarados, pergunta e esclarecimento persistem; mudanças de condições são citadas',()=>{
 const s=start();applyTypedMove(s,'typed','Tenho um prêmio gratuito do concurso');assert.equal(s.active.facts.claims.price,'gratuito');assert.equal(s.active.facts.question.status,'asked');
 applyTypedMove(s,'typed','A equipe do concurso organizou a premiação');assert.equal(s.active.facts.question.status,'explained');
 applyTypedMove(s,'typed','Agora precisa pagar uma taxa');assert.equal(s.active.lastIntent,'contradiction');assert.match(s.active.log.at(-1).text,/gratuito.*cobrança/);assert.ok(!s.active.item);
 const restored=load({getItem:()=>JSON.stringify(s)});assert.equal(restored.active.facts.claims.price,'gratuito');assert.equal(restored.active.facts.events.at(-1).type,'contradiction');
 assert.deepEqual(statedFacts('Não precisa pagar uma taxa'),{price:'gratuito'});assert.deepEqual(statedFacts('Precisa pagar uma taxa?'),{});
});
test('Repetição e paráfrase não aumentam confiança indefinidamente',()=>{
 const s=start(2);applyTypedMove(s,'typed','Tenho um prêmio do concurso');applyTypedMove(s,'typed','A equipe do concurso organizou a premiação');const before=s.active.trust;
 for(let i=0;i<4;i++)applyTypedMove(s,'typed','O pessoal do concurso realizou o prêmio');assert.equal(s.active.trust,before);assert.ok(!s.active.item);
 assert.equal(repeatedMeaning(s.active,'A turma do concurso preparou a premiação','answer'),true);
});
test('Títulos e ações não revelam a legitimidade; fontes aparecem nos apps existentes',()=>{
 const s=end(1),scene=defenseCase(s.active);assert.equal(scene.kind,'legitimate');assert.doesNotMatch(scene.title,/verdade|legítimo|golpe|falso/i);const panel=defensePanel(s.active,String);assert.doesNotMatch(panel,/toda mensagem é golpe|data-defense-inspect|disabled/);assert.match(defenseSourcePanel(s.active,'boss',String),/Aviso OF-12/);assert.match(defenseSourcePanel(s.active,'files',String),/professora Lina/);assert.equal(defenseSourcePanel(s.active,'wallet',String),'');
});
test('Uma fonte pertinente sustenta decisão legítima; palpite fica distinto',()=>{
 const supported=end(1);inspectDefense(supported,'portal');resolveDefense(supported,'official');assert.equal(supported.active.learningDefense.result.quality,'supported');assert.equal(supported.credits,0);
 const guess=end(1);assert.equal(resolveDefense(guess,'official'),true);assert.equal(guess.active.learningDefense.result.quality,'unverified');assert.equal(guess.credits,0);
});
test('Fraude e inconclusão têm evidências diferentes e decisões sustentadas',()=>{
 const fraud=end();inspectDefense(fraud,'order');resolveDefense(fraud,'verify');assert.equal(fraud.active.learningDefense.result.kind,'fraudulent');assert.equal(fraud.active.learningDefense.result.quality,'supported');
 const inconclusive=end(3);inspectDefense(inconclusive,'calendar');resolveDefense(inconclusive,'confirm');assert.equal(inconclusive.active.learningDefense.result.kind,'inconclusive');assert.equal(inconclusive.active.learningDefense.result.quality,'supported');assert.match(inconclusive.active.learningDefense.result.feedback,/não prova fraude/);
});
test('Consulta e decisão sobrevivem à retomada; decisão única não altera saldo nem apaga defesa antiga',()=>{
 const s=end(3);s.credits=80;inspectDefense(s,'contact');const restored=load({getItem:()=>JSON.stringify(s)});assert.deepEqual(restored.active.learningDefense.seen,['contact']);resolveDefense(restored,'confirm');assert.equal(resolveDefense(restored,'accept'),false);finishCall(restored);assert.equal(restored.history[0].learningDefense.result.quality,'supported');assert.equal(restored.credits,80);
 const old=end();old.active.learningDefense={caseId:'school',seen:['portal'],result:{label:'Antiga',safe:true,feedback:'Guardado'}};assert.match(defensePanel(old.active,String),/Guardado/);
});

test('Organização declarada em voz ativa ou passiva mantém a mesma memória',()=>{
 const s=start();applyTypedMove(s,'typed','Tenho um prêmio gratuito do concurso');applyTypedMove(s,'typed','A escola organizou a premiação');assert.equal(s.active.facts.claims.origin,'escola');
 applyTypedMove(s,'typed','O prêmio foi organizado pela prefeitura');assert.equal(s.active.lastIntent,'contradiction');assert.match(s.active.log.at(-1).text,/escola.*prefeitura/);assert.ok(!s.active.item);
 applyTypedMove(s,'typed','O prêmio foi organizado pelo clube');assert.equal(s.active.lastIntent,'contradiction');assert.match(s.active.log.at(-1).text,/escola.*clube/);assert.match(s.active.audit.at(-1).evidence,/condição declarada/);assert.ok(!s.active.item);
 assert.deepEqual(statedFacts('O contato disse que precisa pagar uma taxa'),{});
});
