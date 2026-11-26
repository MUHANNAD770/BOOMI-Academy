# خادم «صوتي الشخصي» لموقع البومة التعليمية الذكية — مجاني ومفتوح المصدر، يعمل على Hugging Face Spaces (CPU مجاني) أو أي حاسوب.
#  POST /enroll : تسجيل صوتي (5–15 ث) + نصّه ← بصمة صوتية (رموز مرجعية) موقّعة. التسجيل الخام لا يُحفظ.
#  POST /tts    : بصمة موقّعة + نص ← صوت MP3 بصوت صاحب التسجيل (مع ذاكرة للجمل المتكررة).
# الحماية: VOICE_SECRET سرّ مشترك مع Netlify فقط (لا يوجد في GitHub ولا في المتصفح):
#  • /enroll يتطلّب تذكرة قصيرة العمر تصدرها دالة Netlify (myvoice.mjs).
#  • /tts يقبل فقط بصمات وقّعها هذا الخادم (لا يمكن استعماله بصوت شخص آخر أو كخادم عام).
import asyncio, hashlib, hmac, json, os, re, subprocess, tempfile, time
from collections import OrderedDict, defaultdict
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

SECRET = os.environ.get('VOICE_SECRET', '').encode()
DEV = os.environ.get('DEV_OPEN') == '1'  # للتجربة على الحاسوب فقط: يقبل بلا تذكرة
ORIGINS = [o.strip() for o in os.environ.get('ALLOW_ORIGINS', 'https://boomi-academy.netlify.app').split(',') if o.strip()]
CACHE_DIR = os.environ.get('CACHE_DIR', '/tmp/voice-cache')
os.makedirs(CACHE_DIR, exist_ok=True)

app = FastAPI(title='Boomi personal voice')
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_origin_regex=r'https://[a-z0-9-]+--boomi-academy\.netlify\.app' if not DEV else r'.*',
                   allow_methods=['GET', 'POST'], allow_headers=['content-type'])
E = None
BUSY = {'n': 0, 'last': 0.0}


@app.middleware('http')
async def _busy(req, call_next):
    # نعدّ الطلبات الجارية: التحديث التلقائي لا يعيد تشغيل الخادم أثناء إنشاء صوت أو توليد جملة
    BUSY['n'] += 1; BUSY['last'] = time.time()
    try:
        return await call_next(req)
    finally:
        BUSY['n'] -= 1; BUSY['last'] = time.time()
STATE = {'ready': False, 'err': ''}
REV = os.environ.get('VOICE_REV', '')


def load():
    global E
    try:
        from engine import Engine
        E = Engine(); STATE['ready'] = True
        # قياس السرعة مرة واحدة (يظهر في /health): ثوانٍ لكل ثانية صوت — للتشخيص فقط
        try:
            t = time.time(); w = np.zeros(16000 * 3, np.float32); w[::50] = 0.1; E.encode(w)
            STATE['speed'] = {'encode_3s': round(time.time() - t, 1)}
        except Exception as e:  # noqa
            STATE['speed'] = {'err': str(e)[:100]}
    except Exception as e:  # noqa
        STATE['err'] = str(e)[:300]


@app.on_event('startup')
async def _start():
    asyncio.get_running_loop().run_in_executor(None, load)


def sign(*parts):
    return hmac.new(SECRET, '|'.join(parts).encode(), hashlib.sha256).hexdigest()


def voice_id(codes, ref_text):
    return hashlib.sha256((json.dumps(codes) + '|' + ref_text).encode()).hexdigest()


# حدّ بسيط لكل عنوان IP: يمنع إساءة الاستخدام دون أن يعيق الطالب
HITS = defaultdict(list)


def limit(req: Request, n, per):
    if DEV:
        return
    ip = (req.headers.get('x-forwarded-for') or (req.client.host if req.client else '')).split(',')[0].strip()
    now = time.time(); h = [t for t in HITS[ip] if now - t < per]
    if len(h) >= n:
        raise HTTPException(429, 'busy')
    h.append(now); HITS[ip] = h


def need_ready():
    if not STATE['ready']:
        raise HTTPException(503, 'loading' if not STATE['err'] else 'error')


@app.get('/')
@app.get('/health')
def health():
    import engine as _eg  # noqa
    return {'ok': True, 'ready': STATE['ready'], 'err': STATE['err'], 'backend': getattr(E, 'backend', None), 'configured': bool(SECRET) or DEV,
            'threads': getattr(_eg, 'THREADS', None) if STATE['ready'] else None, 'cpu_count': os.cpu_count(), 'rev': REV, 'speed': STATE.get('speed')}


def to16k(raw: bytes):
    with tempfile.NamedTemporaryFile(suffix='.in') as f:
        f.write(raw); f.flush()
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f.name, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-20:TP=-2',
                            '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, timeout=60)
    if r.returncode != 0 or not r.stdout:
        raise HTTPException(400, 'bad_audio')
    return np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768


