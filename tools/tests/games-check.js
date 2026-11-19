/* games-check.js — يلعب المرحلة الأولى من كل لعبة في «عالم الألعاب» حتى شاشة النتيجة، كطالب يجرّب (يحتاج Playwright + Chromium).
   التشغيل من مجلد المشروع:  node tools/tests/games-check.js  [معرّف لعبة اختياري]
   لكل لعبة يتحقق من: ظهور العنوان والتعليمات بلا نص معطوب (undefined/NaN/[object)، الاستجابة للضغط، الانتقال بين الأسئلة،
   ظهور شاشة النتيجة بأزرارها (التالية/إعادة/المراحل)، وحفظ النجوم وفتح المرحلة التالية في ملف الطالب.
   ألعاب الرسم (Canvas/Phaser): يتحقق من تشغيل الحلقة وتحرّك اللاعب باللمس، ثم يُكمل المرحلة عبر مسارها الحقيقي
   (سؤال الباب ثم العلم في المغامرات، و win() في الصيد، وdone في Phaser). */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),ONLY=process.argv[2];
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.wav':'audio/wav','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));
 if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
srv.listen(0,'127.0.0.1',async()=>{const url=`http://127.0.0.1:${srv.address().port}/`;let fail=0;
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const p=await (await b.newContext({viewport:{width:390,height:844},hasTouch:true})).newPage();let errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('hrw2',JSON.stringify({kids:[{name:'test',gender:'male',age:7,lang:'both',stage:1,done:{},sc:{}}],cur:0}))});
 await p.goto(url);await p.waitForTimeout(2000);
 const ids=(await p.evaluate(()=>G2GAMES.map(g=>g.id))).filter(x=>!ONLY||x===ONLY);
 for(const id of ids){errs=[];const play=st=>p.evaluate(async([id,st])=>{const W=ms=>new Promise(z=>setTimeout(z,ms)),$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const out={id,steps:0,kind:'',notes:[]};const BADTXT=/undefined|NaN|\[object|null\b/;
  if(!st){window.__rec0=JSON.stringify((P.g2||{})[id]||{});g2play(id,1);await W(900)}Object.assign(out,st||{});out.need='';const rec0=window.__rec0;
  const top=$('#app .g2-top b');out.title=top?top.textContent.trim():'';if(!out.title)out.notes.push('no title');
  const txt=()=>(document.getElementById('app').innerText||'')+' '+$$('.g2-ov').map(o=>o.innerText).join(' ');if(BADTXT.test(txt()))out.notes.push('broken text: '+txt().match(/.{0,30}(undefined|NaN|\[object|null).{0,20}/)[0]);
  const res=()=>!!$('#app .g2-res');const sig=()=>($('#app .g2-pz')||$('#app .g2-host')||{}).innerHTML+'|'+(($('#app .g2-prog i')||{}).style||{}).width+'|'+$$('.g2-ov').length;
  /* محاولة إجابة سؤال اختيار (في الصفحة أو في نافذة الباب): نجرّب الاختيارات حتى يتغيّر السؤال */
  const tryOpts=async sel=>{const before=sig();const os=$$(sel).filter(o=>!o.disabled);for(const o of os){o.click();await W(1500);if(sig()!==before||res())return true;}return false};
  const eng=()=>window.G2eng&&G2eng();
  for(let step=0;step<90&&!res();step++){out.steps=step+1;
   if($('.g2-ov .opt')){out.kind=out.kind||'gate';if(!await tryOpts('.g2-ov .opt'))break;await W(400);continue}
   if($('#app .g2-opts .opt')){out.kind='choose';if(!await tryOpts('#app .g2-opts .opt')){out.notes.push('choose: no option advanced');break}continue}
   if($('#app .g2-match')){out.kind='match';const A=$$('#app .g2-m[data-s=a]').filter(x=>!x.classList.contains('ok'));if(!A.length){await W(600);continue}
    const a=A[0],bb=$$('#app .g2-m[data-s=b]').find(x=>x.dataset.k===a.dataset.k&&!x.classList.contains('ok'));if(!bb){out.notes.push('match: no partner for '+a.dataset.k);break}a.click();await W(150);bb.click();await W(500);continue}
   if($('#app .g2-mem')){out.kind='memory';const cs=$$('#app .g2-cardm');const free=cs.filter(c=>!c.classList.contains('ok')&&!c.classList.contains('done')&&!c.classList.contains('gone'));if(!free.length){await W(700);continue}
    /* نقلب الأولى ثم نجرّب كل بطاقة أخرى حتى تبقى الاثنتان مقلوبتين (تطابقتا) */let matched=false;
    for(const c2 of free.slice(1)){free[0].click();await W(120);c2.click();await W(1300);if(free[0].classList.contains('up')&&c2.classList.contains('up')){matched=true;break}}
    if(!matched){out.notes.push('memory: no pair found');break}continue}
   if($('#app .g2-tiles')){out.kind='build';out.need='build';break} /* السحب يحتاج أحداث مؤشر حقيقية: يتولاها Node */
   if($('#app .g2-baskets')){out.kind='sort';const s0=sig();let moved=false;for(const bn of $$('#app .g2-bin')){bn.click();await W(700);if(sig()!==s0||res()){moved=true;break}}if(!moved){out.notes.push('sort: no bin accepted');break}continue}
   const e=eng();
   if(e&&typeof e.win==='function'){out.kind='catch';if(!out.caught){out.need='catch';out.x0=e.pl&&e.pl.x;break}if(!e.t||e.t<=0)out.notes.push('catch: loop not running');e.win();await W(1500);continue}
   if(e&&e.flagX){out.kind='platform';const t0=e.t;const rb=$('#app .g2-b.r');if(rb){rb.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await W(900);rb.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))}
    if(!(e.t>t0))out.notes.push('platform: loop not running');
    if(!e.door.open&&e.doorX){e.pl.x=e.doorX-40;e.pl.y=0;await W(1800);if($('.g2-ov .opt'))continue}
    if(!e.door.open){e.door.open=true;out.notes.push('platform: door opened directly (letters mode)')}
    e.pl.x=e.flagX+10;await W(2200);continue}
   if($('#app canvas')||window.PXGames&&PXGames.scene){out.kind='phaser';await W(2500);const cv=$('#app canvas');if(!cv)out.notes.push('phaser: no canvas');G2API.done(true,{stars:1});await W(900);continue}
   await W(600)}
  out.finished=res();const rec=(P.g2||{})[id]||{};out.saved=JSON.stringify(rec)!==rec0;out.unlocked=rec.u>=2||(G2GAMES.find(g=>g.id===id).levels<2);
  out.buttons=$$('#app .g2-res button').map(b=>b.textContent.trim()).join(' / ');
  if(BADTXT.test(txt()))out.notes.push('broken text on result');
  try{const saved=JSON.parse(localStorage.getItem('hrw2')).kids[0].g2;out.persisted=!!(saved&&saved[id])}catch(e){out.persisted=false}
  return out},[id,st]);
  let r=await play(null);
  for(let k=0;k<40&&r.need;k++){
   if(r.need==='catch'){const c=await p.$('#app canvas');const bx=c&&await c.boundingBox();if(bx){await p.mouse.move(bx.x+bx.width*.8,bx.y+bx.height-40);await p.mouse.down();await p.mouse.move(bx.x+20,bx.y+bx.height-40,{steps:8});await p.mouse.up()}
    await p.waitForTimeout(1200);const moved=await p.evaluate(x0=>{const e=G2eng();return !(e&&e.pl&&x0!=null&&Math.abs(e.pl.x-x0)<1)},r.x0);if(!moved)r.notes.push('catch: player did not move on touch');r.caught=1}
   else if(r.need==='build'){ /* املأ كل الخانات؛ اللعبة تعيد الخاطئة، فنجرّبها بترتيب آخر */
    for(let a=0;a<12;a++){const t0=await p.$$('#app .g2-tiles .g2-tile');if(!t0.length)break;/* ترتيب ثابت (رقم البطاقة) ثم إزاحة دورية: كل بطاقة تمر بكل خانة مرة، فتثبت واحدة على الأقل في كل دورة */const ids=await Promise.all(t0.map(t=>t.getAttribute('data-i')));const tiles=t0.map((t,k)=>[+ids[k],t]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);const rot=a%tiles.length;const order=[...tiles.slice(rot),...tiles.slice(0,rot)];
     for(const t of order){await t.click();await p.waitForTimeout(120)}await p.waitForTimeout(1400);if(await p.$('#app .g2-res'))break;
     const still=await p.$$('#app .g2-tiles .g2-tile');if(!still.length){await p.waitForTimeout(900);if(!(await p.$('#app .g2-tiles .g2-tile')))break}}}
   r=await play(r)}
  const ok=r.finished&&r.saved&&r.persisted&&r.unlocked&&/التالية/.test(r.buttons.replace(/[\u064B-\u0652]/g,''))&&!r.notes.filter(n=>!/letters mode/.test(n)).length&&!errs.length;if(!ok)fail++;
  console.log(`${ok?'✓':'✗'} ${id.padEnd(15)} ${r.kind.padEnd(8)} steps=${String(r.steps).padEnd(3)} finished=${r.finished} saved=${r.persisted} unlocked=${r.unlocked}${r.notes.length?' | '+r.notes.join('; '):''}${errs.length?' | errors: '+errs.join(' ; ').slice(0,200):''}`)}
 await b.close();srv.close();console.log(fail?`\n${fail} game(s) with problems`:'\nall games OK');process.exit(fail?1:0)});
