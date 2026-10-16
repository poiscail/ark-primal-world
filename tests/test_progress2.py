"""Progression II (0.36) : conseil d'accueil (vrai clic), objectifs 30 jours, maîtrise d'espèce, jetons de famille (éveil),
âmes d'espèce, paliers de puissance + défi, connexion du mois, cadeau de retour, 1re victoire du jour, maîtrise de niveau
(sans perdre de PV), graphique de puissance, résumé de la semaine."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('window.__forceFirstWin=true')
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor","raptor","raptor"].map((t,i)=>({id:i+1,type:t,level:20,xp:0}));S.stage=40;ens();delete S.pg2;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        check('jetons de famille offerts aux anciennes sauvegardes (10 par famille)',await ev('S.pg2.ftok.T')==10)
        await ev('go("home")')
        check('conseil sur l\'accueil',await pg.locator('#p2Home .p2adv').count()==1)
        # 1re victoire du jour, maîtrise de niveau, maîtrise d'espèce, jetons
        t0=await ev('S.tickets');await ev('fight=null;startBattle({mode:"story",n:5})');await ev(WIN)
        r=await ev('[S.pg2.fwin===todayK(),S.pg2.mst[5],S.pg2.spw.rex,S.pg2.ftok.T]')
        check('1re victoire du jour (+1 ticket), niveau maîtrisé sans perte, victoire d\'espèce, jeton de famille',r==[True,1,1,11] and await ev('S.tickets')>=t0+1,r)
        t0=await ev('S.tickets');await ev('fight=null;startBattle({mode:"story",n:6});fight.hp[0]-=5');await ev(WIN)
        check('2e victoire : pas de bonus du jour, pas de maîtrise si des PV sont perdus',await ev('!S.pg2.mst[6]'))
        await ev('S.pg2.spw.giga=99;fight=null;startBattle({mode:"story",n:7})');t0=await ev('S.tickets');await ev(WIN)
        check('100e victoire avec une espèce : maîtrise (+3 tickets)',await ev('S.pg2.spw.giga')==100 and await ev('S.tickets')>=t0+3)
        await ev('mapCh=0;go("story")');check('carte : niveau maîtrisé 💎',await pg.locator('#chapters .smap .mnode.p2mst').count()>=1)
        # éveil : jetons
        await ev('S.team[0].star=2;S.mat.bone=999;S.mat.hide=999;S.mat.amber=999;S.pg2.ftok.T=2');await ev('awaken(1)')
        check('éveil ★3 refusé sans 3 jetons de famille',await ev('S.team[0].star')==2)
        await ev('S.pg2.ftok.T=5');await ev('awaken(1)');check('éveil ★3 avec les jetons (−3)',await ev('[S.team[0].star,S.pg2.ftok.T]')==[3,2])
        # âmes
        await ev('S.team.push({id:30,type:"raptor",level:1,xp:0},{id:31,type:"raptor",level:1,xp:0});window.confirm=()=>true;S.pg2.soul.raptor=3;recycle(30);recycle(31)')
        check('recyclage : une âme par dino',await ev('S.pg2.soul.raptor')==5)
        await ev('go("team");subSet("team","pack")');await pg.click('.cocard[data-id="3"] .p2soul');await pg.wait_for_timeout(50)
        check('vrai clic : 5 âmes → +1★',await ev('[S.team[2].star,S.pg2.soul.raptor]')==[1,0])
        # paliers de puissance
        await ev('go("home");p2Open()');await pg.click('#modalBody button:has-text("ATTEINDRE")>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic : 1er palier de puissance atteint',await ev('S.pg2.tiers[0]')==1)
        await pg.click('#modalBody button:has-text("DÉFI DE PUISSANCE")');await pg.wait_for_timeout(100)
        t0=await ev('S.tickets');check('défi de puissance lancé',await ev('fight.o.mode')=='ptier');await ev(WIN)
        check('défi de puissance gagné : +3 tickets la 1re fois',await ev('S.pg2.tierW[0]')==1 and await ev('S.tickets')>=t0+3)
        # connexion du mois, retour
        await ev('for(let i=1;i<=6;i++)S.pg2.mlog.days[S.pg2.mlog.mo+"-0"+i]=1;p2Open()');t0=await ev('S.tickets')
        await pg.click('#modalBody button:has-text("5 j")');await pg.wait_for_timeout(50);check('vrai clic : 5 jours de connexion → +2 tickets',await ev('S.tickets')==t0+2)
        await ev('closeModal();S.pg2.seen="2000-01-01";S.pg2.ret=null;ens();go("home")')
        check('cadeau de retour (absence de plusieurs jours, plafonné à 7)',await ev('S.pg2.ret&&S.pg2.ret.days')==7 and await pg.locator('#p2Home .p2ret').count()==1)
        t0=await ev('S.tickets');await pg.click('#p2Home .p2ret button');await pg.wait_for_timeout(50);check('vrai clic : cadeau de retour ouvert (+7 tickets)',await ev('S.tickets')==t0+7 and await ev('!S.pg2.ret'))
        # objectifs 30 jours
        await ev('S.pg2.lt.base.wins-=200;p2Open()');await pg.click('#modalBody .p2goal button:has-text("OK")>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic : objectif « 150 victoires » réclamé',await ev('S.pg2.lt.claimed.wins')==1)
        # graphique, semaine
        await ev('S.pg2.pw={"2026-10-01":1000,"2026-10-05":1500};p2Open()');check('graphique de puissance',await pg.locator('#modalBody .pwchart path').count()==1)
        await ev('closeModal();S.pg2.ws.wk-=1;S.pg2.ws.base.wins-=7;ens();go("home")')
        check('résumé de la semaine passée',await pg.locator('#p2Home .p2week').count()==1 and 'victoires' in await pg.inner_text('#p2Home .p2week') and await ev('S.pg2.wlast.d.wins')>=7)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
