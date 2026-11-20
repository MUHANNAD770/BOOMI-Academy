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
# مفتاح التكرار: نحذف الحركات خارج «» فقط — داخلها هي موضوع السؤال («بَ» و«بِ» و«بُ» ثلاثة أسئلة مختلفة)
dkey=lambda q:''.join(norm(p) if i%2==0 else '«'+p+'»' for i,p in enumerate(re.split(r'«([^»]*)»',q)))
seen=set();Q=[]
for x in src['questions']:
    x={**x,**FIX.get(x['id'],{})}
    k=dkey(x['question'])
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
VOW=['الْفَتْحَةُ','الضَّمَّةُ','الْكَسْرَةُ','السُّكُونُ']
OVR={ # خيارات غير منطقية أو ناقصة (مراجعة البنك)
 'AR-0027':{'o':['و','س','ف']},
 'AR-0196':{'o':['أَقْلَامٌ','قَلَمَانِ','قَلَمٌ']},  # «قَلَمَةٌ» ليست كلمة
 'AR-0102':{'o':['إِلَى الْحَدِيقَةِ','إِلَى الْمَدْرَسَةِ','إِلَى السُّوقِ']},
 'AR-0103':{'o':['الْقِرَاءَةَ','الرَّسْمَ','السِّبَاحَةَ']},
 'AR-0104':{'o':['لِأَنَّ الْمَطَرَ كَانَ غَزِيرًا','لِأَنَّ الشَّمْسَ كَانَتْ حَارَّةً','لِأَنَّهُ ذَاهِبٌ إِلَى السُّوقِ']},
 'AR-0356':{'o':['لِأَنَّ الْكَسْرَةَ أَقْوَى مِنَ السُّكُونِ','لِأَنَّ السُّكُونَ أَقْوَى مِنَ الْكَسْرَةِ','لِأَنَّ الْهَمْزَةَ فِي أَوَّلِ الْكَلِمَةِ']},
 'AR-0357':{'o':['يُهْمِلِ','الطَّالِبُ','وَاجِبَهُ']},
 'AR-0439':{'o':['النُّصْحُ وَالْإِرْشَادُ','التَّعْجِيزُ','التَّمَنِّي']},
 'AR-0442':{'o':['التشبيه يذكر طرفي المقارنة غالبًا، والاستعارة تقوم على حذف أحد الطرفين','لَا فَرْقَ بَيْنَهُمَا','الِاسْتِعَارَةُ تَذْكُرُ أَدَاةَ التَّشْبِيهِ دَائِمًا']},
 'AR-0443':{'o':['تَمْهِيدُ الْمَوْضُوعِ وَجَذْبُ الْقَارِئِ','تَلْخِيصُ الْمَوْضُوعِ فِي آخِرِهِ','عَرْضُ الْأَدِلَّةِ وَالتَّفَاصِيلِ']},
 'AR-0271':{'e':'تُكتب «هذا» بلا ألف بعد الهاء، مع أننا ننطقها ممدودة.'},
}
# تلميح خاص بكل درس بدل التلميح العام «اقرأ السؤال بهدوء، وحدد المهارة التي يطلبها»
HINTS={'تمييز الكلمات والمعاني':'انطق الكلمات بصوت عالٍ، ولاحظ الحرف الممدود أو معنى الكلمة.',
 'ترتيب الكلمات':'الجملة الفعلية تبدأ بفعل، والاسمية تبدأ باسم. اقرأ كل ترتيب بصوت عالٍ.',
 'فهم الجملة والنص القصير':'ارجع إلى الجملة بين القوسين؛ الجواب مكتوب فيها.',
 'المعاني وعلامات الترقيم':'الضد عكس المعنى، والمرادف يشبهه في المعنى.',
 'المفرد والمثنى والجمع':'المثنى لاثنين وينتهي بـ«ـانِ»، والجمع لثلاثة فأكثر.',
 'تطبيقات متنوعة':'تذكّر: الفعل حدث، والاسم شيء أو شخص، والمثنى لاثنين.',
 'المبتدأ والخبر':'المبتدأ أول الجملة الاسمية، والخبر يكمّل المعنى عنه.',
 'الفاعل والمفعول به':'الفاعل من قام بالفعل، والمفعول به من وقع عليه الفعل.',
 'التصويب الإملائي':'تذكّر كيف تكتب الكلمة في كتابك، لا كيف تنطقها فقط.',
 'علامات الإعراب':'حدّد موقع الكلمة في الجملة أولًا، ثم علامة إعرابها.',
 'أنواع الفعل':'الماضي حدث انتهى، والمضارع يحدث الآن، والأمر طلب.',
 'كان وأخواتها وإن وأخواتها':'كان ترفع الاسم وتنصب الخبر، وإنّ تنصب الاسم وترفع الخبر.',
 'التعليل والتطبيق':'فكّر في القاعدة التي درستها، ثم طبّقها على المثال.',
 'الإعراب المتقدم':'حدّد نوع الكلمة (مثنى، جمع، فعل، أسماء خمسة) ثم علامتها.',
 'تحليل النصوص':'اسأل نفسك: عمّ تتحدث العبارة؟ وما الذي تدعو إليه؟',
 'الأساليب وتحليل النص':'انظر إلى الأداة: هل للسؤال أم للنهي أم للنفي أم للتعجب؟',
 'الاشتقاق والجمع':'احذف الحروف الزائدة لتصل إلى أصل الكلمة.'}
GEN='اقرأ السؤال بهدوء'
def fixq(x,ln):
    q={'id':x['id'],'t':x['question'],'a':x['answer'].strip(),'o':options(x),'e':x.get('explanation',''),'h':x.get('hint',''),'d':x['difficulty'],'ty':x['type']}
    if x['question'].startswith('مَا الْحَرَكَةُ عَلَى'):q['o']=[q['a'] if norm(v)==norm(q['a']) else v for v in VOW]  # الحركات: الخيارات هي الحركات نفسها
    q.update(OVR.get(x['id'],{}))
    hk=lambda s:re.sub('[\u064B-\u0652]','',s).strip()
    q['o']=[q['a'] if hk(v)==hk(q['a']) else v for v in q['o']]  # ترتيب علامات الشدة والحركة يختلف بين المصادر
    if q['h'].startswith(GEN) and ln in HINTS:q['h']=HINTS[ln]
    assert q['a'] in q['o'] and len(set(q['o']))==len(q['o'])>=2,(x['id'],q['a'],q['o'])
    return q
stages=[s['name'] for s in src['stages']];out={'title':'أسئلة العربية','source':'بنك أسئلة أكاديمية اللغة العربية (من صاحب المشروع) — بعد حذف المكرر وتصحيح الأخطاء','stages':[]}
for s in src['stages']:
    st={'name':s['name'],'grades':s['grade_range'],'lessons':[]}
    for (sn,ln),qs in by_lesson.items():
        if sn!=s['name']:continue
        st['lessons'].append({'name':ln,'domain':qs[0]['domain'],'q':[fixq(x,ln) for x in qs]})
    out['stages'].append(st)
os.makedirs(os.path.join(ROOT,'data'),exist_ok=True)
json.dump(out,open(os.path.join(ROOT,'data','ar-bank.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
n=sum(len(l['q']) for s in out['stages'] for l in s['lessons']);print('questions',n,'lessons',sum(len(s['lessons']) for s in out['stages']))
