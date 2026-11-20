/* router.js — تنقّل حقيقي داخل الموقع (زر الرجوع في الهاتف + السحب من الحافة + أزرار «رجوع»)
   المبدأ: كل شاشة جديدة = مدخل واحد في سجل المتصفح (history). الرجوع يعيدك إلى الشاشة السابقة فعلًا، خطوة خطوة،
   وليس إلى الرئيسية. لا نخزّن HTML؛ نخزّن اسم الشاشة ومعطياتها فقط ثم نعيد رسمها بنفس الدالة.
   • الأسئلة داخل الاختبار لا تُنشئ مداخل جديدة (الرجوع من الاختبار يعود للدرس).
   • شاشات الاختبار «عابرة» (vol): لا نعود إليها بالرجوع، ونتخطى المكرر تلقائيًا.
   • نافذة «اسأل بومي» تُغلق أولًا بزر الرجوع دون مغادرة الشاشة.
   • عند تحديث الصفحة تُستعاد الشاشة نفسها، وتُستعاد مواضع التمرير. */
(()=>{
'use strict';
const H=window.history;try{H.scrollRestoration='manual'}catch(e){}
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const safe=v=>{try{return JSON.parse(JSON.stringify(v===undefined?null:v))}catch(e){return null}};
const ARC='games';
/* إعداد الشاشات: cs = القسم المضيء في الشريط العلوي · iter = استبدل المدخل الحالي إذا كان من الدالة نفسها (تنقّل بين عناصر نفس الشاشة)
   vol = شاشة عابرة (اختبار) · root = شاشة لا يُرجَع إليها (إنشاء ملف/اختيار الطالب) */
const CFG={
 home:{cs:'home'},who:{root:1,cs:''},setup:{root:1,cs:''},
 sec:{cs:a=>a&&a[0]||'les'},parent:{cs:'set'},voiceSet:{cs:'set'},cert:{cs:'ach'},
 lesson:{cs:'les'},quiz:{vol:1},bank:{cs:'les'},bankSub:{cs:'les'},bankLesson:{cs:'les'},bankReview:{cs:'les'},arTeach:{cs:'ar'},bankPractice:{cs:'les'},mstart:{cs:'math'},wnum:{cs:'math'},daily:{cs:ARC},review:{cs:ARC},speak:{cs:ARC},
 courseLibrary:{cs:'les',iter:1},courseModule:{cs:'les'},courseViewer:{cs:'les',iter:(a,b)=>a&&b&&a[0]==b[0]&&a[1]==b[1]},coursePractice:{cs:'les'},
 act:{cs:ARC},aLet:{cs:ARC},aLetP:{cs:ARC,iter:1},aNumEn:{cs:ARC},aNumAr:{cs:ARC},aNumP:{cs:ARC,iter:1},aCount:{cs:ARC},aMiss:{cs:ARC},aDice:{cs:ARC},aPath:{cs:ARC,iter:1},
 aColAr:{cs:ARC},aColEn:{cs:ARC},aColQAr:{cs:ARC},aColQEn:{cs:ARC},aShpAr:{cs:ARC},aShpEn:{cs:ARC},aShpQAr:{cs:ARC},aShpQEn:{cs:ARC},
 aHar:{cs:ARC},aHarP:{cs:ARC,iter:1},aHarQ:{cs:ARC},aAbj:{cs:ARC},aAbjP:{cs:ARC,iter:1},
 gMem:{cs:ARC},gBuild:{cs:ARC},gPat:{cs:ARC},gOrd:{cs:ARC},
 world:{cs:ARC},path:{cs:'les'},games2d:{cs:ARC},g2levels:{cs:ARC,iter:(a,b)=>a&&b&&a[0]==b[0]},g2play:{cs:ARC,iter:(a,b)=>a&&b&&a[0]==b[0]},
 stories:{cs:ARC,iter:1},story:{cs:ARC},talk:{cs:ARC},listenTest:{cs:ARC},readTest:{cs:ARC},
 puzzles:{cs:ARC},riddles:{cs:ARC},logic:{cs:ARC},measure:{cs:'math'},wordProblems:{cs:'math'},speedGame:{cs:ARC},dragBuild:{cs:ARC,iter:1},matchPics:{cs:ARC,iter:1},
 dictation:{cs:ARC,iter:1},dictationAdv:{cs:ARC},syllables:{cs:ARC},weekly:{cs:ARC},advanced:{cs:ARC},advMath:{cs:ARC},advMul:{cs:ARC},teacher:{cs:'set'},enTeach:{cs:'les'},aFirst:{cs:ARC},aOpp:{cs:ARC},aPat:{cs:ARC},aOdd:{cs:ARC},aDays:{cs:ARC},aEnPic:{cs:ARC}
};
let depth=0,restoring=false,shown=null,shownRoute=null,curN=0,ov=null;
const entry=()=>{const s=H.state;return s&&s.hurufi?s.hurufi:null};
const put=(m,e)=>{try{H[m]({hurufi:e},'')}catch(err){}};
const same=(a,b)=>!!(a&&b&&a.fn===b.fn&&JSON.stringify(a.args||[])===JSON.stringify(b.args||[]));
/* نسخة من تسلسل الشاشات في sessionStorage كي نعرف أين «الرئيسية» عند الحاجة */
const SK='hurufi-stack';
const stack=()=>{try{return JSON.parse(sessionStorage.getItem(SK)||'[]')||[]}catch(e){return[]}};
const setStack=(n,fn)=>{try{const s=stack().slice(0,n);s[n]=fn;sessionStorage.setItem(SK,JSON.stringify(s))}catch(e){}};
const setCS=(fn,args)=>{const c=CFG[fn]&&CFG[fn].cs;if(c===undefined)return;try{window.CS=typeof c==='function'?c(args):c}catch(e){}};
const syncNav=()=>{try{const nv=document.getElementById('gn');if(!nv)return;const k=window.V=='home'?'home':window.CS||'';nv.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k==k))}catch(e){}};

