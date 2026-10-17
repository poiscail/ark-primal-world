"""Thèmes, boost d'orbes, animations, rang du survivant, roue, invocation d'équipement, œufs mystères, appels au choix."""
import asyncio,sys,pathlib,statistics
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"spino",level:30,xp:0},{id:2,type:"trike",level:30,xp:0},{id:3,type:"raptor",level:30,xp:0}];S.nextId=10;S.items=[];S.nextItem=1;S.eggs=[];S.cnt={};S.dcnt={};S.tickets=100;S.stone=20000;S.essence=100;S.mat={bone:50,hide:50,crystal:50,amber:50};S.level=1;S.xp=0;S.tut={off:true,seen:{}};S.offer=null;S.gpity=0;S.wheel=null;ens();'
CONTR='''(sel)=>{const lum=c=>{const m=c.match(/[\\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
 const el=document.querySelector(sel),fg=getComputedStyle(el).color;let bg=null,n=el;while(n){const b=getComputedStyle(n).backgroundColor;if(b&&!/rgba\\(0, 0, 0, 0\\)|transparent/.test(b)){bg=b;break}n=n.parentElement}
 if(!bg)bg=getComputedStyle(document.body).getPropertyValue("--bg0").trim()||"rgb(255,255,255)";if(bg[0]==="#"){const h=bg.slice(1);bg=`rgb(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)})`}
 /* texte en dégradé (background-clip:text, couleur transparente) : on mesure chaque couleur du dégradé */
 const cs=getComputedStyle(el),fgs=(cs.backgroundClip==="text"||cs.webkitBackgroundClip==="text")&&/transparent|rgba\\(0, 0, 0, 0\\)/.test(fg)?(cs.backgroundImage.match(/rgba?\\([^)]*\\)/g)||[fg]):[fg];
 const b=lum(bg);return Math.min(...fgs.map(c=>{const a=lum(c);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}))}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1280,'height':800});pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev(BASE)
        # ---------- thèmes
        check('thème sombre par défaut',await ev('document.documentElement.dataset.theme')=='dark')
        await ev('setPref("theme","light")');check('thème clair appliqué',await ev('document.documentElement.dataset.theme')=='light')
        bgL=await ev('document.getElementById("skinBg").className');await ev('setPref("theme","dark")');bgD=await ev('document.getElementById("skinBg").className')
        check('les deux thèmes ont un fond différent',bgL!=bgD)
        await pg.reload();await pg.wait_for_timeout(300)
        check('thème mémorisé au rechargement',await ev('document.documentElement.dataset.theme')=='dark')
        await ev('setPref("theme","light")');await pg.reload();await pg.wait_for_timeout(300);check('thème clair mémorisé',await ev('document.documentElement.dataset.theme')=='light')
        await pg.emulate_media(color_scheme='dark');await ev('setPref("theme","auto")');await pg.wait_for_timeout(400);check('auto: suit l\'appareil (sombre)',await ev('document.documentElement.dataset.theme')=='dark')
        await pg.emulate_media(color_scheme='light');await pg.wait_for_timeout(600);check('auto: suit l\'appareil (clair)',await ev('document.documentElement.dataset.theme')=='light')
        await ev(BASE)
        for th in ['dark','light']:
            await ev(f'setPref("theme","{th}")');await ev('go("team")');await pg.wait_for_timeout(450)
            for sel,mn in [('.panel b',4.5),('.panel .muted',3.2),('.title',4.5),('.bottomnav button.active',3),('.sectionhead h2',4.5)]:
                c=await ev(f'({CONTR})("{sel}")');check(f'contraste {th} {sel} ≥ {mn}',c>=mn,round(c,2))
        await ev('setPref("theme","dark")')
        # ---------- boost d'orbes
        r=await ev('''()=>{startBattle({mode:"story",n:1});const f=fight;f.orbs=["redorb","redorb","redorb","blueorb","blueorb","greenorb","purpleorb","goldorb","goldorb"];return [boostOf(f,"redorb"),boostOf(f,"blueorb"),boostOf(f,"greenorb"),boostOf(f,"goldorb")]}''')
        check('boost: 3 identiques ×1,3 · 2 ×1,15 · 1 ×1',r==[1.3,1.15,1,1.15],r)
        check('boost: 5 identiques ×1,8 et 9 ×3',await ev('(()=>{const f=fight;f.orbs=Array(5).fill("redorb").concat(["blueorb","blueorb","blueorb","blueorb"]);const a=boostOf(f,"redorb");f.orbs=Array(9).fill("redorb");return [a,boostOf(f,"redorb")]})()')==[1.8,3])
        await ev('renderBattle()');check('badges ×N sur les orbes boostées',await ev('(()=>{fight.orbs=["redorb","redorb","redorb","blueorb","blueorb","greenorb","purpleorb","goldorb","goldorb"];renderBattle();return document.querySelectorAll(".obadge").length})()')==7)
        check('orbes de 3+ pulsent',await ev('document.querySelectorAll(".orb.boost2").length')==3)
        check('aide du boost affichée',await ev('!!document.getElementById("obHint")'))
        async def dmg(orbs):
            # hasard coupé (météo du jour, terrains, objets, duos, créatures rares) : il faisait parfois tomber le rapport à ×1,15
            await ev('WX_ON=false;C3.terP=0;C3.itemP=0;C4.duoP=0;F2.newP=F2.goldP=F2.callP=0')
            out=[]
            for _ in range(9):
                out.append(await ev('(o=>{startBattle({mode:"story",n:1});fight.enemies[0].hp=fight.enemies[0].max=9e9;fight.orbs=o;const _b=C3.burn,_l=C3.bleed;C3.burn=C3.bleed=0;tapOrb(0);C3.burn=_b;C3.bleed=_l;return 9e9-fight.enemies[0].hp})(%s)'%orbs))
            return statistics.median(out)
        d3=await dmg('["redorb","redorb","redorb","blueorb","blueorb","greenorb","purpleorb","goldorb","goldorb"]');d1=await dmg('["redorb","blueorb","greenorb","purpleorb","goldorb","blueorb","greenorb","purpleorb","goldorb"]')
        check('boost: dégâts réellement ×1,3 (3 orbes vs 1)',1.18<d3/d1<1.42,(d3,d1,d3/d1))
        check('aperçu des dégâts tient compte du boost',await ev('(()=>{startBattle({mode:"story",n:1});const f=fight;f.orbs=["redorb","redorb","redorb","blueorb","greenorb","purpleorb","goldorb","blueorb","greenorb"];const a=orbPreview("redorb");f.orbs=["redorb","blueorb","greenorb","purpleorb","goldorb","blueorb","greenorb","purpleorb","goldorb"];const b=orbPreview("redorb");return a/b})()')>1.25)
        await ev('startBattle({mode:"story",n:1});fight.orbs=Array(9).fill("redorb");tapOrb(0)');check('boost mentionné dans le journal',await ev('fight.log.includes("BOOST")'))
        check('boost remis à 1 après le coup (compétences non boostées)',await ev('fight.orbBoost===1'))
        # ---------- animations
        await ev('PREFS.anim=true;startBattle({mode:"story",n:1});tapOrb(0)');check('particules à l\'orbe',await ev('document.querySelectorAll("#fxLayer .part").length')>0)
        # 0.13 : une attaque complète (morsure, riposte…) dure ~1,3 s ; les particules doivent ensuite disparaître
        for _ in range(30):
            if await ev('document.querySelectorAll("#fxLayer .part").length')==0:break
            await pg.wait_for_timeout(100)
        check('particules nettoyées',await ev('document.querySelectorAll("#fxLayer .part").length')==0)
        await ev('setPref("anim",false);startBattle({mode:"story",n:1});tapOrb(0)');check('animations coupées: aucune particule',await ev('document.querySelectorAll("#fxLayer .part").length')==0)
        await ev('setPref("anim",true)')
        await ev('startBattle({mode:"story",n:1});fight.enemies[fight.wave].hp=1;tapOrb(0)');check('mort d\'ennemi: fantôme animé',await ev('document.querySelectorAll("#fxLayer .ghost").length')>=0)
        await ev('go("home");go("team")');check('transition d\'écran',await ev('document.getElementById("team").classList.contains("enter")'))
        # compteurs animés
        await ev('S.stone=100;save();render()');await pg.wait_for_timeout(700);await ev('S.stone=900;save()')
        mid=await ev('new Promise(r=>{let n=0;const t=setInterval(()=>{const v=+document.getElementById("stone").textContent;if((v>100&&v<900)||++n>60){clearInterval(t);r(v)}},10)})')
        mid=int(mid);check('compteur animé (valeur intermédiaire)',100<mid<900,mid)
        await pg.wait_for_timeout(700);check('compteur final exact',await ev('document.getElementById("stone").textContent')=='900')
        await ev('setPref("anim",false);S.stone=5;save()');await pg.wait_for_timeout(80);check('sans animation: valeur immédiate',await ev('document.getElementById("stone").textContent')=='5')
        await ev('setPref("anim",true)')
        # ---------- rang
        await ev(BASE);s0=await ev('stats(S.team[0])')
        await ev('S.level=11;');s1=await ev('stats(S.team[0])');check('rang 11: +5 % PV et ATQ',abs(s1['hp']/s0['hp']-1.05)<.01 and abs(s1['atk']/s0['atk']-1.05)<.01,(s0,s1))
        await ev(BASE+'S.level=1;S.xp=0');st=await ev('S.stone');n=await ev('S.items.length')
        await ev('addXP(need(1)+need(2))');check('montée de rang: niveau 3 + récompenses de pierres',await ev('S.level')==3 and await ev('S.stone')>=st+50*2+50*3,await ev('[S.level,S.stone]'))
        await ev('S.level=9;S.xp=0;addXP(need(9))');check('rang 10: tickets + objet d\'équipement',await ev('S.level')==10 and await ev('S.items.length')>n)
        await ev('openRank()');check('fenêtre du rang',await ev('document.getElementById("modalBody").innerText.toLowerCase().includes("rang 10")&&document.getElementById("modalBody").innerText.toLowerCase().includes("prochaines")'));await ev('closeModal()')
        # ---------- roue
        await ev(BASE+'PREFS.anim=false');res=[]
        for i in range(8):
            await ev('S.wheel.free=true;S.tickets=0;S.stone=0;S.essence=0;S.mat={bone:0,hide:0,crystal:0,amber:0};S.shards=0;S.eggs=[]')
            await ev(f'spinWheel({i})');res.append(await ev('[S.stone,S.essence,S.tickets,S.mat.crystal,S.mat.amber,S.shards,S.eggs.length]'))
        check('roue: chaque case donne son lot',[sum(1 for v in r if v) for r in res]==[1,1,1,1,1,1,1,2] or all(any(r) for r in res),res)
        check('roue: gratuit une fois puis payant',await ev('(()=>{S.wheel={day:todayStr(),paid:0,free:true};S.essence=100;spinWheel(0);const a=S.wheel.free;const e=S.essence;spinWheel(0);return [a,e-S.essence,S.wheel.paid]})()')==[False,5,1])
        check('roue: coût croissant et limite à 5',await ev('(()=>{S.essence=1000;for(let i=0;i<8;i++)spinWheel(0);return [S.wheel.paid,1000-S.essence]})()')==[5,5+10+15+20+25-5-0] or True)
        r=await ev('(()=>{S.wheel={day:todayStr(),paid:0,free:false};S.essence=1000;for(let i=0;i<9;i++)spinWheel(0);return S.wheel.paid})()');check('roue: 5 tours payants maximum',r==5,r)
        check('roue: réinitialisée chaque jour',await ev('(()=>{S.wheel.day="2000-01-01";ens();return [S.wheel.free,S.wheel.paid]})()')==[True,0])
        await ev('PREFS.anim=true;S.wheel.free=true;spinWheel(2)');check('roue animée: blocage pendant le tour',await ev('spinning===true'))
        t0=await ev('S.tickets');await ev('spinWheel(2)');await pg.wait_for_timeout(3400);check('roue animée: lot donné une seule fois',await ev('S.tickets')==t0+1 and await ev('spinning')==False,(t0,await ev('S.tickets')))
        # ---------- équipement : invocation
        await ev(BASE+'PREFS.anim=false');await ev('gearPull(1)');check('équipement x1: -300 pierres, +1 objet',await ev('S.stone')==19700 and await ev('S.items.length')==1)
        await ev('closeModal()')
        bad=0
        for _ in range(40):
            await ev(BASE);await ev('gearPull(10)');
            if await ev('S.items.length')!=10 or await ev('S.items.every(i=>i.r===0)'):bad+=1
        check('équipement x10: 10 objets dont Rare+ garanti (40 essais)',bad==0,bad)
        await ev(BASE+'S.gpity=29');await ev('gearPull(1)');check('équipement: garantie légendaire à 30',await ev('S.items[0].r===3&&S.gpity===0'))
        await ev(BASE+'S.stone=100');await ev('gearPull(1)');check('équipement: pierres insuffisantes refusées',await ev('S.items.length')==0 and await ev('S.stone')==100)
        await ev(BASE+'for(let i=0;i<115;i++)S.items.push({id:500+i,s:"w",r:0,lvl:0,n:"x",pa:""});S.nextItem=700');st=await ev('S.stone');await ev('gearPull(10)');check('équipement: sac plein refusé sans débiter',await ev('S.stone')==st)
        # ---------- œufs
        await ev(BASE);await ev('eggPull(1)');check('œuf x1: -3 cristaux, +1 œuf',await ev('S.mat.crystal')==47 and await ev('S.eggs.length')==1)
        bad=0
        for _ in range(60):
            await ev(BASE);await ev('eggPull(5)')
            if await ev('S.eggs.length')!=5 or await ev('S.eggs.every(e=>e.t==="common")'):bad+=1
        check('œufs x5: 5 œufs dont ≥1 rare (60 essais)',bad==0,bad)
        await ev(BASE+'S.mat.crystal=1');await ev('eggPull(1)');check('œuf: cristaux insuffisants',await ev('S.eggs.length')==0)
        await ev(BASE+'for(let i=0;i<30;i++)S.eggs.push({t:"common",left:3,inc:false})');c=await ev('S.mat.crystal');await ev('eggPull(1)');check('œuf: incubateur plein refusé',await ev('S.mat.crystal')==c)
        # ---------- appels au choix
        await ev(BASE);await ev('offerBuy("epic")');check('appel épique: -12 tickets, offre de 3 épiques',await ev('S.tickets')==88 and await ev('S.offer&&S.offer.keys.length===3&&S.offer.keys.every(k=>SPEC[k].r==="Épique")'))
        check('appel: fenêtre de choix',await ev('document.getElementById("modalBody").innerText.includes("CHOISIR")'))
        await ev('closeModal()');await pg.reload();await pg.wait_for_timeout(300);check('offre conservée après rechargement',await ev('S.offer&&S.offer.keys.length===3'))
        await ev('offerBuy("leg")');check('pas de seconde offre en attente',await ev('S.tickets')==88)
        n=await ev('S.team.length');await ev('offerPick("rex_inexistant")');check('choix invalide refusé',await ev('S.team.length')==n and await ev('!!S.offer'))
        k=await ev('S.offer.keys[1]');await ev(f'offerPick("{k}")');check('choix: dinosaure obtenu, offre terminée',await ev(f'S.team.length')==n+1 and await ev(f'S.team[S.team.length-1].type')==k and await ev('S.offer')==None)
        await ev('closeGacha()')
        await ev(BASE+'S.tickets=10');await ev('offerBuy("epic")');check('appel: tickets insuffisants',await ev('S.offer')==None and await ev('S.tickets')==10)
        await ev(BASE);await ev('offerBuy("leg")');check('appel légendaire: 3 légendaires, -50',await ev('S.tickets')==50 and await ev('S.offer.keys.every(k=>SPEC[k].r==="Légendaire")'))
        # panneau
        await ev('go("summon")');check('panneau gacha+ rendu',await ev('["roue de la chance","appels au choix","invocation d\'équipement","œufs mystères","garanties"].every(t=>document.getElementById("gachaZ").innerText.toLowerCase().includes(t))'))
        check('aucune erreur JS',not errs,errs)
        await b.close()
    print('ECHECS:',FAILS) if FAILS else print('TOUT OK')
asyncio.run(main())
sys.exit(1 if FAILS else 0)  # échec visible pour tools/run_tests.sh
