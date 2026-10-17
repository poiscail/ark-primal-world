"""Partage et rejouabilité (0.41) : code d'équipe (lecture, refus d'un code abîmé) et duel amical (vrais dinos affichés),
défi à partager (même graine → même hasard), comparaison du Défi du jour, relecture du dernier combat (sans récompense,
équipe rendue), mode spectateur, résumé du mois, fan-art (vraie image importée), décorations du camp, compagnon, quiz
(une fois par jour, 1 ticket par bonne réponse), musée, profils (changement sans perte), nuzlocke, cadeau de mise à jour,
crédits (avertissement « ARK »), panneau d'accueil (vrais clics)."""
import asyncio,pathlib,sys,os,base64,tempfile
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
DIE='(()=>{const f=fight;for(let i=0;i<15&&!f.over;i++){f.hp=f.hp.map(h=>h>0?1:0);f.stun=0;f.guard=0;const e=f.enemies[f.wave];e.atk=1e9;e.hp=e.max=1e9;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
PNG='iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEklEQVR4nGP4z8DAwMDAwMDAAAAMAAFhXyGSAAAAAElFTkSuQmCC'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('localStorage.removeItem("arkPrimalProfiles");localStorage.removeItem("arkPrimalArt");setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","raptor","compsog","trike"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.nextId=50;S.stage=40;S.essence=500;delete S.sh;ens();save();F2.newP=F2.goldP=F2.callP=0;if(typeof C4!=="undefined")C4.duoP=0')
        # code d'équipe
        code=await ev('shTeamCode()');check('code d\'équipe ARKT1',code.startswith('ARKT1.'))
        o=await ev(f'shRead("ARKT1.",{code!r})');check('le code se relit (3 dinos, niveaux)',o and len(o['t'])==3 and o['t'][0]['t']=='rex' and o['t'][0]['l']==30,o)
        bad=code[:-3]+('x' if code[-3]!='x' else 'y')+code[-2:]
        check('un code abîmé est refusé',await ev(f'shRead("ARKT1.",{bad!r})')==None and await ev(f'shFriendFight({bad!r})')==False)
        await ev(f'shFriendFight({code!r});go("battle")')
        check('duel amical : l\'équipe de l\'ami en face',await ev('fight.o.mode')=='friend' and await ev('fight.enemies.map(e=>e.pt).join()')=='rex,giga,raptor')
        check('duel amical : vrais dinos affichés',await ev('enemyLook(fight.enemies[0],fight)')==None)
        r=await ev(WIN);check('duel amical gagné (succès « Ami des dinos »)',r=='win' and await ev('(S.cnt.shFriend||0)')==1)
        # défi à partager : même graine → même hasard
        cc=await ev('shChalCode(5,"",12345)')
        await ev(f'shChalPlay({cc!r})');a=await ev('[fight.enemies.map(e=>e.max),fight.orbs.join()]')
        await ev(f'shChalPlay({cc!r})');b2=await ev('[fight.enemies.map(e=>e.max),fight.orbs.join()]')
        check('défi à partager : même code, même combat (orbes, PV)',a==b2,(a,b2))
        cc2=await ev('shChalCode(5,"",999)');await ev(f'shChalPlay({cc2!r})');c=await ev('fight.orbs.join()')
        check('autre graine : autre tirage',c!=a[1])
        # Défi du jour
        await ev('S.dch=S.dch||{};S.dch.won=1;S.dch.turns=12');dc=await ev('shDailyCode()')
        other=await ev('shCode("ARKJ1.",{d:todayK(),w:1,t:15,n:"Léa"})');r=await ev(f'shDailyCmp({other!r}).same')
        check('Défi du jour : comparaison avec un ami (tu gagnes 12 contre 15)',r and 'Tu gagnes' in await pg.inner_text('#modalBody'),await pg.inner_text('#modalBody'));await ev('closeModal()')
        # relecture
        await ev('fight=null;startBattle({mode:"story",n:4});go("battle")');t0=await ev('S.stone');lv=await ev('S.team[0].level')
        await ev('fight.enemies.forEach(e=>{e.tr="";e.sh=0})');await ev('for(let i=0;i<30&&!fight.over;i++){fight.stun=0;tapOrb(i%9)}');res=await ev('fight.over')
        await ev('renderBattle()');st=await ev('S.stone')
        check('combat enregistré pour la relecture',await ev('!!SH_REC&&SH_REC.acts.length>0'),await ev('SH_REC&&SH_REC.acts.length'))
        await ev('S.team[0].level=99');check('relecture lancée',await ev('shReplay()')==True and await ev('fight.shReplay')==1)
        check('relecture : l\'équipe du combat d\'origine (niveau 30)',await ev('S.team[0].level')==lv)
        ok=False
        for _ in range(120):
            if await ev('!!fight.over'):ok=True;break
            await pg.wait_for_timeout(100)
        check('relecture jouée jusqu\'au bout, même issue',ok and await ev('fight.over')==res,(ok,await ev('fight.over'),res))
        check('relecture : aucune récompense, équipe actuelle rendue',await ev('S.stone')==st and await ev('S.team[0].level')==99)
        await ev('S.team[0].level=30')
        # spectateur
        await ev('fight=null;startBattle({mode:"story",n:3});go("battle");setPref("auto",false);shSpectate()');check('mode spectateur : auto ×3',await ev('PREFS.auto&&PREFS.spd===3&&document.body.classList.contains("shspect")'))
        await pg.keyboard.press('Escape');check('Échap : reprendre la main',await ev('!document.body.classList.contains("shspect")&&!PREFS.auto'));await ev('setPref("spd",1);fight=null;go("home")')
        # résumé du mois
        await ev('S.sh.mo={k:"2000-01",base:{wins:0}};S.cnt.wins=7');r=await ev('shMonth()');check('résumé du mois au changement de mois',r['wins']==7 and await ev('S.sh.mo.k===todayK().slice(0,7)&&S.sh.mo.last.k==="2000-01"'))
        # fan-art
        await ev('shGallery()');f=tempfile.NamedTemporaryFile(suffix='.png',delete=False);f.write(base64.b64decode(PNG));f.close()
        await pg.set_input_files('#modalBody input[type=file]',f.name);await pg.wait_for_timeout(500)
        check('vrai fichier : image ajoutée à la galerie',await pg.locator('#modalBody .shart img').count()==1 and await ev('JSON.parse(localStorage.getItem("arkPrimalArt")).length')==1)
        await pg.click('#modalBody .shart button');check('vrai clic : image supprimée',await ev('JSON.parse(localStorage.getItem("arkPrimalArt")).length')==0);await ev('closeModal()')
        # décorations, compagnon
        e0=await ev('S.essence');await ev('shDecoShop()');await pg.click('#modalBody .shdecos button:has-text("Totem")')
        check('vrai clic : totem installé au camp (−40 🔮)',await ev('S.sh.deco.includes("totem")') and await ev('S.essence')==e0-40);await ev('closeModal();go("camp")')
        check('décoration visible au camp',await pg.locator('#camp .campscene .shdeco').count()==1)
        await ev('shPetSet("compsog");fight=null;startBattle({mode:"story",n:3});go("battle")');check('compagnon qui suit l\'équipe en combat',await pg.locator('#battleArea .sTeam .shpet').count()==1)
        await ev('fight=null;go("home")')
        # quiz
        await ev('shQuiz()');t0=await ev('S.tickets');qi=await ev('shQuizSet()[0]');good=await ev(f'QUIZ[{qi}][1][QUIZ[{qi}][2]]')
        await pg.click(f'#modalBody .shq >> nth=0 >> button:has-text("{good}")')
        check('vrai clic : bonne réponse → +1 ticket',await ev('S.tickets')==t0+1 and await ev(f'S.sh.quiz.a[{qi}]')==await ev(f'QUIZ[{qi}][2]'))
        await ev(f'shAnswer({qi},0)');check('une seule réponse par question',await ev('S.tickets')==t0+1);await ev('closeModal()')
        # musée
        await ev('shMuseum(true)');await pg.click('#modalBody .shdecos button>>nth=0');check('vrai clic : dino exposé au musée',await ev('S.sh.museum.length')==1 and await pg.locator('#modalBody .shvit').count()==1);await ev('closeModal()')
        # nuzlocke
        await ev('shNuz(true);fight=null;startBattle({mode:"story",n:3})');await ev(DIE)
        check('nuzlocke : les K.O. sont perdus',await ev('S.team.filter(d=>d.nzDead).length')>=1 and await ev('S.team.findIndex(d=>d.nzDead)>=S.team.filter(d=>!d.nzDead).length'),await ev('[fight&&fight.over,fight&&fight.o,S.team.map(d=>d.id+":"+(d.nzDead||0)),S.sh.nuz]'))
        check('nuzlocke : plus de combat d\'histoire sans 3 dinos debout',await ev('fight=null;startBattle({mode:"story",n:3});fight')==None)
        await ev('shNuz(false)')
        check('fin du nuzlocke : tout le monde revient',await ev('S.team.every(d=>!d.nzDead)') and await ev('S.sh.nuz')==None)
        # cadeau de mise à jour
        await ev('S.sh.gift="0.1.0"');t0=await ev('S.tickets');check('cadeau après une mise à jour (+3 🎟️)',await ev('shUpdGift()')==True and await ev('S.tickets')==t0+3)
        check('une seule fois par version',await ev('shUpdGift()')==False)
        # crédits, accueil
        await ev('go("home")');check('panneau « Partage et extras » sur l\'accueil',await pg.locator('#shHome button').count()>=10)
        await pg.click('#shHome button:has-text("CRÉDITS")');check('vrai clic : crédits avec l\'avertissement sur « ARK »','Studio Wildcard' in await pg.inner_text('#modalBody'));await ev('closeModal()')
        await pg.click('#shHome button:has-text("ENCYCLOPÉDIE")');check('vrai clic : encyclopédie (12 fiches)',await pg.locator('#modalBody .shency details').count()==12);await ev('closeModal()')
        # profils (en dernier : recharge la page)
        await ev('save()');n0=await ev('S.team.length');pid=await ev('shProfNew("Léa")')
        await ev(f'shProfSwitch({pid!r})');await pg.wait_for_timeout(300);await pg.wait_for_function('typeof shProfs==="function"&&typeof S==="object"');await pg.wait_for_timeout(300)
        check('nouveau profil : partie neuve',await ev('S.team.length')<=3 and await ev('shProfs().cur')==pid)
        await ev('shProfSwitch("p1")');await pg.wait_for_timeout(300);await pg.wait_for_function('typeof shProfs==="function"&&typeof S==="object"');await pg.wait_for_timeout(300)
        check('retour au profil 1 : rien de perdu',await ev('S.team.length')==n0)
        await ev('localStorage.removeItem("arkPrimalProfiles")')
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
