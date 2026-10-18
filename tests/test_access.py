"""Accessibilité et équilibrage (0.40) : difficultés « Histoire » (−30 %) et « Expert », mode daltonien, contraste élevé,
réduction des mouvements, flashs/secousses coupés partout, lecture à voix haute (synthèse simulée), vitesse des dialogues,
sous-titres, combat au clavier (vraies flèches + Entrée), taille des orbes, pas de limite de temps (pêche), rappel de pause,
réglages (vrais clics) ; défense proportionnelle, coût d'accélération du Nid selon la rareté, seuils d'alerte des simulations."""
import asyncio,pathlib,sys,os
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent/'balance'))
from balance_seuil import alerte
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
FIGHT='F2.newP=F2.goldP=F2.callP=0;if(typeof C4!=="undefined")C4.duoP=0;fight=null;startBattle({mode:"story",n:%d});go("battle")'
async def until(pg,js,ms=3000):
    for _ in range(ms//50):
        if await pg.evaluate(js):return True
        await pg.wait_for_timeout(50)
    return False
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.stage=40;ens();save()')
        # difficultés
        check('difficultés dans l\'ordre (Histoire … Expert)',await ev('Object.keys(DIFFS).join()')=='story,easy,normal,hard,expert')
        await ev('setPref("diff","normal");'+FIGHT%5);h1=await ev('fight.enemies[0].max');await ev('setPref("diff","story");'+FIGHT%5);h2=await ev('fight.enemies[0].max')
        check('mode « Histoire » : ennemis −30 % de PV',abs(h2/h1-.7)<.03,(h1,h2))
        check('mode « Expert » : ennemis plus forts, récompenses ×1,6',await ev('DIFFS.expert.r')==1.6 and await ev('DIFFS.expert.h>DIFFS.hard.h'))
        await ev('setPref("diff","normal")')
        # réglages : vrais clics dans le panneau
        await ev('openSettings()');check('panneau « Accessibilité »',await pg.locator('#axPanel').count()==1)
        await pg.click('#axPanel .axt-cb');check('vrai clic : mode daltonien',await ev('document.documentElement.classList.contains("axcb")'))
        await pg.click('#axPanel .axt-hc');check('vrai clic : contraste élevé',await ev('document.documentElement.classList.contains("axhc")'))
        await pg.click('#axPanel .axt-rm');check('vrai clic : réduire les mouvements',await ev('document.documentElement.classList.contains("axrm")'))
        await pg.click('#axPanel .ax-orbSz button:has-text("Grandes")');check('vrai clic : grandes orbes',await ev('document.documentElement.dataset.orb')=='l')
        await pg.click('#axPanel .ax-txtSpd button:has-text("Immédiate")');check('vrai clic : dialogues immédiats',await ev('PREFS.txtSpd')=='instant')
        await ev('closeSettings()')
        await ev('setPref("anim",true);'+FIGHT%5);await pg.wait_for_timeout(100)
        bg=await ev('getComputedStyle(document.querySelector("#battleArea .orbboard .orb.redorb, #battleArea .orbboard .orb")).backgroundImage')
        check('daltonien : palette Okabe-Ito sur les orbes','213, 94, 0' in bg or '0, 158, 115' in bg or '0, 114, 178' in bg or '204, 121, 167' in bg or '240, 228, 66' in bg,bg[:120])
        z=await ev('getComputedStyle(document.querySelector("#battleArea .orbboard")).zoom');check('grandes orbes (zoom 1,14)',z=='1.14',z)
        d=await ev('getComputedStyle(document.querySelector("#home .banner")||document.querySelector(".screen .panel")).animationDuration');check('mouvements réduits dans les menus',d in ('1e-06s','0.001s','0s') or d.startswith('1e-0'),d)
        await ev('setPref("cb",false);setPref("hc",false);setPref("rm",false);setPref("orbSz","m")')
        # flashs et secousses
        await ev('setPref("flash",false);setPref("shake",false)');check('flashs et secousses coupés partout (classes globales)',await ev('document.documentElement.classList.contains("axnoflash")&&document.documentElement.classList.contains("axnoshake")'))
        await ev('setPref("flash",true);setPref("shake",true)')
        # combat au clavier
        await ev(FIGHT%5);await ev('setPref("anim",false);renderBattle()');await pg.focus('#battleArea .orbboard .orb>>nth=0')
        await pg.keyboard.press('ArrowRight');check('flèche droite : orbe suivante',await ev('[...document.querySelectorAll("#battleArea .orbboard .orb")].indexOf(document.activeElement)')==1)
        await pg.keyboard.press('ArrowDown');check('flèche bas : rangée suivante',await ev('[...document.querySelectorAll("#battleArea .orbboard .orb")].indexOf(document.activeElement)')==4)
        await ev('window.__tap=null;document.addEventListener("click",e=>{const o=e.target.closest&&e.target.closest("#battleArea .orbboard .orb");if(o)__tap=[...o.parentNode.children].indexOf(o)},{capture:true,once:true})')
        l0=await ev('fight.log');await pg.keyboard.press('Enter')
        check('Entrée : joue l\'orbe choisie (la 5e)',await until(pg,'__tap===4',1500) and await ev('fight.log')!=l0,await ev('__tap'))
        check('orbes étiquetées pour les lecteurs d\'écran',await ev('(document.querySelector("#battleArea .orbboard .orb").getAttribute("aria-label")||"").startsWith("Orbe 1")'))
        # sous-titres
        await ev('setPref("subs",true);window.__sub="";'+FIGHT%5);await ev('fight.turn=2;renderBattle()')
        check('sous-titre de l\'alerte d\'attaque puissante',(await ev('__sub')).startswith('⚠') and await pg.locator('#axSubs.on').count()==1,await ev('__sub'))
        await ev('SFX.win()');check('sous-titre de la fanfare de victoire',await ev('__sub')=='Fanfare de victoire');await ev('setPref("subs",false)')
        # lecture à voix haute (synthèse simulée)
        await ev('window.__spk=[];Object.defineProperty(window,"speechSynthesis",{configurable:true,value:{speak:u=>__spk.push(u.text),cancel:()=>{}}});setPref("tts",true)')
        await ev('toast("Bonjour dresseur")');check('lecture à voix haute des notifications',await ev('__spk.some(t=>t.includes("Bonjour dresseur"))'),await ev('__spk'))
        await ev('fight=null;go("story");PREFS.lore=true;loreShow(Object.keys(LORE).find(k=>/^\\d+$/.test(k))*1,()=>{})')
        check('lecture des dialogues',await ev('__spk.length')>=2)
        check('dialogue affiché en entier (vitesse immédiate)',await ev('document.getElementById("loreTxt").textContent===loreCur.lines[loreCur.i]'))
        await ev('setPref("tts",false);setPref("lore",false);document.querySelectorAll("#loreVeil").forEach(v=>v.classList.add("hide"));setPref("txtSpd","normal")')
        # pas de limite de temps : la pêche attend
        await ev('S.stage=60;fishOpen()');await pg.click('#fishBtn');ok=await until(pg,'FISHING&&FISHING.st==="bite"',8000)
        await pg.wait_for_timeout(1300);check('pêche : le poisson attend (pas de limite de temps par défaut)',ok and await ev('!!FISHING&&FISHING.st==="bite"'))
        await ev('FISHING&&clearTimeout(FISHING.tm);FISHING=null;closeModal()')
        # rappel de pause
        check('rappel de pause : coupé par défaut',await ev('axBreakCheck(Date.now()+3.7e6)')==False)
        await ev('PREFS.breakRem=true');check('rappel de pause après 1 h (option)',await ev('axBreakCheck(Date.now()+3.7e6)')==True);await ev('PREFS.breakRem=false')
        # équilibrage : défense proportionnelle
        check('défense : sans défense, dégâts intacts',await ev('defHit(100,0)')==100)
        check('défense : déf = 1,4 × coup → dégâts ÷ 2',abs(await ev('defHit(100,140)')-50)<1e-6)
        r=await ev('''(()=>{S.team=["ankylo","raptor","giga"].map((t,i)=>({id:i+1,type:t,level:3,xp:0}));F2.newP=F2.goldP=F2.callP=0;fight=null;startBattle({mode:"story",n:3});const e=fight.enemies[0];e.tr="";const h=fight.hp[0];hitDino(0,e.atk,e);return [h-fight.hp[0],e.atk,stats(S.team[0]).def]})()''')
        check('un tank du début n\'est plus invulnérable (plus d\'1 dégât, l\'ancien minimum)',r[0]>1,r)
        # Nid : accélération selon la rareté
        r=await ev('(()=>{const t0=Date.now(),mk=(type,h)=>({type,t0,t1:t0+h*36e5});return [nestRushCost(mk(Object.keys(SPEC).find(k=>SPEC[k].r==="Légendaire"&&!SPEC[k].ex),6)),nestRushCost(mk("compsog",.5)),nestRushCost(mk(Object.keys(SPEC).find(k=>SPEC[k].r==="Épique"),3))]})()')
        check('Nid : accélérer un œuf légendaire de 6 h coûte 72 🔮 (24 avant)',r[0]==72 and r[1]==2 and r[2]==24,r)
        # seuils des simulations
        check('seuil : une équipe conseillée sous 50 % déclenche l\'alerte',alerte({'50':{'équipe conseillée':0.4,'nue':0.1}})==1)
        check('seuil : les mesures hors équipe conseillée sont ignorées',alerte({'70':{'équipe nue':0.0,'équipe conseillée':0.9}})==0)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
