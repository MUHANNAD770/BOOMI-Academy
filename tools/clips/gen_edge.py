# توليد مقاطع بومي بخدمة Edge TTS (أصوات Microsoft العصبية) — نسخة لكل معلّم/معلّمة
import asyncio, json, os, sys, subprocess, edge_tts
W=os.path.dirname(os.path.abspath(__file__))
VOICES={'female':{'ar':'ar-SA-ZariyahNeural','en':'en-US-AvaNeural'},'male':{'ar':'ar-SA-HamedNeural','en':'en-US-AndrewNeural'}}
RATE={'ar':'-8%','en':'-10%'}
PROXY=os.environ.get('HTTPS_PROXY')
phr=json.load(open(os.environ.get('PHR') or os.path.join(W,'final.json')))
async def one(who,k,t,l,sem,stat):
    out=os.path.join(W,'out',who,k+'.mp3')
    if os.path.exists(out) and os.path.getsize(out)>500: stat['skip']+=1; return
    raw=out+'.raw.mp3'
    async with sem:
        for a in range(5):
            try:
                c=edge_tts.Communicate(t,VOICES[who][l],rate=RATE[l],proxy=PROXY)
                await c.save(raw)
                if os.path.getsize(raw)<300: raise Exception('small')
                break
            except Exception as e:
                await asyncio.sleep(2+3*a)
        else:
            stat['fail']+=1; open(os.path.join(W,'fail.txt'),'a').write(f'{who}\t{k}\t{l}\t{t}\n'); return
        # قصّ الصمت في البداية والنهاية (يبدأ الصوت فورًا)
        p=await asyncio.create_subprocess_exec('ffmpeg','-v','error','-y','-i',raw,'-af',
          'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse',
          '-ac','1','-ar','24000','-c:a','libmp3lame','-b:a','48k','-write_xing','0','-id3v2_version','0',out+'.tmp.mp3')
        await p.wait()
        if p.returncode==0 and os.path.getsize(out+'.tmp.mp3')>300: os.replace(out+'.tmp.mp3',out)
        else: os.replace(raw,out)
        try: os.remove(raw)
        except: pass
        stat['ok']+=1
        n=stat['ok']+stat['fail']
        if n%100==0: open(os.path.join(W,'progress.txt'),'w').write(json.dumps(stat))
async def main():
    sem=asyncio.Semaphore(int(os.environ.get('CONC','8')))
    stat={'ok':0,'skip':0,'fail':0,'total':len(phr)*2}
    for who in ('female','male'): os.makedirs(os.path.join(W,'out',who),exist_ok=True)
    jobs=[one(who,k,t,l,sem,stat) for who in ('female','male') for k,(t,l) in phr]
    await asyncio.gather(*jobs)
    stat['done']=1; open(os.path.join(W,'progress.txt'),'w').write(json.dumps(stat))
asyncio.run(main())
