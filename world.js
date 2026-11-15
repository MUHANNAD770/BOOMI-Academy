/* world.js — مسار التعلم الذكي + عالم المغامرات + الشارات + لوحة ولي الأمر الموسّعة.
   • المستويات: مبتدئ (المرحلتان ١–٢) · متوسط (٣–٤) · متقدم (٥).
   • الدروس تُفتح بالترتيب: كل درس بعد اجتياز اختبار الدرس السابق (٤ من ٥)، وكل مرحلة بعد إتقان ٧٠٪ من التي قبلها
     أو إذا وضعه اختبار تحديد المستوى فيها. ولي الأمر يستطيع فتح كل الدروس من لوحته.
   • عالم المغامرات: خمس مناطق تُفتح بالإنجازات. الشارات تُمنح تلقائيًا مع تهنئة.
   كل البيانات من ملف الطالب نفسه (P) — لا شيء يُرسل لأي خادم. */
(()=>{
'use strict';
const LV=a=>a<=1?['مبتدئ','🌱']:a<=3?['متوسط','🌿']:['متقدم','🌳'];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stageOf=id=>/^\d+-\d+$/.test(id)?+id.split('-')[0]:-1;
const listFor=(a,l)=>S[a]?S[a].u.filter(u=>u.l===l):[];
const mastery=(a,l)=>{const L=listFor(a,l);return L.length?L.filter(u=>P.done[u.id]).length/L.length:1};
const stageOpen=(a,l)=>a<=Math.max(+P.stage||0,0)||(a>0&&mastery(a-1,l)>=.7);
function unlocked(u){if(!u||!P)return true;if(P.unlockAll)return true;const a=stageOf(u.id);if(a<0)return true;
 if(P.done[u.id]||P.sc[u.id]!=null)return true;if(a<(+P.stage||0))return true; /* المراحل التي قبل مستوى الطالب مفتوحة كلها للمراجعة */
 if(!stageOpen(a,u.l))return false;const L=listFor(a,u.l),i=L.indexOf(u);return i<=0||!!P.done[L[i-1].id]}
const nextFor=l=>{const s0=Math.min(S.length-1,Math.max(0,+P.stage||0));for(let a=s0;a<S.length;a++)for(const u of listFor(a,l))if(!P.done[u.id]&&unlocked(u))return u;
 for(let a=0;a<s0;a++)for(const u of listFor(a,l))if(!P.done[u.id])return u;return null};
const starsOf=id=>{const s=P.sc[id];return s==null?0:s>=5?3:s>=4?2:1};
window.lessonUnlocked=unlocked;window.nextLesson=nextFor;

/* ---------- قفل الدروس ---------- */
const oLesson=window.lesson;
window.lesson=function(id){let u;try{u=find(id)}catch(e){}
 if(u&&!unlocked(u)){V='lesson';const n=nextFor(u.l);try{window.MC&&MC.mood('tilt',900)}catch(e){}
  return h(`<section class="sec lock-screen"><button class=link onclick="goBack()">رجوع ←</button><div class=lock-big>🔒</div><h2>${esc(u.n)}</h2><p>هذا الدرس يُفتح بعد أن تُتقن الدروس التي قبله. أنت قريب! 💪</p>${n?`<button class=big onclick="lesson('${n.id}')">▶️ ابدأ: ${esc(n.n)}</button>`:''}<button class=alt onclick="path('${u.l}')">🧭 مسار التعلم</button></section>`)}
 return oLesson.apply(this,arguments)};

/* ---------- مسار التعلم (خريطة مرئية) ---------- */
const SUBJ={ar:['🔤','جزيرة الحروف والكلمات','#ffb347,#f07f10'],en:['🔠','مدينة اللغة الإنجليزية','#4fb6ff,#1d6fe0'],math:['🔢','مملكة الأرقام والرياضيات','#ff7eb3,#e0457b']};
window.path=function(sub){sub=SUBJ[sub]?sub:'ar';V='sec';window.CS='les';const[ic,title,grad]=SUBJ[sub];let body='';
 if(sub==='math'){body=`<div class=pth>${Object.keys(MS).map((k,i)=>{const m=P.ml[k]||{l:1},d=!!m.d;return `<button class="pn ${d?'done':''} ${i%2?'r':'l'}" onclick="mstart('${k}')"><i>${d?'🏆':'🔢'}</i><b>${esc(MS[k])}</b><small>${'●'.repeat(m.l)}${'○'.repeat(4-m.l)} المستوى ${m.l}/4</small></button>`}).join('')}</div>`}
 else{let cur=nextFor(sub);for(let a=0;a<S.length;a++){const L=listFor(a,sub);if(!L.length)continue;const[lv,li]=LV(a),open=stageOpen(a,sub)||P.unlockAll,pc=Math.round(mastery(a,sub)*100);
  body+=`<div class="pst ${open?'':'shut'}"><div class=pst-h><span>${li}</span><b>${esc(S[a].n)}</b><small>${lv} · ${S[a].a} سنوات · ${pc}٪</small></div><div class=bar><div style="width:${pc}%"></div></div><div class=pth>`+
   L.map((u,i)=>{const ok=unlocked(u),dn=!!P.done[u.id],c=cur&&cur.id===u.id,st=starsOf(u.id);
    return `<button class="pn ${dn?'done':''} ${c?'cur':''} ${ok?'':'lock'} ${i%2?'r':'l'}" onclick="lesson('${u.id}')"><i>${dn?'✅':c?'▶️':ok?'⭐':'🔒'}</i><b>${esc(u.n)}</b><small>${dn?'★'.repeat(st)+'☆'.repeat(3-st):c?'ابدأ هنا':ok?'جاهز':'مقفل'}</small></button>`}).join('')+`</div></div>`}}
 h(`<section class="sec path"><div class=path-h style="background:linear-gradient(135deg,${grad})"><span>${ic}</span><div><h2>${title}</h2><p>من الأسهل إلى الأصعب، خطوة بخطوة</p></div></div>${body}<button class=alt onclick="world()">🗺️ عالم المغامرات</button></section>`)};

/* ---------- عالم المغامرات ---------- */
const doneN=l=>Object.keys(P.done).filter(id=>{try{const u=find(id);return!l||u.l===l}catch(e){return false}}).length;
const ZONES=()=>[
 {k:'ar',ic:'🏝️',n:'جزيرة الحروف والكلمات',d:'الحروف والحركات والكلمات',g:'#ffcf6e,#f59f1b',go:"path('ar')",open:1,pc:doneN('ar')/Math.max(1,S.flatMap(s=>s.u).filter(u=>u.l==='ar').length)},
 {k:'en',ic:'🏙️',n:'مدينة اللغة الإنجليزية',d:'Phonics · Words · Talk',g:'#7cc8ff,#2f7df0',go:"path('en')",open:1,pc:doneN('en')/Math.max(1,S.flatMap(s=>s.u).filter(u=>u.l==='en').length)},
 {k:'math',ic:'🏰',n:'مملكة الأرقام والرياضيات',d:'عدّ وحساب وأشكال',g:'#ff9ac6,#e0457b',go:"path('math')",open:1,pc:Object.keys(MS).reduce((n,k)=>n+((P.ml[k]||{l:1}).l-1+((P.ml[k]||{}).d?1:0)),0)/(Object.keys(MS).length*4)},
 {k:'read',ic:'📚',n:'عالم القصص والقراءة',d:'قراءة وفهم وقصص',g:'#9be7b0,#25a43a',go:"stories()",open:doneN()>=5||(P.star||0)>=25,need:'أتقن ٥ دروس أو اجمع ٢٥ نجمة',pc:Object.keys(P.stories||{}).length/Math.max(1,(window.STORIES?STORIES.AR.length+STORIES.EN.length+STORIES.TALK.length:22))},
 {k:'iq',ic:'🧩',n:'جزيرة الألغاز والذكاء',d:'ألغاز وذاكرة وأنماط',g:'#c9a2ff,#8a3fe0',go:"puzzles()",open:(P.star||0)>=40,need:'اجمع ٤٠ نجمة',pc:Math.min(1,Object.keys(P.act||{}).length/30)}];
window.world=function(){V='sec';window.CS='games';const Z=ZONES();
 h(`<section class="sec world"><h2>🗺️ عالم المغامرات</h2><p class=mut>كل منطقة تُفتح بإنجازاتك. ⭐ ${P.star||0} · 🏅 ${earned().length}</p><div class=zones>${Z.map((z,i)=>`<button class="zone ${z.open?'':'shut'}" style="--g:linear-gradient(160deg,${z.g});--d:${i*.08}s" onclick="${z.open?z.go:`zoneLocked('${esc(z.need)}')`}"><span class=zi>${z.open?z.ic:'🔒'}</span><b>${z.n}</b><small>${z.open?z.d:z.need}</small>${z.open?`<span class=zp><i style="width:${Math.round(Math.min(1,z.pc)*100)}%"></i></span>`:''}</button>`).join('')}</div>
 <h3>🏅 شاراتي</h3>${badgeGrid()}</section>`)};
window.zoneLocked=need=>{try{say('هَذِهِ المِنْطَقَةُ مُقْفَلَةٌ. '+need,'ar',null,'soft');MC.mood('tilt',900)}catch(e){}};

/* ---------- الشارات ---------- */
const BADGES=[['first','🌟','أول درس',()=>doneN()>=1],['l5','📗','٥ دروس',()=>doneN()>=5],['l20','📚','٢٠ درسًا',()=>doneN()>=20],['l50','🎓','٥٠ درسًا',()=>doneN()>=50],
 ['s25','⭐','٢٥ نجمة',()=>(P.star||0)>=25],['s100','💫','١٠٠ نجمة',()=>(P.star||0)>=100],['s300','🌠','٣٠٠ نجمة',()=>(P.star||0)>=300],
 ['d3','🎯','٣ تحديات يومية',()=>Object.keys(P.cd||{}).length>=3],['d7','🔥','٧ تحديات يومية',()=>Object.keys(P.cd||{}).length>=7],
 ['math','🧮','بطل مهارة حسابية',()=>Object.values(P.ml||{}).some(m=>m.d)],['talk','🎤','١٠ نطق صحيح',()=>((P.stat||{}).p||[0,0])[1]>=10],
 ['act','🎨','١٠ أنشطة',()=>Object.keys(P.act||{}).length>=10],['ar','🔤','بطل العربية',()=>doneN('ar')>=15],['en','🔠','English star',()=>doneN('en')>=15],['all','🗺️','مستكشف العالم',()=>ZONES().every(z=>z.open)]];
const earned=()=>BADGES.filter(b=>{try{return b[3]()}catch(e){return false}});
const badgeGrid=()=>`<div class=badges>${BADGES.map(b=>{let e=false;try{e=b[3]()}catch(_){}return `<div class="badge ${e?'got':''}" title="${b[2]}"><span>${b[1]}</span><small>${b[2]}${e?' ✓':''}</small></div>`}).join('')}</div>`;
window.badgeGrid=badgeGrid;
/* تهنئة بالشارة الجديدة بعد كل نتيجة */
function checkBadges(){if(!P)return;P.badges=P.badges||{};const n=earned().filter(b=>!P.badges[b[0]]);if(!n.length)return;n.forEach(b=>P.badges[b[0]]=Date.now());save();
 const b=n[0],t=document.createElement('div');t.className='badge-toast';t.innerHTML=`<span>${b[1]}</span><div><small>شارة جديدة!</small><b>${b[2]}</b></div>`;document.body.appendChild(t);setTimeout(()=>t.classList.add('out'),3600);setTimeout(()=>t.remove(),4200);
 try{HurufiSound.play('finish');MC.mood('proud',2400);say('رَائِعٌ! حَصَلْتَ عَلَى شَارَةٍ جَدِيدَةٍ: '+b[2],'ar',null,'cheer')}catch(e){}}
['fin'].forEach(f=>{const o=window[f];if(typeof o==='function')window[f]=function(){const r=o.apply(this,arguments);setTimeout(checkBadges,900);return r}});
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.opt,.ct-opts button,.practice-options button'))setTimeout(checkBadges,1500)},true);

/* ---------- الأقفال في قوائم الدروس + مداخل جديدة ---------- */
const oSec=window.sec;window.sec=function(k){const r=oSec.apply(this,arguments);try{
 app.querySelectorAll('button.row[onclick^="lesson("]').forEach(b=>{const id=(b.getAttribute('onclick').match(/lesson\('([^']+)'\)/)||[])[1];let u;try{u=find(id)}catch(e){}if(u&&!unlocked(u)){b.classList.add('locked');const s=b.querySelector('span');if(s)s.textContent='🔒'}});
 if(k==='les'||k==='ar'||k==='en'){const lk=app.querySelectorAll('button.row.locked').length,n=nextFor(k==='en'?'en':'ar'),h2=app.querySelector('.sec h2');
  if(lk&&h2)h2.insertAdjacentHTML('afterend',`<div class=lock-note>🔒 الدروس تُفتح بالترتيب: أتقن الدرس (٤ من ٥) فيُفتح الذي بعده.${n?` <button class=big onclick="lesson('${n.id}')">▶️ تابع: ${esc(n.n)}</button>`:''}</div>`)}
 if(k==='ach'){const s=app.querySelector('.sec');s&&s.insertAdjacentHTML('beforeend',`<h3>🏅 شاراتي</h3>${badgeGrid()}<button class=big onclick="world()">🗺️ عالم المغامرات</button>`)}
 if(k==='ar'||k==='en'||k==='math'){const s=app.querySelector('.sec h2');s&&s.insertAdjacentHTML('afterend',`<button class="path-btn" onclick="path('${k}')">🧭 مسار التعلم خطوة بخطوة</button>`)}
}catch(e){}return r};
const oHome=window.home;window.home=function(){const r=oHome.apply(this,arguments);try{const t=app.querySelector('.tl');if(t&&!t.querySelector('.world-tile'))t.insertAdjacentHTML('afterbegin','<button class="gt world-tile" onclick="world()"><i class="ico ico-em">🗺️</i><b>عالم المغامرات</b><small>افتح مناطق جديدة</small></button>')}catch(e){}return r};

/* ---------- لوحة ولي الأمر: ملخص واضح + خطة أسبوعية ---------- */
const acc=k=>{const s=(P.stat||{})[k];return s&&s[0]?Math.round(s[1]/s[0]*100):null};
const oParent=window.parent;window.parent=function(){const r=oParent.apply(this,arguments);try{if(!app.querySelector('#pn')){const h2=app.querySelector('h2');
 const tot=l=>S.flatMap(s=>s.u).filter(u=>u.l===l).length,row=(ic,n,d,t,ac)=>`<div class=pr-row><span>${ic}</span><div><b>${n}</b><div class=bar><div style="width:${t?Math.round(d/t*100):0}%"></div></div><small>${d} من ${t}${ac!=null?` · دقة ${ac}٪`:''}</small></div></div>`;
 const ms=Object.keys(MS),mDone=ms.filter(k=>(P.ml[k]||{}).d).length,weak=Object.entries(P.sk||{}).filter(([k,s])=>!k.startsWith('m-')&&s.m>0).sort((a,b)=>b[1].m-a[1].m).slice(0,8).map(x=>x[0].replace(/^ai:/,''));
 const plan=['ar','en'].map(l=>nextFor(l)).filter(Boolean).map(u=>`<li>📖 ${esc(u.n)}</li>`).join('')+ms.filter(k=>!(P.ml[k]||{}).d).slice(0,2).map(k=>`<li>🔢 ${esc(MS[k])} (المستوى ${(P.ml[k]||{l:1}).l})</li>`).join('')+(weak.length?`<li>🔁 مراجعة: ${weak.slice(0,4).map(esc).join('، ')}</li>`:'');
 h2&&h2.insertAdjacentHTML('afterend',`<div class=pdash><h3>📊 تقدّم ${esc(P.name)}</h3>${row('🔤','العربية',doneN('ar'),tot('ar'),acc('r'))}${row('🔠','English',doneN('en'),tot('en'),null)}${row('🔢','الرياضيات (مهارات متقنة)',mDone,ms.length,acc('m'))}${row('🎨','الأنشطة المنجزة',Object.keys(P.act||{}).length,Math.max(30,Object.keys(P.act||{}).length),null)}${row('🗂️','مواد الكورس',Object.keys(P.courseDone||{}).length,Math.max(60,Object.keys(P.courseDone||{}).length),null)}
  <div class=pr-sum><div>⭐<b>${P.star||0}</b><small>نجمة</small></div><div>🏅<b>${earned().length}</b><small>شارة</small></div><div>🎯<b>${Object.keys(P.cd||{}).length}</b><small>تحدٍّ يومي</small></div><div>🎤<b>${acc('p')!=null?acc('p')+'٪':'—'}</b><small>دقة النطق</small></div></div>
  ${weak.length?`<h3>⚠️ يحتاج تدريبًا</h3><p>${weak.map(esc).join('، ')}</p>`:''}<h3>🗓️ خطة هذا الأسبوع</h3><ul class=plan>${plan||'<li>أحسنتم! كل الدروس المتاحة مكتملة 🎉</li>'}</ul>
  <label>ترتيب الدروس</label><select onchange="P.unlockAll=this.value==='1';save()"><option value="0" ${P.unlockAll?'':'selected'}>بالترتيب (يُفتح الدرس بعد إتقان السابق)</option><option value="1" ${P.unlockAll?'selected':''}>فتح كل الدروس</option></select></div>`)}}catch(e){}return r};
})();
