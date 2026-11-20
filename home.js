/* home.js — الصفحة الرئيسية بتصميم الصور + معلم محلي (بومي) يقترح الدرس الأنسب */
const SFX=()=>{}; /* بلا صوت نقرة عند التنقل */
/* النطق يتولاه voice.js من مقاطع Edge المسجّلة — لا يوجد صوت جهاز */
/* مؤثرات الواجهة المحلية تُدار من sounds.js. */
const oldH=h;h=x=>{document.body.classList.toggle('hm',V=='home'||V=='sec');oldH(x)};
const goTo=id=>{const e=document.getElementById(id);e&&e.scrollIntoView({behavior:'smooth'})};
function coach(){/* يختار أضعف درس من نتائج الطالب المحفوظة */
const us=units(P.stage),pend=us.filter(u=>!P.done[u.id]),sc=us.filter(u=>P.sc[u.id]!=null).sort((a,b)=>P.sc[a.id]-P.sc[b.id]);
const u=sc.length&&P.sc[sc[0].id]<4?sc[0]:pend[0]||us[0];
return u?{u,t:sc.length&&P.sc[u.id]<4?`لاحظتُ أنك تحتاج مراجعة "${u.n}". هيا نتدرّب عليها!`:`جاهز لدرس جديد؟ لنبدأ "${u.n}"`}:null}
