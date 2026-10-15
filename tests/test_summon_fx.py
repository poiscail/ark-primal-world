"""Invocation animée : cartes face cachée, retournement, passage, désactivation."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1280,'height':800});pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('S.tut={off:true,seen:{}};S.tickets=50;S.team=[{id:1,type:"raptor",level:1,xp:0}];S.nextId=10;ens();go("summon")')
        await ev('summon(10)' if await ev('typeof summon==="function"') else 'summonMany(10)');await pg.wait_for_timeout(300)
        check('cartes face cachée pendant le cercle',await ev('document.querySelectorAll("#gachaBody .gc.facedown").length')>=3)
        check('cercle magique affiché',await ev('!!document.querySelector("#gfxLayer .circle")'))
        await pg.screenshot(path='/tmp/shots/summon1.png')
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/shots/summon2.png')
        await pg.wait_for_timeout(3500)
        check('toutes les cartes révélées',await ev('document.querySelectorAll("#gachaBody .gc.facedown").length')==0)
        check('bouton OK de nouveau visible',await ev('!document.getElementById("gachaVeil").classList.contains("summoning")'))
        await pg.screenshot(path='/tmp/shots/summon3.png')
        await ev('closeGacha()')
        check('couche d’effets nettoyée',await ev('!document.getElementById("gfxLayer")'))
        # passer
        await ev('summon(10)' if await ev('typeof summon==="function"') else 'summonMany(10)');await pg.wait_for_timeout(200)
        await pg.mouse.click(200,300);await pg.wait_for_timeout(300);await pg.mouse.click(200,300);await pg.wait_for_timeout(300)
        check('on peut passer l’animation',await ev('document.querySelectorAll("#gachaBody .gc.facedown").length')==0)
        await ev('closeGacha();setPref("anim",false)')
        await ev('summon(1)' if await ev('typeof summon==="function"') else 'summonMany(1)');await pg.wait_for_timeout(200)
        check('sans animations : direct',await ev('document.querySelectorAll("#gachaBody .gc.facedown").length')==0 and await ev('!document.getElementById("gfxLayer")'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
