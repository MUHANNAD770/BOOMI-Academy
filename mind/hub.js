/* mind/hub.js — العقل الموحّد لبومي: نقطة واحدة تصلها كل إجابة في الموقع، ويقرأ منها كل شيء.
   قبله: كانت اختبارات الدروس وحدها تُغذّي ذاكرة بومي (mind/memory.js)، والألعاب والأنشطة والرياضيات وتمارين الكورس منفصلة.
   • record(...)  كل إجابة صحيحة/خاطئة من أي مكان ← إتقان «المهارة» (المادة + الدرس/اللعبة) بنفس نموذج تتبّع المعرفة في memory.js،
                   مع إحصاء لكل مصدر (درس، لعبة، نشاط، تمرين كورس…) وطريقة العودة إليه.
   • weak(n)      أضعف المهارات (إتقان < ٦٠٪ بعد ٣ محاولات على الأقل).
   • next()       الخطوة التالية للطالب: مراجعة حان موعدها ← مهارة ضعيفة ← الدرس التالي في المسار.
   • brief()      ملخص قصير يُرسل لبومي (الذكاء الاصطناعي) ويظهر لولي الأمر.
   • fresh(sig)   منع التكرار: هل ظهر هذا السؤال قريبًا؟ (آخر ١٢٠ سؤالًا لكل طالب)
   الربط تلقائي: إجابات .opt وتمارين الكورس (anim.js يحدد الصح/الخطأ)، أصوات «صحيح/خطأ» (التمارين والألغاز)، والألعاب (games2d).
   لا تُحذف أي بيانات سابقة؛ كل الجديد داخل P.mind في ملف الطالب ويُزامَن معه. */
window.Mind=(()=>{'use strict';
const DAY=864e5,now=()=>Date.now();
const SUBJ={'اللغة العربية':'ar','العربية':'ar','اللغة الإنجليزية':'en','الإنجليزية':'en','الرياضيات':'math','ألعاب الذكاء':'iq','مغامرات':'adv'};
const NAME={ar:'العربية',en:'الإنجليزية',math:'الرياضيات',iq:'الذكاء والمنطق',adv:'المغامرات',gen:'عام'};
const M=()=>{if(!window.P)return null;P.mind=P.mind||{};const m=P.mind;m.sk=m.sk||{};m.src=m.src||{};m.seen=m.seen||[];return m};
const ctx=()=>{try{const r=window.BomiCtx&&BomiCtx();return r?{...(r.info||{}),page:r.page}:{}}catch(e){return{}}};
const entry=()=>{try{const c=window.cur;if(c&&c.id&&typeof window.find==='function'&&/^\d+-\d+$/.test(c.id)&&find(c.id))return`lesson('${c.id}')`}catch(e){} /* اختبار درس: العودة للدرس نفسه */
 try{const e=window.Router&&Router.entry();if(e&&/^(quiz|g2play)$/.test(e.fn))return'';if(e&&e.fn&&typeof window[e.fn]==='function')return e.fn+'('+(e.args||[]).map(a=>JSON.stringify(a)).join(',')+')'}catch(e){}return''};
const code=s=>{if(!s)return'gen';for(const k in SUBJ)if(String(s).includes(k))return SUBJ[k];return/english|إنجليز/i.test(s)?'en':/رياض|math/i.test(s)?'math':/عرب/.test(s)?'ar':'gen'};
let saveT=0;const persist=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{save()}catch(e){}},800)};
/* نموذج الإتقان نفسه في memory.js (تتبّع المعرفة + تكرار متباعد) لكن للمهارات، في P.mind.sk كي لا تختلط بكلمات P.sk */
function upd(s,ok,ms){const p0=s.p==null?.3:s.p,gain=ms&&ms<4000?.3:.22;let p=ok?p0+(1-p0)*gain:p0*.62;s.p=+Math.min(.99,Math.max(.02,p)).toFixed(3);
 s.n=(s.n||0)+1;s.ok=(s.ok||0)+(ok?1:0);s.s=ok?(s.s||0)+1:0;s.due=now()+(ok?Math.min(30,Math.pow(2,Math.max(0,s.s-1)))*DAY:20*60000);s.t=Math.round(now()/1000);return s}
