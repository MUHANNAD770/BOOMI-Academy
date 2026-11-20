/* stories-bank.js — «المكتبة المتدرّجة» في عالم القصص: دفعات القصص التي يرسلها صاحب المشروع (data/stories-bank.json،
   tools/stories/build_stories.py)، مرتّبة بالتدريج: المرحلة ← المستوى (A1 مبتدئ … C2 متقن)، عربية وإنجليزية.
   • القصة: مشهد مصوّر، النص جملة جملة (اضغط لتسمع، أو «اسمع القصة» مع تظليل الجملة)، والمفردات بمعانيها.
   • التمارين: اختيار من متعدد، صح أو خطأ، إجابة قصيرة (تُقبل الإجابة المقاربة)؛ بعد كل إجابة الشرح، والخطأ يعود ليصحّحه الطالب.
   • أسئلة القصص الإنجليزية للمبتدئ مع ترجمتها العربية. النتائج في P.stories (نجوم) وتصل لعقل بومي.
   • لا يُحذف شيء من القصص القديمة: تبقى في تبويباتها. */
(()=>{'use strict';
const FILE='data/stories-bank.json?v=1';let DATA=null,LOAD=null;
const load=()=>DATA?Promise.resolve(DATA):(LOAD||(LOAD=fetch(FILE).then(r=>r.json()).then(j=>DATA=j).catch(e=>{LOAD=null;throw e})));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const all=()=>DATA?DATA.stages.flatMap(g=>g.stories):[];
const find=id=>all().find(s=>s.id===id);
const best=id=>((window.P&&P.stories)||{})[id];
const stars=b=>b==null?'':'⭐'.repeat(b)+'☆'.repeat(3-b);
const AD='٠١٢٣٤٥٦٧٨٩',D=n=>String(n).replace(/\d/g,d=>AD[d]);
const GT=t=>window.studentGenderText?studentGenderText(t):t; /* رسائل المعلّم للطالب والطالبة (نص القصة نفسه لا يتغيّر) */
const say1=(t,l,cb)=>{try{if(window.muted&&muted()){cb&&cb();return}say(t,l||'ar',cb)}catch(e){}};
const pic=s=>s.img?`<img class=sb-photo src="${esc(s.img)}" alt="${esc(s.alt)}">`:`<span class=sb-scene aria-label="${esc(s.alt)}">${s.sc.map((e,i)=>`<i style="--k:${i}">${e}</i>`).join('')}</span>`;
/* ===== المكتبة ===== */
const oStories=window.stories;
function tabs(cur){return `<div class=course-filters><button class="${cur==='lib'?'on':''}" onclick="stories('lib')">📚 المكتبة المتدرّجة</button><button class="${cur==='ar'?'on':''}" onclick="stories('ar')">📖 قصص عربية</button><button class="${cur==='en'?'on':''}" onclick="stories('en')">📘 English stories</button><button class="${cur==='talk'?'on':''}" onclick="stories('talk')">💬 Conversations</button></div>`}
window.stories=function(tab,lang){if(tab&&tab!=='lib'){const r=oStories.apply(this,arguments);try{const f=document.querySelector('#app .stories .course-filters');if(f)f.outerHTML=tabs(tab)}catch(e){}return r}
 V='sec';window.CS='games';lang=lang||'all';
 h(`<section class="sec stories sb-lib"><div class=path-h style="background:linear-gradient(135deg,#9be7b0,#25a43a)"><span>📚</span><div><h2>عالم القصص والقراءة</h2><p>قصص بالتدريج من المبتدئ إلى المتقن</p></div></div>${tabs('lib')}<p class=mut>⏳ تحميل المكتبة…</p></section>`);
 load().then(d=>{const sec=document.querySelector('.sb-lib');if(!sec)return;const L=s=>lang==='all'||s.l===lang;
  const done=all().filter(s=>best(s.id)!=null).length,next=all().find(s=>L(s)&&best(s.id)==null);
  let html=`<div class=sb-langs>${[['all','الكل'],['ar','📖 عربي'],['en','📘 English']].map(([k,t])=>`<button class="${lang===k?'on':''}" onclick="stories('lib','${k}')">${t}</button>`).join('')}</div>
   <p class=mut>${D(all().length)} قصة · المقروءة ${D(done)}. ابدأ من الأعلى، والقصة التالية عليها ▶.</p>`;
  d.stages.forEach((g,gi)=>{const S0=g.stories.filter(L);if(!S0.length)return;const dn=S0.filter(s=>best(s.id)!=null).length;
   html+=`<details class="lesson-menu sb-stage"${gi===0||S0.includes(next)?' open':''}><summary><span><b>${g.ic} ${esc(g.name)}</b><small>${esc(g.levels)} · ${D(S0.length)} قصة · المقروءة ${D(dn)}</small></span><i>⌄</i></summary>
    <div class="story-grid sb-grid">${S0.map(s=>`<button class="story-card sb-card${s===next?' sb-next':''}" onclick="sbStory('${s.id}')">${pic(s)}<b dir=auto>${esc(s.t)}</b><small><em class=sb-lang>${s.l==='en'?'English':'عربي'}</em> <em class=sb-lv>${esc(s.lv)}</em> ${best(s.id)!=null?stars(best(s.id)):s===next?'▶ التالية':''}</small></button>`).join('')}</div></details>`});
  sec.querySelector('.mut').outerHTML=html}).catch(()=>{const m=document.querySelector('.sb-lib .mut');if(m)m.textContent='تعذّر تحميل المكتبة. تأكد من الاتصال ثم حاول مرة أخرى.'})};
/* ===== قراءة القصة ===== */
window.sbStory=function(id){load().then(()=>{const s=find(id);if(!s)return stories('lib');V='lesson';window.CS='games';const en=s.l==='en',dir=en?'ltr':'rtl';
 h(`<section class="sec story sb-story"><button class=link onclick="stories('lib')">← المكتبة</button>
 <div class=sb-hero>${pic(s)}<h2 dir=auto>${esc(s.t)}</h2><small><em class=sb-lang>${en?'English':'عربي'}</em> <em class=sb-lv>${esc(s.lv)}</em> ${esc(s.stage)}</small></div>
 <div class=story-text dir=${dir}>${s.s.map((t,i)=>`<span class=ss data-i=${i} onclick="sbSay('${id}',${i})">${esc(t)}</span>`).join(' ')}</div>
 <p class=mut>اضغط على أي جملة لتسمعها.</p>
 <button class=alt onclick="sbRead('${id}')">🔊 اسمع القصة كاملة</button>
 ${s.v.length?`<h3>📒 كلمات القصة</h3><div class=sb-vocab>${s.v.map((w,i)=>`<button class=sb-w onclick="sbWord('${id}',${i})"><b dir=auto>${esc(w[0])}</b><small dir=auto>${esc(w[1])}</small></button>`).join('')}</div>`:''}
 <button class=big onclick="sbQuiz('${id}')">❓ أجب عن الأسئلة (${D(s.x.length)})</button></section>`)})};
const mark=i=>document.querySelectorAll('.sb-story .ss').forEach(e=>e.classList.toggle('now',+e.dataset.i===i));
window.sbSay=(id,i)=>{const s=find(id);if(!s)return;mark(i);say1(s.s[i],s.l,()=>mark(-1))};
window.sbRead=id=>{const s=find(id);if(!s)return;let i=0;const nx=()=>{if(i>=s.s.length||!document.querySelector('.sb-story')){mark(-1);return}const k=i++;mark(k);say1(s.s[k],s.l,()=>{const t=say.tk;setTimeout(()=>{if(say.tk===t||!say.live)nx()},250)})};nx()};
window.sbWord=(id,i)=>{const s=find(id),w=s&&s.v[i];if(!w)return;(window.sayList||((L)=>say(L[0][0],L[0][1])))([[w[0],s.l],[w[1],/[؀-ۿ]/.test(w[1])?'ar':'en']])};
/* ===== التمارين ===== */
let Q=null;
const nrm=t=>String(t||'').toLowerCase().normalize('NFKC').replace(/[ً-ْٰـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
const STOP=new Set('a an the to of in on at is are was it and و في على من الى عن ان ال ثم'.split(' '));
const toks=t=>nrm(t).split(' ').map(w=>w.replace(/^ال(?=..)/,'').replace(/^و(?=...)/,'')).filter(w=>w&&!STOP.has(w));
/* إجابة قصيرة: تُقبل إن احتوت معظم كلمات الإجابة النموذجية (أو كانت مثلها) */
function close(given,q){const g=new Set(toks(given)),cands=[q.a,...(q.acc||[])];
 return cands.some(a=>{const t=toks(a);if(!t.length)return false;if(nrm(given)===nrm(a))return true;const hit=t.filter(w=>g.has(w)||[...g].some(x=>x.length>3&&(x.startsWith(w.slice(0,4))||w.startsWith(x.slice(0,4))))).length;return hit/t.length>=.6})}
window.sbQuiz=function(id){load().then(()=>{const s=find(id);if(!s)return stories('lib');Q={s,i:0,ok:0,list:s.x.map(x=>({...x})),n:s.x.length};show()})};
function show(){const{s,i,list}=Q;if(i>=list.length)return finish();const q=list[i],en=s.l==='en',dir=en?'ltr':'rtl';V='lesson';Q.done=false;
 const body=q.t==='multiple_choice'?`<div class="grid sb-opts">${shuf(q.o).map(o=>`<button class=opt dir=${dir} data-ok="${o===q.a?1:0}" onclick="sbAns(this)">${esc(o)}</button>`).join('')}</div>`
  :q.t==='true_false'?`<div class="grid sb-opts sb-tf"><button class=opt data-ok="${q.a?1:0}" onclick="sbAns(this)">✅ ${en?'True — صَحّ':'صَحّ'}</button><button class=opt data-ok="${q.a?0:1}" onclick="sbAns(this)">❌ ${en?'False — خَطَأ':'خَطَأ'}</button></div>`
  :`<div class=sb-type><input id=sb-in class=bq-in dir=${dir} autocomplete=off placeholder="${en?'Write your answer…':GT('اكْتُبْ إِجَابَتَكَ…')}" onkeydown="if(event.key==='Enter')sbCheck()"><button class=big onclick="sbCheck()">تحقّق ✓</button></div>`;
 h(`<section class="sec sb-quiz"><button class=link onclick="sbStory('${s.id}')">← القصة</button><div class=bq-top><b dir=auto>${esc(s.t)}</b><small>سؤال ${D(Math.min(i+1,list.length))} من ${D(list.length)}</small></div>
 <div class=bq-dots>${list.map((x,k)=>`<i class="${k<i?(x._ok?'ok':'no'):k===i?'cur':''}"></i>`).join('')}</div>
 ${q._rt?`<p class=bq-retry>🔁 فُرْصَةٌ ثَانِيَةٌ لِهَذَا السُّؤَالِ</p>`:''}
 <div class="q bq-text" dir=${dir}>${esc(q.t==='true_false'&&!en?'صَحٌّ أَمْ خَطَأٌ: '+q.q:q.q)}</div>${q.qar?`<p class=sb-qar>🇸🇦 ${esc(q.qar)}</p>`:''}
 <div class=bq-tools><button class=alt onclick="sbQSay()">🔊 اسمع السؤال</button><button class=alt onclick="sbStory('${s.id}')">📖 ارجع إلى القصة</button></div>
 ${body}<div id=sb-fb class=bq-fb hidden></div></section>`);sbQSay()}
window.sbQSay=()=>{const q=Q&&Q.list[Q.i];if(!q)return;const en=Q.s.l==='en';(window.sayList||(L=>say(L[0][0],L[0][1])))([[q.t==='true_false'&&!en?'صَحٌّ أَمْ خَطَأٌ: '+q.q:q.q,Q.s.l],...(q.qar?[[q.qar,'ar']]:[])])};
window.sbAns=b=>{if(!Q||Q.done)return;const ok=b.dataset.ok==='1';document.querySelectorAll('.sb-opts .opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('ok')});if(!ok)b.classList.add('no');result(ok)};
window.sbCheck=()=>{if(!Q||Q.done)return;const q=Q.list[Q.i],inp=document.getElementById('sb-in');if(!inp.value.trim())return inp.focus();inp.disabled=true;const ok=close(inp.value,q);inp.classList.add(ok?'ok':'no');result(ok,true)};
function result(ok,typed){Q.done=true;const q=Q.list[Q.i],s=Q.s,en=s.l==='en';q._ok=ok;if(ok&&!q._rt)Q.ok++;
 if(!ok&&(q._rt||0)<1)Q.list.splice(Math.min(Q.list.length,Q.i+3),0,{...q,_ok:undefined,_rt:1}); /* الخطأ يعود ليصحّحه */
 try{window.Mind&&Mind.record({ok,subject:s.l==='en'?'en':'ar',topic:'قصص: '+s.t,src:'مكتبة القصص',go:`sbStory('${s.id}')`})}catch(e){}
 try{HurufiSound.play(ok?'correct':'wrong');MC.mood(ok?'happy':'oops',900)}catch(e){}
 const ans=q.t==='true_false'?(q.a?(en?'True — صَحّ':'صَحّ'):(en?'False — خَطَأ':'خَطَأ')):q.a;
 const lead=GT(ok?(typed?'أَحْسَنْتَ! وَهَذِهِ إِجَابَةٌ نَمُوذَجِيَّةٌ:':'أَحْسَنْتَ! إِجَابَتُكَ صَحِيحَةٌ.'):'مُحَاوَلَةٌ جَيِّدَةٌ! الْإِجَابَةُ الصَّحِيحَةُ:');
 const fb=document.getElementById('sb-fb');fb.hidden=false;fb.className='bq-fb '+(ok?'good':'soft');
 fb.innerHTML=`<b>${ok?'✅':'💡'} ${esc(lead)}</b>${!ok||typed?`<p class=bq-ans dir=auto>${esc(ans)}</p>`:''}${q.e?`<p class=bq-e dir=auto>📘 ${esc(q.e)}</p>`:''}<div class=bq-next><button class=big onclick="sbNext()">${Q.i+1<Q.list.length?'التالي ←':'النتيجة 🏁'}</button></div>`;
 try{if(!window.muted||!muted())(window.sayList||(()=>{}))([[lead,'ar'],...(!ok||typed?[[String(ans).replace(/ — .*/,''),q.t==='true_false'&&!en?'ar':s.l]]:[]),...(q.e?[[q.e,/[؀-ۿ]/.test(q.e)?'ar':'en']]:[])])}catch(e){}}
window.sbNext=()=>{if(!Q)return;try{say.stop()}catch(e){}Q.i++;show()};
function finish(){const{s,ok,n}=Q,st=ok===n?3:ok>=n-1?2:ok?1:0;P.stories=P.stories||{};P.stories[s.id]=Math.max(st,P.stories[s.id]||0);P.star=(+P.star||0)+ok;try{save()}catch(e){}
 const L=all(),nx=L[L.indexOf(s)+1];
 try{HurufiSound.play(st>=2?'finish':'wrong');MC.mood(st>=2?'proud':'happy',1600)}catch(e){}
 h(`<section class="sec bank-end"><div class=be-hero><h1>${st===3?'🏆':st===2?'🌟':'💪'}</h1><h2>${D(ok)} من ${D(n)} ${stars(st)}</h2><p>+${D(ok)} ⭐</p></div>
 ${nx?`<button class=big onclick="sbStory('${nx.id}')">▶️ القصة التالية: ${esc(nx.t)}</button>`:''}<button class=alt onclick="sbStory('${s.id}')">📖 أعد القراءة</button><button class=alt onclick="stories('lib')">📚 المكتبة</button></section>`);
 say1(GT(st>=2?'أَحْسَنْتَ! فَهِمْتَ الْقِصَّةَ جَيِّدًا.':'اقْرَأِ الْقِصَّةَ مَرَّةً أُخْرَى، وَسَتَفْهَمُهَا أَكْثَرَ!'),'ar');
 try{window.checkBadges&&setTimeout(checkBadges,900)}catch(e){}}
})();
