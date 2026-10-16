"""Évolutions."""
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
        await ev('S.tut={off:true,seen:{}};S.team=[{id:1,type:"coelo",level:20,star:1,xp:0,v:"alpha"},{id:2,type:"utah",level:10,star:0,xp:0},{id:3,type:"rex",level:5,xp:0}];S.nextId=10;S.essence=1000;S.shards=500;S.mat={bone:100,hide:100,crystal:100,amber:100};ens();go("team")')
        await pg.wait_for_timeout(200)
        check('panneau d\'évolutions listé',await ev('document.querySelectorAll("#evoBox > .panel:first-child .row").length')==2)
        check('rex sans évolution exclu',await ev('!document.querySelector("#evoBox > .panel:first-child").innerHTML.includes("Tyrannosaure")'))
        check('utah trop faible : bouton désactivé',await ev('document.querySelectorAll("#evoBox > .panel:first-child button:not([disabled])").length')==1)
        await ev('S.team[0].it=[]') 
        e0=await ev('S.essence');await ev('evolve(2)');check('évolution refusée si niveau insuffisant',await ev('S.team[1].type')=='utah' and await ev('S.essence')==e0)
        await ev('evolve(1)')
        check('espèce changée',await ev('S.team[0].type')=='allo')
        check('niveau, étoiles et variante conservés',await ev('S.team[0].level==20&&S.team[0].star===1&&S.team[0].v==="alpha"'))
        check('ressources dépensées',await ev('S.essence')==e0-30 and await ev('S.shards')==492)
        await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/shots/evo.png')
        await ev('S.team[0].star=2;S.team[0].level=30;evolve(1)');check('2e évolution (Épique)',await ev('S.team[0].type')=='carcharo')
        await ev('S.team[0].star=3;S.team[0].level=45;evolve(1)');check('3e évolution (Légendaire)',await ev('S.team[0].type')=='magma')
        check('plus d\'évolution après le sommet',await ev('evoInfo(S.team[0])===null'))
        check('compteur pour succès',await ev('S.cnt.evolve')==3)
        check('chaînes valides (toutes les espèces existent)',await ev('Object.entries(EVO).every(([a,b])=>SPEC[a]&&SPEC[b])'))
        check('rareté toujours croissante',await ev('(()=>{const o=RAR5;return Object.entries(EVO).every(([a,b])=>o.indexOf(SPEC[b].r)>o.indexOf(SPEC[a].r))})()'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
