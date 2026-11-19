/* activities.js — أنشطة تفاعلية بدل ملفات PDF والصور: تتبّع بالإصبع، تلوين، عدّ، رقم مفقود، مسارات، نرد.
   كل شيء يُرسم بالكود (إيموجي + canvas) فلا صور ولا PDF ويبقى الموقع خفيفاً. لإضافة حرف أو كلمة عدّل LT / EW / AW فقط. */
(()=>{
const AD='٠١٢٣٤٥٦٧٨٩',ad=n=>String(n).replace(/\d/g,d=>AD[d]),R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),sh=a=>[...a].sort(()=>Math.random()-.5),pk=a=>a[R(0,a.length-1)];
const EW='zero one two three four five six seven eight nine ten'.split(' '),AW='صفر,واحد,اثنان,ثلاثة,أربعة,خمسة,ستة,سبعة,ثمانية,تسعة,عشرة'.split(',');
const LT='Apple🍎,Banana🍌,Car🚗,Dog🐶,Elephant🐘,Fish🐟,Giraffe🦒,Horse🐴,Ice cream🍦,Jam🍓,Kite🪁,Lemon🍋,Mango🥭,Nut🥜,Octopus🐙,Panda🐼,Quail🐦,Rabbit🐰,Snail🐌,Turtle🐢,Umbrella☂️,Van🚐,Window🪟,Xylophone🎹,Yoyo🪀,Zebra🦓'.split(',').map(s=>{const m=s.match(/^([A-Za-z ]+)(.+)$/u);return[m[1],m[2]]});
const OB=['🍓','🍌','🍎','🐞','⭐','🎈','🍩','🍭','🧁','🚀','🍪'],COL=['#e53935','#fdd835','#43a047','#1e88e5','#fb8c00','#8e24aa','#ec407a'];
const star=k=>{try{P.act=P.act||{};if(!P.act[k]){P.act[k]=1;P.star=(P.star||0)+1;save()}}catch(e){}},
good=()=>{try{HurufiSound.play('correct');MC.mood('happy',1200)}catch(e){}},bad=()=>{try{HurufiSound.play('wrong');MC.mood('oops',1200)}catch(e){}},
back=(f='act')=>`<button class=link onclick="say.stop();${f}()">رجوع ←</button>`,
pal=()=>`<div class=ac-pal>${COL.map(c=>`<button style="background:${c}" aria-label="لون" onclick="document.getElementById('acb').style.color='${c}'"></button>`).join('')}</div>`,
pad=()=>`<div class=ac-pad><canvas id=ag width=300 height=300></canvas><canvas id=au width=300 height=300></canvas></div><p id=am class=mut aria-live=polite></p><div class=ink-tools><button class=link onclick=aClr()>🧽 مسح</button><button class=link onclick=aFree(this)>✍️ اكتب بدون نموذج</button></div>`,
fin=(s,n,me)=>{try{P.star=(P.star||0)+s;save();HurufiSound.play(s>=n*.6?'finish':'wrong')}catch(e){}h(`<h1>${s>=n*.6?'🌟':'💪'}</h1><h2>${s} من ${n}</h2><p>+${s} ⭐</p><button class=big onclick="${me}()">جولة جديدة</button><button class=alt onclick=act()>رجوع للأنشطة</button>`)};
/* تتبّع/كتابة الشكل: يُرسم النموذج خفيفًا، والطالب يتتبّعه أو يكتبه بلا نموذج.
   التصحيح بالشكل (grade.js): لا يشترط التطابق ولا الحجم ولا المكان ولا الميلان؛ ويقبل التتبّع الجيد فوق النموذج أيضًا. */
function tracer(txt,font,ok){const cg=document.getElementById('ag'),cu=document.getElementById('au');if(!cg||!cu)return;const W=300,c=cg.getContext('2d'),u=cu.getContext('2d');
 c.font=font;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#cfd8ff';c.fillText(txt,W/2,W/2+12);const gd=c.getImageData(0,0,W,W).data;
 let d=0,last=null,won=false,lastTip='';u.lineWidth=18;u.lineCap=u.lineJoin='round';u.strokeStyle='#ff7043';
 const msg=(t,speak,mood)=>{const m=document.getElementById('am');if(!m)return;m.textContent=t;m.className='mut ink-msg '+(mood||'');if(speak&&t&&t!==lastTip&&!(window.muted&&muted())){lastTip=t;try{say(t.replace(/[^\p{L}\p{M}\p{N}\s،.!؟«»]/gu,' '),'ar',null,mood==='good'?'happy':'soft')}catch(e){}}};
 const overlap=()=>{const ud=u.getImageData(0,0,W,W).data;let g=0,n=0,hit=0;for(let i=3;i<ud.length;i+=4){const a=gd[i]>100,b=ud[i]>100;if(a)g++;if(b)n++;if(a&&b)hit++}return g&&hit/g>.5&&hit/(n||1)>.45};
 const win=t=>{if(won){msg(t||'أحسنت! 🌟',false,'good');return}won=true;msg(t||'أحسنت! 🌟',true,'good');ok&&ok()};
 const pt=e=>{const r=cu.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*W/r.height]};
 cu.onpointerdown=e=>{e.preventDefault();cu.setPointerCapture(e.pointerId);d=1;last=pt(e);u.beginPath();u.moveTo(last[0],last[1]);u.lineTo(last[0]+.1,last[1]);u.stroke()};
 cu.onpointermove=e=>{if(!d)return;const p=pt(e);u.beginPath();u.moveTo(last[0],last[1]);u.lineTo(p[0],p[1]);u.stroke();last=p};
 cu.onpointerup=cu.onpointercancel=()=>{d=0};
 if(window.Ink)Ink.attach(cu,{target:txt,wait:850,onResult:r=>{
   const guided=getComputedStyle(cg).opacity!=='0';
   if(r.ok||(guided&&overlap()))return win(r.ok&&r.tip?r.tip:'أحسنت! 🌟');
   if(r.empty)return;msg(r.tip,true,r.close?'near':'try')}});
 window.aClr=()=>{u.clearRect(0,0,W,W);window.Ink&&Ink.clear(cu);won=false;msg('')};
 window.aFree=b=>{const off=cg.style.opacity==='0';cg.style.opacity=off?'1':'0';b.textContent=off?'✍️ اكتب بدون نموذج':'👀 أظهر النموذج';aClr()}}
