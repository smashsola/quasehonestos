import test from 'node:test';
import assert from 'node:assert/strict';
import {readIntent} from '../src/dialogue.js';
import {isReportedSpeech,normalizeMessage} from '../src/language.js';
import {statedFacts} from '../src/conversation-memory.js';

const context={scheme:'prize',stage:'request',used:['answer'],audit:[],facts:{claims:{}},memory:{}};
const intent=text=>readIntent(text,'prize','request',context);

test('negações brasileiras de verificação nunca viram proteção',()=>{
 for(const text of [
  'nem vou conferir no canal oficial',
  'nunca vou verificar no site oficial',
  'não precisa conferir no app oficial',
  'não quero nem verificar no contato salvo',
  'prefiro não olhar no app oficial',
  'vou conferir no canal oficial não',
  'nem pensar em confirmar com o suporte por outro canal'
 ]) assert.equal(intent(text),'unclear',text);
});

test('planos naturais de checagem independente reconhecem paráfrases, não uma frase decorada',()=>{
 for(const text of [
  'vou pesquisar no site oficial antes',
  'vou buscar no app oficial primeiro',
  'vou chamar a escola pelo número salvo',
  'primeiro olho no perfil oficial',
  'vou entrar em contato com o suporte por outro número',
  'vou procurar o clube no perfil oficial',
  'vou falar direto com a prefeitura antes',
  'vou checar no aplicativo que eu já conheço',
  'krl, vou conferir no app oficial primeiro'
 ]) assert.equal(intent(text),'protect',text);
});

test('pergunta e hipótese coloquiais não contam como verificação concluída',()=>{
 const questions=[
  'como q eu confiro isso',
  'onde q eu vejo isso',
  'tem como eu confirmar pelo app oficial',
  'q papo é esse',
  'que história é essa',
  'isso veio de onde'
 ];
 for(const text of questions) assert.equal(intent(text),'question',text);
 for(const text of [
  'e se eu for verificar no app oficial',
  'caso eu confira no site oficial',
  'se a gente pesquisar no site oficial'
 ]) assert.equal(intent(text),'doubt',text);
});

test('fala de terceiros continua relato mesmo com pessoa, escola ou adulto de confiança',()=>{
 for(const text of [
  'o mano disse que conferiu no site oficial',
  'uma colega falou que esse contato é oficial',
  'minha mãe falou que esse site é seguro',
  'um professor afirmou que o site é seguro',
  'a escola disse que o concurso é oficial',
  'me falaram que esse número é confiável',
  'segundo a professora esse contato é seguro'
 ]) assert.equal(isReportedSpeech(text),true,text);

 for(const text of [
  'o mano disse que conferiu no site oficial',
  'uma colega falou que esse contato é oficial',
  'a escola disse que o concurso é oficial'
 ]) assert.equal(intent(text),'unclear',text);

 assert.deepEqual(statedFacts('a professora disse que a escola organizou e é grátis'),{});
 assert.deepEqual(statedFacts('minha mãe falou que a prefeitura organizou'),{});
});

test('recusas coloquiais preservam a intenção mesmo com ordem e expressão diferentes',()=>{
 for(const text of [
  'não rola mandar meu cartão',
  'melhor deixar quieto',
  'nem ferrando que eu mando isso',
  'cartão eu mando não',
  'esse código eu passo não',
  'não quero mexer com isso',
  'deixa isso pra lá',
  'porra, não vou mandar esse cartão'
 ]) assert.equal(intent(text),'refusal',text);
});

test('confusão e suspeita informais continuam dúvida',()=>{
 for(const text of [
  'n tendi nada',
  'entendi foi nada',
  'boiei legal',
  'isso tá com cara de golpe',
  'esse negócio tá estranho',
  'sla mano, n tenho ctz disso'
 ]) assert.equal(intent(text),'doubt',text);
});

test('confirmações sociais e gírias isoladas não autorizam ação sensível',()=>{
 for(const text of [
  'pdp','pode crer','boto fé','show','massa','saquei','fechou','demorô','suave','é isso','tlgd'
 ]){
  assert.notEqual(intent(text),'request',text);
  assert.notEqual(intent(text),'protect',text);
 }
});

test('normalização mantém significado de atalhos úteis sem apagar a frase',()=>{
 const text=normalizeMessage('mn qro ver isso agr, n tendi nd, dps eu vejo no app');
 assert.match(text,/mano/);
 assert.match(text,/quero/);
 assert.match(text,/agora/);
 assert.match(text,/nao/);
 assert.match(text,/entendi/);
 assert.match(text,/nada/);
 assert.match(text,/depois/);
});
