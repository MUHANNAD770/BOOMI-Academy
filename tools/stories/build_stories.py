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
STAGES=['مرحلة التأسيس','مرحلة التطوير','مرحلة الإتقان المتوسط','مرحلة الإتقان المتقدم']
# أسماء المراحل بالإنجليزية في بعض الدفعات ← المرحلة العربية نفسها
STAGE_ALIAS={'Foundation':'مرحلة التأسيس','Beginner':'مرحلة التأسيس','Elementary':'مرحلة التطوير','Development':'مرحلة التطوير','Intermediate':'مرحلة الإتقان المتوسط','Upper Intermediate':'مرحلة الإتقان المتقدم','Advanced':'مرحلة الإتقان المتقدم'}
STAGE_IC={'مرحلة التأسيس':'🌱','مرحلة التطوير':'🌿','مرحلة الإتقان المتوسط':'🌳','مرحلة الإتقان المتقدم':'🏆'}
# تصحيحات بعد المراجعة (القصة ← [الخطأ، الصواب]) تُطبَّق على كل نصوص القصة
FIX={'story_ar_009':[('الْمَشْتَرِيَ','الْمُشْتَرِيَ')],
 'story_ar_013':[('فَكَرَ مَازِنٌ','فَكَّرَ مَازِنٌ'),('عِنْدَمَا يَتْرُكُ الصُّنْبُورَ','عِنْدَمَا يُتْرَكُ الصُّنْبُورُ'),('يُبْتَكِرُ','يَبْتَكِرُ')],
 'story_ar_015':[('الْاِخْتِرَاعَاتُ','الِاخْتِرَاعَاتُ'),('تَسَاعِدَهَا','تُسَاعِدَهَا')],
 'story_ar_017':[('تَحْوِّلَهُ','تُحَوِّلَهُ')],
 'story_ar_019':[('فَقَدْ اهْتَمَّ','فَقَدِ اهْتَمَّ'),('مُشَارَكَتِهِمْ الْمُسْتَمِرَّةِ','مُشَارَكَتِهِمُ الْمُسْتَمِرَّةِ'),('تَحَافِظُ','تُحَافِظُ'),('وَالْمُسَاحَاتِ','وَالْمَسَاحَاتِ')],
 'story_ar_023':[('بَوْصْفِهِمَا','بِوَصْفِهِمَا'),('يَنَاقِشُونَ','يُنَاقِشُونَ')],
 'story_ar_025':[]}
FIX['story_ar_023'].append(('الْمَعْيَارُ','الْمِعْيَارُ'))
FIX['story_ar_025'].append(('الْمَعْيَارُ','الْمِعْيَارُ'))
def fixall(o,rules):
    if isinstance(o,str):
        for a,b in rules:o=o.replace(a,b)
        return o
    if isinstance(o,list):return [fixall(x,rules) for x in o]
    if isinstance(o,dict):return {k:fixall(v,rules) for k,v in o.items()}
    return o
# كلمات وصف الصورة ← صور المشهد (بالترتيب، ٤ على الأكثر)
SCENE=[('football','⚽'),('wallet','👛'),('police','👮'),('bicycle','🚲'),('telescope','🔭'),('planet|planets','🪐'),('picnic','🧺'),('lake','🏞️'),('key','🔑'),('city','🏙️'),('solar','☀️'),('clock|schedule|planner','⏰'),('laptop|news','💻'),('magnifying','🔍'),('scientists|scientific|science','🔬'),('library','📚'),('backpack|travel','🎒'),('international|world','🌍'),('stream|branches','🌿'),('seeds|plant','🌱'),('faucet|water-saving','🚰'),('rubbish|recycling','♻️'),('kitten|cat','🐱'),('butterfly','🦋'),('flower','🌹'),('bird','🐦'),('rabbit','🐰'),('mouse','🐭'),('carrot','🥕'),('balloon','🎈'),
 ('girl|schoolgirl','👧'),('boy|schoolboy','👦'),('exhibition|machines|device','⚙️'),('guide|teacher|educators','🧑‍🏫'),('fish','🐟'),('rock','🪨'),('water|bowl','💧'),('ocean|sea','🌊'),('tree','🌳'),('garden|park|field','🌳'),('sun','☀️'),
 ('dog|puppy','🐶'),('owl','🦉'),('book','📖'),('school','🏫'),('star','⭐'),('moon','🌙'),('house|home','🏠'),('car','🚗'),('ball','⚽'),('cake','🎂'),
 ('horse','🐴'),('camel','🐪'),('lion','🦁'),('elephant','🐘'),('bear','🐻'),('duck','🦆'),('frog','🐸'),('turtle','🐢'),('rain','🌧️'),('snow','❄️'),('apple','🍎')]
