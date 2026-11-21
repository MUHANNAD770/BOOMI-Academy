/* lessons-ar.js — مراجعة دروس اللغة العربية (المراحل الخمس):
   1) كل درس له «نوع» حسب مهارته، ولكل نوع تمارينه الخاصة بدل نفس الأسئلة الثلاثة في كل الدروس:
      اختيار الصورة/الكلمة، الاستماع، الحرف الأول، الحرف الناقص، تركيب الكلمة من حروفها، ترتيب كلمات الجملة،
      ترتيب الأيام/الأشهر/الأعداد، التصنيف (شمسية/قمرية، مربوطة/مفتوحة/هاء، قطع/وصل، اسم/فعل…)، مكان الشدة،
      الاستماع إلى الحركة، تقطيع الكلمة، تحديد الفعل/الفاعل/المفعول في الجملة، المعنى والوصف.
   2) إزالة التكرار: الدروس التي كانت تكرر الكلمات نفسها للمهارة نفسها أُعطيت كلمات جديدة (المعرّفات ثابتة فلا يضيع تقدّم الطالب).
   3) مقدمة لكل درس يقولها بومي: اسم الدرس وما سيتعلمه الطالب. */
(()=>{
'use strict';
if(typeof S==='undefined')return;
const M=/[ً-ْٰـ]/g,strip=s=>String(s||'').replace(M,''),EMO=/\p{Extended_Pictographic}/u;
const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]),pick=a=>a[Math.floor(Math.random()*a.length)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const find0=id=>{const[a,b]=String(id).split('-');return S[+a]&&S[+a].u.find(u=>u.id===id)||null};
const isPic=v=>EMO.test(String(v))&&strip(String(v)).replace(/[\p{Extended_Pictographic}️‍\s]/gu,'').length===0;

/* ---------------- ١) إزالة التكرار: كلمات جديدة للدروس المكررة ---------------- */
const SUN='☀️ لَامٌ شَمْسِيَّةٌ: تُكْتَبُ وَلَا تُنْطَقُ',MOON='🌙 لَامٌ قَمَرِيَّةٌ: تُكْتَبُ وَتُنْطَقُ';
const TM='ة مَرْبُوطَةٌ: نَقِفُ عَلَيْهَا هَاءً',TF='ت مَفْتُوحَةٌ: تَبْقَى تَاءً عِنْدَ الْوَقْفِ',TH='ه هَاءٌ أَصْلِيَّةٌ: تُنْطَقُ هَاءً دَائِمًا';
const FIX={
 /* «التدريب» على اللام كان يكرر كلمات الدرس الأول (الشمس، القمر، الكتاب، الباب، الدرس) */
 '2-52':[['الطَّاوِلَةُ',SUN],['الصَّقْرُ',SUN],['الزَّيْتُونُ',SUN],['النَّافِذَةُ',SUN],['الْبَحْرُ',MOON],['الْغَيْمَةُ',MOON],['الْعُصْفُورُ',MOON],['الْمِفْتَاحُ',MOON]],
 /* التاء: الدرس الثاني كان يكرر «مدرسة، شجرة، بنت، كتبت» — كلمات جديدة + الهاء الأصلية */
 '2-51':[['حَقِيبَةٌ',TM],['سَاعَةٌ',TM],['فَاكِهَةٌ',TM],['صَوْتٌ',TF],['زَيْتٌ',TF],['تُوتٌ',TF],['وَجْهٌ',TH],['مِيَاهٌ',TH]],
 /* الهمزة: درس المرحلة الرابعة كان يكرر «اسم، ابن» من درس المرحلة الثالثة */
 '3-6':[['أَرْنَب','هَمْزَةُ قَطْع'],['اِجْلِسْ','هَمْزَةُ وَصْل'],['إِصْبَع','هَمْزَةُ قَطْع'],['اِسْتَمِعْ','هَمْزَةُ وَصْل'],['أَمِير','هَمْزَةُ قَطْع'],['اِنْطَلَقَ','هَمْزَةُ وَصْل']],
 /* الشدة والمدود: كان يكرر «باب، نور، فيل، جد» من دروس المد والشدة السابقة */
 '3-3':[['سُكَّر','شَدَّة'],['مُعَلِّم','شَدَّة'],['دُبّ','شَدَّة'],['صَارُوخ','مَدٌّ بِالأَلِف وَالوَاو'],['قِنْدِيل','مَدٌّ بِاليَاء'],['مِيزَان','مَدٌّ بِاليَاء وَالأَلِف']],
 /* الحروف المتشابهة: كان يكرر كلمات «حروفي العربية الأولى» نفسها */
 '1-53':[['بُرْكَان','🌋 ب: نُقْطَةٌ وَاحِدَةٌ مِنْ تَحْت'],['تِمْسَاح','🐊 ت: نُقْطَتَانِ مِنْ فَوْق'],['ثَوْم','🧄 ث: ثَلَاثُ نِقَاطٍ مِنْ فَوْق'],['نَجْمَة','⭐ ن: نُقْطَةٌ وَاحِدَةٌ مِنْ فَوْق'],['يَقْطِين','🎃 ي: نُقْطَتَانِ مِنْ تَحْت'],['خَيْمَة','⛺ خ: نُقْطَةٌ مِنْ فَوْق'],['جَزِيرَة','🏝️ ج: نُقْطَةٌ فِي الوَسَط'],['حَلَزُون','🐌 ح: بِلَا نُقَط']],
 /* «كلمات عربية» في مرحلة القراءة كان يكرر كلمات موجودة في دروس كثيرة؛ صار درس قراءة كلمات قصيرة وتركيبها */
 /* المفرد والمثنى والجمع كان يكرر «كتاب، ولد» من درس التنوين */
 '3-7':[['قَلَمَان','مُثَنَّى'],['أَقْلَام','جَمْع'],['قَلَم','مُفْرَد'],['بِنْتَان','مُثَنَّى'],['بَنَات','جَمْع'],['بِنْت','مُفْرَد']],
 '2-1':[['نَار','🔥'],['جَرَس','🔔'],['عَلَم','🚩'],['تَاج','👑'],['رِيش','🪶'],['سُور','🧱']]};
for(const[id,items]of Object.entries(FIX)){const u=find0(id);if(u)u.i=items.map(x=>[x[0],x[1],'ar'])}
{const u=find0('2-1');if(u)u.n='أَقْرَأُ وَأُرَكِّبُ كَلِمَاتٍ قَصِيرَة'}
{const u=find0('3-6');if(u)u.n='هَمْزَةُ القَطْعِ وَالوَصْل (تَطْبِيق)'}
{const u=find0('3-3');if(u)u.n='الشَّدَّةُ أَمِ المَدّ؟'}
{const u=find0('2-51');if(u)u.n='ة أَمْ ت أَمْ ه؟ تَدْرِيبُ الوَقْف'}
/* عنوان الدرس كان «اللام الشمسية» وهو يعلّم الشمسية والقمرية معًا */
{const u=find0('2-3');if(u)u.n='اللَّامُ الشَّمْسِيَّةُ وَالقَمَرِيَّة'}
/* كلمة تكررت في درسين متتاليين عن اللام، وجملة تكررت بين درس الفاعل ودرس المفعول به */
{const rep=(id,from,to)=>{const u=find0(id);if(!u)return;const k=u.i.findIndex(x=>x[0]===from);if(k>=0)u.i[k]=[to[0],to[1],'ar']};
 rep('2-38','الرَّجُلُ',['الضِّفْدَعُ','🐸']);rep('4-24','سَقَى الفَلَّاحُ الزَّرْعَ',['قَطَفَ الوَلَدُ التُّفَّاحَةَ','التُّفَّاحَةَ مَفْعُولٌ بِهِ'])}

/* ---------------- ٢) نوع كل درس ---------------- */
const TYPE={
 '0-0':'letters','1-0':'letters','1-11':'letters','1-12':'letters','1-13':'letters','1-14':'letters',
 '1-1':'haraka','1-58':'syll','1-59':'segment','1-5':'madd','1-48':'shadda','1-53':'similar',
 '1-44':'build','1-45':'build','1-46':'build','1-47':'build','2-1':'build','1-4':'build',
 '0-10':'count','1-15':'numbers','2-21':'numbers',
 '2-6':'sequence','3-21':'sequence','3-33':'sequence','2-53':'sequence',
 '2-8':'sentence','4-11':'sentence','4-23':'sentence','4-33':'sentence','2-44':'sentence',
 '3-5':'verbsubj','4-24':'object',
 '2-3':'classify','2-52':'classify','3-13':'classify','2-4':'classify','2-51':'classify','2-50':'classify','3-6':'classify',
 '3-7':'classify','3-8':'classify','3-16':'classify','3-17':'classify','3-31':'classify','3-36':'classify','1-6':'classify','3-14':'classify','3-3':'classify',
 '2-38':'alpic','2-39':'alpic'};
const typeOf=u=>{if(!u||u.l!=='ar'||!u.i)return null;if(TYPE[u.id])return TYPE[u.id];const pics=u.i.filter(x=>isPic(x[1])).length;return pics>=u.i.length*.7?'vocab':'desc'};
window.lessonType=u=>typeOf(u||window.cur);

/* تسميات التصنيف: من وصف الكلمة */
const KW=[[/شمس/,'شَمْسِيَّة ☀️'],[/قمر/,'قَمَرِيَّة 🌙'],[/مربوط/,'تَاءٌ مَرْبُوطَة (ة)'],[/مفتوح/,'تَاءٌ مَفْتُوحَة (ت)'],[/^ه |هاء اصليه|هاءٌ أصلية|هاء أصلية/,'هَاءٌ أَصْلِيَّة (ه)'],
 [/قطع/,'هَمْزَةُ قَطْع (أ إ)'],[/وصل/,'هَمْزَةُ وَصْل (ا)'],[/مثنى/,'مُثَنًّى'],[/^جمع|جمع$/,'جَمْع'],[/مفرد/,'مُفْرَد'],[/فعلية/,'جُمْلَةٌ فِعْلِيَّة'],[/اسمية/,'جُمْلَةٌ اسْمِيَّة'],
 [/^فعل$/,'فِعْل'],[/^اسم$/,'اسْم'],[/مذكر/,'مُذَكَّر'],[/مؤنث/,'مُؤَنَّث'],[/ماض/,'مَاضٍ'],[/مضارع/,'مُضَارِع'],[/^أمر$|^امر$/,'أَمْر'],[/بالظاء/,'بِالظَّاء (ظ)'],[/بالضاد/,'بِالضَّاد (ض)'],
 [/ضمتان|تنوين ضم/,'تَنْوِينُ ضَمّ (ـٌ)'],[/فتحتان|تنوين فتح/,'تَنْوِينُ فَتْح (ـً)'],[/كسرتان|تنوين كسر/,'تَنْوِينُ كَسْر (ـٍ)'],[/شدة/,'شَدَّة (ـّ)'],[/مد/,'مَدّ (ا و ي)']];
const label=it=>{const t=strip(it[1]).replace(/[\p{Extended_Pictographic}️]/gu,'').trim();for(const[r,l]of KW)if(r.test(t))return l;return null};

/* ---------------- ٣) أدوات الحروف ---------------- */
const GR=/[ء-يٱ](?:[ً-ْٰ])*/g;
const graphemes=w=>String(w).match(GR)||[];
const AB='ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ');
const SIM={ب:'تثني',ت:'بثن',ث:'بتن',ن:'بتي',ي:'بنت',ج:'حخ',ح:'جخ',خ:'جح',د:'ذر',ذ:'دز',ر:'زد',ز:'رذ',س:'شص',ش:'سص',ص:'ضس',ض:'صظ',ط:'ظت',ظ:'طض',ع:'غه',غ:'عق',ف:'قث',ق:'فك',ك:'قل',ل:'كن',م:'نب',ه:'ةع',و:'رز',ا:'لو'};
const base=g=>strip(g).replace(/[أإآ]/,'ا').replace('ة','ه');
const distract=(g,n=3)=>{const b=base(g),sim=(SIM[b]||'').split('').filter(x=>x!==b),rest=shuf(AB.filter(x=>x!==b&&!sim.includes(x)));
 const marks=(g.match(/[ً-ْٰ]/g)||[]).join('');return[...sim,...rest].slice(0,n).map(x=>x+marks)};
