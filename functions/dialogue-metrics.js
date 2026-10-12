const finite=value=>Number.isInteger(value)&&value>=0?value:null;
export function tokenMetrics(result){
 const u=result?.usage||result?.result?.usage||{};
 return {inputTokens:finite(u.prompt_tokens??u.input_tokens),outputTokens:finite(u.completion_tokens??u.output_tokens)};
}
export function finishMetric(response,{model,phase,calls=0,durationMs=0,source='fallback',reason=null,code=null,inputChars=0,inputTokens=null,outputTokens=null}){
 const metric={version:1,scope:'provider',model,phase,calls,durationMs,source,reason,code,inputChars,inputTokens,outputTokens};
 // Metadata only, including production. Never prompts, generated text or credentials.
 console.info('[dialogue-metric]',metric);
 response.headers.set('X-Dialogue-Model',model);response.headers.set('X-Dialogue-Source',source);response.headers.set('X-Dialogue-Calls',String(calls));response.headers.set('X-Dialogue-Duration-Ms',String(durationMs));
 if(inputTokens!==null)response.headers.set('X-Dialogue-Input-Tokens',String(inputTokens));
 if(outputTokens!==null)response.headers.set('X-Dialogue-Output-Tokens',String(outputTokens));
 return response;
}
