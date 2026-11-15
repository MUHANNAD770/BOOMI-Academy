const fs=require('fs');const p=JSON.parse(fs.readFileSync('phrases.json'));const f=JSON.parse(fs.readFileSync('found.json'));
const en=p.filter(x=>x[1][1]=='en').map(x=>x[1][0]);
const vocab=new Set();for(const s of en)if(/\s/.test(s)&&/^[A-Za-z ,.'!?’–]+$/.test(s))for(const w of s.toLowerCase().split(/[^a-z']+/))if(w)vocab.add(w);
const ok=t=>{if(/[{}:=\/\\#@_<>()\[\]$;]/.test(t))return false;if(/[a-z][A-Z]/.test(t))return false;if(/\d/.test(t)&&/[A-Za-z]/.test(t)&&!/^\d+(st|nd|rd|th)$/.test(t))return false;
 if(/(^|\s)-|-(\s|$)|\w-\w/.test(t))return false;
 if(!/\s/.test(t)){if(/^[a-z]+$/.test(t))return vocab.has(t)&&t.length>1;if(/^[A-Z][a-z]+$/.test(t))return true;if(/^[A-Z]$/.test(t))return true;return /^[A-Za-z'’]+$/.test(t)}
 const w=t.split(/\s+/);if(w.length>3&&w.every(x=>/^[A-Z]$/.test(x)))return false;return /[A-Za-z]{2}/.test(t)};
const out=p.filter(([k,[t,l]])=>l=='ar'||f[k]||ok(t));
console.log('before',p.length,'after',out.length,'en',out.filter(x=>x[1][1]=='en').length,'ar',out.filter(x=>x[1][1]=='ar').length);
fs.writeFileSync('final.json',JSON.stringify(out));
const s=out.filter(x=>x[1][1]=='en'&&!f[x[0]]).map(x=>x[1][0]);console.log(s.filter((x,i)=>i%45==0).join(' | '));
const a=out.filter(x=>x[1][1]=='ar'&&!f[x[0]]).map(x=>x[1][0]);console.log('AR new sample:',a.filter((x,i)=>i%60==0).join(' | '));
