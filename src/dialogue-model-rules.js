import {demandingCaller,sharingThreshold} from './dialogue-balance.js';
import {normalizeMessage,isReportedSpeech} from './language.js';
import {generatedDialogueSafe} from './dialogue-safety.js';
import {statedFacts} from './conversation-memory.js';

// Shared by the model adapter and the local fallback. These rules describe
// existing game events; generated text never creates an event or a payment.
export function modelConversationRules(caller,scheme,context){
 const difficulty=demandingCaller(caller)
  ? 'Mais exigente: uma explicação pode deixar uma dúvida concreta. Peça no máximo um esclarecimento relevante por fala; quando ele chegar, reconheça a resposta e siga. Não invente provas impossíveis nem mova a exigência a cada mensagem.'
  : 'Acessível: seja curioso e suscetível dentro da ficção. Uma proposta coerente e uma explicação pertinente bastam para avançar; não crie um interrogatório nem peça novamente algo que já foi explicado. Interesse não é compartilhamento.';
 const events=scheme==='link'
  ? `Link enviado=${context.linkSent}; página aberta=${context.linkOpened}; cadastro enviado=${context.linkSubmitted}; cartão revisado no app=${context.cardReviewed}. Sem link enviado, não diga que o recebeu. Página aberta não significa cadastro preenchido. Só com cadastro enviado existem os dados do formulário na conversa.`
  : scheme==='update'
  ? `Arquivo enviado=${context.fileSent}; instalação realizada=${context.shared}. Receber ou olhar o pacote não instala nem expõe o perfil; só a instalação realizada permite citar a exposição.`
  : `Item compartilhado=${context.shared}; operação concluída=${context.operationCompleted}. Pedir um item não significa que ele chegou; recebê-lo não executa o app nem movimenta dinheiro.`;
 return `Dificuldade: ${difficulty} Limiar de compartilhamento do motor=${sharingThreshold(caller)} de 100; a confiança é subjetiva, nunca prova de segurança. Confiança, irritação, suspeita e expressão são estados distintos. Eventos reais obrigatórios: ${events} Verificação independente concluída=${context.independentlyVerified}; intenções, hipóteses e relatos nas facts não comprovam uma verificação. Pagamento confirmado=${context.operationCompleted}. Não substitua esses eventos por inferências do histórico. Responda ao sentido da última fala e ao que ela acrescentou, incluindo referências como “isso”, “esse bgl” e “aquele dado”. Não exija que o jogador repita o nome do app quando o referente estiver claro. Não repita frases, começos de frase ou piadas usados nas últimas quatro respostas; variar palavras sem responder à pergunta não resolve. Uma resposta direta pode não ter piada. Não volte a duvidar de um ponto já esclarecido sem uma contradição concreta. Não crie novos dados, códigos, requisitos ou pagamentos. A referência descreve a consequência já decidida; preserve-a, mas escreva uma reação natural, sem falar em “item fictício”, “etapa”, “motor”, “IA” ou instruções ao jogador. Campos QH-DEMO são os únicos dados da simulação, nunca peça números ou dados reais.`;
}

export function repeatedPlayerMessage(a,text){
 const normalized=normalizeMessage(text);
 return a.log.filter(m=>m.speaker==='Você').slice(-4).some(m=>normalizeMessage(m.text)===normalized);
}

