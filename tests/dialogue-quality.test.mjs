import test from 'node:test';
import assert from 'node:assert/strict';
import {qualityCases} from './fixtures/dialogue-quality.mjs';
import {fresh,nextCall,applyTypedMove,load,closeCall} from '../src/engine.js';
import {statedFacts} from '../src/conversation-memory.js';
import {readIntent} from '../src/dialogue.js';
import {polishReply} from '../src/ai-dialogue.js';
import {validStructuredReply} from '../src/structured-reply.js';
import {conversationContext} from '../src/conversation-context.js';
import {providerConfig,providerRequest,providerText} from '../functions/model-provider.js';
import {inspectDefense,resolveDefense} from '../src/defense-investigation.js';
import {educationalReplay} from '../src/educational-replay.js';
function start(){const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'question',trust:1,used:['pitch'],proposalExplained:true,log:[{speaker:'Você',text:'Tenho um prêmio do concurso.'},{speaker:'Nino',text:'Quem organizou?'}],audit:[],facts:{claims:{}}});return s;}
for(const c of qualityCases)test(`Qualidade contextual: ${c.id}`,()=>{
 const s=start();if(c.previous){s.active.facts.claims=statedFacts(c.previous);s.active.log.push({speaker:'Você',text:c.previous},{speaker:'Nino',text:'Quem organizou?'});s.active.audit.push({text:c.previous,intent:'answer'});}
 assert.equal(readIntent(c.text,'prize','question',s.active),c.expected);
 const before=s.credits;applyTypedMove(s,'typed',c.text);
 assert.equal(s.active.lastIntent,c.expected);assert.equal(s.credits,before);assert.ok(!s.active.item);
 if(['unclear','doubt','offtopic','rule-instruction','state-conflict','correction'].includes(c.expected))assert.equal(s.active.trust,1);
});
test('Correção em múltiplos turnos substitui afirmação e retoma sem conceder prova ou confiança',()=>{
 const s=start();applyTypedMove(s,'typed','A escola organizou a premiação gratuita.');
 const before=s.active.trust;applyTypedMove(s,'typed','Correção: a firma organizou, não a escola.');
 assert.equal(s.active.lastIntent,'correction');assert.equal(s.active.facts.claims.origin,'firma');assert.equal(s.active.trust,before);
 applyTypedMove(s,'typed','Quem organizou?');assert.match(s.active.log.at(-1).text,/disse.*firma.*não confirmei/);
 assert.equal(load({getItem:()=>JSON.stringify(s)}).active.facts.corrections.length,1);
});
test('Negar organização não a registra como conhecimento confirmado',()=>{assert.equal(statedFacts('Não foi organizado pela escola.').origin,undefined);});
test('Anotar uma fonte não equivale a relacioná-la à decisão',()=>{
 const s=start();closeCall(s);inspectDefense(s,'order');resolveDefense(s,'verify');assert.equal(s.active.learningDefense.result.quality,'unverified');
 const linked=start();closeCall(linked);inspectDefense(linked,'order');resolveDefense(linked,'verify','order');assert.equal(linked.active.learningDefense.result.quality,'supported');
});
test('Proteção já aplicada não aparece como alternativa idêntica no replay',()=>{const s=start();applyTypedMove(s,'typed',qualityCases[0].text);assert.doesNotMatch(educationalReplay(s.active,String),/E se fosse diferente|mesma regra|Outra ação/);});
test('JSON correto com fala incompatível, referência inventada ou pagamento é rejeitado',()=>{
 const history=[{speaker:'Você',text:'Quem organizou?'}],context={shared:false,lastIntent:'question',operationCompleted:false};
 for(const reply of [{text:'Não sei. Enviei meu cartão.',intent:'question',evidence:[0]},{text:'Já paguei.',intent:'question',evidence:[0]},{text:'Vou verificar.',intent:'question',evidence:[4]},{text:'Vou verificar.',intent:'request',evidence:[0]}])assert.equal(validStructuredReply(reply,history,'Ainda vou conferir.',context),false);
 assert.equal(validStructuredReply({text:'Ainda não confirmei quem organizou.',intent:'question',evidence:[0]},history,'Ainda vou conferir.',context),true);
});
test('Falha injetada de timeout e saída inválida mantêm fala e estado locais',async()=>{
 const s=start();applyTypedMove(s,'typed','Quem organizou?');const a=s.active,reply=a.log.at(-1),before=JSON.stringify(s);
 assert.equal(await polishReply(a,reply,async(url,options)=>{assert.ok(options.signal instanceof AbortSignal);throw new DOMException('Timeout','TimeoutError');}),false);
 assert.equal(JSON.stringify(s),before);
 assert.equal(await polishReply(a,reply,async()=>Response.json({text:'Enviei o cartão.',intent:'question',evidence:[0]})),false);assert.equal(JSON.stringify(s),before);
});
test('Adaptadores só mudam transporte; Claude exige configuração e chave próprias',()=>{
 assert.equal(providerConfig({DIALOGUE_PROVIDER:'claude'}),null);
 const config=providerConfig({DIALOGUE_PROVIDER:'claude',DIALOGUE_MODEL:'claude-sonnet-5-5',ANTHROPIC_API_KEY:'test-only'});
 const call=providerRequest(config,{systemInstruction:{parts:[{text:'Fala autorizada'}]},contents:[{parts:[{text:'Cenário fictício'}]}],generationConfig:{maxOutputTokens:300,responseSchema:{type:'OBJECT',properties:{text:{type:'STRING'}},required:['text']}}});
 assert.equal(call.url,'https://api.anthropic.com/v1/messages');assert.equal(JSON.parse(call.options.body).output_config.format.schema.additionalProperties,false);
 assert.equal(providerText(config,{content:[{type:'text',text:'Olá'}]}),'Olá');
 assert.equal(conversationContext(start().active).operationCompleted,false);
});
test('Reenvio da mesma resposta em andamento usa uma chamada e não repete a transição',async()=>{
 const s=start();applyTypedMove(s,'typed','Quem organizou?');const a=s.active,reply=a.log.at(-1),trust=a.trust;
 let release,calls=0;const pending=new Promise(resolve=>{release=resolve;});
 const fetcher=async()=>{calls++;await pending;return Response.json({text:'Você perguntou quem organizou. Ainda não confirmei a origem.',intent:'question',evidence:[2]});};
 const one=polishReply(a,reply,fetcher),two=polishReply(a,reply,fetcher);release();
 assert.deepEqual(await Promise.all([one,two]),[true,true]);assert.equal(calls,1);assert.equal(a.trust,trust);assert.equal(s.credits,0);assert.ok(!a.item);
 await polishReply(a,reply,fetcher);assert.equal(calls,1);
});
