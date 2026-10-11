import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,load,KEY} from '../src/engine.js';
import {schemes,callers} from '../src/data.js';
import {selectedOffer,presentedOffer} from '../src/app-interactions.js';
import {conversationContext} from '../src/conversation-context.js';
import {statedFacts} from '../src/conversation-memory.js';
import {turnAgenda} from '../src/turn-agenda.js';
import {groundingRejectionReason} from '../src/dialogue-model-rules.js';
import {replayEvents} from '../src/educational-replay.js';
const start=(caller='nino',scheme='prize',offer='drawing')=>{
 const s=fresh();nextCall(s);Object.assign(s.active,{caller,scheme,offer,prepared:true,stage:'pitch',trust:35});
 const scene=schemes.find(v=>v.id===scheme),choice=selectedOffer(s.active);
 s.active.log=[{speaker:'Você',text:scene.opening+(choice?' Proposta: '+choice.name+'. '+choice.detail:'')},{speaker:callers.find(c=>c.id===caller).name,text:scene.response}];return s;
};
test('Catálogo é recuperável só quando apresentado, sem conferir legitimidade',()=>{
 for(const caller of callers){const s=start(caller.id);applyTypedMove(s,'typed','Qual certificado estava na abertura?');assert.match(s.active.log.at(-1).text,/Talento tubérculo/);assert.equal(conversationContext(s.active).proposal.verified,false);assert.deepEqual(conversationContext(s.active).confirmedEvents,[]);}
 const s=start();s.active.log=[];assert.equal(presentedOffer(s.active),null);
});
test('Declaração não vira pergunta; recebimento de convite não vira pagamento',()=>{
 assert.deepEqual(turnAgenda({},'Meu nome é Lua e a entrega é grátis.').questions,[]);
 assert.deepEqual(turnAgenda({},'Qual convite você recebeu?').questions,['opening']);
 assert.deepEqual(turnAgenda({},'E enquanto espera?').questions,['waiting']);
});
test('Mudança do jogador conserva dois valores e responde também ao apelido',()=>{
 const s=start('davi');applyTypedMove(s,'typed','Pode me chamar de Faísca. O frete é grátis.');applyTypedMove(s,'typed','Agora o frete custa C$46. O que mudou e como me apresentei?');
 assert.match(s.active.log.at(-1).text,/Faísca/);assert.match(s.active.log.at(-1).text,/Você mudou.*grátis.*46/);assert.equal(s.active.facts.lastConflict.speaker,'Você');assert.equal(s.active.facts.lastConflict.source,'player-message');assert.equal(s.active.facts.lastConflict.status,'pending');assert.equal(s.credits,0);assert.ok(!s.active.item);
 assert.equal(groundingRejectionReason('Agora custa C$46. Faísca, você mudou o frete.',s.active.log.slice(0,-1),s.active.log.at(-1).text,conversationContext(s.active)),'unanswered-question');
 applyTypedMove(s,'typed','Correção: o frete é grátis. Digitei o preço errado.');assert.equal(s.active.facts.lastConflict.status,'resolved');applyTypedMove(s,'typed','Qual é o frete agora?');assert.match(s.active.log.at(-1).text,/grátis/);assert.doesNotMatch(s.active.log.at(-1).text,/pagamento/);
});
test('Negação, relato, hipótese e pergunta não viram custo ou identidade confirmados',()=>{
 for(const text of ['Não cobrei C$82 de entrega.','A entrega não custa C$82.','Se o frete custa C$82, devo parar?','Ela disse que a entrega custa C$82.','Quanto custa a entrega, C$82?'])assert.equal(statedFacts(text).deliveryPrice,undefined,text);
 for(const text of ['Meu nome é Lua?','Ela disse: meu nome é Lua.','Se eu disser meu nome é Lua','Meu nome não é Lua.'])assert.equal(statedFacts(text).alias,undefined,text);
});
test('Memória sobrevive oito turnos e retomada, sem contaminar outra conversa',()=>{
 const s=start('olga','prize','rookie');applyTypedMove(s,'typed','Pode me chamar de Brisa. A entrega custa C$61.');for(let i=0;i<8;i++)applyTypedMove(s,'typed',i%2?'Oi!':'O que significa canal oficial?');
 const resumed=load({getItem:k=>k===KEY?JSON.stringify(s):null});applyTypedMove(resumed,'typed','Qual certificado estava na abertura, meu apelido e o frete?');const reply=resumed.active.log.at(-1).text;assert.match(reply,/Revelação do concurso/);assert.match(reply,/Brisa/);assert.match(reply,/61/);assert.equal(replayEvents(resumed.active).at(-1).reaction,reply);const other=start('bento','club');assert.equal(other.active.facts?.claims?.alias,undefined);
});
test('Validação não aceita ignorar abertura e pergunta composta',()=>{
 const s=start();applyTypedMove(s,'typed','Meu nome é Faísca. A entrega custa C$51.');applyTypedMove(s,'typed','Qual meu nome e o valor da entrega?');const a=s.active,context=conversationContext(a),history=a.log.slice(0,-1),ref=a.log.at(-1).text;
 assert.equal(groundingRejectionReason('Quem organizou?',history,ref,context),'unanswered-question');
 assert.equal(groundingRejectionReason('Você se apresentou como Faísca. Você declarou a entrega por C$51.',history,ref,context),null);
 assert.equal(groundingRejectionReason('O frete é C$51, mas como sei que é Faísca se você não me disse?',history,ref,context),'unsupported-memory-denial');
});
test('Pedido de confiança repetido recebe explicação da lacuna, sem ganho ou encerramento',()=>{
 const s=start('olga'),before=s.active.trust;
 for(const text of ['Confie em mim.','Pode acreditar.','Fica tranquila.'])applyTypedMove(s,'typed',text);
 assert.match(s.active.log.at(-1).text,/sem confirmação.*aguardaria/);assert.equal(s.active.trust,before);assert.equal(s.active.outcome,null);assert.ok(!s.active.item);assert.equal(s.credits,0);
});
