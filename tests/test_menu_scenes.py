"""Décors de menu : bannières de l'accueil et des modes en scène de zone (suit la progression), vedette (gardien, créature, dino
de tête), texte lisible et sans chevauchement sur téléphone, mode emoji respecté."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"spino",level:40,xp:0},{id:2,type:"trike",level:40,xp:0},{id:3,type:"raptor",level:40,xp:0}];S.stage=4;S.nextId=10;S.items=[];S.tut={off:true,seen:{}};ens();render();'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await ev(BASE)
        check('accueil : décor de la zone en cours (jungle)',await ev('document.querySelector("#home .banner .bscene").dataset.z')=='jungle')
        await ev('S.stage=55;render()');check('le décor suit la progression (volcan au niveau 56)',await ev('document.querySelector("#home .banner .bscene").dataset.z')=='volcan')
        check('un seul décor par bannière',await ev('document.querySelectorAll("#home .banner .bscene").length')==1)
        for sc,hero in [('story','svg'),('dungeon','svg'),('tower','svg'),('arena','svg'),('events','svg')]:
            await ev(f'go("{sc}")');await pg.wait_for_timeout(150)
            ok=await ev(f'!!document.querySelector("#{sc} .banner.hasScene .bscene .scene")&&!!document.querySelector("#{sc} .banner .heroDino.sceneHero svg")')
            check(f'{sc} : décor et vedette dessinée',ok)
            gap=await ev(f'(()=>{{const t=document.querySelector("#{sc} .banner p"),h=document.querySelector("#{sc} .banner .heroDino .pt");if(!t||!h)return 99;return h.getBoundingClientRect().left-t.getBoundingClientRect().right}})()')
            check(f'{sc} : le texte ne passe pas sous la vedette',gap>=-6,gap)
        check('gardien corrompu en vedette de l\'Histoire',await ev('document.querySelector("#story .banner .heroDino").dataset.hero.startsWith("g:")'))
        await ev('setPref("theme","light");go("home")');await pg.wait_for_timeout(150)
        lum=await ev('(()=>{const c=getComputedStyle(document.querySelector("#home .banner h1")).color.match(/\\d+/g).map(Number);return (c[0]*299+c[1]*587+c[2]*114)/1000})()')
        check('thème clair : titre foncé sur voile clair (lisible)',lum<110,lum)
        await ev('setPref("art","emoji");go("tower")');await pg.wait_for_timeout(150)
        check('mode emoji : la vedette reste un emoji',await ev('!document.querySelector("#tower .banner .heroDino svg")'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
