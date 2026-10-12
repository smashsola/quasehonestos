import {demandingCaller,sharingThreshold} from './dialogue-balance.js';
import {normalizeMessage,isReportedSpeech} from './language.js';
import {generatedDialogueSafe} from './dialogue-safety.js';
import {statedFacts} from './conversation-memory.js';
import {repetitionReason} from './dialogue-diagnostics.js';
import {turnAgenda} from './turn-agenda.js';
export function replyAnswersCurrentQuestion(text,history,context){
 const question=normalizeMessage(history.findLast(m=>m.speaker==='Você')?.text||'');
 const reply=normalizeMessage(text);
 const agenda=context.agenda?.questions||turnAgenda(context,question).questions;
 const checks={waiting:/aguard|suspend|esper|paus|nao.*(?:dados|decidir|compartilh)|ate confirmar|manteria.*duvida/,change:/antes|mud|condicao|versao|correcao/,payment:context.operationCompleted?/confirm|conclu|pag/:/nao|nenhum|sem/,session:/sessao|computador|acesso/,agreement:/autoriza|concord|aceit|interesse/,events:/registr|nenhum|apenas|conversa|item|operacao/,goal:/quero|duvida|falta|precis|entender/,alternative:/sem|antes|confer|alternativ|outro/,definition:/informa|nome|telefone|enderec|organizacao|programa|permiss|imita|mensagem|pagina/};
 for(const topic of agenda){
  if(checks[topic]&&!checks[topic].test(reply))return false;
  if(topic==='change'&&context.facts?.lastConflict){
   for(const value of [context.facts.lastConflict.previous,context.facts.lastConflict.current]){
    const normalized=normalizeMessage(value);
    if(/^(?:gratis|gratuit[oa])$/.test(normalized)?!/gratis|gratuit|sem (?:custo|taxa|cobranca)/.test(reply):!reply.replace(/c\$\s*/g,'c$').includes(normalized.replace(/c\$\s*/g,'c$')))return false;
   }
  }
  const alias=context.facts?.lastConflict?.key==='alias'&&context.facts.lastConflict.status==='pending'?context.facts.lastConflict.current:context.facts?.claims?.alias;
  if(topic==='alias'&&alias&&!reply.includes(normalizeMessage(alias)))return false;
  if(topic==='risk'){
   const effect={prize:/retir|moviment|desvi|gast|usar.*cart|perder.*credit/,link:/retir|moviment|desvi|gast|usar.*cart|dados.*(?:quem|pessoa|terceir)/,support:/arquiv|pagamento|acesso.*computador/,update:/perfil|contato|rotina|arquiv/,club:/acesso.*clube|passe.*acesso|entrar.*clube/}[context.scheme]||/retir|moviment|desvi|gast|acesso|perfil|dados/;
   if(!effect.test(reply))return false;
   if(/premio/.test(question)&&!/nao (?:prova|comprova|confirma|garante)|nao.*(?:origem|quem|segur)|sem.*confirm/.test(reply))return false;
  }
  if(topic==='opening'&&context.proposal&&(!reply.includes(normalizeMessage(context.proposal.name))||/\bnao (?:lembro|vi|recebi|apresentou|mencionou)|nenhum certificado|nenhum convite/.test(reply)))return false;
  if(topic==='delivery'){
   const pending=context.facts?.lastConflict,price=pending?.key==='deliveryPrice'&&pending.status==='pending'?pending.current:context.facts?.claims?.deliveryPrice;
   if(price&&!(price==='grátis'?/gratis|gratuit|sem (?:custo|cobranca|taxa)/.test(reply):reply.replace(/c\$\s*/g,'c$').includes(normalizeMessage(price).replace(/c\$\s*/g,'c$'))))return false;
  }
  if(['benefit','deadline'].includes(topic)&&context.facts?.claims?.[topic]&&!reply.includes(normalizeMessage(context.facts.claims[topic])))return false;
 }
 if(/verific|confer|confirm|checar/.test(question)&&/como|sem depender|o que voce faria/.test(question)){
  if(!/procur|busc|compar|pedir.*ajuda|aguard|suspend|esper|canal.*conhec|contato.*conhec|loja.*uso/.test(reply))return false;
  if(/enquanto|ate la/.test(question)&&!/aguard|suspend|esper|nao.*(?:dados|decidir|compartilh)|ate confirmar/.test(reply))return false;
 }
 if(/lembra|tinha prometido|eu disse/.test(question)||/qual.*beneficio.*prazo/.test(question)){
  for(const key of ['benefit','deadline']){
   if((key==='benefit'?/beneficio|promet/:/prazo/).test(question)&&context.facts?.claims?.[key]&&!reply.includes(normalizeMessage(context.facts.claims[key])))return false;
  }
 }
 return true;
}

