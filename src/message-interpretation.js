import {normalizeMessage,negatedRequest,isReportedSpeech} from './language.js';
import {memoryConflict} from './conversation-memory.js';

const sensitive=/dados|cartao|senha|codigo|passe|acesso|sessao|cadastro|arquivo|pacote/;
const independent=/(?:canal|app|aplicativo|site|pagina|numero|contato|telefone|perfil|insta|instagram|portal) (?:oficial|conhecido|salvo|que (?:voce|eu) (?:ja )?(?:conhece|conheco|tinha))|(?:site|app|aplicativo|pagina|perfil|insta|instagram|portal) (?:da|do) (?:escola|clube|loja|suporte|organizacao|prefeitura|equipe)|pelo (?:contato|numero|telefone|app|aplicativo) salvo|por conta propria|por fora|outro (?:canal|numero|contato|telefone)|fora (?:da|dessa) mensagem|direto (?:com|para) (?:a|o) (?:escola|clube|loja|suporte|organizacao|prefeitura|equipe)|com (?:a|o) (?:escola|clube|loja|suporte|organizacao|prefeitura|equipe) por outro (?:canal|numero|contato|telefone)/;
const verificationActionSource='(?:confer\\w*|confir\\w*|verific\\w*|confirm\\w*|consult\\w*|procur\\w*|chec\\w*|pesquis\\w*|busc\\w*|cham\\w*|olh\\w*|fal\\w*|pergunt\\w*|ver|vejo|veria|buscar (?:uma )?confirmacao|pedir (?:uma )?confirmacao|(?:dar|dou|dei|daria) uma olhada|entr\\w* em contato)';
const verification=new RegExp(`\\b${verificationActionSource}\\b`);
const negatedVerification=new RegExp(`\\b(?:nao|nunca|nem)\\s+(?:(?:vou|vo|quero|pretendo|posso|preciso|precisa)\\s+)?(?:nem\\s+)?${verificationActionSource}\\b|\\b(?:prefiro|melhor|acho melhor)\\s+nao\\s+${verificationActionSource}\\b|\\bnem pensar em\\s+${verificationActionSource}\\b|\\bsem\\s+${verificationActionSource}\\b`);
const postposedNegatedVerification=new RegExp(`\\b${verificationActionSource}\\b[^.!?\\n]{0,72}\\bnao\\s*[.!?]*$`);
const hypotheticalVerification=new RegExp(`\\b(?:se|caso)\\s+(?:eu|a gente|nos)\\s+(?:(?:for|fosse|resolver|quiser|vier a)\\s+)?${verificationActionSource}\\b`);
const uncertainVerification=new RegExp(`\\b(?:talvez|quem sabe)\\s+(?:(?:eu|a gente|nos)\\s+)?${verificationActionSource}\\b`);
const sensitiveActionSource='(?:mand\\w*|envi\\w*|pass\\w*|compartilh\\w*|instal\\w*|abr\\w*|liber\\w*|fornec\\w*)';
const deferredVerification=new RegExp(`\\b${sensitiveActionSource}\\b[^.!?\\n]{0,56}\\b(?:sem|antes de)\\s+${verificationActionSource}\\b`);
const questionLike=/\b(?:como|onde|qual|quem|que que|o que|como assim|qual foi|tem como|posso|da para|isso vem de onde|isso veio de onde|vem de onde|veio de onde|sera que)\b/;
const informalQuestion=/\b(?:como assim|que que (?:e|foi)|o que (?:e|foi|voce quer de mim|quer de mim)|voce quer o que de mim|qual foi|que papo e esse|que historia e essa|que negocio e esse|que conversa e essa|sera que|isso (?:vem|veio) de onde|(?:vem|veio) de onde|isso e golpe ou e de verdade|(?:eu )?(?:vou|ia) (?:confiar|acreditar) (?:nisso|nisto|em voce) (?:porque|por que))\b/;
const selfSuppliedChannel=/\b(?:no|pelo|usar|usando|abrir|abrindo)?\s*(?:link|site|pagina|contato|numero)\s+(?:oficial\s+)?que (?:eu|voce) (?:enviei|mandei|passei|compartilhei)\b|\bpelo link (?:que )?(?:eu|voce) (?:enviei|mandei)\b/;
const reportedClaim=/\b(?:oficial|seguro|confiavel|confirmad\w*|verificad\w*|conferid\w*|legitimo|verdadeiro)\b/;
const verificationIsNegated=text=>negatedVerification.test(text)||postposedNegatedVerification.test(text);
const refusalPhrase=/\b(?:prefiro (?:recusar|encerrar)|dispenso (?:a|essa) (?:oferta|proposta))\b/;
const socialAcknowledgement=/^(?:pode pa|pode crer|fechou|demorou|demoro|beleza|suave|aham|uhum|hum|hm|show|bora|certo|entendi|saquei|ok|esta bom|tranquilo)[.!? ]*$/;

