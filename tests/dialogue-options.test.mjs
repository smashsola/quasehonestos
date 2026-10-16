import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,nextCall,executeScheme,load,closeCall} from '../src/engine.js';
import {dialogueOptions,applyDialogueOption} from '../src/dialogue-options.js';
import {callers,schemes,schemeItems} from '../src/data.js';
import {verifyOperationCode,runRemoteDiagnostic} from '../src/app-interactions.js';
import {reviewClonedCard} from '../src/clone-card.js';import {updateProfiles} from '../src/update-profiles.js';
const setup=(caller='nino',scheme='prize')=>{const s=fresh();nextCall(s);Object.assign(s.active,{caller,scheme,stage:'pitch',prepared:true,trust:0,log:[{speaker:'Você',text:'Tenho uma proposta fictícia.'},{speaker:callers.find(c=>c.id===caller).name,text:'Quero entender.'}]});return s;};
for(const c of callers)for(const scheme of schemes)test(`${c.id}/${scheme.id}: quatro opções, personalidade, fluxo e créditos só no app`,()=>{
 const s=setup(c.id,scheme.id);let turns=0;
 while(s.active.stage!=='ready'&&turns++<10){const choices=dialogueOptions(s.active);assert.equal(choices.length,4);assert.ok(choices.filter(o=>o.funny).length>=1&&choices.filter(o=>o.funny).length<=2);const before=structuredClone(s),choice=choices[0];assert.ok(applyDialogueOption(s,choice.key));assert.ok(applyDialogueOption(before,choice.key));assert.deepEqual(s,before);assert.equal(s.credits,0);}
 assert.equal(s.active.stage,'ready');assert.ok(s.active.item);assert.equal(dialogueOptions(s.active).length,4);
 const token=s.active.item.token,app=s.active.item.app;if(['wallet','club'].includes(app))assert.ok(verifyOperationCode(s,app,token));if(app==='support')assert.ok(runRemoteDiagnostic(s));if(app==='link')assert.ok(reviewClonedCard(s));if(app==='update')s.active.reviewedData=updateProfiles[c.id].map(f=>f.id);
 assert.ok(executeScheme(s,app));assert.equal(s.credits,scheme.payout);assert.equal(executeScheme(s,app),false);assert.equal(dialogueOptions(s.active).length,0);
});
test('Piada não altera confiança nem compartilha item, inclusive quando repetida',()=>{
 const s=setup();for(let i=0;i<8;i++){const joke=dialogueOptions(s.active).find(o=>o.action==='joke');assert.ok(applyDialogueOption(s,joke.key));}assert.equal(s.active.trust,0);assert.equal(s.credits,0);assert.ok(!s.active.item);assert.equal(s.active.stage,'pitch');
});
test('Pausar para buscar confirmação aparece em cada etapa e o save preserva essa decisão',()=>{
 const s=setup('olga','club');s.credits=321;const before=JSON.stringify(s),options=dialogueOptions(s.active);assert.equal(JSON.stringify(s),before);const safe=options.find(o=>o.protective);assert.ok(safe);assert.ok(applyDialogueOption(s,safe.key));assert.equal(s.active.outcome,'blocked');assert.equal(s.active.ending.actor,'character');assert.equal(s.active.ending.cause,'verification');assert.match(s.active.audit.at(-1).reason,/nenhuma consulta concluída/);assert.equal(s.credits,321);
 const resumed=load({getItem:()=>before});assert.equal(resumed.credits,321);assert.equal(dialogueOptions(resumed.active).length,4);assert.ok(dialogueOptions(resumed.active).some(o=>o.protective));
});
test('A escolha protetiva encerra sem liberar operação em todas as propostas e etapas',()=>{
 for(const scheme of schemes)for(const stage of ['pitch','question','request','ready']){const s=setup('davi',scheme.id);s.active.stage=stage;if(stage==='ready')s.active.item={...schemeItems[scheme.id]};const safe=dialogueOptions(s.active).find(o=>o.protective);assert.ok(safe,`${scheme.id}/${stage}`);assert.ok(applyDialogueOption(s,safe.key));assert.equal(s.active.outcome,'blocked');assert.equal(s.credits,0);assert.equal(s.active.ending.cause,'verification');assert.equal(s.active.item?.name,stage==='ready'?schemeItems[scheme.id].name:undefined);assert.match(s.active.audit.at(-1).reason,/nenhuma consulta concluída/);}
});
test('Escolha antiga não é aplicada depois de mudar de etapa',()=>{
 const s=setup(),options=dialogueOptions(s.active);applyDialogueOption(s,options[0].key);const before=JSON.stringify(s);assert.equal(applyDialogueOption(s,options[1].key),false);assert.equal(JSON.stringify(s),before);
});
test('Abrir aplicativo não fabrica eventos, e o botão Encerrar continua atribuído ao jogador',()=>{
 const s=setup();while(s.active.stage!=='ready')applyDialogueOption(s,dialogueOptions(s.active)[0].key);const before=JSON.stringify(s);assert.equal(applyDialogueOption(s,dialogueOptions(s.active)[0].key).app,'wallet');assert.equal(JSON.stringify(s),before);assert.ok(closeCall(s));assert.equal(s.active.ending.actor,'player');assert.equal(s.credits,0);
});
