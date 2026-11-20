/* أصوات محلية مدمجة: لا تنزيل للنماذج ولا اتصال مطلوب بعد فتح التطبيق. */
(()=>{
 'use strict';
 const files={tap:'audio/tap.wav',select:'audio/select.wav',correct:'audio/correct.wav',wrong:'audio/wrong.wav',finish:'audio/finish.wav'};
 const clips=Object.fromEntries(Object.entries(files).map(([k,src])=>{const a=new Audio(src);a.preload='auto';return[k,a]}));
 const volume=()=>{const v=window.P&&P.vol;return Math.max(.08,Math.min(.48,v==null?.28:+v*.36))};
 const play=k=>{const a=clips[k]||clips.tap;if(!a||window.P&&P.sfx===0)return;try{const n=a.cloneNode();n.volume=volume();n.play().catch(()=>{})}catch(e){}};
 window.HurufiSound={play,clips};
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||b.classList.contains('course-practice-launch'))return;if(b.classList.contains('opt'))play('select')},true); /* أُزيل صوت النقرة «تشك» من التنقل والأزرار العادية (طلب صاحب المشروع)؛ يبقى صوت اختيار الإجابة */
 /* نعيد أي إعداد سابق إلى صوت الجهاز؛ لا توجد نماذج صوت للتنزيل. */
 if(window.P&&P.tts!=='device'){P.tts='device';try{save()}catch(e){}};
 window.pickT=()=>{};
})();
