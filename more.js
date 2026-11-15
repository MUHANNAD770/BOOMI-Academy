/* more.js — قصص ومحادثات وأنشطة جديدة (إضافة فقط؛ لا يتغير شيء سابق).
   • القصص تُضاف إلى عالم القصص نفسه (window.STORIES) فتعمل معها القراءة والاستماع وأسئلة الفهم والنجوم.
   • الأنشطة تُضاف إلى قائمة «أنشطة تفاعلية» (AC.MN) وتستعمل أصوات بومي ومؤثرات الصوت نفسها.
   • محتوى أصلي مكتوب للموقع، والعربية مشكولة بالكامل. في الأسئلة: الخيار الأول هو الصحيح (يُخلط عند العرض). */
(()=>{
'use strict';
/* ================= القصص ================= */
const ST=window.STORIES;
if(ST){
ST.AR.push(
 {id:'a9',ic:'🐢',lv:1,t:'السُّلَحْفَاةُ الْمُجْتَهِدَةُ',s:['كَانَتْ سُلَحْفَاةٌ صَغِيرَةٌ تَمْشِي بِبُطْءٍ فِي الْغَابَةِ.','ضَحِكَ الْأَرْنَبُ وَقَالَ: أَنْتِ بَطِيئَةٌ جِدًّا!','قَالَتِ السُّلَحْفَاةُ: هَيَّا نَتَسَابَقْ إِلَى الشَّجَرَةِ الْكَبِيرَةِ.','رَكَضَ الْأَرْنَبُ بِسُرْعَةٍ، ثُمَّ نَامَ تَحْتَ ظِلِّ شَجَرَةٍ.','مَشَتِ السُّلَحْفَاةُ بِلَا تَوَقُّفٍ حَتَّى وَصَلَتْ أَوَّلًا.','تَعَلَّمَ الْأَرْنَبُ أَنَّ الِاجْتِهَادَ أَهَمُّ مِنَ السُّرْعَةِ.'],
  q:[['مَنْ فَازَ فِي السِّبَاقِ؟',['السُّلَحْفَاةُ','الْأَرْنَبُ','الثَّعْلَبُ']],['مَاذَا فَعَلَ الْأَرْنَبُ فِي الطَّرِيقِ؟',['نَامَ تَحْتَ شَجَرَةٍ','أَكَلَ جَزَرًا','سَبَحَ فِي النَّهْرِ']],['مَاذَا تَعَلَّمَ الْأَرْنَبُ؟',['الِاجْتِهَادُ أَهَمُّ مِنَ السُّرْعَةِ','النَّوْمُ مُفِيدٌ دَائِمًا','الْغَابَةُ كَبِيرَةٌ']]]},
 {id:'a10',ic:'🧸',lv:1,t:'غُرْفَةُ مَرْيَمَ',s:['كَانَتْ غُرْفَةُ مَرْيَمَ مُبَعْثَرَةً، وَالْأَلْعَابُ عَلَى الْأَرْضِ.','أَرَادَتْ مَرْيَمُ أَنْ تَلْعَبَ بِدُمْيَتِهَا، فَلَمْ تَجِدْهَا.','قَالَتْ أُمُّهَا: هَيَّا نُرَتِّبُ الْغُرْفَةَ مَعًا.','وَضَعَتْ مَرْيَمُ الْكُتُبَ عَلَى الرَّفِّ، وَالْأَلْعَابَ فِي الصُّنْدُوقِ.','وَجَدَتِ الدُّمْيَةَ تَحْتَ الْوِسَادَةِ، فَفَرِحَتْ كَثِيرًا.'],
  q:[['لِمَاذَا لَمْ تَجِدْ مَرْيَمُ دُمْيَتَهَا؟',['لِأَنَّ الْغُرْفَةَ مُبَعْثَرَةٌ','لِأَنَّهَا نَائِمَةٌ','لِأَنَّ الدُّمْيَةَ فِي السُّوقِ']],['أَيْنَ وَضَعَتِ الْكُتُبَ؟',['عَلَى الرَّفِّ','فِي الصُّنْدُوقِ','تَحْتَ السَّرِيرِ']],['أَيْنَ وَجَدَتِ الدُّمْيَةَ؟',['تَحْتَ الْوِسَادَةِ','فِي الْمَطْبَخِ','فِي الْحَدِيقَةِ']]]},
 {id:'a11',ic:'🏮',lv:2,t:'فَانُوسُ يُوسُفَ',s:['اقْتَرَبَ شَهْرُ رَمَضَانَ، فَفَرِحَ يُوسُفُ كَثِيرًا.','صَنَعَ مَعَ أَبِيهِ فَانُوسًا مُلَوَّنًا مِنَ الْوَرَقِ.','عَلَّقَا الْفَانُوسَ عَلَى نَافِذَةِ الْبَيْتِ.','فِي الْمَسَاءِ، أَضَاءَ الْفَانُوسُ بِأَلْوَانٍ جَمِيلَةٍ.','قَالَ يُوسُفُ: سَأَصْنَعُ فَانُوسًا مِثْلَهُ لِجَارِنَا الصَّغِيرِ.'],
  q:[['مَعَ مَنْ صَنَعَ يُوسُفُ الْفَانُوسَ؟',['مَعَ أَبِيهِ','مَعَ جَدِّهِ','وَحْدَهُ']],['مِمَّ صُنِعَ الْفَانُوسُ؟',['مِنَ الْوَرَقِ','مِنَ الْحَدِيدِ','مِنَ الزُّجَاجِ']],['مَاذَا قَرَّرَ يُوسُفُ أَنْ يَفْعَلَ؟',['أَنْ يَصْنَعَ فَانُوسًا لِجَارِهِ','أَنْ يَنَامَ مُبَكِّرًا','أَنْ يَشْتَرِيَ حَلْوَى']]]},
 {id:'a12',ic:'🐝',lv:2,t:'النَّحْلَةُ نُورَةُ',s:['تَسْتَيْقِظُ النَّحْلَةُ نُورَةُ مَعَ شُرُوقِ الشَّمْسِ.','تَطِيرُ مِنْ زَهْرَةٍ إِلَى زَهْرَةٍ لِتَجْمَعَ الرَّحِيقَ.','تَعُودُ إِلَى الْخَلِيَّةِ وَتُسَاعِدُ أَخَوَاتِهَا فِي صُنْعِ الْعَسَلِ.','سَأَلَتْهَا فَرَاشَةٌ: أَلَا تَتْعَبِينَ؟','قَالَتْ نُورَةُ: الْعَمَلُ مَعَ الْأَصْدِقَاءِ يَجْعَلُنِي سَعِيدَةً.'],
  q:[['مَاذَا تَجْمَعُ النَّحْلَةُ مِنَ الْأَزْهَارِ؟',['الرَّحِيقَ','الْمَاءَ','الرَّمْلَ']],['مَاذَا يَصْنَعُ النَّحْلُ فِي الْخَلِيَّةِ؟',['الْعَسَلَ','الْحَلِيبَ','الْخُبْزَ']],['مَنْ سَأَلَ نُورَةَ؟',['فَرَاشَةٌ','عُصْفُورٌ','قِطَّةٌ']]]},
 {id:'a13',ic:'🚦',lv:2,t:'سَالِمٌ وَالْإِشَارَةُ',s:['خَرَجَ سَالِمٌ مَعَ جَدِّهِ إِلَى الْمَكْتَبَةِ.','وَقَفَا عِنْدَ الْإِشَارَةِ، وَكَانَ لَوْنُهَا أَحْمَرَ.','قَالَ الْجَدُّ: الْأَحْمَرُ يَعْنِي قِفْ، وَالْأَخْضَرُ يَعْنِي امْشِ.','عِنْدَمَا صَارَ اللَّوْنُ أَخْضَرَ، عَبَرَا الشَّارِعَ مِنْ مَمَرِّ الْمُشَاةِ.','قَالَ سَالِمٌ: سَأَنْتَبِهُ دَائِمًا لِلْإِشَارَةِ.'],
  q:[['إِلَى أَيْنَ ذَهَبَ سَالِمٌ؟',['إِلَى الْمَكْتَبَةِ','إِلَى الْبَحْرِ','إِلَى السُّوقِ']],['مَاذَا يَعْنِي اللَّوْنُ الْأَحْمَرُ؟',['قِفْ','امْشِ','ارْكُضْ']],['مِنْ أَيْنَ عَبَرَا الشَّارِعَ؟',['مِنْ مَمَرِّ الْمُشَاةِ','مِنْ بَيْنِ السَّيَّارَاتِ','مِنْ فَوْقِ السُّورِ']]]},
 {id:'a14',ic:'📚',lv:3,t:'الْكِتَابُ الْعَجِيبُ',s:['وَجَدَ آدَمُ فِي مَكْتَبَةِ الْمَدْرَسَةِ كِتَابًا قَدِيمًا عَنِ الْبِحَارِ.','قَرَأَ فِيهِ عَنِ الْحِيتَانِ الضَّخْمَةِ وَالْأَسْمَاكِ الْمُلَوَّنَةِ.','كُلَّمَا قَلَبَ صَفْحَةً، تَعَلَّمَ شَيْئًا جَدِيدًا.','فِي الْيَوْمِ التَّالِي، حَكَى لِأَصْدِقَائِهِ مَا قَرَأَ.','قَالَتِ الْمُعَلِّمَةُ: الْقِرَاءَةُ تَأْخُذُنَا فِي رِحْلَاتٍ دُونَ أَنْ نُسَافِرَ.','ابْتَسَمَ آدَمُ وَقَرَّرَ أَنْ يَقْرَأَ كِتَابًا كُلَّ أُسْبُوعٍ.'],
  q:[['عَنْ مَاذَا كَانَ الْكِتَابُ؟',['عَنِ الْبِحَارِ','عَنِ الْفَضَاءِ','عَنِ الطَّبْخِ']],['أَيْنَ وَجَدَ آدَمُ الْكِتَابَ؟',['فِي مَكْتَبَةِ الْمَدْرَسَةِ','فِي السُّوقِ','فِي الْحَدِيقَةِ']],['مَاذَا قَرَّرَ آدَمُ؟',['أَنْ يَقْرَأَ كِتَابًا كُلَّ أُسْبُوعٍ','أَنْ يُسَافِرَ إِلَى الْبَحْرِ','أَنْ يَتْرُكَ الْقِرَاءَةَ']]]});
ST.EN.push(
 {id:'e9',ic:'🐘',lv:1,t:'Ella the Elephant',s:['Ella is a big gray elephant.','She lives near a river.','She likes to spray water with her trunk.','The little birds play in the water too.','Everyone has fun with Ella.'],q:[['What color is Ella?',['Gray','Pink','Green']],['Where does Ella live?',['Near a river','In a city','In a tree']],['What does Ella spray?',['Water','Milk','Sand']]]},
 {id:'e10',ic:'🚲',lv:1,t:'My New Bike',s:['Omar has a new bike.','It is blue and fast.','At first, he falls down.','His dad helps him try again.','Now Omar can ride very well!'],q:[['What color is the bike?',['Blue','Red','Black']],['Who helps Omar?',['His dad','His teacher','His sister']],['Can Omar ride now?',['Yes, very well','No, never','Only at night']]]},
 {id:'e11',ic:'🧁',lv:2,t:'Baking with Grandma',s:['On Friday, Sara visits her grandma.','They bake cupcakes in the kitchen.','Sara mixes the flour, eggs, and milk.','Grandma puts the cupcakes in the oven.','They share the cupcakes with the neighbors.'],q:[['When does Sara visit her grandma?',['On Friday','On Monday','Every night']],['What do they bake?',['Cupcakes','Bread','Pizza']],['Who do they share the cupcakes with?',['The neighbors','The teacher','The cat']]]},
 {id:'e12',ic:'🌟',lv:2,t:'The Shy Star',s:['There is a small star in the sky.','It is shy and hides behind the clouds.','One night, a little girl is lost in the desert.','The small star shines brightly to show her the way.','Now the star is not shy anymore.'],q:[['Where does the star hide?',['Behind the clouds','Under the sea','In a box']],['Who is lost?',['A little girl','A dog','A teacher']],['What does the star do?',['It shines to show the way','It goes to sleep','It falls down']]]},
 {id:'e13',ic:'⚽',lv:3,t:'The Team Game',s:['Our class has a football game today.','Khalid wants to score all the goals alone.','He does not pass the ball, so the team loses the first half.','The coach says, "A team wins together."','In the second half, Khalid passes the ball, and his friend scores!','The class learns that teamwork is important.'],q:[['What game does the class play?',['Football','Basketball','Tennis']],["What is Khalid's mistake?",['He does not pass the ball','He comes late','He forgets his shoes']],['What does the class learn?',['Teamwork is important','Winning is everything','Football is boring']]]},
 {id:'e14',ic:'🚀',lv:3,t:'A Trip to Space',s:['Noor dreams of going to space.','In her dream, she flies in a silver rocket.','She sees the Earth, blue and beautiful, from far away.','She waves to the Moon and counts the stars.','When she wakes up, she decides to study science.','Maybe one day, her dream will come true.'],q:[['How does Noor go to space in her dream?',['In a rocket','On a plane','On a horse']],['What color is the Earth?',['Blue','Yellow','Purple']],['What does Noor decide?',['To study science','To stop dreaming','To sleep more']]]});
(ST.TALK||[]).push(
 {id:'c7',ic:'🛒',t:'At the market',d:[['A','Good morning! I want some apples, please.'],['B','Red or green?'],['A','Red, please. How much are they?'],['B','Two riyals.'],['A','Here you are. Thank you!']],q:[['What does A want?',['Apples','Bananas','Milk']],['How much are the apples?',['Two riyals','Ten riyals','They are free']]]},
 {id:'c8',ic:'📞',t:'On the phone',d:[['A','Hello, this is Sara. Can I speak to Mona?'],['B','Hi Sara! This is Mona.'],['A','Do you want to come to my party?'],['B','Yes, I would love to! When is it?'],['A','On Saturday at five.']],q:[['Who is calling?',['Sara','Mona','Dad']],['When is the party?',['On Saturday at five','On Monday morning','Tonight']]]},
 {id:'c9',ic:'🏫',t:'First day at school',d:[['A','Hi! I am Ali. Are you new here?'],['B','Yes, my name is Adam.'],['A','Welcome! Do you like drawing?'],['B','Yes, I love drawing animals.'],['A','Me too! Let us sit together.']],q:[["What is the new boy's name?",['Adam','Ali','Omar']],['What does Adam love?',['Drawing animals','Swimming','Cooking']]]});
}

/* ================= الأنشطة ================= */
const AC=window.AC;if(!AC)return;
const{MN,back,good,star,sh,pk,R}=AC;
const AD='٠١٢٣٤٥٦٧٨٩',ad=n=>String(n).replace(/\d/g,d=>AD[d]);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bad=()=>{try{HurufiSound.play('wrong');MC.mood('oops',1200)}catch(e){}};
const talk=(t,l)=>{try{if(!(window.muted&&muted()))say(t,l||'ar')}catch(e){}};
const PIC=/\p{Extended_Pictographic}/u;
const units=()=>typeof S!=='undefined'?S.flatMap(s=>s.u):[];
/* محرّك جولات موحّد: ٥ أسئلة، نجمة لكل إجابة صحيحة، وشرح لطيف عند الخطأ */
function rounds(me,title,sub,gen){let r=0,s=0;const N=5;
 const next=()=>{if(r>=N)return end();const q=gen(r);const opts=sh(q.opts);
  h(`${back()}<h2>${title}</h2><p class=mut>${sub} · ${ad(r+1)} مِنْ ${ad(N)} · ⭐ ${ad(s)}</p>${q.show}
   ${q.sayBtn?`<button class=alt onclick="say(${esc(JSON.stringify(q.sayBtn[0]))},'${q.sayBtn[1]}')">🔊 اسمع مرة أخرى</button>`:''}
   <div class="grid ${q.wide?'':'mo-grid'}" ${q.ltr?'dir=ltr':''}>${opts.map(o=>`<button class=opt data-ok="${o.ok?1:0}" dir=auto>${o.h}</button>`).join('')}</div><p id=mofb class=mut aria-live=polite></p>`);
  if(q.say)talk(q.say[0],q.say[1]);
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.ok==='1';document.querySelectorAll('.opt').forEach(o=>{o.disabled=1;if(o.dataset.ok==='1')o.classList.add('ok')});
   const fb=document.getElementById('mofb');
   if(ok){s++;good();const m=pk(['أَحْسَنْتَ!','رَائِعٌ!','إِجَابَةٌ صَحِيحَةٌ!']);if(fb)fb.textContent=m;talk(m,'ar')}
   else{b.classList.add('no');bad();if(fb)fb.textContent=q.why||'';if(q.why)talk(q.why,q.whyL||'ar')}
   try{q.rec&&q.rec(ok)}catch(e){}
   r++;setTimeout(next,ok?1100:2300)})};
 const end=()=>{try{P.star=(P.star||0)+s;save();HurufiSound.play(s>=3?'finish':'wrong')}catch(e){}if(s>=3)star(me);
  h(`<h1>${s>=3?'🌟':'💪'}</h1><h2>${ad(s)} مِنْ ${ad(N)}</h2><p>+${ad(s)} ⭐</p><button class=big onclick="${me}()">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick=act()>رجوع للأنشطة</button>`);
  talk(s>=3?'أَحْسَنْتَ! أَنْهَيْتَ النَّشَاطَ.':'مُحَاوَلَةٌ جَمِيلَةٌ، هَيَّا نَلْعَبُ مَرَّةً أُخْرَى.','ar')};
 next()}

