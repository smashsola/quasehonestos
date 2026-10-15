import test from 'node:test';
import assert from 'node:assert/strict';
import {playConversation,defenseVisible} from '../src/conversation-playback.js';
import {fresh,nextCall,closeCall,executeScheme,disconnectSession} from '../src/engine.js';
import {dialogueOptions,applyDialogueOption} from '../src/dialogue-options.js';
import {callers,schemes} from '../src/data.js';
import {verifyOperationCode,runRemoteDiagnostic} from '../src/app-interactions.js';
import {reviewClonedCard} from '../src/clone-card.js';
import {updateProfiles} from '../src/update-profiles.js';
function clock(){let now=0,id=0;const pending=new Map();return {schedule(fn,delay){pending.set(++id,{fn,at:now+delay});return id;},cancel(id){pending.delete(id);},step(){const [id,item]=[...pending].sort((a,b)=>a[1].at-b[1].at)[0];pending.delete(id);now=item.at;item.fn();},get now(){return now;},get size(){return pending.size;}};}
function setup(scheme='prize'){const s=fresh();nextCall(s);Object.assign(s.active,{caller:'nino',scheme,stage:'pitch',prepared:true,trust:0,log:[{speaker:'Você',text:'Uma proposta.'},{speaker:'Nino',text:'Estou ouvindo.'}]});return s;}
function assertPlayback(s,start){
 const before=JSON.stringify(s),time=clock(),frames=[];let doneAt=null;
 playConversation({start,total:s.active.log.length,speaker:s.active.log.at(-1).speaker,text:s.active.log.at(-1).text,ended:true,schedule:time.schedule,cancel:time.cancel,frame:f=>frames.push({...f,at:time.now}),done:()=>doneAt=time.now});
 assert.equal(frames[0].visible,start);time.step();assert.equal(doneAt,null);time.step();
 assert.equal(frames.at(-1).phase,'reading');assert.equal(frames.at(-1).visible,s.active.log.length);assert.equal(doneAt,null);
 const readableAt=time.now;time.step();assert.ok(doneAt-readableAt>=1600);assert.equal(JSON.stringify(s),before);
}
test('Encerrar pelo botão e interrupção pelo personagem mostram a última mensagem antes do replay',()=>{
 const button=setup(),start=button.active.log.length;closeCall(button);assertPlayback(button,start);
 const pressure=setup();applyDialogueOption(pressure,dialogueOptions(pressure.active)[3].key);const end=pressure.active.log.length;applyDialogueOption(pressure,dialogueOptions(pressure.active)[3].key);assert.ok(pressure.active.outcome);assertPlayback(pressure,end);
});
for(const scheme of schemes)test(`${scheme.id}: operação concluída só apresenta resultado depois da fala final`,()=>{
 const s=setup(scheme.id);while(s.active.stage!=='ready')applyDialogueOption(s,dialogueOptions(s.active)[0].key);
 const app=s.active.item.app;if(['wallet','club'].includes(app))verifyOperationCode(s,app,s.active.item.token);if(app==='support')runRemoteDiagnostic(s);if(app==='link')reviewClonedCard(s);if(app==='update')s.active.reviewedData=updateProfiles.nino.map(f=>f.id);
 const start=s.active.log.length;assert.ok(executeScheme(s,app));assertPlayback(s,start);
});
test('Desconectar uma sessão também tem intervalo antes do resultado',()=>{const s=setup('support');while(s.active.stage!=='ready')applyDialogueOption(s,dialogueOptions(s.active)[0].key);const start=s.active.log.length;disconnectSession(s);assertPlayback(s,start);});
test('Troca de atendimento ou cancelamento invalida respostas atrasadas',()=>{
 for(const cancelExplicitly of [true,false]){const time=clock(),frames=[];let current=true,done=false;const cancel=playConversation({start:0,total:2,speaker:'Nino',current:()=>current,frame:f=>frames.push(f),done:()=>done=true,schedule:time.schedule,cancel:time.cancel});if(cancelExplicitly)cancel();else current=false;while(time.size)time.step();assert.equal(frames.length,1);assert.equal(done,false);}
});
test('Defesa tem entrada própria e retoma investigações antigas',()=>{assert.equal(defenseVisible({outcome:'closed'}),false);assert.equal(defenseVisible({outcome:'closed',defenseOpened:true}),true);assert.equal(defenseVisible({learningDefense:{seen:['order']}}),true);});
test('Todos os turnos têm humor contextual, com escolhas diferentes por etapa e reação por personagem',()=>{
 for(const scheme of schemes){const reactions=new Set();for(const c of callers){const s=setup(scheme.id);s.active.caller=c.id;const labels=[];for(const stage of ['pitch','question','request','ready']){s.active.stage=stage;s.active.guidedAnswers=0;const choices=dialogueOptions(s.active);assert.equal(choices.length,4);const funny=choices.filter(o=>o.funny);assert.ok(funny.length>=1&&funny.length<=2);assert.ok(funny.every(o=>o.label?.length>20));labels.push(funny[0].label);if(stage==='ready'){const joke=funny.find(o=>o.action==='joke');const before=s.active.trust;applyDialogueOption(s,joke.key);reactions.add(s.active.log.at(-1).text);const first=s.active.log.at(-1).text,second=dialogueOptions(s.active).find(o=>o.action==='joke');assert.notEqual(second.label,joke.label);applyDialogueOption(s,second.key);assert.notEqual(s.active.log.at(-1).text,first);assert.equal(s.active.trust,before);assert.equal(s.credits,0);}}assert.equal(new Set(labels).size,4);}assert.equal(reactions.size,callers.length);}
});
