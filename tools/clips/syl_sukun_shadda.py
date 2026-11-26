# syl_sukun_shadda.py — السكون «أَبْ» والشدة «أَبْ ، بَ» بالصوت رقم ٩ (اختيار صاحب المشروع بعد الاستماع إلى الخيارات).
# كل مقطع تسجيل مستقل (لا يُقص من قائمة: الشدة في القائمة كانت تفقد فتحتها فتشبه السكون).
# الاستعمال: python syl_sukun_shadda.py <مجلد الإخراج> syl_spec.json  ثم  REPLACE=1 PHR=<المجلد>/phr.json python pack.py audio/clips <إصدار> append
import asyncio,edge_tts,os,json,sys,subprocess
P=os.environ.get('HTTPS_PROXY');SP=sys.argv[1];spec=json.load(open(sys.argv[2],encoding='utf8'));phr=[]
sem=asyncio.Semaphore(5)
async def one(l,ks):
  for idx,txt in ((3,f'أَ{l}ْ'),(4,f'أَ{l}ْ ، {l}َ')):   # السكون: «أَبْ» · الشدة: «أَبْ ، بَ» (اختيار صاحب المشروع)
    k=ks[idx]
    if not k:continue
    raw=f'{SP}/raw_{k}.mp3'
    async with sem:
      for a in range(4):
        try: await edge_tts.Communicate(txt,'ar-QA-MoazNeural',rate='-5%',proxy=P).save(raw);break
        except Exception: await asyncio.sleep(2+2*a)
    for who in ('male','female'):
      subprocess.run(['ffmpeg','-v','error','-y','-i',raw,'-af','silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse','-ac','1','-ar','24000','-c:a','libmp3lame','-b:a','48k','-write_xing','0','-id3v2_version','0',f'{SP}/out/{who}/{k}.mp3'])
    os.remove(raw);phr.append([k,[txt,'ar']])
async def main():
  await asyncio.gather(*[one(l,ks) for l,ks in spec]);json.dump(phr,open(f'{SP}/phr.json','w',encoding='utf8'),ensure_ascii=False);print('done',len(phr))
asyncio.run(main())
