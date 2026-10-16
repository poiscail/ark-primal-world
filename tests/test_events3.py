"""Événements II (0.38) : aucun événement spécial sous un navigateur automatisé sauf window.__forceEv, calendrier,
bandeau d'accueil (vrai clic), jetons de fête (doublés à Halloween, défaite = 1 jeton), jetons de la semaine convertis,
boss d'événement (10 tours, classement personnel), boutique tournante (vrai clic), conversion, Volcan, Âge de glace,
Éclipse, œufs dorés, Invasion, mission de lancement, Noël, Nostalgie."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
DIE='(()=>{const f=fight;for(let i=0;i<15&&!f.over;i++){f.hp=f.hp.map(h=>h>0?1:0);f.stun=0;f.guard=0;const e=f.enemies[f.wave];e.atk=1e9;e.hp=e.max=1e9;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
STORY='fight=null;startBattle({mode:"story",n:3});F2.newP=F2.goldP=F2.callP=0'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:40,xp:0}));S.stage=40;S.tickets=50;delete S.ev3;ens();save()')
        check('aucun événement spécial sous un navigateur automatisé',await ev('evActive().length')==0)
        await ev('go("events")')
        check('calendrier des 4 prochaines semaines',await pg.locator('#events .e3cal .e3w').count()==4)
        check('boutique : 3 ou 4 offres de la semaine',3<=await pg.locator('#events .e3shop .c2row button').count()-1<=4)
        # Halloween : bandeau, jetons doublés
        await ev('window.__forceEv="halloween";go("home")')
        check('bandeau animé sur l\'accueil',await pg.locator('#e3Home .e3marq').count()==1)
        await pg.click('#e3Home');await pg.wait_for_timeout(50);check('vrai clic : bandeau → écran Événements',await ev('screen')=='events')
        t0=await ev('S.ev3.tok');await ev(STORY);r=await ev(WIN)
        check('victoire pendant Halloween : +4 jetons de fête (2 × 2)',r=='win' and await ev('S.ev3.tok')==t0+4,(r,await ev('S.ev3.tok')-t0))
        await ev('fight=null;startBattle({mode:"story",n:3});F2.newP=F2.goldP=F2.callP=0');t0=await ev('S.ev3.tok');r=await ev(DIE);await ev('renderBattle()')
        check('défaite pendant un événement : +1 jeton (×2 à Halloween)',r=='lose' and await ev('S.ev3.tok')==t0+2,(r,await ev('S.ev3.tok')-t0))
        # jetons de la semaine convertis
        await ev('S.ev.wk=wkNow()-1;S.ev.tokens=7');t0=await ev('S.ev3.tok');await ev('evSync()')
        check('jetons de la semaine passée → jetons de fête',await ev('S.ev3.tok')==t0+7 and await ev('S.ev.tokens')==0)
        # boss d'événement
        await ev('go("events")');await pg.click('#events .e3boss');await pg.wait_for_timeout(100)
        check('vrai clic : boss d\'événement lancé (vague du boss)',await ev('fight.o.mode')=='evboss' and await ev('fight.wave')==2)
        await ev('(()=>{const f=fight;f.hp=f.hp.map(()=>1e9);f.enemies[2].atk=1})()')
        for i in range(12):
            if await ev('!!fight.over'):break
            await ev('fight.stun=0;fight.orbs=Array(fight.orbs.length).fill("redorb");tapOrb(0)')
        sc=await ev('S.ev3.best.halloween&&S.ev3.best.halloween[0].s')
        check('boss d\'événement : fin après 10 tours, score enregistré',await ev('fight.over')=='lose' and await ev('fight.ebT')==10 and sc>0,(await ev('fight.over'),await ev('fight.ebT'),sc))
        check('rapport de classement personnel',"classement personnel" in await ev('fight.report||""'))
        # boutique et conversion
        await ev('S.ev3.tok=100;S.ev3.shop.b={};go("events")');i=await ev('e3Offers()[0]');c=await ev(f'E3SHOP[{i}][2]')
        await pg.click('#events .e3shop .c2row button>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic : achat dans la boutique d\'événement',await ev('S.ev3.tok')==100-c and await ev(f'!!S.ev3.shop.b[{i}]'))
        t0=await ev('S.tickets');await pg.click('#events .e3shop button:has-text("1 🎟️")');await pg.wait_for_timeout(50)
        check('vrai clic : 10 jetons → 1 ticket',await ev('S.tickets')==t0+1 and await ev('S.ev3.tok')==90-c)
        # Volcan / Âge de glace / Éclipse
        await ev(STORY);a=await ev('(()=>{fight._tap="redorb";return atkOf(0)})()');await ev('window.__forceEv="volcano"');a2=await ev('atkOf(0)')
        check('Volcan : orbes 🔥 ×1,5',abs(a2/a-1.5)<.01,(a,a2))
        await ev('fight._tap="blueorb";window.__forceEv=""');a=await ev('atkOf(0)');await ev('window.__forceEv="iceage"');a2=await ev('atkOf(0)')
        check('Âge de glace : orbes 💧 ×1,15',abs(a2/a-1.15)<.01,(a,a2));await ev('fight._tap=0')
        await ev('window.__forceEv="";fight=null;startBattle({mode:"story",n:3})');a=await ev('fight.enemies.map(e=>e.atk)')
        await ev('window.__forceEv="eclipse";fight.e3O=null;renderBattle()');a2=await ev('fight.enemies.map(e=>e.atk)')
        check('Éclipse : ennemis +10 % ATQ (une seule fois)',all(abs(y-round(x*1.1))<=1 for x,y in zip(a,a2)),(a,a2))
        await ev('renderBattle()');check('Éclipse : pas d\'empilement au rendu suivant',await ev('fight.enemies.map(e=>e.atk)')==a2)
        check('décor de l\'éclipse',await pg.locator('#battleArea .battlestage.ev-ecl').count()==1)
        # œufs dorés
        await ev('window.__forceEv="goldegg";S.ev3.eggs=24;S.ev3.eggC={};go("events")');t0=await ev('S.tickets')
        await pg.click('#events .e3act button:has-text("10 :")');await pg.wait_for_timeout(50)
        check('vrai clic : 10 œufs dorés → +2 tickets',await ev('S.tickets')==t0+2 and await ev('S.ev3.eggC[10]')==1)
        check('palier 25 pas encore atteint (bouton désactivé)',await pg.locator('#events .e3act button:has-text("25 :")').is_disabled())
        # invasion
        await ev('window.__forceEv="invasion";S.ev3.inv={mo:S.ev3.inv.mo,lv:[],freed:{}};invPick()');L=await ev('S.ev3.inv.lv')
        check('Invasion : 10 niveaux terminés choisis',len(L)==10 and all(1<=n<=40 for n in L),L)
        await ev('go("story")');check('niveaux envahis marqués sur la carte',await pg.locator('#chapters .ev3inv').count()>=1)
        await ev('S.ev3.inv.lv.slice(0,9).forEach(n=>S.ev3.inv.freed[n]=1)');n=L[9];t0=await ev('S.tickets')
        await ev(f'fight=null;startBattle({{mode:"story",n:{n}}});F2.newP=F2.goldP=F2.callP=0');r=await ev(WIN)
        check('victoire sur le dernier niveau envahi : invasion repoussée (+5 tickets)',r=='win' and await ev(f'S.ev3.inv.freed[{n}]')==1 and await ev('S.tickets')>=t0+5,(r,await ev('S.tickets')-t0))
        check('succès « Libérateur » rempli',await ev('ACH.find(a=>a[0]==="ev3b")[3]()')==1)
        # mission de lancement
        await ev('S.ev3.launch={base:(S.cnt.wins||0)-5,done:0};S.ev3.verDay=todayK();go("events")');t0=await ev('S.tickets')
        await pg.click('#events .e3launch button');await pg.wait_for_timeout(50)
        check('vrai clic : mission de lancement (+5 tickets)',await ev('S.tickets')==t0+5 and await ev('S.ev3.launch.done')==1)
        # Noël
        await ev('window.__forceEv="noel";delete S.ev3.noel;go("events")');t0=await ev('S.tickets')
        await pg.click('#events .e3act button:has-text("NOËL")');await pg.wait_for_timeout(50)
        check('vrai clic : cadeau de Noël (une fois par jour)',await ev('S.tickets')==t0+1 and await pg.locator('#events .e3act button:has-text("NOËL")').count()==0)
        # Nostalgie
        await ev('window.__forceEv="nostalgia";go("events")');await pg.click('#events .e3act .btns button>>nth=0');await pg.wait_for_timeout(100)
        prev=await ev('EVENTS[(wkNow()-1+EVENTS.length*99)%EVENTS.length].n')
        check('vrai clic : Nostalgie (événement de la semaine dernière)',await ev('fight&&fight.o.nost')==1 and prev in await ev('fight.zone||""'),await ev('fight.zone'))
        # week-end : cohérent avec le jour réel
        wk=await ev('new Date().getDay()%6===0');check('défis du week-end seulement le samedi et le dimanche',(await ev('wkendInfo()') is not None)==wk)
        await ev('window.__forceEv=undefined');check('événements coupés de nouveau',await ev('evActive().length')==0)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
