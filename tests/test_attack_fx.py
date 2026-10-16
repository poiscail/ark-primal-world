"""Animations d'attaque par famille d'espèces (morsure, charge, massue, épines, piqué, séisme, cri, jet d'eau), ripostes ennemies
selon la créature, compétences sans attaque collective ni « -0 », vitesse appliquée, rien quand les animations sont coupées."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
FAM={'bite':('raptor','.jawfx'),'charge':('trike','.istar'),'club':('ankylo','.swipe'),'spikes':('stego','.spikefx'),'dive':('ptera','.tx-slash'),'quake':('argento','.quakefx'),'sonic':('parasau','.sonicfx'),'jet':('mosa','.jetfx')}
SEEN='window.__fx=new Set();new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.className)String(n.className).split(" ").forEach(c=>c&&__fx.add(c))}))).observe(document.getElementById("fxLayer"),{childList:true})'
def team(types):return 'S.team=%s.map((t,i)=>({id:i+1,type:t,level:40,xp:0}));S.stage=50;S.nextId=10;S.items=[];S.tut={off:true,seen:{}};ens();render()'%str(types).replace("'",'"')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await ev(SEEN)
        check('8 familles reliées à une animation',await ev('Object.keys(FAMFX).length')==8 and await ev('Object.values(FAMFX).every(k=>typeof ATK[k]==="function")'))
        for kind,(sp,cls) in FAM.items():
            await ev(team([sp,sp,sp]));await ev('startBattle({mode:"story",n:30});fight.enemies.forEach(e=>{e.hp=e.max=999999});fight.stun=5;renderBattle()');await pg.wait_for_timeout(250)
            check('famille de %s : %s'%(sp,kind),await ev('atkKind(S.team[0])')==kind)
            await ev('__fx.clear()');await ev('tapOrb(0)')
            moving=await ev('document.querySelectorAll(".battlestage .sFig")[0].getAnimations().length>0')
            await pg.wait_for_timeout(800)
            check('%s : la figurine bouge et l\'effet %s apparaît'%(kind,cls),moving and await ev('__fx.has("%s")'%cls[1:]),await ev('[...__fx]'))
        # compétence de soin : seul le lanceur, aucune attaque collective, pas de « -0 »
        await ev(team(['parasau','raptor','trike']));await ev('startBattle({mode:"story",n:5});fight.enemies.forEach(e=>{e.tr="";e.sh=0;e.hp=e.max=999999});fight.stun=5;fight.cd=[0,0,0];renderBattle()');await pg.wait_for_timeout(250)
        await ev('__fx.clear()');await ev('useSkill(0)');await pg.wait_for_timeout(700)
        check('soin : pas d\'attaque collective ni de « -0 »',not (await ev('__fx.has("jawfx")||__fx.has("istar")||__fx.has("dmgnum")')),await ev('[...__fx]'))
        await ev('__fx.clear()');await ev('useSkill(1)');await pg.wait_for_timeout(700)
        check('compétence offensive : dégâts affichés',await ev('__fx.has("dmgnum")'),await ev('[...__fx]'))
        await ev('fight.enemies[fight.wave].sh=99999;fight.cd=[0,0,0];__fx.clear()');await ev('useSkill(1)');await pg.wait_for_timeout(700)
        check('bouclier ennemi : « ABSORBÉ » affiché',await ev('__fx.has("dmgnum")')and 'absorbé' in await ev('fight.log'),await ev('[...__fx]'))
        # ripostes : crocodile = morsure, spectre = orbe
        await ev(team(["raptor","trike","stego"]));await ev("F2.newP=0;F2.callP=0;F2.goldP=0;C4.duoP=0");await ev('startBattle({mode:"story",n:3});fight.enemies.forEach(e=>{e.hp=e.max=999999});renderBattle()');await pg.wait_for_timeout(250)
        await ev('__fx.clear()');await ev('fight.turn=2;fight.stun=0;tapOrb(0)');await pg.wait_for_timeout(1100)
        check('riposte du Sarcosuchus : morsure sur l\'équipe',await ev('__fx.has("hurtflash")')and await ev('__fx.has("jawfx")'),await ev('[...__fx]'))
        await ev('startBattle({mode:"story",n:33});fight.enemies.forEach(e=>{e.hp=e.max=999999});renderBattle()');await pg.wait_for_timeout(250)
        await ev('__fx.clear()');await ev('fight.turn=2;fight.stun=0;tapOrb(0)');await pg.wait_for_timeout(1100)
        check('riposte du spectre : projectile',await ev('__fx.has("proj")&&__fx.has("hurtflash")'),await ev('[...__fx]'))
        # attaque de zone d'un boss : onde de choc sur l'équipe
        await ev('startBattle({mode:"story",n:40});fight.wave=2;fight.enemies[2].hp=fight.enemies[2].max=999999;renderBattle()');await pg.wait_for_timeout(250)
        await ev('__fx.clear()');await ev('fight.turn=2;fight.stun=0;tapOrb(0)');await pg.wait_for_timeout(1100)
        check('attaque de zone : onde de choc',await ev('__fx.has("quakefx")'),await ev('[...__fx]'))
        # vitesse ×2 appliquée aux mouvements
        await ev('setPref("spd",2);startBattle({mode:"story",n:30});fight.stun=5;renderBattle()');await pg.wait_for_timeout(250);await ev('tapOrb(0)')
        check('vitesse ×2 : mouvements accélérés',await ev('document.querySelectorAll(".battlestage .sFig")[0].getAnimations().some(a=>a.playbackRate===2)'))
        await ev('setPref("spd",1)');await pg.wait_for_timeout(600)
        # animations coupées
        await ev('setPref("anim",false);startBattle({mode:"story",n:30});fight.stun=0;fight.turn=2;renderBattle()');await ev('__fx.clear()');await ev('tapOrb(0)');await pg.wait_for_timeout(900)
        check('animations coupées : aucun effet',await ev('__fx.size')==0,await ev('[...__fx]'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
