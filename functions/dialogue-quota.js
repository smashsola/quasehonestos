import {nextQuotaReset} from '../src/dialogue-quota.js';
const evidence=new WeakMap();
// Two independent explicit quota failures are required for the shared isolate guard.
// Capacity, generic 429, parsing and timeouts never block other players.
export function serverQuotaRemaining(binding,now=Date.now()){
 const record=evidence.get(binding);return record?.until>now&&record.until<=nextQuotaReset(now)?record.until:0;
}
export function confirmServerQuota(binding,reason,now=Date.now()){
 if(reason!=='quota')return 0;const day=Math.floor(now/86400000),old=evidence.get(binding),count=old?.day===day?old.count+1:1;
 const until=count>=2?nextQuotaReset(now):0;evidence.set(binding,{day,count,until});return until;
}
