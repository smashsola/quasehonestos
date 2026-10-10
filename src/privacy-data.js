export const privacyVersion='2026-10-09';
export const publicDialogueAI=true;
export function looksPersonal(text){
 const t=String(text);
 return /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(t)||/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/.test(t)||/\b\d{10,11}\b/.test(t)||/\b(?:\d[ -]?){13,19}\b/.test(t)||/\(?\d{2}\)?[ -]?9\d{4}[ -]?\d{4}\b/.test(t);
}
export function gameStorageKey(key){return key==='quase-honestos-v1'||key.startsWith('qh-');}
export function exportLocalData(storage){const data={};for(let i=0;i<storage.length;i++){const key=storage.key(i);if(gameStorageKey(key)){const value=storage.getItem(key);try{data[key]=JSON.parse(value);}catch{data[key]=value;}}}return {project:'Quase Honestos',privacyVersion,data};}
export function clearLocalData(storage){const keys=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(gameStorageKey(key))keys.push(key);}keys.forEach(key=>storage.removeItem(key));return keys.length;}
