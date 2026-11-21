# التشغيل الفعلي لخادم «صوتي الشخصي» على Hugging Face. يُجلب من GitHub عبر app.py القصير في المساحة،
# فأي تحديث هنا يصل للخادم بإعادة تشغيله فقط (بلا تعديل يدوي في Hugging Face).
import os, sys, urllib.request
# Gradio الحديث يشغّل خادم Node.js (العرض المسبق SSR) على المنفذ 7860 نفسه فيتعارض مع خادمنا (address already in use): نعطّله
os.environ['GRADIO_SSR_MODE'] = 'false'
# ١) عتاد ZeroGPU المجاني: يجب استيراد spaces أولًا (قبل torch)، ووجود دالة @spaces.GPU واحدة على الأقل
spaces = None
try:
    import spaces
    @spaces.GPU
    def _gpu_probe():
        return 1
except Exception as e:  # noqa
    print('spaces unavailable:', e, flush=True)
# ٢) ملفات الخادم من مستودع الموقع
SRC = 'https://raw.githubusercontent.com/MUHANNAD770/BOOMI-Academy/main/tools/voice-server/'
FILES = ['app.py', 'engine.py', 'shim/torchtune/__init__.py', 'shim/torchtune/modules/__init__.py', 'shim/torchtune/modules/position_embeddings.py']
D = os.path.join(os.getcwd(), 'srv')
for f in FILES:
    p = os.path.join(D, 'voice_app.py' if f == 'app.py' else f)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    urllib.request.urlretrieve(SRC + f, p)
sys.path.insert(0, os.path.join(D, 'shim'))
sys.path.insert(0, D)
import uvicorn, voice_app
app = voice_app.app
# ٣) واجهة Gradio صغيرة: على ZeroGPU تضيف وسيطًا يبلّغ المنصة عند بدء التشغيل
mounted = False
try:
    import gradio as gr
    with gr.Blocks(title='Boomi personal voice') as ui:
        gr.Markdown('Boomi personal voice server is running. Status: /health')
        # ZeroGPU يكتشف دوال GPU من أحداث واجهة Gradio نفسها: نربط الدالة بزر
        if spaces is not None:
            _b = gr.Button('GPU check')
            _o = gr.Number(label='GPU')
            _b.click(_gpu_probe, None, _o)
    # في المسار الرئيسي (/): المنصة تقرأ إعدادات الواجهة من /config؛ مسارات الخادم (/health، /enroll، /tts) لها الأولوية
    try:
        app = gr.mount_gradio_app(app, ui, path='/', ssr_mode=False)
    except TypeError:
        app = gr.mount_gradio_app(app, ui, path='/')
    mounted = True
except Exception as e:  # noqa
    print('gradio mount failed:', e, flush=True)
# نبلّغ ZeroGPU بأنفسنا دائمًا: في إصدارات Gradio الحديثة لا يضيف تركيب الواجهة هذا الإبلاغ تلقائيًا
# (فتظهر الرسالة: No @spaces.GPU function detected during startup)
if spaces is not None:
    try:
        from spaces.zero import startup
        startup()
    except Exception as e:  # noqa
        print('zerogpu startup report failed:', e, flush=True)
uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 7860)))
