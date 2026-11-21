/* lfocus.js — شاشة الدرس كما في التصميم: بطاقة واحدة في كل مرة.
   • شريط علوي: 🏠 + اسم الدرس + شريط تقدّم «١/١٢» ⭐
   • بطاقة كبيرة: الحرف (إن كان درس حروف) والصورة والكلمة
   • «استمع إلى الصوت» 🔊 + ميكروفون كبير «اقرأ الكلمة» (بموافقة ولي الأمر) + «السابق» و«التالي»
   • شبكة كل البطاقات والتمارين الأصلية تبقى كما هي تحت «عرض كل البطاقات» — لا يُحذف شيء.
   • بعد آخر بطاقة: زر الاختبار. */
(()=>{
 'use strict';
 const AD='٠١٢٣٤٥٦٧٨٩',D=n=>String(n).replace(/\d/g,d=>AD[d]),esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const F={i:0,id:null,rec:null};
 const items=()=>(window.cur&&Array.isArray(cur.i)?cur.i:[]).filter(x=>Array.isArray(x)&&x[0]);
 const girl=()=>window.P&&P.gender==='female';
 const isPic=v=>v&&!/[\p{L}\p{N}]/u.test(String(v)); /* صورة (رمز) لا نص */
 const lang=x=>x[2]||(/[؀-ۿ]/.test(x[0])?'ar':'en');
 const letterOf=x=>{const w=String(x[0]).replace(/[ً-ْٰ]/g,'');return window.cur&&cur.k?w[0]:''};
 function card(){const L=items(),n=L.length;if(!n)return'';const k=Math.max(0,Math.min(F.i,n-1)),x=L[k],pic=isPic(x[1]),l=lang(x),lt=letterOf(x);
  const mic=window.P&&P.mic&&(window.SpeechRecognition||window.webkitSpeechRecognition);
  return `<div class=lf-top><button class=lf-home onclick="home()" aria-label="الرئيسية">🏠</button><b class=lf-title>${esc(cur.n)}</b>
   <div class=lf-prog><i style="width:${Math.round((k+1)/n*100)}%"></i></div><span class=lf-cnt>${D(k+1)}/${D(n)} ⭐</span></div>
  <div class=lf-body>
   <div class=lf-card onclick="lfSay()">
    ${lt?`<div class=lf-letter>${esc(lt)}</div>`:''}
    <div class="lf-pic${lt?'':' lf-pic-big'}">${pic?esc(x[1]):'📖'}</div>
    <div class=lf-word dir=auto>${esc(x[0])}</div>${!pic&&x[1]?`<div class=lf-mean dir=auto>${esc(x[1])}</div>`:''}
   </div>
   <div class=lf-side>
    <button class=lf-listen onclick="lfSay()"><span>🔊</span><b>${girl()?'اِسْتَمِعِي':'اِسْتَمِعْ'} إِلَى الصَّوْتِ</b></button>
    ${mic?`<button class=lf-mic id=lf-mic onclick="lfMic()" aria-label="اقرأ الكلمة">🎤</button><small class=lf-mic-t id=lf-mic-t>${girl()?'اِضْغَطِي وَاقْرَئِي الْكَلِمَةَ':'اِضْغَطْ وَاقْرَأِ الْكَلِمَةَ'}</small>`:''}
    <div class=lf-nav><button class=lf-prev onclick="lfGo(-1)" ${k===0?'disabled':''}>‹ السَّابِقُ</button>
     ${k<n-1?`<button class=lf-next onclick="lfGo(1)">التَّالِي ›</button>`:`<button class="lf-next lf-done" onclick="lfQuiz()">${girl()?'اِبْدَئِي':'اِبْدَأِ'} الِاخْتِبَارَ ✨</button>`}</div>
   </div>
  </div>`}
 const draw=()=>{const e=document.getElementById('lf');if(e)e.innerHTML=card()};
 window.lfSay=()=>{const x=items()[F.i];if(x)try{say(x[0],lang(x))}catch(e){}};
 window.lfGo=d=>{const n=items().length;F.i=Math.max(0,Math.min(n-1,F.i+d));draw();setTimeout(lfSay,120)};
 window.lfQuiz=()=>{const b=[...document.querySelectorAll('#app button.big')].find(e=>/quiz\(\)/.test(e.getAttribute('onclick')||''));if(b)b.click();else if(typeof quiz==='function')quiz()};
 window.lfAll=()=>{const g=document.getElementById('lf-all');if(!g)return;g.open=!g.open;if(g.open)g.scrollIntoView({behavior:'smooth',block:'start'})};
 /* الميكروفون: يستمع للكلمة ويقيّمها بالمصحّح الموجود (mic.js: judge) */
 window.lfMic=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition,x=items()[F.i],b=document.getElementById('lf-mic'),t=document.getElementById('lf-mic-t');if(!R||!x)return;
  if(F.rec){try{F.rec.stop()}catch(e){}return}try{say.stop()}catch(e){}
  const r=new R();F.rec=r;r.lang=lang(x)==='en'?'en-US':'ar-SA';r.maxAlternatives=4;r.interimResults=false;b&&b.classList.add('on');t&&(t.textContent='🎧 …');
  r.onresult=e=>{const alts=[...e.results[0]].map(a=>a.transcript);let j={ok:0};try{j=window.judge?judge(alts,x[0]):{ok:alts.some(a=>a.trim())}}catch(er){}
   const m=j.ok?(girl()?'أَحْسَنْتِ! 🌟':'أَحْسَنْتَ! 🌟')+(j.tip?' '+j.tip:''):(j.msg||'حَاوِلْ مَرَّةً أُخْرَى 💪');if(t)t.textContent=m;try{say(m.replace(/[🌟💪🎧]/g,''),'ar')}catch(er){}
   if(j.ok&&window.MC)MC.mood('happy',1200)};
  r.onerror=()=>{t&&(t.textContent='لَمْ أَسْمَعْ جَيِّدًا، حَاوِلْ مَرَّةً أُخْرَى')};
  r.onend=()=>{F.rec=null;b&&b.classList.remove('on')};try{r.start()}catch(e){F.rec=null}};
 /* نضيف البطاقة أعلى صفحة الدرس، ونطوي الشبكة الأصلية تحت «عرض كل البطاقات» */
 const decorate=()=>{try{if(window.V!=='lesson'||!window.cur||items().length<2)return;const app=document.getElementById('app'),g=app&&app.querySelector('.grid');if(!g||document.getElementById('lf'))return;
   if(F.id!==cur.id){F.id=cur.id;F.i=0}
   const box=document.createElement('section');box.id='lf';box.className='lf';box.innerHTML=card();
   const h2=app.querySelector('h2');(h2||g).insertAdjacentElement(h2?'afterend':'beforebegin',box);if(h2)h2.classList.add('lf-h2');
   const det=document.createElement('details');det.id='lf-all';det.className='lf-all';det.innerHTML=`<summary>🗂️ عَرْضُ كُلِّ الْبِطَاقَاتِ (${D(items().length)})</summary>`;g.insertAdjacentElement('beforebegin',det);det.appendChild(g);
  }catch(e){}};
 const oL=window.lesson;if(typeof oL==='function'){window.lesson=function(){const r=oL.apply(this,arguments);decorate();return r}}
})();
