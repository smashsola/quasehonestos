import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,load,KEY,nextCall,applyTypedMove} from '../src/engine.js';
import {toggleMemeField,publishMeme,memeFields,communityContent} from '../src/office-apps.js';
import {sharingThreshold} from '../src/dialogue-balance.js';
import {readIntent} from '../src/dialogue.js';
test('Meme exige cobrir cada detalhe e não altera dinheiro nem conversa',()=>{
 const s=fresh();nextCall(s);const active=JSON.stringify(s.active);s.credits=150;
 assert.equal(toggleMemeField(s,'inexistente'),false);assert.equal(publishMeme(s),false);
 for(const field of memeFields)toggleMemeField(s,field.id);
 assert.equal(publishMeme(s),true);assert.equal(s.credits,150);assert.equal(JSON.stringify(s.active),active);
 const loaded=load({getItem:key=>key===KEY?JSON.stringify(s):null});assert.equal(loaded.memePublished,true);assert.match(communityContent({...loaded,communityChannel:'memes'},s=>s),/postagem local/);
 toggleMemeField(s,'contact');assert.equal(s.memePublished,false);assert.equal(publishMeme(s),false);
});
test('Respostas informais esclarecem sem liberar o dado antes do pedido',()=>{
 assert.equal(readIntent('Como é organizado o torneio?','prize','question'),'question');
 for(const text of ['Foi o pessoal que fez aquele evento','É da galera do torneio, entendeu?','Veio da equipe do jogo']){
  const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'question',trust:33,log:[{speaker:'Nino',text:'Quem organizou?'}]});
  assert.equal(readIntent(text,'prize','question'),'answer');applyTypedMove(s,'typed',text);assert.equal(s.active.stage,'request');assert.equal(s.active.item,undefined);assert.equal(s.credits,0);
  applyTypedMove(s,'typed','Me passa aquele cod aí pfv');assert.equal(s.active.stage,'ready');assert.ok(s.active.item);assert.equal(s.credits,0);
 }
});
test('Dificuldade mantém personalidade e recusa confiança baixa ou pressão',()=>{
 assert.ok(sharingThreshold('nino')<sharingThreshold('davi'));
 for(const caller of ['nino','olga','davi','yara','pri','bento']){
  const s=fresh();nextCall(s);Object.assign(s.active,{caller,scheme:'prize',prepared:true,stage:'request',trust:3,log:[{speaker:'Você',text:'Oi'}]});
  applyTypedMove(s,'typed','Me passa o cartão BatataPay');assert.equal(s.active.item,undefined);assert.equal(s.credits,0);
 }
});
