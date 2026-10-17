"""Missions et succès II (0.42) : missions de la semaine (compteurs, récompense, une à renouveler par jour), défis (sans super,
sans perte, rapide), missions par famille, parcours du débutant, carnet du Dr Elara, découvertes, tout récupérer (vrai clic),
suivi de mission en combat, objectif du moment ; succès cachés (masqués), drôle (« Presque ! »), vitesse, variantes, bestiaire,
élevage, reliques, série du Défi du jour ; points et paliers, catégorie complète, vitrine de badges, succès presque atteint,
statistiques globales et records (écran)."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
FIGHT='F2.newP=F2.goldP=F2.callP=0;if(typeof C4!=="undefined")C4.duoP=0;fight=null;startBattle({mode:"story",n:%d});fight.enemies.forEach(e=>{e.tr="";e.sh=0})'
WIN1='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return [f.over,f.q2a]})()'
DIE='(()=>{const f=fight;for(let i=0;i<15&&!f.over;i++){f.hp=f.hp.map(h=>h>0?1:0);f.stun=0;f.guard=0;const e=f.enemies[f.wave];e.atk=1e9;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","trike","compsog"].map((t,i)=>({id:i+1,type:t,level:40,xp:0}));S.stage=40;S.cnt={};delete S.q2;ens();save()')
        # victoire rapide, sans super, sans perte
        await ev(FIGHT%3);r=await ev(WIN1)
        check('victoire en 3 actions : compteurs défi/rapide/éclair/sans super/sans perte',r[0]=='win' and await ev('[S.cnt.blitz,S.cnt.quick,S.cnt.nosuper,S.cnt.flawless]')==[1,1,1,1],(r,await ev('S.cnt')))
        check('compteurs de la semaine',await ev('S.q2.wk.cnt.wins')>=1 and await ev('S.q2.wk.cnt.quick')==1)
        check('famille : 2 théropodes dans l\'équipe → mission Théropodes +1',await ev('S.q2.fam.T')==1)
        check('statistiques globales : orbes, dégâts, ennemis',await ev('S.q2.st.orbs>=3&&S.q2.st.dmg>0&&S.q2.st.kills>=3'),await ev('S.q2.st'))
        check('records : victoire la plus rapide, série',await ev('S.q2.rec.fast.v')==-3 and await ev('S.q2.rec.streak.v')==1)
        check('succès « Éclair » atteint',await ev('achOk(ACH.find(a=>a[0]==="q2v1"))'))
        # défaite de justesse
        await ev(FIGHT%3+';fight.enemies[0].max=1000;fight.enemies[0].hp=15;fight.hp=fight.hp.map(()=>0);fight.over="lose";renderBattle()')
        check('succès drôle « Presque ! » (ennemi à 1,5 % de PV)',await ev('S.cnt.closeLoss')==1 and await ev('S.q2.streak')==0)
        # missions de la semaine
        await ev('go("missions")');check('5 missions de la semaine affichées',await pg.locator('#q2box .q2m').count()>=5+4)
        m=await ev('q2Weekly()[0]');await ev(f'S.q2.wk.cnt["{m["t"]}"]={m["g"]}');t0=await ev('S.tickets');s0=await ev('S.stone')
        await ev('render()');await pg.click(f'#q2box button[onclick="q2WClaim(\'{m["id"]}\')"]')
        check('vrai clic : mission de la semaine récupérée',await ev(f'S.q2.wk.claimed["{m["id"]}"]')==1)
        old=await ev('q2Weekly()[1].id');await pg.click('#q2box .q2rr>>nth=0')
        check('vrai clic : mission renouvelée',await ev('q2Weekly().map(m=>m.id).includes("%s")'%old)==False,await ev('q2Weekly().map(m=>m.id)'))
        check('une seule fois par jour',await ev('q2Reroll(q2Weekly()[2].id)')==False)
        # parcours du débutant, carnet, défis, découvertes
        await ev('S.cnt.wins=3;S.cnt.summons=1');t0=await ev('S.tickets')
        check('parcours du débutant : jour 1 récupérable',await ev('q2NewbieClaim(0)')==True and await ev('S.tickets')==t0+2)
        check('jour 2 pas encore ouvert',await ev('q2NewbieClaim(1)')==False)
        await ev('S.q2.chain={i:0,base:{wins:0}};S.cnt.wins=5');check('carnet du Dr Elara : étape 1 → étape 2',await ev('q2ChainClaim()')==True and await ev('S.q2.chain.i')==1)
        await ev('go("maze")');check('découverte : ouvrir le Labyrinthe',await ev('S.q2.seen.maze')==1 and await ev('q2FeatClaim("maze")')==True)
        # tout récupérer
        await ev('S.cnt.nosuper=10;S.q2.fam.C=10;go("missions")');await pg.click('#q2box .q2all');await pg.wait_for_timeout(50)
        check('vrai clic : tout récupérer (défi, famille, succès…)',await ev('S.q2.feat.c_nosup===1&&S.q2.feat.fam_C===1&&!!S.ach.got.q2v1'))
        # suivi en combat, objectif du moment
        await ev(FIGHT%5+';go("battle")');check('suivi de mission dans le combat',await pg.locator('#battleArea .q2track').count()==1)
        await ev('fight=null;go("home")');check('objectif du moment sur l\'accueil',await pg.locator('#home #q2obj').count()==1)
        # succès : cachés, points, paliers, catégorie, badges
        await ev('go("achs")');t=await ev('[...document.querySelectorAll("#achs .panel.ach.q2hidden b")].map(b=>b.textContent)')
        check('succès cachés masqués',len(t)>=2 and all(x.startswith('???') for x in t),t)
        check('succès drôle visible une fois obtenu',await ev('[...document.querySelectorAll("#achs .panel.ach b")].some(b=>b.textContent==="Presque !")') or not await ev('!!S.ach.got.q2h1'))
        check('points de succès affichés',await pg.locator('#achs #q2pts').count()==1 and await ev('achPoints()')>0)
        await ev('ACH.filter(a=>/^b\\d/.test(a[0])).forEach(a=>S.ach.got[a[0]]=1);S.q2.cat={}');t0=await ev('S.tickets')
        check('catégorie « Victoires » complète : récompense',await ev('q2CatAll()')>=1 and await ev('S.q2.cat.b')==1 and await ev('S.tickets')>=t0+3)
        await ev('ACH.slice(0,12).forEach(a=>S.ach.got[a[0]]=1);S.q2.tier={}');check('paliers de points (Bronze au moins)',await ev('q2TierAll()')>=1)
        await ev('q2Badges()');await pg.click('#modalBody .q2bdgs button>>nth=0');check('vrai clic : badge en vitrine',await ev('S.q2.bdg.length')==1);await ev('closeModal();go("home")')
        check('badge affiché sur l\'accueil',await pg.locator('#home .q2bdg').count()==1)
        # succès presque atteint
        await ev('S.q2.near={};S.cnt.summons=95;S.ach.got.g1=1;delete S.ach.got.g2');r=await ev('(()=>{ACH.forEach(a=>{if(a[0]!=="g2")S.q2.near[a[0]]=1});return q2Near()})()')
        check('notification quand un succès est proche (95/100)',r=='g2')
        check('une seule fois',await ev('q2Near()')!='g2')
        # nouveaux succès
        await ev('S.team.push({id:90,type:"rex",level:1,xp:0,v:"fossil"})');check('succès de variante (Fossile)',await ev('achOk(ACH.find(a=>a[0]==="q2c5"))'))
        await ev('S.team.push({id:91,type:"rex",level:1,xp:0,gen:10})');check('succès d\'élevage (génération 10)',await ev('achOk(ACH.find(a=>a[0]==="q2n1"))'))
        await ev('S.q2.relics={};Object.keys(RELICS).slice(0,10).forEach(k=>S.q2.relics[k]=1)');check('succès du Labyrinthe (10 reliques)',await ev('achOk(ACH.find(a=>a[0]==="q2m1"))'))
        await ev('S.dch.streak=30');check('série de 30 Défis du jour',await ev('achOk(ACH.find(a=>a[0]==="q2d2"))'))
        check('bestiaire complet : objectif = toutes les créatures',await ev('ACH.find(a=>a[0]==="q2b1")[4]===CX_ALL().length'))
        # records
        await ev('q2Records()');check('écran des records (4 records, 5 statistiques)',await pg.locator('#modalBody .q2rec').count()==9)
        check('chiffres affichés',await ev('[...document.querySelectorAll("#modalBody .q2num")].some(e=>e.textContent!=="0")'));await ev('closeModal()')
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
