import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
export function createDevServer(){
 return http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
   const file=path.resolve(root,pathname==='/'?'index.html':pathname.slice(1));
   if(!file.startsWith(root+path.sep))throw Error('Outside workspace');
   const content=await readFile(file);
   res.writeHead(200,{'Cache-Control':'no-store','Content-Type':(mime[path.extname(file)]||'application/octet-stream')+'; charset=utf-8'});
   res.end(content);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Não encontrado');}
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createDevServer();server.listen(Number(process.env.PORT||4180),'127.0.0.1',()=>console.log('Quase Honestos http://127.0.0.1:'+server.address().port));
}