/* ١) أوّل حرف: صورة وكلمة عربية، والطالب يختار الحرف الذي تبدأ به */
const plain=w=>String(w).replace(/[ً-ْٰـ]/g,'');
const first=w=>{const c=plain(w).trim()[0];return/[أإآا]/.test(c)?'ا':c};
const LET='ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');
const arPics=()=>{const seen=new Set();return units().filter(u=>u.l==='ar').flatMap(u=>u.i).filter(it=>PIC.test(it[1])&&!/\s/.test(it[0])&&!/^ال/.test(plain(it[0]))&&plain(it[0]).length>=2).filter(it=>{const k=plain(it[0]);if(seen.has(k))return false;seen.add(k);return true})};
window.aFirst=()=>{const L=arPics();rounds('aFirst','🔤 أَوَّلُ حَرْفٍ','بِأَيِّ حَرْفٍ تَبْدَأُ الْكَلِمَةُ؟',()=>{const it=pk(L),c=first(it[0]),o=[c,...sh(LET.filter(x=>x!==c)).slice(0,2)];
 return{show:`<div class=q>${it[1]}</div><h2 style="text-align:center">${esc(it[0])}</h2>`,say:[`${it[0]}. بِأَيِّ حَرْفٍ تَبْدَأُ؟`,'ar'],sayBtn:[it[0],'ar'],opts:o.map(x=>({h:`<span style="font-size:2rem">${x==='ا'?'أ':x}</span>`,ok:x===c})),why:`كَلِمَةُ ${it[0]} تَبْدَأُ بِحَرْفِ ${c==='ا'?'الْأَلِفِ':c}.`}})};

