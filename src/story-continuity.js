import {callers} from './data.js';
import {resultImpact} from './result-impact.js';
export function registerFollowup(state,a){
 const impact=resultImpact(a);if(!impact)return;
 state.followups??=[];const key=state.cursor+'-'+a.caller;if(state.followups.some(e=>e.id===key))return;
 const body=impact.exposed?'Procurei o atendimento conhecido para revisar o que foi compartilhado e proteger o acesso. Também pedi apoio. A responsabilidade por enganar é de quem enganou, não de quem acreditou.':impact.verified?'Chegou outro contato com uma oferta parecida. Reconheci o pedido e fui ao canal que já conheço antes de responder. Desta vez, o logo nem teve chance de fazer discurso.':'Guardei a conversa. Antes de responder a outro convite, vou conferir quem oferece e quais dados realmente precisa.';
 state.followups.push({id:key,caller:a.caller,availableAfter:state.cursor+1,kind:impact.exposed?'support':impact.verified?'recognition':'verification',body});
}
export function followupPanel(state,esc){
 const available=(state.followups||[]).filter(e=>e.availableAfter<=state.cursor);if(!available.length)return '';
 return `<section class="story-followups"><small>DEPOIS DO ATENDIMENTO · CONTINUAÇÃO FICTÍCIA</small><h2>Chegou outro recado</h2>${available.map(e=>`<article><strong>${esc(callers.find(c=>c.id===e.caller)?.name||'Personagem')}</strong><p>${esc(e.body)}</p></article>`).join('')}<p class="office-footnote">A Chefia tentou arquivar no café. O Correio foi mais útil. Os relatos continuam dentro da ficção.</p></section>`;
}