function commit(name,args){
 const cfg=CFG[name]||{},cur=entry();
 const e={id:uid(),n:0,fn:name,args:safe(args)||[],vol:!!cfg.vol,root:!!cfg.root,up:null,y:0};
 if(!cur){put('replaceState',e);shown=e.id;curN=0;shownRoute={fn:name,args:e.args};setStack(0,name);return}
 const sameFn=cur.fn===name,sameArgs=JSON.stringify(cur.args||[])===JSON.stringify(e.args);
 const replaceIt=cur.root||(sameFn&&(sameArgs||cfg.iter===1||(typeof cfg.iter=='function'&&cfg.iter(cur.args,e.args))));
 if(replaceIt){e.n=cur.n;e.up=cfg.vol?(cur.vol?cur.up:null):cur.up;put('replaceState',e)}
 else{put('replaceState',{...cur,y:Math.round(window.scrollY||0)});e.n=cur.n+1;e.up=cfg.vol?(cur.vol?cur.up:{fn:cur.fn,args:cur.args}):null;put('pushState',e)}
 shown=e.id;curN=e.n;shownRoute={fn:name,args:e.args};setStack(e.n,name);
}
function wrap(name){
 const orig=window[name];if(typeof orig!=='function'||orig.__rt)return;
 const f=function(...a){
  if(restoring||depth>0)return orig.apply(this,a);
  const BA=window.BumiAudio;if(BA&&BA.stale())return; /* مؤقت من صفحة سابقة يحاول الانتقال بعد أن غادرها الطالب: نتجاهله */
  depth++;try{commit(name,a);setCS(name,a);BA&&BA.navigate();const self=this,r=BA?BA.within(()=>orig.apply(self,a)):orig.apply(this,a);syncNav();return r}finally{depth--}};
 f.__rt=1;f.__orig=orig;window[name]=f}
/* إعادة رسم مدخل محفوظ */
function render(e){
 restoring=true;
 try{shown=e.id;curN=e.n;let fn=e.fn,args=e.args||[];
  if(e.vol){const u=e.up;fn=u&&u.fn||'home';args=u&&u.args||[]}
  if(!window.P)fn='setup';else if(typeof window[fn]!='function')fn='home';
  shownRoute={fn,args};setCS(fn,args);
  const BA=window.BumiAudio;BA&&BA.navigate(); /* رجوع/تقدّم/سحب: تكتمل الجملة الحالية فقط ثم يبدأ صوت الصفحة */
  const run=f=>BA?BA.within(f):f();
  try{run(()=>window[fn].apply(null,args))}catch(err){try{run(()=>window.home())}catch(_){}}
  syncNav();
  const y=e.y||0;requestAnimationFrame(()=>{try{window.scrollTo(0,y)}catch(_){}})}
 finally{restoring=false}
}
addEventListener('popstate',ev=>{
 const e=ev.state&&ev.state.hurufi;
 if(!e){ /* مدخل غريب (غير مسجّل): نعتبره بداية جديدة */
  const n=1;const h0={id:uid(),n:0,fn:'home',args:[],vol:false,root:false,up:null,y:0};put('replaceState',h0);render(h0);return}
 const back=e.n<curN;
 if(ov&&!e.ov){const o=ov;ov=null;try{o.close()}catch(_){}}
 if(e.ov){ /* وصلنا لمدخل نافذة (تقدّم) — لا نافذة الآن: نُزيل العلامة فقط */
  put('replaceState',{...e,ov:null});curN=e.n;return}
 if(e.id===shown){curN=e.n;return}
 if(back&&e.vol&&e.n>0){H.back();return}
 if(back&&e.n>0&&!e.vol&&same(e,shownRoute)){H.back();return}
 if(e.vol&&!back){const u=e.up||{fn:'home',args:[]};const r={...e,fn:u.fn,args:u.args||[],vol:false,up:null};put('replaceState',r);render(r);return}
 render(e);
});
/* زر «رجوع» داخل الصفحة = نفس زر الرجوع في الهاتف */
function goBack(){
 const e=entry();if(e&&e.n>0)H.back();else if(typeof window.home=='function')window.home()}
