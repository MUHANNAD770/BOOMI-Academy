const U=(n,l,i,k)=>({n,l,k,i:i.split('|').map(x=>[...x.split(','),l])});
const S=[
{n:'التأسيس المبكر',a:'3–4',u:[U('حروفي العربية الأولى','ar','أَرْنَب,🐰|بَطَّة,🦆|تُفَّاح,🍎|ثَعْلَب,🦊|جَمَل,🐪',1),U('English letters A–E','en','Apple,🍎|Ball,⚽|Cat,🐱|Dog,🐶|Egg,🥚',1),U('الألوان – Colors','en','Red,🔴|Blue,🔵|Green,🟢|Yellow,🟡|Orange,🟠'),U('الحيوانات','ar','أَسَد,🦁|سَمَكَة,🐟|عُصْفُور,🐦|بَقَرَة,🐮|فِيل,🐘')]},
{n:'تعلم الحروف',a:'5–6',u:[U('الحروف: ح خ د ذ ر','ar','حِصَان,🐴|خَرُوف,🐑|دَجَاجَة,🐔|ذُرَة,🌽|رَجُل,👨',1),U('الحركات العربية','ar','بَ,فَتْحَة|بِ,كَسْرَة|بُ,ضَمَّة|بْ,سُكُون|بَّ,شَدَّة'),U('Letters F–J','en','Fish,🐟|Goat,🐐|Hat,🎩|Ice,🧊|Juice,🧃',1),U('Letters K–O','en','Kite,🪁|Lion,🦁|Moon,🌙|Nest,🪺|Orange,🍊',1),U('قراءة كلمات مشكولة: العائلة','ar','أَب,👨|أُمّ,👩|وَلَد,👦|بِنْت,👧|جَدّ,👴'),U('المدّ بالتشكيل','ar','بَاب,🚪|نُور,💡|فِيل,🐘|كُوب,🥤|سَاعَة,⏰')]},
{n:'بداية القراءة والكتابة',a:'7–8',u:[U('Read words','en','Bed,🛏️|Bus,🚌|Pen,🖊️|Sun,☀️|Cup,🥤'),U('كلمات عربية','ar','شَمْس,☀️|بَيْت,🏠|قَمَر,🌙|كِتَاب,📖|سَيَّارَة,🚗'),U('Short sentences','en','I see a dog,🐶|The sun is hot,☀️|I like milk,🥛|A cat can run,🐱|The bus is big,🚌')]},
{n:'تطوير المهارات',a:'9–10',u:[U('Daily talk','en','Good morning,صَبَاحُ الخَيْر|Thank you,شُكْرًا لَك|Please,مِنْ فَضْلِك|What is your name?,مَا اسْمُك؟|I am fine,أَنَا بِخَيْر'),U('كلمات ومعانيها','ar','فَرِح,😀|حَزِين,😢|سَرِيع,🐇|بَطِيء,🐢|ضَخْم,🐘'),U('New words','en','Happy,😀|Sad,😢|Fast,🐇|Slow,🐢|Huge,🐘')]},
{n:'الإتقان والتطوير',a:'11–12',u:[U('Conversation','en','How are you today?,كَيْفَ حَالُكَ اليَوْم؟|Where do you live?,أَيْنَ تَسْكُن؟|Can you help me?,هَلْ تُسَاعِدُنِي؟|See you tomorrow,أَرَاكَ غَدًا|I would like some water,أُرِيدُ بَعْضَ المَاء'),U('مفردات متقدمة','ar','حَدِيقَة,🌳|مَدْرَسَة,🏫|مَكْتَبَة,📚|طَبِيب,🧑‍⚕️|صَدِيق,🤝'),U('Advanced words','en','Library,مَكْتَبَة|Journey,رِحْلَة|Courage,شَجَاعَة|Knowledge,مَعْرِفَة|Believe,يُصَدِّق')]}];
S.forEach((s,a)=>s.u.forEach((u,b)=>u.id=a+'-'+b));
var find=id=>{const[a,b]=id.split('-');return S[a].u[b]};
const app=document.getElementById('app'),mem={};
var load=()=>{try{return JSON.parse(localStorage.getItem('hrw'))}catch(e){return mem.p||null}};
var save=()=>{mem.p=P;try{localStorage.setItem('hrw',JSON.stringify(P))}catch(e){}};
let P=load(),V='',cur,qs,qi,sc,tries=0,rs=0;
/* P معرّف بـ let فلا يصبح خاصية في window؛ نربطه ليعمل window.P في بقية الملفات (الصوت الطبيعي، المؤثرات، القارئ النصي). */
try{Object.defineProperty(window,'P',{get:()=>P,set:v=>{P=v},configurable:true})}catch(e){}
/* حالة الشاشة (V وcur وغيرها) تُعرَّف بـ let فلم تكن ظاهرة لملف التنقل؛ لذلك كانت كل الشاشات تُسجَّل «رئيسية» ويرجع الزر للرئيسية. */
{const d=(k,g,s)=>{try{Object.defineProperty(window,k,{get:g,set:s,configurable:true})}catch(e){}};
d('V',()=>V,v=>{V=v});d('cur',()=>cur,v=>{cur=v});d('qs',()=>qs,v=>{qs=v});d('qi',()=>qi,v=>{qi=v});d('sc',()=>sc,v=>{sc=v});d('tries',()=>tries,v=>{tries=v})}
const shuf=a=>[...a].sort(()=>Math.random()-.5);
const day=()=>new Date().toLocaleDateString('en-CA');
const units=st=>S[st].u.filter(u=>P.lang=='both'||u.l==P.lang);
var say=(t,l)=>{}; /* يُستبدل في voice.js بنظام مقاطع Edge المسجّلة — لا يوجد صوت جهاز */
var h=x=>{app.innerHTML=x;window.scrollTo(0,0)};
function setup(){V='setup';const c=['#ffc93c','#7fd8be','#ff9db8','#9cc2ff','#ffc93c','#7fd8be'];
h(`<h1>حروفي</h1><p class=mut>تعلّم العربية والإنجليزية خطوة بخطوة. اضغط على الحروف لتسمعها!</p>
<div class=tiles>${[['أ','ar','ألف'],['A','en','A'],['ب','ar','باء'],['B','en','B'],['ت','ar','تاء'],['C','en','C']].map((t,i)=>`<button class=tile style="background:${c[i]}" onclick="this.classList.remove('b');void this.offsetWidth;this.classList.add('b');say('${t[2]}','${t[1]}')">${t[0]}</button>`).join('')}</div>
<label for=nm>اسم الطالب</label><input id=nm autocomplete=off>
<fieldset class=gender><legend>جنس الطالب</legend><label><input type=radio name=gender value=male checked> ذَكَر</label><label><input type=radio name=gender value=female> أُنْثَى</label></fieldset>
<label for=ag>عمر الطالب</label><select id=ag>${[3,4,5,6,7,8,9,10,11,12].map(n=>`<option ${n==6?'selected':''}>${n}</option>`)}</select>
<label for=lg>اللغة</label><select id=lg><option value=both>العربية والإنجليزية معاً</option><option value=ar>العربية فقط</option><option value=en>الإنجليزية فقط</option></select>
<button class=big onclick="start()">ابدأ اختبار تحديد المستوى</button>`)}
function start(){const n=document.getElementById('nm').value.trim()||'صديقي',a=+document.getElementById('ag').value;
P={name:n,gender:document.querySelector('input[name=gender]:checked')?.value||'male',age:a,lang:document.getElementById('lg').value,stage:Math.min(4,Math.floor((a-3)/2)),done:{},sc:{}};save();place()}
function place(){const us=units(P.stage).filter(u=>u.i&&u.i.length>=4),it=us.flatMap(u=>u.i);cur={id:'pl',n:'اختبار تحديد المستوى',i:it};tries=0;
 /* كل سؤال خياراته من درسه نفسه (كانت من كل دروس المرحلة: صورة ثور وخياراتها Jam وPilot ومربع) */
 try{if(typeof lq==='function'&&us.length){const pick=[...us].sort(()=>Math.random()-.5);cur.qs=[0,1,2,3,4].map(k=>{const u=pick[k%pick.length],x=u.i[Math.floor(Math.random()*u.i.length)];return lq(x,u.i)})}}catch(e){}
 quiz()}
