"""Son II (0.40) : graphe audio (4 bus), musique par zone / phase 3 du boss / Arène qui accélère / Nid / événement / mode calme,
musique sur le bus « music », bruitages de famille et orbes boostées, jingle selon les étoiles, son de mutation, battement de
cœur, alerte d'attaque puissante, leitmotiv et atténuation pendant un dialogue, pas sur la carte, silence hors de la fenêtre,
ambiance par décor, réglages (vrais clics), jukebox (vrai clic). Les sons sont comptés (window.__snd, __sndBus)."""
import asyncio,pathlib,sys,os
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
        b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);setPref("sound",true);setPref("music",false);S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:40,xp:0}));S.stage=40;ens();save()')
        check('graphe audio : 4 bus + égaliseur',await ev('(()=>{const G=sndGraph();return !!G&&Object.keys(G.bus).join()==="music,sfx,amb,voice"&&G.lo.type==="lowshelf"&&G.hi.type==="highshelf"})()'))
        # musique par zone
        await ev(FIGHT%5);check('musique de la jungle en combat',await ev('musicMode()')=='jungle',await ev('musicMode()'))
        await ev('fight.zone="Volcan";');check('musique du volcan',await ev('musicMode()')=='volcan')
        await ev(FIGHT%10+';fight.wave=2;fight.enemies[2].boss=true;renderBattle()');m1=await ev('musicMode()');await ev('fight.enemies[2].hp=fight.enemies[2].max*.2');m2=await ev('musicMode()')
        check('boss : musique de boss puis phase 3 plus intense',m1=='boss' and m2=='boss3',(m1,m2))
        await ev(FIGHT%5+';fight.o={...fight.o,mode:"arena"};fight.turn=1');a1=await ev('musicMode()');await ev('fight.turn=20');a3=await ev('musicMode()')
        check('Arène : la musique accélère',a1=='arena1' and a3=='arena3' and await ev('MSC.arena3.ms<MSC.arena1.ms'))
        await ev('fight=null;go("nest")');check('Nid : musique douce',await ev('musicMode()')=='nest' and await ev('MSC.nest.ms>MSC.menu.ms'))
        await ev('go("home");window.__forceEv="halloween"');check('événement : musique saisonnière',await ev('musicMode()')=='halloween');await ev('window.__forceEv=undefined')
        await ev('PREFS.calm=true');check('mode « musique calme »',await ev('musicMode()')=='calm');await ev('PREFS.calm=false')
        await ev('window.__sndBus={};PREFS.music=true;musicTick();PREFS.music=false');check('la musique passe par le bus « music »',await ev('(__sndBus.music||0)>0&&!__sndBus.sfx'),await ev('__sndBus'))
        # bruitages
        await ev(FIGHT%5);await ev('window.__snd=0;fight.orbs=Array(fight.orbs.length).fill("redorb");renderBattle()')
        await pg.click('#battleArea .orbboard .orb>>nth=0');check('vrai clic : bruitage de famille + orbes boostées',await ev('__snd')>=5,await ev('__snd'))
        await ev('fight.hp=fight.mx.slice();window.__jingle=0;SFX.win()');j3=await ev('__jingle');await ev('fight.hp[0]=0;SFX.win()');j1=await ev('__jingle')
        check('jingle de victoire selon les étoiles',j3==3 and j1==1,(j3,j1))
        q=await ev('(()=>{SFX.ping();return SND_Q})()');check('sons de menu discrets (facteur rétabli)',q==1)
        # alerte d'attaque puissante, battement de cœur
        await ev(FIGHT%5);await ev('window.__alert=0;fight.turn=2;renderBattle()');check('alerte : prochaine attaque puissante',await ev('__alert')==1)
        await ev('renderBattle()');check('alerte jouée une seule fois par tour',await ev('__alert')==1)
        await ev('window.__heart=0;fight.hp[0]=Math.round(fight.mx[0]*.1)');check('battement de cœur à faibles PV',await until(pg,'__heart>0',2500))
        await ev('fight.hp=fight.mx.slice();window.__heart=0');await pg.wait_for_timeout(1000);check('cœur arrêté quand la vie remonte',await ev('__heart')==0)
        # ambiance
        await ev('window.__sndBus={};fight.zone="Jungle";ambTick()');check('ambiance de la jungle (bus « amb »)',await ev('(__sndBus.amb||0)>0'))
        # mutation
        await ev('S.nest.slots[0]={type:"rex",ta:"rex",tb:"rex",lv:1,gn:{hp:1,atk:1},gen:2,v:"normal",mut:1,t0:Date.now()-1e6,t1:Date.now()-1000};window.__mut=0;nestHatch(0);closeGacha&&closeGacha()')
        check('son de mutation à l\'éclosion',await ev('__mut')==1)
        # dialogue : leitmotiv, atténuation
        await ev('fight=null;go("story");window.__motif=0;PREFS.lore=true');duck=await ev('(loreShow(Object.keys(LORE).find(k=>/^\\d+$/.test(k))*1,()=>{}),SND.duck)')
        check('dialogue : leitmotiv de la Graine',await ev('__motif')==1)
        check('dialogue : musique et ambiance atténuées',duck<1,duck)
        await ev('setPref("lore",false);document.querySelectorAll("#loreVeil").forEach(v=>v.classList.add("hide"))');check('fin du dialogue : volume rétabli',await until(pg,'SND.duck===1',2000))
        check('narration : sans erreur si désactivée',await ev('sayLine("Bonjour")')==False)
        # pas sur la carte
        await ev('window.__step=0;mapSet(mapCh===9?8:mapCh+1)');check('pas sur la carte d\'histoire',await ev('__step')==1)
        # fenêtre au second plan
        await ev('dispatchEvent(new Event("blur"))');check('silence hors de la fenêtre',await ev('SND.away===true'))
        await ev('dispatchEvent(new Event("focus"))');check('le son revient au premier plan',await ev('SND.away===false'))
        # réglages
        await ev('openSettings()');await pg.click('#setBody .s2t-retro');check('vrai clic : sons « 8 bits »',await ev('PREFS.retro')==True)
        await pg.click('#setBody .s2t-retro');await pg.click('#setBody .s2t-calm');check('vrai clic : musique calme',await ev('PREFS.calm')==True);await pg.click('#setBody .s2t-calm')
        await ev('(()=>{const i=document.querySelector("#setBody input.s2vMus");i.value="0.3";i.dispatchEvent(new Event("input",{bubbles:true}))})()');await pg.wait_for_timeout(400);check('curseur : volume de la musique',abs(await ev('PREFS.vMus')-0.3)<1e-6 and abs(await ev('SND.bus.music.gain.value')-0.3)<0.2)
        await ev('(()=>{const i=document.querySelector("#setBody input.s2eqLo");i.value="6";i.dispatchEvent(new Event("input",{bubbles:true}))})()');check('curseur : graves +6 dB',await ev('PREFS.eqLo')==6)
        await ev('closeSettings()')
        # jukebox
        await ev('jukeOpen()');n=await pg.locator('#modalBody .s2juke button:not([disabled])').count();check('jukebox : musiques entendues débloquées',n>=6,n)
        await pg.click('#modalBody .s2juke button:has-text("Volcan")');check('vrai clic : jukebox joue le volcan',await ev('SND.jbx')=='volcan' and await ev('musicMode()')=='volcan')
        await pg.click('#modalBody button:has-text("REVENIR")');check('retour à la musique du jeu',await ev('SND.jbx')==None)
        await ev('closeModal();setPref("music",false);PREFS.vMus=.8;PREFS.eqLo=0;savePrefs()')
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
