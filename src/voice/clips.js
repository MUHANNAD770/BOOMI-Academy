/* src/voice/clips.js — مكتبة أصوات بومي المسجّلة داخل المشروع (audio/clips/): ٢٤٬٠٨٦ مقطعًا لكل معلّم (Microsoft Edge Neural،
   المعلّمة: Zariyah عربي + Ava إنجليزي، المعلّم: Hamed + Andrew) بتشكيل كامل ونطق مراجَع (التاء المربوطة، التنوين، الهمزات).
   • حزم صغيرة {f,m}N.bin + فهرس female.json / male.json (أداة tools/clips). التشغيل فوري ولا يحتاج أي خادم أو مفتاح.
   • يستعملها محرّك الصوت الموحّد (src/shared/voice.js) أولًا؛ النص الذي لا مقطع له يُولَّد عبر Gemini مرة واحدة ويُحفظ. */
(()=>{
 'use strict';
 /* المقاطع المسجّلة مسبقًا (مثل دولينجو): كل جمل الموقع الثابتة مسجّلة مسبقًا بأصوات Edge العصبية (عربي: Zariyah/Hamed، إنجليزي: Ava/Andrew) بتشكيل كامل،
    ومحفوظة في حزم صغيرة voices/clips/{f,m}N.bin مع فهرس female.json / male.json. التشغيل فوري بلا توليد.
    ما لا يوجد له مقطع (نص متغيّر) يُولَّد بالمحرك المحلي. */
 const CC='hurufi-clips-v5' /* v4: نسخ الحزم القديمة المحفوظة في الأجهزة (v1–v3) قد لا تطابق الفهرس الحالي فتُسمع كلمة أخرى؛ تُحذف وتُجلب من جديد */,base='audio/clips/';
 const st={ix:{},load:{},blob:{},ep:0,audio:null,url:'',ac:null,an:null,raf:0,done:null,pre:{}};
 const key=(t,l)=>{const s=((l==='ar'?'ar':'en')+'|'+String(t||'').replace(/\s+/g,' ').trim()).normalize('NFC');let h=0x811c9dc5;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(36)+'_'+s.length.toString(36)};
 const teacher=()=>{try{if(window.BumiVoiceConfig)return BumiVoiceConfig.getSettings().voice.gender==='male'?'male':'female'}catch(e){}return window.P&&P.teacher==='male'?'male':'female'};
 const engVoice=()=>null; /* لا يوجد محرك توليد على الجهاز: كل الصوت مقاطع Edge مسجّلة */
 /* الفهرس يُحفظ في ذاكرة المقاطع الدائمة: بدونه لا يُعرف مكان أي مقطع فيصمت الصوت المسجّل بلا إنترنت */
 const ixGet=async who=>{const u=new URL(base+who+'.json',location.href).href;let c=null;try{c=window.caches&&await caches.open(CC)}catch(e){}
  try{const r=await fetch(base+who+'.json?v=110',{cache:'no-cache'});if(r.ok){if(c)try{await c.put(u,r.clone())}catch(e){}return await r.json()}}catch(e){}
  try{const h=c&&await c.match(u);if(h)return await h.json()}catch(e){}return null};
 const loadIx=who=>st.load[who]||(st.load[who]=ixGet(who).then(j=>{if(j&&j.idx){if(j.v)j.packs=j.packs.map(p=>p+'?v='+j.v);st.ix[who]=j;st.need=st.need||{};for(const[pi,off,len]of Object.values(j.idx)){const n=j.packs[pi];if((st.need[n]||0)<off+len)st.need[n]=off+len}}return st.ix[who]} /* لا تنزيل تلقائي لكل الحزم: كان ~130 م.ب في أول 30 ثانية فيبطئ الهاتف */).catch(()=>{st.load[who]=null;return null}));
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
  let r=c&&await c.match(u,{ignoreSearch:true}),b=r&&await r.blob(); /* الحزم لا تتغيّر بعد نشرها (التحديث يضيف حزمًا جديدة): لا نعيد تنزيلها عند تغيّر رقم الإصدار */
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
  try{const c=await cache(),hit=c&&await c.match(new URL(base+name,location.href).href,{ignoreSearch:true});if(hit){const b=keep(name,await hit.blob());return b.slice(off,off+len,'audio/mpeg')}}catch(e){}
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
 /* الكلمة أو العبارة الإنجليزية القصيرة (٣ كلمات فأقل) تُنطق أبطأ قليلًا لتكون واضحة للطالب العربي؛ الجمل الطويلة بسرعتها الطبيعية */
 const slowEn=()=>1; /* الكلمات القصيرة صارت مسجّلة أبطأ (gen_edge RATES_JSON، وخادم الصوت)، فلا إبطاء عند التشغيل */
 const play=async(t,l,valid,onStart)=>{if(!has(t,l))return false;stop();const ep=++st.ep,who=teacher(),k=key(t,l);
  try{const r=rate()*slowEn(t,l),c=ctx(),fast=c&&Math.abs(r-1)<.02;
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
 /* ===== جملة كاملة بلا مقطع مسجّل: تُولَّد بسلاسة من الخادم (netlify/functions/tts.mjs) بصوت المعلّم نفسه =====
    كانت تُركّب كلمةً كلمةً من مقاطع منفردة (متقطّعة وبطيئة) أو تسكت. النتيجة تُحفظ في الجهاز فلا تُطلب مرتين. */
 const TC='hurufi-tts-v4',TM=new Map(); /* v3: التاء المربوطة حسب موضعها (وقف/وصل بالإعراب)؛ الجمل المحفوظة سابقًا تُحذف */
 try{window.caches&&['hurufi-tts-v1','hurufi-tts-v2','hurufi-tts-v3'].forEach(n=>caches.delete(n))}catch(e){}
 const ttsUrl=(t,l)=>'/.netlify/functions/edge-tts?w='+teacher()+'&l='+(l==='en'?'en':'ar')+'&t='+encodeURIComponent(String(t).replace(/\s+/g,' ').trim().normalize('NFC'));
 const ttsBlob=(t,l)=>{const u=ttsUrl(t,l);if(TM.has(u))return TM.get(u);
  const pr=(async()=>{try{const c=await caches.open(TC),hit=await c.match(u);if(hit)return await hit.blob()}catch(e){}
   if(navigator.onLine===false)return null;const r=await fetch(u);if(!r.ok)return null;const b=await r.blob();if(!b.size||!/audio/.test(b.type))return null;
   try{(await caches.open(TC)).put(u,new Response(b.slice(0,b.size,'audio/mpeg'),{headers:{'content-type':'audio/mpeg'}}))}catch(e){}return b})().catch(()=>null);
  TM.set(u,pr);if(TM.size>60)TM.delete(TM.keys().next().value);pr.then(b=>{if(!b)TM.delete(u)});return pr};
 const speak=(t,l,valid,onStart)=>playBlob(()=>ttsBlob(t,l),'tts:'+ttsUrl(t,l),valid,onStart);
 /* تشغيل أي مقطع صوتي (Blob) بنفس المشغّل: الإيقاف والسرعة ومستوى الصوت وحركة فم بومي. يستعمله «صوتي الشخصي» (myvoice.js) */
 const playBlob=async(get,id,valid,onStart)=>{stop();const ep=++st.ep;
  try{const b=await get();if(!b)return false;if(ep!==st.ep||(valid&&!valid()))return true;const r=rate(),c=ctx();
   if(c&&Math.abs(r-1)<.02){if(c.state!=='running')try{await c.resume()}catch(e){}const buf=await decode(id,b);if(ep!==st.ep||(valid&&!valid()))return true;
    const src=c.createBufferSource();src.buffer=buf;st.gain.gain.value=vol();src.connect(st.gain);st.src=src;st.playing=1;
    await new Promise(ok=>{st.done=ok;src.onended=()=>{if(st.src===src){st.src=null;st.playing=0}if(st.done===ok){st.done=null;ok()}};src.start(c.currentTime+.015);onStart&&onStart();mouthLoop()});return true}
   const a=new Audio(),url=URL.createObjectURL(b);a.src=url;a.volume=vol();a.playbackRate=r;try{a.preservesPitch=true}catch(e){}st.audio=a;st.url=url;st.playing=1;
   await new Promise((ok,no)=>{st.done=ok;a.onended=()=>{st.done=null;ok()};a.onerror=()=>{st.done=null;no(new Error('tts'))};a.play().then(()=>{onStart&&onStart()}).catch(e=>{st.done=null;no(e)})});return true}
  catch(e){return false}finally{if(ep===st.ep){quiet();if(st.url)URL.revokeObjectURL(st.url);st.audio=null;st.url='';st.playing=0}}};
 const warmTts=(t,l)=>{try{if(navigator.onLine!==false)ttsBlob(t,l)}catch(e){}};
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
 const offline=async()=>{const who=teacher();await loadIx(who);if(!st.ix[who])return false;try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}st.pre[who]=0;warm(who,1);return true};
 /* كم حزمة من صوت المعلّم الحالي محفوظة في الجهاز، وحجمها التقريبي */
 const offStat=async()=>{const who=teacher(),j=await loadIx(who);if(!j)return null;const c=await cache();let have=0;
  if(c){const nq=u=>u.split('?')[0],ks=new Set((await c.keys()).map(r=>nq(r.url)));for(const n of j.packs)if(ks.has(nq(new URL(base+n,location.href).href)))have++}
  const mb=Math.round(j.packs.reduce((a,n)=>a+((st.need||{})[n]||0),0)/1048576);return{have,total:j.packs.length,mb,running:!!st.pre[who]&&st.prog&&st.prog[0]<st.prog[1]}};
 window.HurufiClips={has,play,speak,playBlob,warmTts,stop,pause,resume,warm:warmText,offline,offStat,diag,reset,progress:()=>st.prog||null,busy:()=>!!st.playing,record,export:exp,key,ready,load:loadIx,
  count:()=>[st.ix.female?Object.keys(st.ix.female.idx).length:0,st.ix.male?Object.keys(st.ix.male.idx).length:0],voice:who=>st.ix[who||teacher()]?.voice||null};
 /* بعد رسم كل صفحة: نجهّز مقاطع الكلمات القابلة للضغط فيها (بطاقات الدرس، أزرار 🔊) */
 const warmPage=()=>{try{if(!window.VoiceParts)return;const L=[],add=(t,l)=>{for(const p of VoiceParts.parts(t,l))L.push(p)};
  if(window.V==='lesson'&&window.cur&&cur.i)cur.i.slice(0,16).forEach(it=>add(it[0],it[2]));
  document.querySelectorAll('#app [data-say]').forEach(e=>add(e.dataset.say,e.dataset.l||'en'));
  document.querySelectorAll('#app [onclick^="say(\'"]').forEach(e=>{const m=e.getAttribute('onclick').match(/^say\('([^']*)','(ar|en)'/);if(m)add(m[1],m[2])});
  L.slice(0,24).forEach(p=>warmText(p[0],p[1]))}catch(e){}};
 if(typeof window.h==='function'){const oh=window.h;window.h=function(){const r=oh.apply(this,arguments);setTimeout(warmPage,350);return r}}
 /* عند تبديل المعلّم نحمّل فهرسه */
 document.addEventListener('click',()=>{const w=teacher();if(!st.ix[w])loadIx(w)},{passive:true});

})();
