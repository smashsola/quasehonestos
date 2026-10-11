import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeMessage,polishReply,dialogueDiagnostic,dialogueHistory} from '../src/ai-dialogue.js';
import {replyIsGrounded} from '../src/dialogue-model-rules.js';
import {failureMetadata} from '../src/dialogue-diagnostics.js';
import {providerText} from '../functions/model-provider.js';
import {onRequestPost} from '../functions/api/dialogue.js';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {conversationContext} from '../src/conversation-context.js';
const active=()=>({caller:'nino',scheme:'prize',stage:'question',trust:30,log:[{speaker:'Você',text:'Tenho uma proposta.'},{speaker:'Nino',text:'Quem organizou?'}]});
const semantic={intent:'question',rapport:0,relevance:'relevant',clarity:'clear',consistency:'consistent',verification:'none',pressure:false,hostility:false,uncertainty:false,repetition:false,topicShift:false,answersQuestion:false,evidence:[2]};
test('Erros de quota e capacidade dependem do código, não de atribuição por suposição',()=>{
 assert.deepEqual(failureMetadata(Object.assign(Error('AI_ERROR: 3036'),{code:3036})),{code:3036,reason:'quota'});
 assert.deepEqual(failureMetadata(Error('AI_ERROR: 3040')),{code:3040,reason:'capacity'});
 assert.equal(failureMetadata(Error('qualquer frase ruim')).reason,'provider-unavailable');
 assert.equal(failureMetadata(new DOMException('tempo','TimeoutError')).reason,'timeout');
});
test('Uma falha de interpretação impede a segunda chamada; diagnóstico não contém texto',async()=>{
 for(const [code,reason]of [[3036,'quota'],[3040,'capacity']]){
  const a=active(),reply={speaker:'Nino',text:'Eu buscaria outra confirmação.'};let calls=0;
  const fetcher=async()=>{calls++;return Response.json({error:'unavailable',code,diagnostic:reason},{status:503});};
  assert.equal(await analyzeMessage(a,'Como você verificaria?',fetcher),null);assert.equal(await polishReply(a,reply,fetcher),false);assert.equal(calls,1);
  const d=dialogueDiagnostic(reply);assert.equal(d.code,code);assert.equal(d.reason,reason);assert.equal(d.calls,0);assert.doesNotMatch(JSON.stringify(d),/Como|confirmacao|history|log|secret|text/);
 }
});
test('Interpretação concorrente é deduplicada e mudança de personagem invalida resposta atrasada',async()=>{
 const a=active();let release,calls=0;const fetcher=async()=>{calls++;await new Promise(r=>release=r);return Response.json(semantic);};
 const one=analyzeMessage(a,'Como conferir?',fetcher),two=analyzeMessage(a,'Como conferir?',fetcher);assert.equal(one,two);a.caller='olga';release();assert.equal(await one,null);assert.equal(calls,1);assert.equal(dialogueDiagnostic(a).reason,'stale');
});
test('Histórico não envia instruções do Sistema ou personagem de outra conversa',()=>{
 assert.deepEqual(dialogueHistory([{speaker:'Sistema',text:'Tutorial'},{speaker:'Olga',text:'Outra conversa'},{speaker:'Você',text:'Oi'},{speaker:'Nino',text:'Olá'}],12,'Nino'),[{speaker:'Você',text:'Oi'},{speaker:'Nino',text:'Olá'}]);
});

test('Parsing, resposta vazia e falha do validador têm diagnósticos diferentes',async()=>{
 for(const [response,reason]of [[new Response('{',{status:200}),'parsing'],[Response.json(null),'empty'],[Response.json({...semantic,evidence:[]}),'validation']]){
  const a=active();assert.equal(await analyzeMessage(a,'Como conferir?',async()=>response),null);
  assert.equal(dialogueDiagnostic(a).reason,reason);
 }
});

