# تجميع المقاطع في حزم ~1.5MB وكتابة الفهرس داخل المشروع (voices/clips)
import json, os, sys, glob, shutil
W=os.path.dirname(os.path.abspath(__file__)); DST=sys.argv[1]; V=int(sys.argv[2]) if len(sys.argv)>2 else 61
# وضع الإضافة: python pack.py <مجلد voices/clips> <إصدار> append  ← يضيف المقاطع الجديدة فقط في حزم جديدة ويحدّث الفهرس،
# دون إعادة كتابة الحزم القديمة (لا يتضخم المستودع). المقاطع الجديدة في out/<who>/ والجمل في final.json.
if len(sys.argv)>3 and sys.argv[3]=='append':
    phr=json.load(open(os.environ.get('PHR') or os.path.join(W,'final.json')))
    for who,pre in (('female','f'),('male','m')):
        jp=os.path.join(DST,who+'.json'); j=json.load(open(jp,encoding='utf8')); packs=j['packs']; idx=j['idx']
        cur=bytearray(); n=0
        def out_pack():
            global cur
            name=f'{pre}{len(packs)}.bin'; open(os.path.join(DST,name),'wb').write(cur); packs.append(name); cur=bytearray()
        for k,(t,l) in phr:
            p=os.path.join(W,'out',who,k+'.mp3')
            if k in idx or not os.path.exists(p): continue
            b=open(p,'rb').read()
            if len(cur)+len(b)>1_500_000 and cur: out_pack()
            idx[k]=[len(packs),len(cur),len(b)]; cur+=b; n+=1
        if cur: out_pack()
        j['v']=V; json.dump(j,open(jp,'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
        print(who,'added',n,'clips; packs',len(packs))
    sys.exit(0)
phr=json.load(open(os.path.join(W,'final.json')))
MAX=1_500_000
for who,pre in (('female','f'),('male','m')):
    idx={}; packs=[]; buf=bytearray(); 
    def flush():
        global buf
    cur=bytearray(); n=0
    for k,(t,l) in phr:
        p=os.path.join(W,'out',who,k+'.mp3')
        if not os.path.exists(p): continue
        b=open(p,'rb').read()
        if len(cur)+len(b)>MAX and cur:
            name=f'{pre}{len(packs)}.bin'; open(os.path.join(W,'packs',name),'wb').write(cur); packs.append(name); cur=bytearray()
        idx[k]=[len(packs),len(cur),len(b)]; cur+=b
    if cur:
        name=f'{pre}{len(packs)}.bin'; open(os.path.join(W,'packs',name),'wb').write(cur); packs.append(name)
    j={'v':V,'voice':'edge','engine':'edge','voices':{'female':'ar-SA-ZariyahNeural + en-US-AvaNeural','male':'ar-SA-HamedNeural + en-US-AndrewNeural'}[who],'packs':packs,'idx':idx}
    json.dump(j,open(os.path.join(W,'packs',who+'.json'),'w'),ensure_ascii=False,separators=(',',':'))
    print(who,len(idx),'clips',len(packs),'packs')
