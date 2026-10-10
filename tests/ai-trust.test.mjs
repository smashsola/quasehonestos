import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {analyzeMessage,evaluateTrust} from '../src/ai-dialogue.js';
import {onRequestPost} from '../functions/api/dialogue.js';
function start(){const state=fresh();nextCall(state);Object.assign(state.active,{scheme:'prize',prepared:true,stage:'pitch',trust:30,log:[{speaker:'Você',text:'Olá'}]});return state;}
const signals={intent:'chat',relevance:'partial',clarity:'clear',consistency:'consistent',rapport:1,pressure:false,hostility:false,uncertainty:false,verification:'none',repetition:false,topicShift:false,answersQuestion:false,evidence:[1]};
test('Avaliação semântica informa o motor; trustDelta experimental não controla a confiança nem paga',()=>{
 for(const delta of [-15,0,7,18,999]){const state=start();applyTypedMove(state,'typed','O prêmio é do concurso da Batata',{trustDelta:delta,reason:'Sugestão antiga.'});assert.equal(state.active.trust,37);assert.equal(state.active.audit[0].before,30);assert.equal(state.active.audit[0].after,state.active.trust);assert.equal(state.active.audit[0].trustSource,'local-rules');assert.equal(state.credits,0);assert.equal(state.active.item,undefined);}
});
test('Baixa confiança recusa item; agressão perde pontos e limites persistem',()=>{
 const state=start();Object.assign(state.active,{stage:'request',trust:10});applyTypedMove(state,'typed','Pode compartilhar o cartão BatataPay?',{trustDelta:-20,reason:'Modelo.'});assert.equal(state.active.item,undefined);assert.equal(state.active.stage,'question');assert.equal(state.active.trust,10);
 const angry=start();applyTypedMove(angry,'typed','Seu merda',{trustDelta:20,reason:'Modelo.'});assert.equal(angry.active.trust,6);assert.equal(angry.active.irritation,2);
 const upper=start();upper.active.trust=99;applyTypedMove(upper,'typed','Oi');assert.equal(upper.active.trust,100);const lower=start();lower.active.trust=1;applyTypedMove(lower,'typed','Seu idiota');assert.equal(lower.active.trust,0);
});
test('Sinais críticos sobrepõem uma interpretação positiva sem liberar a operação',()=>{
 for(const [flag,value,intent] of [['hostility',true,'hostile'],['pressure',true,'pressure'],['consistency','contradiction','contradiction']]){
  const state=start();
  const analysis={...signals,intent:'pitch',relevance:'relevant',rapport:0,[flag]:value};
  applyTypedMove(state,'typed','O prêmio é do concurso da Batata',analysis);
  assert.equal(state.active.lastIntent,intent);
  assert.ok(state.active.trust<30);
  assert.equal(state.active.item,undefined);
  assert.equal(state.credits,0);
 }
});
test('Sinais remotos incompatíveis não transformam cumprimento em hostilidade ou encerramento',()=>{
 const state=start();state.active.trust=50;
 for(const text of ['Oi','Olá','pdp','aham']){
  applyTypedMove(state,'typed',text,{...signals,hostility:true,pressure:true,consistency:'contradiction'});
  assert.equal(state.active.outcome,null);
  assert.equal(state.active.irritation,0);
  assert.ok(state.active.trust>=50&&state.active.trust<=53);
  assert.equal(state.active.item,undefined);
 }
});
test('Cliente envia estado anterior e aceita somente sinais válidos; falha mantém reserva',async()=>{
 const state=start(),before=JSON.stringify(state);
 const analysis=await analyzeMessage(state.active,'Oi',async(_url,options)=>{const payload=JSON.parse(options.body);assert.equal(payload.mode,'interpret');assert.equal(payload.context.trust,30);assert.equal(payload.history.at(-1).text,'Oi');return Response.json(signals);});assert.deepEqual(analysis,signals);assert.equal(JSON.stringify(state),before);
 assert.equal(await evaluateTrust(state.active,'Oi',async()=>Response.json({...signals,trustDelta:999})),null);assert.equal(await analyzeMessage(state.active,'Oi',async()=>new Response('',{status:503})),null);
});
test('Servidor retorna sinais sem pontuação e rejeita o modo antigo de controle da confiança',async()=>{
 const request=mode=>new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify({caller:'olga',scheme:'prize',mode,reference:'Interpretar',history:[{speaker:'Você',text:'Preciso disso agora'}],context:{stage:'question',trust:30}})});
 let calls=0;const env={DIALOGUE_AI_ENABLED:'true',Workers_AI:{run:async(_model,input)=>{calls++;assert.doesNotMatch(input.messages[0].content,/Retorne trustDelta/);return {response:JSON.stringify({...signals,intent:'pressure',pressure:true,evidence:[0]})};}}};
 assert.equal((await onRequestPost({request:request('trust'),env})).status,400);assert.equal(calls,0);
 const response=await onRequestPost({request:request('interpret'),env});assert.equal(response.status,200);const analysis=await response.json();assert.equal(analysis.intent,'pressure');assert.equal(Object.hasOwn(analysis,'trustDelta'),false);assert.equal(calls,1);
});
