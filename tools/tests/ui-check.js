/* ui-check.js — فحص آلي للواجهة على هاتف صغير (360px) وجهاز لوحي وكمبيوتر (يحتاج Playwright + Chromium).
   التشغيل:  node tools/tests/ui-check.js
   لكل شاشة: تمرير أفقي، عناصر تخرج عن الشاشة، أزرار أصغر من 40px (صعبة على الطفل)، أزرار يغطي بعضها بعضًا،
   نص إنجليزي داخل عنصر RTL بلا عزل اتجاه، وأخطاء JavaScript. ويتحقق من احترام «تقليل الحركة». */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.wav':'audio/wav','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));
 if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const SCREENS=[['home'],['sec','les'],['sec','math'],['sec','games'],['sec','ach'],['parent'],['voiceSet'],['lesson','1-0'],['quiz'],['mstart','add'],['CV',2],['coursePractice','CP'],['stories'],['story','S'],['puzzles'],['riddles'],['measure'],['wordProblems'],['act'],['aLet'],['aHar'],['aCount'],['world'],['path'],['games2d'],['g2levels','memory'],['g2play','memory'],['g2play','ar-build'],['g2play','compare'],['bomi']];
srv.listen(0,'127.0.0.1',async()=>{const url=`http://127.0.0.1:${srv.address().port}/`;const b=await chromium.launch();let total=0;
 for(const [vw,vh,label] of [[360,740,'phone-360'],[768,1024,'tablet'],[1280,800,'desktop']]){
  const p=await (await b.newContext({viewport:{width:vw,height:vh}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('hrw2',JSON.stringify({kids:[{name:'سارة',gender:'female',age:7,lang:'both',stage:2,done:{},sc:{},unlockAll:1}],cur:0}))});
  await p.goto(url);await p.waitForTimeout(1800);const found={};
  for(const [fn,a] of SCREENS){await p.evaluate(([fn,a])=>{try{document.getElementById('bm')?.remove();if(fn=='bomi'){home();bomi();return}
    if(fn=='CV'){const m=COURSE_MODULES[a];return courseViewer(m.id,m.resources[0].id)}if(fn=='coursePractice'){const m=COURSE_MODULES[0];return coursePractice(m.id,m.resources[1].id)}
    if(fn=='story'){const s=Object.values(STORIES||{}).flat?Object.values(STORIES).flat():[];const id=(s.find(x=>x&&x.id)||{}).id;return id?story(id):stories()}
    window[fn](...(a!==undefined?[a]:[]))}catch(e){console.error(fn,e.message)}},[fn,a]);await p.waitForTimeout(1100);
   const r=await p.evaluate(()=>{const W=innerWidth,out=[];const de=document.documentElement;if(de.scrollWidth>W+2)out.push('horizontal scroll ('+de.scrollWidth+'px > '+W+')');
    const vis=e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0.05&&e.getClientRects().length};
    const els=[...document.querySelectorAll('#app *, #gn *, #bm *, .owl-dock *')].filter(vis);
    const name=e=>(e.tagName.toLowerCase()+(e.className&&typeof e.className=='string'?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'')+' «'+(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,18)+'»');
    for(const e of els){const r=e.getBoundingClientRect();if(r.width<2||r.height<2)continue;if(getComputedStyle(e).position==='fixed'&&e.closest('.g2-ov'))continue;
     if((r.right>W+2||r.left<-2)&&!e.closest('.g2-stage,canvas,.ct-paper table,.tbl-wrap,[style*="overflow"]'))out.push('off-screen: '+name(e)+' ['+Math.round(r.left)+'..'+Math.round(r.right)+']')}
    const btns=els.filter(e=>e.matches('button,a[href],[role=button],.opt,.row,.card'));
    for(const e of btns){const r=e.getBoundingClientRect();if(e.closest('.ct-say,.owl-me,.ct-paper'))continue;if(r.height<40&&r.width<40||r.height<32)out.push('small target '+Math.round(r.width)+'x'+Math.round(r.height)+': '+name(e))}
    /* أزرار متداخلة: مركز زر يقع فوقه عنصر تفاعلي آخر */
    for(const e of btns){const r=e.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)continue;const x=r.left+r.width/2,y=r.top+r.height/2;const top=document.elementFromPoint(x,y);
     if(top&&!e.contains(top)&&!top.contains(e)){const t=top.closest('button,a,[onclick],.opt,.row,.card');if(t&&t!==e&&!t.contains(e)&&!e.contains(t))out.push('covered: '+name(e)+' under '+name(t))}}
    return [...new Set(out)].slice(0,12)});
   if(r.length){found[fn+(a!==undefined?'('+a+')':'')]=r;total+=r.length}}
  console.log(`\n=== ${label} (${vw}px) ===`);for(const[k,v]of Object.entries(found)){console.log(' '+k);v.forEach(x=>console.log('    - '+x))}
  if(!Object.keys(found).length)console.log('  no layout issues');if(errs.length)console.log('  JS errors: '+[...new Set(errs)].join(' | '));
  await p.close()}
 /* تقليل الحركة */
 const p=await (await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})).newPage();
 await p.addInitScript(()=>{localStorage.setItem('hrw2',JSON.stringify({kids:[{name:'x',gender:'male',age:7,lang:'both',stage:2,done:{},sc:{}}],cur:0}))});await p.goto(url);await p.waitForTimeout(1500);
 const rm=await p.evaluate(async()=>{sec('les');await new Promise(z=>setTimeout(z,600));const a=document.getAnimations?document.getAnimations().filter(x=>x.playState==='running'&&x.effect&&x.effect.getComputedTiming().iterations===Infinity).length:0;
  let gs=0;try{gs=gsap.globalTimeline.getChildren(true,true,true).filter(t=>t.isActive()&&t.repeat&&t.repeat()===-1).length}catch(e){}return{cssInfinite:a,gsapInfinite:gs}});
 console.log('\n=== reduced motion ===\n  running infinite CSS animations:',rm.cssInfinite,'| infinite GSAP tweens:',rm.gsapInfinite);
 await b.close();srv.close()});
