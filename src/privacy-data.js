export const privacyVersion='2026-10-26-age-bands';
export const shouldShowPrivacyNotice=storage=>storage.getItem('qh-privacy-notice')!==privacyVersion;
export const publicDialogueAI=false;

const email=/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i;
const cpf=/\b\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[\s-]?\d{2}\b/;
const phone=/\(?\d{2}\)?[ -]?9?\d{4}[ -]?\d{4}\b/;
const longNumber=/\b(?:\d[ -]?){13,19}\b/;
const cep=/\b\d{5}-?\d{3}\b/;
const uuid=/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;
const address=/\b(?:rua|avenida|av\.?|travessa|alameda|estrada|rodovia)\s+[A-Za-zÀ-ÿ0-9 .'-]{2,50},?\s+\d{1,5}\b/i;
const labelledSecret=/\b(?:minha|meu)?\s*(?:senha|password|pin|token|otp|c[oó]digo de verifica[cç][aã]o|chave pix|api[- ]?key|chave de api|secret)\b\s*(?:[:=]|é(?=\s))\s*\S{3,}/i;

export function looksPersonal(text){
 const t=String(text||'');
 return email.test(t)||cpf.test(t)||phone.test(t)||longNumber.test(t)||cep.test(t)||uuid.test(t)||address.test(t)||labelledSecret.test(t);
}
export function gameStorageKey(key){return key==='quase-honestos-v1'||key.startsWith('qh-');}
export function exportLocalData(storage){const data={};for(let i=0;i<storage.length;i++){const key=storage.key(i);if(gameStorageKey(key)){const value=storage.getItem(key);try{data[key]=JSON.parse(value);}catch{data[key]=value;}}}return {project:'Quase Honestos',privacyVersion,data};}
export function clearLocalData(storage){const keys=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(gameStorageKey(key))keys.push(key);}keys.forEach(key=>storage.removeItem(key));return keys.length;}
// Removes recognizable formats, not a promise of perfect anonymization.
export function redactSensitiveText(value){
 let text=String(value??'');const kinds=[];
 const patterns=[['credential',/\b(?:senha|password|pin|token|otp|c[oó]digo de verifica[cç][aã]o|chave pix|api[- ]?key|chave de api|secret)\s*(?:[:=]|é(?=\s))\s*\S{3,}/gi],['email',/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi],['cpf',/\b\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[\s-]?\d{2}\b/g],['card',/\b(?:\d[ -]?){13,19}\b/g],['phone',/\(?\d{2}\)?[ -]?9?\d{4}[ -]?\d{4}\b/g],['address',/\b(?:rua|avenida|av\.?|travessa|alameda|estrada|rodovia)\s+[A-Za-zÀ-ÿ0-9 .'-]{2,50},?\s+\d{1,5}\b/gi],['postal',/\b\d{5}-?\d{3}\b/g],['identifier',/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi],['context-number',/\b(?:cpf|telefone|celular|cart[aã]o|documento|rg)\s*(?:[:=]|é(?=\s))?\s*\d[\d .()-]{5,24}/gi]];
 // Authored QH codes contain names/mission words, never long numeric credentials.
 const tokens=[];text=text.replace(/\bQH-DEMO-[A-Z]+(?:-[A-Z]+)*\b/g,t=>{tokens.push(t);return '¤FICTICIO'+String.fromCharCode(65+tokens.length-1)+'¤';});
 for(const [kind,pattern]of patterns)text=text.replace(pattern,()=>{kinds.push(kind);return '[dado removido]';});
 tokens.forEach((token,index)=>{text=text.replace('¤FICTICIO'+String.fromCharCode(65+index)+'¤',token);});
 return {text,redacted:kinds.length>0,kinds:[...new Set(kinds)]};
}
export function redactDialogueObject(value){
 if(typeof value==='string')return redactSensitiveText(value).text;
 if(Array.isArray(value))return value.map(redactDialogueObject);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,redactDialogueObject(item)]));
 return value;
}
