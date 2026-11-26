# بناء دفعات بنك الرياضيات من الملفات الخام (tools/math/raw) إلى صيغة الموقع (data/math/batch-NN.json):
#  • توحيد الحقول (question → prompt، المراحل → math_stage_01..06)، وعلامة الطرح «−» والكسر «⁄».
#  • تطبيق التصحيحات المراجَعة (FIX) واستبدال الأسئلة المكررة بأسئلة جديدة من المهارة نفسها (REPLACE).
#  • توزيع كل سؤال على وحدة (مهارة) داخل مرحلته.
# التشغيل: python3 tools/math/build_batches.py  ثم  python3 tools/math/review.py data/math/*.json
import json, re, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STAGE = {'foundation': 'math_stage_01', 'beginner': 'math_stage_02', 'intermediate': 'math_stage_03',
         'upper_intermediate': 'math_stage_04', 'advanced': 'math_stage_05', 'mastery': 'math_stage_06'}
# وحدات جديدة تُضاف بعد وحدات الدفعة الأولى في كل مرحلة
NEW_UNITS = {
    'math_stage_01': [{'id': 'basic_ops', 'name': 'الجمع والطرح البسيط'}],
    'math_stage_02': [{'id': 'mult_intro', 'name': 'الضرب والقسمة الأولي'}],
    'math_stage_03': [{'id': 'fractions_intro', 'name': 'كسور ونسب وقياس تمهيدي'}],
    'math_stage_04': [{'id': 'ratio_money', 'name': 'النسبة والمال والمعادلات البسيطة'}],
    'math_stage_05': [{'id': 'ratio_percent', 'name': 'النسب المئوية والإحصاء والاحتمال'}],
    'math_stage_06': [{'id': 'calculus', 'name': 'مقدمة التفاضل والتكامل'}, {'id': 'geometry_adv', 'name': 'الهندسة والقياس المتقدم'}, {'id': 'fractions_adv', 'name': 'العمليات المتقدمة على الكسور'}],
}

