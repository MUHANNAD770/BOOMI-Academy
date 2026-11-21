# بطاقات صور للأشياء: الرمز ثلاثي الأبعاد (Fluent 3D، MIT) كبيرًا في وسط خلفية مرسومة تناسب نوعه
# (طعام: طاولة مطبخ، مركبات: طريق وسماء، طبيعة/مبانٍ/أشخاص: عشب وسماء، أدوات: غرفة) ← img/scenes/<الرمز>.webp
import os,sys,json
from PIL import Image,ImageDraw,ImageFilter
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))));E=os.path.join(R,'img','3d');O=os.path.join(R,'img','scenes')
S=512
def grad(c1,c2,h=S):
    im=Image.new('RGBA',(S,S));d=ImageDraw.Draw(im)
    for y in range(h):t=y/h;d.line([(0,y),(S,y)],fill=tuple(int(c1[i]+(c2[i]-c1[i])*t) for i in range(3))+(255,))
    return im
def clouds(d,pts):
    for cx,cy,r in pts:
        for dx,dy,k in [(0,0,1),(-r*.8,r*.15,.7),(r*.8,r*.18,.7)]:d.ellipse([cx+dx-r*k,cy+dy-r*k*.62,cx+dx+r*k,cy+dy+r*k*.62],fill=(255,255,255,235))
def outdoor():
    im=grad((110,190,255),(214,240,255));d=ImageDraw.Draw(im);clouds(d,[(90,80,40),(400,60,34)])
    d.ellipse([-160,330,360,640],fill=(124,203,96));d.ellipse([200,320,700,660],fill=(102,188,78));d.rectangle([0,430,S,S],fill=(92,176,70))
    for x,y,c in [(60,460,(255,214,80)),(440,470,(255,140,170)),(120,490,(255,255,255)),(380,495,(255,214,80))]:d.ellipse([x-7,y-7,x+7,y+7],fill=c+(255,))
    return im
def kitchen():
    im=grad((255,244,226),(255,228,200));d=ImageDraw.Draw(im)
    for x in range(0,S,64):
        for y in range(0,300,64):d.rectangle([x+2,y+2,x+62,y+62],outline=(255,255,255,140),width=3)
    d.rectangle([0,330,S,S],fill=(196,140,92));d.rectangle([0,330,S,346],fill=(170,116,72))
    for y in range(370,S,40):d.line([(0,y),(S,y)],fill=(182,128,82),width=2)
    return im
def road():
    im=grad((120,196,255),(220,242,255));d=ImageDraw.Draw(im);clouds(d,[(110,90,42),(410,70,32)])
    d.rectangle([0,360,S,S],fill=(110,190,84));d.polygon([(150,360),(362,360),(512,512),(0,512)],fill=(96,100,118))
    for y in range(380,S,44):d.rectangle([250,y,262,y+22],fill=(255,236,120))
    return im
def sea():
    im=grad((130,206,255),(220,244,255));d=ImageDraw.Draw(im);clouds(d,[(100,80,38)]);d.rectangle([0,300,S,S],fill=(46,150,220))
    for k in range(5):d.arc([k*120-30,282,k*120+110,330],200,340,fill=(255,255,255,255),width=5)
    return im
def room():
    im=grad((238,232,255),(214,222,255));d=ImageDraw.Draw(im);d.rectangle([0,360,S,S],fill=(176,150,228));d.rectangle([0,352,S,362],fill=(150,124,206))
    d.rectangle([330,60,450,170],fill=(200,230,255),outline=(255,255,255),width=8);d.line([(390,60),(390,170)],fill=(255,255,255),width=6);d.line([(330,115),(450,115)],fill=(255,255,255),width=6)
    return im
def night():
    im=grad((30,36,100),(70,50,140));d=ImageDraw.Draw(im)
    import random;random.seed(3)
    for _ in range(60):x,y=random.randint(0,S),random.randint(0,S);r=random.choice([1,1,2]);d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,230,255))
    return im
def cat(c):
    if 0x1F32D<=c<=0x1F37F or 0x1F950<=c<=0x1F96F or 0x1F9C0<=c<=0x1F9CB or 0x1FAD0<=c<=0x1FADB or c in(0x2615,0x1F95B):return kitchen
    if c in(0x1F6AA,0x1F6BF,0x1F6C1,0x1F6BD,0x1F6CF,0x1F6CB):return room
    if 0x1F680<=c<=0x1F6C5 or c in(0x26F5,0x2708,0x1F6B2,0x1F6F4,0x1F6F5,0x1F6F6):return road
    if c in(0x1F30A,0x1F3DD,0x1F41A,0x1F3D6):return sea
    if c in(0x1F319,0x1F31F,0x1F320,0x1F30C,0x2B50,0x1F52D):return night
    if 0x1F300<=c<=0x1F32C or 0x1F330<=c<=0x1F344 or c in(0x2600,0x2601,0x2602,0x2614,0x26C4,0x2744,0x26A1,0x1F308,0x1F33B,0x1F33C) or 0x1F3D4<=c<=0x1F3F0 or c in(0x1F54C,0x1F3EB,0x1F3E0,0x1F3E1):return outdoor
    if 0x1F466<=c<=0x1F487 or 0x1F9D1<=c<=0x1F9D4 or 0x1F600<=c<=0x1F64F or 0x1F910<=c<=0x1F92F or 0x1F3C3<=c<=0x1F3CC or 0x1F6B4<=c<=0x1F6B6 or 0x1F938<=c<=0x1F93E or c in(0x1F44B,0x1F44D,0x1F44F,0x1F91D):return outdoor
    if 0x1F400<=c<=0x1F43F or 0x1F980<=c<=0x1F9AE:return outdoor
    if 0x1F3BE<=c<=0x1F3C0 or c in(0x26BD,0x1F3D0,0x1F3C8,0x1F3BE):return outdoor
    return room
def emoji(code):
    for n in (code,code+'-fe0f'):
        p=os.path.join(E,n+'.webp')
        if os.path.exists(p):return Image.open(p).convert('RGBA')
    return None
def card(code):
    e=emoji(code)
    if e is None:return False
    c=int(code.split('-')[0],16);bg=cat(c)()
    sz=300;e=e.resize((sz,int(sz*e.height/e.width)),Image.LANCZOS)
    x=(S-e.width)//2;y=(S-e.height)//2+(18 if bg is not night else 0)
    sh=Image.new('RGBA',(S,S),(0,0,0,0));ImageDraw.Draw(sh).ellipse([x+30,y+e.height-26,x+e.width-30,y+e.height+14],fill=(0,0,0,80));bg.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)))
    glow=Image.new('RGBA',(S,S),(0,0,0,0));ImageDraw.Draw(glow).ellipse([x-20,y-20,x+e.width+20,y+e.height+20],fill=(255,255,255,90));bg.alpha_composite(glow.filter(ImageFilter.GaussianBlur(28)))
    bg.alpha_composite(e,(x,y))
    bg.convert('RGB').resize((384,384),Image.LANCZOS).save(os.path.join(O,code+'.webp'),'WEBP',quality=86);return True
if __name__=='__main__':
    codes=json.load(open(sys.argv[1]));ok=[c for c in codes if card(c)];print(len(ok),'cards');json.dump(ok,open(sys.argv[2],'w'))
