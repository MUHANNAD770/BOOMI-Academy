/* mind/analyzer.js — الطبقة ٢: الاستدلال وتحليل الإجابة. يأخذ السؤال وما اختاره الطالب ويستنتج «لماذا أخطأ»،
   ثم يكتب شرحًا قصيرًا مناسبًا لهذا الخطأ بالذات (لا عبارة عامة). كل الحسابات هنا مؤكدة رياضيًا/لغويًا — لا تخمين.
   analyze(سؤال، النص_المختار) ← {type, why, fix}  (type يُسجَّل في الذاكرة لمعرفة نمط أخطاء الطالب) */
window.MindAnalyzer=(()=>{
'use strict';
const strip=s=>String(s||'').replace(/[ً-ْٰـ]/g,'').replace(/<[^>]*>/g,' ').trim();
const AD='٠١٢٣٤٥٦٧٨٩',toN=s=>{const t=String(s||'').replace(/[٠-٩]/g,d=>AD.indexOf(d));const m=t.match(/-?\d+/);return m?+m[0]:null},D=n=>String(n).replace(/\d/g,d=>AD[d]);
/* حروف متقاربة في النطق، وحروف متقاربة في الشكل */
const SOUND=['تط','دض','ذز','ذظ','ثس','سص','قك','حه','عء','غخ','ضظ','زظ'],SHAPE=['بتثني','جحخ','دذ','رز','سش','صض','طظ','عغ','فق'];
const near=(a,b,L)=>L.some(g=>g.includes(a)&&g.includes(b));
const HAR={'َ':'الْفَتْحَةِ','ُ':'الضَّمَّةِ','ِ':'الْكَسْرَةِ','ْ':'السُّكُونِ','ّ':'الشَّدَّةِ'};
function lang(x,chosen){const right=String(x.k||''),r=strip(right),c=strip(chosen),ar=/[؀-ۿ]/.test(r);
 const hint=(x.opts||[]).length?'':'' ;
 if(!c||c===r||!/\p{L}/u.test(c)){ /* الخيارات صور/معانٍ: لا نعرف الكلمة التي خلط بها */
  return{type:'picture',why:`الْإِجَابَةُ الصَّحِيحَةُ: «${right}».`,fix:ar?'اُنْظُرْ إِلَى الصُّورَةِ جَيِّدًا، ثُمَّ اسْمَعِ الْكَلِمَةَ مَرَّةً أُخْرَى.':'Look at the picture, then listen again.'}}
 if(ar&&/[؀-ۿ]/.test(c)){const a=c[0],b=r[0];
  if(a!==b&&near(a,b,SOUND))return{type:'similar',why:`الْحَرْفَانِ «${b}» وَ«${a}» مُتَقَارِبَانِ فِي النُّطْقِ.`,fix:`اِسْمَعْ جَيِّدًا: الْكَلِمَةُ تَبْدَأُ بِـ«${b}»: «${right}».`};
  if(a!==b&&near(a,b,SHAPE))return{type:'dots',why:`الْحَرْفَانِ «${b}» وَ«${a}» مُتَشَابِهَانِ فِي الشَّكْلِ.`,fix:`اُنْظُرْ إِلَى النُّقَطِ: الصَّحِيحُ «${right}».`};
  if(c===r){ /* نفس الحروف واختلاف الحركات */
   const m=[...String(chosen)].find(ch=>HAR[ch]&&!right.includes(ch));return{type:'vowel',why:'الْحُرُوفُ صَحِيحَةٌ، لَكِنَّ الْحَرَكَةَ مُخْتَلِفَةٌ.',fix:`اِنْتَبِهْ إِلَى ${m?HAR[m]:'الْحَرَكَاتِ'}: الصَّحِيحُ «${right}».`}}
  if(a===b)return{type:'first',why:`الْكَلِمَتَانِ تَبْدَآنِ بِالْحَرْفِ «${b}» نَفْسِهِ.`,fix:`اِقْرَأِ الْكَلِمَةَ إِلَى آخِرِهَا: «${right}».`};
  return{type:'other',why:`الصَّحِيحُ «${right}».`,fix:'اِقْرَأِ الْكَلِمَةَ حَرْفًا حَرْفًا، ثُمَّ اخْتَرْ.'}}
 if(!ar&&/[a-z]/i.test(c)){const a=c[0].toLowerCase(),b=r[0].toLowerCase();
  if(a===b)return{type:'enfirst',why:`Both words start with "${b.toUpperCase()}".`,fix:`Read to the end of the word: "${right}".`};
  if('aeiou'.includes(a)&&'aeiou'.includes(b))return{type:'envowel',why:`"${a}" and "${b}" are both vowels, but they sound different.`,fix:`Listen again: "${right}".`};
  return{type:'other',why:`The correct word is "${right}".`,fix:'Listen once more, then choose.'}}
 return{type:'other',why:`الصَّحِيحُ «${right}».`,fix:''}}
/* الرياضيات: نستخرج العددين والعملية من نص السؤال ونقارن إجابة الطالب بأخطاء معروفة */
function math(x,chosen){const t=strip(x.show).replace(/[٠-٩]/g,d=>AD.indexOf(d)),m=t.match(/(\d+)\s*([+\-−×÷])\s*(\d+)/),c=toN(chosen);
 if(!m||c==null)return{type:'other',why:(x.ex&&x.ex[0])||'',fix:''};const a=+m[1],b=+m[3],op=m[2]==='-'?'−':m[2],res=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:a/b;
 const say=`${D(a)} ${op} ${D(b)} = ${D(res)}`;
 if(Math.abs(c-res)===1)return{type:'offby1',why:'قَرِيبٌ جِدًّا! الْفَرْقُ وَاحِدٌ فَقَطْ.',fix:`عُدَّ مَرَّةً أُخْرَى بِهُدُوءٍ: ${say}.`};
 if(op==='+'){if(c===Math.abs(a-b))return{type:'opswap',why:'الْإِشَارَةُ هُنَا (+) تَعْنِي الْجَمْعَ، لَا الطَّرْحَ.',fix:`نَجْمَعُ الْعَدَدَيْنِ: ${say}.`};
  if(c===res-10&&(a%10)+(b%10)>=10)return{type:'carry',why:'نَسِينَا الْعَشَرَةَ الْمَحْمُولَةَ.',fix:`الْآحَادُ ${D(a%10)} + ${D(b%10)} = ${D(a%10+b%10)}، نَكْتُبُ ${D((a%10+b%10)%10)} وَنَحْمِلُ ١: ${say}.`};
  if(c===a*b)return{type:'opswap',why:'هَذَا نَاتِجُ الضَّرْبِ، وَالْمَطْلُوبُ الْجَمْعُ.',fix:`${say}.`}}
 if(op==='−'){if(c===a+b)return{type:'opswap',why:'الْإِشَارَةُ هُنَا (−) تَعْنِي الطَّرْحَ، لَا الْجَمْعَ.',fix:`نَبْدَأُ مِنْ ${D(a)} وَنَرْجِعُ ${D(b)}: ${say}.`};
  if(c===res+10&&(a%10)<(b%10))return{type:'borrow',why:'عِنْدَ الِاسْتِلَافِ تَنْقُصُ الْعَشَرَاتُ وَاحِدًا.',fix:`نَسْتَلِفُ عَشَرَةً فَتَصِيرُ الْآحَادُ ${D(a%10+10)}: ${say}.`};
  if(c===b-a%10+Math.floor(a/10)*10||c===Math.abs((a%10)-(b%10))+Math.floor(a/10)*10-Math.floor(b/10)*10)return{type:'borrow',why:'طَرَحْنَا الصَّغِيرَ مِنَ الْكَبِيرِ فِي الْآحَادِ بَدَلَ الِاسْتِلَافِ.',fix:`${say}.`}}
 if(op==='×'){if(c===a+b)return{type:'opswap',why:'الضَّرْبُ لَيْسَ جَمْعًا لِلْعَدَدَيْنِ.',fix:`${D(a)} × ${D(b)} تَعْنِي أَنْ نَجْمَعَ ${D(a)} ${D(b)} مَرَّاتٍ: ${say}.`};
  if(c===a*(b+1)||c===a*(b-1)||c===(a+1)*b||c===(a-1)*b)return{type:'table',why:'هَذَا نَاتِجٌ مُجَاوِرٌ فِي جَدْوَلِ الضَّرْبِ.',fix:`${say}.`};
  return{type:'table',why:'نَحْتَاجُ تَثْبِيتَ هَذَا الْجُزْءِ مِنْ جَدْوَلِ الضَّرْبِ.',fix:`${say}.`}}
 if(op==='÷'){if(c===a-b)return{type:'opswap',why:'الْقِسْمَةُ لَيْسَتْ طَرْحًا.',fix:`كَمْ مَرَّةً يَدْخُلُ ${D(b)} فِي ${D(a)}؟ ${say}.`};return{type:'table',why:'الْقِسْمَةُ عَكْسُ الضَّرْبِ.',fix:`${D(b)} × ${D(res)} = ${D(a)}، إِذَنْ ${say}.`}}
 return{type:'other',why:'',fix:`${say}.`}}
const analyze=(x,chosen)=>{try{const r=String(x.k||'').startsWith('m-')?math(x,chosen):lang(x,chosen);if(window.P&&P.gender==='female'&&r.fix)r.fix=r.fix.replace(/عُدَّ(?=\s)/g,'عُدِّي');return r}catch(e){return{type:'other',why:'',fix:''}}};
return{analyze,toN,strip};
})();
