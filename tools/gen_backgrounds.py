import numpy as np, math, random, sys
from PIL import Image, ImageDraw, ImageFilter
W,H=720,1120
def grad(stops):
    y=np.linspace(0,1,H)[:,None]; img=np.zeros((H,W,3))
    for i in range(len(stops)-1):
        p0,c0=stops[i];p1,c1=stops[i+1]
        m=((y>=p0)&(y<=p1)).astype(float); t=np.clip((y-p0)/(p1-p0+1e-9),0,1)
        img+=m[:,:,None]*(np.array(c0)*(1-t[:,:,None])+np.array(c1)*t[:,:,None])
    return Image.fromarray(np.clip(img,0,255).astype('uint8')).convert('RGBA')
def noise1(n,oct=5,seed=0,rough=.55):
    r=random.Random(seed);x=np.linspace(0,1,n);v=np.zeros(n);a=1;f=2
    for o in range(oct):
        for k in range(3):v+=a*np.sin(2*math.pi*(f*x*(1+.3*k))+r.random()*6.28)/3
        a*=rough;f*=2.1
    return v/ (np.abs(v).max()+1e-9)
def layer(c=(0,0,0)): return Image.new('RGBA',(W,H),tuple(c)+(0,))
def ridge(img,base,amp,col,seed,oct=5,rough=.55,blur=0,alpha=255,sharp=False):
    L=layer();d=ImageDraw.Draw(L);n=noise1(W,oct,seed,rough)
    if sharp:n=np.abs(n)*2-1
    pts=[(x,base-amp*n[x]) for x in range(W)]+[(W,H),(0,H)];d.polygon(pts,fill=col+(alpha,))
    if blur:L=L.filter(ImageFilter.GaussianBlur(blur))
    img.alpha_composite(L)
def glow(img,cx,cy,r,col,a=200,blur=None):
    L=layer(col);d=ImageDraw.Draw(L)
    for i in range(12,0,-1):
        rr=r*i/12;d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),fill=col+(int(a*(1-i/12)**1.6+6),))
    L=L.filter(ImageFilter.GaussianBlur(blur or r/6));img.alpha_composite(L)
def disc(img,cx,cy,r,col):
    L=layer();ImageDraw.Draw(L).ellipse((cx-r,cy-r,cx+r,cy+r),fill=col+(255,));img.alpha_composite(L.filter(ImageFilter.GaussianBlur(1.2)))
def stars(img,n,seed,ymax=.6,col=(255,255,255)):
    r=random.Random(seed);L=layer();d=ImageDraw.Draw(L)
    for i in range(n):
        x=r.random()*W;y=r.random()*H*ymax;s=r.random()**3*2.2+.4;a=int(80+r.random()*175)
        d.ellipse((x-s,y-s,x+s,y+s),fill=col+(a,))
    img.alpha_composite(L);img.alpha_composite(L.filter(ImageFilter.GaussianBlur(2)))
def fog(img,y,h,col,a=120):
    L=layer(col);d=ImageDraw.Draw(L);d.rectangle((0,y-h/2,W,y+h/2),fill=col+(a,));img.alpha_composite(L.filter(ImageFilter.GaussianBlur(h/2.5)))
def rays(img,cx,cy,n,col,a=40,seed=1,spread=1.2):
    r=random.Random(seed);L=layer(col);d=ImageDraw.Draw(L)
    for i in range(n):
        ang=math.pi/2+(r.random()-.5)*spread;w=.02+r.random()*.05;Lg=H*1.4
        p=[(cx,cy),(cx+Lg*math.cos(ang-w),cy+Lg*math.sin(ang-w)),(cx+Lg*math.cos(ang+w),cy+Lg*math.sin(ang+w))]
        d.polygon(p,fill=col+(int(a*(.5+r.random())),))
    img.alpha_composite(L.filter(ImageFilter.GaussianBlur(14)))
def particles(img,n,col,seed,ymin=0,ymax=1,smax=3,a=220):
    r=random.Random(seed);L=layer(col);d=ImageDraw.Draw(L)
    for i in range(n):
        x=r.random()*W;y=H*(ymin+(ymax-ymin)*r.random());s=.6+r.random()**2*smax
        d.ellipse((x-s,y-s,x+s,y+s),fill=col+(int(a*(.4+.6*r.random())),))
    img.alpha_composite(L.filter(ImageFilter.GaussianBlur(4)));img.alpha_composite(L)
def clouds(img,n,col,seed,ymin,ymax,size=80,a=150,blur=18):
    r=random.Random(seed);L=layer(col);d=ImageDraw.Draw(L)
    for i in range(n):
        cx=r.random()*W;cy=H*(ymin+(ymax-ymin)*r.random());s=size*(.5+r.random())
        for k in range(6):
            ox=(r.random()-.5)*s*2.2;oy=(r.random()-.5)*s*.5;rr=s*(.4+r.random()*.5)
            d.ellipse((cx+ox-rr,cy+oy-rr*.7,cx+ox+rr,cy+oy+rr*.7),fill=col+(a,))
    img.alpha_composite(L.filter(ImageFilter.GaussianBlur(blur)))
