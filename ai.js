/* ai.js v2 — «اسأل بومي»: محادثة تعليمية + شرح بأسلوب مختلف عند عدم الفهم + توليد تمارين جديدة + ملف تعلّم الطالب + حدّ يومي.
   يعمل المعلم المحلي (localAI) أولاً دون إنترنت، ثم الدالة /.netlify/functions/tutor للأسئلة الأصعب. */
let ch=[];const strip=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,300);
const AI_MAX=40; /* أقصى عدد طلبات ذكاء اصطناعي لكل طالب يومياً */
const aiUse=()=>{P.ai=P.ai&&P.ai.d==day()?P.ai:{d:day(),n:0};return P.ai};
const aiLeft=()=>AI_MAX-aiUse().n;
const LIM_MSG='وصلنا إلى حدّ الأسئلة الذكية لهذا اليوم 🦉 يمكنك اللعب والتعلّم، ونكمل غدًا بإذن الله!';
/* ملف تعلّم الطالب: مختصر وبلا بيانات شخصية، يُرسل لبومي لتناسب شرحها مستواه */
function profile(){const E=Object.entries(P.sk||{}).filter(([k])=>!k.startsWith('m-'));
 const weak=E.filter(([k,s])=>s.m>0||(s.n>=2&&(s.e||0)/s.n>=.4)).sort((a,b)=>(b[1].m||0)-(a[1].m||0)).slice(0,6).map(x=>x[0].replace(/^ai:/,''));
 const strong=E.filter(([k,s])=>s.n>=3&&(s.e||0)/s.n<.2).slice(0,6).map(x=>x[0]);
 const letters=Object.entries(P.wl||{}).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]);
 let notes=[];try{const s=MindMemory.summary();notes=s.errs.map(e=>e.label);if(s.recentAcc!=null)notes.push('دقة آخر الإجابات '+s.recentAcc+'٪')}catch(e){}
 let en=null;try{en=window.EnCoach?EnCoach.profile():null}catch(e){} /* مستوى الإنجليزية الحقيقي ← طريقة شرح بومي */
 return{stage:P.stage||0,gender:P.gender=='female'?'female':'male',done:Object.keys(P.done||{}).length,weak,strong,letters,notes,en}}
const weakList=()=>profile().weak.join('، ');
const AGAIN=/لم\s*أفهم|ما\s*فهمت|مو\s*فاهم|مش\s*فاهم|لا\s*أفهم|وضّ?ح|اشرح.*(مرة|مره|ثاني|اخر|أخر)|بطريقة\s*(أخرى|اخرى|ثانية)/;
let chOwner=null;
/* سياق الصفحة الحالية لبومي: نوع الصفحة + عنوانها + السؤال أو النص الظاهر فيها.
   كان السياق يُؤخذ من آخر درس فُتح (cur) حتى لو كان الطالب في قصة أو لعبة أو صفحة كورس، فيشرح بومي درسًا قديمًا. */
const PAGES={home:'الصفحة الرئيسية',sec:'قائمة الدروس',lesson:'درس',quiz:'اختبار',review:'مراجعة',daily:'تحدي اليوم',mstart:'تمرين رياضيات',wnum:'كتابة الأرقام',
 courseLibrary:'مكتبة الكورس',courseModule:'وحدة من الكورس',courseViewer:'صفحة من الكورس',coursePractice:'تدريب الكورس',stories:'عالم القصص',story:'قصة',talk:'محادثة إنجليزية',
 listenTest:'اختبار استماع',readTest:'اختبار قراءة',games2d:'عالم الألعاب',g2levels:'مراحل لعبة',g2play:'لعبة',puzzles:'جزيرة الألغاز',riddles:'ألغاز',logic:'تفكير منطقي',
 measure:'القياس',wordProblems:'مسائل كلامية',advMath:'رياضيات متقدمة',advMul:'الضرب المتقدم',dictation:'إملاء',dictationAdv:'إملاء متقدم',syllables:'المقاطع',enTeach:'معلّم الإنجليزية',
 world:'عالم المغامرات',path:'مسار التعلم',parent:'الإعدادات',speak:'تدريب النطق',act:'الأنشطة'};
const clean=s=>String(s||'').replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D\u20E3]/gu,'').replace(/\s+/g,' ').trim();
/* سياق منظّم للصفحة الحالية: المادة، الكورس، المرحلة، الدرس، السؤال، الاختيارات، إجابة الطالب، التقدم، والنص الظاهر.
   يُقرأ من الصفحة نفسها لحظة الإرسال (لا من آخر درس فُتح)، فلا يجيب بومي بمحتوى صفحة سابقة. */
