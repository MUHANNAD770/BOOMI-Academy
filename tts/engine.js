/* engine.js — محرك صوت بومي: Supertonic 3 المدمج (المحرك الوحيد؛ أُزيل Sherpa وصوت الجهاز).
   • Supertonic 3 (int8) وبيئة التشغيل مدمجان داخل المشروع (tts/supertonic3 و tts/ort): لا تنزيل من أي موقع خارجي ولا زر تنزيل.
   • عند أول فتح يُنسخ النموذج من الموقع نفسه إلى ذاكرة المتصفح تلقائيًا في الخلفية (مرة واحدة)، وخلال ذلك يعمل صوت الجهاز فورًا.
   • بعدها يعمل بلا إنترنت. الجمل الثابتة في الموقع تُشغَّل من مقاطع مسجّلة مسبقًا بالصوت نفسه (فورية، voice-cloud.js).
   • ذاكرة للأصوات المولَّدة: في الذاكرة (فورية) + Cache Storage للكلمات والجمل القصيرة (تكرار فوري بلا إعادة توليد).
   الواجهة: HurufiTTS.ok() .play(نص، لغة، مزاج، صالح، عند_البدء) .prefetch() .stop() .pause() .resume() */
(()=>{
'use strict';
const HERE=new URL('./',document.currentScript&&document.currentScript.src?document.currentScript.src:location.href).href;
const CFG=Object.assign({
 base:HERE+'supertonic3/',ortBase:HERE+'ort/',size:157e6, /* ~145 م.ب نموذج + 11 م.ب بيئة التشغيل */
 voices:{female:['F1','F2','F3','F4','F5'],male:['M1','M2','M3','M4','M5']}
},window.HURUFI_TTS_CONFIG||{});
const KEY='hurufi-tts';
const ls={get(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}},set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}};
let st=Object.assign({engine:'supertonic',voiceF:'F1',voiceM:'M4'},ls.get());
delete st.src;delete st.gpu;
/* المحرك الوحيد الآن: Supertonic 3 المدمج (أُزيل Sherpa وصوت الجهاز) */
if(st.v!==5){st.v=5;st.voiceF='F1';st.voiceM='M4'}st.engine='supertonic';
let fb=false; 
const save=()=>ls.set(st);
const conf=()=>({base:CFG.base,ortBase:CFG.ortBase,voices:[...CFG.voices.female,...CFG.voices.male],preferGPU:false,threads:st.oneThread?1:(CFG.threads||0)});
const teacher=()=>window.P&&P.teacher==='male'?'male':'female';
const voice=()=>teacher()==='male'?st.voiceM:st.voiceF;
const speed=()=>{const r=+(window.P&&P.rate)||.92;return Math.max(.8,Math.min(1.4,r/.92))};

/* ---------- العامل (Worker) ---------- */
let W=null,ready=false,failed=false,info=null,seq=0;const pend=new Map(),listeners=new Set();
const emit=m=>listeners.forEach(f=>{try{f(m)}catch(e){}});
function worker(){if(W)return W;W=new Worker('tts/supertonic-worker.js?v=60');W.onmessage=e=>{const m=e.data;
  if(m.t==='audio'||(m.t==='error'&&m.id)){const p=pend.get(m.id);if(p){pend.delete(m.id);m.t==='audio'?p.ok(m):p.no(new Error(m.msg))}}
  if(m.t==='ready'){ready=true;failed=false;info=m;document.documentElement.classList.add('tts-local')}
  if(m.t==='ep'&&info)info.ep=m.ep;
  if(m.t==='error'&&(m.stage==='init'||m.stage==='download')){failed=true;ready=false}
  emit(m)};
 W.onerror=e=>{failed=true;ready=false;emit({t:'error',stage:'worker',msg:String(e.message||'worker')})};return W}
const call=(msg,until)=>new Promise((ok,no)=>{const w=worker(),h=m=>{if(until.includes(m.t)){listeners.delete(h);ok(m)}else if(m.t==='error'&&(!m.id)&&(m.stage===msg.t)){listeners.delete(h);no(new Error(m.msg))}};listeners.add(h);w.postMessage(msg)});