window.goBack=goBack;
function goHome(){
 const e=entry(),s=stack();if(e){for(let k=e.n-1;k>=0;k--){if(s[k]==='home'){H.go(k-e.n);return true}}}return false}
document.addEventListener('click',ev=>{
 const b=ev.target.closest&&ev.target.closest('button,a[role=button]');if(!b||b.disabled)return;
 const t=(b.textContent||'').replace(/[\u064B-\u0652\u0670\u0640]/g,'').replace(/\s+/g,' ').trim(),e=entry(); /* نتجاهل التشكيل عند التعرّف على أزرار «رجوع» */
 if(b.dataset&&b.dataset.back!=null){ev.preventDefault();ev.stopImmediatePropagation();goBack();return}
 if(!e||e.n<1)return;
 if(/^(←\s*)?رُ?جُ?وع(\s*←)?$/.test(t)||/^←\s*العودة/.test(t)||/^العودة/.test(t)){ev.preventDefault();ev.stopImmediatePropagation();goBack();return}
 if(/رجوع للرئيسية/.test(t)){if(goHome()){ev.preventDefault();ev.stopImmediatePropagation()}return}
 if(/^(←\s*)?رجوع\s/.test(t)||/^←\s/.test(t)){ev.preventDefault();ev.stopImmediatePropagation();goBack()}
},true);
/* نافذة «اسأل بومي»: مدخل في السجل ليغلقها زر الرجوع أولًا */
function wrapOverlay(){
 const orig=window.bomi;if(typeof orig!='function'||orig.__rt)return;
 const f=function(){orig.apply(this,arguments);const el=document.getElementById('bm'),cur=entry();if(!el||!cur||ov)return;
  ov={close:()=>{try{window.BumiAudio?BumiAudio.navigate():window.say&&say.stop&&say.stop();window.bmicStop&&bmicStop(1)}catch(_){}const x=document.getElementById('bm');x&&x.remove()}};
  put('pushState',{...cur,n:cur.n+1,ov:'bm'});curN=cur.n+1;
  const mo=new MutationObserver(()=>{if(document.getElementById('bm'))return;mo.disconnect();
   if(ov){ov=null;const c=entry();if(c&&c.ov)H.back()}});mo.observe(document.body,{childList:true})};
 f.__rt=1;window.bomi=f}
['home','who','setup','sec','parent','voiceSet','cert','lesson','quiz','bank','bankSub','bankLesson','bankReview','bankPractice','arTeach','mstart','wnum','daily','review','speak',
 'courseLibrary','courseModule','courseViewer','coursePractice','act','aLet','aLetP','aNumEn','aNumAr','aNumP','aCount','aMiss','aDice','aPath',
 'aColAr','aColEn','aColQAr','aColQEn','aShpAr','aShpEn','aShpQAr','aShpQEn','aHar','aHarP','aHarQ','aAbj','aAbjP',
 'gMem','gBuild','gPat','gOrd','world','path',
 'stories','story','talk','sbStory','sbQuiz','sbTest','listenTest','readTest','puzzles','riddles','logic','measure','wordProblems','speedGame','dragBuild','matchPics','dictation','dictationAdv','syllables','weekly','advanced','advMath','advMul','teacher','enTeach','aFirst','aOpp','aPat','aOdd','aDays','aEnPic'].forEach(wrap);
wrapOverlay();
/* البداية: إعادة الشاشة المحفوظة عند التحديث، أو تسجيل المدخل الأول */
(function init(){
 const e=entry();
 if(e&&window.P){const r=e.ov?{...e,ov:null}:e;if(e.ov)put('replaceState',r);render(r)}
 else if(e&&!window.P){const h0={id:uid(),n:0,fn:'setup',args:[],root:true,vol:false,up:null,y:0};put('replaceState',h0);shown=h0.id;shownRoute={fn:'setup',args:[]}}
 else{const fn=window.V=='setup'?'setup':window.V=='who'?'who':'home';
  put('replaceState',{id:uid(),n:0,fn,args:[],vol:false,root:fn!=='home',up:null,y:0});shown=entry().id;shownRoute={fn,args:[]};setStack(0,fn)}
})();
window.Router={back:goBack,home:goHome,entry,stack,CFG};
/* منع رسم صفحة قديمة فوق الجديدة: مؤقت من صفحة سابقة (مثل «السؤال التالي» بعد ٨٠٠ م.ث) لا يرسم بعد مغادرتها */
try{const oh=window.h;if(typeof oh==='function'){h=function(x){if(window.BumiAudio&&BumiAudio.stale())return;return oh.apply(this,arguments)}}}catch(_){}
})();

/* إذا كان هناك نص محدَّد وضغط الطالب زرًا: نلغي التحديد فورًا كي يستجيب الزر من أول ضغطة */
document.addEventListener('pointerdown',e=>{try{const s=getSelection();if(s&&!s.isCollapsed&&e.target.closest&&e.target.closest('button,.opt,.card,.row,a,[onclick],input,select,canvas'))s.removeAllRanges()}catch(_){}},true);
