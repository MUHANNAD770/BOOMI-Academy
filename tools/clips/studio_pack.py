# «استوديو صوتي» ← ملفات المشروع: يجلب تسجيلات صاحب الموقع من مخزن الموقع (netlify/functions/studio.mjs)،
# يحوّلها إلى mp3 (ffmpeg) ويجمعها في حزم audio/clips/r*.bin مع الفهرس rec.json. src/voice/clips.js يقدّمها على صوت بومي لكل الطلاب.
# التشغيل: python3 tools/clips/studio_pack.py [https://boomi-academy.netlify.app]
# كل تشغيل يعيد بناء حزم التسجيلات كاملة (التسجيل المُعاد يحلّ محل القديم، والمحذوف يُحذف).
import json, os, sys, subprocess, tempfile, urllib.request, urllib.parse, glob
SITE=(sys.argv[1] if len(sys.argv)>1 else 'https://boomi-academy.netlify.app').rstrip('/')
API=SITE+'/.netlify/functions/studio'
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'); DST=os.path.join(ROOT,'audio','clips')
get=lambda u:urllib.request.urlopen(urllib.request.Request(u,headers={'user-agent':'studio-pack'}),timeout=60)
keys=json.load(get(API+'?a=list'))['keys']; print('recordings',len(keys))
tmp=tempfile.mkdtemp(); clips=[]
for i,k in enumerate(sorted(keys)):
    r=get(API+'?a=get&k='+urllib.parse.quote(k)); b=r.read()
    src=os.path.join(tmp,k+'.in'); dst=os.path.join(tmp,k+'.mp3'); open(src,'wb').write(b)
    subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-ac','1','-ar','24000','-b:a','48k',dst],check=True)
    clips.append((k,open(dst,'rb').read()))
    if i%200==0: print(i)
old=json.load(open(os.path.join(DST,'rec.json'))) if os.path.exists(os.path.join(DST,'rec.json')) else {'v':0}
for f in glob.glob(os.path.join(DST,'r[0-9]*.bin')): os.remove(f)
packs=[]; idx={}; cur=bytearray()
def flush():
    global cur
    if cur: name=f'r{len(packs)}.bin'; open(os.path.join(DST,name),'wb').write(cur); packs.append(name); cur=bytearray()
for k,b in clips:
    if len(cur)+len(b)>1_500_000: flush()
    idx[k]=[len(packs),len(cur),len(b)]; cur+=b
flush()
j={'v':int(old.get('v',0))+1,'voice':'owner','engine':'edge','voices':'صوت صاحب الموقع','packs':packs,'idx':idx}
json.dump(j,open(os.path.join(DST,'rec.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print('rec.json v',j['v'],len(idx),'clips',len(packs),'packs')
