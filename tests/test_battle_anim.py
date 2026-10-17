"""Animations de combat : scène, projectiles, chiffres flottants, barres, bannières, résultat à étoiles."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
SHOTS=len(sys.argv)>1
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"spino",level:40,xp:0},{id:2,type:"trike",level:40,xp:0},{id:3,type:"raptor",level:40,xp:0}];S.nextId=10;S.items=[];S.tut={off:true,seen:{}};ens();'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1280,'height':800});pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev(BASE)
        check('particules ambiantes présentes',await ev('document.querySelectorAll("#ambient i").length')>=10)
        await ev('startBattle({mode:"story",n:1})');await pg.wait_for_timeout(300)
        check('bannière de début de combat',await ev('document.querySelectorAll(".wavebn").length')>=1)
        check('scène de zone appliquée',await ev('/z-/.test(document.querySelector("#battleArea .battlestage").className)'))
        check('ennemi et équipe dessinés sur la scène',await ev('document.querySelectorAll(".battlestage .sEnemy svg").length')==1 and await ev('document.querySelectorAll(".battlestage .sFig").length')==3)
        check('couches de décor (4 plans depuis 0.39)',await ev('document.querySelectorAll(".battlestage .sc-layer").length')==4)
        check('orbes en verre avec symbole',await ev('document.querySelectorAll("#battleArea .orb .osym").length')==9)
        if SHOTS:await pg.screenshot(path='/tmp/shots/battle_start.png')
        await pg.wait_for_timeout(1800)
        # on compte les effets créés (ils ne vivent qu'une fraction de seconde) plutôt que ceux encore présents
        await ev('window.__fxc={};new MutationObserver(M=>M.forEach(m=>m.addedNodes.forEach(n=>{if(n.classList)["tx","trail","hurtflash","shk","proj","jawfx","istar","spdln","swipe","spikefx","quakefx","sonicfx","jetfx"].forEach(c=>{if(n.classList.contains(c))__fxc[c]=(__fxc[c]||0)+1})}))).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]})')
        await ev('tapOrb(0)');await pg.wait_for_timeout(250)
        # 0.13 : chaque famille a sa propre attaque (morsure, charge…) au lieu du projectile générique
        check('effets d\'attaque lancés',await ev('document.querySelectorAll("#fxLayer .proj,#fxLayer .jawfx,#fxLayer .istar,#fxLayer .spdln,#fxLayer .swipe,#fxLayer .spikefx,#fxLayer .quakefx,#fxLayer .sonicfx,#fxLayer .jetfx").length+["proj","jawfx","istar","spdln","swipe","spikefx","quakefx","sonicfx","jetfx"].reduce((a,k)=>a+(__fxc[k]||0),0)')>=1)
        check('allié en charge',await ev('[...document.querySelectorAll("#battleArea .sFig")].some(e=>e.getAnimations().length>0)||document.querySelectorAll("#battleArea .lunge").length>0'))
        await pg.wait_for_timeout(500)
        check('chiffre de dégâts flottant',await ev('document.querySelectorAll(".dmgnum").length')>=1)
        check('textures d\'impact (Kenney)',await ev('(__fxc.tx||0)+document.querySelectorAll(".tx").length')>=1)
        check('polices intégrées chargées',await ev('document.fonts.check("900 20px Orbitron") && document.fonts.check("700 14px \\"Exo 2\\"")'))
        if SHOTS:await pg.screenshot(path='/tmp/shots/battle_hit.png')
        await pg.wait_for_timeout(900)
        # attaque ennemie : forcer
        await ev('fight.turn=2;fight.stun=0;fight.enemies[fight.wave].max=999999;fight.enemies[fight.wave].hp=999999;tapOrb(1)');await pg.wait_for_timeout(500)
        check('traînée de PV ou flash de dégâts',await ev('document.querySelectorAll(".progress .trail,.hurtflash,#battleArea .shk").length+(__fxc.trail||0)+(__fxc.hurtflash||0)+(__fxc.shk||0)')>=1)
        if SHOTS:await pg.screenshot(path='/tmp/shots/battle_foe.png')
        # victoire -> étoiles
        await ev('fight.enemies.forEach(e=>e.hp=1);fight.wave=2;fight.turn=0');
        for i in range(3):
            if await ev('fight.over'):break
            await ev('fight.enemies[fight.wave].hp=1;tapOrb(0)');await pg.wait_for_timeout(200)
        await pg.wait_for_timeout(1500)
        check('victoire',await ev('fight.over')=='win')
        check('écran de résultat animé avec étoiles',await ev('document.querySelectorAll("#battleArea .resultfx .stars span").length')==3)
        check('étoiles sauvegardées dans le combat',await ev('fight.stars>=1'))
        if SHOTS:await pg.screenshot(path='/tmp/shots/battle_win.png')
        # thème clair
        await ev('setPref("theme","light")');await ev('startBattle({mode:"story",n:30})');await pg.wait_for_timeout(500)
        if SHOTS:await pg.screenshot(path='/tmp/shots/battle_light.png')
        # animations coupées
        await pg.wait_for_timeout(2000);await ev('setPref("anim",false);startBattle({mode:"story",n:2})');await pg.wait_for_timeout(300);await ev('tapOrb(0)');await pg.wait_for_timeout(500)
        check('aucune animation quand désactivées',await ev('document.querySelectorAll(".proj,.dmgnum,.wavebn").length')==0)
        check('PC : pas de réglage « Vibrations »',not await ev('(setRender(),document.getElementById("setBody")||document.body).innerHTML.includes("Vibrations")'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
