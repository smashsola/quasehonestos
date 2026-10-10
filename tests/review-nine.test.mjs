import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMessage,negatedRequest} from '../src/language.js';
import {readIntent} from '../src/dialogue.js';
import {statedFacts} from '../src/conversation-memory.js';
import {resultImpact,consequenceCard,resultReport} from '../src/result-impact.js';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';

const context={scheme:'prize',stage:'request',used:['answer'],audit:[],facts:{claims:{}},memory:{}};

test('Normalização cobre abreviações comuns sem exigir escrita formal',()=>{
 const normalized=normalizeMessage('mn, vc qria ver isso agr? sla, n tenho ctz, dps vejo cmg');
 assert.match(normalized,/mano/);
 assert.match(normalized,/voce/);
 assert.match(normalized,/queria/);
 assert.match(normalized,/agora/);
 assert.match(normalized,/sei la/);
 assert.match(normalized,/nao/);
 assert.match(normalized,/certeza/);
 assert.match(normalized,/depois/);
 assert.match(normalized,/comigo/);
});

test('Recusas naturais e brasileiras não viram pedido nem autorização',()=>{
 for(const text of [
  'não vou mandar o cartão',
  'prefiro não compartilhar meu código',
  'acho melhor não instalar esse pacote',
  'não quero participar disso',
  'to fora dessa oferta',
  'mn n vou mandar esse cod n',
  'quero não, visse',
  'nem a pau que passo esse cartão',
  'sem chance, não instalo esse bgl',
  'de jeito nenhum vou compartilhar isso'
 ]){
  assert.equal(negatedRequest(text),true,text);
  assert.equal(readIntent(text,'prize','request',context),'refusal',text);
 }
 assert.equal(negatedRequest('não quero inventar'),false);
 assert.equal(readIntent('não quero inventar','prize','request',context),'doubt');
});

test('Concordância informal isolada não vira pedido de dado',()=>{
 for(const text of ['pdp','fechou','demorô','suave','bora']){
  assert.notEqual(readIntent(text,'prize','request',context),'request',text);
 }
});

test('Planos naturais de verificação independente são protetivos',()=>{
 const cases=[
  'Vou buscar confirmação no canal oficial primeiro',
  'Prefiro confirmar direto com o clube por outro canal',
  'Quero checar no aplicativo que eu já conheço antes de continuar',
  'Melhor procurar a organização por conta própria antes de enviar dados',
  'pdp, mas vou conferir no app oficial antes',
  'bah, vou dar uma olhada no site oficial antes',
  'uai, vou falar direto com o suporte antes',
  'oxe, primeiro eu pergunto direto pra organização por outro canal'
 ];
 for(const text of cases)assert.equal(readIntent(text,'prize','request',context),'protect',text);
});

test('Verificação condicional em -ria é hipótese, não uma decisão já tomada',()=>{
 const text='Eu verificaria no contato salvo antes de mandar qualquer coisa';
 assert.equal(readIntent(text,'prize','request',context),'doubt');
 const state=fresh();nextCall(state);Object.assign(state.active,{...context,caller:'nino',trust:45,trustScale:100,prepared:true,log:[{speaker:'Nino',text:'O que você quer esclarecer?'}]});
 applyTypedMove(state,'typed',text);assert.equal(state.active.lastIntent,'doubt');assert.equal(state.active.outcome,null);assert.equal(state.active.trust,45);assert.equal(state.credits,0);assert.equal(state.active.item,undefined);
});

test('Perguntas informais continuam perguntas e não prova de verificação',()=>{
 for(const text of [
  'Como eu posso verificar isso?',
  'Onde eu confirmo esse prêmio?',
  'Qual canal eu uso para conferir?',
  'Se eu verificar no canal oficial, já serve?',
  'oxe como assim esse prêmio',
  'qq é isso?',
  'qual foi desse bgl?'
 ])assert.equal(readIntent(text,'prize','request',context),'question',text);
 assert.equal(readIntent('Se eu verificar no canal oficial antes','prize','request',context),'doubt');
});

test('Verificação negada, relatada ou pelo próprio link do contato não é aceita como proteção',()=>{
 assert.equal(readIntent('Não vou verificar no canal oficial','prize','request',context),'unclear');
 assert.equal(readIntent('Não vou conferir no app oficial','prize','request',context),'unclear');
 assert.equal(readIntent('Vou conferir pelo link que eu enviei','prize','request',context),'unclear');
 assert.equal(readIntent('Meu amigo disse que conferiu no site oficial','prize','request',context),'unclear');
 assert.equal(readIntent('A organizadora falou que confirmou no canal oficial','prize','request',context),'unclear');
 assert.equal(readIntent('Segundo o contato, esse site é oficial','prize','request',context),'unclear');
 assert.equal(readIntent('Me disseram que esse contato é confiável','prize','request',context),'unclear');
});

test('Fala relatada e hipótese não entram na memória como fato próprio da conversa',()=>{
 assert.deepEqual(statedFacts('Meu amigo disse que a escola organizou e que é grátis'),{});
 assert.deepEqual(statedFacts('A organizadora falou que não precisa pagar'),{});
 assert.deepEqual(statedFacts('Me disseram que a prefeitura organizou'),{});
 assert.deepEqual(statedFacts('Segundo o contato, a escola organizou'),{});
 assert.deepEqual(statedFacts('Se eu disser que a escola organizou, muda algo?'),{});
 assert.deepEqual(statedFacts('A escola organizou e é grátis'),{price:'gratuito',origin:'escola'});
});

test('Dúvida informal continua dúvida',()=>{
 for(const text of ['sla, não tenho certeza','tô boiando','isso é seguro?']){
  assert.equal(readIntent(text,'prize','request',context),'doubt',text);
 }
});

test('Resultado deixa explícitos sinal, princípio e proteção sem prometer eficácia',()=>{
 const a={caller:'nino',scheme:'prize',outcome:'blocked',earned:0,item:null,steps:['Proposta apresentada'],audit:[{intent:'protect',text:'Vou conferir no canal oficial.',reason:'Orientação de verificação independente.',signal:'Prêmio inesperado e pedido de identificador.'}],ending:{actor:'character',cause:'protection',turn:1}};
 const impact=resultImpact(a);
 assert.match(impact.principle,/Prêmio não prova identidade/);
 const html=consequenceCard(a,String);
 assert.match(html,/Princípio de segurança/);
 assert.match(html,/Uma atitude que protege/);
 assert.doesNotMatch(html,/comprovadamente|efic[aá]cia medida|aprendeu/);
 const report=resultReport(a);
 assert.match(report,/Princípio:/);
 assert.match(report,/Proteção:/);
});
