const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=process.env.ROOT;
function mkCtx(gender){
 const store={};
 const el=()=>({classList:{toggle(){},add(){},remove(){}},addEventListener(){},setAttribute(){},style:{},appendChild(){},querySelectorAll:()=>[]});
 const w={console,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},Date,Math,JSON,String,Object,Array,RegExp,Promise,Map,Set,Number,Boolean,Error,
  localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem(k){delete store[k]}},
  document:{addEventListener(){},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],createElement:el,body:el(),documentElement:el(),dispatchEvent(){}},
  navigator:{userAgent:'node'},MutationObserver:function(){this.observe=()=>{};this.disconnect=()=>{}},requestAnimationFrame:()=>0,location:{href:'http://x/',pathname:'/'},Event:function(){},addEventListener(){},
  P:{teacher:'female',gender},save(){}};
 w.window=w;w.self=w;w.globalThis=w;
 const ctx=vm.createContext(w);
 /* phase9.js: تحويل الخطاب حسب جنس الطالب (اضغطي، أحسنتِ…) كما يحدث في الموقع، فتُسجَّل صيغ الطالبات أيضًا */
 /* بيانات الدروس ونصوص الكورس ومعاني الإنجليزية بالترتيب نفسه في index.html: منها يُعرف أي كلمة منفردة تُنطق منوّنة (Tashkeel.nunWord) */
 for(const f of ['app.js','content1.js','content2.js','content3.js','content4.js','content5.js','content6.js','content7.js','voices/lex.js','voices/lex-ext.js','voices/tashkeel.js','voices/pron.js','voice.js','phase9.js','course-text-data.js','course-text-data2.js','course-text-data3.js','course-text-data4.js','mind/english.js']){
  try{vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f})}catch(e){if(!/app\.js$/.test(f))console.error('ERR',f,e.message)}}
 return ctx;
}
const key=(t,l)=>{const s=((l==='ar'?'ar':'en')+'|'+String(t||'').replace(/\s+/g,' ').trim()).normalize('NFC');let h=0x811c9dc5;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(36)+'_'+s.length.toString(36)};
module.exports={mkCtx,key};
