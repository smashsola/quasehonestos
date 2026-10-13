import {fresh,applyTypedMove} from './engine.js';
import {conversationContext,replyDecision} from './conversation-context.js';
// A disposable simulation provides a writing reference, never a real transition.
// The actual motor runs afterwards with validated semantic signals.
export function previewDialogue(active,text){
 const state=fresh();state.active=structuredClone(active);
 if(!applyTypedMove(state,'typed',text))return null;
 return {intent:state.active.lastIntent,decision:replyDecision(conversationContext(state.active)),reference:state.active.log.at(-1).text.slice(0,700)};
}
