#!/usr/bin/env python3
"""letters_fix.py — نطق الحروف من أ إلى ي بكل أشكالها، بصوت واضح، مع اختيار آلي لأفضل تسجيل.

لكل حرف: اسمه (بَاء)، الفتحة والكسرة والضمة، السكون (أَبْ)، الشدة مع الحركات الثلاث (أَبْ ، بَ / بِ / بُ — اختيار صاحب المشروع)،
التنوين بأنواعه الثلاثة (يُنطق بَنْ بُنْ بِنْ)، والمدّ (بَا بُو بِي).
الصوت: ar-QA-MoazNeural (اختيار صاحب المشروع للمقاطع؛ في القياس نطق الحركات صحيحًا ٢٩/٣٠ مقابل ٢٢/٣٠ لصوت حامد).

لكل عنصر نولّد عدة نسخ (منفردة بسرعتين، وداخل قائمة كما يقرأ المعلّم ثم نقسمها) ونختار:
  • المقاطع: نموذج تعرّف الأصوات (wav2vec2 espeak) — الحركة الأولى يجب أن تطابق (فتحة a، كسرة i، ضمة u)، والتنوين فيه n.
  • أسماء الحروف: Whisper — أقرب نص إلى اسم الحرف.

الاستعمال (يحتاج transformers وtorch):
  python3 letters_fix.py spec2.json <مجلد العمل>        ← <مجلد>/out/male/<key>.mp3 و<مجلد>/phr.json و<مجلد>/report.json
  ثم: REPLACE=1 WHO=male PHR=<مجلد>/phr.json python3 tools/clips/pack.py audio/clips <إصدار> append
spec2.json: [{t, kind, eng:[نصوص للمحرك], l, k}] (المفتاح k من HurufiClips.key في المتصفح).
"""
import asyncio, edge_tts, os, sys, json, subprocess, re, unicodedata
import numpy as np

VOICE = os.environ.get('SYL_VOICE', 'ar-QA-MoazNeural')
P = os.environ.get('HTTPS_PROXY')
SR = 16000
spec = json.load(open(sys.argv[1], encoding='utf8'))
W = sys.argv[2]
os.makedirs(os.path.join(W, 'cand'), exist_ok=True)
os.makedirs(os.path.join(W, 'out', 'male'), exist_ok=True)
TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse'


def pcm(path, sr=SR):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(b, np.int16).astype(np.float32) / 32768


def enc(y, out, sr=24000):
    y = y.copy()
    f = min(len(y) // 5, int(.03 * sr))
    if f > 0:
        y[-f:] *= np.linspace(1, 0, f)
    y = np.concatenate([y, np.zeros(int(.03 * sr), np.float32)])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '48k',
                    '-write_xing', '0', '-id3v2_version', '0', out], input=(np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())


def split(x, n, sr=24000):
    h, w = 120, 240
    e = np.array([np.sqrt(np.mean(x[i:i + w] ** 2)) for i in range(0, max(1, len(x) - w), h)])
    on = e > e.max() * 0.04
    segs, i = [], 0
    gap = int(0.09 * sr / h)
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and (on[j] or any(on[j:j + gap])):
                j += 1
            segs.append((i * h, min(len(x), j * h + w)))
            i = j
        else:
            i += 1
    segs = [s for s in segs if s[1] - s[0] > 0.06 * sr]
    return segs if len(segs) == n else None


VOICES = os.environ.get('SYL_VOICES', 'ar-QA-MoazNeural,ar-OM-AbdullahNeural,ar-BH-AliNeural,ar-AE-HamdanNeural').split(',')


async def tts(text, out, rate, sem, voice=VOICE):
    if os.path.exists(out) and os.path.getsize(out) > 300:  # نسخة موجودة من تشغيل سابق
        return out
    async with sem:
        for a in range(4):
            try:
                await edge_tts.Communicate(text, voice, rate=rate, proxy=P).save(out + '.raw.mp3')
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out + '.raw.mp3', '-af', TRIM, '-ac', '1', '-ar', '24000',
                                '-c:a', 'libmp3lame', '-b:a', '48k', '-write_xing', '0', '-id3v2_version', '0', out])
                os.remove(out + '.raw.mp3')
                return out if os.path.exists(out) and os.path.getsize(out) > 300 else None
            except Exception:
                await asyncio.sleep(2 + 2 * a)
    return None


