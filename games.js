/* games.js — المرحلة ٢: ٤ ألعاب تفاعلية (ذاكرة، تركيب كلمات، أنماط، ترتيب جمل). تأخذ كلماتها تلقائياً من كل الدروس، فأي درس جديد يدخل الألعاب. لإضافة لعبة: أضف دالة وسطراً في GL */
(()=>{const em=x=>/\p{Extended_Pictographic}/u.test(x[1])&&x[1].length<=5,all=l=>S.flatMap(s=>s.u).filter(u=>u.l==l).flatMap(u=>u.i),
pool=l=>all(l).filter(em),LG=()=>P.lang=='en'?'en':P.lang=='ar'?'ar':pk(['ar','en']);let g=window.__gameState||{},lk=0;
window.__snapshotGame=()=>JSON.parse(JSON.stringify(g));window.__restoreGame=s=>{Object.keys(g).forEach(k=>delete g[k]);Object.assign(g,s||{})};
const good=(l)=>{try{window.HurufiSound&&HurufiSound.play('correct')}catch(e){}MC.mood('happy',1200);say(pk(OKS[l]||OKS.ar),l)},bad=()=>{try{window.HurufiSound&&HurufiSound.play('wrong')}catch(e){}MC.mood('oops',1200)},
fin2=(n,fn)=>{P.star+=g.s;save();try{window.HurufiSound&&HurufiSound.play(g.s>=n*.6?'finish':'wrong')}catch(e){}MC.mood(g.s>=n*.6?'happy':'oops',2000);h(`<h1>${g.s>=n*.6?'🌟':'💪'}</h1><h2>${g.s} من ${n}</h2><p>+${g.s} ⭐ · مجموع نجومك ${P.star}</p><button class=big onclick="${fn}()">جولة جديدة</button><button class=alt onclick="sec('games')">رجوع للألعاب</button>`)},
top=(t,i,n)=>`<button class=link onclick="say.stop();sec('games')">رجوع ←</button><h2>${t}</h2><p class=mut>${i?`${i} من ${n} · `:''}⭐ ${g.s||0}</p>`,
ok0=()=>{V='lesson';lk=0;return 1};
/* 1) الذاكرة */
window.gMem=()=>{if(!ok0())return;window.__gameKind='gMem';const l=LG(),seen=new Set(),p=shuf(pool(l)).filter(x=>!seen.has(x[1])&&seen.add(x[1])).slice(0,6);g=window.__gameState={a:null,d:0,m:0,s:0};
h(`${top('🃏 لعبة الذاكرة')}<p class=mut>اقلب بطاقتين متشابهتين</p><div class=grid>${shuf([...p,...p]).map((x,i)=>`<button class=card id=mc${i} data-e="${x[1]}" data-w="${x[0]}" data-l="${x[2]}" onclick="mflip(${i})"><span>❓</span></button>`).join('')}</div>`)};
window.mflip=i=>{const b=document.getElementById('mc'+i);if(lk||b.dataset.on)return;b.dataset.on=1;b.firstChild.textContent=b.dataset.e;say(b.dataset.w,b.dataset.l);
if(g.a==null){g.a=i;return}const a=document.getElementById('mc'+g.a);g.a=null;
if(a.dataset.e==b.dataset.e){g.d++;a.disabled=b.disabled=1;a.classList.add('ok');b.classList.add('ok');if(g.d==6){g.s=Math.max(1,6-Math.max(0,g.m-3));setTimeout(()=>fin2(6,'gMem'),650)}}
else{g.m++;lk=1;bad();setTimeout(()=>{[a,b].forEach(x=>{delete x.dataset.on;x.firstChild.textContent='❓'});lk=0},650)}};
/* 2) تركيب الكلمات */
window.gBuild=()=>{if(!ok0())return;window.__gameKind='gBuild';g=window.__gameState={s:0,r:0};bn()};
const bn=()=>{if(g.r>=5)return fin2(5,'gBuild');const l=LG(),it=shuf(pool(l).filter(x=>{const w=stripD(x[0]);return w.length>=3&&w.length<=6&&!/\s/.test(w)}))[0],w=stripD(it[0]);g.w=it;g.t='';g.l=l;g.c=w;
h(`${top('🔤 ركّب الكلمة',g.r+1,5)}<div class=q>${it[1]}</div><div id=bs class=q dir=${l=='ar'?'rtl':'ltr'}>&nbsp;</div><div class=grid>${shuf([...w]).map((c,i)=>`<button class=opt id=bl${i} onclick="bpick(${i},'${c}')">${c}</button>`).join('')}</div><button class=link onclick=bn2()>مسح</button>`);say(it[0],l)};
window.bn2=()=>{g.t='';document.getElementById('bs').innerHTML='&nbsp;';document.querySelectorAll('.opt').forEach(b=>b.disabled=0)};
window.bpick=(i,c)=>{if(lk)return;document.getElementById('bl'+i).disabled=1;g.t+=c;document.getElementById('bs').textContent=g.t;
if(g.t.length<g.c.length)return;lk=1;const ok=g.t==g.c;document.getElementById('bs').textContent=g.w[0];if(ok){g.s++;good(g.l)}else{bad();say(g.w[0],g.l)}g.r++;setTimeout(()=>{lk=0;bn()},950)};
/* 3) أكمل النمط */
window.gPat=()=>{if(!ok0())return;window.__gameKind='gPat';g=window.__gameState={s:0,r:0};pn()};
const pn=()=>{if(g.r>=5)return fin2(5,'gPat');const E=shuf(['🍎','⭐','🐟','🚗','🔵','🌸','🐱','⚽']),[a,b,c]=E,T=[[a,b,a,b,a,b],[a,a,b,a,a,b],[a,b,b,a,b,b],[a,b,c,a,b,c]],s=pk(T),ans=s[5];
h(`${top('🧩 أكمل النمط',g.r+1,5)}<div class=q>${s.slice(0,5).join(' ')} ❓</div><div class=grid>${shuf([a,b,c]).map(x=>`<button class=opt data-ok=${+(x==ans)} onclick=pans(this)>${x}</button>`).join('')}</div>`)};
window.pans=b=>{const ok=b.dataset.ok=='1';document.querySelectorAll('.opt').forEach(o=>{o.disabled=1;if(o.dataset.ok=='1')o.classList.add('ok')});if(!ok)b.classList.add('no');if(ok){g.s++;good('ar')}else bad();g.r++;setTimeout(pn,800)};
/* 4) رتّب الجملة */
window.gOrd=()=>{if(!ok0())return;window.__gameKind='gOrd';g=window.__gameState={s:0,r:0};on()};
const on=()=>{if(g.r>=5)return fin2(5,'gOrd');const it=pk(all('en').filter(x=>x[0].split(' ').length>=3&&x[0].split(' ').length<=6));g.w=it[0].replace(/[?.!]$/,'').split(' ');g.t=[];
h(`${top('📝 رتّب الجملة',g.r+1,5)}<p class=mut dir=auto>${it[1]}</p><div id=os class=q dir=ltr>&nbsp;</div><div class=grid>${shuf(g.w.map((w,i)=>[w,i])).map(([w,i])=>`<button class=opt dir=ltr id=ow${i} onclick="opick(${i})">${w}</button>`).join('')}</div><button class=link onclick=gOrd2()>مسح</button>`);say(it[0],'en')};
window.gOrd2=()=>{g.t=[];document.getElementById('os').innerHTML='&nbsp;';document.querySelectorAll('.opt').forEach(b=>b.disabled=0)};
window.opick=i=>{if(lk)return;document.getElementById('ow'+i).disabled=1;g.t.push(g.w[i]);document.getElementById('os').textContent=g.t.join(' ');
if(g.t.length<g.w.length)return;lk=1;const ok=g.t.join(' ')==g.w.join(' ');if(ok){g.s++;good('en')}else{bad();say(g.w.join(' '),'en')}document.getElementById('os').textContent=g.w.join(' ');g.r++;setTimeout(()=>{lk=0;on()},950)};
const GL=[['🃏','لعبة الذاكرة','gMem'],['🔤','ركّب الكلمة','gBuild'],['🧩','أكمل النمط','gPat'],['📝','رتّب الجملة','gOrd']];
const os0=sec;sec=function(k){os0(k);if(k=='games'){const l=app.querySelector('.list');l&&l.insertAdjacentHTML('beforeend',GL.map(x=>`<button class=row onclick="${x[2]}()"><span>${x[0]}</span><b>${x[1]}</b><small>جديد</small></button>`).join(''))}};
})();
