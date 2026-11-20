# build_bank.py — يبني data/ar-bank.json من بنك أسئلة العربية الذي أرسله صاحب المشروع (tools/bank/source.json)
#  • يحذف الأسئلة المكررة (500 سؤال فيها 182 سؤالًا مختلفًا فقط؛ بعضها مكرر 22 مرة) — طلب المشروع: لا تكرار.
#  • يصحّح خطأين بعد المراجعة (انظر FIX).
#  • كل سؤال يصير اختيارًا من متعدد مناسبًا للطفل:
#      - الأسئلة التي لها خيارات: كما هي.
#      - الاستخراج من جملة بين «»: الخيارات كلمات الجملة نفسها.
#      - الترتيب: الترتيب الصحيح وترتيبات أخرى للكلمات نفسها.
#      - غيرها: إجابات أسئلة أخرى من الدرس نفسه (ثم من النوع نفسه) كخيارات خاطئة.
#  الاستعمال: python tools/bank/build_bank.py
import json,re,random,os,itertools
R=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(R))
src=json.load(open(os.path.join(R,'source.json'),encoding='utf8'))
FIX={
 'AR-0357':{'question':'مَا الْفِعْلُ الْمَجْزُومُ فِي «لَمْ يُهْمِلِ الطَّالِبُ وَاجِبَهُ»؟','answer':'يُهْمِلِ'},  # أَهْمَلَ يُهْمِلُ (لا «يَهْمِلْ»)
 'AR-0429':{'question':'حَدِّدِ الصُّورَةَ الْبَلَاغِيَّةَ فِي: «الْجُنْدِيُّ أَسَدٌ».'},  # مع «في الشجاعة» يكون تشبيهًا مؤكَّدًا لا بليغًا
}
norm=lambda s:re.sub(r'[ً-ْٰ\s.،؟?!:«»]','',s or '')
seen=set();Q=[]
for x in src['questions']:
    x={**x,**FIX.get(x['id'],{})}
    k=norm(x['question'])
    if k in seen: continue
    seen.add(k);Q.append(x)
rnd=random.Random(7)
by_lesson={};by_type={}
for x in Q:by_lesson.setdefault((x['stage'],x['lesson']),[]).append(x);by_type.setdefault(x['type'],[]).append(x)
def words_of_quote(q):
    m=re.findall(r'«([^»]+)»',q)
    if not m:return []
    s=max(m,key=len);return [w for w in re.split(r'\s+',re.sub(r'[.،؟?!]','',s)) if w]
# فئات معروفة: خيارات السؤال من الفئة نفسها (لا «اسمية / فعل / قلمان»)
CATS=[['اسمية','فعلية'],['اسم','فعل','حرف'],['ماضٍ','مضارع','أمر'],['شمسية','قمرية'],['الألف','الياء','الواو'],['لَمْ','لَنْ','أَنْ'],
 ['مصدر ثلاثي','مصدر رباعي','مصدر خماسي','مصدر سداسي'],['جمع تكسير','جمع مذكر سالم','جمع مؤنث سالم'],['نَفْيٌ','نَهْيٌ','اسْتِفْهَامٌ','تَعَجُّبٌ'],
 ['ك ت ب','ك ت م','م ك ت']]
def options(x):
    a=x['answer'].strip()
    qn=re.sub('[\u064B-\u0652]','',x['question']);m=re.search(r'ما (?:مثنى|جمع)(?: كلمة)? «',qn)
    if m and not x.get('options'):   # المفرد والمثنى والجمع: الخيارات صيغ الكلمة نفسها (لا كلمات مختلَقة)
        w=re.search(r'«([^»]+)»',x['question']).group(1).strip();b=re.sub('[\u064C\u064D\u064B]$','',w);snd=norm(a).endswith('ون')
        if b.endswith('ة'):st=b[:-1];forms=[st+'تَانِ',st+'اتٌ',w]
        elif w.endswith('\u064D'):forms=[b+'ِيَانِ',b+'ُونَ',w]
        else:forms=[b+'َانِ']+([b+'ُونَ'] if snd else [])+[w]
        # صيغة أخرى صحيحة للكلمة نفسها من سؤال آخر في البنك (جمع «معلم» خيار في سؤال مثناه، والعكس)
        for y in Q:
            if y is not x and re.search(r'«'+re.escape(w)+'»',y['question']) and re.search(r'ما (?:مثنى|جمع)',re.sub('[\u064B-\u0652]','',y['question'])):forms.insert(0,y['answer'].strip())
        o=[f for f in dict.fromkeys(forms) if norm(f)!=norm(a)];return [a]+o[:3]
    for c in CATS:
        if norm(a) in [norm(v) for v in c] and not x.get('options'):
            o=[v for v in c if norm(v)!=norm(a)];rnd.shuffle(o);return [a]+o[:3]
    if x.get('options'):
        o=list(dict.fromkeys(x['options']))
        if a not in o:o=[a]+o
        return o
    if x['type'] in ('استخراج',) or re.match(r'^اسْتَخْرِجِ',x['question']):
        ws=list(dict.fromkeys(words_of_quote(x['question'])))
        if norm(a) in [norm(w) for w in ws] and len(ws)>=2:return ws[:4]
    if x['type']=='ترتيب':
        ws=[w.strip() for w in x['question'].split(':',1)[-1].split('/') if w.strip()]
        perms=[' '.join(p)+'.' for p in itertools.permutations(ws)]
        o=[a]+[p for p in perms if norm(p)!=norm(a)][:2]
        return o
    pool=[y['answer'].strip() for y in by_lesson[(x['stage'],x['lesson'])] if norm(y['answer'])!=norm(a)]
    pool=list(dict.fromkeys(pool))
    if len(pool)<2:pool+= [y['answer'].strip() for y in by_type[x['type']] if norm(y['answer'])!=norm(a) and y['answer'].strip() not in pool]
    pool=list(dict.fromkeys(pool));rnd.shuffle(pool)
    # خيار خاطئ بطول قريب من الجواب (لا يُكشف الجواب بطوله)
    pool.sort(key=lambda p:abs(len(p)-len(a)))
    return [a]+pool[:2]
stages=[s['name'] for s in src['stages']];out={'title':'أسئلة العربية','source':'بنك أسئلة أكاديمية اللغة العربية (من صاحب المشروع) — بعد حذف المكرر وتصحيح خطأين','stages':[]}
for s in src['stages']:
    st={'name':s['name'],'grades':s['grade_range'],'lessons':[]}
    for (sn,ln),qs in by_lesson.items():
        if sn!=s['name']:continue
        st['lessons'].append({'name':ln,'domain':qs[0]['domain'],'q':[{'id':x['id'],'t':x['question'],'a':x['answer'].strip(),'o':options(x),'e':x.get('explanation',''),'h':x.get('hint',''),'d':x['difficulty'],'ty':x['type']} for x in qs]})
    out['stages'].append(st)
os.makedirs(os.path.join(ROOT,'data'),exist_ok=True)
json.dump(out,open(os.path.join(ROOT,'data','ar-bank.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
n=sum(len(l['q']) for s in out['stages'] for l in s['lessons']);print('questions',n,'lessons',sum(len(s['lessons']) for s in out['stages']))