# ترجمة أسئلة القصص الإنجليزية للمبتدئ (معرّف التمرين ← السؤال بالعربية)
QAR={'en006_q1':'مَنْ هُوَ آدَمُ؟','en006_q2':'أَيْنَ يَجْلِسُ آدَمُ وَقْتَ الِاسْتِرَاحَةِ؟','en006_q3':'صَحٌّ أَمْ خَطَأٌ: تُومُ يَدْعُو آدَمَ لِلَّعِبِ.','en006_q4':'بِمَاذَا يَشْعُرُ آدَمُ فِي نِهَايَةِ الْيَوْمِ؟',
 'en008_q1':'إِلَى أَيْنَ يُرِيدُ جَاك أَنْ يَذْهَبَ؟','en008_q2':'مَا الْعُطْلُ فِي الدَّرَّاجَةِ؟','en008_q3':'صَحٌّ أَمْ خَطَأٌ: أَصْلَحَ جَاك الدَّرَّاجَةَ دُونَ مُسَاعَدَةٍ.','en008_q4':'مَا الدَّرْسُ الَّذِي تَعَلَّمَهُ جَاك؟',
 'en010_q1':'مَاذَا تُرِيدُ إِيمَا أَنْ تَفْعَلَ؟','en010_q2':'مَاذَا اقْتَرَحَتْ أُمُّهَا؟','en010_q3':'صَحٌّ أَمْ خَطَأٌ: أَكَلَتْ عَائِلَةُ إِيمَا شَطَائِرَ وَفَاكِهَةً.','en010_q4':'مَاذَا تَعَلَّمَتْ إِيمَا فِي النِّهَايَةِ؟',
 'en012_q1':'مَا الْمُشْكِلَةُ الَّتِي لَاحَظَهَا الطُّلَّابُ؟','en012_q2':'مَاذَا جَمَعَ الْفَرِيقُ الثَّالِثُ؟','en012_q3':'صَحٌّ أَمْ خَطَأٌ: تَوَقَّفَ الطُّلَّابُ عَنْ رِعَايَةِ النَّبَاتَاتِ بَعْدَ يَوْمٍ وَاحِدٍ.','en012_q4':'لِمَاذَا عَمِلَ الطُّلَّابُ فِي فِرَقٍ؟','en012_q5':'مَا الدَّرْسُ الَّذِي تَعَلَّمَهُ الطُّلَّابُ؟',
 'en002_q1':'أَيْنَ يَعِيشُ الطَّائِرُ الصَّغِيرُ؟','en002_q2':'مَاذَا يَرَى الطَّائِرُ عَلَى الْأَرْضِ؟','en002_q3':'صَحٌّ أَمْ خَطَأٌ: الْأَرْنَبُ عَطْشَانُ.',
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
        st=fixall(st,FIX.get(st['id'],[]))
        st['stage']=STAGE_ALIAS.get(st.get('stage',''),st.get('stage',''))
        k=(st['id'],);kt=st['title'].strip()
        if st['id'] in seen or kt in seen:continue
        seen.add(st['id']);seen.add(kt)
        ex=[]
        for e in st.get('exercises',[]):
            t=e['type'];q={'id':e['id'],'t':t,'q':e['question'],'e':e.get('explanation','')}
            if t=='multiple_choice':
                assert e['answer'] in e['options'],(e['id'],e['answer']);q.update(o=e['options'],a=e['answer'])
            elif t=='true_false':q['a']=bool(e['answer'])
            elif t in('short_answer','inference'):q['a']=e['answer'];q['acc']=e.get('accepted_answers',[])  # inference: استنتاج بإجابة مكتوبة
            elif t=='ordering':
                assert sorted(e['items'])==sorted(e['answer']),e['id'];q['o']=e['items'];q['a']=e['answer']
            else:raise AssertionError(('نوع تمرين جديد',e['id'],t))
            if st['language']=='en' and st.get('level') in ('Pre-A1','A1','A2') and e['id'] in QAR:q['qar']=QAR[e['id']]
            ex.append(q)
        img=st.get('image') or {}
        stories.append({'id':st['id'],'l':st['language'],'stage':st.get('stage',''),'lv':st.get('level','A1'),'t':st['title'],'s':sentences(st['text']),
          'v':[[w['word'],w['meaning']] for w in st.get('vocabulary',[])],'x':ex,'img':img.get('url',''),'alt':img.get('alt',''),'sc':scene(st),'_b':b['batch'],'_i':i})
# الاختبارات الشاملة (tools/stories/tests/testsN.json): لكل قصة أقسام: فهم، صح أو خطأ، مفردات، ترتيب، مفتوح
SECS=['فهم','صح أو خطأ','مفردات','ترتيب','مفتوح']
TESTS={}
for f in sorted(glob.glob(os.path.join(R,'tests','tests*.json'))):
    for sid,items in json.load(open(f,encoding='utf8'))['tests'].items():
        L=[]
        for k,e in enumerate(items):
            assert e['sec'] in SECS,(sid,k,e['sec']);t=e['type'];q={'id':f'{sid}_T{k+1}','sec':e['sec'],'t':t,'q':e['question'],'e':e.get('explanation','')}
            if e.get('qar'):q['qar']=e['qar']
            if t=='multiple_choice':assert e['answer'] in e['options'] and len(set(e['options']))==len(e['options']),(sid,k);q.update(o=e['options'],a=e['answer'])
            elif t=='true_false':q['a']=bool(e['answer'])
            elif t=='ordering':assert sorted(e['items'])==sorted(e['answer']) and e['items']!=e['answer'],(sid,k);q.update(o=e['items'],a=e['answer'])
            elif t in('open','short_answer','inference'):q.update(t='open',a=e['answer'],acc=e.get('accepted_answers',[]))
            else:raise AssertionError((sid,k,t))
            L.append(q)
        TESTS[sid]=L
for s in stories:
    if s['id'] in TESTS:s['T']=TESTS[s['id']]
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
print('tests',len(TESTS),'stories',sum(len(v) for v in TESTS.values()),'questions');print('stories',len(stories),[(g['name'],len(g['stories']),g['levels']) for g in groups])
for s in stories:print(' ',s['id'],s['lv'],''.join(s['sc']),len(s['s']),'جمل')