# ---------- تصحيحات المراجعة ----------
FIX = {
    'math_067': {'type': 'choice', 'options': ['🔴', '🔵', '🟢'], '_why': 'إجابة مكتوبة برمز تعبيري يصعب كتابته؛ صارت اختيارًا'},
    'math_172': {'alt': ['−٧ و٧', '±٧', '٧، −٧', '−٧، ٧'], '_why': 'قبول الجذرين بأي ترتيب'},
    'math_173': {'question': 'ما ناتج التعبير ٢ × ٥ − ٣ × ٢؟', 'explanation': 'نضرب أولًا: ٢ × ٥ = ١٠ و٣ × ٢ = ٦، ثم ١٠ − ٦ = ٤.', '_why': 'كلمة «المحدد» في غير موضعها'},
    'math_225': {'type': 'choice', 'question': 'حل المتباينة: س + ٣ > ٩. أي علامة تكمل: س __ ٦؟', 'options': ['>', '<', '='], '_why': 'إجابة برمز يصعب كتابته؛ صارت اختيارًا'},
    'math_238': {'question': 'ما قيمة لوغاريتم العدد ١٠ للأساس ١٠؟', '_why': 'صياغة السؤال غير واضحة'},
    'math_281': {'explanation': 'نجمع القيمتين المطلقتين: ٨ + ٧ = ١٥، ونحافظ على الإشارة السالبة: −١٥.', '_why': 'خطأ إملائي في الشرح'},
    'math_286': {'alt': ['(س + ٤)(س + ٣)'], '_why': 'قبول العاملين بأي ترتيب'},
    'math_298': {'question': 'ما قيمة نها (س + ٢) عندما تقترب س من ٣؟', '_why': 'رمز لاتيني «lim» استُبدل بالرمز العربي «نها»'},
    'math_237': {'alt': ['٢ + ٦س'], '_why': 'قبول ترتيب الحدين'},
    'math_109': {'alt': ['٣:٢'], '_why': 'قبول الكتابة بلا مسافات'},
    'math_176': {'alt': ['٦ط'], '_why': 'قبول الإجابة دون وحدة القياس'},
    'math_355': {'alt': ['ج + س⁴'], '_why': 'قبول ترتيب الحدين'},
}
# ---------- أسئلة مكررة استُبدلت بأسئلة جديدة من المهارة نفسها ----------
def C(q, o, a, e): return {'type': 'choice', 'question': q, 'options': o, 'correct_answer': a, 'explanation': e}
def Fq(q, a, e, alt=None): d = {'type': 'fill', 'question': q, 'options': [], 'correct_answer': a, 'explanation': e}; alt and d.update(alt=alt); return d
REPLACE = {
    'math_061': C('كم عدد النجوم؟ ⭐⭐⭐⭐⭐', ['٤', '٥', '٦'], '٥', 'نعد النجوم واحدةً واحدة: ١، ٢، ٣، ٤، ٥.'),
    'math_068': C('كم ضلعًا للمثلث؟', ['٢', '٣', '٤'], '٣', 'للمثلث ثلاثة أضلاع.'),
    'math_306': C('كم ضلعًا للمستطيل؟', ['٣', '٤', '٦'], '٤', 'للمستطيل أربعة أضلاع: ضلعان طويلان وضلعان قصيران.'),
    'math_310': C('أي شكل له أربع زوايا؟', ['المثلث', 'المستطيل', 'الدائرة'], 'المستطيل', 'للمستطيل أربع زوايا قائمة.'),
    'math_245': C('ما الشكل الذي يشبه عجلة الدراجة؟', ['الدائرة', 'المربع', 'المثلث'], 'الدائرة', 'عجلة الدراجة مستديرة مثل الدائرة.'),
    'math_304': Fq('أكمل النمط: ١، ٣، ٥، ٧، __', '٩', 'نضيف ٢ في كل مرة: ٧ + ٢ = ٩.'),
    'math_091': C('ما الكسر الذي يمثل ربعًا؟', ['١⁄٢', '١⁄٣', '١⁄٤'], '١⁄٤', 'الربع جزء واحد من أربعة أجزاء متساوية.'),
    'math_092': Fq('أكمل: ١⁄٣ + ١⁄٣ = __', '٢⁄٣', 'المقامان متساويان؛ نجمع البسطين: ١ + ١ = ٢، فيكون الناتج ٢⁄٣.'),
    'math_094': C('كم يساوي ٥٠٪ من ٨٠؟', ['٣٠', '٤٠', '٥٠'], '٤٠', '٥٠٪ تعني النصف، ونصف ٨٠ يساوي ٤٠.'),
    'math_151': C('أي كسر أصغر؟', ['١⁄٢', '١⁄٣', '١⁄٦'], '١⁄٦', 'عند تساوي البسط، يكون الكسر ذو المقام الأكبر أصغر.'),
    'math_154': C('ما العدد العشري الذي يساوي ٧⁄١٠٠؟', ['٠٫٧', '٠٫٠٧', '٧٫٠'], '٠٫٠٧', 'سبعة من مئة تُكتب ٠٫٠٧.'),
    'math_323': C('أي كسر يساوي ثلثًا؟', ['٢⁄٦', '٢⁄٤', '٣⁄٤'], '٢⁄٦', 'نقسم البسط والمقام في ٢⁄٦ على ٢ فيصبح ١⁄٣.'),
    'math_322': Fq('احسب: ١٦٨ ÷ ١٤', '١٢', 'لأن ١٤ × ١٢ = ١٦٨.'),
    'math_280': C('كم درجة في الزاوية المستقيمة؟', ['٩٠°', '١٨٠°', '٣٦٠°'], '١٨٠°', 'الزاوية المستقيمة تساوي زاويتين قائمتين: ٩٠ + ٩٠ = ١٨٠ درجة.'),
    'math_339': C('ما نوع الزاوية التي قياسها ٤٠ درجة؟', ['حادة', 'قائمة', 'منفرجة'], 'حادة', 'الزاوية الحادة أصغر من ٩٠ درجة.'),
    'math_335': C('ما حجم مكعب طول حرفه ٢ سم؟', ['٤ سم³', '٦ سم³', '٨ سم³'], '٨ سم³', 'حجم المكعب = ٢ × ٢ × ٢ = ٨ سم³.'),
    'math_337': C('ما ناتج √٦٤؟', ['٦', '٨', '٣٢'], '٨', 'الجذر التربيعي لـ٦٤ هو ٨ لأن ٨ × ٨ = ٦٤.'),
    'math_101': Fq('احسب: −٥ + ٩ = __', '٤', 'نبدأ من −٥ ونتحرك ٩ وحدات إلى اليمين؛ الناتج ٤.'),
    'math_102': Fq('احسب: ٣⁴ = __', '٨١', '٣⁴ = ٣ × ٣ × ٣ × ٣ = ٨١.'),
    'math_103': C('ما قيمة √٤٩؟', ['٦', '٧', '٨'], '٧', '٧ × ٧ = ٤٩.'),
    'math_347': Fq('ما ميل المستقيم المار بالنقطتين (٠، ١) و(٢، ٧)؟', '٣', 'الميل = (٧ − ١) ÷ (٢ − ٠) = ٦ ÷ ٢ = ٣.'),
    'math_350': C('مثلث قائم الزاوية، طول ضلعيه القائمين ٥ سم و١٢ سم. ما طول الوتر؟', ['١٣ سم', '١٥ سم', '١٧ سم'], '١٣ سم', 'حسب نظرية فيثاغورس: الوتر² = ٥² + ١٢² = ٢٥ + ١٤٤ = ١٦٩، والوتر = ١٣ سم.'),
    'math_115': C('ما احتمال ظهور العدد ٣ عند رمي حجر نرد عادل مرقم من ١ إلى ٦؟', ['١⁄٦', '١⁄٣', '١⁄٢'], '١⁄٦', 'للعدد ٣ نتيجة واحدة من أصل ٦ نتائج متساوية.'),
    'math_172': Fq('حل المعادلة: س² = ٣٦؛ اكتب الجذرين.', '٦ و−٦', '٦² = ٣٦ وكذلك (−٦)² = ٣٦.', ['−٦ و٦', '±٦', '٦، −٦', '−٦، ٦']),
    'math_178': C('ما مشتقة الدالة د(س) = س³؟', ['٣س²', 'س²', '٣س'], '٣س²', 'قاعدة القوة: نضرب في الأس ثم ننقصه واحدًا، فتكون المشتقة ٣س².'),
    'math_354': C('ما مشتقة الدالة د(س) = ٥س؟', ['٥', '٥س', 'س'], '٥', 'مشتقة س تساوي ١، لذلك مشتقة ٥س تساوي ٥.'),
    'math_232': C('ما حل المعادلة س² − ٦س + ٨ = ٠؟', ['٢ و٤', '١ و٨', '−٢ و−٤'], '٢ و٤', 'نحلل: (س − ٢)(س − ٤) = ٠، لأن ٢ + ٤ = ٦ و٢ × ٤ = ٨.'),
    'math_352': C('ما جذرا المعادلة س² − ٨س + ١٥ = ٠؟', ['٣ و٥', '١ و١٥', '−٣ و−٥'], '٣ و٥', 'نحلل: (س − ٣)(س − ٥) = ٠، لأن ٣ + ٥ = ٨ و٣ × ٥ = ١٥.'),
    'math_351': Fq('حل النظام: س + ص = ١٢، س − ص = ٤. أوجد قيمة س.', '٨', 'نجمع المعادلتين: ٢س = ١٦، إذن س = ٨.'),
    'math_355': Fq('احسب التكامل غير المحدد: ∫ ٤س³ د س', 'س⁴ + ج', 'نرفع الأس واحدًا ونقسم على الأس الجديد: ٤س⁴ ÷ ٤ = س⁴، ثم نضيف ثابت التكامل ج.', ['ج + س⁴']),
    'math_360': C('إذا تضاعف طول ضلع مربع، فكم تصبح مساحته مقارنة بمساحته الأصلية؟', ['مثلي المساحة', 'ثلاثة أمثال المساحة', 'أربعة أمثال المساحة'], 'أربعة أمثال المساحة', 'مساحة المربع = الضلع². عند مضاعفة الضلع تصبح المساحة (٢ × الضلع)² = ٤ × الضلع²، أي أربعة أمثال.'),
}

