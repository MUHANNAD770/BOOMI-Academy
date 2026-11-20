# ملف واحد يكفي لإنشاء خادم «صوتي الشخصي» على Hugging Face: ينسخ ملفات الخادم من مستودع الموقع على GitHub
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg build-essential cmake curl && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1000 user
WORKDIR /app
ARG SRC=https://raw.githubusercontent.com/MUHANNAD770/BOOMI-Academy/main/tools/voice-server
RUN mkdir -p shim/torchtune/modules && for f in app.py engine.py requirements.txt shim/torchtune/__init__.py shim/torchtune/modules/__init__.py shim/torchtune/modules/position_embeddings.py; do curl -fsSL "$SRC/$f" -o "$f"; done
RUN CMAKE_ARGS="-DGGML_NATIVE=OFF" pip install --no-cache-dir -r requirements.txt
RUN chown -R user /app
USER user
ENV HOME=/home/user PYTHONPATH=/app/shim PYTHONUNBUFFERED=1 HF_HOME=/home/user/.cache/huggingface CACHE_DIR=/tmp/voice-cache
EXPOSE 7860
CMD ["python", "app.py"]
