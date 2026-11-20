/* voice.js — نطق عربي وإنجليزي لبومي من مقاطع Microsoft Edge Neural المسجّلة مسبقًا فقط (المعلّمة: Zariyah/Ava، المعلّم: Hamed/Andrew) — لا محرك توليد ولا صوت جهاز
   • يحافظ على التشكيل ويصلح ترتيب الشدّة والحركة حتى يفهمها محرك النطق
   • يقسّم الكلام حسب اللغة (عربي/إنجليزي) فيقرأ كل جزء بصوته الصحيح
   • نبرة وسرعة تتغيران حسب الجملة (فرح، تشجيع، سؤال) مع فواصل طبيعية
   • say.stop() يوقف البومة فورًا، ولا يتطلب تنزيل أي نموذج صوت */
(()=>{
/* المعلم/المعلمة: P.teacher = 'female' | 'male'. يُطبَّق على كل نطق في الموقع (الدروس، الألعاب، بومي) */
const teacher=()=>P&&P.teacher=='male'?'male':'female';
/* تحويل الخطاب حسب جنس الطالب (اضغطْ/اضغطي…) يخص الجمل الموجّهة للطالب فقط؛ القصص والسرد والقراءة لا تُحوَّل
   (كان يحوّل «وَصَلَتِ السلحفاةُ» إلى «وَصَلْتِ» خطأً). */
const NOG=/^(story|stories|listenTest|readTest|courseViewer|courseModule|talk|dictation|dictationAdv|lesson|quiz|review|daily|bank|bankSub|bankLesson|bankReview|bankPractice|arTeach|sbStory|sbQuiz|sbTest)$/; /* صفحات محتوى تعليمي: لا تأنيث لكلمات الدرس (كانت «نَجْمٌ» تُقرأ «نَجْمَة») */
/* كلمة أو كلمتان = محتوى درس (مُمْتَاز، بَطَل…) لا خطاب؛ جمل التشجيع تصل مُحوَّلة أصلًا من مصدرها (المدرّب، بومي، معلّم الإنجليزية) */
const genderOk=t=>{if(window.__noGender)return false;if(t!=null&&String(t).trim().split(/\s+/).length<=2)return false;try{const e=window.Router&&Router.entry();return!(e&&NOG.test(e.fn))}catch(e){return true}};
window.teacherOf=teacher;
const EM=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}•←→▶\u{2300}-\u{23FF}\u{1F000}-\u{1F2FF}]/gu;
/* التشكيل: الشدّة قبل الحركة (الترتيب الذي تفهمه المحركات)، حذف التطويل، منع تكرار الحركة */
const fixAr=s=>String(s).replace(/[\u200E\u200F\u061C\u0640]/g,'').replace(/([\u064B-\u0650])\u0651/g,'\u0651$1').replace(/([\u064B-\u0652])\1+/g,'$1');
/* كان هنا تحويل خاص بحرف الباء وحده (بَ ← «بَ، بَطَّة») من زمن محركات الجهاز التي لا تنطق المقطع منفردًا.
   المقاطع الآن مسجّلة (Edge) لكل الحروف، فيُنطق «بَ» وحده مثل «جَ» و«نَ»، دون كلمة إضافية. */
const SYL={};
/* حرف منفرد بلا حركة يُنطق باسمه (ب ← بَاء)، وحرف ساكن منفرد يُنطق بهمزة قبله (تْ ← أَتْ) كما يعلّمه المعلم */
{const N={'ا':'أَلِف','ب':'بَاء','ت':'تَاء','ث':'ثَاء','ج':'جِيم','ح':'حَاء','خ':'خَاء','د':'دَال','ذ':'ذَال','ر':'رَاء','ز':'زَاي','س':'سِين','ش':'شِين','ص':'صَاد','ض':'ضَاد','ط':'طَاء','ظ':'ظَاء','ع':'عَيْن','غ':'غَيْن','ف':'فَاء','ق':'قَاف','ك':'كَاف','ل':'لَام','م':'مِيم','ن':'نُون','ه':'هَاء','و':'وَاو','ي':'يَاء',
 'أ':'هَمْزَةٌ فَوْقَ الأَلِف','إ':'هَمْزَةٌ تَحْتَ الأَلِف','آ':'أَلِفُ المَدّ','ء':'هَمْزَة','ة':'تَاءٌ مَرْبُوطَة','ى':'أَلِفٌ مَقْصُورَة','ؤ':'هَمْزَةٌ عَلَى الوَاو','ئ':'هَمْزَةٌ عَلَى اليَاء'};
 for(const[l,n]of Object.entries(N)){const k=fixAr(l);if(!SYL[k])SYL[k]=n;const q=fixAr(l+'\u0652');if('بتثجحخدذرزسشصضطظعغفقكلمنهوي'.includes(l)&&!SYL[q])SYL[q]='أَ'+l+'\u0652'}}
