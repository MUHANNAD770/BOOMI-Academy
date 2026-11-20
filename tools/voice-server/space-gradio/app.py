# خادم «صوتي الشخصي» على Hugging Face Spaces بنوع Gradio (المجاني): هذا الملف يجلب ملفات الخادم من مستودع الموقع
# على GitHub عند التشغيل، ثم يشغّله على المنفذ 7860. لا يحتاج رفع ملفات أخرى غير هذا الملف وrequirements.txt وpackages.txt.
import os, sys, urllib.request
SRC = 'https://raw.githubusercontent.com/MUHANNAD770/BOOMI-Academy/main/tools/voice-server/'
FILES = ['app.py', 'engine.py', 'shim/torchtune/__init__.py', 'shim/torchtune/modules/__init__.py', 'shim/torchtune/modules/position_embeddings.py']
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'srv')
for f in FILES:
    p = os.path.join(D, f.replace('app.py', 'voice_app.py') if f == 'app.py' else f)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    urllib.request.urlretrieve(SRC + f, p)
sys.path.insert(0, os.path.join(D, 'shim'))  # بديل torchtune المصغّر قبل المكتبات المثبّتة
sys.path.insert(0, D)
import uvicorn, voice_app
app = voice_app.app
# عتاد ZeroGPU (المجاني) يتطلّب دالة GPU واحدة على الأقل وواجهة Gradio؛ الخادم نفسه يعمل على المعالج، فنضيفهما دون أن نغيّر عمله
try:
    import spaces
    @spaces.GPU
    def _gpu_probe():
        return 1
except Exception:
    pass
try:
    import gradio as gr
    with gr.Blocks(title='Boomi personal voice') as ui:
        gr.Markdown('🦉 خادم «صوتي الشخصي» لموقع البومة التعليمية الذكية يعمل. حالته: /health')
    app = gr.mount_gradio_app(app, ui, path='/ui')
except Exception:
    pass
uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 7860)))
