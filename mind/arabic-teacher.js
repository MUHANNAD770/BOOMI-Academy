/* mind/arabic-teacher.js — «المعلّم» في أكاديمية العربية (طلب صاحب المشروع: مثل معلّم الإنجليزية):
   • «تعلّم كلمات جديدة مع المعلّم»: كلمة بصورتها ← اسمع وكرّر (أو انطقها بالميكروفون) ← اختر صورتها ← اقرأها واخترها مكتوبة.
   • «مراجعة ذكية للكلمات»: الكلمات التي لم تُتقن بعد، أو صعب نطقها، أو حان موعد مراجعتها (تكرار متباعد: ١ ← ٣ ← ٧ ← ١٤ يومًا).
   • الكلمات من دروس العربية في مرحلة الطالب والتي بعدها (الكلمات ذات الصور)، والخطأ يعيد الكلمة في آخر الجلسة.
   • لكل كلمة فهم (m) ونطق (p) في P.arw، ويُزامَن؛ وكل إجابة تصل لعقل بومي (Mind.record). */
window.ArCoach=(()=>{'use strict';
const DAY=864e5,now=()=>Date.now(),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sh=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},pick=a=>a[Math.floor(Math.random()*a.length)];
const PIC=/\p{Extended_Pictographic}/u,strip=s=>String(s||'').replace(/[ً-ْٰ]/g,'').trim();
const GT=t=>window.studentGenderText?studentGenderText(t):t;
const D=()=>{const P0=window.P;if(!P0)return null;const d=P0.arw=P0.arw||{};d.w=d.w||{};return d};
const W=k=>{const d=D();return d.w[k]=d.w[k]||{m:[0,0],p:[0,0]}};
const okM=s=>s&&s.m[1]>=2&&s.m[1]/s.m[0]>=.65,okP=s=>s&&s.p[1]>=1&&s.p[1]/s.p[0]>=.5,hardP=s=>s&&s.p[0]>=2&&s.p[1]/s.p[0]<.5;
const GAP=[1,3,7,14,30];
function rec(k,kind,ok){const s=W(k);s[kind][0]++;if(ok)s[kind][1]++;s.t=now();
 if(kind==='m'){s.lv=ok?Math.min((s.lv||0)+1,GAP.length):0;s.due=now()+(ok?GAP[s.lv-1]*DAY:0)}
 try{window.Mind&&Mind.record({ok,subject:'ar',topic:'كلمات المعلّم',src:'معلّم العربية',go:"arTeach('review')"})}catch(e){}
 try{save()}catch(e){}}
function stats(){const d=D();if(!d)return{K:0,Pn:0};const v=Object.values(d.w);return{K:v.filter(okM).length,Pn:v.filter(okP).length}}
/* الكلمات: دروس العربية حتى المرحلة التالية لمرحلة الطالب، كلمة (أو كلمتان) لها صورة */
function pool(){const out=[],seen=new Set(),st=window.P?(+P.stage||0):0;
 (typeof S!=='undefined'?S:[]).forEach((s,a)=>{if(a>st+1)return;s.u.forEach(u=>{if(u.l!=='ar')return;(u.i||[]).forEach(it=>{const w=it[0],e=it[1];
  if(!w||!PIC.test(e||'')||w.split(/\s+/).length>2)return;const k=strip(w);if(seen.has(k))return;seen.add(k);out.push({w,k,e,st:a})})})});return out}
function pickWords(mode){const d=D(),P0=pool(),n=4;
 if(mode==='review'){return P0.map(x=>{const s=d.w[x.k];if(!s)return null;const sc=(okM(s)?0:2)+(hardP(s)?1.5:0)+((s.due||0)<now()?1:0)+Math.random()*.3;return sc>.5?[x,sc]:null})
  .filter(Boolean).sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0])}
 /* جديدة: لم يرها بعد، من مرحلته أولًا */
 const st=window.P?(+P.stage||0):0;return P0.filter(x=>!d.w[x.k]).sort((a,b)=>(Math.abs(a.st-st)-Math.abs(b.st-st))).slice(0,n)}
