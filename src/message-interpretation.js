import {normalizeMessage,negatedRequest,isReportedSpeech,messageClauses,isQuestionClause,isHypotheticalClause} from './language.js';
import {memoryConflict,statedFacts,pendingQuestion,answersPendingQuestion,repeatedMeaning} from './conversation-memory.js';

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
const checksInClause=c=>verification.test(c)&&(independent.test(c)||/\b(?:confer\w*|confir\w*|verific\w*|confirm\w*|consult\w*|chec\w*|pesquis\w*|buscar confirmacao|pedir confirmacao)\b/.test(c));
const declaredPastCheck=/\b(?:ja )?(?:conferi|verifiquei|confirmei|consultei|pesquisei|procurei|chequei|olhei|conferiu|verificou|confirmou)\b/;
function claimedActionMismatch(a,clause){
 if(isQuestionClause(clause)||isReportedSpeech(clause)||isHypotheticalClause(clause)||/\b(?:nao|nem|nunca)\b.*\b(?:pagou|paguei|enviou|enviei|mandou|mandei|recebi|instalou|preencheu|abriu)\b/.test(clause))return false;
 const payment=/\b(?:ja (?:te |lhe |me )?(?:paguei|pagou)|(?:eu )?(?:ja )?recebi (?:o |seu )?pagamento|pagamento (?:foi |esta )?(?:feito|concluido))\b/.test(clause);
 if(payment&&!a.paymentCompleted&&a.outcome!=='fooled')return true;
 if(/\b(?:voce (?:ja )?instalou|o pacote (?:ja )?foi instalado)\b/.test(clause)&&!(a.scheme==='update'&&a.item))return true;
 if(/\b(?:cadastro|formulario) (?:ja )?foi (?:enviado|preenchido)|\bvoce (?:ja )?(?:preencheu|enviou) (?:o |seu )?(?:cadastro|formulario)\b/.test(clause)&&!a.linkSubmitted)return true;
 if(/\b(?:voce (?:ja )?abriu (?:a pagina|o link)|(?:a pagina|o link) (?:ja )?abriu)\b/.test(clause)&&!a.linkOpened)return true;
 if(/\b(?:eu (?:ja )?)?(?:enviei|mandei) (?:o |um )?link\b/.test(clause)&&!a.linkSent)return true;
 if(/\b(?:eu (?:ja )?)?(?:enviei|mandei) (?:o |um )?(?:arquivo|pacote|anexo)\b/.test(clause)&&!a.fileSent)return true;
 if(/\bvoce (?:ja )?(?:me )?(?:enviou|mandou|passou|compartilhou)|\b(?:eu (?:ja )?)?recebi (?:seu|o) (?:cartao|passe|codigo)\b/.test(clause)&&!a.item)return true;
 return false;
}
const proposalTopics={prize:/\b(?:premio|premiacao|concurso|batata|trofeu|torneio|evento)\b/,club:/\b(?:clube|colher|convite|associacao|passe|organiza\w*|grupo)\b/,support:/\b(?:suporte|paoos|computador|sessao|chamado|problema|defeito|atendimento)\b/,update:/\b(?:skin|skins|arquivo|pacote|permis\w*|perfil|contato|rotina|blaster|changer|instal\w*)\b/,link:/\b(?:link|pagina|cadastro|resgate|pontos|cartao|batatapay|formulario)\b/};
const uncertaintyPattern=/\b(?:nao sei|sei nao|sei la|nao entendi|entendi (?:foi )?nada|boian\w*|boiei|nao tenho certeza|nao quero inventar|duvid\w*|confus\w*|estranh\w*|esquisit\w*|suspeit\w*|pe atras|cara de golpe|parece golpe|nao confio)\b/;
function verificationSignal(clauses){
 const relevant=clauses.filter(checksInClause);
 const own=relevant.filter(c=>!isReportedSpeech(c));
 if(own.some(c=>verificationIsNegated(c)||deferredVerification.test(c)))return 'negated';
 if(own.some(c=>isHypotheticalClause(c)))return 'hypothetical';
 if(own.some(c=>declaredPastCheck.test(c)))return 'reported';
 if(own.some(c=>independent.test(c)&&!selfSuppliedChannel.test(c)&&!isQuestionClause(c)&&/\b(?:vou|quero|prefiro|confiro|verifico|confirmo|consulto|procuro|olho|vejo|busco)\b/.test(c)))return 'intended';
 if(own.some(c=>independent.test(c)&&!selfSuppliedChannel.test(c)&&!isQuestionClause(c)))return 'suggested';
 if(relevant.some(c=>isReportedSpeech(c)))return 'reported';
 return 'none';
}
function structuredAnalysis(text,a,clauses,intent,ambiguous){
 const t=normalizeMessage(text),direct=clauses.filter(c=>!isReportedSpeech(c));
 const pressure=direct.some(c=>!/^.*?\b(?:nao|sem) (?:e |esta |tem |precisa |decidir )?(?:urgente|pressa|precisa|agora)\b/.test(c)&&(/\b(?:tem que|preciso|mande|manda|envie|decida|faca|passe|passa|libere)\b.*\b(?:agora|rapido|imediatamente)\b|\b(?:nao tem tempo|acaba hoje|ultimos segundos|em \d+ segundos)\b/.test(c)));
 const hostility=direct.some(c=>/\b(?:idiota|burro|burra|otario|imbecil|trouxa|cala a boca|te odeio|seu merda|sua merda|seu bosta|sua bosta)\b/.test(c)&&!/\bnao (?:e |sou |seja |acho (?:voce )?)(?:um |uma )?(?:idiota|burro|burra|otario|imbecil|trouxa)\b/.test(c));
 const facts=statedFacts(text),answersQuestion=answersPendingQuestion(a,text),question=pendingQuestion(a),uncertainty=intent==='doubt'||uncertaintyPattern.test(t)||clauses.some(isHypotheticalClause);
 const rapport=/\b(?:voce tem razao|entendo (?:sua|a sua)|respeito (?:sua|a sua)|boa pergunta)\b/.test(t)?2:/\b(?:oi|ola|bom dia|boa tarde|boa noite|pode pa|pode crer|fechou|beleza|suave|aham|uhum|valeu|obrigad\w*|desculp\w*|foi mal|k{2,}|haha)\b/.test(t)?1:0;
 const semanticIntent=['protect','refusal','doubt','question','pressure','hostile','apology','rule-instruction','state-conflict','confession','correction','contradiction','request','wrong-item'].includes(intent);
 const relevant=semanticIntent||answersQuestion||proposalTopics[a.scheme]?.test(t);
 const partial=question&&!answersQuestion&&(Object.keys(facts).length>0||isReportedSpeech(t));
 const repetition=repeatedMeaning(a,text,intent);
 const relevance=intent==='offtopic'?'unrelated':partial?'partial':relevant?'relevant':['chat','smalltalk'].includes(intent)?'partial':'unclear';
 const clarity=ambiguous?'unclear':partial?'partial':intent==='unclear'?'unclear':'clear';
 return {intent,relevance,clarity,consistency:intent==='contradiction'?'contradiction':intent==='correction'?'correction':['unclear','doubt','state-conflict'].includes(intent)?'unknown':'consistent',rapport,pressure,hostility,uncertainty,verification:verificationSignal(clauses),repetition,topicShift:intent==='offtopic'||/\b(?:muda|mude|troca|troque|vamos mudar) (?:de )?assunto\b/.test(t),answersQuestion};
}

