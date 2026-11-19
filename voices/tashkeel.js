/* tashkeel.js — إكمال التشكيل الكامل (الفتحة والضمة والكسرة والسكون والشدّة والتنوين) للكلمات العربية.
   • قاموس مدمج (lex.js القديم + lex-ext.js الموسّع) يعمل دون إنترنت، ويتعلّم من إجابات الذكاء الاصطناعي المشكولة.
   • يفكّك السوابق الملتصقة: و/ف/ب/ك/ل + «ال» (مثل: وبالتشكيل، للمعلّم، والكتاب) ويبني التشكيل الصحيح بما فيه
     شدّة الحرف الشمسي وسكون لام القمرية (الْ) وإدغام «لل».
   • يُكمل الكلمات المشكولة جزئيًا (مثل «تعلّم» ← «تَعَلُّم») فقط إذا لم يتعارض مع ما كُتب.
   • لا يخمّن كلمة غير موجودة في القاموس. الكلمات المفردة تُترك بلا حركة إعراب أخيرة (وقف) إلا الوظيفية منها. */
(()=>{const DIA=/[\u064B-\u0652\u0670]/g,HAS=/[\u064B-\u0652\u0670]/,AW=/[\u0621-\u064A\u064B-\u0652\u0670]+/g,KEY='hrw-lex',CAP=4000;
let L={};try{L=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
const B=()=>window.LEXB||{},E=()=>window.LEXE||{},F=()=>window.LEXF||{},strip=w=>w.replace(DIA,''),nk=k=>k.replace(/[أإآٱ]/g,'ا');
const fix=w=>w.replace(/([\u064B-\u0650])\u0651/g,'\u0651$1');
const END=/[\u064B-\u0650]$/,SHAMS='تثدذرزسشصضطظلن',SH='\u0651',SK='\u0652',VOW=/[\u064B-\u0650]/;
/* قراءة من القاموس: الوظيفية ثابتة الحركة؛ وغيرها بلا حركة الإعراب الأخيرة */
/* هل الصيغة المخزّنة مكتملة التشكيل؟ (القاموس القديم فيه صيغ بشدّة فقط؛ نتجاهلها ونفكّك الكلمة بدلًا منها) */
function okw(v){const u=units(v);if(u.length<2)return true;
 for(let i=0;i<u.length-1;i++){const c=u[i][0],m=u[i][1],p=u[i-1];
  if('اىآٱ'.includes(c))continue;
  if(c==='و'&&!m&&p&&p[1].replace(SH,'').includes('\u064F'))continue;
  if(c==='ي'&&!m&&p&&p[1].replace(SH,'').includes('\u0650'))continue;
  if(c==='ل'&&!m&&((i===1&&u[0][0]==='ا')||(i===2&&u[1][0]==='ا')))continue;
  if(!m)return false}
 return true}
/* كل مدخل قد يحمل صيغًا بديلة مفصولة بـ | (مثل: يَحْفَظ|يُحْفَظ)؛ الأولى هي الافتراضية، والبقية تُستعمل لإكمال كلمة مشكولة جزئيًا بحسب ما كُتب فيها */
function lookAll(k){const kk=nk(k);const f=F()[k]||F()[kk];if(f)return[f];const x=E()[k]||E()[kk];if(x)return x.split('|');const bb=B()[k]||B()[kk];if(bb&&okw(bb))return[bb];const y=L[k]||L[kk];return y&&okw(y)?[y.replace(END,'')]:[]}
function look(k){return lookAll(k)[0]||null}
/* [حرف، حركاته] */
const units=w=>{const o=[];for(const ch of w){if(/[\u064B-\u0652\u0670]/.test(ch)){if(o.length)o[o.length-1][1]+=ch}else o.push([ch,''])}return o};
const join=u=>u.map(x=>x[0]+x[1]).join('');
/* «ال» + جذع مشكول: شمسية ← شدّة، قمرية ← سكون على اللام */
function article(stem){const u=units(stem);if(!u.length)return stem;const c=nk(u[0][0]);
 if(u[0][0]==='ا'&&u[0][1].includes('\u0650'))return 'الِ'+join([['ا','']].concat(u.slice(1))); /* الِاسْتِخْدَام: كسرة همزة الوصل تنتقل إلى اللام */

 if(SHAMS.includes(c)){if(!u[0][1].includes(SH))u[0][1]=SH+u[0][1];return 'ال'+join(u)}return 'الْ'+stem}
/* بعد حرف الجر يصير الاسم المضاف إلى ضمير مجرورًا: جِهَازُكَ ← جِهَازِكَ ، بَيْتُهُ ← بَيْتِهِ */
const SUF=/\u064F(كَ|كِ|كُمْ|كُمَا|كُنَّ|هُ|هَا|هُمْ|هُمَا|هُنَّ|نَا)$/;
function gen(r){return SUF.test(r)?r.replace(SUF,(m,x)=>'\u0650'+x.replace(/^هُ/,'هِ')):r}
const PREPS=new Set(['في','على','من','الى','إلى','عن','حتى','بعد','قبل','تحت','فوق','امام','أمام','خلف','مع','عند','لدى','بين','حول','خلال','ضمن','مثل','نحو','حسب','بدون','دون','عبر','ضد','لدي']);
/* سوابق: [الحروف، التشكيل، فيها «ال»؟] — الأطول أولًا */
const PR=[['وبال','وَبِ',1],['وكال','وَكَ',1],['وفال','وَفَ',1],['ولل','وَلِ',2],['وال','وَ',1],['فال','فَ',1],['بال','بِ',1],['كال','كَ',1],['لل','لِ',2],['ال','',1],
 ['وب','وَبِ'],['ول','وَلِ'],['وك','وَكَ'],['فب','فَبِ'],['ف','فَ'],['و','وَ'],['ب','بِ'],['ك','كَ'],['ل','لِ']];
/* لام التعليل + مضارع ← منصوب: لِتَسْمَعُهَا ← لِتَسْمَعَهَا */
const SUBJ=/ُ((?:هَا|هُ|هُمْ|كَ|كِ|كُمْ|نِي|نَا)?)$/;
function build1(p,r){
 if(p[1]==='لِ'&&!p[2]&&/^[يتن]/.test(units(r)[0][0])&&SUBJ.test(r))return p[1]+r.replace(SUBJ,'َ$1');
 if(/[بلك][\u064E\u0650]$/.test(p[1])&&!/^[يتنأا]/.test(units(r)[0][0])&&p[2]!==1)r=gen(r);
 if(p[2]===1)return p[1]+article(gen2(p,r));
 if(p[2]===2){const u0=units(r);if(u0[0][0]==='ا'&&u0[0][1].includes('\u0650'))return p[1]+'لِ'+join([['ا','']].concat(u0.slice(1)));const c=nk(u0[0][0]);if(SHAMS.includes(c)){const u=units(r);if(!u[0][1].includes(SH))u[0][1]=SH+u[0][1];return p[1]+'ل'+join(u)}return p[1]+'لْ'+r}
 return p[1]+r}
function gen2(p,r){return /[بلك][\u064E\u0650]$/.test(p[1])||p[2]===2?gen(r):r}
function build(p,rest){let c=lookAll(rest);if(p[2])c=c.filter(r=>!/\u0652$/.test(r));return c.map(r=>build1(p,r))}
function fullAll(k){let r=lookAll(k);if(r.length)return r;
 for(const p of PR){if(k.length>p[0].length+1&&k.startsWith(p[0])){r=build(p,k.slice(p[0].length));if(r.length)return r}}
 return[]}
function full(k){return fullAll(k)[0]||null}
/* دمج كلمة جزئية مع صيغة كاملة: لا نغيّر إلا إذا كانت كل حركة مكتوبة موجودة في الصيغة الكاملة */
function merge(w,f){const a=units(w),b=units(f);if(a.length!==b.length)return null;const o=[];
 for(let i=0;i<a.length;i++){if(nk(a[i][0])!==nk(b[i][0]))return null;const m=[...a[i][1]],fm=b[i][1];
  if(i===a.length-1){o.push([b[i][0]===a[i][0]?a[i][0]:a[i][0],a[i][1]||fm]);continue}
  if(!m.every(x=>fm.includes(x)))return null;o.push([a[i][0],fm.length>=a[i][1].length?fm:a[i][1]])}
 return join(o)}
/* سكون لام «الْ» القمرية وشدّة الشمسية في كل كلمة (مكتوبة أو مولَّدة) */
const LUN='ابجحخعغفقكمهويءأإآ';
function fixArt(w){const u=units(w);if(u.length<4)return w;
 let i=0;const okPre=(x,k)=>{const m=x[1].replace(SH,'');return('وف'.includes(x[0])&&m==='\u064E')||(x[0]==='ب'&&m==='\u0650')||(x[0]==='ك'&&m==='\u064E')||(x[0]==='ل'&&m==='\u0650')};
 if(u[0][0]==='ا'||u[0][0]==='ٱ')i=0;else if(okPre(u[0])&&u[1]&&u[1][0]==='ا')i=1;else if(u.length>5&&okPre(u[0])&&okPre(u[1])&&u[2][0]==='ا')i=2;else return w;
 const a=u[i],l=u[i+1],n=u[i+2];if(!l||!n||a[0]!=='ا'&&a[0]!=='ٱ'||a[1]||l[0]!=='ل'||l[1])return w;
 if(!VOW.test(n[1])&&!n[1].includes(SH))return w;
 const c=nk(n[0]);if(SHAMS.includes(c)){if(!n[1].includes(SH))n[1]=SH+n[1];return join(u)}
 if(LUN.includes(n[0])||LUN.includes(c)){l[1]=SK;return join(u)}return w}
function word(w){let r;
 if(HAS.test(w)){const k=strip(w);if(k.length>=2){for(const f of fullAll(k)){const m=merge(w,f);if(m)return fixArt(fix(m))}}return fixArt(w)}
 const k=w;if(k.length<2&&!/[وفبلك]/.test(k))return w;
 r=full(k);return r?fixArt(r):w}
/* تنوين الفتح يُكتب على الحرف قبل الألف (كِتَابًا): ننقله إن كُتب على الألف، ونحذف التكرار */
function tanwinAlif(w){const u=units(w),n=u.length;if(n<2)return w;const L=u[n-1];if(L[0]!=='ا'||!L[1].includes('\u064B'))return w;
 L[1]=L[1].replace('\u064B','');const p=u[n-2];if(!p[1].includes('\u064B'))p[1]=p[1].replace(/[\u064E-\u0650\u0652]/g,'')+'\u064B';return join(u)}
/* همزة الوصل داخل الجملة: لا تُنطق بعد كلمة متصلة بها، والساكن قبلها يُحرَّك (مِنَ الْ، عَنِ الْ، أَوِ اخْتَرْ، هُمُ الْ، اخْتَرِ الْ).
   كانت تُكتب «مِنْ الْقَائِمَة» و«أَوْ اِضْغَطْ» فيقرؤها المحرك بقطع الهمزة. */
const WV=/(^|[^\u0621-\u064A\u064B-\u0652\u0670])([\u0621-\u064A\u064B-\u0652\u0670]*?)([\u0621-\u064A]\u0651?)\u0652([ \u00A0]+)ا[\u0650\u064F]?(?=ل|[\u0621-\u064A]\u0651?\u0652)/g;
const WK=/([\u0621-\u064A\u064B-\u0652\u0670][ \u00A0]+|(?:^|[^\u0621-\u064A\u064B-\u0652\u0670])[وف]\u064E)ا[\u0650\u064F](?=ل|[\u0621-\u064A]\u0651?\u0652)/g;
function wasl(s){return s.replace(WV,(m,a,w,c,sp,o,str)=>{const nx=str.slice(o+m.length,o+m.length+1);const v=(w+c==='مِن'&&nx==='ل')?'\u064E':/\u064Fم$/.test(w+c)?'\u064F':'\u0650';return a+w+c+v+sp+'ا'}).replace(WK,'$1ا')}
function apply(t){let prev='';return wasl(String(t==null?'':t).replace(AW,w=>{let r=tanwinAlif(word(w));const b=strip(w);if(PREPS.has(prev)&&HAS.test(r))r=gen(r);prev=b;return r}))}
function learn(t){let n=0;try{for(const w of String(t).match(AW)||[]){const k=strip(w);if(k.length<2||!HAS.test(w))continue;
  const letters=k.length,d=(w.match(DIA)||[]).length;if(d<Math.ceil(letters*.6))continue;
  const f=fix(w);if(!B()[k]&&!E()[k]&&L[k]!==f){if(Object.keys(L).length>=CAP)delete L[Object.keys(L)[0]];L[k]=f;n++}}
  if(n)localStorage.setItem(KEY,JSON.stringify(L))}catch(e){}return n}
function ratio(t){const ws=String(t).match(AW)||[];if(!ws.length)return 1;return ws.filter(w=>HAS.test(w)||w.length<2).length/ws.length}
/* تنوين أسماء الدروس المصوّرة (بَقَرَةٌ، أَسَدٌ…): الكلمة المفردة الموقوف عليها كانت تُنطق «بَقَرَهْ» فتُسمع «بَقَر».
   القاعدة: الاسم النكرة المفرد يأخذ تنوين الضم؛ الممنوع من الصرف يأخذ ضمة بلا تنوين (الألوان أَفْعَل، فَعْلَاء، مَفَاعِل)؛
   لا يُغيَّر ما فيه «ال» أو ما آخره علامة أصلًا (الأفعال المشكولة) أو حرف مدّ (حَلْوَى، مَانْجُو، يُسَاوِي)؛ المثنى بكسر النون. */
const COLORS=new Set(['احمر','ازرق','اخضر','اصفر','اسود','ابيض','اسمر','اشقر','ابيض']);
function nunate(w){w=String(w||'').trim();if(!w||/\s/.test(w)||!/[ء-ي]/.test(w))return w;const u=units(w),n=u.length,k=nk(strip(w));
 if(n<2||/^ال/.test(k))return w;const L=u[n-1],mk=L[1].replace(SH,'');if(/[ً-ْ]/.test(mk))return w;
 const pv=u[n-2];
 if('اى'.includes(L[0])||(L[0]==='و'&&pv[1].includes('ُ')&&!L[1].includes(SH))||(L[0]==='ي'&&pv[1].includes('ِ')&&!L[1].includes(SH)))return w;
 const D='ُ';
 if(COLORS.has(k))return w+D;
 if(L[0]==='ء'&&pv[0]==='ا'&&u[1]&&u[1][1].includes(SK))return w+D;                       /* فَعْلَاء: صَحْرَاءُ */
 if(n>=5&&n<=6&&u[0][1].includes('\u064E')&&u[2][0]==='ا'&&u[3][1].includes('ِ')&&!'ةي'.includes(L[0]))return w+D;   /* مَفَاعِل/مَفَاعِيل: طَمَاطِمُ */
 if(/^اثن(تان|ان)$/.test(k))return w+'ِ';                                              /* المثنى: اِثْنَتَانِ */
 return w+'ٌ'}
/* يُطبَّق مرة واحدة على كلمات الدروس العربية المصوّرة (فيشمل البطاقات والاختبارات والألعاب التي تأخذ كلماتها منها) */
try{const EMJ=/\p{Extended_Pictographic}/u,MV={};for(const st of S)for(const un of st.u)if(un.l==='ar')for(const it of un.i)if(EMJ.test(String(it[1]))){const o=it[0],n=nunate(o);if(n!==o){it[0]=n;MV[o]=n}}
 /* إتقان كل كلمة محفوظ باسمها (P.sk): ننقله إلى الصيغة المنوّنة كي لا يضيع تقدّم الطالب */
 const D=window.DB;if(D&&D.kids)for(const kd of D.kids){const sk=kd&&kd.sk;if(sk)for(const o in MV)if(sk[o]){if(!sk[MV[o]])sk[MV[o]]=sk[o];delete sk[o]}}}catch(e){}
window.Tashkeel={apply,learn,ratio,size:()=>Object.keys(L).length,full,fixArt,nunate};
})();