const SR=()=>window.SpeechRecognition||window.webkitSpeechRecognition,micOK=()=>!!(window.P&&P.mic&&SR());
function speak(L,cb){if(window.P&&P.snd===0){cb&&setTimeout(cb,300);return}try{(window.sayList&&L.length>1)?sayList(L):say(L[0][0],L[0][1]||'ar',cb)}catch(e){}}
let T=null,REC=null;
const card=x=>`<div class="enx artx">${x}</div>`;
const head=()=>`<section class="sec enteach arteach"><button class=link onclick="sec('ar')">← أكاديمية العربية</button><h2>👩‍🏫 معلّم العربية${T.mode==='review'?' — مراجعة':''}</h2><div class=bar><div style="width:${Math.round(T.i/T.L.length*100)}%"></div></div><p class=mut>كَلِمَةٌ ${T.i+1} مِنْ ${T.L.length}</p>`;
const fb=(t,l)=>{const e=document.getElementById('arfb');if(e)e.textContent=t;speak([[t,l||'ar']])};
function arTeach(mode){window.V='lesson';mode=mode==='review'?'review':'new';if(!D())return;const L=pickWords(mode);
 T={mode,L,i:0,good:0,again:[]};
 if(!L.length){h(`<section class="sec enteach arteach"><button class=link onclick="sec('ar')">← أكاديمية العربية</button><h2>👩‍🏫 معلّم العربية</h2>${card(`<p>${mode==='review'?'لا توجد كلمات للمراجعة الآن 🌟':'انتهت كل كلمات هذه المرحلة 🌟'}</p>`)}<button class=big onclick="arTeach('${mode==='review'?'new':'review'}')">${mode==='review'?'👩‍🏫 كلمات جديدة':'🔁 مراجعة ذكية'}</button></section>`);
  speak([[mode==='review'?'لَا تُوجَدُ كَلِمَاتٌ لِلْمُرَاجَعَةِ الْآنَ. '+GT('أَحْسَنْتَ!'):GT('أَحْسَنْتَ!')+' انْتَهَتْ كَلِمَاتُ هَذِهِ الْمَرْحَلَةِ.','ar']]);return}
 step('intro')}
function step(s){T.s=s;const x=T.L[T.i];if(!x)return done();
 if(s==='intro'){h(head()+card(`<div class=enpic>${x.e}</div><div class="enword arword">${esc(x.w)}</div><div class=enrow><button class=alt onclick="ArCoach._say()">🔊 اسمع الكلمة</button></div>`)+
   `<button class=big onclick="ArCoach._go('pron')">التالي: أنطقها ▶</button></section>`);
  speak([[GT('كَلِمَةٌ جَدِيدَةٌ.'),'ar'],[x.w,'ar']]);return}
 if(s==='pron'){const can=micOK();T.pt=0;
  h(head()+card(`<div class=enpic>${x.e}</div><div class="enword arword">${esc(x.w)}</div><p id=arfb class=mut aria-live=polite>${GT(can?'اسْتَمِعْ ثُمَّ اضْغَطْ 🎤 وَقُلِ الْكَلِمَةَ.':'اسْتَمِعْ وَكَرِّرِ الْكَلِمَةَ بِصَوْتِكَ.')}</p>
   <div class=enrow><button class=alt onclick="ArCoach._say()">🔊 اسمع</button>${can?`<button id=armic class=big onclick="ArCoach._mic()">🎤 قلها</button>`:''}</div>`)+`<button class=alt onclick="ArCoach._go('mean')">${can?'تخطَّ ▶':'كرّرتها ▶'}</button></section>`);
  speak([[GT('قُلْ مَعِي:'),'ar'],[x.w,'ar']]);return}
 if(s==='mean'){const others=sh(pool().filter(y=>y.k!==x.k&&y.e!==x.e)).slice(0,2);T.opts=sh([x,...others]);
  h(head()+card(`<p class=enq>${GT('أَيْنَ صُورَةُ')} «${esc(x.w)}»؟</p><div class="grid engrid">${T.opts.map((o,j)=>`<button class=opt data-j=${j} onclick="ArCoach._pick(${j},this)"><span class=enpic2>${o.e}</span></button>`).join('')}</div><p id=arfb class=mut aria-live=polite></p>`)+`</section>`);
  speak([[GT('أَيْنَ صُورَةُ'),'ar'],[x.w,'ar']]);return}
 if(s==='read'){const others=sh(pool().filter(y=>y.k!==x.k&&y.e!==x.e)).slice(0,2);T.opts=sh([x,...others]);
  h(head()+card(`<div class=enpic>${x.e}</div><p class=enq>${GT('اقْرَأْ وَاخْتَرِ الْكَلِمَةَ الْمُنَاسِبَةَ لِلصُّورَةِ.')}</p><div class="grid engrid">${T.opts.map((o,j)=>`<button class="opt arword" data-j=${j} onclick="ArCoach._pick(${j},this)">${esc(o.w)}</button>`).join('')}</div><p id=arfb class=mut aria-live=polite></p>`)+`</section>`);
  speak([[GT('اقْرَأْ وَاخْتَرِ الْكَلِمَةَ الْمُنَاسِبَةَ لِلصُّورَةِ.'),'ar']]);return}
 if(s==='next'){T.i++;if(T.i>=T.L.length&&T.again.length){T.L.push(...T.again);T.again=[]}return T.i>=T.L.length?done():step('intro')}}
function done(){const n=T.L.length,g=T.good;try{P.star=(+P.star||0)+g;save()}catch(e){}const st=stats();
 const m=GT('أَحْسَنْتَ!')+(g>=n?' انْتَهَى دَرْسُ الْكَلِمَاتِ.':' سَنُرَاجِعُ الْكَلِمَاتِ الصَّعْبَةَ مَعًا لَاحِقًا.');
 h(`<section class="sec enteach arteach"><h2>🌟</h2>${card(`<p>${esc(m)}</p><p class=mut>⭐ +${g} · ${st.K} كلمة فهمتها · ${st.Pn} كلمة تنطقها</p>`)}<button class=big onclick="arTeach('new')">👩‍🏫 كلمات جديدة</button><button class=alt onclick="arTeach('review')">🔁 مراجعة ذكية</button><button class=alt onclick="sec('ar')">📖 أكاديمية العربية</button></section>`);
 speak([[m,'ar']]);try{window.MC&&MC.mood(g>=n?'proud':'happy',1800)}catch(e){}}