/* ٢) الأضداد */
const OPP=[['كَبِيرٌ','صَغِيرٌ','🐘','🐜'],['طَوِيلٌ','قَصِيرٌ','🦒','🐕'],['حَارٌّ','بَارِدٌ','🔥','🧊'],['سَرِيعٌ','بَطِيءٌ','🐇','🐢'],['ثَقِيلٌ','خَفِيفٌ','🏋️','🪶'],['نَهَارٌ','لَيْلٌ','☀️','🌙'],['فَوْقَ','تَحْتَ','⬆️','⬇️'],['قَرِيبٌ','بَعِيدٌ','🏠','🏔️'],['جَدِيدٌ','قَدِيمٌ','✨','🏚️'],['سَعِيدٌ','حَزِينٌ','😀','😢'],['مَفْتُوحٌ','مُغْلَقٌ','🔓','🔒'],['نَظِيفٌ','مُتَّسِخٌ','🧼','🟤'],['قَوِيٌّ','ضَعِيفٌ','💪','🥀'],['مُمْتَلِئٌ','فَارِغٌ','🥛','🫙']];
window.aOpp=()=>rounds('aOpp','↔️ الْأَضْدَادُ','اخْتَرْ عَكْسَ الْكَلِمَةِ',()=>{const p=pk(OPP),rev=Math.random()<.5,w=rev?p[1]:p[0],a=rev?p[0]:p[1],e=rev?p[3]:p[2],ae=rev?p[2]:p[3];
 const others=sh(OPP.filter(x=>x!==p)).slice(0,2).map(x=>Math.random()<.5?[x[0],x[2]]:[x[1],x[3]]);
 return{show:`<div class=q>${e}</div><h2 style="text-align:center">${w}</h2>`,say:[`مَا عَكْسُ ${w}؟`,'ar'],wide:1,opts:[{h:`${ae} ${a}`,ok:true},...others.map(x=>({h:`${x[1]} ${x[0]}`,ok:false}))],why:`عَكْسُ ${w} هُوَ ${a}.`}});