async def gen():
    """لكل عنصر نسخ بعدة أصوات: منفردة ببطء (-25%)، وداخل قائمة «جَ ، جِ ، جُ» (-20%) ثم نقسمها. cands[i] = [(ملف، صوت)]"""
    sem = asyncio.Semaphore(int(os.environ.get('CONC', '10')))
    jobs, cands = [], {i: [] for i in range(len(spec))}
    for vi, v in enumerate(VOICES):
        for i, s in enumerate(spec):
            for j, e in enumerate(s['eng']):
                f = os.path.join(W, 'cand', f'{i}_{j}_v{vi}.mp3')
                cands[i].append((f, v))
                jobs.append(tts(e, f, '-25%' if s['kind'] != 'name' else '-15%', sem, v))
        groups = {}
        for i, s in enumerate(spec):
            g = {'fa': 'v', 'ka': 'v', 'da': 'v', 'tf': 't', 'td': 't', 'tk': 't', 'mf': 'm', 'md': 'm', 'mk': 'm'}.get(s['kind'])
            if g:
                groups.setdefault((s['l'], g), []).append(i)
        for (l, g), idx in groups.items():
            if len(idx) < 2:
                continue
            f = os.path.join(W, 'cand', f'list_{ord(l[0])}_{g}_v{vi}.mp3')
            jobs.append(tts(' ، '.join(spec[i]['eng'][0] for i in idx), f, '-20%', sem, v))
            cands.setdefault(('L', f), (idx, v))
    await asyncio.gather(*jobs)
    for key in [k for k in cands if isinstance(k, tuple)]:
        f = key[1]
        idx, v = cands.pop(key)
        if not os.path.exists(f):
            continue
        x = pcm(f, 24000)
        segs = split(x, len(idx))
        if not segs:
            continue
        for (a, b), i in zip(segs, idx):
            o = f.replace('.mp3', f'_{i}.mp3')
            enc(x[a:b], o)
            cands[i].insert(0, (o, v))
    return cands


VOW = {'a': set('aɛæɑʌ'), 'i': set('ieɪ'), 'u': set('uoʊyɔ')}
VOWELS = 'aɛæɑʌieɪuoʊyɔəɜœøɨ'
EXP = {'fa': 'a', 'ka': 'i', 'da': 'u', 'tf': 'a', 'td': 'u', 'tk': 'i', 'mf': 'a', 'md': 'u', 'mk': 'i', 'su': 'a', 'shf': 'a', 'shk': 'i', 'shd': 'u'}
# الصوت الساكن المتوقَّع كما يسمعه نموذج تعرّف الأصوات (مع التباساته المعروفة). None = لا يميّزه النموذج (ح ع ه ء)، فنكتفي بالحركة.
CONS = {'ب': 'b', 'ت': 't', 'ث': 'θ|f', 'ج': 'dʒ|ʒ', 'ح': None, 'خ': 'x|χ|k|h', 'د': 'd', 'ذ': 'ð|v|z', 'ر': 'r|ɾ', 'ز': 'z', 'س': 's', 'ش': 'ʃ',
        'ص': 's', 'ض': 'd|ð', 'ط': 't', 'ظ': 'ð|z|v', 'ع': None, 'غ': 'ɣ|ʁ|ɡ|r|x', 'ف': 'f', 'ق': 'q|k|ɢ', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
        'ه': None, 'و': 'w|u|v', 'ي': 'j|i', 'أ': None}
# أصوات خاطئة صريحة: «ج» تُنطق g (لهجة)، و«ث» تُنطق s أو t (لهجة)، و«ذ» d، و«ق» ɡ
WRONG = {'ج': 'ɡ', 'ث': 's|t', 'ذ': 'd', 'ق': 'ɡ', 'ظ': 'd'}
strip = lambda t: re.sub('[\u064B-\u0652\u0670ـ]', '', unicodedata.normalize('NFC', t)).replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا').strip(' .،؟!')


def lev(a, b):
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[-1]


def slow(f, out, d):
    """المقطع القصير جدًّا يُبطَّأ قليلًا (بلا تغيير طبقة الصوت) ليُسمع واضحًا"""
    # التمطيط (atempo) يشوّه المقطع القصير فيسمع النموذج الفتحة كسرة؛ البطء يأتي من سرعة المحرك (-25%) لا من التمطيط
    t = 1.0 if not os.environ.get('SYL_STRETCH') else (0.8 if d < 0.32 else 0.88 if d < 0.45 else 1.0)
    af = f'atempo={t}' if t < 1 else 'anull'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af', af, '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '48k',
                    '-write_xing', '0', '-id3v2_version', '0', out])


