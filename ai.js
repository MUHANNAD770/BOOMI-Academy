/* ai.js v2 — «اسأل بومي»: محادثة تعليمية + شرح بأسلوب مختلف عند عدم الفهم + توليد تمارين جديدة + ملف تعلّم الطالب + حدّ يومي.
   يعمل المعلم المحلي (localAI) أولاً دون إنترنت، ثم الدالة /.netlify/functions/tutor للأسئلة الأصعب. */
let ch=[];const strip=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,300);
const AI_MAX=40; /* أقصى عدد طلبات ذكاء اصطناعي لكل طالب يومياً */
const aiUse=()=>{P.ai=P.ai&&P.ai.d==day()?P.ai:{d:day(),n:0};return P.ai};
const aiLeft=()=>AI_MAX-aiUse().n;
const LIM_MSG='وصلنا إلى حدّ الأسئلة الذكية لهذا اليوم 🦉 يمكنك اللعب والتعلّم، ونكمل غدًا بإذن الله!';
/* ملف تعلّم الطالب: مختصر وبلا بيانات شخصية، يُرسل لبومي لتناسب شرحها مستواه */
function profile(){const E=Object.entries(P.sk||{}).filter(([k])=>!k.startsWith('m-'));
 const weak=E.filter(([k,s])=>s.m>0||(s.n>=2&&(s.e||0)/s.n>=.4)).sort((a,b)=>(b[1].m||0)-(a[1].m||0)).slice(0,6).map(x=>x[0].replace(/^ai:/,''));
 const strong=E.filter(([k,s])=>s.n>=3&&(s.e||0)/s.n<.2).slice(0,6).map(x=>x[0]);
 const letters=Object.entries(P.wl||{}).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]);
 let notes=[];try{const s=MindMemory.summary();notes=s.errs.map(e=>e.label);if(s.recentAcc!=null)notes.push('دقة آخر الإجابات '+s.recentAcc+'٪')}catch(e){}
 let en=null;try{en=window.EnCoach?EnCoach.profile():null}catch(e){} /* مستوى الإنجليزية الحقيقي ← طريقة شرح بومي */
 return{stage:P.stage||0,gender:P.gender=='female'?'female':'male',done:Object.keys(P.done||{}).length,weak,strong,letters,notes,en}}
