# خريطة حركات التاء المربوطة في الوصل لجمل الموقع الثابتة، بأداة التشكيل CATT (Apache-2.0، تعمل بلا إنترنت):
#   pip install catt-tashkeel  ثم: python build_map.py phrases.json ../../voices/tm-map.json
# phrases.json: قائمة النصوص كما تُنطق (أو [[نص, ...], ...]). نأخذ من CATT حركة التاء المربوطة فقط في الكلمات غير المشكولة
# المتبوعة بكلمة؛ بقية الكلمات والوقف تعالجها voices/tamarbuta.js. حركات مقبولة: فتحة/ضمة/كسرة وتنوينها.
import json, re, sys, warnings
warnings.filterwarnings('ignore')
from catt_tashkeel import CATTEncoderDecoder
TA = 'ة'; HAR = re.compile('[ً-ْٰ]'); OK = set('ًٌٍَُِ')
PU = '«»"\'()[].!؟?،,:;؛…'
src = json.load(open(sys.argv[1]))
texts = [x[0] if isinstance(x, list) else x for x in src]
ed = CATTEncoderDecoder()
def bare_ta(w):
    return re.search(TA + '[' + re.escape(PU) + ']*$', w) is not None
out = {}; stat = {'phr': 0, 'set': 0, 'miss': 0}
plain = lambda s: re.sub('[' + re.escape(PU) + ']', ' ', HAR.sub('', s))
B = 32
for b in range(0, len(texts), B):
    chunk = texts[b:b + B]
    pred = ed.do_tashkeel_batch([' '.join(plain(t).split()) for t in chunk], verbose=False)
    for t, p in zip(chunk, pred):
        ws = t.split(' '); pw = p.split(' '); ch = False
        # الكلمات بلا علامات الترقيم؛ نطابق بالترتيب (عدد الكلمات نفسه بعد حذف الترقيم)
        idx = [i for i, w in enumerate(ws) if plain(w).strip()]
        if len(idx) != len(pw):
            stat['miss'] += 1; continue
        for k, i in enumerate(idx):
            w = ws[i]
            if not bare_ta(w) or i == len(ws) - 1: continue
            tail = w[w.rfind(TA) + 1:]
            if re.search('[.!؟?،,:;؛…]', tail): continue  # وقف
            m = re.search(TA + '([ً-ْ])+', pw[k])
            v = m.group(0)[1:] if m else ''
            v = ''.join(c for c in v if c in OK)[:1]
            if v:
                j = w.rfind(TA); ws[i] = w[:j + 1] + v + w[j + 1:]; ch = True; stat['set'] += 1
        if ch:
            out[' '.join(t.split()).strip()] = ' '.join(ws); stat['phr'] += 1
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, separators=(',', ':'), sort_keys=True)
print(stat)
