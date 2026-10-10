// Explicit live check; uses only synthetic fiction and consumes the existing AI quota.
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {analyzeMessage,polishReply,dialogueDiagnostic} from '../src/ai-dialogue.js';

const base=process.argv[2];
if(!base)throw new Error('Informe a URL da prévia ou implantação a verificar.');
const origin=new URL(base).origin;
const state=fresh();nextCall(state);
Object.assign(state.active,{caller:'olga',scheme:'club',prepared:true,stage:'question',trust:20,trustScale:100,
 log:[{speaker:'Você',text:'Há um convite para o Clube da Colher.'},{speaker:'Olga',text:'Quem organizou esse convite?'}],
 facts:{claims:{},question:{topic:'origem',status:'asked',text:'Quem organizou esse convite?'}}});
const calls=[];
const fetcher=async(path,options)=>{
 const response=await fetch(new URL(path,origin),{...options,headers:{...options.headers,Origin:origin}});
 const data=await response.clone().json().catch(()=>({}));
 calls.push({phase:JSON.parse(options.body).mode,status:response.status,source:response.headers.get('X-Dialogue-Source'),model:response.headers.get('X-Dialogue-Model'),error:data.error||null,diagnostic:data.diagnostic||null});
 return response;
};
const message='Não sei quem organiza. Não quero inventar: pode ser um convite falso. O que você faria para verificar sem depender de mim?';
const before=JSON.stringify(state);
const analysis=await analyzeMessage(state.active,message,fetcher);
assert.equal(JSON.stringify(state),before,'A chamada de interpretação não pode alterar o estado.');
applyTypedMove(state,'typed',message,analysis);
assert.equal(state.active.lastIntent,'question');
assert.equal(state.active.outcome,null);
assert.equal(state.active.trust,20);
assert.equal(state.active.item,undefined);
assert.equal(state.credits,0);
const reply=state.active.log.at(-1);
const beforeDraft={trust:state.active.trust,stage:state.active.stage,credits:state.credits,item:state.active.item,outcome:state.active.outcome};
const drafted=await polishReply(state.active,reply,fetcher);
assert.deepEqual({trust:state.active.trust,stage:state.active.stage,credits:state.credits,item:state.active.item,outcome:state.active.outcome},beforeDraft);
console.log(JSON.stringify({checkedAt:new Date().toISOString(),origin,calls,interpretation:dialogueDiagnostic(state.active),draft:dialogueDiagnostic(reply),acceptedAnalysis:!!analysis,acceptedDraft:drafted,localIntent:state.active.lastIntent,trust:state.active.trust,credits:state.credits,ended:!!state.active.outcome,shared:!!state.active.item},null,2));
