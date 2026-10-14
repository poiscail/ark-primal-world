import asyncio,pathlib
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='()=>{for(let k=0;k<300&&!fight.over;k++){fight.enemies[fight.wave].hp=1;tapOrb(0)}return fight.over}'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);pg=await b.new_page(viewport={'width':390,'height':844})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);ev=pg.evaluate
        await ev('localStorage.removeItem("arkPrimalPrefs")')
        base='S.team=[{id:1,type:"rex",level:30,xp:0},{id:2,type:"spino",level:30,xp:0},{id:3,type:"trike",level:30,xp:0}];S.bal={};S.cnt={};S.dcnt={};S.stone=0;S.stage=0;S.level=1;S.xp=0;'
        await ev(base);await ev('ens()')
        # sons : on compte les oscillateurs créés
        await ev('window.__osc=0;(()=>{const c=ac();const o=c.createOscillator.bind(c);c.createOscillator=()=>{window.__osc++;return o()}})()')
        await ev('startBattle({mode:"story",n:1})');await ev('tapOrb(0)');check('son au tap',await ev('window.__osc')>0)
        n0=await ev('window.__osc');await ev('setPref("sound",false)');await ev('tapOrb(1)');check('son coupé: aucun oscillateur',await ev('window.__osc')==n0)
        await ev('setPref("sound",true)')
        # difficulté
        d={}
        for k in ['easy','normal','hard']:
            await ev(f'setPref("diff","{k}")');d[k]=await ev('(()=>{startBattle({mode:"story",n:20});return [fight.enemies[0].hp,fight.enemies[0].atk]})()')
        check('difficulté: facile < normal < difficile (PV)',d['easy'][0]<d['normal'][0]<d['hard'][0],d)
        check('difficulté: ATQ ordonnée',d['easy'][1]<d['normal'][1]<d['hard'][1],d)
        rw={}
        for k in ['easy','normal','hard']:
            await ev(f'setPref("diff","{k}")');await ev(base);await ev('S.level=1;S.xp=0;startBattle({mode:"story",n:20})');await ev(WIN);rw[k]=await ev('S.stone')
        check('difficulté: récompenses proportionnelles',rw['easy']<rw['normal']<rw['hard'],rw)
        check('rapport affiche la même récompense que reçue',await ev('fight.report.includes(String(S.stone))'))
        await ev('setPref("diff","normal")')
        # télémétrie
        await ev(base);await ev('startBattle({mode:"story",n:5})');await ev(WIN)
        await ev('startBattle({mode:"story",n:5});fight.hp=fight.hp.map(()=>1);fight.enemies.forEach(e=>{e.atk=99999;e.hp=9e9;e.max=9e9});for(let k=0;k<200&&!fight.over;k++){tapOrb(0);fight.stun=0}')
        r=await ev('S.bal["histoire n5 [Normal]"]');check('télémétrie: 1 victoire 1 défaite',r and r['w']==1 and r['l']==1,r)
        check('rapport lisible',await ev('balReport().includes("histoire n5")'))
        # tour/arène/événement tracked
        await ev('startBattle({mode:"tower"})');await ev(WIN);await ev('arenaFight(0)');await ev(WIN);await ev('startBattle({mode:"event",t:0,wk:wkNow()})');await ev(WIN)
        ks=await ev('Object.keys(S.bal).join("|")');check('télémétrie tour/arène/événement',all(x in ks for x in ['tour','arène','événement']),ks)
        # réglages UI
        await pg.click('#setFab');check('modale réglages',await ev('!document.getElementById("setVeil").classList.contains("hide")'))
        await ev('setPref("anim",false)');check('animations coupées -> classe',await ev('document.body.classList.contains("noanim")'))
        await ev('setPref("music",true)');check('musique démarre',await ev('musicT!==null'));await ev('setPref("music",false)');check('musique stoppe',await ev('musicT===null'))
        await ev('closeSettings()');await pg.reload();await pg.wait_for_timeout(300)
        check('préférences persistantes',await ev('PREFS.anim===false'))
        await ev('setPref("anim",true)')
        # confettis + secousse sans erreur
        await ev(base);await ev('startBattle({mode:"story",n:1})');await ev(WIN);check('confettis à la victoire',await ev('!!document.querySelector(".confetti")'))
        check('aucune erreur JS',not errs,errs)
        await b.close()
    print('ECHECS:',FAILS) if FAILS else print('TOUT OK')
asyncio.run(main())