/* ---------- الصوت (WebAudio) ---------- */
let ac=null,src=null,ep=0,paused=false,doneCb=null;
const ctx=()=>{if(!ac){const A=window.AudioContext||window.webkitAudioContext;ac=new A({latencyHint:'interactive'})}return ac};
const unlock=()=>{try{const c=ctx();if(c.state==='suspended')c.resume();const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch(e){}};
['touchend','click','keydown'].forEach(t=>addEventListener(t,unlock,{once:true,capture:true,passive:true}));
const vol=()=>Math.max(.05,Math.min(1,window.P&&P.vol!=null?+P.vol:1));

/* ---------- ذاكرة الأصوات المولَّدة ---------- */
const MEM=new Map(),MEMN=60,ACACHE='hurufi-tts-audio-v2';
const hash=s=>{let a=0x811c9dc5,b=0x01000193;for(let i=0;i<s.length;i++){a^=s.charCodeAt(i);a=Math.imul(a,b)>>>0}return a.toString(36)+s.length.toString(36)};
const keyOf=(t,l)=>['s3',voice(),l,speed().toFixed(2),t].join('|');
async function fromStore(k){try{const c=await caches.open(ACACHE),r=await c.match('/__tts/'+hash(k));if(!r)return null;const sr=+r.headers.get('x-sr')||44100,i=new Int16Array(await r.arrayBuffer()),f=new Float32Array(i.length);for(let j=0;j<i.length;j++)f[j]=i[j]/32767;return{wav:f,sr}}catch(e){return null}}
async function toStore(k,a){try{if(a.wav.length>a.sr*8)return;const i=new Int16Array(a.wav.length);for(let j=0;j<i.length;j++)i[j]=Math.max(-1,Math.min(1,a.wav[j]))*32767;const c=await caches.open(ACACHE);await c.put('/__tts/'+hash(k),new Response(i.buffer,{headers:{'x-sr':String(a.sr)}}));
 /* حدّ أعلى للتخزين: نحذف الأقدم */ const ks=await c.keys();if(ks.length>600)for(const r of ks.slice(0,ks.length-600))c.delete(r)}catch(e){}}
const inflight=new Map(),Q=[];let busy=false;
/* طابور بأولوية: ما يطلبه الطالب الآن يُولَّد أولًا، والتحضير المسبق (prefetch) يأتي بعده */
let LAT=0; /* متوسط زمن توليد جملة (مللي ثانية) */
function pump(){if(busy||!Q.length)return;Q.sort((a,b)=>b.pri-a.pri||a.n-b.n);const j=Q.shift();if(j.pri<0){j.no(new Error('dropped'));return pump()}busy=true;const id=++seq,t0=performance.now();
 pend.set(id,{ok:m=>{busy=false;const d=performance.now()-t0;LAT=LAT?LAT*.6+d*.4:d;j.ok(m);pump()},no:e=>{busy=false;j.no(e);pump()}});
 worker().postMessage({t:'synth',id,text:j.t,lang:j.l==='ar'?'ar':'en',voice:j.v,speed:j.sp,steps:STEPS()})}
/* عدد خطوات التوليد: أكثر = أنقى. على الأجهزة متعددة الخيوط ٥، وإلا ٤ (٣ وأقل كانت تسبب تشوّهًا) */
const STEPS=()=>info&&info.threads>2?6:5; /* أقل من ٥ خطوات يقلّ وضوح النطق بوضوح (قياس Whisper) */
let qn=0;
function get(t,l,pri){const k=keyOf(t,l);if(MEM.has(k)){const v=MEM.get(k);MEM.delete(k);MEM.set(k,v);return Promise.resolve(v)}
 if(inflight.has(k)){const f=inflight.get(k);if(pri&&f.job)f.job.pri=Math.max(f.job.pri,pri);return f}
 let job=null;const p=(async()=>{let a=await fromStore(k);if(!a){a=await new Promise((ok,no)=>{job={t,l,v:voice(),sp:speed(),pri:pri||0,n:++qn,ok,no};p.job=job;Q.push(job);pump()});a={wav:a.wav,sr:a.sr};toStore(k,a)}
  MEM.set(k,a);if(MEM.size>MEMN)MEM.delete(MEM.keys().next().value);return a})().finally(()=>inflight.delete(k));inflight.set(k,p);return p}
/* تحضير أصوات صفحة كاملة (كلمات الدرس، أسئلة الاختبار) في الخلفية */
function warmup(list){if(!ok()||!ready)return;for(const[t,l]of list.slice(0,24))if(t)get(String(t),l==='en'?'en':'ar',0).catch(()=>{})}
async function play(t,l,mood,valid,onStart){if(!ok(l))return false;if(!ready){pill(true); /* المؤشر يظهر فقط حين ينتظر الطالب صوتًا فعلًا */try{await whenReady()}catch(e){return false}if(!ready)return false;if(valid&&!valid())return true}const my=++ep;let a;
 try{a=await get(t,l,2)}catch(e){return false}
 if(my!==ep||(valid&&!valid()))return true;
 const c=ctx();try{if(c.state==='suspended')await c.resume()}catch(e){}
 return new Promise(res=>{try{const b=c.createBuffer(1,a.wav.length,a.sr);b.copyToChannel(a.wav,0);const s=c.createBufferSource(),g=c.createGain(),an=c.createAnalyser();an.fftSize=512;g.gain.value=vol();s.buffer=b;s.connect(g);g.connect(an);an.connect(c.destination);
  const td=new Float32Array(an.fftSize);let raf=0;const lip=()=>{an.getFloatTimeDomainData(td);let e=0;for(let i=0;i<td.length;i++)e+=td[i]*td[i];window.MC&&MC.level&&MC.level(Math.min(1,Math.sqrt(e/td.length)*7));if(src===s)raf=requestAnimationFrame(lip)};raf=requestAnimationFrame(lip);
  src=s;cg=g;ct0=c.currentTime;cdur=b.duration;doneCb=()=>res(true);s.onended=()=>{if(src===s){src=null;cg=null;doneCb=null}document.getElementById('mc')?.classList.remove('phoneme');res(true)};
  s.start();onStart&&onStart();document.getElementById('mc')?.classList.add('phoneme')}catch(e){res(false)}})}
function stop(){ep++;for(const j of Q)j.pri=Math.min(j.pri,0);try{src&&src.stop()}catch(e){}src=null;cg=null;if(doneCb){const d=doneCb;doneCb=null;d()}try{ac&&ac.state==='suspended'&&paused&&ac.resume()}catch(e){}paused=false}
/* إنهاء سلس + الوقت المتبقي من الجملة الحالية (لنظام إدارة الصوت المركزي) */
let cg=null,ct0=0,cdur=0;
function fade(ms){if(!src||!cg)return false;try{const n=ac.currentTime,d=(ms||300)/1000;cg.gain.cancelScheduledValues(n);cg.gain.setValueAtTime(cg.gain.value,n);cg.gain.linearRampToValueAtTime(0.0001,n+d);src.stop(n+d+.02)}catch(e){stop()}return true}
const remaining=()=>src&&ac?Math.max(0,cdur-(ac.currentTime-ct0))*1000:0;
const flush=()=>{for(const j of Q)if(j.pri<2)j.pri=-1};
const pause=()=>{if(ac&&ac.state==='running'&&src){ac.suspend();paused=true;return true}return false};
const resume=()=>{if(ac&&paused){ac.resume();paused=false;return true}return false};
const ok=l=>st.engine==='supertonic'||fb; /* الملفات داخل المشروع: يُجهَّز تلقائيًا وننتظره أول مرة */
const whenReady=()=>ready?Promise.resolve():install();
const fallback=()=>{fb=true;return whenReady()};

/* ---------- التثبيت والتشغيل التلقائي ---------- */
async function probe(){const m=await call({t:'probe',conf:conf()},['probe']);return m.have===m.n}
/* تشغيل المحرك مع محاولات بديلة تلقائية: خيط واحد، ثم بدون WebGPU */
async function start(){try{await call({t:'init',conf:conf()},['ready'])}catch(e){
 if(!st.oneThread){st.oneThread=1;save();W&&W.terminate();W=null;failed=false;return await call({t:'init',conf:conf()},['ready'])}throw e}}
let installing=null;
async function install(){if(installing)return installing;installing=(async()=>{failed=false;
 try{if(navigator.storage&&navigator.storage.persist)await navigator.storage.persist()}catch(e){}
 const p=await call({t:'probe',conf:conf()},['probe']);if(p.have<p.n)await call({t:'download',conf:conf(),size:CFG.size},['downloaded']);
 await start();st.installed=1;save(); return info})().finally(()=>{installing=null});return installing}
/* تشغيل تلقائي: إن كانت الملفات محفوظة نشغّل المحرك فورًا، وإلا نجهّزها في الخلفية (بلا زر، وبلا تعطيل للدروس) */
async function boot(){if(st.engine!=='supertonic'||ready||installing)return;
 try{const p=await call({t:'probe',conf:conf()},['probe']);
  if(p.have===p.n)await start();
  else await install()} /* الملفات موجودة داخل المشروع: تُجهَّز تلقائيًا بلا أي تدخل */
 catch(e){failed=true}finally{pill(false)}}
/* مؤشر صغير غير مزعج أثناء التجهيز الأول */
let pl=null,plT=0;
function pill(on){try{if(!on){if(pl&&ready){pl.textContent='✅ صوت بومي جاهز';clearTimeout(plT);plT=setTimeout(()=>{pl&&pl.remove();pl=null},2500)}else if(pl&&!ready&&failed){pl.remove();pl=null}return}
 if(!pl){pl=document.createElement('div');pl.id='tts-pill';pl.setAttribute('role','status');pl.style.cssText='position:fixed;inset-inline-start:10px;bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:30;background:#22254a;color:#fff;font:700 .8rem/1.2 inherit;padding:7px 12px;border-radius:99px;box-shadow:0 4px 14px rgba(0,0,0,.3);pointer-events:none;opacity:.92';document.body.appendChild(pl)}
 pl.textContent='🔊 جارٍ تجهيز صوت بومي…'}catch(e){}}
listeners.add(m=>{if(!pl)return;if(m.t==='progress'&&m.stage==='download'&&m.total)pl.textContent='🔊 جارٍ تجهيز صوت بومي… '+Math.min(99,Math.round(m.loaded/m.total*100))+'٪';else if(m.t==='progress'&&m.stage==='load')pl.textContent='⚙️ تشغيل صوت بومي…';else if(m.t==='ready')pill(false)});
async function forget(){stop();try{await call({t:'forget'},['forgot'])}catch(e){}try{await caches.delete(ACACHE)}catch(e){}W&&W.terminate();W=null;ready=false;st.engine='supertonic';st.installed=0;save();document.documentElement.classList.remove('tts-local')}
function setEngine(e){st.engine=e;st.chosen=1;save();if(e==='supertonic'&&!ready)boot();if(e!=='supertonic')stop()}
const idle=window.requestIdleCallback||(f=>setTimeout(f,1500));
/* يبدأ تجهيز الصوت فور فتح الموقع (الملفات داخل المشروع) كي يكون جاهزًا قبل أن يحتاجه الطالب */
/* أغلب أصوات الموقع مقاطع جاهزة فورية؛ لذلك لا نشغّل المحرك الثقيل عند فتح الصفحة (كان يسبب بطئًا وتعليقًا في الهواتف).
   نجهّزه بهدوء بعد استقرار الموقع، أو فورًا عند أول جملة لا مقطع لها (مثل اسم الطالب). */
{const lite=()=>{try{const n=navigator.connection;return !!(n&&(n.saveData||/(^|-)2g|3g/.test(n.effectiveType||'')))||(navigator.deviceMemory&&navigator.deviceMemory<3)}catch(e){return false}};
 const later=()=>{if(lite())return;idle(()=>boot(),{timeout:8000})};
 if(st.installed&&!lite())setTimeout(later,6000);else setTimeout(later,25000)}

window.HurufiTTS={ok,play,fallback,fade,remaining,flush,speaking:()=>!!src,cached:(t,l)=>MEM.has(keyOf(t,l)),lat:()=>LAT,prefetch:(t,l)=>{if(ok()&&ready)get(t,l,1).catch(()=>{})},warmup,stop,pause,resume,install,forget,probe,setEngine,on:f=>{listeners.add(f);return()=>listeners.delete(f)},
 state:()=>({...st,ready,failed,info,size:CFG.size,installing:!!installing}),set:(k,v)=>{st[k]=v;save();MEM.clear()},voices:CFG.voices,
 multilingual:false};
})();
