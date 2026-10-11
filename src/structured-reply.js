import {groundingRejectionReason} from './dialogue-model-rules.js';
import {replyDecision} from './conversation-context.js';
import {expressions} from './mood.js';
export const replyRejectionCodes=['empty-text','text-limit','unknown-fields','decision-mismatch','emotion-mismatch','intent-mismatch','missing-evidence','current-message-not-cited','invalid-evidence','unsafe-language','repetition','semantic-repetition','player-echo','resolved-question-repeated','unsupported-attribution','unanswered-correction','unanswered-question','state-or-fact-conflict'];
// The model cites player turns and describes the already authorized decision.
// Semantic validation is deliberately conservative; rejected text keeps local speech.
export function validStructuredReply(reply,history,reference,context){
 return structuredReplyRejectionReason(reply,history,reference,context)===null;
}
export function structuredReplyRejectionReason(reply,history,reference,context){
 if(!reply||typeof reply.text!=='string'||!reply.text.trim())return 'empty-text';
 if(reply.text.length>700)return 'text-limit';
 if(Object.keys(reply).some(key=>!['text','emotion','decision','intent','evidence'].includes(key)))return 'unknown-fields';
 if(reply.decision!==replyDecision(context))return 'decision-mismatch';
 if(reply.emotion!==undefined&&!expressions.includes(reply.emotion))return 'emotion-mismatch';
 if(reply.intent!==context.lastIntent)return 'intent-mismatch';
 if(!Array.isArray(reply.evidence)||!reply.evidence.length)return 'missing-evidence';
 const last=history.findLastIndex(m=>m.speaker==='Você');
 if(!reply.evidence.includes(last))return 'current-message-not-cited';
 if(new Set(reply.evidence).size!==reply.evidence.length||reply.evidence.some(i=>!Number.isInteger(i)||i<0||i>=history.length||history[i].speaker!=='Você'))return 'invalid-evidence';
 return groundingRejectionReason(reply.text,history,reference,context);
}
