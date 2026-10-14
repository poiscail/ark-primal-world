"""Dialogues d'histoire et journal."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844});pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('S.tut={off:true,seen:{}};ens()')
        await ev('startBattle({mode:"story",n:1})');await pg.wait_for_timeout(200)
        check('pas de dialogue sous automatisation par défaut',await ev('!fight===false'))
        await ev('fight=null;window.__forceLore=true;setPref("anim",false)')
        await ev('startBattle({mode:"story",n:1})');await pg.wait_for_timeout(200)
        check('dialogue affiché, combat en attente',await ev('!document.getElementById("loreVeil").classList.contains("hide")') and await ev('!fight'))
        await pg.screenshot(path='/tmp/shots/lore.png')
        for i in range(6):
            if await ev('document.getElementById("loreVeil").classList.contains("hide")'):break
            await pg.mouse.click(200,400);await pg.wait_for_timeout(120)
        check('combat lancé à la fin du dialogue',await ev('!!fight && fight.n===1'))
        check('page marquée comme vue',await ev('S.lore[1]===1'))
        await ev('fight=null;startBattle({mode:"story",n:1})');await pg.wait_for_timeout(150)
        check('dialogue non rejoué',await ev('!!fight'))
        await ev('S.lore[5]=1;go("achs")');await pg.wait_for_timeout(150)
        check('journal listé dans les succès',await ev('document.getElementById("achs").innerHTML.includes("Journal de l")'))
        await ev('loreShow(5)');await pg.wait_for_timeout(100)
        check('relecture depuis le journal',await ev('!document.getElementById("loreVeil").classList.contains("hide")'))
        await ev('loreClose();setPref("lore",false);fight=null;startBattle({mode:"story",n:10})');await pg.wait_for_timeout(100)
        check('désactivable dans les réglages',await ev('!!fight'))
        check('100 niveaux : 14 pages',await ev('Object.keys(LORE).length')==14)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
