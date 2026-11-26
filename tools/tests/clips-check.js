/* clips-check.js — يتحقق أن موضع كل مقطع في فهرس الأصوات يقع على بداية صوته فعلًا داخل حزمته.
   التشغيل:  node tools/tests/clips-check.js
   (كان الفهرس الأصلي يتجاهل ترويسة ID3 بطول 5822 بايت في أول كل حزمة قديمة، فكانت نصف الكلمات تُقرأ من وسط صوت آخر.) */
const fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'../..');let fail=0;
for(const who of ['female','male']){const j=JSON.parse(fs.readFileSync(path.join(ROOT,'audio/clips',who+'.json'),'utf8'));const data={};let bad=0,ex=[];
 for(const[k,[p,off,len]]of Object.entries(j.idx)){const b=data[p]||(data[p]=fs.readFileSync(path.join(ROOT,'audio/clips',j.packs[p])));
  const ok=off+len<=b.length&&((b[off]===0xff&&(b[off+1]&0xe0)===0xe0)||b.toString('latin1',off,off+3)==='ID3');if(!ok){bad++;if(ex.length<3)ex.push(j.packs[p]+'@'+off)}}
 console.log((bad?'✗ ':'✓ ')+who+': '+Object.keys(j.idx).length+' clips, '+bad+' not at the start of their audio'+(ex.length?' e.g. '+ex.join(', '):''));fail+=bad}
process.exit(fail?1:0);