# silhouettes
SAURO=[(0,.62),(.08,.55),(.2,.5),(.32,.48),(.42,.45),(.5,.38),(.56,.26),(.6,.14),(.64,.06),(.7,.03),(.76,.05),(.74,.09),(.68,.1),(.64,.22),(.62,.36),(.66,.5),(.7,.62),(.68,.92),(.62,.92),(.6,.7),(.5,.7),(.46,.94),(.4,.94),(.38,.72),(.26,.7),(.22,.94),(.16,.94),(.14,.72),(.06,.68)]
REX=[(0,.42),(.18,.36),(.34,.34),(.46,.3),(.54,.2),(.6,.08),(.72,.04),(.86,.06),(.98,.12),(.98,.2),(.84,.22),(.86,.26),(.74,.3),(.66,.36),(.7,.44),(.66,.48),(.62,.42),(.58,.5),(.56,.62),(.6,.94),(.5,.94),(.48,.7),(.4,.66),(.38,.94),(.28,.94),(.3,.6),(.18,.5)]
PTERO=[(0,.5),(.2,.3),(.38,.38),(.46,.46),(.5,.4),(.54,.46),(.62,.38),(.8,.3),(1,.5),(.7,.44),(.55,.56),(.5,.62),(.45,.56),(.3,.44)]
PLESIO=[(0,.6),(.15,.5),(.35,.45),(.55,.46),(.62,.36),(.68,.2),(.74,.1),(.82,.06),(.9,.08),(.86,.12),(.78,.16),(.72,.3),(.7,.46),(.78,.52),(.9,.64),(.74,.6),(.6,.6),(.5,.7),(.44,.62),(.3,.62),(.2,.72),(.18,.62)]
def sil(img,shape,x,y,w,h,col,a=255,flip=False,blur=0):
    L=layer();pts=[(x+(w-px*w if flip else px*w),y+py*h) for px,py in shape];ImageDraw.Draw(L).polygon(pts,fill=col+(a,))
    if blur:L=L.filter(ImageFilter.GaussianBlur(blur))
    img.alpha_composite(L)
def vign(img,a=170):
    y,x=np.mgrid[0:H,0:W];d=np.sqrt(((x-W/2)/(W*.75))**2+((y-H/2)/(H*.7))**2);m=np.clip((d-.55)/.6,0,1)**1.5*a
    L=np.zeros((H,W,4),'uint8');L[...,3]=m.astype('uint8');img.alpha_composite(Image.fromarray(L,'RGBA'))
def trees(img,n,col,seed,ybase,hmin,hmax):
    r=random.Random(seed);L=layer();d=ImageDraw.Draw(L)
    for i in range(n):
        x=r.random()*W;h=hmin+r.random()*(hmax-hmin);w=6+r.random()*8;d.rectangle((x-w/2,ybase-h,x+w/2,ybase),fill=col+(255,))
        for k in range(5):
            rr=30+r.random()*40;d.ellipse((x-rr+(r.random()-.5)*50,ybase-h-rr*.6+(r.random()-.5)*30,x+rr+(r.random()-.5)*50,ybase-h+rr*.6),fill=col+(255,))
    img.alpha_composite(L)
def palms(img,col,seed,n,ybase):
    r=random.Random(seed);L=layer();d=ImageDraw.Draw(L)
    for i in range(n):
        x=r.random()*W;h=180+r.random()*200;bend=(r.random()-.5)*80
        for t in range(40):
            tt=t/40;d.ellipse((x+bend*tt*tt-5,ybase-h*tt-5,x+bend*tt*tt+5,ybase-h*tt+5),fill=col+(255,))
        tx,ty=x+bend,ybase-h
        for k in range(7):
            ang=-math.pi+k*math.pi/6+(r.random()-.5)*.3
            for t in range(30):
                tt=t/30;px=tx+math.cos(ang)*90*tt;py=ty+math.sin(ang)*40*tt+30*tt*tt;s=7*(1-tt)+1
                d.ellipse((px-s,py-s,px+s,py+s),fill=col+(255,))
    img.alpha_composite(L)
def save(img,name):
    img.convert('RGB').save(name+'.webp','WEBP',quality=68,method=6);img.convert('RGB').resize((180,280)).save(name+'_t.jpg',quality=80)