/* ٣) أكمل النمط */
const SETS=[['🍎','🍌','🍇'],['🔴','🔵','🟢'],['⭐','🌙','☀️'],['🐶','🐱','🐰'],['🚗','🚌','🚲'],['🟥','🟨','🟦'],['🌸','🍀','🍁']];
const TYPES=[[0,1],[0,0,1],[0,1,1],[0,1,2]];
window.aPat=()=>rounds('aPat','🧩 أَكْمِلِ النَّمَطَ','مَا الشَّكْلُ الَّذِي يَأْتِي بَعْدَهَا؟',r=>{const set=pk(SETS),t=TYPES[Math.min(TYPES.length-1,R(0,Math.min(3,1+r)))],len=t.length*2+R(0,t.length-1);
 const seq=Array.from({length:len},(_,i)=>set[t[i%t.length]]),ans=set[t[len%t.length]];
 return{show:`<div class=q dir=ltr style="letter-spacing:4px">${seq.join(' ')} ❓</div>`,say:['مَا الشَّكْلُ التَّالِي؟','ar'],ltr:1,opts:set.map(x=>({h:`<span style="font-size:2.2rem">${x}</span>`,ok:x===ans})),why:'انْظُرْ كَيْفَ يَتَكَرَّرُ النَّمَطُ مِنَ الْبِدَايَةِ، ثُمَّ أَكْمِلْهُ.'}});

