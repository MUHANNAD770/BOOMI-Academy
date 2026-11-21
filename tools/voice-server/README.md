---
title: Boomi Personal Voice
emoji: 🦉
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# خادم «صوتي الشخصي» — البومة التعليمية الذكية

يستنسخ صوت المستخدم من تسجيل قصير (6–15 ثانية) ليتكلّم به بومي في كل الموقع، بالعربية والإنجليزية.

- **النموذج:** [Audar-TTS-V1-Flash](https://huggingface.co/audarai/Audar-TTS-V1-Flash) (‏553 مليون معامل، نسخة GGUF Q8 عبر llama.cpp)
  - الترخيص: AudarAI Open License v1.0، ويسمح بالاستخدام التجاري وإعادة التوزيع.
  - يُستعمل باستنساخ الصوت بموافقة صاحبه فقط.
- **المرمِّز الصوتي:** [NeuCodec](https://huggingface.co/neuphonic/neucodec) (Apache-2.0).
  - يُحمَّل الملف الرسمي إذا توفّر رمز Hugging Face قَبِل صاحبه شروطه.
  - وإلا تُحمَّل نسخة مطابقة له بايتًا ببايت، مع التحقق من SHA-256.
- **التكلفة:** بلا رسوم لكل جملة. يعمل على المعالج (CPU) في Hugging Face Spaces المجاني أو على أي حاسوب.

## التشغيل على Hugging Face Spaces (مجانًا)

> **ملاحظة:** نوع Docker صار مدفوعًا في Hugging Face. استخدم نوع **Gradio** مع الملفات الثلاثة في `space-gradio/` (app.py وrequirements.txt وpackages.txt)، وهي تجلب بقية ملفات الخادم من GitHub تلقائيًا.


1. أنشئ حسابًا مجانيًا على huggingface.co.
2. **New Space**:
   - الاسم مثلًا `boomi-voice`.
   - **Docker** ← **Blank**.
   - العتاد **CPU basic (Free)**.
   - الظهور **Public**، لأن الموقع يتصل به مباشرة. الحماية بالتوقيع لا بالخصوصية.
3. ارفع ملفات هذا المجلد كما هي (Files ← Add file ← Upload files):
   - `app.py`
   - `engine.py`
   - `requirements.txt`
   - `Dockerfile`
   - `README.md`
   - مجلد `shim/`
4. من **Settings ← Variables and secrets ← New secret** أضف:
   - `VOICE_SECRET`: كلمة سرّ طويلة تختارها أنت (30 حرفًا أو أكثر)، وتضع القيمة نفسها في Netlify باسم `VOICE_SECRET`. لا تضعها في GitHub ولا في المحادثة.
   - اختياريًا `HF_TOKEN`: رمز قراءة من حسابك، بعد قبول شروط neuphonic/neucodec.
5. انتظر انتهاء البناء (10–20 دقيقة أول مرة). عنوان الخادم يكون مثل `https://USER-boomi-voice.hf.space`، وفتح `/health` يجب أن يعرض `"ready": true`.
6. في Netlify ← Site configuration ← Environment variables أضف `VOICE_SERVER_URL` = عنوان الخادم، ثم أعد النشر.

## ملاحظات

- **النوم:** الـ Space المجاني ينام بعد 48 ساعة بلا استخدام، ويستيقظ عند أول طلب خلال دقيقة إلى دقيقتين. أثناء ذلك يكمل بومي بصوته المعتاد تلقائيًا.
- **السرعة:** على CPU المجاني تستغرق الجملة القصيرة بضع ثوانٍ.
  - الموقع يجهّز الجملة التالية أثناء نطق الحالية.
  - يحفظ كل جملة في جهاز الطالب، فلا تُولَّد مرتين.
  - للسرعة: Space بعتاد GPU (مدفوع، بموافقتك فقط) أو حاسوبك الخاص.

## التشغيل على حاسوبك

```
docker build -t boomi-voice . && docker run -p 7860:7860 -e VOICE_SECRET=... -e ALLOW_ORIGINS=https://boomi-academy.netlify.app boomi-voice
```

ثم اجعل `VOICE_SERVER_URL` عنوانًا عامًا يصل إلى حاسوبك (مثل Cloudflare Tunnel).

## الحماية

- `VOICE_SECRET` موجود فقط في Netlify وفي الخادم.
- `/enroll` يتطلّب تذكرة صالحة 10 دقائق، تصدرها دالة Netlify `myvoice`.
- `/tts` يقبل فقط بصمات صوتية وقّعها الخادم نفسه.
- التسجيل الخام لا يُحفظ: يتحوّل إلى رموز صوتية ثم يُحذف.
- البصمة تُحفظ في ملف الطالب فقط، ويمكن حذفها من الإعدادات.
- لكل عنوان IP حدّ للطلبات.
