/* puzzles.js — جزيرة الألغاز والذكاء + إضافات الرياضيات + أنشطة جديدة + التحديات:
   ألغاز، تفكير منطقي، القياس (الطول والوزن والوقت والنقود)، مسائل كلامية، لعبة سرعة البديهة،
   بناء الكلمة بالسحب والإفلات، توصيل الكلمة بالصورة، الإملاء، تقطيع الكلمة إلى مقاطع،
   التحدي الأسبوعي، وتحديات المتقدمين. كل المحتوى أصلي ومشكول. */
(()=>{
'use strict';
const{q5,sh,pk,R,ad}=AC;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const D=n=>ad(n);
const good=()=>{try{HurufiSound.play('correct');MC.mood('happy',1100)}catch(e){}},bad=()=>{try{HurufiSound.play('wrong');MC.mood('oops',1100)}catch(e){}};
const back=f=>`<button class=link onclick="say.stop();${f||'puzzles'}()">رجوع ←</button>`;
const done=(s,n,me,extra)=>{P.star=(P.star||0)+s;save();try{HurufiSound.play(s>=n*.6?'finish':'wrong');MC.mood(s>=n*.6?'happy':'oops',2000)}catch(e){}
 h(`<section class=sec style="text-align:center"><h1>${s>=n*.6?'🌟':'💪'}</h1><h2>${s} من ${n}</h2><p>+${s} ⭐ ${extra||''}</p><button class=big onclick="${me}()">جولة جديدة</button><button class=alt onclick="puzzles()">رجوع للجزيرة</button></section>`)};

/* ---------- ألغاز (أحاجٍ تراثية وأصلية للطلاب) ---------- */
const RID=[['لَهُ أَسْنَانٌ وَلَا يَعَضُّ، فَمَا هُوَ؟','الْمُشْطُ 🪮',['الْأَسَدُ 🦁','الْقَلَمُ ✏️']],['يَمْشِي بِلَا رِجْلَيْنِ، وَيَبْكِي بِلَا عَيْنَيْنِ.','السَّحَابُ ☁️',['النَّهْرُ 🏞️','الْقِطُّ 🐱']],['لَهُ عَيْنٌ وَاحِدَةٌ وَلَا يَرَى.','الْإِبْرَةُ 🪡',['الْبُومَةُ 🦉','الشَّمْسُ ☀️']],['بَيْتٌ بِلَا أَبْوَابٍ وَلَا نَوَافِذَ، يَخْرُجُ مِنْهُ صَغِيرٌ.','الْبَيْضَةُ 🥚',['الصُّنْدُوقُ 📦','الْخَيْمَةُ ⛺']],['يَكْتُبُ وَلَا يَقْرَأُ.','الْقَلَمُ ✏️',['الْكِتَابُ 📖','الْمُعَلِّمُ 🧑‍🏫']],['لَهُ رَقَبَةٌ وَلَيْسَ لَهُ رَأْسٌ.','الزُّجَاجَةُ 🍶',['الزَّرَافَةُ 🦒','الْقَمِيصُ 👕']],['أَخْضَرُ مِنَ الْخَارِجِ، أَحْمَرُ مِنَ الدَّاخِلِ، وَفِيهِ بُذُورٌ سَوْدَاءُ.','الْبِطِّيخُ 🍉',['التُّفَّاحُ 🍎','الْخِيَارُ 🥒']],['حَيَوَانٌ يَحْمِلُ بَيْتَهُ عَلَى ظَهْرِهِ.','السُّلَحْفَاةُ 🐢',['الْجَمَلُ 🐪','الْأَرْنَبُ 🐰']],['يَسْمَعُ بِلَا أُذُنٍ، وَيَتَكَلَّمُ بِلَا لِسَانٍ.','الْهَاتِفُ 📱',['الْبَبَّغَاءُ 🦜','الْكُرْسِيُّ 🪑']],['لَهُ أَوْرَاقٌ كَثِيرَةٌ، وَلَيْسَ شَجَرَةً.','الْكِتَابُ 📖',['الْوَرْدَةُ 🌹','النَّخْلَةُ 🌴']],['لَهُ عَقَارِبُ وَلَا يَلْدَغُ.','السَّاعَةُ ⏰',['الصَّحْرَاءُ 🏜️','الْعَنْكَبُوتُ 🕷️']],['أَبْيَضُ بَارِدٌ، يَنْزِلُ مِنَ السَّمَاءِ فِي الشِّتَاءِ.','الثَّلْجُ ❄️',['الْحَلِيبُ 🥛','الْقُطْنُ ☁️']],['أَطْوَلُ حَيَوَانٍ فِي الْعَالَمِ.','الزَّرَافَةُ 🦒',['الْفِيلُ 🐘','الْحُوتُ 🐋']],['يُلَقَّبُ بِمَلِكِ الْغَابَةِ.','الْأَسَدُ 🦁',['الذِّئْبُ 🐺','الدُّبُّ 🐻']],['كَوْكَبٌ نَعِيشُ عَلَيْهِ.','الْأَرْضُ 🌍',['الْقَمَرُ 🌙','الشَّمْسُ ☀️']],['نَصْنَعُ مِنْ حُبُوبِهِ الْخُبْزَ.','الْقَمْحُ 🌾',['الْعِنَبُ 🍇','الْجَزَرُ 🥕']],['كُلَّمَا أَخَذْتَ مِنْهُ كَبِرَ.','الْحُفْرَةُ 🕳️',['الْكَعْكَةُ 🎂','الْبَالُونُ 🎈']],['يُضِيءُ فِي النَّهَارِ، وَيُعْطِينَا الدِّفْءَ.','الشَّمْسُ ☀️',['الْمِصْبَاحُ 💡','الْقَمَرُ 🌙']]];
window.riddles=()=>{V='lesson';q5('🧩 ألغاز',()=>{const r=pk(RID);return{q:`<div class=bub style="font-size:1.25rem">🤔 ${esc(r[0])}</div>`,o:sh([{t:r[1],ok:true},...r[2].map(t=>({t,ok:false}))])}},'riddles')};

/* ---------- تفكير منطقي ---------- */
const GROUPS=[['🍎','🍌','🍇','🍓','🍊'],['🐶','🐱','🐰','🐭','🐹'],['🚗','🚌','🚲','🚕','🚚'],['⚽','🏀','🎾','🏐','🏈'],['✏️','📏','📚','🖍️','📐'],['🌹','🌻','🌷','🌼','🌸']];
const ODD_Q='أَيُّهَا لَا يَنْتَمِي إِلَى الْمَجْمُوعَةِ؟';
function logicQ(){const t=R(0,2);
 if(t===0){const g=pk(GROUPS),o=pk(GROUPS.filter(x=>x!==g)),odd=pk(o),three=sh(g).slice(0,3);return{q:`<p class=mut>${ODD_Q}</p>`,o:sh([...three.map(e=>({t:e,ok:false})),{t:odd,ok:true}])}}
 if(t===1){const a=R(1,9),st=pk([2,3,5,10]),T=[a,a+st,a+2*st,a+3*st];return{q:`<p class=mut>مَا الرَّقْمُ التَّالِي؟</p><div class=q dir=ltr>${T.map(D).join(' ، ')} ، ؟</div>`,o:AC.opts(a+4*st,D)}}
 const N=sh(['سَارَةُ','عُمَرُ','لَيْلَى']),q=`${N[0]} أَطْوَلُ مِنْ ${N[1]}، وَ${N[1]} أَطْوَلُ مِنْ ${N[2]}. مَنِ الْأَقْصَرُ؟`;
 return{q:`<div class=bub>🧠 ${q}</div>`,o:sh(N.map(n=>({t:n,ok:n===N[2]})))}}
window.logic=()=>{V='lesson';q5('🧠 تَفْكِيرٌ مَنْطِقِيٌّ',logicQ,'logic')};

/* ---------- القياس: الطول، الوزن، الوقت، النقود ---------- */
const clock=(hh,mm)=>{const a=(hh%12+mm/60)*30,b=mm*6;return`<svg viewBox="0 0 120 120" width=150 height=150 style="display:block;margin:8px auto"><circle cx=60 cy=60 r=54 fill=#fff stroke=#3b7bf0 stroke-width=5 />${[...Array(12)].map((_,i)=>{const r=i*30*Math.PI/180;return`<text x="${60+43*Math.sin(r)}" y="${64-43*Math.cos(r)}" font-size=11 text-anchor=middle font-weight=700>${D(i||12)}</text>`}).join('')}<line x1=60 y1=60 x2="${60+26*Math.sin(a*Math.PI/180)}" y2="${60-26*Math.cos(a*Math.PI/180)}" stroke=#22254a stroke-width=6 stroke-linecap=round /><line x1=60 y1=60 x2="${60+40*Math.sin(b*Math.PI/180)}" y2="${60-40*Math.cos(b*Math.PI/180)}" stroke=#e0457b stroke-width=4 stroke-linecap=round /><circle cx=60 cy=60 r=4 fill=#22254a /></svg>`};
const HEAVY=[['🐘','الْفِيلُ',9],['🐄','الْبَقَرَةُ',7],['🐕','الْكَلْبُ',4],['🐈','الْقِطُّ',3],['🐁','الْفَأْرُ',1],['🐜','النَّمْلَةُ',0]];
function measureQ(){const t=R(0,3);
 if(t===0){const hh=R(1,12),half=Math.random()<.5,mm=half?30:0,txt=h=>`السَّاعَةُ ${D(h)}${half?' وَالنِّصْفُ':''}`;const o=new Set([hh]);while(o.size<3)o.add(R(1,12));
  return{q:`<p class=mut>كَمِ السَّاعَةُ؟</p>${clock(hh,mm)}`,o:sh([...o].map(x=>({t:txt(x),ok:x===hh})))}}
 if(t===1){const a=pk(HEAVY),b=pk(HEAVY.filter(x=>x[2]!==a[2])),heavy=Math.random()<.5,w=heavy===(a[2]>b[2])?a:b;return{q:`<p class=mut>أَيُّهُمَا ${heavy?'أَثْقَلُ':'أَخَفُّ'}؟</p>`,o:sh([a,b]).map(x=>({t:x[0]+' '+x[1],ok:x===w}))}}
 if(t===2){const L=R(2,9),M=R(2,9);if(L===M)return measureQ();const long=Math.random()<.5,bar=(n,c)=>`<div style="height:18px;width:${n*10}%;background:${c};border-radius:9px;margin:6px 0"></div>`;
  return{q:`<p class=mut>أَيُّ شَرِيطٍ ${long?'أَطْوَلُ':'أَقْصَرُ'}؟</p><div style="background:#f6f8ff;border-radius:14px;padding:10px">${bar(L,'#ff9f1c')}${bar(M,'#3b7bf0')}</div>`,o:[{t:'🟧 الْبُرْتُقَالِيُّ',ok:long===(L>M)},{t:'🟦 الْأَزْرَقُ',ok:long===(M>L)}]}}
 const c=[R(0,3),R(0,3),R(0,2)],tot=c[0]+c[1]*5+c[2]*10;if(!tot)return measureQ();
 return{q:`<p class=mut>كَمْ رِيَالًا هُنَا؟ 🪙</p><div class=ac-obs>${'<span class=coin>١</span>'.repeat(c[0])}${'<span class="coin c5">٥</span>'.repeat(c[1])}${'<span class="coin c10">١٠</span>'.repeat(c[2])}</div>`,o:AC.opts(tot,D)}}
window.measure=()=>{V='lesson';q5('📏 الْقِيَاسُ',measureQ,'measure')};

/* ---------- مسائل كلامية (نصوص مشكولة، أعداد بالأرقام لتجنّب أخطاء العدد والمعدود) ---------- */
const PPL=[['سَارَةَ','f'],['عُمَرَ','m'],['لَيْلَى','f'],['يُوسُفَ','m'],['مَرْيَمَ','f'],['خَالِدٍ','m']];
const THINGS=['أَقْلَامٌ ✏️','كُرَاتٌ ⚽','تُفَّاحَاتٌ 🍎','بَالُونَاتٌ 🎈','كُتُبٌ 📚','نُجُومٌ ⭐'];
function wordQ(lv){const[n,g]=pk(PPL),th=pk(THINGS),f=g==='f',big=lv>1?20:9;let a=R(2,big),b=R(1,Math.max(1,big-3)),t=R(0,lv>1?3:1),q,ans;
 if(t===0){q=`مَعَ ${n} ${th} عَدَدُهَا ${D(a)}، ثُمَّ ${f?'اشْتَرَتْ':'اشْتَرَى'} ${D(b)} أُخْرَى. كَمْ أَصْبَحَ عَدَدُهَا؟`;ans=a+b}
 else if(t===1){if(b>a)[a,b]=[b,a];q=`مَعَ ${n} ${th} عَدَدُهَا ${D(a)}، ${f?'أَعْطَتْ':'أَعْطَى'} مِنْهَا ${D(b)} ${f?'لِصَدِيقَتِهَا':'لِصَدِيقِهِ'}. كَمْ بَقِيَ ${f?'مَعَهَا':'مَعَهُ'}؟`;ans=a-b}
 else if(t===2){a=R(2,6);b=R(2,6);q=`فِي كُلِّ عُلْبَةٍ ${th} عَدَدُهَا ${D(a)}، وَعِنْدَ ${n} ${D(b)} عُلَبٍ. كَمْ عَدَدُهَا كُلُّهَا؟`;ans=a*b}
 else{b=R(2,5);ans=R(2,6);a=b*ans;q=`${f?'وَزَّعَتْ':'وَزَّعَ'} ${n.replace(/[َُِ]$|ٍ$/,'')} ${th} عَدَدُهَا ${D(a)} عَلَى ${D(b)} أَصْدِقَاءَ بِالتَّسَاوِي. كَمْ يَأْخُذُ كُلُّ صَدِيقٍ؟`}
 return{q:`<div class=bub style="font-size:1.15rem">📝 ${q}</div>`,o:AC.opts(ans,D)}}
window.wordProblems=()=>{V='lesson';q5('📝 مَسَائِلُ كَلَامِيَّةٌ',()=>wordQ((P.stage||0)>=2?2:1),'wordProblems')};

/* ---------- لعبة سرعة البديهة: ٦٠ ثانية ---------- */
window.speedGame=()=>{V='lesson';let s=0,n=0,end=Date.now()+60000,tm=0,cur;
 const mk=()=>{const lv=(P.stage||0)>=2,op=pk(lv?['+','−','×']:['+','−']);let a=R(1,lv?12:9),b=R(1,lv?12:9);if(op==='−'&&b>a)[a,b]=[b,a];if(op==='×'){a=R(2,9);b=R(2,9)}cur={a,b,op,ans:op==='+'?a+b:op==='−'?a-b:a*b}};
 const draw=()=>{mk();const left=Math.max(0,Math.ceil((end-Date.now())/1000));
  h(`${back()}<h2>⚡ سُرْعَةُ الْبَدِيهَةِ</h2><div class=speed-top><span>⏱️ <b id=sp-t>${D(left)}</b></span><span>✅ <b>${D(s)}</b></span></div><div class=q dir=ltr style="font-size:2.6rem">${D(cur.a)} ${cur.op} ${D(cur.b)}</div><div class=grid>${AC.opts(cur.ans,D).map(o=>`<button class=opt data-ok=${+o.ok}>${o.t}</button>`).join('')}</div>`);
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{n++;if(b.dataset.ok==='1'){s++;try{HurufiSound.play('correct')}catch(e){}}else{try{HurufiSound.play('wrong')}catch(e){}}Date.now()<end?draw():fin()})};
 const fin=()=>{clearInterval(tm);if(V!=='lesson')return;P.speed=Math.max(P.speed||0,s);done(Math.floor(s/3),Math.max(1,Math.floor(n/3)),'speedGame',`· إجابات صحيحة: ${D(s)} · أفضل نتيجة: ${D(P.speed)}`)};
 tm=setInterval(()=>{const e=document.getElementById('sp-t');if(!e){clearInterval(tm);return}const left=Math.max(0,Math.ceil((end-Date.now())/1000));e.textContent=D(left);if(left<=0)fin()},250);draw()};

/* ---------- كلمات مع صور (من الدروس نفسها) ---------- */
const picWords=l=>S.flatMap(s=>s.u).filter(u=>u.l===l).flatMap(u=>u.i).filter(x=>/\p{Extended_Pictographic}/u.test(x[1])&&x[1].length<=5);
const plain=w=>String(w).replace(/[ً-ْٰ]/g,'');

/* ---------- بناء الكلمة بالسحب والإفلات (أو بالضغط) ---------- */
window.dragBuild=(r=0,s=0)=>{V='lesson';if(r>=5)return done(s,5,'dragBuild');const l=Math.random()<.6?'ar':'en',W=picWords(l).filter(x=>{const p=plain(x[0]);return p.length>=3&&p.length<=6&&!/\s/.test(p)}),it=pk(W),w=[...plain(it[0])];
 h(`${back()}<h2>🧲 رَكِّبِ الْكَلِمَةَ بِالسَّحْبِ</h2><p class=mut>${r+1} مِنْ ٥ · ⭐ ${s}</p><div class=q>${it[1]}</div><button class=alt onclick="say('${it[0].replace(/'/g,"\\'")}','${l}')">🔊 اسمع</button>
 <div class=slots dir=${l==='ar'?'rtl':'ltr'}>${w.map((_,i)=>`<span class=slot data-i=${i}></span>`).join('')}</div><div class=tiles2>${sh(w.map((c,i)=>[c,i])).map(([c,i])=>`<button class=tile2 data-c="${c}">${c}</button>`).join('')}</div><button class=link onclick="dragBuild(${r},${s})">🔄 إعادة</button>`);
 say(it[0],l);const slots=[...document.querySelectorAll('.slot')];
 const place=(t,slot)=>{if(!slot||slot.dataset.c)return false;slot.dataset.c=t.dataset.c;slot.textContent=t.dataset.c;t.classList.add('used');t.disabled=true;check();return true};
 const check=()=>{if(slots.some(x=>!x.dataset.c))return;const ok=slots.map(x=>x.dataset.c).join('')===w.join('');slots.forEach(x=>x.classList.add(ok?'ok':'no'));if(ok)good();else{bad();say(it[0],l)}setTimeout(()=>dragBuild(r+1,s+(ok?1:0)),ok?900:1800)};
 document.querySelectorAll('.tile2').forEach(t=>{let g=null,x0=0,y0=0,moved=false;
  t.addEventListener('pointerdown',e=>{if(t.disabled)return;e.preventDefault();t.setPointerCapture(e.pointerId);x0=e.clientX;y0=e.clientY;moved=false;g=t});
  t.addEventListener('pointermove',e=>{if(g!==t)return;const dx=e.clientX-x0,dy=e.clientY-y0;if(Math.hypot(dx,dy)>6)moved=true;t.style.transform=`translate(${dx}px,${dy}px) scale(1.08)`;t.classList.add('drag');
   slots.forEach(sl=>{const b=sl.getBoundingClientRect();sl.classList.toggle('over',e.clientX>b.left&&e.clientX<b.right&&e.clientY>b.top&&e.clientY<b.bottom)})});
  t.addEventListener('pointerup',e=>{if(g!==t)return;g=null;t.style.transform='';t.classList.remove('drag');slots.forEach(x=>x.classList.remove('over'));
   const target=moved?slots.find(sl=>{const b=sl.getBoundingClientRect();return e.clientX>b.left-8&&e.clientX<b.right+8&&e.clientY>b.top-8&&e.clientY<b.bottom+8}):slots.find(x=>!x.dataset.c);place(t,target)})})};

/* ---------- توصيل الكلمة بالصورة ---------- */
window.matchPics=(r=0,s=0)=>{V='lesson';if(r>=3)return done(s,15,'matchPics');const l=Math.random()<.5?'ar':'en',seen=new Set(),W=sh(picWords(l)).filter(x=>!seen.has(x[1])&&seen.add(x[1])).slice(0,5);let pick=null,found=0,miss=0;
 h(`${back()}<h2>🔗 صِلِ الْكَلِمَةَ بِصُورَتِهَا</h2><p class=mut>جَوْلَةٌ ${D(r+1)} مِنْ ٣ · ⭐ ${s}</p><div class=match><div class=mcol>${sh(W).map(x=>`<button class=mw dir=auto data-k="${x[1]}">${esc(x[0])}</button>`).join('')}</div><div class=mcol>${sh(W).map(x=>`<button class=mp data-k="${x[1]}">${x[1]}</button>`).join('')}</div></div>`);
 const all=document.querySelectorAll('.mw,.mp');
 all.forEach(b=>b.onclick=()=>{if(b.classList.contains('ok'))return;if(b.classList.contains('mw')){const w=W.find(x=>x[1]===b.dataset.k);w&&say(w[0],l)}
  if(!pick||pick.classList.contains(b.classList.contains('mw')?'mw':'mp')){all.forEach(x=>x.classList.remove('sel'));pick=b;b.classList.add('sel');return}
  const a=pick;pick=null;all.forEach(x=>x.classList.remove('sel'));
  if(a.dataset.k===b.dataset.k){a.classList.add('ok');b.classList.add('ok');good();found++;if(found===W.length)setTimeout(()=>matchPics(r+1,s+Math.max(0,W.length-miss)),800)}
  else{miss++;bad();[a,b].forEach(x=>{x.classList.add('no');setTimeout(()=>x.classList.remove('no'),600)})}})};

/* ---------- الإملاء: اسمع ثم اكتب (تصحيح مرن) ---------- */
window.dictation=(r=0,s=0,lv)=>{V='lesson';if(r>=5)return done(s,5,lv==='adv'?'dictationAdv':'dictation');
 const W=picWords('ar').filter(x=>{const p=plain(x[0]);return!/\s/.test(p)&&(lv==='adv'?p.length>=6:p.length>=3&&p.length<=5)}),it=pk(W);
 h(`${back()}<h2>✍️ ${lv==='adv'?'إِمْلَاءٌ لِلْمُتَقَدِّمِينَ':'الْإِمْلَاءُ'}</h2><p class=mut>${r+1} مِنْ ٥ · ⭐ ${s}</p><div class=q>${it[1]}</div><button class=alt id=dc-say>🔊 اسمع الْكَلِمَةَ</button><input id=dc-in dir=rtl autocomplete=off placeholder="اُكْتُبِ الْكَلِمَةَ هُنَا"><button class=big id=dc-ok>تَحَقَّقْ</button><p id=dc-msg class="mut ink-msg"></p>`);
 const sayit=()=>say(it[0],'ar');sayit();document.getElementById('dc-say').onclick=sayit;const inp=document.getElementById('dc-in');inp.focus();
 const go=()=>{const v=inp.value.trim();if(!v)return;const g=Grade.text(v,[it[0]]),m=document.getElementById('dc-msg');inp.disabled=true;document.getElementById('dc-ok').disabled=true;
  m.className='mut ink-msg '+(g.ok?'good':g.close?'near':'try');m.textContent=g.ok?(g.exact?'أَحْسَنْتَ! 🌟':`صَحِيحَةٌ 🌟 وَالْكِتَابَةُ الدَّقِيقَةُ: ${it[0]}`):`${g.tip?g.tip+' — ':''}الصَّحِيحُ: ${it[0]}`;
  g.ok?good():bad();setTimeout(()=>dictation(r+1,s+(g.ok?1:0),lv),g.ok?1300:2600)};
 document.getElementById('dc-ok').onclick=go;inp.onkeydown=e=>{if(e.key==='Enter')go()}};
window.dictationAdv=()=>dictation(0,0,'adv');

/* ---------- قطّع الكلمة إلى مقاطع ---------- */
const SYL=[['كَتَبَ',['كَ','تَ','بَ']],['بَابَا',['بَا','بَا']],['جَلَسَ',['جَ','لَ','سَ']],['نَامَ',['نَا','مَ']],['سَاعَدَنَا',['سَا','عَ','دَ','نَا']],['يَلْعَبُ',['يَلْ','عَ','بُ']],['رَسَمَ',['رَ','سَ','مَ']],['قَالَ',['قَا','لَ']],['مَدْرَسَتِي',['مَدْ','رَ','سَ','تِي']],['سَافَرَ',['سَا','فَ','رَ']],['ذَهَبَ',['ذَ','هَ','بَ']],['كُتُبِي',['كُ','تُ','بِي']]];
window.syllables=()=>{V='lesson';q5('✂️ قَطِّعِ الْكَلِمَةَ',()=>{const[w,p]=pk(SYL),n=p.length,o=new Set([n]);while(o.size<3)o.add(R(1,5));
 return{q:`<div class=q>${w}</div><p class=mut>كَمْ مَقْطَعًا صَوْتِيًّا فِي الْكَلِمَةِ؟</p><button class=alt onclick="say('${w}','ar')">🔊 اسمع</button>`,o:sh([...o]).map(x=>({t:D(x),ok:x===n}))}},'syllables')};

/* ---------- التحدي الأسبوعي ---------- */
const week=()=>{const d=new Date(),y=d.getFullYear(),s=new Date(y,0,1),w=Math.ceil(((d-s)/864e5+s.getDay()+1)/7);return y+'-W'+w};
window.weekly=()=>{V='lesson';P.wk=P.wk||{};const k=week();if(P.wk[k]!=null)return h(`${back()}<h2>🏆 التَّحَدِّي الْأُسْبُوعِيُّ</h2><p>أَنْجَزْتَ تَحَدِّيَ هَذَا الْأُسْبُوعِ بِنَتِيجَةِ ${D(P.wk[k])} مِنْ ${D(10)} 🎉</p><p class=mut>تَحَدٍّ جَدِيدٌ يَبْدَأُ الْأُسْبُوعَ الْقَادِمَ.</p><button class=big onclick="puzzles()">رجوع للجزيرة</button>`);
 const gens=[logicQ,measureQ,()=>wordQ(1),()=>{const r=pk(RID);return{q:`<div class=bub>🤔 ${esc(r[0])}</div>`,o:sh([{t:r[1],ok:true},...r[2].map(t=>({t,ok:false}))])}}];let i=0,s=0;
 const nx=()=>{if(i>=10){P.wk[k]=s;const bonus=s>=7?10:0;P.star=(P.star||0)+s+bonus;save();try{HurufiSound.play(s>=7?'finish':'wrong')}catch(e){}return h(`<section class=sec style="text-align:center"><h1>${s>=7?'🏆':'💪'}</h1><h2>${D(s)} مِنْ ${D(10)}</h2><p>+${s+bonus} ⭐ ${bonus?'(مُكَافَأَةُ التَّحَدِّي +١٠)':''}</p><button class=big onclick="puzzles()">رجوع للجزيرة</button></section>`)}
  const x=gens[i%gens.length]();h(`${back()}<h2>🏆 التَّحَدِّي الْأُسْبُوعِيُّ</h2><p class=mut>${D(i+1)} مِنْ ${D(10)} · ✅ ${D(s)}</p>${x.q}<div class=grid>${x.o.map(o=>`<button class=opt data-ok=${+o.ok}>${o.t}</button>`).join('')}</div>`);
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.ok==='1';document.querySelectorAll('.opt').forEach(o=>{o.disabled=1;if(o.dataset.ok==='1')o.classList.add('ok')});if(!ok)b.classList.add('no');ok?good():bad();if(ok)s++;i++;setTimeout(nx,ok?700:1300)})};nx()};

