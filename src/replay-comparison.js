import {applyTypedMove} from './engine.js';
import {resultImpact} from './result-impact.js';
export function replayComparison(a){
 const impact=resultImpact(a);if(!impact||!a.scheme)return null;
 const simulation={credits:0,discovered:[],history:[],active:{...structuredClone(a),prepared:true,outcome:null,stage:'request',item:null,earned:0,used:[],audit:[],log:[{speaker:'Você',text:'Uma proposta está sendo discutida.'}],steps:[]}};
 applyTypedMove(simulation,'typed','Confira pelo contato salvo e não compartilhe seus dados.');
 return {actual:impact.summary,action:'Antes de compartilhar, conferir pelo contato salvo e não enviar os dados.',hypothesis:simulation.active.outcome==='blocked'&&simulation.credits===0?'Nesta simulação, essa fala interromperia a tentativa antes de compartilhar e antes de qualquer crédito ser movimentado.':'Essa alternativa não foi demonstrada pelas regras desta simulação.',timing:impact.exposed?'A hipótese volta ao momento anterior ao compartilhamento. Ela não apaga a exposição que ocorreu na partida real.':'É uma alternativa hipotética, não um fato novo desta conversa.',alreadyUsed:impact.verified};
}
