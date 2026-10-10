import {normalizeMessage} from './language.js';

export function statedFacts(text){
 const t=normalizeMessage(text),facts={};
 if(/\?\s*$/.test(t)||/\b(?:ele|ela|a mensagem|o contato|voce) (?:disse|falou|pediu|mandou)|\bse (?:for|fosse|houver)\b/.test(t))return facts;
 const free=/\b(?:gratis|gratuito|gratuita|sem custo|sem taxa|nao (?:tem|ha|existe) (?:uma )?taxa|nao (?:precisa|vai|tem que) pagar)\b/.test(t);
 const paid=/\b(?:precisa pagar|tem que pagar|pague|custa|cobramos|ha uma taxa|tem uma taxa|taxa de)\b/.test(t)&&!free;
 if(free)facts.price='gratuito';else if(paid)facts.price='com cobrança';
 const origin=t.match(/(?:organizado|organizada|oferecido|oferecida|feito|feita) (?:pela|pelo|por) (escola|prefeitura|clube|firma|equipe do concurso)/);
 const activeOrigin=t.match(/(?:a |o )?(escola|prefeitura|clube|firma|equipe do concurso) (?:organizou|organiza|ofereceu|oferece|fez|preparou)/);
 if((origin||activeOrigin)&&!/\bnao (?:foi |e |era )?(?:organizado|organizada|oferecido|oferecida|feito|feita)|\bnao (?:a |o )?(?:escola|prefeitura|clube|firma|equipe do concurso) (?:organizou|organiza|ofereceu|oferece|fez|preparou)/.test(t))facts.origin=(origin||activeOrigin)[1];
 if(/\bnao (?:precisa|precisamos|pede|pedimos) (?:de )?(?:dados|cartao|senha|codigo)\b/.test(t))facts.data='sem pedido de dados';
 else if(/\b(?:precisamos|precisa|pedimos) (?:do|de|da|dos) (?:cartao|senha|codigo|dados)\b/.test(t))facts.data='com pedido de dados';
 return facts;
}
export function memoryConflict(a,text){
 const next=statedFacts(text),old=a.facts?.claims||{};
 for(const [key,value] of Object.entries(next)){const previous=old[key]||(key==='price'&&a.memory?.free?'gratuito':null);if(previous&&previous!==value)return {key,previous,current:value};}
 return null;
}
export function rememberConversation(a,text,intent,stage){
 a.facts??={claims:{},events:[],question:null};const m=a.facts,turn=(a.audit?.length||0);m.claims??={};m.events??=[];
 const informative=['pitch','answer','chat','correction'].includes(intent);
 if(intent==='correction'){m.corrections??=[];m.corrections.push({turn,previous:{...m.claims},current:statedFacts(text)});m.corrections=m.corrections.slice(-8);}
 if(informative)for(const [key,value]of Object.entries(statedFacts(text))){if(!m.claims[key]||intent==='correction')m.claims[key]=value;}
 if(intent==='correction'&&m.claims.price){a.memory??={};a.memory.free=m.claims.price==='gratuito';}
 const conflict=intent==='contradiction'?memoryConflict(a,text):null;
 m.events.push({turn,type:intent,...(conflict?{conflict}:{}),stage:stage||'pitch',shared:!!a.item});m.events=m.events.slice(-24);m.provenance='afirmações da conversa, não verificação independente';
 if(a.stage==='question'&&intent==='pitch')m.question={topic:a.scheme==='update'?'permissões':'origem',status:'asked'};
 if(intent==='answer'&&a.stage==='request'&&m.question)m.question.status='explained';
 if(intent==='protect')m.verification='decidiu buscar canal conhecido';
 if(intent==='refusal')m.refused=true;
}
export function continuityReply(a,conflict){
 const label={price:'o custo',origin:'a organização',data:'o pedido de dados'}[conflict.key];
 const fact=`Antes você disse “${conflict.previous}”; agora, “${conflict.current}”.`;
 const voices={nino:`Ué, ${label} mudou? ${fact} Minha batata perdeu o fio. Explica essa mudança.`,olga:`Meu bem, ${fact} Quero entender a mudança antes de decidir.`,davi:`As condições divergem sobre ${label}. ${fact} Qual informação está valendo?`,yara:`Preciso passar a condição certa para a turma. ${fact} O que mudou?`,pri:`Comparei as duas condições. ${fact} Elas não correspondem.`,bento:`O roteiro mudou no meio. ${fact} Qual versão é a de agora?`};return voices[a.caller];
}
export function repeatedMeaning(a,text,intent){
 const normalize=t=>normalizeMessage(t).replace(/\b(?:a equipe|o pessoal|a turma)\b/g,'equipe').replace(/\b(?:realizou|preparou|organizou|organiza)\b/g,'organizou').replace(/\b(?:premiacao|premio)\b/g,'premio').replace(/\b(?:esse|este|essa|esta|aquele|aquela|foi|a|o|do|da|um|uma|de|no|na)\b/g,'').replace(/\s+/g,' ').trim();
 return (a.audit||[]).some(e=>e.intent===intent&&normalize(e.text)===normalize(text));
}
