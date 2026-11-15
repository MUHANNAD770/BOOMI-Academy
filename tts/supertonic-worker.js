/* supertonic-worker.js — محرك Supertonic 3 (نسخة int8) داخل المتصفح، في Web Worker حتى لا تتجمد الواجهة.
   • النموذج وبيئة التشغيل (ONNX Runtime Web) مدمجان في المشروع نفسه: tts/supertonic3/ و tts/ort/ — لا اتصال بأي موقع خارجي.
   • عند أول تشغيل تُنسخ الملفات من الموقع نفسه إلى ذاكرة المتصفح (Cache Storage) تلقائيًا مرة واحدة، ثم يعمل بلا إنترنت.
   • الأصوات العشرة داخل voice.bin: 0–4 = معلمات (F1–F5)، 5–9 = معلّمون (M1–M5). يدعم العربية والإنجليزية (و٢٩ لغة أخرى).
   الرسائل: probe | download | init | synth | forget  ←  progress | ready | audio | error | probe | downloaded | forgot */
'use strict';
let OR=null,cfg=null,indexer=null,S={},conf=null,loading=null,VB=null;
const styles=new Map();
const CACHE='hurufi-model-supertonic3-v2';
const post=(m,tr)=>self.postMessage(m,tr||[]);
const P=(n,k)=>Array.from({length:k},(_,i)=>`${n}.int8.onnx.part${i}`);
const PARTS={duration_predictor:['duration_predictor.int8.onnx'],text_encoder:P('text_encoder',2),vector_estimator:P('vector_estimator',4),vocoder:P('vocoder',2)};
const MODELS=Object.keys(PARTS);
const EXTRA=['tts.json','unicode_indexer.bin','voice.bin'];
const RT=['ort.bundle.min.mjs','ort-wasm-simd-threaded.wasm'];
const urlOf=(base,p)=>base.replace(/\/$/,'')+'/'+p;
const filesFor=c=>[...MODELS.flatMap(m=>PARTS[m]).concat(EXTRA).map(f=>urlOf(c.base,f)),...RT.map(f=>urlOf(c.ortBase,f))];
const VOICE_IDX=v=>(v[0]==='M'?5:0)+Math.max(0,Math.min(4,(+v.slice(1)||1)-1));

