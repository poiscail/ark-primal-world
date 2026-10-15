"""Finitions : bannières illustrées, carte d'histoire et étoiles, interrupteurs, fin de combat."""
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
        check('pas d\'écran titre sous automatisation',await ev('!document.getElementById("splash")'))
        await ev('S.tut={off:true,seen:{}};S.team=[{id:1,type:"spino",level:60,xp:0},{id:2,type:"magma",level:60,xp:0},{id:3,type:"levia",level:60,xp:0}];S.stage=34;ens();setPref("lore",false)')
        for s in ['home','team','summon','story','tower','arena','events','exped','achs','missions']:
            await ev(f'go("{s}")');await pg.wait_for_timeout(60)
            if not await ev(f'!!document.querySelector("#{s} .banner .bscene svg")'):FAILS.append('bannière '+s);print('FAIL bannière',s)
        print('OK   bannières illustrées vérifiées')
        await ev('go("story")')
        check('carte : 10 nœuds',await ev('document.querySelectorAll("#chapters .mnode").length')==10)
        check('chapitre courant (31-40)',await ev('document.querySelector("#chapters .mnode.cur .mn").textContent')=='35')
        check('nœuds verrouillés désactivés',await ev('[...document.querySelectorAll("#chapters .mnode.lock")].every(b=>b.disabled)'))
        await ev('mapSet(0)');check('changement de chapitre',await ev('document.querySelector("#chapters .mnode .mn").textContent')=='1')
        # étoiles
        await ev('startBattle({mode:"story",n:3})')
        for i in range(30):
            if await ev('fight.over'):break
            await ev('tapOrb(0)')
        check('victoire',await ev('fight.over')=='win')
        check('étoiles enregistrées',await ev('S.stars[3]')>=1)
        check('scène de victoire',await ev('document.querySelector(".battlestage").classList.contains("won")'))
        await ev('S.stars={};for(let i=1;i<=9;i++)S.stars[i]=3;S.starCl=0;go("story")')
        t0=await ev('S.tickets');await ev('starClaim()')
        check('palier d\'étoiles réclamé',await ev('S.starCl')==1 and await ev('S.tickets')==t0+2)
        await ev('starClaim()');check('palier suivant non atteint',await ev('S.starCl')==1)
        # interrupteurs
        await ev('openSettings()');check('interrupteurs dans les réglages',await ev('document.querySelectorAll("#setVeil .tgl").length')>=4)
        await ev('document.querySelector("#setVeil .tgl.on").click()');check('un interrupteur bascule',await ev('document.querySelectorAll("#setVeil .tgl.off").length')>=2)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
