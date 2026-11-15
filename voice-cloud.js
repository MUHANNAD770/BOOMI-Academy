/* voice-cloud.js — إعدادات صوت بومي: Supertonic 3 المدمج (المعلّمة والمعلّم، ١٠ نبرات) + المقاطع المسجّلة مسبقًا. لا يوجد صوت جهاز.
   • المعلمة/المعلم: يُطبَّق الاختيار على كل نطق في الموقع (الدروس، الألعاب، بومي).
   • voices/clips/: مقاطع مسجّلة مسبقًا لكل جمل الموقع الثابتة بأصوات Microsoft Edge العصبية (أداة tools/clips/)؛ إن وُجد مقطع للجملة يُشغَّل فورًا، وإلا يُولَّد بالمحرك المحلي.
   • يعمل بلا إنترنت بعد أول تحميل؛ لا مفاتيح API في الموقع (المقاطع ملفات ثابتة داخل المشروع). */
(()=>{
 'use strict';
 /* المقاطع المسجّلة مسبقًا (مثل دولينجو): كل جمل الموقع الثابتة مسجّلة مسبقًا بأصوات Edge العصبية (عربي: Zariyah/Hamed، إنجليزي: Ava/Andrew) بتشكيل كامل،
    ومحفوظة في حزم صغيرة voices/clips/{f,m}N.bin مع فهرس female.json / male.json. التشغيل فوري بلا توليد.
    ما لا يوجد له مقطع (نص متغيّر) يُولَّد بالمحرك المحلي. */
 const CC='hurufi-clips-v3',base='voices/clips/';
 const st={ix:{},load:{},blob:{},ep:0,audio:null,url:'',ac:null,an:null,raf:0,done:null,pre:{}};
 const key=(t,l)=>{const s=((l==='ar'?'ar':'en')+'|'+String(t||'').replace(/\s+/g,' ').trim()).normalize('NFC');let h=0x811c9dc5;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(36)+'_'+s.length.toString(36)};
 const teacher=()=>window.P&&P.teacher==='male'?'male':'female';
 const engVoice=who=>{try{const s=window.HurufiTTS&&HurufiTTS.state();return s?(who==='male'?s.voiceM:s.voiceF):null}catch(e){return null}};
 const loadIx=who=>st.load[who]||(st.load[who]=fetch(base+who+'.json?v=61',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(j&&j.idx){if(j.v)j.packs=j.packs.map(p=>p+'?v='+j.v);st.ix[who]=j;warm(who)}return st.ix[who]}).catch(()=>{st.load[who]=null;return null}));
 const ready=loadIx(teacher());
 try{window.caches&&['hurufi-clips-v1','hurufi-clips-v2'].forEach(n=>caches.delete(n))}catch(e){} /* مقاطع الإصدارات السابقة */
 /* المقطع صالح فقط إذا كانت نبرة المعلّم/المعلّمة المختارة هي نفس نبرة المقاطع */
 const has=(t,l)=>{const who=teacher(),j=st.ix[who];if(!j){loadIx(who);return false}const v=engVoice(who);return(j.engine==='edge'||!v||v===j.voice)&&!!j.idx[key(t,l)]}; /* مقاطع Edge تعمل مع أي نبرة مختارة */
 const cache=()=>window.caches?caches.open(CC).catch(()=>null):Promise.resolve(null);
 /* حزمة كاملة من الذاكرة الدائمة أو الشبكة (تُحفظ فتعمل بلا إنترنت) */
 const pack=async name=>{if(st.blob[name])return st.blob[name];const u=new URL(base+name,location.href).href,c=await cache();
  let r=c&&await c.match(u);if(!r){r=await fetch(u);if(!r.ok)throw new Error('pack');if(c)try{await c.put(u,r.clone())}catch(e){}}
  return st.blob[name]=await r.blob()};
 /* تحميل كل الحزم في الخلفية بهدوء (واحدة تلو الأخرى) بعد أن يستقر الموقع */
 const warm=who=>{if(st.pre[who])return;try{const n=navigator.connection;if(n&&(n.saveData||/(^|-)2g|3g/.test(n.effectiveType||'')))return}catch(e){} /* بيانات محدودة: لا نحمّل كل الحزم مسبقًا؛ كل مقطع يُطلب وحده عند الحاجة */st.pre[who]=1;const j=st.ix[who];let i=0;
  const step=()=>{if(i>=j.packs.length)return;const n=j.packs[i++];pack(n).then(()=>setTimeout(step,250),()=>setTimeout(step,4000))};
  setTimeout(step,2500)};
 /* مقطع واحد: من الحزمة إن كانت محمّلة، وإلا نطلب جزءه فقط من الخادم (سريع جدًا) */
 const clip=async(who,k)=>{const j=st.ix[who],[p,off,len]=j.idx[k],name=j.packs[p];
  if(st.blob[name])return st.blob[name].slice(off,off+len,'audio/mpeg');
  try{const c=await cache(),hit=c&&await c.match(new URL(base+name,location.href).href);if(hit){const b=await hit.blob();st.blob[name]=b;return b.slice(off,off+len,'audio/mpeg')}}catch(e){}
  try{const r=await fetch(base+name,{headers:{Range:'bytes='+off+'-'+(off+len-1)}});if(r.status===206){const b=await r.blob();return new Blob([b],{type:'audio/mpeg'})}
   if(r.ok){const b=await r.blob();st.blob[name]=b;return b.slice(off,off+len,'audio/mpeg')}}catch(e){}
  return(await pack(name)).slice(off,off+len,'audio/mpeg')};
 /* التشغيل عبر Web Audio (وليس عنصر <audio>): يبدأ فورًا بلا قصّ لأول المقطع على الجوال، ويتوقف فورًا عند الضغط على كلمة أخرى.
    عند تغيير سرعة الكلام نستعمل <audio> مع الحفاظ على طبقة الصوت. */
 const AC=window.AudioContext||window.webkitAudioContext;
 const ctx=()=>{if(!st.ac&&AC){try{st.ac=new AC({latencyHint:'interactive'})}catch(e){st.ac=new AC()}st.gain=st.ac.createGain();st.an=st.ac.createAnalyser();st.an.fftSize=64;st.gain.connect(st.an);st.an.connect(st.ac.destination)}return st.ac};
 /* فتح الصوت من أول لمسة (شرط المتصفحات على الجوال) */
 const unlock=()=>{try{const c=ctx();if(!c)return;if(c.state!=='running')c.resume();if(!st.unl){st.unl=1;const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}}catch(e){}};
 ['pointerdown','touchstart','keydown'].forEach(t=>document.addEventListener(t,unlock,{capture:true,passive:true}));
 const BUF=new Map(); /* آخر المقاطع المفكوكة جاهزة للتشغيل الفوري */
 const decode=async(k,b)=>{if(BUF.has(k)){const v=BUF.get(k);BUF.delete(k);BUF.set(k,v);return v}const c=ctx();const ab=await b.arrayBuffer();
  const buf=await new Promise((ok,no)=>{try{const p=c.decodeAudioData(ab,ok,no);p&&p.then&&p.then(ok,no)}catch(e){no(e)}});BUF.set(k,buf);if(BUF.size>160)BUF.delete(BUF.keys().next().value);return buf};
 const mouthLoop=()=>{cancelAnimationFrame(st.raf);const d=new Uint8Array(st.an.frequencyBinCount),mc=document.getElementById('mc');
  const tick=()=>{st.an.getByteFrequencyData(d);let s=0;for(const x of d)s+=x;const v=s/d.length;mc&&mc.classList.toggle('phoneme',v>28);try{window.MC&&MC.level&&MC.level(Math.min(1,v/90))}catch(e){}st.raf=requestAnimationFrame(tick)};tick()};
 const quiet=()=>{cancelAnimationFrame(st.raf);st.raf=0;document.getElementById('mc')?.classList.remove('phoneme')};
 const stop=()=>{st.ep++;try{st.src&&st.src.stop()}catch(e){}st.src=null;try{st.audio&&st.audio.pause()}catch(e){}if(st.url)URL.revokeObjectURL(st.url);st.audio=null;st.url='';st.playing=0;quiet();if(st.done){const d=st.done;st.done=null;d(true)}};
 const rate=()=>Math.max(.8,Math.min(1.4,(+(window.P&&P.rate)||.92)/.92));
 const vol=()=>Math.max(.05,Math.min(1,window.P&&P.vol!=null?+P.vol:1));
 /* play → true عند الاكتمال/الإيقاف، false إذا تعذّر (فيُقرأ بالمحرك المحلي) */
 const play=async(t,l,valid,onStart)=>{if(!has(t,l))return false;stop();const ep=++st.ep,who=teacher(),k=key(t,l);
  try{const b=await clip(who,k);if(!b||!b.size)return false;if(ep!==st.ep||(valid&&!valid()))return true;
   const r=rate(),c=ctx();
   if(c&&Math.abs(r-1)<.02){if(c.state!=='running')try{await c.resume()}catch(e){}
    const buf=await decode(who+k,b);if(ep!==st.ep||(valid&&!valid()))return true;
    const src=c.createBufferSource();src.buffer=buf;st.gain.gain.value=vol();src.connect(st.gain);st.src=src;st.playing=1;
    await new Promise(ok=>{st.done=ok;src.onended=()=>{if(st.src===src){st.src=null;st.playing=0}if(st.done===ok){st.done=null;ok()}};src.start(c.currentTime+.015);onStart&&onStart();mouthLoop()});
    return true}
   /* سرعة مختلفة: عنصر <audio> مع الحفاظ على طبقة الصوت */
   const a=new Audio(),url=URL.createObjectURL(b);a.preload='auto';a.src=url;a.volume=vol();a.playbackRate=r;try{a.preservesPitch=true}catch(e){}
   st.audio=a;st.url=url;st.playing=1;
   await new Promise((ok,no)=>{st.done=ok;a.onended=()=>{st.done=null;ok()};a.onerror=()=>{st.done=null;no(new Error('clip'))};a.play().then(()=>{onStart&&onStart()}).catch(e=>{st.done=null;no(e)})});
   return true}catch(e){return false}
  finally{if(ep===st.ep){quiet();if(st.url)URL.revokeObjectURL(st.url);st.audio=null;st.url='';st.playing=0}}};
 /* تجهيز مسبق: نفكّ مقاطع الكلمات الظاهرة في الصفحة كي يبدأ الصوت فور الضغط */
 const warmText=(t,l)=>{try{if(!has(t,l)||!ctx())return;const who=teacher(),k=key(t,l);if(BUF.has(who+k))return;clip(who,k).then(b=>b&&decode(who+k,b)).catch(()=>{})}catch(e){}};
 const record=(t,l)=>{try{if(localStorage.getItem('hurufiCollect')!=='1')return;const k='hurufiPhrases',o=JSON.parse(localStorage.getItem(k)||'{}');o[l+'|'+t]=1;localStorage.setItem(k,JSON.stringify(o))}catch(e){}};
 const exp=()=>{try{return Object.keys(JSON.parse(localStorage.getItem('hurufiPhrases')||'{}')).join('\n')}catch(e){return''}};
 window.HurufiClips={has,play,stop,warm:warmText,busy:()=>!!st.playing,record,export:exp,key,ready,load:loadIx,
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
 window.voiceTeacher=x=>{if(!P)return;P.teacher=x==='male'?'male':'female';save();stop();window.HurufiTTS&&HurufiTTS.stop();(window.voiceSet.__orig||window.voiceSet)();try{HurufiClips.load(P.teacher).then(()=>{if(document.getElementById('eng-st'))(window.voiceSet.__orig||window.voiceSet)()})}catch(e){}setTimeout(()=>window.testT&&testT(),150)};
 const T=()=>window.HurufiTTS,mb=n=>Math.round(n/1e6);
 /* بطاقة Supertonic 3: ملفاته داخل المشروع ويُجهَّز تلقائيًا عند اختياره (بلا زر تنزيل) */
 const engCard=()=>{const t=T();if(!t)return'';const s=t.state(),on=s.engine==='supertonic';
  const status=s.ready?`<b class="eng-ok">✅ يعمل الآن على جهازك</b><small>${s.info&&s.info.ep==='webgpu'?'على معالج الرسوم (WebGPU) ⚡':'على المعالج (WebAssembly)'+(s.info&&s.info.threads>1?` · ${s.info.threads} خيوط`:'')}</small>`
   :on&&!s.failed?'<b>⏳ يُجهَّز تلقائيًا… (مرة واحدة فقط)</b>':s.failed&&on?'<b class="eng-bad">⚠️ تعذّر تشغيله على هذا الجهاز الآن.</b>':'<small>✓ مدمج في ملفات الموقع ويعمل تلقائيًا عند اختياره.</small>';
  return `<div class="eng ${on?'on':''}" id="eng-st"><div class="eng-h"><span>🧠</span><div><b>Supertonic 3 — صوت ذكي مدمج (عربي + إنجليزي)</b><small>١٠ نبرات (٥ للمعلّمة و٥ للمعلّم) تُولَّد على جهازك نفسه، مجانًا وبلا خوادم.</small><small class="eng-lic">Supertonic 3 © Supertone Inc. — رخصة OpenRAIL-M</small></div></div>${status}
   <div class="eng-act">${on?(s.failed?`<button class="big" onclick="ttsUse('supertonic')">🔄 إعادة المحاولة</button>`:''):`<button class="big" onclick="ttsUse('supertonic')">✅ استخدم Supertonic 3</button>`}</div></div>`};
 const styleSel=()=>{const t=T();if(!t)return'';const s=t.state(),m=P.teacher==='male',L=m?t.voices.male:t.voices.female,cur=m?s.voiceM:s.voiceF,HC=window.HurufiClips&&HurufiClips.voice(m?'male':'female');
  return `<h3>🎙️ نبرة ${m?'المعلّم':'المعلّمة'} (Supertonic)</h3><div class="voice-styles">${L.map((v,i)=>`<button class="${v===cur?'on':''}" onclick="ttsStyle('${v}')">${m?'👨':'👩'} ${i+1}${HC&&v===HC?' ⭐':''}</button>`).join('')}</div>${HC==='edge'?`<p class="mut">🎧 جمل الدروس والقصص مسجّلة مسبقًا بصوت بشري واضح فتُسمع فورًا؛ النبرة المختارة هنا للكلام المتغيّر فقط.</p>`:HC?`<p class="mut">⭐ النبرة الأوضح: كل جمل الدروس والقصص مسجّلة بها مسبقًا فتُسمع فورًا.</p>`:''}`};
 window.ttsUse=e=>{e='supertonic';T().setEngine(e);(window.voiceSet.__orig||voiceSet)();setTimeout(()=>window.testT&&testT(),400)};
 window.ttsStyle=v=>{const m=P.teacher==='male';T().set(m?'voiceM':'voiceF',v);(window.voiceSet.__orig||voiceSet)();window.testT&&testT()};
 window.ttsInstall=()=>window.ttsUse('supertonic'); /* توافق مع الأزرار القديمة */
 /* تحديث البطاقة تلقائيًا عند اكتمال تجهيز أي محرك */
 let rT=0;try{T()&&T().on(m=>{if(m.t==='ready'||m.t==='loaded'||(m.t==='error'&&(m.stage==='init'||m.voice))){clearTimeout(rT);rT=setTimeout(()=>{if(document.getElementById('eng-st'))(window.voiceSet.__orig||window.voiceSet)()},300)}})}catch(e){}
 window.voiceSet=function(){if(!P)return;V='sec';window.CS='set';const t=P.teacher==='male'?'male':'female',s=T()?T().state():{engine:'supertonic'};
  h(`<section class="sec"><button class="link" onclick="home()">← رجوع</button><h2>🔊 صوت بومي</h2>
  <h3>اختر المعلّم</h3><div class="voice-provider"><button data-teacher="female" class="${t==='female'?'on':''}" onclick="voiceTeacher('female')">👩 معلمة</button><button data-teacher="male" class="${t==='male'?'on':''}" onclick="voiceTeacher('male')">👨 معلم</button></div>
  <h3>محرك الصوت</h3><div class="engines">
   ${engCard()}
  </div>
  ${(()=>{const t=T();if(!t)return'';const e=t.state();return `<p class="mut">🔊 ${e.ready?'الصوت جاهز':'يُجهَّز الصوت تلقائيًا…'} — نبرة ${P.teacher==='male'?'المعلّم':'المعلّمة'}</p>`})()}
  ${styleSel()}
  <button class="alt" onclick="testT()">🔊 جرّب الصوت</button>
  <h3>مستوى الصوت</h3><input type=range min=.1 max=1 step=.05 value="${P.vol==null?1:P.vol}" oninput="P.vol=+this.value;save()">
  <h3>سرعة الكلام</h3><input type=range min=.75 max=1.3 step=.05 value="${P.rate||.92}" onchange="P.rate=+this.value;save();window.HurufiTTS&&HurufiTTS.set('rate',P.rate)">
  <button class="big" onclick="home()">تم</button></section>`)};
})();
