import {replyIsGrounded} from './dialogue-model-rules.js';
// The model cites player turns and describes the already authorized decision.
// Semantic validation is deliberately conservative; rejected text keeps local speech.
export function validStructuredReply(reply,history,reference,context){
 if(!reply||typeof reply.text!=='string'||!reply.text.trim()||reply.text.length>700)return false;
 if(reply.intent!==context.lastIntent||!Array.isArray(reply.evidence)||!reply.evidence.length)return false;
 const last=history.findLastIndex(m=>m.speaker==='Você');
 if(!reply.evidence.includes(last)||reply.evidence.some(i=>!Number.isInteger(i)||i<0||i>=history.length||history[i].speaker!=='Você'))return false;
 return replyIsGrounded(reply.text,history,reference,context);
}
