export const dialogueIntents=['chat','smalltalk','pitch','answer','question','request','wait','pressure','hostile','apology','uncertain','contradiction','thanks','after','unclear'];
const words={vc:'voce',vcs:'voces',ce:'voce',cê:'voce',q:'que',pq:'porque',n:'nao',nn:'nao',naum:'nao',tb:'tambem',tmb:'tambem',blz:'beleza',pfv:'por favor',pls:'por favor',obg:'obrigado',vlw:'valeu',vdd:'verdade',aq:'aqui',aki:'aqui',cod:'codigo',kartao:'cartao',premiu:'premio',premioo:'premio',instalaçao:'instalacao'};
export function normalizeMessage(text){
 return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/([a-z])\1{2,}/g,'$1$1').replace(/\b[a-z]+\b/g,word=>words[word]||word).replace(/\s+/g,' ').trim();
}
export function negatedRequest(text){return /\bnao (?:me )?(?:manda|mande|envia|envie|compartilhe|instale|instala|abra|abre|passe|passa|quero|preciso)\b/.test(normalizeMessage(text));}
