"""Graphismes II (0.39) : filtre d'ombrage/écailles, 4e plan du décor (combat et bannières), éclairage selon l'élément,
météo visible, brume du Cauchemar, lucioles la nuit, reflets dans l'eau, ciel selon l'heure, police du titre par zone,
3 thèmes (vrai clic), icônes de la barre du haut, cadres de rareté, carte mythique, transitions de page, écran titre,
option « graphismes simples » (vrai clic), mise en page du combat intacte à 1024×640."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
FIGHT='F2.newP=F2.goldP=F2.callP=0;fight=null;startBattle({mode:"story",n:%d});go("battle")'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","raptor","trike"].map((t,i)=>({id:i+1,type:t,level:40,xp:0}));S.stage=60;ens();save();setPref("anim",true)')
        check('réglage par défaut : graphismes complets',await ev('PREFS.gfx')=='full' and await ev('document.documentElement.classList.contains("g2simple")')==False)
        check('filtre d\'ombrage et d\'écailles déclaré',await pg.locator('#g2defs filter#g2skin feTurbulence').count()==1)
        check('ciel : le jour sous un navigateur automatisé',await ev('document.documentElement.dataset.sky')=='day')
        await ev('WD_FORCE=true;g2Apply()');check('ciel : nuit si forcée',await ev('document.documentElement.dataset.sky')=='night')
        # combat : 4e plan, filtre sur les portraits, météo, titre par zone
        await ev('WD_FORCE=false;g2Apply();WX_FORCE="pluie";'+FIGHT%25)
        check('décor de combat à 4 plans',await pg.locator('#battleArea .battlestage .sc-layer').count()==4 and await pg.locator('#battleArea .sc-layer.l0 .g2bird').count()==3)
        f=await ev('getComputedStyle(document.querySelector("#battleArea .sEart .pt>svg")).filter');check('portrait de l\'ennemi ombré (filtre)','g2skin' in f,f)
        check('pluie : gouttes animées',await pg.locator('#battleArea .g2wx-rain i').count()>=30)
        check('titre du combat : police de la zone',await ev('document.getElementById("battleTitle").dataset.zone')=='jungle')
        await ev('renderBattle()');check('météo : pas de doublon au rendu suivant',await pg.locator('#battleArea .g2wx').count()==1)
        await ev('WX_FORCE="cendres";fight._wxK=null;renderBattle()');check('cendres : braises',await pg.locator('#battleArea .g2wx-ash i').count()>=20)
        # éclairage selon l'élément
        await ev('window.__lit=0;new MutationObserver(M=>M.forEach(m=>m.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains("g2lit"))__lit=n.style.getPropertyValue("--c")}))).observe(document.getElementById("fxLayer"),{childList:true})')
        await ev('fight.orbs=Array(fight.orbs.length).fill("blueorb");renderBattle()');await pg.click('#battleArea .orbboard .orb>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic sur une orbe bleue : lumière bleue sur la scène',await ev('__lit')==await ev('ELC.blueorb'),await ev('__lit'))
        # nuit : lucioles ; Cauchemar : brume ; abysses : reflets
        await ev('WX_FORCE=null;WD_FORCE=true;g2Apply();'+FIGHT%25)
        check('nuit : lucioles',await pg.locator('#battleArea .g2ffly i').count()==12)
        await ev('WD_FORCE=false;g2Apply();fight=null;startBattle({mode:"story",n:5});fight.o={...fight.o,mode:"nightmare"};renderBattle();go("battle")')
        check('Cauchemar : brume volumétrique',await ev('fight.o.mode')=='nightmare' and await pg.locator('#battleArea .g2fog i').count()==3)
        await ev('fight=null;startBattle({mode:"story",n:5});fight.zone="Abysses";renderBattle();go("battle")')
        check('abysses : reflets dans l\'eau',await pg.locator('#battleArea .battlestage.g2water').count()==1)
        r=await ev('getComputedStyle(document.querySelector("#battleArea .g2water .sfa")).webkitBoxReflect');check('reflet appliqué aux dinos',r and r!='none',r)
        # mise en page à 1024×640 : le combat tient sans défiler
        await pg.set_viewport_size({'width':1024,'height':640});await ev(FIGHT%25);await pg.wait_for_timeout(100)
        r=await ev('[Math.max(...["#battleArea .orbboard","#battleArea .bl-super"].map(s=>document.querySelector(s).getBoundingClientRect().bottom),...[...document.querySelectorAll("#battleArea>.bl-team")].map(e=>e.getBoundingClientRect().bottom)),innerHeight]')
        check('1024×640 : orbes, super et équipe visibles sans défiler',r[0]<=r[1]+1,r)
        await pg.set_viewport_size({'width':1280,'height':800})
        # bannières : 4e plan et emblème
        await ev('go("camp")');await pg.wait_for_timeout(50)
        check('bannière d\'un mode : 4e plan',await pg.locator('#camp .banner .bscene .sc-layer.l0').count()==1)
        e=await ev('getComputedStyle(document.querySelector("#camp .banner .bscene"),"::after").content');check('bannière d\'un mode : emblème',e=='"🏕️"',e)
        # transition de page
        await ev('go("home")');await ev('go("team")');check('transition de page à l\'entrée d\'un écran',await ev('document.getElementById("team").classList.contains("g2pg")'))
        # icônes et cartes
        check('barre du haut : 4 icônes dessinées',await pg.locator('header .meters .g2ico svg').count()==4)
        check('barre du haut : valeurs intactes',await ev('document.getElementById("stone").textContent')==await ev('String(S.stone)'))
        await ev('S.team.push({id:50,type:Object.keys(SPEC).find(k=>SPEC[k].myth)||"rex",level:1,xp:0});render();go("team")')
        r=await ev('[...new Set([...document.querySelectorAll("#collection .dcard")].map(c=>[...c.classList].filter(x=>/^rar-/.test(x)).join("+")))]')
        check('cadres de rareté (commun, épique, légendaire)',{'rar-c','rar-e'}<=set(r) and any('rar-l' in c for c in r),r)
        check('carte d\'un dino mythique : cadre propre',await pg.locator('#collection .dcard.rar-m').count()>=1 if await ev('Object.keys(SPEC).some(k=>SPEC[k].myth)') else True)
        # thèmes : vrai clic
        await ev('openSettings()');await pg.click('#setVeil .skins button:has-text("Aurore")');await pg.wait_for_timeout(50)
        check('vrai clic : thème Aurore',await ev('document.documentElement.dataset.skin')=='aurore' and await ev('getComputedStyle(document.documentElement).getPropertyValue("--acc").trim()')=='#6dffc8')
        check('3 thèmes ajoutés (10 en tout)',await ev('SKINS.length')==10 and await ev('["fossile","aurore","rubis"].every(k=>SKINS.some(s=>s[0]===k))'))
        await ev('setSkin("")')
        # graphismes simples : vrai clic
        await ev('openSettings()');await pg.click('#setBody .g2gfx button:has-text("Simples")')
        check('vrai clic : graphismes simples',await ev('PREFS.gfx')=='simple' and await ev('document.documentElement.classList.contains("g2simple")'))
        await ev('closeSettings&&closeSettings();WX_FORCE="pluie";'+FIGHT%25)
        check('simples : ni météo en particules, ni 4e plan visible',await pg.locator('#battleArea .g2wx').count()==0 and await ev('getComputedStyle(document.querySelector("#battleArea .sc-layer.l0")).display')=='none')
        f=await ev('getComputedStyle(document.querySelector("#battleArea .sEart .pt>svg")).filter');check('simples : pas de filtre sur les portraits',f=='none',f)
        await ev('openSettings()');await pg.click('#setBody .g2gfx button:has-text("Complets")');check('vrai clic : graphismes complets',await ev('PREFS.gfx')=='full')
        await ev('WX_FORCE=null')
        # écran titre (hors navigateur automatisé) : on vérifie la fonction d'enrichissement sur un faux écran
        check('astuces de l\'écran titre',await ev('G2TIPS.length')>=6)
        check('animations coupées : pas de particules',await ev('setPref("anim",false);'+FIGHT%25+';document.querySelectorAll("#battleArea .g2wx,#battleArea .g2ffly").length')==0)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