/* القائمة */
const MN=[['🔠','حروف إنجليزية A–Z','aLet'],['🔢','أرقام إنجليزية 0–10','aNumEn'],['١٢٣','أرقام عربية ١–١٠','aNumAr'],['🐮','عدّ الحيوانات حتى ٢٠','aCount'],['🔍','الرقم المفقود','aMiss'],['🐝','مسار النحلة (تدريب اليد)','aPath'],['🎲','لوّن نقاط النرد','aDice']];
window.act=()=>{V='lesson';h(`<button class=link onclick="sec('games')">رجوع ←</button><h2>🎨 أنشطة تفاعلية</h2><p class=mut>تتبّع بإصبعك، عُدّ، ولوّن</p><div class=list>${MN.map(x=>`<button class=row onclick="${x[2]}()"><span>${x[0]}</span><b>${x[1]}</b></button>`).join('')}</div>`)};
/* الحروف */
window.aLet=()=>{V='lesson';h(`${back()}<h2>🔠 الحروف الإنجليزية</h2><p class=mut>اضغط حرفاً لتتعلّمه وتتبّعه</p><div class=grid dir=ltr>${LT.map((x,i)=>`<button class=opt onclick="aLetP(${i})">${x[0][0]}${x[0][0].toLowerCase()}</button>`).join('')}</div>`)};
window.aLetP=i=>{V='lesson';const[w,e]=LT[i],L=w[0],n=LT.length;
 h(`${back('aLet')}<h2 dir=ltr>${L}${L.toLowerCase()}</h2>${pal()}<div class=ac-big dir=ltr id=acb>${L}</div><div class=q dir=ltr>${e} ${w}</div><button class=alt onclick="say('${L}','en')">🔊 الحرف</button><button class=alt onclick="say('${w}','en')">🔊 الكلمة</button><p class=mut>🖍️ لوّن الحرف ثم تتبّعه بإصبعك</p>${pad()}<div class=ac-nav><button class=alt onclick="aLetP(${(i+n-1)%n})">→ السابق</button><button class=big onclick="aLetP(${(i+1)%n})">التالي ←</button></div>`);
 tracer(L,'900 230px Arial,sans-serif',()=>{good();star('l'+L)});say(L+' for '+w,'en')};
