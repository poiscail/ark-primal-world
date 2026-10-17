"""Musique : choix d'ambiance et absence d'erreur."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);ctx=await b.new_context();pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('S.tut={off:true,seen:{}};S.team=[{id:1,type:"raptor",level:30,xp:0}];ens()')
        check('ambiance menu',await ev('musicMode()')=='menu')
        await ev('startBattle({mode:"story",n:3})');check('ambiance combat (thème de la zone depuis 0.40)',await ev('musicMode()') in ('battle','jungle','ruines','volcan','obelisque','toundra','abysses'))
        await ev('fight.wave=2;fight.enemies[2].boss=true');check('ambiance boss',await ev('musicMode()')=='boss')
        await ev('fight.over="win"');check('retour au menu après combat',await ev('musicMode()')=='menu')
        await ev('fight.over=null;setPref("music",true)');await pg.wait_for_timeout(1500)
        check('la musique tourne',await ev('musicT!==null'))
        check('boucle en mode boss',await ev('mCur')=='boss')
        await ev('setPref("music",false)');check('arrêt propre',await ev('musicT===null'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
