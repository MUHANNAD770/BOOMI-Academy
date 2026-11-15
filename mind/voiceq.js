/* mind/voiceq.js — الطبقة ٤: الأسئلة الصوتية المفاجئة.
   • بومي يختار وقتًا مناسبًا (ليس أثناء اختبار أو لعبة أو كلام)، ويسأل سؤالًا واحدًا من الذي تعلّمه الطالب فعلًا.
   • يتكلم بصوته، ثم يُفتح الميكروفون تلقائيًا مع عدّاد واضح (١٢–١٥ ثانية)، ويُغلق تلقائيًا عند انتهاء الوقت.
   • الأسئلة تُولَّد من بيانات الدروس وحساب مؤكد (لا اختراع): تسمية صورة بالعربية/الإنجليزية، عدّ، جمع/طرح/ضرب شفهي، معنى كلمة.
   • لا يتكرر السؤال (يتذكر آخر ٣٠)، ويراعي العمر والمستوى، وحدّ يومي وفاصل زمني.
   • إن لم يُسمح بالميكروفون أو لم يدعمه المتصفح: يجيب الطالب بالضغط على خيار. ولي الأمر يشغّل/يوقف الميزة من لوحته. */
window.MindVoice=(()=>{
'use strict';
const Mem=window.MindMemory,Coach=window.MindCoach;
const AD='٠١٢٣٤٥٦٧٨٩',D=n=>String(n).replace(/\d/g,d=>AD[d]),R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[R(0,a.length-1)],sh=a=>[...a].sort(()=>Math.random()-.5);
const pic=x=>/\p{Extended_Pictographic}/u.test(x[1])&&x[1].length<=5&&!/\s/.test(x[0]);
const plain=s=>String(s).replace(/[ً-ْٰ]/g,'');
const fem=t=>(window.P&&P.gender==='female')?String(t).replace(/عُدَّ(?=\s)/g,'عُدِّي').replace('أَسْمَعُكَ','أَسْمَعُكِ').replace(/تَكَلَّمِ(?=\s)/g,'تَكَلَّمِي'):t;
const SR=()=>window.SpeechRecognition||window.webkitSpeechRecognition;
const micMode=()=>!!(P&&P.mic&&SR());
let open=false,bootAt=Date.now(),timer=0;

/* ---------- توليد السؤال (إجابات مؤكدة) ---------- */
function gens(){const age=+P.age||7,G=[],ml=P.ml||{},tried=k=>!!(ml[k]||(P.sk||{})['m-'+k]);
 const ar=Mem.dueItems('ar',10).filter(pic),en=Mem.dueItems('en',10).filter(pic);
 if(ar.length>=3)G.push(()=>{const it=pick(ar.slice(0,5));return{key:it[0],type:'pic-ar',lang:'ar',show:`<div class=vq-pic>${it[1]}</div>`,ask:'مَا اسْمُ هَذَا بِالْعَرَبِيَّةِ؟',answer:it[0],kind:'word',pool:ar.map(x=>x[0])}});
 if(en.length>=3&&P.lang!=='ar')G.push(()=>{const it=pick(en.slice(0,5));return{key:it[0],type:'pic-en',lang:'en',show:`<div class=vq-pic>${it[1]}</div>`,...((window.EnCoach&&EnCoach.level()<3)?{ask:'مَا اسْمُ هَذَا بِالإِنْجِلِيزِيَّةِ؟',askLang:'ar'}:{ask:'What is this?',askLang:'en'}), /* المستويان ١–٢: السؤال بالعربية */answer:it[0],kind:'word',pool:en.map(x=>x[0])}});
 if(ar.length&&en.length&&age>=7){const pairs=[];for(const e of en){const a=ar.find(x=>x[1]===e[1]);if(a)pairs.push([e,a])}
  if(pairs.length)G.push(()=>{const[e,a]=pick(pairs);return{key:a[0],type:'mean',lang:'ar',show:`<div class=vq-word dir=ltr>${e[0]}</div>`,ask:`مَا مَعْنَى كَلِمَةِ ${e[0]} بِالْعَرَبِيَّةِ؟`,answer:a[0],kind:'word',pool:ar.map(x=>x[0])}})}
 G.push(()=>{const n=R(1,age<6?5:10),e=pick(['⭐','🍎','⚽','🐟','🎈']);return{key:'m-cnt',type:'count',lang:'ar',show:`<div class=vq-obs>${e.repeat(n)}</div>`,ask:'كَمْ عَدَدُهَا؟ عُدَّ بِصَوْتٍ مَسْمُوعٍ.',answer:n,kind:'num'}});
 if(age>=6||tried('add'))G.push(()=>{const mx=[5,9,10,10][Math.min(3,((ml.add||{}).l||1)-1)],a=R(1,mx),b=R(1,mx);return{key:'m-add',type:'add',lang:'ar',show:`<div class=vq-word dir=ltr>${D(a)} + ${D(b)}</div>`,ask:`كَمْ يُسَاوِي ${D(a)} زَائِدْ ${D(b)}؟`,answer:a+b,kind:'num',mx:{a,b,op:'+'}}});
 if(age>=7&&tried('sub'))G.push(()=>{let a=R(2,10),b=R(1,9);if(b>a)[a,b]=[b,a];return{key:'m-sub',type:'sub',lang:'ar',show:`<div class=vq-word dir=ltr>${D(a)} − ${D(b)}</div>`,ask:`كَمْ يُسَاوِي ${D(a)} نَاقِصْ ${D(b)}؟`,answer:a-b,kind:'num',mx:{a,b,op:'−'}}});
 if(age>=8&&(tried('mul')||tried('tbl')))G.push(()=>{const a=R(2,5),b=R(2,4);return{key:'m-tbl',type:'mul',lang:'ar',show:`<div class=vq-word dir=ltr>${D(a)} × ${D(b)}</div>`,ask:`كَمْ يُسَاوِي ${D(a)} ضَرْبْ ${D(b)}؟`,answer:a*b,kind:'num',mx:{a,b,op:'×'}}});
 return G}
function make(){const m=Mem.M(),G=gens();for(let i=0;i<12;i++){const q=pick(G)();const id=q.type+':'+q.answer;if(!m.vq.includes(id)){q.id=id;return q}}const q=pick(G)();q.id=q.type+':'+q.answer;return q}
function choices(q){if(q.kind==='num'){const s=new Set([q.answer]);let g=0;while(s.size<3&&g++<30)s.add(Math.max(0,q.answer+pick([-2,-1,1,2,3])));return sh([...s]).map(n=>({t:D(n),ok:n===q.answer}))}
 const o=sh((q.pool||[]).filter(w=>w!==q.answer)).slice(0,2);return sh([q.answer,...o]).map(w=>({t:w,ok:w===q.answer}))}

/* ---------- فهم الإجابة المنطوقة ---------- */
function numFrom(t){const n=Grade.norm(t),m=n.match(/\d+/);if(m)return +m[0];const w=n.split(' ');for(let i=0;i<w.length;i++){if(i<w.length-1){const b=Grade.asNum(w[i]+' '+w[i+1]);if(b!=null)return b}const a=Grade.asNum(w[i]);if(a!=null)return a}return null}
function judge(q,alts){alts=alts.filter(Boolean);if(!alts.length)return{ok:false,heard:''};
 if(q.kind==='num'){for(const a of alts)if(numFrom(a)===q.answer)return{ok:true,heard:a};return{ok:false,heard:alts[0],num:numFrom(alts[0])}}
 for(const a of alts){if(Grade.text(a,[q.answer],{speech:true}).ok)return{ok:true,heard:a};for(const tok of Grade.norm(a).split(' '))if(tok.length>1&&Grade.text(tok,[q.answer],{speech:true}).ok)return{ok:true,heard:a}}
 return{ok:false,heard:alts[0]}}

/* ---------- الواجهة ---------- */
const el=()=>document.getElementById('vq');
function close(){open=false;clearInterval(timer);const e=el();if(e)e.remove();try{say.stop()}catch(_){}}
function ask(manual){if(open||!window.P)return false;const q=make();if(!q)return false;q.ask=fem(q.ask);open=true;const m=Mem.M(),T=(+P.age||7)<7?15:12,mic=micMode();
 const d=document.createElement('div');d.id='vq';d.setAttribute('role','dialog');d.setAttribute('aria-label','سؤال من بومي');
 d.innerHTML=`<div class=vq-card><button class=vq-x aria-label="تخطّي">✕</button><div class=vq-head><span class=vq-owl>🦉</span><b>سُؤَالٌ مِنْ بُومِي!</b></div>${q.show}<p class=vq-ask dir=auto>${q.ask}</p>
  <div class=vq-timer hidden><svg viewBox="0 0 80 80"><circle cx=40 cy=40 r=34 class=vq-bg /><circle cx=40 cy=40 r=34 class=vq-fg /></svg><b id=vq-sec>${D(T)}</b></div>
  <p id=vq-st class=vq-st aria-live=polite>🔊 اِسْمَعِ السُّؤَالَ…</p><div id=vq-opts class=vq-opts hidden></div></div>`;
 document.body.appendChild(d);d.querySelector('.vq-x').onclick=()=>{stopRec();close()};
 try{HurufiSound.play('select');MC.mood('wow',1200)}catch(_){}
 const st=t=>{const e=document.getElementById('vq-st');if(e)e.textContent=fem(t)};
 let rec=null,alts=[],done=false,left=T;
 function stopRec(){try{rec&&rec.stop()}catch(_){}rec=null}
 function showChoices(){const b=document.getElementById('vq-opts');if(!b||!b.hidden)return;b.hidden=false;b.innerHTML=choices(q).map(o=>`<button class=opt data-ok=${+o.ok}>${o.t}</button>`).join('');
  b.querySelectorAll('button').forEach(x=>x.onclick=()=>finish(x.dataset.ok==='1',x.textContent,true))}
 function finish(ok,heard,tapped){if(done)return;done=true;clearInterval(timer);stopRec();const t=d.querySelector('.vq-timer');if(t)t.hidden=true;
  m.vq.push(q.id);if(m.vq.length>30)m.vq.shift();m.vqLast=Date.now();const day=new Date().toDateString();if(m.vqDay!==day){m.vqDay=day;m.vqN=0}m.vqN=(m.vqN||0)+1;
  const stat=P.stat.v=P.stat.v||[0,0];stat[0]++;stat[1]+=+ok;Mem.observe({k:q.key,ok,ms:(T-left)*1000,type:ok?'':'voice'});
  let msg;const ans=q.kind==='num'?D(q.answer):q.answer;
  if(ok){P.star=(P.star||0)+2;msg=Coach.choose(q.lang==='en'?'en':'ok')+' +٢ ⭐'}
  else if(!heard)msg=`لَمْ أَسْمَعْ جَوَابًا، لَا بَأْسَ! الْجَوَابُ: ${ans}.`;
  else{let why='';if(q.mx&&window.MindAnalyzer){const a=MindAnalyzer.analyze({k:q.key,show:`${q.mx.a} ${q.mx.op} ${q.mx.b}`},heard);why=a.fix||''}
   msg=`${Coach.choose('soft')} ${why||`الْجَوَابُ الصَّحِيحُ: ${ans}.`}`}
  save();st((ok?'✅ ':'💡 ')+msg);d.querySelector('.vq-card').classList.add(ok?'good':'soft');const b=document.getElementById('vq-opts');if(b&&!b.hidden)b.querySelectorAll('button').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('ok')});
  try{HurufiSound.play(ok?'correct':'wrong');MC.mood(ok?'proud':'tilt',1800)}catch(_){}
  let closed=false;const end=()=>{if(closed)return;closed=true;setTimeout(close,900)};
  if(!muted())say(msg.replace(/[^\p{L}\p{M}\p{N}\s،.!؟:+−×]/gu,' '),'ar',end,ok?'cheer':'soft');setTimeout(end,ok?4500:7500)}
 function listen(){if(done)return;const t=d.querySelector('.vq-timer');t.hidden=false;const fg=d.querySelector('.vq-fg'),C=2*Math.PI*34;fg.style.strokeDasharray=C;const t0=Date.now();
  timer=setInterval(()=>{const el2=(Date.now()-t0)/1000;left=Math.max(0,T-el2);fg.style.strokeDashoffset=C*(el2/T);const s=document.getElementById('vq-sec');if(s)s.textContent=D(Math.ceil(left));
   if(left<=0){clearInterval(timer);const j=judge(q,alts);finish(j.ok,j.heard)}},100);
  if(!mic){st('👆 اِخْتَرِ الْإِجَابَةَ');showChoices();return}
  const start=()=>{if(done)return;try{rec=new (SR())();rec.lang=q.lang==='en'?'en-US':'ar-SA';rec.interimResults=true;rec.maxAlternatives=5;rec.continuous=false;
    rec.onresult=e=>{const r=e.results[e.results.length-1],a=[...r].map(x=>x.transcript);st('🗣️ '+a[0]);a.forEach(x=>{if(!alts.includes(x))alts.unshift(x)});
     if(r.isFinal){const j=judge(q,alts);if(j.ok)finish(true,j.heard);else if(left>4){st('🎧 حَاوِلْ مَرَّةً أُخْرَى…');setTimeout(start,250)}else finish(false,j.heard)}};
    rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'||e.error==='audio-capture'){st('👆 اِخْتَرِ الْإِجَابَةَ');showChoices()}};
    rec.onend=()=>{if(!done&&left>3&&rec)setTimeout(()=>{if(!done&&document.getElementById('vq-opts').hidden)start()},200)};
    rec.start();st('🎤 أَسْمَعُكَ… تَكَلَّمِ الْآنَ');try{MC.mood('listen',T*1000)}catch(_){}}catch(_){st('👆 اِخْتَرِ الْإِجَابَةَ');showChoices()}};start()}
 /* بومي يتكلم أولًا، ثم يُفتح الميكروفون تلقائيًا */
 let started=false;const go=()=>{if(started||done)return;started=true;listen()};
 if(muted())setTimeout(go,900);else{say(q.ask,q.askLang||'ar',go,'ask');setTimeout(go,6500)}
 return true}

