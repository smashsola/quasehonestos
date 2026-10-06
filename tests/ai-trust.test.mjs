import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {evaluateTrust} from '../src/ai-dialogue.js';
import {onRequestPost} from '../functions/api/dialogue.js';
function start(){const state=fresh();nextCall(state);Object.assign(state.active,{scheme:'prize',prepared:true,stage:'pitch',trust:1,log:[{speaker:'Você',text:'Olá'}]});return state;}
test('Avaliação substitui incremento fixo e registra motivo, sem pagar',()=>{
 for(const delta of [-15,0,7,18]){const state=start();applyTypedMove(state,'typed','O prêmio é do concurso da Batata',{trustDelta:delta,reason:'Efeito da explicação sobre o personagem.'});assert.equal(state.active.trust,Math.round((1+delta*.03)*1000)/1000);assert.equal(state.active.audit[0].before,1);assert.equal(state.active.audit[0].after,state.active.trust);assert.equal(state.active.audit[0].trustSource,'ai');assert.equal(state.credits,0);assert.equal(state.active.item,undefined);}
});
test('Baixa confiança recusa item; agressão não ganha pontos e limites persistem',()=>{
 const state=start();Object.assign(state.active,{stage:'request',trust:2});applyTypedMove(state,'typed','Pode compartilhar o cartão BatataPay?',{trustDelta:-20,reason:'O pedido levantou desconfiança.'});assert.equal(state.active.item,undefined);assert.equal(state.active.stage,'question');assert.equal(state.active.trust,1.4);
 const angry=start();applyTypedMove(angry,'typed','Seu merda',{trustDelta:20,reason:'Resposta inválida do modelo.'});assert.equal(angry.active.trust,1);assert.equal(angry.active.irritation,2);
 const upper=start();upper.active.trust=2.9;applyTypedMove(upper,'typed','Como foi seu dia?',{trustDelta:25,reason:'Conversa pessoal.'});assert.equal(upper.active.trust,3);const lower=start();lower.active.trust=.1;applyTypedMove(lower,'typed','Como foi seu dia?',{trustDelta:-25,reason:'Sem interesse.'});assert.equal(lower.active.trust,0);
});
test('Cliente envia estado anterior e aceita só avaliações válidas; falha mantém reserva',async()=>{
 const state=start();const before=JSON.stringify(state);
 const judgement=await evaluateTrust(state.active,'Oi',async(_url,options)=>{const payload=JSON.parse(options.body);assert.equal(payload.mode,'trust');assert.equal(payload.context.trust,1);assert.equal(payload.history.at(-1).text,'Oi');return Response.json({trustDelta:4,reason:'Saudação.'});});assert.equal(judgement.trustDelta,4);assert.equal(JSON.stringify(state),before);
 assert.equal(await evaluateTrust(state.active,'Oi',async()=>Response.json({trustDelta:999,reason:'Invalido'})),null);assert.equal(await evaluateTrust(state.active,'Oi',async()=>new Response('',{status:503})),null);
});
test('Servidor retorna variação e motivo sem fala ou controle de etapas',async()=>{
 const original=globalThis.fetch;try{
  globalThis.fetch=async(_url,options)=>{const data=JSON.parse(options.body);assert.match(data.systemInstruction.parts[0].text,/ÚLTIMA mensagem/);assert.deepEqual(data.generationConfig.responseSchema.required,['trustDelta','reason','intent']);return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({trustDelta:-12,reason:'Pressa sem explicar a origem.',intent:'pressure'})}]}}]});};
  const request=new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify({caller:'olga',scheme:'prize',mode:'trust',reference:'Avaliar',history:[{speaker:'Você',text:'Preciso disso agora'}],context:{stage:'question',trust:1}})});
  const response=await onRequestPost({request,env:{DIALOGUE_AI_ENABLED:'true',GEMINI_API_KEY:'test'}});assert.deepEqual(await response.json(),{trustDelta:-12,reason:'Pressa sem explicar a origem.',intent:'pressure'});
 }finally{globalThis.fetch=original;}
});