def tidy(s):
    if not isinstance(s, str): return s
    s = re.sub(r'(?<![A-Za-z])-(?![A-Za-z])', '−', s)            # علامة الطرح والسالب الرياضية
    s = re.sub(r'([٠-٩√]+)\s*/\s*([٠-٩]+)', r'\1⁄\2', s)            # الكسر «⁄» (ولا يمس «كم/ساعة»)
    return s

def unit(sid, q):
    p = q['question'] + ' ' + ' '.join(q.get('options') or []); qq = q['question']
    has = lambda r: re.search(r, p)
    VAR = r'(?<![\u0621-\u064A])س(?![\u0621-\u064A])'  # المتغير «س» وحده (لا حرف السين داخل «احسب» أو «سعر»)
    if sid == 'math_stage_01':
        if has(r'شكل|ضلع|زاوي|مربع|مثلث|دائرة|مستطيل|🔴'): return 'shapes'
        if has(r'أكبر|أصغر|رتب|بين|المقارنة'): return 'compare'
        if re.search(r'[+−]|احسب|أعطا|زرقاء|أرجل|أصابع', qq): return 'basic_ops'
        return 'counting'
    if sid == 'math_stage_02':
        if re.search(r'[×÷]|في كل علبة|بالتساوي|لكل لعبة', qq): return 'mult_intro'
        if not qq.startswith(('احسب', 'ما ناتج', 'أكمل', 'ما العدد الناقص')) and re.search(r'مع |لدى|كان|اشتر|في المكتبة|في متجر|في الحافلة|خزان|المزرعة|أي عملية|إذا أضفنا', qq): return 'word_problems'
        if '+' in qq or 'أضفنا' in qq: return 'addition'
        return 'subtraction'
    if sid == 'math_stage_03':
        if has(r'كسر|⁄|٫|٪|محيط|متوسط|³'): return 'fractions_intro'
        ops = len(re.findall(r'[+−×÷]', qq))
        if ops >= 2 or has(r'نمط|ترتيب العمليات|زوجي|فردي|يقبل القسمة|مضاعف|قاسم|أكمل:'): return 'patterns_operations'
        if has(r'÷|باقي|وزّع|وزع'): return 'division'
        return 'multiplication'
    if sid == 'math_stage_04':
        if has(r'حل المعادلة|√'): return 'ratio_money'
        if has(r'٪|عشري|٫|نسبة مئوية'): return 'decimals_percent'
        if has(r'النسبة|ريال|سعر|ثمن|سرعة|الباقي'): return 'ratio_money'
        if has(r'كسر|⁄'): return 'fractions'
        return 'measurement_geometry'
    if sid == 'math_stage_05':
        if has(r'احتمال|الوسيط|المتوسط'): return 'ratio_percent'
        if has(r'نسبة|النسبة|٪|ريال|سعر|ثمن|ربح'): return 'ratio_percent'
        if has(r'نقطة|النقطتين|ميل|زاوي|مثلث|مسافة|إحداثي|رباعي|وتر|°'): return 'coordinates'
        if has(VAR): return 'algebra'
        return 'integers_powers'
    if sid == 'math_stage_06':
        if has(r'مشتقة|تكامل|∫|نها|نهاية'): return 'calculus'
        if has(r'دائرة|نصف قطر|وتر|ضلع مربع|مساحة'): return 'geometry_adv'
        if has(r'متوسط|وسيط|منوال|احتمال|انحراف|البيانات'): return 'statistics_probability'
        if has(r'د\(|ميل|جا |لوغاريتم'): return 'functions_trigonometry'
        if has(r'⁄') and not has(VAR): return 'fractions_adv'
        return 'quadratics_systems'

