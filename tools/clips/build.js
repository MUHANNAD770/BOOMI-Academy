const fs=require('fs'),path=require('path');const {mkCtx,key}=require('./harness.js');
const ROOT=process.env.ROOT;
const idx=JSON.parse(fs.readFileSync(ROOT+'/voices/clips/female.json')).idx;
const SKIP=/^(tts|node_modules|lib|netlify|img|audio|clips)$/, SKIPF=/^(lex|lex-ext|tashkeel|pron|sw|harness)\.js$/;
const files=[];(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);const s=fs.statSync(p);if(s.isDirectory()){if(!SKIP.test(f))walk(p)}else if(/\.js$/.test(f)&&!SKIPF.test(f))files.push(p)}})(ROOT);
const HAR=/[ً-ْ]/, AR=/[؀-ۿ]/, LA=/[A-Za-z]/;
const cand=new Set();
const add=s=>{s=s.replace(/\\n/g,'\n').replace(/\\'/g,"'").replace(/\\"/g,'"');
 for(const x0 of s.split(/<[^>]*>|\$\{[^}]*\}|\||\n|,(?=\S)|[\[\]`]/)){const x=x0.replace(/,[^\s,]*\p{Extended_Pictographic}.*$/u,'').trim();if(!x)continue;
  if(AR.test(x)?HAR.test(x):(LA.test(x)&&/^[A-Za-z0-9 ,.'!?’\-–:;]+$/.test(x)&&x.split(' ').length<=14))cand.add(x)}};
for(const f of files){const t=fs.readFileSync(f,'utf8');
 for(const re of [/'((?:[^'\\\n]|\\.)*)'/g,/"((?:[^"\\\n]|\\.)*)"/g,/`((?:[^`\\]|\\.)*)`/g]){let m;while(m=re.exec(t))add(m[1])}}
const c=mkCtx('male');const out=new Map();
for(const s of cand){const l=AR.test(s)?'ar':'en';for(const [t,L] of c.say.parts(s,l)){const k=key(t,L);if(!out.has(k))out.set(k,[t,L])}}
const old=new Set(Object.keys(idx));let hit=0;for(const k of out.keys())if(old.has(k))hit++;
const found=JSON.parse(fs.readFileSync('found.json'));let fin=0;for(const k in found)if(out.has(k))fin++;
console.log('cand',cand.size,'phrases',out.size,'ar',[...out.values()].filter(x=>x[1]=='ar').length,'oldhit',hit,'recovered-in-set',fin,'/',Object.keys(found).length);
// union with recovered
for(const k in found)if(!out.has(k))out.set(k,found[k]);
fs.writeFileSync('phrases.json',JSON.stringify([...out.entries()]));console.log('final',out.size);
