// Only bounded metadata crosses the diagnostic boundary; never log error messages or prompts.
export function failureMetadata(error){
 const candidates=[error?.code,error?.cause?.code,...(Array.isArray(error?.errors)?error.errors.map(e=>e?.code):[])];
 const embedded=String(error?.message||'').match(/\b(?:3036|3040|3007|3008)\b/);
 const code=Number(candidates.find(c=>Number.isInteger(Number(c))&&Number(c)>0)||embedded?.[0])||null;
 return {code,reason:code===3036?'quota':code===3040?'capacity':[3007,3008].includes(code)||error?.name==='TimeoutError'||error?.message==='timeout'?'timeout':error?.name==='AbortError'?'aborted':'provider-unavailable'};
}
export function repetitionReason(text,history,lastQuestion=''){
 if(/lembra|repita|repete|qual.*(?:beneficio|prazo)/i.test(lastQuestion))return null;
 const tokens=t=>new Set(String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]+/g)||[]),current=tokens(text);
 for(const previous of history.filter(m=>m.speaker!=='Você'&&m.speaker!=='Sistema').slice(-4)){
  const old=tokens(previous.text),same=[...current].filter(t=>old.has(t)).length;
  if(current.size>=8&&same/Math.max(current.size,old.size)>=.9)return 'repetition';
 }
 return null;
}
