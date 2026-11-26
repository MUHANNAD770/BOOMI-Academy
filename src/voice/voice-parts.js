/* src/voice/voice-parts.js — تجهيز النص للنطق بنفس المعالجة التي سُجّلت بها مقاطع بومي (tools/clips/harness.js):
   تصحيح ترتيب الشدّة والحركة، أسماء الحروف المنفردة (ب ← بَاء)، التشكيل (Tashkeel)، تنوين الكلمة المنفردة، والتقسيم حسب اللغة والجملة.
   الناتج أجزاء [نص، لغة] تطابق مفاتيح المقاطع المسجّلة حرفيًا، فيُسمع النص المعروض نفسه. */
(()=>{
'use strict';
const NOG=/^(story|stories|listenTest|readTest|courseViewer|courseModule|talk|dictation|dictationAdv|lesson|quiz|review|daily|bank|bankSub|bankLesson|bankReview|bankPractice|arTeach|sbStory|sbQuiz|sbTest)$/; /* صفحات محتوى تعليمي: لا تأنيث لكلمات الدرس (كانت «نَجْمٌ» تُقرأ «نَجْمَة») */
/* كلمة أو كلمتان = محتوى درس (مُمْتَاز، بَطَل…) لا خطاب؛ جمل التشجيع تصل مُحوَّلة أصلًا من مصدرها (المدرّب، بومي، معلّم الإنجليزية) */
const genderOk=t=>{if(window.__noGender)return false;if(t!=null&&String(t).trim().split(/\s+/).length<=2)return false;try{const e=window.Router&&Router.entry();return!(e&&NOG.test(e.fn))}catch(e){return true}};
const EM=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}•←→▶\u{2300}-\u{23FF}\u{1F000}-\u{1F2FF}]/gu;
/* التشكيل: الشدّة قبل الحركة (الترتيب الذي تفهمه المحركات)، حذف التطويل، منع تكرار الحركة */
const fixAr=s=>String(s).replace(/[\u200E\u200F\u061C\u0640]/g,'').replace(/([\u064B-\u0650])\u0651/g,'\u0651$1').replace(/([\u064B-\u0652])\1+/g,'$1');
/* كان هنا تحويل خاص بحرف الباء وحده (بَ ← «بَ، بَطَّة») من زمن محركات الجهاز التي لا تنطق المقطع منفردًا.
   المقاطع الآن مسجّلة (Edge) لكل الحروف، فيُنطق «بَ» وحده مثل «جَ» و«نَ»، دون كلمة إضافية. */
const SYL={};
/* حرف منفرد بلا حركة يُنطق باسمه (ب ← بَاء)، وحرف ساكن منفرد يُنطق بهمزة قبله (تْ ← أَتْ) كما يعلّمه المعلم */
{const N={'ا':'أَلِف','ب':'بَاء','ت':'تَاء','ث':'ثَاء','ج':'جِيم','ح':'حَاء','خ':'خَاء','د':'دَال','ذ':'ذَال','ر':'رَاء','ز':'زَاي','س':'سِين','ش':'شِين','ص':'صَاد','ض':'ضَاد','ط':'طَاء','ظ':'ظَاء','ع':'عَيْن','غ':'غَيْن','ف':'فَاء','ق':'قَاف','ك':'كَاف','ل':'لَام','م':'مِيم','ن':'نُون','ه':'هَاء','و':'وَاو','ي':'يَاء',
 'أ':'هَمْزَةٌ فَوْقَ الأَلِف','إ':'هَمْزَةٌ تَحْتَ الأَلِف','آ':'أَلِفُ المَدّ','ء':'هَمْزَة','ة':'تَاءٌ مَرْبُوطَة','ى':'أَلِفٌ مَقْصُورَة','ؤ':'هَمْزَةٌ عَلَى الوَاو','ئ':'هَمْزَةٌ عَلَى اليَاء'};
 for(const[l,n]of Object.entries(N)){const k=fixAr(l);if(!SYL[k])SYL[k]=n;const q=fixAr(l+'\u0652');if('بتثجحخدذرزسشصضطظعغفقكلمنهوي'.includes(l)&&!SYL[q])SYL[q]='أَ'+l+'\u0652'}}