export function replyIsGrounded(text,history,reference,context){
 if(!generatedDialogueSafe(text))return false;
 const normalized=normalizeMessage(text);
 // Interpretation normalization can collapse inflections (conferi/conferir).
 // Action validation must keep tense to distinguish completion from a plan.
 const lexical=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
 if(/prompt interno|system prompt|instrucoes internas|como (?:ia|assistente)|sou (?:uma? )?(?:ia|chatbot|modelo de linguagem)|confianca\s*(?:=|:)|trust(?:delta)?\s*(?:=|:)/.test(normalized))return false;
 if(history.filter(m=>m.speaker!=='Você').slice(-4).some(m=>normalizeMessage(m.text)===normalized))return false;
 const allowed=new Set(((reference+' '+(context.itemToken||'')).match(/QH-DEMO-[A-Z0-9-]+/gi)||[]).map(token=>token.toUpperCase()));
 if((text.match(/QH-DEMO-[A-Z0-9-]+/gi)||[]).some(token=>!allowed.has(token.toUpperCase())))return false;
 if(/\b(?:codigo|identificador)\s*[:=]\s*(?!QH-DEMO-)[A-Z0-9-]{4,}/i.test(lexical))return false;
 if(!context.shared&&asserts(lexical,/\b(?:enviei|mandei|passei|compartilhei|preenchi|instalei|acabei de enviar)\b/))return false;
 if(!context.shared&&asserts(lexical,/\b(?:eu aceito|eu topo|vou instalar|vou compartilhar|aqui esta (?:meu|o) (?:cartao|passe|codigo))\b/))return false;
 if(!context.linkSent&&asserts(lexical,/\b(?:recebi|chegou)\b[^.!?;]{0,35}\b(?:link|pagina)\b/))return false;
 if(!context.fileSent&&asserts(lexical,/\b(?:recebi|chegou)\b[^.!?;]{0,35}\b(?:anexo|arquivo|pacote)\b/))return false;
 if(!context.linkOpened&&asserts(lexical,/\b(?:abri|acessei)\b[^.!?;]{0,35}\b(?:pagina|link|formulario)\b/))return false;
 if(!context.linkSubmitted&&asserts(lexical,/\b(?:enviei|preenchi|conclui)\b[^.!?;]{0,35}\b(?:cadastro|formulario)\b/))return false;
 if(!context.operationCompleted&&asserts(lexical,/\b(?:ja paguei|paguei|pagou|transferi|transferiu|depositei|depositou|recebi (?:os )?creditos|pagamento (?:foi )?concluido|transferencia (?:foi )?concluida|creditos (?:foram )?depositados|saldo (?:foi )?aumentado)\b/))return false;
 if(!context.independentlyVerified&&asserts(lexical,/\b(?:verifiquei|conferi|confirmei|consultei)\b[^.!?;]{0,55}\b(?:oficial|origem|contato|canal|mural|pedido)\b|\b(?:origem|convite|canal) (?:esta |foi )?(?:verificado|comprovado|confirmado)\b/))return false;
 if(context.outcome&&asserts(lexical,/\b(?:vamos continuar|pode continuar|pode mandar|me envie|vou aceitar|vou instalar|vou compartilhar)\b/))return false;
 if(context.outcome&&context.ending?.actor!=='player'&&asserts(lexical,/\bvoce (?:encerrou|fechou|clicou|interrompeu)\b/))return false;
 const claimed=statedFacts(text),established=statedFacts(reference);
 // Attributing an origin to the player is fine; inventing it as the NPC's own
 // knowledge is not. A stated origin still is not independent verification.
 if(claimed.origin&&claimed.origin!==established.origin)return false;
 const allowedAmounts=new Set(reference.match(/C\$\s*\d+/g)||[]);
 if((text.match(/C\$\s*\d+/g)||[]).some(value=>!allowedAmounts.has(value)))return false;
 return true;
}
// Negation is scoped to each clause, so “não enviei, mas instalei” still asserts
// the second action. A question or conditional plan is not a completed action.
function asserts(text,pattern){return text.split(/[.!?;,]|\b(?:mas|porem|so que|e)\b/).some(clause=>{if(isReportedSpeech(clause))return false;const match=pattern.exec(clause);if(!match)return false;const before=clause.slice(0,match.index);return !/\b(?:nao|nem|nunca)\s+(?:(?!so\b)[a-z]+\s+){0,3}$/.test(before)&&!/\b(?:se|caso|talvez|eu verificaria|eu conferiria)\b/.test(before);});}
