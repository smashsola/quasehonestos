import {normalizeMessage,negatedRequest} from './language.js';
import {memoryConflict} from './conversation-memory.js';

const sensitive=/dados|cartao|senha|codigo|passe|acesso|sessao|cadastro|arquivo|pacote/;
const independent=/canal (?:oficial|conhecido)|(?:app|aplicativo|site|numero|contato|telefone) (?:oficial|conhecido|que (?:voce|eu) (?:ja )?(?:conhece|conheco|tinha))|pelo contato salvo|numero salvo|contato salvo|por conta propria|outro canal|fora (?:da|dessa) mensagem/;
const verification=/\b(?:confira|conferir|verifique|verificar|confirme|confirmar|consulte|consultar|procure|procurar|cheque|checar|confere|verifica|confirma|consulta|procura)\b/;
const negative=/\b(?:nao|nunca|nem)\b/;

// Interpretation describes evidence in a message. The engine separately owns
// consequences. No trust, item, permission or money is mutated here.
export function interpretMessage(text,a={},fallback=()=> 'unclear'){
 const t=normalizeMessage(text);
 const clauses=t.split(/[.!;\n]+|,?\s+mas\s+|\s+e\s+(?=(?:me |nao |envie|mande|compartilhe|libere|instale|preencha|confira|verifique|confirme|consulte|procure))/).filter(Boolean);
 const result=(intent,evidence,ambiguous=false)=>({intent,evidence,ambiguous});
 const keepSecret=/\b(?:guarde|mantenha) (?:seus |suas |seu |sua |o |a |os |as )?(?:dados|codigo|senha|cartao).*\b(?:segredo|privado|privados|so com voce)\b/.test(t);
 const protectedData=clauses.some(c=>negative.test(c)&&sensitive.test(c)&&/\b(?:compartilh\w*|envi\w*|mand\w*|pass\w*|liber\w*|fornec\w*|divulg\w*)\b/.test(c));
 const checking=clauses.some(c=>verification.test(c)&&independent.test(c)&&!/\bnao (?:confir\w*|verifi\w*|consul\w*|procur\w*|che\w*)/.test(c));
 const requesting=clauses.some(c=>!negative.test(c)&&sensitive.test(c)&&/\b(?:me (?:manda|passe|passa|envie)|(?:envie|mande|compartilhe|libere|instale|preencha))\b/.test(c));
 const reported=/\b(?:ele|ela|o contato|a mensagem) (?:disse|pediu|mandou|falou)|\bvoce disse\b/.test(t);
 if(reported&&(checking||protectedData))return result('unclear','Uma fala relatada não autoriza uma decisão; falta esclarecer se é orientação ou relato.',true);
 if(checking&&/que eu (?:enviei|mandei)|pelo link (?:que )?enviei/.test(t))return result('unclear','O canal chamado de oficial foi indicado pelo próprio contato; sua origem ainda não foi esclarecida.',true);
 if(/\bnao (?:confir\w*|verifi\w*|consul\w*)/.test(t)&&!checking)return result(requesting?'request':'unclear','A verificação foi negada na frase; não houve orientação protetiva.',!requesting);
 if(/\?\s*$/.test(t)&&(protectedData||checking))return result('doubt','A mensagem pergunta sobre uma recusa; ainda precisa de esclarecimento.');
 const protectiveImperative=clauses.some(c=>/\bnao (?:compartilhe|envie|mande|passe|libere|forneca|divulgue)\b/.test(c)&&sensitive.test(c)&&!/\b(?:comigo|para mim|me)\b/.test(c));
 if(!reported&&(keepSecret||checking||protectedData&&(/\b(?:seus|sua|suas|seu)\b/.test(t)||protectiveImperative))){
  if(requesting)return result('unclear','A mensagem mistura orientação de proteção com um pedido de dados.',true);
  return result('protect',checking?'Orientação para conferir a origem por um canal independente.':'Orientação para não compartilhar dados.');
 }
 if(negatedRequest(t)||/\b(?:nao quero (?:isso|participar|continuar|receber)|prefiro (?:recusar|encerrar)|dispenso (?:a|essa) (?:oferta|proposta))\b/.test(t))return result('refusal','Recusa explícita do pedido ou da proposta.');
 if(/\b(?:nao entendi|estou em duvida|tenho duvidas|nao sei se|isso e seguro|como vou saber)\b/.test(t))return result('doubt','O jogador expressou uma dúvida; não é autorização nem pressão.');
 const claim=/\b(?:voce ja (?:enviou|mandou|passou|compartilhou|instalou)|(?:o )?cadastro ja foi enviado|(?:eu ja )?recebi (?:seu|o) (?:cartao|passe|codigo)|ja (?:pagou|recebi o pagamento))\b/;
 if(!/\?\s*$/.test(t)&&claim.test(t)&&(!a.item||/pagou|pagamento/.test(t)&&a.outcome!=='fooled'))return result('state-conflict','A fala afirma uma ação que não está registrada na partida.',true);
 if(!reported&&memoryConflict(a,t))return result('contradiction','Uma condição declarada diverge da conversa registrada.');
 if(a.memory?.free&&!reported&&!/\?\s*$/.test(t)&&!negative.test(t)&&/precisa pagar|tem que pagar|pague .*taxa/.test(t))return result('contradiction','Uma cobrança contradiz a gratuidade prometida nesta conversa.');
 if(a.stage==='request'&&!/\?\s*$/.test(t)&&/\b(?:foi|organiza|organizou|veio)\b/.test(t)&&/concurso|turma|equipe|firma|proposta/.test(t))return result('answer','Esclarecimento adicional sobre a origem da proposta já apresentada.');
 if(a.stage==='request'&&/\b(?:manda|mande|envie|passe|passa|libere) (?:isso|aquilo|aquele dado)\b/.test(t)&&a.used?.includes('answer'))return result('request','Pedido com referente identificado pela proposta já esclarecida.');
 const local=fallback();
 if(local==='pressure'&&/\bnao (?:e |esta |tem )?(?:urgente|pressa|precisa.*agora)\b/.test(t))return result('unclear','A frase negou urgência; não demonstra pressão.',true);
 if(local==='contradiction'&&!/\b(?:vamos falar|mudei|troque|em vez|agora (?:e|quero))\b/.test(t))return result('offtopic','A fala menciona outro assunto; isso não comprova contradição.');
 if(local==='unclear'&&/\b(?:futebol|choveu|filme|onibus|minha viagem|almoco)\b/.test(t))return result('offtopic','Assunto sem ligação demonstrada com a proposta.');
 return result(local,local==='unclear'?'Não há sentido suficiente para decidir a ação.':'Intenção identificada no contexto da proposta.',local==='unclear');
}