@app.post('/enroll')
async def enroll(req: Request, audio: UploadFile = File(...), ref_text: str = Form(...), ticket: str = Form(''), exp: str = Form('0')):
    limit(req, 6, 3600)
    if not DEV:
        if not SECRET:
            raise HTTPException(503, 'not_configured')
        if not exp.isdigit() or int(exp) < time.time() or not hmac.compare_digest(sign('enroll', exp), ticket):
            raise HTTPException(403, 'ticket')
    need_ready()
    raw = await audio.read()
    if len(raw) > 12 * 1024 * 1024:
        raise HTTPException(413, 'too_big')
    ref_text = ' '.join(ref_text.split())[:400]
    if len(ref_text) < 8:
        raise HTTPException(400, 'text')
    w = await asyncio.get_running_loop().run_in_executor(None, to16k, raw)
    dur = len(w) / 16000
    if dur < 4:
        raise HTTPException(400, 'too_short')
    if float(np.sqrt(np.mean(w ** 2))) < 0.01:
        raise HTTPException(400, 'silent')
    codes = await asyncio.get_running_loop().run_in_executor(None, E.encode, w)
    vid = voice_id(codes, ref_text)
    return {'codes': codes, 'ref_text': ref_text, 'vid': vid, 'vt': sign('voice', vid), 'dur': round(min(dur, 15), 1)}


MEM = OrderedDict()


def mp3(w):
    pcm = (np.clip(w, -1, 1) * 32767).astype(np.int16).tobytes()
    r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', '-',
                        '-af', 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse',
                        '-c:a', 'libmp3lame', '-b:a', '48k', '-f', 'mp3', '-'], input=pcm, capture_output=True, timeout=60)
    return r.stdout


def prep(text, lang):
    t = ' '.join(str(text).split())[:300]
    # الكلمة المنفردة: نقطة في آخرها تجعل النموذج ينطقها كاملة بوقفة طبيعية (أوضح من الكلمة العارية)
    if t and t[-1] not in '.!?؟،,:;' and len(t.split()) <= 3:
        t += '.'
    return t


@app.post('/tts')
async def tts(req: Request):
    try:
        return await _tts(req)
    except HTTPException:
        raise
    except Exception as e:  # noqa — سبب الخطأ يُعاد للتشخيص (بلا بيانات حساسة)
        import traceback
        tb = traceback.format_exc().strip().splitlines()[-3:]
        return JSONResponse({'detail': 'tts_error', 'error': f'{type(e).__name__}: {e}'[:300], 'where': tb}, status_code=500)


async def _tts(req: Request):
    limit(req, 240, 600)
    try:
        b = await req.json()
    except Exception:
        raise HTTPException(400, 'json')
    codes, rt, vt = b.get('codes'), str(b.get('ref_text', '')), str(b.get('vt', ''))
    if not isinstance(codes, list) or not codes or len(codes) > 900 or not all(isinstance(c, int) and 0 <= c < 65536 for c in codes):
        raise HTTPException(400, 'voice')
    vid = voice_id(codes, rt)
    if not DEV and not hmac.compare_digest(sign('voice', vid), vt):
        raise HTTPException(403, 'voice')
    text = prep(b.get('text', ''), b.get('lang', 'ar'))
    if not text:
        raise HTTPException(400, 'text')
    k = hashlib.sha256((vid + '|' + text).encode()).hexdigest()
    p = os.path.join(CACHE_DIR, k + '.mp3')
    if k in MEM:
        MEM.move_to_end(k); data = MEM[k]
    elif os.path.exists(p):
        data = open(p, 'rb').read()
    else:
        need_ready()
        temp = 0.35 if len(text.split()) <= 3 else 0.55
        w = await asyncio.get_running_loop().run_in_executor(None, lambda: E.speak(rt, codes, text, temp))
        # مدّ الحروف أو التمتمة: صوت أطول كثيرًا مما يحتاجه عدد الحروف ← نعيد التوليد بحرارة أقل ونأخذ الأقصر
        letters = len(re.findall(r'[\u0621-\u064AA-Za-z]', text))
        limit = 0.8 + letters * 0.16
        if len(w) / 24000 > limit:
            w2 = await asyncio.get_running_loop().run_in_executor(None, lambda: E.speak(rt, codes, text, 0.25))
            if len(w2) < len(w):
                w = w2
        data = await asyncio.get_running_loop().run_in_executor(None, mp3, w)
        if not data:
            raise HTTPException(500, 'encode')
        try:
            open(p, 'wb').write(data)
        except OSError:
            pass
    MEM[k] = data
    while len(MEM) > 300:
        MEM.popitem(last=False)
    return Response(data, media_type='audio/mpeg', headers={'cache-control': 'private, max-age=31536000'})


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 7860)))
