// بومي — بثّ الإجابة تدريجيًا (Streaming). يعيد نصًا عاديًا يصل على دفعات صغيرة أثناء توليده.
// المفتاح يُقرأ من متغيرات البيئة في Netlify ولا يظهر للمتصفح. يشارك tutor.js نفس القواعد (SYS) والحدود.
import tutor from './tutor.js';
const {SYS,J,hit,cl,list,mkInfo}=tutor.shared;
const json=(c,o)=>new Response(JSON.stringify(o),{status:c,headers:{'content-type':'application/json; charset=utf-8'}});
export default async req=>{
 if(req.method!=='POST')return json(405,{error:'method'});
 const raw=await req.text();if(raw.length>8000)return json(413,{error:'big'});
 const key=process.env.ANTHROPIC_API_KEY||process.env.NETLIFY_AI_GATEWAY_KEY;if(!key)return json(500,{error:'no_key'});
 const ip=req.headers.get('x-nf-client-connection-ip')||String(req.headers.get('x-forwarded-for')||'').split(',')[0]||'x',u=hit(ip);
 if(u.min>12||u.hour>150)return json(429,{error:'rate'});
 let b;try{b=JSON.parse(raw||'{}')}catch(e){return json(400,{error:'bad'})}
 const p=b.profile&&typeof b.profile==='object'?b.profile:{},msg=cl(b.message);if(!msg)return json(400,{error:'empty'});
 const hist=(Array.isArray(b.history)?b.history:[]).slice(-8).filter(m=>m&&(m.role==='user'||m.role==='assistant')).map(m=>({role:m.role,content:cl(m.content)||'...'}));
 while(hist.length&&hist[0].role!=='user')hist.shift();
 const again=b.again?'\n[ملاحظة: الطالب لم يفهم الشرح السابق. استخدم أسلوبًا مختلفًا وأبسط.]':'';
 const base=(process.env.ANTHROPIC_BASE_URL||'https://api.anthropic.com').replace(/\/$/,'');
 const models=[process.env.TUTOR_MODEL,'claude-haiku-5-5','claude-haiku-4-5','claude-sonnet-5-5'].filter(Boolean);
 let up=null;
 for(const m of models){
  let r;try{r=await fetch(base+'/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:m,max_tokens:400,stream:true,system:SYS+'\n'+mkInfo(b,p)+again,messages:[...hist,{role:'user',content:msg}]})})}catch(e){return json(502,{error:'upstream'})}
  if(r.status===400||r.status===404)continue;
  if(!r.ok||!r.body)return json(502,{error:'upstream'});
  up=r;break;
 }
 if(!up)return json(502,{error:'model'});
 const enc=new TextEncoder(),dec=new TextDecoder();
 const out=new ReadableStream({async start(ctl){
  const rd=up.body.getReader();let buf='';
  try{for(;;){const{done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});
   let k;while((k=buf.indexOf('\n'))>=0){const line=buf.slice(0,k).trim();buf=buf.slice(k+1);
    if(!line.startsWith('data:'))continue;const d=line.slice(5).trim();if(!d||d==='[DONE]')continue;
    try{const ev=JSON.parse(d);if(ev.type==='content_block_delta'&&ev.delta&&ev.delta.type==='text_delta'&&ev.delta.text)ctl.enqueue(enc.encode(ev.delta.text))}catch(e){}}}}
  catch(e){}finally{try{ctl.close()}catch(e){}}}});
 return new Response(out,{status:200,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store','x-accel-buffering':'no'}});
};
