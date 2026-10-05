// The server owns the key; AI changes wording, never game state.
export async function polishReply(active,reply,fetcher=fetch){
 try{
  const history=active.log.filter(m=>m.speaker==='Você'||m.speaker!== 'Sistema').slice(-13,-1).map(({speaker,text})=>({speaker,text:text.slice(0,900)}));
  const response=await fetcher('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caller:active.caller,scheme:active.scheme,expression:active.expression,history,reference:reply.text}),signal:AbortSignal.timeout(9000)});
  if(!response.ok)return false;const data=await response.json();
  if(typeof data.text!=='string'||!data.text.trim()||data.text.length>700)return false;
  reply.text=data.text.trim();reply.ai=true;return true;
 }catch{return false;}
}
