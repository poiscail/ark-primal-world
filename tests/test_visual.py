"""Tests visuels par captures comparées (0.41, idée 467) : scène de combat (hasard figé), carte d'un dino, panneau des
réglages. La première fois (ou avec --refaire), les captures de référence sont créées dans tests/visual/ ; ensuite chaque
capture est comparée pixel à pixel (tolérance : moins de 1,5 % de pixels nettement différents). En cas d'écart, la capture
obtenue est écrite à côté (…-obtenu.png) pour la regarder."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
from PIL import Image,ImageChops
ROOT=pathlib.Path(__file__).resolve().parent
GAME=(ROOT.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
REF=ROOT/'visual';REF.mkdir(exist_ok=True)
FAILS=[];NEW=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
def compare(nom,png):
    ref=REF/(nom+'.png');got=REF/(nom+'-obtenu.png')
    if not ref.exists() or '--refaire' in sys.argv:ref.write_bytes(png);NEW.append(nom);return True,'référence créée'
    got.write_bytes(png);a=Image.open(ref).convert('RGB');b=Image.open(got).convert('RGB')
    if a.size!=b.size:return False,('taille',a.size,b.size)
    d=ImageChops.difference(a,b).convert('L').point(lambda v:255 if v>40 else 0)
    part=sum(d.histogram()[255:])/(a.size[0]*a.size[1])
    if part<.015:got.unlink()
    return part<.015,'%.2f %% de pixels différents'%(part*100)
SETUP='''setPref("anim",false);setPref("lore",false);setPref("art","svg");setSkin("");setPref("gfx","simple");S.tut={off:true,seen:{}};
 S.team=["rex","trike","raptor"].map((t,i)=>({id:i+1,type:t,level:30,xp:0,v:"normal"}));S.stage=40;S.level=10;ens();save();WX_ON=false;WD_FORCE=false;
 F2.newP=F2.goldP=F2.callP=0;if(typeof C4!=="undefined")C4.duoP=0;if(typeof C3!=="undefined")C3.terP=0'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800},device_scale_factor=1);ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev(SETUP)
        # combat : hasard figé (mêmes tirages que la Revanche), aucun décor aléatoire
        await ev('(()=>{let a=7;const D=[];for(let i=0;i<4000;i++){a=(a*1103515245+12345)%2147483648;D.push(a/2147483648)}fight=null;startBattle({mode:"story",n:5,rev:D});go("battle")})()')
        await pg.wait_for_timeout(300)
        ok,info=compare('combat',await pg.locator('#battleArea .battlestage').screenshot(animations='disabled'));check('scène de combat identique à la référence',ok,info)
        ok,info=compare('orbes',await pg.locator('#battleArea .orbboard').screenshot(animations='disabled'));check('plateau d\'orbes identique à la référence',ok,info)
        await ev('fight=null;go("team")');await pg.wait_for_timeout(200)
        ok,info=compare('carte',await pg.locator('#collection>.cocard[data-id="1"]').screenshot(animations='disabled'));check('carte d\'un dino identique à la référence',ok,info)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
if NEW:print('Références créées :',', '.join(NEW))
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
