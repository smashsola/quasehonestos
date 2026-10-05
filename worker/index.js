import {onRequestPost} from '../functions/api/dialogue.js';

export default {
  async fetch(request,env){
    const pathname=new URL(request.url).pathname;
    if(pathname==='/api/dialogue'){
      if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers:{Allow:'POST'}});
      return onRequestPost({request,env});
    }
    if(pathname.startsWith('/api/'))return new Response('Not found',{status:404});
    return env.ASSETS.fetch(request);
  }
};