const SUBJ={ar:'اللغة العربية',en:'اللغة الإنجليزية',math:'الرياضيات'};
const HINT=/تلميح|ساعدني|hint|لا اعرف|لا أعرف|صعب/i;
/* أسئلة تشير إلى الصفحة الحالية: لا تُجاب من ذاكرة بومي ولا تُحفظ فيها (جوابها يخص صفحة بعينها) */
const DEIC=/هذا|هذه|هذي|السؤال|المسأل|الدرس|الصفحة|القصة|اللعبة|تلميح|ساعدني|لم\s*أفهم|ما\s*فهمت|this|hint/i;let hints={};
function pageCtx(){let fn='',args=[];try{const e=window.Router&&Router.entry();if(e){fn=e.fn;args=e.args||[]}}catch(e){} /* مدخل نافذة بومي يحمل اسم الصفحة نفسها */
 if(V=='game')fn='g2play'; /* الألعاب لا تمر عبر router فيبقى المدخل السابق */
 const page=PAGES[fn]||(V=='quiz'?'اختبار':V=='lesson'?'درس':'نشاط تعليمي'),A=document.getElementById('app'),q=s=>A&&A.querySelector(s),qa=s=>A?[...A.querySelectorAll(s)]:[];
 const head=clean((q('h2')||q('h1'))?.textContent).slice(0,80),I={page};let topic=head;
 const vis=el=>el&&el.offsetParent!==null;const nd=x=>clean(x).replace(/[\u064B-\u0652\u0670]/g,'');
 /* المادة والكورس والمرحلة والدرس */
 try{const st=S[+P.stage||0];I.stage=`${(+P.stage||0)+1} من ${S.length}: ${st.n} (${st.a} سنوات)`}catch(e){}
 try{const mq0=V=='quiz'&&qs&&qs[qi]&&String(qs[qi].k||'').startsWith('m-');
  if(mq0||/^(mstart|measure|wordProblems|advMath|advMul|wnum)$/.test(fn)){I.subject=SUBJ.math;if(window.MS)I.lesson=(mq0&&MS[qs[qi].k.slice(2)])||(fn=='mstart'&&MS[args[0]])||undefined}
  else if(/^course/.test(fn)&&window.COURSE_MODULES){const m=COURSE_MODULES.find(x=>x.id==args[0]);if(m){I.subject=SUBJ[m.lang]||'مواد مشتركة';I.course=m.title+(m.level!=null?' — المستوى '+m.level:'');const r=(m.resources||[]).find(x=>x.id==args[1]);if(r)I.lesson=r.title}}
  else if(fn=='g2play'&&cur&&cur.game){const g=(window.G2GAMES||[]).find(x=>x.id==cur.game.id)||cur.game;I.subject=SUBJ[g.cat]||'ألعاب تعليمية';I.lesson='لعبة: '+(g.name||'')}
  else if(cur&&cur.n&&(V=='quiz'&&qs&&qs[qi]||((V=='lesson'||/^(lesson|review|daily)$/.test(fn))&&nd(head).includes(nd(cur.n))))){ /* cur قد يبقى من صفحة سابقة: نستعمله فقط إن طابق عنوان الصفحة الظاهرة */I.subject=SUBJ[cur.l]||(cur.i&&cur.i[0]&&/[a-z]/i.test(cur.i[0][0])?SUBJ.en:SUBJ.ar);I.lesson=cur.n;topic=cur.n;
   if(cur.i&&!/^(pl|rv)$/.test(cur.id))I.words=cur.i.slice(0,8).map(x=>{const m=clean(x[1]);return m&&m!==x[0]?x[0]+' ('+m+')':x[0]}).join('، ')}}catch(e){}
 if(!I.lesson&&head)I.lesson=head;
 /* السؤال الحالي واختياراته وإجابة الطالب */
 const Q=q('.q')||q('.ct-quiz b')||q('.practice-prompt,.practice-q')||null;
 if(V=='quiz'&&qs&&qs[qi])I.question=strip(qs[qi].show)+(qs[qi].sp?' — يُسمع: '+(Array.isArray(qs[qi].sp)?qs[qi].sp[0]:qs[qi].sp):'');
 else if(vis(Q))I.question=clean(Q.innerText||Q.textContent).slice(0,200);
 const ins=qa('p.mut,.ac-tip,.practice-head p').filter(vis).map(x=>clean(x.innerText)).filter(x=>x&&!/^سؤال \S+ من/.test(x));if(ins.length)I.instructions=ins.slice(0,2).join(' / ').slice(0,160);
 let opts=qa('.opt').filter(vis).map(b=>({t:clean(b.innerText||b.textContent),ok:b.dataset.ok=='1',no:b.classList.contains('no'),dis:b.disabled}));
 if(!opts.length){const pq=window.CoursePracticeNow&&CoursePracticeNow();opts=qa('.practice-options button').filter(vis).map(b=>({t:clean(b.innerText),ok:!!pq&&clean(b.dataset.answer)===clean(pq.answer),no:b.classList.contains('bad')||b.classList.contains('no'),dis:b.disabled}))}
 if(!opts.length){const cq=qa('.ct-quiz').filter(vis)[0];if(cq){I.question=I.question||clean(cq.querySelector('b')?.innerText);opts=[...cq.querySelectorAll('.ct-opts button')].map(b=>({t:clean(b.innerText),ok:+b.dataset.k===+cq.dataset.a,no:b.classList.contains('no'),dis:b.disabled||!!cq.dataset.done}))}}
 opts=opts.filter(o=>o.t).slice(0,6);
 if(opts.length){I.choices=opts.map(o=>o.t);const answered=opts.some(o=>o.dis||o.no);const wrong=opts.find(o=>o.no);
  I.answered=answered;if(wrong)I.studentAnswer=wrong.t+' (خطأ)';else if(answered)I.studentAnswer='أجاب إجابة صحيحة';
  const c=opts.find(o=>o.ok);if(c)I._correct=c.t}
 const pr=qa('p.mut,.practice-count').map(x=>clean(x.innerText)).find(x=>/^(السؤال|سؤال) \S+ من \S+/.test(x));if(pr)I.progress=pr+(V=='quiz'&&typeof sc=='number'?' · صحيح حتى الآن: '+sc:'');
 /* النص التعليمي الظاهر (صفحة الكورس، القصة، النشاط) */
 const el=q('.ct-paper')||q('.story,.st-text,.story-text');if(vis(el))I.text=clean(el.innerText||el.textContent).slice(0,320);
 try{const b=window.BumiContext&&BumiContext();if(b&&b[0]&&!/^(g2hub|g2lv)$/.test(b[1])){const t=clean(b[0]).slice(0,160);if(!I.instructions||!t.includes(I.instructions.slice(0,20)))I.instructions=(I.instructions?I.instructions+' / ':'')+t}}catch(e){}
 const qk=I.question||I.lesson||page;
 const L=[['الصفحة',page],['المادة',I.subject],['الكورس',I.course],['مرحلة الطالب',I.stage],['الدرس/الوحدة',I.lesson],['كلمات الدرس',I.words],['السؤال الحالي',I.question],['التعليمات',I.instructions],
  ['الاختيارات',I.choices&&I.choices.map((x,k)=>'أبجد'[k]?('أبجده'[k]+') '+x):x).join('، ')],['إجابة الطالب',I.studentAnswer||(I.choices?'لم يُجب بعد':'')],['تقدم الطالب في النشاط',I.progress],['نص الصفحة',I.text]];
 const ctx=L.filter(x=>x[1]).map(x=>x[0]+': '+x[1]).join(' | ').slice(0,1100);
 return{fn,page,topic:String(topic||'').slice(0,60),ctx,qk,info:I}}
