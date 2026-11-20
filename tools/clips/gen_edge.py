# توليد مقاطع بومي بخدمة Edge TTS (أصوات Microsoft العصبية) — نسخة لكل معلّم/معلّمة
import asyncio, json, os, sys, subprocess, edge_tts
W=os.path.dirname(os.path.abspath(__file__))
# B (اختيار صاحب المشروع): سرعة عادية، وصل الكلمات داخل الجملة، وأصوات Ava/Andrew الطبيعية (Multilingual)
# المعلّم يبقى بصوته الأصلي (طلب صاحب المشروع): أي مقاطع جديدة له تُسجَّل بإعداداته الأصلية كي تطابق صوته الحالي
VOICES={'female':{'ar':'ar-SA-ZariyahNeural','en':'en-US-AvaMultilingualNeural'},'male':{'ar':'ar-SA-HamedNeural','en':'en-US-AndrewNeural'}}
RATES={'female':{'ar':'+0%','en':'+0%'},'male':{'ar':'-8%','en':'-10%'}}
# الكلمات المفردة (عربية بتنوين، وإنجليزية قصيرة ≤٣ كلمات) تُسجَّل أبطأ لتكون واضحة: RATES_JSON='{"male":{...},"female":{...}}'
if os.environ.get('RATES_JSON'):RATES=json.loads(os.environ['RATES_JSON'])
import re
# سكون آخر الكلمة داخل الجملة يجعل المحرك يقف بعد كل كلمة (نطق آلي): نحذفه إذا تلته كلمة عربية بلا علامة ترقيم، ويبقى في آخر الجملة
def natural(t,l):
    return re.sub(r'([\u0621-\u064A][\u064B-\u0651]?)\u0652(?=[ \u00A0]+[\u0621-\u064A])',r'\1',t) if l=='ar' else t
# الكلمة المنفردة المنوّنة بالضم أو الكسر: المحرك قد يقف عليها فيُسقط التنوين (ذُرَه بدل ذُرَتُن)، فنكتب له النون صريحة.
# المفتاح يبقى بالنص المشكول (ذُرَةٌ)، والذي يُرسل للمحرك فقط هو ذُرَتُنْ / قَلْبُنْ / بَيْتِنْ. تنوين الفتح (شُكْرًا) يبقى كما هو.
def _nun(w):
    sh=w.endswith('\u0651') and len(w)>1 and w[-2] in '\u064C\u064D'
    if sh: w=w[:-2]+'\u0651'+w[-2]  # دُبٌّ: الشدة قبل التنوين
    if not re.search(r'[\u064C\u064D]$',w): return w
    v='\u064F' if w.endswith('\u064C') else '\u0650'
    w=w[:-1]
    if w.endswith('\u0629'): w=w[:-1]+'\u062A'
    return w+v+'\u0646\u0652'
# الصوتان (Hamed وZariyah) يُسقطان النون تمامًا عند الوقف حتى لو كُتبت صريحة (قَلْبٌ = قَلْبُنْ = قَلْبْ في الصوت، بالقياس)،
# ويُظهرها فقط إذا كانت مشدّدة ساكنة: قَلْبُنّْ (قياس: +0.2 ثانية ونون أنفية واضحة). داخل الجملة ينطق التنوين صحيحًا فلا نغيّره.
STOPC=r'(?=\s*(?:[.!؟?،,:;؛]|$))'
def tanween_male(t,l):
    if l!='ar': return t
    def f(m):
        w=m.group(0);sh=w.endswith('\u0651') and w[-2] in '\u064C\u064D'
        if sh: w=w[:-2]+'\u0651'+w[-2]
        v='\u064F' if w.endswith('\u064C') else '\u0650';w=w[:-1]
        if w.endswith('\u0629'): w=w[:-1]+'\u062A'
        return w+v+'\u0646\u0651\u0652'
    t=re.sub(r'[\u0621-\u064A][\u0621-\u064A\u064B-\u0652\u0670]*[\u064C\u064D]\u0651?'+STOPC,f,t)
    # تنوين الفتح على التاء المربوطة قبل الوقف («مَدْرَسَةً»): المحرك يقف عليها هاءً فيُسقط النون تمامًا (قياس الطاقة الأنفية 0.17 ← 0.53)،
    # فنكتب له «مَدْرَسَتَنّْ». بقية تنوين الفتح (كِتَابًا، وَلَدًا) ينطقها بنون أصلًا فلا نغيّرها. المفتاح يبقى بالنص المشكول.
    return re.sub(r'\u0629\u064B'+STOPC,'\u062A\u064E\u0646\u0651\u0652',t)
