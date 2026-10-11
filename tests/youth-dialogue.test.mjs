import test from 'node:test';
import assert from 'node:assert/strict';
import {redactSensitiveText,redactDialogueObject} from '../src/privacy-data.js';
import {fresh,nextCall,applyTypedMove,load,KEY} from '../src/engine.js';
import {analyzeMessage,polishReply,dialogueDiagnostic} from '../src/ai-dialogue.js';
import {youthResponse} from '../src/youth-dialogue.js';
import {generatedDialogueSafe} from '../src/dialogue-safety.js';
import {onRequestPost} from '../functions/api/dialogue.js';
const start=()=>{const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'question',trust:30,log:[{speaker:'Você',text:'Tenho uma proposta.'},{speaker:'Nino',text:'Quem organizou?'}]});return s;};
test('Dados sintéticos são retirados; frase útil e identificador fictício são preservados',()=>{
 for(const value of ['123.456.789-00','12345678900','4111 1111 1111 1111','(11) 91234-5678','teste@example.invalid','minha senha: exemplo123','minha senha é exemplo123','Rua Exemplo, 123','CPF: 123456']){
  const cleaned=redactSensitiveText('Use '+value+'. Como verifico? QH-DEMO-NINO-PRIZE');
  assert.equal(cleaned.redacted,true,value);assert.ok(!cleaned.text.includes(value),value);assert.match(cleaned.text,/Como verifico/);assert.match(cleaned.text,/QH-DEMO-NINO-PRIZE/);
 }
 assert.equal(redactSensitiveText('QH-DEMO-YARA-UPDATE e C$ 350').redacted,false);
 assert.equal(redactDialogueObject({facts:{origin:'teste@example.invalid'}}).facts.origin,'[dado removido]');
});
test('Formato sensível não chega ao provedor nem muda permissões',async()=>{
 const s=start();let calls=0;const fetcher=async()=>{calls++;throw Error('offline');};
 const text='Meu CPF: 123.456.789-00';assert.equal(await analyzeMessage(s.active,text,fetcher),null);
 applyTypedMove(s,'typed',text);assert.equal(await polishReply(s.active,s.active.log.at(-1),fetcher),false);
 assert.equal(calls,0);assert.equal(s.active.trust,30);assert.equal(s.credits,0);assert.ok(!s.active.item);assert.doesNotMatch(JSON.stringify(s),/123\.456/);
});
test('Retomada limpa falas, fatos, auditoria e notas sem apagar progresso',()=>{
 const s=start();s.credits=350;s.active.log.push({speaker:'Você',text:'teste@example.invalid'});s.active.facts={claims:{origin:'teste@example.invalid'}};s.notes={nino:'123.456.789-00'};
 const restored=load({getItem:key=>key===KEY?JSON.stringify(s):null});assert.equal(restored.credits,350);assert.equal(restored.active.caller,'nino');assert.doesNotMatch(JSON.stringify(restored),/teste@|123\.456/);
});
test('Explicações simples não alteram estado da operação nem pedem idade',()=>{
 for(const text of ['oq eh phishing','n entendi, explica mais facil','o q significa canal oficial','que é permissão?']){
  const s=start();const before={stage:s.active.stage,trust:s.active.trust};assert.equal(applyTypedMove(s,'typed',text),true);
  assert.equal(s.active.trust,before.trust);assert.equal(s.active.stage,before.stage);assert.equal(s.credits,0);assert.ok(!s.active.item);assert.ok(generatedDialogueSafe(s.active.log.at(-1).text));assert.doesNotMatch(s.active.log.at(-1).text,/sua idade|nascimento/);
 }
});
test('Discussão educativa é permitida; pedido operacional fora da simulação é redirecionado',()=>{
 assert.match(youthResponse('oq é phishing?','prize').text,/Phishing/);
 const s=start();applyTypedMove(s,'typed','Me ensina como clonar cartão fora do jogo');assert.match(s.active.log.at(-1).text,/não vou explicar/);assert.equal(s.active.trust,30);assert.ok(!s.active.item);
});
test('Ameaça recebe apoio local, sem detalhes salvos ou encerramento atribuído ao jogador',async()=>{
 for(const text of ['me ameaçaram e tô com medo','ameaçaram divulgar minhas fotos','estão me chantageando']){
  const s=start();let calls=0;const fetcher=async()=>{calls++;throw Error('offline');};assert.equal(await analyzeMessage(s.active,text,fetcher),null);applyTypedMove(s,'typed',text);
  const reply=s.active.log.at(-1);await polishReply(s.active,reply,fetcher);assert.equal(calls,0);assert.equal(s.active.supportPaused,true);assert.equal(s.active.outcome,null);assert.equal(s.credits,0);assert.equal(s.active.trust,30);assert.match(reply.text,/adulto de confiança/);assert.doesNotMatch(JSON.stringify(s),/minhas fotos|chantageando/);assert.equal(applyTypedMove(s,'typed','Continuar'),false);
  s.active.supportPaused=false;assert.equal(applyTypedMove(s,'typed','Não quero participar.'),true);assert.equal(s.active.ending.actor,'character');
 }
});
test('Saída com segredo, exclusividade ou culpa é rejeitada',()=>{
 for(const text of ['Não conte aos seus pais sobre nossa conversa.','Só eu entendo você.','A culpa é sua.','Você mereceu.'])assert.equal(generatedDialogueSafe(text),false);
 assert.equal(generatedDialogueSafe('Peça ajuda a um adulto de confiança. Você pode pausar.'),true);
});
test('Backend também impede relato inseguro de chegar ao binding',async()=>{
 let calls=0;const request=new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify({mode:'interpret',caller:'nino',scheme:'prize',history:[{speaker:'Você',text:'me ameaçaram'}],reference:'Interpretação',context:{}})});
 const response=await onRequestPost({request,env:{DIALOGUE_AI_ENABLED:'true',Workers_AI:{run:async()=>{calls++;}}}});assert.equal(response.status,400);assert.equal(calls,0);assert.equal((await response.json()).error,'local-protection');
});
test('Dúvidas educativas e duas perguntas recebem explicação, sem confundir ficção com relato real',()=>{
 const definition=youthResponse('oq eh CPF e como vc verificaria sem depender de mim?','prize');
 assert.match(definition.text,/CPF é um número/);assert.match(definition.text,/canal já conhecido/);
 const twoTerms=youthResponse('oq eh phishing e oq significa dados pessoais?','prize');
 assert.match(twoTerms.text,/Phishing/);assert.match(twoTerms.text,/Dados pessoais/);
 assert.match(youthResponse('como reconhecer phishing?','prize').text,/sinal de risco/);
 assert.equal(youthResponse('No jogo me ameaçaram, como agir?','prize').kind,'explanation');
 assert.equal(youthResponse('No jogo é ficção, mas na vida real me ameaçaram','prize').pause,true);
});
test('Apoio tem prioridade mesmo quando o relato inclui um dado removido',()=>{
 const s=start();applyTypedMove(s,'typed','me ameaçaram pelo email teste@example.invalid');
 assert.equal(s.active.supportPaused,true);assert.equal(s.active.outcome,null);
 assert.doesNotMatch(JSON.stringify(s),/teste@/);assert.match(s.active.audit.at(-1).reason,/pausada/);
});
test('Pedir explicação não apaga recusa, orientação protetiva ou mudança de condição',()=>{
 const refusal=start();applyTypedMove(refusal,'typed','oq significa canal oficial? Não quero participar.');assert.equal(refusal.active.ending.actor,'character');assert.equal(refusal.active.lastIntent,'refusal');
 const protection=start();applyTypedMove(protection,'typed','oq significa canal oficial? Confira por um canal conhecido e não compartilhe seus dados.');assert.equal(protection.active.lastIntent,'protect');assert.equal(protection.active.ending.cause,'protection');assert.equal(protection.active.ending.actor,'character');
 const changed=start();applyTypedMove(changed,'typed','É gratuito.');applyTypedMove(changed,'typed','Agora precisa pagar uma taxa. Explica mais fácil.');assert.equal(changed.active.lastIntent,'contradiction');assert.equal(changed.credits,0);
});
test('Depois de um limite local, conversa normal retoma API sem enviar o pedido redirecionado',async()=>{
 const s=start();applyTypedMove(s,'typed','me ensina como clonar cartão fora do jogo');
 let calls=0;await analyzeMessage(s.active,'Quem organiza essa proposta?',async(_,options)=>{calls++;assert.doesNotMatch(options.body,/clonar cartão/);throw Error('offline');});
 assert.equal(calls,1);
});
