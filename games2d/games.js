/* games2d/games.js — قسم الألعاب التعليمية 2D:
   • صفحة الألعاب: ألعاب العربية، الإنجليزية، الرياضيات، المغامرات، الذكاء والألغاز، المكتملة، والمقترحة للطالب.
   • كل لعبة: غلاف مرسوم، وصف، مستوى صعوبة، مراحل تُفتح بالترتيب، نجوم (١–٣) ونقاط، حفظ تلقائي في ملف الطالب (P.g2).
   • المحركات: منصات (مغامرة بومي/رحلة الحروف)، صيد (حروف/أرقام)، سحب وإفلات (تركيب/ترتيب)، تصنيف في سلال، مطابقة، ذاكرة، اختيار سريع.
   • تتكيّف مع عمر الطالب ومرحلته ونقاط ضعفه، وبومي يشرح كل لعبة ويشجّع أثناء اللعب.
   لإضافة لعبة جديدة: أضف سطرًا في GAMES بالمحرك المناسب ومولّد محتواها. */
(()=>{
'use strict';
const G2=window.G2;if(!G2)return;
const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]),pick=a=>a[Math.floor(Math.random()*a.length)],R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const strip=s=>String(s||'').replace(/[ً-ْٰـ]/g,'');
const AD='٠١٢٣٤٥٦٧٨٩',D=n=>String(n).replace(/\d/g,d=>AD[d]);
const gsap=window.gsap,calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const talk=(t,l)=>{try{if(!(window.muted&&muted()))say(t,l||'ar')}catch(e){}};
const mood=(m,ms)=>{try{MC.mood(m,ms||1400)}catch(e){}};

/* ================= المحتوى ================= */
const AR_NAMES={ا:'أَلِف',ب:'بَاء',ت:'تَاء',ث:'ثَاء',ج:'جِيم',ح:'حَاء',خ:'خَاء',د:'دَال',ذ:'ذَال',ر:'رَاء',ز:'زَاي',س:'سِين',ش:'شِين',ص:'صَاد',ض:'ضَاد',ط:'طَاء',ظ:'ظَاء',ع:'عَيْن',غ:'غَيْن',ف:'فَاء',ق:'قَاف',ك:'كَاف',ل:'لَام',م:'مِيم',ن:'نُون',ه:'هَاء',و:'وَاو',ي:'يَاء'};
const AR_L=Object.keys(AR_NAMES),EN_L='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const isPic=v=>/\p{Extended_Pictographic}/u.test(String(v))&&strip(String(v)).replace(/[\p{Extended_Pictographic}️‍\s]/gu,'').length===0;
const stage=()=>Math.max(0,Math.min(4,+((window.P||{}).stage)||0));
/* كلمات بالصور من دروس المنصة، مناسبة لمرحلة الطالب (حتى مرحلة أعلى بدرجة) */
function words(l,maxLen){const out=[],seen=new Set();for(let a=0;a<=Math.min(4,stage()+1);a++)for(const u of (S[a]?S[a].u:[]))if(u.l===l)for(const it of u.i){const w=String(it[0]);
 if(!isPic(it[1])||/\s/.test(w)||seen.has(w))continue;const n=l==='ar'?strip(w).length:w.length;if(n<2||n>(maxLen||7))continue;seen.add(w);out.push({w,pic:it[1],l})}
 return out}
const grs=w=>String(w).match(/[ء-يٱ](?:[ً-ْٰ])*/g)||[];
const tilesOf=(w,l)=>l==='ar'?grs(w):w.toUpperCase()===w?w.split(''):w.toLowerCase().split('');
const firstAr=w=>{const g=grs(w).map(strip);return(g[0]==='ا'||g[0]==='أ')&&g[1]==='ل'&&g.length>3?g[2]:g[0]};
const sentences=()=>{const L=[];for(let a=0;a<=Math.min(4,stage()+1);a++)for(const u of (S[a]?S[a].u:[]))if(u.l==='ar')for(const it of u.i){const n=String(it[0]).split(/\s+/).length;if(n>=3&&n<=6)L.push({s:it[0],pic:isPic(it[1])?it[1]:''})}return L};

/* ================= الحفظ والنقاط ================= */
const store=()=>{const g=P.g2=P.g2||{};return g};
const rec=id=>{const g=store();return g[id]=g[id]||{u:1,s:{},b:{},n:0}};
const totalStars=id=>Object.values(rec(id).s).reduce((a,b)=>a+b,0);
function finishLevel(game,lv,res){const r=rec(game.id),old=r.s[lv]||0,st=res.stars;r.n++;r.last=Date.now();
 if(st>old){P.star=(P.star||0)+(st-old);r.s[lv]=st}r.b[lv]={t:Math.round(res.time||0),acc:res.acc!=null?Math.round(res.acc*100):undefined};
 if(st>0&&lv>=r.u&&lv<game.levels)r.u=lv+1;
 try{(P.stat.g=P.stat.g||[0,0]);P.stat.g[0]++;P.stat.g[1]+=st>0?1:0}catch(e){}
 save();try{MC.stats&&MC.stats()}catch(e){}return{gained:Math.max(0,st-old),r}}
/* مرحلة البداية المناسبة لعمر الطالب ومرحلته (تُفتح تلقائيًا) */
function startUnlock(game){const r=rec(game.id);if(r.init)return;r.init=1;const age=+P.age||7,lv=Math.min(game.levels,1+Math.floor(stage()/2)+(age>=10?1:0));if(lv>r.u)r.u=lv;save()}

/* ================= واجهة اللعبة ================= */
let cur=null,eng=null;
const stopEng=()=>{try{eng&&eng.destroy&&eng.destroy()}catch(e){}eng=null};
function shell(game,lv,body){return `<div class=g2-top><button class=link onclick="games2d()">→ الألعاب</button><b>${game.icon} ${esc(game.name)}</b><span class=g2-lvtag>المرحلة ${D(lv)}/${D(game.levels)}</span></div>${body}`}
function play(id,lv){const game=GAMES.find(g=>g.id===id);if(!game)return games2d();startUnlock(game);const r=rec(id);lv=Math.max(1,Math.min(lv||r.u,game.levels));
 if(lv>r.u){talk('هَذِهِ المَرْحَلَةُ مُقْفَلَة. أَكْمِلِ المَرْحَلَةَ الَّتِي قَبْلَهَا.');return window.g2levels(id)}
 stopEng();V='game';window.CS='games';cur={game,lv,t0:Date.now(),mist:0,ok:0};
 h(shell(game,lv,`<div id=g2host class=g2-host></div>`));
 const host=$('#g2host');try{game.run(host,lv,cur)}catch(e){console.error(e);host.innerHTML='<p class=mut>تعذّر تشغيل اللعبة.</p>'}}
window.g2play=play;
/* نتيجة المرحلة */
function done(win,info){const c=cur;if(!c)return;stopEng();const game=c.game,lv=c.lv,time=(Date.now()-c.t0)/1000;
 const acc=info&&info.acc!=null?info.acc:c.ok+c.mist?c.ok/(c.ok+c.mist):1;
 const stars=!win?0:info&&info.stars!=null?info.stars:acc>=.95?3:acc>=.75?2:1;
 const{gained,r}=finishLevel(game,lv,{stars,time,acc});
 try{HurufiSound.play(win?'finish':'wrong')}catch(e){}mood(win?'proud':'oops',2400);
 const next=win&&lv<game.levels;
 const msg=win?(stars===3?'مُمْتَاز! ثَلَاثُ نُجُوم!':stars===2?'رَائِع! حَصَلْتَ عَلَى نَجْمَتَيْن.':'أَحْسَنْت! أَكْمَلْتَ المَرْحَلَة.'):'لَا بَأْس! حَاوِلْ مَرَّةً أُخْرَى، أَنْتَ تَتَعَلَّم.';
 h(shell(game,lv,`<div class="g2-res ${win?'win':'lose'}"><div class=g2-stars>${[1,2,3].map(i=>`<span class="${i<=stars?'on':''}">★</span>`).join('')}</div>
  <h2>${win?'🎉 '+msg:'💪 '+msg}</h2><div class=sum><div>⏱️<br><b>${D(Math.round(time))}</b><small>ثانية</small></div><div>🎯<br><b>${D(Math.round(acc*100))}٪</b><small>دقة</small></div><div>⭐<br><b>+${D(gained)}</b><small>نجوم جديدة</small></div></div>
  ${next?`<button class=big onclick="g2play('${game.id}',${lv+1})">▶ المرحلة التالية</button>`:''}<button class=alt onclick="g2play('${game.id}',${lv})">🔁 إعادة اللعب</button><button class=alt onclick="g2levels('${game.id}')">🗺️ المراحل</button></div>`));
 talk(msg);if(win&&!calm())setTimeout(()=>{try{BumiFX.confetti(stars*25)}catch(e){}},200);cur=null}