/* بلا إنترنت: جواب من معلومات الصفحة نفسها (شرح الدرس، إعادة السؤال، تلميح متدرّج) بدل الاعتذار */
function offlineCtx(m,pc,hintN){const I=pc.info||{};
 {const x=m.match(/اشرح الاختيار «(.+)»/);if(x)return `الاختيار «${x[1]}». ${I.question?'اقرأ السؤال: «'+I.question+'»، ثم فكّر: هل هذا الاختيار يناسبه؟':''} اضغط عليه لتسمعه 🔊`}
 if(HINT.test(m)||/السؤال|المسألة/.test(m)){if(!I.question)return null;
  if(I.answered&&I._correct)return `السؤال: ${I.question}. الجواب الصحيح: ${I._correct}. ${I.studentAnswer&&/خطأ/.test(I.studentAnswer)?'لا بأس، راجع الفكرة وجرّب السؤال التالي 💪':'أحسنت 🌟'}`;
  return hintN<=1?`اقرأ السؤال مرة أخرى بهدوء: «${I.question}» ${I.choices?'ثم قارن بين الاختيارات واحدًا واحدًا.':''} 🤔`
   :hintN==2?`تلميح: ${I.choices?'استبعد الاختيارات البعيدة عن السؤال أولًا، ثم فكّر في الباقي.':'ابدأ بالجزء الأسهل من السؤال.'} 🌱`
   :`فكّر في ${I.words?'كلمات الدرس: '+I.words:'ما تعلّمناه في هذا الدرس'}، ثم اختر الأقرب 🦉`}
 if(/اشرح|ما هذا|الدرس|الصفحة|مثال/.test(m)&&(I.words||I.text||I.lesson))
  return `نحن في ${I.lesson?'«'+I.lesson+'»':pc.page}${I.subject?' من '+I.subject:''}. ${I.words?'كلمات الدرس: '+I.words+'.':I.text?I.text.slice(0,200):''} اضغط على أي كلمة لتسمعها 🔊`;
 return null}
