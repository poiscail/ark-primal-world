"""Animations II (0.39) : éclats et lumière des orbes, particules d'élément, nombres colorés et empilés, « CRITIQUE ! » et zoom,
recul, traînée de charge, désintégration, ralenti du boss, entrée de l'équipe, transition de vague, rugissement, soins,
bouclier, poison, victoire, défaite, éclosion et mutation, évolution, intensité (vrais clics dans les réglages), réduction
automatique. On compte les ajouts au #fxLayer (MutationObserver) et les animations Web nommées."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
OBS='(()=>{window.__fx={};const L=document.getElementById("fxLayer");new MutationObserver(M=>M.forEach(m=>m.addedNodes.forEach(n=>{if(n.classList)n.classList.forEach(c=>{if(/^a2/.test(c)||c==="dmgnum")__fx[c]=(__fx[c]||0)+1})}))).observe(L,{childList:true})})()'
ANIMS='(()=>{const c={};document.getAnimations().forEach(a=>{if(/^a2/.test(a.id))c[a.id]=(c[a.id]||0)+1});return c})()'
FIGHT='if(typeof C4!=="undefined"){C4.duoP=0}F2.newP=F2.goldP=F2.callP=0;fight=null;startBattle({mode:"story",n:3});F2.newP=F2.goldP=F2.callP=0;fight.enemies.forEach(e=>{e.tr="";e.sh=0});renderBattle()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:40,xp:0}));S.stage=40;ens();save();setPref("anim",true);setPref("fxLv",1)')
        await ev(OBS)
        check('réglages par défaut : intensité normale, réduction automatique',await ev('[PREFS.fxLv,PREFS.fxAuto]')==[1,True])
        # entrée de l'équipe
        await ev(FIGHT);await ev('go("battle")');await pg.wait_for_timeout(30);a=await ev(ANIMS)
        await ev('renderBattle()');a2=await ev(ANIMS)
        check('entrée reprise au rendu suivant (pas coupée)',a2.get('a2in',0)>=4,a2)
        check('entrée de l\'équipe et de l\'ennemi (4 animations)',a.get('a2in',0)>=4,a)
        # orbe : éclats, lumière (2 orbes de même couleur), traînée du dino de cet élément
        await ev('window.__fx={};fight.orbs=Array(fight.orbs.length).fill("blueorb");fight.orbs[0]="redorb";fight.orbs[1]="redorb";renderBattle()')
        await pg.click('#battleArea .orbboard .orb>>nth=0');await pg.wait_for_function('__fx.a2pt>0',timeout=3000)
        fx=await ev('__fx');a=await ev(ANIMS)
        check('vrai clic sur une orbe : éclats',fx.get('a2shard',0)>=7,fx)
        check('orbe boostée (2 rouges) : anneau de lumière',fx.get('a2boost',0)==1,fx)
        check('particules d\'élément sur le coup',fx.get('a2pt',0)>=5,fx)
        check('recul de l\'ennemi',a.get('a2kb',0)>=1,a)
        check('traînée du dino rouge qui charge',a.get('a2dash',0)>=1 and await ev('S.team.slice(0,3).filter(d=>sp(d).element==="redorb").length')>=1,a)
        cls=await ev('[...document.querySelectorAll("#fxLayer .dmgnum")].map(d=>d.className).join(" ")')
        check('nombre de dégâts coloré par élément',"a2el-red" in cls,cls)
        # critique : lettrage et zoom ; nombres empilés
        await ev('window.__fx={};const R=document.querySelector("#battleArea .sEnemy").getBoundingClientRect();fight.last="purpleorb";floatNum("-500",R.left+50,R.top+50,"crit");floatNum("-80",R.left+50,R.top+50,"")')
        fx=await ev('__fx');a=await ev(ANIMS)
        check('« CRITIQUE ! » façon BD',fx.get('a2crit',0)==1,fx)
        check('zoom de la caméra sur le critique',a.get('a2zoom',0)>=1,a)
        tops=await ev('[...document.querySelectorAll("#fxLayer .dmgnum.a2el-purple")].map(d=>parseFloat(d.style.top))')
        check('nombres empilés (le 2e plus haut)',len(tops)==2 and tops[1]<tops[0],tops)
        # bouclier, poison, soins
        await ev('window.__fx={};fight.guard=1;fight.pz={0:3};fight.hp[1]=Math.max(1,fight.hp[1]-50);renderBattle()')
        check('bouclier : dôme hexagonal',await pg.locator('#battleArea .sTeam.a2dome').count()==1)
        check('poison : bulles au-dessus du dino empoisonné',await pg.locator('#battleArea .sFig[data-k="0"] .a2bub').count()==1 and await pg.locator('#battleArea .sFig[data-k="1"] .a2bub').count()==0)
        await ev('fight.hp[1]+=50;fight.guard=0;fight.pz={};renderBattle()');fx=await ev('__fx')
        check('soin : feuilles qui tourbillonnent',fx.get('a2leaf',0)>=6,fx)
        check('dôme et bulles retirés',await pg.locator('#battleArea .a2dome,#battleArea .a2bub').count()==0)
        # vague suivante : transition ; désintégration
        await ev(FIGHT);await ev('go("battle")')
        await ev('window.__fx={};fight.enemies[1].hp=fight.enemies[1].max=1e7;fight.enemies[fight.wave].hp=1;fight.orbs=Array(fight.orbs.length).fill("goldorb");fight.stun=9');await pg.click('#battleArea .orbboard .orb>>nth=4');await pg.wait_for_timeout(60)
        fx=await ev('__fx');check('ennemi vaincu : désintégration en particules',fx.get('a2px',0)>=15,fx)
        r=await ev('[fight.wave,document.querySelectorAll("#fxLayer .a2sweep").length]');check('transition de vague',r==[1,1],r)
        # boss : rugissement, ralenti du coup final, pose de victoire
        await ev('fight.enemies[1].hp=0;killEnemy();fight.enemies[2].boss=true;fight.a2Roar=undefined;renderBattle()')
        r=await ev('[fight.wave,document.querySelectorAll("#fxLayer .a2roar").length,fight.enemies.map(e=>e.hp)]');check('boss : rugissement et onde de choc',r[:2]==[2,1],r)
        await ev('window.__fx={};const e=fight.enemies[2];e.hp=1;e.tr="";e.sh=0;fight.rune=null;fight.locked=null;fight.grab=null;fight.parts=null;fight.stun=9;fight.orbs=Array(fight.orbs.length).fill("goldorb");tapOrb(4)')
        await pg.wait_for_timeout(30);fx=await ev('__fx')
        check('coup final du boss : ralenti',fx.get('a2fin',0)==1 and await ev('fight.over')=='win',(fx,await ev('fight.over')))
        await ev('go("battle")');await pg.wait_for_timeout(30)
        check('pose de victoire de l\'équipe',await ev(ANIMS+'.a2pose||0')>=1 or await pg.locator('#battleArea .sFig.a2pose').count()==1)
        # défaite
        await ev(FIGHT);await ev('(()=>{const f=fight;for(let i=0;i<15&&!f.over;i++){f.hp=f.hp.map(h=>h>0?1:0);f.stun=0;f.guard=0;const e=f.enemies[f.wave];e.atk=1e9;e.hp=e.max=1e9;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}})()');await ev('go("battle")')
        check('défaite : la meute se replie au camp',await ev('fight.over')=='lose' and await pg.locator('#battleArea .a2camp').count()==1)
        # intensité faible : pas de particules ; forte : plus d'éclats
        await ev('setPref("fxLv",0)');await ev(FIGHT);await ev('window.__fx={};fight.orbs=Array(fight.orbs.length).fill("blueorb");renderBattle();tapOrb(0)');fx=await ev('__fx')
        check('intensité faible : ni éclats ni particules',fx.get('a2shard',0)==0 and fx.get('a2pt',0)==0,fx)
        await ev('setPref("fxLv",2)');await ev(FIGHT);await ev('window.__fx={};fight.orbs=Array(fight.orbs.length).fill("blueorb");renderBattle();tapOrb(0)');fx=await ev('__fx')
        check('intensité forte : plus d\'éclats (12)',fx.get('a2shard',0)==12,fx)
        n=await ev('(()=>{sparkBurst(100,100,"#fff",10,1);return SPK.p.length})()');check('intensité forte : étincelles ×1,7',n>=17,n)
        # réglages : vrais clics
        await ev('openSettings()');await pg.click('#setBody .a2lv button:has-text("Faible")');check('vrai clic : intensité « Faible »',await ev('PREFS.fxLv')==0)
        await pg.click('#setBody .a2lv button:has-text("Normale")');check('vrai clic : intensité « Normale »',await ev('PREFS.fxLv')==1)
        # réduction automatique
        r=await ev('[a2PerfFeed(20),PREFS.fxLv,a2PerfFeed(19),PREFS.fxLv]');check('réduction automatique après 2 mesures lentes',r==[False,1,True,0],r)
        await ev('setPref("fxLv",1)');await pg.click('#setBody .a2auto');r=await ev('[PREFS.fxAuto,a2PerfFeed(10),a2PerfFeed(10),PREFS.fxLv]')
        check('vrai clic : réduction automatique coupée → pas de changement',r==[False,False,False,1],r)
        # Nid : éclosion et mutation
        await ev('S.stage=40;S.nest.slots[0]={type:"rex",ta:"rex",tb:"rex",lv:1,gn:{hp:1,atk:1},gen:2,v:"normal",mut:1,t0:Date.now()-1e6,t1:Date.now()-1000}')
        await ev('nestHatch(0)')
        check('éclosion animée avec mutation (ADN)',await pg.locator('#a2hatch .a2egg').count()==1 and await pg.locator('#a2hatch .a2dna').count()==1)
        await pg.click('#a2hatch');await pg.wait_for_timeout(500);check('vrai clic : passer l\'éclosion',await pg.locator('#a2hatch').count()==0)
        await ev('closeGacha&&closeGacha()')
        # évolution
        await ev('evoFx(SPEC.raptor,SPEC.rex)');check('évolution : silhouette qui grandit',await pg.locator('#evoFx.a2sil').count()==1);await ev('document.getElementById("evoFx").remove()')
        # animations coupées : rien
        await ev('setPref("anim",false)');await ev(FIGHT);await ev('window.__fx={};tapOrb(0)');fx=await ev('__fx')
        check('animations coupées : aucun effet',not any(k.startswith('a2') for k in fx),fx)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
