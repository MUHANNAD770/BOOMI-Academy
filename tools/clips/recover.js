const fs=require('fs'),path=require('path');const {mkCtx,key}=require('./harness.js');
const ROOT=process.env.ROOT;
const idx={female:JSON.parse(fs.readFileSync(ROOT+'/voices/clips/female.json')).idx,male:JSON.parse(fs.readFileSync(ROOT+'/voices/clips/male.json')).idx};
const files=[];(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);const s=fs.statSync(p);if(s.isDirectory()){if(!/^(tts|node_modules|lib|netlify|img|audio|clips)$/.test(f))walk(p)}else if(/\.(js|html)$/.test(f))files.push(p)}})(ROOT);
const cand=new Set();
const add=s=>{s=s.replace(/\\n/g,'\n').replace(/\\'/g,"'").replace(/\\"/g,'"');if(/[\p{L}]/u.test(s)&&s.length<2000){cand.add(s);
  // pieces split on html tags / template holes / separators
  for(const x of s.split(/<[^>]*>|\$\{[^}]*\}|\||\n|[•·]/))if(/[\p{L}]/u.test(x))cand.add(x.trim());}};
for(const f of files){const t=fs.readFileSync(f,'utf8');
 for(const re of [/'((?:[^'\\\n]|\\.)*)'/g,/"((?:[^"\\\n]|\\.)*)"/g,/`((?:[^`\\]|\\.)*)`/g,/>([^<>]{1,400})</g]){let m;while(m=re.exec(t))add(m[1])}
 // words within strings too
}
// also individual words of arabic candidates
for(const s of [...cand]){for(const w of s.split(/[\s،,.!؟?:;()\[\]{}"'«»]+/))if(w&&/[\p{L}]/u.test(w))cand.add(w)}
console.error('candidates',cand.size);
const found={};const ctxs=[mkCtx('male'),mkCtx('female')];
// without gender transform: delete studentGenderText (not loaded anyway)
for(const s of cand)for(const l of ['ar','en'])for(const c of ctxs.slice(0,1)){
 let parts;try{parts=c.say.parts(s,l)}catch(e){continue}
 const whole=[[s.replace(/\s+/g,' ').trim(),l]];
 for(const [t,L] of parts.concat(whole)){const k=key(t,L);if((idx.female[k]||idx.male[k])&&!found[k])found[k]=[t,L]}}
const fk=Object.keys(idx.female),mk=Object.keys(idx.male);
console.log('female keys',fk.length,'found',fk.filter(k=>found[k]).length,'| male',mk.length,mk.filter(k=>found[k]).length);
fs.writeFileSync('found.json',JSON.stringify(found));
