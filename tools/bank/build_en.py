# build_en.py — يبني data/en-bank.json من دفعات بنك أسئلة الإنجليزية (tools/bank/en/batch*.json) التي يرسلها صاحب المشروع.
#  • كل دفعة جديدة: احفظها tools/bank/en/batchN.json ثم شغّل: python tools/bank/build_en.py
#  • التجميع: المرحلة ← المهارة؛ المهارة الكبيرة تُقسم دروسًا (≤ 12 سؤالًا) بحسب الموضوع: «القواعد ١»، «القواعد ٢»…
#  • لا تكرار: السؤال نفسه (النص + النص المقروء + الإجابة/الخيارات) يُحذف إن تكرر عبر الدفعات.
#  • أنواع الأسئلة (m = طريقة العرض في bank.js):
#      mc    اختيار من متعدد (ومعه p نص للقراءة، wa سبب كل خيار خاطئ)
#      type  إكمال يكتبه الطالب (acc الإجابات المقبولة)
#      fix   تصحيح الخطأ: يكتب الجملة صحيحة (bad الجملة الخاطئة)
#      order ترتيب بطاقات (o البطاقات مخلوطة، seq الترتيب الصحيح، a الجملة/القائمة الصحيحة)
#      match توصيل (pr أزواج [يسار، يمين])
#      write كتابة حرة (sm أمثلة، cr معايير) — يقيّم الطالب نفسه بمقارنة جوابه بالمثال
#  • «صورة تفاحة» ← صورة ثلاثية الأبعاد 🍎 (emoji3d.js).
import json,os,glob,re
R=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(R))
STAGE_AR={'Early Foundation':('التأسيس المبكر','مبتدئ'),'Elementary English':('المرحلة الابتدائية','مبتدئ إلى ابتدائي'),
 'Elementary':('المرحلة الابتدائية المتقدمة','ابتدائي متقدم')}
SKILL_AR={'Alphabet':'الحروف','Phonics':'الأصوات','Vocabulary':'المفردات','Numbers':'الأرقام','Conversation':'المحادثة','Grammar':'القواعد',
 'Reading':'القراءة','Writing':'الكتابة','Spelling':'التهجئة','Listening':'الاستماع','Word Formation':'تكوين الكلمات',
 'Thinking':'التفكير','Comprehensive Assessment':'التحدي الختامي'}
SKILL_SAME={'Critical Thinking':'Thinking'}  # مهارتان بمعنى واحد ← درس واحد
SKILL_IC={'Alphabet':'🔤','Phonics':'🔊','Vocabulary':'🍎','Numbers':'🔢','Conversation':'💬','Grammar':'📐','Reading':'📖','Writing':'✍️',
 'Spelling':'🔡','Listening':'🎧','Word Formation':'🧱','Thinking':'🧠','Comprehensive Assessment':'🏆'}
SKILL_ORDER=['Alphabet','Phonics','Vocabulary','Numbers','Conversation','Grammar','Word Formation','Reading','Writing','Thinking','Comprehensive Assessment']
EMOJI={'تفاحة':'🍎','موزة':'🍌','برتقالة':'🍊','عنب':'🍇','فراولة':'🍓','بطيخ':'🍉','قطة':'🐱','كلب':'🐶','بقرة':'🐮','أسد':'🦁','فيل':'🐘','سمكة':'🐟',
 'طائر':'🐦','شمس':'☀️','قمر':'🌙','نجمة':'⭐','كرة':'⚽','كتاب':'📕','قلم':'✏️','سيارة':'🚗','بيت':'🏠','شجرة':'🌳','وردة':'🌹','حليب':'🥛','خبز':'🍞','بيضة':'🥚'}
AD='٠١٢٣٤٥٦٧٨٩';D=lambda n:''.join(AD[int(c)] for c in str(n))
CHUNK=12
STOP=set('''about with your what will that this from have they them their there would should could write sentences sentence three four five simple short explain explaining where when which while into like also some more very then than each other your friend people things want using think after before because make made'''.split())
def img(desc):
    for k,v in EMOJI.items():
        if desc and k in desc:return v
    return ''
def s(v):return re.sub(r'\s+',' ',str(v)).strip()
def seq_from_sentence(tiles,sent):
    """ترتيب البطاقات كما تظهر في الجملة الصحيحة (بلا اعتبار لحالة الحروف)."""
    rest=sent.lower();used=[False]*len(tiles);out=[]
    while True:
        rest=rest.lstrip()
        if not rest:break
        for i,t in enumerate(tiles):
            tl=t.lower()
            if not used[i] and rest.startswith(tl) and (len(rest)==len(tl) or not (tl[-1].isalnum() and rest[len(tl)].isalnum())):
                used[i]=True;out.append(i);rest=rest[len(tl):];break
        else:
            if rest[0] in '.?!,':rest=rest[1:];continue  # علامة في الجملة ليست بطاقة
            raise AssertionError(('order',tiles,sent,rest))
    assert all(used),('unused tiles',tiles,sent)
    return out