def build():
    log = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'tools/math/raw/batch-0[2-9].json'))):
        raw = json.load(open(f)); n = raw['batch']; stages = []
        for s in raw['stages']:
            sid = STAGE[s['stage_id']]; qs = []
            for q in s['questions']:
                q = dict(q)
                if q['id'] in REPLACE: q.update(REPLACE[q['id']]); log.append(f"{q['id']}: استُبدل (مكرر) ← {q['question']}")
                if q['id'] in FIX:
                    fx = dict(FIX[q['id']]); why = fx.pop('_why', ''); q.update(fx); log.append(f"{q['id']}: {why}")
                out = {'id': q['id'], 'unit_id': None, 'type': q['type'], 'prompt': tidy(q['question']),
                       'options': [tidy(o) for o in (q.get('options') or [])], 'correct_answer': tidy(q['correct_answer']),
                       'explanation': tidy(q.get('explanation', ''))}
                if q.get('alt'): out['alt'] = [tidy(a) for a in q['alt']]
                out['unit_id'] = unit(sid, {'question': out['prompt'], 'options': out['options']})
                qs.append(out)
            stages.append({'id': sid, 'name': s['stage_name'], 'units': NEW_UNITS[sid], 'questions': qs})
        dst = os.path.join(ROOT, f'data/math/batch-{n:02d}.json')
        json.dump({'bank_name': raw['bank'], 'batch': n, 'language': 'ar', 'source': f'tools/math/raw/batch-{n:02d}.json (مراجَع: tools/math/build_batches.py)', 'stages': stages},
                  open(dst, 'w'), ensure_ascii=False, indent=1)
    ix = os.path.join(ROOT, 'data/math/index.json'); j = json.load(open(ix))
    j['batches'] = ['batch-01.json'] + [os.path.basename(p) for p in sorted(glob.glob(os.path.join(ROOT, 'data/math/batch-0[2-9].json')))]
    json.dump(j, open(ix, 'w'), ensure_ascii=False)
    open(os.path.join(ROOT, 'tools/math/REVIEW.md'), 'w').write('# مراجعة بنك الرياضيات (الدفعات ٢–٦)\n\n' + '\n'.join('- ' + x for x in log) + '\n')
    print(len(log), 'تعديلات'); print('\n'.join(log))
if __name__ == '__main__': build()