/* اقتراحات تناسب الصفحة الحالية + موضوعان عامّان */
function chipsFor(pc){const c=[];
 if(pc.fn=='quiz'||V=='quiz')c.push('أعطني تلميحًا','اشرح هذا السؤال');
 else if(/^(lesson|review|daily|courseViewer|coursePractice|enTeach)$/.test(pc.fn))c.push('اشرح هذا الدرس','أعطني مثالًا آخر');
 else if(/^(story|talk|listenTest|readTest)$/.test(pc.fn))c.push('ما معنى هذه القصة؟','اشرح كلمة صعبة');
 else if(/^(mstart|measure|wordProblems|advMath|advMul|wnum)$/.test(pc.fn))c.push('اشرح هذه المسألة خطوة خطوة');
 else if(/^(g2play|g2levels)$/.test(pc.fn))c.push('كيف ألعب هذه اللعبة؟');
 const t=localAI.topics();return c.concat(c.length?t.slice(0,3):t)}
function bomi(){if(chOwner!==P){ch=(P.chat||[]).slice(-60);chOwner=P}window.bmicStop&&bmicStop(1);document.getElementById('bm')?.remove();const pc=pageCtx(),ctx=pc.ctx;
const d=document.createElement('div');d.id='bm';d.className='bm';d.innerHTML=`<div class=bmh><b>🦉 بومي</b><small id=bnet class=bnet></small><button onclick="say.stop();bmicStop(1);document.getElementById('bm').remove()" aria-label="إغلاق">✕</button></div><div id=bl class=bl></div><div class=chips><button onclick="bex()">🎲 تمرين جديد</button><button onclick="bsend('لم أفهم، اشرح لي بطريقة أخرى')">🤔 لم أفهم</button>${chipsFor(pc).map(x=>`<button onclick="bsend(this.textContent)">${x}</button>`).join('')}</div><p id=bst class="bmic-state" aria-live="polite"></p><div class=bmi><input id=bi dir=auto placeholder="اكتب سؤالك…" onkeydown="event.key=='Enter'&&bsend()"><button onclick=bsend()>إرسال</button>${P.mic&&(window.SpeechRecognition||window.webkitSpeechRecognition)?'<button id=bmb onclick=bmic() aria-label="تحدث">🎤</button>':''}</div>`;
d.dataset.ctx=ctx;d.dataset.topic=pc.topic;d.dataset.page=pc.page;document.body.appendChild(d);netBadge();if(!ch.length)bpush('a','أهلاً! اسألني عن أي شيء في الدرس، أو اضغط «تمرين جديد» لأجهّز لك أسئلة 😊');else if(pc.topic&&pc.fn!='home')bpush('a','نحن الآن في '+pc.page+(pc.topic?': '+pc.topic:'')+'. اسألني عنه 🦉');else ch.forEach(m=>bpush(m.role=='user'?'u':'a',window.Tashkeel?Tashkeel.apply(m.content):m.content,1))}
/* اختيارات يضغطها الطالب بدل أن يكتب: تظهر تحت رسالة بومي، والضغط يرسل الاختيار */
function offer(list){const l=document.getElementById('bl');if(!l||!list||!list.length)return;const box=document.createElement('div');box.className='chips bm-offer';
 list.slice(0,4).forEach(o=>{const b=document.createElement('button');b.textContent=o;b.dir='auto';b.onclick=()=>{box.querySelectorAll('button').forEach(x=>x.disabled=true);b.classList.add('ok');bsend(o)};box.appendChild(b)});l.appendChild(box);l.scrollTop=l.scrollHeight}
