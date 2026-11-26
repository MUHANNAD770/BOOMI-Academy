# مراجعة بنك الرياضيات آليًا: يحسب كل عملية حسابية في نص السؤال ويقارنها بالإجابة، ويكشف الإجابات خارج الخيارات والأسئلة المكررة.
# التشغيل: python3 tools/math/review.py [مجلد] (الافتراضي: الدفعات الخام في tools/math/raw مع الدفعة ١)
import json, re, sys, glob, os
from fractions import Fraction as F
AD = '٠١٢٣٤٥٦٧٨٩'
def lat(s): return ''.join(str(AD.index(c)) if c in AD else c for c in s)
SUP = {'²': '**2', '³': '**3', '⁴': '**4', '⁰': '**0', '¹': '**1'}
def evaluate(expr):
    expr = re.sub(r'([\d٠-٩]+)\s*[⁄/]\s*([\d٠-٩]+)', r'(\1/\2)', expr)  # الكسر وحدة واحدة
    e = lat(expr).replace('٫', '.').replace('−', '-').replace('×', '*').replace('÷', '/').replace('⁄', '/').replace('٪', '/100')
    for k, v in SUP.items(): e = e.replace(k, v)
    e = re.sub(r'√\s*\(?([\d.]+)\)?', r'(\1)**0.5', e)
    e = re.sub(r'(\d)\s*\(', r'\1*(', e)
    if not re.fullmatch(r'[\d\s+\-*/().]+', e): return None
    e = re.sub(r'(\d+(?:\.\d+)?)', lambda m: f'F("{m.group(1)}")', e)
    try:
        v = eval(e, {'F': F})
        return F(v).limit_denominator(10000) if not isinstance(v, F) else v
    except Exception: return None
def val(ans):
    a = lat(ans).replace('٫', '.').replace('−', '-').replace('⁄', '/').strip()
    a = re.sub(r'\s*(سم²|سم³|سم|م²|ريال(?:ًا|ات)?|درجة|°|دقيقة|متر|مل|كم/ساعة)$', '', a).strip()
    m = re.fullmatch(r'(-?\d+(?:\.\d+)?)\s*/\s*(\d+)', a)
    if m: return F(m.group(1)) / F(m.group(2))
    m = re.fullmatch(r'(-?\d+(?:\.\d+)?)٪', a)
    if m: return F(m.group(1))
    m = re.fullmatch(r'-?\d+(?:\.\d+)?', a)
    return F(a) if m else None
EXPR = r'([\d٠-٩٫.\s+\-−×÷⁄/()²³⁴⁰√]+)'
def check(q):
    p = q['prompt'].strip(); a = q['correct_answer']
    m = re.match(r'^(?:احسب(?: مع مراعاة ترتيب العمليات)?:|ما ناتج|كم يساوي|ما قيمة)\s*' + EXPR + r'(?:=\s*__)?\s*[؟?.]?$', p)
    if m and re.search(r'[+\-−×÷⁄/²³⁴⁰√]', m.group(1)):
        v = evaluate(m.group(1)); w = val(a)
        if v is None or w is None: return ('?', m.group(1))
        return ('ok' if v == w else 'WRONG', f'{m.group(1).strip()} = {v} ، الإجابة {a}')
    m = re.match(r'^(?:أكمل:|ما العدد الناقص؟)\s*(.+?)$', p) or re.match(r'^([\d٠-٩ +\-−×÷_=]+)$', p)
    if m and '__' in m.group(1) and '=' in m.group(1):
        s = m.group(1); w = val(a)
        if w is None: return ('?', s)
        l, r = s.split('=', 1)
        v1, v2 = evaluate(l.replace('__', f'({w})')), evaluate(r.replace('__', f'({w})'))
        if v1 is None or v2 is None: return ('?', s)
        return ('ok' if v1 == v2 else 'WRONG', f'{s} ← {a}')
    return (None, '')
def load_all(paths):
    out = []
    for f in paths:
        b = json.load(open(f))
        for s in b['stages']:
            for q in s['questions']:
                q = dict(q); q['prompt'] = q.get('prompt') or q.get('question'); q['options'] = q.get('options') or []
                q['_stage'] = s.get('id') or s.get('stage_id'); q['_f'] = os.path.basename(f); out.append(q)
    return out
if __name__ == '__main__':
    paths = sys.argv[1:] or ['data/math/batch-01.json'] + sorted(glob.glob('tools/math/raw/batch-0[2-9].json'))
    Q = load_all(paths); bad = unk = ok = 0
    D = re.compile('[ً-ْٰـ]')
    def key(p): return re.sub(r'[\s؟?.،,:؛]', '', D.sub('', lat(p)).replace('⁄', '/').replace('−', '-').replace('أ', 'ا').replace('إ', 'ا'))
    seen = {}
    for q in Q:
        if q['type'] == 'choice' and q['correct_answer'] not in q['options']: print('✗ الإجابة خارج الخيارات', q['id'])
        if q['type'] == 'choice' and len(set(q['options'])) != len(q['options']): print('✗ خيارات مكررة', q['id'])
        r, info = check(q)
        if r == 'WRONG': bad += 1; print('✗ خطأ حسابي', q['id'], info)
        elif r == '?': unk += 1
        elif r == 'ok': ok += 1
        k = key(q['prompt']) + '|' + key(str(q['correct_answer']))
        if k in seen: print('↺ مكرر', q['id'], '=', seen[k], '«' + q['prompt'] + '»')
        else: seen[k] = q['id']
    print(f'الأسئلة {len(Q)} · عمليات تحققت آليًا {ok} · أخطاء حسابية {bad} · لم تُحلَّل {unk}')
