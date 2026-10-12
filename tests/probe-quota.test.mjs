import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmedProbeQuota} from '../scripts/probe-quota.mjs';
const now=Date.parse('2026-10-12T03:51:00Z');
test('Probe considera confirmação real do período atual e libera no próximo UTC',()=>{
 const record={at:'2026-10-12T02:31:40Z',status:429,errors:[{code:4006,message:'you have used up your daily free allocation of 10,000 neurons'}]};
 const result=confirmedProbeQuota([record],now);assert.equal(result.code,4006);assert.equal(result.retryAt,Date.parse('2026-10-13T00:00:00Z'));
 assert.equal(confirmedProbeQuota([record],result.retryAt),null);
});
test('429 genérico, capacidade, timestamps futuros e retryAt sem prova não bloqueiam',()=>{
 for(const record of [{at:'2026-10-12T02:00:00Z',status:429,errors:[{code:4006,message:'provider unavailable'}]},{at:'2026-10-12T02:00:00Z',errors:[{code:3040}]},{at:'2026-10-12T05:00:00Z',errors:[{code:3036}]},{observedAt:'2026-10-12T02:00:00Z',retryAt:now+100000}])assert.equal(confirmedProbeQuota([record],now),null);
});
test('Resultado explícito do probe também impede nova inferência no mesmo período',()=>{
 const record={observedAt:'2026-10-12T02:00:00Z',results:[{reason:'quota',code:3036}]};assert.equal(confirmedProbeQuota([record],now).code,3036);
 assert.equal(confirmedProbeQuota([{...record,observedAt:'2026-10-11T23:59:00Z'}],now),null);
});
