/* math-check.js — تحقق آلي من أسئلة الرياضيات في الموقع (يحتاج Playwright + Chromium).
   التشغيل من مجلد المشروع:  node tools/tests/math-check.js
   يفحص لكل سؤال: خيارًا صحيحًا واحدًا، خيارات غير مكررة، الجواب الصحيح = العملية المعروضة، عدد الصور = الأعداد،
   عدد الصور في «كم عددها؟» = الجواب، صحة الحساب في الشرح، وإمكان اشتقاق جواب المسائل الكلامية من أعدادها.
   ما لا يمكن فحصه آليًا (الساعة المرسومة، أطوال الأشرطة، الأشكال المرسومة) يحتاج مراجعة بصرية. */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.wav':'audio/wav','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));
 if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
srv.listen(0,'127.0.0.1',async()=>{const url=`http://127.0.0.1:${srv.address().port}/`;let fail=0;const b=await chromium.launch();
 const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('hrw2',JSON.stringify({kids:[{name:'test',gender:'male',age:9,lang:'both',stage:3,done:{},sc:{},unlockAll:1}],cur:0}))});
 await p.goto(url);await p.waitForTimeout(1500);
 const report=(name,r)=>{const k=Object.keys(r.iss);if(k.length)fail++;console.log((k.length?'✗ ':'✓ ')+name.padEnd(22)+' checked '+r.n+(k.length?'  '+JSON.stringify(r.iss)+'\n    e.g. '+r.ex:''))};
 /* 1) مولّد الرياضيات الرئيسي (smart.js + nav.js): كل المهارات والمستويات */
 report('mq (all skills/levels)',await p.evaluate(()=>{const A2L=s=>String(s).replace(/[\u0660-\u0669]/g,d=>d.charCodeAt(0)-1632),EM=/\p{Extended_Pictographic}/gu;const iss={};let n=0,ex='';const bad=(m,t)=>{iss[m]=(iss[m]||0)+1;if(!ex)ex=m+' :: '+t};
  for(const k of Object.keys(MS))for(let l=1;l<=4;l++)for(let i=0;i<300;i++){const q=mq(k,l);n++;const d=document.createElement('div');d.innerHTML=q.show;const t=A2L(d.textContent.replace(/\s+/g,' ').trim());
   const ok=(q.opts||[]).filter(o=>o.ok),okv=ok[0]?+A2L(ok[0].h):NaN;if(ok.length!==1)bad(k+' correct!=1',t);if(new Set((q.opts||[]).map(o=>o.h)).size!==(q.opts||[]).length)bad(k+' duplicate options',t);
   const m=t.match(/(\d+)\s*([+−×÷-])\s*(\d+)\s*=/);if(m){const a=+m[1],c=+m[3],v={'+':a+c,'−':a-c,'-':a-c,'×':a*c,'÷':a/c}[m[2]];if(v!==okv)bad(k+' answer≠expression',t);
    const g=t.slice(0,m.index).split(/[+−×÷-]/).map(x=>(x.match(EM)||[]).length);if(g.some(x=>x>0)&&(g[0]!==a||g[1]!==c))bad(k+' pictures≠numbers',t)}
   if(k=='cnt'&&(t.match(EM)||[]).length!==okv)bad('cnt pictures≠answer',t);
   for(const e0 of q.ex||[]){const e=A2L(e0),mm=e.match(/(\d+)\s*([+−×÷-]|زائد|ناقص|ضرب)\s*(\d+)\s*(=|يساوي)\s*(\d+)/);if(mm){const a=+mm[1],c=+mm[3],o=mm[2],v=/\+|زائد/.test(o)?a+c:/[−-]|ناقص/.test(o)?a-c:/×|ضرب/.test(o)?a*c:a/c;if(v!==+mm[5])bad(k+' explanation wrong',e)}}}
  return{n,iss,ex}}));
 /* 2) صفحات الأسئلة المعروضة فعلًا (الألغاز، المسائل، الأنشطة) */
 for(const s of ['wordProblems','advMath','advMul','speedGame','measure','aCount','aMiss','logic','weekly'])report(s,await p.evaluate(async s=>{const W=ms=>new Promise(z=>setTimeout(z,ms)),A2L=x=>String(x).replace(/[\u0660-\u0669]/g,d=>d.charCodeAt(0)-1632),EM=/\p{Extended_Pictographic}/gu;const iss={};let n=0,ex='';const bad=(m,t)=>{iss[m]=(iss[m]||0)+1;if(!ex)ex=m+' :: '+t};
  for(let i=0;i<25;i++){window[s]();await W(120);const opts=[...document.querySelectorAll('#app .opt')];if(!opts.length)continue;n++;const T=o=>o.textContent.replace(/\s+/g,' ').trim();
   const okb=opts.filter(o=>o.dataset.ok=='1');if(okb.length!==1)bad('correct!='+okb.length,'');const ts=opts.map(T);if(new Set(ts).size!==ts.length)bad('duplicate options',ts.join('/'));
   const qel=document.querySelector('#app .q, #app .bub, #app .ac-obs'),qt=A2L(qel?qel.textContent.replace(/\s+/g,' '):''),okv=okb[0]?A2L(T(okb[0])):'';
   const m=qt.match(/(\d+)\s*([+−×÷-])\s*(\d+)\s*=/);if(m&&/^\d+$/.test(okv)){const a=+m[1],c=+m[3],v={'+':a+c,'−':a-c,'-':a-c,'×':a*c,'÷':a/c}[m[2]];if(v!==+okv)bad('answer≠expression',qt+' ok='+okv)}
   if(s=='aCount'&&(qt.match(EM)||[]).length!==+okv)bad('pictures≠answer',qt+' ok='+okv);
   if(qel&&qel.classList.contains('bub')&&/^\d+$/.test(okv)){const ns=(qt.match(/\d+/g)||[]).map(Number);if(ns.length>=2){const[a,c,d]=ns;if(![a+c,a-c,c-a,a*c,a/c,d!=null?a+c-d:NaN].includes(+okv))bad('word problem answer not derivable',qt+' ok='+okv)}}}
  return{n,iss,ex}},s));
 /* 3) لعبة «العدد والكمية»: عدد التفاح = العدد المطلوب */
 report('games2d num-match',await p.evaluate(async()=>{const W=ms=>new Promise(z=>setTimeout(z,ms));const iss={};let n=0,ex='';
  for(let r=0;r<12;r++){try{g2play('num-match',1)}catch(e){}await W(400);
   const st=[...document.querySelectorAll('#app button')].find(b=>/ابدأ|ابْدَأْ|اِبْدَأْ|العب|start/i.test(b.textContent)&&!b.closest('.g2-match'));if(st&&!document.querySelector('.g2-m')){st.click();await W(500)}
   for(const c of document.querySelectorAll('.g2-m[data-s=a]')){n++;const k=+c.dataset.k,t=c.textContent,a=(t.match(/🍎/gu)||[]).length;
    if(/\d|[٠-٩]/.test(t)){iss['digit shown instead of quantity']=(iss['digit shown instead of quantity']||0)+1;ex=ex||t}
    else if(a!==k){iss['apples≠number']=(iss['apples≠number']||0)+1;ex=ex||t+' ≠ '+k}}}
  return{n,iss,ex}}));
 console.log(errs.length?'page errors: '+errs.join(' | '):'page errors: none');await b.close();srv.close();process.exit(fail||errs.length?1:0)});
