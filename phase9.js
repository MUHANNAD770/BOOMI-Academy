/* المرحلة ٩: تجربة تطبيق، مخاطبة مخصصة، تشكيل العرض، وتنقّل محفوظ بلا إعادة تحميل. */
(()=>{
 'use strict';
 const A=window.app;
 const isGirl=()=>!!(window.P&&P.gender==='female');
 window.studentWord=(male,female)=>isGirl()?female:male;
 window.studentCall=()=>isGirl()?'يَا بَطَلَة':'يَا بَطَل';
 window.studentPronoun=()=>isGirl()?'أَنْتِ':'أَنْتَ';

 /* المخاطبة حسب جنس الطالب: نقارن «جذع الكلمة بلا تشكيل» فيعمل على النص المشكول وغير المشكول،
    ونستبدل الكلمة كاملة فقط (مع حروف العطف/الجر الملتصقة)، فلا نغيّر جزءًا من كلمة أخرى. */
 const FEM={'بطل':'بَطَلَة','صديقي':'صَدِيقَتِي','أحسنت':'أَحْسَنْتِ','احسنت':'أَحْسَنْتِ','ممتاز':'مُمْتَازَة','جاهز':'جَاهِزَة','مستعد':'مُسْتَعِدَّة','شاطر':'شَاطِرَة','ذكي':'ذَكِيَّة','مبدع':'مُبْدِعَة','نجم':'نَجْمَة','أنت':'أَنْتِ','انت':'أَنْتِ',
  'حاول':'حَاوِلِي','اختر':'اِخْتَارِي','اكتب':'اُكْتُبِي','اضغط':'اِضْغَطِي','استمع':'اِسْتَمِعِي','اسمع':'اِسْمَعِي','انطق':'اِنْطِقِي','انطقها':'اِنْطِقِيهَا','ابدأ':'اِبْدَئِي','انظر':'اُنْظُرِي','ارسم':'اُرْسُمِي','لون':null,'تتبع':null,
  'رتب':'رَتِّبِي','ركب':'رَكِّبِي','جرب':'جَرِّبِي','تدرب':'تَدَرَّبِي','تذكر':'تَذَكَّرِي','انتبه':'اِنْتَبِهِي','أكمل':'أَكْمِلِي','اكمل':'أَكْمِلِي','اقرأ':'اِقْرَئِي','قل':'قُولِي','قلها':'قُولِيهَا','قله':'قُولِيهِ','تعال':'تَعَالَيْ','اسأل':'اِسْأَلِي','اسألني':'اِسْأَلِينِي','خذ':'خُذِي','ضع':'ضَعِي','عد':null,'اختره':'اِخْتَارِيهِ','اخترها':'اِخْتَارِيهَا','اكتبها':'اُكْتُبِيهَا','اكتبه':'اُكْتُبِيهِ','رددها':'رَدِّدِيهَا','ردد':'رَدِّدِي','العب':'اِلْعَبِي','استمتع':'اِسْتَمْتِعِي','فكر':'فَكِّرِي',
  'أجبت':'أَجَبْتِ','أتقنت':'أَتْقَنْتِ','كتبت':'كَتَبْتِ','نسيت':'نَسِيتِ','أنجزت':'أَنْجَزْتِ','تعلمت':'تَعَلَّمْتِ','فزت':'فُزْتِ','جمعت':'جَمَعْتِ','وصلت':'وَصَلْتِ','أخطأت':'أَخْطَأْتِ','اخترت':'اِخْتَرْتِ',
  'تستطيع':'تَسْتَطِيعِين','تحتاج':'تَحْتَاجِين','تتعلم':'تَتَعَلَّمِين','تحب':'تُحِبِّين','تريد':'تُرِيدِين','تعرف':'تَعْرِفِين',
  'لديك':'لَدَيْكِ','لك':'لَكِ','معك':'مَعَكِ','منك':'مِنْكِ','عليك':'عَلَيْكِ','إليك':'إِلَيْكِ','صوتك':'صَوْتَكِ','اسمك':'اِسْمُكِ','نجومك':'نُجُومُكِ','إنجازاتك':'إِنْجَازَاتُكِ','مستواك':'مُسْتَوَاكِ','نطقك':'نُطْقُكِ','إجابتك':'إِجَابَتُكِ','دورك':'دَوْرُكِ','معلمك':'مُعَلِّمُكِ','عمرك':'عُمْرَكِ','بصوتك':'بِصَوْتِكِ','سمعت':'سَمِعْتِ','كرر':'كَرِّرِي','كررها':'كَرِّرِيهَا'};
 /* المعلّم/المعلّمة (بومي) يتحدث عن نفسه */
 const strip=w=>w.replace(/[ً-ْٰـ]/g,'');
 const PRE=[['و','وَ'],['ف','فَ']];
 /* أفعال أمر لا نغيّرها إلا بعد «و/ف» لأنها وحدها قد تكون اسمًا (تعلّم = التعلّم) */
 const FEMV={'تعلم':'تَعَلَّمِي','تابع':'تَابِعِي'};
 const NASB=new Set(['ان','أن','لن','لم','كي','لكي','حتى']); /* بعدها يُحذف نون الأفعال الخمسة: أَنْ تَتَعَلَّمِي */
 const feminine=t=>{if(!isGirl()||!t)return t;let prev='';return String(t).replace(/[\u0621-\u064A\u064B-\u0652\u0670]+/g,w=>{const b=strip(w),pv=prev;prev=b;
   if(b in FEM){const f=FEM[b]||w;return NASB.has(pv)&&/ين$/.test(strip(f))?f.replace(/ن[\u064B-\u0652]*$/,''):f}
   for(const[p,pv]of PRE)if(b.length>2&&b[0]===p&&(b.slice(1) in FEM)&&FEM[b.slice(1)])return pv+FEM[b.slice(1)].replace(/^ا[\u064E\u064F\u0650]/,'ا'); /* همزة الوصل بعد و/ف لا تُشكَّل */
   for(const[p,pv]of PRE)if(b.length>2&&b[0]===p&&(b.slice(1) in FEMV))return pv+FEMV[b.slice(1)];
   return w})};
 window.studentGenderText=feminine;
 const vocalize=root=>{
  if(!window.Tashkeel||!root)return;
  const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
   const p=n.parentElement;
   return !p||p.closest('script,style,textarea,input,code')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;
  }}),nodes=[];let n;while(n=walk.nextNode())nodes.push(n);
  const sel=window.getSelection&&getSelection(),busy=sel&&!sel.isCollapsed&&sel.rangeCount?sel.getRangeAt(0):null;
  nodes.forEach(x=>{const v=x.nodeValue;if(!/[\u0621-\u064A]/.test(v))return;
   if(busy&&busy.intersectsNode(x))return; /* لا نلمس نصًا يحدّده الطالب الآن، وإلا ضاع التحديد */
   const nx=x.nextSibling,endFinal=!nx||(nx.nodeType===1&&/^(BR|DIV|P|LI|UL|OL|BUTTON|H[1-6]|SECTION|TD|TH|TR|TABLE|DETAILS|SUMMARY|INPUT|SELECT|TEXTAREA|CANVAS|SVG|IMG)$/i.test(nx.tagName));
   /* القصص والمحادثات ونصوص الكورس سرد لا خطاب: لا نحوّلها حسب جنس الطالب (كانت «وَصَلَتْ» تصير «وَصَلْتِ») */
   const narr=x.parentElement&&x.parentElement.closest('.story,.stories,.talk,.ct-paper,.course-frame,.card,.opt,.q,.grid,[data-nogender]');
   let t=window.Tashkeel.apply(narr?v:feminine(v));
   /* اسم نكرة معروض وحده (بطاقة درس، قائمة كلمات، خانة جدول، خيار): يُكتب منوّنًا (ذُرَةٌ) بدل تسكين آخره، وهو نفسه ما ينطقه بومي (voice.js nun1) */
   if(window.Tashkeel.nunWord&&/^\s*[\u0621-\u064A][\u0621-\u064A\u064B-\u0652\u0670]*\s*$/.test(t)&&x.parentElement&&x.parentElement.textContent.trim()===v.trim()){const w=t.trim(),n=Tashkeel.nunWord(w);if(n!==w)t=t.replace(w,n)}
   if(window.Pron)t=Pron.display(t,endFinal);
   if(t!==v)x.nodeValue=t});
 };
 const observer=new MutationObserver(rows=>rows.forEach(row=>row.addedNodes.forEach(node=>{if(node.nodeType===1)vocalize(node);else if(node.nodeType===3&&node.parentElement)vocalize(node.parentElement)})));
 observer.observe(document.body,{childList:true,subtree:true}); /* التطبيق + الشريط العلوي + نوافذ بومي */
 const nvh=document.getElementById('gn');if(nvh)vocalize(nvh);

 /* التنقّل (التاريخ وزر الرجوع) صار في router.js؛ هنا فقط تحسين العرض بعد كل رسم. */
 let rendered=false;
 const afterRender=()=>{
  if(!A)return;
  vocalize(A);
  A.classList.remove('screen-in');void A.offsetWidth;A.classList.add('screen-in');
  A.querySelectorAll('button,.card,.row,.tl button').forEach(b=>b.classList.add('motion-ready'));
  rendered=true;

 };


 /* كل محركات المشروع تستدعي h؛ لفّه هنا يحافظ على كل المزايا السابقة. */
