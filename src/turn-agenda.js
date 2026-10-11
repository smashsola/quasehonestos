// A compact description of the player's turn, not model reasoning or game authority.
import {normalizeMessage,messageClauses,isQuestionClause,isReportedSpeech,isHypotheticalClause} from './language.js';
export function requestedExit(text){return messageClauses(text).some(c=>!isReportedSpeech(c)&&!isHypotheticalClause(c)&&!isQuestionClause(c)&&/\b(?:(?:quero|vou) sair(?=\s*(?:[.,!]|$)|\s+(?:do jogo|da conversa|deste atendimento)\b)|(?:quero|pode) encerrar(?=\s*(?:[.,!]|$)|\s+(?:a conversa|o atendimento|o jogo)\b)|quero terminar a conversa|pare a conversa|encerrar agora)\b/.test(c)&&!/\b(?:nao|nunca|nem)\b/.test(c));}
export function reconsideredMethod(text){
 const t=messageClauses(text).filter(c=>!isReportedSpeech(c)&&!isHypotheticalClause(c)&&!isQuestionClause(c)).join(' ');if(/\b(?:nao|nunca|nem)\b/.test(t)||!/\b(?:mudei de ideia|mudei de opiniao|agora aceito|agora quero)\b/.test(t))return null;
 if(/instalar|baixar/.test(t))return 'installation';if(/abrir.*link/.test(t))return 'link';if(/sessao|acesso remoto/.test(t))return 'remote';if(/enviar.*cartao/.test(t))return 'card';return null;
}
export function methodRefusal(text,scheme){
 const t=normalizeMessage(text),clauses=messageClauses(text).filter(c=>!isReportedSpeech(c)&&!isHypotheticalClause(c));
 const rejected=clauses.find(c=>/\b(?:nao quero|nao vou|prefiro nao|quero nao)\b.*\b(?:esse metodo|essa opcao|esse jeito|instalar|baixar|abrir (?:esse |o )?link|acesso remoto|enviar (?:o |meu )?cartao)\b/.test(c));
 if(!rejected||/\b(?:nao quero participar|nao quero continuar|quero sair)\b/.test(t))return null;
 if(!/esse metodo|essa opcao|esse jeito/.test(rejected)&&!/quero continuar|quero entender|outr[ao] (?:opcao|jeito|metodo)|alternativa/.test(t))return null;
 return {method:/instal|baixar|arquivo/.test(rejected)?'installation':/link/.test(rejected)?'link':/remoto|sessao/.test(rejected)?'remote':/cartao/.test(rejected)?'card':({update:'installation',link:'link',support:'remote',prize:'card',club:'pass'})[scheme],continued:/\b(?:quero continuar|quero entender|outra opcao|outro jeito|outro metodo|alternativa)\b/.test(t)};
}
export function attributionRepair(a,text){
 const t=normalizeMessage(text);
 if(!/\b(?:voce disse|voce afirmou|voce entendeu|voce confundiu|nao foi isso que eu disse|voce se enganou)\b/.test(t)||!/\b(?:mas|nao|corrig|confund|engano|errou|errada)\w*/.test(t))return null;
 const last=(a.log||[]).filter(l=>!['Você','Sistema'].includes(l.speaker)).at(-1);
 const payment=/pag|transfer|deposit/.test(t)&&last&&/voce.*(?:pag|transfer|deposit)/.test(normalizeMessage(last.text));
 const turn=(a.log||[]).filter(l=>l.speaker==='Você').length;
 return {topic:payment?'payment':'attribution',matched:!!last&&/voce (?:disse|afirmou|falou)|segundo voce/.test(normalizeMessage(last.text)),characterText:last?.text?.slice(0,200)||null,turn};
}
export function turnAgenda(a,text=(a.log||[]).findLast(l=>l.speaker==='Você')?.text||''){
 const questionClauses=messageClauses(text).filter(isQuestionClause);
 const t=normalizeMessage(questionClauses.join(' ')),topics=[];
 const add=topic=>{if(!topics.includes(topic))topics.push(topic);};
 if(/meu nome|meu apelido|como me apresentei|como me chamo/.test(t))add('alias');
 if(/certificado|qual convite|qual proposta|qual premio.*(?:abertura|apresentei)|qual.*(?:abertura|proposta inicial)/.test(t))add('opening');
 if(/(?:confirma|prova|garante).*(?:premio|convite|oferta|proposta).*(?:existe|legitim|verdade)|(?:premio|convite|oferta|proposta).*(?:legitim|verdade)/.test(t))add('legitimacy');
 if(/entrega|frete|envio/.test(t)&&/quanto|qual|cobrei|cobrou|cobrava|custa|gratis|gratuito/.test(t))add('delivery');
 if(/beneficio|promet|ganharia|vou ganhar/.test(t)&&/qual|o que|lembra|disse/.test(t))add('benefit');
 if(/prazo|quando/.test(t)&&/qual|quando|lembra|disse/.test(t))add('deadline');
 if(/como.*(?:verific|confer|confirm)|(?:quero|queria) entender.*verific|sem depender|qual (?:canal|fonte)/.test(t))add('verification');
 if(/enquanto.*esper|ate la|sem (?:um )?canal conhecido|nao encontrar.*canal/.test(t))add('waiting');
 if(/qual parte mudou|o que mudou|voce se contradisse|qual (?:versao|condicao).*vale/.test(t))add('change');
 if(/pagamento.*(?:confirm|ocorreu|aconteceu)|(?:pagou|paguei|transferiu).*[?]|recebeu.*(?:creditos|pagamento)|ja.*pag.*lembra/.test(t))add('payment');
 if(/sessao.*(?:abriu|aberta|abre)|(?:abriu|aberta).*sessao/.test(t))add('session');
 if(/(?:voce )?ja (?:concordou|aceitou|autorizou)|voce tinha concordado/.test(t))add('agreement');
 if(/qual acao.*registr|o que.*(?:aconteceu|confirmado|registrado)/.test(t))add('events');
 if(/o que.*(?:quer entender|continua faltando|falta esclarecer)|qual.*(?:duvida|objetivo)|proximo passo/.test(t))add('goal');
 if(/(?:o que|como).*sem instalar|outro metodo|outra opcao|outro jeito|alternativa/.test(t))add('alternative');
 if(/quem.*(?:organiza|organizou|responsavel)|de onde.*(?:proposta|convite|premio)/.test(t))add('origin');
 if(/\bquanto\b|qual custo|qual valor/.test(t)&&!topics.includes('delivery'))add('cost');
 if(/posso sair|como (?:sair|encerrar)|onde.*encerrar/.test(t))add('exit-options');
 return {questions:topics.slice(0,6),questionClauses:questionClauses.map(c=>c.slice(0,140)).slice(0,4),method:methodRefusal(text,a.scheme),repair:attributionRepair(a,text),requestedExit:requestedExit(text)};
}