def jungle():
    im=grad([(0,(18,64,52)),(.45,(46,120,84)),(.75,(120,170,90)),(1,(10,30,18))])
    glow(im,520,170,260,(230,255,170),170);rays(im,520,140,14,(240,255,190),34,3,1.6)
    ridge(im,560,120,(40,96,70),11,blur=6,alpha=230);fog(im,600,160,(170,220,170),110)
    sil(im,SAURO,90,470,300,190,(36,82,60),210,blur=2)
    ridge(im,700,90,(24,70,46),12,blur=2);fog(im,760,140,(140,200,150),90)
    trees(im,9,(14,48,30),5,900,180,360);palms(im,(12,40,26),6,4,980)
    ridge(im,1020,40,(6,22,14),13,oct=6)
    particles(im,60,(230,255,140),8,.35,.95,2.6)
    sil(im,PTERO,420,250,80,40,(30,70,50),200);sil(im,PTERO,520,300,50,26,(30,70,50),170)
    vign(im);save(im,'jungle')
def volcan():
    im=grad([(0,(20,4,6)),(.4,(90,16,10)),(.62,(200,70,20)),(.7,(90,20,10)),(1,(10,2,2))])
    stars(im,60,2,.35,(255,190,150))
    clouds(im,14,(40,14,12),3,.05,.4,110,200,26)
    L=layer();d=ImageDraw.Draw(L);d.polygon([(110,760),(300,430),(340,410),(380,415),(420,435),(620,760)],fill=(46,12,10,255));im.alpha_composite(L.filter(ImageFilter.GaussianBlur(2)))
    clouds(im,9,(70,30,26),21,.12,.36,70,220,22)
    glow(im,360,420,170,(255,140,40),220);
    L=layer();d=ImageDraw.Draw(L)
    for k,(x0,x1) in enumerate([(340,240),(365,330),(380,450)]):
        pts=[];
        for t in range(40):tt=t/40;pts.append((x0+(x1-x0)*tt+math.sin(tt*9+k)*10,420+340*tt))
        for i in range(len(pts)-1):d.line([pts[i],pts[i+1]],fill=(255,150,50,255),width=int(7-4*i/40))
    im.alpha_composite(L.filter(ImageFilter.GaussianBlur(3)));im.alpha_composite(L)
    clouds(im,8,(60,24,20),9,.18,.35,90,180,30)
    ridge(im,820,80,(30,8,6),21,sharp=True);glow(im,360,820,300,(255,90,20),80)
    ridge(im,960,60,(14,3,3),22,oct=6,sharp=True)
    particles(im,140,(255,170,60),11,.1,1,2.4)
    sil(im,PTERO,470,200,110,50,(30,6,6),230);sil(im,PTERO,170,260,70,32,(30,6,6),200,flip=True)
    sil(im,REX,420,860,240,150,(8,2,2),255,flip=True)
    vign(im,200);save(im,'volcan')
def abysses():
    im=grad([(0,(30,120,150)),(.3,(10,60,100)),(.7,(4,22,50)),(1,(2,8,20))])
    rays(im,360,-80,18,(170,240,255),46,4,1.0)
    sil(im,PLESIO,160,420,420,230,(10,44,74),190,blur=3)
    ridge(im,900,90,(6,26,44),31,blur=1);ridge(im,1010,60,(3,12,24),32,oct=6)
    r=random.Random(5);L=layer();d=ImageDraw.Draw(L)
    for i in range(14):
        x=r.random()*W;h=200+r.random()*360;
        for t in range(60):
            tt=t/60;px=x+math.sin(tt*6+i)*18*tt;py=1120-h*tt;s=6*(1-tt)+2;d.ellipse((px-s,py-s,px+s,py+s),fill=(6,40,40,255))
    im.alpha_composite(L)
    r=random.Random(7);L=layer();d=ImageDraw.Draw(L)
    for i in range(70):
        x=r.random()*W;y=r.random()*H;s=1.5+r.random()**2*7;d.ellipse((x-s,y-s,x+s,y+s),outline=(200,240,255,170),width=1)
    im.alpha_composite(L)
    particles(im,90,(150,230,255),9,0,1,1.6,150)
    vign(im,190);save(im,'abysses')
