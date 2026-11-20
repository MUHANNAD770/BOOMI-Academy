/* tts.mjs — نطق جملة كاملة بسلاسة عند عدم وجود مقطع مسجّل لها (بدل تركيبها كلمةً كلمةً، أو السكوت).
   نفس الصوتين والإعدادات المستعملة في تسجيل المقاطع (tools/clips/gen_edge.py):
     المعلّم: ar-SA-HamedNeural ‎-8٪ (والإنجليزية Andrew ‎-10٪) · المعلّمة: ar-SA-ZariyahNeural (والإنجليزية Ava Multilingual).
   وبالقواعد نفسها: التنوين قبل الوقف بنون واضحة «ـُنّْ»، ولفظ الجلالة «اللَّاه».
   كل نتيجة تُحفظ (Netlify Blobs) فلا تُولَّد الجملة مرتين، ويُخزّنها المتصفح أيضًا (الرابط ثابت لكل نص).
   GET /.netlify/functions/tts?w=male|female&l=ar|en&t=<النص>  ← audio/mpeg */
import WebSocket from 'ws';
import {createHash,randomUUID} from 'node:crypto';
import {getStore} from '@netlify/blobs';
import {secMsGec,TRUSTED_CLIENT_TOKEN} from './lib/edge-gec.mjs';
const VOICES={male:{ar:['ar-SA-HamedNeural','-8%'],en:['en-US-AndrewNeural','-10%']},female:{ar:['ar-SA-ZariyahNeural','+0%'],en:['en-US-AvaMultilingualNeural','+0%']}};
const CHROME='143.0.3650.75',MAXLEN=700;
const STOPC='(?=\\s*(?:[.!؟?،,:;؛]|$))';
/* مطابقة gen_edge.py: التنوين بالضم/الكسر قبل الوقف ← «ـُنّْ» (المحرك يُسقط النون وإلا) */
function tanween(t){return t.replace(new RegExp('[\\u0621-\\u064A][\\u0621-\\u064A\\u064B-\\u0652\\u0670]*[\\u064C\\u064D]\\u0651?'+STOPC,'g'),w=>{
 if(w.endsWith('ّ')&&'ٌٍ'.includes(w[w.length-2]))w=w.slice(0,-2)+'ّ'+w[w.length-2];
 const v=w.endsWith('ٌ')?'ُ':'ِ';w=w.slice(0,-1);if(w.endsWith('ة'))w=w.slice(0,-1)+'ت';return w+v+'نّْ'}).replace(new RegExp('ة\u064B'+STOPC,'g'),'تَنّْ')} /* «مَدْرَسَةً» قبل الوقف ← «مَدْرَسَتَنّْ» (مثل gen_edge.py) */
/* التاء المربوطة بلا حركة وبعدها كلمة (وصل): المحرك ينطقها هاءً («صُورَه حَاسُوب»). نكتبها تاءً: ساكنة («صُورَتْ حَاسُوب»)،
   أو مكسورة قبل همزة الوصل لالتقاء الساكنين («لُغَتِ الصَّفّ»). عند الوقف تبقى هاءً كما في القاعدة. للمحرك فقط؛ النص المعروض كما هو. */
function tamarbuta(t){return t.replace(/\u0629(?=[ \u00A0]+[\u0627\u0671])/g,'\u062a\u0650').replace(/\u0629(?=[ \u00A0]+[\u0621-\u064A])/g,'\u062a\u0652')}
function allah(t){const G='(ل\\u0650?)ل(?:\\u0651\\u064E|\\u064E\\u0651)ه([\\u064F\\u0650\\u064E]?)';
 t=t.replace(new RegExp(G+STOPC,'g'),(m,a)=>a+'لَّاهْ');return t.replace(new RegExp(G,'g'),(m,a,v)=>a+'لَّاه'+v)}
