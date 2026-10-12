// Only bounded metadata crosses the diagnostic boundary; never log error messages or prompts.
export function failureMetadata(error){
 const candidates=[error?.code,error?.cause?.code,...(Array.isArray(error?.errors)?error.errors.map(e=>e?.code):[])];
 const message=[error?.message,error?.cause?.message,...(Array.isArray(error?.errors)?error.errors.map(e=>e?.message):[])].filter(v=>typeof v==='string').join(' ');
 const quotaMessage=/used up.*daily free allocation|daily free allocation.*(?:exhausted|exceeded)|free allocation of 10[,.]?000 neurons/i.test(message);
 const embedded=message.match(/\b(?:3036|4006|3040|3007|3008|5007|5004|3039|3003|5018|5016|3023|3041|5035|5019|5005|3042|3006)\b/);
 const code=Number(candidates.find(c=>Number.isInteger(Number(c))&&Number(c)>0)||embedded?.[0])||null;
 return {code,reason:code===3036||quotaMessage?'quota':code===3040?'capacity':[3007,3008].includes(code)||error?.name==='TimeoutError'||error?.message==='timeout'?'timeout':error?.name==='AbortError'?'aborted':'provider-unavailable'};
}
export function repetitionReason(text,history,lastQuestion=''){
 if(/lembra|repita|repete|qual.*(?:beneficio|prazo|certificado|nome|apelido|frete|entrega)|como me apresentei|(?:responder|respondeu|responda).*nome|(?:o que|como).*sem instalar/i.test(lastQuestion))return null;
 const tokens=t=>new Set(String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]+/g)||[]),current=tokens(text);
 for(const previous of history.filter(m=>m.speaker!=='Você'&&m.speaker!=='Sistema').slice(-4)){
  const old=tokens(previous.text),same=[...current].filter(t=>old.has(t)).length;
  if(current.size>=8&&same/Math.max(current.size,old.size)>=.9)return 'repetition';
 }
 const normalized=t=>String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const needed=clause=>/ate confirmar|sem enviar dados|nao.*pagamento|nenhum.*pagamento/.test(clause)||/pagamento|sessao|registr|autoriz|concord|mudou|condicao/.test(normalized(lastQuestion))&&/pagamento|sessao|registr|autoriz|concord|antes.*agora/.test(clause);
 const clauses=t=>normalized(t).split(/[.!?;]|\bmas\b/).map(c=>c.replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()).filter(c=>c.split(' ').length>=8&&!needed(c));
 const oldClauses=history.filter(m=>!['Você','Sistema'].includes(m.speaker)).slice(-4).flatMap(m=>clauses(m.text));
 for(const clause of clauses(text)){const words=clause.split(' ');for(let i=0;i<=words.length-8;i++)if(oldClauses.some(old=>(' '+old+' ').includes(' '+words.slice(i,i+8).join(' ')+' ')))return 'semantic-repetition';}
 const reassurance=t=>/confie em mim|pode acreditar|(?:fique|fica) tranquilo|pode confiar/.test(normalized(t));
 if(reassurance(text)&&history.filter(m=>!['Você','Sistema'].includes(m.speaker)).slice(-4).some(m=>reassurance(m.text)))return 'semantic-repetition';
 return null;
}