/* العقل الموحّد: كل إجابة في لعبة تُسجَّل لمهارة اللعبة (مادتها + اسمها) وطريقة العودة إليها */
const mindRec=ok=>{try{if(cur&&cur.game&&window.Mind)Mind.record({ok,subject:cur.game.cat,topic:'لعبة: '+cur.game.name,src:'لعبة',go:`g2levels('${cur.game.id}')`})}catch(e){}};
const good=(el)=>{if(cur)cur.ok++;mindRec(true);try{HurufiSound.play('correct')}catch(e){}mood('happy',900);if(el)try{BumiFX.good(el)}catch(e){}};
const bad=(el)=>{if(cur)cur.mist++;mindRec(false);try{HurufiSound.play('wrong')}catch(e){}mood('oops',1000);if(el)try{BumiFX.bad(el)}catch(e){}};
const CHEER=['أَحْسَنْت!','رَائِع!','مُمْتَاز!','اسْتَمِرّ!','بَطَل!'];

/* ================= محرك المنصات ================= */
const THEME_AT=lv=>['forest','desert','snow','sea','night','space'][(lv-1)%6];
function runPlat(host,lv,c,opt){eng=new G2.Platformer(host,Object.assign({level:lv,seed:opt.seed||7,theme:THEME_AT(lv),onWin:res=>done(true,{stars:Math.max(1,res.stars),acc:res.hearts/3}),onLose:()=>done(false,{acc:0}),
 onMood:m=>mood(m==='happy'?'happy':'oops',900),onStar:n=>talk(pick(CHEER))},opt))}
/* سؤال باب المغامرة: من دروس الطالب نفسها */
function gateQ(subject){if(subject==='math'||(subject==='mix'&&Math.random()<.35)){const ks=Object.keys(MS).filter(k=>['add','sub','cnt','cmp','mul','tbl'].includes(k)&&(k!=='mul'&&k!=='tbl'||stage()>=2));const k=pick(ks.length?ks:['add']);const m=(P.ml[k]||{l:1}).l;const q=mq(k,m);return{show:q.show,opts:q.opts,sp:q.sp}}
 const lg=subject==='en'?'en':subject==='ar'?'ar':pick(P.lang==='en'?['en']:P.lang==='ar'?['ar']:['ar','en']);
 if(lg==='ar'&&window.ArLessonQuiz){const L=S[stage()].u.filter(u=>u.l==='ar');for(let t=0;t<6;t++){const u=pick(L);const qs=ArLessonQuiz(u,4).filter(q=>!q.w);if(qs.length){const q=qs[0];return{show:q.show,opts:q.opts,sp:q.sp}}}}
 const W=words(lg,8);const it=pick(W),o=shuf([it,...shuf(W.filter(x=>x.pic!==it.pic)).slice(0,3)]);return{show:`<div class=q>${it.pic}</div><p class=mut>${lg==='en'?'What is this?':'مَا اسْمُ هَذِهِ الصُّورَة؟'}</p>`,opts:o.map(x=>({h:x.w,ok:x===it})),sp:null}}
function askGate(subject,cb){const q=gateQ(subject);const ov=document.createElement('div');ov.className='g2-ov';
 ov.innerHTML=`<div class=g2-card><div class=g2-ch>🦉 أَجِبْ لِيُفْتَحَ البَاب!</div>${q.show}${q.sp?`<button class=alt data-sp>🔊 اسمع</button>`:''}<div class=grid>${q.opts.map((o,i)=>`<button class=opt data-i=${i}>${o.h}</button>`).join('')}</div></div>`;
 document.body.appendChild(ov);if(q.sp)talk(q.sp[0],q.sp[1]);else talk('أَجِبْ عَنِ السُّؤَالِ لِيُفْتَحَ البَاب.');
 ov.querySelector('[data-sp]')&&(ov.querySelector('[data-sp]').onclick=()=>talk(q.sp[0],q.sp[1]));
 ov.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=q.opts[+b.dataset.i].ok;ov.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(q.opts[+x.dataset.i].ok)x.classList.add('ok')});if(!ok)b.classList.add('no');ok?good(b):bad(b);
  talk(ok?pick(CHEER)+' فُتِحَ البَاب.':'لَيْسَتْ هَذِهِ. انْظُرْ إِلَى الإِجَابَةِ الصَّحِيحَة، ثُمَّ حَاوِلْ مَرَّةً أُخْرَى.');setTimeout(()=>{ov.remove();cb(ok)},ok?900:1700)})}

/* ================= محرك الصيد ================= */
function runCatch(host,lv,c,cfg){const need=5+lv*2;eng=new G2.Catcher(host,{theme:cfg.theme||(['sea','forest','snow','night','space'][(lv-1)%5]),need,speed:55+lv*14+(+P.age>=9?10:0),
 next:cfg.next,decoy:cfg.decoy,speak:x=>x&&x.say&&talk(x.say[0],x.say[1]),onGood:n=>{c.ok++;if(n%3===0)talk(pick(CHEER))},onBad:(v,x)=>{c.mist++},onWin:res=>done(true,{acc:c.ok/(c.ok+c.mist||1)}),onLose:()=>done(false,{acc:c.ok/(c.ok+c.mist||1)})})}

/* ================= ألعاب DOM (سحب وإفلات، تصنيف، مطابقة، ذاكرة، اختيار) ================= */
function rounds(host,n,make){host.innerHTML=`<div class=g2-prog><i style="width:0%"></i></div><div class=g2-pz></div>`;const pz=host.querySelector('.g2-pz'),bar=host.querySelector('.g2-prog i');let i=0;
 const go=()=>{bar.style.width=(i/n*100)+'%';if(i>=n)return setTimeout(()=>done(true),400);const j=i++;try{make(j,go,pz)}catch(e){console.error(e);go()}};go()}
/* سحب البطاقات إلى الخانات (أو الضغط) */
function dragBuild(pz,{prompt,pic,sayIt,target,tiles,dir,onDone}){const L=target.length;
 pz.innerHTML=`<div class=g2-q>${pic?`<div class=g2-pic>${pic}</div>`:''}<p>${prompt}</p>${sayIt?'<button class="alt g2-say">🔊 اسمع</button>':''}</div><div class=g2-slots dir=${dir}>${target.map((_,i)=>`<span class=slot data-i=${i}></span>`).join('')}</div><div class=g2-tiles dir=${dir}>${tiles.map((t,i)=>`<button class=g2-tile data-i=${i}>${esc(t)}</button>`).join('')}</div>`;
 if(sayIt){pz.querySelector('.g2-say').onclick=()=>talk(sayIt[0],sayIt[1]);talk(sayIt[0],sayIt[1])}
 const slots=[...pz.querySelectorAll('.slot')],fill=new Array(L).fill(null);
 const place=(btn,si)=>{if(si==null)si=fill.indexOf(null);if(si<0||fill[si]!=null)return;fill[si]=+btn.dataset.i;slots[si].appendChild(btn);btn.classList.add('in');try{gsap&&gsap.fromTo(btn,{scale:.7},{scale:1,duration:.35,ease:'back.out(2.5)'})}catch(e){}if(fill.every(x=>x!=null))check()};
 const unplace=btn=>{const si=fill.indexOf(+btn.dataset.i);if(si<0)return;fill[si]=null;pz.querySelector('.g2-tiles').appendChild(btn);btn.classList.remove('in')};
 const check=()=>{const got=fill.map(i=>tiles[i]),ok=got.every((g,i)=>strip(g).toLowerCase()===strip(target[i]).toLowerCase());
  if(ok){slots.forEach(s=>s.classList.add('ok'));good(pz.querySelector('.g2-slots'));talk(sayIt?sayIt[0]:pick(CHEER),sayIt?sayIt[1]:'ar');setTimeout(onDone,1100)}
  else{bad(pz.querySelector('.g2-slots'));slots.forEach((s,i)=>{if(strip(tiles[fill[i]]).toLowerCase()!==strip(target[i]).toLowerCase()){const b=s.querySelector('.g2-tile');b&&setTimeout(()=>unplace(b),450)}})}};
 /* سحب حقيقي بالإصبع/الفأرة */
 pz.querySelectorAll('.g2-tile').forEach(btn=>{let sx,sy,drag=false,ghost=null;
  btn.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;drag=false;btn.setPointerCapture(e.pointerId)});
  btn.addEventListener('pointermove',e=>{if(sx==null)return;if(!drag&&Math.hypot(e.clientX-sx,e.clientY-sy)>8){drag=true;btn.classList.add('drag')}if(drag)btn.style.transform=`translate(${e.clientX-sx}px,${e.clientY-sy}px) scale(1.08)`});
  btn.addEventListener('pointerup',e=>{const was=drag;drag=false;sx=null;btn.classList.remove('drag');btn.style.transform='';
   if(was){btn.style.visibility='hidden';const el=document.elementFromPoint(e.clientX,e.clientY);btn.style.visibility='';const s=el&&el.closest('.slot');if(s&&!s.querySelector('.g2-tile'))place(btn,+s.dataset.i)}
   else{btn.classList.contains('in')?unplace(btn):place(btn)}})})}
