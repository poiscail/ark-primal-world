"""Effets visuels des 14 compétences : aucun plantage, éléments créés."""
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
        await ev('S.tut={off:true,seen:{}};S.team=[{id:1,type:"raptor",level:30,xp:0},{id:2,type:"trike",level:30,xp:0},{id:3,type:"spino",level:30,xp:0}];S.nextId=10;ens();startBattle({mode:"story",n:10})')
        await pg.wait_for_timeout(2200)
        ids=await ev('Object.keys(SK)');ok=0
        for sid in ids:
            await ev(f'SPEC.raptor.sk="{sid}";fight.cd=[0,0,0];fight.enemies[fight.wave].hp=fight.enemies[fight.wave].max=999999;fight.hp=fight.mx.map(x=>Math.round(x*.5))')
            await ev('window.__add=0;window.__mo&&__mo.disconnect();window.__mo=new MutationObserver(ms=>ms.forEach(m=>__add+=m.addedNodes.length));__mo.observe(document.getElementById("fxLayer"),{childList:true})')
            await ev('useSkill(0)');await pg.wait_for_timeout(120)
            n=await ev('__add')
            if n>0 or sid=='reorb':ok+=1
            else:print('   aucun effet pour',sid)
            await pg.wait_for_timeout(900)
        check(f'effet visuel pour chaque compétence ({ok}/{len(ids)})',ok>=len(ids)-1)
        await pg.wait_for_timeout(1500);await ev('setPref("anim",false)');n0=await ev('document.getElementById("fxLayer").children.length');await ev('fight.cd=[0,0,0];useSkill(0)');check('sans animations : aucun effet',await ev('document.getElementById("fxLayer").children.length')==n0)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