def mystique():
    im=grad([(0,(8,4,26)),(.5,(40,18,90)),(.8,(80,40,140)),(1,(6,2,16))])
    stars(im,320,4,.75)
    L=layer();d=ImageDraw.Draw(L)
    for b,(col,y0) in enumerate([((80,255,180),240),((190,110,255),330),((90,200,255),180)]):
        for x in range(0,W,3):
            y=y0+math.sin(x/90+b*2)*50+math.sin(x/37+b)*16;d.line([(x,y),(x,y+140)],fill=col+(26,),width=3)
    im.alpha_composite(L.filter(ImageFilter.GaussianBlur(16)))
    disc(im,560,190,40,(250,240,255));glow(im,560,190,140,(220,190,255),120)
    ridge(im,780,110,(30,14,60),41,blur=3,alpha=240)
    L=layer();d=ImageDraw.Draw(L);d.polygon([(330,1000),(345,420),(360,385),(375,420),(390,1000)],fill=(20,8,40,255));im.alpha_composite(L)
    L=layer();d=ImageDraw.Draw(L)
    for k in range(9):y=470+k*55;d.rectangle((356,y,364,y+18),fill=(240,170,255,255))
    im.alpha_composite(L.filter(ImageFilter.GaussianBlur(5)));im.alpha_composite(L)
    glow(im,360,420,120,(220,150,255),110)
    for i,(x,y,s) in enumerate([(120,520,60),(600,600,44),(200,360,30)]):
        L=layer();d=ImageDraw.Draw(L);d.polygon([(x-s,y),(x+s,y),(x+s*.5,y+s*1.1),(x-s*.3,y+s*.8)],fill=(24,10,48,255));im.alpha_composite(L);glow(im,x,y+s*.6,s*1.4,(190,120,255),60)
    ridge(im,960,70,(12,4,26),42,oct=6)
    particles(im,50,(230,200,255),13,.3,1,2)
    vign(im,190);save(im,'mystique')
def desert():
    im=grad([(0,(40,30,70)),(.35,(200,110,80)),(.6,(255,190,110)),(1,(120,70,40))])
    disc(im,360,520,120,(255,230,170));glow(im,360,520,330,(255,200,120),150)
    sil(im,PTERO,180,330,90,40,(110,60,50),200);sil(im,PTERO,500,280,60,28,(110,60,50),170)
    sil(im,SAURO,470,560,220,140,(170,90,70),200,flip=True,blur=2)
    for i,(b,a,c,s) in enumerate([(700,50,(200,120,80),51),(800,60,(170,96,60),52),(930,55,(130,70,44),53),(1040,45,(90,48,30),54)]):ridge(im,b,a,c,s,oct=2,rough=.3,blur=1)
    particles(im,40,(255,230,190),14,.4,1,1.6,120)
    vign(im,160);save(im,'desert')
def neon():
    im=grad([(0,(4,4,20)),(.45,(30,10,70)),(.62,(120,20,120)),(.64,(10,6,30)),(1,(4,2,12))])
    stars(im,220,6,.6)
    clouds(im,10,(0,200,255),7,.1,.45,90,40,40);clouds(im,10,(255,40,220),8,.1,.5,90,36,40)
    disc(im,360,560,130,(255,90,190));glow(im,360,560,260,(255,60,200),130)
    L=layer();d=ImageDraw.Draw(L)
    for k in range(9):
        y=470+k*20;d.rectangle((200,y,520,y+k*1.3+2),fill=(30,8,50,255))
    im.alpha_composite(L)
    ridge(im,700,90,(14,6,40),61,sharp=True)
    L=layer();d=ImageDraw.Draw(L);n=noise1(W,5,61);n=np.abs(n)*2-1
    d.line([(x,700-90*n[x]) for x in range(W)],fill=(0,229,255,255),width=2);im.alpha_composite(L.filter(ImageFilter.GaussianBlur(3)));im.alpha_composite(L)
    L=layer();d=ImageDraw.Draw(L);hz=720
    for k in range(-14,15):d.line([(360,hz),(360+k*140,H)],fill=(0,229,255,150),width=2)
    y=hz;g=8
    while y<H:d.line([(0,y),(W,y)],fill=(0,229,255,150),width=2);y+=g;g*=1.25
    im.alpha_composite(L.filter(ImageFilter.GaussianBlur(2)));im.alpha_composite(L)
    sil(im,SAURO,60,520,260,170,(10,4,30),255);sil(im,PTERO,470,260,100,46,(20,6,50),255)
    vign(im,190);save(im,'neon')
def clair():
    im=grad([(0,(150,200,255)),(.5,(205,228,255)),(.75,(255,226,205)),(1,(200,230,200))])
    disc(im,540,230,60,(255,253,235));glow(im,540,230,220,(255,250,220),160)
    clouds(im,10,(255,255,255),2,.06,.42,80,170,26);clouds(im,6,(255,255,255),12,.1,.4,50,200,10)
    sil(im,PTERO,170,300,90,40,(120,140,190),150)
    ridge(im,700,100,(170,190,220),71,oct=3,rough=.4,blur=4);ridge(im,800,70,(140,190,170),72,oct=3,rough=.4,blur=2)
    sil(im,SAURO,380,640,260,170,(110,160,150),200,blur=1)
    ridge(im,900,60,(110,170,120),73,oct=3,rough=.4);ridge(im,1010,50,(80,140,90),74,oct=3,rough=.4)
    vign(im,60);save(im,'clair')
for f in [jungle,volcan,abysses,mystique,desert,neon,clair]:f()
