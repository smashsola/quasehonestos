import {prepareOperation} from './prepare-operation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,answerDefense,closeCall,finishCall,load,executeScheme} from '../src/engine.js';
import {defenseScenes} from '../src/dialogue.js';
function start(scheme='prize'){const s=fresh();nextCall(s);Object.assign(s.active,{scheme,prepared:true,stage:'pitch',log:[{speaker:'Nino',text:'Oi'}]});return s;}
test('Letras, saudações repetidas e assuntos soltos não liberam item',()=>{
 const s=start();applyTypedMove(s,'typed','oi');assert.equal(s.active.trust,1);
 for(const text of ['oi','a','e]','Quero te vender algo...','Pode me passar seu cartão?'])applyTypedMove(s,'typed',text);
 assert.equal(s.active.stage,'pitch');assert.equal(s.active.trust,1);assert.equal(s.active.item,undefined);assert.equal(s.credits,0);assert.equal(s.active.audit.length,6);
});
test('Todas as propostas exigem explicação, dúvida respondida e pedido contextual',()=>{
 const cases={prize:['Queria apresentar o prêmio da Batata Dourada','A firma organizou o concurso de batatas','Pode compartilhar seu cartão fictício?'],support:['Tenho suporte para seu PãoOS','A assistência da firma organizou o serviço de PãoOS','Pode abrir a sessão de PãoOS?'],club:['Tenho um convite do Clube da Colher','O clube organizou a associação de talheres','Pode compartilhar seu passe?']};
 for(const [scheme,lines] of Object.entries(cases)){
  const s=start(scheme);applyTypedMove(s,'typed',lines[0]);assert.equal(s.active.stage,'question');
  applyTypedMove(s,'typed','abc');assert.equal(s.active.stage,'question');assert.equal(s.active.trust,1);
  applyTypedMove(s,'typed',lines[1]);assert.equal(s.active.stage,'request');
  applyTypedMove(s,'typed','a');assert.equal(s.active.item,undefined);
  applyTypedMove(s,'typed',lines[2]);assert.equal(s.active.stage,'ready');assert.equal(s.credits,0);
  prepareOperation(s);assert.equal(executeScheme(s,s.active.item.app),true);
 }
});
test('Contradições e agressão têm consequências e defesa preserva saldo',()=>{
 const s=start();applyTypedMove(s,'typed','Prêmio da Batata');applyTypedMove(s,'typed','Vamos falar do clube da colher');assert.equal(s.active.trust,.5);assert.equal(s.active.suspicion,1);
 applyTypedMove(s,'typed','te odeio');assert.equal(s.active.outcome,null);applyTypedMove(s,'typed','cala a boca');assert.equal(s.active.outcome,'blocked');assert.equal(s.active.item,null);
 const credits=s.credits;assert.equal(answerDefense(s,'check'),true);assert.equal(s.active.defenseRound.safe,true);assert.equal(answerDefense(s,'send'),false);assert.equal(s.credits,credits);
 finishCall(s);const restored=load({getItem:()=>JSON.stringify(s)});assert.equal(restored.history[0].audit.length,4);assert.equal(restored.history[0].defenseRound.safe,true);
});
test('Rodada de defesa explica escolhas arriscadas e aceita apenas após encerramento',()=>{
 for(const scheme of Object.keys(defenseScenes)){
  const s=start(scheme);const wrong=defenseScenes[scheme].choices.find(c=>!c.safe);assert.equal(answerDefense(s,wrong.id),false);closeCall(s);
  assert.equal(answerDefense(s,'unknown'),false);assert.equal(answerDefense(s,wrong.id),true);assert.equal(s.active.defenseRound.safe,false);assert.ok(s.active.defenseRound.feedback);assert.equal(s.credits,0);
 }
});