/* ---------- تحديات المتقدمين ---------- */
const advOpen=()=>(P.stage||0)>=3||(P.star||0)>=100||P.unlockAll;
window.advanced=()=>{V='lesson';if(!advOpen())return h(`${back()}<h2>🚀 تَحَدِّيَاتُ الْمُتَقَدِّمِينَ</h2><div class=lock-big style="text-align:center">🔒</div><p style="text-align:center">تُفْتَحُ عِنْدَ جَمْعِ ١٠٠ نَجْمَةٍ أَوِ الْوُصُولِ إِلَى الْمَرْحَلَةِ الرَّابِعَةِ. ⭐ ${D(P.star||0)}</p>`);
 h(`${back()}<h2>🚀 تَحَدِّيَاتُ الْمُتَقَدِّمِينَ</h2><div class=list><button class=row onclick="advMath()"><span>🧮</span><b>مَسَائِلُ مِنْ خُطْوَتَيْنِ</b></button><button class=row onclick="dictationAdv()"><span>✍️</span><b>إِمْلَاءُ الْكَلِمَاتِ الطَّوِيلَةِ</b></button><button class=row onclick="advMul()"><span>✖️</span><b>ضَرْبُ الْأَعْدَادِ الْكَبِيرَةِ</b></button></div>`)};
