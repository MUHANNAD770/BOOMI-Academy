/* quiz.js — واجهة الدروس والاختبار بأسلوب التعلم القصير: شريط تقدم، قلوب، لوحة تصحيح، شاشة نتيجة */
let hr=3;const EMJ=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu,tx=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(EMJ,' ').replace(/\s+/g,' ').trim();
/* ما يُنطق مع السؤال: نقسم نص السؤال إلى مقاطع عربية وإنجليزية (كل لغة بنطقها الصحيح)،
   ونحذف ما لا يصلح للنطق: الفراغات (___ و؟)، وأجزاء الكلمة المقطّعة، والرموز والأسهم. */
function qSegs(s){let t=tx(s).replace(/\(\s*[\u0621-\u064A][\u064B-\u0652]*\s*\)/g,' ').replace(/[«»“”"⟵⟶←→⬅➡()]/g,' ').replace(/\s[—–-]\s/g,' ، ');
 const AL='[ء-ي][ً-ْ]*',FR=new RegExp('(?:^|\\s)(?:(?:'+AL+'|[A-Za-z]|[؟?])\\s+)+(?:'+AL+'|[A-Za-z]|[؟?])(?=\\s|$)','g');
 t=t.replace(FR,m=>/[؟?]/.test(m)&&(m.trim().split(/\s+/).length>=2)?' ':m).replace(/_{2,}/g,' … ').replace(/\s+([؟?!.،,])/g,'$1').replace(/\s+/g,' ').trim();
 const out=[];for(const m of t.matchAll(/[A-Za-z][A-Za-z0-9’'.,!?…\s]*|[^A-Za-z]+/g)){let y=m[0].replace(/^[\s,،.…]+|[\s,،…]+$/g,'').trim();if(!y||!/[\p{L}]/u.test(y))continue;out.push([y,/[A-Za-z]/.test(y)?'en':'ar'])}return out}
function qList(x){const L=[];const add=(t,l)=>{if(t)L.push([t,l])};
if(x.k.startsWith('m-'))add(tx(x.show),'ar');
else if(x.typ)add('اُكْتُبِ الكَلِمَةَ الَّتِي تَسْمَعُهَا','ar');
else if(x.w)add(x.w=='build'?'رَتِّبِ الحُرُوفَ لِتُكَوِّنَ الكَلِمَة':'رَتِّبِ الكَلِمَاتِ لِتُكَوِّنَ الجُمْلَة','ar');
else if(x.m==1)add('اِسْتَمِعْ جَيِّدًا، ثُمَّ اخْتَرِ الإِجَابَةَ المُنَاسِبَةَ','ar');
else if(x.m==0||x.m==null){const sg=qSegs(x.show);if(!sg.length||!sg.some(z=>/[؟?]|اخْتَر|اِخْتَر|Choose/.test(z[0])))add('اِخْتَرِ الإِجَابَةَ المُنَاسِبَةَ','ar');sg.forEach(z=>L.push(z))}
else add('اِقْرَأِ الكَلِمَةَ، ثُمَّ اخْتَرْ مَعْنَاهَا','ar');
if(x.sp&&!/^m-(tbl|cry|bor)/.test(x.k)&&!L.some(z=>z[0]===x.sp[0]&&z[1]===x.sp[1]))L.push([x.sp[0],x.sp[1]]);
if(!x.typ&&!x.w){const os=(x.opts||[]).map(o=>tx(o.h)).filter(t=>t&&t.length<=40&&/[\p{L}\p{N}]/u.test(t));if(os.length>=2){L.push(['الخِيَارَات','ar']);os.forEach(t=>qSegs(t).forEach(z=>L.push(z)))}}return L}
function sayList(L,i=0){if(!L||i>=L.length||(window.muted&&muted()))return;say(L[i][0],L[i][1],()=>{const m=say.tk;setTimeout(()=>{if(say.tk==m)sayList(L,i+1)},250)})}
const oq=quiz;quiz=()=>{hr=3;oq()};
q=function(){const x=qs[qi];try{if(window.MindCoach&&!(cur&&cur.id==='pl'))MindCoach.shape(x)}catch(e){}V='quiz';t0=Date.now();const L=qList(x);
h(`<div class=qh><button class=x onclick="goBack()" aria-label="خروج">✕</button><div class=pb><div id=pf style="width:${qi/qs.length*100}%"></div></div><span class=hp id=hp>❤️ ${hr}</span></div><div id=qo class=qo></div>${x.rd?'<p class=mind-tag>🔁 نُعِيدُ التَّدْرِيبَ عَلَى هَذِهِ</p>':x.eased?'<p class=mind-tag>🪶 سُؤَالٌ أَسْهَلُ قَلِيلًا</p>':''}
<div class=qb>${x.show}<button class=alt onclick="sayList(window.__L)">🔊 اسمع السؤال</button>${x.sp?`<button class=alt onclick="say(qs[qi].sp[0],qs[qi].sp[1])">🔊 اسمع الكلمة</button>`:''}${x.typ?`<input id=ty autocomplete=off autocapitalize=off dir=auto onkeydown="event.key=='Enter'&&ty()"><button class=big onclick=ty()>تحقق</button>`:`<div class=grid>${x.opts.map(o=>`<button class=opt dir=auto data-ok="${+o.ok}" onclick="ans(this)">${o.h}</button>`).join('')}</div>`}</div><div id=sh class=sh hidden></div>`);window.__L=L; /* لا قراءة تلقائية: الطالب يضغط «اسمع السؤال» أو على بومي */window.MC&&MC.mood('tilt',900)};
rec=function(x,ok,v){const s=P.sk[x.k]=P.sk[x.k]||{n:0,m:0},c=P.stat[cat(x)]=P.stat[cat(x)]||[0,0];c[0]++;c[1]+=+ok;s.n++;s.t=Date.now();s.lm=x.m;s.tt=(s.tt||0)+Date.now()-t0;
const ms=Date.now()-t0;if(ok){if(!x.rd)sc++;P.star++;s.m=Math.max(0,s.m-1)}else{if(!x.rd)hr--;s.m++;s.e=(s.e||0)+1;if(!x.k.startsWith('m-'))P.wl[x.k[0].toLowerCase()]=(P.wl[x.k[0].toLowerCase()]||0)+1}save();
const g=v!=null&&window.__g||null;window.__g=null;
let d=null;try{if(window.MindCoach){d=MindCoach.onAnswer({x,ok,ms,chosen:v!=null?v:window.__chosen});if(d.redrill&&hr>0&&!(cur&&cur.id==='pl')){let nq=null;if(x.k.startsWith('m-')&&cur&&cur.mk)nq=mq(cur.mk,P.ml[cur.mk].l);else{const it=cur&&cur.i&&cur.i.find(i=>i[0]===x.k);if(it)nq=lq(it,cur.i)}if(nq){nq.rd=1;qs.splice(Math.min(qs.length,qi+3),0,nq)}}}}catch(e){d=null}window.__chosen=null;
const m=ok?(d?d.msg:pk(OKS[x.l]||OKS.ar))+(g&&!g.exact?` إجابتك صحيحة، والكتابة الدقيقة «${x.typ}» ✍️`:''):(v!=null?(g&&g.close?`قريب جدًا! ${g.tip} الصحيح «${x.typ}» 💪`:`كتبت «${v}» والصحيح «${x.typ}». ${g&&g.tip?g.tip+' ':''}لا بأس، سنحاول معاً!`):d&&d.msg?d.msg:pk(ENC)+' '+x.ex[s.m>1?1:0]),end=hr<=0||qi+1>=qs.length;
document.getElementById('hp').textContent='❤️ '+hr;document.getElementById('pf').style.width=(qi+1)/qs.length*100+'%';
const sh=document.getElementById('sh');sh.className='sh '+(ok?'g':'r');sh.hidden=false;
sh.innerHTML=`<b>${ok?'✅ ':'❌ '}${m}${hr<=0?' 💔 انتهت القلوب':''}</b><button class=big onclick=nx()>${end?'إنهاء':'متابعة'}</button>`;
window.__streak=ok?(window.__streak||0)+1:0;try{HurufiSound.play(ok?'correct':'wrong');if(d&&d.mood&&ok)setTimeout(()=>MC.mood(d.mood,1400),300);else if(window.__streak>=3)setTimeout(()=>MC.mood('wow',1400),300)}catch(e){}if(!muted())say(m,ok?x.l:'ar',null,ok?'happy':'soft')};
function nx(){say.stop();if(hr<=0||++qi>=qs.length)fin();else q()}
const of=fin;fin=function(){qs=qs.filter(z=>!z.rd);of();const n=qs.length,a=Math.round(sc/n*100);
app.insertAdjacentHTML('afterbegin',`<div class=sum><div>⭐<br>${sc}/${n}</div><div>🎯<br>${a}%</div><div>❤️<br>${Math.max(hr,0)}</div></div>`);
if(sc>=4){if(!matchMedia('(prefers-reduced-motion:reduce)').matches){for(let i=0;i<26;i++){const e=document.createElement('span');e.className='cf';e.textContent=['⭐','🎉','✨','🌟'][i%4];e.style.left=Math.random()*95+'vw';e.style.animationDelay=Math.random()*.8+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),3600)}}}};
