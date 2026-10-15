import asyncio,sys,pathlib
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='()=>{for(let k=0;k<300&&!fight.over;k++){fight.enemies[fight.wave].hp=1;tapOrb(0)}return fight.over}'
LOSE='()=>{fight.hp=fight.hp.map(()=>1);fight.enemies.forEach(e=>{e.atk=99999;e.hp=9e9;e.max=9e9});for(let k=0;k<300&&!fight.over;k++){tapOrb(0);if(fight.stun)fight.stun=0}return fight.over}'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);ev=pg.evaluate
        base='S.team=[{id:1,type:"raptor",level:30,xp:0},{id:2,type:"rex",level:30,xp:0},{id:3,type:"trike",level:30,xp:0}];S.nextId=10;S.items=[];S.nextItem=1;S.cnt={};S.dcnt={};S.tower=null;S.arena=null;S.ev=null;S.stone=0;S.tickets=0;S.shards=0;S.mat={bone:0,hide:0,crystal:0,amber:0};'
        await ev(base);await ev('ens()')
        # navigation
        check('nav: 5 onglets',await ev('document.querySelectorAll(".bottomnav button").length')==5)
        await ev('go("tower")');check('sous-nav visible sur la Tour et Aventure actif',await ev('!document.getElementById("subnav").classList.contains("hide")&&document.querySelector(\'.bottomnav [data-grp="adv"]\').classList.contains("active")'))
        await ev('go("home")');check('sous-nav cachée sur accueil',await ev('document.getElementById("subnav").classList.contains("hide")'))
        await pg.click('.bottomnav [data-grp="adv"]');check('clic Aventure -> dernier écran',await ev('screen')=='tower')
        # tour
        await ev('startBattle({mode:"tower"})');check('tour: combat étage 1',await ev('fight.o.mode==="tower"&&fight.zone.includes("Étage 1")&&fight.enemies.length===3'))
        r=await ev(WIN);check('tour: victoire',r=='win',r)
        check('tour: étage 2 + record + stone + compteur',await ev('S.tower.floor===2&&S.tower.best===1&&S.stone>0&&S.cnt.tower===1'),await ev('[S.tower,S.stone,S.cnt]'))
        check('tour: rapport avec suivi missions',await ev('fight.report.includes("Récompenses")&&fight.report.includes("Suivi des missions")'))
        await ev('startBattle()');check('tour: REJOUER -> étage suivant',await ev('fight.zone.includes("Étage 2")'))
        r=await ev(LOSE);check('tour: défaite',r=='lose',r);check('tour: défaite garde l\'étage',await ev('S.tower.floor===2'))
        # étages à modificateurs
        r=await ev('()=>{const o=[];for(const f of [5,7,9,10,35]){S.tower.floor=f;startBattle({mode:"tower"});o.push(fight.zone)}return o}');check('tour: modificateurs affichés',all('(' in z for z in r),r)
        await ev('S.tower.floor=10;startBattle({mode:"tower"})');await ev(WIN);check('tour: boss étage 10 donne butin',await ev('S.items.length>=1'))
        await ev('S.tower.best=50');await ev('claimTower(50)');check('tour: palier 50 payé une seule fois',await ev('S.tower.claimed[50]===1&&S.tickets>=5&&S.items.some(i=>i.r>=2)'))
        t0=await ev('S.tickets');await ev('claimTower(50)');check('tour: palier non redonné',await ev('S.tickets')==t0)
        await ev('S.tower.floor=500;startBattle({mode:"tower"})');check('tour: étage 500 se lance',await ev('fight.enemies[0].hp>0'))
        # arène
        await ev('escapeFight();S.arena=null;ens()');check('arène: 3 adversaires',await ev('arenaOpp().length===3'))
        await ev('arenaFight(1)');check('arène: combat lancé, 4 restants',await ev('fight.o.mode==="arena"&&S.arena.left===4'))
        r=await ev(WIN);check('arène: victoire',r=='win')
        check('arène: +22 pts, médailles, nouvel adversaire',await ev('S.arena.r===1022&&S.arena.medals===2&&S.arena.wins===1&&S.arena.opp===null'),await ev('S.arena'))
        await ev('startBattle()');check('arène: REJOUER ne contourne pas la limite',await ev('screen')=='arena' and await ev('S.arena.left')==4)
        await ev('arenaFight(2)');await ev(LOSE);check('arène: défaite -18',await ev('S.arena.r===1004&&S.arena.losses===1'),await ev('S.arena'))
        await ev('S.arena.left=0;S.arena.opp=null');await ev('arenaFight(0)');check('arène: limite quotidienne',await ev('screen')!='battle' or await ev('!fight||fight.o.mode!=="arena"||S.arena.left===0'))
        await ev('S.arena.day="2000-01-01";go("arena")');check('arène: reset quotidien',await ev('S.arena.left')==5)
        await ev('S.arena.medals=200');await ev('buyArena(5)');check('arène: achat légendaire',await ev('S.arena.medals===80&&S.items.some(i=>i.r===3)'))
        # événements
        await ev('go("events")');wk=await ev('wkNow()');await ev('startBattle({mode:"event",t:1,wk:wkNow()})');r=await ev(WIN)
        check('événement: victoire + jetons',r=='win' and await ev('S.ev.tokens===10&&S.ev.clears===1'),await ev('S.ev'))
        await ev('startBattle({mode:"event",t:1,wk:wkNow()-1})');check('événement périmé refusé',await ev('screen')=='events')
        await ev('S.ev.tokens=500;buyEv(4)');check('boutique événement: légendaire, limite 1',await ev('S.ev.bought[4]===1'))
        await ev('buyEv(4)');check('boutique événement: limite respectée',await ev('S.ev.bought[4]')==1)
        await ev('S.ev.clears=3');await ev('claimEv(3)');check('objectif événement',await ev('S.ev.claimed[3]===1'))
        await ev('S.ev.wk=wkNow()-1;evSync()');check('nouvelle semaine: remise à zéro',await ev('S.ev.tokens===0&&S.ev.clears===0&&Object.keys(S.ev.claimed).length===0'))
        r=await ev('[0,1,2,3,4,5,6,7].map(i=>EVENTS[(wkNow()+i)%4].n)');check('rotation des 4 événements',len(set(r))==4,r)
        # rendu complet
        for s in ['tower','arena','events','story','dungeon','missions']:
            await ev(f'go("{s}")')
        check('missions tour/arène/événements existent',await ev('allM().filter(([m])=>["tower","arena","events"].includes(m.t)).length>=8'))
        # anciens modes toujours OK
        await ev(base);await ev('ens();S.stage=0;startBattle({mode:"story",n:1})');r=await ev(WIN);check('histoire toujours OK',r=='win' and await ev('S.stage===1'))
        await ev('startBattle({mode:"dungeon",d:0,tier:1,n:3})');r=await ev(WIN);check('donjon toujours OK',r=='win' and await ev('S.cnt.dungeons===1'))
        await pg.screenshot(path='/tmp/modes.png')
        check('aucune erreur JS',not errs,errs)
        await b.close()
    print('ECHECS:',FAILS) if FAILS else print('TOUT OK')
asyncio.run(main())
sys.exit(1 if FAILS else 0)  # échec visible pour tools/run_tests.sh
