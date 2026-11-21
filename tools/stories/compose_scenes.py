# صور القصص التي ليس لها رسمة في تصميم صاحب المشروع: مشهد مركّب من رموز Fluent 3D (رخصة MIT، img/3d) على خلفية مرسومة.
# python3 tools/stories/compose_scenes.py  ← img/stories/<id>.webp (800×400)
import os, random
from PIL import Image, ImageDraw, ImageFilter
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))));E=os.path.join(R,'img','3d')
W,H=800,400
def grad(c1,c2):
    im=Image.new('RGB',(W,H));d=ImageDraw.Draw(im)
    for y in range(H):
        t=y/H;d.line([(0,y),(W,y)],fill=tuple(int(c1[i]+(c2[i]-c1[i])*t) for i in range(3)))
    return im.convert('RGBA')
def meadow(sky=((120,196,255),(205,236,255))):
    im=grad(*sky);d=ImageDraw.Draw(im)
    for cx,cy,r in [(120,70,38),(170,62,30),(640,90,34),(690,80,26)]:d.ellipse([cx-r,cy-r*0.6,cx+r,cy+r*0.6],fill=(255,255,255,235))  # غيوم
    d.ellipse([-200,270,560,620],fill=(122,201,92));d.ellipse([300,250,1050,640],fill=(98,186,74));d.rectangle([0,340,W,H],fill=(86,170,64))
    return im
def night():
    im=grad((24,30,92),(58,40,120));d=ImageDraw.Draw(im);random.seed(4)
    for _ in range(70):
        x,y=random.randint(0,W),random.randint(0,H);r=random.choice([1,1,2]);d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,230))
    return im
def sea():
    im=grad((140,210,255),(214,243,255));d=ImageDraw.Draw(im)
    d.rectangle([0,210,W,H],fill=(42,146,214));
    for k in range(6):d.arc([k*150-40,190,k*150+150,250],200,340,fill=(255,255,255),width=5)
    d.ellipse([-120,330,420,520],fill=(244,214,150))  # شاطئ
    return im
def lab():
    im=grad((238,232,255),(205,214,255));d=ImageDraw.Draw(im);d.rectangle([0,300,W,H],fill=(150,128,214));d.rectangle([0,292,W,302],fill=(120,98,190))
    for x in range(60,W,140):d.rectangle([x,60,x+90,140],outline=(176,168,230),width=6)
    return im
def put(im,code,cx,cy,size,shadow=True):
    p=os.path.join(E,code+'.webp')
    if not os.path.exists(p):return
    e=Image.open(p).convert('RGBA');e=e.resize((size,int(size*e.height/e.width)),Image.LANCZOS)
    if shadow:
        sh=Image.new('RGBA',im.size,(0,0,0,0));sd=ImageDraw.Draw(sh);sd.ellipse([cx-size*0.38,cy+e.height*0.42,cx+size*0.38,cy+e.height*0.52],fill=(0,0,0,70))
        im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    im.alpha_composite(e,(int(cx-e.width/2),int(cy-e.height/2)))
S={
 'story_ar_101':(meadow,[('1f331',190,270,130),('1f430',420,215,270),('1f955',630,265,150),('2b50',700,70,60)]),
 'story_ar_102':(meadow,[('1f333',120,200,230),('1f467',360,230,200),('1f466',540,230,200),('1f9f9',700,260,140)]),
 'story_ar_103':(night,[('1f319',130,110,120),('1f680',400,200,250),('1fa90',650,140,170),('2b50',260,70,50),('2b50',560,330,44)]),
 'story_ar_104':(meadow,[('1f333',110,190,220),('1f474',460,220,240),('1f466',650,250,190)]),
 'story_ar_105':(sea,[('1f30a',160,250,170),('1f422',420,260,230),('1f467',650,230,190)]),
 'story_en_006':(meadow,[('1f3eb',130,190,200),('1f466',360,230,200),('1f466',560,230,200),('26bd',710,300,110)]),
 'story_ar_023':(lab,[('1f52c',220,220,210),('1f4a1',420,130,140),('1f467',560,240,200),('1f30d',720,250,120)]),
 'story_en_024':(meadow,[('1f916',180,230,190),('1f30d',420,210,240),('1f4a1',650,190,150)]),
 'story_ar_025':(lab,[('1f4f1',200,230,190),('1f50d',420,210,240),('1f914',650,230,180)]),
}
for sid,(bg,items) in S.items():
    im=bg()
    for code,x,y,s in items:put(im,code,x,y,s)
    im.convert('RGB').save(os.path.join(R,'img','stories',sid+'.webp'),'WEBP',quality=88)
print('ok',len(S))
