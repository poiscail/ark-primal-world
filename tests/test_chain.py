"""Enchaînement automatique des combats, animations de plateau, bouton OK d'invocation (vrai clic)."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WINJS='for(let i=0;i<80&&!fight.over;i++)tapOrb(0)'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844});pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('S.tut={off:true,seen:{}};S.team=[{id:1,type:"spino",level:80,xp:0},{id:2,type:"magma",level:80,xp:0},{id:3,type:"levia",level:80,xp:0}];S.stage=0;S.tickets=50;ens();setPref("lore",false);setPref("anim",false)')
        await ev('startBattle({mode:"story",n:1})')
        check('bouton d\'enchaînement en combat',await ev('!!document.querySelector("#battleArea .cbtn")'))
        await ev('chainToggle()');check('option activée et mémorisée',await ev('PREFS.chain===true && JSON.parse(localStorage.getItem("arkPrimalPrefs")).chain===true'))
        await ev(WINJS);check('victoire niveau 1',await ev('fight.over')=='win')
        check('compte à rebours affiché',await ev('!!document.getElementById("chainBar")'))
        await pg.wait_for_timeout(1500)
        check('niveau 2 lancé automatiquement',await ev('fight.n===2 && !fight.over'))
        await ev(WINJS);await pg.wait_for_timeout(1500)
        check('niveau 3 lancé (série de 2)',await ev('fight.n===3') and await ev('chainCount')==2)
        await ev(WINJS);check('compte à rebours',await ev('!!document.getElementById("chainBar")'))
        await ev('chainStop("x")');await pg.wait_for_timeout(1500);check('arrêt manuel',await ev('fight.n===3 && fight.over==="win"'))
        # défaite : série remise à zéro
        await ev('startBattle({mode:"story",n:4});fight.hp=[1,0,0];fight.turn=2;fight.stun=0;fight.enemies[0].atk=99999;fight.enemies[0].hp=fight.enemies[0].max=1e9;tapOrb(0)')
        check('défaite',await ev('fight.over')=='lose');check('série remise à zéro',await ev('chainCount')==0)
        await pg.wait_for_timeout(1300);check('pas d\'enchaînement après défaite',await ev('fight.n===4'))
        # pas d'enchaînement au-delà de la progression
        await ev('S.stage=99;startBattle({mode:"story",n:100});fight.enemies.forEach(e=>e.hp=1)');await ev(WINJS);await pg.wait_for_timeout(1300);check('pas d\'enchaînement après le niveau 100',await ev('fight.n===100'))
        # animations de plateau
        await ev('setPref("anim",true);startBattle({mode:"story",n:2})');await pg.wait_for_timeout(100)
        check('orbes qui tombent',await ev('document.querySelectorAll("#battleArea .orb.drop").length')==9)
        await ev('fight.sp=100;renderBattle()');check('super attaque prête qui pulse',await ev('!!document.querySelector("#battleArea button.red.ready")'))
        await ev('chainToggle();escapeFight();setPref("anim",true)')
        # bouton OK de l'invocation : vrai clic
        await ev('go("summon");summon(1)');await pg.wait_for_timeout(3500)
        btn=await pg.query_selector('#gachaBody button.wide');await btn.click(timeout=3000)
        await pg.wait_for_timeout(200);check('le bouton OK ferme le résultat (clic réel)',await ev('document.getElementById("gachaVeil").classList.contains("hide")'))
        await ev('summon(5)');await pg.wait_for_timeout(5000);btn=await pg.query_selector('#gachaBody button.wide');await btn.click(timeout=3000);await pg.wait_for_timeout(200)
        check('OK après invocation x5 (clic réel)',await ev('document.getElementById("gachaVeil").classList.contains("hide")'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