def main():
    cands = asyncio.run(gen())
    import torch
    from transformers import AutoProcessor, AutoModelForCTC, pipeline
    M = 'facebook/wav2vec2-xlsr-53-espeak-cv-ft'
    proc, model = AutoProcessor.from_pretrained(M), AutoModelForCTC.from_pretrained(M).eval()
    asr = pipeline('automatic-speech-recognition', model='openai/whisper-medium', device='cpu')

    def phon(f):
        a = pcm(f)
        a = np.concatenate([np.zeros(3200, np.float32), a, np.zeros(3200, np.float32)])
        with torch.no_grad():
            ids = model(proc(a, sampling_rate=SR, return_tensors='pt').input_values).logits.argmax(-1)
        return proc.batch_decode(ids)[0]

    def score(s, f):
        d = len(pcm(f)) / SR
        if s['kind'] == 'name':
            a = pcm(f)
            a = np.concatenate([np.zeros(8000, np.float32), a, np.zeros(8000, np.float32)])
            t = asr({'raw': a, 'sampling_rate': SR}, generate_kwargs={'language': 'arabic', 'task': 'transcribe', 'max_new_tokens': 10})['text']
            want = strip(s['eng'][1] if len(s['eng']) > 1 else s['eng'][0])
            got = strip(t).replace(' ', '')
            sc = 1 - lev(got, want) / max(len(want), len(got), 1)
            p = phon(f).replace(' ', '')
            l = s['l']
            if CONS.get(l) and re.match('^(' + CONS[l] + ')', p):
                sc += 0.5
            if WRONG.get(l) and re.search(WRONG[l], p[:3]):
                sc -= 0.8
            return sc + (0.1 if 0.3 < d < 1.3 else -0.5), t + ' /' + p
        p = phon(f)
        q = p.replace(' ', '').replace('ː', '')
        k, l = s['kind'], s['l']
        e = VOW[EXP[k]]
        v = [c for c in q if c in VOWELS]
        sc = 0.0
        cons = CONS.get(l)
        body = q
        if k == 'su' or k.startswith('sh'):  # «أَبْ» / «أَبْ ، بِ»: نبدأ بفتحة ثم الحرف
            sc += 1 if v and v[0] in VOW['a'] else 0
            body = q[1:] if q[:1] in VOWELS else q
            if cons:
                sc += 2 if re.search('(' + cons + ')', body) else 0
            if k.startswith('sh'):
                sc += 2 if v and v[-1] in e else 0
            else:
                sc += 1 if not re.search('[' + VOWELS + ']', body) else -0.5  # الساكن لا حركة بعده
        else:
            if cons:
                sc += 2 if re.match('^(' + cons + ')', q) else (0.5 if re.search('(' + cons + ')', q) else 0)
            sc += 2 if v and v[0] in e else 0
            if k in ('fa', 'ka', 'da'):  # مقطع مفتوح: لا شيء بعد الحركة (وإلا فهو اسم الحرف مثل «جيم»)
                tail = q[q.find(v[0]) + 1:] if v else q
                sc += 1 if not re.search('[^' + VOWELS + 'ʔ]', tail) else -1.5
                sc += 0.5 if d < 0.75 else -1
            if k in ('tf', 'td', 'tk'):
                sc += 1 if 'n' in q else 0
            if k in ('mf', 'md', 'mk'):
                sc += 0.3 if d > 0.3 else 0
        if WRONG.get(l) and re.search('^(' + WRONG[l] + ')', body):
            sc -= 2
        sc += 0.2 if 0.12 < d < 1.4 else -1
        return sc, p

    # كل حرف بصوت واحد لكل أشكاله: نختار الصوت صاحب أعلى مجموع، ثم أفضل نسخة لكل شكل بذلك الصوت
    scored = {}
    for i, s in enumerate(spec):
        for f, v in cands.get(i, []):
            if os.path.exists(f):
                scored.setdefault(i, []).append((score(s, f), f, v))
    by_letter = {}
    for i, s in enumerate(spec):
        by_letter.setdefault(s['l'], []).append(i)
    phr, rep = [], []
    for l, idx in by_letter.items():
        tot = {}
        for i in idx:
            best = {}
            for (sc, info), f, v in scored.get(i, []):
                best[v] = max(best.get(v, -9), sc)
            for v, sc in best.items():
                tot[v] = tot.get(v, 0) + sc
        voice = max(tot, key=tot.get) if tot else VOICE
        for i in idx:
            s = spec[i]
            thr = 4 if s['kind'] in ('fa', 'ka', 'da') and CONS.get(l) else 3 if s['kind'] != 'name' else 0.9
            opts = [x for x in scored.get(i, []) if x[2] == voice] or scored.get(i, [])
            if not opts:
                rep.append({'t': s['t'], 'kind': s['kind'], 'fail': 'no audio'})
                continue
            (sc, info), f, v = max(opts, key=lambda x: x[0][0])
            if sc < thr and scored.get(i):  # صوت الحرف أخطأ في هذا الشكل: نأخذ أفضل نسخة من صوت آخر
                alt = max(scored[i], key=lambda x: x[0][0])
                if alt[0][0] >= thr:
                    (sc, info), f, v = alt
            out = os.path.join(W, 'out', 'male', s['k'] + '.mp3')
            if s['kind'] == 'name':
                subprocess.run(['cp', f, out])
            else:
                slow(f, out, len(pcm(f)) / SR)
            phr.append([s['k'], [s['eng'][0], 'ar']])
            ok = sc >= thr
            rep.append({'t': s['t'], 'kind': s['kind'], 'voice': v.split('-')[2], 'score': round(sc, 2), 'info': info, 'ok': ok})
            print(f"{s['t']:8} {s['kind']:4} {v.split('-')[2][:7]:7} {sc:5.2f} {'✓' if ok else '✗'} {info[:34]}", flush=True)
    json.dump(phr, open(os.path.join(W, 'phr.json'), 'w', encoding='utf8'), ensure_ascii=False)
    json.dump(rep, open(os.path.join(W, 'report.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print('done', len(phr), 'weak', sum(1 for r in rep if not r.get('ok')))


if __name__ == '__main__':
    main()
