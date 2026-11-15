/* mind/memory.js — الطبقة ١: الذاكرة التعليمية طويلة المدى (لكل طالب على حدة داخل ملفه P، فلا تختلط بيانات الطلاب).
   • لكل مهارة/كلمة: احتمال الإتقان p (يتحدّث بعد كل إجابة بأسلوب «تتبّع المعرفة»)، سلسلة النجاح s، موعد المراجعة due (تكرار متباعد).
   • سجل قصير لآخر الأحداث (للاستدلال)، عدّاد أنماط الأخطاء، وما سُئل صوتيًا (لمنع التكرار).
   • الجلسة الحالية (غير محفوظة): السلاسل والسرعة — يستخدمها «المدرّب» ليقرّر متى يشجّع ومتى يشرح ومتى يعيد التدريب.
   لا شيء هنا يُرسل للإنترنت: التفاصيل تبقى على الجهاز. */
window.MindMemory=(()=>{
'use strict';
const DAY=864e5,now=()=>Date.now();
const M=()=>{P.mind=P.mind||{};const m=P.mind;m.ev=m.ev||[];m.err=m.err||{};m.vq=m.vq||[];m.said=m.said||[];return m};
/* جلسة لكل طالب (تُصفَّر عند تبديل الطالب) */
let S=null,owner=null;
const sess=()=>{if(owner!==P||!S){owner=P;S={streak:0,wrongRow:0,n:0,ok:0,fast:0,start:now(),lastWrongKey:null,redrill:0}}return S};
/* تحديث الإتقان: إجابة صحيحة تقرّب p من 1، والخاطئة تُنقصه؛ الإجابة السريعة الواثقة تزيد أكثر */
function update(k,ok,ms){const s=P.sk[k]=P.sk[k]||{n:0,m:0};const pn=(s.n||0)-1,pe=(s.e||0)-(ok?0:1);let p=s.p==null?(pn>=2?Math.min(.85,Math.max(.15,1-Math.max(0,pe)/pn)):.3):s.p;
 const gain=ms&&ms<4000?.34:.26;p=ok?p+(1-p)*gain:p*.58;s.p=+Math.min(.99,Math.max(.02,p)).toFixed(3);
 s.s=ok?(s.s||0)+1:0;
 /* التكرار المتباعد: كل نجاح متتالٍ يضاعف المدة (يوم، يومان، ٤، ٨ …)، والخطأ يعيدها قريبًا */
 s.due=now()+(ok?Math.min(30,Math.pow(2,Math.max(0,s.s-1)))*DAY:10*60000);return s}
function observe(e){const m=M(),s=sess(),sk=update(e.k,e.ok,e.ms);
 s.n++;if(e.ok){s.ok++;s.streak++;s.wrongRow=0;if(e.ms&&e.ms<3500)s.fast++}else{s.streak=0;s.wrongRow++;s.lastWrongKey=e.k}
 if(e.type&&!e.ok)m.err[e.type]=(m.err[e.type]||0)+1;
 m.ev.push([e.k.slice(0,24),+e.ok,Math.round((e.ms||0)/100),e.type||'',Math.round(now()/1000)]);if(m.ev.length>80)m.ev.splice(0,m.ev.length-80);
 return{sk,sess:s,recovered:e.ok&&(sk.e||0)>0&&sk.s===1}}
const mastery=k=>{const s=P.sk&&P.sk[k];return s?(s.p==null?(s.n?1-((s.e||0)/s.n):0):s.p):0};
/* الكلمات التي تعلّمها الطالب فعلًا (من الدروس المتقنة أو التي جرّبها) */
function learned(lang){const out=[],seen=new Set();const add=u=>{if(!u||(lang&&u.l!==lang))return;for(const it of u.i){if(!seen.has(it[0])){seen.add(it[0]);out.push(it)}}};
 for(const id of Object.keys(P.done||{})){try{add(find(id))}catch(e){}}
 if(out.length<6)for(const id of Object.keys(P.sc||{})){try{add(find(id))}catch(e){}}return out}
/* ما يستحق المراجعة الآن: ضعيف الإتقان أو حان موعده */
function dueItems(lang,n){const L=learned(lang).map(it=>{const s=P.sk[it[0]]||{};return[it,(1-mastery(it[0]))*2+((s.due||0)<now()?1:0)+Math.random()*.4]});return L.sort((a,b)=>b[1]-a[1]).slice(0,n||8).map(x=>x[0])}
/* ملخّص للوالدين ولطبقة الذكاء الخارجي */
const ERRN={similar:'يخلط بين حروف متشابهة النطق',dots:'يخلط بين حروف متشابهة الشكل (النقاط)',vowel:'يخطئ في الحركات',first:'يختار كلمة تبدأ بالحرف نفسه',offby1:'خطأ بمقدار واحد في العدّ',opswap:'يخلط بين العمليات (جمع/طرح/ضرب)',carry:'ينسى الحمل في الجمع',borrow:'ينسى الاستلاف في الطرح',table:'يحتاج تثبيت جدول الضرب',picture:'يخلط بين صور متقاربة',envowel:'vowel confusion in English',enfirst:'English words with the same first letter'};
function summary(){const m=M(),E=Object.entries(P.sk||{}),lang=E.filter(([k])=>!k.startsWith('m-')&&!k.startsWith('ai:')),avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
 const mast=lang.filter(([k,s])=>(s.p||0)>=.8).length,weak=lang.filter(([k,s])=>s.n>=2&&(s.p==null?(s.e||0)/s.n>=.4:s.p<.45)).sort((a,b)=>(a[1].p||0)-(b[1].p||0)).slice(0,8).map(x=>x[0]);
 const errs=Object.entries(m.err).filter(([t])=>ERRN[t]).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([t,n])=>({t,n,label:ERRN[t]||t}));
 const recent=m.ev.slice(-20),acc=recent.length?Math.round(recent.filter(e=>e[1]).length/recent.length*100):null,speed=recent.length?avg(recent.map(e=>e[2]))/10:null;
 return{mastered:mast,tracked:lang.length,weak,errs,recentAcc:acc,avgSec:speed?+speed.toFixed(1):null,dueCount:lang.filter(([k,s])=>(s.due||0)<now()&&s.n).length}}
return{M,sess,observe,update,mastery,learned,dueItems,summary,ERRN};
})();
