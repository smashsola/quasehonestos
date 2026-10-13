import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {previewDialogue} from '../src/dialogue-preview.js';
import {conversationContext} from '../src/conversation-context.js';
import {groundingRejectionReason,replyAnswersCurrentQuestion,replyIsGrounded} from '../src/dialogue-model-rules.js';
import {buildTurnRequest} from '../src/dialogue-turn.js';
const setup=()=>{const s=fresh();nextCall(s);Object.assign(s.active,{caller:'olga',scheme:'prize',stage:'pitch',prepared:true,trust:35,log:[{speaker:'Você',text:'Tenho um prêmio de desenho.'},{speaker:'Olga',text:'Quero entender a oferta.'}]});return s;};
test('Prévia não altera estado nem libera créditos; schema ancora metadados, validador final continua obrigatório',()=>{
 const s=setup(),before=JSON.stringify(s),p=previewDialogue(s.active,'Pode me chamar de Dora. A entrega é de graça.');assert.equal(JSON.stringify(s),before);assert.equal(p.intent,'unclear');assert.equal(p.decision,'clarify');
 const body=buildTurnRequest(conversationContext(s.active),[...s.active.log,{speaker:'Você',text:'Pode me chamar de Dora. A entrega é de graça.'}],p);assert.deepEqual(body.generationConfig.responseSchema.properties.analysis.properties.rapport.enum,[0,1,2]);assert.deepEqual(body.generationConfig.responseSchema.properties.candidate.properties.intent.enum,['unclear']);assert.match(body.messages.at(-1).content,/\/no_think$/);
});
test('Compartilhar não conta como comparar uma fonte independente',()=>{
 const s=setup();applyTypedMove(s,'typed','Pode me chamar de Dora.');const c=conversationContext(s.active),h=[{speaker:'Você',text:'Qual nome eu disse e como você checaria o prêmio sem depender de mim?'}];
 assert.equal(replyAnswersCurrentQuestion('Dora. Para verificar, precisaria de um código; vamos seguir com o que você compartilhou.',h,c),false);
 assert.equal(replyAnswersCurrentQuestion('Dora. Eu compararia com um canal já conhecido, sem usar o contato recebido.',h,c),true);
});
test('Lembrar lacuna não é repetir pergunta, e o personagem não toma o nome do jogador',()=>{
 const s=setup();applyTypedMove(s,'typed','Pode me chamar de Dora.');applyTypedMove(s,'typed','Não sei quem organiza.');const c=conversationContext(s.active),h=[{speaker:'Você',text:'Qual meu nome e o que ainda falta confirmar?'}];
 assert.equal(groundingRejectionReason('Dora. Ainda falta confirmar quem organizou o prêmio.',h,'',c),null);
 assert.equal(groundingRejectionReason('Dora. Quem organizou esse prêmio?',h,'',c),'unknown-origin-repeated');
 assert.equal(groundingRejectionReason('Você pode me chamar de Dora.',[], '',c),'unsupported-attribution');
});
test('Correção reconhecida não volta a cobrar versão e fala não retorna a preço velho',()=>{
 const s=setup();applyTypedMove(s,'typed','A entrega é de graça.');applyTypedMove(s,'typed','Corrigindo: o frete custa C$27. O que mudou?');const text=s.active.log.at(-1).text;assert.match(text,/reconhecida/);assert.doesNotMatch(text,/qual vers[aã]o/);
 const c=conversationContext(s.active);assert.equal(replyIsGrounded('A entrega é grátis.',[],text,c),false);assert.equal(replyIsGrounded('Antes a entrega era grátis; agora custa C$27.',[],text,c),true);
});
test('Transição de preço citando versão antiga não é confundida com promessa vigente',()=>{
 const s=setup();applyTypedMove(s,'typed','A entrega é de graça.');applyTypedMove(s,'typed','Corrigindo: a entrega custa C$27.');const c=conversationContext(s.active),reference=s.active.log.at(-1).text;
 assert.equal(replyIsGrounded('Você mudou o custo da entrega de “grátis” para “C$ 27”. Sua correção foi reconhecida.',[],reference,c),true);
 assert.equal(replyIsGrounded('O custo da entrega foi alterado de “grátis” para “C$ 27”.',[],reference,c),true);
 assert.equal(replyIsGrounded('A entrega continua grátis.',[],reference,c),false);
});
test('Marcadores sociais não escondem perguntas compostas, origem desconhecida pode ser informal',()=>{
 const s=setup();applyTypedMove(s,'typed','Pode me chamar de Dora.');applyTypedMove(s,'typed','E aí kkk, que nome eu usei e como vc conferiria isso por fora?');assert.match(s.active.log.at(-1).text,/Dora/);assert.match(s.active.log.at(-1).text,/procuraria|buscaria|compararia/);
 applyTypedMove(s,'typed','Sei lá quem fez esse concurso. Não quero inventar. Como me chamo e o que falta esclarecer?');assert.equal(s.active.facts.unknownOrigin.status,'unknown');assert.match(s.active.log.at(-1).text,/origem/);
});