/* ٤) أيّها مختلف؟ */
const GR=[['فَوَاكِهُ',['🍎','🍌','🍇','🍓','🍉','🍐']],['حَيَوَانَاتٌ',['🐶','🐱','🦁','🐮','🐰','🐵']],['مَرْكَبَاتٌ',['🚗','🚌','🚲','✈️','🚂','🚢']],['مَلَابِسُ',['👕','👖','👗','🧦','🧢','🧥']],['أَدَوَاتٌ مَدْرَسِيَّةٌ',['✏️','📏','📚','✂️','🎒','🖍️']],['خُضَارٌ',['🥕','🥒','🍅','🥔','🧅','🌽']]];
window.aOdd=()=>rounds('aOdd','🔍 أَيُّهَا مُخْتَلِفٌ؟','اخْتَرِ الشَّيْءَ الَّذِي لَا يَنْتَمِي لِلْمَجْمُوعَةِ',()=>{const g=pk(GR),o=pk(GR.filter(x=>x!==g)),odd=pk(o[1]),same=sh(g[1]).slice(0,3);
 return{show:'',say:['أَيُّهَا مُخْتَلِفٌ عَنِ الْبَاقِي؟','ar'],opts:[...same.map(x=>({h:`<span style="font-size:2.4rem">${x}</span>`,ok:false})),{h:`<span style="font-size:2.4rem">${odd}</span>`,ok:true}],why:`الثَّلَاثَةُ ${g[0]}، وَ${odd} لَيْسَ مِنْهَا.`}});

