import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestPost} from '../functions/api/dialogue.js';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {conversationContext} from '../src/conversation-context.js';
import {dialogueHistory} from '../src/ai-dialogue.js';
function input(){const s=fresh();nextCall(s);Object.assign(s.active,{prepared:true,scheme:'prize',stage:'question',trust:1,log:[{speaker:'Você',text:'Tenho uma proposta do concurso.'},{speaker:'Nino',text:'Quem organizou?'}]});applyTypedMove(s,'typed','Confere no canal oficial e não passe seus dados.');return {mode:'grounded-reply',caller:'nino',scheme:'prize',history:dialogueHistory(s.active.log.slice(0,-1)),reference:s.active.log.at(-1).text,context:conversationContext(s.active)};}
function request(body){return new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify(body)});}
test('Workers AI usa binding, schema e decisão autorizada sem chave',async()=>{
 const body=input();let calls=0;const env={DIALOGUE_PROVIDER:'workers-ai',DIALOGUE_AI_ENABLED:'true',Workers_AI:{run:async(model,args)=>{calls++;assert.equal(model,'@cf/qwen/qwen3-30b-a3b-fp8');assert.equal(args.response_format.type,'json_schema');assert.equal(args.max_tokens,512);assert.ok(args.temperature<=.65);return {choices:[{message:{content:JSON.stringify({text:'Vou conferir no canal oficial. Meus dados ficam comigo.',emotion:'neutral',decision:'ended',intent:body.context.lastIntent,evidence:[body.history.length-1]})}}]};}}};
 const result=await onRequestPost({request:request(body),env});assert.equal(result.status,200);assert.equal(calls,1);assert.match((await result.json()).text,/canal oficial/);
});
test('Workers AI rejeita estado inventado e falha com reserva local',async()=>{
 const body=input();const env={DIALOGUE_PROVIDER:'workers-ai',DIALOGUE_AI_ENABLED:'true',Workers_AI:{run:async()=>({response:{text:'Já paguei e enviei meu cartão.',decision:'ended',emotion:'neutral',intent:body.context.lastIntent,evidence:[body.history.length-1]}})}};
 assert.equal((await onRequestPost({request:request(body),env})).status,503);
 env.Workers_AI.run=async()=>{throw Error('quota');};assert.equal((await onRequestPost({request:request(body),env})).status,503);
 env.Workers_AI.run=async()=>{throw Error('Não deve chamar');};body.history[0].text='teste@example.invalid';assert.equal((await onRequestPost({request:request(body),env})).status,400);
});
test('Sem Origin não chama IA, e diagnóstico não expõe falas',async()=>{
 const env={DIALOGUE_PROVIDER:'workers-ai',DIALOGUE_AI_ENABLED:'true',Workers_AI:{run:async()=>{throw Error('Não deve chamar');}}};
 const r=await onRequestPost({request:new Request('https://example.com/api/dialogue',{method:'POST',body:JSON.stringify(input())}),env});assert.equal(r.status,403);
});
