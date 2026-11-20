/* الأداء: محتوى القوائم المطوية (details) يُبنى عند فتحها فقط؛ كانت صفحة «الدروس» تبني ~٢٨٠٠ عنصر مخفي وتشكّلها وتعالج صورها في كل زيارة */
window.lzList=(()=>{const M=new Map();let n=0;
 document.addEventListener('toggle',e=>{const d=e.target;if(!d||!d.open||!d.querySelector)return;const L=d.querySelector(':scope>[data-lz]');if(!L)return;const k=L.dataset.lz;if(M.has(k)){L.innerHTML=M.get(k);M.delete(k);L.removeAttribute('data-lz')}},true);
 return (html,cls)=>{const k='z'+(++n);if(M.size>400)M.clear();M.set(k,html);return `<div class="${cls||'list'}" data-lz="${k}"></div>`}})();
/* nav.js — شريط تنقل ثابت + أقسام مستقلة (دروس/عربي/إنجليزي/رياضيات/ألعاب/إنجازات) + مهارات رياضيات جديدة */
MS.tbl='جدول الضرب ١–١٢';MS.cry='الجمع مع الحمل';MS.bor='الطرح مع الاستلاف';
const omq=mq;mq=function(k,l){if(!['tbl','cry','bor'].includes(k))return omq(k,l);
const ar=P.lang=='ar'||(P.lang=='both'&&Math.random()<.5),D=n=>ar?String(n).replace(/\d/g,d=>AR[d]):String(n),r=(a,b)=>a+Math.floor(Math.random()*(b-a+1));let a,b,ans,op,sp,ex;
if(k=='tbl'){a=r(2,[5,10,12,12][l-1]);b=r(2,[5,10,12,12][l-1]);ans=a*b;op='×';sp=`${a} ضرب ${b}`;ex=[`${D(a)} ضرب ${D(b)} يعني نجمع ${D(a)} عدداً ${D(b)} مرات`,`عدّ بالقفزات: ${Array.from({length:Math.min(b,6)},(_,i)=>D(a*(i+1))).join('، ')}…`]}
else if(k=='cry'){const u=r(5,9);a=r(1,[3,5,9,9][l-1])*10+u;b=r(1,[3,5,9,9][l-1])*10+r(11-u>9?9:11-u,9)%10||9;if(l>2)a+=r(1,9)*100;ans=a+b;op='+';sp=`${a} زائد ${b}`;ex=['اجمع الآحاد أولاً. إذا زاد المجموع على ٩ اكتب الآحاد واحمل العشرة للخانة التالية','اجمع العشرات مع العشرة المحمولة، ثم اكتب الناتج']}
else{b=r(1,[5,9,9,9][l-1]);a=r(1,[3,5,9,9][l-1])*10+r(0,b-1<0?0:b-1);b=r(1,9)>0&&b;a=(r(1,[3,5,9,9][l-1])*10)+r(0,Math.max(0,b-1));if(l>2)a+=r(1,9)*100;ans=a-b;op='−';sp=`${a} ناقص ${b}`;ex=['إذا كان رقم الآحاد في العدد الأعلى أصغر، نستلف عشرة من الخانة التي بعدها','بعد الاستلاف تصير الآحاد أكبر ونستطيع الطرح']}
const o=new Set([ans]);let t=0;while(o.size<4&&t++<50)o.add(Math.max(0,ans+(r(-3,3)||4)*(Math.random()<.5?1:10)));
return{k:'m-'+k,show:`<div class=q dir=ltr>${D(a)} ${op} ${D(b)} = ؟</div>`,opts:[...o].sort(()=>Math.random()-.5).map(x=>({h:D(x),ok:x==ans})),ex,sp:[sp,'ar'],l:ar?'ar':'en'}};
const NAV=[['home','🏠','الرئيسية',()=>home()],['les','📖','الدروس',()=>sec('les')],['math','🔢','الرياضيات',()=>sec('math')],['games','🎮','الألعاب',()=>sec('games')],['ach','🏆','إنجازاتي',()=>sec('ach')],['set','⚙️','الإعدادات',()=>parent()]];
const nv=document.createElement('header');nv.id='gn';nv.innerHTML=`<div class=logo><img src="img/icon.png" alt=""><b>حروفي</b></div><nav>${NAV.map((n,i)=>`<button data-k=${n[0]} onclick="NAV[${i}][3]()"><span>${n[1]}</span>${n[2]}</button>`).join('')}</nav>`;
document.body.insertBefore(nv,document.body.firstChild);
const oh2=h;h=x=>{oh2(x);const show=!!P&&!['setup','who','quiz'].includes(V);nv.style.display=show?'flex':'none';document.body.classList.toggle('hasnav',show);
nv.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k==(V=='home'?'home':window.CS||'')))};
const rid=()=>{const c=coach();return c&&c.u.id};
const bt=u=>`<button class="row${u.id==rid()?' rec':''}" onclick="lesson('${u.id}')"><span>${P.done[u.id]?'✅':'⭐'}</span><b>${u.n}</b><small>${P.sc[u.id]!=null?P.sc[u.id]+'/5':''}</small></button>`;
/* لا نعرض كل الدروس دفعة واحدة؛ كل مرحلة قائمة مستقلة تُفتح عند الضغط عليها. */
const byLang=l=>S.map((s,a)=>({s,a,u:s.u.filter(u=>u.l==l)})).filter(x=>x.u.length).map(x=>`<details class="lesson-menu"><summary><span><b>${x.s.n}</b><small>${x.s.a} سنوات · ${x.u.length} درس</small></span><i>⌄</i></summary>${lzList(x.u.map(bt).join(''))}</details>`).join('');
const mathList=()=>`<div class=list>${Object.keys(MS).map(k=>`<button class=row onclick="mstart('${k}')"><span>${mp(k).d?'✅':'🔢'}</span><b>${MS[k]}</b><small>مستوى ${mp(k).l}/4</small></button>`).join('')}${['g1','g2','g3'].map(g=>`<button class=row onclick="lesson('${g}')"><span>${P.done[g]?'✅':'🔷'}</span><b>${G[g].n}</b></button>`).join('')}<button class=row onclick=wnum()><span>✍️</span><b>كتابة الأرقام بالإصبع</b></button></div>`;
/* صفحة إنجازاتي: تُبنى من بيانات الطالب الحقيقية (الدروس المتقنة والتي بدأها، الرياضيات، القصص، الكورس، الأنشطة).
   إن لم يبدأ أي شيء تظهر رسالة البداية مع زر لأول درس مناسب. */