/* أول حرف بعد «ال» */
const firstG=w=>{const g=graphemes(w);if(g.length>2&&base(g[0])==='ا'&&base(g[1])==='ل')return{g:g[2],i:2,all:g};return{g:g[0],i:0,all:g}};

/* ---------------- ٤) مولّدات التمارين ---------------- */
const pool=u=>u.i.filter(x=>x&&x[0]);
const SPK=it=>[it[0],it[2]||'ar'];
/* الكلمة كما تُركَّب من حروفها (بلا تنوين ظاهر): تُنطق بالوقف «جَدّ، قِطَّةْ» لا «جَدٌّ، قِطَّةٌ» — النطق يطابق المكتوب */
const WAQF=w=>/[\u064B-\u0650\u0652]$/.test(w)||/[^\u0621-\u064A\u064B-\u0652\u0670]/.test(w)?w:w+'\u0652';
const SPKW=it=>(it[2]||'ar')==='ar'?[WAQF(it[0]),'ar']:SPK(it);
const exOf=it=>[`الصحيح: ${it[0]} ${isPic(it[1])?it[1]:'— '+it[1]}`,`استمع 🔊 ثم انظر: ${it[0]} ⟵ ${it[1]}`];
const others=(u,it,f)=>shuf(pool(u).filter(x=>x!==it&&(f?f(x):true)));
const mkQ=(k,show,opts,okIdx,extra)=>Object.assign({k,m:0,l:'ar',show,opts:opts.map((h,i)=>({h,ok:i===okIdx})),ex:['','']},extra||{});
function mcq(it,show,right,wrongs,extra){const o=shuf([right,...wrongs.filter(w=>w!==right)].filter((x,i,a)=>a.indexOf(x)===i).slice(0,4));if(o.length<2)return null;return mkQ(it[0],show,o,o.indexOf(right),Object.assign({ex:exOf(it)},extra))}
const Q={
 /* الصورة ← الكلمة */
 pic(u,it){if(!isPic(it[1]))return null;return mcq(it,`<div class=q>${it[1]}</div><p class=mut>${/sound|يَفْعَلُ|يفعل|أصوات|أَصْوَات/i.test(u&&u.n||'')?(u.l==='en'?'What sound does it make? — مَاذَا يَقُولُ هَذَا الْحَيَوَانُ؟':'مَاذَا يَفْعَلُ هَذَا الْحَيَوَانُ؟'):/\s/.test(String(it[0]).trim())?'أَيُّ جُمْلَةٍ تُنَاسِبُ الصُّورَة؟':'مَا اسْمُ هَذِهِ الصُّورَة؟'}</p>`,it[0],others(u,it,x=>x[0]!==it[0]).map(x=>x[0]))},
 /* اسمع ← اختر الصورة */
 listenPic(u,it){if(!isPic(it[1]))return null;return mcq(it,`<div class=q>🔊</div><p class=mut>اسْتَمِعْ ثُمَّ اخْتَرِ الصُّورَة</p>`,it[1],others(u,it,x=>x[1]!==it[1]&&isPic(x[1])).map(x=>x[1]),{sp:SPK(it),m:1})},
 /* الكلمة ← المعنى/الوصف */
 meaning(u,it){return mcq(it,`<div class=q>${esc(it[0])}</div><p class=mut>${isPic(it[1])?'أَيْنَ صُورَتُهَا؟':'مَا مَعْنَاهَا؟'}</p>`,it[1],others(u,it,x=>x[1]!==it[1]).map(x=>x[1]),{sp:SPK(it),m:2})},
 /* الوصف ← الكلمة */
 reverse(u,it){if(isPic(it[1]))return null;return mcq(it,`<div class=q style="font-size:1.4rem">${esc(it[1])}</div><p class=mut>اخْتَرِ الكَلِمَةَ المُنَاسِبَة</p>`,it[0],others(u,it,x=>x[1]!==it[1]).map(x=>x[0]))},
 /* اسمع الكلمة ← اخترها مكتوبة */
 listenWord(u,it){return mcq(it,`<div class=q>🔊</div><p class=mut>اسْتَمِعْ، ثُمَّ اخْتَرِ الكَلِمَةَ الَّتِي سَمِعْتَهَا</p>`,it[0],others(u,it,x=>x[0]!==it[0]).map(x=>x[0]),{sp:SPK(it),m:1})},
 /* بأي حرف تبدأ؟ */
 first(u,it){const w=it[0];if(/\s/.test(w))return null;const f=firstG(w);if(!f.g)return null;const right=base(f.g);
  return mcq(it,`<div class=q>${isPic(it[1])?it[1]:esc(w)}</div><p class=mut>بِأَيِّ حَرْفٍ تَبْدَأُ كَلِمَةُ «${esc(w)}»${f.i?' بَعْدَ «ال»':''}؟</p>`,right,distract(right).map(base),{sp:SPK(it),ex:[`«${w}» تَبْدَأُ بِحَرْفِ ${right}`,`انظر إلى أول الكلمة${f.i?' بعد ال':''}: ${right}`]})},
 /* الحرف الناقص */
 missing(u,it){const w=it[0];if(/\s/.test(w))return null;const g=graphemes(w);if(g.length<3)return null;const i=1+Math.floor(Math.random()*(g.length-1)),right=g[i];
  const shown=g.map((x,j)=>j===i?'<i class=gap>؟</i>':`<span>${x}</span>`).join('');
  return mcq(it,`<div class=q>${isPic(it[1])?it[1]:''}</div><div class=spell dir=rtl>${shown}</div><p class=mut>مَا الحَرْفُ النَّاقِص؟</p>`,right,distract(right),{sp:SPKW(it),ex:[`الكلمة كاملة: ${w} — الحرف الناقص: ${right}`,`استمع جيدًا: ${w}`]})},
 /* تركيب الكلمة من حروفها */
 build(u,it){const w=it[0];if(/\s/.test(w))return null;const g=graphemes(w);if(g.length<2||g.length>8)return null;
  return{k:w,m:4,l:'ar',sp:SPKW(it),w:'build',tiles:shuf([...g,...(g.length<5?distract(g[1],1):[])]),target:g,hint:isPic(it[1])?it[1]:'',ex:[`الكلمة: ${w}`,`ابدأ بالحرف ${g[0]} ثم ${g[1]}`]}},
 /* أين الشدة؟ */
 shadda(u,it){const g=graphemes(it[0]),i=g.findIndex(x=>x.includes('ّ'));if(i<0)return null;
  return mcq(it,`<div class=q>${isPic(it[1])?it[1]:''}</div><div class=q>${esc(it[0])}</div><p class=mut>أَيُّ حَرْفٍ عَلَيْهِ شَدَّة؟</p>`,base(g[i]),g.filter((x,j)=>j!==i).map(base),{sp:SPK(it),ex:[`الشدة على حرف ${base(g[i])} في «${it[0]}»`,`الشدة تعني الحرف مكررًا: ${base(g[i])}${base(g[i])}`]})},
 /* المد: أي حرف مد في الكلمة؟ */
 madd(u,it){const g=graphemes(it[0]),i=g.findIndex((x,j)=>j>0&&/^[اوي]$/.test(x));if(i<0)return null;
  return mcq(it,`<div class=q>${isPic(it[1])?it[1]:''} ${esc(it[0])}</div><p class=mut>مَا حَرْفُ المَدِّ فِي الكَلِمَة؟</p>`,g[i],['ا','و','ي'].filter(x=>x!==g[i]).concat(['ب']),{sp:SPK(it),ex:[`حرف المد في «${it[0]}» هو ${g[i]}`,`المد يُطيل الصوت: ${it[0]}`]})},
 /* التصنيف */
 classify(u,it){const L=[...new Set(pool(u).map(label).filter(Boolean))],r=label(it);if(!r||L.length<2)return null;
  const o=L.length>4?shuf([r,...shuf(L.filter(x=>x!==r)).slice(0,3)]):L;return mkQ(it[0],`<div class=q>${esc(it[0])}</div><p class=mut>اخْتَرِ التَّصْنِيفَ الصَّحِيح</p>`,o,o.indexOf(r),{sp:SPK(it),ex:[`«${it[0]}»: ${it[1]}`,`استمع جيدًا: ${it[0]} — ${r}`]})},
 /* اختر الكلمة التي من صنف معيّن */
 pickClass(u,it){const r=label(it);if(!r)return null;const wr=others(u,it,x=>label(x)&&label(x)!==r).map(x=>x[0]).slice(0,3);if(wr.length<2)return null;
  return mcq(it,`<div class=q style="font-size:1.35rem">أَيُّ كَلِمَةٍ: ${r}؟</div>`,it[0],wr,{ex:[`«${it[0]}»: ${r}`,`انظر جيدًا إلى «${it[0]}»`]})},
 /* اللام الشمسية/القمرية بالصور: الحرف بعد ال */
 afterAl(u,it){const f=firstG(it[0]);if(!f.i)return null;const right=base(f.g);
  return mcq(it,`<div class=q>${isPic(it[1])?it[1]:''} ${esc(it[0])}</div><p class=mut>مَا الحَرْفُ الَّذِي يَأْتِي بَعْدَ «ال»؟</p>`,right,distract(right).map(base),{sp:SPK(it),ex:[`بعد «ال» حرف ${right}`,`استمع: ${it[0]}`]})},
 /* الحركات: اسمع واختر الشكل الصحيح */
 haraka(u,it){const all=pool(u).map(x=>x[0]);return mcq(it,`<div class=q>🔊</div><p class=mut>اسْتَمِعْ، ثُمَّ اخْتَرْ مَا سَمِعْت</p>`,it[0],shuf(all.filter(x=>x!==it[0])),{sp:SPK(it),m:1,ex:[`سمعت ${it[0]}: ${it[1]}`,`استمع مرة أخرى: ${it[0]}`]})},
 /* العدّ */
 count(u,it){if(!/🍎|⭐|🍏/.test(it[1]))return null;return mcq(it,`<div class="q vq-obs">${it[1]}</div><p class=mut>كَمْ عَدَدُهَا؟</p>`,it[0],others(u,it).map(x=>x[0]),{sp:null})},
 /* الأعداد: الرقم ← الكلمة */
 num2word(u,it){return mcq(it,`<div class=q>${esc(it[1])}</div><p class=mut>اخْتَرِ اسْمَ العَدَد</p>`,it[0],others(u,it).map(x=>x[0]))},
 /* ترتيب سلسلة (أيام، أشهر، أعداد) */
 order(u,it){const P0=pool(u);if(P0.length<4)return null;const s=Math.floor(Math.random()*(P0.length-3)),seq=P0.slice(s,s+4).map(x=>x[0]);
  return{k:'ord:'+u.id,m:5,l:'ar',w:'order',tiles:shuf(seq),target:seq,title:'رَتِّبْ بِالتَّرْتِيبِ الصَّحِيح',ex:[`الترتيب: ${seq.join('، ')}`,`ابدأ بـ «${seq[0]}»`]}},
 /* ما الذي يأتي بعد؟ */
 next(u,it){const P0=pool(u),i=P0.indexOf(it);if(i<0||i>=P0.length-1)return null;const r=P0[i+1][0];
  return mcq(it,`<div class=q>${esc(it[0])}</div><p class=mut>مَا الَّذِي يَأْتِي بَعْدَهُ؟</p>`,r,P0.filter(x=>x[0]!==r&&x!==it).map(x=>x[0]),{sp:SPK(it),ex:[`بعد «${it[0]}» يأتي «${r}»`,`الترتيب: ${P0.map(x=>x[0]).join('، ')}`]})},
 /* ترتيب كلمات الجملة */
 sentence(u,it){const ws=it[0].split(/\s+/).filter(Boolean);if(ws.length<2||ws.length>7)return null;
  return{k:it[0],m:5,l:'ar',sp:SPK(it),w:'order',tiles:shuf(ws),target:ws,hint:isPic(it[1])?it[1]:'',title:'رَتِّبِ الكَلِمَاتِ لِتُكَوِّنَ جُمْلَة',ex:[`الجملة: ${it[0]}`,`تبدأ الجملة بـ «${ws[0]}»`]}},
 /* الكلمة الناقصة في الجملة */
 missWord(u,it){const ws=it[0].split(/\s+/);if(ws.length<3)return null;const i=1+Math.floor(Math.random()*(ws.length-1)),r=ws[i];
  const wr=shuf(pool(u).flatMap(x=>x[0].split(/\s+/)).filter(w=>strip(w)!==strip(r)));
  return mcq(it,`<div class=q style="font-size:1.4rem">${isPic(it[1])?it[1]+'<br>':''}${ws.map((w,j)=>j===i?'<i class=gap>…</i>':esc(w)).join(' ')}</div><p class=mut>أَكْمِلِ الجُمْلَة</p>`,r,wr,{ex:[`الجملة: ${it[0]}`,`استمع: ${it[0]}`],sp:null})},
 /* الفعل والفاعل */
 verb(u,it){const ws=it[0].split(/\s+/);return mcq(it,`<div class=q style="font-size:1.4rem">${esc(it[0])}</div><p class=mut>مَا الفِعْلُ فِي الجُمْلَة؟</p>`,ws[0],ws.slice(1),{sp:SPK(it),ex:[`الفعل: ${ws[0]} (يدل على حدث)`,`الفعل في أول الجملة الفعلية: ${ws[0]}`]})},
 subject(u,it){const ws=it[0].split(/\s+/);if(ws.length<2)return null;return mcq(it,`<div class=q style="font-size:1.4rem">${esc(it[0])}</div><p class=mut>مَنِ الَّذِي قَامَ بِالفِعْل (الفَاعِل)؟</p>`,ws[1],[ws[0],...ws.slice(2)],{sp:SPK(it),ex:[`الفاعل: ${ws[1]} — هو الذي ${ws[0]}`,`اسأل: مَنْ ${ws[0]}؟`]})},
 object(u,it){const r=String(it[1]).split(/\s+/)[0];const ws=it[0].split(/\s+/);if(!ws.some(w=>strip(w)===strip(r)))return null;
  return mcq(it,`<div class=q style="font-size:1.4rem">${esc(it[0])}</div><p class=mut>مَا المَفْعُولُ بِهِ؟</p>`,ws.find(w=>strip(w)===strip(r)),ws.filter(w=>strip(w)!==strip(r)),{sp:SPK(it),ex:[`المفعول به: ${r} — وقع عليه الفعل`,`اسأل: ماذا ${ws[0]}؟`]})},
 /* تقطيع الكلمة إلى مقاطع */
 segment(u,it){return mcq(it,`<div class=q>${esc(it[0])}</div><p class=mut>كَيْفَ نُقَطِّعُ هَذِهِ الكَلِمَة؟</p>`,it[1],others(u,it).map(x=>x[1]),{sp:SPK(it)})}
};
const PLAN={
 vocab:['pic','listenPic','first','missing','build'],letters:['first','listenPic','missing','pic'],build:['build','missing','listenPic','first'],
 haraka:['haraka','meaning','reverse'],syll:['haraka','meaning','reverse'],segment:['segment','build','listenWord'],
 madd:['madd','build','listenPic','missing'],shadda:['shadda','build','listenPic','pic'],similar:['first','meaning','listenWord'],
 count:['count','reverse','listenWord'],numbers:['num2word','reverse','listenWord','order'],sequence:['order','next','meaning'],
 sentence:['sentence','missWord','meaning'],verbsubj:['verb','subject','sentence'],object:['object','sentence','missWord'],
 classify:['classify','pickClass','listenWord','classify'],alpic:['listenPic','afterAl','pic','build'],desc:['meaning','reverse','listenWord']};