/* التصنيف في سلال */
function sortGame(host,lv,cfg){const n=4+lv;const items=shuf(cfg.items()).slice(0,n);let k=0;host.innerHTML=`<div class=g2-prog><i style="width:0%"></i></div><div class=g2-pz><p class=g2-hint>${cfg.hint}</p><div class=g2-item></div><div class=g2-baskets>${cfg.bins.map((b,i)=>`<button class=g2-bin data-i=${i}><b>${b[0]}</b><small>${b[1]||''}</small><span class=g2-bc></span></button>`).join('')}</div></div>`;
 const box=host.querySelector('.g2-item');const show=()=>{if(k>=items.length)return setTimeout(()=>done(true),500);const it=items[k];box.innerHTML=`<div class=g2-card2 draggable=false>${esc(it.t)}</div>`;talk(it.say||it.t,'ar');try{gsap&&gsap.from(box.firstChild,{y:-40,autoAlpha:0,duration:.4,ease:'back.out(2)'})}catch(e){}
  host.querySelector('.g2-prog i').style.width=(k/items.length*100)+'%'};
 const choose=(bi,btn)=>{const it=items[k];if(!it)return;if(bi===it.b){good(btn);btn.querySelector('.g2-bc').textContent+='•';k++;setTimeout(show,500)}else{bad(btn);talk(cfg.why?cfg.why(it):'لَيْسَ هَذَا. فَكِّرْ مَرَّةً أُخْرَى.')}};
 host.querySelectorAll('.g2-bin').forEach(b=>b.onclick=()=>choose(+b.dataset.i,b));
 /* سحب البطاقة إلى السلة */
 box.addEventListener('pointerdown',e=>{const c=box.firstChild;if(!c)return;const sx=e.clientX,sy=e.clientY;c.setPointerCapture(e.pointerId);const mv=ev=>{c.style.transform=`translate(${ev.clientX-sx}px,${ev.clientY-sy}px)`};const up=ev=>{c.removeEventListener('pointermove',mv);c.removeEventListener('pointerup',up);c.style.visibility='hidden';const el=document.elementFromPoint(ev.clientX,ev.clientY);c.style.visibility='';c.style.transform='';const b=el&&el.closest('.g2-bin');if(b)choose(+b.dataset.i,b)};c.addEventListener('pointermove',mv);c.addEventListener('pointerup',up)});
 show()}
/* اختيار سريع (استماع، ناقص، مقارنة، أشكال، نمط) */
function chooseGame(host,lv,cfg){const n=cfg.n||(5+lv);let k=0;host.innerHTML=`<div class=g2-prog><i style="width:0%"></i></div><div class=g2-pz></div>`;const pz=host.querySelector('.g2-pz');
 const show=()=>{if(k>=n)return setTimeout(()=>done(true),400);host.querySelector('.g2-prog i').style.width=(k/n*100)+'%';const gid=cur&&cur.game?cur.game.id:'',q=window.Mind?Mind.fresh(()=>cfg.make(lv,k),q=>gid+'|'+(q.ask||'')+q.show):cfg.make(lv,k); /* لا يتكرر سؤال ظهر قريبًا */
  pz.innerHTML=`<div class=g2-q>${q.show}${q.sp?'<button class="alt g2-say">🔊 اسمع</button>':''}</div><div class="grid g2-opts ${q.wide?'wide':''}">${q.opts.map((o,i)=>`<button class=opt data-i=${i} dir=auto>${o.h}</button>`).join('')}</div>`;
  if(q.sp){talk(q.sp[0],q.sp[1]);pz.querySelector('.g2-say').onclick=()=>talk(q.sp[0],q.sp[1])}else if(q.ask)talk(q.ask);
  pz.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=q.opts[+b.dataset.i].ok;if(ok){pz.querySelectorAll('.opt').forEach(x=>x.disabled=true);b.classList.add('ok');good(b);k++;setTimeout(show,800)}else{b.classList.add('no');b.disabled=true;bad(b);if(q.why)talk(q.why)}})};show()}
/* المطابقة: صورة ↔ كلمة */
function matchGame(host,lv,cfg){const n=Math.min(6,3+Math.ceil(lv/2));let round=0;const R2=2+Math.ceil(lv/2);host.innerHTML=`<div class=g2-prog><i style="width:0%"></i></div><div class=g2-pz></div>`;const pz=host.querySelector('.g2-pz');
 const show=()=>{if(round>=R2)return setTimeout(()=>done(true),400);host.querySelector('.g2-prog i').style.width=(round/R2*100)+'%';const P0=cfg.pairs(n);let sel=null,left=P0.length;
  pz.innerHTML=`<p class=g2-hint>${cfg.hint}</p><div class=g2-match><div class=col>${shuf(P0).map(p=>`<button class=g2-m data-k="${esc(p.k)}" data-s=a>${p.a}</button>`).join('')}</div><div class=col>${shuf(P0).map(p=>`<button class=g2-m data-k="${esc(p.k)}" data-s=b dir=auto>${p.b}</button>`).join('')}</div></div>`;
  pz.querySelectorAll('.g2-m').forEach(b=>b.onclick=()=>{if(b.classList.contains('ok'))return;const p=P0.find(x=>x.k===b.dataset.k);if(b.dataset.s==='b'&&p&&p.say)talk(p.say[0],p.say[1]);
   if(!sel||sel.dataset.s===b.dataset.s){sel&&sel.classList.remove('sel');sel=b;b.classList.add('sel');return}
   if(sel.dataset.k===b.dataset.k){[sel,b].forEach(x=>{x.classList.remove('sel');x.classList.add('ok');x.disabled=true});good(b);sel=null;if(--left===0){round++;setTimeout(show,700)}}else{bad(b);sel.classList.remove('sel');sel=null}})};show()}
/* الذاكرة */
function memoryGame(host,lv,cfg){const n=Math.min(8,2+lv);const P0=cfg.pairs(n);const cards=shuf([...P0.map(p=>({k:p.k,f:p.a,say:p.say})),...P0.map(p=>({k:p.k,f:p.b,say:p.say}))]);let open=[],left=P0.length,lock=false;
 host.innerHTML=`<p class=g2-hint>اقْلِبْ بِطَاقَتَيْنِ مُتَطَابِقَتَيْن</p><div class="g2-mem n${cards.length}">${cards.map((c,i)=>`<button class=g2-cardm data-i=${i}><span class=bk>🦉</span><span class=fr dir=auto>${c.f}</span></button>`).join('')}</div>`;
 host.querySelectorAll('.g2-cardm').forEach(b=>b.onclick=()=>{if(lock||b.classList.contains('up'))return;const c=cards[+b.dataset.i];b.classList.add('up');open.push([b,c]);if(c.say)talk(c.say[0],c.say[1]);
  if(open.length===2){lock=true;const[[b1,c1],[b2,c2]]=open;open=[];if(c1.k===c2.k){setTimeout(()=>{b1.classList.add('ok');b2.classList.add('ok');good(b2);lock=false;if(--left===0)setTimeout(()=>done(true),700)},400)}
   else setTimeout(()=>{b1.classList.remove('up');b2.classList.remove('up');if(cur)cur.mist++;lock=false},900)}})}

/* ================= مولّدات المحتوى ================= */
const arLetterRound=()=>{const pool=AR_L.slice(0,Math.min(28,8+stage()*6));const ch=pick(pool);return{label:`🔊 ${ch}`,answer:ch,say:[AR_NAMES[ch],'ar']}};
const arLetterDecoy=c=>pick(AR_L.filter(x=>x!==c.answer));
const enLetterRound=()=>{const ch=pick(EN_L);return{label:`🔊 ${ch}`,answer:ch,say:[ch,'en']}};
const enDecoy=c=>pick(EN_L.filter(x=>x!==c.answer));
const phonRound=()=>{const W=words('en',6);const it=pick(W);const f=it.w[0].toUpperCase();return{label:`${it.pic} ⟵ ?`,answer:f,say:[it.w,'en']}};
const mathRound=(ops,lv)=>()=>{const op=pick(ops),mx=[5,9,10,20,50][Math.min(4,lv-1)];let a,b,ans,txt;
 if(op==='+'){a=R(0,mx);b=R(0,mx);ans=a+b}else if(op==='-'){a=R(1,mx);b=R(0,a);ans=a-b}else if(op==='×'){a=R(1,Math.min(12,2+lv*2));b=R(1,Math.min(10,1+lv*2));ans=a*b}else{b=R(1,Math.min(10,1+lv*2));ans=R(1,10);a=b*ans}
 txt=`\u2066${D(a)} ${op} ${D(b)}\u2069`;const sp=`${a} ${({'+':'زَائِد','-':'نَاقِص','×':'ضَرْب','÷':'قِسْمَة عَلَى'})[op]} ${b}`;return{label:txt+' = ؟',answer:D(ans),say:[sp,'ar'],n:ans}};
