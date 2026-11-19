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
const byLang=l=>S.map((s,a)=>({s,a,u:s.u.filter(u=>u.l==l)})).filter(x=>x.u.length).map(x=>`<details class="lesson-menu"><summary><span><b>${x.s.n}</b><small>${x.s.a} سنوات · ${x.u.length} درس</small></span><i>⌄</i></summary><div class=list>${x.u.map(bt).join('')}</div></details>`).join('');
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
const tl=[[IC.ar,'اللغة العربية','حروف وكلمات',"sec('ar')"],[IC.en,'English','Learn English',"sec('en')"],[IC.math,'الرياضيات','أرقام وحساب',"sec('math')"],[IC.ach,'إنجازاتي','⭐ '+P.star,"sec('ach')"],[IC.games,'الألعاب','تعلّم بالمرح',"sec('games')"],[IC.les,'كل الدروس','خطوة بخطوة',"sec('les')"]];
h(`<section class="hero hero-bumi"><div class=hb-txt><span class=hb-bub><b>مرحبًا بك يا ${P.name}!</b><small>أنا بومي 💗 معًا نتعلّم ونحقّق النجاح ⭐</small></span><button class=go onclick="${c?`lesson('${c.u.id}')`:"sec('les')"}">ابدأ التعلم ▶</button></div></section>
<div class=sec>${c?`<button class=nx onclick="lesson('${c.u.id}')"><span>▶️</span><div><small>الخطوة التالية لك</small><b>${c.u.n}</b></div></button>`:''}<p class=pt>👇 أو اختر ما تحب أن تتعلم</p></div>
<div class="tl tl-glass">${tl.map(t=>`<button class=gt onclick="${t[3]}">${t[0]}<b>${t[1]}</b><small>${t[2]}</small></button>`).join('')}</div>
<div class=ic><div><h3 style="background:#2fb84a">📊 مستوى الطالب</h3><p>${dn}/${us.length} دروس مكتملة</p><div class=bar><div style="width:${pc}%"></div></div></div><div><h3 style="background:#2f7df0">🦉 إعدادات بومي</h3><p>صوتٌ وشخصيةٌ مخصّصان للطالب.</p><button style="background:#2f7df0" onclick=voiceSet()>اختيار الصوت</button>${DB.kids.length>1?'<button style="background:#2f7df0" onclick=who()>تبديل الطالب</button>':''}</div><div><h3 style="background:#e0457b">💡 نصائح للآباء</h3><p>شجّعوا الطالب واستخدموا الموقع بانتظام.</p><button style="background:#e0457b" onclick=parent()>لوحة ولي الأمر</button></div></div>`)}

/* إعادة رسم الصفحة بعد تحميل كل الملفات حتى تظهر الصفحة الرئيسية الجديدة (smart.js يرسم الصفحة القديمة عند تحميله) */
P=load();ens();DB.kids.length>1?who():P?home():setup();