/* ٥) أيام الأسبوع: ما اليوم الذي يأتي بعد…؟ */
const DAYS=['السَّبْتُ','الْأَحَدُ','الِاثْنَيْنِ','الثُّلَاثَاءُ','الْأَرْبِعَاءُ','الْخَمِيسُ','الْجُمُعَةُ'];
const DAYS_GEN=['السَّبْتِ','الْأَحَدِ','الِاثْنَيْنِ','الثُّلَاثَاءِ','الْأَرْبِعَاءِ','الْخَمِيسِ','الْجُمُعَةِ'];
window.aDays=()=>rounds('aDays','📅 أَيَّامُ الْأُسْبُوعِ','مَا الْيَوْمُ الَّذِي يَأْتِي بَعْدَهُ؟',()=>{const i=R(0,6),n=(i+1)%7,o=[n,...sh([0,1,2,3,4,5,6].filter(x=>x!==n&&x!==i)).slice(0,2)];
 return{show:`<div class=q style="font-size:1.6rem">📅 ${DAYS[i]} ← ؟</div>`,say:[`مَا الْيَوْمُ الَّذِي يَأْتِي بَعْدَ ${DAYS_GEN[i]}؟`,'ar'],wide:1,opts:o.map(x=>({h:DAYS[x],ok:x===n})),why:`بَعْدَ ${DAYS_GEN[i]} يَأْتِي ${DAYS[n]}.`}});

