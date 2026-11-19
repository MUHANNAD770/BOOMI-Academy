/* perf-check.js — قياس الأداء وأسباب التعليق (يحتاج Playwright + Chromium).
   التشغيل:  node tools/tests/perf-check.js
   يقيس: زمن الفتح، المهام الطويلة (>50ms) التي تجمّد الواجهة، حجم التنزيل في أول 30 ثانية، نمو الذاكرة والمؤقتات
   والعناصر بعد التنقل بين عشرات الشاشات (تسرّب)، والطلبات المعلّقة، وأخطاء JavaScript. */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.wav':'audio/wav','.webmanifest':'application/json','.bin':'application/octet-stream'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));
 if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const st=fs.statSync(f),rg=q.headers.range&&/bytes=(\d+)-(\d+)/.exec(q.headers.range),h={'content-type':TYPES[path.extname(f)]||'application/octet-stream','accept-ranges':'bytes'};
 if(rg){const a=+rg[1],b=Math.min(+rg[2],st.size-1);r.writeHead(206,{...h,'content-range':`bytes ${a}-${b}/${st.size}`,'content-length':b-a+1});return fs.createReadStream(f,{start:a,end:b}).pipe(r)}
 r.writeHead(200,{...h,'content-length':st.size});fs.createReadStream(f).pipe(r)});
srv.listen(0,'127.0.0.1',async()=>{const url=`http://127.0.0.1:${srv.address().port}/`;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));const cdp=await ctx.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Performance.enable');
 let bytes=0;const by={};const reqUrl={};const pending=new Set();
 cdp.on('Network.requestWillBeSent',e=>{reqUrl[e.requestId]=e.request.url;pending.add(e.requestId)});
 cdp.on('Network.loadingFinished',e=>{pending.delete(e.requestId);bytes+=e.encodedDataLength;const u=(reqUrl[e.requestId]||'').replace(url,'').split('?')[0];const g=u.startsWith('voices/clips/')&&u.endsWith('.bin')?'voice clip packs':u.startsWith('lib/')?'libraries':'app files';by[g]=(by[g]||0)+e.encodedDataLength});
 cdp.on('Network.loadingFailed',e=>pending.delete(e.requestId));
 await p.addInitScript(()=>{localStorage.setItem('hrw2',JSON.stringify({kids:[{name:'x',gender:'female',age:7,lang:'both',stage:2,done:{},sc:{},unlockAll:1}],cur:0}));
  window.__lt=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>__lt.push(Math.round(e.duration)))).observe({type:'longtask',buffered:true})}catch(e){}
  const si=setInterval,ci=clearInterval;window.__iv=new Set();window.setInterval=function(f,ms,...a){const id=si.call(this,f,ms,...a);__iv.add(id);return id};window.clearInterval=function(id){__iv.delete(id);return ci.call(this,id)}});
 const t0=Date.now();await p.goto(url,{waitUntil:'load'});const loadMs=Date.now()-t0;await p.waitForTimeout(1500);
 const startLT=await p.evaluate(()=>__lt.slice());
 const m0=await p.evaluate(()=>({heap:Math.round((performance.memory||{}).usedJSHeapSize/1e6),nodes:document.getElementsByTagName('*').length,iv:__iv.size}));
 const SCREENS=['home',"sec('les')","sec('math')","sec('games')","lesson('1-0')",'quiz()',"mstart('add')",'stories()','puzzles()','act()','aLet()','world()','games2d()',"g2play('memory',1)","g2play('compare',1)","g2play('catch-add',1)","g2play('bumi-adv',1)",'parent()','voiceSet()',"courseViewer(COURSE_MODULES[2].id,COURSE_MODULES[2].resources[0].id)"];
 for(let round=0;round<2;round++)for(const s of SCREENS){await p.evaluate(s=>{try{(0,eval)(s.includes('(')?s:s+'()')}catch(e){}},s);await p.waitForTimeout(450)}
 await p.evaluate('home()');await p.waitForTimeout(2500);try{await cdp.send('HeapProfiler.collectGarbage')}catch(e){}
 const m1=await p.evaluate(()=>({heap:Math.round((performance.memory||{}).usedJSHeapSize/1e6),nodes:document.getElementsByTagName('*').length,iv:__iv.size,lt:__lt.slice()}));
 await p.waitForTimeout(Math.max(0,30000-(Date.now()-t0)));
 const MB=x=>(x/1e6).toFixed(1)+'MB';
 console.log('load event:',loadMs+'ms','| long tasks during startup:',startLT.length,startLT.length?'(max '+Math.max(...startLT)+'ms)':'');
 console.log('downloaded in first 30s:',MB(bytes),JSON.stringify(Object.fromEntries(Object.entries(by).map(([k,v])=>[k,MB(v)]))));
 console.log('after 40 screen changes: heap',m0.heap+'→'+m1.heap+'MB','| DOM nodes',m0.nodes+'→'+m1.nodes,'| active setIntervals',m0.iv+'→'+m1.iv);
 const lt=m1.lt.slice(startLT.length);console.log('long tasks while navigating:',lt.length,lt.length?'(max '+Math.max(...lt)+'ms, >200ms: '+lt.filter(x=>x>200).length+')':'');
 console.log('requests still pending:',pending.size,[...pending].slice(0,3).map(i=>reqUrl[i]).join(' '));
 console.log('JS errors:',errs.length?[...new Set(errs)].join(' | '):'none');
 await b.close();srv.close()});