function build(u,n=5){const t=typeOf(u);const plan=PLAN[t]||PLAN.vocab,items=shuf(pool(u)),out=[];let k=0,guard=0;
 while(out.length<n&&guard++<60){const g=Q[plan[k%plan.length]],it=items[out.length%items.length];k++;let q=null;try{q=g&&g(u,it)}catch(e){q=null}
  if(q&&!out.some(x=>x.w==='order'&&q.w==='order'&&x.k===q.k))out.push(q)}
 /* احتياط: إن لم تكفِ الأنواع نكمل بالمعنى */
 while(out.length<n&&items.length>=2){const it=items[out.length%items.length];out.push(Q.meaning(u,it))}
 return out}
window.ArLessonQuiz=build;

/* ---------------- ٥) ربطه بالاختبار ---------------- */
const isArLesson=c=>!!(c&&c.id&&/^\d+-\d+$/.test(c.id)&&c.l==='ar'&&c.i&&c.i.length>=2&&!c.qs&&!c.mk);
const oQuiz=window.quiz;
window.quiz=function(){const c=window.cur;if(isArLesson(c)){try{V='quiz';qs=build(c,5);qi=0;sc=0;try{window.MindCoach&&MindCoach.newQuiz()}catch(e){}return q()}catch(e){}}return oQuiz.apply(this,arguments)};
/* تمارين اللمس تُعرض داخل واجهة الاختبار نفسها (شريط التقدم والقلوب ولوحة التصحيح)، ثم نربط الأزرار */
const wHTML=x=>{const title=x.w==='build'?'رَكِّبِ الكَلِمَةَ: اضْغَطِ الحُرُوفَ بِالتَّرْتِيب':x.title;
 return `<p class="mut w-title">${title}</p>${x.hint?`<div class=q>${x.hint}</div>`:''}<div class="ans-row ${x.w}" id=ansr dir=rtl></div><div class="tiles ${x.w}" id=tls dir=rtl>${x.tiles.map((t,i)=>`<button class=tile data-i=${i}>${esc(t)}</button>`).join('')}</div><div class=w-act><button class=alt id=wclr>↩︎ تراجع</button></div>`};
