// يحوّل قائمة نصوص إلى «نص المحرك» بقاعدة التاء المربوطة (src/voice/tamarbuta.js + src/voice/tm-map.json)
// الاستعمال: node engine_cli.js in.json out.json   (in: [[نص, لغة], ...] ← out: {نص: نص المحرك})
const T=require('../../src/voice/tamarbuta.js'),M=require('../../src/voice/tm-map.json'),fs=require('fs');
const L=JSON.parse(fs.readFileSync(process.argv[2]));const o={};
for(const x of L){const [t,l]=Array.isArray(x)?x:[x,'ar'];if(l==='ar'){const e=T.engine(t,M);if(e!==t)o[t]=e}}
fs.writeFileSync(process.argv[3],JSON.stringify(o));
