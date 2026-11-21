# خادم «صوتي الشخصي» على Hugging Face: يجلب ملف التشغيل من مستودع الموقع على GitHub ويشغّله.
# (لا حاجة لتعديل هذا الملف مستقبلًا: التحديثات تُنشر في GitHub وتصل بإعادة تشغيل المساحة)
import urllib.request
SRC = 'https://raw.githubusercontent.com/MUHANNAD770/BOOMI-Academy/main/tools/voice-server/space-gradio/space_main.py'
exec(compile(urllib.request.urlopen(SRC).read().decode('utf-8'), 'space_main.py', 'exec'))