function achBody(){const sf=id=>{try{return find(id)}catch(e){return null}},K=o=>Object.keys(o||{});
 const done=K(P.done).map(sf).filter(Boolean),started=K(P.sc).filter(id=>!P.done[id]).map(sf).filter(Boolean),
  ml=K(P.ml).filter(k=>MS[k]&&(P.ml[k].d||(P.ml[k].l||1)>1||P.ml[k].s!=null)),st=K(P.stories).length,cd=K(P.courseDone).length,ac=K(P.act).length,ch=K(P.cd).length;
 const any=done.length||started.length||ml.length||st||cd||ac||ch||(P.star||0)>0;
 const nx=window.nextLesson&&(nextLesson(P.lang==='en'?'en':'ar')||nextLesson('en'));
 const tile=(i,n,t)=>`<div>${i}<br><b>${n}</b><small>${t}</small></div>`;
 const row=u=>{const s=P.sc[u.id];return `<button class=row onclick="lesson('${u.id}')"><span>${P.done[u.id]?'✅':'📘'}</span><b>${u.n}</b><small>${s!=null?s+'/5':''}</small></button>`};
 let h=`<div class="sum ach-sum">${tile('⭐',P.star||0,'نجمة')}${tile('✅',done.length,'درس متقن')}${tile('📘',started.length,'درس بدأته')}${tile('🎯',ch,'تحدٍّ يومي')}</div>`;
 h+=(P.star||0)>=50?'<button class=big onclick=cert()>🏆 شهادة إنجاز</button>':`<p class=mut>اجمع ${50-(P.star||0)} نجمة للحصول على الشهادة</p>`;
 if(!any)return h+`<div class=ach-empty><span>🦉</span><h3>ابدأ درسك الأول!</h3><p class=mut>عندما تُنهي الدروس ستظهر إنجازاتك ونجومك وشاراتك هنا.</p>${nx?`<button class=big onclick="lesson('${nx.id}')">▶️ ابدأ: ${nx.n}</button>`:''}</div>`;
 h+=`<h3>✅ الدروس المتقنة (${done.length})</h3><div class=list>${done.map(row).join('')||`<p class=mut>لم تُتقن درسًا بعد — تحتاج ٤ من ٥ في اختبار الدرس.</p>`}</div>`;
 if(started.length)h+=`<h3>📘 دروس بدأتها ولم تُتقنها بعد</h3><div class=list>${started.map(row).join('')}</div>`;
 if(ml.length)h+=`<h3>🔢 مهارات الرياضيات</h3><div class=list>${ml.map(k=>`<button class=row onclick="mstart('${k}')"><span>${P.ml[k].d?'🏆':'🔢'}</span><b>${MS[k]}</b><small>مستوى ${P.ml[k].l||1}/4</small></button>`).join('')}</div>`;
 const more=[[st,'📚','قصة مقروءة','stories()'],[cd,'🗂️','مادة كورس مكتملة',"sec('les')"],[ac,'🎨','نشاط منجز','act()']].filter(x=>x[0]&&typeof window[x[3].slice(0,-2)]==='function');
 if(more.length)h+=`<h3>🌟 إنجازات أخرى</h3><div class=list>${more.map(x=>`<button class=row onclick="${x[3]}"><span>${x[1]}</span><b>${x[0]} ${x[2]}</b></button>`).join('')}</div>`;
 if(nx)h+=`<button class=big onclick="lesson('${nx.id}')">▶️ الدرس التالي: ${nx.n}</button>`;
 return h}
