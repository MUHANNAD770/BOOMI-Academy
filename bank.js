/* bank.js — «كل الدروس»: دروس العربية من بنك الأسئلة الذي أرسله صاحب المشروع (data/ar-bank.json، يبنيه tools/bank/build_bank.py).
   • ست مراحل (من التأسيس المبكر حتى الثاني عشر) ← دروس ← أسئلة اختيار من متعدد (182 سؤالًا بلا تكرار).
   • قبل الإجابة: «💡 تلميح» و«🔊 اسمع السؤال». بعد الإجابة: صح/خطأ + الإجابة الصحيحة + التفسير (كما تطلب ملاحظات البنك).
   • كل إجابة تصل لعقل بومي (mind/hub.js) عبر أزرار .opt، والنتائج في P.bank (أفضل نتيجة لكل درس) وتُزامَن.
   • البيانات تُحمَّل عند فتح الصفحة فقط (لا تبطئ بدء الموقع). لا يُحذف أي درس قديم: الدروس السابقة في صفحات الأكاديميات. */
(()=>{'use strict';
let DATA=null,LOAD=null;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AD='٠١٢٣٤٥٦٧٨٩',D=n=>String(n).replace(/\d/g,d=>AD[d]);
const load=()=>DATA?Promise.resolve(DATA):(LOAD||(LOAD=fetch('data/ar-bank.json?v=1').then(r=>r.json()).then(j=>DATA=j).catch(e=>{LOAD=null;throw e})));
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const B=()=>{P.bank=P.bank||{};return P.bank};
const key=(si,li)=>si+'.'+li;
const ICON=['🔤','✏️','📖','🧩','📚','🎓'];
const stars=s=>s>=.9?'⭐⭐⭐':s>=.7?'⭐⭐':s>0?'⭐':'';
const go=f=>{if(typeof window.V!=='undefined')window.V='lesson';f()};
/* الصفحة الرئيسية للدروس */
window.bank=function(){V='lesson';h(`<section class="sec bank"><button class=link onclick="home()">→ الرئيسية</button><h2>📚 كل الدروس</h2><p class=mut>⏳ تحميل الدروس…</p></section>`);
 load().then(d=>{if(!document.querySelector('.bank'))return;const bk=B();let html='';
  d.stages.forEach((s,si)=>{const L=s.lessons,done=L.filter((l,li)=>(bk[key(si,li)]||{}).b>=.7).length;
   html+=`<details class="lesson-menu bank-st"${si===0?' open':''}><summary><span><b>${ICON[si]||'📘'} ${esc(s.name)}</b><small>${esc(s.grades)} · ${D(L.length)} درس · أُتقن ${D(done)}</small></span><i>⌄</i></summary>${lzList(L.map((l,li)=>{const r=bk[key(si,li)]||{};
    return `<button class=row onclick="bankLesson(${si},${li})"><span>${r.b>=.7?'✅':'📝'}</span><b>${esc(l.name)}</b><small>${D(l.q.length)} سؤال${r.b!=null?' · '+stars(r.b):''}</small></button>`}).join(''))}</details>`});
  const S0=document.querySelector('.bank');if(!S0)return;S0.querySelector('.mut').outerHTML=`<p class=mut>أسئلة اللغة العربية لكل المراحل: اختر مرحلتك ثم الدرس. ${D(d.stages.reduce((n,s)=>n+s.lessons.reduce((m,l)=>m+l.q.length,0),0))} سؤالًا.</p>`;
  S0.insertAdjacentHTML('beforeend',html)}).catch(()=>{const m=document.querySelector('.bank .mut');if(m)m.textContent='تعذّر تحميل الدروس. تأكد من الاتصال ثم حاول مرة أخرى.'})};
/* درس: الأسئلة بالترتيب (من الأسهل)، والخيارات مخلوطة */
let S=null;
window.bankLesson=function(si,li){load().then(d=>{const st=d.stages[si],l=st&&st.lessons[li];if(!l)return bank();
 S={si,li,l,st,i:0,ok:0,qs:l.q.map(q=>({...q,o:shuf(q.o)})),hint:0};show()})};
function show(){const{l,i,qs}=S;if(i>=qs.length)return finish();const q=qs[i];S.answered=false;
 h(`<section class="sec bank-q"><button class=link onclick="bank()">→ كل الدروس</button>
 <div class=bq-top><b>${esc(l.name)}</b><small>سؤال ${D(i+1)} من ${D(qs.length)}</small></div><div class=bq-bar><i style="width:${Math.round(i/qs.length*100)}%"></i></div>
 <div class="q bq-text" dir=rtl>${esc(q.t)}</div>
 <div class=bq-tools><button class=alt onclick="bankSay()">🔊 اسمع السؤال</button>${q.h?`<button class=alt onclick="bankHint()">💡 تلميح</button>`:''}</div><p id=bq-hint class=bq-hint hidden></p>
 <div class="grid bq-opts${q.o.some(o=>o.length>18)?' wide':''}">${q.o.map((o,k)=>`<button class=opt dir=rtl data-ok="${o===q.a?1:0}" onclick="bankAns(this)">${esc(o)}</button>`).join('')}</div>
 <div id=bq-fb class=bq-fb hidden></div></section>`)}
window.bankSay=()=>{const q=S&&S.qs[S.i];if(!q)return;const L=[[q.t,'ar'],['الخِيَارَات','ar'],...q.o.map(o=>[o,'ar'])];(window.sayList||((L)=>say(L.map(x=>x[0]).join('، '),'ar')))(L)};
window.bankHint=()=>{const q=S&&S.qs[S.i],e=document.getElementById('bq-hint');if(!q||!e)return;e.hidden=false;e.textContent='💡 '+q.h;S.hint++;try{say(q.h,'ar')}catch(_){}};
window.bankAns=function(b){if(!S||S.answered)return;S.answered=true;const q=S.qs[S.i],ok=b.dataset.ok==='1';
 document.querySelectorAll('.bq-opts .opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('ok')});if(!ok)b.classList.add('no');
 if(ok)S.ok++;try{window.Mind&&Mind.record({ok,subject:'ar',topic:S.l.name,src:'كل الدروس',go:`bankLesson(${S.si},${S.li})`})}catch(_){}
 try{HurufiSound.play(ok?'correct':'wrong')}catch(_){}
 const fb=document.getElementById('bq-fb');fb.hidden=false;fb.className='bq-fb '+(ok?'good':'soft');
 const msg=ok?'أحسنت! إجابتك صحيحة.':'محاولة جيدة! الإجابة الصحيحة: '+q.a;
 fb.innerHTML=`<b>${ok?'✅':'💡'} ${esc(msg)}</b>${q.e?`<p>${esc(q.e)}</p>`:''}<button class=big onclick="bankNext()">${S.i+1<S.qs.length?'التالي ←':'النتيجة 🏁'}</button>`;
 try{if(!window.muted||!muted())say(msg+(q.e?' '+q.e:''),'ar')}catch(_){}};
window.bankNext=()=>{if(!S)return;S.i++;try{say.stop()}catch(_){}show()};
function finish(){const{si,li,l,ok,qs}=S,sc=ok/qs.length,k=key(si,li),bk=B(),r=bk[k]=bk[k]||{};r.b=Math.max(r.b||0,+sc.toFixed(2));r.n=(r.n||0)+1;r.t=Math.round(Date.now()/1000);
 const gain=Math.round(sc*5);P.star=(+P.star||0)+gain;try{save()}catch(_){}
 const nx=DATA.stages[si].lessons[li+1]?[si,li+1]:DATA.stages[si+1]?[si+1,0]:null;
 h(`<section class="sec bank-end"><h1>${sc>=.7?'🌟':'💪'}</h1><h2>${D(ok)} من ${D(qs.length)} ${stars(sc)}</h2><p>${sc>=.7?'أحسنت! أتقنت هذا الدرس.':'تدرّب مرة أخرى، وستتقنه!'} +${D(gain)} ⭐</p>
 ${nx?`<button class=big onclick="bankLesson(${nx[0]},${nx[1]})">▶️ الدرس التالي: ${esc(DATA.stages[nx[0]].lessons[nx[1]].name)}</button>`:''}<button class=alt onclick="bankLesson(${si},${li})">🔁 أعد الدرس</button><button class=alt onclick="bank()">📚 كل الدروس</button></section>`);
 try{HurufiSound.play(sc>=.7?'finish':'wrong')}catch(_){}}
})();
