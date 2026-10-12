import {dialogueModel} from './dialogue-config.js';
export const nextQuotaReset=now=>Math.floor(now/86400000)*86400000+86400000;
export function createQuotaCircuit(store,now=Date.now){
 const key='qh-ai-quota-v1';let inMemory=null;
 return {remaining(){let v=inMemory;try{v=JSON.parse(store.getItem(key)||'null')||v;}catch{}return v?.model===dialogueModel.id&&Number.isFinite(v.until)&&v.until>now()&&v.until<=nextQuotaReset(now())?v.until:0;},confirm(reason){if(reason!=='quota')return 0;const until=nextQuotaReset(now());inMemory={model:dialogueModel.id,until};try{store.setItem(key,JSON.stringify(inMemory));}catch{}return until;}};
}