const AR=/[\u0600-\u06FF]/,LA=/[A-Za-z]/;
/* تقسيم النص إلى مقاطع عربية وإنجليزية متتالية */
const runs=(s,L)=>{const o=[];let cl=null,cur=[];for(const w of s.split(' ')){const c=AR.test(w)?'ar':LA.test(w)?'en':(cl||L);if(cl&&c!==cl){o.push([cur.join(' '),cl]);cur=[]}cl=c;cur.push(w)}if(cur.length)o.push([cur.join(' '),cl]);return o};
const clean=(t,L)=>{let s=String(t==null?'':t);const k=fixAr(s.trim());if(SYL[k])s=SYL[k];
s=s.replace(/\+\s*(?=[0-9\u0660-\u0669]+\s*(?:⭐|🌟|نجم|نَجْم))/g,'')/* حرف منفرد داخل جملة («ا»، حرف ب) يُنطق باسمه كما وحده؛ كان يُرسل حرفًا مجردًا فيُنطق «آ/ع» */.replace(/«\s*([\u0621-\u064A])\s*»/g,(m,l)=>' '+(SYL[fixAr(l)]||l)+' ').replace(/(حَ?رْ?فِ?ُ?\s+)([\u0621-\u064A])(?=[\s،,.!؟?:]|$)/g,(m,a,l)=>a+(SYL[fixAr(l)]||l)) /* «+٢ ⭐» مكافأة نجوم لا عملية جمع: لا تُقرأ «زَائِد» */.replace(/<[^>]*>/g,' ').replace(EM,' ').replace(/[⟵⟶←→⬅➡«»“”"]/g,' ');
if(L=='ar'&&!/[0-9\u0660-\u0669]/.test(s))s=s.replace(/\s*[=+]\s*/g,' ، '); /* «=» و«+» في الشرح (لا في الحساب) فاصلٌ لا «يساوي/زائد» */
if(L=='ar')s=s.replace(/×/g,' ضَرْب ').replace(/÷/g,' قِسْمَة عَلَى ').replace(/\+/g,' زَائِد ').replace(/[−]/g,' نَاقِص ').replace(/(\d)\s*-\s*(\d)/g,'$1 نَاقِص $2').replace(/=/g,' يُسَاوِي ').replace(/[«»]/g,' ');
s=fixAr(s); /* لا نستعمل Pron.speech: كان يكتب الكلمات بتهجئة خاصة لصوت الجهاز (كِتَابُنْ، دُبْبْ) فتخالف نص المقاطع المسجّلة */
return s.replace(/\s+/g,' ').trim()};
window.onTalk=window.onTalk||(()=>{});
/* تنبيه واضح عند تعذّر صوت موجود (بلا إنترنت ولم يُنزَّل مقطعه بعد)؛ النص الذي لا مقطع له أصلًا (كاسم الطالب) لا ينبّه */
let noteAt=0;const soundNote=p=>{try{if(navigator.onLine!==false||!window.HurufiClips||!HurufiClips.has(p.t,p.l)||Date.now()-noteAt<30000)return;noteAt=Date.now();
 let n=document.getElementById('snd-note');if(!n){n=document.createElement('div');n.id='snd-note';n.setAttribute('role','status');n.style.cssText='position:fixed;inset-inline:12px;top:calc(10px + env(safe-area-inset-top,0px));z-index:40;background:#22254a;color:#fff;font-weight:700;padding:10px 14px;border-radius:14px;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.25)';document.body.appendChild(n)}
 n.textContent='📴 هَذَا الصَّوْتُ لَمْ يُنَزَّلْ بَعْدُ، وَسَيَعْمَلُ عِنْدَ عَوْدَةِ الْإِنْتَرْنِت. (تَنْزِيلُ كُلِّ الْأَصْوَاتِ مِنْ: الْإِعْدَادَات ← صَوْتُ بُومِي)';n.hidden=false;clearTimeout(n._t);n._t=setTimeout(()=>{n.hidden=true},4500)}catch(e){}};
window.muted=()=>!!(P&&P.snd===0);
const cl=(x,a,b)=>Math.max(a,Math.min(b,x));
/* say(نص، لغة، عند الانتهاء، مزاج) — المزاج: happy | soft | explain | cheer | ask | oops
   say.stream(لغة، مزاج) ← يعيد {push(نص)، end(عند_الانتهاء)} لنطق الإجابة جملةً جملةً أثناء وصولها (بثّ تدريجي)
   say.stop() إيقاف فوري · say.replay() إعادة آخر كلام · الصوت من الجهاز مباشرة */
/* كلمة عربية تُنطق وحدها (قوائم الكلمات، الخيارات، الضغط على كلمة) وهي نكرة: تُنطق منوّنة كما تُقرأ (بَقَرَةٌ لا «بَقَر») */
const nun1=s=>{const m=String(s).trim().match(/^([\u0621-\u064A\u064B-\u0652\u0670]+)([.!؟?،]*)$/);if(!m)return s;
 /* سكون صريح في آخرها = قراءة بالوقف كما كُتبت (ألعاب تركيب الكلمة من حروفها: لا تنوين ظاهر، فلا تنوين في النطق) */
 if(/\u0652$/.test(m[1])){const H=window.HurufiClips;return(H&&!H.has(m[1],'ar')&&H.has(m[1].slice(0,-1),'ar')?m[1].slice(0,-1):m[1])+m[2]} /* «جَدّْ، أَرْنَبْ» ← «جَدّ، أَرْنَب»: المحرك يقف على الكلمة المجرّدة، ومفتاحها مسجّل */
 return Tashkeel.nunWord?Tashkeel.nunWord(m[1])+m[2]:s};
const ENDS=/[.!؟?\n]/,CL=/[^،,;:]+[،,;:]?/g,SNT=/[^.!؟?\n]+[.!؟?\n]*/g;
/* جملة ← أجزاء تُطابق مفاتيح المقاطع المسجّلة. */
/* تقسيم الجملة إلى مقاطع حسب اللغة فقط (بلا تقسيم عند الفواصل): بهذه المفاتيح نفسها سُجّلت مقاطع Edge (tools/clips) */
const mk=(sn,L)=>{const o=[],e=(sn.match(/[.!؟?]+\s*$/)||[''])[0].trim().slice(-1),body=sn.replace(/[.!؟?\n]+\s*$/,'').trim();if(!/[\p{L}\p{N}]/u.test(body))return o;
 const rr=runs(body,L);rr.forEach((r,i)=>{const last=i==rr.length-1,p={t:r[0],l:r[1],e:last?e:''};
  const cs=[p.t].map(x=>x.trim()).filter(x=>/[\p{L}\p{N}]/u.test(x));
  cs.forEach((x,j)=>{const m=(x.match(/[،,;:]$/)||[''])[0];o.push({t:x.replace(/[،,;:]$/,''),l:r[1],e:m||(last&&j==cs.length-1?e:'')})})});return o};
function runner(tk,L,mood){const parts=[];let i=0,ended=false,cb=null,buf='',all='';
 const fin=()=>{if(tk!=say.tk)return;say.live=0;onTalk(false);document.dispatchEvent(new Event('hurufi-say'));cb&&cb()};
 const add=txt=>{if(L=='ar'&&window.studentGenderText&&genderOk(txt))txt=studentGenderText(txt);const c=clean(L=='ar'&&window.Tashkeel?nun1(Tashkeel.apply(txt)):txt,L);if(!c)return;(c.match(SNT)||[c]).forEach(x=>mk(x.trim(),L).forEach(p=>parts.push(p)))};
 /* لا محرك توليد ولا صوت جهاز: نص بلا مقطع مسجّل (اسم الطالب، ردود بومي الذكية) لا يُنطق، فننتقل للمقطع التالي بهدوء */
 const device=p=>{if(tk!=say.tk)return;soundNote(p);setTimeout(nx,60)};
/* تركيب الجملة من مقاطع جاهزة: إن لم تكن الجملة كاملة محفوظة، نبنيها من أطول قطع محفوظة (مثل «اِسْتَمِعْ جَيِّدًا» + «صَاد»)
    فيبدأ الصوت فورًا بنفس صوت المعلّم؛ ويُسمح بقطعة قصيرة واحدة غير محفوظة (كاسم الطالب) تُولَّد محليًا. */
 const D2L=x=>x.replace(/[\u0660-\u0669]/g,d=>String(d.charCodeAt(0)-1632)),TRIM=/^[\s:،,؛—\-]+|[\s:،,؛—\-]+$/g,TRIM2=/[\s؟?!.…]+$/g;
 const H=(x,l)=>{try{if(HurufiClips.has(x,l))return x;const y=D2L(x);if(y!==x&&HurufiClips.has(y,l))return y}catch(e){}return null};
 const split=p=>{try{if(!window.HurufiClips||p.sub)return null;const w=p.t.split(/\s+/).filter(Boolean);if(w.length<2||w.length>24)return null;const out=[];let i=0,unk=0,uw=0;
  while(i<w.length){let f=null;for(let j=w.length;j>i;j--){const x0=w.slice(i,j).join(' '),x=x0.replace(TRIM,'');if(!x){f={x:'',j};break}const k=H(x0,p.l)||H(x,p.l)||H(x.replace(TRIM2,''),p.l);if(k){f={x:k,j};break}}
   if(f){if(f.x)out.push({t:f.x,l:p.l,e:'',sub:1});i=f.j}else{const x=w[i].replace(TRIM,'').replace(TRIM2,'');uw++;const last=out[out.length-1];if(last&&last.unk)last.t+=' '+x;else{unk++;out.push({t:x,l:p.l,e:'',sub:1,unk:1})}i++}}
  if(!out.length||unk>1||uw>2||out.length>9||out.every(o=>o.unk))return null;out[out.length-1].e=p.e;return out}catch(e){return null}};
const browser=p=>{try{window.HurufiClips&&HurufiClips.record(p.t,p.l)}catch(e){}
  const gap=/[.!؟?\n]/.test(p.e)?170:p.e?70:0,after=ok=>{if(tk!=say.tk)return;ok===true?(gap?setTimeout(nx,gap):nx()):device(p)};
  /* جملة بلا مقطع مسجّل كامل: تُنطق كاملة بسلاسة من خادم الصوت (بصوت المعلّم نفسه) بدل تركيبها كلمةً كلمةً؛
     التركيب من المقاطع يبقى احتياطًا عند انقطاع الإنترنت أو تعذّر الخادم */
  if(window.HurufiClips&&HurufiClips.speak&&!p.sub&&!p.tts&&!H(p.t,p.l)&&p.t.split(/\s+/).length>=2&&navigator.onLine!==false){p.tts=1;
   HurufiClips.speak(p.t,p.l,()=>tk==say.tk,()=>{onTalk(true)}).then(ok=>{if(tk!=say.tk)return;if(ok===true)return after(true);browser(p)});return}
  if(window.HurufiClips&&!p.sub&&!HurufiClips.has(p.t,p.l)&&!H(p.t,p.l)){const sub=split(p);if(sub){parts.splice(i,0,...sub);return nx()}}
  /* الأرقام تُكتب بالعربية (٣٥) والمقطع مسجّل بالأرقام اللاتينية (35) */
  {const k0=!p.sub&&H(p.t,p.l);if(k0)p.t=k0}
  if(window.HurufiClips&&HurufiClips.has(p.t,p.l)){HurufiClips.play(p.t,p.l,()=>tk==say.tk,()=>{onTalk(true)}).then(ok=>{if(tk!=say.tk)return;ok===true?after(true):device(p)});return}
  device(p)};
 const nx=()=>{if(tk!=say.tk)return;
  if(i>=parts.length){if(ended&&!buf.trim())return fin();setTimeout(nx,60);return} /* ننتظر بقية الإجابة */
  const p=parts[i++];
  /* نجهّز المقطعين التاليين أثناء نطق الحالي: لا فجوات بين أجزاء الجملة */
  try{if(window.HurufiClips&&HurufiClips.warm)parts.slice(i,i+2).forEach(q=>{const d=q.t.replace(/[\u0660-\u0669]/g,x=>String(x.charCodeAt(0)-1632)),k=HurufiClips.has(q.t,q.l)?q.t:HurufiClips.has(d,q.l)?d:null;if(k)HurufiClips.warm(k,q.l);else if(HurufiClips.warmTts&&!q.sub&&q.t.split(/\s+/).length>=2)HurufiClips.warmTts(q.t,q.l) /* الجملة التالية تُجهَّز من الخادم أثناء نطق الحالية */})}catch(e){}
  browser(p)};
 const flush=final=>{let m=buf.match(/^[\s\S]*[.!؟?\n]/);if(m){add(m[0]);buf=buf.slice(m[0].length)}
  else if(buf.length>150){const k=Math.max(buf.lastIndexOf('،'),buf.lastIndexOf(','));if(k>40){add(buf.slice(0,k+1)+'،');buf=buf.slice(k+1)}}
  if(final&&buf.trim()){add(buf);buf=''}};
 return{push(t){if(tk!=say.tk||ended)return;t=String(t==null?'':t);all+=t;buf+=t;flush(false)},
  end(f){if(tk!=say.tk||ended)return;ended=true;cb=f||null;say.last={t:all,l:L,m:mood};flush(true)},
  start(){say.live=1;document.dispatchEvent(new Event('hurufi-say'));setTimeout(nx,8)}}}
/* ===== BumiAudio: نظام مركزي واحد لإدارة كل أصوات الموقع =====
   • كل نطق مربوط بالصفحة (السياق) التي بدأ منها: page يزيد مع كل انتقال (router.js).
   • المؤقتات (setTimeout/setInterval) تحمل رقم صفحتها؛ أي طلب نطق يأتي من مؤقت صفحة سابقة يُلغى ولا يُسمع في الصفحة الجديدة.
   • عند الانتقال: تكتمل الجملة الحالية فقط بشكل طبيعي، وتُلغى بقية المقاطع والتحضيرات المسبقة للصفحة السابقة.
   • صوت الصفحة الجديدة ينتظر حتى ينتهي الصوت السابق (بحد أقصى قصير، ثم خفض تدريجي سلس بدل القطع المفاجئ).
   • لا يُعاد تحميل المحرك أو النماذج: نوقف التشغيل فقط. */
window.BumiAudio=(()=>{let page=1,caller=null,drain=null,wq=null,wT=0;
 const _st=window.setTimeout.bind(window),_si=window.setInterval.bind(window),_ct=window.clearTimeout.bind(window);
 const tag=fn=>{const pg=page;return function(){const pv=caller;caller=pg;try{return fn.apply(this,arguments)}finally{caller=pv}}};
 try{window.setTimeout=function(fn,ms,...a){return typeof fn==='function'?_st(tag(fn),ms,...a):_st(fn,ms,...a)};
  window.setInterval=function(fn,ms,...a){return typeof fn==='function'?_si(tag(fn),ms,...a):_si(fn,ms,...a)}}catch(e){}
 const CAP=3200,FADE=320;
 const busy=()=>{try{return!!(window.HurufiClips&&HurufiClips.busy&&HurufiClips.busy())}catch(e){return false}};
 const hard=()=>{try{window.HurufiClips&&HurufiClips.stop()}catch(e){}return false};
 /* ينفّذ fn عندما يصبح الصوت هادئًا؛ آخر طلب فقط ينتظر (منع التكرار والتراكم) */
 function whenQuiet(fn){if(!drain&&!busy())return fn();wq=fn;if(wT)return;const tick=()=>{wT=0;
   if(!busy()){drain=null;const f=wq;wq=null;f&&f();return}
   if(drain&&Date.now()>drain.until){drain.until=Infinity;const f2=hard();wT=_st(tick,f2?FADE+40:60);return}
   if(!drain)drain={until:Date.now()+CAP,at:Date.now()};wT=_st(tick,40)};wT=_st(tick,40)}
 /* ضغطة جديدة من الطالب بعد الانتقال (مثل الضغط على كلمة): نقطع الصوت السابق فورًا ولا ننتظر */
 let userAt=0,navAt=0;try{document.addEventListener('pointerdown',()=>{userAt=Date.now()},{capture:true,passive:true});document.addEventListener('keydown',()=>{userAt=Date.now()},{capture:true,passive:true})}catch(e){}
 const userAfter=()=>!!drain&&userAt>(drain.at||0)+120;
 function cancel(){drain=null;wq=null;if(wT){_ct(wT);wT=0}try{window.HurufiClips&&HurufiClips.stop()}catch(e){}}
 /* الانتقال إلى صفحة جديدة: أكمل الجملة الحالية فقط، وألغِ ما بعدها */
 function navigate(){page++;navAt=Date.now();wq=null;drain=null;if(wT){_ct(wT);wT=0}
  /* الانتقال لصفحة أخرى يوقف كل صوت فورًا: لا يُكمل كلام الصفحة السابقة في الصفحة الجديدة */
  try{window.say&&say.stop&&say.stop()}catch(e){}try{window.HurufiClips&&HurufiClips.stop()}catch(e){}}
 /* تنفيذ دالة ضمن سياق الصفحة الحالية (تُستخدم عند رسم صفحة جديدة) */
 const within=fn=>{const pv=caller;caller=page;try{return fn()}finally{caller=pv}};
 return{navigate,whenQuiet,busy,hard,within,cancel,userAfter,tapped:()=>userAt>navAt,stale:()=>caller!==null&&caller!==page,page:()=>page,draining:()=>!!drain}})();
const DEAD={push(){},end(){},start(){}};
say=function(t,l,cb,mood){try{if(BumiAudio.stale())return DEAD;
 /* بومي يتكلم فقط بعد ضغطة من الطالب في الصفحة الحالية، لا وحده عند فتح الصفحة */
 if(!BumiAudio.tapped()&&!say.free)return DEAD; /* طلب من صفحة سابقة: لا يُسمع هنا */
 /* معلّم الإنجليزية: في المستويين ١–٢ تتبع الكلمةَ الإنجليزية ترجمتُها العربية في صفحات التعليم (mind/english.js) */
 if(l=='en'&&!say._word&&typeof t=='string'&&window.EnCoach&&!/[\u0600-\u06FF]/.test(t)){const g=EnCoach.gloss(t);if(g)t=t.replace(/[.!?]*\s*$/,'')+'. '+g}
 const L=l=='ar'?'ar':'en',k=L+'|'+t+'|'+mood,now=Date.now();
 if(say.live&&say.k==k&&now-say.at<350)return say.cur; /* نفس الطلب وصل مرتين في اللحظة نفسها: لا نكرره؛ أما الضغط مرة أخرى فيعيد الكلمة */
 const k0=fixAr(String(t==null?'':t).trim()),txt=SYL[k0]||t,st=say.stream(L,mood);say.k=k;say.at=now;say.cur=st;st.push(txt);st.end(cb);return st}catch(e){}};
say.stream=function(l,mood){if(BumiAudio.stale())return DEAD;const L=l=='ar'?'ar':'en';say.paused=0;
 const tk=say.tk=(say.tk||0)+1,R=runner(tk,L,mood);
 if(BumiAudio.draining()){if(BumiAudio.userAfter())BumiAudio.cancel();else{BumiAudio.whenQuiet(()=>{if(tk==say.tk)R.start()});return R}} /* بعد انتقال: ننتظر انتهاء جملة الصفحة السابقة */
 try{window.HurufiClips&&HurufiClips.stop()}catch(e){}
 R.start();return R};
say.stop=()=>{say.tk=(say.tk||0)+1;say.live=0;say.paused=0;try{window.HurufiClips&&HurufiClips.stop();window.HurufiClips&&HurufiClips.resume()}catch(e){}onTalk(false);document.dispatchEvent(new Event('hurufi-say'))};
/* إنهاء سلس: لا نقطع المقطع الذي يُنطق الآن؛ نلغي المقاطع التالية فقط (يستعملها نظام التنقل) */
say.finish=()=>{say.tk=(say.tk||0)+1;say.live=0;say.paused=0;document.dispatchEvent(new Event('hurufi-say'));
 const end=()=>{if(!BumiAudio.busy())onTalk(false);else setTimeout(end,120)};end()};
/* إيقاف مؤقت واستكمال */
say.pause=()=>{if(!say.live)return false;say.paused=1;try{window.HurufiClips&&HurufiClips.pause()}catch(e){}document.dispatchEvent(new Event('hurufi-say'));return true};
say.resume=()=>{if(!say.paused)return false;say.paused=0;try{window.HurufiClips&&HurufiClips.resume()}catch(e){}document.dispatchEvent(new Event('hurufi-say'));return true};
say.replay=()=>{const x=say.last;if(x&&x.t)say(x.t,x.l,null,x.m)};
/* الأجزاء التي ستُنطق فعلًا (نفس المعالجة تمامًا) — لتحضير الأصوات مسبقًا بنفس المفاتيح */
say.parts=(t,l)=>{try{const L=l=='ar'?'ar':'en';let x=String(t==null?'':t);const k0=fixAr(x.trim());x=SYL[k0]||x;if(L=='ar'&&window.studentGenderText&&genderOk(x))x=studentGenderText(x);const c=clean(L=='ar'&&window.Tashkeel?nun1(Tashkeel.apply(x)):x,L),o=[];if(!c)return o;(c.match(SNT)||[c]).forEach(y=>mk(y.trim(),L).forEach(p=>o.push([p.t,p.l])));return o}catch(e){return[]}};
window.say_unlock=()=>{};
window.pickPersona=function(k){if(!P)return;P.teacher=/male/i.test(k)&&!/^female/i.test(k)?'male':'female';save();window.testT()};
window.testT=function(){const x=P&&P.gender=='female'?'صَدِيقَتِي':'صَدِيقِي',me=teacher()=='male'?'مُعَلِّمُكَ':'مُعَلِّمَتُكَ';say(`أَهْلًا يَا ${x}! أَنَا ${me} بُومِي، هَلْ تَسْمَعُنِي بِوُضُوحٍ؟`,'ar',null,'cheer')};
window.VT={fixAr,runs,clean};
})();
/* ===== اضغط على أي كلمة لتسمعها =====
   ضغطة على كلمة ظاهرة في الصفحة (نص الدرس، السؤال، القصة، الشرح) تنطق تلك الكلمة وحدها، بلغتها وبصوت المعلّم المختار.
   لا تعمل على الأزرار والروابط والاختيارات والبطاقات (لها سلوكها الخاص)، ولا تكرر الصوت عند الضغط السريع المتكرر. */
