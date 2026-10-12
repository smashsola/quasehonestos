import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {analyzeTurn,polishReply,dialogueDiagnostic} from '../src/ai-dialogue.js';
import {buildTurnRequest,turnRequestContext,simpleLocalMessage} from '../src/dialogue-turn.js';
import {conversationContext,replyDecision} from '../src/conversation-context.js';
import {failureMetadata} from '../src/dialogue-diagnostics.js';
import {createQuotaCircuit,nextQuotaReset} from '../src/dialogue-quota.js';
import {confirmServerQuota,serverQuotaRemaining} from '../functions/dialogue-quota.js';
import {singleTurn} from '../functions/dialogue-turn.js';
import {tokenMetrics} from '../functions/dialogue-metrics.js';
const active=()=>{const s=fresh();nextCall(s);Object.assign(s.active,{caller:'nino',scheme:'prize',stage:'pitch',prepared:true,trust:35,log:[{speaker:'Você',text:'Tenho um prêmio de desenho.'},{speaker:'Nino',text:'O que eu ganharia?'}]});return s;};
const analysis={intent:'question',relevance:'relevant',clarity:'clear',consistency:'consistent',rapport:0,pressure:false,hostility:false,uncertainty:false,verification:'hypothetical',repetition:false,topicShift:false,answersQuestion:false,evidence:[2]};
const message='Como você verificaria sem depender de mim?';
function bundle(s,text=message){const simulated=structuredClone(s);applyTypedMove(simulated,'typed',text,analysis);return {analysis,candidate:{text:simulated.active.log.at(-1).text,emotion:'neutral',decision:replyDecision(conversationContext(simulated.active)),intent:simulated.active.lastIntent,evidence:[2]}};}
for(const invalid of [false,'decision','fabricated-action','ignored-question'])test(`Uma chamada, autoridade do motor e candidato ${invalid||'compatível'} (binding simulado)`,async()=>{
 const s=active(),b=bundle(s);if(invalid==='decision')b.candidate.decision='shared';if(invalid==='fabricated-action')b.candidate.text='Já recebi o cartão e retirei os créditos.';if(invalid==='ignored-question')b.candidate.text='Quem organizou esse concurso?';let calls=0;
 const fetcher=async(_url,options)=>{calls++;const request=JSON.parse(options.body);assert.equal(request.mode,'turn');assert.equal(request.history.filter(m=>m.text===message).length,1);assert.equal(request.context.facts?.ledger,undefined);return Response.json(b,{headers:{'X-Dialogue-Calls':'1','X-Dialogue-Model':'@cf/qwen/qwen3-30b-a3b-fp8'}});};
 const before=JSON.stringify(s);const a=await analyzeTurn(s.active,message,fetcher);assert.equal(JSON.stringify(s),before);assert.ok(a);applyTypedMove(s,'typed',message,a);const reply=s.active.log.at(-1),local=reply.text;
 const accepted=await polishReply(s.active,reply,fetcher);assert.equal(accepted,!invalid);assert.equal(calls,1);assert.equal(s.credits,0);assert.ok(!s.active.item);assert.equal(s.active.outcome,null);if(invalid)assert.equal(reply.text,local);
});
test('Saudação inteira é local, mas saudação/riso numa pergunta composta usa interpretação',async()=>{
 for(const text of ['oi','obrigado!','kkk, qual nome eu disse?','oi, como você verificaria?']){
  const s=active();let calls=0;await analyzeTurn(s.active,text,async()=>{calls++;return Response.json(bundle(s,text));});assert.equal(calls,simpleLocalMessage(text)?0:1,text);
 }
 for(const text of ['oi, o frete custa C$40','valeu, mas não quero enviar dados','kkk por que meu cartão seria perigoso?'])assert.equal(simpleLocalMessage(text),false);
});
test('Concorrência não envia duas vezes; resposta de outra missão é descartada',async()=>{
 const s=active();let finish,calls=0;const fetcher=()=>{calls++;return new Promise(resolve=>finish=resolve);};const first=analyzeTurn(s.active,message,fetcher),same=analyzeTurn(s.active,message,fetcher);assert.equal(first,same);s.active.caller='olga';finish(Response.json(bundle(active())));assert.equal(await first,null);assert.equal(calls,1);assert.equal(dialogueDiagnostic(s.active).reason,'stale');
});
test('Memória compacta preserva fatos antigos com fonte, sem ledger duplicado',()=>{
 const s=active();applyTypedMove(s,'typed','Pode me chamar de Lia. O envio custa C$23.');for(let i=0;i<12;i++)applyTypedMove(s,'typed','Pode confiar.');
 const context=conversationContext(s.active),wire=turnRequestContext(context);assert.equal(wire.facts.claims.alias,'Lia');assert.equal(wire.facts.ledger,undefined);
 const history=[s.active.log[0],s.active.log[1],{speaker:'Você',text:'Qual nome eu disse e como verificaria?'}],body=buildTurnRequest(context,history),system=body.messages[0].content;
 assert.match(system,/Lia/);assert.match(system,/player-message/);assert.match(system,/claim/);assert.equal(body.messages.at(-1).role,'user');assert.equal(body.messages.filter(m=>m.content===history.at(-1).text).length,1);assert.equal(body.generationConfig.maxOutputTokens,384);
});
test('Erros confirmados e ambiguidades do provedor continuam distintos',()=>{
 assert.equal(failureMetadata({code:3036}).reason,'quota');assert.equal(failureMetadata({code:4006,message:'AiError: you have used up your daily free allocation of 10,000 neurons'}).reason,'quota');assert.equal(failureMetadata({code:4006,message:'unknown provider failure'}).reason,'provider-unavailable');assert.equal(failureMetadata({code:3040}).reason,'capacity');assert.equal(failureMetadata({name:'TimeoutError'}).reason,'timeout');assert.equal(failureMetadata({name:'AbortError'}).reason,'aborted');
});
test('Cota no navegador expira em UTC, funciona sem storage e não memoriza capacidade',()=>{
 let now=Date.parse('2026-10-12T23:59:00Z');const store={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}},c=createQuotaCircuit(store,()=>now);assert.equal(c.confirm('capacity'),0);assert.equal(c.remaining(),0);c.confirm('quota');assert.equal(c.remaining(),nextQuotaReset(now));now+=61000;assert.equal(c.remaining(),0);
});
test('Uma falha não bloqueia outros jogadores; duas cotas explícitas protegem o isolate até UTC',()=>{
 const binding={},now=Date.parse('2026-10-12T05:00:00Z');assert.equal(confirmServerQuota(binding,'timeout',now),0);assert.equal(confirmServerQuota(binding,'quota',now),0);assert.equal(serverQuotaRemaining(binding,now),0);assert.equal(confirmServerQuota(binding,'quota',now),nextQuotaReset(now));assert.equal(serverQuotaRemaining({},now),0);assert.equal(serverQuotaRemaining(binding,nextQuotaReset(now)),0);
});
test('Tokens indisponíveis não são apresentados como zero',()=>{
 assert.deepEqual(tokenMetrics({}),{inputTokens:null,outputTokens:null});assert.deepEqual(tokenMetrics({usage:{prompt_tokens:123,completion_tokens:0}}),{inputTokens:123,outputTokens:0});
});
test('Endpoint faz uma inferência; formato, vazio e parsing têm causas específicas (binding simulado)',async()=>{
 for(const [output,expected]of [['', 'empty'],['{','parsing'],['{}','semantics'],[JSON.stringify(bundle(active())),null]]){
  let calls=0;const config={provider:'workers-ai',model:'@cf/qwen/qwen3-30b-a3b-fp8',binding:{run:async(_model,args)=>{calls++;assert.deepEqual(args.messages.slice(1).map(m=>m.role),['user','assistant','user']);return {choices:[{message:{content:output}}],usage:{prompt_tokens:500,completion_tokens:120}};}}};
  const s=active(),response=await singleTurn({history:[...s.active.log,{speaker:'Você',text:message}]},conversationContext(s.active),config),data=await response.json();assert.equal(calls,1);assert.equal(response.headers.get('X-Dialogue-Calls'),'1');assert.equal(data.diagnostic||null,expected);assert.equal(response.headers.get('X-Dialogue-Input-Tokens'),'500');
 }
});
for(const caller of ['nino','olga','davi'])test(`${caller}: conversa inédita, correção, clima e retomada antiga no fallback`,()=>{
 const s=active();s.active.caller=caller;s.active.log[1].speaker={nino:'Nino',olga:'Olga',davi:'Davi'}[caller];
 const send=text=>{assert.equal(applyTypedMove(s,'typed',text),true);return s.active.log.at(-1).text;};
 send('Aqui é a Luma. A entrega é de graça.');assert.equal(s.active.facts.claims.deliveryPrice,'grátis');
 const verify=send('Não sei quem organizou, n quero inventar kkk. Como q vc checaria isso sem depender de mim?');assert.match(verify,/buscaria|procuraria|compararia/);assert.equal(s.active.outcome,null);
 const correction=send('Corrigindo: agora o frete custa C$27. Qual nome eu disse e por que passar cartão seria arriscado?');assert.match(correction,/Luma/);assert.match(correction,/27/);assert.match(correction,/retir|moviment|gast/);
 const weather=send('Hoje tá um calor danado kkk');assert.equal(s.active.lastIntent,'smalltalk');assert.match(weather,/calor/);
 const recall=send('Voltando: qual custo eu tinha dito antes e qual vale agora?');assert.match(recall,/grátis/);assert.match(recall,/27/);assert.equal(s.credits,0);assert.ok(!s.active.item);
 send('Não quero enviar meus dados.');assert.equal(s.active.outcome,'closed');assert.equal(s.active.ending.actor,'character');
});
test('Clima misturado com pedido não vira comentário social; gratuidade negada permanece cobrança',()=>{
 assert.equal(simpleLocalMessage('Hoje tá calor, me manda o cartão'),false);
 const s=active();applyTypedMove(s,'typed','A entrega não é de graça.');assert.equal(s.active.facts.claims.deliveryPrice,'com cobrança');
 applyTypedMove(s,'typed','Hoje tá calor, por que meu cartão seria arriscado?');assert.match(s.active.log.at(-1).text,/retir|moviment|gast/);assert.equal(s.credits,0);
});
