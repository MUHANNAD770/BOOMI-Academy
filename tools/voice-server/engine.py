# محرك «صوتي الشخصي»: استنساخ صوت من تسجيل قصير (5–15 ثانية) بنموذج Audar-TTS-V1-Flash المفتوح
# الترخيص: أوزان النموذج تحت AudarAI Open License v1.0 (استخدام تجاري وإعادة توزيع مسموحة)،
# والمرمِّز NeuCodec تحت Apache-2.0. يعمل على المعالج (CPU) بلا رسوم لكل جملة.
import hashlib, os, re, threading, warnings
warnings.filterwarnings('ignore')
import numpy as np, torch
from huggingface_hub import hf_hub_download

REPO = 'audarai/Audar-TTS-V1-Flash'
CODEC_SHA = '30c3ea13ceeb2de693c56e5e33a1b7e00d44c95dcdd08a4ed0d552d0bf59ebdf'  # pytorch_model.bin الرسمي من neuphonic/neucodec
# NeuCodec الرسمي يطلب قبول شروطه بحساب Hugging Face. إن لم يتوفر رمز نستعمل نسخة مطابقة له بايتًا ببايت (نتحقق من SHA-256)
CODEC_REPOS = ['neuphonic/neucodec', 'nguyensu27/neucodec']
torch.set_num_threads(int(os.environ.get('THREADS', os.cpu_count() or 2)))
LOCK = threading.Lock()


def _sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def _codec():
    from neucodec import NeuCodec
    last = None
    for r in CODEC_REPOS:
        try:
            p = hf_hub_download(r, 'pytorch_model.bin')
            if _sha(p) != CODEC_SHA:
                last = Exception('codec checksum mismatch: ' + r); continue
            m = NeuCodec(24_000, 480)
            sd = torch.load(p, map_location='cpu', weights_only=True)
            sd = {k: v for k, v in sd.items() if 'fc_post_s' not in k and 'SemanticDecoder' not in k}
            m.load_state_dict(sd, strict=False)
            return m.eval()
        except Exception as e:  # noqa
            last = e
    raise last


class Engine:
    def __init__(self):
        self.backend = os.environ.get('BACKEND', 'gguf')
        self.codec = _codec()
        if self.backend == 'gguf':
            try:
                from llama_cpp import Llama
                g = hf_hub_download(REPO, os.environ.get('GGUF', 'Audar-TTS-V1-Flash-Q8_0.gguf'))
                self.llm = Llama(model_path=g, n_ctx=4096, n_threads=torch.get_num_threads(), n_gpu_layers=int(os.environ.get('GPU_LAYERS', '0')), verbose=False)
                self.tce = self.llm.tokenize(b'<|TARGET_CODES_END|>', add_bos=False, special=True)[0]
            except ImportError:
                self.backend = 'hf'
        if self.backend == 'hf':
            from transformers import AutoTokenizer, AutoModelForCausalLM
            self.tok = AutoTokenizer.from_pretrained(REPO, subfolder='transformers')
            dev = 'cuda' if torch.cuda.is_available() else 'cpu'
            self.model = AutoModelForCausalLM.from_pretrained(REPO, subfolder='transformers', torch_dtype=torch.bfloat16 if dev == 'cuda' else torch.float32).eval().to(dev)
            self.codec = self.codec.to(dev)
            self.tce = self.tok.convert_tokens_to_ids('<|TARGET_CODES_END|>')

    # تسجيل الصوت (16 kHz أحادي) ← رموز صوتية مرجعية. التسجيل الخام لا يُحفظ على الخادم.
    def encode(self, wav16: np.ndarray):
        wav16 = wav16[: 16000 * 15]
        x = torch.from_numpy(wav16.astype(np.float32))[None, None, :]
        with LOCK, torch.no_grad():
            return [int(c) for c in self.codec.encode_code(x.to(next(self.codec.parameters()).device)).squeeze().tolist()]

    def _prompt(self, ref_text, ref_codes, text):
        ref = ''.join(f'<|speech_{c}|>' for c in ref_codes)
        return ('user: Convert the text to speech:'
                f'<|REF_TEXT_START|>{ref_text}<|REF_TEXT_END|>'
                f'<|REF_SPEECH_START|>{ref}<|REF_SPEECH_END|>'
                f'<|TARGET_TEXT_START|>{text}<|TARGET_TEXT_END|>'
                '\nassistant:<|TARGET_CODES_START|>')

    # نص ← صوت 24 kHz بصوت صاحب التسجيل. حرارة منخفضة = نطق ثابت وواضح (مناسب للتعليم)
    def speak(self, ref_text, ref_codes, text, temp=0.6):
        prompt = self._prompt(ref_text, ref_codes, text)
        mx = min(1500, 60 + len(text) * 14)
        with LOCK, torch.no_grad():
            if self.backend == 'gguf':
                toks = self.llm.tokenize(prompt.encode('utf-8'), add_bos=False, special=True)
                ids = []
                for t in self.llm.generate(toks, temp=temp, top_k=40, top_p=0.9, repeat_penalty=1.1, reset=True):
                    if t == self.tce or len(ids) >= mx:
                        break
                    ids.append(t)
                out = ''.join(self.llm.detokenize([t], special=True).decode('utf-8', 'ignore') for t in ids)
            else:
                ids = self.tok.encode(prompt, add_special_tokens=False, return_tensors='pt').to(self.model.device)
                o = self.model.generate(ids, max_new_tokens=mx, do_sample=True, temperature=temp, top_k=40, top_p=0.9,
                                        repetition_penalty=1.1, min_new_tokens=8, eos_token_id=self.tce, pad_token_id=151643)
                out = self.tok.decode(o[0, ids.shape[1]:], skip_special_tokens=False)
            codes = [int(x) for x in re.findall(r'<\|speech_(\d+)\|>', out)]
            if not codes:
                raise RuntimeError('no speech')
            dev = next(self.codec.parameters()).device
            w = self.codec.decode_code(torch.tensor(codes, device=dev)[None, None, :]).float().cpu().numpy()[0, 0, :]
        return w