const oQ=window.q;
window.q=function(){const x=qs&&qs[qi];if(x&&x.w){x.show=wHTML(x);x.opts=[]}const r=oQ.apply(this,arguments);if(x&&x.w)try{bind(x)}catch(e){}return r};
function bind(x){const ans=[],A=document.getElementById('ansr'),T=document.getElementById('tls'),U=document.getElementById('wclr');if(!A||!T)return;
 const draw=()=>{A.innerHTML=ans.map(i=>`<button class="tile on" data-a=${i}>${esc(x.tiles[i])}</button>`).join('')||'<span class=mut>…</span>';T.querySelectorAll('.tile').forEach(b=>b.disabled=ans.includes(+b.dataset.i))};
 let done=false;const check=()=>{if(done)return;done=true;const got=ans.map(i=>x.tiles[i]),ok=got.length===x.target.length&&got.every((g,i)=>strip(g)===strip(x.target[i]));
  A.classList.add(ok?'ok':'no');T.querySelectorAll('.tile').forEach(b=>b.disabled=true);if(U)U.disabled=true;
  if(!ok)A.insertAdjacentHTML('afterend',`<div class="ans-row ok sol" dir=rtl>${x.target.map(t=>`<span class="tile on">${esc(t)}</span>`).join('')}</div>`);
  window.__chosen=got.join(x.w==='build'?'':' ');rec(x,ok)};
 T.onclick=e=>{const b=e.target.closest('.tile');if(!b||b.disabled||done)return;ans.push(+b.dataset.i);draw();if(ans.length===x.target.length)setTimeout(check,250)};
 A.onclick=e=>{const b=e.target.closest('.tile');if(!b||done)return;const i=ans.indexOf(+b.dataset.a);if(i>=0){ans.splice(i,1);draw()}};
 if(U)U.onclick=()=>{if(!done){ans.pop();draw()}};draw()}

