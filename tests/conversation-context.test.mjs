import test from 'node:test';
import assert from 'node:assert/strict';
import {characterProfiles,conversationContext,replyDecision,nextObjective} from '../src/conversation-context.js';
import {onRequestPost} from '../functions/api/dialogue.js';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';

test('Contexto mantém etapa, memória e limites; orientação cita o item correto',()=>{
 assert.equal(new Set(Object.values(characterProfiles)).size,6);
 const context=conversationContext({stage:'request',trust:99,irritation:2,memory:{free:true}});
 assert.equal(context.trust,3);assert.equal(context.promisedFree,true);assert.equal(replyDecision(context),'consider');
 assert.equal(replyDecision(conversationContext({stage:'ready',item:{}})),'shared');
 assert.equal(replyDecision(conversationContext({outcome:'blocked'})),'ended');
 assert.match(nextObjective({scheme:'prize',stage:'request'}),/cartão fictício.*Carteira/);
 assert.match(nextObjective({scheme:'support',stage:'request'}),/Torradeira/);
});
test('IA não transforma uma etapa pendente em aceitação e recebe a personalidade correta',async()=>{
 const original=globalThis.fetch;
 try{
  for(const reply of [{text:'Eu aceito, pode mandar!',decision:'consider'},{text:'Estou ouvindo.',decision:'shared'}]){
   globalThis.fetch=async(_url,options)=>{
    const payload=JSON.parse(options.body);assert.match(payload.systemInstruction.parts[0].text,/Analítica e atenta/);assert.match(payload.systemInstruction.parts[0].text,/promisedFree/);
    assert.deepEqual(payload.generationConfig.responseSchema.properties.decision.enum,['consider']);
    return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(reply)}]}}]});
   };
   const data={caller:'pri',scheme:'prize',history:[],reference:'Ainda preciso entender o pedido.',context:conversationContext({stage:'request',memory:{free:true}})};
   const request=new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify(data)});
   assert.equal((await onRequestPost({request,env:{DIALOGUE_AI_ENABLED:'true',DIALOGUE_PROVIDER:'gemini',DIALOGUE_ALLOW_EXPERIMENTAL_PROVIDERS:'true',GEMINI_API_KEY:'test'}})).status,503);
  }
 }finally{globalThis.fetch=original;}
});
test('Ofensas observadas no jogo têm consequência sem liberar itens',()=>{
 const state=fresh();nextCall(state);Object.assign(state.active,{scheme:'prize',prepared:true,stage:'request',trust:2,log:[]});
 applyTypedMove(state,'typed','Seu merda');assert.equal(state.active.irritation,2);assert.equal(state.active.item,undefined);
 applyTypedMove(state,'typed','NAO SEU BOSTA');assert.equal(state.active.outcome,'blocked');assert.equal(state.active.stage,'done');assert.equal(state.credits,0);
});