// Interpretation describes evidence in a message. The engine separately owns
// consequences. No trust, item, permission or money is mutated here.
export function interpretMessage(text,a={},fallback=()=> 'unclear'){
 const t=normalizeMessage(text).replace(/\bnum (?=(?:vou|vo|quero|pretendo|posso|verific|confer|confirm|mand|envi|pass|compartilh)\w*\b)/g,'nao ');
 const clauses=t.split(/[.!;\n]+|,?\s+mas\s+|\s+e\s+(?=(?:me |nao |envie|mande|compartilhe|libere|instale|preencha|confira|verifique|confirme|consulte|procure|vou |prefiro |melhor |falar |perguntar |olhar ))/).map(c=>c.trim()).filter(Boolean);
 const result=(intent,evidence,ambiguous=false)=>({intent,evidence,ambiguous});
 const directClauses=clauses.filter(c=>!isReportedSpeech(c));
 const keepSecret=directClauses.some(c=>/\b(?:guarda|guarde|mantenha) (?:seus |suas |seu |sua |teus |tuas |teu |tua |o |a |os |as )?(?:dados|codigo|senha|cartao).*\b(?:segredo|privado|privados|so com voce)\b/.test(c));
 const protectedData=directClauses.some(c=>/\b(?:nao|nunca|nem)\b/.test(c)&&sensitive.test(c)&&/\b(?:compartilh\w*|envi\w*|mand\w*|pass\w*|liber\w*|fornec\w*|divulg\w*)\b/.test(c));
 const checking=directClauses.some(c=>verification.test(c)&&independent.test(c)&&!verificationIsNegated(c)&&!deferredVerification.test(c)&&!uncertainVerification.test(c)&&!selfSuppliedChannel.test(c));
 const requesting=directClauses.some(c=>!/\b(?:nao|nunca|nem)\b/.test(c)&&sensitive.test(c)&&/\b(?:me (?:manda|passe|passa|envie)|(?:envie|mande|compartilhe|libere|instale|preencha))\b/.test(c));
 const explicitRefusal=directClauses.some(c=>negatedRequest(c)||refusalPhrase.test(c));
 const reported=clauses.some(c=>isReportedSpeech(c));
 const reportedEvidence=clauses.some(c=>isReportedSpeech(c)&&(verification.test(c)||reportedClaim.test(c)||sensitive.test(c)));
 if(reportedEvidence&&!checking&&!protectedData&&!explicitRefusal)return result('unclear','Uma fala relatada ou boato não é verificação independente nem autoriza uma decisão.',true);
 if(uncertainVerification.test(t))return result('doubt','A verificação foi apresentada como possibilidade, não como decisão protetiva já tomada.',true);
 if(!explicitRefusal&&verification.test(t)&&(questionLike.test(t)||/\?\s*$/.test(t)))return result('question','Pergunta sobre como verificar, sem afirmar que uma verificação já aconteceu.');
 if(!explicitRefusal&&informalQuestion.test(t))return result('question','Pergunta informal identificada pelo sentido da frase.');
 if(socialAcknowledgement.test(t))return result('smalltalk','Anuência ou marcador curto de conversa; mantém o turno sem autorizar ação sensível.');
 if(!reported&&!/\b(?:nao|nunca|nem)\b/.test(t)&&/\b(?:eu (?:estou|vou) (?:te )?(?:enganar|roubar)|quero (?:te )?roubar|sou (?:um )?golpista)\b/.test(t))return result('confession','O jogador declarou intenção de enganar; não é um fato inferido de uma pergunta.');
 if(verification.test(t)&&selfSuppliedChannel.test(t))return result('unclear','O canal de verificação foi fornecido pelo próprio contato; sua origem ainda não foi confirmada de forma independente.',true);
 if(deferredVerification.test(t))return result('unclear','A ação sensível foi colocada antes ou sem a verificação; isso não conta como proteção.',true);
 if(verificationIsNegated(t)&&!checking)return result(requesting?'request':'unclear','A verificação foi negada na frase; não houve orientação protetiva.',!requesting);
 if(hypotheticalVerification.test(t))return /\?\s*$/.test(t)?result('question','A verificação foi apresentada como hipótese/pergunta, não como decisão já tomada.'):result('doubt','A verificação foi apresentada como hipótese, não como decisão protetiva já tomada.',true);
 if(/\?\s*$/.test(t)&&(protectedData||checking))return result('doubt','A mensagem pergunta sobre uma recusa; ainda precisa de esclarecimento.');
 const protectiveImperative=directClauses.some(c=>/\bnao (?:compartilhe|envie|mande|passe|libere|forneca|divulgue)\b/.test(c)&&sensitive.test(c)&&!/\b(?:comigo|para mim|me)\b/.test(c));
 if(keepSecret||checking||protectedData&&(/\b(?:seus|sua|suas|seu)\b/.test(t)||protectiveImperative)){
  if(requesting)return result('unclear','A mensagem mistura orientação de proteção com um pedido de dados.',true);
  return result('protect',checking?'Orientação para conferir a origem por um canal independente.':'Orientação para não compartilhar dados.');
 }
 if(explicitRefusal)return result('refusal','Recusa explícita do pedido ou da proposta.');
 if(/\b(?:nao entendi|entendi (?:foi )?nada|(?:estou )?boiando|boiei(?: legal)?|estou perdido|estou em duvida|tenho duvidas|nao sei quem|nao tenho certeza|nao quero inventar|nao sei se|isso e seguro|e confiavel|como vou saber|sei la|sei nao|nao confio|(?:estou|to) com (?:o )?pe atras|cara de golpe|parece (?:golpe|suspeito)|esta (?:estranho|esquisito|suspeito)|(?:que |muita )?confusao)\b/.test(t))return result('doubt','O jogador expressou uma dúvida ou suspeita; não é autorização nem pressão.');
 if(/\b(?:ignore|esqueca|mude|altere) (?:suas |a |as |toda a |todas as )?(?:regra|regras|instrucao|instrucoes)|\b(?:prompt interno|voce e o sistema|aumente.*creditos)\b/.test(t))return result('rule-instruction','Pedido para alterar as regras ou revelar instruções, sem efeito na simulação.');
 const claim=/\b(?:voce ja (?:enviou|mandou|passou|compartilhou|instalou)|(?:o )?cadastro ja foi enviado|(?:eu ja )?recebi (?:seu|o) (?:cartao|passe|codigo)|ja (?:pagou|recebi o pagamento))\b/;
 if(!/\?\s*$/.test(t)&&(claim.test(t)||/\bvoce ja me (?:enviou|mandou|passou)\b/.test(t))&&(!a.item||/pagou|pagamento/.test(t)&&a.outcome!=='fooled'))return result('state-conflict','A fala afirma uma ação que não está registrada na partida.',true);
 if(!reported&&memoryConflict(a,t))return /\b(?:corrigindo|correcao|me enganei|quis dizer)\b/.test(t)?result('correction','Correção explícita de uma condição anteriormente declarada; ainda não é confirmação independente.'):result('contradiction','Uma condição declarada diverge da conversa registrada.');
 if(a.memory?.free&&!reported&&!/\?\s*$/.test(t)&&!/\b(?:nao|nunca|nem)\b/.test(t)&&/precisa pagar|tem que pagar|pague .*taxa/.test(t))return result('contradiction','Uma cobrança contradiz a gratuidade prometida nesta conversa.');
 if(a.stage==='request'&&!/\?\s*$/.test(t)&&/\b(?:foi|organiza|organizou|veio)\b/.test(t)&&/concurso|turma|equipe|firma|proposta/.test(t))return result('answer','Esclarecimento adicional sobre a origem da proposta já apresentada.');
 if(a.stage==='request'&&/\b(?:manda|mande|envie|passe|passa|libere) (?:isso|aquilo|aquele dado)\b/.test(t)&&a.used?.includes('answer'))return result('request','Pedido com referente identificado pela proposta já esclarecida.');
 if(/\b(?:futebol|choveu|filme|onibus|minha viagem|almoco)\b/.test(t)&&!sensitive.test(t))return result('offtopic','Assunto sem ligação demonstrada com a proposta.');
 if(a.stage==='question'&&/\bnao (?:tem|ha|existe) (?:uma )?taxa\b/.test(t))return result('answer','Esclarecimento de que não existe uma cobrança; continua sendo uma afirmação do jogador.');
 const local=fallback();
 if(local==='pressure'&&/\bnao (?:e |esta |tem )?(?:urgente|pressa|precisa.*agora)\b/.test(t))return result('unclear','A frase negou urgência; não demonstra pressão.',true);
 if(local==='contradiction'&&!/\b(?:vamos falar|mudei|troque|em vez|agora (?:e|quero))\b/.test(t))return result('offtopic','A fala menciona outro assunto; isso não comprova contradição.');
 if(local==='unclear'&&/\b(?:futebol|choveu|filme|onibus|minha viagem|almoco)\b/.test(t))return result('offtopic','Assunto sem ligação demonstrada com a proposta.');
 return result(local,local==='unclear'?'Não há sentido suficiente para decidir a ação.':'Intenção identificada no contexto da proposta.',local==='unclear');
}