(()=>{const W=/[\u0621-\u064A\u064B-\u0652\u0670\u0640A-Za-z0-9\u0660-\u0669'’]/;
 const SKIP='button,a,input,select,textarea,label,canvas,svg,video,[onclick],[role=button],[contenteditable],.opt,.card,.row,[data-say],.owl-dock,#gn,.chips';
 let last='',at=0,hT=0;
 const pick=e=>{let n,o;
  if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(e.clientX,e.clientY);if(!r)return null;n=r.startContainer;o=r.startOffset}
  else if(document.caretPositionFromPoint){const q=document.caretPositionFromPoint(e.clientX,e.clientY);if(!q)return null;n=q.offsetNode;o=q.offset}else return null;
  if(!n||n.nodeType!==3)return null;const s=n.data;let a=o,b=o;while(a>0&&W.test(s[a-1]))a--;while(b<s.length&&W.test(s[b]))b++;if(a===b)return null;
  const rg=document.createRange();rg.setStart(n,a);rg.setEnd(n,b);
  /* واجهات المؤشر تقفز إلى أقرب نص: نتأكد أن الإصبع فوق الكلمة نفسها */
  if(![...rg.getClientRects()].some(r=>e.clientX>=r.left-3&&e.clientX<=r.right+3&&e.clientY>=r.top-3&&e.clientY<=r.bottom+3))return null;
  const w=s.slice(a,b).replace(/^['’\u0640]+|['’\u0640]+$/g,'');return /[\p{L}\p{N}]/u.test(w)?{w,rg}:null};
 document.addEventListener('click',e=>{try{const t=e.target;if(!t||!t.closest||!t.closest('#app')||t.closest(SKIP))return;
  const sel=getSelection();if(sel&&!sel.isCollapsed)return;const r=pick(e);if(!r)return;
  const now=Date.now();if(r.w===last&&now-at<700)return;last=r.w;at=now;
  if(window.CSS&&CSS.highlights&&window.Highlight){CSS.highlights.set('bumi-word',new Highlight(r.rg));clearTimeout(hT);hT=setTimeout(()=>CSS.highlights.delete('bumi-word'),900)}
  const l=/[\u0600-\u06FF]/.test(r.w)?'ar':'en';
  /* الكلمة المعروضة قد تحمل سكون الوقف أو حركة سياقها (جَدِيدْ، مِنَ): نجرّب صيغتها الأساسية إن لم يكن للمعروضة مقطع */
  const has=x=>{try{const ps=say.parts(x,l);return ps.length&&ps.every(([a,b])=>HurufiClips.has(a,b))}catch(e){return false}};
  const w=[r.w,r.w.replace(/\u0652$/,''),r.w.replace(/[\u064B-\u0652]$/,'')].find(has)||r.w;
  say._word=1;try{say(w,l)}finally{say._word=0}}catch(err){}});
})();