const weakList=()=>profile().weak.join('، ');
const AGAIN=/لم\s*أفهم|ما\s*فهمت|مو\s*فاهم|مش\s*فاهم|لا\s*أفهم|وضّ?ح|اشرح.*(مرة|مره|ثاني|اخر|أخر)|بطريقة\s*(أخرى|اخرى|ثانية)/;
let chOwner=null;
function bomi(){if(chOwner!==P){ch=(P.chat||[]).slice(-60);chOwner=P}window.bmicStop&&bmicStop(1);document.getElementById('bm')?.remove();const ctx=V=='quiz'&&qs&&qs[qi]?strip(qs[qi].show)+(qs[qi].sp?' — '+qs[qi].sp[0]:''):cur?(cur.n+(cur.i?': '+cur.i.slice(0,8).map(x=>{const m=String(x[1]).replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D\u20E3]/gu,'').trim();return m&&m!==x[0]?x[0]+' ('+m+')':x[0]}).join('، '):'')).slice(0,280):'';
const d=document.createElement('div');d.id='bm';d.className='bm';d.innerHTML=`<div class=bmh><b>🦉 بومي</b><small id=bnet class=bnet></small><button onclick="say.stop();bmicStop(1);document.getElementById('bm').remove()" aria-label="إغلاق">✕</button></div><div id=bl class=bl></div><div class=chips><button onclick="bex()">🎲 تمرين جديد</button><button onclick="bsend('لم أفهم، اشرح لي بطريقة أخرى')">🤔 لم أفهم</button>${localAI.topics().map(x=>`<button onclick="bsend(this.textContent)">${x}</button>`).join('')}</div><p id=bst class="bmic-state" aria-live="polite"></p><div class=bmi><input id=bi dir=auto placeholder="اكتب سؤالك…" onkeydown="event.key=='Enter'&&bsend()"><button onclick=bsend()>إرسال</button>${P.mic&&(window.SpeechRecognition||window.webkitSpeechRecognition)?'<button id=bmb onclick=bmic() aria-label="تحدث">🎤</button>':''}</div>`;
d.dataset.ctx=ctx;d.dataset.topic=V=='quiz'?'':(cur&&cur.n||'');document.body.appendChild(d);netBadge();if(!ch.length)bpush('a','أهلاً! اسألني عن أي شيء في الدرس، أو اضغط «تمرين جديد» لأجهّز لك أسئلة 😊');else ch.forEach(m=>bpush(m.role=='user'?'u':'a',window.Tashkeel?Tashkeel.apply(m.content):m.content,1))}
function bpush(w,t,nosave){const l=document.getElementById('bl');if(!l)return;const e=document.createElement('div');e.className='bb '+w;e.textContent=t;l.appendChild(e);l.scrollTop=l.scrollHeight;return e}
async function aiCall(body){const key=JSON.stringify([body.mode||'',body.message||'',body.topic||'',body.context||'']);if(AIC.has(key))return AIC.get(key);
 const task=(async()=>{const c=new AbortController(),tm=setTimeout(()=>c.abort(),14000);
 try{const r=await fetch('/.netlify/functions/tutor',{method:'POST',signal:c.signal,headers:{'content-type':'application/json'},body:JSON.stringify({name:P.name,age:P.age,profile:profile(),...body})});
 if(r.status==429)return{err:'busy'};if(!r.ok)return{err:'fail'};return await r.json()}catch(e){return{err:'net'}}finally{clearTimeout(tm);setTimeout(()=>AIC.delete(key),1200)}})();AIC.set(key,task);return task}
let busy=0;const AIC=new Map();
const think=()=>{window.MC&&MC.mood('think',12000)};const unthink=ok=>{window.MC&&MC.mood(ok?'happy':'oops',ok?900:1200)};
const onl=()=>navigator.onLine!==false,shape=t=>{const x=window.Tashkeel?Tashkeel.apply(t):t;return window.studentGenderText?window.studentGenderText(x):x};
const OFFMSG='لا يوجد إنترنت الآن 📴 ولا أعرف جواب هذا السؤال بعد. جرّب «تمرين جديد» أو اسألني عن شيء سبق أن تعلّمناه، وسأتعلّم أكثر عندما يعود الإنترنت 🦉';
function netBadge(){const e=document.getElementById('bnet');if(e)e.textContent=(onl()?'🟢':'📴 بلا إنترنت')+' · 🧠 '+(window.Brain?Brain.count():0)}
addEventListener('online',netBadge);addEventListener('offline',netBadge);
const keep=()=>{P.chat=ch.slice(-60);save()}; /* ذاكرة المحادثة: آخر ٦٠ رسالة محفوظة لكل طالب */
function serve(m,r,note){r=shape(r);ch.push({role:'user',content:m},{role:'assistant',content:r});ch=ch.slice(-60);keep();bpush('a',(note||'')+r);if(!muted())say(r.slice(0,360),'ar');netBadge()}
/* بثّ الإجابة: تصل على دفعات فتُعرض وتُنطق تدريجيًا. إن لم تتوفر الدالة تعود الطريقة العادية. */
async function aiStream(body,onText){aiStream.c&&aiStream.c.abort();const c=aiStream.c=new AbortController();let tm=setTimeout(()=>c.abort(),16000),all='';
 try{const r=await fetch('/.netlify/functions/tutor-stream',{method:'POST',signal:c.signal,headers:{'content-type':'application/json'},body:JSON.stringify({name:P.name,age:P.age,profile:profile(),...body})});
  if(r.status==429)return{err:'busy'};if(!r.ok||!r.body)return{err:'nostream'};
  const rd=r.body.getReader(),dc=new TextDecoder();
  for(;;){const{done,value}=await rd.read();if(done)break;const x=dc.decode(value,{stream:true});if(x){clearTimeout(tm);tm=setTimeout(()=>c.abort(),12000);all+=x;onText(x,all)}}
  return all.trim()?{reply:all.trim()}:{err:'nostream'}}
 catch(e){return all.trim()?{reply:all.trim()}:{err:'nostream'}}finally{clearTimeout(tm)}}
