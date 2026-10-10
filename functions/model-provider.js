import {dialogueModel} from '../src/dialogue-config.js';
// Optional server-only adapter. No SDK, retry, billing setup or stored transcripts.
export function providerConfig(env){
 const provider=env.DIALOGUE_PROVIDER||'workers-ai';
 if(provider==='workers-ai')return typeof env.Workers_AI?.run==='function'?{provider,model:dialogueModel.id,binding:env.Workers_AI}:null;
 if(!['gemini','claude'].includes(provider)||env.DIALOGUE_ALLOW_EXPERIMENTAL_PROVIDERS!=='true')return null;
 const model=env.DIALOGUE_MODEL||(provider==='gemini'?env.GEMINI_MODEL||'gemini-3.5-flash-lite':null);
 const key=provider==='gemini'?env.GEMINI_API_KEY:env.ANTHROPIC_API_KEY;
 return model&&/^[a-z0-9.-]{1,100}$/.test(model)&&key?{provider,model,key}:null;
}
function jsonSchema(schema){
 if(Array.isArray(schema))return schema.map(jsonSchema);
 if(!schema||typeof schema!=='object')return schema;
 const out={};
 for(const [key,value] of Object.entries(schema)){
  if(['minimum','maximum'].includes(key))continue;
  out[key]=key==='type'?value.toLowerCase():jsonSchema(value);
 }
 if(out.type==='object')out.additionalProperties=false;
 return out;
}
export function providerRequest(config,body){
 if(config.provider==='gemini')return {
  url:`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`,
  options:{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':config.key},body:JSON.stringify(body),signal:AbortSignal.timeout(deadline(body))}
 };
 return {
  url:'https://api.anthropic.com/v1/messages',
  options:{method:'POST',headers:{'Content-Type':'application/json','x-api-key':config.key,'anthropic-version':'2023-06-01'},body:JSON.stringify({
   model:config.model,max_tokens:body.generationConfig.maxOutputTokens,
   system:body.systemInstruction.parts.map(p=>p.text).join('\n'),
   messages:[{role:'user',content:body.contents[0].parts.map(p=>p.text).join('\n')}],
   output_config:{format:{type:'json_schema',schema:jsonSchema(body.generationConfig.responseSchema)}}
  }),signal:AbortSignal.timeout(deadline(body))}
 };
}
export function providerText(config,result){
 if(config.provider==='workers-ai'){const value=result?.choices?.[0]?.message?.content??result?.response;return typeof value==='string'?value.replace(/<think>[\s\S]*?<\/think>/gi,'').replace(/^\s*```(?:json)?\s*|\s*```\s*$/g,'').trim():JSON.stringify(value);}
 return config.provider==='claude'
  ?result.content?.filter(p=>p.type==='text').map(p=>p.text||'').join('').trim()
  :result.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
}
export async function workersReply(config,body){
 let timer;
 const requested=Number(body.generationConfig?.temperature);
 const temperature=Number.isFinite(requested)?Math.max(.2,Math.min(.65,requested)):.55;
 try{return await Promise.race([
  config.binding.run(config.model,{messages:[{role:'system',content:body.systemInstruction.parts.map(p=>p.text).join('\n')},{role:'user',content:body.contents[0].parts.map(p=>p.text).join('\n')+'\n/no_think'}],max_tokens:512,temperature,response_format:{type:'json_schema',json_schema:jsonSchema(body.generationConfig.responseSchema)}}),
  new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),deadline(body));})
 ]);}finally{clearTimeout(timer);}
}
function deadline(body){const value=Number(body.generationConfig?.timeoutMs);return Number.isFinite(value)?Math.max(100,Math.min(7000,value)):6500;}
