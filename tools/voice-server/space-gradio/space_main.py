# التشغيل الفعلي لخادم «صوتي الشخصي» على Hugging Face. يُجلب من GitHub عبر app.py القصير في المساحة،
# فأي تحديث هنا يصل للخادم بإعادة تشغيله فقط (بلا تعديل يدوي في Hugging Face).
import os, sys, urllib.request
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
    app = gr.mount_gradio_app(app, ui, path='/ui')
    mounted = True
except Exception as e:  # noqa
    print('gradio mount failed:', e, flush=True)
# إن لم تُركّب الواجهة نبلّغ ZeroGPU بأنفسنا
if spaces is not None and not mounted:
    try:
        from spaces.zero import startup
        startup()
    except Exception as e:  # noqa
        print('zerogpu startup report failed:', e, flush=True)
uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 7860)))
