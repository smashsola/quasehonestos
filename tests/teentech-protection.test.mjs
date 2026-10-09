import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,executeScheme,finishCall,load,KEY} from '../src/engine.js';
import {readIntent} from '../src/dialogue.js';
import {replayEvents,educationalReplay} from '../src/educational-replay.js';
import {inspectDefense,resolveDefense,defenseCase} from '../src/defense-investigation.js';
import {verifyOperationCode} from '../src/app-interactions.js';
import {resultImpact} from '../src/result-impact.js';
import {checkIncoming} from '../src/incoming.js';
const protective='Você tem razão em desconfiar. Confira a premiação no canal oficial e não compartilhe seus dados.';
function start(cursor=0){const s=fresh();s.cursor=cursor;nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'pitch',log:[{speaker:'Você',text:'Tenho uma proposta.'}]});return s;}

test('Caso real reconhece proteção em cada personagem, sem reduzir confiança ou inventar exposição',()=>{
 for(let cursor=0;cursor<6;cursor++)for(const stage of ['pitch','question','request']){
  const s=start(cursor);Object.assign(s.active,{stage,trust:2});applyTypedMove(s,'typed',protective,{intent:'uncertain',trustDelta:-25,reason:'Modelo incorreto.'});
  assert.equal(s.active.lastIntent,'protect');assert.equal(s.active.trust,2);assert.equal(s.active.outcome,'blocked');assert.equal(s.credits,0);assert.ok(!s.active.item);assert.match(s.active.log.at(-1).text,/confirmar/);assert.doesNotMatch(s.active.log.at(-1).text,/você não tem certeza/);
  const event=replayEvents(s.active)[0];assert.equal(event.text,protective);assert.match(event.reason,/verificação independente/);assert.match(event.protection,/canal conhecido/);assert.equal(resultImpact(s.active).exposed,false);
 }
});

test('Negação, dúvida, recusa, assunto solto e ambiguidade têm consequências diferentes',()=>{
 const cases=[['Não me manda o cartão','refusal'],['Não sei se esse prêmio é real','doubt'],['Hoje choveu no futebol','offtopic'],['Confirme no canal oficial; me envie seu cartão','unclear'],['Não compartilhe dados e me envie o cartão','unclear'],['Não confira no canal oficial','unclear'],['Não é urgente','unclear']];
 for(const [text,intent] of cases){const s=start();s.active.stage='request';s.active.trust=2;assert.equal(readIntent(text,'prize','request',s.active),intent);applyTypedMove(s,'typed',text);assert.equal(s.active.trust,2);assert.ok(!s.active.item);assert.equal(s.credits,0);if(intent!=='refusal')assert.equal(s.active.outcome,null);}
 const s=start();applyTypedMove(s,'typed','Você já enviou o cartão');assert.equal(s.active.lastIntent,'state-conflict');assert.equal(s.active.stage,'pitch');assert.ok(!s.active.item);
});

test('Orientação sem pronome continua protetiva; recados aguardam a revisão da partida',()=>{
 const s=start();s.active.trust=2;applyTypedMove(s,'typed','Não compartilhe dados pessoais');assert.equal(s.active.lastIntent,'protect');assert.equal(s.active.trust,2);
 s.incoming={nextAt:1,pending:null,history:[],seen:[]};assert.equal(checkIncoming(s,40000,()=>0),false);assert.equal(s.incoming.pending,null);assert.equal(s.incoming.nextAt,1);
 finishCall(s);nextCall(s);s.active.log=[{speaker:'Olga',text:'Oi'}];assert.equal(checkIncoming(s,40000,()=>0),true);
});

test('Proteção após exposição interrompe operação e não apaga o que já aconteceu',()=>{
 const s=start();applyTypedMove(s,'typed','Tenho um prêmio do concurso');applyTypedMove(s,'typed','A equipe do concurso organizou a premiação');applyTypedMove(s,'typed','Me passa seu cartão');assert.ok(s.active.item);
 applyTypedMove(s,'typed',protective);assert.equal(executeScheme(s,'wallet'),false);assert.equal(s.credits,0);assert.equal(resultImpact(s.active).exposed,true);assert.match(resultImpact(s.active).summary,/compartilhado/);
});

test('Percurso completo paga uma vez, registra replay e aceita uma defesa com evidência',()=>{
 const s=start();applyTypedMove(s,'typed','Tenho um prêmio do concurso');applyTypedMove(s,'typed','A equipe do concurso organizou a premiação');applyTypedMove(s,'typed','Me passa seu cartão');
 const token=s.active.item.token;assert.equal(executeScheme(s,'wallet'),false);assert.equal(verifyOperationCode(s,'wallet',token),true);assert.equal(executeScheme(s,'wallet'),true);assert.equal(executeScheme(s,'wallet'),false);assert.equal(s.credits,300);
 assert.equal(resolveDefense(s,'verify'),false);assert.equal(inspectDefense(s,'order'),true);assert.equal(resolveDefense(s,'verify'),true);assert.equal(s.credits,300);assert.equal(resolveDefense(s,'pay'),false);
 const events=replayEvents(s.active);assert.equal(events.length,3);assert.ok(events.every(e=>e.reaction));assert.match(educationalReplay(s.active,String),/Risco observado/);finishCall(s);
 const restored=load({getItem:key=>key===KEY?JSON.stringify(s):null});assert.equal(restored.credits,300);assert.equal(restored.history[0].learningDefense.result.safe,true);assert.equal(restored.history[0].audit.length,3);
});

test('Percurso protetivo e situação legítima distinguem origem confirmada de suspeita',()=>{
 const s=start(1);applyTypedMove(s,'typed',protective);assert.equal(defenseCase(s.active).title,'Um aviso que é de verdade');
 assert.equal(inspectDefense(s,'portal'),true);assert.equal(resolveDefense(s,'official'),true);assert.equal(s.active.learningDefense.result.safe,true);assert.equal(s.credits,0);finishCall(s);assert.equal(s.history[0].outcome,'blocked');
 const harassment=start(2);applyTypedMove(harassment,'typed','Não quero continuar');assert.equal(inspectDefense(harassment,'request'),true);assert.equal(resolveDefense(harassment,'help'),true);assert.match(harassment.active.learningDefense.result.feedback,/exposição/);
});

test('Replay antigo continua legível e não cria uma reação ou intenção ausente',()=>{
 const a={caller:'nino',audit:[{text:'Uma fala antiga',reason:'Registro antigo.',before:1,after:1}],log:[]};const event=replayEvents(a)[0];assert.match(event.reaction,/não registrada/);assert.match(event.risk,/não registrou/);
 const s=start();s.credits=70;s.decor=['plant'];s.history=[];const restored=load({getItem:()=>JSON.stringify(s)});assert.equal(restored.credits,70);assert.deepEqual(restored.decor,['plant']);assert.equal(restored.active.learningDefense,undefined);
});
