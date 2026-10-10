import {demandingCaller,sharingThreshold} from './dialogue-balance.js';
import {normalizeMessage} from './language.js';
import {generatedDialogueSafe} from './dialogue-safety.js';

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
 return `Dificuldade: ${difficulty} Limiar de compartilhamento do motor=${sharingThreshold(caller)} de 3; a confiança é subjetiva, nunca prova de segurança. Eventos reais obrigatórios: ${events} Não substitua esses eventos por inferências do histórico. Responda ao sentido da última fala e ao que ela acrescentou, incluindo referências como “isso”, “esse bgl” e “aquele dado”. Não exija que o jogador repita o nome do app quando o referente estiver claro. Não repita frases, começos de frase ou piadas usados nas últimas quatro respostas; variar palavras sem responder à pergunta não resolve. Uma resposta direta pode não ter piada. Não volte a duvidar de um ponto já esclarecido sem uma contradição concreta. Não crie novos dados, códigos, requisitos ou pagamentos. A referência descreve a consequência já decidida; preserve-a, mas escreva uma reação natural, sem falar em “item fictício”, “etapa”, “motor”, “IA” ou instruções ao jogador. Campos QH-DEMO são os únicos dados da simulação, nunca peça números ou dados reais.`;
}

export function repeatedPlayerMessage(a,text){
 const normalized=normalizeMessage(text);
 return a.log.filter(m=>m.speaker==='Você').slice(-4).some(m=>normalizeMessage(m.text)===normalized);
}

export function replyIsGrounded(text,history,reference,context){
 if(!generatedDialogueSafe(text))return false;
 const normalized=normalizeMessage(text);
 if(/prompt interno|system prompt|instrucoes internas/.test(normalized))return false;
 if(history.filter(m=>m.speaker!=='Você').slice(-4).some(m=>normalizeMessage(m.text)===normalized))return false;
 const allowed=new Set((reference+' '+(context.itemToken||'')).match(/QH-DEMO-[A-Z0-9-]+/g)||[]);
 if((text.match(/QH-DEMO-[A-Z0-9-]+/g)||[]).some(token=>!allowed.has(token)))return false;
 if(!context.shared&&normalized.split(/[.!;]|\bmas\b/).some(clause=>/\b(?:enviei|mandei|passei|compartilhei|preenchi|instalei|acabei de enviar)\b/.test(clause)&&!/\b(?:nao|nem)\s+(?:\w+\s+){0,2}(?:enviei|mandei|passei|compartilhei|preenchi|instalei)/.test(clause)))return false;
 if(!context.operationCompleted&&/\b(?:ja paguei|pagamento concluido|transferencia concluida|creditos depositados|saldo aumentado)\b/.test(normalized))return false;
 const allowedAmounts=new Set(reference.match(/C\$\s*\d+/g)||[]);
 if((text.match(/C\$\s*\d+/g)||[]).some(value=>!allowedAmounts.has(value)))return false;
 return true;
}