/* بومي لم يفهم: يسأل «هل تقصد…» ويعطي اختيارات تناسب الصفحة الحالية */
function clarify(pc,offline){const I=(pc&&pc.info)||{},o=[];
 if(I.question){o.push('أعطني تلميحًا','اشرح هذا السؤال');if(I.choices)o.push('لم أفهم الخيارات')}
 if(I.words||/درس|كورس/.test((pc&&pc.page)||''))o.push('اشرح هذا الدرس');
 o.push(I.subject==='اللغة الإنجليزية'?'ما معنى كلمة إنجليزية؟':'اشرح قاعدة لغوية','مسألة حساب');
 bpush('a',shape(offline?'📴 لَا يُوجَدُ إِنْتَرْنِت، لَكِنْ أَسْتَطِيعُ مُسَاعَدَتَكَ فِي هَذِهِ الصَّفْحَةِ. اخْتَرْ مَا تُرِيدُ:':'لَمْ أَفْهَمْ سُؤَالَكَ تَمَامًا 🦉 هَلْ تَقْصِدُ وَاحِدًا مِنْ هَذِهِ؟ اخْتَرْ:'));offer([...new Set(o)])}
const CHO=/(لم|ما|مو|مش)\s*(أفهم|افهم|فهمت|فاهم).*(الخيار|الاختيار|الخيارات|الاختيارات)|^(اشرح|ما معنى)\s*(الخيارات|الاختيارات)/;
function bpush(w,t,nosave){const l=document.getElementById('bl');if(!l)return;const e=document.createElement('div');e.className='bb '+w;e.textContent=t;l.appendChild(e);l.scrollTop=l.scrollHeight;return e}
async function aiCall(body){const key=JSON.stringify([body.mode||'',body.message||'',body.topic||'',body.context||'']);if(AIC.has(key))return AIC.get(key);
 const task=(async()=>{const c=new AbortController(),tm=setTimeout(()=>c.abort(),14000);
 try{const r=await fetch('/.netlify/functions/tutor',{method:'POST',signal:c.signal,headers:{'content-type':'application/json'},body:JSON.stringify({name:P.name,age:P.age,profile:profile(),...body})});
 if(r.status==429)return{err:'busy'};if(!r.ok)return{err:'fail'};return await r.json()}catch(e){return{err:'net'}}finally{clearTimeout(tm);setTimeout(()=>AIC.delete(key),1200)}})();AIC.set(key,task);return task}
let busy=0;const AIC=new Map();
const think=()=>{window.MC&&MC.mood('think',12000)};const unthink=ok=>{window.MC&&MC.mood(ok?'happy':'oops',ok?900:1200)};
const onl=()=>navigator.onLine!==false,shape=t=>{const x=window.Tashkeel?Tashkeel.apply(t):t;return window.studentGenderText?window.studentGenderText(x):x};
const OFFMSG='لا يوجد إنترنت الآن 📴 ولا أعرف جواب هذا السؤال بعد. جرّب «تمرين جديد» أو اسألني عن شيء سبق أن تعلّمناه، وسأتعلّم أكثر عندما يعود الإنترنت 🦉';
function netBadge(){const e=document.getElementById('bnet');if(e)e.textContent=(onl()?'🟢':'📴 بلا إنترنت')+' · 🧠 '+(window.Brain?Brain.count():0)}
addEventListener('online',netBadge);addEventListener('offline',netBadge);
const keep=()=>{P.chat=ch.slice(-60);save()}; /* ذاكرة المحادثة: آخر ٦٠ رسالة محفوظة لكل طالب */
function serve(m,r,note){r=shape(r);ch.push({role:'user',content:m},{role:'assistant',content:r});ch=ch.slice(-60);keep();bpush('a',(note||'')+r);if(!muted())say(r.slice(0,360),'ar');netBadge()}
/* بثّ الإجابة: تصل على دفعات فتُعرض وتُنطق تدريجيًا. إن لم تتوفر الدالة تعود الطريقة العادية. */
async function aiStream(body,onText){aiStream.c&&aiStream.c.abort();const c=aiStream.c=new AbortController();let tm=setTimeout(()=>c.abort(),16000),all='';
 try{const r=await fetch('/.netlify/functions/tutor-stream',{method:'POST',signal:c.signal,headers:{'content-type':'application/json'},body:JSON.stringify({name:P.name,age:P.age,profile:profile(),...body})});
  if(r.status==429)return{err:'busy'};if(!r.ok||!r.body)return{err:'nostream'};
  const rd=r.body.getReader(),dc=new TextDecoder();
  for(;;){const{done,value}=await rd.read();if(done)break;const x=dc.decode(value,{stream:true});if(x){clearTimeout(tm);tm=setTimeout(()=>c.abort(),12000);all+=x;onText(x,all)}}
  return all.trim()?{reply:all.trim()}:{err:'nostream'}}
 catch(e){return all.trim()?{reply:all.trim()}:{err:'nostream'}}finally{clearTimeout(tm)}}
