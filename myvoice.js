/* myvoice.js — «صوتي الشخصي»: استنساخ صوت المستخدم ليتكلّم به بومي في كل الموقع.
   • خياران في إعدادات الصوت: «صوت بومي» (الافتراضي، النظام الحالي كما هو) و«صوتي الشخصي».
   • التسجيل من الميكروفون أو رفع ملف ← خادم الصوت المفتوح المصدر (tools/voice-server: Audar-TTS-V1-Flash) يُنشئ بصمة صوتية.
   • البصمة (رموز صوتية موقّعة من الخادم، لا تسجيل خام) تُحفظ في ملف الطالب P.myv وتُزامَن مع حسابه؛ الاختيار في P.vmode.
   • كل نطق في الموقع يمرّ بـ say() (voice.js) فيُولَّد بالصوت الشخصي، ويُحفظ في الجهاز فلا يُولَّد مرتين.
   • أي تعذّر (الخادم نائم، بلا إنترنت، خطأ) ← يكمل بومي بصوته المعتاد تلقائيًا. */
(()=>{
 'use strict';
 const CN='hurufi-myvoice-v1',MEM=new Map(),READ='مَرْحَبًا يَا أَصْدِقَائِي، أَنَا بُومِي مُعَلِّمُكُمْ. هَيَّا نَتَعَلَّمُ مَعًا الْحُرُوفَ وَالْكَلِمَاتِ، وَنَقْرَأُ قِصَّةً جَمِيلَةً كُلَّ يَوْمٍ.';
 const st={cfg:null,cfgAt:0,down:0,warn:0,inflight:0,rec:null,blob:null,draft:null,ok:0};
 const dev=()=>{try{return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('hurufiVoiceDev')}catch(e){return null}};
 const cfg=async(fresh)=>{if(!fresh&&st.cfg&&Date.now()-st.cfgAt<8*60e3)return st.cfg;
  const d=dev();if(d){st.cfg={configured:true,url:d.replace(/\/+$/,''),ticket:'',exp:'0'};st.cfgAt=Date.now();return st.cfg}
  try{const r=await fetch('/.netlify/functions/myvoice',{cache:'no-store'});st.cfg=r.ok?await r.json():{configured:false}}catch(e){st.cfg={configured:false,net:1}}st.cfgAt=Date.now();return st.cfg};
 const me=()=>window.P&&P.myv&&P.myv.vt&&Array.isArray(P.myv.codes)?P.myv:null;
 const on=()=>!!(window.P&&P.vmode==='mine'&&me()&&Date.now()>st.down&&navigator.onLine!==false);
 const norm=t=>String(t||'').replace(/\s+/g,' ').trim().normalize('NFC');
 const ck=(v,t,l)=>'https://myvoice.local/'+v.vid.slice(0,24)+'/'+(l==='en'?'en':'ar')+'/'+encodeURIComponent(norm(t));
 const fetchT=(u,o,ms)=>{const c=new AbortController(),k=setTimeout(()=>c.abort(),ms);return fetch(u,{...o,signal:c.signal}).finally(()=>clearTimeout(k))};
 const note=m=>{try{const e=document.createElement('div');e.className='mv-toast';e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.remove(),3800)}catch(x){}};
 /* توليد جملة بصوت معيّن (v) ← Blob mp3. ذاكرة: في الجلسة (MEM) ثم في الجهاز (Cache Storage) ثم الخادم */
 /* التاء المربوطة حسب موضعها (voices/tamarbuta.js): الوقف هاء ساكنة، والوصل تاء بحركتها — نفس قاعدة صوت بومي */
 let TMAP=null;const tmText=async t=>{try{if(!window.TaMarbuta||t.indexOf('\u0629')<0)return t;if(!TMAP)TMAP=fetch('voices/tm-map.json?v=1').then(r=>r.ok?r.json():{}).catch(()=>({}));return TaMarbuta.engine(t,await TMAP)}catch(e){return t}};
 const gen=(v,t,l,ms)=>{const k=ck(v,t,l);if(MEM.has(k))return MEM.get(k);
  const pr=(async()=>{try{const c=await caches.open(CN),h=await c.match(k);if(h)return await h.blob()}catch(e){}
   const g=await cfg();const url=(g&&g.configured&&g.url)||v.url;if(!url)return null;st.inflight++;
   try{const r=await fetchT(url+'/tts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({codes:v.codes,ref_text:v.rt,vt:v.vt,text:l==='en'?norm(t):await tmText(norm(t)),lang:l==='en'?'en':'ar'})},ms||45000);
    if(!r.ok)throw new Error('http '+r.status);const b=await r.blob();if(!b.size)throw new Error('empty');
    try{(await caches.open(CN)).put(k,new Response(b.slice(0,b.size,'audio/mpeg'),{headers:{'content-type':'audio/mpeg'}}))}catch(e){}return b}
   finally{st.inflight--}})().catch(e=>{MEM.delete(k);if(v===me()){st.down=Date.now()+120e3; /* نرجع لصوت بومي دقيقتين ثم نحاول من جديد */
     if(Date.now()-st.warn>300e3){st.warn=Date.now();note('🎙️ تعذّر الصوت الشخصي الآن، يكمل بومي بصوته المعتاد')}}return null});
  MEM.set(k,pr);if(MEM.size>80)MEM.delete(MEM.keys().next().value);return pr};
 const wait=()=>{let e=null;const k=setTimeout(()=>{e=document.createElement('div');e.className='mv-toast mv-wait';e.textContent='🎙️ يُجهَّز صوتك…';document.body.appendChild(e)},900);return()=>{clearTimeout(k);e&&e.remove()}};
 const playV=async(v,t,l,valid,onStart)=>{const H=window.HurufiClips;if(!H||!H.playBlob)return false;const done=wait();
  try{return await H.playBlob(()=>gen(v,t,l),'mv:'+ck(v,t,l),valid,onStart)}finally{done()}};
 const play=(t,l,valid,onStart)=>{const v=me();return v?playV(v,t,l,valid,onStart):Promise.resolve(false)};
 const warm=(t,l)=>{const v=me();if(v&&st.inflight<2&&norm(t))gen(v,t,l)};
 window.MyVoice={on,play,warm,cfg,ready:()=>!!me()};

 /* ===== واجهة الإعدادات ===== */
 const $=id=>document.getElementById(id);
 const msg=(t,cls)=>{const e=$('mv-msg');if(e){e.textContent=t||'';e.className='mv-msg '+(cls||'')}};
 const fmt=ts=>{try{return new Date(ts).toLocaleDateString('ar',{day:'numeric',month:'long',year:'numeric'})}catch(e){return''}};
 const panel=()=>{const v=me(),mode=window.P&&P.vmode==='mine'&&v?'mine':'bomi';
  return `<div class="mv-card" id="mv-card"><h3>🗣️ اِخْتَرْ صَوْتَ بُومِي</h3>
  <div class="voice-provider mv-mode"><button class="${mode==='bomi'?'on':''}" onclick="mvMode('bomi')">🦉 صوت بومي</button><button class="${mode==='mine'?'on':''}" ${v?'':'disabled title="أنشئ صوتك أولًا"'} onclick="mvMode('mine')">🎙️ صوتي الشخصي</button></div>
  <p class="mut">${mode==='mine'?'✅ بومي يتكلّم الآن بصوتك في كل الموقع. إذا تعذّر صوتك (بلا إنترنت مثلًا) يكمل بصوته المعتاد تلقائيًا.':v?'صوت بومي المعتاد مفعّل. يمكنك التبديل إلى صوتك بضغطة واحدة.':'صوت بومي المعتاد مفعّل. أنشئ صوتك الشخصي أدناه ليتكلّم به بومي.'}</p>
  ${v?`<div class="mv-have"><b>🎙️ صوتك الشخصي جاهز</b><span class="mut">أُنشئ ${fmt(v.at)}</span>
   <div class="mv-row"><button class="alt" onclick="mvPreview('ar',1)">🔊 استمع بالعربية</button><button class="alt" onclick="mvPreview('en',1)">🔊 Listen in English</button></div>
   <div class="mv-row"><button class="alt" onclick="mvRedo()">🔁 أَعِدْ إِنْشَاءَ صَوْتِي</button><button class="alt mv-del" onclick="mvDelete()">🗑️ اِحْذِفْ صَوْتِي</button></div></div>`:''}
  <details class="mv-make" id="mv-make" ${v?'':'open'}><summary>🎙️ ${v?'إنشاء صوت جديد':'إنشاء صوتي الشخصي'}</summary>
   <ol class="mv-steps">
    <li><b>سجّل صوتك</b> (من ٦ إلى ١٥ ثانية) وأنت تقرأ هذا النص بهدوء وفي مكان بلا ضجيج:<p class="mv-read" dir="rtl">${READ}</p>
     <div class="mv-row"><button class="big mv-recbtn" id="mv-rec" onclick="mvRec()">🎤 اِبْدَأِ التَّسْجِيلَ</button><label class="alt mv-up">📁 اِرْفَعْ تَسْجِيلًا<input type="file" accept="audio/*,video/webm,.m4a,.mp3,.wav,.ogg,.webm" hidden onchange="mvFile(this)"></label></div>
     <div id="mv-time" class="mv-time"></div><audio id="mv-audio" controls hidden></audio></li>
    <li><b>النص المقروء في التسجيل</b> <span class="mut">(عدّله إذا رفعت تسجيلًا بنص مختلف؛ يجب أن يطابق الكلام تمامًا)</span>
     <textarea id="mv-text" dir="auto" rows="3">${READ}</textarea></li>
    <li><label class="mv-consent"><input type="checkbox" id="mv-ok"> هذا صوتي (أو بإذن صاحبه)، وأوافق على إنشاء نسخة منه ليستخدمها بومي في هذا الموقع فقط.</label></li>
   </ol>
   <button class="big" id="mv-make-btn" onclick="mvCreate()">✨ أَنْشِئْ نُسْخَتِي الصَّوْتِيَّةَ</button>
   <div id="mv-pg" class="mv-pg" hidden role="progressbar" aria-valuemin="0" aria-valuemax="100"><div class="mv-pg-top"><b id="mv-pg-t">٠٪</b><span id="mv-pg-s"></span></div><div class="mv-pg-bar"><i id="mv-pg-f"></i></div><small id="mv-pg-r" class="mut"></small></div>
   <div id="mv-prev" hidden><h3>🎧 معاينة صوتك قبل اعتماده</h3><div class="mv-row"><button class="alt" onclick="mvPreview('ar')">🔊 جملة عربية</button><button class="alt" onclick="mvPreview('en')">🔊 English sentence</button></div>
    <button class="big" id="mv-accept" disabled onclick="mvAccept()">✅ اِعْتَمِدْ صَوْتِي وَفَعِّلْهُ فِي كُلِّ الْمَوْقِعِ</button><p class="mut">يُفعَّل زر الاعتماد بعد نجاح معاينة واحدة على الأقل.</p></div>
   <p id="mv-msg" class="mv-msg"></p>
   <p class="mut mv-priv">🔒 التسجيل يُرسل إلى خادم الصوت لإنشاء البصمة ثم يُحذف ولا يُحفظ. تُحفظ البصمة الصوتية فقط في ملف الطالب (وحسابه إن كان مربوطًا)، ويمكن حذفها في أي وقت. النموذج: Audar-TTS-V1-Flash (مفتوح المصدر).</p>
  </details></div>`};
 const render=()=>{const c=$('mv-card');if(c)c.outerHTML=panel()};
 window.mvMode=m=>{if(!window.P)return;if(m==='mine'&&!me())return msg('أنشئ صوتك أولًا.','bad');P.vmode=m==='mine'?'mine':'bomi';st.down=0;save();try{say.stop()}catch(e){}render();
  setTimeout(()=>{try{say(m==='mine'?'مَرْحَبًا! أَنَا بُومِي، وَسَأَتَكَلَّمُ الْآنَ بِصَوْتِكَ.':'مَرْحَبًا! عُدْتُ إِلَى صَوْتِي الْمُعْتَادِ.','ar')}catch(e){}},120)};
 /* التسجيل من الميكروفون: يتوقف تلقائيًا عند ١٥ ثانية */
 window.mvRec=async()=>{const b=$('mv-rec');if(st.rec){try{st.rec.r.stop()}catch(e){}return}
  if(!navigator.mediaDevices||!window.MediaRecorder)return msg('هذا المتصفح لا يدعم التسجيل. ارفع ملفًا صوتيًا بدلًا من ذلك.','bad');
  let s;try{s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,channelCount:1}})}catch(e){return msg('لم يُسمح بالميكروفون. اسمح به من إعدادات المتصفح ثم حاول مرة أخرى.','bad')}
  try{say.stop()}catch(e){}
  const ch=[],r=new MediaRecorder(s),t0=Date.now();st.rec={r};b.textContent='⏹ أَوْقِفِ التَّسْجِيلَ';b.classList.add('rec');msg('');
  const tick=setInterval(()=>{const x=(Date.now()-t0)/1000,e=$('mv-time');if(e)e.textContent='🔴 '+x.toFixed(0)+' / ١٥ ثانية';if(x>=15)try{r.stop()}catch(e){}},250);
  r.ondataavailable=e=>e.data&&e.data.size&&ch.push(e.data);
  r.onstop=()=>{clearInterval(tick);s.getTracks().forEach(t=>t.stop());st.rec=null;const d=(Date.now()-t0)/1000,bb=$('mv-rec');if(bb){bb.textContent='🎤 أَعِدِ التَّسْجِيلَ';bb.classList.remove('rec')}
   if(d<5.5){$('mv-time')&&($('mv-time').textContent='');return msg('التسجيل قصير جدًا. اقرأ النص كاملًا (٦ ثوانٍ على الأقل).','bad')}
   setBlob(new Blob(ch,{type:r.mimeType||'audio/webm'}),d)};
  r.start(250)};
 const setBlob=(b,d)=>{st.blob=b;st.draft=null;st.ok=0;const a=$('mv-audio');if(a){try{a.src&&URL.revokeObjectURL(a.src)}catch(e){}a.src=URL.createObjectURL(b);a.hidden=false}
  const t=$('mv-time');if(t)t.textContent=d?'✅ سُجّل '+Math.round(d)+' ثانية. استمع إليه، ثم أنشئ نسختك أو أعد التسجيل.':'✅ اختير الملف. استمع إليه وتأكد أن النص أدناه يطابقه.';const p=$('mv-prev');if(p)p.hidden=true};
 window.mvFile=inp=>{const f=inp.files&&inp.files[0];if(!f)return;if(f.size>12*1024*1024)return msg('الملف كبير جدًا (الحد ١٢ م.ب). يكفي تسجيل من ٦ إلى ١٥ ثانية.','bad');msg('');setBlob(f,0)};
 const ERR={ticket:'انتهت صلاحية الطلب، حاول مرة أخرى.',too_short:'التسجيل قصير جدًا (٥ ثوانٍ على الأقل).',silent:'التسجيل صامت تقريبًا. اقترب من الميكروفون وأعد التسجيل.',bad_audio:'تعذّرت قراءة الملف الصوتي. جرّب تسجيلًا آخر.',too_big:'الملف كبير جدًا.',text:'اكتب النص المقروء في التسجيل.',busy:'محاولات كثيرة، حاول بعد قليل.',not_configured:'خادم الصوت الشخصي غير مُعدّ بعد.'};
 /* ===== إنشاء النسخة الصوتية: يعمل بلا توقف (يعيد المحاولة تلقائيًا) ويعرض النسبة المئوية لما بقي ===== */
 const AD='٠١٢٣٤٥٦٧٨٩',D=n=>String(n).replace(/\d/g,d=>AD[d]);
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const JOB={on:0,p:0,stage:'',t0:0};
 /* النسبة لا ترجع للخلف أبدًا، وتتحرّك بنعومة داخل كل مرحلة */
 const pg=(p,stage)=>{JOB.p=Math.max(JOB.p,Math.min(100,p));if(stage)JOB.stage=stage;const b=$('mv-pg');if(!b)return;b.hidden=!JOB.on&&JOB.p<100;
  const v=Math.floor(JOB.p),f=$('mv-pg-f'),t=$('mv-pg-t'),s=$('mv-pg-s'),r=$('mv-pg-r');if(f)f.style.width=v+'%';if(t)t.textContent=D(v)+'٪';if(s)s.textContent=JOB.stage;b.setAttribute('aria-valuenow',v);
  if(r)r.textContent=v>=100?'':'بَاقٍ '+D(100-v)+'٪ — لَا تُغْلِقِ الصَّفْحَةَ، الْعَمَلُ مُسْتَمِرٌّ تِلْقَائِيًّا'};
 /* تقدّم تقريبي داخل مرحلة طويلة: يقترب من نهايتها ولا يتجاوزها */
 const creep=(a,b,secs)=>{const s0=Date.now();const k=setInterval(()=>{const x=(Date.now()-s0)/1000;pg(a+(b-a)*(1-Math.exp(-x/secs)))},400);return()=>clearInterval(k)};
 let WL=null;const awake=async on=>{try{if(on&&navigator.wakeLock&&!WL)WL=await navigator.wakeLock.request('screen');else if(!on&&WL){await WL.release();WL=null}}catch(e){}};
 /* الخادم المجاني ينام: ننتظر استيقاظه بلا حدّ قصير (حتى ١٥ دقيقة) */
 const wake=async url=>{const stop=creep(8,40,90);try{for(let i=0;i<180;i++){try{const r=await fetchT(url+'/health',{cache:'no-store'},10000);if(r.ok){const j=await r.json();if(j.ready)return true;if(j.err)return false}}catch(e){}
   pg(0,i<2?'⏳ يُوقِظُ خَادِمَ الصَّوْتِ…':'⏳ الْخَادِمُ يَسْتَيْقِظُ ('+D(i*5)+' ث)… أَوَّلُ مَرَّةٍ قَدْ تَأْخُذُ دَقِيقَتَيْنِ');await sleep(5000)}return false}finally{stop()}};
 /* رفع التسجيل مع نسبة الرفع الحقيقية (XHR) */
 const upload=(url,f,a,b)=>new Promise(res=>{const x=new XMLHttpRequest();x.open('POST',url);x.timeout=600000;let stop=null;
  x.upload.onprogress=e=>{if(e.lengthComputable)pg(a+(b-a)*0.4*e.loaded/e.total,'📤 يُرْسِلُ تَسْجِيلَكَ…')};
  x.upload.onload=()=>{pg(a+(b-a)*0.4,'🧠 يُحَلِّلُ صَوْتَكَ وَيَصْنَعُ بَصْمَتَهُ…');stop=creep(a+(b-a)*0.4,b,120)};
  const end=(st,j)=>{stop&&stop();res({status:st,j})};
  x.onload=()=>{let j={};try{j=JSON.parse(x.responseText)}catch(e){}end(x.status,j)};x.onerror=()=>end(0,{});x.ontimeout=()=>end(0,{});x.send(f)});
 const FATAL=['too_short','silent','bad_audio','too_big','text'];
 window.mvCreate=async()=>{if(JOB.on)return;if(!st.blob)return msg('سجّل صوتك أو ارفع ملفًا أولًا.','bad');if(!$('mv-ok').checked)return msg('ضع علامة الموافقة أولًا.','bad');
  const rt=norm($('mv-text').value);if(rt.length<8)return msg(ERR.text,'bad');const btn=$('mv-make-btn');
  JOB.on=1;JOB.p=0;JOB.t0=Date.now();btn.disabled=true;btn.textContent='⏳ جَارٍ الْإِنْشَاءُ…';msg('');$('mv-prev').hidden=true;awake(true);pg(1,'🔌 يَتَّصِلُ بِخَادِمِ الصَّوْتِ…');
  const fail=m=>{msg(m,'bad');JOB.on=0;const b=$('mv-pg');if(b)b.hidden=true};
  try{for(let n=1;n<=8;n++){if(n>1){pg(0,'🔁 مُحَاوَلَةٌ جَدِيدَةٌ تِلْقَائِيًّا ('+D(n)+')…');await sleep(Math.min(20000,3000*n))}
    const g=await cfg(true);if(!g.configured){if(g.net){pg(0,'📶 لَا يُوجَدُ إِنْتَرْنِتْ، أَنْتَظِرُ عَوْدَتَهُ…');continue}return fail(ERR.not_configured)}pg(6);
    if(!await wake(g.url))continue;pg(42,'✅ الْخَادِمُ جَاهِزٌ');
    const f=new FormData();f.append('audio',st.blob,'rec');f.append('ref_text',rt);f.append('ticket',g.ticket||'');f.append('exp',String(g.exp||0));
    const {status,j}=await upload(g.url+'/enroll',f,42,75);
    if(status===200&&j.vt){st.draft={codes:j.codes,rt:j.ref_text,vid:j.vid,vt:j.vt,dur:j.dur,url:g.url,at:Date.now()};st.ok=0;pg(76,'🎧 يُجَهِّزُ مُعَايَنَةَ صَوْتِكَ…');
     /* المعاينة جزء من الإنشاء: نولّدها الآن (مع إعادة المحاولة) حتى يكون الصوت جاهزًا للاستماع */
     const stop=creep(76,98,90);let b=null;try{for(let k=0;k<4&&!b;k++){b=await gen(st.draft,SAMPLE.ar,"ar",300000);if(!b){MEM.delete(ck(st.draft,SAMPLE.ar,'ar'));st.down=0;await sleep(4000)}}}finally{stop()}
     pg(100,'✅ اكتمل إنشاء نسختك الصوتية');JOB.on=0;$('mv-prev').hidden=false;$('mv-accept').disabled=true;awake(false);
     msg(b?'✅ أُنشئت نسختك الصوتية. استمع إلى المعاينة ثم اعتمدها.':'✅ أُنشئت نسختك الصوتية. اضغط «جملة عربية» للاستماع.','good');if(b)mvPreview('ar');return}
    if(FATAL.includes(j.detail))return fail(ERR[j.detail]);
    if(status===429){pg(0,'⏳ الْخَادِمُ مَشْغُولٌ، أَنْتَظِرُ دَقِيقَةً ثُمَّ أُكْمِلُ…');await sleep(60000)}
    /* غير ذلك (انقطاع، خادم يُعاد تشغيله، تذكرة انتهت): نعيد المحاولة تلقائيًا بتذكرة جديدة */}
   fail('تعذّر الإنشاء بعد عدة محاولات. تحقّق من الإنترنت ثم اضغط الزر مرة أخرى.')}
  catch(e){fail('حدث خطأ غير متوقع. اضغط الزر مرة أخرى.')}
  finally{JOB.on=0;awake(false);const b2=$('mv-make-btn');if(b2){b2.disabled=false;b2.textContent='✨ أَنْشِئْ نُسْخَتِي الصَّوْتِيَّةَ'}}};
 const SAMPLE={ar:'أَحْسَنْتَ يَا بَطَلُ! هَيَّا نَقْرَأُ قِصَّةً جَدِيدَةً عَنِ الْقِطَّةِ الصَّغِيرَةِ.',en:'Great job! Let us read a new story about a little cat.'};
 window.mvPreview=async(l,saved)=>{const v=saved?me():st.draft;if(!v)return;try{say.stop()}catch(e){}msg('⏳ يُولَّد صوتك… (أول مرة قد تستغرق بضع ثوانٍ)');
  const ok=await playV(v,SAMPLE[l],l,()=>true,()=>msg('🔊 '+SAMPLE[l]));
  if(ok===true){if(!saved){st.ok=1;const a=$('mv-accept');if(a)a.disabled=false}msg('✅ هذا صوتك. '+(saved?'':'إِذَا أَعْجَبَكَ فَاعْتَمِدْهُ، أَوْ أَعِدِ التَّسْجِيلَ لِنَتِيجَةٍ أَفْضَلَ.'),'good')}
  else msg('تعذّر توليد المعاينة الآن. حاول مرة أخرى.','bad')};
 window.mvAccept=()=>{if(!st.draft||!st.ok||!window.P)return;P.myv=st.draft;P.vmode='mine';st.draft=null;st.blob=null;st.down=0;save();try{window.HurufiSync&&HurufiSync.push()}catch(e){}render();msg('');
  setTimeout(()=>{try{say('رَائِعٌ! صَارَ بُومِي يَتَكَلَّمُ بِصَوْتِكَ فِي كُلِّ الْمَوْقِعِ.','ar')}catch(e){}},150)};
 window.mvRedo=()=>{const d=$('mv-make');if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'})}};
 window.mvDelete=async()=>{if(!window.P||!confirm('حذف صوتك الشخصي؟ سيعود بومي إلى صوته المعتاد.'))return;try{say.stop()}catch(e){}
  delete P.myv;P.vmode='bomi';save();MEM.clear();try{await caches.delete(CN)}catch(e){}render()};
 /* نضيف لوحة الصوت الشخصي أعلى صفحة «صوت بومي» */
 const vs=window.voiceSet;if(typeof vs==='function')window.voiceSet=function(){const r=vs.apply(this,arguments);try{const h2=document.querySelector('#app .sec h2');if(h2&&!$('mv-card'))h2.insertAdjacentHTML('afterend',panel())}catch(e){}return r};
 /* تصحيح القيم القديمة: «صوتي الشخصي» لا يُفعَّل بلا بصمة مكتملة */
 if(window.P&&P.vmode==='mine'&&!me()){P.vmode='bomi';try{save()}catch(e){}}
})();