FIX={'EN-0062':{'e':'نضيف es إلى كلمة box لتصبح boxes لأنها تنتهي بالحرف x.'},
 # السياق القديم «He always helps people» يناسب kind/helpful لا careful
 'EN-0291':{'t':'Choose the correct word: My little brother is very _____. He always checks his work twice.'}}
# إجابات أخرى صحيحة يقبلها التصحيح (إضافة إلى الإجابة الأصلية)
ALT={'EN-0263':['She likes to play tennis.'],'EN-0432':['I need information about the course.'],'EN-0429':['This is the teacher that helped me.'],
 'EN-0079':['can not'],'EN-0159':['I like tea and I like coffee.'],'EN-0442':['e mail']}
# أسئلة تعتمد على نص قراءة في سؤال آخر (passage_reference) أو تذكره دون ربط
PREF={491:488}
def norm(x,b):
    t=x['type'];e=s(x.get('explanation_ar',''))
    q={'id':'EN-%04d'%int(x['id']),'t':s(x['question']),'e':e,'topic':x.get('topic',''),'d':x.get('difficulty',''),'ty':t}
    if x.get('passage'):q['p']=s(x['passage'])
    if x.get('translation_ar'):q['tr']=x['translation_ar']
    if img(x.get('image_description','')):q['img']=img(x['image_description'])
    if t in('multiple_choice','image_multiple_choice','reading_comprehension','fill_in_the_blank') or x.get('options'):
        a=s(x['correct_answer']);o=[s(v) for v in x['options']]
        assert a in o,(x['id'],a,o)
        q.update(m='mc',a=a,o=o)
        if x.get('wrong_answers_ar'):q['wa']={s(k):v for k,v in x['wrong_answers_ar'].items() if s(k) in o}
    elif t=='fill_blank':
        acc=[s(v) for v in (x.get('accepted_answers') or [])]+[s(x['correct_answer'])]
        q.update(m='type',a=s(x['correct_answer']),acc=sorted(set(acc),key=acc.index))
    elif t in('error_correction','correct_the_error'):
        bad=s(x.get('incorrect_sentence') or re.sub(r'^.*?:\s*','',x['question']))
        q.update(m='fix',a=s(x['correct_answer']),bad=bad)
    elif t in('ordering','sentence_ordering'):
        tiles=[s(v) for v in (x.get('items') or x.get('words'))]
        tgt=x.get('correct_order') or x.get('correct_sentence') or x.get('correct_answer')
        if isinstance(tgt,list):
            tgt=[s(v) for v in tgt];seq=[tiles.index(v) for v in tgt];a=' → '.join(tgt);q['list']=1
        else:
            a=s(tgt);seq=seq_from_sentence(tiles,a)
        q.update(m='order',o=tiles,seq=seq,a=a)
    elif t=='matching':
        pr=[]
        for p in x['pairs']:
            v=list(p.values()) if isinstance(p,dict) else list(p)
            pr.append([s(v[0]),s(v[1])])
        q.update(m='match',pr=pr,a=' • '.join(f'{l} = {r}' for l,r in pr))
    elif t=='open_ended':
        rb0=x.get('rubric') if isinstance(x.get('rubric'),dict) else {}
        sm=x.get('model_answer') or x.get('example_answer') or rb0.get('sample_answer') or []
        if isinstance(sm,str):sm=[v for v in re.split(r'(?<=[.!?])\s+',sm.strip()) if v]
        if isinstance(sm,str):sm=[sm]
        rb=x.get('rubric') or {};cr=[]
        for c in (rb.get('criteria') if isinstance(rb,dict) else rb) or []:
            cr.append(s(c['criterion'] if isinstance(c,dict) else c))
        if not cr and x.get('grading_criteria'):cr=[]
        q.update(m='write',sm=[s(v) for v in sm],cr=cr,a=' '.join(s(v) for v in sm))
        if isinstance(x.get('accepted_answers'),str):q['note']=x['accepted_answers']
        W={'one':1,'two':2,'three':3,'four':4,'five':5,'six':6}
        mn=rb0.get('minimum_sentences') or rb0.get('minimum_items')
        m=re.search(r'\b(one|two|three|four|five|six)\b(?:\s+or\s+\w+)?\s+(?:simple\s+|short\s+)?(sentences|things|instructions|items)',x['question'],re.I)
        if not mn and m:mn=W[m.group(1).lower()]
        q['min']=int(mn or 1);q['unit']='items' if m and m.group(2).lower() in('things','items') or rb0.get('minimum_items') else 'sentences'
        kw=set(w.lower() for w in re.findall(r"[A-Za-z']{4,}",x['question']+' '+' '.join(q['sm'])))-STOP
        q['kw']=sorted(kw)[:40]
    else:raise AssertionError(('type',x['id'],t))
    q.update(FIX.get(q['id'],{}))
    if ALT.get(q['id']):q['alt']=ALT[q['id']]
    return q
