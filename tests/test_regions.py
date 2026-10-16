"""Régions (0.34) : écran et onglets (vrais clics), verrous par niveau d'histoire, archipel (niveaux 101-150, éruption au
boss), Badlands (tempête : orbes cachées, vrai clic sur une orbe cachée), grottes (obscurité), îles célestes (ptérosaures +30 %,
rafale), Nouvelle partie + (récompenses ×1,5), progression, étoiles, carte du monde, sauvegarde."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
KILL='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;f.rgHide=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","ptera"].map((t,i)=>({id:i+1,type:t,level:60,xp:0}));S.stage=40;ens();delete S.rg;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        await ev('go("regions")')
        check('écran Régions : 6 onglets (avec le chapitre 3 du Grand Nord)',await pg.locator('#regions .rgtabs button').count()==6)
        check('archipel verrouillé avant la fin de l\'histoire',await pg.locator('#regions .mnode').count()==0 and 'histoire' in await pg.inner_text('#regions'))
        await pg.click('#regions .rgtabs button:has-text("Badlands")');await pg.wait_for_timeout(100)
        check('vrai clic : Badlands ouvertes (histoire 40), 10 niveaux affichés',await pg.locator('#regions .smap .mnode').count()==10)
        await pg.click('#regions .rgplay');await pg.wait_for_timeout(150)
        r=await ev('[fight.o.mode,fight.o.r,fight.o.n,/Badlands/.test(fight.zone),!!document.querySelector("#battleArea .battlestage.rg-bad")]')
        check('vrai clic : combat des Badlands, décor teinté',r==['region','bad',1,True,True],r)
        await ev('(()=>{const f=fight;f.turn=1;f.stun=0;const _h=hitDino;hitDino=function(){};enemyTurn();hitDino=_h;renderBattle()})()')
        n=await ev('document.querySelectorAll("#battleArea .orbboard .orb.rgsand").length')
        check('tempête de sable : 3 orbes cachées',n==3,n)
        i=await ev('fight.rgHide[0]');t0=await ev('fight.turn');await pg.locator(f'#battleArea .orbboard button.orb[onclick^="tapOrb({i})"]').click();await pg.wait_for_timeout(50)
        check('vrai clic sur une orbe cachée : elle frappe quand même',await ev('fight.turn')==t0+1)
        r=await ev(KILL)
        check('victoire : niveau 1 des Badlands franchi',r=='win' and await ev('S.rg.bad.stage')==1)
        # grottes : obscurité
        await ev('S.stage=60;fight=null;startBattle({mode:"region",r:"cave",n:1})')
        n=await ev('document.querySelectorAll("#battleArea .orbboard .orb.rgdark").length')
        check('grottes : orbes dans le noir dès le début',n>=3,n)
        # îles célestes : ptérosaures +30 %, rafale
        await ev('S.stage=80;fight=null;startBattle({mode:"region",r:"sky",n:1})')
        r=await ev('(()=>{const a=atkOf(2),b=atkOf(0);const o=fight.o;fight.o={mode:"story"};const a2=atkOf(2),b2=atkOf(0);fight.o=o;return [a/a2,b/b2]})()')
        check('îles célestes : ptérosaure +30 %, les autres non',abs(r[0]-1.3)<.01 and abs(r[1]-1)<.01,r)
        r=await ev('(()=>{const f=fight;f.orbs=["redorb","redorb","redorb","blueorb","blueorb","blueorb","greenorb","greenorb","greenorb"];const before=f.orbs.join();f.turn=3;f.stun=0;const _h=hitDino;hitDino=function(){};Math._r=Math.random;let k=0;Math.random=()=>((k++*.37)%1);enemyTurn();Math.random=Math._r;hitDino=_h;return [before,f.orbs.join(),/Rafale/.test(f.log)]})()')
        check('rafale : orbes mélangées',r[0]!=r[1] and sorted(r[0].split(','))==sorted(r[1].split(',')) and r[2],r)
        # archipel
        await ev('S.stage=100;S.rg.arch.stage=9;fight=null;startBattle({mode:"region",r:"arch",n:10});fight.wave=2;renderBattle()')
        r=await ev('[fight.n,fight.bm,fight.enemies[2].name,/Niv\\. 110/.test(fight.zone)]')
        check('archipel : niveau 110, boss nommé avec l\'éruption',r[0]>=110 and r[1]==['eruption'] and r[2]=='Roi des Cendres' and r[3],r)
        t0=await ev('S.tickets');r=await ev(KILL)
        check('gardien de l\'archipel battu : +3 tickets, niveau 111 ouvert',r=='win' and await ev('S.tickets')>=t0+3 and await ev('rgOpen("arch",11)'),[r,t0])
        await ev('rgCur="arch";rgCh={};go("regions")')
        check('carte de l\'archipel : niveaux 111-120',await pg.locator('#regions .smap .mnode.cur .mn').inner_text()=='111')
        # Nouvelle partie +
        await ev('S.rg.ngp.stage=4;fight=null;startBattle({mode:"region",r:"ngp",n:5})');s0=await ev('S.stone')
        r=await ev('[fight.n,/Jungle/.test(fight.zone)]');await ev(KILL)
        check('NG+ : niveau 5 avec ennemis niveau 36, décor de la jungle',r==[36,True],r)
        check('NG+ : récompenses ×1,5',await ev('S.stone')-s0>=int((40+4*36)*1.5),await ev('S.stone')-s0)
        # verrou
        await ev('fight=null;startBattle({mode:"region",r:"cave",n:5})')
        check('niveau verrouillé refusé',await ev('!fight'))
        # carte du monde
        await ev('go("world")')
        check('carte du monde : archipel ouvert + 3 nouvelles régions',await pg.locator('#world .wdreg').count()==9 and not await ev('document.querySelector("#world .wdreg:last-child")?false:true'))
        await pg.click('#world .wdreg:has-text("grottes")');await pg.wait_for_timeout(100)
        check('vrai clic : la carte du monde ouvre l\'onglet de la région',await ev('screen')=='regions' and await ev('rgCur')=='cave')
        check('3 succès de régions',await ev('ACH.filter(a=>/^rg/.test(a[0])).length')==3)
        check('sauvegarde : S.rg',await ev('(()=>{save();const x=JSON.parse(localStorage.arkPrimalMobile);return !!(x.rg&&x.rg.arch.stage===10&&x.rg.bad.stage===1)})()'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