const numDecoy=c=>{let v;do{v=c.n+R(-5,5)||c.n+R(6,9)}while(v===c.n||v<0);return D(v)};
const tableRound=lv=>()=>{const t=Math.min(12,1+lv+ (stage()>=3?2:0)),b=R(1,10),ans=t*b;return{label:`\u2066${D(t)} × ${D(b)} = ؟\u2069`,answer:D(ans),say:[`${t} ضَرْب ${b}`,'ar'],n:ans}};
const numHear=lv=>()=>{const mx=[10,20,50,100,1000][Math.min(4,lv-1)],n=R(0,mx);return{label:'🔊 اسْتَمِعْ إِلَى العَدَد',answer:D(n),say:[String(n),'ar'],n}};
/* أزواج للمطابقة/الذاكرة */
const picPairs=l=>n=>shuf(words(l,7)).filter((x,i,a)=>a.findIndex(y=>y.pic===x.pic)===i).slice(0,n).map(x=>({k:x.w,a:x.pic,b:x.w,say:[x.w,l]}));
const letterPicPairs=n=>{const W=shuf(words('ar',6));const out=[],used=new Set();for(const x of W){const f=firstAr(x.w);if(!f||used.has(f))continue;used.add(f);out.push({k:f,a:x.pic,b:f,say:[x.w,'ar']});if(out.length>=n)break}return out};
const numPairs=n=>shuf([...Array(10).keys()].map(i=>i+1)).slice(0,n).map(v=>({k:String(v),a:'🍎'.repeat(Math.min(v,5))+(v>5?' '+'🍎'.repeat(v-5):''), /* الكمية كاملة دائمًا (كانت ٦–١٠ تُعرض رقمًا مع تفاحة واحدة)، مجمّعة خمسًا خمسًا للعدّ */b:['وَاحِد','اثْنَان','ثَلَاثَة','أَرْبَعَة','خَمْسَة','سِتَّة','سَبْعَة','ثَمَانِيَة','تِسْعَة','عَشَرَة'][v-1],say:[['وَاحِد','اثْنَان','ثَلَاثَة','أَرْبَعَة','خَمْسَة','سِتَّة','سَبْعَة','ثَمَانِيَة','تِسْعَة','عَشَرَة'][v-1],'ar']}));
/* أشكال هندسية (SVG) */
const SH={'دَائِرَة':'<circle cx=30 cy=30 r=22 />','مُرَبَّع':'<rect x=10 y=10 width=40 height=40 rx=3 />','مُثَلَّث':'<polygon points="30,8 54,52 6,52" />','مُسْتَطِيل':'<rect x=4 y=16 width=52 height=28 rx=3 />','نَجْمَة':'<polygon points="30,4 37,22 56,22 41,34 47,54 30,42 13,54 19,34 4,22 23,22" />','مُعَيَّن':'<polygon points="30,4 54,30 30,56 6,30" />','بَيْضَاوِي':'<ellipse cx=30 cy=30 rx=26 ry=16 />','خُمَاسِي':'<polygon points="30,5 55,23 46,53 14,53 5,23" />'};
const shapeSvg=(k,c)=>`<svg viewBox="0 0 60 60" width=86 height=86 class=g2-shape fill="${c||'#5b74ff'}" stroke="#1c2c86" stroke-width=2>${SH[k]}</svg>`;
const COLS=['#ff6b6b','#5b74ff','#20b486','#f7b500','#9b4dff','#ff8a00'];