let last={t:0,sig:''};
function record(o){const m=M();if(!m||!o)return null;
 const c=o.subject?null:ctx(),subj=o.subject||code(c&&c.subject),topic=String(o.topic||(c&&(c.lesson||c.course))||'').replace(/\s+/g,' ').trim().slice(0,48)||NAME[subj];
 const sig=subj+'|'+topic+'|'+(o.ok?1:0);if(now()-last.t<350&&last.sig===sig)return null; /* نفس الإجابة وصلت من طريقين (صوت + زر) */last={t:now(),sig};
 const key=subj+':'+topic,s=m.sk[key]=m.sk[key]||{};upd(s,!!o.ok,o.ms);s.sub=subj;s.name=topic;const go=o.go||entry();if(go)s.go=go;
 const src=o.src||(c&&c.page)||'نشاط',st=m.src[src]=m.src[src]||{n:0,ok:0};st.n++;st.ok+=o.ok?1:0;st.t=Math.round(now()/1000);
 if(o.k&&window.MindMemory&&o.src!=='quiz')try{MindMemory.observe({k:o.k,ok:!!o.ok,ms:o.ms,type:o.type})}catch(e){}
 persist();try{document.dispatchEvent(new CustomEvent('mind-answer',{detail:{key,ok:!!o.ok,p:s.p}}))}catch(e){}return s}
const pct=p=>Math.round((p||0)*100);
function skills(sub){const m=M();if(!m)return[];return Object.entries(m.sk).filter(([k,s])=>!sub||s.sub===sub).map(([k,s])=>({k,...s}))}
function weak(n){return skills().filter(s=>(s.n||0)>=3&&s.p<.6).sort((a,b)=>a.p-b.p).slice(0,n||5)}
function strong(n){return skills().filter(s=>(s.n||0)>=3&&s.p>=.85).sort((a,b)=>b.p-a.p).slice(0,n||5)}
function bySubject(){const o={};for(const s of skills()){if(!(s.n>=2))continue;const x=o[s.sub]=o[s.sub]||{n:0,sum:0,name:NAME[s.sub]||s.sub};x.n++;x.sum+=s.p}for(const k in o)o[k].p=o[k].sum/o[k].n;return o}
/* الدرس التالي في المسار (أول درس غير مكتمل في مرحلة الطالب) */
function nextLesson(){try{const st=S[+P.stage||0];for(const u of st.u)if(!(P.done||{})[u.id])return u}catch(e){}return null}
/* الخطوة التالية: قرار واحد يستعمله الصفحة الرئيسية وبومي ولوحة ولي الأمر */
function next(){if(!window.P)return null;
 try{const due=window.MindMemory?MindMemory.dueItems(null,30).filter(it=>{const s=P.sk[it[0]];return s&&(s.due||0)<now()}).length:0;
  if(due>=4)return{icon:'🔁',t:'مراجعة ذكية',why:`حان وقت مراجعة ${due} كلمات تعلّمتها كي لا تُنسى`,go:'review()'}}catch(e){}
 const w=weak(3).filter(s=>s.go);if(w.length){const s=w[0];return{icon:'🎯',t:'تدرّب: '+s.name,why:`إتقانك هنا ${pct(s.p)}٪ — تدريب قصير يرفعه`,go:s.go}}
 const u=nextLesson();if(u)return{icon:'▶️',t:u.n,why:'الدرس التالي في رحلتك',go:`lesson('${u.id}')`};
 return{icon:'🎮',t:'تحدٍّ ممتع',why:'أتقنت دروس مرحلتك! جرّب لعبة جديدة',go:"sec('games')"}}
