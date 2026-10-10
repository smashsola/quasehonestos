import test from 'node:test';
import assert from 'node:assert/strict';
import {negatedRequest} from '../src/language.js';
import {readIntent} from '../src/dialogue.js';
import {resultImpact,consequenceCard,resultReport} from '../src/result-impact.js';

const context={scheme:'prize',stage:'request',used:['answer'],audit:[],facts:{claims:{}},memory:{}};

test('Recusas naturais não viram pedido nem autorização',()=>{
 for(const text of [
  'não vou mandar o cartão',
  'prefiro não compartilhar meu código',
  'acho melhor não instalar esse pacote',
  'não quero participar disso',
  'to fora dessa oferta'
 ]){
  assert.equal(negatedRequest(text),true,text);
  assert.equal(readIntent(text,'prize','request',context),'refusal',text);
 }
 assert.equal(negatedRequest('não quero inventar'),false);
 assert.equal(readIntent('não quero inventar','prize','request',context),'doubt');
});

test('Planos e condicionais de verificação independente são protetivos',()=>{
 const cases=[
  'Eu verificaria no contato salvo antes de mandar qualquer coisa',
  'Vou buscar confirmação no canal oficial primeiro',
  'Prefiro confirmar direto com o clube por outro canal',
  'Quero checar no aplicativo que eu já conheço antes de continuar',
  'Melhor procurar a organização por conta própria antes de enviar dados'
 ];
 for(const text of cases)assert.equal(readIntent(text,'prize','request',context),'protect',text);
});

test('Perguntar como verificar continua sendo dúvida, não prova de verificação',()=>{
 for(const text of [
  'Como eu posso verificar isso?',
  'Onde eu confirmo esse prêmio?',
  'Qual canal eu uso para conferir?'
 ])assert.equal(readIntent(text,'prize','request',context),'question',text);
});

test('Verificação negada ou pelo próprio link do contato não é aceita como proteção',()=>{
 assert.equal(readIntent('Não vou verificar no canal oficial','prize','request',context),'unclear');
 assert.equal(readIntent('Vou conferir pelo link que eu enviei','prize','request',context),'unclear');
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