/* ================= قائمة الألعاب ================= */
const GAMES=[
 /* المغامرات */
 {id:'bumi-adv',cat:'adv',icon:'🦉',name:'مغامرة بومي',desc:'امشِ واجرِ واقفز مع بومي، اجمع العملات والنجوم، وأجب لتفتح الأبواب.',levels:8,diff:'متوسط',cover:{k:'plat',th:'forest'},run:(h,lv,c)=>runPlat(h,lv,c,{seed:3,gate:cb=>askGate('mix',cb)}),
  intro:'هَيَّا نُغَامِرُ مَعًا! امْشِ وَاقْفِزْ، وَاجْمَعِ العُمُلَاتِ وَالنُّجُوم. أَمْسِكْ زِرَّ القَفْزِ وَأَنْتَ فِي الهَوَاءِ لِأَطِير. أَجِبْ عَنِ السُّؤَالِ لِيُفْتَحَ البَاب.'},
 {id:'letter-trip-ar',cat:'adv',icon:'🔤',name:'رحلة الحروف',desc:'اجمع حروف الكلمة بالترتيب الصحيح لتفتح الباب.',levels:6,diff:'سهل',cover:{k:'plat',th:'desert',letters:'ب ي ت'},
  run:(h,lv,c)=>{const W=words('ar',2+lv).filter(x=>grs(x.w).length>=Math.min(5,2+Math.ceil(lv/2)));const it=pick(W.length?W:words('ar',8));const g=grs(it.w);talk(`اجْمَعْ حُرُوفَ كَلِمَةِ ${it.w} بِالتَّرْتِيب.`);
   runPlat(h,lv,c,{seed:11+lv,letters:g,decoys:shuf(AR_L).slice(0,1+Math.floor(lv/2)),onLetter:(ch,ok,need)=>{ok?(c.ok++,talk(AR_NAMES[strip(ch)]||ch)):(c.mist++,talk('لَيْسَ هَذَا الحَرْف. نَبْحَثُ عَنْ '+(AR_NAMES[strip(need||'')]||need||'')))},onWord:()=>talk('رَائِع! كَوَّنْتَ كَلِمَةَ '+it.w),onLocked:()=>talk('اجْمَعْ كُلَّ الحُرُوفِ أَوَّلًا.')})},
  intro:'فِي رِحْلَةِ الحُرُوف: اجْمَعِ الحُرُوفَ بِالتَّرْتِيبِ لِتُكَوِّنَ الكَلِمَة، ثُمَّ يُفْتَحُ البَاب.'},
 {id:'abc-adv',cat:'adv',icon:'🔠',name:'ABC Adventure',desc:'Collect the letters of the English word in order.',levels:6,diff:'سهل',cover:{k:'plat',th:'sea',letters:'C A T'},
  run:(h,lv,c)=>{const W=words('en',3+lv);const it=pick(W);const g=it.w.toUpperCase().split('');talk(it.w,'en');runPlat(h,lv,c,{seed:21+lv,letters:g,decoys:shuf(EN_L).slice(0,1+Math.floor(lv/2)),onLetter:(ch,ok)=>{ok?(c.ok++,talk(ch,'en')):c.mist++},onWord:()=>talk(it.w,'en')})},
  intro:'فِي مُغَامَرَةِ الحُرُوفِ الإِنْجِلِيزِيَّة: اجْمَعْ حُرُوفَ الكَلِمَةِ بِالتَّرْتِيب.'},
 {id:'math-adv',cat:'adv',icon:'🏰',name:'مغامرة الأرقام',desc:'مغامرة قفز تفتح أبوابها بحل المسائل.',levels:8,diff:'متوسط',cover:{k:'plat',th:'night'},run:(h,lv,c)=>runPlat(h,lv,c,{seed:31,gate:cb=>askGate('math',cb)}),intro:'اجْمَعِ النُّجُوم، وَحُلَّ المَسْأَلَةَ لِيُفْتَحَ البَاب.'},
 /* العربية */
 {id:'catch-ar',cat:'ar',icon:'🫧',name:'صيد الحروف العربية',desc:'استمع إلى الحرف ثم اصطد فقاعته بشبكة بومي.',levels:6,diff:'سهل',cover:{k:'catch',th:'sea',t:'ب'},run:(h,lv,c)=>runCatch(h,lv,c,{next:arLetterRound,decoy:arLetterDecoy}),intro:'اسْتَمِعْ إِلَى الحَرْف، ثُمَّ حَرِّكْ بُومِي لِيَصْطَادَ فُقَّاعَتَه.'},
 {id:'ar-pic-letter',cat:'ar',icon:'🖼️',name:'الحرف والصورة',desc:'طابق كل صورة بالحرف الذي تبدأ به.',levels:5,diff:'سهل',cover:{k:'emoji',e:'🐱 ق'},run:(h,lv)=>matchGame(h,lv,{hint:'طَابِقْ كُلَّ صُورَةٍ بِالحَرْفِ الَّذِي تَبْدَأُ بِهِ',pairs:letterPicPairs}),intro:'طَابِقْ كُلَّ صُورَةٍ بِالحَرْفِ الأَوَّلِ مِنِ اسْمِهَا.'},
 {id:'harakat',cat:'ar',icon:'ـَ',name:'الحركات الثلاث',desc:'ضع كل مقطع في سلة حركته: فتحة، ضمة، كسرة.',levels:5,diff:'سهل',cover:{k:'emoji',e:'بَ بُ بِ'},
  run:(h,lv)=>sortGame(h,lv,{hint:'اسْحَبِ المَقْطَعَ إِلَى سَلَّةِ حَرَكَتِهِ (أَوِ اضْغَطِ السَّلَّة)',bins:[['فَتْحَة','ـَ'],['ضَمَّة','ـُ'],['كَسْرَة','ـِ']],items:()=>AR_L.slice(1,8+stage()*5).flatMap(l=>[[l+'َ',0],[l+'ُ',1],[l+'ِ',2]].map(([t,b])=>({t,b}))),why:it=>`اسْتَمِعْ: ${it.t}`}),intro:'اسْتَمِعْ إِلَى المَقْطَع، وَضَعْهُ فِي سَلَّةِ حَرَكَتِه.'},
 {id:'ar-build',cat:'ar',icon:'🧩',name:'تكوين الكلمات',desc:'اسحب الحروف إلى أماكنها لتكوّن الكلمة.',levels:6,diff:'متوسط',cover:{k:'emoji',e:'ب ـ ي ـ ت'},
  run:(h,lv,c)=>rounds(h,4+Math.ceil(lv/2),(i,nx,pz)=>{const W=words('ar',2+lv);const it=pick(W);const t=grs(it.w),extra=shuf(AR_L.filter(x=>!t.map(strip).includes(x))).slice(0,lv>2?Math.min(3,lv-2):0);dragBuild(pz,{prompt:'رَكِّبِ الكَلِمَة',pic:it.pic,sayIt:[it.w,'ar'],target:t,tiles:shuf([...t,...extra]),dir:'rtl',onDone:nx})}),intro:'اسْحَبِ الحُرُوفَ إِلَى أَمَاكِنِهَا لِتُكَوِّنَ الكَلِمَة.'},
 {id:'taa',cat:'ar',icon:'ة',name:'التاء والهاء',desc:'مربوطة أم مفتوحة أم هاء؟',levels:5,diff:'متوسط',cover:{k:'emoji',e:'ة ت ه'},
  run:(h,lv)=>sortGame(h,lv,{hint:'أَيْنَ تَضَعُ الكَلِمَة؟',bins:[['ة مَرْبُوطَة','شَجَرَة'],['ت مَفْتُوحَة','بِنْت'],['ه هَاء','وَجْه']],items:()=>[['شَجَرَة',0],['مَدْرَسَة',0],['حَقِيبَة',0],['سَاعَة',0],['فَرَاشَة',0],['قِطَّة',0],['بِنْت',1],['بَيْت',1],['صَوْت',1],['زَيْت',1],['تُوت',1],['وَقْت',1],['وَجْه',2],['فَاكِهَة',0],['مِيَاه',2],['اِنْتَبِه',2],['شِفَاه',2]].map(([t,b])=>({t,b}))}),intro:'هَلْ تَنْتَهِي الكَلِمَةُ بِتَاءٍ مَرْبُوطَة، أَمْ تَاءٍ مَفْتُوحَة، أَمْ هَاء؟'},
 {id:'lam',cat:'ar',icon:'☀️',name:'الشمسية والقمرية',desc:'هل تُنطق اللام أم لا؟',levels:5,diff:'متوسط',cover:{k:'emoji',e:'☀️ 🌙'},
  run:(h,lv)=>sortGame(h,lv,{hint:'اسْتَمِعْ: هَلْ نَنْطِقُ اللَّام؟',bins:[['☀️ شَمْسِيَّة','لَا تُنْطَق'],['🌙 قَمَرِيَّة','تُنْطَق']],items:()=>['الشَّمْسُ','النَّجْمُ','الدَّرْسُ','الرَّجُلُ','السَّمَكُ','الطَّائِرُ','الزَّيْتُ','الثَّوْبُ','الصَّقْرُ','النَّهْرُ'].map(t=>({t,b:0})).concat(['الْقَمَرُ','الْبَابُ','الْكِتَابُ','الْوَلَدُ','الْفِيلُ','الْجَمَلُ','الْحَدِيقَةُ','الْعُصْفُورُ','الْمَاءُ','الْغَيْمَةُ'].map(t=>({t,b:1})))}),intro:'اسْتَمِعْ إِلَى الكَلِمَة: إِذَا لَمْ نَنْطِقِ اللَّامَ فَهِيَ شَمْسِيَّة، وَإِذَا نَطَقْنَاهَا فَهِيَ قَمَرِيَّة.'},
 {id:'hamza',cat:'ar',icon:'أ',name:'لعبة الهمزة',desc:'همزة قطع أم همزة وصل؟',levels:5,diff:'صعب',cover:{k:'emoji',e:'أ ا'},
  run:(h,lv)=>sortGame(h,lv,{hint:'هَمْزَةُ قَطْعٍ أَمْ وَصْل؟',bins:[['هَمْزَةُ قَطْع','أَ إِ'],['هَمْزَةُ وَصْل','ا']],items:()=>['أَسَد','أُمّ','إِبْرَة','أَكَلَ','أَرْنَب','إِصْبَع','أَمِير','أَخ'].map(t=>({t,b:0})).concat(['اِسْم','اِبْن','اِجْلِسْ','اُكْتُبْ','اِفْتَحْ','اِسْتَمِعْ','اِنْطَلَقَ','اِبْنَة'].map(t=>({t,b:1})))}),intro:'هَمْزَةُ القَطْعِ نَكْتُبُهَا وَنَنْطِقُهَا دَائِمًا، وَهَمْزَةُ الوَصْلِ لَا نَنْطِقُهَا فِي وَسَطِ الكَلَام.'},
 {id:'ar-sentence',cat:'ar',icon:'📝',name:'ترتيب الجمل',desc:'رتّب الكلمات لتكوّن جملة صحيحة.',levels:5,diff:'متوسط',cover:{k:'emoji',e:'📝'},
  run:(h,lv)=>rounds(h,3+lv,(i,nx,pz)=>{const L=sentences();const it=pick(L);const t=it.s.split(/\s+/);dragBuild(pz,{prompt:'رَتِّبِ الكَلِمَاتِ لِتُكَوِّنَ جُمْلَة',pic:it.pic,sayIt:[it.s,'ar'],target:t,tiles:shuf(t),dir:'rtl',onDone:nx})}),intro:'اسْتَمِعْ إِلَى الجُمْلَة، ثُمَّ رَتِّبْ كَلِمَاتِهَا.'},
 {id:'ar-listen',cat:'ar',icon:'👂',name:'اسمع واختر الحرف',desc:'استمع إلى اسم الحرف واختره.',levels:5,diff:'سهل',cover:{k:'emoji',e:'👂 ح'},
  run:(h,lv)=>chooseGame(h,lv,{make:()=>{const pool=AR_L.slice(0,Math.min(28,10+stage()*5));const ch=pick(pool);const sim={ب:'تث',ت:'بث',ث:'بت',ج:'حخ',ح:'جخ',خ:'جح',د:'ذ',ذ:'د',ر:'ز',ز:'ر',س:'شص',ش:'س',ص:'ض',ض:'ص',ط:'ظ',ظ:'ط',ع:'غ',غ:'ع',ف:'ق',ق:'فك'}[ch]||'';const wr=shuf([...sim.split(''),...shuf(AR_L.filter(x=>x!==ch))]).filter((x,i,a)=>x!==ch&&a.indexOf(x)===i).slice(0,3);const o=shuf([ch,...wr]);return{show:'<div class=q>🔊</div>',sp:[AR_NAMES[ch],'ar'],opts:o.map(x=>({h:x,ok:x===ch})),why:'اسْتَمِعْ جَيِّدًا: '+AR_NAMES[ch]}}}),intro:'اسْتَمِعْ إِلَى اسْمِ الحَرْف، ثُمَّ اخْتَرْه.'},
 {id:'missing-ar',cat:'iq',icon:'❓',name:'الحرف الناقص',desc:'اكتشف الحرف الناقص في الكلمة.',levels:5,diff:'متوسط',cover:{k:'emoji',e:'ك ـ ؟ ـ ب'},
  run:(h,lv)=>chooseGame(h,lv,{make:()=>{const W=words('ar',3+lv).filter(x=>grs(x.w).length>=3);const it=pick(W);const g=grs(it.w),i=1+Math.floor(Math.random()*(g.length-1)),r=g[i];const wr=shuf(AR_L.filter(x=>x!==strip(r))).slice(0,3).map(x=>x+(r.match(/[ً-ْ]/g)||[]).join(''));
   return{show:`<div class=g2-pic>${it.pic}</div><div class=spell dir=rtl>${g.map((x,j)=>j===i?'<i class=gap>؟</i>':`<span>${x}</span>`).join('')}</div>`,sp:[it.w,'ar'],opts:shuf([r,...wr]).map(x=>({h:x,ok:x===r})),why:'الكَلِمَةُ هِيَ: '+it.w}}}),intro:'انْظُرْ إِلَى الصُّورَة، وَاسْتَمِعْ إِلَى الكَلِمَة، ثُمَّ اخْتَرِ الحَرْفَ النَّاقِص.'},
 /* الإنجليزية */
 {id:'catch-en',cat:'en',icon:'🎈',name:'English Letter Hunt',desc:'Listen to the letter and catch it.',levels:6,diff:'سهل',cover:{k:'catch',th:'forest',t:'B'},run:(h,lv,c)=>runCatch(h,lv,c,{next:enLetterRound,decoy:enDecoy,theme:'forest'}),intro:'اسْتَمِعْ إِلَى الحَرْفِ الإِنْجِلِيزِيّ، وَاصْطَدْ فُقَّاعَتَه.'},
 {id:'phonics',cat:'en',icon:'🔉',name:'Phonics',desc:'اسمع الكلمة واصطد الحرف الذي تبدأ به.',levels:6,diff:'متوسط',cover:{k:'catch',th:'snow',t:'F'},run:(h,lv,c)=>runCatch(h,lv,c,{next:phonRound,decoy:enDecoy,theme:'snow'}),intro:'اسْتَمِعْ إِلَى الكَلِمَةِ الإِنْجِلِيزِيَّة، وَاصْطَدِ الحَرْفَ الَّذِي تَبْدَأُ بِهِ.'},
 {id:'en-match',cat:'en',icon:'🖼️',name:'Picture & Word',desc:'طابق الصور بالكلمات الإنجليزية.',levels:5,diff:'سهل',cover:{k:'emoji',e:'🍎 Apple'},run:(h,lv)=>matchGame(h,lv,{hint:'Match the picture with the word',pairs:picPairs('en')}),intro:'طَابِقْ كُلَّ صُورَةٍ بِكَلِمَتِهَا الإِنْجِلِيزِيَّة.'},
 {id:'en-build',cat:'en',icon:'🧱',name:'Word Builder',desc:'Build the word from its letters.',levels:6,diff:'متوسط',cover:{k:'emoji',e:'C A T'},
  run:(h,lv)=>rounds(h,4+Math.ceil(lv/2),(i,nx,pz)=>{const it=pick(words('en',2+lv));const t=it.w.toLowerCase().split(''),ex=shuf('abcdefghijklmnopqrstuvwxyz'.split('').filter(x=>!t.includes(x))).slice(0,lv>2?2:0);dragBuild(pz,{prompt:'Build the word',pic:it.pic,sayIt:[it.w,'en'],target:t,tiles:shuf([...t,...ex]),dir:'ltr',onDone:nx})}),intro:'اسْحَبِ الحُرُوفَ لِتَبْنِيَ الكَلِمَةَ الإِنْجِلِيزِيَّة.'},
 {id:'en-order',cat:'en',icon:'🔀',name:'ترتيب الحروف',desc:'Unscramble: رتّب الحروف المبعثرة (بلا صورة).',levels:5,diff:'صعب',cover:{k:'emoji',e:'T A C'},
  run:(h,lv)=>rounds(h,4+lv,(i,nx,pz)=>{const it=pick(words('en',3+lv));const t=it.w.toLowerCase().split('');dragBuild(pz,{prompt:'رَتِّبِ الحُرُوف — Listen and spell',pic:'',sayIt:[it.w,'en'],target:t,tiles:shuf(t),dir:'ltr',onDone:nx})}),intro:'اسْتَمِعْ إِلَى الكَلِمَة، وَرَتِّبْ حُرُوفَهَا.'},
 {id:'en-missing',cat:'en',icon:'🔡',name:'Missing Letter',desc:'Complete the word.',levels:5,diff:'متوسط',cover:{k:'emoji',e:'C _ T'},
  run:(h,lv)=>chooseGame(h,lv,{make:()=>{const it=pick(words('en',3+lv).filter(x=>x.w.length>=3));const w=it.w.toLowerCase(),i=Math.floor(Math.random()*w.length),r=w[i],wr=shuf('aeioubcdmnst'.split('').filter(x=>x!==r)).slice(0,3);
   return{show:`<div class=g2-pic>${it.pic}</div><div class=spell dir=ltr>${w.split('').map((x,j)=>j===i?'<i class=gap>?</i>':`<span>${x}</span>`).join('')}</div>`,sp:[it.w,'en'],opts:shuf([r,...wr]).map(x=>({h:x,ok:x===r})),why:'The word is '+it.w}}}),intro:'أَكْمِلِ الكَلِمَةَ الإِنْجِلِيزِيَّةَ بِالحَرْفِ النَّاقِص.'},
 {id:'en-listen',cat:'en',icon:'🎧',name:'Listen & Choose',desc:'Listen and choose the right word.',levels:5,diff:'سهل',cover:{k:'emoji',e:'🎧'},
  run:(h,lv)=>chooseGame(h,lv,{make:()=>{const W=words('en',3+lv);const it=pick(W);const o=shuf([it,...shuf(W.filter(x=>x.w!==it.w)).slice(0,3)]);return{show:'<div class=q>🔊</div>',sp:[it.w,'en'],opts:o.map(x=>({h:lv<=2?`${x.pic} ${x.w}`:x.w,ok:x===it})),why:'Listen: '+it.w}}}),intro:'اسْتَمِعْ إِلَى الكَلِمَةِ الإِنْجِلِيزِيَّة، ثُمَّ اخْتَرْهَا.'},
 /* الرياضيات */
 {id:'catch-add',cat:'math',icon:'➕',name:'الجمع والطرح',desc:'حلّ المسألة واصطد الجواب الصحيح.',levels:6,diff:'سهل',cover:{k:'catch',th:'forest',t:'٧'},run:(h,lv,c)=>runCatch(h,lv,c,{next:mathRound(['+','-'],lv),decoy:numDecoy,theme:'forest'}),intro:'حُلَّ المَسْأَلَةَ فِي ذِهْنِك، ثُمَّ اصْطَدِ الجَوَابَ الصَّحِيح.'},
 {id:'catch-mul',cat:'math',icon:'✖️',name:'الضرب والقسمة',desc:'مسائل ضرب وقسمة تتساقط إجاباتها.',levels:6,diff:'متوسط',cover:{k:'catch',th:'space',t:'١٢'},run:(h,lv,c)=>runCatch(h,lv,c,{next:mathRound(['×','÷'],lv),decoy:numDecoy,theme:'space'}),intro:'اضْرِبْ أَوِ اقْسِمْ، ثُمَّ اصْطَدِ الجَوَاب.'},
 {id:'tables',cat:'math',icon:'🧮',name:'جداول الضرب',desc:'تدرّب على جدول ضرب جديد في كل مرحلة.',levels:10,diff:'متوسط',cover:{k:'catch',th:'night',t:'٢٤'},run:(h,lv,c)=>runCatch(h,lv,c,{next:tableRound(lv),decoy:numDecoy,theme:'night'}),intro:'هَذَا جَدْوَلُ الضَّرْب. اصْطَدْ نَاتِجَ كُلِّ مَسْأَلَة.'},
 {id:'catch-num',cat:'math',icon:'🔢',name:'صيد الأرقام',desc:'استمع إلى العدد واصطده.',levels:5,diff:'سهل',cover:{k:'catch',th:'desert',t:'٥'},run:(h,lv,c)=>runCatch(h,lv,c,{next:numHear(lv),decoy:numDecoy,theme:'desert'}),intro:'اسْتَمِعْ إِلَى العَدَد، وَاصْطَدْه.'},
 {id:'num-order',cat:'math',icon:'📶',name:'ترتيب الأعداد',desc:'رتّب الأعداد من الأصغر إلى الأكبر.',levels:6,diff:'سهل',cover:{k:'emoji',e:'١ ٢ ٣'},
  run:(h,lv)=>rounds(h,4,(i,nx,pz)=>{const mx=[10,20,50,100,500,1000][lv-1],n=Math.min(6,3+Math.floor(lv/2));const s=new Set();while(s.size<n)s.add(R(0,mx));const a=[...s].sort((x,y)=>x-y),desc=lv>=4&&Math.random()<.4;const t=(desc?[...a].reverse():a).map(D);dragBuild(pz,{prompt:desc?'رَتِّبْ مِنَ الأَكْبَرِ إِلَى الأَصْغَر':'رَتِّبْ مِنَ الأَصْغَرِ إِلَى الأَكْبَر',target:t,tiles:shuf(t),dir:'rtl',onDone:nx})}),intro:'رَتِّبِ الأَعْدَادَ بِالتَّرْتِيبِ الصَّحِيح.'},
 {id:'compare',cat:'math',icon:'⚖️',name:'مقارنة الأعداد',desc:'أكبر، أصغر، أم يساوي؟',levels:5,diff:'سهل',cover:{k:'emoji',e:'٧ > ٣'},
  run:(h,lv)=>chooseGame(h,lv,{n:6+lv,make:()=>{const mx=[10,20,100,500,1000][lv-1];let a=R(0,mx),b=Math.random()<.2?a:R(0,mx);const r=a>b?'>':a<b?'<':'=';return{show:`<div class="q g2-cmp" dir=ltr>${D(a)} <i>؟</i> ${D(b)}</div>`,ask:'أَيُّ عَلَامَةٍ تَضَعُ بَيْنَهُمَا؟',wide:1,opts:['>','<','='].map(x=>({h:x==='>'?'> أكبر':x==='<'?'< أصغر':'= يساوي',ok:x===r})),why:a>b?`${a} أَكْبَرُ مِنْ ${b}`:a<b?`${a} أَصْغَرُ مِنْ ${b}`:'العَدَدَانِ مُتَسَاوِيَان'}}}),intro:'قَارِنْ بَيْنَ العَدَدَيْن، وَاخْتَرِ العَلَامَةَ الصَّحِيحَة.'},
 {id:'shapes',cat:'math',icon:'🔷',name:'الأشكال الهندسية',desc:'تعرّف على الأشكال وأسمائها.',levels:5,diff:'سهل',cover:{k:'emoji',e:'🔺🟦⚪'},
  run:(h,lv)=>chooseGame(h,lv,{make:()=>{const ks=Object.keys(SH).slice(0,Math.min(8,3+lv));const k=pick(ks);const o=shuf([k,...shuf(ks.filter(x=>x!==k)).slice(0,3)]);return{show:shapeSvg(k,pick(COLS)),ask:'مَا اسْمُ هَذَا الشَّكْل؟',opts:o.map(x=>({h:x,ok:x===k})),why:'هَذَا الشَّكْلُ: '+k}}}),intro:'انْظُرْ إِلَى الشَّكْل، وَاخْتَرِ اسْمَه.'},
 /* الذكاء والألغاز */
 {id:'memory',cat:'iq',icon:'🃏',name:'ذاكرة البطاقات',desc:'اقلب بطاقتين متطابقتين: صورة وكلمتها.',levels:6,diff:'سهل',cover:{k:'emoji',e:'🃏🃏'},run:(h,lv)=>memoryGame(h,lv,{pairs:picPairs(P.lang==='en'?'en':'ar')}),intro:'اقْلِبْ بِطَاقَتَيْن: الصُّورَةَ وَكَلِمَتَهَا. تَذَكَّرْ أَمَاكِنَهَا.'},
 {id:'match-ar',cat:'iq',icon:'🔗',name:'مطابقة الصور بالكلمات',desc:'طابق كل صورة بكلمتها العربية.',levels:5,diff:'سهل',cover:{k:'emoji',e:'🐘 فيل'},run:(h,lv)=>matchGame(h,lv,{hint:'طَابِقْ كُلَّ صُورَةٍ بِكَلِمَتِهَا',pairs:picPairs('ar')}),intro:'طَابِقْ كُلَّ صُورَةٍ بِكَلِمَتِهَا.'},
 {id:'pattern',cat:'iq',icon:'🔷',name:'ما الشكل التالي؟',desc:'اكتشف النمط وأكمله.',levels:5,diff:'متوسط',cover:{k:'emoji',e:'🔺🔵🔺❓'},
  run:(h,lv)=>chooseGame(h,lv,{make:()=>{const E=shuf(['🔺','🔵','⭐','🟩','💜','🍎']).slice(0,lv>=3?3:2);const len=lv>=4?3:2,unit=E.slice(0,len);const seq=[];for(let i=0;i<6;i++)seq.push(unit[i%len]);const r=unit[6%len];const o=shuf([r,...E.filter(x=>x!==r)]).slice(0,3);if(!o.includes(r))o[0]=r;
   return{show:`<div class=q>${seq.join(' ')} ❓</div>`,ask:'مَا الشَّكْلُ التَّالِي؟',opts:shuf(o).map(x=>({h:x,ok:x===r})),why:'انْظُرْ إِلَى التَّكْرَار: '+unit.join(' ')}}}),intro:'انْظُرْ إِلَى النَّمَطِ المُتَكَرِّر، وَاخْتَرِ الشَّكْلَ التَّالِي.'},
 {id:'num-match',cat:'iq',icon:'🍎',name:'العدد والكمية',desc:'طابق كل كمية باسم العدد.',levels:5,diff:'سهل',cover:{k:'emoji',e:'🍎🍎🍎 ٣'},run:(h,lv)=>matchGame(h,lv,{hint:'طَابِقْ كُلَّ كَمِّيَّةٍ بِاسْمِ عَدَدِهَا',pairs:numPairs}),intro:'عُدَّ التُّفَّاح، ثُمَّ طَابِقْهُ بِاسْمِ العَدَد.'}
];
window.G2GAMES=GAMES;window.G2eng=()=>eng;

