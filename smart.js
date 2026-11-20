/* بعد إتقان الدرس: «الدرس التالي» يفتح الدرس التالي في المادة نفسها (كان يعود إلى الرئيسية) */
/* الدرس التالي = الدرس الذي يلي الحالي مباشرة في المادة نفسها وبالترتيب (المرحلة نفسها ثم التي بعدها).
   كان يفتح «أول درس غير مكتمل في الخريطة» فيرجع إلى درس قديم أو يقفز إلى مرحلة/مادة أخرى.
   إن كان الدرس التالي مقفلًا (المرحلة التالية لم تُفتح بعد): أول درس غير مكتمل في المرحلة الحالية من المادة نفسها. */
window.nextAfterCur=()=>{try{const id=window.cur&&cur.id;if(!id||!/^\d+-\d+$/.test(id))return null;const u=find(id);if(!u)return null;
 const all=S.flatMap(st=>st.u).filter(x=>x.l===u.l),i=all.indexOf(u);if(i<0)return null;const n=all[i+1];
 const open=x=>!window.lessonUnlocked||lessonUnlocked(x);if(n&&open(n))return n;
 const a=+id.split('-')[0],here=S[a].u.filter(x=>x.l===u.l&&x!==u&&!(P.done||{})[x.id]&&open(x));return here[0]||null}catch(e){return null}};