ALL={}
for f in sorted(glob.glob(os.path.join(R,'en','batch*.json')),key=lambda p:int(re.findall(r'\d+',os.path.basename(p))[0])):
    b=json.load(open(f,encoding='utf8'))
    for x in b['questions']:
        assert x['id'] not in ALL,('id مكرر',x['id'])
        ALL[x['id']]={**x,'stage':x.get('stage',b.get('stage',''))}
assert sorted(ALL)==list(range(1,len(ALL)+1)),'ترقيم ناقص'
# ربط أسئلة القراءة بنصها: passage_reference أو PREF
for i,x in ALL.items():
    r=x.get('passage_reference') or PREF.get(i)
    if r and not x.get('passage'):
        assert ALL[r].get('passage'),('نص مفقود',i,r);x['passage']=ALL[r]['passage']
    x['skill']=SKILL_SAME.get(x.get('skill'),x.get('skill','General'))
# لا تكرار: السؤال نفسه بالإجابة نفسها (والنص نفسه) يبقى مرة واحدة — أول ظهور، وتُضاف إليه أسباب الأخطاء من النسخة الأخرى
qs=[];seen={};DUP=[]
for i,x in sorted(ALL.items()):
    k=(re.sub(r'\W+',' ',x['question'].lower()).strip(),x.get('image_description',''),s(x.get('passage','')),
       json.dumps(x.get('correct_answer') or x.get('correct_sentence') or x.get('correct_order') or x.get('pairs'),ensure_ascii=False))
    if k in seen:
        f0=seen[k];DUP.append((f0['id'],i))
        if x.get('wrong_answers_ar') and not f0.get('wrong_answers_ar') and f0.get('options')==x.get('options'):f0['wrong_answers_ar']=x['wrong_answers_ar']
        continue
    seen[k]=x;qs.append(x)
stages=[]
for x in qs:
    st=next((t for t in stages if t['key']==x['stage']),None)
    if not st:st={'key':x['stage'],'sk':{}};stages.append(st)
    st['sk'].setdefault(x.get('skill','General'),[]).append(x)
order=list(STAGE_AR)
stages.sort(key=lambda t:order.index(t['key']) if t['key'] in order else 99)
out={'title':'English','lang':'en','source':'Boomi English Academy — دفعات من صاحب المشروع','stages':[]}
for st in stages:
    nm,gr=STAGE_AR.get(st['key'],(st['key'],''))
    S={'name':nm,'grades':gr,'lessons':[]}
    for sk in sorted(st['sk'],key=lambda k:SKILL_ORDER.index(k) if k in SKILL_ORDER else 99):
        items=st['sk'][sk];tops=[]
        for x in items:
            if x.get('topic','') not in tops:tops.append(x.get('topic',''))
        items=sorted(items,key=lambda x:tops.index(x.get('topic','')))  # المواضيع متجاورة، بترتيب ظهورها
        n=max(1,-(-len(items)//CHUNK))
        # مجموعات لا تنقسم: أسئلة النص المقروء الواحد تبقى معًا في درس واحد
        groups=[]
        for x in items:
            if groups and x.get('passage') and groups[-1][0].get('passage')==x.get('passage'):groups[-1].append(x)
            else:groups.append([x])
        parts=[[]];goal=len(items)/n
        for g in groups:
            if parts[-1] and len(parts)<n and (len(parts[-1])+len(g)/2>goal*len(parts)-sum(map(len,parts[:-1])) or len(parts[-1])+len(g)>CHUNK):parts.append([])
            parts[-1].extend(g)
        n=len(parts)
        for c in range(n):
            part=parts[c]  # دروس متساوية تقريبًا
            if not part:continue
            tp=[];[tp.append(x.get('topic','')) for x in part if x.get('topic','') not in tp]
            S['lessons'].append({'name':SKILL_AR.get(sk,sk)+(' '+D(c+1) if n>1 else ''),'en':' • '.join(tp[:3])+(' …' if len(tp)>3 else '') if n>1 else sk,
              'ic':SKILL_IC.get(sk,'📘'),'q':[norm(x,None) for x in part]})
    out['stages'].append(S)
os.makedirs(os.path.join(ROOT,'data'),exist_ok=True)
json.dump(out,open(os.path.join(ROOT,'data','en-bank.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
from collections import Counter
print('source',len(ALL),'duplicates',DUP)
print('questions',len(qs),'stages',len(out['stages']),'lessons',sum(len(t['lessons']) for t in out['stages']))
print(Counter(q['m'] for t in out['stages'] for l in t['lessons'] for q in l['q']))
for t in out['stages']:print(t['name'],[(l['name'],len(l['q'])) for l in t['lessons']])
