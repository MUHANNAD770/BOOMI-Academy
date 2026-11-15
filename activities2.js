/* activities2.js — ألوان وأشكال (عربي/إنجليزي) + الحركات (فتحة/ضمة/كسرة) + حروف العربية. يعتمد على AC من activities.js. لإضافة حرف: سطر في HR. */
(()=>{const{MN,q5,pal,pad,tracer,back,good,star,sh,R,COL}=AC,FA='900 230px "Baloo Bhaijaan 2",Tahoma,Arial,sans-serif',
CL=[['Red','أحمر','#e53935'],['Blue','أزرق','#1e88e5'],['Yellow','أصفر','#fdd835'],['Green','أخضر','#43a047'],['Orange','برتقالي','#fb8c00'],['Purple','بنفسجي','#8e24aa'],['Pink','وردي','#f48fb1'],['Brown','بني','#795548'],['Black','أسود','#212121'],['White','أبيض','#ffffff'],['Gray','رمادي','#9e9e9e']],
SP=[['Circle','دائرة','<circle cx="50" cy="50" r="40"/>'],['Square','مربع','<rect x="15" y="15" width="70" height="70"/>'],['Rectangle','مستطيل','<rect x="8" y="28" width="84" height="44"/>'],['Triangle','مثلث','<polygon points="50,10 92,88 8,88"/>'],['Oval','بيضاوي','<ellipse cx="50" cy="50" rx="42" ry="26"/>'],['Diamond','معين','<polygon points="50,6 94,50 50,94 6,50"/>'],['Star','نجمة','<polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38"/>'],['Heart','قلب','<path d="M50 88C10 56 6 28 28 20 40 16 48 24 50 32 52 24 60 16 72 20 94 28 90 56 50 88Z"/>'],['Hexagon','سداسي','<polygon points="28,12 72,12 96,50 72,88 28,88 4,50"/>']],
sv=(i,c,z=84)=>`<svg viewBox="0 0 100 100" width="${z}" height="${z}" fill="${c}" stroke="#263238" stroke-width="4" stroke-linejoin="round">${SP[i][2]}</svg>`,
no=(a,i,f)=>{const s=new Set([i]);while(s.size<4)s.add(R(0,a.length-1));return sh([...s]).map(k=>({t:f(a[k]),ok:k==i}))},
nm=(x,lg)=>lg=='ar'?x[1]:x[0],sf=lg=>lg=='ar'?'Ar':'En',
dr=lg=>lg=='ar'?'':' dir=ltr';
/* الألوان */
function aCol(lg){V='lesson';h(`${back()}<h2>${lg=='ar'?'🌈 الألوان':'🎨 Colors'}</h2><p class=mut>اضغط لوناً لتسمع اسمه</p><div class=ac-sg${dr(lg)}>${CL.map(c=>`<button onclick="say('${nm(c,lg)}','${lg}')"><i class=ac-sw style="background:${c[2]}"></i><b>${nm(c,lg)}</b></button>`).join('')}</div><button class=big onclick="aColQ${sf(lg)}()">🎯 اختبرني</button>`)}
const colQ=lg=>q5(lg=='ar'?'🌈 ما هذا اللون؟':'🎨 Which color?',()=>{const i=R(0,CL.length-1);return{q:`<i class=ac-sw style="background:${CL[i][2]};width:120px;height:120px;display:block;margin:10px auto"></i>`,o:no(CL,i,c=>nm(c,lg))}},'aColQ'+sf(lg));
/* الأشكال */
function aShp(lg){V='lesson';h(`${back()}<h2>${lg=='ar'?'🔷 الأشكال':'🔷 Shapes'}</h2><p class=mut>اضغط شكلاً لتسمع اسمه</p><div class=ac-sg${dr(lg)}>${SP.map((s,i)=>`<button onclick="say('${nm(s,lg)}','${lg}')">${sv(i,COL[i%7])}<b>${nm(s,lg)}</b></button>`).join('')}</div><button class=big onclick="aShpQ${sf(lg)}()">🎯 اختبرني</button>`)}
const shpQ=lg=>q5(lg=='ar'?'🔷 ما اسم هذا الشكل؟':'🔷 Which shape?',()=>{const i=R(0,SP.length-1);return{q:`<div class=ac-obs>${sv(i,COL[R(0,6)],120)}</div>`,o:no(SP,i,s=>nm(s,lg))}},'aShpQ'+sf(lg));
['En','Ar'].forEach(k=>{const lg=k=='Ar'?'ar':'en';window['aCol'+k]=()=>aCol(lg);window['aColQ'+k]=()=>colQ(lg);window['aShp'+k]=()=>aShp(lg);window['aShpQ'+k]=()=>shpQ(lg)});
/* الحركات: حرف + فتحة/ضمة/كسرة + كلمات */
const HR='أ|أَسَد🦁,أُذُن👂,إِبْرِيق🫖;ب|بَطَّة🦆,بُرْتُقَال🍊,بِطِّيخ🍉;ت|تَمْر🌴,تُفَّاح🍎,تِمْسَاح🐊;ث|ثَوْر🐂,ثُعْبَان🐍,ثِيَاب👕;ج|جَمَل🐪,جُبْن🧀,جِيتَار🎸;ح|حَلَزُون🐌,حُوت🐋,حِصَان🐴;خ|خَرُوف🐑,خُبْز🍞,خِيَار🥒;د|دَجَاجَة🐔,دُبّ🐻,دِيك🐓;ك|كَلْب🐶,كُرَة⚽,كِتَاب📖;ل|لَيْمُون🍋,لُعْبَة🧸,لِسَان👅'.split(';').map(r=>{const[l,w]=r.split('|');return[l,w.split(',').map(x=>{const m=x.match(/^(.+?)(\p{Extended_Pictographic}.*)$/u);return[m[1],m[2]]})]}),
HN=['فتحة','ضمة','كسرة'],MK=['\u064E','\u064F','\u0650'];
window.aHar=()=>{V='lesson';h(`${back()}<h2>فَ فُ فِ الحركات</h2><p class=mut>اختر حرفاً</p><div class=grid>${HR.map((x,i)=>`<button class=opt onclick="aHarP(${i})">${x[0]}${MK[0]}</button>`).join('')}</div><button class=big onclick=aHarQ()>🎯 اختبرني</button>`)};
window.aHarP=i=>{V='lesson';const[L,W]=HR[i],n=HR.length,F=MK.map((m,k)=>L=='أ'&&k==2?'إِ':L+m);
 h(`${back('aHar')}<h2>${L}</h2>${pal()}<div class=ac-big id=acb>${L}</div><div class=ac-hv>${F.map((f,k)=>`<button onclick="say('${f}','ar')"><b>${f}</b><small>${HN[k]}</small></button>`).join('')}</div><div class=ac-hv>${W.map(w=>`<button onclick="say('${w[0]}','ar')"><span>${w[1]}</span><b>${w[0]}</b></button>`).join('')}</div><p class=mut>✍️ تتبّع الحرف</p>${pad()}<div class=ac-nav><button class=alt onclick="aHarP(${(i+n-1)%n})">→ السابق</button><button class=big onclick="aHarP(${(i+1)%n})">التالي ←</button></div>`);
 tracer(L,FA,()=>{good();star('h'+L)})};
window.aHarQ=()=>{V='lesson';const all=HR.flatMap(x=>x[1]);q5('📖 اقرأ وأجب: ما اسم الصورة؟',()=>{const i=R(0,all.length-1);return{q:`<div class=ac-big style="font-size:90px;-webkit-text-stroke:0">${all[i][1]}</div>`,o:no(all,i,w=>w[0])}},'aHarQ')};
/* حروف العربية: تتبّع */
const AB='أبتثجحخدذرزسشصضطظعغفقكلمنهوي',AN='ألف,باء,تاء,ثاء,جيم,حاء,خاء,دال,ذال,راء,زاي,سين,شين,صاد,ضاد,طاء,ظاء,عين,غين,فاء,قاف,كاف,لام,ميم,نون,هاء,واو,ياء'.split(',');
window.aAbj=()=>{V='lesson';h(`${back()}<h2>🔤 الحروف العربية</h2><p class=mut>اضغط حرفاً لتسمعه وتتبّعه</p><div class=grid>${[...AB].map((c,i)=>`<button class=opt onclick="aAbjP(${i})">${c}</button>`).join('')}</div>`)};
window.aAbjP=i=>{V='lesson';const c=AB[i],n=AB.length;
 h(`${back('aAbj')}<h2>${c} · ${AN[i]}</h2>${pal()}<div class=ac-big id=acb>${c}</div><button class=alt onclick="say('${AN[i]}','ar')">🔊 اسمع</button><p class=mut>✍️ تتبّع الحرف</p>${pad()}<div class=ac-nav><button class=alt onclick="aAbjP(${(i+n-1)%n})">→ السابق</button><button class=big onclick="aAbjP(${(i+1)%n})">التالي ←</button></div>`);
 tracer(c,FA,()=>{good();star('a'+c)});say(AN[i],'ar')};
MN.push(['🌈','الألوان بالعربي','aColAr'],['🎨','Colors بالإنجليزي','aColEn'],['🔷','الأشكال بالعربي','aShpAr'],['🔶','Shapes بالإنجليزي','aShpEn'],['فَ','الحركات: فتحة وضمة وكسرة','aHar'],['🔤','الحروف العربية (تتبّع)','aAbj']);
})();