async function bsend(t){window.bmicStop&&bmicStop(1);const i=document.getElementById('bi'),m=(typeof t=='string'?t:i&&i.value||'').trim();if(!m||busy)return;if(i)i.value='';bpush('u',m);
const lo=localAI.think(m);if(lo){const tx=shape(lo.t);ch.push({role:'user',content:m},{role:'assistant',content:tx});ch=ch.slice(-60);keep();bpush('a',tx);if(!muted())say(tx.slice(0,320),'ar',lo.en?()=>say(lo.en,'en'):null);return}
const again=AGAIN.test(m),ctx=document.getElementById('bm')?.dataset.ctx||'';
/* 1) ذاكرة بومي: سؤال سبق جوابه ← إجابة فورية بلا إنترنت وبلا طلب */
if(!again&&window.Brain){const k=Brain.find(m,ctx,.8);if(k)return serve(m,k.a)}
/* 2) بلا إنترنت: أقرب جواب محفوظ، وإلا اعتذار لطيف */
if(!onl()){const k=!again&&window.Brain&&Brain.find(m,ctx,.72);return k?serve(m,k.a,'📴 '):bpush('a',OFFMSG)}
if(aiLeft()<=0)return bpush('a',LIM_MSG);
busy=1;aiUse().n++;save();think();
const w=bpush('a','');w.classList.add('think');w.innerHTML='<span class=dots><i></i><i></i><i></i></span> بومي تفكّر…';
const sp=muted()?null:say.stream('ar'),body={message:m,history:ch.slice(-8),again,context:ctx,recall:window.Brain?Brain.recent(8):[]};let shown=false;
let d=await aiStream(body,(x,all)=>{if(!shown){shown=true;w.classList.remove('think')}w.textContent=all;const l=document.getElementById('bl');l&&(l.scrollTop=l.scrollHeight);sp&&sp.push(x)});
if(d.err=='nostream'&&!shown){d=await aiCall(body);if(d.reply){w.classList.remove('think');w.textContent=d.reply;sp&&sp.push(d.reply.slice(0,360))}}
w.classList.remove('think');
if(d.reply){sp&&sp.end();const tx=shape(d.reply);ch.push({role:'user',content:m},{role:'assistant',content:tx});ch=ch.slice(-60);keep();w.textContent=tx;
 if(!again){window.Brain&&Brain.learn(m,tx,ctx,P.name)} /* بومي الداخلية تتعلّم من الخارجية */
 window.Tashkeel&&Tashkeel.learn(d.reply);unthink(1)}
else{sp&&say.stop();aiUse().n=Math.max(0,aiUse().n-1);save(); /* لا نخصم من الحدّ اليومي عند الفشل */
 const k=!again&&window.Brain&&Brain.find(m,ctx,.72);
 if(k){w.remove();serve(m,k.a,'📴 ')}
 else w.textContent=d.err=='busy'?'أنا أحتاج استراحة صغيرة 😴 جرّب بعد دقيقة.':(onl()?'لم أفهم سؤالك تمامًا 🦉 جرّب أن تسألني عن قاعدة، أو مسألة حساب، أو معنى كلمة. مثلاً: «'+pickc()+'»':OFFMSG);unthink(!!k)}
busy=0;netBadge()}
/* تمارين يولّدها الذكاء الاصطناعي حسب الموضوع المكتوب أو الدرس الحالي أو أضعف مهارة */
/* تمارين محلية (بلا إنترنت أو إذا تعذّر الذكاء الخارجي): من كلمات الدرس الحالي، أو دروس مرحلة الطالب والدروس التي أتقنها.
   الخيارات دائمًا من الدرس نفسه كي تكون متجانسة (صور مع صور، معانٍ مع معانٍ) */