window.nextLabel=()=>{const n=nextAfterCur();return n?'▶️ الدرس التالي: '+n.n:'📚 '+(((window.cur&&find0l())==='en')?'دروس English':'دروس العربية')};
const find0l=()=>{try{return find(cur.id).l}catch(e){return ''}};
window.goNextLesson=()=>{const n=nextAfterCur();if(n)return lesson(n.id);const l=find0l();sec(l==='en'?'en':l==='ar'?'ar':'les')}; /* لا درس بعده: قائمة دروس المادة نفسها */
/* smart.js — محرك التعلم التكيّفي، الرياضيات، المعلم، النطق، التقارير، الملفات */
var DB=(()=>{try{return JSON.parse(localStorage.getItem('hrw2'))}catch(e){return null}})()||{kids:[],cur:0};
if(!DB.kids.length){try{const o=JSON.parse(localStorage.getItem('hrw'));if(o)DB.kids.push(o)}catch(e){}}
load=()=>DB.kids[DB.cur]||null;
save=()=>{if(P)DB.kids[DB.cur]=P;try{localStorage.setItem('hrw2',JSON.stringify(DB))}catch(e){}};
const ens=()=>{if(P){P.name=String(P.name||'').replace(/[<>&"'`]/g,'').trim()||'صديقي';P.gender=P.gender=='female'?'female':'male';delete P.t;delete P.lim;['done','sc','sk','ml','fd','wl','cd','pr','stat'].forEach(k=>{if(!P[k]||typeof P[k]!=='object'||Array.isArray(P[k]))P[k]={}});P.star=+P.star||0;if(P.stage==null||isNaN(+P.stage))P.stage=0;P.stage=Math.max(0,Math.min(S.length-1,+P.stage))}};
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pk=a=>a[R(0,a.length-1)],AR='٠١٢٣٤٥٦٧٨٩';
const G={g1:U('الأشكال','ar','مُرَبَّع,🟦|دَائِرَة,🔵|مُثَلَّث,🔺|نَجْمَة,⭐|قَلْب,❤️'),g2:U('Shapes','en','Square,🟦|Circle,🔵|Triangle,🔺|Star,⭐|Heart,❤️'),g3:U('الأحجام والقياسات','ar','كَبِير,🐘|صَغِير,🐜|طَوِيل,🦒|قَصِير,🐕|سَرِيع,🐇')};
Object.keys(G).forEach(k=>G[k].id=k);
find=id=>G[id]||S[id.split('-')[0]].u[id.split('-')[1]];
const MS={cnt:'عدّ الصور والكميات',num:'قراءة الأرقام ٠–١٠٠٠',cmp:'المقارنة: أكبر، أصغر، يساوي',seq:'العد التصاعدي والتنازلي',add:'الجمع',sub:'الطرح',mul:'الضرب',div:'القسمة'};
const OKS={ar:['مُمْتَاز!','رَائِع!','يَا سَلَام! أَحْسَنْت!','إِجَابَةٌ صَحِيحَة! بَرَافُو!','عَظِيم جِدًّا!','أَنْتَ نَجْم!'],en:['Great job!','Excellent!','Well done!','Perfect!','Awesome!','You did it!','Fantastic!']},ENC=['لَا بَأْس!','قَرِيب!','حَاوِلْ مَرَّةً أُخْرَى!'];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stripD=s=>String(s==null?'':s).replace(/[\u064B-\u0652\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').toLowerCase().trim();
let t0=0,sp1=0,ok1=0;

/* ---------- أسئلة الرياضيات (تتولّد تلقائياً حسب المستوى 1–4) ---------- */
function mq(k,l){const ar=P.lang=='ar'||(P.lang=='both'&&Math.random()<.5),D=n=>ar?String(n).replace(/\d/g,d=>AR[d]):String(n),lg=ar?'ar':'en';
const no=(a,lo,hi,sp)=>{const s=new Set([a]);let t=0;while(s.size<4&&t++<60)s.add(Math.max(lo,Math.min(hi,a+(R(-sp,sp)||sp))));return shuf([...s]).map(x=>({h:D(x),ok:x==a}))};
const Q=(show,opts,ex,sp)=>({k:'m-'+k,show,opts,ex,sp:sp||null,l:lg});let a,b,mx;
if(k=='cnt'){mx=[5,10,20,30][l-1];a=R(1,mx);const e=pk(['🍎','⚽','⭐','🐟','🚗']);return Q(`<div class=q>${(e+' ').repeat(a)}</div><p class=mut>كم عددها؟</p>`,no(a,0,mx+3,2),[`عدّ معي واحدة واحدة: ${Array.from({length:a},(_,i)=>D(i+1)).join('، ')}`,`ضع إصبعك على كل صورة وعدّ. العدد الأخير هو الجواب: ${D(a)}`])}
if(k=='num'){mx=[10,20,100,1000][l-1];a=R(0,mx);return Q(`<div class=q>🔊</div><p class=mut>اسمع الرقم ثم اختره</p>`,no(a,0,mx,mx>20?10:3),[`الرقم هو ${D(a)}`,`انظر إلى شكله: ${D(a)}. اسمعه مرة أخرى وكرّره بصوتك`],[String(a),lg])}
if(k=='cmp'){mx=[10,20,100,1000][l-1];a=R(0,mx);b=R(0,mx);const t=R(0,2);
if(t==2){const g=a>b?'>':a<b?'<':'=';return Q(`<div class=q dir=ltr>${D(a)} ؟ ${D(b)}</div><p class=mut>اختر العلامة الصحيحة</p>`,shuf(['>','<','=']).map(x=>({h:x,ok:x==g})),['العلامة تفتح فمها نحو العدد الأكبر','إذا تساوى العددان نضع علامة ='])}
if(a==b)b=a+1;const big=t==0,w=big?Math.max(a,b):Math.min(a,b);return Q(`<p class=mut>أيّهما ${big?'أكبر':'أصغر'}؟</p><div class=q dir=ltr>${D(a)} — ${D(b)}</div>`,[a,b].map(x=>({h:D(x),ok:x==w})),['على خط الأعداد، كلما اتجهنا يميناً زاد العدد','تخيّل عدد الصور في كل رقم، أيّهما أكثر؟'])}
if(k=='seq'){const st=l<3?1:pk([2,5,10]),up=Math.random()<.6,s=R(10,30),T=[0,1,2,3].map(i=>up?s+i*st:s+(3-i)*st),h=R(0,3);
/* كل عدد في خانة مستقلة، والترتيب من اليمين (كان «٢٩ ، ؟ ، ٣١» في سطر يساري تقلبه الفاصلة العربية فيبدو الاستفهام في غير مكانه) */return Q(`<p class=mut>أكمل العدّ ${up?'التصاعدي':'التنازلي'}</p><div class="q seq" dir=rtl>${T.map((x,i)=>i==h?'<b class="sq gap">؟</b>':`<b class=sq>${D(x)}</b>`).join('')}</div>`,no(T[h],0,999,st*2),[`كل رقم ${up?'يزيد':'ينقص'} بمقدار ${D(st)}`,`ابدأ من أول رقم وعدّ ${up?'للأمام':'للخلف'} كل مرة ${D(st)}: ${T.map(D).join('، ')}`])}
if(k=='add'||k=='sub'){mx=[5,10,20,100][l-1];a=R(1,mx);b=R(1,mx);if(k=='sub'&&b>a)[a,b]=[b,a];const r=k=='add'?a+b:a-b,e=pk(['🍎','⚽','⭐']),o=k=='add'?'+':'−',pic=l==1?`<div class=q>${e.repeat(a)} ${o} ${e.repeat(b)}</div>`:'';
return Q(`${pic}<div class=q dir=ltr>${D(a)} ${o} ${D(b)} = ؟</div>`,no(r,0,mx*2,3),k=='add'?[`ابدأ من ${D(a)} وعدّ ${D(b)} إلى الأمام`,`ضع ${D(a)} صورة مع ${D(b)} صورة ثم عدّ الكل: ${D(r)}`]:[`ابدأ من ${D(a)} وعدّ ${D(b)} إلى الخلف`,`احذف ${D(b)} صور من ${D(a)} ثم عدّ الباقي: ${D(r)}`])}
const B=[[2,5,10],[2,3,4,5],[2,3,4,5,6,7,8,9],[3,4,5,6,7,8,9,11,12]][l-1];
if(k=='mul'){a=R(1,[2,5,10,12][l-1]);b=pk(B);return Q(`<div class=q dir=ltr>${D(a)} × ${D(b)} = ؟</div>`,no(a*b,0,200,Math.max(3,a)),[`الضرب جمع متكرر: ${Array(a).fill(b).map(D).join(' + ')}`,`ارسم ${D(a)} مجموعات، في كل مجموعة ${D(b)}، ثم عدّ الكل: ${D(a*b)}`])}
b=pk(B);const c=R(1,[5,10,10,12][l-1]);a=b*c;return Q(`<div class=q dir=ltr>${D(a)} ÷ ${D(b)} = ؟</div>`,no(c,0,20,3),[`كم مرة يدخل ${D(b)} في ${D(a)}؟ اقفز: ${Array.from({length:c},(_,i)=>D(b*(i+1))).join('، ')}`,`وزّع ${D(a)} على ${D(b)} مجموعات متساوية: في كل مجموعة ${D(c)}`])}

/* ---------- أسئلة اللغة: متنوعة، وتتغير الطريقة بعد كل مرة ---------- */
function lq(it,pool){const s=P.sk[it[0]]||{},m=((s.lm??2)+1)%3,typ=s.n>=3&&!s.m&&stripD(it[0]).length<12&&!/\s/.test(it[0])&&Math.random()<.5,
o=shuf([it,...(a=>m?a.filter((x,i)=>a.findIndex(y=>y[1]==x[1])==i):a)(shuf(pool.filter(x=>x[1]!=it[1]&&x[0]!=it[0]))).slice(0,3)]),ex=[`الصحيح: ${it[0]} ${it[1]}`,`استمع 🔊 ثم انظر: ${it[0]} ⟵ ${it[1]}`];
if(typ)return{k:it[0],m:3,l:it[2],typ:it[0],show:`<div class=q>${it[1]}</div><p class=mut>اكتب الكلمة</p>`,sp:[it[0],it[2]],ex,opts:[]};
return{k:it[0],m,l:it[2],sp:m?[it[0],it[2]]:null,show:`<div class=q dir=auto>${m==0?it[1]:m==1?'🔊':it[0]}</div>`,opts:o.map(x=>({h:m?x[1]:x[0],ok:x==it})),ex}}
const wsample=(pool,n)=>pool.map(x=>{const s=P.sk[x[0]]||{};return[x,-Math.log(Math.random())/(1+2*(s.m||0)+(s.n?0:1)+Math.min(3,(Date.now()-(s.t||0))/864e5))]}).sort((a,b)=>a[1]-b[1]).slice(0,n).map(x=>x[0]);

/* ---------- المعلم بومي ---------- */
const tch=(m,l,sp)=>{const f=window.studentGenderText||((x)=>x),gm=f(m),gs=f(sp===undefined?m:sp),b=document.getElementById('tb');if(b)b.textContent='🦉 '+gm;if(gs&&P.snd!==0)say(gs,l||'ar')};
const cat=x=>x.typ?'w':x.k.startsWith('m-')?'m':'r';
function rec(x,ok,v){try{window.HurufiSound&&HurufiSound.play(ok?'correct':'wrong')}catch(e){}const s=P.sk[x.k]=P.sk[x.k]||{n:0,m:0},c=P.stat[cat(x)]=P.stat[cat(x)]||[0,0];c[0]++;c[1]+=+ok;s.n++;s.t=Date.now();s.lm=x.m;s.tt=(s.tt||0)+Date.now()-t0;
if(ok){sc++;P.star++;s.m=Math.max(0,s.m-1)}else{s.m++;s.e=(s.e||0)+1;if(!x.k.startsWith('m-'))P.wl[x.k[0].toLowerCase()]=(P.wl[x.k[0].toLowerCase()]||0)+1}
save();const m=ok?pk(OKS[x.l]||OKS.ar):(v!=null?`كتبت «${v}» والصحيح «${x.typ}». لا بأس، سنحاول معاً!`:x.ex[s.m>1?1:0]);
tch(m,ok?x.l:(x.sp?x.sp[1]:'ar'),ok?undefined:(x.sp?x.sp[0]:m));setTimeout(()=>++qi<qs.length?q():fin(),ok?650:1600)}

/* ---------- الجلسات ---------- */
function quiz(){V='quiz';const c=cur;if(!c||!(c.qs||c.mk||(c.i&&c.i.length))){return home()}qs=c.qs?c.qs:c.mk?[1,2,3,4,5].map(()=>mq(c.mk,P.ml[c.mk].l)):wsample(c.i,5).map(x=>lq(x,c.i));qi=0;sc=0;try{window.MindCoach&&MindCoach.newQuiz()}catch(e){}q()}
function q(){const x=qs[qi];V='quiz';t0=Date.now();if(x.sp)say(x.sp[0],x.sp[1]);
h(`<p class=mut>سؤال ${qi+1} من ${qs.length} · ⭐ ${P.star}</p><div id=tb class=bub>🦉 ${qi?'هيا نكمل!':'أنا بومي، سأساعدك!'}</div>${x.show}${x.sp?`<button class=alt onclick="say(qs[qi].sp[0],qs[qi].sp[1])">🔊 اسمع</button>`:''}${x.typ?`<input id=ty autocomplete=off autocapitalize=off dir=auto><button class=big onclick=ty()>تحقق</button>`:`<div class=grid>${x.opts.map(o=>`<button class=opt dir=auto data-ok="${+o.ok}" onclick="ans(this)">${o.h}</button>`).join('')}</div>`}`)}
function ans(b){const ok=b.dataset.ok=='1';document.querySelectorAll('.opt').forEach(o=>{o.disabled=1;if(o.dataset.ok=='1')o.classList.add('ok')});if(!ok)b.classList.add('no');window.__chosen=b.textContent;rec(qs[qi],ok)}
function ty(){const e=document.getElementById('ty'),x=qs[qi],v=e.value.trim();if(!v){e.focus();return tch('اكتب الكلمة أولًا 🙂','ar')}e.disabled=1;
const g=window.Grade?Grade.text(v,[x.typ]):{ok:stripD(v)==stripD(x.typ),exact:true};window.__g=g;rec(x,g.ok,v)}
function fin(){const c=cur,pass=sc>=4;try{window.HurufiSound&&HurufiSound.play(pass?'finish':'wrong')}catch(e){}V='fin';
if(c.id=='pl'){P.stage=Math.max(0,P.stage-(sc>=4?0:sc>=2?1:2));save();return h(`<h1>🎉</h1><h2>أحسنت يا ${P.name}!</h2><p>نتيجتك ${sc} من 5، وسنبدأ من المرحلة ${P.stage+1}: ${S[P.stage].n}. يمكن لولي الأمر تغيير المرحلة في أي وقت.</p><button class=big onclick=home()>هيا نتعلم</button>`)}
if(c.mk){const m=P.ml[c.mk];m.s=Math.max(m.s||0,sc);let msg;if(sc>=4){if(m.l<4){m.l++;msg='ارتفع مستواك! الأسئلة ستصبح أصعب قليلاً 🚀'}else{if(!m.d)P.star+=5;m.d=1;msg='أتقنت هذه المهارة! 🏆'}}else if(sc<=2&&m.l>1){m.l--;msg='سنعود لأسئلة أسهل ونتدرب معاً 🤝'}else msg='تدرّب مرة أخرى وستتحسن 💪';save();
return h(`<h1>${pass?'🌟':'💪'}</h1><h2>${sc} من 5 — المستوى ${m.l}/4</h2><p>${msg}</p><button class=big onclick="mstart('${c.mk}')">جولة جديدة</button><button class=alt onclick=home()>رجوع</button>`)}
if(c.id=='dy'){let m='أحسنت!';if(sc>=4&&!P.cd[day()]){P.cd[day()]=1;P.star+=3;m='أنجزت تحدي اليوم! +٣ نجوم ⭐'}save();return h(`<h1>🎯</h1><h2>${sc} من ${qs.length}</h2><p>${m}</p><button class=big onclick=home()>رجوع</button>`)}
if(c.id=='rv'){save();return h(`<h1>🔁</h1><h2>${sc} من 5</h2><p>مراجعة رائعة! الكلمات التي أخطأت فيها ستظهر لك أكثر.</p><button class=big onclick=home()>رجوع</button>`)}
P.sc[c.id]=Math.max(P.sc[c.id]||0,sc);P.fd[c.id]=P.fd[c.id]||day();if(pass&&!P.done[c.id])P.star+=5;if(pass)P.done[c.id]={s:sc,d:day()};save();
h(pass?`<h1>🌟</h1><h2>أتقنت الدرس! ${sc} من 5</h2><button class=big onclick=goNextLesson()>${nextLabel()}</button>`:`<h1>💪</h1><h2>${sc} من 5 – قريب جداً!</h2><p>نحتاج 4 على الأقل. سنعيد التدريب بطريقة مختلفة.</p><button class=big onclick="lesson('${c.id}')">أعد التدريب</button>`)}
function mstart(k){P.ml[k]=P.ml[k]||{l:1};cur={id:'m-'+k,mk:k,n:MS[k]};quiz()}
const dueN=()=>Object.keys(P.done||{}).flatMap(k=>{try{const u=find(k);return u&&u.i||[]}catch(e){return[]}}).filter(x=>{const s=P.sk[x[0]]||{};return s.m>0||Date.now()-(s.t||0)>2*864e5}).length;
function review(){const it=Object.keys(P.done).filter(k=>{try{return find(k)}catch(e){return 0}}).flatMap(k=>find(k).i);
if(!it.length){V='lesson';return h(`<button class=link onclick=home()>رجوع ←</button><h1>🔁</h1><h2>لا توجد مراجعة بعد</h2><p>أتقن درسًا واحدًا على الأقل، ثم تظهر هنا كلمات المراجعة.</p><button class=big onclick="sec('les')">اذهب إلى الدروس</button>`)}
cur={id:'rv',n:'مراجعة',i:it};quiz()}
function daily(){const L=units(P.stage).flatMap(u=>u.i),ks=Object.keys(MS);cur={id:'dy',qs:[...wsample(L,2).map(x=>lq(x,L)),...[1,2,3,4].map(()=>{const k=pk(ks);return mq(k,(P.ml[k]||{l:1}).l)})]};quiz()}
function wnum(){V='lesson';const n=R(0,[9,20,100][P.ml.num?Math.min(2,P.ml.num.l-1):0]),ar=Math.random()<.5;
window.__wn=ar?String(n).replace(/\d/g,d=>AR[d]):String(n);
h(`<button class=link onclick=home()>رجوع ←</button><h2>اكتب الرقم بإصبعك</h2><div class=q dir=ltr>${ar?String(n).replace(/\d/g,d=>AR[d]):n}</div><button class=alt onclick="say('${n}','${ar?'ar':'en'}')">🔊 اسمع</button><canvas id=pad></canvas><p id=wm class="mut ink-msg" aria-live=polite>✍️ اكتب الرقم، وسأصحّحه لك تلقائيًا</p><button class=link onclick="pad(1)">🧽 مسح</button><button class=alt onclick=wcheck()>✓ تحقّق</button><button class=big onclick=wnum()>الرقم التالي</button>`);pad(0,window.__wn)}

/* ---------- النطق بالميكروفون (بموافقة ولي الأمر) ---------- */
const norm=s=>s.toLowerCase().replace(/[\u064B-\u0652ـ.,!?؟،']/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();
const lev=(a,b)=>{const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]==b[j-1]?0:1));return d[a.length][b.length]};
const near=(a,b)=>{a=norm(a);b=norm(b);return a==b||a.includes(b)||lev(a,b)<=Math.floor(b.length/4)};
function speak(){V='lesson';if(!P.mic)return h(`<button class=link onclick=home()>رجوع ←</button><h2>🎤 تدريب النطق</h2><p>لاستخدام الميكروفون نحتاج موافقة ولي الأمر من لوحة ولي الأمر.</p><button class=big onclick=parent()>فتح لوحة ولي الأمر</button>`);
const L=units(P.stage).flatMap(u=>u.i).filter(x=>stripD(x[0]).length>1);sp1=wsample(L,1)[0];
h(`<button class=link onclick=home()>رجوع ←</button><h2>🎤 تدريب النطق</h2><div class=q>${sp1[1]}</div><h2 dir=auto style="text-align:center">${sp1[0]}</h2><div id=tb class=bub>🦉 استمع ثم انطق الكلمة بوضوح</div><button class=alt onclick="say(sp1[0],sp1[2])">🔊 استمع</button><button class=big onclick=mic()>🎤 انطقها</button><button class=alt onclick=speak()>كلمة أخرى</button>`)}
function mic(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return tch('هذا المتصفح لا يدعم الاستماع. جرّب Chrome أو Edge.','ar','');
const r=new SR,t=norm(sp1[0]),w=P.pr[sp1[0]]=P.pr[sp1[0]]||[0,0],c=P.stat.p=P.stat.p||[0,0];r.lang=sp1[2]=='ar'?'ar-SA':'en-US';r.maxAlternatives=5;tch('أنا أسمعك... 🎧','ar','');
r.onresult=e=>{const a=[...e.results[0]].map(x=>x.transcript),ok=a.some(x=>near(x,t));w[0]++;c[0]++;if(ok){w[1]++;c[1]++;P.star++;tch(pk(OKS[sp1[2]]),sp1[2])}else{const h0=norm(a[0]||''),i=[...t].findIndex((ch,j)=>ch!=h0[j]);if(i>=0)P.wl[t[i]]=(P.wl[t[i]]||0)+1;tch(i>=0?`ركّز على حرف «${t[i]}» في الكلمة، وحاول مرة أخرى`:'حاول مرة أخرى بصوت أوضح','ar','')}save()};
r.onerror=()=>tch('لم أسمعك جيداً، حاول مرة أخرى','ar','');r.start()}

/* ---------- الشاشات ---------- */
const mp=k=>P.ml[k]||{l:1};
function home(){V='home';ok1=0;ens();const st=P.stage,us=units(st),dn=us.filter(u=>P.done[u.id]).length,dc=dueN();
h(`<h1>أهلاً ${P.name}! 👋</h1><div id=tb class=bub>🦉 أنا بومي، معلمك الخاص. ماذا نتعلم اليوم؟</div><p class=mut>المرحلة ${st+1}: ${S[st].n} (${S[st].a} سنوات) · ⭐ ${P.star}</p><div class=bar><div style="width:${us.length?dn/us.length*100:0}%"></div></div>
<button class=big onclick=daily()>${P.cd[day()]?'✅ تحدي اليوم (أُنجز)':'🎯 تحدي اليوم (+٣ نجوم)'}</button>
<h3>اللغة</h3><div class=list>${us.map(u=>`<button class=row onclick="lesson('${u.id}')"><span>${P.done[u.id]?'✅':'⭐'}</span><b>${u.n}</b><small>${P.sc[u.id]!=null?P.sc[u.id]+'/5':''}</small></button>`).join('')}</div>
${dn==us.length&&us.length&&st<4?`<button class=big onclick="P.stage++;save();home()">أتقنت المرحلة! انتقل إلى التالية 🚀</button>`:''}
<h3>الرياضيات</h3><div class=list>${Object.keys(MS).map(k=>`<button class=row onclick="mstart('${k}')"><span>${mp(k).d?'✅':'🔢'}</span><b>${MS[k]}</b><small>مستوى ${mp(k).l}/4</small></button>`).join('')}${Object.keys(G).map(g=>`<button class=row onclick="lesson('${g}')"><span>${P.done[g]?'✅':'🔷'}</span><b>${G[g].n}</b></button>`).join('')}<button class=row onclick=wnum()><span>✍️</span><b>كتابة الأرقام</b></button></div>
${dc?`<button class=alt onclick=review()>🔁 مراجعة تلقائية (${dc} كلمة)</button>`:''}<button class=alt onclick=speak()>🎤 تدريب النطق</button>${P.star>=50?`<button class=alt onclick=cert()>🏆 شهادة إنجاز</button>`:''}
${DB.kids.length>1?`<button class=link onclick=who()>تبديل الطالب</button> `:''}<button class=link onclick=parent()>لوحة ولي الأمر</button>`)}
function who(){V='who';h(`<h1>من سيتعلم اليوم؟</h1><div class=list>${DB.kids.map((k,i)=>`<button class=row onclick="DB.cur=${i};P=load();ens();home()"><span>🧒</span><b>${k.name}</b><small>⭐ ${k.star||0}</small></button>`).join('')}</div>`)}
function start(){const n=document.getElementById('nm').value.replace(/[<>&"'`]/g,'').trim()||'صديقي',a=+document.getElementById('ag').value;
P={name:n,gender:document.querySelector('input[name=gender]:checked')?.value||'male',age:a,lang:document.getElementById('lg').value,stage:Math.min(4,Math.floor((a-3)/2)),done:{},sc:{},mic:0};DB.kids.push(P);DB.cur=DB.kids.length-1;ens();save();place()}
function cert(){h(`<div class=cert><h1>🏆</h1><h2>شهادة إنجاز</h2><p>تُمنح هذه الشهادة إلى</p><h1>${P.name}</h1><p>لجمعه ${P.star} نجمة في التعلّم. نحن فخورون بك!</p><p>${day()}</p></div><button class=big onclick="window.print()">طباعة الشهادة</button><button class=link onclick=home()>رجوع ←</button>`)}

/* ---------- التقرير ولوحة ولي الأمر ---------- */
function rtxt(){const E=Object.entries(P.sk).filter(x=>!x[0].startsWith('m-')),st=P.stat,pc=k=>st[k]&&st[k][0]?Math.round(st[k][1]/st[k][0]*100)+'%':'—',
strong=E.filter(([k,s])=>s.n>=3&&(s.e||0)/s.n<.2).map(x=>x[0]).slice(0,8),weak=E.filter(([k,s])=>s.n>=2&&(s.e||0)/s.n>=.4).map(x=>x[0]).slice(0,8),
wl=Object.entries(P.wl).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]).join(' '),pw=Object.entries(P.pr).filter(([k,v])=>v[0]>=2&&v[1]/v[0]<.5).map(x=>x[0]).join('، '),
dn=Object.keys(P.done).map(k=>find(k).n+(P.fd[k]?` (${Math.max(1,Math.round((new Date(P.done[k].d)-new Date(P.fd[k]))/864e5)+1)} يوم)`:'')),
ms=Object.keys(MS).map(k=>`${MS[k]}: مستوى ${mp(k).l}/4`);
return `تقرير ${P.name}\nالمرحلة: ${S[P.stage].n}\nالنجوم: ${P.star}\nالقراءة والاستماع: ${pc('r')} | الكتابة: ${pc('w')} | النطق: ${pc('p')} | الحساب: ${pc('m')}\nدروس متقنة (والأيام التي احتاجها): ${dn.join('، ')||'—'}\nنقاط القوة: ${strong.join('، ')||'—'}\nتحتاج مراجعة: ${weak.join('، ')||'—'}\nحروف يجد صعوبة فيها: ${wl||'—'}\nنطق يحتاج تدريباً: ${pw||'—'}\nالرياضيات:\n- ${ms.join('\n- ')}`}
const yn=(f,v)=>`<select onchange="P.${f}=+this.value;save()"><option value=1 ${v!==0&&v?'selected':''}>مسموح</option><option value=0 ${v===0||!v&&f=='mic'?'selected':''}>غير مسموح</option></select>`;
function parent(){V='parent';if(DB.pin&&!ok1)return h(`<button class=link onclick=home()>رجوع ←</button><h2>لوحة ولي الأمر</h2><label for=pn>الرقم السري</label><input id=pn type=password inputmode=numeric><button class=big onclick="if(document.getElementById('pn').value==DB.pin){ok1=1;parent()}else this.textContent='الرقم غير صحيح، حاول مرة أخرى'">دخول</button>`);
const sel=(id,arr,cur,fn)=>`<select id=${id} onchange="${fn}">${arr.map(x=>`<option value="${x[0]}" ${x[0]==cur?'selected':''}>${x[1]}</option>`).join('')}</select>`;
h(`<button class=link onclick=home()>رجوع ←</button><h2>لوحة ولي الأمر</h2>
<label for=pk>الطالب</label>${sel('pk',DB.kids.map((k,i)=>[i,k.name]),DB.cur,"DB.cur=+this.value;P=load();ens();parent()")}<button class=link onclick=setup()>+ إضافة طالب جديد</button>
<label for=ps>المرحلة الحالية</label>${sel('ps',S.map((s,i)=>[i,`${i+1}. ${s.n} (${s.a})`]),P.stage,"P.stage=+this.value;save()")}
<label for=pl>اللغة</label>${sel('pl',[['both','العربية والإنجليزية'],['ar','العربية'],['en','الإنجليزية']],P.lang,"P.lang=this.value;save()")}
<label for=pg>جنس الطالب</label>${sel('pg',[['male','ذَكَر'],['female','أُنْثَى']],P.gender,"P.gender=this.value;save()")}
<label>السماح باستخدام الميكروفون</label>${yn('mic',P.mic)}<label>صوت المعلم بومي</label>${yn('snd',P.snd)}
<label for=pp>رقم سري للوحة (اتركه فارغاً لإلغائه)</label><input id=pp inputmode=numeric maxlength=4 value="${esc(DB.pin)}" onchange="DB.pin=this.value.trim();save()">
<h3>تقرير ${P.name}</h3><pre>${rtxt()}</pre><label for=em>بريد ولي الأمر</label><input id=em type=email value="${esc(P.em)}" onchange="P.em=this.value.trim();save();parent()">
<a class="big" href="mailto:${esc(P.em)}?subject=${encodeURIComponent('تقرير تقدّم '+P.name)}&body=${encodeURIComponent(rtxt())}">إرسال التقرير بالبريد</a><button class=alt onclick="copyReport(this)">نسخ التقرير</button>
<p class=mut>🔒 بيانات الطالب محفوظة على هذا الجهاز فقط ولا تُرسل لأي جهة. لا إعلانات ولا تواصل مع الغرباء. التعرف على الصوت تنفذه خدمة المتصفح وقد يُرسل الصوت لمزوّد المتصفح، لذلك لا يعمل إلا بموافقتك.</p>
<button class=alt onclick="if(rs++){window.HurufiSync&&HurufiSync.remove(DB.kids[DB.cur]);DB.kids.splice(DB.cur,1);DB.cur=0;P=load();ens();save();rs=0;P?home():setup()}else this.textContent='اضغط مرة أخرى لحذف ملف ${P.name} نهائياً'">حذف ملف هذا الطالب</button>`)}

P=load();ens();DB.kids.length>1?who():P?home():setup();

/* نسخ التقرير: يعمل على كل المتصفحات، ولا يعرض «تم النسخ» إلا إذا نجح النسخ فعلًا */
window.copyReport=function(b){const t=rtxt(),ok=()=>{b.textContent='تم النسخ ✓'},no=()=>{b.textContent='تعذّر النسخ — حدّد النص يدويًا'};
 const old=()=>{try{const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(a);a.select();const r=document.execCommand('copy');a.remove();r?ok():no()}catch(e){no()}};
 try{navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t).then(ok,old):old()}catch(e){old()}};

/* تصحيح كتابة الرقم بالإصبع (شكلًا لا تطابقًا) */
window.wcheck=function(r){const c=document.getElementById('pad');if(!c||!window.Ink)return;r=r||Ink.run(c,{target:window.__wn});const m=document.getElementById('wm');if(!r||!m)return;
 if(r.empty){m.textContent='اكتب الرقم أولًا ✍️';return}
 m.className='mut ink-msg '+(r.ok?'good':r.close?'near':'try');m.textContent=r.ok?(r.tip||pk(OKS.ar)+' 🌟'):r.tip;
 if(r.ok&&!c.__ink.done){c.__ink.done=true;P.star++;save();try{HurufiSound.play('correct');MC.mood('happy',1400)}catch(e){}}else if(!r.ok){try{MC.mood('tilt',900)}catch(e){}}
 if(!muted())say(m.textContent.replace(/[^\p{L}\p{M}\p{N}\s،.!؟«»]/gu,' '),'ar',null,r.ok?'happy':'soft')};
