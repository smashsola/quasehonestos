export function trustAppearance(trust){
 const percent=Math.max(0,Math.min(100,Math.round(Number(trust)||0)));
 return {percent,color:percent<33?'#ef827f':percent<67?'#e8b865':'#66d3a3',label:percent<33?'Ainda desconfiado':percent<67?'Dando atenção':'Entrando na conversa'};
}
export const expressionNames={neutral:'atento',happy:'animado',suspicious:'desconfiado',thinking:'pensativo',angry:'irritado',amused:'achando graça',confused:'confuso',surprised:'surpreso',hurt:'chateado'};
export const expressions=Object.keys(expressionNames);
export function reactionFor(a,event,text=''){
 if((a.irritation||0)>=2||event==='hostile')return 'angry';
 if(event==='pressure'||event==='contradiction'||event==='state-conflict')return 'suspicious';
 if(event==='unclear'||event==='wrong-item')return 'confused';
 if(/(?:odiei|nao gostei|horrivel|feio).*(?:desenho|cafe|meme|planilha)/i.test(text.normalize('NFD').replace(/[\u0300-\u036f]/g,'')))return 'hurt';
 if(event==='smalltalk'&&/kkk|haha|rsrs|😂|🤣/.test(text))return 'amused';
 if(event==='doubt')return 'confused';
 if(['question','uncertain','pitch','protect','wait'].includes(event))return 'thinking';
 if(a.suspicion&&event==='request')return 'suspicious';
 if(['chat','answer','request','thanks','smalltalk','apology'].includes(event)||a.outcome==='fooled')return 'happy';
 return 'neutral';
}
export function savedExpression(a){
 return expressions.includes(a.expression)?a.expression:reactionFor(a,a.stage==='question'?'question':'');
}
export function applyReplyEmotion(a,emotion){
 if(!expressions.includes(emotion)||a.outcome)return false;
 if((a.irritation||0)>=2||a.lastIntent==='hostile'){a.expression='angry';return false;}
 if(['pressure','contradiction','state-conflict'].includes(a.lastIntent)){a.expression='suspicious';return false;}
 a.expression=emotion;return true;
}
