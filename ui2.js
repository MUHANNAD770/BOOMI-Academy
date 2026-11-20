/* ui2.js — إضافات الواجهة الجديدة على الصفحات الموجودة (يُحمَّل قبل router.js كي يبقى التنقّل يسجّل هذه الصفحات):
   • لافتات ملوّنة لأكاديميات العربية والإنجليزية والرياضيات، ولصفحة «إنجازاتي».
   • بطاقة «مستوى الإتقان» في لوحة ولي الأمر. لا تُحذف أي محتويات؛ تُضاف فوقها فقط. */
(()=>{'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const HD={ar:['ar','ض','أكاديمية العربية','حروف .. قراءة .. كتابة','📖'],en:['en','ABC','أكاديمية الإنجليزية','Letters • Phonics • Words','🔤'],
 math:['math','🔢','أكاديمية الرياضيات','أرقام .. عمليات .. أشكال','➕']};
const oSec=window.sec;
if(typeof oSec==='function')window.sec=function(k){const r=oSec.apply(this,arguments);try{const S=document.querySelector('#app .sec');if(!S)return r;
 const h2=S.querySelector(':scope>h2');
 if(HD[k]&&h2&&!S.querySelector('.acad-hd')){const[c,ic,t,sub,em]=HD[k];h2.classList.add('acad-h2');
  h2.insertAdjacentHTML('beforebegin',`<div class="acad-hd ${c}"><span class="acad-ic${/^[\p{L}]/u.test(ic)?'':' e'}"${c=='en'?' dir=ltr':''}>${ic}</span><div><b>${t}</b><small${c=='en'?' dir=ltr':''}>${sub}</small></div><span class=acad-em>${em}</span></div>`)}
  /* القصص في أكاديمية العربية (كانت داخل صفحة الألعاب فقط) */
  if(k==='ar'&&typeof window.stories==='function'&&!S.querySelector('.acad-stories'))h2.insertAdjacentHTML('afterend',`<button class="row acad-stories" onclick="stories()"><span>📚</span><b>عَالَمُ الْقِصَصِ</b><small>قصص مصوّرة للقراءة والاستماع</small></button>`);
 if(k==='ach'&&h2&&!S.querySelector('.ach-hd')){const st=+(window.P&&P.star)||0,bd=Object.keys((window.P&&P.badges)||{}).length;h2.classList.add('acad-h2');
  h2.insertAdjacentHTML('beforebegin',`<div class=ach-hd><span class=ach-cup>🏆</span><div class=ach-rib>إنجازاتي</div><b>${st?'أحسنت يا بطل!':'هيا نبدأ رحلة الإنجازات!'}</b><small>${st?`جمعت ${st} نجمة${bd?` و${bd} شارة`:''} 🌟`:'كل درس تتقنه يمنحك نجومًا وشارات جديدة'}</small><span class="ach-conf c1">🎉</span><span class="ach-conf c2">✨</span></div>`)}}catch(e){}return r};
/* لوحة ولي الأمر: مستوى الإتقان (متوسط أفضل نتائج الدروس من ٥) + الإنجازات + الدروس المكتملة + النجوم */
const oPar=window.parent;
if(typeof oPar==='function'&&oPar!==window.top)window.parent=function(){const r=oPar.apply(this,arguments);try{const A=document.getElementById('app'),h2=A&&A.querySelector('h2');if(!h2||A.querySelector('.pm-card'))return r;
 const P0=window.P||{},sc=Object.values(P0.sc||{}).map(Number).filter(x=>x>=0),pct=sc.length?Math.round(sc.reduce((a,b)=>a+b,0)/sc.length/5*100):0,
  done=Object.keys(P0.done||{}).length,bd=Object.keys(P0.badges||{}).length,st=+P0.star||0,R=44,C=2*Math.PI*R;
 h2.insertAdjacentHTML('afterend',`<div class=pm-card><div class=pm-ring><svg viewBox="0 0 110 110" aria-hidden=true><circle cx=55 cy=55 r=${R} class=pm-bg /><circle cx=55 cy=55 r=${R} class=pm-fg stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct/100)}" /></svg><b>${pct}٪</b><small>مستوى الإتقان</small></div>
  <div class=pm-who><span class=pm-av>${P0.gender==='female'?'👧':'👦'}</span><div><b>${esc(P0.name)}</b><small>${P0.age?esc(P0.age)+' سنوات':''}</small></div></div>
  <ul class=pm-st><li><span>🏆</span>الإنجازات<b>${bd}</b></li><li><span>⭐</span>النجوم<b>${st}</b></li><li><span>📚</span>الدروس المكتملة<b>${done}</b></li></ul></div>${mindCard()}${(window.BankReport&&BankReport())||''}${themeCard()}`)}catch(e){}return r};
/* تحليل بومي: من العقل الموحّد (mind/hub.js) — إتقان كل مادة، ما يحتاج تدريبًا (بزر تدريب مباشر)، المتقن، الأخطاء المتكررة، والخطوة المقترحة */
function mindCard(){const M=window.Mind;if(!M)return'';const bs=M.bySubject(),w=M.weak(4),g=M.strong(3),nx=M.next();let errs=[];try{errs=(window.MindMemory&&MindMemory.summary().errs)||[]}catch(e){}
 const bars=Object.values(bs).map(x=>`<li><span>${esc(x.name)}</span><i><b style="width:${M.pct(x.p)}%"></b></i><em>${M.pct(x.p)}٪</em></li>`).join('');
 const go=c=>String(c||'').replace(/"/g,'&quot;');
 const body=!bars&&!w.length?'<p class=mc-empty>سيبدأ بومي تحليل مستوى الطالب بعد بضع إجابات في الدروس والألعاب والتمارين.</p>':
  `${bars?`<ul class=mc-bars>${bars}</ul>`:''}${w.length?`<h4>🎯 يحتاج تدريبًا</h4><div class=mc-weak>${w.map(s=>`<button onclick="${go(s.go)}"${s.go?'':' disabled'}><b>${esc(s.name)}</b><small>${M.pct(s.p)}٪ · ${esc(M.NAME[s.sub]||'')}</small></button>`).join('')}</div>`:''}
  ${g.length?`<h4>🌟 متقن</h4><p class=mc-tags>${g.map(s=>`<span>${esc(s.name)}</span>`).join('')}</p>`:''}${errs.length?`<h4>🔍 أخطاء متكررة</h4><p class=mc-tags>${errs.slice(0,3).map(e=>`<span>${esc(e.label)} ×${e.n}</span>`).join('')}</p>`:''}`;
 return `<div class=mind-card><b class=mc-h>🎯 خطة بومي لطفلك</b>${body}${nx?`<button class=mc-next onclick="${go(nx.go)}"><span>${nx.icon}</span><div><small>الخطوة المقترحة · ${esc(nx.why||'')}</small><b>${esc(nx.t)}</b></div></button>`:''}</div>`}
/* المظهر: حسب الهاتف (افتراضي) / فاتح / داكن */
const TH=[['auto','📱','حسب الهاتف'],['light','☀️','فاتح'],['dark','🌙','داكن']];
const curTheme=()=>{try{const t=localStorage.getItem('ui-theme');return t==='light'||t==='dark'?t:'auto'}catch(e){return'auto'}};
function themeCard(){const c=curTheme();return `<div class=th-card><b>🎨 المظهر</b><div class=th-opts role=radiogroup>${TH.map(([k,i,t])=>`<button class="th-o${k===c?' on':''}" role=radio aria-checked=${k===c} onclick="setTheme('${k}')"><span>${i}</span>${t}</button>`).join('')}</div></div>`}
const meta=()=>{const m=document.querySelector('meta[name=theme-color]'),d=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);if(m)m.content=d?'#15163a':'#6a4cf0'};
window.setTheme=function(k){try{k==='auto'?localStorage.removeItem('ui-theme'):localStorage.setItem('ui-theme',k)}catch(e){}
 const de=document.documentElement;if(k==='auto')delete de.dataset.theme;else de.dataset.theme=k;meta();
 document.querySelectorAll('.th-o').forEach((b,i)=>{const on=TH[i][0]===k;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)})};
meta();try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',meta)}catch(e){}
})();
