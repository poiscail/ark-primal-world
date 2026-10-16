"""Grand Nord II (0.37) : chapitre 3 sous-glaciaire (onglet des régions, niveaux 41-60), blizzard (orbes voilées), mode
difficile (étoiles noires, progression), gardien de la semaine (plus fort, une fois par semaine), équipement de froid,
faune apprivoisable, expédition vers le Grand Nord, bestiaire avec récompenses, aurore, ambiance sonore."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;f.bzHide=null;f.rgHide=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:60,xp:0}));S.stage=100;ens();S.far.stage=40;delete S.far.x;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        await ev('go("far")')
        check('panneaux « au-delà du Grand Nord » et aurore',await pg.locator('#far .fz2').count()==4 and await pg.locator('#far .banner .aurora').count()==1)
        # chapitre 3
        await pg.click('#far .fz2 button:has-text("Y ALLER")');await pg.wait_for_timeout(100)
        check('vrai clic : onglet du volcan sous-glaciaire (niveaux 41-60)',await ev('[screen,rgCur]')==['regions','subglac'] and await pg.locator('#regions .smap .mnode.cur .mn').inner_text()=='41')
        await pg.click('#regions .rgplay');await pg.wait_for_timeout(100)
        check('combat du chapitre 3 : décor du volcan, blizzard',await ev('[fight.o.r,stageZone(fight.zone),fight.bliz]')==['subglac','volcan',True] and await ev('!!document.querySelector("#battleArea .fzbliz")'))
        await ev('(()=>{const f=fight;f.turn=2;f.stun=0;const _h=hitDino;hitDino=function(){};enemyTurn();hitDino=_h;renderBattle()})()')
        check('blizzard : orbes voilées',await ev('document.querySelectorAll("#battleArea .orbboard .orb.fzhide").length')==3)
        # difficile
        await ev('fight=null;go("far")');await pg.click('#far .fz2 button:has-text("DIFFICILE")');await pg.wait_for_timeout(100)
        r=await ev('[fight.o.hard,fight.bliz,/difficile/.test(fight.zone)]');check('vrai clic : mode difficile (blizzard permanent)',r==[1,True,True],r)
        await ev(WIN);check('niveau difficile 1 gagné : étoiles noires, progression',await ev('[S.far.x.hard,S.far.x.hs[1]>0]')==[1,True])
        await ev('fight=null;startBattle({mode:"far",n:5,hard:1})');check('niveau difficile non ouvert refusé',await ev('!fight'))
        # gardien de la semaine
        await ev('go("far")');await pg.click('#far .fz2 button:has-text("AFFRONTER")');await pg.wait_for_timeout(100)
        h1=await ev('fight.enemies[2].max');t0=await ev('S.tickets');await ev(WIN)
        check('gardien de la semaine vaincu : +3 tickets, menace +1',await ev('S.far.x.gw')==1 and await ev('S.tickets')>=t0+3)
        await ev('fight=null;startBattle({mode:"far",n:farGwN(),gw:1})');check('une fois par semaine',await ev('!fight'))
        await ev('S.far.x.gwk=-1;fight=null;startBattle({mode:"far",n:farGwN(),gw:1})');h2=await ev('fight.enemies[2].max')
        check('la semaine suivante, il revient plus fort',h2>h1,[h1,h2])
        # équipement de froid
        r=await ev('(()=>{const it=newItem("w",1);it.cold=1;addItem(it);S.team[0].eq={w:it.id};fight=null;startBattle({mode:"far",n:3});const a=atkOf(0);it.cold=0;const b=atkOf(0);S.team[0].eq={};return a/b})()')
        check('équipement de froid : +15 % d\'attaque dans le Grand Nord',abs(r-1.15)<.01,r)
        # apprivoisement
        await ev('S.essence=100;fight=null;startBattle({mode:"far",n:3});fight.wave=0;const e=fight.enemies[0];e.boss=false;e.hp=Math.round(e.max*.1);renderBattle()')
        check('bête du Grand Nord affaiblie : purifiable en mammifère',['mammoth','smilo','megalo','cbear'].count(await ev('m2TameTarget(fight)'))==1 and await pg.locator('#battleArea .m2tame').count()==1)
        # expédition
        check('expédition vers le Grand Nord',await ev('XZ.some(z=>z.k==="nord")'))
        # bestiaire
        await ev('fight=null;farFoes().forEach(k=>S.foes[k]=1);go("far")');t0=await ev('S.tickets')
        await pg.click('#far .fz2 button:has-text("100 %")');await pg.wait_for_timeout(50)
        check('vrai clic : bestiaire du Grand Nord complet (+6 tickets)',await ev('S.tickets')==t0+6 and await ev('S.far.x.cx[100]')==1)
        await ev('setPref("sound",true);setPref("music",true);go("far")');check('ambiance de vent dans le Grand Nord',await ev('window.__amb')==1)
        await ev('go("home")');check('ambiance coupée ailleurs',await ev('window.__amb')==0)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