function home(){V='home';const st=P.stage,us=units(st),dn=us.filter(u=>P.done[u.id]).length,any=Object.keys(P.done).length;
h(`<h1>أهلاً ${P.name}! 👋</h1><p class=mut>المرحلة ${st+1}: ${S[st].n} (${S[st].a} سنوات)</p>
<div class=bar><div style="width:${us.length?dn/us.length*100:0}%"></div></div>
<div class=list>${us.map(u=>`<button class=row onclick="lesson('${u.id}')"><span>${P.done[u.id]?'✅':'⭐'}</span><b>${u.n}</b><small>${P.sc[u.id]!=null?P.sc[u.id]+'/5':''}</small></button>`).join('')}</div>
${dn==us.length&&us.length&&st<4?`<button class=big onclick="P.stage++;save();home()">أتقنت المرحلة! انتقل إلى التالية 🚀</button>`:''}
${any?`<button class=alt onclick="review()">🔁 مراجعة ما تعلّمته</button>`:''}
<button class=link onclick="parent()">لوحة ولي الأمر</button>`)}
function lesson(id){cur=find(id);V='lesson';tries=0;
h(`<button class=link onclick=home()>رجوع ←</button><h2>${cur.n}</h2><p class=mut>اضغط على البطاقة لتسمع</p>
<div class=grid>${cur.i.map((x,j)=>`<button class=card onclick="say(cur.i[${j}][0],cur.i[${j}][2])">${cur.k?`<i>${x[0][0]}</i>`:''}<span>${x[1]}</span><b>${x[0]}</b></button>`).join('')}</div>
${P.stage==1||P.stage==2?`<p class=mut>جرّب الكتابة بإصبعك:</p><canvas id=pad></canvas><button class=link onclick="pad(1)">مسح</button>`:''}
<button class=big onclick="quiz()">ابدأ الاختبار</button>`);pad()}
function pad(clr,target){const c=document.getElementById('pad');if(!c)return;if(clr){c.getContext('2d').clearRect(0,0,c.width,c.height);window.Ink&&Ink.clear(c);return}c.width=c.offsetWidth;c.height=target?220:160;const x=c.getContext('2d');
if(window.Ink){Ink.attach(c,{target:target||null,wait:900,onResult:r=>window.wcheck&&wcheck(r)})}
x.lineWidth=8;x.lineCap='round';x.strokeStyle='#3b7bf0';let d=0;const p=e=>{const r=c.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
c.onpointerdown=e=>{d=1;x.beginPath();x.moveTo(...p(e))};c.onpointermove=e=>{if(d){x.lineTo(...p(e));x.stroke()}};c.onpointerup=c.onpointerleave=()=>d=0;
const cb=document.querySelector('.link[onclick="pad(1)"]');if(cb)cb.onclick=()=>{x.clearRect(0,0,c.width,c.height);window.Ink&&Ink.clear(c);const m=document.getElementById('wm');if(m){m.textContent='';m.className='mut ink-msg'}}}
function review(){const it=Object.keys(P.done).flatMap(k=>find(k).i);cur={id:'rv',n:'مراجعة',i:it};tries=0;quiz()}
function quiz(){V='quiz';qs=shuf(cur.i).slice(0,5);qi=0;sc=0;q()}
function q(){const it=qs[qi],m=tries%3,o=shuf([it,...shuf(cur.i.filter(x=>x[1]!=it[1])).slice(0,3)]);if(m)say(it[0],it[2]);
h(`<p class=mut>سؤال ${qi+1} من ${qs.length}</p><div class=q dir=auto>${m==0?it[1]:m==1?'🔊':it[0]}</div>${m?`<button class=alt onclick="say('${it[0].replace(/'/g,'’')}','${it[2]}')">🔊 اسمع مرة أخرى</button>`:''}
<div class=grid>${o.map(x=>`<button class=opt dir=auto data-ok="${x==it?1:0}" onclick="ans(this)">${m==0?x[0]:x[1]}</button>`).join('')}</div>`)}
function ans(b){const ok=b.dataset.ok=='1';document.querySelectorAll('.opt').forEach(x=>{x.disabled=1;if(x.dataset.ok=='1')x.classList.add('ok')});if(!ok)b.classList.add('no');sc+=ok;
setTimeout(()=>{++qi<qs.length?q():fin()},ok?800:1500)}
function fin(){const pass=sc>=4;let msg='';
if(cur.id=='pl'){P.stage=Math.max(0,P.stage-(sc>=4?0:sc>=2?1:2));save();return h(`<h1>🎉</h1><h2>أحسنت يا ${P.name}!</h2><p>${P.gender==='female'?'نَتِيجَتُكِ':'نَتِيجَتُكَ'} ${String(sc).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])} مِنْ ٥، وَسَنَبْدَأُ مِنَ الْمَرْحَلَةِ ${String(P.stage+1).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])}: ${S[P.stage].n}. يمكن لولي الأمر تغيير المرحلة في أي وقت.</p><button class=big onclick=home()>هيا نتعلم</button>`)}
if(cur.id=='rv')return h(`<h1>🔁</h1><h2>${sc} من 5</h2><p>مراجعة رائعة!</p><button class=big onclick=home()>رجوع</button>`);
P.sc[cur.id]=Math.max(P.sc[cur.id]||0,sc);if(pass)P.done[cur.id]={s:sc,d:day()};save();
h(pass?`<h1>🌟</h1><h2>أتقنت الدرس! ${String(sc).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])} مِنْ ٥</h2><button class=big onclick=goNextLesson()>${nextLabel()}</button>`:`<h1>💪</h1><h2>${String(sc).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])} مِنْ ٥ – ${sc>=3?'قَرِيبٌ جِدًّا!':sc>=2?'بِدَايَةٌ جَيِّدَةٌ!':'لَا بَأْسَ، سَنَتَعَلَّمُ مَعًا!'}</h2><p>نَحْتَاجُ ٤ عَلَى الْأَقَلِّ لِلِانْتِقَالِ. سَنُعِيدُ التَّدْرِيبَ بِطَرِيقَةٍ مُخْتَلِفَةٍ.</p><button class=big onclick="tries++;lesson('${cur.id}')">أعد التدريب</button>`)}
function parent(){V='parent';h(`<button class=link onclick=home()>رجوع ←</button><h2>لوحة ولي الأمر – ${P.name}</h2>
<label for=ps>المرحلة الحالية</label><select id=ps onchange="P.stage=+this.value;save()">${S.map((s,i)=>`<option value=${i} ${i==P.stage?'selected':''}>${i+1}. ${s.n} (${s.a})</option>`)}</select>
<label for=pl>اللغة</label><select id=pl onchange="P.lang=this.value;save()">${[['both','العربية والإنجليزية'],['ar','العربية'],['en','الإنجليزية']].map(x=>`<option value=${x[0]} ${x[0]==P.lang?'selected':''}>${x[1]}</option>`)}</select>
<h3>الإنجازات</h3><div class=list>${S.map((s,i)=>`<div><b>${s.n}</b><div class=mut>${s.u.map(u=>`${P.done[u.id]?'✅':P.sc[u.id]!=null?'🔸':'⚪'} ${u.n}${P.sc[u.id]!=null?' ('+P.sc[u.id]+'/5)':''}`).join('<br>')}</div></div>`).join('')}</div>
<button class=alt onclick="if(rs++){P=null;mem.p=null;try{localStorage.removeItem('hrw')}catch(e){}rs=0;setup()}else this.textContent='اضغط مرة أخرى لمسح كل التقدم'">بدء ملف جديد</button>`)}
P?home():setup();
