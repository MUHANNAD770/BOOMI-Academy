# خادم «صوتي الشخصي» — جاهز لـ Hugging Face Spaces (Docker، CPU مجاني) أو أي حاسوب عليه Docker
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg build-essential cmake && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1000 user
WORKDIR /app
COPY requirements.txt .
RUN CMAKE_ARGS="-DGGML_NATIVE=OFF" pip install --no-cache-dir -r requirements.txt
COPY --chown=user . .
USER user
ENV HOME=/home/user PYTHONPATH=/app/shim PYTHONUNBUFFERED=1 HF_HOME=/home/user/.cache/huggingface CACHE_DIR=/tmp/voice-cache
EXPOSE 7860
CMD ["python", "app.py"]
