// Keep the session playable if storage is denied or full. Never clear an old save.
export function safeStorage(access){
 const memory=new Map(),protectedKeys=new Set();let store,temporary=false;
 const fail=()=>{temporary=true;};
 try{store=access();if(!store)fail();}catch{fail();}
 const keys=()=>{const result=new Set(memory.keys());try{for(let i=0;i<(store?.length||0);i++){const key=store.key(i);if(key!==null)result.add(key);}}catch{fail();}return [...result].filter(key=>!memory.has(key)||memory.get(key)!==null);};
 return {
  get temporary(){return temporary;},
  get length(){return keys().length;},key:index=>keys()[index]??null,
  preserve(key){protectedKeys.add(key);fail();},
  getItem(key){if(memory.has(key))return memory.get(key);try{return store?.getItem(key)??null;}catch{protectedKeys.add(key);fail();return null;}},
  setItem(key,value){value=String(value);if(!protectedKeys.has(key)&&store){try{store.setItem(key,value);memory.delete(key);return;}catch{fail();}}else fail();memory.set(key,value);},
  removeItem(key){try{store?.removeItem(key);}catch{fail();}protectedKeys.delete(key);memory.set(key,null);}
 };
}
export const localStore=safeStorage(()=>globalThis.localStorage);
export const sessionStore=safeStorage(()=>globalThis.sessionStorage);
export function storageStatus(){return localStore.temporary||sessionStore.temporary?'Partida temporária: o salvamento no navegador está indisponível.':'';}