/* ================= الأغلفة (مرسومة بالمحرك نفسه) ================= */
const coverCache={},noOwl=new Set(); /* أغلفة رُسمت قبل تحميل صورة البومة: تُعاد وحدها لاحقًا ولا تُحفظ */
function cover(game){if(coverCache[game.id])return coverCache[game.id];const c=document.createElement('canvas'),W=320,H=180;c.width=W;c.height=H;const g=c.getContext('2d');g.scale(W/480,H/270);
 const th=G2.THEMES[game.cover.th]||G2.THEMES[{ar:'desert',en:'forest',math:'night',iq:'space',adv:'forest'}[game.cat]];G2.background(g,480,270,(game.id.length*37)%300,th,1.3);
 g.fillStyle=th.ground[0];g.fillRect(0,236,480,40);
 if(game.cover.k==='plat'){G2.Art.platform(g,40,236,180,40,th);G2.Art.platform(g,250,170,140,20,th);G2.Art.coin(g,300,140,1);G2.Art.coin(g,330,140,1.4);G2.Art.star(g,420,90,1,20);if(game.cover.letters)game.cover.letters.split(' ').forEach((l,i)=>G2.Art.bubble(g,230+i*56,90+i*6,22,l,'#ffd89e',1))}
 else if(game.cover.k==='catch'){[[120,70],[220,120],[340,60]].forEach(([x,y],i)=>G2.Art.bubble(g,x,y,26,i===1?game.cover.t:['?','★','✿'][i],['#cfe3ff','#ffe9b0','#ffd6e7'][i],1))}
 else{g.font='900 64px "Baloo Bhaijaan 2",Tahoma,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(255,255,255,.85)';G2.rr(g,140,40,200,120,26);g.fill();g.fillStyle='#1c2c86';g.fillText(game.cover.e,240,104)}
 const owl=G2.Owl.get('happy');if(owl)g.drawImage(owl,30,120,100,108);else noOwl.add(game.id);
 try{return coverCache[game.id]=c.toDataURL('image/webp',.82)}catch(e){return''}}