function sec(k){V='sec';window.CS=k;ens();const dc=dueN();
const T={les:['📖 الدروس',`<h3>🔤 العربية</h3>${byLang('ar')}<h3>🔠 English</h3>${byLang('en')}`],ar:['🔤 اللغة العربية',byLang('ar')+`<div class=list>${bt(G.g1)}</div>`],en:['🔠 English',byLang('en')+`<div class=list>${bt(G.g2)}</div>`],math:['🔢 الرياضيات',mathList()],
games:['🎮 الألعاب',`<div class=list><button class=row onclick=daily()><span>🎯</span><b>${P.cd[day()]?'تحدي اليوم (أُنجز)':'تحدي اليوم +٣ ⭐'}</b></button><button class=row onclick=speak()><span>🎤</span><b>تدريب النطق</b></button>${dc?`<button class=row onclick=review()><span>🔁</span><b>مراجعة ذكية</b><small>${dc}</small></button>`:''}<button class=row onclick="mstart('tbl')"><span>✖️</span><b>لعبة جدول الضرب</b></button><button class=row onclick="mstart('cmp')"><span>⚖️</span><b>أكبر أم أصغر؟</b></button></div>`],
ach:['🏆 إنجازاتي',achBody()]};
const[t,b]=T[k];h(`<section class=sec><h2>${t}</h2>${b}</section>`)}
function home(){V='home';window.CS='home';ens();const st=P.stage,us=units(st),dn=us.filter(u=>P.done[u.id]).length,c=coach(),pc=us.length?Math.round(dn/us.length*100):0;
const IC={ar:'<i class="ico ico-ar"><b>أ</b><em>📖</em></i>',en:'<i class="ico ico-en" dir=ltr><b>A</b><b>B</b><b>C</b></i>',math:'<i class="ico ico-math"><b>+</b><b>−</b><b>×</b><b>÷</b></i>',games:'<i class="ico ico-em">🎮</i>',ach:'<i class="ico ico-em ico-cup">🏆<s>✦</s><s>✦</s></i>',les:'<i class="ico ico-em">📚</i>'};
const tl=[[IC.ar,'اللغة العربية','حروف وكلمات',"sec('ar')"],[IC.en,'English','Learn English',"sec('en')"],[IC.math,'الرياضيات','أرقام وحساب',"sec('math')"],[IC.ach,'إنجازاتي','⭐ '+P.star,"sec('ach')"],[IC.games,'الألعاب','تعلّم بالمرح',"sec('games')"],[IC.les,'كل الدروس','خطوة بخطوة',"bank()"],['📚','القصص','قصص مصوّرة للقراءة',"stories()"]];
/* الواجهة الجديدة (ui2.css): ترحيب كبير + زر البدء + بطاقات الأكاديميات الأربع + لوحة ولي الأمر، ثم تعلّم والعب */
const go=c?`lesson('${c.u.id}')`:"sec('les')";
h(`<section class="h2-hero"><div class=h2-cloud></div><img class=h2-castle src="img/3d/1f3f0.webp" alt=""><span class="h2-star s1">⭐</span><span class="h2-star s2">✨</span>
<div class=h2-txt><h1>مرحبًا بك في<b>البومة التعليمية الذكية</b></h1><p>تعلّم بمتعة.. وحقّق إنجازات رائعة!</p><button class=h2-cta onclick="${go}">▶ ابدأ رحلتك التعليمية</button></div></section>
${(()=>{/* الخطوة التالية يقررها عقل بومي (mind/hub.js): مراجعة حان موعدها، أو مهارة ضعيفة، أو الدرس التالي */let nx=null;try{nx=window.Mind&&Mind.next()}catch(e){}
 if(!nx&&c)nx={icon:'▶️',t:c.u.n,go:`lesson('${c.u.id}')`};if(!nx)return'';
 return `<button class="nx h2-next" onclick="${nx.go.replace(/"/g,'&quot;')}"><span>${nx.icon}</span><div><small>الخطوة التالية لك${nx.why?' · '+nx.why:''}</small><b>${nx.t}</b></div></button>`})()}
