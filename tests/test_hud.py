"""Interface (0.43) : icônes game-icons.net sur la navigation, les sous-onglets et les compteurs (émojis gardés dans le texte),
curseur Kenney (normal et « bouton » au survol), vis des panneaux, boutons en relief, barres brillantes, viseur sur les ennemis
au survol ; les 3 réglages (Icônes, Curseur, Cadres) par vrais clics ; crédits."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
SPAN='(s=>{const e=document.querySelector(s);if(!e)return null;const c=getComputedStyle(e);return {fs:c.fontSize,w:e.getBoundingClientRect().width,mask:(c.webkitMaskImage||c.maskImage||"").slice(0,30)}})'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","trike"].map((t,i)=>({id:i+1,type:t,level:20,xp:0}));S.stage=20;save();go("home")')
        check('3 réglages actifs par défaut',await ev('["hud-ico","hud-cur","hud-k"].every(c=>document.documentElement.classList.contains(c))'))
        # navigation
        for scr in ['home','team','story','summon','missions']:
            r=await ev(SPAN+'(\'.bottomnav button[data-screen="%s"]>span\')'%scr)
            check('icône dessinée sur « %s »'%scr,r and r['fs']=='0px' and r['w']>=24 and 'data:image' in r['mask'],r)
        await ev('go("story")');r=await ev(SPAN+'(`#subnav button[onclick="go(\'maze\')"]>span`)')
        check('icône dessinée dans les sous-onglets (Labyrinthe)',r and r['fs']=='0px' and 'data:image' in r['mask'],r)
        check('tous les sous-onglets de l\'Aventure ont une icône',await ev('[...document.querySelectorAll("#subnav .snwrap button>span:first-child")].every(s=>getComputedStyle(s).fontSize==="0px")'))
        await ev('go("summon")');check('sous-onglets des invocations',await ev('[...document.querySelectorAll("#subnav .snwrap button>span:first-child")].every(s=>getComputedStyle(s).fontSize==="0px")'))
        # compteurs
        await ev('go("home")')
        n=await ev('["m_bone","m_hide","m_crystal","m_amber","powerM","m_shards","setFab"].filter(id=>{const e=document.getElementById(id),m=id==="setFab"?e:e.closest(".meter"),i=m.querySelector(".hudico");return i&&getComputedStyle(i).display!=="none"&&(getComputedStyle(i).webkitMaskImage||"").includes("data:image")}).length')
        check('7 compteurs avec une icône',n==7,n)
        check('émojis gardés dans le texte (cachés)',await ev('document.getElementById("m_bone").closest(".meter").textContent.includes("🦴")') and await ev('getComputedStyle(document.querySelector(".hudemo")).display')=='none')
        check('« Réglages » toujours écrit',await ev('document.getElementById("setFab").textContent.includes("Réglages")'))
        await ev('render();render()');check('pas d\'icône en double après plusieurs rendus',await ev('document.querySelectorAll("header .hudico").length')==7)
        check('niveau de l\'équipe toujours affiché',(await ev('$$("powerM").textContent')).startswith('Niv.'))
        # curseur
        check('curseur du jeu sur la page','url(' in await ev('getComputedStyle(document.body).cursor'))
        await pg.hover('#home button.wide>>nth=0')
        c=await ev('(()=>{const b=document.querySelector("#home button.wide");return [b.classList.contains("hudp"),getComputedStyle(b).cursor]})()')
        check('survol d\'un bouton : curseur « bouton » du jeu',c[0] and 'url(' in c[1],c)
        # cadres
        check('vis sur les panneaux',await ev('getComputedStyle(document.querySelector("#home .panel")).backgroundImage.split("radial-gradient").length-1')>=2)
        check('bouton en relief',await ev('getComputedStyle(document.querySelector("#home button.wide"),"::before").content')!='none')
        await ev('F2.newP=F2.goldP=F2.callP=0;if(typeof C4!=="undefined")C4.duoP=0;fight=null;startBattle({mode:"story",n:3});go("battle")')
        check('barres brillantes',await ev('getComputedStyle(document.querySelector("#battleArea .progress i"),"::before").content')!='none')
        check('viseur posé sur l\'ennemi',await pg.locator('#battleArea .sEnemy .hudx').count()>=1)
        await pg.hover('#battleArea .sEnemy>>nth=0');await pg.wait_for_timeout(350)
        check('viseur visible au survol',float(await ev('getComputedStyle(document.querySelector("#battleArea .sEnemy .hudx")).opacity'))>.5)
        await ev('fight=null;go("home")')
        # réglages par vrais clics
        await ev('openSettings()');await pg.wait_for_timeout(100)
        check('3 réglages dans Affichage',await pg.locator('#setBody #hudOpts .eltabs').count()==3)
        await pg.click('#hudOpts button[onclick="hudSet(\'hudIco\',false)"]')
        check('vrai clic : émojis',await ev('PREFS.hudIco')==False and not await ev('document.documentElement.classList.contains("hud-ico")'))
        await pg.click('#hudOpts button[onclick="hudSet(\'hudCur\',false)"]');await pg.click('#hudOpts button[onclick="hudSet(\'hudK\',false)"]')
        check('vrai clic : curseur Windows et cadres simples',not await ev('document.documentElement.classList.contains("hud-cur")') and not await ev('document.documentElement.classList.contains("hud-k")'))
        await ev('closeSettings&&closeSettings();document.getElementById("setVeil").classList.add("hide");go("home")')
        r=await ev(SPAN+'(\'.bottomnav button[data-screen="home"]>span\')');check('émoji de nouveau visible',r['fs']!='0px',r)
        check('compteurs : émojis visibles, icônes cachées',await ev('getComputedStyle(document.querySelector(".hudemo")).display')!='none' and await ev('getComputedStyle(document.querySelector(".hudico")).display')=='none')
        check('curseur de Windows',await ev('getComputedStyle(document.body).cursor')=='auto')
        check('panneaux sans vis',await ev('getComputedStyle(document.querySelector("#home .panel")).backgroundImage.includes("radial-gradient")')==False)
        await ev('location.reload()');await pg.wait_for_function('typeof setPref==="function"&&document.readyState!=="loading"');await pg.wait_for_timeout(300)
        check('réglages gardés après rechargement',not await ev('document.documentElement.classList.contains("hud-ico")'))
        await ev('setPref("hudIco",true);setPref("hudCur",true);setPref("hudK",true)')
        check('remis : icônes',await ev('document.documentElement.classList.contains("hud-ico")'))
        # crédits
        await ev('shCredits()');t=await ev('document.getElementById("modalBody").textContent')
        check('crédits : game-icons.net et Kenney UI Pack Sci-Fi',('game-icons.net' in t) and ('UI Pack Sci-Fi' in t));await ev('closeModal()')
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