window.advMath=()=>{V='lesson';q5('🧮 مَسَائِلُ مِنْ خُطْوَتَيْنِ',()=>{const[n,g]=pk(PPL),f=g==='f',a=R(5,20),b=R(2,9),c=R(1,a+b-1),th=pk(THINGS);
 return{q:`<div class=bub>📝 مَعَ ${n} ${th} عَدَدُهَا ${D(a)}، ${f?'اشْتَرَتْ':'اشْتَرَى'} ${D(b)} أُخْرَى، ثُمَّ ${f?'أَعْطَتْ':'أَعْطَى'} ${D(c)} ${f?'لِأُخْتِهَا':'لِأَخِيهِ'}. كَمْ بَقِيَ ${f?'مَعَهَا':'مَعَهُ'}؟</div>`,o:AC.opts(a+b-c,D)}},'advMath')};
window.advMul=()=>{V='lesson';q5('✖️ ضَرْبُ الْأَعْدَادِ الْكَبِيرَةِ',()=>{const a=R(11,25),b=R(3,9);return{q:`<div class=q dir=ltr>${D(a)} × ${D(b)} = ؟</div>`,o:AC.opts(a*b,D)}},'advMul')};

/* ---------- جزيرة الألغاز ---------- */
window.puzzles=function(){V='sec';window.CS='games';const wk=(P.wk||{})[week()];
 h(`<section class="sec puzzles"><div class=path-h style="background:linear-gradient(135deg,#c9a2ff,#8a3fe0)"><span>🧩</span><div><h2>جَزِيرَةُ الْأَلْغَازِ وَالذَّكَاءِ</h2><p>فَكِّرْ، الْعَبْ، وَاجْمَعِ النُّجُومَ</p></div></div>
 <button class="nx" onclick="weekly()"><span>🏆</span><div><small>التَّحَدِّي الْأُسْبُوعِيُّ</small><b>${wk!=null?'أُنْجِزَ هَذَا الْأُسْبُوعَ ✅':'١٠ أَسْئِلَةٍ + ١٠ نُجُومٍ مُكَافَأَةً'}</b></div></button>
 <div class=zones>${[['🤔','أَلْغَازٌ','riddles()','#ffd36e,#f08a10'],['🧠','تَفْكِيرٌ مَنْطِقِيٌّ','logic()','#7cc8ff,#2f7df0'],['⚡','سُرْعَةُ الْبَدِيهَةِ','speedGame()','#ff9ac6,#e0457b'],['📏','الْقِيَاسُ','measure()','#9be7b0,#25a43a'],['📝','مَسَائِلُ كَلَامِيَّةٌ','wordProblems()','#ffb38a,#e8622c'],['🧲','رَكِّبِ الْكَلِمَةَ','dragBuild()','#b8f0e6,#1f9f8f'],['🔗','صِلِ الْكَلِمَةَ بِالصُّورَةِ','matchPics()','#d7c4ff,#7a4fe0'],['✍️','الْإِمْلَاءُ','dictation()','#ffe08a,#c79300'],['✂️','قَطِّعِ الْكَلِمَةَ','syllables()','#a8e1ff,#3a8fd6'],['🚀','تَحَدِّيَاتُ الْمُتَقَدِّمِينَ','advanced()','#9aa6ff,#4a3fd0']].map((z,i)=>`<button class=zone style="--g:linear-gradient(160deg,${z[3]});--d:${i*.05}s;min-height:118px" onclick="${z[2]}"><span class=zi>${z[0]}</span><b>${z[1]}</b></button>`).join('')}</div></section>`)};