/* ٦) Listen and choose: يسمع الكلمة الإنجليزية ويختار صورتها (يُسجَّل فهمُ المعنى في متابعة الإنجليزية) */
const enPics=()=>{const seen=new Set();return units().filter(u=>u.l==='en').flatMap(u=>u.i).filter(it=>PIC.test(it[1])&&it[1].length<=4&&/^[A-Za-z ]+$/.test(it[0])).filter(it=>{const k=it[0].toLowerCase();if(seen.has(k)||seen.has(it[1]))return false;seen.add(k);seen.add(it[1]);return true})};
window.aEnPic=()=>{const L=enPics(),low=()=>!window.EnCoach||EnCoach.level()<3;
 rounds('aEnPic','🎧 Listen & choose','اسْتَمِعْ إِلَى الْكَلِمَةِ ثُمَّ اخْتَرْ صُورَتَهَا',()=>{const it=pk(L),o=[it,...sh(L.filter(x=>x!==it)).slice(0,2)];
  return{show:`<div class=q>🔊</div>`,say:[low()?`اسْتَمِعْ وَاخْتَرِ الصُّورَةَ: ${it[0]}`:`Listen and choose: ${it[0]}`,low()?'ar':'en'],sayBtn:[it[0],'en'],opts:o.map(x=>({h:`<span style="font-size:2.6rem">${x[1]}</span>`,ok:x===it})),
   why:`${it[0]}. ${(window.EnCoach&&EnCoach.meaning(it[0]))||''}`,whyL:'en',rec:ok=>{try{window.EnCoach&&EnCoach.recMeaning(it[0],ok,'listen')}catch(e){}}}})};

MN.push(['🔤','أَوَّلُ حَرْفٍ (عربي)','aFirst'],['↔️','الْأَضْدَادُ','aOpp'],['🧩','أَكْمِلِ النَّمَطَ','aPat'],['🔍','أَيُّهَا مُخْتَلِفٌ؟','aOdd'],['📅','أَيَّامُ الْأُسْبُوعِ','aDays'],['🎧','Listen & choose (English)','aEnPic']);
})();
