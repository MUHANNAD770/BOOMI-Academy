/* bank.js — «المنهج المتكامل»: قسمان من بنوك الأسئلة التي يرسلها صاحب المشروع:
     • اللغة العربية: data/ar-bank.json (tools/bank/build_bank.py) — 6 مراحل، 182 سؤالًا بلا تكرار.
     • اللغة الإنجليزية: data/en-bank.json (tools/bank/build_en.py) — تُضاف دفعةً دفعةً (tools/bank/en/batchN.json).
   المنهج ← القسم ← المرحلة ← الدرس ← أسئلة: اختيار، كتابة، تصحيح، ترتيب، توصيل، كتابة حرة، فهم مقروء. قبل الإجابة: «اسمع السؤال» و«تلميح»؛ بعدها: الصحيح والتفسير (والمعنى بالعربية للإنجليزية).
   كل إجابة تصل لعقل بومي (mind/hub.js)، والنتائج في P.bank (العربية «م.د»، الإنجليزية «en:م.د») وتُزامَن.
   البيانات تُحمَّل عند فتح الصفحة فقط. لا يُحذف أي درس قديم: الدروس السابقة في صفحات الأكاديميات. */
(()=>{'use strict';
const SUBJ={ar:{file:'data/ar-bank.json?v=1',name:'اللغة العربية',sub:'حروف • نحو • إملاء • بلاغة',ic:'ض',cls:'ar',l:'ar'},
 en:{file:'data/en-bank.json?v=2',name:'اللغة الإنجليزية',sub:'Letters • Phonics • Words • Grammar',ic:'ABC',cls:'en',l:'en'}};
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
/* درس: الأسئلة بالترتيب، والخيارات مخلوطة. أنواع العرض (q.m): mc اختيار · type كتابة الكلمة · fix تصحيح الجملة · order ترتيب بطاقات · match توصيل · write كتابة حرة */
let S=null;
window.bankLesson=function(si,li,sub){sub=subOf(sub);load(sub).then(d=>{const st=d.stages[si],l=st&&st.lessons[li];if(!l)return bankSub(sub);
 S={sub,L:SUBJ[sub].l,si,li,l,st,i:0,ok:0,qs:l.q.map(q=>q.m==='order'?{...q,o0:q.o,o:mix(q.seq)}:{...q,m:q.m||'mc',o:q.o&&shuf(q.o)})};show()})};
const mix=seq=>{let a;do a=shuf(seq);while(seq.length>1&&a.join()===seq.join());return a}; /* البطاقات لا تبدأ مرتّبة */
const NAMES={type:'✍️ اكتب الكلمة الناقصة',fix:'🛠️ صحّح الجملة',order:'🧩 رتّب البطاقات',match:'🔗 صِل كل كلمة بما يناسبها',write:'📝 اكتب بنفسك'};
function body(q,dir){const X=S.L==='en'?' dir=ltr':'';
 switch(q.m){
 case 'type':return `<div class=bq-type><input id=bq-in class=bq-in${X} autocomplete=off autocapitalize=off spellcheck=false placeholder="…" onkeydown="if(event.key==='Enter')bankCheck()"><button class=big onclick="bankCheck()">تحقّق ✓</button></div>`;
 case 'fix':return `<div class=bq-bad${X}>❌ ${esc(q.bad)}</div><div class=bq-type><textarea id=bq-in class=bq-in${X} rows=2 autocomplete=off spellcheck=false>${esc(q.bad)}</textarea><button class=big onclick="bankCheck()">تحقّق ✓</button></div>`;
 case 'order':return `<div id=bq-line class="bq-line"${X}><small>اضغط البطاقات بالترتيب الصحيح</small></div><div id=bq-pool class=bq-pool${X}>${q.o.map(k=>`<button class=bq-tile data-k="${k}" onclick="bankTile(this)">${esc(q.o0[k])}</button>`).join('')}</div><div class=bq-type><button class=big id=bq-chk disabled onclick="bankCheck()">تحقّق ✓</button><button class="link bq-undo" onclick="bankUndo()">↩️ تراجع عن آخر بطاقة</button></div>`;
 case 'match':{const R=shuf(q.pr.map((p,k)=>k));return `<div class=bq-match${X}><div>${q.pr.map((p,k)=>`<button class=bq-m data-s=l data-k="${k}" onclick="bankPick(this)">${esc(p[0])}</button>`).join('')}</div><div>${R.map(k=>`<button class=bq-m data-s=r data-k="${k}" dir=auto onclick="bankPick(this)">${esc(q.pr[k][1])}</button>`).join('')}</div></div>`}
 case 'write':return `<div class=bq-type><textarea id=bq-in class=bq-in${X} rows=4 placeholder="Write here…" spellcheck=false></textarea><button class=big onclick="bankCheck()">انتهيت ✓</button></div>`;
 default:return `<div class="grid bq-opts${q.o.some(o=>o.length>18)?' wide':''}">${q.o.map(o=>`<button class=opt dir=${dir} data-ok="${o===q.a?1:0}" data-v="${esc(o)}" onclick="bankAns(this)">${esc(o)}</button>`).join('')}</div>`}}
function show(){const{l,i,qs,L}=S;if(i>=qs.length)return finish();const q=qs[i];S.answered=false;S.miss=0;S.pick=null;const dir=L==='en'?'ltr':'rtl';
 h(`<section class="sec bank-q"><button class=link onclick="bankSub('${S.sub}')">→ ${SUBJ[S.sub].name}</button>
 <div class=bq-top><b>${esc(l.name)}</b><small>سؤال ${D(i+1)} من ${D(qs.length)}</small></div><div class=bq-bar><i style="width:${Math.round(i/qs.length*100)}%"></i></div>
 ${q.p?`<div class=bq-pass dir=${dir}><small>📖 اقرأ النص:</small>${esc(q.p)}</div>`:''}
 ${NAMES[q.m]?`<div class=bq-kind>${NAMES[q.m]}</div>`:''}
 ${q.img?`<div class="bq-img">${q.img}</div>`:''}<div class="q bq-text" dir=${dir}>${esc(q.t)}</div>
 <div class=bq-tools><button class=alt onclick="bankSay()">🔊 اسمع ${q.p?'النص والسؤال':'السؤال'}</button>${q.h?`<button class=alt onclick="bankHint()">💡 تلميح</button>`:''}</div><p id=bq-hint class=bq-hint hidden></p>
 ${body(q,dir)}
 <div id=bq-fb class=bq-fb hidden></div></section>`)}
/* السؤال (والنص المقروء) وخياراته بلغة القسم (الإنجليزية بالصوت الإنجليزي) */
window.bankSay=()=>{const q=S&&S.qs[S.i];if(!q)return;const L=[...(q.p?[[q.p,S.L]]:[]),[q.t,S.L]];
 if(q.m==='mc')L.push(['الخِيَارَات','ar'],...q.o.map(o=>[o,S.L]));
 if(q.m==='fix')L.push([q.bad,S.L]);
 if(q.m==='order')L.push(...q.o.map(k=>[q.o0[k],S.L]));
 (window.sayList||(L=>say(L.map(x=>x[0]).join('، '),'ar')))(L)};
window.bankHint=()=>{const q=S&&S.qs[S.i],e=document.getElementById('bq-hint');if(!q||!e||!q.h)return;e.hidden=false;e.textContent='💡 '+q.h;try{say(q.h,'ar')}catch(_){}};
const nrm=(s,cs)=>{s=String(s||'').replace(/[’‘`]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim().replace(/\s+([.,?!])/g,'$1').replace(/[.!]+$/,'');return cs?s:s.toLowerCase()};
/* ترتيب البطاقات */
window.bankTile=b=>{if(!S||S.answered)return;const ln=document.getElementById('bq-line');const s=ln.querySelector('small');if(s)s.remove();ln.appendChild(b);b.onclick=()=>bankBack(b);
 document.getElementById('bq-chk').disabled=!!document.querySelector('#bq-pool .bq-tile');try{const q=S.qs[S.i];say(q.o0[+b.dataset.k],S.L)}catch(_){}};
window.bankBack=b=>{if(!S||S.answered)return;document.getElementById('bq-pool').appendChild(b);b.onclick=()=>bankTile(b);document.getElementById('bq-chk').disabled=true};
window.bankUndo=()=>{const t=[...document.querySelectorAll('#bq-line .bq-tile')].pop();if(t)bankBack(t)};
/* التوصيل: اختر من جهة ثم من الأخرى */
window.bankPick=b=>{if(!S||S.answered||b.classList.contains('ok'))return;const p=S.pick;
 if(!p||p.dataset.s===b.dataset.s){if(p)p.classList.remove('sel');S.pick=b;b.classList.add('sel');if(b.dataset.s==='l'&&S.L==='en')try{say(b.textContent,'en')}catch(_){}return}
 p.classList.remove('sel');S.pick=null;
 if(p.dataset.k===b.dataset.k){p.classList.add('ok');b.classList.add('ok');try{HurufiSound.play('correct')}catch(_){}
  if(!document.querySelector('.bq-m:not(.ok)'))result(S.miss===0,'')}
 else{S.miss++;[p,b].forEach(x=>{x.classList.add('no');setTimeout(()=>x.classList.remove('no'),500)});try{HurufiSound.play('wrong')}catch(_){}}};
/* التحقق للأنواع المكتوبة والترتيب والكتابة الحرة */
window.bankCheck=()=>{if(!S||S.answered)return;const q=S.qs[S.i],inp=document.getElementById('bq-in');
 if(q.m==='type'){const v=nrm(inp.value);if(!v)return inp.focus();inp.disabled=true;const ok=(q.acc||[q.a]).some(a=>nrm(a)===v);inp.classList.add(ok?'ok':'no');return result(ok,'')}
 if(q.m==='fix'){const v=nrm(inp.value,1);if(!v)return inp.focus();if(v===nrm(q.bad,1)){inp.classList.add('no');setTimeout(()=>inp.classList.remove('no'),500);return toast('غَيِّرِ الْخَطَأَ فِي الْجُمْلَةِ أَوَّلًا ✍️')}
  inp.disabled=true;const ok=v===nrm(q.a,1);inp.classList.add(ok?'ok':'no');return result(ok,'')}
 if(q.m==='order'){const got=[...document.querySelectorAll('#bq-line .bq-tile')].map(b=>q.o0[+b.dataset.k].toLowerCase()),want=q.seq.map(k=>q.o0[k].toLowerCase());
  const ok=got.join('|')===want.join('|');document.getElementById('bq-line').classList.add(ok?'ok':'no');document.querySelectorAll('.bq-tile,#bq-chk').forEach(x=>x.disabled=true);return result(ok,'')}
 if(q.m==='write'){const w=(inp.value.match(/[A-Za-z']+/g)||[]).length;if(w<3){inp.focus();return toast('اكْتُبْ جُمْلَةً كَامِلَةً بِالْإِنْجِلِيزِيَّةِ أَوَّلًا ✍️')}inp.disabled=true;return result(true,'',1)}};
function toast(m){const e=document.getElementById('bq-hint');if(!e)return;e.hidden=false;e.textContent=m;try{say(m,'ar')}catch(_){}}
window.bankAns=function(b){if(!S||S.answered)return;const q=S.qs[S.i],ok=b.dataset.ok==='1';
 document.querySelectorAll('.bq-opts .opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('ok')});if(!ok)b.classList.add('no');
 result(ok,!ok&&q.wa?q.wa[b.dataset.v]||'':'')};
/* النتيجة المشتركة: عقل بومي، الصوت، التغذية الراجعة */
function result(ok,why,wrote){S.answered=true;const q=S.qs[S.i];
 if(ok)S.ok++;try{window.Mind&&Mind.record({ok,subject:S.sub,topic:S.l.name,src:'المنهج المتكامل',go:`bankLesson(${S.si},${S.li},'${S.sub}')`})}catch(_){}
 try{HurufiSound.play(ok?'correct':'wrong')}catch(_){}
 const fb=document.getElementById('bq-fb');fb.hidden=false;fb.className='bq-fb '+(ok?'good':'soft');
 const lead=wrote?'أَحْسَنْتَ! قَارِنْ مَا كَتَبْتَهُ بِهَذَا الْمِثَالِ:':q.m==='match'?(ok?'أَحْسَنْتَ! وَصَّلْتَ الْكَلِمَاتِ كُلَّهَا صَحِيحَةً.':'أَحْسَنْتَ، أَكْمَلْتَ التَّوْصِيلَ! انْتَبِهْ لِلْأَخْطَاءِ فِي الْمَرَّةِ الْقَادِمَةِ.'):ok?'أحسنت! إجابتك صحيحة.':'محاولة جيدة! الإجابة الصحيحة:';
 const X=S.L==='en'?' dir=ltr':'',showA=wrote||(!ok&&q.m!=='match')||(ok&&q.m==='order'&&q.list);
 const ans=wrote?`<ul class=bq-sm${X}>${(q.sm||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${(q.cr||[]).length?`<p class=mut>تأكد أن كتابتك فيها:</p><ul class=bq-cr dir=ltr>${q.cr.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${q.note?`<p class=mut>${esc(q.note)}</p>`:''}`
  :showA?`<p class=bq-ans${X}>${esc(q.a)}</p>`:'';
 fb.innerHTML=`<b>${ok?'✅':'💡'} ${esc(lead)}</b>${ans}${why?`<p>❌ ${esc(why)}</p>`:''}${q.tr?`<p class=bq-tr>المعنى: <b>${esc(q.tr)}</b></p>`:''}${q.e?`<p>${esc(q.e)}</p>`:''}<button class=big onclick="bankNext()">${S.i+1<S.qs.length?'التالي ←':'النتيجة 🏁'}</button>`;
 try{if(!window.muted||!muted()){const spoken=wrote?(q.sm||[]).join(' '):showA&&q.m!=='match'?q.a:'';
  if(S.L==='en')(window.sayList||(()=>{}))([[lead,'ar'],...(spoken?[[spoken,'en']]:[]),...(why?[[why,'ar']]:[]),...(q.e?[[q.e,'ar']]:[])]);
  else say(lead+(spoken?' '+spoken:'')+(q.e?' '+q.e:''),'ar')}}catch(_){}
 fb.scrollIntoView&&fb.scrollIntoView({behavior:'smooth',block:'nearest'})}
window.bankNext=()=>{if(!S)return;S.i++;try{say.stop()}catch(_){}show()};
function finish(){const{sub,si,li,ok,qs}=S,sc=ok/qs.length,k=key(sub,si,li),bk=B(),r=bk[k]=bk[k]||{};r.b=Math.max(r.b||0,+sc.toFixed(2));r.n=(r.n||0)+1;r.t=Math.round(Date.now()/1000);
 const gain=Math.round(sc*5);P.star=(+P.star||0)+gain;try{save()}catch(_){}
 const d=DATA[sub],nx=d.stages[si].lessons[li+1]?[si,li+1]:d.stages[si+1]?[si+1,0]:null;
 h(`<section class="sec bank-end"><h1>${sc>=.7?'🌟':'💪'}</h1><h2>${D(ok)} من ${D(qs.length)} ${stars(sc)}</h2><p>${sc>=.7?'أحسنت! أتقنت هذا الدرس.':'تدرّب مرة أخرى، وستتقنه!'} +${D(gain)} ⭐</p>
 ${nx?`<button class=big onclick="bankLesson(${nx[0]},${nx[1]},'${sub}')">▶️ الدرس التالي: ${esc(d.stages[nx[0]].lessons[nx[1]].name)}</button>`:''}<button class=alt onclick="bankLesson(${si},${li},'${sub}')">🔁 أعد الدرس</button><button class=alt onclick="bankSub('${sub}')">📚 ${SUBJ[sub].name}</button></section>`);
 try{HurufiSound.play(sc>=.7?'finish':'wrong')}catch(_){}}
})();
