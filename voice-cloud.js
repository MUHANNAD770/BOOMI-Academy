/* voice-cloud.js — صوت بومي: مقاطع Microsoft Edge Neural مسجّلة مسبقًا (المعلّمة: Zariyah عربي + Ava إنجليزي، المعلّم: Hamed + Andrew).
   • اختيار المعلّم/المعلّمة (P.teacher) يُحفظ في ملف الطالب ويُطبَّق على كل نطق في الموقع.
   • voices/clips/: حزم المقاطع + فهرس female.json / male.json (أداة tools/clips/). لا يوجد محرك توليد: نص بلا مقطع لا يُنطق.
   • يعمل بلا إنترنت بعد أول تحميل؛ لا مفاتيح API في الموقع. */
(()=>{
 'use strict';
 /* المقاطع المسجّلة مسبقًا (مثل دولينجو): كل جمل الموقع الثابتة مسجّلة مسبقًا بأصوات Edge العصبية (عربي: Zariyah/Hamed، إنجليزي: Ava/Andrew) بتشكيل كامل،
    ومحفوظة في حزم صغيرة voices/clips/{f,m}N.bin مع فهرس female.json / male.json. التشغيل فوري بلا توليد.
    ما لا يوجد له مقطع (نص متغيّر) يُولَّد بالمحرك المحلي. */
 const CC='hurufi-clips-v5' /* v4: نسخ الحزم القديمة المحفوظة في الأجهزة (v1–v3) قد لا تطابق الفهرس الحالي فتُسمع كلمة أخرى؛ تُحذف وتُجلب من جديد */,base='voices/clips/';
 const st={ix:{},load:{},blob:{},ep:0,audio:null,url:'',ac:null,an:null,raf:0,done:null,pre:{}};
 const key=(t,l)=>{const s=((l==='ar'?'ar':'en')+'|'+String(t||'').replace(/\s+/g,' ').trim()).normalize('NFC');let h=0x811c9dc5;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(36)+'_'+s.length.toString(36)};
 const teacher=()=>window.P&&P.teacher==='male'?'male':'female';
 const engVoice=()=>null; /* لا يوجد محرك توليد على الجهاز: كل الصوت مقاطع Edge مسجّلة */
 const loadIx=who=>st.load[who]||(st.load[who]=fetch(base+who+'.json?v=69',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(j&&j.idx){if(j.v)j.packs=j.packs.map(p=>p+'?v='+j.v);st.ix[who]=j;st.need=st.need||{};for(const[pi,off,len]of Object.values(j.idx)){const n=j.packs[pi];if((st.need[n]||0)<off+len)st.need[n]=off+len}}return st.ix[who]} /* لا تنزيل تلقائي لكل الحزم: كان ~130 م.ب في أول 30 ثانية فيبطئ الهاتف */).catch(()=>{st.load[who]=null;return null}));
 const ready=loadIx(teacher());
 try{window.caches&&['hurufi-clips-v1','hurufi-clips-v2','hurufi-clips-v3','hurufi-clips-v4'].forEach(n=>caches.delete(n))}catch(e){} /* مقاطع الإصدارات السابقة */
 /* أُزيل محرك Supertonic 3: نحذف ملفاته المحفوظة سابقًا في المتصفح (~157 م.ب) وإعداداته */
 try{window.caches&&caches.keys().then(ks=>ks.filter(k=>/^hurufi-(model-|tts-)/.test(k)).forEach(k=>caches.delete(k))).catch(()=>{})}catch(e){}
 try{localStorage.removeItem('hurufi-tts')}catch(e){}
 /* المقطع صالح فقط إذا كانت نبرة المعلّم/المعلّمة المختارة هي نفس نبرة المقاطع */
 const has=(t,l)=>{const who=teacher(),j=st.ix[who];if(!j){loadIx(who);return false}const v=engVoice(who);return(j.engine==='edge'||!v||v===j.voice)&&!!j.idx[key(t,l)]}; /* مقاطع Edge تعمل مع أي نبرة مختارة */
 const cache=()=>window.caches?caches.open(CC).catch(()=>null):Promise.resolve(null);
 /* حزمة كاملة من الذاكرة الدائمة أو الشبكة (تُحفظ فتعمل بلا إنترنت) */
 /* الحزم المحفوظة في الذاكرة: آخر ١٢ فقط (الباقي في ذاكرة المتصفح الدائمة) */
 const keep=(name,b)=>{delete st.blob[name];st.blob[name]=b;const ks=Object.keys(st.blob);if(ks.length>12)delete st.blob[ks[0]];return b};
 /* بعد سماع مقطع من حزمة: نحفظ حزمته (~1.5 م.ب) بهدوء فتعمل بلا إنترنت لاحقًا — فقط الحزم المستعملة فعلًا */
 const later=name=>{if(st.pre[name])return;try{const n=navigator.connection;if(n&&(n.saveData||/(^|-)2g|3g/.test(n.effectiveType||'')))return}catch(e){}st.pre[name]=1;
  (window.requestIdleCallback||(f=>setTimeout(f,1500)))(()=>pack(name).catch(()=>{st.pre[name]=0}),{timeout:6000})};
 const pack=async name=>{if(st.blob[name])return st.blob[name];const u=new URL(base+name,location.href).href,c=await cache();
  let r=c&&await c.match(u),b=r&&await r.blob();
  /* نسخة ناقصة أو قديمة (أقصر من نهاية آخر مقطع فيها) تُعاد من الخادم: إزاحات المقاطع ستكون خاطئة فتُسمع كلمة أخرى */
  if(!b||(st.need&&st.need[name]&&b.size<st.need[name])){r=await fetch(u,{cache:b?'reload':'default'});if(!r.ok)throw new Error('pack');b=await r.clone().blob();
   if(st.need&&st.need[name]&&b.size<st.need[name])throw new Error('pack-size');if(c)try{await c.put(u,r)}catch(e){}}
  return keep(name,b)};
 /* تحميل كل الحزم في الخلفية بهدوء (واحدة تلو الأخرى) بعد أن يستقر الموقع */
 const warm=(who,force)=>{if(st.pre[who])return;if(!force)try{const n=navigator.connection;if(n&&(n.saveData||/(^|-)2g|3g/.test(n.effectiveType||'')))return}catch(e){} /* بيانات محدودة: لا نحمّل كل الحزم مسبقًا؛ كل مقطع يُطلب وحده عند الحاجة */st.pre[who]=1;const j=st.ix[who];let i=0;
  const step=()=>{st.prog=[i,j.packs.length];if(i>=j.packs.length)return;const n=j.packs[i++];pack(n).then(()=>setTimeout(step,250),()=>setTimeout(step,4000))};
  setTimeout(step,300)};
 /* مقطع واحد: من الحزمة إن كانت محمّلة، وإلا نطلب جزءه فقط من الخادم (سريع جدًا) */
 const clip=async(who,k)=>{const j=st.ix[who],[p,off,len]=j.idx[k],name=j.packs[p];
  if(st.blob[name])return st.blob[name].slice(off,off+len,'audio/mpeg');
  try{const c=await cache(),hit=c&&await c.match(new URL(base+name,location.href).href);if(hit){const b=keep(name,await hit.blob());return b.slice(off,off+len,'audio/mpeg')}}catch(e){}
  try{const r=await fetch(base+name,{headers:{Range:'bytes='+off+'-'+(off+len-1)}});if(r.status===206){const b=await r.blob(),m=/bytes\s+(\d+)-(\d+)/.exec(r.headers.get('content-range')||'');
    /* نتحقق أن الخادم أعاد البايتات المطلوبة نفسها؛ وإلا نستعمل الحزمة كاملة */
    if(m&&+m[1]===off&&+m[2]===off+len-1&&b.size===len){later(name);return new Blob([b],{type:'audio/mpeg'})}}
   else if(r.ok){const b=await r.blob();if(!st.need||!st.need[name]||b.size>=st.need[name]){keep(name,b);return b.slice(off,off+len,'audio/mpeg')}}}catch(e){}
  return(await pack(name)).slice(off,off+len,'audio/mpeg')};
 /* التشغيل عبر Web Audio (وليس عنصر <audio>): يبدأ فورًا بلا قصّ لأول المقطع على الجوال، ويتوقف فورًا عند الضغط على كلمة أخرى.
    عند تغيير سرعة الكلام نستعمل <audio> مع الحفاظ على طبقة الصوت. */
 const AC=window.AudioContext||window.webkitAudioContext;
 const ctx=()=>{if(!st.ac&&AC){try{st.ac=new AC({latencyHint:'interactive'})}catch(e){st.ac=new AC()}st.gain=st.ac.createGain();st.an=st.ac.createAnalyser();st.an.fftSize=64;st.gain.connect(st.an);st.an.connect(st.ac.destination)}return st.ac};
 /* فتح الصوت من أول لمسة (شرط المتصفحات على الجوال) */
 const unlock=()=>{try{const c=ctx();if(!c)return;if(c.state!=='running')c.resume();if(!st.unl){st.unl=1;const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}}catch(e){}};
 ['pointerdown','touchstart','keydown'].forEach(t=>document.addEventListener(t,unlock,{capture:true,passive:true}));
 const BUF=new Map(); /* آخر المقاطع المفكوكة جاهزة للتشغيل الفوري */
 const decode=async(k,b)=>{if(BUF.has(k)){const v=BUF.get(k);BUF.delete(k);BUF.set(k,v);return v}if(!b)throw new Error('nobuf');const c=ctx();const ab=await b.arrayBuffer();
  const buf=await new Promise((ok,no)=>{try{const p=c.decodeAudioData(ab,ok,no);p&&p.then&&p.then(ok,no)}catch(e){no(e)}});BUF.set(k,buf);if(BUF.size>160)BUF.delete(BUF.keys().next().value);return buf};
 const mouthLoop=()=>{cancelAnimationFrame(st.raf);const d=new Uint8Array(st.an.frequencyBinCount),mc=document.getElementById('mc');
  const tick=()=>{st.an.getByteFrequencyData(d);let s=0;for(const x of d)s+=x;const v=s/d.length;mc&&mc.classList.toggle('phoneme',v>28);try{window.MC&&MC.level&&MC.level(Math.min(1,v/90))}catch(e){}st.raf=requestAnimationFrame(tick)};tick()};
 const quiet=()=>{cancelAnimationFrame(st.raf);st.raf=0;document.getElementById('mc')?.classList.remove('phoneme')};
 const stop=()=>{st.ep++;try{st.src&&st.src.stop()}catch(e){}st.src=null;try{st.audio&&st.audio.pause()}catch(e){}if(st.url)URL.revokeObjectURL(st.url);st.audio=null;st.url='';st.playing=0;quiet();if(st.done){const d=st.done;st.done=null;d(true)}};
 const rate=()=>Math.max(.8,Math.min(1.4,(+(window.P&&P.rate)||.92)/.92));
 const vol=()=>Math.max(.05,Math.min(1,window.P&&P.vol!=null?+P.vol:1));
 /* play → true عند الاكتمال/الإيقاف، false إذا تعذّر (فيُقرأ بالمحرك المحلي) */
 const play=async(t,l,valid,onStart)=>{if(!has(t,l))return false;stop();const ep=++st.ep,who=teacher(),k=key(t,l);
  try{const r=rate(),c=ctx(),fast=c&&Math.abs(r-1)<.02;
   /* مقطع مفكوك مسبقًا (تجهيز الصفحة): يبدأ فورًا بلا أي طلب شبكة */
   let b=fast&&BUF.has(who+k)?null:await clip(who,k);if(b!=null&&!b.size)return false;if(ep!==st.ep||(valid&&!valid()))return true;
   if(fast){if(c.state!=='running')try{await c.resume()}catch(e){}
    let buf;try{buf=await decode(who+k,b)}catch(e){ /* بايتات تالفة: نعيد من الحزمة الكاملة المتحقَّق منها مرة واحدة */
     const j=st.ix[who],[pi,off,len]=j.idx[k],name=j.packs[pi];delete st.blob[name];const full=await pack(name);buf=await decode(who+k,full.slice(off,off+len,'audio/mpeg'))}
    if(ep!==st.ep||(valid&&!valid()))return true;
    const src=c.createBufferSource();src.buffer=buf;st.gain.gain.value=vol();src.connect(st.gain);st.src=src;st.playing=1;
    await new Promise(ok=>{st.done=ok;src.onended=()=>{if(st.src===src){st.src=null;st.playing=0}if(st.done===ok){st.done=null;ok()}};src.start(c.currentTime+.015);onStart&&onStart();mouthLoop()});
    return true}
   /* سرعة مختلفة: عنصر <audio> مع الحفاظ على طبقة الصوت */
   if(!b)b=await clip(who,k);const a=new Audio(),url=URL.createObjectURL(b);a.preload='auto';a.src=url;a.volume=vol();a.playbackRate=r;try{a.preservesPitch=true}catch(e){}
   st.audio=a;st.url=url;st.playing=1;
   await new Promise((ok,no)=>{st.done=ok;a.onended=()=>{st.done=null;ok()};a.onerror=()=>{st.done=null;no(new Error('clip'))};a.play().then(()=>{onStart&&onStart()}).catch(e=>{st.done=null;no(e)})});
   return true}catch(e){return false}
  finally{if(ep===st.ep){quiet();if(st.url)URL.revokeObjectURL(st.url);st.audio=null;st.url='';st.playing=0}}};
 /* تجهيز مسبق: نفكّ مقاطع الكلمات الظاهرة في الصفحة كي يبدأ الصوت فور الضغط */
 const warmText=(t,l)=>{try{if(!has(t,l)||!ctx())return;const who=teacher(),k=key(t,l);if(BUF.has(who+k))return;clip(who,k).then(b=>b&&decode(who+k,b)).catch(()=>{})}catch(e){}};
 const record=(t,l)=>{try{if(localStorage.getItem('hurufiCollect')!=='1')return;const k='hurufiPhrases',o=JSON.parse(localStorage.getItem(k)||'{}');o[l+'|'+t]=1;localStorage.setItem(k,JSON.stringify(o))}catch(e){}};
 const exp=()=>{try{return Object.keys(JSON.parse(localStorage.getItem('hurufiPhrases')||'{}')).join('\n')}catch(e){return''}};
 const pause=()=>{try{if(st.ac&&st.ac.state==='running'&&st.playing){st.ac.suspend();return true}}catch(e){}return false};
 const resume=()=>{try{if(st.ac&&st.ac.state==='suspended'){st.ac.resume();return true}}catch(e){}return false};
 /* «نزّل كل الأصوات»: للاستعمال الكامل بلا إنترنت (اختياري من الإعدادات) */
 /* ===== فحص الصوت على جهاز الطالب نفسه: تقرير مفصّل يُرسل للمطوّر ===== */
 const diag=async()=>{const L=[],add=x=>L.push(x),who=teacher();
  add('الإصدار: voice-cloud '+(([...document.scripts].find(x=>/voice-cloud\.js/.test(x.src))||{}).src||'').split('?v=')[1]+' · ذاكرة '+CC);
  try{add('الذاكرات: '+(await caches.keys()).join(', '))}catch(e){add('الذاكرات: تعذّر ('+e.message+')')}
  try{const r=await navigator.serviceWorker.getRegistration();add('عامل الخدمة: '+(r&&r.active?r.active.scriptURL.split('/').pop():'لا يوجد'))}catch(e){}
  add('المتصفح: '+navigator.userAgent.replace(/^Mozilla\/5\.0 /,'').slice(0,90));
  add('الإنترنت: '+(navigator.onLine?'متصل':'غير متصل')+' · المعلّم: '+who+' · السرعة: '+((window.P&&P.rate)||.92)+' · الصوت: '+((window.P&&P.vol)!=null?P.vol:1));
  const c=ctx();add('نظام الصوت: '+(c?c.state+' · '+c.sampleRate+'Hz':'غير مدعوم'));try{if(c&&c.state!=='running')await c.resume();add('بعد التفعيل: '+(c&&c.state))}catch(e){add('تفعيل الصوت فشل: '+e.message)}
  const j=await loadIx(who);add('الفهرس: '+(j?Object.keys(j.idx).length+' مقطع، '+j.packs.length+' حزمة، v='+j.v:'لم يُحمَّل'));
  for(const[t,l]of[['حِصَان','ar'],['بُومِي','ar'],['Apple','en'],['أَحْسَنْتَ','ar']]){const k=key(t,l),e=j&&j.idx[k];if(!e){add(`«${t}»: لا مقطع له`);continue}
   const t0=performance.now();let line=`«${t}» [${j.packs[e[0]]} @${e[1]}+${e[2]}]: `;
   try{const b=await clip(who,k);line+=`جُلب ${b?b.size:0}B في ${Math.round(performance.now()-t0)}ms`;
    const head=new Uint8Array(await b.slice(0,4).arrayBuffer());line+=` · بداية ${[...head].map(x=>x.toString(16).padStart(2,'0')).join('')}`+(head[0]===0xff&&(head[1]&0xe0)===0xe0?' (MP3 سليم)':' (⚠️ ليست بداية مقطع)');
    const buf=await decode('diag'+who+k,b);line+=` · مدته ${buf.duration.toFixed(2)}ث (المتوقع ~${(e[2]*8/48000).toFixed(2)}ث)`;BUF.delete('diag'+who+k);
    const ok=await play(t,l,()=>true,null);line+=ok?' · شُغّل ✓':' · فشل التشغيل ✗'}catch(er){line+=' · خطأ: '+(er&&er.message||er)}
   add(line)}
  return L.join('\n')};
 /* إعادة ضبط كاملة: حذف كل النسخ المحفوظة (الكود والأصوات) وعامل الخدمة، ثم إعادة التحميل (بيانات الطالب تبقى) */
 const reset=async()=>{try{for(const k of await caches.keys())await caches.delete(k)}catch(e){}try{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister()}catch(e){}
  try{localStorage.removeItem('hurufi-tts')}catch(e){}location.replace(location.pathname+'?fresh='+Date.now())};
 const offline=async()=>{const who=teacher();await loadIx(who);if(!st.ix[who])return false;st.pre[who]=0;warm(who,1);return true};
 window.HurufiClips={has,play,stop,pause,resume,warm:warmText,offline,diag,reset,progress:()=>st.prog||null,busy:()=>!!st.playing,record,export:exp,key,ready,load:loadIx,
  count:()=>[st.ix.female?Object.keys(st.ix.female.idx).length:0,st.ix.male?Object.keys(st.ix.male.idx).length:0],voice:who=>st.ix[who||teacher()]?.voice||null};
 /* بعد رسم كل صفحة: نجهّز مقاطع الكلمات القابلة للضغط فيها (بطاقات الدرس، أزرار 🔊) */
 const warmPage=()=>{try{if(!window.say||!say.parts)return;const L=[],add=(t,l)=>{for(const p of say.parts(t,l))L.push(p)};
  if(window.V==='lesson'&&window.cur&&cur.i)cur.i.slice(0,16).forEach(it=>add(it[0],it[2]));
  document.querySelectorAll('#app [data-say]').forEach(e=>add(e.dataset.say,e.dataset.l||'en'));
  document.querySelectorAll('#app [onclick^="say(\'"]').forEach(e=>{const m=e.getAttribute('onclick').match(/^say\('([^']*)','(ar|en)'/);if(m)add(m[1],m[2])});
  L.slice(0,24).forEach(p=>warmText(p[0],p[1]))}catch(e){}};
 if(typeof window.h==='function'){const oh=window.h;window.h=function(){const r=oh.apply(this,arguments);setTimeout(warmPage,350);return r}}
 /* عند تبديل المعلّم نحمّل فهرسه */
 document.addEventListener('click',()=>{const w=teacher();if(!st.ix[w])loadIx(w)},{passive:true});

 /* ===== إعدادات الصوت: مكان واحد فقط ===== */
 if(window.P){try{let ch=0;if(P.voice){delete P.voice;ch=1}if(P.voiceCloud){delete P.voiceCloud;ch=1}if(P.teacher!=='male'&&P.teacher!=='female'){P.teacher='female';ch=1}if(ch)save()}catch(e){}}
 window.voiceTeacher=x=>{if(!P)return;P.teacher=x==='male'?'male':'female';save();try{window.say&&say.stop()}catch(e){}stop();(window.voiceSet.__orig||window.voiceSet)();try{HurufiClips.load(P.teacher)}catch(e){}setTimeout(()=>window.testT&&testT(),150)};
 /* الأصوات المعتمدة (Microsoft Edge Neural): المعلّمة Zariyah/Ava، والمعلّم Hamed/Andrew. اللغة تُختار تلقائيًا من نص الجملة */
 const VOICES={female:{ar:'Zariyah',en:'Ava'},male:{ar:'Hamed',en:'Andrew'}}; /* الإنجليزية: Ava/Andrew Multilingual (أطبيعي) */
 window.voiceSet=function(){if(!P)return;V='sec';window.CS='set';const t=P.teacher==='male'?'male':'female',vv=VOICES[t];
  h(`<section class="sec"><button class="link" onclick="home()">← رجوع</button><h2>🔊 صوت بومي</h2>
  <h3>اختر المعلّم</h3><div class="voice-provider"><button data-teacher="female" class="${t==='female'?'on':''}" onclick="voiceTeacher('female')">👩 معلمة</button><button data-teacher="male" class="${t==='male'?'on':''}" onclick="voiceTeacher('male')">👨 معلم</button></div>
  <p class="mut">🎙️ ${t==='male'?'المعلّم':'المعلّمة'}: العربية بصوت ${vv.ar}، والإنجليزية بصوت ${vv.en} (أصوات Microsoft العصبية المسجّلة مسبقًا). يُختار الصوت العربي أو الإنجليزي تلقائيًا حسب لغة الكلام.</p>
  <button class="alt" onclick="testT()">🔊 جرّب الصوت</button>
  <h3>مشكلة في الصوت؟</h3><p class="mut">«فحص الصوت» يجرّب الأصوات على جهازك ويعرض تقريرًا؛ صوّر التقرير وأرسله. «إعادة ضبط الصوت» تحذف النسخ القديمة المحفوظة في الجهاز وتعيد تحميل الموقع (تقدّم الطالب لا يُحذف).</p>
  <button class="alt" onclick="(async()=>{const o=document.getElementById('diag-out');o.hidden=false;o.textContent='⏳ جارٍ الفحص…';try{o.textContent=await HurufiClips.diag()}catch(e){o.textContent='تعذّر الفحص: '+e.message}})()">🔧 فحص الصوت</button>
  <button class="alt" onclick="if(confirm('حذف النسخ المحفوظة من الأصوات وإعادة تحميل الموقع؟'))HurufiClips.reset()">🧹 إعادة ضبط الصوت</button>
  <pre id="diag-out" hidden dir="auto" style="white-space:pre-wrap;font-size:.8rem;line-height:1.5;background:#f2f5ff;color:#14213f;border-radius:12px;padding:10px;margin-top:8px;user-select:text"></pre>
  <h3>الاستخدام بلا إنترنت</h3><p class="mut">الأصوات تُنزَّل عند سماعها فقط. لتعمل كل أصوات الموقع بلا إنترنت نزّلها مرة واحدة (نحو ${t==='male'?'١٢٠':'١٢٧'} م.ب، يُفضَّل على Wi‑Fi).</p>
  <button class="alt" id="clips-dl" onclick="HurufiClips.offline().then(()=>{const b=document.getElementById('clips-dl');if(!b)return;const tick=()=>{const g=HurufiClips.progress(),x=document.getElementById('clips-dl');if(!x)return;if(g&&g[0]>=g[1]){x.textContent='✅ نُزّلت كل الأصوات';return}x.textContent='⏳ جارٍ التنزيل… '+(g?Math.round(g[0]/g[1]*100):0)+'٪';setTimeout(tick,1000)};tick()})">📥 نزّل كل الأصوات</button>
  <h3>مستوى الصوت</h3><input type=range min=.1 max=1 step=.05 value="${P.vol==null?1:P.vol}" oninput="P.vol=+this.value;save()">
  <h3>سرعة الكلام</h3><input type=range min=.75 max=1.3 step=.05 value="${P.rate||.92}" onchange="P.rate=+this.value;save()">
  <button class="big" onclick="home()">تم</button></section>`)};
})();
