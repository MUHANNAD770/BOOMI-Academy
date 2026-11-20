/* bank.js — «المنهج المتكامل»: قسمان من بنوك الأسئلة التي يرسلها صاحب المشروع:
     • اللغة العربية: data/ar-bank.json (tools/bank/build_bank.py) — 6 مراحل، 182 سؤالًا بلا تكرار.
     • اللغة الإنجليزية: data/en-bank.json (tools/bank/build_en.py) — تُضاف دفعةً دفعةً (tools/bank/en/batchN.json).
   المنهج ← القسم ← المرحلة ← الدرس ← أسئلة اختيار من متعدد. قبل الإجابة: «اسمع السؤال» و«تلميح»؛ بعدها: الصحيح والتفسير (والمعنى بالعربية للإنجليزية).
   كل إجابة تصل لعقل بومي (mind/hub.js)، والنتائج في P.bank (العربية «م.د»، الإنجليزية «en:م.د») وتُزامَن.
   البيانات تُحمَّل عند فتح الصفحة فقط. لا يُحذف أي درس قديم: الدروس السابقة في صفحات الأكاديميات. */
(()=>{'use strict';
const SUBJ={ar:{file:'data/ar-bank.json?v=1',name:'اللغة العربية',sub:'حروف • نحو • إملاء • بلاغة',ic:'ض',cls:'ar',l:'ar'},
 en:{file:'data/en-bank.json?v=1',name:'اللغة الإنجليزية',sub:'Letters • Phonics • Words • Grammar',ic:'ABC',cls:'en',l:'en'}};
const DATA={},LOAD={};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AD='٠١٢٣٤٥٦٧٨٩',D=n=>String(n).replace(/\d/g,d=>AD[d]);
const load=s=>DATA[s]?Promise.resolve(DATA[s]):(LOAD[s]||(LOAD[s]=fetch(SUBJ[s].file).then(r=>r.json()).then(j=>DATA[s]=j).catch(e=>{LOAD[s]=null;throw e})));
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const B=()=>{P.bank=P.bank||{};return P.bank};
const key=(sub,si,li)=>(sub==='ar'?'':sub+':')+si+'.'+li; /* العربية بلا بادئة: تبقى نتائج الطلاب السابقة */
const ICON=['🔤','✏️','📖','🧩','📚','🎓'];
const stars=s=>s>=.9?'⭐⭐⭐':s>=.7?'⭐⭐':s>0?'⭐':'';
const nq=d=>d.stages.reduce((n,s)=>n+s.lessons.reduce((m,l)=>m+l.q.length,0),0);
const subOf=s=>SUBJ[s]?s:'ar';
/* المنهج المتكامل: بطاقتا القسمين */
window.bank=function(){V='lesson';
 h(`<section class="sec bank"><button class=link onclick="home()">→ الرئيسية</button><h2>🎓 المنهج المتكامل</h2><p class=mut>منهج كامل بمراحل ودروس وأسئلة متدرّجة. اختر القسم:</p>
 <div class=bank-subs>${Object.entries(SUBJ).map(([k,s])=>`<button class="acad-hd ${s.cls} bank-sub" onclick="bankSub('${k}')"><span class="acad-ic"${k=='en'?' dir=ltr':''}>${s.ic}</span><div><b>${s.name}</b><small${k=='en'?' dir=ltr':''}>${s.sub}</small><small class=bank-n data-s="${k}">…</small></div><span class=acad-em>▶</span></button>`).join('')}</div></section>`);
 Object.keys(SUBJ).forEach(k=>load(k).then(d=>{const e=document.querySelector(`.bank-n[data-s="${k}"]`);if(!e)return;const bk=B();let done=0,all=0;
  d.stages.forEach((s,si)=>s.lessons.forEach((l,li)=>{all++;if((bk[key(k,si,li)]||{}).b>=.7)done++}));e.textContent=`${D(d.stages.length)} مرحلة · ${D(all)} درس · ${D(nq(d))} سؤالًا · أُتقن ${D(done)}`}).catch(()=>{}))};
/* القسم: المراحل والدروس */
window.bankSub=function(sub){sub=subOf(sub);const S0=SUBJ[sub];V='lesson';
 h(`<section class="sec bank" data-sub="${sub}"><button class=link onclick="bank()">→ المنهج المتكامل</button><h2>${sub=='en'?'🔤':'📖'} ${S0.name}</h2><p class=mut>⏳ تحميل الدروس…</p></section>`);
 load(sub).then(d=>{const S1=document.querySelector(`.bank[data-sub="${sub}"]`);if(!S1)return;const bk=B();let html='';
  d.stages.forEach((s,si)=>{const L=s.lessons,done=L.filter((l,li)=>(bk[key(sub,si,li)]||{}).b>=.7).length;
   html+=`<details class="lesson-menu bank-st"${si===0?' open':''}><summary><span><b>${ICON[si]||'📘'} ${esc(s.name)}</b><small>${esc(s.grades)} · ${D(L.length)} درس · أُتقن ${D(done)}</small></span><i>⌄</i></summary>${lzList(L.map((l,li)=>{const r=bk[key(sub,si,li)]||{};
    return `<button class=row onclick="bankLesson(${si},${li},'${sub}')"><span>${r.b>=.7?'✅':(l.ic||'📝')}</span><b>${esc(l.name)}${l.en?` <small dir=ltr>${esc(l.en)}</small>`:''}</b><small>${D(l.q.length)} سؤال${r.b!=null?' · '+stars(r.b):''}</small></button>`}).join(''))}</details>`});
  S1.querySelector('.mut').outerHTML=`<p class=mut>${sub=='en'?'أسئلة الإنجليزية بالتدريج، والشرح بالعربية. ':'أسئلة اللغة العربية لكل المراحل. '}اختر مرحلتك ثم الدرس. ${D(nq(d))} سؤالًا.</p>`;
  S1.insertAdjacentHTML('beforeend',html)}).catch(()=>{const m=document.querySelector('.bank .mut');if(m)m.textContent='تعذّر تحميل الدروس. تأكد من الاتصال ثم حاول مرة أخرى.'})};
/* درس: الأسئلة بالترتيب، والخيارات مخلوطة */
let S=null;
window.bankLesson=function(si,li,sub){sub=subOf(sub);load(sub).then(d=>{const st=d.stages[si],l=st&&st.lessons[li];if(!l)return bankSub(sub);
 S={sub,L:SUBJ[sub].l,si,li,l,st,i:0,ok:0,qs:l.q.map(q=>({...q,o:shuf(q.o)}))};show()})};
function show(){const{l,i,qs,L}=S;if(i>=qs.length)return finish();const q=qs[i];S.answered=false;const dir=L==='en'?'ltr':'rtl';
 h(`<section class="sec bank-q"><button class=link onclick="bankSub('${S.sub}')">→ ${SUBJ[S.sub].name}</button>
 <div class=bq-top><b>${esc(l.name)}</b><small>سؤال ${D(i+1)} من ${D(qs.length)}</small></div><div class=bq-bar><i style="width:${Math.round(i/qs.length*100)}%"></i></div>
 ${q.img?`<div class="bq-img">${q.img}</div>`:''}<div class="q bq-text" dir=${dir}>${esc(q.t)}</div>
 <div class=bq-tools><button class=alt onclick="bankSay()">🔊 اسمع السؤال</button>${q.h?`<button class=alt onclick="bankHint()">💡 تلميح</button>`:''}</div><p id=bq-hint class=bq-hint hidden></p>
 <div class="grid bq-opts${q.o.some(o=>o.length>18)?' wide':''}">${q.o.map(o=>`<button class=opt dir=${dir} data-ok="${o===q.a?1:0}" onclick="bankAns(this)">${esc(o)}</button>`).join('')}</div>
 <div id=bq-fb class=bq-fb hidden></div></section>`)}
/* السؤال وخياراته بلغة القسم (الإنجليزية بالصوت الإنجليزي) */
window.bankSay=()=>{const q=S&&S.qs[S.i];if(!q)return;const L=[[q.t,S.L],['الخِيَارَات','ar'],...q.o.map(o=>[o,S.L])];(window.sayList||(L=>say(L.map(x=>x[0]).join('، '),'ar')))(L)};
window.bankHint=()=>{const q=S&&S.qs[S.i],e=document.getElementById('bq-hint');if(!q||!e||!q.h)return;e.hidden=false;e.textContent='💡 '+q.h;try{say(q.h,'ar')}catch(_){}};
window.bankAns=function(b){if(!S||S.answered)return;S.answered=true;const q=S.qs[S.i],ok=b.dataset.ok==='1';
 document.querySelectorAll('.bq-opts .opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('ok')});if(!ok)b.classList.add('no');
 if(ok)S.ok++;try{window.Mind&&Mind.record({ok,subject:S.sub,topic:S.l.name,src:'المنهج المتكامل',go:`bankLesson(${S.si},${S.li},'${S.sub}')`})}catch(_){}
 try{HurufiSound.play(ok?'correct':'wrong')}catch(_){}
 const fb=document.getElementById('bq-fb');fb.hidden=false;fb.className='bq-fb '+(ok?'good':'soft');
 const msg=ok?'أحسنت! إجابتك صحيحة.':'محاولة جيدة! الإجابة الصحيحة: '+q.a;
 fb.innerHTML=`<b>${ok?'✅':'💡'} ${esc(msg)}</b>${q.tr?`<p class=bq-tr>المعنى: <b>${esc(q.tr)}</b></p>`:''}${q.e?`<p>${esc(q.e)}</p>`:''}<button class=big onclick="bankNext()">${S.i+1<S.qs.length?'التالي ←':'النتيجة 🏁'}</button>`;
 try{if(!window.muted||!muted()){if(S.L==='en')(window.sayList||(()=>{}))([[ok?'أحسنت! إجابتك صحيحة.':'محاولة جيدة! الإجابة الصحيحة:','ar'],...(ok?[]:[[q.a,'en']]),...(q.e?[[q.e,'ar']]:[])]);else say(msg+(q.e?' '+q.e:''),'ar')}}catch(_){}};
window.bankNext=()=>{if(!S)return;S.i++;try{say.stop()}catch(_){}show()};
function finish(){const{sub,si,li,ok,qs}=S,sc=ok/qs.length,k=key(sub,si,li),bk=B(),r=bk[k]=bk[k]||{};r.b=Math.max(r.b||0,+sc.toFixed(2));r.n=(r.n||0)+1;r.t=Math.round(Date.now()/1000);
 const gain=Math.round(sc*5);P.star=(+P.star||0)+gain;try{save()}catch(_){}
 const d=DATA[sub],nx=d.stages[si].lessons[li+1]?[si,li+1]:d.stages[si+1]?[si+1,0]:null;
 h(`<section class="sec bank-end"><h1>${sc>=.7?'🌟':'💪'}</h1><h2>${D(ok)} من ${D(qs.length)} ${stars(sc)}</h2><p>${sc>=.7?'أحسنت! أتقنت هذا الدرس.':'تدرّب مرة أخرى، وستتقنه!'} +${D(gain)} ⭐</p>
 ${nx?`<button class=big onclick="bankLesson(${nx[0]},${nx[1]},'${sub}')">▶️ الدرس التالي: ${esc(d.stages[nx[0]].lessons[nx[1]].name)}</button>`:''}<button class=alt onclick="bankLesson(${si},${li},'${sub}')">🔁 أعد الدرس</button><button class=alt onclick="bankSub('${sub}')">📚 ${SUBJ[sub].name}</button></section>`);
 try{HurufiSound.play(sc>=.7?'finish':'wrong')}catch(_){}}
})();