# لفظ الجلالة: المحرك ينطق «اللَّه» بلام مفتوحة قصيرة (0.38 ث، كأنها «اللَه»). نكتب له الألف صريحة (اللَّاه، 0.5 ث، والتعرّف يسمع «الله»)،
# وعند الوقف بسكون (اللَّاهْ) لأن «اللَّاهُ» وحدها تشوّشت. للمحرك فقط؛ النص المعروض ومفاتيح المقاطع بلا تغيير.
def allah(t,l):
    if l!='ar': return t
    G=r'(ل\u0650?)ل(?:\u0651\u064E|\u064E\u0651)ه([\u064F\u0650\u064E]?)'  # الشدة والفتحة بأي ترتيب
    t=re.sub(G+STOPC,lambda m:m.group(1)+'ل\u0651\u064Eا\u0647\u0652',t)
    return re.sub(G,lambda m:m.group(1)+'ل\u0651\u064Eا\u0647'+m.group(2),t)
def tanween(t,l):
    # كل كلمة منوّنة بالضم أو الكسر (منفردة أو في جملة) تُرسل للمحرك بالنون صريحة كي لا يقف عليها فيُسقطها
    if l!='ar': return t
    return re.sub(r'[\u0621-\u064A][\u0621-\u064A\u064B-\u0652\u0670]*[\u064C\u064D]\u0651?(?![\u0621-\u064A\u064B-\u0652])',lambda m:_nun(m.group(0)),t)
PROXY=os.environ.get('HTTPS_PROXY')
WHOS=os.environ.get('WHO','female,male').split(',')  # WHO=female لتسجيل صوت المعلّمة وحده
phr=json.load(open(os.environ.get('PHR') or os.path.join(W,'final.json')))
async def one(who,k,t,l,sem,stat):
    out=os.path.join(W,'out',who,k+'.mp3')
    if os.path.exists(out) and os.path.getsize(out)>500: stat['skip']+=1; return
    raw=out+'.raw.mp3'
    async with sem:
        for a in range(5):
            try:
                c=edge_tts.Communicate(natural(allah(tanween_male(t,l),l),l) if who=='female' else allah(tanween_male(t,l),l),VOICES[who][l],rate=RATES[who][l],proxy=PROXY)
                await c.save(raw)
                if os.path.getsize(raw)<300: raise Exception('small')
                break
            except Exception as e:
                await asyncio.sleep(2+3*a)
        else:
            stat['fail']+=1; open(os.path.join(W,'fail.txt'),'a').write(f'{who}\t{k}\t{l}\t{t}\n'); return
        # قصّ الصمت في البداية والنهاية (يبدأ الصوت فورًا)
        p=await asyncio.create_subprocess_exec('ffmpeg','-v','error','-y','-i',raw,'-af',
          'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse',
          '-ac','1','-ar','24000','-c:a','libmp3lame','-b:a','48k','-write_xing','0','-id3v2_version','0',out+'.tmp.mp3')
        await p.wait()
        if p.returncode==0 and os.path.getsize(out+'.tmp.mp3')>300: os.replace(out+'.tmp.mp3',out)
        else: os.replace(raw,out)
        try: os.remove(raw)
        except: pass
        stat['ok']+=1
        n=stat['ok']+stat['fail']
        if n%100==0: open(os.path.join(W,'progress.txt'),'w').write(json.dumps(stat))
async def main():
    sem=asyncio.Semaphore(int(os.environ.get('CONC','8')))
    stat={'ok':0,'skip':0,'fail':0,'total':len(phr)*len(WHOS)}
    for who in WHOS: os.makedirs(os.path.join(W,'out',who),exist_ok=True)
    jobs=[one(who,k,t,l,sem,stat) for who in WHOS for k,(t,l) in phr]
    await asyncio.gather(*jobs)
    stat['done']=1; open(os.path.join(W,'progress.txt'),'w').write(json.dumps(stat))
asyncio.run(main())
