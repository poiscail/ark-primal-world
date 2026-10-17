"""Thèmes (7 ambiances + images), nouvelles espèces, Raid hebdomadaire, Marché du jour."""
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
        await ev('S.tut={off:true,seen:{}};S.team=[{id:1,type:"spino",level:80,xp:0},{id:2,type:"magma",level:80,xp:0},{id:3,type:"levia",level:80,xp:0}];S.nextId=10;S.stage=20;S.stone=5000;S.essence=500;S.tickets=20;ens();setPref("lore",false);setPref("anim",false)')
        # thèmes
        await ev('openSettings()');check('10 thèmes proposés (3 de plus depuis 0.39)',await ev('document.querySelectorAll("#setVeil .skc").length')==10)
        acc0=await ev('getComputedStyle(document.documentElement).getPropertyValue("--acc")')
        await ev('document.querySelector("#setVeil .skc.bg-jungle").click()');await pg.wait_for_timeout(100)
        check('thème Jungle appliqué',await ev('document.documentElement.dataset.skin')=='jungle' and await ev('getComputedStyle(document.documentElement).getPropertyValue("--acc")')!=acc0)
        check('image de fond chargée',await ev('getComputedStyle(document.getElementById("skinBg")).backgroundImage.startsWith("url(\\"data:image/webp")'))
        await ev('setSkin("clair")');check('thème clair = mode clair',await ev('document.documentElement.dataset.theme')=='light')
        await ev('setSkin("volcan")');await pg.reload();await pg.wait_for_timeout(400)
        check('thème mémorisé au rechargement (avant affichage)',await ev('document.documentElement.dataset.skin')=='volcan' and await ev('document.documentElement.dataset.theme')=='dark')
        await ev('setSkin("")');check('mode automatique',await ev('!document.documentElement.dataset.skin') and await ev('PREFS.theme')=='auto')
        imgs=await ev('["neon","clair","jungle","volcan","abysses","mystique","desert"].every(k=>{const d=document.createElement("div");d.className="bg-"+k;document.body.appendChild(d);const ok=getComputedStyle(d).backgroundImage.includes("data:image/webp");d.remove();return ok})')
        check('7 images de fond présentes',imgs)
        # espèces
        check('100 espèces',await ev('Object.keys(SPEC).length')==100)
        check('portraits des nouvelles espèces',await ev('NEWSP.every(a=>portrait(a[0]).includes("<svg")&&!/NaN|undefined/.test(portrait(a[0])))'))
        check('emojis uniques',await ev('(()=>{const e=Object.values(SPEC).map(s=>s.e);return new Set(e).size===e.length})()'))
        check('nouvelles évolutions valides',await ev('["dimorph","kentro","elasmo"].every(k=>SPEC[EVO[k]])'))
        check('nouvelles espèces tirables',await ev('pickType("Légendaire")&&Object.keys(SPEC).filter(k=>SPEC[k].r==="Légendaire").includes("chrono")'))
        # raid
        await ev('S=JSON.parse(JSON.stringify(S));S.team=[{id:1,type:"spino",level:80,xp:0},{id:2,type:"magma",level:80,xp:0},{id:3,type:"levia",level:80,xp:0}];S.stage=20;ens();go("raid")')
        check('écran Raid',await ev('document.querySelector("#raid .banner h1").textContent.length')>3)
        hp0=await ev('S.raid.hp');await ev('raidStart()')
        check('combat de raid : boss unique',await ev('!!fight.raid && fight.wave===2 && fight.enemies[2].boss'))
        for i in range(40):
            if await ev('fight.over'):break
            await ev('tapOrb(0)')
        check('raid terminé (temps ou défaite)',await ev('!!fight.over'))
        check('dégâts déduits du boss de la semaine',await ev('S.raid.hp')<hp0)
        check('tentatives décomptées',await ev('S.raid.left')==2)
        await ev('S.raid.hp=Math.round(S.raid.max*.4);render()');t=await ev('S.tickets');await ev('raidClaim(50);raidClaim(75)')
        check('palier 50 % réclamé, pas 75 %',await ev('S.raid.claimed[50]===1 && !S.raid.claimed[75]') and await ev('S.tickets')==t+3)
        await ev('S.raid.left=0;const n=fight;raidStart()');check('plus de tentative',await ev('S.raid.left')==0)
        # marché
        await ev('go("summon");subSet("summon","market")');check('Marché : 6 offres',await ev('document.querySelectorAll("#mktBox .mkt").length')==6)
        k=await ev('mktToday()[0].k');s0=await ev('JSON.stringify([S.stone,S.essence,S.tickets])');await ev(f'mktBuy("{k}")')
        check('achat effectué',await ev(f'S.mkt.bought["{k}"]===1') and await ev('JSON.stringify([S.stone,S.essence,S.tickets])')!=s0)
        s1=await ev('JSON.stringify([S.stone,S.essence,S.tickets])');await ev(f'mktBuy("{k}")');check('une seule fois par jour',await ev('JSON.stringify([S.stone,S.essence,S.tickets])')==s1)
        await ev('S.mkt.day="2000-01-01";ens()');check('marché renouvelé',await ev('Object.keys(S.mkt.bought).length')==0)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
