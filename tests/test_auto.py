"""Auto-combat (IA : super, compétences utiles, meilleure orbe ; pause hors de l'écran ou fenêtre ouverte) et vitesse ×1/×2/×3."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"dracorex",level:45,xp:0},{id:2,type:"gaia",level:45,xp:0},{id:3,type:"giga",level:45,xp:0}];S.stage=40;S.nextId=10;S.items=[];S.tut={off:true,seen:{}};ens();render();'
async def until(pg,js,ms):
    for _ in range(ms//100):
        if await pg.evaluate(js):return True
        await pg.wait_for_timeout(100)
    return False
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1280,'height':800});pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await ev(BASE)
        check('auto désactivé par défaut, vitesse ×1',await ev('!PREFS.auto&&(PREFS.spd||1)===1'))
        await ev('startBattle({mode:"story",n:20})');await pg.wait_for_timeout(300)
        check('boutons AUTO et vitesse dans le combat',await ev('!!document.querySelector("#battleArea .bl-head .actl .abtn")&&!!document.querySelector("#battleArea .actl .sbtn")'))
        check('aucune action sans auto',(await pg.wait_for_timeout(1500),await ev('fight.turn'))[1]==0)
        # vitesse ×3 + auto : le combat se termine seul
        sk0=await ev('S.cnt.skills||0')
        await pg.click('#battleArea .sbtn');await pg.click('#battleArea .sbtn')
        check('vitesse ×3 après deux clics',await ev('PREFS.spd')==3 and await ev('FX_SPEED')==3 and (await ev('document.querySelector("#battleArea .sbtn").textContent'))=='×3')
        await ev('fight.cd=[0,0,0];renderBattle()');await pg.click('#battleArea .abtn')
        check('auto activé (bouton allumé)',await ev('PREFS.auto===true&&document.querySelector("#battleArea .abtn").classList.contains("on")'))
        await pg.wait_for_timeout(900)
        check('animations accélérées (playbackRate ×3)',await ev('[...document.querySelectorAll("#fxLayer .proj,#fxLayer .dmgnum")].some(e=>e.getAnimations().some(a=>a.playbackRate===3))'))
        check('délais d\'enchaînement accélérés',await ev('fxd(380)')==380/3)
        ok=await until(pg,'fight.over',45000)
        check('l\'auto termine le combat',ok and await ev('fight.over')=='win',await ev('[fight.over,fight.wave,fight.turn]'))
        check('l\'IA a utilisé des compétences',await ev('S.cnt.skills||0')>sk0)
        # l'auto reste actif d'un combat à l'autre, en pause hors de l'écran de combat
        await ev('startBattle({mode:"story",n:25})');await pg.wait_for_timeout(1200)
        t1=await ev('fight.turn');check('l\'auto continue au combat suivant',t1>0 or await ev('fight.sp>0||fight.cd.some(x=>x>0)'))
        await ev('go("home")');t2=await ev('fight.turn');await pg.wait_for_timeout(1500)
        check('pause quand on quitte l\'écran de combat',await ev('fight.turn')==t2)
        check('vitesse normale hors combat',await ev('FX_SPEED')==1)
        await ev('go("battle")');ok=await until(pg,'fight.turn>%d||fight.over'%t2,5000)
        check('reprise au retour sur le combat',ok)
        await ev('openSettings()');await pg.wait_for_timeout(500);t3=await ev('fight.turn');await pg.wait_for_timeout(1500)
        check('pause quand une fenêtre est ouverte',await ev('fight.turn')==t3)
        check('réglages : vitesse et auto-combat',await ev('!!document.getElementById("setCombat")&&document.getElementById("setCombat").textContent.includes("Vitesse des combats")'))
        await ev('setPref("spd",2)');check('réglage de vitesse ×2',await ev('PREFS.spd')==2)
        await ev('closeSettings()')
        # clavier PC : R auto, T vitesse
        await ev('startBattle({mode:"story",n:5})');await pg.wait_for_timeout(200)
        await pg.keyboard.press('r');check('touche R : auto désactivé',await ev('PREFS.auto')==False)
        await pg.keyboard.press('t');check('touche T : vitesse suivante (×3)',await ev('PREFS.spd')==3)
        check('aide clavier mise à jour',await ev('[...document.querySelectorAll("#battleArea>*")].some(e=>e.textContent.includes("R auto · T vitesse"))'))
        t4=await ev('fight.turn');await pg.wait_for_timeout(1500);check('auto désactivé : plus aucune action',await ev('fight.turn')==t4)
        # préférences persistantes
        await pg.reload();await pg.wait_for_timeout(300)
        check('vitesse et auto mémorisés',await ev('PREFS.spd===3&&PREFS.auto===false'))
        # animations désactivées : l'auto fonctionne quand même
        await ev(BASE+'setPref("anim",false);setPref("spd",1);setPref("auto",true);startBattle({mode:"story",n:10})')
        ok=await until(pg,'fight.over',40000);check('auto sans animations',ok and await ev('fight.over')=='win')
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
