# build_en.py — يبني data/en-bank.json من دفعات بنك أسئلة الإنجليزية (tools/bank/en/batch*.json) التي يرسلها صاحب المشروع.
#  • كل دفعة جديدة: احفظها tools/bank/en/batchN.json ثم شغّل: python tools/bank/build_en.py
#  • التجميع: المرحلة ← المهارة (درس) بترتيب ظهورها؛ السؤال بالإنجليزية والتفسير بالعربية.
#  • لا تكرار: السؤال نفسه (النص + الصورة + الخيارات) يُحذف إن تكرر عبر الدفعات.
#  • «صورة تفاحة» ← صورة ثلاثية الأبعاد 🍎 (emoji3d.js).
import json,os,glob,re
R=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(R))
STAGE_AR={'Early Foundation':'التأسيس المبكر','Grades 1-2':'الصف الأول والثاني','Grades 3-4':'الصف الثالث والرابع','Grades 5-6':'الصف الخامس والسادس',
 'Grades 7-9':'الصف السابع إلى التاسع','Grades 10-12':'الصف العاشر إلى الثاني عشر'}
SKILL_AR={'Alphabet':'الحروف','Phonics':'الأصوات','Vocabulary':'المفردات','Numbers':'الأرقام','Conversation':'المحادثة','Grammar':'القواعد',
 'Reading':'القراءة','Writing':'الكتابة','Spelling':'التهجئة','Listening':'الاستماع'}
SKILL_IC={'Alphabet':'🔤','Phonics':'🔊','Vocabulary':'🍎','Numbers':'🔢','Conversation':'💬','Grammar':'📐','Reading':'📖','Writing':'✍️','Spelling':'🔡','Listening':'🎧'}
EMOJI={'تفاحة':'🍎','موزة':'🍌','برتقالة':'🍊','عنب':'🍇','فراولة':'🍓','بطيخ':'🍉','قطة':'🐱','كلب':'🐶','بقرة':'🐮','أسد':'🦁','فيل':'🐘','سمكة':'🐟',
 'طائر':'🐦','شمس':'☀️','قمر':'🌙','نجمة':'⭐','كرة':'⚽','كتاب':'📕','قلم':'✏️','سيارة':'🚗','بيت':'🏠','شجرة':'🌳','وردة':'🌹','حليب':'🥛','خبز':'🍞','بيضة':'🥚'}
def img(desc):
    if not desc:return ''
    for k,v in EMOJI.items():
        if k in desc:return v
    return ''
qs=[];seen=set()
for f in sorted(glob.glob(os.path.join(R,'en','batch*.json')),key=lambda p:int(re.findall(r'\d+',os.path.basename(p))[0])):
    b=json.load(open(f,encoding='utf8'))
    for x in b['questions']:
        x={**x,'stage':x.get('stage',b.get('stage','')),'level':x.get('level',b.get('level',''))}
        k=(x['question'].strip().lower(),x.get('image_description',''),tuple(sorted(x.get('options',[]))))
        if k in seen:continue
        seen.add(k);x['_batch']=b.get('batch');qs.append(x)
stages=[]
for x in qs:
    st=next((s for s in stages if s['key']==x['stage']),None)
    if not st:st={'key':x['stage'],'name':STAGE_AR.get(x['stage'],x['stage']),'grades':x.get('level',''),'lessons':[]};stages.append(st)
    sk=x.get('skill','General');ls=next((l for l in st['lessons'] if l['key']==sk),None)
    if not ls:ls={'key':sk,'name':SKILL_AR.get(sk,sk),'en':sk,'ic':SKILL_IC.get(sk,'📘'),'q':[]};st['lessons'].append(ls)
    a=str(x['correct_answer']).strip();o=[str(v).strip() for v in x.get('options',[])]
    assert a in o,(x['id'],a,o)
    ls['q'].append({'id':'EN-%04d'%int(x['id']),'t':x['question'],'a':a,'o':o,'e':x.get('explanation_ar',''),'tr':x.get('translation_ar',''),
      'img':img(x.get('image_description','')),'topic':x.get('topic',''),'d':x.get('difficulty',''),'ty':x.get('type','')})
out={'title':'English','lang':'en','source':'Boomi English Academy — دفعات من صاحب المشروع','stages':[{k:v for k,v in s.items() if k!='key'} for s in stages]}
for s in out['stages']:
    for l in s['lessons']:l.pop('key',None)
os.makedirs(os.path.join(ROOT,'data'),exist_ok=True)
json.dump(out,open(os.path.join(ROOT,'data','en-bank.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print('questions',len(qs),'stages',len(out['stages']),'lessons',sum(len(s['lessons']) for s in out['stages']),[ (l['name'],len(l['q'])) for s in out['stages'] for l in s['lessons']])
