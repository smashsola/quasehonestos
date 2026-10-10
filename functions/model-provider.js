// Optional server-only adapter. No SDK, retry, billing setup or stored transcripts.
export function providerConfig(env){
 const provider=env.DIALOGUE_PROVIDER||'gemini';
 if(!['gemini','claude'].includes(provider))return null;
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
  options:{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':config.key},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)}
 };
 return {
  url:'https://api.anthropic.com/v1/messages',
  options:{method:'POST',headers:{'Content-Type':'application/json','x-api-key':config.key,'anthropic-version':'2023-06-01'},body:JSON.stringify({
   model:config.model,max_tokens:body.generationConfig.maxOutputTokens,
   system:body.systemInstruction.parts.map(p=>p.text).join('\n'),
   messages:[{role:'user',content:body.contents[0].parts.map(p=>p.text).join('\n')}],
   output_config:{format:{type:'json_schema',schema:jsonSchema(body.generationConfig.responseSchema)}}
  }),signal:AbortSignal.timeout(12000)}
 };
}
export function providerText(config,result){
 return config.provider==='claude'
  ?result.content?.filter(p=>p.type==='text').map(p=>p.text||'').join('').trim()
  :result.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
}
