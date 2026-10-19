
const securityHeaders={
  'X-Content-Type-Options':'nosniff',
  'Strict-Transport-Security':'max-age=31536000',
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
    if(pathname==='/'||pathname==='/index.html'||/^\/index-v20261015[efghijkl](?:\.html)?$/.test(pathname)||/^\/index-v20261016(?:[l-z]|a[a-c])(?:\.html)?$/.test(pathname)||/^\/index-v20261017[a-h](?:\.html)?$/.test(pathname)||/^\/index-v20261018(?:[a-z]|a[a-z]|b[a-z])(?:\.html)?$/.test(pathname)){
      const target=new URL(request.url);target.pathname='/index-v20261018bj';
      const response=await env.ASSETS.fetch(new Request(target,request));
      const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');
      return harden(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
    }
    if(pathname==='/api/dialogue'){
      if(request.method!=='POST')return harden(new Response('Method not allowed',{status:405,headers:{Allow:'POST'}}));
      return harden(Response.json({error:'retired',mode:'scripted-choices'},{status:410,headers:{'Cache-Control':'no-store'}}));
    }
    if(pathname.startsWith('/api/'))return harden(new Response('Not found',{status:404}));
    return harden(await env.ASSETS.fetch(request));
  }
};
