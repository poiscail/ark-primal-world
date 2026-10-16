"""Navigation épurée, sous-onglets, À faire, Défi du jour, Fouilles."""
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
        await ev('S.tut={off:true,seen:{}};S.team=[{id:1,type:"spino",level:60,xp:0},{id:2,type:"magma",level:60,xp:0},{id:3,type:"levia",level:60,xp:0}];S.stage=12;ens();setPref("lore",false);go("home")')
        check('5 onglets en bas',await ev('document.querySelectorAll(".bottomnav button").length')==5)
        check('onglet Quêtes',await ev('document.querySelector(".bottomnav [data-screen=missions]").textContent.includes("Quêtes")'))
        check('À faire aujourd\'hui listé',await ev('document.querySelectorAll("#todoBox .todo").length')>=4)
        check('accueil épuré : profil masqué',await ev('document.getElementById("profileBox").classList.contains("subhide")'))
        await ev('subSet("home","profile")');check('sous-onglet Profil',await ev('!document.getElementById("profileBox").classList.contains("subhide") && document.getElementById("homeNext").classList.contains("subhide")'))
        await ev('go("team")');check('Équipe : Meute par défaut',await ev('!document.getElementById("collection").classList.contains("subhide") && document.getElementById("bagBox").classList.contains("subhide")'))
        await ev('subSet("team","bag")');check('Équipe : Sac',await ev('!document.getElementById("bagBox").classList.contains("subhide") && document.getElementById("collection").classList.contains("subhide")'))
        await ev('subSet("team","dex")');check('Équipe : Bestiaire',await ev('colF.book===true && document.querySelectorAll("#colTools .dx").length')==True or await ev('document.querySelectorAll("#colTools .dx").length')>=40)
        await ev('go("summon");subSet("summon","shop")');check('Invocation : Boutique',await ev('!document.getElementById("gachaY").classList.contains("subhide") && document.getElementById("gachaX").classList.contains("subhide")'))
        await ev('go("story")');check('Aventure : 9 sous-onglets (avec Raid, Labyrinthe, Épreuves et Grand Nord)',await ev('document.querySelectorAll("#subnav button").length')==9)
        await ev('go("missions")');check('Quêtes : 6 sous-onglets (avec le Nid)',await ev('document.querySelectorAll("#subnav button").length')==6)
        await ev('go("exped");go("home");document.querySelector(".bottomnav [data-screen=missions]").click()');check('Quêtes revient au dernier sous-onglet',await ev('screen')=='exped')
        # défi du jour
        await ev('go("daily")');check('écran Défi',await ev('document.querySelector("#daily .banner h1").textContent.length>0'))
        await ev('dchStart()');check('combat de défi modifié',await ev('!!fight.daily && fight.enemies.every(e=>e.boss||e.tr)'))
        t0=await ev('S.tickets')
        for i in range(80):
            if await ev('fight.over'):break
            await ev('tapOrb(0)')
        check('défi gagné',await ev('fight.over')=='win')
        check('récompense du défi + une seule fois',await ev('S.dch.done')==True and await ev('S.tickets')>=t0+2)
        t1=await ev('S.tickets');await ev('dchStart();fight.enemies.forEach(e=>e.hp=1);fight.wave=2;tapOrb(0)');check('pas de 2e récompense',await ev('S.tickets')-t1<2)
        # fouilles
        await ev('go("dig")');p0=await ev('S.dig.picks')
        await ev('digTap(0);digTap(0)');check('une pioche par case',await ev('S.dig.picks')==p0-1)
        await ev('digTap(1);digTap(2);digTap(3)');check('plus de pioche = bloqué',await ev('S.dig.picks')==0 and await ev('Object.keys(S.dig.open).length')==3)
        await ev('S.stone=1000;digBuy()');check('achat de pioche',await ev('S.dig.picks')==1 and await ev('S.stone')==940)
        r1=await ev('JSON.stringify(digReward(5))');r2=await ev('JSON.stringify(digReward(5))');check('terrain stable dans la journée',r1==r2)
        await ev('S.dig.day="2000-01-01";S.dch.day="2000-01-01";ens()');check('réinitialisation quotidienne',await ev('S.dig.picks')==3 and await ev('S.dch.done')==False)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
