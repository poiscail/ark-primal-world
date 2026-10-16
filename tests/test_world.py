"""Le monde (0.34) : carte du monde (vrai clic), nuit (créatures nocturnes, +3 essences), saisons (attribut), résumés de
chapitre, épilogues et fin selon les choix, histoire d'espèce (niveau 30), énigme (lettres des fouilles, réponse),
découvertes, archives de la Graine, intro en 5 cases, événement du jour sur la carte."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
KILL='(()=>{const f=fight;f.wave=2;f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[2];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0);return f.over})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        check('pas d\'intro sous un navigateur automatisé',await pg.locator('#wdIntro').count()==0)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.stage=55;ens();delete S.wd;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        # carte du monde
        await ev('go("world")')
        check('carte du monde : 9 régions',await pg.locator('#world .wdreg').count()==9)
        check('histoire 55 : Grand Nord et Badlands ouverts, archipel, grottes et îles célestes verrouillés',await ev('[...document.querySelectorAll("#world .wdreg")].map(b=>b.disabled).join()')=='false,false,false,false,false,true,false,true,true')
        await pg.click('#world .wdreg:has-text("Grand Nord")');await pg.wait_for_timeout(100)
        check('vrai clic : on arrive au Grand Nord',await ev('screen')=='far')
        # saisons
        await ev('WD_SEASON="hiver";wdApplyEnv()')
        check('saison posée sur la page',await ev('document.documentElement.dataset.season')=='hiver')
        # nuit
        await ev('WD_FORCE=true;Math._r=Math.random;Math.random=()=>.1;fight=null;startBattle({mode:"story",n:12});Math.random=Math._r')
        r=await ev('[fight.night,fight.enemies.slice(0,2).map(e=>e.e),!!document.querySelector("#battleArea .wdnight"),!!document.querySelector("#battleArea .wdn")]')
        check('nuit : créatures nocturnes, décor et puce',r[0]==1 and all(x in ['🦇','🐺','🕷️','👁️'] for x in r[1]) and r[2] and r[3],r)
        e0=await ev('S.essence');r=await ev(KILL)
        check('victoire de nuit : +3 essences en plus',r=='win' and await ev('S.essence')>=e0+3 and await ev('S.cnt.nightW')==1)
        await ev('WD_FORCE=false;fight=null;startBattle({mode:"story",n:12})')
        check('de jour : pas de nuit',await ev('!fight.night'))
        # résumé de chapitre
        await ev('S.stage=59;fight=null;startBattle({mode:"story",n:60})');await ev(KILL)
        check('gardien battu pour la 1re fois : résumé du chapitre 6',await ev('S.wd.sum[6]')==1)
        # fin selon les lettres
        await ev('S.stage=100;S.wd.hist=[1,1,0];S.hunt.seed=0')
        check('fin du savant (2 choix « science » sur 3)',await ev('wdEnd()')=='endS')
        await ev('S.wd.hist=[0,0,1]');check('fin du gardien',await ev('wdEnd()')=='endN')
        await ev('S.hunt.seed=1;S.camp.rival=10');check('fin du dresseur légendaire',await ev('wdEnd()')=='endL')
        await ev('go("home");subSet("home","profile")')
        j=await ev('loreJournal()')
        check('journal : résumés, épilogues, fin, archives, découvertes',all(x in j for x in ['Résumés du narrateur','Épilogue · L','Ta fin','Archives de la Graine','Découvertes']),j[:200])
        # histoire d'espèce
        await ev('msHowTo(1)');t=await pg.inner_text('#modalBody .wdtale')
        check('histoire de l\'espèce lisible au niveau 30',len(t)>60 and '🔒' not in t,t)
        await ev('closeModal();S.team[1].level=10;msHowTo(2)');t=await pg.inner_text('#modalBody .wdtale')
        check('verrouillée sous le niveau 30','🔒' in t)
        await ev('closeModal()')
        # énigme
        await ev('S.wd.rd=0;S.wd.rl=0;Math._r=Math.random;Math.random=()=>.01;S.dig.picks=3;S.dig.open={};digTap(0);Math.random=Math._r;go("dig")')
        check('fouille : une lettre de l\'énigme révélée',await ev('S.wd.rl')==1 and 'M _' in await pg.inner_text('#dig .wdletters'))
        await pg.click('#dig .wdrid button');await pg.fill('#askIn','moustique');await pg.click('#modalBody button:has-text("OK")');await pg.wait_for_timeout(100)
        check('vrai clic : bonne réponse (sans accents ni majuscules), énigme suivante',await ev('S.wd.rd')==1)
        # découvertes et archives
        await ev('for(let i=0;i<12;i++)S.wd.art[i]=1;S.ach.got={};for(let i=0;i<10;i++)S.ach.got["x"+i]=1')
        check('archives : 2 pages pour 10 succès',await ev('wdArchN()')==2)
        t0=await ev('S.tickets');await ev('wdArtClaim()')
        check('collection des découvertes complète : +5 tickets',await ev('S.tickets')==t0+5 and await ev('S.wd.artDone')==1)
        # intro
        await ev('wdIntro(true)')
        check('intro : 5 cases',await pg.locator('#wdIntro .wddots i').count()==5)
        for i in range(5):await pg.click('#wdIntro button.blue')
        check('vrai clic : intro terminée',await pg.locator('#wdIntro').count()==0)
        await ev('wdIntro(true);setPref("lore",false)')
        check('couper les dialogues ferme l\'intro',await pg.locator('#wdIntro').count()==0)
        # événement du jour
        await ev('S.stage=55;S.wd.ev="";S.stone=2000;const x=wdEvToday();mapCh=(x.n-1)/10|0;go("story")')
        check('événement du jour sur la carte',await pg.locator('#chapters .smap .wdev').count()==1)
        await pg.click('#chapters .smap .wdev');await pg.wait_for_timeout(100)
        await pg.locator('#modalBody .clans button').nth(1).click();await pg.wait_for_timeout(100)
        check('vrai clic : événement réglé, une fois par jour',await ev('S.wd.ev===todayK()'))
        check('sauvegarde : S.wd',await ev('(()=>{save();const x=JSON.parse(localStorage.arkPrimalMobile);return !!(x.wd&&x.wd.rd===1&&x.wd.sum[6]===1)})()'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
