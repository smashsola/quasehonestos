export const privacyVersion='2026-10-10';
export const publicDialogueAI=true;

const email=/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i;
const cpf=/\b\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[\s-]?\d{2}\b/;
const phone=/\(?\d{2}\)?[ -]?9?\d{4}[ -]?\d{4}\b/;
const longNumber=/\b(?:\d[ -]?){13,19}\b/;
const cep=/\b\d{5}-?\d{3}\b/;
const uuid=/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;
const address=/\b(?:rua|avenida|av\.?|travessa|alameda|estrada|rodovia)\s+[A-Za-zÀ-ÿ0-9 .'-]{2,50},?\s+\d{1,5}\b/i;
const labelledSecret=/\b(?:minha|meu)?\s*(?:senha|password|pin|token|otp|c[oó]digo de verifica[cç][aã]o|chave pix|api[- ]?key|chave de api|secret)\b\s*(?:[:=]|\bé\b)\s*\S{3,}/i;

export function looksPersonal(text){
 const t=String(text||'');
 return email.test(t)||cpf.test(t)||phone.test(t)||longNumber.test(t)||cep.test(t)||uuid.test(t)||address.test(t)||labelledSecret.test(t);
}
export function gameStorageKey(key){return key==='quase-honestos-v1'||key.startsWith('qh-');}
export function exportLocalData(storage){const data={};for(let i=0;i<storage.length;i++){const key=storage.key(i);if(gameStorageKey(key)){const value=storage.getItem(key);try{data[key]=JSON.parse(value);}catch{data[key]=value;}}}return {project:'Quase Honestos',privacyVersion,data};}
export function clearLocalData(storage){const keys=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(gameStorageKey(key))keys.push(key);}keys.forEach(key=>storage.removeItem(key));return keys.length;}