// Bounded reason codes are safe diagnostic metadata; never include model text.
export function groundingRejectionReason(text,history,reference,context){
 if(!generatedDialogueSafe(text))return 'unsafe-language';
 const question=history.findLast(m=>m.speaker==='Você')?.text||'';
 if(normalizeMessage(text)===normalizeMessage(question))return 'player-echo';
 const normalized=normalizeMessage(text),alias=context.facts?.claims?.alias;
 if(alias&&((normalized.includes(normalizeMessage(alias))&&/voce nao (?:me )?(?:disse|informou|falou|contou)\b/.test(normalized))||/nao (?:sei|lembro|conheco) (?:o |seu |o seu )?nome/.test(normalized)))return 'unsupported-memory-denial';
 if(context.proposal&&/o que (?:eu )?ganhei mesmo|o que (?:esta sendo oferecido|voce esta me oferecendo)/.test(normalized))return 'presented-proposal-ignored';
 if(context.lastIntent==='correction'){
  const corrected=statedFacts(question),reply=normalizeMessage(text);
  for(const key of ['benefit','deadline','alias','deliveryPrice'])if(corrected[key]&&!reply.replace(/c\$\s*/g,'c$').includes(normalizeMessage(corrected[key]).replace(/c\$\s*/g,'c$'))&&!(key==='deliveryPrice'&&corrected[key]==='grátis'&&/gratis|gratuit|sem (?:custo|taxa|cobranca)/.test(reply)))return 'unanswered-correction';
 }
 if(context.facts?.claims?.origin&&/\bquem (?:organiza|organizou|oferece|e o responsavel)\b/.test(normalizeMessage(text))&&!/voce (?:mencionou|disse|explicou)|ainda nao confirmou/.test(normalizeMessage(text)))return 'resolved-question-repeated';
 if(context.facts?.unknownOrigin&&/\bquem (?:organiza|organizou|oferece|e o responsavel)\b/.test(normalized)&&!/(?:nao sabe|nao sabemos|desconhecid|em aberto)/.test(normalized))return 'unknown-origin-repeated';
 if(/\b(?:hoje|ontem)\b/.test(normalizeMessage(text))&&/antes|anterior|voce disse|voce falou/.test(normalizeMessage(text))&&!/\b(?:hoje|ontem)\b/.test(normalizeMessage(history.filter(l=>l.speaker==='Você').map(l=>l.text).join(' ')+' '+JSON.stringify(context.facts?.ledger||[]))))return 'unsupported-attribution';
 const recall=/lembra|repete|repetir|tinha prometido|qual.*(?:beneficio|prazo)/.test(normalizeMessage(question));
 if(!recall&&history.filter(m=>!['Você','Sistema'].includes(m.speaker)).slice(-4).some(m=>normalizeMessage(m.text)===normalizeMessage(text)))return 'repetition';
 const repeated=repetitionReason(text,history,question);if(repeated)return repeated;
 if(/voce (?:prometeu|garantiu)/.test(normalizeMessage(text))&&!context.facts?.promises?.length)return 'unsupported-attribution';
 if(!replyAnswersCurrentQuestion(text,history,context))return 'unanswered-question';
 return replyIsGrounded(text,history,reference,context)?null:'state-or-fact-conflict';
}

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
 const currentQuestion=normalizeMessage(history.findLast(m=>m.speaker==='Você')?.text||'');
 if(normalized===currentQuestion)return false;
 if(context.rejectedMethods?.includes('installation')&&asserts(lexical,/\b(?:instale|baixe|vou instalar|pode instalar|vamos instalar)\b/))return false;
 if(context.lastIntent==='state-conflict'&&!context.operationCompleted&&/pag|transfer|deposit/.test(currentQuestion)&&/comprovante|recibo/.test(normalized))return false;
 const requestedRecall=/lembra|repete|repetir|tinha prometido|qual.*(?:beneficio|prazo)/.test(currentQuestion);
 if(!requestedRecall&&history.filter(m=>m.speaker!=='Você').slice(-4).some(m=>normalizeMessage(m.text)===normalized))return false;
 if(repetitionReason(text,history,history.findLast(m=>m.speaker==='Você')?.text)||!replyAnswersCurrentQuestion(text,history,context))return false;
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
 if(claimed.origin&&claimed.origin!==established.origin&&!(claimed.origin===context.facts?.claims?.origin&&/voce|sua explicacao|segundo/.test(normalized)))return false;
 const amountKey=value=>value.replace(/\s+/g,'').replace(',','.');
 const allowedAmounts=new Set((reference.match(/C\$\s*\d+(?:[.,]\d+)?/g)||[]).map(amountKey));
 if((text.match(/C\$\s*\d+(?:[.,]\d+)?/g)||[]).some(value=>!allowedAmounts.has(amountKey(value))))return false;
 return true;
}
// Negation is scoped to each clause, so “não enviei, mas instalei” still asserts
// the second action. A question or conditional plan is not a completed action.
function asserts(text,pattern){return text.split(/[.!?;,]|\b(?:mas|porem|so que|e)\b/).some(clause=>{if(isReportedSpeech(clause))return false;const match=pattern.exec(clause);if(!match)return false;const before=clause.slice(0,match.index);return !/\b(?:nao|nem|nunca)\s+(?:(?!so\b)[a-z]+\s+){0,3}$/.test(before)&&!/\b(?:se|caso|talvez|eu verificaria|eu conferiria)\b/.test(before);});}
