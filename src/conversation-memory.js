import {normalizeMessage,isReportedSpeech,messageClauses,isQuestionClause,isHypotheticalClause} from './language.js';
import {turnAgenda,attributionRepair} from './turn-agenda.js';

const group='(?:escola|prefeitura|clube|firma|(?:equipe|pessoal|turma|galera)(?: (?:do|da|de) (?:concurso|torneio|evento|jogo|liga|escola|clube))?)';
function originClaim(t){
 const patterns=[new RegExp(`\\b(?:organizado|organizada|oferecido|oferecida|feito|feita) (?:pela|pelo|por) (?:a |o )?(${group})`),new RegExp(`\\b(?:a |o )?(${group}) (?:organizou|organiza|ofereceu|oferece|fez|preparou|realizou)`),new RegExp(`\\b(?:foi|veio|vem|e) (?:da |do |pela |pelo |a |o )?(${group})(?:\\b|$)`)];
 for(const pattern of patterns){const match=t.match(pattern);if(match){const preceding=t.slice(Math.max(0,match.index-20),match.index);if(/\b(?:nao|nunca|nem)(?: (?:foi|era|e|a|o)){0,3}\s*$/.test(preceding)||/^nao\b/.test(t))continue;return match[1].replace(/^(?:pessoal|turma|galera)\b/,'equipe');}}
 if(/\b(?:foi|veio|e) (?:o |do |da )?(?:pessoal|equipe|galera|turma) que (?:fez|organizou|preparou) (?:aquele |o |um )?evento\b/.test(t))return 'equipe do evento';
 // Bounded noun phrase + an organization predicate also covers new fictional
 // organizations. A new name remains a player's claim, never an official fact.
 const organizationVerb='(?:organiza|organizou|organizam|organizaram|prepara|preparou|preparam|prepararam|realiza|realizou|realizam|realizaram|oferece|ofereceu|oferecem|ofereceram)';
 const proposalObject=/\b(?:concurso|premiacao|premio|evento|torneio|convite|clube|associacao|oferta|proposta|atendimento|suporte|pacote|programa|resgate|festival|oficina|atividade|isso|essa|esse|isto)\b/;
 const active=t.match(new RegExp(`^(?:a|o|as|os|uma|um) ([a-z][a-z -]{0,95}) ${organizationVerb}\\b`));
 if(active&&proposalObject.test(t)&&!/\b(?:nao|nem|nunca|talvez)\b/.test(active[1]))return active[1].replace(/\s+que\s+.*$/,'').trim();
 const passive=t.match(/\b(?:organizado|organizada|preparado|preparada|realizado|realizada|oferecido|oferecida) (?:pela|pelo|por) (?:a |o |as |os )?([a-z][a-z -]{0,95})/);
 if(passive&&proposalObject.test(t)&&!/^nao\b|\b(?:nao|nem|nunca) (?:foi|era|e|foi mesmo)?\s*(?:organizado|organizada|preparado|preparada|realizado|realizada|oferecido|oferecida)/.test(t))return passive[1].split(/\s+(?:para|porque|mas|com|e)\s+/)[0].trim();
 return null;
}
export function statedFacts(text){
 const facts={};
 for(const clause of messageClauses(text)){
  const c=clause.split(/\s*,?\s+(?:porque|pois|ja que)\s+/)[0];
  if(isQuestionClause(c)||isReportedSpeech(c)||isHypotheticalClause(c))continue;
  const negatedFree=/\b(?:nao|nunca) (?:e |era |foi |sera )?(?:gratis|gratuit[oa]|de graca|sem custo|sem taxa)\b/.test(c);
  const free=!negatedFree&&/\b(?:gratis|gratuito|gratuita|de graca|sem custo|sem taxa|sem cobranca|nao (?:tem|ha|existe|tera|havera) (?:mais |uma )?(?:taxa|cobranca|custo)|nao (?:precisa|vai|tem que) pagar|(?:retirei|retiramos|cancelei|cancelamos) a (?:taxa|cobranca))\b/.test(c);
  const paid=negatedFree||/\b(?:precisa pagar|tem que pagar|pague|custa|cobramos|ha uma taxa|tem uma taxa|taxa de)\b/.test(c)&&!free;
  const delivery=/\b(?:entrega|frete|envio)\b/.test(c);
  const amount=c.match(/\bc\$\s*(\d{1,6}(?:[.,]\d{1,2})?)/);
  const negativeCharge=/\b(?:nao|nunca|nem) (?:cobrei|cobro|cobramos|cobrava|custa|cobrou)\b/.test(c);
  const deniedAmount=/\b(?:nao|nunca|nem) (?:e|era|foi|custa|custava|cobrei|cobro|cobramos|cobrou)\b/.test(c);
  if(delivery){if(free||negativeCharge&&!amount)facts.deliveryPrice='grátis';else if(amount&&!deniedAmount)facts.deliveryPrice='C$ '+amount[1].replace(',','.');else if(negatedFree)facts.deliveryPrice='com cobrança';}
  else if(free)facts.price='gratuito';else if(paid)facts.price='com cobrança';
  const origin=originClaim(c);if(origin)facts.origin=origin;
  if(/\bnao (?:precisa|precisamos|pede|pedimos) (?:de |do |dos )?(?:dados|cartao|senha|codigo)\b/.test(c))facts.data='sem pedido de dados';
  else if(/\b(?:precisamos|precisa|pedimos) (?:do|de|da|dos) (?:cartao|senha|codigo|dados)\b/.test(c))facts.data='com pedido de dados';
  const request=c.match(/\b(?:(?:precisamos|precisa|pedimos) (?:do|de|da|dos|das)|(?:me )?(?:manda|mande|envia|envie|passa|passe|forneca))\s+(?:o |a |os |as |seu |sua |seus |suas )?(cartao|senha|codigo|dados|perfil|contato|rotina|passe|sessao)\b/);
  if(request&&!/\b(?:nao|nunca|nem)\b/.test(c.slice(0,request.index))){facts.data='com pedido de dados';facts.requestedData=[...new Set([...(facts.requestedData?.split(', ')||[]),request[1]])].sort().join(', ');}
  if(!/\b(?:nao|nunca|nem)\b/.test(c)){
   const benefit=c.match(/\b(?:o beneficio (?:e|sera)|voce (?:vai receber|recebera|vai ganhar|ganhara))\s+(.{1,100})$/);
   if(benefit&&!/^(?:gratis|gratuit[oa]|sem custo)\b/.test(benefit[1]))facts.benefit=benefit[1].replace(/[.!;]+$/,'').trim();
   const deadline=c.match(/\b(?:o prazo (?:e|sera)|valido ate|valida ate|vale ate)\s+(.{1,60})$/);
   if(deadline)facts.deadline=deadline[1].replace(/[.!;]+$/,'').trim();
  }
 }
 // Short fictional introductions remain claims, with the original spelling.
 for(const raw of String(text).split(/(?<=[.!?;])\s*|\s+mas\s+|\s+e\s+(?=(?:qual|como|quanto|onde|o que)\b)/i)){
  const clause=normalizeMessage(raw);
  if(isQuestionClause(clause)||isReportedSpeech(clause)||isHypotheticalClause(clause))continue;
  const alias=raw.match(/(?:meu nome\s*[ée]|meu apelido\s*[ée]|pode me chamar de|^\s*aqui\s*[ée]\s+(?:o\s+|a\s+)?|^\s*(?:eu\s+)?me chamo)\s*([\p{L}][\p{L}\p{M}' -]{0,39}?)(?=\s+e\s|[,.!?;]|$)/iu);
  if(alias){const prefix=normalizeMessage(raw.slice(0,alias.index));if(!/\b(?:nao|nunca|nem)\b/.test(prefix))facts.alias=alias[1].trim();}
 }
 return facts;
}
export function memoryConflict(a,text){
 const next=statedFacts(text),old=a.facts?.claims||{};
 for(const [key,value] of Object.entries(next)){if(key==='requestedData')continue;const previous=old[key]||(key==='price'&&a.memory?.free?'gratuito':null);if(previous&&previous!==value)return {key,previous,current:value};}
 return null;
}
export function statesUnknownOrigin(text){
 return messageClauses(text).some(c=>!/[?]/.test(c)&&!isReportedSpeech(c)&&!isHypotheticalClause(c)&&/\b(?:nao sei|nao sabemos|nao conheco|desconheco|nao tenho essa informacao)\b/.test(c)&&/organiza|organizou|origem|de onde|responsavel|essa informacao/.test(c));
}
export function questionTopics(text,scheme){
 const questionClauses=messageClauses(text).filter(isQuestionClause);
 const t=normalizeMessage(questionClauses.length?questionClauses.join(' '):text),topics=[];
 if(/\b(?:quem|qual organizacao|qual grupo|de onde|origem|responsavel|organiza|organizou|qual concurso|anunciou)\b/.test(t))topics.push('origem');
 if(/\b(?:qual problema|o que.*(?:aconteceu|encontraram)|defeito|como surgiu)\b/.test(t))topics.push(scheme==='support'?'problema':'origem');
 if(/\b(?:permis\w*|acess\w*|perfil|contato|rotina)\b/.test(t)&&scheme==='update')topics.push('permissões');
 if(/\b(?:por que|porque|o que|quais|que dados)\b/.test(t)&&/\b(?:dados|cartao|cadastro|codigo|passe|identificador|sessao|acesso)\b/.test(t)&&scheme!=='update')topics.push('dados');
 if(/\b(?:quanto|qual custo|qual valor|custa|taxa|gratuit\w*|gratis)\b/.test(t))topics.push('custo');
 if(/\bqual (?:programa|resgate)\b/.test(t))topics.push('programa');
 return [...new Set(topics)];
}
export function pendingQuestion(a){
 const last=(a.log||[]).filter(line=>!['Você','Sistema'].includes(line.speaker)).at(-1);
 const topics=last?questionTopics(last.text,a.scheme):[];
 if(topics.length&&a.stage==='question')return {topic:topics[0],topics,text:last.text,status:'asked'};
 const saved=a.facts?.question;
 if(saved?.status==='asked')return {...saved,topics:saved.topics||[saved.topic]};
 return a.stage==='question'?{topic:a.scheme==='update'?'permissões':a.scheme==='link'?'dados':'origem',topics:[a.scheme==='update'?'permissões':a.scheme==='link'?'dados':'origem'],status:'asked'}:null;
}
export function answersPendingQuestion(a,text){
 const question=pendingQuestion(a);if(!question)return false;
 const facts=statedFacts(text),direct=messageClauses(text).filter(c=>!isQuestionClause(c)&&!isReportedSpeech(c)&&!isHypotheticalClause(c));
 const answers={
  origem:()=>!!facts.origin,
  custo:()=>!!facts.price,
  dados:()=>direct.some(c=>/\b(?:pede|pedimos|precisa|serve|para|valid\w*|registr\w*|resgat\w*|cadastr\w*|titular)\b/.test(c)&&/\b(?:cartao|dados|cadastro|codigo|identificador|pontos|resgate|batatapay|passe|associacao|sessao|acesso|atendimento)\b/.test(c)),
  permissões:()=>direct.some(c=>/\b(?:perfil|contato|rotina|permis\w*|registro|sincron\w*|config\w*|identific\w*)\b/.test(c)&&/\b(?:para|porque|precisa|pede|usa|acessa|liberar|libera|vincular|salvar)\b/.test(c)),
  problema:()=>direct.some(c=>/\b(?:defeito|erro|problema|trav\w*|virus|lent\w*|calculadora|paoos)\b/.test(c)&&/\b(?:esta|tem|deu|encontr\w*|detect\w*|aconteceu|houve)\b/.test(c)),
  programa:()=>direct.some(c=>/\b(?:e|vem|veio|programa)\b/.test(c)&&/\b(?:batatapay|pontos|resgate)\b/.test(c))
 };
 return question.topics.every(topic=>answers[topic]?.()||false);
}
export function rememberConversation(a,text,intent,stage,analysis=a.lastAnalysis){
 a.facts??={claims:{},events:[],question:null};const m=a.facts,turn=(a.audit?.length||0);m.claims??={};m.events??=[];
 const next=statedFacts(text),conflict=memoryConflict(a,text);
 if(statesUnknownOrigin(text))m.unknownOrigin={speaker:'Você',source:'player-message',turn,status:'unknown'};
 if(next.origin)m.unknownOrigin=null;
 const informative=['pitch','answer','chat','smalltalk','question','correction','unclear','doubt','method-refusal'].includes(intent);
 m.ledger??=Object.entries(m.claims).map(([key,content])=>({key,content,source:'legacy-claim',turn:0,speaker:'Você',kind:'claim',status:'active'}));
 // Durable provenance survives the bounded event log. Legacy turn 0 means unknown.
 m.claimSources??=Object.fromEntries(Object.keys(m.claims).map(key=>{const record=m.ledger.findLast(r=>r.key===key&&r.content===m.claims[key]&&r.status==='active');return [key,{source:record?.source||'legacy-claim',turn:record?.turn||0,speaker:'Você',kind:'claim'}];}));
 if(conflict)m.lastConflict={...conflict,status:'pending',speaker:'Você',source:'player-message',turn};
 for(const [key,content]of Object.entries(next)){
  const status=intent==='contradiction'||conflict?.key===key&&intent!=='correction'?'disputed':informative?'active':'unresolved';
  if(intent==='correction')for(const record of m.ledger.filter(r=>r.key===key&&['active','disputed'].includes(r.status)))record.status=record.status==='disputed'?'resolved':'corrected';
  if(!m.ledger.some(r=>r.key===key&&r.content===content&&r.status===status))m.ledger.push({key,content,source:'player-message',turn,speaker:'Você',kind:'claim',status,sourceText:text.slice(0,200)});
 }
 m.ledger=m.ledger.slice(-24);
 if(intent==='correction'){m.corrections??=[];m.corrections.push({turn,previous:{...m.claims},current:next});m.corrections=m.corrections.slice(-8);}
 if(informative)for(const [key,value]of Object.entries(next)){if(key==='requestedData'){m.claims[key]=[...new Set([...(m.claims[key]?.split(', ')||[]),...value.split(', ')])].sort().join(', ');m.claimSources[key]={source:'player-message',turn,speaker:'Você',kind:'claim'};}else if(!m.claims[key]||intent==='correction'){m.claims[key]=value;m.claimSources[key]={source:'player-message',turn,speaker:'Você',kind:'claim'};}}
 if(intent==='correction'&&m.claims.price){a.memory??={};a.memory.free=m.claims.price==='gratuito';}
 if(intent==='correction'){
  if(m.lastConflict&&Object.hasOwn(next,m.lastConflict.key))m.lastConflict.status='resolved';
  const repair=attributionRepair({...a,log:a.log.slice(0,-2)},text);
  if(repair){m.repairs??=[];m.repairs.push({...repair,turn,status:repair.matched?'repaired':'clarification-requested'});m.repairs=m.repairs.slice(-6);}
 }
 m.responses??=[];for(const topic of turnAgenda(a,text).questions){const previous=m.responses.find(r=>r.topic===topic);if(previous)previous.count++;else m.responses.push({topic,count:1});}m.responses=m.responses.slice(-10);
 m.events.push({turn,type:intent,...(conflict?{conflict}:{}),stage:stage||'pitch',shared:!!a.item,...(analysis?{analysis:{...analysis}}:{})});m.events=m.events.slice(-24);m.provenance='afirmações da conversa, não verificação independente';
 if(a.stage==='question'){const question=pendingQuestion(a);if(question)m.question={...question,status:'asked'};}
 if(['answer','question'].includes(intent)&&a.stage==='request'&&m.question&&analysis?.answersQuestion)m.question.status='explained';
 if(intent==='protect')m.verification='decidiu buscar canal conhecido';
 if(analysis?.verification&&analysis.verification!=='none'){m.verificationEvents??=[];m.verificationEvents.push({turn,status:analysis.verification,source:'player-statement'});m.verificationEvents=m.verificationEvents.slice(-12);}
 for(const promise of m.promises||[])if(promise.status==='pending'&&promise.type==='explain-condition'&&intent==='answer'&&analysis?.answersQuestion){promise.status='explained';promise.resolvedTurn=turn;}
 for(const c of messageClauses(text))if(!isReportedSpeech(c)&&!isHypotheticalClause(c)&&!isQuestionClause(c)&&/\b(?:vou|prometo|garanto)\b/.test(c)&&!/\b(?:nao|nem|nunca) (?:vou|prometo|garanto)\b|\b(?:vou|prometo|garanto).*\bnao[.! ]*$/.test(c)){m.promises??=[];const value=c.slice(0,160);if(!m.promises.some(p=>p.value===value&&p.status==='pending'))m.promises.push({turn,type:/explicar|esclarecer|informar/.test(c)?'explain-condition':'declared-plan',value,source:'player-message',speaker:'Você',status:'pending'});m.promises=m.promises.slice(-12);}
 if(intent==='refusal')m.refused=true;
 syncDisplayedReply(a,a.log.at(-1));
}
export function syncDisplayedReply(a,reply){
 if(!reply||['Você','Sistema'].includes(reply.speaker)||!a.facts)return;
 const turn=(a.log||[]).filter(l=>l.speaker==='Você').length;migrateStatements(a.facts);
 const existing=a.facts.statements.find(r=>r.turn===turn);
 const record={turn,speaker:reply.speaker,content:reply.text.slice(0,700),source:'displayed-reply',kind:'character-statement'};
 if(existing)Object.assign(existing,record);else a.facts.statements.push(record);
 a.facts.statements=a.facts.statements.slice(-8);
}
function migrateStatements(m){m.statements??=[];}
export function continuityReply(a,conflict){
 const label={price:'o custo',deliveryPrice:'o custo de entrega',alias:'o nome apresentado',origin:'a organização',data:'o pedido de dados',benefit:'o benefício prometido',deadline:'o prazo'}[conflict.key];
 const fact=`Antes você disse “${conflict.previous}”; agora, “${conflict.current}”.`;
 const voices={nino:`Ué, ${label} mudou? ${fact} Minha batata perdeu o fio. Explica essa mudança.`,olga:`Meu bem, ${fact} Quero entender a mudança antes de decidir.`,davi:`As condições divergem sobre ${label}. ${fact} Qual informação está valendo?`,yara:`Preciso passar a condição certa para a turma. ${fact} O que mudou?`,pri:`Comparei as duas condições. ${fact} Elas não correspondem.`,bento:`O roteiro mudou no meio. ${fact} Qual versão é a de agora?`};return voices[a.caller];
}
export function repeatedMeaning(a,text,intent){
 const next=statedFacts(text),entries=Object.entries(next);
 const informative=['pitch','answer','correction','unclear','doubt'].includes(intent);
 const reassurance=t=>/\b(?:confie em mim|pode acreditar|fica tranquil[oa]|fique tranquil[oa]|pode confiar|confia em mim)\b/.test(normalizeMessage(t));
 if(!entries.length&&reassurance(text)&&(a.audit||[]).some(e=>reassurance(e.text)))return true;
 const topic=pendingQuestion(a)?.topic;
 if(informative&&entries.length&&(!topic||['origem','custo'].includes(topic))&&(a.audit||[]).some(e=>{const previous=statedFacts(e.text);return entries.every(([key,value])=>previous[key]===value);}))return true;
 if(informative&&['dados','permissões','problema','programa'].includes(topic)){
  const purpose=t=>{const normalized=normalizeMessage(t),actions=[['registro',/\b(?:registr\w*|cadastr\w*)\b/],['identificação',/\b(?:identific\w*|valid\w*)\b/],['liberação',/\b(?:liber\w*|desbloqu\w*)\b/],['salvamento',/\b(?:salv\w*|guard\w*)\b/],['sincronização',/\b(?:sincron\w*|config\w*)\b/],['reparo',/\b(?:consert\w*|repar\w*|resolv\w*)\b/]].filter(([,pattern])=>pattern.test(normalized)).map(([name])=>name);const objects=(normalized.match(/\b(?:premio|skin|skins|perfil|contato|rotina|codigo|passe|cartao|computador|sessao|cadastro)\b/g)||[]).map(word=>word==='skins'?'skin':word);return actions.length?[...new Set([...actions,...objects])].sort().join('|'):null;};
  const meaning=purpose(text);if(meaning&&(a.audit||[]).some(e=>purpose(e.text)===meaning))return true;
 }
 const normalize=t=>normalizeMessage(t).replace(/\b(?:a equipe|o pessoal|a turma|a galera)\b/g,'equipe').replace(/\b(?:realizou|preparou|organizou|organiza)\b/g,'organizou').replace(/\b(?:premiacao|premio)\b/g,'premio').replace(/\b(?:mano|vei|oxe|ue|po|pode pa|beleza|kkkk|esse|este|essa|esta|aquele|aquela|foi|a|o|do|da|um|uma|de|no|na)\b/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 const normalized=normalize(text);
 const acknowledgements=/^(?:pode pa|pode crer|fechou|demorou|beleza|suave|aham|uhum|hum|hm|show|bora|certo|sim|entendi|saquei|ok|esta bom|tranquilo|ta ligado)[.!? ]*$/;
 if(acknowledgements.test(normalizeMessage(text)))return (a.audit||[]).some(e=>acknowledgements.test(normalizeMessage(e.text)));
 return !!normalized&&(a.audit||[]).some(e=>normalize(e.text)===normalized);
}
