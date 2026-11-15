/* mind/coach.js — الطبقة ٣: المدرّب (قرارات تعليمية من تحليل حقيقي للأداء، لا سيناريو ثابت).
   بعد كل إجابة يقرّر: أي تشجيع يناسب الموقف (سلسلة نجاح، سرعة، عودة بعد خطأ، إتقان كلمة كانت صعبة…)،
   هل يشرح سبب الخطأ، هل يعيد تدريب الكلمة لاحقًا في الاختبار نفسه، وهل يسهّل السؤال التالي.
   التشجيع لا يتكرر (يتذكر آخر ما قاله)، ويراعي جنس الطالب واسمه. */
window.MindCoach=(()=>{
'use strict';
const Mem=window.MindMemory,An=window.MindAnalyzer;
const girl=()=>!!(window.P&&P.gender==='female'),g=(m,f)=>girl()?f:m,nm=()=>(P&&P.name)||'';
const pick=a=>a[Math.floor(Math.random()*a.length)];
/* بنك التشجيع: كل عبارة [للولد، للبنت] أو نص محايد. {n} = اسم الطالب */
const B={
 ok:[['أَحْسَنْتَ!','أَحْسَنْتِ!'],'إِجَابَةٌ صَحِيحَةٌ!','مُمْتَازٌ!','رَائِعٌ جِدًّا!','صَحِيحٌ تَمَامًا!','يَا سَلَامُ!','هَذَا هُوَ الْجَوَابُ!',['أَنْتَ تَتَقَدَّمُ بِسُرْعَةٍ!','أَنْتِ تَتَقَدَّمِينَ بِسُرْعَةٍ!'],'عَمَلٌ جَمِيلٌ!','إِجَابَةٌ دَقِيقَةٌ!',['بَارَكَ اللهُ فِيكَ!','بَارَكَ اللهُ فِيكِ!'],'مَا شَاءَ اللهُ!','تَفْكِيرٌ سَلِيمٌ!',['أَصَبْتَ الْهَدَفَ!','أَصَبْتِ الْهَدَفَ!'],'نَفْخَرُ بِهَذَا الْجَوَابِ!','هَكَذَا يَكُونُ التَّرْكِيزُ!'],
 named:[['أَحْسَنْتَ يَا {n}!','أَحْسَنْتِ يَا {n}!'],'رَائِعٌ يَا {n}!',['بَطَلٌ يَا {n}!','بَطَلَةٌ يَا {n}!'],['مُمْتَازٌ يَا {n}، اِسْتَمِرَّ!','مُمْتَازٌ يَا {n}، اِسْتَمِرِّي!']],
 streak3:['ثَلَاثُ إِجَابَاتٍ صَحِيحَةٍ مُتَتَالِيَةٍ! 🔥',['أَنْتَ فِي أَفْضَلِ حَالَاتِكَ! ثَلَاثَةٌ مُتَتَالِيَةٌ!','أَنْتِ فِي أَفْضَلِ حَالَاتِكِ! ثَلَاثَةٌ مُتَتَالِيَةٌ!'],'سِلْسِلَةٌ جَمِيلَةٌ مِنَ الْإِجَابَاتِ الصَّحِيحَةِ!'],
 streak5:['خَمْسُ إِجَابَاتٍ صَحِيحَةٍ دُونَ خَطَأٍ! 🌟',['لَا شَيْءَ يُوقِفُكَ الْيَوْمَ يَا {n}!','لَا شَيْءَ يُوقِفُكِ الْيَوْمَ يَا {n}!'],'خَمْسَةٌ مِنْ خَمْسَةٍ! تَرْكِيزٌ مُدْهِشٌ!'],
 streak8:['ثَمَانِي إِجَابَاتٍ مُتَتَالِيَةٍ! هَذَا مُسْتَوَى الْأَبْطَالِ! 🏆',['أَنْتَ نَجْمُ الْيَوْمِ يَا {n}!','أَنْتِ نَجْمَةُ الْيَوْمِ يَا {n}!']],
 fast:['سَرِيعٌ وَصَحِيحٌ! ⚡','أَسْرَعُ مِنَ الْبَرْقِ!','جَوَابٌ سَرِيعٌ وَوَاثِقٌ!',['عَرَفْتَهَا فَوْرًا!','عَرَفْتِهَا فَوْرًا!']],
 recovered:[['كُنْتَ تُخْطِئُ فِيهَا، وَالْآنَ أَتْقَنْتَهَا! 💪','كُنْتِ تُخْطِئِينَ فِيهَا، وَالْآنَ أَتْقَنْتِهَا! 💪'],['تَعَلَّمْتَ مِنْ خَطَئِكَ، هَذَا هُوَ النَّجَاحُ!','تَعَلَّمْتِ مِنْ خَطَئِكِ، هَذَا هُوَ النَّجَاحُ!'],'هَذِهِ كَانَتْ صَعْبَةً، وَقَدْ صَارَتْ سَهْلَةً!'],
 comeback:[['عُدْتَ بِقُوَّةٍ! 👏','عُدْتِ بِقُوَّةٍ! 👏'],'هَكَذَا! الْمُحَاوَلَةُ تَصْنَعُ الْفَرْقَ.',['لَمْ تَسْتَسْلِمْ، وَهَذَا أَهَمُّ شَيْءٍ!','لَمْ تَسْتَسْلِمِي، وَهَذَا أَهَمُّ شَيْءٍ!']],
 en:['Great job!','Excellent!','Well done!','Perfect!','Awesome!','You got it!','Fantastic!','Super!','Brilliant!','Nice work!'],
 enStreak:['Three in a row! 🔥','You are on fire!','Amazing streak!'],
 soft:['لَا بَأْسَ.','قَرِيبٌ!','مُحَاوَلَةٌ جَيِّدَةٌ.','الْخَطَأُ طَرِيقُ التَّعَلُّمِ.','لَا مُشْكِلَةَ، سَنَتَعَلَّمُهَا مَعًا.',['لَا تَقْلَقْ.','لَا تَقْلَقِي.'],'كُلُّنَا نُخْطِئُ ثُمَّ نَتَعَلَّمُ.'],
 soft2:[['هَذِهِ تَحْتَاجُ تَرْكِيزًا أَكْثَرَ، وَأَنَا مَعَكَ.','هَذِهِ تَحْتَاجُ تَرْكِيزًا أَكْثَرَ، وَأَنَا مَعَكِ.'],['خُذْ نَفَسًا، وَسَنُجَرِّبُ بِطَرِيقَةٍ أَسْهَلَ.','خُذِي نَفَسًا، وَسَنُجَرِّبُ بِطَرِيقَةٍ أَسْهَلَ.'],'سَأُسَهِّلُ السُّؤَالَ التَّالِيَ قَلِيلًا.']
};
const txt=e=>(Array.isArray(e)?g(e[0],e[1]):e).replace('{n}',nm());
/* اختيار عبارة لم تُقَل مؤخرًا */
function choose(cat){const m=Mem.M(),L=B[cat]||B.ok,fresh=L.map((e,i)=>cat+i).filter(k=>!m.said.includes(k)),k=pick(fresh.length?fresh:L.map((e,i)=>cat+i));
 m.said.push(k);if(m.said.length>14)m.said.shift();return txt(L[+k.slice(cat.length)])}
/* قرار المدرّب بعد إجابة */
function onAnswer(o){const x=o.x,en=x.l==='en',chosen=o.chosen||'';let type='';
 const a=o.ok?null:An.analyze(x,chosen);if(a)type=a.type;
 const r=Mem.observe({k:x.k,ok:o.ok,ms:o.ms,type}),s=r.sess,out={mood:o.ok?'happy':'oops',redrill:false,type};
 if(o.ok){let cat='ok';
  if(s.streak===8)cat='streak8';else if(s.streak===5)cat='streak5';else if(s.streak===3)cat=en?'enStreak':'streak3';
  else if(r.recovered)cat='recovered';else if(s.streak===1&&s.n>1)cat='comeback';
  else if(o.ms&&o.ms<2500&&s.n>2)cat='fast';else if(en)cat='en';else if(Math.random()<.22&&nm()&&nm()!=='صديقي')cat='named';
  out.msg=choose(cat);if(s.streak>=5)out.mood='wow';if(cat==='recovered'||cat==='streak8')out.mood='proud'}
 else{const open=choose(s.wrongRow>=2?'soft2':'soft');out.msg=[open,a&&a.why,a&&a.fix].filter(Boolean).join(' ');
  /* إعادة التدريب: نعيد السؤال بصيغة أخرى لاحقًا (مرتين على الأكثر في الاختبار) */
  if(s.redrill<2&&!x.rd){s.redrill++;out.redrill=true}}
 return out}
/* تسهيل السؤال بعد خطأين متتاليين: نحذف خيارين خاطئين ونُبقي خيارين */
function shape(x){const s=Mem.sess();if(!x||x.eased||x.typ||!x.opts||x.opts.length<=2)return x;
 if(s.wrongRow>=2){const ok=x.opts.find(o=>o.ok),bad=x.opts.filter(o=>!o.ok);if(ok&&bad.length){x.opts=[ok,bad[Math.floor(Math.random()*bad.length)]].sort(()=>Math.random()-.5);x.eased=1}}return x}
const newQuiz=()=>{const s=Mem.sess();s.redrill=0;s.wrongRow=0};
/* تقرير التحليل للوالدين + توصيات مبنية على نمط الأخطاء */
const REC={carry:['🔢 تدريب: الجمع مع الحمل',"mstart('cry')"],borrow:['🔢 تدريب: الطرح مع الاستلاف',"mstart('bor')"],table:['✖️ تدريب: جدول الضرب',"mstart('tbl')"],opswap:['➕ تدريب: الجمع والطرح',"mstart('add')"],offby1:['🍎 تدريب: عدّ الصور',"mstart('cnt')"],similar:['🎤 تدريب النطق','speak()'],dots:['✍️ تتبّع الحروف العربية','aAbj()'],vowel:['فَ الحركات: فتحة وضمة وكسرة','aHar()'],first:['✍️ الإملاء','dictation()'],picture:['🔗 صِل الكلمة بالصورة','matchPics()']};
function report(){const s=Mem.summary(),esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const recs=s.errs.map(e=>REC[e.t]).filter(Boolean).slice(0,3);
 return`<div class=pdash id=mind-report><h3>🧠 تحليل بومي الذكي</h3>
 <div class=pr-sum><div>✅<b>${s.mastered}</b><small>كلمة متقنة</small></div><div>📈<b>${s.recentAcc!=null?s.recentAcc+'٪':'—'}</b><small>دقة آخر ٢٠ إجابة</small></div><div>⏱️<b>${s.avgSec!=null?s.avgSec:'—'}</b><small>ثوانٍ للإجابة</small></div><div>🔁<b>${s.dueCount}</b><small>حان وقت مراجعتها</small></div></div>
 ${s.errs.length?`<h3>🔍 أنماط الأخطاء</h3><ul class=plan>${s.errs.map(e=>`<li>${esc(e.label)} <small>(${e.n} مرة)</small></li>`).join('')}</ul>`:'<p class=mut>لا توجد أنماط أخطاء واضحة بعد. تظهر هنا بعد حل بعض التمارين.</p>'}
 ${s.weak.length?`<h3>📌 كلمات تحتاج تقوية</h3><p>${s.weak.map(esc).join('، ')}</p>`:''}
 ${recs.length?`<h3>💡 ما يقترحه بومي الآن</h3><div class=list>${recs.map(r=>`<button class=row onclick="${r[1]}"><span>🎯</span><b>${r[0]}</b></button>`).join('')}</div>`:''}</div>`}
return{onAnswer,shape,newQuiz,choose,report,praise:cat=>choose(cat||'ok')};
})();