/* الأرقام (إنجليزي / عربي) */
window.aNumEn=()=>aNum('en');window.aNumAr=()=>aNum('ar');
function aNum(lg){V='lesson';const ar=lg=='ar',a=ar?1:0;h(`${back()}<h2>${ar?'١٢٣ الأرقام العربية':'🔢 English Numbers'}</h2><div class=grid ${ar?'':'dir=ltr'}>${Array.from({length:11-a},(_,k)=>`<button class=opt onclick="aNumP('${lg}',${k+a})">${ar?ad(k+a):k+a}</button>`).join('')}</div>`)}
window.aTap=(b,lg)=>{if(b.classList.contains('on'))return;b.classList.add('on');say((lg=='ar'?AW:EW)[document.querySelectorAll('.ac-ob.on').length],lg)};
window.aNumP=(lg,n)=>{V='lesson';const ar=lg=='ar',lo=ar?1:0,s=ar?ad(n):String(n),w=(ar?AW:EW)[n],em=OB[n%OB.length],mf=ar?'aNumAr':'aNumEn',
 hands=[0,1].map(k=>`<div>${[0,1,2,3,4].map(f=>`<i class="${k*5+f<n?'up':''}"></i>`).join('')}</div>`).join('');
 h(`${back(mf)}<h2>${s} · ${w}</h2>${pal()}<div class=ac-big id=acb ${ar?'':'dir=ltr'}>${s}</div><button class=alt onclick="say('${w}','${lg}')">🔊 اسمع</button><p class=mut>👆 اضغط على كل شيء لتعدّه</p><div class=ac-obs>${n?Array.from({length:n},()=>`<button class=ac-ob onclick="aTap(this,'${lg}')">${em}</button>`).join(''):'<span class=mut>لا شيء (صفر)</span>'}</div><p class=mut>✋ عدد الأصابع</p><div class=ac-hands dir=ltr>${hands}</div><p class=mut>✍️ تتبّع الرقم</p>${pad()}<div class=ac-nav><button class=alt onclick="aNumP('${lg}',${n>lo?n-1:10})">→ السابق</button><button class=big onclick="aNumP('${lg}',${n<10?n+1:lo})">التالي ←</button></div>`);
 tracer(s,s.length>1?'900 150px Arial,sans-serif':(ar?'900 230px "Baloo Bhaijaan 2",Tahoma,Arial,sans-serif':'900 240px Arial,sans-serif'),()=>{good();star('n'+lg+n)});say(w,lg)};
/* أسئلة من ٥ جولات: عدّ الحيوانات، الرقم المفقود */
function q5(t,mk,me){let r=0,s=0;const nx=()=>{if(r>=5)return fin(s,5,me);const x=mk();h(`${back()}<h2>${t}</h2><p class=mut>${r+1} من 5 · ⭐ ${s}</p>${x.q}<div class=grid>${x.o.map(o=>`<button class=opt data-ok=${+o.ok}>${o.t}</button>`).join('')}</div>`);if(x.say)say(x.say,x.sayL||'en');
 document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.ok=='1';document.querySelectorAll('.opt').forEach(o=>{o.disabled=1;if(o.dataset.ok=='1')o.classList.add('ok')});if(ok){s++;good()}else{b.classList.add('no');bad()}r++;setTimeout(nx,900)})};nx()}
