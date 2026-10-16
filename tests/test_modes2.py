"""Modes (0.34) : écran Modes (vrais clics), Survie (séries enchaînées, PV gardés, record), Sprint (10 combats, chrono, record),
Combats-énigmes (plateau imposé, actions limitées), Miroir (reflet de l'équipe), Sans orbes (orbe = Garde, recharges plus
rapides), Entraînement (compteur), Découverte (10 niveaux), Apprivoisement (purifier un dino corrompu), Revanche (même tirage)."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
KILL='(()=>{const f=fight;f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0);return [f.over,f.wave]})()'
DIE='(()=>{const f=fight;for(let i=0;i<12&&!f.over;i++){f.hp=f.hp.map(h=>h>0?1:0);f.stun=0;f.guard=0;const e=f.enemies[f.wave];e.atk=1e9;e.hp=e.max=1e9;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:20,xp:0}));S.stage=40;ens();delete S.m2;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        await ev('go("modes2")')
        check('écran Modes : 7 modes + 2 mini-jeux',await pg.locator('#modes2 .m2card').count()==9)
        # survie
        await pg.click('#modes2 button[data-m="surv"]');await pg.wait_for_timeout(100)
        check('vrai clic : Survie lancée',await ev('fight.o.mode')=='surv')
        for i in range(2):await ev(KILL)
        await ev('fight.hp[0]=Math.round(fight.mx[0]*.5)');h=await ev('fight.hp[0]')
        r=await ev(KILL)
        check('série franchie : nouvelle série, pas de victoire, PV gardés +10 %',r==[None,0] and await ev('fight.sv')==1 and await ev('fight.hp[0]')==min(await ev('fight.mx[0]'),h+round(await ev('fight.mx[0]')*.1)) and 'Série 2' in await ev('document.querySelector("#battleArea .m2c").textContent'),r)
        s0=await ev('S.stone');r=await ev(DIE)
        check('défaite en Survie : record 1 série, récompense',r=='lose' and await ev('S.m2.svBest')==1 and await ev('S.stone')>s0,[r])
        # sprint
        await ev('fight=null;startBattle({mode:"sprint"});S.m2.sprT0=Date.now()-65000')
        for k in range(10):
            if k:await ev(f'fight=null;startBattle({{mode:"sprint",k:{k}}})')
            for w in range(3):r=await ev(KILL)
        check('sprint : 10 combats, temps enregistré (≈1:05)',await ev('fight.over')=='win' and 64000<=await ev('S.m2.sprBest')<=70000 and 'Sprint terminé' in await ev('fight.report||""'),await ev('S.m2.sprBest'))
        # énigme
        await ev('go("modes2")');await pg.click('#modes2 button[data-m="puzzle"]');await pg.wait_for_timeout(100)
        check('choix des 8 énigmes',await pg.locator('#modalBody .m2puz button').count()==8)
        await pg.locator('#modalBody .m2puz button').nth(0).click();await pg.wait_for_timeout(100)
        r=await ev('[fight.o.mode,fight.wave,fight.orbs.slice(0,3).join(),fight.pzMax]')
        check('vrai clic : énigme 1, plateau imposé, 4 actions',r==['puzzle',2,'redorb,redorb,blueorb',4],r)
        r=await ev('(()=>{const f=fight;f.enemies[2].hp=1e9;f.enemies[2].max=1e9;for(let i=0;i<4&&!f.over;i++){f.stun=9;tapOrb(1)}return [f.over,f.pzAct]})()')
        check('4 actions sans vaincre : défaite',r==['lose',4],r)
        await ev('fight=null;startBattle({mode:"puzzle",p:0})');t0=await ev('S.tickets');r=await ev(KILL)
        check('énigme résolue : +1 ticket la première fois',r[0]=='win' and await ev('S.tickets')==t0+1 and await ev('S.m2.puz[0]')==1)
        # miroir
        await ev('fight=null;startBattle({mode:"mirror"})')
        r=await ev('[fight.enemies.map(e=>e.pt).join(),JSON.stringify(enemyLook(fight.enemies[0],fight))]')
        check('miroir : ton équipe, en version corrompue',r[0]=='rex,giga,raptor' and '"cor":"rex"' in r[1],r)
        # sans orbes
        await ev('fight=null;startBattle({mode:"noorb"})');await ev('fight.cd=[5,5,5];fight.sp=0;fight.stun=0')
        t0=await ev('fight.turn');await pg.locator('#battleArea .orbboard button.orb').nth(0).click();await pg.wait_for_timeout(50)
        r=await ev('[fight.turn,fight.cd.join(),fight.sp]')
        check('sans orbes : toucher une orbe = Garde, recharges −2, super +25',r[0]==t0+1 and r[1]=='3,3,3' and r[2]>=25,r)
        # entraînement
        await ev('go("modes2")');await pg.click('#modes2 button[data-m="train"]');await pg.wait_for_timeout(100)
        await ev('fight.stun=9;tapOrb(0);fight.stun=9;tapOrb(1)')
        r=await ev('[fight.wave,fight.trn.n,fight.trn.d>0,fight.hp.every((h,j)=>h===fight.mx[j])]')
        check('entraînement : mannequin, compteur de dégâts, aucun dégât reçu',r==[2,2,True,True],r)
        # découverte
        await ev('fight=null;startBattle({mode:"short",k:3})');check('découverte : niveau 3 refusé avant le 2',await ev('!fight'))
        await ev('startBattle({mode:"short",k:1})')
        check('découverte : texte du niveau',"Naufragé" in await ev('fight.log'))
        for w in range(3):await ev(KILL)
        check('découverte : niveau 1 franchi',await ev('S.m2.shortSt')==1)
        # apprivoisement
        await ev('fight=null;S.essence=100;startBattle({mode:"story",n:4});fight.wave=2;const e=fight.enemies[2];e.e="🦖";e.boss=false;e.hp=Math.round(e.max*.1);renderBattle()')
        check('dino corrompu affaibli : bouton Purifier',await pg.locator('#battleArea .m2tame').count()==1)
        n0=await ev('S.team.length');await ev('Math._r=Math.random;Math.random=()=>.1')
        await pg.click('#battleArea .m2tame');await ev('Math.random=Math._r')
        r=await ev('[S.team.length,S.essence,S.m2.tame.n,fight.over]')
        check('vrai clic : purifié (−30 essences), il rejoint la meute, combat gagné',r[0]==n0+1 and r[1]<=80 and r[2]==1 and r[3]=='win',r)
        # revanche
        await ev('fight=null;startBattle({mode:"story",n:6})');b0=await ev('fight.orbs.join()')
        await ev('fight.stun=0;tapOrb(0)');b1=await ev('fight.orbs.join()');dd=await ev(DIE)
        check('défaite : bouton Revanche',await pg.locator('#battleArea .m2rev button').count()==1,[dd,await ev('[!!fight.m2Rec,fight.m2Rec&&fight.m2Rec.length,screen]')])
        await pg.click('#battleArea .m2rev button');await pg.wait_for_timeout(100)
        r=await ev('[fight.orbs.join(),fight.m2Rev]')
        await ev('fight.stun=0;tapOrb(0)');b2=await ev('fight.orbs.join()')
        check('vrai clic : même tirage (plateau de départ et après la 1re orbe)',r[0]==b0 and r[1] and b2==b1,[b0,r,b1,b2])
        check('4 succès',await ev('ACH.filter(a=>/^m2/.test(a[0])).length')==4)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