function localEx(){const units=[],add=u=>{if(u&&u.i){const its=[],seen=new Set();u.i.forEach(it=>{const k=it&&String(it[1]||'').trim();if(it&&it[0]&&k&&!seen.has(k)){seen.add(k);its.push(it)}});if(its.length>=4)units.push(its)}};
 try{if(cur&&cur.i)add(cur)}catch(e){}
 if(!units.length)try{Object.keys(P.done||{}).forEach(id=>{try{add(find(id))}catch(e){}});(S[+P.stage||0]||S[0]).u.forEach(add)}catch(e){}
 if(!units.length)return null;const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
 const U=units[0===units.length-1?0:Math.floor(Math.random()*Math.min(units.length,cur&&cur.i?1:units.length))];
 return sh(U).slice(0,3).map(it=>{const o=sh([it,...sh(U.filter(x=>x!==it)).slice(0,3)]),pic=!/[\p{L}\p{N}]/u.test(String(it[1]));
  return{q:pic?`أين صورة «${it[0]}»؟`:`ما معنى «${it[0]}»؟`,o:o.map(x=>String(x[1])),a:o.indexOf(it),w:pic?`الصورة الصحيحة هي ${it[1]}`:`«${it[0]}» معناها: ${it[1]}`}})}
async function bex(){if(busy)return;const i=document.getElementById('bi'),bm=document.getElementById('bm'),topic=(i&&i.value.trim())||bm?.dataset.topic||bm?.dataset.ctx||profile().weak[0]||'';if(i)i.value='';
if(aiLeft()<=0&&onl())return bpush('a',LIM_MSG);if(onl()){aiUse().n++;save()}
busy=1;think();const w=bpush('a','أجهّز لك تمارين جديدة ✍️…');w.classList.add('think');let d=onl()?await aiCall({mode:'exercise',topic}):{err:'net'};if(d.items&&window.Brain)Brain.exLearn(topic,d.items);else if(window.Brain){const f=Brain.exFind(topic);if(f)d={items:f}}if(!d.items){const L=localEx();if(L)d={items:L}}busy=0;w.classList.remove('think');unthink(!!d.items);
if(!d.items){w.textContent=d.err=='busy'?'أنا أحتاج استراحة صغيرة 😴 جرّب بعد دقيقة.':'لم أستطع تجهيز التمارين الآن 🦉 جرّب بعد قليل، أو اختر درسًا من القائمة.';return}
w.textContent='هيا نتدرّب'+(topic?' على: '+topic:'')+' 💪';runEx(d.items,0,0,topic)}
function runEx(L,i,s,topic){if(!document.getElementById('bl'))return;
if(i>=L.length){P.star+=s;save();const m=s==L.length?'ممتاز! أجبت عن الكل بشكل صحيح 🌟':(s===0?`لا بأس! لم تكن الإجابات صحيحة هذه المرة 💪 سنتدرّب عليها معًا خطوة خطوة`:`أحسنت! أجبت صحيحًا عن ${s} من ${L.length} 💪 ونتدرّب أكثر معًا`);bpush('a',m);window.MC&&MC.mood(s>=2?'happy':'oops',1800);if(!muted())say(m.replace(/[🌟💪]/g,''),'ar',null,'cheer');return}
const q=L[i];q.q=shape(q.q);q.o=q.o.map(shape);q.w=shape(q.w||'');bpush('a',`(${i+1}/${L.length}) ${q.q}`);if(!muted()&&i==0)say(q.q,'ar');
const box=document.createElement('div');box.className='chips';
q.o.forEach((o,j)=>{const b=document.createElement('button');b.textContent=o;b.dir='auto';b.onclick=()=>{box.querySelectorAll('button').forEach(x=>x.disabled=true);const ok=j==q.a;b.classList.add(ok?'ok':'no');
const k='ai:'+String(topic||q.q).slice(0,24),sk=P.sk[k]=P.sk[k]||{n:0,m:0};sk.n++;sk.t=Date.now();if(ok)sk.m=Math.max(0,sk.m-1);else{sk.m++;sk.e=(sk.e||0)+1}save();
const m=ok?pk(OKS.ar):'لا بأس 🌱 '+(q.w||'');bpush('a',m);window.MC&&MC.mood(ok?'happy':'oops',1200);if(!muted())say(m.replace(/[🌱]/g,''),'ar',null,ok?'happy':'soft');setTimeout(()=>runEx(L,i+1,s+ok,topic),ok?700:1250)};box.appendChild(b)});
const l=document.getElementById('bl');l.appendChild(box);l.scrollTop=l.scrollHeight}
const pickc=()=>{const a=localAI.topics();return a[Math.floor(Math.random()*a.length)]};
let BMIC=null;
const bmicText=t=>{const e=document.getElementById('bst');if(e)e.textContent=t||''};
window.bmicStop=function(quiet){const s=BMIC;if(!s)return;BMIC=null;try{s.rec.stop()}catch(e){}const b=document.getElementById('bmb');if(b){b.textContent='🎤';b.classList.remove('bmic-listen')}bmicText('');window.MC&&MC.mood('tilt',quiet?300:700)};
window.bmic=function(){if(BMIC)return bmicStop();if(!P||!P.mic)return bpush('a','يحتاج تشغيل الميكروفون من لوحة ولي الأمر أولًا.');const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return bpush('a','هذا المتصفح لا يدعم التحدث المباشر. جرّب Chrome أو Edge.');say.stop();const rec=new R(),lang=P.lang==='en'?'en-US':'ar-OM';let final='';BMIC={rec};rec.lang=lang;rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=3;
 const b=document.getElementById('bmb');if(b){b.textContent='⏹';b.classList.add('bmic-listen')}bmicText('🎧 بومي تستمع… تكلّم الآن');window.MC&&MC.mood('listen',9000);
 rec.onresult=e=>{const row=e.results[e.results.length-1],heard=[...row].map(x=>x.transcript).filter(Boolean);if(heard[0]){final=heard[0];const i=document.getElementById('bi');if(i)i.value=final;bmicText('🗣️ '+final)}if(row.isFinal){bmicStop(1);bsend(final)}};
 rec.onerror=e=>{const msg=e.error==='not-allowed'||e.error==='service-not-allowed'?'لم يُسمح للمتصفح بالميكروفون. اسمح به ثم حاول مرة أخرى.':e.error==='no-speech'?'لم أسمع كلامًا، حاول مرة أخرى.':'تعذّر الاستماع الآن، حاول مرة أخرى.';bmicStop(1);bpush('a',msg)};
 rec.onend=()=>{if(BMIC&&BMIC.rec===rec){BMIC=null;if(!final)bmicText('انتهى الاستماع. اضغط الميكروفون للمحاولة مرة أخرى.');const x=document.getElementById('bmb');if(x){x.textContent='🎤';x.classList.remove('bmic-listen')}}};try{rec.start()}catch(e){bmicStop(1);bpush('a','تعذّر تشغيل الميكروفون الآن.')}};
const oh=h;h=x=>{oh(x);if(V=='quiz'||V=='lesson'||V=='home')app.insertAdjacentHTML('beforeend','<button class=ask onclick=bomi()>🦉 اسأل بومي</button>')};
