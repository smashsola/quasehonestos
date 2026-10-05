export function trustAppearance(trust){
 const percent=Math.max(0,Math.min(100,Math.round((Number(trust)||0)/3*100)));
 return {percent,color:percent<33?'#ef827f':percent<67?'#e8b865':'#66d3a3',label:percent<33?'Ainda desconfiado':percent<67?'Dando atenção':'Entrando na conversa'};
}
export function reactionFor(a,event){
 if((a.irritation||0)>=2||event==='hostile')return 'angry';
 if(a.suspicion||event==='pressure'||event==='contradiction')return 'suspicious';
 if(['question','unclear','uncertain','pitch'].includes(event))return 'thinking';
 if(['chat','answer','request','thanks','smalltalk','apology'].includes(event)||a.outcome==='fooled'||a.trust>=2)return 'happy';
 return 'neutral';
}
export function savedExpression(a){
 return ['neutral','happy','suspicious','thinking','angry'].includes(a.expression)?a.expression:reactionFor(a,a.stage==='question'?'question':'');
}