/* ربط القوائم: الألعاب + الرياضيات */
const oSec=window.sec;window.sec=function(k){const r=oSec.apply(this,arguments);try{const l=app.querySelector('.list');
 if(k==='games'&&l)l.insertAdjacentHTML('afterbegin',`<button class=row onclick="puzzles()"><span>🧩</span><b>جَزِيرَةُ الْأَلْغَازِ وَالذَّكَاءِ</b><small>جديد</small></button><button class=row onclick="stories()"><span>📚</span><b>عَالَمُ الْقِصَصِ</b><small>جديد</small></button><button class=row onclick="weekly()"><span>🏆</span><b>التَّحَدِّي الْأُسْبُوعِيُّ</b></button>`);
 if(k==='math'&&l)l.insertAdjacentHTML('beforeend',`<button class=row onclick="measure()"><span>📏</span><b>الْقِيَاسُ: الطُّولُ وَالْوَزْنُ وَالْوَقْتُ وَالنُّقُودُ</b></button><button class=row onclick="wordProblems()"><span>📝</span><b>مَسَائِلُ كَلَامِيَّةٌ</b></button><button class=row onclick="logic()"><span>🧠</span><b>تَفْكِيرٌ مَنْطِقِيٌّ</b></button><button class=row onclick="speedGame()"><span>⚡</span><b>سُرْعَةُ الْبَدِيهَةِ</b></button>`)}catch(e){}return r};
})();
