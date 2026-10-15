"""Traits d'ennemis et phases de boss."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"spino",level:60,xp:0},{id:2,type:"trike",level:60,xp:0},{id:3,type:"raptor",level:60,xp:0}];S.nextId=10;S.tut={off:true,seen:{}};ens();setPref("anim",false);'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1280,'height':800});pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev(BASE)
        # carapace
        await ev('startBattle({mode:"story",n:30})');
        await ev('const e=fight.enemies[0];e.tr="shield";e.sh=100;e.max=e.hp=100000;renderBattle()')
        check('puce de trait affichée',await ev('document.querySelector("#battleArea .fchips").innerHTML.includes("Carapace")'))
        h0=await ev('fight.enemies[0].hp');await ev('afterAction(60,"test",false)')
        check('bouclier absorbe',await ev('fight.enemies[0].sh')==40 and await ev('fight.enemies[0].hp')==h0)
        await ev('afterAction(100,"test",false)')
        check('dégâts passent après le bouclier',await ev('fight.enemies[0].sh')==0 and await ev('fight.enemies[0].hp')==h0-60)
        # régénération
        await ev('const e=fight.enemies[0];e.tr="heal";e.hp=50000;fight.turn=1;fight.stun=0;enemyTurn()')
        check('régénérant récupère des PV',await ev('fight.enemies[0].hp')>50000)
        # berserk
        await ev('const e=fight.enemies[0];e.tr="berserk";e.a0=e.atk=100;enemyTurn();enemyTurn()')
        check('berserker monte en puissance mais plafonné',await ev('fight.enemies[0].atk')>100 and await ev('fight.enemies[0].atk')<=150)
        # venin
        await ev('const f=fight;f.hp=f.mx.slice();f.pz=[0,0,0];const e=f.enemies[0];e.tr="venom";e.atk=50;f.turn=1;f.stun=0;enemyTurn()')
        check('venin applique poison',await ev('fight.pz.some(x=>x>0)'))
        hp=await ev('fight.hp.slice()');await ev('enemyTurn()');hp2=await ev('fight.hp.slice()')
        check('poison inflige des dégâts',sum(hp2)<sum(hp))
        # boss
        await ev('startBattle({mode:"story",n:20})');
        await ev('fight.wave=2;const e=fight.enemies[2];e.boss=true;e.max=e.hp=10000;fight.hp=fight.mx.slice();renderBattle()')
        await ev('afterAction(3500,"x",false)');
        check('phase 2 : bouclier de boss',await ev('fight.enemies[2].p1===1 and 1' if False else 'fight.enemies[2].p1===1 && fight.enemies[2].sh>0'))
        await ev('fight.enemies[2].sh=0;afterAction(3500,"x",false)')
        check('phase 3 : poison + puissance accrue',await ev('fight.enemies[2].p2===1 && fight.pz.every(x=>x>0)'))
        check('chip phase affichée',await ev('document.querySelector("#battleArea .fchips").innerHTML.includes("Phase 3/3")'))
        # pas de trait pour la tour/arène/petits niveaux
        await ev('startBattle({mode:"story",n:3})');r=await ev('fight.enemies.every(e=>traitOf(e)==="")');check('pas de trait avant le niveau 8',r)
        await ev('startBattle({mode:"tower"})');r=await ev('fight.enemies.every(e=>traitOf(e)==="")');check('pas de trait en Tour',r)
        # un combat complet reste jouable
        await ev('startBattle({mode:"story",n:12})')
        for i in range(60):
            if await ev('fight.over'):break
            await ev('tapOrb(0)')
        check('combat terminé sans erreur',await ev('!!fight.over'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