/* ---------- متى يسأل بومي؟ ---------- */
function eligible(){if(!window.P||P.vq===0||open)return false;const m=Mem.M(),gap=(P.vq===2?3:6)*60000;
 if(Date.now()-bootAt<90000||Date.now()-(m.vqLast||0)<gap)return false;
 if(m.vqDay===new Date().toDateString()&&(m.vqN||0)>=(P.vq===2?10:6))return false;
 if(!['home','sec'].includes(window.V)||document.getElementById('bm')||(window.say&&say.live))return false;
 return Mem.learned().length>=3||Object.keys(P.ml||{}).length>0}
const oh=window.h;window.h=function(x){const r=oh.apply(this,arguments);if(open&&!['home','sec'].includes(window.V)){/* انتقل الطالب لصفحة أخرى */}
 const v=window.V;setTimeout(()=>{if(window.V===v&&eligible()&&Math.random()<.5)ask()},3500);return r};
/* إعداد ولي الأمر + زر يدوي في الألعاب */
const oParent=window.parent;window.parent=function(){const r=oParent.apply(this,arguments);try{if(!document.getElementById('pn')&&!document.getElementById('vq-set')){const a=document.querySelector('#app .pdash')||document.querySelector('#app h2');
 a&&a.insertAdjacentHTML('afterend',`${Coach.report()}<div class=pdash id=vq-set><h3>🎤 أسئلة بومي الصوتية المفاجئة</h3><p class=mut>بومي يسأل الطالب سؤالًا واحدًا من الذي تعلّمه، بين التمارين لا أثناءها. ${micMode()?'يجيب الطالب بصوته.':'الميكروفون غير مفعّل، فيجيب الطالب بالضغط على الخيار.'}</p>
 <select onchange="P.vq=+this.value;save()"><option value=1 ${P.vq!==0&&P.vq!==2?'selected':''}>مفعّلة</option><option value=2 ${P.vq===2?'selected':''}>مفعّلة (أسئلة أكثر)</option><option value=0 ${P.vq===0?'selected':''}>متوقفة</option></select></div>`)}}catch(e){}return r};
const oSec=window.sec;window.sec=function(k){const r=oSec.apply(this,arguments);try{if(k==='games'){const l=app.querySelector('.list');l&&l.insertAdjacentHTML('afterbegin','<button class=row onclick="MindVoice.ask(true)"><span>🎤</span><b>سُؤَالٌ صَوْتِيٌّ مِنْ بُومِي</b><small>جديد</small></button>')}}catch(e){}return r};
return{ask,eligible,judge,numFrom,make,close,isOpen:()=>open,_boot:t=>{bootAt=t}};
})();
