"""Jouer en arrière-plan (0.47) : l'auto-combat continue quand la page est cachée (réglage « Jouer en arrière-plan », oui par
défaut), s'arrête comme avant si on choisit « Non » (vrai clic dans les réglages) ; le réglage est gardé après rechargement.
La partie « application Windows » (minuteries non ralenties fenêtre réduite) est vérifiée par le test de lancement de l'.exe."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
HIDE='Object.defineProperty(document,"hidden",{get:()=>window.__hid===true,configurable:true});window.__hid=true;document.dispatchEvent(new Event("visibilitychange"))'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","trike"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));save();F2.newP=F2.goldP=F2.callP=0')
        check('jouer en arrière-plan : oui par défaut',await ev('bgRunOn()'))
        await ev('fight=null;startBattle({mode:"story",n:3});go("battle");setPref("auto",true)')
        await ev(HIDE)
        check('page cachée : l\'auto-combat reste prêt',await ev('autoReady()'))
        a0=await ev('fight.turn||0');await pg.wait_for_function('fight&&(fight.over||(fight.turn||0)>%d)'%a0,timeout=8000)
        check('page cachée : l\'auto-combat a vraiment joué',await ev('fight.over||(fight.turn||0)>%d'%a0))
        await ev('setPref("auto",false);window.__hid=false;fight=null;go("home");openSettings()')
        check('réglage dans les réglages',await pg.locator('#bgRunOpt .eltabs button').count()==2)
        await pg.click('#bgRunOpt button[onclick="bgRunSet(false)"]')
        check('vrai clic : « Non »',await ev('PREFS.bgRun')==False)
        await ev('closeSettings();fight=null;startBattle({mode:"story",n:3});go("battle");setPref("auto",true);window.__hid=true')
        check('« Non » : l\'auto-combat s\'arrête page cachée (comme avant)',await ev('autoReady()')==False)
        await ev('window.__hid=false');check('et reprend quand la page revient',await ev('autoReady()'))
        await ev('setPref("auto",false)');await ev('location.reload()');await pg.wait_for_function('typeof setPref==="function"&&document.readyState!=="loading"');await pg.wait_for_timeout(300)
        check('réglage gardé après rechargement',await ev('bgRunOn()')==False)
        await ev('bgRunSet(true)');check('remis à « Oui »',await ev('bgRunOn()'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
