/* pron.js — تطابق المكتوب مع المسموع (مصدر واحد للقاعدة يستخدمه العرض والنطق معًا).
   المشكلة: محركات النطق تُسقط الشدّة في آخر الكلمة (دُبّ ← «دُب»)، وتُخمّن تنوينًا أو حركة لآخر كلمة بلا علامة،
   وتقف بالسكون على الضمة والكسرة في نهاية الجملة. فيظهر للطفل شيء ويسمع شيئًا آخر.
   الحل — صيغة موحّدة (canon) تُعرض كما هي، ثم تُكتب للمحرك بطريقة تُجبره على نطقها حرفيًا:
   • آخر حرف ساكن بلا علامة ← يُكتب له سكون ظاهر (بَيْتْ)، فلا يخمّن المحرك حركة أو تنوينًا.
   • الضمة/الكسرة في آخر الجملة (موضع الوقف) ← سكون، لأن هذا ما يُنطق فعلًا عند الوقف.
   • التنوين يبقى ظاهرًا، ويُنطق صريحًا: كِتَابٌ ← «كِتَابُنْ»، كِتَابًا ← «كِتَابَنْ»، شَجَرَةٌ ← «شَجَرَتُنْ».
   • الشدّة في آخر الكلمة تبقى ظاهرة، وتُنطق مضاعفة: دُبّ ← «دُبْبْ».
   القاعدة ثابتة (تطبيقها مرتين لا يغيّر شيئًا)، ولا تمس الكلمات غير المشكولة ولا الحروف المفردة. */
(()=>{
'use strict';
const SH='ّ',SK='ْ',FA='َ',DA='ُ',KA='ِ',TF='ً',TD='ٌ',TK='ٍ';
const isMark=c=>c>='ً'&&c<='ْ'||c==='ٰ';
const LET=/[ء-يٱ]/;
const WORD=/[ء-يٱ][ء-يٱً-ْٰ]*/g;
const units=w=>{const o=[];for(const ch of w){if(isMark(ch)){if(o.length)o[o.length-1][1]+=ch}else o.push([ch,''])}return o};
/* ترتيب ثابت للعلامات: الشدّة ثم الحركة (ما تفهمه المحركات وما يُعرض بشكل صحيح) */
const ord=m=>{const s=m.includes(SH)?SH:'',v=m.replace(SH,'');return s+v};
const join=u=>u.map(x=>x[0]+ord(x[1])).join('');
/* هل للكلمة تشكيل أصلًا؟ لا نلمس الكلمات غير المشكولة (أسماء، كلمات أجنبية بحروف عربية…) */
const voweled=u=>u.some(x=>x[1]);
function canonWord(w,final){const u=units(w);if(u.length<2||!voweled(u))return w;
 const L=u[u.length-1],p=u[u.length-2],c=L[0],m=L[1],v=m.replace(SH,'');
 /* أواخر لا تحمل علامة: الألف (ومنها ألف تنوين الفتح)، الألف المقصورة */
 if(c==='ا'||c==='ى'||c==='آ'||c==='ٱ')return join(u);
 /* التاء المربوطة: عند الوقف تُنطق هاءً ساكنة، فنحذف الحركة/السكون منها (والتنوين يبقى) */
 if(c==='ة'){if(m===SK||(final&&(v===DA||v===KA||v===FA)))L[1]='';return join(u)}
 /* حروف المد: واو بعد ضمة، ياء بعد كسرة */
 if(!m&&((c==='و'&&p[1].includes(DA))||(c==='ي'&&p[1].includes(KA))))return join(u);
 /* السكون للوقف فقط (آخر الجملة أو قبل علامة ترقيم)؛ في وسط الجملة تبقى بلا علامة كي لا تُقرأ «تَمْرِينْ جَدِيدْ» */
 if(!m){if(final)L[1]=SK;return join(u)}
 /* ضمير المخاطبة المؤنثة: «أَنْتِ، أَحْسَنْتِ، لَكِ، مَعَكِ» — كسرتها تميّز المؤنث فلا تُسكَّن عند الوقف */
 if(final&&v===KA&&((c==='ت'&&p[1]&&p[1].includes(SK))||c==='ك'))return join(u);
 if(final&&(v===DA||v===KA)){L[1]=m.includes(SH)?SH:SK;return join(u)}
 return join(u)}
/* حدّ الوقف: نهاية النص، أو علامة ترقيم، أو انتقال إلى غير العربية (رمز/إنجليزي) */
const STOP=/^\s*($|[.!؟?،,؛;:\n)»\]}\-–—…•|/🌟⭐✨💪👏🎉😊🙂✅❌]|[A-Za-z0-9\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}])/u;
function canon(text,endFinal){const s=String(text==null?'':text);if(!LET.test(s))return s;
 return s.replace(WORD,(w,i)=>{const rest=s.slice(i+w.length);const fin=rest.trim()===''?endFinal!==false:STOP.test(rest);return canonWord(w,fin)})}
/* للنطق فقط: إجبار المحرك على ما هو مكتوب */
function speakWord(w){const u=units(w);if(u.length<2||!voweled(u))return w;
 const n=u.length;let L=u[n-1];
 /* تنوين الفتح على الحرف قبل الألف/الألف المقصورة: كِتَابًا ، هُدًى */
 if((L[0]==='ا'||L[0]==='ى')&&!L[1]&&u[n-2][1].includes(TF)){const q=u[n-2];q[1]=q[1].replace(TF,FA);u.pop();return join(u)+'ن'+SK}
 const m=L[1];
 if(m.includes(TD)||m.includes(TK)||m.includes(TF)){const vv=m.includes(TD)?DA:m.includes(TK)?KA:FA;L[1]=(m.includes(SH)?SH:'')+vv;if(L[0]==='ة')L[0]='ت';return join(u)+'ن'+SK}
 /* شدّة في الآخر بلا حركة: نضاعف الحرف بسكونين */
 if(m.replace(SK,'')===SH){L[1]=SK;return join(u)+L[0]+SK}
 return w}
function speech(text){return canon(text,true).replace(WORD,speakWord)}
window.Pron={canon,display:canon,speech,canonWord,speakWord};
})();
