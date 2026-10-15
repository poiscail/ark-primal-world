"""Sensations de combat (0.19) et mise en page PC : navigation en colonne, flash et secousse à l'impact, gel à l'impact,
coupure de super attaque (bloque les actions, passe au clic ou à Espace, puis la super part), image d'impact, parallaxe,
invocation « couleur avant identité », réglages, cadres légendaires holographiques, rien quand les animations sont coupées."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.tut={off:true,seen:{}};S.team=[{id:1,type:"rex",level:40,xp:0},{id:2,type:"spino",level:38,xp:0},{id:3,type:"trike",level:35,xp:0},{id:4,type:"chrono",level:30,xp:0}];S.stage=23;S.nextId=10;ens();save();setPref("lore",false);setPref("anim",true);window.__forceCutin=true;render()'
FIGHT='startBattle({mode:"story",n:24});fight.enemies.forEach(e=>{e.tr="";e.sh=0;e.hp=e.max=999999});fight.stun=9;renderBattle()'
WATCH='window.__cls=new Set();window.__shk=0;new MutationObserver(ms=>ms.forEach(m=>{const t=m.target;if(m.attributeName==="style"){if(t.classList&&t.classList.contains("battlestage")&&t.style.translate&&t.style.translate!=="none")__shk++;return}if(t.classList)t.classList.forEach(c=>__cls.add(c))})).observe(document.getElementById("battleArea"),{subtree:true,attributes:true,attributeFilter:["class","style"]})'
async def until(pg,js,ms):
    for _ in range(ms//50):
        if await pg.evaluate(js):return True
        await pg.wait_for_timeout(50)
    return False
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(500);await ev(BASE)
        # mise en page PC
        nav=await ev('(()=>{const r=document.querySelector(".bottomnav").getBoundingClientRect();return{l:r.left,t:r.top,w:r.width,h:r.height}})()')
        check('navigation en colonne à gauche',nav['l']==0 and nav['t']==0 and nav['h']>=790 and 80<=nav['w']<=140,nav)
        app=await ev('document.querySelector(".app").getBoundingClientRect().left')
        check('contenu à droite de la navigation',app>=nav['w'],(app,nav['w']))
        check('contenu élargi (plus de 760 px)',await ev('document.querySelector("main").getBoundingClientRect().width')>900)
        # impact d'une orbe : flash de l'ennemi + secousse
        await ev(FIGHT);await pg.wait_for_timeout(1300);await ev(WATCH)
        await ev('tapOrb(0)')
        shook=await until(pg,'__shk>0',2000)
        check('orbe : l\'ennemi touché clignote',await until(pg,'__cls.has("hitfx")',1500))
        check('orbe : l\'écran tremble (trauma)',shook)
        check('la secousse retombe à zéro',await until(pg,'!document.querySelector("#battleArea .battlestage").style.translate',3000))
        # gel à l'impact : les animations du combat s'arrêtent un instant puis repartent
        r=await ev('''(()=>{const el=document.querySelector("#battleArea .battlestage .sEart");const a=el.animate([{opacity:1},{opacity:.99}],{duration:4000});hitStop(120);const p=a.playState;return new Promise(res=>setTimeout(()=>res([p,a.playState]),fxd(120)+120))})()''')
        check('gel à l\'impact : pause puis reprise',r==['paused','running'],r)
        # coupure de super attaque
        t0=await ev('fight.turn');sp0=await ev('fight.sp=100,renderBattle(),fight.sp')
        await ev('special()')
        check('super : coupure affichée',await ev('!!document.getElementById("cutin")'))
        check('super : portrait et nom de l\'attaque',await ev('!!document.querySelector("#cutin .ciArt svg")&&document.querySelector("#cutin .ciTxt b").textContent.length>3'))
        check('super : pas encore partie pendant la coupure',await ev('fight.sp')==100)
        await ev('tapOrb(0);useSkill(0)');check('super : orbes et compétences bloquées pendant la coupure',await ev('fight.turn')==t0 and await ev('fight.sp')==100)
        check('super : part à la fin de la coupure',await until(pg,'fight.sp<100&&!document.getElementById("cutin")',3000))
        check('super : image d\'impact',await until(pg,'__cls.has("impactfr")',2000))
        await ev('fight.sp=100;renderBattle()');await ev('special()');await pg.wait_for_timeout(150)
        await pg.keyboard.press('Space');check('Espace passe la coupure (la super part)',await until(pg,'fight.sp<100&&!document.getElementById("cutin")',800))
        await ev('fight.sp=100;renderBattle()');await ev('special()');await pg.wait_for_timeout(150)
        await pg.mouse.click(640,400);check('un clic passe la coupure',await until(pg,'fight.sp<100&&!document.getElementById("cutin")',800))
        # réglage : animation de super attaque désactivée -> la super part tout de suite
        await ev('setPref("cutin",false);fight.sp=100;renderBattle();special()')
        check('réglage coupé : super immédiate, sans coupure',await ev('fight.sp<100&&!document.getElementById("cutin")'))
        await ev('setPref("cutin",true)')
        # parallaxe
        await pg.mouse.move(250,150);await pg.wait_for_timeout(120)
        px=await ev('parseFloat(document.querySelector("#battleArea .battlestage").style.getPropertyValue("--px"))')
        check('parallaxe : la scène suit la souris',px<-0.3,px)
        # réglages
        await ev('openSettings()');check('réglages : secousses, flashs, animation de super',await ev('document.querySelectorAll("#jxOpts .row").length')==3)
        await ev('setPref("shake",false)');await ev('closeSettings()');await ev(WATCH);await ev('tapOrb(1)');await pg.wait_for_timeout(1200)
        check('secousses désactivées : pas de tremblement',await ev('__shk')==0 and not await ev('document.querySelector("#battleArea .battlestage").style.translate'))
        await ev('setPref("shake",true)')
        # animations coupées : aucun effet
        await ev('setPref("anim",false);'+FIGHT);await ev(WATCH);await ev('fight.sp=100;special();tapOrb(0)')
        check('animations coupées : pas de coupure ni de flash',not await ev('!!document.getElementById("cutin")') and not await ev('__cls.has("hitfx")'))
        await ev('setPref("anim",true)')
        # invocation : fausse piste (la couleur monte d'un cran)
        await ev('go("summon");window.__r=Math.random;Math.random=()=>0.01;showGacha([{id:99,type:"chrono",level:1,xp:0}],new Set(["chrono"]),"Test");Math.random=window.__r')
        c0=await ev('document.querySelector("#gfxLayer .circle").style.getPropertyValue("--c")')
        check('invocation légendaire : commence en violet',c0=='#bd8aff',c0)
        check('puis monte à l\'or pendant l\'incantation',await until(pg,'(document.querySelector("#gfxLayer .circle")||{style:{getPropertyValue:()=>""}}).style.getPropertyValue("--c")==="#ffd15c"',1500))
        await until(pg,'!document.getElementById("gachaVeil").classList.contains("summoning")',4000)
        await pg.locator('#gachaBody button',has_text='OK').click(timeout=3000)
        check('résultat refermé par OK',await ev('document.getElementById("gachaVeil").classList.contains("hide")'))
        # cadres légendaires holographiques
        await ev('go("team");colSet("r","Légendaire")');await pg.wait_for_timeout(200)
        hb=await ev('(()=>{const c=document.querySelector("#collection .dcard.rar-l");if(!c)return null;const s=getComputedStyle(c,"::before");return s.backgroundImage.includes("conic-gradient")})()')
        check('carte légendaire : bordure holographique',hb is True,hb)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