async function bsend(t){window.bmicStop&&bmicStop(1);const i=document.getElementById('bi'),m=(typeof t=='string'?t:i&&i.value||'').trim();if(!m||busy)return;if(i)i.value='';bpush('u',m);
/* السياق يُقرأ من الصفحة لحظة الإرسال: إن انتقل الطالب لدرس آخر لا يُستعمل الدرس السابق */
const pc=pageCtx(),bmE=document.getElementById('bm');if(bmE){bmE.dataset.ctx=pc.ctx;bmE.dataset.topic=pc.topic;bmE.dataset.page=pc.page}
const wantHint=HINT.test(m);if(wantHint)hints[pc.qk]=(hints[pc.qk]||0)+1;const hintN=hints[pc.qk]||0;
if(CHO.test(m)&&pc.info&&pc.info.choices&&pc.info.choices.length){const t=shape('هَذِهِ هِيَ الِاخْتِيَارَاتُ 👇 اضْغَطْ عَلَى أَيِّ اخْتِيَارٍ لِأَشْرَحَهُ لَكَ:');ch.push({role:'user',content:m},{role:'assistant',content:t});keep();bpush('a',t);if(!muted())say(t,'ar');offer(pc.info.choices.map(x=>'اشرح الاختيار «'+x+'»'));return}
const lo=localAI.think(m,pc.ctx);if(lo){const tx=shape(lo.t);ch.push({role:'user',content:m},{role:'assistant',content:tx});ch=ch.slice(-60);keep();bpush('a',tx);if(!muted())say(tx.slice(0,320),'ar',lo.en?()=>say(lo.en,'en'):null);return}
const again=AGAIN.test(m),ctx=pc.ctx;
/* 1) ذاكرة بومي: سؤال سبق جوابه ← إجابة فورية بلا إنترنت وبلا طلب */
const deic=DEIC.test(m);
if(!again&&!deic&&window.Brain){const k=Brain.find(m,ctx,.8);if(k)return serve(m,k.a)}
/* 2) بلا إنترنت: أقرب جواب محفوظ، وإلا اعتذار لطيف */
if(!onl()){const k=!again&&!deic&&window.Brain&&Brain.find(m,ctx,.72);if(k)return serve(m,k.a,'📴 ');const o=offlineCtx(m,pc,hintN);return o?serve(m,o,'📴 '):clarify(pc,true)}
if(aiLeft()<=0)return bpush('a',LIM_MSG);
busy=1;aiUse().n++;save();think();
const w=bpush('a','');w.classList.add('think');w.innerHTML='<span class=dots><i></i><i></i><i></i></span> بومي تفكّر…';
const sp=muted()?null:say.stream('ar'),body={message:m,history:ch.slice(-8),again,context:ctx,page:pc.page,hint:wantHint?hintN:0,answered:!!pc.info.answered,
  /* الإجابة الصحيحة تُرسل للمعلّم فقط بعد أن يجيب الطالب أو يطلب تلميحًا ثانيًا، كي لا يكشفها مبكرًا */
  correct:(pc.info.answered||hintN>=2)&&pc.info._correct||'',recall:window.Brain?Brain.recent(8):[]};let shown=false;
let d=await aiStream(body,(x,all)=>{if(!shown){shown=true;w.classList.remove('think')}w.textContent=all;const l=document.getElementById('bl');l&&(l.scrollTop=l.scrollHeight);sp&&sp.push(x)});
if(d.err=='nostream'&&!shown){d=await aiCall(body);if(d.reply){w.classList.remove('think');w.textContent=d.reply;sp&&sp.push(d.reply.slice(0,360))}}
w.classList.remove('think');
if(d.reply){sp&&sp.end();const tx=shape(d.reply);ch.push({role:'user',content:m},{role:'assistant',content:tx});ch=ch.slice(-60);keep();
 /* أسطر تبدأ بـ «•» = اختيارات يعرضها بومي: تصير أزرارًا */
 const BL=/^\s*[•▪◦\-–]\s+/,lines=tx.split('\n'),ops=lines.filter(x=>BL.test(x)).map(x=>x.replace(BL,'').trim()).filter(Boolean);
 w.textContent=ops.length?lines.filter(x=>!BL.test(x)).join('\n').trim():tx;if(ops.length)offer(ops);
 if(!again&&!deic){window.Brain&&Brain.learn(m,tx,ctx,P.name)} /* بومي الداخلية تتعلّم من الخارجية */
 window.Tashkeel&&Tashkeel.learn(d.reply);unthink(1)}
else{sp&&say.stop();aiUse().n=Math.max(0,aiUse().n-1);save(); /* لا نخصم من الحدّ اليومي عند الفشل */
 const k=!again&&!deic&&window.Brain&&Brain.find(m,ctx,.72),o=!k&&offlineCtx(m,pc,hintN);
 if(k||o){w.remove();serve(m,k?k.a:o,'📴 ')}
 else if(d.err=='busy')w.textContent='أنا أحتاج استراحة صغيرة 😴 جرّب بعد دقيقة.';else{w.remove();clarify(pc,!onl())}unthink(!!k)}
busy=0;netBadge()}
/* تمارين يولّدها الذكاء الاصطناعي حسب الموضوع المكتوب أو الدرس الحالي أو أضعف مهارة */
/* تمارين محلية (بلا إنترنت أو إذا تعذّر الذكاء الخارجي): من كلمات الدرس الحالي، أو دروس مرحلة الطالب والدروس التي أتقنها.
   الخيارات دائمًا من الدرس نفسه كي تكون متجانسة (صور مع صور، معانٍ مع معانٍ) */