const api={
 _say(){const x=T&&T.L[T.i];if(x)speak([[x.w,'ar']])},
 _go(s){try{say.stop()}catch(e){}step(s)},
 _pick(j,btn){const x=T.L[T.i],ok=T.opts[j]===x;document.querySelectorAll('.engrid .opt').forEach(b=>{b.disabled=true;if(T.opts[+b.dataset.j]===x)b.classList.add('ok')});if(!ok)btn.classList.add('no');
  rec(x.k,'m',ok);try{HurufiSound.play(ok?'correct':'wrong')}catch(e){}
  if(ok){if(T.s==='read')T.good++;fb(GT(pick(['أَحْسَنْتَ!','صَحِيحٌ!','مُمْتَازٌ!'])));setTimeout(()=>step(T.s==='mean'?'read':'next'),1300)}
  else{/* خطأ: نريه الصحيح، والكلمة تعود في آخر الجلسة ليصحّح خطأه */if(!T.again.includes(x))T.again.push(x);
   fb(GT('لَا بَأْسَ، انْظُرْ إِلَى الْجَوَابِ الصَّحِيحِ. سَنُعِيدُ هَذِهِ الْكَلِمَةَ.'));setTimeout(()=>step(T.s==='mean'?'read':'next'),2800)}},
 _mic(){const x=T.L[T.i],b=document.getElementById('armic');if(REC){try{REC.stop()}catch(e){}return}const C=SR();if(!C)return;try{say.stop()}catch(e){}
  const r=new C();REC=r;r.lang='ar-SA';r.maxAlternatives=5;r.interimResults=false;if(b)b.textContent='⏹ أسمعك…';try{window.MC&&MC.mood('listen',6000)}catch(e){}
  r.onresult=e=>{const alts=[...e.results[0]].map(a=>a.transcript);let ok=false;try{ok=window.judge?!!judge(alts,x.w).ok:alts.some(a=>strip(a)===x.k)}catch(_){}
   rec(x.k,'p',ok);T.pt++;
   if(ok){fb(GT(pick(['مُمْتَازٌ! نُطْقُكَ صَحِيحٌ.','رَائِعٌ! أَحْسَنْتَ النُّطْقَ.'])));setTimeout(()=>step('mean'),1700)}
   else{fb(GT(T.pt>=3?'لَا بَأْسَ، سَنَتَدَرَّبُ عَلَيْهَا لَاحِقًا.':'اسْمَعْ جَيِّدًا وَحَاوِلْ مَرَّةً أُخْرَى.'));if(T.pt>=3)setTimeout(()=>step('mean'),2400);else setTimeout(()=>api._say(),1600)}};
  r.onerror=e=>fb(GT(e.error==='no-speech'?'لَمْ أَسْمَعْ صَوْتًا، حَاوِلْ مَرَّةً أُخْرَى.':'تَعَذَّرَ الِاسْتِمَاعُ الْآنَ.'));
  r.onend=()=>{REC=null;const b2=document.getElementById('armic');if(b2)b2.textContent='🎤 قلها'};try{r.start()}catch(e){REC=null}}};
/* البطاقتان في أكاديمية العربية */
function decorate(){try{if(!window.P||window.V!=='sec'||window.CS!=='ar')return;const app=document.getElementById('app');if(!app||app.querySelector('.arhub'))return;const h2=app.querySelector('.sec h2')||app.querySelector('h2');if(!h2)return;const st=stats();
 h2.insertAdjacentHTML('afterend',`<div class="enhub enx arhub"><p class=mut>مُعَلِّمُ الْعَرَبِيَّةِ: كَلِمَاتٌ جَدِيدَةٌ بِالصُّوَرِ، وَمُرَاجَعَةٌ ذَكِيَّةٌ لَهَا.</p>
  <div class=list><button class=row onclick="arTeach('new')"><span>👩‍🏫</span><b>تعلّم كلمات جديدة مع المعلّم</b><small>${st.K} كلمة فهمتها</small></button><button class=row onclick="arTeach('review')"><span>🔁</span><b>مراجعة ذكية للكلمات</b><small>${st.Pn} كلمة تنطقها</small></button></div></div>`)}catch(e){}}
function hookH(){const oh=window.h;if(typeof oh!=='function'||oh.__ar)return;const f=function(){const r=oh.apply(this,arguments);decorate();return r};f.__ar=1;Object.keys(oh).forEach(k=>{try{f[k]=oh[k]}catch(e){}});h=f}
window.arTeach=arTeach;
hookH();addEventListener('load',()=>{hookH();setTimeout(hookH,600)});
return Object.assign(api,{stats,pool,arTeach});
})();