/* ---------- التخزين ---------- */
async function cached(url){const c=await caches.open(CACHE);return c.match(url)}
async function fetchStore(url,onBytes){const c=await caches.open(CACHE),hit=await c.match(url);if(hit){const n=+hit.headers.get('content-length')||0;onBytes(n,n,true);return}
 let last=null;for(let k=0;k<3;k++){try{const r=await fetch(url,{cache:'no-store',credentials:'omit'});if(!r.ok)throw new Error('download '+r.status+' '+url.split('/').pop());
  const total=+r.headers.get('content-length')||0,rd=r.body.getReader(),parts=[];let got=0;
  for(;;){const{done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;onBytes(got,total,false)}
  const blob=new Blob(parts);await c.put(url,new Response(blob,{headers:{'content-type':'application/octet-stream','content-length':String(blob.size)}}));return}
 catch(e){last=e;await new Promise(z=>setTimeout(z,700*(k+1)))}}throw last}
async function bytes(url){const r=await cached(url);if(!r)throw new Error('missing '+url.split('/').pop());return new Uint8Array(await r.arrayBuffer())}
async function joined(base,names){if(names.length===1)return bytes(urlOf(base,names[0]));const L=[];let n=0;for(const f of names){const b=await bytes(urlOf(base,f));L.push(b);n+=b.length}
 const o=new Uint8Array(n);let p=0;for(const b of L){o.set(b,p);p+=b.length}return o}
async function json(url){const r=await cached(url);if(!r)throw new Error('missing '+url.split('/').pop());return r.json()}

/* ---------- ONNX Runtime (محلي) ---------- */
async function rtFile(c,name,onBytes){const url=urlOf(c.ortBase,name),k=await cached(url);if(k)return k;await fetchStore(url,onBytes||(()=>{}));return cached(url)}
async function loadOrt(c){if(OR)return;const[js,wasm]=RT;
 let code=await (await rtFile(c,js)).text();self.__ORTU=urlOf(c.ortBase,js);
 /* import.meta.url داخل ملف blob لا يصلح أساسًا للمسارات: نستعمل الرابط الحقيقي لخيوط المعالجة */
 code=code.replace(/new Worker\(new URL\(import\.meta\.url\)/g,'new Worker(new URL(__IMU__)').replace(/import\.meta\.url/g,'(self.__ORTU||import.meta.url)').replace(/__IMU__/g,'import.meta.url');
 const src=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
 const mod=await import(src);OR=mod.default&&mod.default.InferenceSession?mod.default:mod;
 OR.env.wasm.wasmBinary=await (await rtFile(c,wasm)).arrayBuffer();
 OR.env.wasm.wasmPaths=c.ortBase.replace(/\/?$/,'/');
 const iso=!!self.crossOriginIsolated,hc=self.navigator.hardwareConcurrency||2;
 OR.env.wasm.numThreads=c.threads?Math.max(1,c.threads):iso?Math.max(1,Math.min(4,Math.floor(hc/2))):1;OR.env.wasm.simd=true;OR.env.logLevel='error'}
async function session(name){const b=await joined(conf.base,PARTS[name]);
 return OR.InferenceSession.create(b,{executionProviders:['wasm'],graphOptimizationLevel:'all',enableCpuMemArena:false})}
async function init(c){conf=c;await loadOrt(c);cfg=await json(urlOf(c.base,'tts.json'));
 const ib=await bytes(urlOf(c.base,'unicode_indexer.bin'));indexer=new Int32Array(ib.buffer.slice(ib.byteOffset,ib.byteOffset+ib.byteLength));
 VB=await bytes(urlOf(c.base,'voice.bin'));
 for(let i=0;i<MODELS.length;i++){post({t:'progress',stage:'load',file:MODELS[i],i:i+1,n:MODELS.length});S[MODELS[i]]=await session(MODELS[i])}
 await warm();
 post({t:'ready',ep:'wasm',threads:OR.env.wasm.numThreads,iso:!!self.crossOriginIsolated,sr:cfg.ae.sample_rate})}
async function warm(){await infer('أ.','ar',await style(conf.voices[0]),2,1.05)}

/* ---------- الأصوات (voice.bin: رأس 6×int64 ثم style_ttl ثم style_dp لكل الأصوات) ---------- */
async function style(v){if(styles.has(v))return styles.get(v);
 const dv=new DataView(VB.buffer,VB.byteOffset,VB.byteLength),g=i=>Number(dv.getBigInt64(i*8,true)),n=g(0),a1=g(1),a2=g(2),b1=g(4),b2=g(5),i=Math.min(n-1,VOICE_IDX(v));
 const f32=(off,len)=>{const o=new Float32Array(len);for(let k=0;k<len;k++)o[k]=dv.getFloat32(off+k*4,true);return o};
 const tl=a1*a2,dl=b1*b2,s={ttl:new OR.Tensor('float32',f32(48+i*tl*4,tl),[1,a1,a2]),dp:new OR.Tensor('float32',f32(48+n*tl*4+i*dl*4,dl),[1,b1,b2])};
 styles.set(v,s);return s}

/* ---------- النص (مطابق لمعالجة Supertonic الرسمية) ---------- */
const LANGS=new Set(['en','ko','ja','ar','bg','cs','da','de','el','es','et','fi','fr','hi','hr','hu','id','it','lt','lv','nl','pl','pt','ro','ru','sk','sl','sv','tr','uk','vi']);
/* العربية: النموذج تدرّب أساسًا على نص غير مشكول، فالتشكيل الكامل يربكه (قيس ذلك بالتعرّف الآلي على الكلام: الأخطاء تقل كثيرًا بلا حركات).
   لذلك نُبقي فقط ما يحتاجه النطق (حسب POL)، ونترك الكلمات القصيرة جدًا (مقاطع الحروف مثل «بَ») بتشكيلها الكامل لأن الحركة هي الدرس نفسه. */
/* أفضل طريقة لكل نبرة حسب قياس الوضوح بالتعرّف على الكلام (Whisper) على جمل الموقع */
const POLV={F1:'shonly',F2:'plain',F3:'shonly',F4:'plain',F5:'plain',M1:'plain',M2:'shonly',M3:'sh',M4:'plain',M5:'plain'};
let POL='shonly';
const AR_LET=/[\u0621-\u064A\u0671]/g,MARKS=/[\u064B-\u0652\u0670]/g;
/* الأرقام: النموذج لا يقرأ الأرقام المكتوبة (١، ٢٠…) فنحوّلها إلى كلمات عربية */
const ONES=['صفر','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة'],TENS=['','عشرة','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'],
 HUN=['','مئة','مئتان','ثلاثمئة','أربعمئة','خمسمئة','ستمئة','سبعمئة','ثمانمئة','تسعمئة'];
function n2w(n){if(n<10)return ONES[n];if(n===10)return'عشرة';if(n===11)return'أحد عشر';if(n===12)return'اثنا عشر';if(n<20)return ONES[n-10]+' عشر';
 if(n<100)return n%10?ONES[n%10]+' و'+TENS[Math.floor(n/10)]:TENS[n/10];
 if(n<1000)return HUN[Math.floor(n/100)]+(n%100?' و'+n2w(n%100):'');
 if(n<1e6){const k=Math.floor(n/1000),r=n%1000,K=k===1?'ألف':k===2?'ألفان':k<=10?n2w(k)+' آلاف':n2w(k)+' ألف';return K+(r?' و'+n2w(r):'')}return null}
function arNum(t){return t.replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-0x660)).replace(/\d+/g,m=>{const w=n2w(+m);return w==null?m:w})}
function arText(t){return arNum(t).replace(/\u0640/g,'').replace(/[\u0621-\u064A\u0671][\u0621-\u064A\u0671\u064B-\u0652\u0670]*/g,w=>{const n=(w.match(AR_LET)||[]).length;if(n<=1)return w;
 if(POL==='plain')return w.replace(MARKS,'');
 if(POL==='sh')return w.replace(/[\u064E\u064F\u0650\u0652\u0670]/g,'');
 return w.replace(/[\u064B-\u0650\u0652\u0670]/g,'')})}
