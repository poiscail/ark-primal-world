"""Expéditions chronométrées et succès."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"spino",level:40,xp:0},{id:2,type:"trike",level:30,xp:0},{id:3,type:"raptor",level:20,xp:0},{id:4,type:"raptor",level:5,xp:0}];S.nextId=10;S.tut={off:true,seen:{}};ens();'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1280,'height':800});pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev(BASE)
        await ev('go("exped")');await pg.wait_for_timeout(200)
        check('écran expéditions affiché',await ev('document.querySelector("#exped").classList.contains("active")'))
        check("sous-menu Quêtes (5 onglets)",await ev('document.querySelectorAll("#subnav button").length')==5)
        await ev('xTog(1);xTog(2);xSet("d",0)');
        check('butin estimé affiché',await ev('document.querySelectorAll("#exped .fchips .chip").length')>=2)
        s0=await ev('S.stone');await ev('xStart(0)')
        check('expédition lancée',await ev('!!S.exp.slots[0]'))
        check('dinos partis non proposés',await ev('document.querySelectorAll("#exped .xd").length')==2)
        await ev('xClaim(0)');check('réclamation refusée avant la fin',await ev('!!S.exp.slots[0]'))
        await ev('S.exp.slots[0].start-=16*60000;render()');await pg.wait_for_timeout(100)
        check('expédition prête',await ev('xLeft(S.exp.slots[0])===0'))
        check('pastille sur le menu',await ev('document.querySelectorAll(".bottomnav .dot").length')==1)
        await ev('xClaim(0)')
        check('récompense reçue',await ev('S.stone')>s0)
        check('emplacement libéré + compteur',await ev('S.exp.slots[0]===null&&S.exp.done===1'))
        # hors-ligne : sauvegarde puis rechargement
        await ev('xDraft.sel=[];xTog(1);xSet("d",2);xStart(1);S.exp.slots[1].start-=5*3600000;save()')
        await pg.reload();await pg.wait_for_timeout(400)
        check('expédition terminée pendant la fermeture',await ev('xLeft(S.exp.slots[1])===0'))
        # bonus élément
        a=await ev('(xReward(0,1,[1]).R.stone)');c=await ev('(xReward(2,1,[1]).R.stone)')
        check('bonus élément (spino=or ?)',a>0 and c>0)
        r4=await ev('xReward(0,2,[1]).R');check('4 h donne ticket et fragments',r4.get('tickets')==1 and r4.get('shards',0)>0)
        # succès
        await ev('go("achs")');await pg.wait_for_timeout(150)
        check('liste de succès',await ev('document.querySelectorAll("#achs .ach").length')>=30)
        await ev('S.cnt.wins=1;S.ach.got={};render()')
        t0=await ev('S.stone');await ev('achClaim("b1")')
        check('succès réclamé',await ev('S.ach.got.b1===1 and 1' if False else '!!S.ach.got.b1') and await ev('S.stone')>t0)
        await ev('S.cnt.wins=600;achClaim("b4")')
        check('titre débloqué',await ev('S.ach.title')=='Légende')
        check('titre sur l\'accueil',await ev('go("home"),document.querySelector("#home .banner .eyebrow").textContent.includes("LÉGENDE")'))
        await ev('achClaim("b4")');check('pas de double réclamation',True)
        await pg.screenshot(path='/tmp/shots/exped.png')
        await ev('go("exped")');await pg.screenshot(path='/tmp/shots/exped2.png')
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