/* المعلّمة: سكون آخر الكلمة داخل الجملة يجعل المحرك يقف بعد كل كلمة */
const natural=t=>t.replace(/([ء-ي][ً-ّ]?)ْ(?=[  ]+[ء-ي])/g,'$1');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
function synth(text,voice,rate){return new Promise((resolve,reject)=>{
 const url=`wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${randomUUID().replace(/-/g,'')}&Sec-MS-GEC=${secMsGec()}&Sec-MS-GEC-Version=2-${CHROME}`;
 const ws=new WebSocket(url,{headers:{Pragma:'no-cache','Cache-Control':'no-cache',Origin:'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
  'User-Agent':`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0`,Cookie:`muid=${randomUUID().replace(/-/g,'').toUpperCase()};`},
  ...(globalThis.__ttsAgent?{agent:globalThis.__ttsAgent}:{})});
 const chunks=[];const tm=setTimeout(()=>{try{ws.terminate()}catch(e){}reject(new Error('timeout'))},15000);
 ws.on('open',()=>{const ts=new Date().toUTCString();
  ws.send(`X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);
  ws.send(`X-RequestId:${randomUUID().replace(/-/g,'')}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}Z\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='+0Hz' rate='${rate}' volume='+0%'>${esc(text)}</prosody></voice></speak>`)});
 ws.on('message',(data,isBin)=>{if(isBin){const b=Buffer.from(data),hl=b.readUInt16BE(0),head=b.subarray(2,2+hl).toString();if(/Path:audio/.test(head))chunks.push(b.subarray(2+hl))}
  else if(/Path:turn\.end/.test(String(data))){clearTimeout(tm);ws.close();resolve(Buffer.concat(chunks))}});
 ws.on('error',e=>{clearTimeout(tm);reject(e)});ws.on('unexpected-response',(q,r)=>{clearTimeout(tm);reject(new Error('http '+r.statusCode))})})}
const HITS=new Map();
const limited=ip=>{const now=Date.now(),a=(HITS.get(ip)||[]).filter(t=>now-t<60000);a.push(now);HITS.set(ip,a);if(HITS.size>5000)HITS.clear();return a.length>40};
export default async req=>{
 const u=new URL(req.url),who=u.searchParams.get('w')==='female'?'female':'male',l=u.searchParams.get('l')==='en'?'en':'ar';
 let t=String(u.searchParams.get('t')||'').replace(/\s+/g,' ').trim().normalize('NFC');
 if(!t||t.length>MAXLEN||!/[\p{L}\p{N}]/u.test(t))return new Response('bad',{status:400});
 const k=createHash('sha1').update(who+'|'+l+'|'+t).digest('hex');let store=null;
 try{store=getStore('tts-cache');const hit=await store.get(k,{type:'arrayBuffer'});if(hit)return audio(hit,'hit')}catch(e){store=null}
 const ip=req.headers.get('x-nf-client-connection-ip')||'x';if(limited(ip))return new Response('rate',{status:429});
 let [voice,rate]=VOICES[who][l];let x=t;
 /* كلمة مفردة (عربية منوّنة، أو إنجليزية ≤٣ كلمات): أبطأ لتكون واضحة — مثل المقاطع المسجّلة */
 const one=t.replace(/[.!?؟،]+$/,'').trim();if(l==='en'&&one.split(/\s+/).length<=3)rate=who==='male'?'-35%':'-20%';else if(l==='ar'&&!/\s/.test(one)&&/[\u064B-\u064D]\u0651?$/.test(one))rate=who==='male'?'-25%':'-15%';if(l==='ar'){x=allah(tanween(tamarbuta(x)));if(who==='female')x=natural(x)}
 try{const mp3=await synth(x,voice,rate);if(!mp3.length)return new Response('empty',{status:502});
  if(store)try{await store.set(k,mp3)}catch(e){}return audio(mp3,'miss')}catch(e){return new Response('tts '+e.message,{status:502})}};
const audio=(b,c)=>new Response(b,{status:200,headers:{'content-type':'audio/mpeg','cache-control':'public, max-age=31536000, immutable','x-tts-cache':c}});
export {synth,tanween,allah,tamarbuta};