const AR=/[\u0600-\u06FF]/,LA=/[A-Za-z]/;
/* تقسيم النص إلى مقاطع عربية وإنجليزية متتالية */
const runs=(s,L)=>{const o=[];let cl=null,cur=[];for(const w of s.split(' ')){const c=AR.test(w)?'ar':LA.test(w)?'en':(cl||L);if(cl&&c!==cl){o.push([cur.join(' '),cl]);cur=[]}cl=c;cur.push(w)}if(cur.length)o.push([cur.join(' '),cl]);return o};
const clean=(t,L)=>{let s=String(t==null?'':t);const k=fixAr(s.trim());if(SYL[k])s=SYL[k];
s=s.replace(/\+\s*(?=[0-9\u0660-\u0669]+\s*(?:⭐|🌟|نجم|نَجْم))/g,'')/* حرف منفرد داخل جملة («ا»، حرف ب) يُنطق باسمه كما وحده؛ كان يُرسل حرفًا مجردًا فيُنطق «آ/ع» */.replace(/«\s*([\u0621-\u064A])\s*»/g,(m,l)=>' '+(SYL[fixAr(l)]||l)+' ').replace(/(حَ?رْ?فِ?ُ?\s+)([\u0621-\u064A])(?=[\s،,.!؟?:]|$)/g,(m,a,l)=>a+(SYL[fixAr(l)]||l)) /* «+٢ ⭐» مكافأة نجوم لا عملية جمع: لا تُقرأ «زَائِد» */.replace(/<[^>]*>/g,' ').replace(EM,' ').replace(/[⟵⟶←→⬅➡«»“”"]/g,' ');
if(L=='ar'&&!/[0-9\u0660-\u0669]/.test(s))s=s.replace(/\s*[=+]\s*/g,' ، '); /* «=» و«+» في الشرح (لا في الحساب) فاصلٌ لا «يساوي/زائد» */
if(L=='ar')s=s.replace(/×/g,' ضَرْب ').replace(/÷/g,' قِسْمَة عَلَى ').replace(/\+/g,' زَائِد ').replace(/[−]/g,' نَاقِص ').replace(/(\d)\s*-\s*(\d)/g,'$1 نَاقِص $2').replace(/=/g,' يُسَاوِي ').replace(/[«»]/g,' ');
s=fixAr(s); /* لا نستعمل Pron.speech: كان يكتب الكلمات بتهجئة خاصة لصوت الجهاز (كِتَابُنْ، دُبْبْ) فتخالف نص المقاطع المسجّلة */
return s.replace(/\s+/g,' ').trim()};
const nun1=s=>{const m=String(s).trim().match(/^([\u0621-\u064A\u064B-\u0652\u0670]+)([.!؟?،]*)$/);if(!m)return s;
 /* سكون صريح في آخرها = قراءة بالوقف كما كُتبت (ألعاب تركيب الكلمة من حروفها: لا تنوين ظاهر، فلا تنوين في النطق) */
 if(/\u0652$/.test(m[1])){const H=window.HurufiClips;return(H&&!H.has(m[1],'ar')&&H.has(m[1].slice(0,-1),'ar')?m[1].slice(0,-1):m[1])+m[2]} /* «جَدّْ، أَرْنَبْ» ← «جَدّ، أَرْنَب»: المحرك يقف على الكلمة المجرّدة، ومفتاحها مسجّل */
 return Tashkeel.nunWord?Tashkeel.nunWord(m[1])+m[2]:s};
const ENDS=/[.!؟?\n]/,CL=/[^،,;:]+[،,;:]?/g,SNT=/[^.!؟?\n]+[.!؟?\n]*/g;
/* جملة ← أجزاء تُطابق مفاتيح المقاطع المسجّلة. */
/* تقسيم الجملة إلى مقاطع حسب اللغة فقط (بلا تقسيم عند الفواصل): بهذه المفاتيح نفسها سُجّلت مقاطع Edge (tools/clips) */
const mk=(sn,L)=>{const o=[],e=(sn.match(/[.!؟?]+\s*$/)||[''])[0].trim().slice(-1),body=sn.replace(/[.!؟?\n]+\s*$/,'').trim();if(!/[\p{L}\p{N}]/u.test(body))return o;
 const rr=runs(body,L);rr.forEach((r,i)=>{const last=i==rr.length-1,p={t:r[0],l:r[1],e:last?e:''};
  const cs=[p.t].map(x=>x.trim()).filter(x=>/[\p{L}\p{N}]/u.test(x));
  cs.forEach((x,j)=>{const m=(x.match(/[،,;:]$/)||[''])[0];o.push({t:x.replace(/[،,;:]$/,''),l:r[1],e:m||(last&&j==cs.length-1?e:'')})})});return o};
const parts=(t,l)=>{try{const L=l=='ar'?'ar':'en';let x=String(t==null?'':t);const k0=fixAr(x.trim());x=SYL[k0]||x;if(L=='ar'&&window.studentGenderText&&genderOk(x))x=studentGenderText(x);const c=clean(L=='ar'&&window.Tashkeel?nun1(Tashkeel.apply(x)):x,L),o=[];if(!c)return o;(c.match(SNT)||[c]).forEach(y=>mk(y.trim(),L).forEach(p=>o.push([p.t,p.l])));return o}catch(e){return[]}};
/* مقطع مسجّل لهذا الجزء؟ (الأرقام العربية ٣٥ مسجّلة باللاتينية 35) */
const D2L=x=>x.replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632));
const clipKey=(t,l)=>{try{const H=window.HurufiClips;if(!H)return null;if(H.has(t,l))return t;const y=D2L(t);if(y!==t&&H.has(y,l))return y}catch(e){}return null};
window.VoiceParts={parts,clipKey,fixAr,clean,runs};
})();
