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


async def tts(text, out, rate, sem):
    async with sem:
        for a in range(4):
            try:
                await edge_tts.Communicate(text, VOICE, rate=rate, proxy=P).save(out + '.raw.mp3')
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out + '.raw.mp3', '-af', TRIM, '-ac', '1', '-ar', '24000',
                                '-c:a', 'libmp3lame', '-b:a', '48k', '-write_xing', '0', '-id3v2_version', '0', out])
                os.remove(out + '.raw.mp3')
                return out if os.path.exists(out) and os.path.getsize(out) > 300 else None
            except Exception:
                await asyncio.sleep(2 + 2 * a)
    return None


async def gen():
    sem = asyncio.Semaphore(int(os.environ.get('CONC', '10')))
    jobs, cands = [], {}
    for i, s in enumerate(spec):
        cands[i] = []
        for j, e in enumerate(s['eng']):
            for r, rate in (('a', '-5%'), ('b', '-20%')):
                f = os.path.join(W, 'cand', f'{i}_{j}{r}.mp3')
                cands[i].append(f)
                jobs.append(tts(e, f, rate, sem))
    # داخل قائمة كما يقرأ المعلّم: «بَ ، بِ ، بُ» ثم نقسم (للحركات والتنوين والمدّ)
    groups = {}
    for i, s in enumerate(spec):
        g = {'fa': 'v', 'ka': 'v', 'da': 'v', 'tf': 't', 'td': 't', 'tk': 't', 'mf': 'm', 'md': 'm', 'mk': 'm'}.get(s['kind'])
        if g:
            groups.setdefault((s['l'], g), []).append(i)
    lists = []
    for (l, g), idx in groups.items():
        if len(idx) < 2:
            continue
        f = os.path.join(W, 'cand', f'list_{ord(l[0])}_{g}.mp3')
        lists.append((f, idx))
        jobs.append(tts(' ، '.join(spec[i]['eng'][0] for i in idx), f, '-5%', sem))
    await asyncio.gather(*jobs)
    for f, idx in lists:
        if not os.path.exists(f):
            continue
        x = pcm(f, 24000)
        segs = split(x, len(idx))
        if not segs:
            continue
        for (a, b), i in zip(segs, idx):
            o = f.replace('.mp3', f'_{i}.mp3')
            enc(x[a:b], o)
            cands[i].insert(0, o)
    return cands


VOW = {'a': set('aɛæɑʌ'), 'i': set('ieɪ'), 'u': set('uoʊyɔ')}
EXP = {'fa': 'a', 'ka': 'i', 'da': 'u', 'tf': 'a', 'td': 'u', 'tk': 'i', 'mf': 'a', 'md': 'u', 'mk': 'i', 'su': 'a', 'shf': 'a', 'shk': 'i', 'shd': 'u'}
strip = lambda t: re.sub('[ً-ْٰـ]', '', unicodedata.normalize('NFC', t)).replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا').strip(' .،؟!')


def lev(a, b):
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[-1]


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
            sc = 1 - lev(got, want) / max(len(want), len(got), 1) + (0.2 if want.rstrip('ء') and got.startswith(want.rstrip('ء')) else 0)
            return sc + (0.1 if 0.3 < d < 1.3 else -0.5), t
        p = phon(f)
        v = [c for c in p.replace(' ', '').replace('ː', '') if c in 'aɛæɑʌieɪuoʊyɔ']
        e = VOW[EXP[s['kind']]]
        k = s['kind']
        sc = 0.0
        if k.startswith('sh'):  # «أَبْ ، بِ»: الحركة الأخيرة هي حركة الشدة
            sc += 2 if v and v[-1] in e else 0
            sc += 0.5 if v and v[0] in VOW['a'] else 0
        elif k == 'su':
            sc += 2 if v and v[0] in e and len(p.split()) >= 2 else 0
        else:
            sc += 2 if v and v[0] in e else 0
        if k in ('tf', 'td', 'tk'):
            sc += 1 if 'n' in p else 0
        if k in ('mf', 'md', 'mk'):
            sc += 0.3 if d > 0.3 else 0
        sc += 0.2 if 0.12 < d < 1.4 else -1
        return sc, p

    phr, rep = [], []
    for i, s in enumerate(spec):
        best = None
        for f in cands.get(i, []):
            if not os.path.exists(f):
                continue
            sc, info = score(s, f)
            if best is None or sc > best[0] + 1e-9:
                best = (sc, f, info)
        if not best:
            rep.append({'t': s['t'], 'kind': s['kind'], 'fail': 'no audio'})
            continue
        out = os.path.join(W, 'out', 'male', s['k'] + '.mp3')
        subprocess.run(['cp', best[1], out])
        phr.append([s['k'], [s['eng'][0], 'ar']])
        ok = best[0] >= (2.2 if s['kind'] != 'name' else 0.75)
        rep.append({'t': s['t'], 'kind': s['kind'], 'score': round(best[0], 2), 'info': best[2], 'pick': os.path.basename(best[1]), 'ok': ok})
        print(f"{s['t']:8} {s['kind']:4} {best[0]:5.2f} {'✓' if ok else '✗'} {best[2][:30]}  ← {os.path.basename(best[1])}", flush=True)
    json.dump(phr, open(os.path.join(W, 'phr.json'), 'w', encoding='utf8'), ensure_ascii=False)
    json.dump(rep, open(os.path.join(W, 'report.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print('done', len(phr), 'weak', sum(1 for r in rep if not r.get('ok')))


if __name__ == '__main__':
    main()
