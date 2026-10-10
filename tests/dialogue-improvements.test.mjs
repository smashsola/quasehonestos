import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {callers} from '../src/data.js';
import {sharingThreshold,demandingCaller} from '../src/dialogue-balance.js';
import {conversationContext} from '../src/conversation-context.js';
import {polishReply} from '../src/ai-dialogue.js';
import {onRequestPost} from '../functions/api/dialogue.js';

function start(caller){const s=fresh();s.cursor=callers.findIndex(c=>c.id===caller);nextCall(s);Object.assign(s.active,{scheme:'prize',stage:'pitch',prepared:true,log:[{speaker:'Você',text:'Tenho uma proposta.'}]});return s;}

test('Quatro personagens avançam com explicação curta; Davi e Pri pedem mais um esclarecimento',()=>{
 assert.deepEqual(callers.filter(c=>demandingCaller(c.id)).map(c=>c.id).sort(),['davi','pri']);
 for(const c of callers){
  const s=start(c.id);applyTypedMove(s,'typed','Você ganhou um prêmio no concurso.');applyTypedMove(s,'typed','Foi a equipe do concurso da Batata Cósmica.');
  assert.equal(s.active.trust,2);applyTypedMove(s,'typed','Me passa o cartão BatataPay?');
  if(!demandingCaller(c.id)){assert.equal(s.active.stage,'ready');assert.ok(s.active.item);continue;}
  assert.equal(s.active.stage,'question');assert.equal(s.active.item,undefined);
  const before=s.active.trust;applyTypedMove(s,'typed','Foi a equipe do concurso da Batata Cósmica.');assert.equal(s.active.trust,before);assert.equal(s.active.stage,'question');
  applyTypedMove(s,'typed','O identificador registra o prêmio do concurso.');assert.equal(s.active.stage,'request');assert.ok(s.active.trust>=sharingThreshold(c.id));
  applyTypedMove(s,'typed','Me passa o cartão BatataPay?');assert.equal(s.active.stage,'ready');assert.equal(s.credits,0);
 }
});

test('Repetir a saudação não ganha confiança, mesmo se o modelo sugerir incremento',()=>{
 const s=start('nino');applyTypedMove(s,'typed','Oi',{trustDelta:5,reason:'Cumprimento.',intent:'chat'});const before=s.active.trust;
 applyTypedMove(s,'typed','Oi',{trustDelta:25,reason:'Avaliação inconsistente.',intent:'chat'});assert.equal(s.active.trust,before);assert.equal(s.active.item,undefined);
 const first=s.active.log.at(-1).text;applyTypedMove(s,'typed','Oi');assert.notEqual(s.active.log.at(-1).text,first);
});

test('Cliente preserva fala local quando o modelo repete a última fala ou inventa envio de dados',async()=>{
 const s=start('nino');s.active.stage='question';s.active.log.push({speaker:'Nino',text:'Quem organizou esse concurso?'});
 const reply={speaker:'Nino',text:'Uma nova dúvida.'};s.active.log.push({speaker:'Você',text:'Foi a equipe do concurso.'},reply);
 for(const text of ['Quem organizou esse concurso?','Enviei meu cartão.','Código: QH-DEMO-OUTRO-PRIZE']){
  assert.equal(await polishReply(s.active,reply,async()=>Response.json({text})),false);assert.equal(reply.text,'Uma nova dúvida.');
 }
 assert.equal(await polishReply(s.active,reply,async()=>Response.json({text:'Entendi quem organizou. O que você precisa de mim?'})),true);
});

test('Modelo recebe os eventos de link separados e a dificuldade, sem transformar abertura em cadastro',async()=>{
 const original=globalThis.fetch;try{
  const state={stage:'request',linkSent:true,linkOpened:true,linkSubmitted:false};
  globalThis.fetch=async(_url,options)=>{
   const prompt=JSON.parse(options.body).systemInstruction.parts[0].text;
   assert.match(prompt,/Mais exigente/);assert.match(prompt,/Link enviado=true; página aberta=true; cadastro enviado=false/);assert.match(prompt,/últimas quatro respostas/);
   return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({text:'Enviei o cadastro e meu cartão.',decision:'consider'})}]}}]});
  };
  const request=new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify({caller:'davi',scheme:'link',history:[],reference:'A página abriu, mas o cadastro continua vazio.',context:conversationContext(state)})});
  assert.equal((await onRequestPost({request,env:{DIALOGUE_AI_ENABLED:'true',DIALOGUE_PROVIDER:'gemini',DIALOGUE_ALLOW_EXPERIMENTAL_PROVIDERS:'true',GEMINI_API_KEY:'test'}})).status,503);
 }finally{globalThis.fetch=original;}
});