/* ================= الاقتراحات حسب نقاط الضعف ================= */
function suggest(){const sc={};const add=(id,v)=>{sc[id]=(sc[id]||0)+v};
 const wl=Object.values(P.wl||{}).reduce((a,b)=>a+b,0);if(wl>3){add('catch-ar',3);add('ar-listen',2);add('ar-pic-letter',2)}
 const st=P.stat||{},acc=k=>{const a=st[k];return a&&a[0]>4?a[1]/a[0]:1};if(acc('m')<.75){add('catch-add',3);add('compare',2);add('num-order',1)}if(acc('r')<.75){add('ar-build',2);add('missing-ar',2)}
 const enL=window.EnCoach?EnCoach.level():1;if(P.lang!=='ar'){if(enL<=2){add('phonics',2);add('catch-en',2);add('en-match',1)}else add('en-build',2)}
 if(stage()>=2){add('lam',1.5);add('taa',1.5)}if(stage()>=3)add('hamza',1.5);if(stage()>=2)add('tables',1.2);
 add('bumi-adv',1.5);add('letter-trip-ar',1);
 for(const g of GAMES){const r=(P.g2||{})[g.id];if(!r||!r.n)add(g.id,.8);else if(Date.now()-(r.last||0)<36e5)add(g.id,-2)}
 return GAMES.filter(g=>sc[g.id]>0).sort((a,b)=>sc[b.id]-sc[a.id]).slice(0,4)}

/* ================= صفحة الألعاب ================= */
const CATS=[['adv','🗺️ المغامرات'],['ar','🔤 ألعاب اللغة العربية'],['en','🔠 ألعاب اللغة الإنجليزية'],['math','🔢 ألعاب الرياضيات'],['iq','🧩 ألعاب الذكاء والألغاز']];
/* الأغلفة تُرسم تدريجيًا بعد ظهور الصفحة (بضعة أغلفة في كل إطار، ~12ms): كان رسم ٣٩ غلافًا دفعة واحدة يجمّد فتح الألعاب ~٤٥٠ms */
const CV0='data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';let cvQ=0;
/* الأداء: الأغلفة تُرسم مرة واحدة ثم تُحفظ في ذاكرة الجهاز (Cache Storage)، فلا تُرسم من جديد في الزيارات التالية */
const CVC='hurufi-g2cov-v2',cvU=id=>'./g2cov/'+id+'.webp';let cvLoaded=null;
const cvLoad=()=>cvLoaded||(cvLoaded=(async()=>{try{const c=await caches.open(CVC);for(const g of GAMES){if(coverCache[g.id])continue;const r=await c.match(cvU(g.id));if(r)coverCache[g.id]=URL.createObjectURL(await r.blob())}}catch(e){}})());
const cvSave=(id,u)=>{try{if(u&&u.startsWith('data:'))fetch(u).then(r=>r.blob()).then(b=>caches.open(CVC).then(c=>c.put(cvU(id),new Response(b,{headers:{'content-type':b.type}})))).catch(()=>{})}catch(e){}};
const queueCovers=()=>{if(cvQ)return;cvQ=-1;cvLoad().then(()=>{cvQ=0;document.querySelectorAll('img.g2-cv[data-cv]').forEach(im=>{const u=coverCache[im.dataset.cv];if(u&&im.src!==u)im.src=u});cvQ=requestAnimationFrame(function step(){cvQ=0;const L=[...document.querySelectorAll('img.g2-cv[data-cv]')].filter(im=>!coverCache[im.dataset.cv]||im.src!==coverCache[im.dataset.cv]);if(!L.length)return;
 const t=performance.now();for(const im of L){const gm=GAMES.find(x=>x.id===im.dataset.cv);if(gm){const fresh=!coverCache[gm.id],u=cover(gm);if(fresh&&!noOwl.has(gm.id))cvSave(gm.id,u);im.src=u||CV0;if(!u)im.removeAttribute('data-cv')}else im.removeAttribute('data-cv');if(performance.now()-t>12)break}cvQ=requestAnimationFrame(step)})})};
