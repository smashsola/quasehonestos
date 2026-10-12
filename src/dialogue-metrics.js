// Session aggregates only. No transcript, identifier or persistent telemetry.
const totals={requests:0,providerCalls:0,unknownProviderCalls:0,inputTokens:0,outputTokens:0,inputTokenSamples:0,outputTokenSamples:0,durationMs:0,displayed:{api:0,local:0},fallbacks:{}};
export function recordRequestMetric({providerCalls,inputTokens,outputTokens,durationMs}){
 totals.requests++;if(Number.isInteger(providerCalls)&&providerCalls>=0)totals.providerCalls+=providerCalls;else totals.unknownProviderCalls++;
 if(Number.isInteger(inputTokens)&&inputTokens>=0){totals.inputTokens+=inputTokens;totals.inputTokenSamples++;}
 if(Number.isInteger(outputTokens)&&outputTokens>=0){totals.outputTokens+=outputTokens;totals.outputTokenSamples++;}
 totals.durationMs+=Math.max(0,Math.round(durationMs)||0);
}
export function recordDisplayMetric(api,reason){totals.displayed[api?'api':'local']++;if(!api&&typeof reason==='string'&&/^[a-z-]{1,50}$/.test(reason))totals.fallbacks[reason]=(totals.fallbacks[reason]||0)+1;}
export function dialogueMetrics(){return structuredClone(totals);}
