/* letters.js — مقاطع نطق الحروف التعليمي (اسم الحرف موجود مسبقًا؛ هنا صوت الحرف):
   الحرف مع الفتحة/الضمة/الكسرة (تَ تُ تِ)، الساكن بهمزة قبله (أَتْ)، المشدّد مضاعفًا (أَتْتَ)، التنوين (تًا تٌ تٍ)،
   والمدود (تَا تُو تِي)، والحروف الإنجليزية الصغيرة. المفتاح هو نص الحرف كما يعالجه الموقع (say.parts) والمرسَل إلى Edge نص النطق.
   الاستعمال: ROOT=<المشروع> node letters.js > letters.json  ثم  PHR=letters.json python gen_edge.py  ثم  PHR=letters.json python pack.py <audio/clips> 61 append */
const {mkCtx,key}=require('./harness.js');
const c=mkCtx('male');
const BASE='بتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');
const F='َ',D='ُ',K='ِ',S='ْ',SH='ّ',TF='ً',TD='ٌ',TK='ٍ';
const forms=[];
for(const l of BASE){
 forms.push([l+F,l+F],[l+D,l+D],[l+K,l+K],[l+S,null], /* الساكن: الموقع يحوّله إلى «أَتْ» بنفسه */
  [l+SH+F,'أَ'+l+S+l+F],[l+TF,l+TF+'ا'],[l+TD,l+TD],[l+TK,l+TK],
  [l+F+'ا',l+F+'ا'],[l+D+'و',l+D+'و'],[l+K+'ي',l+K+'ي'])}
for(const h of ['أَ','أُ','إِ','ءَ','ءُ','ءِ'])forms.push([h,h]);
const out=new Map();
for(const [shown,speak] of forms){const parts=c.say.parts(shown,'ar');if(parts.length!==1)continue;const [t,l]=parts[0];out.set(key(t,l),[speak||t,l])}
for(const ch of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'){const [t,l]=c.say.parts(ch,'en')[0]||[];if(t)out.set(key(t,l),[t,l])}
if(require.main===module)process.stdout.write(JSON.stringify([...out.entries()]));
