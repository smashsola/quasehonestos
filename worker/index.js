import {onRequestPost} from '../functions/api/dialogue.js';

const securityHeaders={
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'X-Frame-Options':'DENY',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy':'same-origin',
  'Cross-Origin-Resource-Policy':'same-origin'
};
const contentSecurityPolicy="default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'";
function harden(response){
  const headers=new Headers(response.headers);
  for(const [name,value] of Object.entries(securityHeaders))headers.set(name,value);
  if((headers.get('Content-Type')||'').toLowerCase().includes('text/html'))headers.set('Content-Security-Policy',contentSecurityPolicy);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export default {
  async fetch(request,env){
    const pathname=new URL(request.url).pathname;
    if(pathname==='/api/dialogue'){
      if(request.method!=='POST')return harden(new Response('Method not allowed',{status:405,headers:{Allow:'POST'}}));
      return harden(await onRequestPost({request,env}));
    }
    if(pathname.startsWith('/api/'))return harden(new Response('Not found',{status:404}));
    return harden(await env.ASSETS.fetch(request));
  }
};