<div class=h2-acad>
<button class="h2-card ar" onclick="sec('ar')"><span class=h2-ic>ض</span><b>أكاديمية العربية</b><small>حروف .. قراءة .. كتابة</small><i class=h2-go>ابدأ الآن ▶</i></button>
<button class="h2-card en" onclick="sec('en')"><span class=h2-ic dir=ltr>ABC</span><b>أكاديمية الإنجليزية</b><small dir=ltr>Letters • Phonics • Words</small><i class=h2-go>ابدأ الآن ▶</i></button>
<button class="h2-card math" onclick="sec('math')"><span class="h2-ic e">🔢</span><b>أكاديمية الرياضيات</b><small>أرقام .. عمليات .. أشكال</small><i class=h2-go>ابدأ الآن ▶</i></button>
<button class="h2-card ai" onclick="bomi()"><span class="h2-ic e">💬</span><b>المعلم الذكي بومي</b><small>اسأل وتعلّم معي</small><i class=h2-go>تحدّث الآن ▶</i></button></div>
<h3 class=h2-h>🎮 تعلّم والعب</h3>
<div class="tl tl-glass">${tl.slice(3).map(t=>`<button class=gt onclick="${t[3]}">${t[0]}<b>${t[1]}</b><small>${t[2]}</small></button>`).join('')}</div>
<button class="h2-parent h2-parent-end" onclick=parent()><span class=e>👨‍👩‍👧</span><span><b>لوحة ولي الأمر</b><small>متابعة تقدّم طفلك · ${dn}/${us.length} دروس مكتملة</small></span><i>←</i></button> <!-- لوحة ولي الأمر في أسفل الصفحة (طلب صاحب المشروع) -->`)}

/* إعادة رسم الصفحة بعد تحميل كل الملفات حتى تظهر الصفحة الرئيسية الجديدة (smart.js يرسم الصفحة القديمة عند تحميله) */
P=load();ens();DB.kids.length>1?who():P?home():setup();
