"""Interface II (0.40) : raccourcis clavier (vraies touches), menu pause, cloche et centre de notifications (regroupement),
« où obtenir » (vrai clic sur une ressource), recherche dans la collection (vraie saisie), glisser-déposer, équipe mémorisée
par mode, meilleure équipe, aperçu des ennemis, molette sur la carte, XP par dino en fin de combat, historique des combats,
recyclage avec « ne plus demander » et annulation, favoris de l'accueil, tutoriel d'un mode, réglages (taille du texte,
compact, pastilles), « Quoi de neuf »."""
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
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","raptor","trike","compsog","dilopho","parasaur"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.nextId=50;S.stage=40;delete S.ui2;ens();save();go("home")')
        check('réglages par défaut',await ev('[PREFS.fsz,PREFS.compact,PREFS.dots,PREFS.resume]')==[100,'auto','on',True])
        # raccourcis clavier
        await pg.keyboard.press('c');check('touche C : collection',await ev('screen')=='team')
        await pg.keyboard.press('i');check('touche I : invocation',await ev('screen')=='summon')
        await pg.keyboard.press('Escape');check('Échap : retour à l\'accueil',await ev('screen')=='home')
        await pg.keyboard.press('F1');check('F1 : liste des raccourcis',await pg.locator('#modalBody .u2keys').count()==1)
        await pg.keyboard.press('Escape');check('Échap : ferme la fenêtre',await ev('document.getElementById("modalVeil").classList.contains("hide")'))
        # menu pause
        await ev('fight=null;startBattle({mode:"story",n:5});go("battle")');await pg.keyboard.press('Escape')
        check('Échap en combat : menu pause',await pg.locator('#u2pause').count()==1)
        t0=await ev('fight.turn||0');await ev('tapOrb(0)');check('pause : les orbes ne jouent pas',await ev('fight.turn||0')==t0)
        await pg.click('#u2pause button:has-text("REPRENDRE")');check('vrai clic : reprendre',await pg.locator('#u2pause').count()==0)
        await pg.keyboard.press('p');await pg.click('#u2pause button:has-text("ABANDONNER")');check('vrai clic : abandonner depuis la pause',await ev('screen')=='home' and await ev('fight')==None)
        # notifications : regroupement et centre
        await ev('U2N.notes=[];U2N.unread=0;toast("Coucou");toast("Coucou");toast("Coucou")')
        check('notifications identiques regroupées (×3)',await ev('[...document.querySelectorAll("#toasts .toast")].filter(t=>t.textContent.includes("Coucou")).length')==1 and '×3' in await ev('document.getElementById("toasts").textContent'))
        check('cloche : 3 non lues',await ev('document.querySelector("#u2bell i").textContent')=='3')
        await pg.click('#u2bell');check('vrai clic : centre de notifications',await pg.locator('#modalBody .u2note').count()==3 and await ev('U2N.unread')==0)
        await ev('closeModal()')
        # où obtenir
        await pg.click('header .meters .meter:has(#essence)');check('vrai clic sur une ressource : où l\'obtenir',await pg.locator('#modalBody .u2where button').count()>=3)
        await pg.click('#modalBody button:has-text("TOUS LES MATÉRIAUX")');check('guide de tous les matériaux',await pg.locator('#modalBody .u2mat').count()>=8);await ev('closeModal()')
        # collection : recherche et glisser-déposer
        await ev('go("team")');await pg.fill('#u2q','dilo');await pg.wait_for_timeout(50)
        vis=await ev('[...document.querySelectorAll("#collection>.cocard")].filter(c=>getComputedStyle(c).display!=="none").map(c=>+c.dataset.id)')
        check('vraie saisie : recherche par nom',vis==[6],vis)
        await pg.fill('#u2q','');await pg.wait_for_timeout(50)
        ids=await ev('[...document.querySelectorAll("#collection>.cocard")].slice(0,2).map(c=>+c.dataset.id)')  # deux cartes côte à côte
        await pg.locator(f'#collection>.cocard[data-id="{ids[0]}"]').scroll_into_view_if_needed()
        i0=await ev(f'[S.team.findIndex(d=>d.id==={ids[0]}),S.team.findIndex(d=>d.id==={ids[1]})]')
        await pg.drag_and_drop(f'#collection>.cocard[data-id="{ids[1]}"] .bigicon',f'#collection>.cocard[data-id="{ids[0]}"] .bigicon')
        i1=await ev(f'[S.team.findIndex(d=>d.id==={ids[0]}),S.team.findIndex(d=>d.id==={ids[1]})]')
        check('vrai glisser-déposer : deux dinos échangés',i1==i0[::-1],(i0,i1))
        await ev(f'u2Swap({ids[0]},{ids[1]})')
        # meilleure équipe et aperçu
        r=await ev('u2Best("greenorb")');el=await ev('S.team.slice(0,3).map(d=>sp(d).element)')
        check('meilleure équipe contre 🌿 : des dinos 🔥 en tête',el.count('redorb')>=min(2,await ev('S.team.filter(d=>sp(d).element==="redorb").length')),el)
        await ev('go("story")');check('panneau « prochain niveau »',await pg.locator('#u2prev').count()==1)
        await pg.click('#u2prev button');check('vrai clic : aperçu des 3 ennemis',await pg.locator('#modalBody .u2foe').count()==3)
        await pg.click('#modalBody button:has-text("LANCER")');check('vrai clic : lancer depuis l\'aperçu',await ev('fight&&fight.o.mode')=='story' and await ev('fight.n')==41)
        # équipe mémorisée par mode
        await ev('fight=null;startBattle({mode:"story",n:5});const ids=S.team.slice(0,3).map(d=>d.id);S.ui2.teamBy.arena=[7,6,5];fight=null;go("arena")')
        check('Arène : proposer l\'équipe de l\'Arène',await pg.locator('#arena .u2team').count()==1)
        await pg.click('#arena .u2team button');check('vrai clic : équipe de l\'Arène reprise',await ev('S.team.slice(0,3).map(d=>d.id)')==[7,6,5])
        # carte : molette
        await ev('go("story")');c0=await ev('mapCh');await ev('document.querySelector("#chapters .smap").scrollIntoView({block:"center"})');box=await pg.locator('#chapters .smap').bounding_box()
        if box:
            await pg.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);await pg.mouse.wheel(0,200);await pg.wait_for_timeout(100)
        check('molette sur la carte : chapitre suivant',await ev('mapCh')==min(9,c0+1),(c0,await ev('mapCh')))
        await ev('window.scrollTo(0,0)');box=await pg.locator('#chapters .smap').bounding_box();c1=await ev('mapCh');y0=await ev('scrollY')
        await pg.mouse.move(box['x']+box['width']/2,min(780,box['y']+50));await pg.mouse.wheel(0,200);await pg.wait_for_timeout(150)
        check('carte à moitié visible : la molette fait défiler la page',await ev('mapCh')==c1 and await ev('scrollY')>y0,(c1,await ev('mapCh'),y0,await ev('scrollY')))
        # fin de combat : XP par dino ; historique
        await ev('S.team=S.team.slice(0,3).map((d,i)=>({...d,level:30,xp:0})).concat(S.team.slice(3));fight=null;startBattle({mode:"story",n:5});go("battle")');r=await ev(WIN);await ev('go("battle")')
        check('victoire : XP de chaque dino affichée',r=='win' and await pg.locator('#battleArea .u2xp .u2xr').count()==3)
        check('historique des combats',await ev('S.ui2.hist[0].r')=='win')
        await ev('u2Hist()');check('fenêtre des combats récents',await pg.locator('#modalBody .u2h').count()>=1);await ev('closeModal()')
        # recyclage : confirmation (modale forcée), ne plus demander, annulation
        await ev('window.__u2Ask=true;go("team")');rid=await ev('S.team[5].id');n0=await ev('S.team.length');await ev(f'recycle({rid})')
        check('recyclage : confirmation avec « ne plus demander »',await pg.locator('#modalBody #u2no').count()==1)
        await pg.check('#modalBody #u2no');await pg.click('#modalBody button:has-text("CONFIRMER")')
        check('vrai clic : recyclé',await ev('S.team.length')==n0-1 and await ev('S.ui2.noAsk.recycle')==1)
        await pg.click('#u2undo button');check('vrai clic : annuler (dino rendu)',await ev('S.team.length')==n0 and await ev(f'S.team.some(d=>d.id==={rid})'))
        await ev(f'recycle({rid})');check('« ne plus demander » : recyclé sans question',await ev('S.team.length')==n0-1 and await ev('document.getElementById("modalVeil").classList.contains("hide")'))
        await ev('u2Undo();window.__u2Ask=false')
        # favoris de l'accueil, tutoriel
        await ev('go("home")');check('accueil : raccourcis favoris',await pg.locator('#u2fav button').count()==5)
        await pg.click('#u2fav .u2edit');await pg.click('#modalBody .u2favs button:has-text("Nid")');await pg.click('#modalBody button:has-text("OK")')
        check('vrai clic : favori ajouté',await ev('S.ui2.fav.includes("nest")') and await pg.locator('#u2fav button').count()==6)
        await ev('go("tower")');await pg.click('#tower .banner .u2tbtn');check('vrai clic : tutoriel du mode',await pg.locator('#modalBody .u2tuto li').count()>=2);await ev('closeModal()')
        # réglages : vrais clics
        await ev('openSettings()');await pg.click('#setBody .u2fsz button:has-text("115 %")')
        check('vrai clic : texte à 115 %',await ev('PREFS.fsz')==115 and await ev('getComputedStyle(document.body).zoom')=='1.15')
        await pg.click('#setBody .u2fsz button:has-text("100 %")')
        await pg.click('#setBody .u2dots button:has-text("Cachées")');check('vrai clic : pastilles cachées',await ev('document.documentElement.dataset.dots')=='off')
        await pg.click('#setBody .u2compact button:has-text("Oui")');check('vrai clic : mode compact',await ev('document.documentElement.classList.contains("u2compact")'))
        await pg.click('#setBody .u2compact button:has-text("Auto")');await pg.click('#setBody .u2dots button:has-text("Normales")');await ev('closeSettings()')
        # quoi de neuf
        await ev('S.ui2.seenVer="0.1.0"');check('« Quoi de neuf » après une mise à jour (forcé)',await ev('u2WhatsNew(true)') and await pg.locator('#modalBody .u2new li').count()>=5)
        await ev('setPref("lore",false)');check('couper les dialogues ferme « Quoi de neuf »',await ev('document.getElementById("modalVeil").classList.contains("hide")'))
        check('version vue enregistrée',await ev('S.ui2.seenVer===ARK_VERSION'))
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
