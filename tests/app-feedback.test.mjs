import test from 'node:test';
import assert from 'node:assert/strict';
import {appGuidance,codeFeedback} from '../src/app-feedback.js';
import {verifyOperationCode} from '../src/app-interactions.js';

test('Orientação acompanha o item e a operação sem expor códigos ou inventar ganhos',()=>{
 const a={scheme:'prize',prepared:true,stage:'request',item:null},s={active:a};
 assert.match(appGuidance(s,'wallet').text,/certificado sozinho/);
 a.stage='ready';a.item={app:'wallet',token:'QH-DEMO-NINO-PRIZE'};
 assert.match(appGuidance(s,'wallet').title,/identificador/);
 assert.ok(!JSON.stringify(appGuidance(s,'wallet')).includes(a.item.token));
 verifyOperationCode(s,'wallet',a.item.token);
 assert.match(appGuidance(s,'wallet').text,/créditos saem do personagem/);
 a.outcome='blocked';assert.equal(appGuidance(s,'wallet').title,'Conversa encerrada');
 a.outcome='fooled';assert.equal(appGuidance(s,'wallet').title,'Créditos registrados');
 assert.match(appGuidance(s,'club').text,/Cada proposta usa um app diferente/);
 const remote={active:{scheme:'support',prepared:true,stage:'ready',item:{app:'support'}}};
 assert.match(appGuidance(remote,'support').title,/Diagnóstico/);
 remote.active.diagnostic={};assert.match(appGuidance(remote,'support').title,/Banco do Pão/);
 const update={active:{scheme:'update',prepared:true,stage:'request',fileSent:false}};
 assert.match(appGuidance(update,'update').title,/Anexo/);
 update.active.fileSent=true;assert.match(appGuidance(update,'update').text,/dados continuam protegidos/);
 update.active.item={app:'update'};update.active.reviewedData=['nickname','contact'];
 assert.match(appGuidance(update,'update').title,/1 dado falta/);
});
test('Erros distinguem campo vazio, dado real, outro código e conversa encerrada sem mudar estado',()=>{
 for(const app of ['wallet','club']){
  const a={stage:'ready',item:{app,token:'QH-DEMO-NINO-TEST'}},before=JSON.stringify(a);
  assert.match(codeFeedback(a,app,'   ').message,/campo está vazio/);
  assert.match(codeFeedback(a,app,'1234567890123456').message,/Não coloque dados reais/);
  assert.match(codeFeedback(a,app,'QH-DEMO-OUTRO-TEST').message,/trocar de personagem/);
  assert.equal(codeFeedback(a,app,' qh-demo-nino-test ').kind,'success');
  assert.equal(JSON.stringify(a),before);
  a.outcome='blocked';assert.equal(codeFeedback(a,app,a.item.token).kind,'error');
 }
});
