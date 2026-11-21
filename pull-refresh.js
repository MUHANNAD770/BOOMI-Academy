/* سحب الصفحة من أعلاها للتحديث، مثل المتصفح، مع فحص تحديث Service Worker أولًا. */
(()=>{
 'use strict';
 const LIMIT=230,bar=document.createElement('div');let y=0,pulling=false,armed=false,loading=false;
 bar.id='pull-refresh';bar.setAttribute('role','status');bar.setAttribute('aria-live','polite');bar.innerHTML='<span class="ptr-arrow">↓</span><span class="ptr-copy">اسحب للأسفل أكثر للتحديث</span>';
 const atTop=()=>window.scrollY<=0&&document.documentElement.scrollTop<=0;
 const reset=()=>{pulling=false;armed=false;document.body.classList.remove('ptr-pulling','ptr-ready');bar.style.removeProperty('--ptr-y')};
 const refresh=()=>{if(loading)return;loading=true;document.body.classList.remove('ptr-ready');document.body.classList.add('ptr-loading');bar.querySelector('.ptr-copy').textContent='جارٍ التحديث…';const reload=()=>setTimeout(()=>location.reload(),180);if(navigator.serviceWorker){navigator.serviceWorker.getRegistration().then(r=>r?r.update():null).catch(()=>{}).finally(reload)}else reload()};
 addEventListener('DOMContentLoaded',()=>document.body.prepend(bar),{once:true});
 /* لا نعترض لمسة تبدأ من حافة الشاشة (سحب الرجوع في الهاتف)، ولا في الاختبار/الألعاب/الأنشطة كي لا يضيع تقدّم الطالب بإعادة تحميل غير مقصودة */
 const EDGE=32,busy=()=>{const v=window.V;return v==='quiz'||v==='fin'||!!document.querySelector('#app canvas,#app .qh,#bm')};
 let x0=0,dir='';
 document.addEventListener('touchstart',e=>{if(loading||e.touches.length!==1||!atTop()||busy())return;const target=e.target;if(target&&target.closest('input,textarea,select,canvas,.bl'))return;const t=e.touches[0];if(t.clientX<EDGE||t.clientX>innerWidth-EDGE)return;y=t.clientY;x0=t.clientX;dir='';pulling=true;armed=false},{passive:true});
 const selecting=()=>{try{const s=getSelection();return!!s&&!s.isCollapsed}catch(_){return false}};
 let lp=0;document.addEventListener('touchstart',()=>{clearTimeout(lp);lp=setTimeout(()=>{if(pulling)reset()},380)},{passive:true}); /* ضغطة مطوّلة = تحديد نص، وليست سحبًا */
 document.addEventListener('touchmove',e=>{clearTimeout(lp);if(!pulling||loading)return;if(selecting()){reset();return}const d=e.touches[0].clientY-y,dx=Math.abs(e.touches[0].clientX-x0);if(!dir&&(d>10||dx>10))dir=dx>d*.7?'h':'v';if(dir==='h'){reset();return}if(d<=0||!atTop()){reset();return}const visual=Math.min(130,d*.5);armed=d>=LIMIT;document.body.classList.toggle('ptr-pulling',d>8);document.body.classList.toggle('ptr-ready',armed);bar.style.setProperty('--ptr-y',`${visual-76}px`);bar.querySelector('.ptr-copy').textContent=armed?'اترك للتحديث':'اسحب للأسفل أكثر للتحديث';if(d>8)e.preventDefault()},{passive:false});
 document.addEventListener('touchend',()=>{clearTimeout(lp);if(!pulling)return;const go=armed&&!selecting();reset();if(go)refresh()},{passive:true});
 document.addEventListener('touchcancel',reset,{passive:true});
})();