/* ملخص قصير لبومي وولي الأمر */
function brief(){const m=M();if(!m)return'';const w=weak(4).map(s=>`${s.name} (${NAME[s.sub]||''} ${pct(s.p)}٪)`),g=strong(3).map(s=>s.name),out=[];
 if(w.length)out.push('يحتاج تدريبًا في: '+w.join('، '));if(g.length)out.push('متقن: '+g.join('، '));
 try{const sm=window.MindMemory&&MindMemory.summary&&MindMemory.summary();if(sm&&sm.errs&&sm.errs.length)out.push('أخطاؤه المتكررة: '+sm.errs.slice(0,3).map(e=>e.label||e.t).join('، '))}catch(e){}
 const nx=next();if(nx)out.push('الخطوة المقترحة: '+nx.t);return out.join(' | ')}
/* منع التكرار: بصمة السؤال تُحفظ (آخر ١٢٠)، والمولّد يتجنّب ما ظهر قريبًا */
const norm=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/[ً-ْٰ\s]+/g,'').slice(0,60);
function seen(sig){const m=M();return!!m&&m.seen.includes(norm(sig))}
function mark(sig){const m=M();if(!m)return;const k=norm(sig);if(!k)return;const i=m.seen.indexOf(k);if(i>=0)m.seen.splice(i,1);m.seen.push(k);if(m.seen.length>120)m.seen.splice(0,m.seen.length-120)}
/* يجرّب المولّد حتى ٥ مرات للحصول على سؤال لم يظهر قريبًا */
function fresh(make,sigOf){let q=null;for(let i=0;i<5;i++){q=make();if(!q||!seen(sigOf(q)))break}if(q)mark(sigOf(q));return q}

/* ===== الربط التلقائي بكل مصادر الإجابات ===== */
/* ١) خيارات الإجابة في الدروس والرياضيات والأنشطة وتمارين الكورس (نفس قاعدة anim.js) */
const ANS='.opt,.practice-options button,.ct-opts button';let t0=now();
/* مرحلة الفقاعة: بعد أن ينفّذ الزر عمله (يضع ok/no)؛ نقرأ الحالة فورًا لأن بعض الصفحات تعيد البناء مباشرة،
   ونعيد المحاولة بعد لحظة لما يضع الحالة متأخرًا. السياق (الدرس) يُؤخذ لحظة الضغط قبل تغيّر الصفحة. */
document.addEventListener('click',e=>{const el=e.target.closest&&e.target.closest(ANS);if(!el||el.closest('.g2-pz,.g2-ov,.g2-match'))return;const ms=now()-t0;
 const st=()=>{const c=' '+el.className+' ';return/ (ok|good|right) /.test(c)?1:/ (no|bad|wrong) /.test(c)?0:-1};
 let c0=null;try{const x=ctx();c0={subject:code(x.subject),topic:x.lesson||x.course,src:x.page}}catch(_){}
 const go=entry(),fire=v=>record({ok:!!v,ms,...(c0||{}),go});
 const v=st();if(v>=0)fire(v);else setTimeout(()=>{const v2=st();if(v2>=0)fire(v2)},60)},false);
/* بداية كل سؤال/صفحة: لقياس زمن الإجابة */
new MutationObserver(()=>{t0=now()}).observe(document.getElementById('app')||document.body,{childList:true});
/* ٢) أماكن تشغّل صوت «صحيح/خطأ» بلا أزرار .opt (الألغاز، تمارين الكورس) */
if(window.HurufiSound&&HurufiSound.play){const op=HurufiSound.play;HurufiSound.play=function(k){const r=op.apply(this,arguments);if((k==='correct'||k==='wrong')&&now()-last.t>350)try{record({ok:k==='correct',ms:now()-t0})}catch(e){} /* سُجّلت للتو من مصدرها (لعبة/زر): لا نكررها */return r}}
return{record,weak,strong,skills,bySubject,next,brief,seen,mark,fresh,NAME,pct}})();