/* ---------------- ٦) مقدمة بومي لكل درس ---------------- */
const GOAL={vocab:'سَنَتَعَلَّمُ كَلِمَاتٍ جَدِيدَةً بِالصُّوَر، ثُمَّ نَتَدَرَّبُ عَلَى قِرَاءَتِهَا وَتَرْكِيبِهَا.',letters:'سَنَتَعَرَّفُ عَلَى حُرُوفٍ جَدِيدَة، وَنَسْمَعُ كَلِمَاتٍ تَبْدَأُ بِهَا.',
 build:'سَنَقْرَأُ كَلِمَاتٍ قَصِيرَة، ثُمَّ نُرَكِّبُهَا حَرْفًا حَرْفًا.',haraka:'سَنَسْمَعُ الحَرَكَات، وَنُفَرِّقُ بَيْنَ الفَتْحَةِ وَالضَّمَّةِ وَالكَسْرَةِ وَالسُّكُونِ وَالشَّدَّة.',
 syll:'سَنَتَعَرَّفُ عَلَى المَقَاطِعِ القَصِيرَةِ وَالطَّوِيلَة.',segment:'سَنُقَطِّعُ الكَلِمَاتِ إِلَى مَقَاطِع، ثُمَّ نُرَكِّبُهَا.',madd:'سَنَتَعَلَّمُ حُرُوفَ المَدّ: الأَلِفَ وَالوَاوَ وَاليَاء.',
 shadda:'سَنَتَعَلَّمُ الشَّدَّة، وَنَعْرِفُ عَلَى أَيِّ حَرْفٍ تَكُون.',similar:'سَنُفَرِّقُ بَيْنَ الحُرُوفِ المُتَشَابِهَةِ بِعَدَدِ النِّقَاطِ وَمَكَانِهَا.',
 count:'سَنَعُدُّ مَعًا مِنْ وَاحِدٍ إِلَى خَمْسَة.',numbers:'سَنَتَعَلَّمُ أَسْمَاءَ الأَعْدَادِ وَتَرْتِيبَهَا.',sequence:'سَنَتَعَلَّمُ الأَسْمَاءَ وَتَرْتِيبَهَا الصَّحِيح.',
 sentence:'سَنَقْرَأُ جُمَلًا مُفِيدَة، ثُمَّ نُرَتِّبُ كَلِمَاتِهَا.',verbsubj:'سَنَعْرِفُ الفِعْلَ وَالفَاعِلَ فِي الجُمْلَة.',object:'سَنَعْرِفُ المَفْعُولَ بِهِ فِي الجُمْلَة.',
 classify:'سَنَتَعَلَّمُ القَاعِدَة، ثُمَّ نُصَنِّفُ الكَلِمَاتِ بِحَسَبِهَا.',alpic:'سَنَسْمَعُ كَيْفَ تُنْطَقُ «ال» قَبْلَ الكَلِمَات.',desc:'سَنَتَعَلَّمُ الكَلِمَاتِ وَمَعَانِيَهَا.'};
window.lessonIntro=c=>{c=c||window.cur;if(!c||!c.n)return'';const t=typeOf(c);const g=GOAL[t]||'سَنَتَعَلَّمُ شَيْئًا جَدِيدًا.';
 return c.l==='ar'?`دَرْسُ: ${c.n}. ${g} اضْغَطْ عَلَى كُلِّ بِطَاقَةٍ لِتَسْمَع، ثُمَّ ابْدَأِ الِاخْتِبَار.`:`دَرْسُ: ${c.n}. سَنَتَعَلَّمُ كَلِمَاتٍ إِنْجِلِيزِيَّةً جَدِيدَة. اضْغَطْ عَلَى كُلِّ بِطَاقَةٍ لِتَسْمَع، ثُمَّ ابْدَأِ الِاخْتِبَار.`};
window.ArLessonTypes={TYPE,PLAN,Q,label,graphemes,typeOf};
})();