// Interpretation describes evidence in a message. The engine separately owns
// consequences. No trust, item, permission or money is mutated here.
export function interpretMessage(text,a={},fallback=()=> 'unclear'){
 const t=normalizeMessage(text).replace(/\bnum (?=(?:vou|vo|quero|pretendo|posso|verific|confer|confirm|mand|envi|pass|compartilh)\w*\b)/g,'nao ');
 const clauses=messageClauses(t);
 const result=(intent,evidence,ambiguous=false)=>({intent,evidence,ambiguous,analysis:structuredAnalysis(text,a,clauses,intent,ambiguous)});
 const directClauses=clauses.filter(c=>!isReportedSpeech(c));
 const lexical=fallback();
 const keepSecret=directClauses.some(c=>/\b(?:guarda|guarde|mantenha) (?:seus |suas |seu |sua |teus |tuas |teu |tua |o |a |os |as )?(?:dados|codigo|senha|cartao).*\b(?:segredo|privado|privados|so com voce)\b/.test(c));
 const protectedData=directClauses.some(c=>/\b(?:nao|nunca|nem)\b/.test(c)&&sensitive.test(c)&&/\b(?:compartilh\w*|envi\w*|mand\w*|pass\w*|liber\w*|fornec\w*|divulg\w*)\b/.test(c));
 const checking=directClauses.some(c=>verification.test(c)&&independent.test(c)&&!verificationIsNegated(c)&&!deferredVerification.test(c)&&!isHypotheticalClause(c)&&!declaredPastCheck.test(c)&&!selfSuppliedChannel.test(c));
 const requesting=directClauses.some(c=>!/\b(?:nao|nunca|nem)\b/.test(c)&&sensitive.test(c)&&/\b(?:me (?:manda|passe|passa|envie)|(?:envie|mande|compartilhe|libere|instale|preencha))\b/.test(c));
 const explicitRefusal=directClauses.some(c=>negatedRequest(c)||refusalPhrase.test(c));
 const reported=clauses.some(c=>isReportedSpeech(c));
 const reportedEvidence=clauses.some(c=>isReportedSpeech(c)&&(verification.test(c)||reportedClaim.test(c)||sensitive.test(c)));
 if(reportedEvidence&&!checking&&!protectedData&&!explicitRefusal&&!clauses.some(isQuestionClause))return result('unclear','Uma fala relatada ou boato não é verificação independente nem autoriza uma decisão.',true);
 if(uncertainVerification.test(t)||directClauses.some(c=>verification.test(c)&&isHypotheticalClause(c)&&!/\?/.test(c)))return result('doubt','A verificação foi apresentada como possibilidade, não como decisão protetiva já tomada.',true);
 if(!explicitRefusal&&verification.test(t)&&directClauses.some(isQuestionClause))return result('question','Pergunta sobre como verificar, sem afirmar que uma verificação já aconteceu.');
 if(!explicitRefusal&&informalQuestion.test(t))return result('question','Pergunta informal identificada pelo sentido da frase.');
 if(socialAcknowledgement.test(t))return result('smalltalk','Anuência ou marcador curto de conversa; mantém o turno sem autorizar ação sensível.');
 if(directClauses.some(c=>claimedActionMismatch(a,c)))return result('state-conflict','A fala afirma uma ação que não está registrada na partida.',true);
 if(directClauses.some(c=>checksInClause(c)&&declaredPastCheck.test(c))&&!checking)return result('unclear','A fala relata uma checagem; o texto não registra confirmação independente no jogo.',true);
 if(!reported&&!/\b(?:nao|nunca|nem)\b/.test(t)&&/\b(?:eu (?:estou|vou) (?:te )?(?:enganar|roubar)|quero (?:te )?roubar|sou (?:um )?golpista)\b/.test(t))return result('confession','O jogador declarou intenção de enganar; não é um fato inferido de uma pergunta.');
 if(verification.test(t)&&selfSuppliedChannel.test(t))return result('unclear','O canal de verificação foi fornecido pelo próprio contato; sua origem ainda não foi confirmada de forma independente.',true);
 if(deferredVerification.test(t))return result('unclear','A ação sensível foi colocada antes ou sem a verificação; isso não conta como proteção.',true);
 if(clauses.some(c=>checksInClause(c)&&verificationIsNegated(c))&&!checking)return result(requesting?'request':'unclear','A verificação foi negada na frase; não houve orientação protetiva.',!requesting);
 if(hypotheticalVerification.test(t))return /\?\s*$/.test(t)?result('question','A verificação foi apresentada como hipótese/pergunta, não como decisão já tomada.'):result('doubt','A verificação foi apresentada como hipótese, não como decisão protetiva já tomada.',true);
 if(/\?\s*$/.test(t)&&(protectedData||checking))return result('doubt','A mensagem pergunta sobre uma recusa; ainda precisa de esclarecimento.');
 const protectiveImperative=directClauses.some(c=>/\bnao (?:compartilhe|compartilha|envie|envia|mande|manda|passe|passa|libere|libera|forneca|fornece|divulgue|divulga)\b/.test(c)&&sensitive.test(c)&&!/\b(?:comigo|para mim|me)\b/.test(c));
 if(keepSecret||checking||protectedData&&(/\b(?:seus|sua|suas|seu|teus|tua|tuas|teu)\b/.test(t)||protectiveImperative)){
  if(requesting)return result('unclear','A mensagem mistura orientação de proteção com um pedido de dados.',true);
  return result('protect',checking?'Orientação para conferir a origem por um canal independente.':'Orientação para não compartilhar dados.');
 }
 if(explicitRefusal)return result('refusal','Recusa explícita do pedido ou da proposta.');
 if(lexical==='chat')return result('chat','Cumprimento social, sem responder à proposta ou autorizar uma operação.');
 if(lexical==='smalltalk')return result('smalltalk','Conversa social pertinente ao personagem; não responde por si só às condições da proposta.');
 const directSignals=structuredAnalysis(text,a,clauses,lexical,false);
 if(directSignals.hostility)return result('hostile','Ofensa dirigida identificada pelo contexto, sem confundir interjeição ou relato com ataque.');
 if(directSignals.pressure)return result('pressure','Pedido acompanhado de pressão para decidir ou agir imediatamente.');
 if(memoryConflict(a,text))return /\b(?:corrigindo|correcao|me enganei|quis dizer)\b/.test(t)?result('correction','Correção explícita de uma condição anteriormente declarada; ainda não é confirmação independente.'):result('contradiction','Uma condição declarada diverge da conversa registrada.');
 if(a.stage==='question'&&answersPendingQuestion(a,text)&&!clauses.some(c=>isQuestionClause(c)&&!/^(?:entendeu|certo|ok|ne)[?. ]*$/.test(c)))return result('answer','Resposta à pergunta atual; continua sendo uma afirmação, não comprovação independente.');
 const politeRequest=/\b(?:pode|poderia|consegue|queria|quero|preciso)\b.*\b(?:passar|mandar|enviar|compartilhar|liberar|abrir|instalar|preencher|usar|executar|informar|me dar)\b/.test(t)&&!clauses.some(c=>/^.*?\b(?:porque|por que|como|onde|qual|quem|o que)\b/.test(c));
 const imperativeRequest=directClauses.some(c=>/\bme (?:passa|passe|manda|mande|envia|envie|da|de|informa|informe)\b|^(?:por favor[, ]+)?(?:passa|passe|manda|mande|envia|envie|compartilha|compartilhe|libera|libere|abra|abre|instala|instale|preencha|preenche|use|usa|execute|executa)\b/.test(c))&&!clauses.some(c=>/\b(?:porque|por que|como|onde|qual|quem|o que)\b/.test(c));
 if(lexical==='request'&&(politeRequest||imperativeRequest))return result('request','Pedido de ação, mesmo com marca interrogativa de cortesia; o motor ainda verifica a etapa e as permissões.');
 if(/\b(?:futebol|choveu|filme|onibus|minha viagem|almoco|banana)\b/.test(t)&&!sensitive.test(t)&&!proposalTopics[a.scheme]?.test(t))return result('offtopic','Assunto sem ligação demonstrada com a proposta.');
 if(/^(?:isso|esse (?:premio|convite|site|negocio)) e (?:seguro|confiavel)[?!. ]*$/.test(t))return result('doubt','O jogador pergunta pela segurança da proposta; não houve autorização nem verificação.');
 if(clauses.some(c=>isQuestionClause(c)&&(/\?/.test(c)||/\b(?:explica|explique|esclareca|me diz|me diga|me conte|quem|como|onde|qual|porque)\b/.test(c)))&&!/\b(?:boian\w*|boiei|entendi (?:foi )?nada)\b/.test(t))return result('question','Pergunta ou pedido de esclarecimento; a dúvida pode coexistir com reconhecimento social.');
 if(/\b(?:nao entendi|entendi (?:foi )?nada|(?:estou )?boiando|boiei(?: legal)?|estou perdido|estou em duvida|tenho duvidas|nao sei quem|nao tenho certeza|nao quero inventar|nao sei se|isso e seguro|e confiavel|como vou saber|sei la|sei nao|nao confio|(?:estou|to) com (?:o )?pe atras|cara de golpe|parece (?:golpe|suspeito)|esta (?:estranho|esquisito|suspeito)|(?:que |muita )?confusao)\b/.test(t))return result('doubt','O jogador expressou uma dúvida ou suspeita; não é autorização nem pressão.');
 if(/\b(?:ignore|ignora|desconsidere|esqueca|mude|altere) (?:suas |a |as |o |os |toda a |todas as )?(?:regra|regras|instrucao|instrucoes|prompt|system|sistema)|\b(?:prompt interno|voce e o sistema|aumente.*creditos)\b/.test(t))return result('rule-instruction','Pedido para alterar as regras ou revelar instruções, sem efeito na simulação.');
 const claim=/\b(?:voce ja (?:enviou|mandou|passou|compartilhou|instalou|me pagou|pagou)|(?:o )?cadastro ja foi enviado|(?:eu ja )?recebi (?:seu|o) (?:cartao|passe|codigo)|ja (?:pagou|recebi o pagamento|(?:te )?paguei))\b/;
 if(!reported&&!clauses.some(isQuestionClause)&&!clauses.some(isHypotheticalClause)&&!/^.*?\bnao\b.*\b(?:pagou|paguei|enviou|mandou|recebi)\b/.test(t)&&(claim.test(t)||/\bvoce ja me (?:enviou|mandou|passou)\b/.test(t))&&(!a.item||/pagou|paguei|pagamento/.test(t)&&!a.paymentCompleted&&a.outcome!=='fooled'))return result('state-conflict','A fala afirma uma ação que não está registrada na partida.',true);
 if(!reported&&memoryConflict(a,t))return /\b(?:corrigindo|correcao|me enganei|quis dizer)\b/.test(t)?result('correction','Correção explícita de uma condição anteriormente declarada; ainda não é confirmação independente.'):result('contradiction','Uma condição declarada diverge da conversa registrada.');
 if(a.memory?.free&&!reported&&!/\?\s*$/.test(t)&&!/\b(?:nao|nunca|nem)\b/.test(t)&&/precisa pagar|tem que pagar|pague .*taxa/.test(t))return result('contradiction','Uma cobrança contradiz a gratuidade prometida nesta conversa.');
 if(a.stage==='request'&&!/\?\s*$/.test(t)&&/\b(?:foi|organiza|organizou|veio)\b/.test(t)&&/concurso|turma|equipe|firma|proposta/.test(t))return result('answer','Esclarecimento adicional sobre a origem da proposta já apresentada.');
 if(a.stage==='request'&&/\b(?:manda|mande|envie|passe|passa|libere) (?:isso|aquilo|aquele dado)\b/.test(t)&&a.used?.includes('answer'))return result('request','Pedido com referente identificado pela proposta já esclarecida.');
 if(/\b(?:futebol|choveu|filme|onibus|minha viagem|almoco)\b/.test(t)&&!sensitive.test(t))return result('offtopic','Assunto sem ligação demonstrada com a proposta.');
 if(a.stage==='question'&&/\bnao (?:tem|ha|existe) (?:uma )?taxa\b/.test(t))return result('answer','Esclarecimento de que não existe uma cobrança; continua sendo uma afirmação do jogador.');
 const local=lexical;
 if(a.stage==='question'&&answersPendingQuestion(a,text))return result('answer','Resposta à pergunta atual; continua sendo uma afirmação, não comprovação independente.');
 if(local==='answer'&&a.stage==='question'&&!answersPendingQuestion(a,text))return result('answer','A fala esclarece apenas outra condição; a pergunta atual ainda não foi respondida.');
 if(local==='hostile'&&!structuredAnalysis(text,a,clauses,local,false).hostility)return result('unclear','Uma palavra hostil relatada ou negada não comprova uma ofensa dirigida.',true);
 if(local==='pressure'&&/\bnao (?:e |esta |tem )?(?:urgente|pressa|precisa.*agora)\b/.test(t))return result('unclear','A frase negou urgência; não demonstra pressão.',true);
 if(local==='contradiction'&&!/\b(?:vamos falar|mudei|troque|em vez|agora (?:e|quero))\b/.test(t))return result('offtopic','A fala menciona outro assunto; isso não comprova contradição.');
 if(local==='unclear'&&/\b(?:futebol|choveu|filme|onibus|minha viagem|almoco)\b/.test(t))return result('offtopic','Assunto sem ligação demonstrada com a proposta.');
 return result(local,local==='unclear'?'Não há sentido suficiente para decidir a ação.':'Intenção identificada no contexto da proposta.',local==='unclear');
}