const card=g=>{const r=(P.g2||{})[g.id]||{s:{},u:1},st=Object.values(r.s).reduce((a,b)=>a+b,0),comp=Object.keys(r.s).length>=g.levels;
 return `<button class="g2-gc ${comp?'done':''}" onclick="g2levels('${g.id}')"><img alt="" class=g2-cv data-cv="${g.id}" src="${coverCache[g.id]||CV0}">${coverCache[g.id]?'':(queueCovers(),'')}<span class=g2-gi>${g.icon}</span><b>${esc(g.name)}</b><small>${esc(g.desc)}</small><span class=g2-meta><i>${g.diff}</i><i>${D(g.levels)} مراحل</i><i>⭐ ${D(st)}/${D(g.levels*3)}</i></span>${comp?'<span class=g2-badge>✓ مكتملة</span>':''}</button>`};
window.games2d=function(){stopEng();V='sec';window.CS='games';const had=!!G2.Owl.get('happy');paintHub();
 if(!had)G2.Owl.load().then(()=>{for(const k of noOwl)delete coverCache[k];noOwl.clear();if(document.getElementById('g2hub'))queueCovers() /* تدريجيًا، لا كلها دفعة واحدة */})};
function paintHub(){const sg=suggest(),done=GAMES.filter(g=>Object.keys(((P.g2||{})[g.id]||{s:{}}).s).length>=g.levels),tot=GAMES.reduce((a,g)=>a+totalStars(g.id),0),played=GAMES.filter(g=>((P.g2||{})[g.id]||{}).n).length;
 h(`<section class="sec g2-hubp" id=g2hub><button class=link onclick="home()">→ الرئيسية</button><div class=g2-hero><div><h2>🎮 عالم ألعاب بومي</h2><p>تعلّم وأنت تلعب: مغامرات، صيد، تركيب، وألغاز.</p></div><div class=g2-tot><b>⭐ ${D(tot)}</b><small>نجوم الألعاب</small><b>🎮 ${D(played)}</b><small>لعبة جرّبتها</small></div></div>
 ${sg.length?`<h3>✨ مقترحة لك يا ${esc(P.name)}</h3><div class=g2-grid>${sg.map(card).join('')}</div>`:''}
 ${CATS.map(([k,t])=>`<h3>${t}</h3><div class=g2-grid>${GAMES.filter(g=>g.cat===k).map(card).join('')}</div>`).join('')}
 ${done.length?`<h3>🏆 الألعاب المكتملة</h3><div class=g2-grid>${done.map(card).join('')}</div>`:''}
 <h3>🎲 ألعاب سريعة أخرى</h3><div class=list>${['gMem','gWord','gPat','gSent'].filter(f=>typeof window[f]==='function').map((f,i)=>`<button class=row onclick="${f}()"><span>${['🃏','🔤','🔷','📝'][i]}</span><b>${['الذاكرة الكلاسيكية','تركيب كلمات سريع','الأنماط','ترتيب جمل سريع'][i]}</b></button>`).join('')}${typeof window.puzzles==='function'?'<button class=row onclick="puzzles()"><span>🧩</span><b>جزيرة الألغاز</b></button>':''}</div></section>`)}
window.g2levels=function(id){stopEng();const game=GAMES.find(g=>g.id===id);if(!game)return games2d();startUnlock(game);const r=rec(id);V='sec';window.CS='games';cur={game,lv:0};
 h(`<section class=sec><button class=link onclick="games2d()">→ الألعاب</button><div class=g2-lvh><img alt="" src="${cover(game)}"><div><h2>${game.icon} ${esc(game.name)}</h2><p>${esc(game.desc)}</p><span class=g2-meta><i>${game.diff}</i><i>${D(game.levels)} مراحل</i></span></div></div>
 <div class=g2-lvls>${Array.from({length:game.levels},(_,i)=>{const lv=i+1,s=r.s[lv]||0,open=lv<=r.u,b=r.b[lv];return `<button class="g2-lv ${open?'':'lock'} ${s?'got':''}" ${open?`onclick="g2play('${id}',${lv})"`:'disabled aria-disabled=true'}><b>${open?D(lv):'🔒'}</b><span>${[1,2,3].map(k=>k<=s?'★':'☆').join('')}</span>${b&&b.t?`<small>⏱️ ${D(b.t)}ث</small>`:''}</button>`}).join('')}</div>
 <button class=big onclick="g2play('${id}')">▶ العب المرحلة ${D(Math.min(r.u,game.levels))}</button></section>`);cur=null}

/* بومي يعرف أين الطالب: مقدمة كل لعبة وكل صفحة ألعاب */
const oCtx=window.BumiContext;window.BumiContext=function(){try{if(V==='game'&&cur&&cur.game)return[cur.game.intro,'game:'+cur.game.id];if(document.getElementById('g2hub'))return['هَذَا عَالَمُ الأَلْعَاب. اخْتَرْ لُعْبَةً مُقْتَرَحَةً لَك، أَوْ أَيَّ لُعْبَةٍ تُحِبُّهَا.','g2hub'];if(location&&document.querySelector('.g2-lvls')){const t=document.querySelector('.g2-lvh h2');return[`اخْتَرِ المَرْحَلَة. كُلَّمَا أَكْمَلْتَ مَرْحَلَةً تُفْتَحُ الَّتِي بَعْدَهَا.`,'g2lv']}/* أي صفحة نشاط أو تمرين أخرى: يقرأ بومي عنوانها وتعليمتها من الصفحة نفسها */
 if(V==='lesson'||V==='sec'){const A=document.getElementById('app'),t=A&&A.querySelector('h2'),m=A&&A.querySelector('h2 ~ p.mut, .sec>p.mut, h2 + p');if(t&&!window.lessonIntro?.call){} if(t){const tt=t.textContent.replace(/[\p{Extended_Pictographic}\uFE0F]/gu,'').trim(),mm=m?m.textContent.replace(/[\p{Extended_Pictographic}\uFE0F]/gu,'').trim().split(/\s*[·•|]\s*/).filter(g=>!/[\d\u0660-\u0669]+\s*(?:مِنْ|من|\/)\s*[\d\u0660-\u0669]+/.test(g)&&!/^[\s\d\u0660-\u0669]*$/.test(g)).join('. '):''; /* بلا عدّاد «١ من ٥» والنجوم */if(tt&&tt.length<60&&!/[A-Za-z]/.test(tt+mm)&&!(window.cur&&window.cur.n&&tt.includes(String(window.cur.n).trim()))&&!/^(الدروس|English|الرياضيات|إنجازاتي|اللغة العربية)/.test(tt))return[`هَذَا: ${tt}. ${mm.length<120?mm:''}`.trim(),'pg:'+tt]}}
 }catch(e){}return oCtx?oCtx():null};

/* زر «الألعاب» في الشريط والرئيسية يفتح عالم الألعاب الجديد */
const oSec=window.sec;window.sec=function(k){if(k==='games')return games2d();return oSec.apply(this,arguments)};
/* لوحة ولي الأمر والإنجازات: ملخص الألعاب */
const summary=()=>{const L=GAMES.map(g=>({g,r:(P.g2||{})[g.id]})).filter(x=>x.r&&x.r.n);if(!L.length)return'';const tot=L.reduce((a,x)=>a+totalStars(x.g.id),0);
 return `<div class=pdash><h3>🎮 الألعاب التعليمية</h3><p>جرّب ${D(L.length)} لعبة · ⭐ ${D(tot)} نجمة من الألعاب</p><div class=list>${L.sort((a,b)=>(b.r.last||0)-(a.r.last||0)).slice(0,6).map(x=>`<div class=row><span>${x.g.icon}</span><b>${esc(x.g.name)}</b><small>المرحلة ${D(Math.max(...Object.keys(x.r.s).map(Number),0))}/${D(x.g.levels)} · ⭐ ${D(totalStars(x.g.id))}</small></div>`).join('')}</div></div>`};
window.G2summary=summary;
const oPar=window.parent;if(typeof oPar==='function'){window.parent=function(){const r=oPar.apply(this,arguments);try{const s=summary();if(s){const a=document.querySelector('#app .pdash')||document.querySelector('#app h2');a&&a.insertAdjacentHTML('afterend',s)}}catch(e){}return r}}
const oSec2=window.sec;window.sec=function(k){const r=oSec2.apply(this,arguments);if(k==='ach')try{const s=summary();const a=document.querySelector('#app .sec');s&&a&&a.insertAdjacentHTML('beforeend',s)}catch(e){}return r};
/* واجهة للألعاب الإضافية (phaser-games.js): نفس النتيجة والنجوم والحفظ والصوت */
window.G2API={done:(w,i)=>done(w,i),setEng:e=>{eng=e},cur:()=>cur,talk,mood,words,AR_NAMES,AR_L,EN_L,D,shuf,pick,R,strip,stage,isPic};
/* عند مغادرة صفحة اللعبة نوقف المحرك */
if(typeof window.h==='function'){const oh=window.h;window.h=function(x){if(eng&&!(typeof x==='string'&&x.includes('g2host')))stopEng();document.querySelectorAll('.g2-ov').forEach(o=>o.remove());return oh.apply(this,arguments)}}
})();
setTimeout(()=>{try{window.G2&&G2.Owl.load()}catch(e){}},1500);