function localEx(){const units=[],add=u=>{if(u&&u.i){const its=[],seen=new Set();u.i.forEach(it=>{const k=it&&String(it[1]||'').trim();if(it&&it[0]&&k&&!seen.has(k)){seen.add(k);its.push(it)}});if(its.length>=4)units.push(its)}};
 try{if(cur&&cur.i)add(cur)}catch(e){}
 if(!units.length)try{Object.keys(P.done||{}).forEach(id=>{try{add(find(id))}catch(e){}});(S[+P.stage||0]||S[0]).u.forEach(add)}catch(e){}
 if(!units.length)return null;const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
 const U=units[0===units.length-1?0:Math.floor(Math.random()*Math.min(units.length,cur&&cur.i?1:units.length))];
 return sh(U).slice(0,3).map(it=>{const o=sh([it,...sh(U.filter(x=>x!==it)).slice(0,3)]),pic=!/[\p{L}\p{N}]/u.test(String(it[1]));
  return{q:pic?`أين صورة «${it[0]}»؟`:`ما معنى «${it[0]}»؟`,o:o.map(x=>String(x[1])),a:o.indexOf(it),w:pic?`الصورة الصحيحة هي ${it[1]}`:`«${it[0]}» معناها: ${it[1]}`}})}
async function bex(){if(busy)return;const i=document.getElementById('bi'),bm=document.getElementById('bm'),topic=(i&&i.value.trim())||bm?.dataset.topic||bm?.dataset.ctx||profile().weak[0]||'';if(i)i.value='';
if(aiLeft()<=0&&onl())return bpush('a',LIM_MSG);if(onl()){aiUse().n++;save()}
busy=1;think();const w=bpush('a','أجهّز لك تمارين جديدة ✍️…');w.classList.add('think');let d=onl()?await aiCall({mode:'exercise',topic}):{err:'net'};if(d.items&&window.Brain)Brain.exLearn(topic,d.items);else if(window.Brain){const f=Brain.exFind(topic);if(f)d={items:f}}if(!d.items){const L=localEx();if(L)d={items:L}}busy=0;w.classList.remove('think');unthink(!!d.items);
if(!d.items){w.textContent=d.err=='busy'?'أنا أحتاج استراحة صغيرة 😴 جرّب بعد دقيقة.':'لم أستطع تجهيز التمارين الآن 🦉 جرّب بعد قليل، أو اختر درسًا من القائمة.';return}
w.textContent='هيا نتدرّب'+(topic?' على: '+topic:'')+' 💪';runEx(d.items,0,0,topic)}
function runEx(L,i,s,topic){if(!document.getElementById('bl'))return;
if(i>=L.length){P.star+=s;save();const m=s==L.length?'ممتاز! أجبت عن الكل بشكل صحيح 🌟':(s===0?`لا بأس! لم تكن الإجابات صحيحة هذه المرة 💪 سنتدرّب عليها معًا خطوة خطوة`:`أحسنت! أجبت صحيحًا عن ${s} من ${L.length} 💪 ونتدرّب أكثر معًا`);bpush('a',m);window.MC&&MC.mood(s>=2?'happy':'oops',1800);if(!muted())say(m.replace(/[🌟💪]/g,''),'ar',null,'cheer');return}
const q=L[i];q.q=shape(q.q);q.o=q.o.map(shape);q.w=shape(q.w||'');bpush('a',`(${i+1}/${L.length}) ${q.q}`);if(!muted()&&i==0)say(q.q,'ar');
const box=document.createElement('div');box.className='chips';
q.o.forEach((o,j)=>{const b=document.createElement('button');b.textContent=o;b.dir='auto';b.onclick=()=>{box.querySelectorAll('button').forEach(x=>x.disabled=true);const ok=j==q.a;b.classList.add(ok?'ok':'no');
const k='ai:'+String(topic||q.q).slice(0,24),sk=P.sk[k]=P.sk[k]||{n:0,m:0};sk.n++;sk.t=Date.now();if(ok)sk.m=Math.max(0,sk.m-1);else{sk.m++;sk.e=(sk.e||0)+1}save();
const m=ok?pk(OKS.ar):'لا بأس 🌱 '+(q.w||'');bpush('a',m);window.MC&&MC.mood(ok?'happy':'oops',1200);if(!muted())say(m.replace(/[🌱]/g,''),'ar',null,ok?'happy':'soft');setTimeout(()=>runEx(L,i+1,s+ok,topic),ok?700:1250)};box.appendChild(b)});
const l=document.getElementById('bl');l.appendChild(box);l.scrollTop=l.scrollHeight}
const pickc=()=>{const a=localAI.topics();return a[Math.floor(Math.random()*a.length)]};
let BMIC=null;
const bmicText=t=>{const e=document.getElementById('bst');if(e)e.textContent=t||''};
window.bmicStop=function(quiet){const s=BMIC;if(!s)return;BMIC=null;try{s.rec.stop()}catch(e){}const b=document.getElementById('bmb');if(b){b.textContent='🎤';b.classList.remove('bmic-listen')}bmicText('');window.MC&&MC.mood('tilt',quiet?300:700)};
window.bmic=function(){if(BMIC)return bmicStop();if(!P||!P.mic)return bpush('a','يحتاج تشغيل الميكروفون من لوحة ولي الأمر أولًا.');const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return bpush('a','هذا المتصفح لا يدعم التحدث المباشر. جرّب Chrome أو Edge.');say.stop();const rec=new R(),lang=P.lang==='en'?'en-US':'ar-OM';let final='';BMIC={rec};rec.lang=lang;rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=3;
 const b=document.getElementById('bmb');if(b){b.textContent='⏹';b.classList.add('bmic-listen')}bmicText('🎧 بومي تستمع… تكلّم الآن');window.MC&&MC.mood('listen',9000);
 rec.onresult=e=>{const row=e.results[e.results.length-1],heard=[...row].map(x=>x.transcript).filter(Boolean);if(heard[0]){final=heard[0];const i=document.getElementById('bi');if(i)i.value=final;bmicText('🗣️ '+final)}if(row.isFinal){bmicStop(1);bsend(final)}};
 rec.onerror=e=>{const msg=e.error==='not-allowed'||e.error==='service-not-allowed'?'لم يُسمح للمتصفح بالميكروفون. اسمح به ثم حاول مرة أخرى.':e.error==='no-speech'?'لم أسمع كلامًا، حاول مرة أخرى.':'تعذّر الاستماع الآن، حاول مرة أخرى.';bmicStop(1);bpush('a',msg)};
 rec.onend=()=>{if(BMIC&&BMIC.rec===rec){BMIC=null;if(!final)bmicText('انتهى الاستماع. اضغط الميكروفون للمحاولة مرة أخرى.');const x=document.getElementById('bmb');if(x){x.textContent='🎤';x.classList.remove('bmic-listen')}}};try{rec.start()}catch(e){bmicStop(1);bpush('a','تعذّر تشغيل الميكروفون الآن.')}};
const NOASK=/^(setup|who|g2play|speedGame)$/;
const oh=h;h=x=>{oh(x);let fn='';try{const e=window.Router&&Router.entry();fn=e?e.fn:''}catch(e){}if(window.P&&V!='setup'&&V!='who'&&V!='game'&&!NOASK.test(fn)&&!app.querySelector('.ask'))app.insertAdjacentHTML('beforeend','<button class=ask onclick=bomi()>🦉 اسأل بومي</button>')};
