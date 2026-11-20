# syl_list.py — مقاطع «حرف + حركة» بصوت واضح (اختيار صاحب المشروع: الصوت رقم ٩ ar-QA-MoazNeural)
# المحرك ينطق المقطع المنفرد ضعيفًا (تكاد الحركة تختفي)، لكنه ينطقه واضحًا داخل قائمة كما يقرأ المعلّم للطالب:
#   «بَ ، بِ ، بُ ، أَبْ ، أَبَّ»  ثم نقسم التسجيل عند الوقفات إلى خمسة مقاطع.
# الاستعمال: ROOT=<المشروع> node -e ... > syl.json (المفاتيح لكل حرف بالترتيب: فتحة، كسرة، ضمة، سكون، شدة)
#            python syl_list.py syl.json <مجلد الإخراج>   ← out/male/<key>.mp3 و out/female/<key>.mp3 (الصوت نفسه للمعلّم والمعلّمة)
import asyncio,edge_tts,os,sys,json,subprocess,numpy as np
P=os.environ.get('HTTPS_PROXY');SR=24000;VOICE=os.environ.get('SYL_VOICE','ar-QA-MoazNeural')
def load(f):
    b=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar',str(SR),'-f','s16le','-'],capture_output=True).stdout
    return np.frombuffer(b,np.int16).astype(np.float32)/32768
def split(x,n):
    h=120;w=240;e=np.array([np.sqrt(np.mean(x[i:i+w]**2)) for i in range(0,max(1,len(x)-w),h)]);thr=e.max()*0.04;on=e>thr
    segs=[];i=0
    while i<len(on):
        if on[i]:
            j=i
            while j<len(on) and (on[j] or any(on[j:j+int(float(os.environ.get('SYL_GAP','0.09'))*SR/h)])):j+=1  # فجوة أقل من 90 م/ث داخل المقطع لا تقسمه
            segs.append((i*h,min(len(x),j*h+w)));i=j
        else:i+=1
    segs=[s for s in segs if s[1]-s[0]>0.06*SR]
    return segs if len(segs)==n else None
def enc(y,out):
    fo=min(len(y)//5,int(.03*SR));y=y.copy();y[:int(.005*SR)]*=np.linspace(0,1,int(.005*SR));y[-fo:]*=np.linspace(1,0,fo)
    y=np.concatenate([y,np.zeros(int(.03*SR),np.float32)])
    subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','48k','-write_xing','0','-id3v2_version','0',out],input=(np.clip(y,-1,1)*32767).astype(np.int16).tobytes())
async def one(letter,keys,dst,sem,stat):
    F,K,D,S,SH='َ','ِ','ُ','ْ','ّ'
    items=[letter+F,letter+K,letter+D,'أَ'+letter+S,'أَ'+letter+S+letter+F]
    text=' ، '.join(items)
    async with sem:
        for a in range(4):
            raw=os.path.join(dst,'raw_'+str(ord(letter))+'.mp3')
            try:
                await edge_tts.Communicate(text,VOICE,rate='-5%',proxy=P).save(raw);x=load(raw);os.remove(raw)
                segs=split(x,len(items))
                if segs:break
            except Exception as e: await asyncio.sleep(2+2*a)
        else: stat['fail'].append(letter);return
    for (s,t),k in zip(segs,keys):
        if not k:continue
        for who in ('male','female'):
            os.makedirs(os.path.join(dst,'out',who),exist_ok=True);enc(x[max(0,s-int(.01*SR)):t],os.path.join(dst,'out',who,k+'.mp3'))
    stat['ok']+=1
async def main():
    spec=json.load(open(sys.argv[1],encoding='utf8'));dst=sys.argv[2];sem=asyncio.Semaphore(4);stat={'ok':0,'fail':[]}
    await asyncio.gather(*[one(l,ks,dst,sem,stat) for l,ks in spec])
    print('letters ok',stat['ok'],'failed',stat['fail'])
asyncio.run(main())
