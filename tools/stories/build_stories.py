# build_stories.py — يبني data/stories-bank.json من دفعات القصص التي يرسلها صاحب المشروع (tools/stories/batchN.json).
#  • كل دفعة جديدة: احفظها tools/stories/batchN.json ثم شغّل: python3 tools/stories/build_stories.py
#  • الترتيب بالتدريج: المرحلة (بترتيب STAGES، ثم أي مرحلة جديدة بحسب مستواها) ← المستوى (A1 ← C2) ← ترتيب الدفعات.
#  • لا تكرار: القصة نفسها (المعرّف أو العنوان) تُحفظ مرة واحدة.
#  • صورة القصة: image.url إن وُجد، وإلا مشهد من صور ثلاثية الأبعاد (إيموجي) من وصف الصورة.
#  • أسئلة القصص الإنجليزية في المستويين A1 وA2 تظهر مع ترجمتها العربية (المبتدئ يفهم السؤال) — QAR.
import json,os,glob,re
R=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(R))
LEVELS=['Pre-A1','A1','A2','B1','B2','C1','C2']
LEVEL_AR={'Pre-A1':'مبتدئ تمامًا','A1':'مبتدئ','A2':'مبتدئ متقدّم','B1':'متوسط','B2':'فوق المتوسط','C1':'متقدّم','C2':'متقن'}
STAGES=['مرحلة التأسيس','المرحلة الابتدائية','المرحلة المتوسطة','المرحلة المتقدمة','مرحلة الإتقان']
STAGE_IC={'مرحلة التأسيس':'🌱','المرحلة الابتدائية':'🌿','المرحلة المتوسطة':'🌳','المرحلة المتقدمة':'🏔️','مرحلة الإتقان':'🏆'}
# كلمات وصف الصورة ← صور المشهد (بالترتيب، ٤ على الأكثر)
SCENE=[('kitten|cat','🐱'),('butterfly','🦋'),('flower','🌹'),('bird','🐦'),('rabbit','🐰'),('mouse','🐭'),('carrot','🥕'),('balloon','🎈'),
 ('girl','👧'),('boy','👦'),('fish','🐟'),('rock','🪨'),('water|bowl','💧'),('ocean|sea','🌊'),('tree','🌳'),('garden|park|field','🌳'),('sun','☀️'),
 ('dog|puppy','🐶'),('owl','🦉'),('book','📖'),('school','🏫'),('star','⭐'),('moon','🌙'),('house|home','🏠'),('car','🚗'),('ball','⚽'),('cake','🎂'),
 ('horse','🐴'),('camel','🐪'),('lion','🦁'),('elephant','🐘'),('bear','🐻'),('duck','🦆'),('frog','🐸'),('turtle','🐢'),('rain','🌧️'),('snow','❄️'),('apple','🍎')]
# ترجمة أسئلة القصص الإنجليزية للمبتدئ (معرّف التمرين ← السؤال بالعربية)
QAR={'en002_q1':'أَيْنَ يَعِيشُ الطَّائِرُ الصَّغِيرُ؟','en002_q2':'مَاذَا يَرَى الطَّائِرُ عَلَى الْأَرْضِ؟','en002_q3':'صَحٌّ أَمْ خَطَأٌ: الْأَرْنَبُ عَطْشَانُ.',
 'en002_q4':'مَاذَا يُرِي الطَّائِرُ الْأَرْنَبَ؟','en004_q1':'مَا لَوْنُ بَالُونِ سَارَةَ؟','en004_q2':'إِلَى أَيْنَ تَأْخُذُ سَارَةُ الْبَالُونَ؟',
 'en004_q3':'صَحٌّ أَمْ خَطَأٌ: وَلَدٌ لَطِيفٌ يُسَاعِدُ سَارَةَ.','en004_q4':'أَيْنَ عَلِقَ الْبَالُونُ؟'}
def scene(st):
    t=' '.join([st.get('image',{}).get('prompt',''),st.get('image',{}).get('alt',''),st.get('title','')]).lower();o=[]
    for k,e in SCENE:
        if re.search(r'\b('+k+r')s?\b',t) and e not in o:o.append(e)
    return o[:4] or ['📖']
def sentences(text):
    return [s.strip() for s in re.findall(r'[^.!?؟]+[.!?؟]?',text) if s.strip()]
stories=[];seen=set()
for f in sorted(glob.glob(os.path.join(R,'batch*.json')),key=lambda p:int(re.findall(r'\d+',os.path.basename(p))[0])):
    b=json.load(open(f,encoding='utf8'))
    for i,st in enumerate(b['stories']):
        k=(st['id'],);kt=st['title'].strip()
        if st['id'] in seen or kt in seen:continue
        seen.add(st['id']);seen.add(kt)
        ex=[]
        for e in st.get('exercises',[]):
            t=e['type'];q={'id':e['id'],'t':t,'q':e['question'],'e':e.get('explanation','')}
            if t=='multiple_choice':
                assert e['answer'] in e['options'],(e['id'],e['answer']);q.update(o=e['options'],a=e['answer'])
            elif t=='true_false':q['a']=bool(e['answer'])
            elif t=='short_answer':q['a']=e['answer'];q['acc']=e.get('accepted_answers',[])
            else:raise AssertionError(('نوع تمرين جديد',e['id'],t))
            if st['language']=='en' and st.get('level') in ('Pre-A1','A1','A2') and e['id'] in QAR:q['qar']=QAR[e['id']]
            ex.append(q)
        img=st.get('image') or {}
        stories.append({'id':st['id'],'l':st['language'],'stage':st.get('stage',''),'lv':st.get('level','A1'),'t':st['title'],'s':sentences(st['text']),
          'v':[[w['word'],w['meaning']] for w in st.get('vocabulary',[])],'x':ex,'img':img.get('url',''),'alt':img.get('alt',''),'sc':scene(st),'_b':b['batch'],'_i':i})
lv=lambda s:LEVELS.index(s['lv']) if s['lv'] in LEVELS else 9
so=lambda s:STAGES.index(s['stage']) if s['stage'] in STAGES else 10+lv(s)
stories.sort(key=lambda s:(so(s),lv(s),s['_b'],s['_i']))
groups=[]
for s in stories:
    s.pop('_b');s.pop('_i')
    g=next((g for g in groups if g['name']==s['stage']),None)
    if not g:g={'name':s['stage'],'ic':STAGE_IC.get(s['stage'],'📘'),'stories':[]};groups.append(g)
    g['stories'].append(s)
for g in groups:
    ls=sorted({s['lv'] for s in g['stories']},key=lambda x:LEVELS.index(x) if x in LEVELS else 9)
    g['levels']=' • '.join(f"{x} {LEVEL_AR.get(x,'')}".strip() for x in ls)
out={'title':'مكتبة القصص المتدرّجة','source':'Boomi Bilingual Story Academy — دفعات من صاحب المشروع','stages':groups}
json.dump(out,open(os.path.join(ROOT,'data','stories-bank.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print('stories',len(stories),[(g['name'],len(g['stories']),g['levels']) for g in groups])
for s in stories:print(' ',s['id'],s['lv'],''.join(s['sc']),len(s['s']),'جمل')