const opts=(n,D)=>{const o=new Set([n]);while(o.size<4)o.add(Math.max(1,n+R(-3,3)));return sh([...o]).map(x=>({t:D(x),ok:x==n}))};
window.aCount=()=>{V='lesson';q5('🔢 كم عددها؟',()=>{ /* العنوان بلا حيوان: كانت 🐮 ثابتة والمعدود يتغيّر */const ar=Math.random()<.5,n=R(1,20);return{q:`<div class=ac-obs>${pk(['🐄','🐖','🐴','🐓','🐑','🦆','🐱','🐶']).repeat(n)}</div>`,o:opts(n,x=>ar?ad(x):x),say:'كَمْ عَدَدُهَا؟',sayL:'ar'}},'aCount')};
window.aMiss=()=>{V='lesson';q5('🔍 ما الرقم المفقود؟',()=>{const ar=Math.random()<.5,D=x=>ar?ad(x):x,a=R(1,12),k=R(1,4);return{q:`<div class=q dir=ltr>${Array.from({length:6},(_,i)=>i==k?'❓':D(a+i)).join(' ، ')}</div>`,o:opts(a+k,D)}},'aMiss')};
/* نرد: لوّن دوائر بعدد النقاط */
const DOT={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
window.aDice=()=>{V='lesson';let r=0,s=0;const nx=()=>{if(r>=5)return fin(s,5,'aDice');const n=R(1,6);
 h(`${back()}<h2>🎲 لوّن بعدد النقاط</h2><p class=mut>${r+1} من 5 · ⭐ ${s}</p><div class=ac-dice>${Array.from({length:9},(_,i)=>`<i class="${DOT[n].includes(i)?'d':''}"></i>`).join('')}</div><div class=ac-obs>${[1,2,3,4,5,6].map(()=>'<button class=ac-c onclick="this.classList.toggle(\'on\')"></button>').join('')}</div><button class=big id=dk>تحقّق ✓</button>`);
 document.getElementById('dk').onclick=()=>{if(document.querySelectorAll('.ac-c.on').length==n){s++;good()}else bad();r++;setTimeout(nx,700)}};nx()};
/* مسارات: النحلة إلى البيت / الفراشة إلى الزهرة (تدريب على مسك القلم قبل الكتابة) */
const dens=p=>{const o=[];for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],n=Math.max(1,Math.ceil(Math.hypot((b[0]-a[0])*320,(b[1]-a[1])*140)/4));for(let k=0;k<n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}o.push(p[p.length-1]);return o},
zig=(n,a)=>Array.from({length:n+1},(_,i)=>[.06+.88*i/n,.5+(i%2?a:-a)]),
PT=[['موجة',()=>Array.from({length:120},(_,i)=>{const t=i/119;return[.06+.88*t,.5+.22*Math.sin(t*Math.PI*10)]})],['متعرّج',()=>zig(8,.3)],
 ['حلزونات',()=>Array.from({length:300},(_,i)=>{const p=i/299*Math.PI*16;return[.06+.88*p/(Math.PI*16)-.04*Math.sin(p),.5-.14*Math.cos(p)]})],
 ['مربّعات',()=>{const p=[[.06,.8]];for(let i=0;i<6;i++){const x=.06+.88*i/6,w=.88/6;p.push([x,.25],[x+w/2,.25],[x+w/2,.8],[x+w,.8])}return p}],['خط مستقيم',()=>[[.06,.5],[.94,.5]]],['قمم صغيرة',()=>zig(14,.15)]];
window.aPath=(i=0,s=0)=>{V='lesson';if(i>=PT.length)return fin(s,PT.length,'aPath');const E=i%2?['🦋','🌼']:['🐝','🍯'],pts=dens(PT[i][1]()).map(p=>[p[0]*320,p[1]*140]);
 h(`${back()}<h2>🐝 ساعد في الوصول</h2><p class=mut>${PT[i][0]} · ${i+1} من ${PT.length} · ⭐ ${s}</p><div class=ac-path><span>${E[0]}</span><canvas id=pc width=320 height=140></canvas><span>${E[1]}</span></div><button class=link onclick="aPath(${i},${s})">إعادة</button>`);
 const cv=document.getElementById('pc'),c=cv.getContext('2d');let idx=0,d=0,done=0;
 const draw=()=>{c.clearRect(0,0,320,140);c.lineCap=c.lineJoin='round';c.setLineDash([8,8]);c.strokeStyle='#90a4ae';c.lineWidth=4;c.beginPath();pts.forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.setLineDash([]);c.strokeStyle='#ff9800';c.lineWidth=7;c.beginPath();for(let k=0;k<=idx;k++)k?c.lineTo(pts[k][0],pts[k][1]):c.moveTo(pts[k][0],pts[k][1]);c.stroke()};
 const mv=e=>{if(!d||done)return;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*320/r.width,y=(e.clientY-r.top)*140/r.height;for(let k=Math.min(idx+14,pts.length-1);k>=idx;k--)if(Math.hypot(pts[k][0]-x,pts[k][1]-y)<26){idx=k;break}draw();
  if(idx>=pts.length-3){done=1;good();setTimeout(()=>aPath(i+1,s+1),700)}};
 cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);d=1;mv(e)};cv.onpointermove=mv;cv.onpointerup=cv.onpointercancel=()=>{d=0};draw()};
/* ربط القسم بالموقع: قائمة الألعاب + بلاطة الصفحة الرئيسية */
const os=sec;sec=function(k){os(k);if(k=='games'){const l=document.querySelector('.list');l&&l.insertAdjacentHTML('afterbegin','<button class=row onclick=act()><span>🎨</span><b>أنشطة تفاعلية</b><small>جديد</small></button>')}};
const oh=home;home=function(){oh();const t=document.querySelector('.tl');t&&t.insertAdjacentHTML('beforeend','<button class=gt onclick=act()><i class="ico ico-em">🎨</i><b>أنشطة</b><small>تتبّع وعدّ ولوّن</small></button>')};
window.AC={MN,q5,opts,pal,pad,tracer,back,good,star,sh,pk,R,ad,COL};
if(V=='home')home();
})();