/* أسماء بعض الحروف الإنجليزية المفردة التي ينطقها النموذج خطأ (W, Z) */
const EN_LET={W:'double you',Z:'zee'};
function prep(t,lang){if(lang==='ar')t=arText(String(t));else t=String(t).replace(/(^|[^A-Za-z'])([WZ])(?![A-Za-z'])/g,(m,a,c)=>a+EN_LET[c]);t=String(t).normalize('NFKD').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu,'')
 .replace(/[–‑—]/g,'-').replace(/[_\[\]|/#→←]/g,' ').replace(/[“”«»]/g,'"').replace(/[‘’´`]/g,"'").replace(/[♥☆♡©\\]/g,'')
 .replace(/ ([,.!?;:'،؟])/g,'$1').replace(/\s+/g,' ').trim();
 if(!/[.!?;:,'")\]}…؟،。」』】〉》›»]$/.test(t))t+='.';if(!LANGS.has(lang))lang='en';return`<${lang}>${t}</${lang}>`}
function ids(t){const out=new BigInt64Array(t.length);for(let j=0;j<t.length;j++){const cp=t.charCodeAt(j);out[j]=BigInt(cp<indexer.length?indexer[cp]:-1)}return out}
function gauss(n){const o=new Float32Array(n);for(let i=0;i<n;i+=2){const u=Math.max(1e-4,Math.random()),v=Math.random(),r=Math.sqrt(-2*Math.log(u));o[i]=r*Math.cos(2*Math.PI*v);if(i+1<n)o[i+1]=r*Math.sin(2*Math.PI*v)}return o}

async function infer(text,lang,st,steps,speed,voice){POL=POLV[voice]||'shonly';const p=prep(text,lang),L=p.length,tid=new OR.Tensor('int64',ids(p),[1,L]),tm=new OR.Tensor('float32',new Float32Array(L).fill(1),[1,1,L]);
 const d=await S.duration_predictor.run({text_ids:tid,style_dp:st.dp,text_mask:tm});let dur=d.duration.data[0]/speed;
 const te=await S.text_encoder.run({text_ids:tid,style_ttl:st.ttl,text_mask:tm});
 const sr=cfg.ae.sample_rate,chunk=cfg.ae.base_chunk_size*cfg.ttl.chunk_compress_factor,dim=cfg.ttl.latent_dim*cfg.ttl.chunk_compress_factor;
 const wl=Math.floor(dur*sr),ll=Math.max(1,Math.floor((wl+chunk-1)/chunk));
 let xt=gauss(dim*ll);const lm=new OR.Tensor('float32',new Float32Array(ll).fill(1),[1,1,ll]),tot=new OR.Tensor('float32',new Float32Array([steps]),[1]);
 for(let s=0;s<steps;s++){const r=await S.vector_estimator.run({noisy_latent:new OR.Tensor('float32',xt,[1,dim,ll]),text_emb:te.text_emb,style_ttl:st.ttl,latent_mask:lm,text_mask:tm,current_step:new OR.Tensor('float32',new Float32Array([s]),[1]),total_step:tot});
  xt=r.denoised_latent.data instanceof Float32Array?r.denoised_latent.data:Float32Array.from(r.denoised_latent.data)}
 const v=await S.vocoder.run({latent:new OR.Tensor('float32',xt,[1,dim,ll])});let w=v.wav_tts.data;w=w instanceof Float32Array?w:Float32Array.from(w);
 /* نقصّ الصمت الزائد في النهاية ونضيف تلاشيًا قصيرًا يمنع «الطقطقة» بين الجمل */
 /* نهاية الجملة: نترك هامشًا كافيًا (٠٫٢ ث) كي لا تُقصّ الحروف الهامسة في آخر الكلمة (th, f, s, ث، ف، س) */
 const n=Math.min(w.length,wl+Math.floor(sr*.2));let pk=0;for(let i=0;i<n;i++){const a=w[i]<0?-w[i]:w[i];if(a>pk)pk=a}
 /* بدايتها: نحذف الصمت الطويل قبل الكلام (كان يؤخر الصوت ~٠٫٣ ث) مع هامش ٧٠ م.ث يحفظ أول حرف */
 let s0=0;const th=Math.max(1e-4,pk*.02);while(s0<n&&Math.abs(w[s0])<th)s0++;s0=Math.max(0,s0-Math.floor(sr*.07));
 const o=w.slice(s0,n),m=o.length,f=Math.min(m>>1,Math.floor(sr*.012));for(let i=0;i<f;i++){o[i]*=i/f;o[m-1-i]*=i/f}return level(o)}
/* ارتفاع صوت ثابت لكل الجمل والنبرات + منع التشوّه (كان يتجاوز الحد الأقصى أحيانًا فيصير الصوت «مكسّرًا») */
function level(w){let e=0,pk=0;for(let i=0;i<w.length;i++){const x=w[i];e+=x*x;const a=x<0?-x:x;if(a>pk)pk=a}if(!w.length||!pk)return w;
 const rms=Math.sqrt(e/w.length);let g=Math.min(4,.1/Math.max(rms,1e-4));
 for(let i=0;i<w.length;i++){const x=w[i]*g;w[i]=x>.9||x<-.9?Math.sign(x)*(.9+.1*Math.tanh((Math.abs(x)-.9)/.1)):x}return w}
async function synth(m){const st=await style(m.voice),w=await infer(m.text,m.lang,st,m.steps||4,m.speed||1.05,m.voice);post({t:'audio',id:m.id,wav:w,sr:cfg.ae.sample_rate},[w.buffer])}

self.onmessage=async e=>{const m=e.data;try{
 if(m.t==='probe'){const L=filesFor(m.conf);let have=0;for(const u of L)if(await cached(u))have++;post({t:'probe',have,n:L.length})}
 else if(m.t==='download'){const c=m.conf,L=filesFor(c),got=new Array(L.length).fill(0),tot=new Array(L.length).fill(0);let next=0;
  const sum=a=>a.reduce((x,y)=>x+y,0),rep=(i)=>post({t:'progress',stage:'download',file:L[i].split('/').pop(),i:i+1,n:L.length,loaded:sum(got),total:Math.max(m.size||0,sum(tot))});
  const run=async()=>{for(;;){const i=next++;if(i>=L.length)return;await fetchStore(L[i],(g,t)=>{got[i]=g;tot[i]=Math.max(t,g);rep(i)})}};
  await Promise.all([run(),run(),run()]);post({t:'downloaded'})}
 else if(m.t==='init'){if(!loading)loading=init(m.conf);await loading}
 else if(m.t==='synth')await synth(m);
 else if(m.t==='policy'){POL=m.pol||POL}
 else if(m.t==='forget'){for(const k in S){try{await S[k].release()}catch(e){}}S={};await caches.delete(CACHE);post({t:'forgot'})}
}catch(err){if(m.t==='init')loading=null;post({t:'error',id:m.id,stage:m.t,msg:String(err&&err.message||err)})}};
