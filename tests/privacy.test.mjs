import test from 'node:test';
import assert from 'node:assert/strict';
import {looksPersonal,exportLocalData,clearLocalData,publicDialogueAI} from '../src/privacy-data.js';
import {evaluateTrust,polishReply} from '../src/ai-dialogue.js';
import {onRequestPost} from '../functions/api/dialogue.js';
function storage(entries){const map=new Map(entries);return {get length(){return map.size;},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,removeItem:k=>map.delete(k)};}
test('Exportação e exclusão abrangem apenas dados deste jogo',()=>{
 const s=storage([['quase-honestos-v1','{"credits":350}'],['qh-windows','{}'],['qh-message-draft','rascunho'],['outro-app','preservar']]);
 assert.equal(exportLocalData(s).data['quase-honestos-v1'].credits,350);
 assert.equal(Object.hasOwn(exportLocalData(s).data,'outro-app'),false);
 assert.equal(clearLocalData(s),3);assert.equal(s.getItem('outro-app'),'preservar');assert.equal(s.length,1);
});
test('Bloqueia formatos comuns de dados reais e preserva os códigos cenográficos',()=>{
 for(const value of ['teste@example.invalid','123.456.789-00','12345678900','(11) 91234-5678','4111 1111 1111 1111','62300-000','Rua Exemplo, 123','minha senha: segredo123','123e4567-e89b-12d3-a456-426614174000'])assert.equal(looksPersonal(value),true,value);
 for(const value of ['QH-DEMO-NINO-PRIZE','C$ 350','Pode me passar o cartão BatataPay?','Praça dos Bules · tardes'])assert.equal(looksPersonal(value),false,value);
});
test('IA pública bloqueia dados pessoais e mantém avaliação de confiança local',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('Não deve chamar');};
 try{
  const a={caller:'nino',scheme:'prize',log:[{speaker:'Você',text:'teste@example.invalid'}]},reply={text:'Fala local'};
  assert.equal(publicDialogueAI,true);assert.equal(await evaluateTrust(a,'Oi'),null);assert.equal(await polishReply(a,reply),false);
  const request=new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:'{}'});
  const response=await onRequestPost({request,env:{GEMINI_API_KEY:'test',DIALOGUE_AI_ENABLED:'false'}});assert.equal(response.status,503);assert.equal(calls,0);assert.equal(reply.text,'Fala local');
 }finally{globalThis.fetch=original;}
});
test('Dados pessoais são recusados antes de chamar o provedor experimental',async()=>{
 const request=new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify({caller:'nino',scheme:'prize',reference:'Fala local',history:[{speaker:'Você',text:'teste@example.invalid'}]})});
 const response=await onRequestPost({request,env:{DIALOGUE_AI_ENABLED:'true',DIALOGUE_PROVIDER:'gemini',DIALOGUE_ALLOW_EXPERIMENTAL_PROVIDERS:'true',GEMINI_API_KEY:'test'}});assert.equal(response.status,400);assert.equal((await response.json()).error,'personal-data');
});