const oldH=window.h;
window.h=function(markup){const value=oldH(markup);afterRender();return value};

 /* استجابة مرئية فورية قبل انتقال السؤال التالي. */
 const burst=(target,ok)=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const r=target.getBoundingClientRect();for(let i=0;i<(ok?7:4);i++){
   const x=document.createElement('i');x.className='joy '+(ok?'yes':'no');x.textContent=ok?['⭐','✨','🎉'][i%3]:'💫';
   x.style.left=(r.left+r.width/2)+'px';x.style.top=(r.top+r.height/2)+'px';x.style.setProperty('--x',((Math.random()-.5)*150)+'px');x.style.setProperty('--y',(-35-Math.random()*110)+'px');document.body.appendChild(x);setTimeout(()=>x.remove(),900);
  }
 };
 document.addEventListener('click',e=>{const b=e.target.closest('.opt');if(b&&b.dataset.ok!=null)setTimeout(()=>burst(b,b.dataset.ok==='1'),10)},true);

 /* يُعرض تلميح تثبيت كتطبيق مرة واحدة فقط عندما يدعم المتصفح ذلك، بلا إزعاج. */
 let installPrompt;
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;document.documentElement.classList.add('can-install')});
 window.installHurufi=async()=>{if(!installPrompt)return;installPrompt.prompt();try{await installPrompt.userChoice}catch(_){}installPrompt=null};


 afterRender();
})();
