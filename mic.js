/* mic.js — المرحلة ٣: تدريب نطق احترافي. موجات صوتية حيّة + مؤشر مستوى + تحويل الكلام لنص + تسجيل وإعادة استماع + تحليل أخطاء الحروف.
   الخصوصية: التسجيل يبقى في ذاكرة المتصفح فقط ولا يُرفع ولا يُحفظ، ويُحذف عند مغادرة الشاشة. يعمل فقط بموافقة ولي الأمر (P.mic).
   ملاحظة تقنية: التعرف على الكلام يعيد النص بلا تشكيل، لذلك التحليل على مستوى الحروف؛ الحركات يسمعها الطالب بالمقارنة مع صوت بومي. */
(()=>{let S0=null,url=null;const stopAll=()=>{if(S0){S0.end(1)}if(url){URL.revokeObjectURL(url);url=null}};
window.judge=(alts,target)=>{const t=norm(target);if(alts.some(a=>near(a,t)))return{ok:1};
if(window.Grade){let best=null;for(const a of alts){const g=Grade.text(a,[target],{speech:true});if(g.ok)return{ok:1,tip:g.d>0?'وحاول أن تنطقها بوضوح أكثر 🎧':''};if(g.close&&(!best||g.d<best.d))best=g}if(best)return{ok:1,tip:'نطقك قريب جدًا! '+(best.tip?best.tip.replace('اكتب','انطق'):'كرّرها مرة أخرى بوضوح')+' 🎧'}}const hs=alts.map(norm).filter(Boolean);if(!hs.length)return{ok:0,msg:'لم أسمع شيئاً. اقترب من الميكروفون وحاول مرة أخرى 🎧'};
const h=hs.sort((a,b)=>lev(a,t)-lev(b,t))[0];let i=0;while(i<t.length&&t[i]==h[i])i++;let m=t.length-1,k=h.length-1;while(m>i&&k>i&&t[m]==h[k]){m--;k--}
const ch=t[Math.min(i,t.length-1)];return{ok:0,wl:ch,heard:h,msg:h.length<t.length-1?`سمعتُ «${h}». يبدو أنك نسيت صوتاً. ركّز على حرف «${ch}»`:h.length>t.length+1?`سمعتُ «${h}». هناك صوت زائد، انطق الكلمة بهدوء`:`سمعتُ «${h}». ركّز على حرف «${ch}» وأعد المحاولة`}};
const draw=(an,c)=>{const x=c.getContext('2d'),b=new Uint8Array(an.fftSize);return()=>{an.getByteTimeDomainData(b);x.clearRect(0,0,c.width,c.height);x.lineWidth=3;x.strokeStyle='#3b7bf0';x.beginPath();let r=0;b.forEach((v,i)=>{const y=v/255*c.height;r=Math.max(r,Math.abs(v-128));i?x.lineTo(i/b.length*c.width,y):x.moveTo(0,y)});x.stroke();const l=document.getElementById('lv');if(l)l.style.width=Math.min(100,r/64*100)+'%'}};
speak=function(){V='lesson';stopAll();if(!P.mic)return h(`<button class=link onclick=home()>رجوع ←</button><h2>🎤 تدريب النطق</h2><p>لاستخدام الميكروفون نحتاج موافقة ولي الأمر من لوحة ولي الأمر.</p><button class=big onclick=parent()>فتح لوحة ولي الأمر</button>`);
const L=units(P.stage).flatMap(u=>u.i).filter(x=>stripD(x[0]).length>1&&!/\s/.test(x[0]));sp1=wsample(L,1)[0];
h(`<button class=link onclick=home()>رجوع ←</button><h2>🎤 تدريب النطق</h2><div class=q>${sp1[1]}</div><h2 dir=auto style="text-align:center">${sp1[0]}</h2><div id=tb class=bub>🦉 استمع إليّ أولاً، ثم اضغط «انطقها»</div>
<canvas id=wv width=300 height=60 style="width:100%;height:60px;background:#f4f8ff;border-radius:12px"></canvas><div class=bar><div id=lv style="width:0"></div></div><p id=tr class=mut dir=auto aria-live=polite>—</p>
<button class=alt onclick="say(sp1[0],sp1[2])">🔊 استمع</button><button id=mb class=big onclick=mic()>🎤 انطقها</button><button id=pb class=alt hidden onclick=playMine()>▶️ استمع إلى صوتك</button><button class=alt onclick=speak()>كلمة أخرى</button>`);setTimeout(()=>{const t=document.getElementById('tb');t&&say(sp1[0],sp1[2])},300)};
window.playMine=()=>{if(url){say.stop();new Audio(url).play()}};
mic=async function(){const mb=document.getElementById('mb');if(S0)return S0.end();const SR=window.SpeechRecognition||window.webkitSpeechRecognition;say.stop();window.MC&&MC.mood('listen',6500);
let st;try{st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}catch(e){return tch(e&&e.name=='NotAllowedError'?'لم يُسمح بالميكروفون. اضغط على أيقونة القفل بجانب عنوان الموقع ثم اسمح به، وأعد المحاولة 🔒':'لا أجد ميكروفوناً في جهازك. تأكد من توصيله','ar','')}
if(url){URL.revokeObjectURL(url);url=null}document.getElementById('pb').hidden=true;
const ac=new (window.AudioContext||window.webkitAudioContext)(),an=ac.createAnalyser();an.fftSize=512;ac.createMediaStreamSource(st).connect(an);const c=document.getElementById('wv'),f=draw(an,c);let raf,ch=[],mr=null,alts=[],done=0,r=null,q=0;
const loop=()=>{f();raf=requestAnimationFrame(loop)};loop();
if(window.MediaRecorder){try{mr=new MediaRecorder(st);mr.ondataavailable=e=>e.data.size&&ch.push(e.data);mr.start()}catch(e){mr=null}}
const fin=()=>{if(done++)return;cancelAnimationFrame(raf);try{r&&r.stop()}catch(e){}st.getTracks().forEach(t=>t.stop());try{ac.close()}catch(e){}S0=null;mb.textContent='🎤 انطقها';if(q)return;
const after=()=>{if(ch.length){url=URL.createObjectURL(new Blob(ch,{type:mr&&mr.mimeType||'audio/webm'}));const p=document.getElementById('pb');p&&(p.hidden=false)}
const tr=document.getElementById('tr');if(!SR){tch('تم التسجيل. قارن صوتك بصوتي بالضغط على الزرين 🔊 و▶️','ar','');return}
const t=sp1[0],w=P.pr[t]=P.pr[t]||[0,0],cc=P.stat.p=P.stat.p||[0,0],j=judge(alts,t);if(!alts.length){tch(j.msg,'ar','');return}
w[0]++;cc[0]++;if(j.ok){w[1]++;cc[1]++;P.star++;MC.mood('happy',1500);tch(pk(OKS[sp1[2]])+(j.tip?' '+j.tip:''),sp1[2])}else{MC.mood('oops',1200);if(j.wl)P.wl[j.wl]=(P.wl[j.wl]||0)+1;tch(j.msg+' 💪','ar',j.msg.replace(/«[^»]*»/g,''))}save()};
if(mr&&mr.state!='inactive'){mr.onstop=after;try{mr.stop()}catch(e){after()}}else after()};
S0={end:quiet=>{if(quiet)q=1;fin()}};mb.textContent='⏹️ توقف';tch('أنا أسمعك... 🎧','ar','');
if(SR){r=new SR;r.lang=sp1[2]=='ar'?'ar-SA':'en-US';r.maxAlternatives=5;r.interimResults=true;r.onresult=e=>{const R0=e.results[e.results.length-1];document.getElementById('tr').textContent='🗣️ '+R0[0].transcript;if(R0.isFinal){alts=[...R0].map(x=>x.transcript);setTimeout(fin,200)}};r.onerror=ev=>{if(ev.error=='not-allowed'||ev.error=='service-not-allowed')tch('خدمة التعرف على الكلام غير مسموحة في هذا المتصفح','ar','');setTimeout(fin,100)};r.onend=()=>setTimeout(fin,200);try{r.start()}catch(e){}}
setTimeout(fin,7000)};
const oh=h;h=x=>{stopAll();oh(x)};
})();