test('Polimento concorrente não duplica chamada e resposta de missão antiga não é aplicada',async()=>{
 const a=active(),reply={speaker:'Nino',text:'Qual é a proposta?'};a.log.push({speaker:'Você',text:'Oi'},reply);
 let release,calls=0;const fetcher=async()=>{calls++;await new Promise(r=>release=r);return Response.json({text:'Olá, qual é a proposta?',emotion:'neutral'});};
 const one=polishReply(a,reply,fetcher),two=polishReply(a,reply,fetcher);assert.equal(one,two);
 a.scheme='club';release();assert.equal(await one,false);assert.equal(calls,1);assert.equal(reply.text,'Qual é a proposta?');assert.equal(dialogueDiagnostic(reply).reason,'stale');
});
test('Uma negativa sem alternativa não responde a verificação; fatos necessários podem reaparecer',()=>{
 const history=[{speaker:'Você',text:'Como você verificaria sem depender de mim?'}],context=conversationContext(active());
 assert.equal(replyIsGrounded('Eu não tenho contato fora dessa conversa.',history,'',context),false);
 assert.equal(replyIsGrounded('Eu buscaria um canal já conhecido ou pediria ajuda; até confirmar, não enviaria dados.',history,'',context),true);
 const memory={...context,facts:{claims:{benefit:'uma caneca',deadline:'amanha'}}};
 assert.equal(replyIsGrounded('Quem organizou?',[{speaker:'Você',text:'Qual benefício eu tinha prometido e qual era o prazo?'}],'',memory),false);
 assert.equal(replyIsGrounded('Você disse uma caneca e prazo amanhã; isso ainda não foi confirmado.',[{speaker:'Você',text:'Qual benefício eu tinha prometido e qual era o prazo?'}],'',memory),true);
});
test('Near duplicate é rejeitado sem retirar o direito de recordar fatos',()=>{
 const history=[{speaker:'Nino',text:'Ainda quero entender quem organiza esse concurso antes de decidir sobre o meu cartão.'},{speaker:'Você',text:'Como funciona?'}];
 assert.equal(replyIsGrounded('Ainda quero entender quem organiza esse concurso antes de decidir sobre meu cartão.',history,'',conversationContext(active())),false);
});

test('Repetir fatos quando o jogador pede uma recordação é permitido',()=>{
 const text='Você disse uma caneca e prazo amanhã; isso ainda não foi confirmado.';
 const history=[{speaker:'Nino',text},{speaker:'Você',text:'Você lembra do benefício e do prazo?'}];
 const context={...conversationContext(active()),facts:{claims:{benefit:'uma caneca',deadline:'amanha'}}};
 assert.equal(replyIsGrounded(text,history,'',context),true);
});
test('Qwen separa saída vazia, raciocínio e truncamento',()=>{
 const config={provider:'workers-ai'};
 assert.equal(providerText(config,{}),'');assert.equal(providerText(config,{response:'<think>raciocínio</think>{"text":"Oi"}'}),'{"text":"Oi"}');
 assert.throws(()=>providerText(config,{choices:[{finish_reason:'length',message:{content:'{"text":"'}}]}),/truncated/);
});
test('Backend mantém metadados seguros e papéis reais; fala atual aparece uma vez',async()=>{
 const a=active(),history=[...a.log,{speaker:'Você',text:'Como você verificaria?'}],payload={mode:'interpret',caller:'nino',scheme:'prize',history,reference:'Somente interpretação',context:conversationContext(a)};
 const request=()=>new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify(payload)});
 const env={DIALOGUE_AI_ENABLED:'true',Workers_AI:{run:async(_model,args)=>{assert.deepEqual(args.messages.map(m=>m.role),['system','user','assistant','user']);assert.equal(args.messages.filter(m=>m.content===history.at(-1).text).length,1);assert.equal(args.response_format.json_schema.properties.evidence.minItems,1);assert.deepEqual(args.response_format.json_schema.properties.evidence.items.enum,[0,2]);return {response:semantic};}}};
 assert.equal((await onRequestPost({request:request(),env})).status,200);
 for(const code of [3036,3040]){env.Workers_AI.run=async()=>{throw Object.assign(Error('Não registrar esta mensagem'),{code});};const response=await onRequestPost({request:request(),env});const data=await response.json();assert.equal(data.code,code);assert.equal(data.diagnostic,code===3036?'quota':'capacity');assert.doesNotMatch(JSON.stringify(data),/registrar|Como|proposta/);}
});
test('Memória antiga sobrevive ao recorte recente sem virar verificação',()=>{
 const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'question',log:[]});applyTypedMove(s,'typed','O benefício é uma caneca. O prazo é amanhã.');
 for(let i=0;i<8;i++)applyTypedMove(s,'typed','Como funciona esse detalhe '+i+'?');
 const context=conversationContext(s.active);assert.equal(context.facts.claims.benefit,'uma caneca');assert.equal(context.facts.claims.deadline,'amanha');assert.equal(context.independentlyVerified,false);
 applyTypedMove(s,'typed','Qual benefício eu tinha prometido e qual era o prazo?');assert.match(s.active.log.at(-1).text,/caneca.*amanha/);assert.equal(s.credits,0);
});
