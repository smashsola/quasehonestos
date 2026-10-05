import {cp,mkdir} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),dist=new URL('../dist/',import.meta.url);await mkdir(dist,{recursive:true});for(const entry of ['index.html','src'])await cp(fileURLToPath(new URL(entry,root)),fileURLToPath(new URL(entry,dist)),{recursive:true});console.log('Protótipo pronto em dist/');
