import {failureMetadata} from '../src/dialogue-diagnostics.js';
import {nextQuotaReset} from '../src/dialogue-quota.js';

// Only an explicit quota error from the same UTC period prevents a probe.
// A historical retryAt or generic HTTP 429 is not sufficient evidence.
export function confirmedProbeQuota(records,now=Date.now()){
 const start=Math.floor(now/86400000)*86400000;
 for(const record of records){
  const at=Date.parse(record?.at||record?.observedAt||'');
  if(!Number.isFinite(at)||at<start||at>now)continue;
  const explicit=failureMetadata({errors:record.errors}).reason==='quota';
  const checkedTurn=record.results?.some(r=>r.reason==='quota');
  if(explicit||checkedTurn)return {confirmedAt:new Date(at).toISOString(),retryAt:nextQuotaReset(at),code:record.errors?.[0]?.code||record.results?.find(r=>r.reason==='quota')?.code||null};
 }
 return null;
}
