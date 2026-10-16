"""Combat III (0.30) : duos d'ennemis (deux attaquants, cible au clic gauche ou droit sans perdre son tour, vague suivante
quand les deux tombent), grand plateau 4×4 (Cauchemar, Grand Nord, Tour 30+) avec boost ramené à un plateau de 9."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
TEAM='S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:40,xp:0}));S.stage=60;S.nm={stage:20,stars:{},shards:0};S.far={stage:10,stars:{},lore:{},starCl:0};S.tower=S.tower||{};ens();'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};'+TEAM+'go("battle")')
        # ---- duo
        r=await ev('(()=>{let n=0;for(let i=0;i<300;i++){fight=null;startBattle({mode:"story",n:25});if(fight.duo)n++}return n})()')
        check('duo dans environ 30 % des combats d\'histoire dès le niveau 20',50<r<130,r)
        r=await ev('(()=>{for(let i=0;i<100;i++){fight=null;startBattle({mode:"story",n:12});if(fight.duo)return false}return true})()')
        check('pas de duo avant le niveau 20',r)
        await ev('C4.duoP=1;fight=null;startBattle({mode:"story",n:25});C4.duoP=.3')
        r=await ev('(()=>{const f=fight,a=f.enemies[0],b=f.enemies[1];return [f.duo,a.max,b.max]})()')
        await ev('(()=>{C4.duoP=0;fight=null;startBattle({mode:"story",n:25});window.__m=fight.enemies[0].max;C4.duoP=1;fight=null;startBattle({mode:"story",n:25});C4.duoP=.3})()')
        check('duo : PV des deux ennemis ×0,9',abs(await ev('fight.enemies[0].max/window.__m')-0.9)<.02)
        check('second ennemi affiché sur la scène',await ev('!!document.querySelector("#battleArea .sEnemy2")'))
        t0=await ev('fight.turn')
        await pg.click('#battleArea .sEnemy2');await pg.wait_for_timeout(50)
        check('viser l\'autre ennemi (vrai clic), sans perdre son tour',await ev('fight.wave')==1 and await ev('fight.turn')==t0)
        await pg.click('#battleArea .sEnemy2',button='right');await pg.wait_for_timeout(50)
        check('clic droit : viser aussi',await ev('fight.wave')==0)
        r=await ev('''(()=>{const f=fight,r0=Math.random;Math.random=()=>0;f.enemies.forEach(e=>{e.tr="";e.sh=0;e.rage=0});f.hp=f.mx.slice();f.stun=0;f.turn=1;let n=0;const _h=hitDino;hitDino=function(k,b,e){n++;return _h(k,b,e)};enemyTurn();hitDino=_h;Math.random=r0;return n})()''')
        check('les deux ennemis du duo attaquent',r==2,r)
        r=await ev('''(()=>{const f=fight;f.wave=1;const e=f.enemies[1];e.hp=1;e.sh=0;f.orbs=Array(9).fill("goldorb");f.stun=9;tapOrb(0);return [f.wave,f.enemies[1].hp>0,f.enemies[0].hp>0,!!document.querySelector("#battleArea .sEnemy2")]})()''')
        check('un ennemi du duo tombe : on combat le survivant, pas encore la dernière vague',r[0]==1 and r[1] and not r[2] and not r[3],r)
        r=await ev('''(()=>{const f=fight;const e=f.enemies[1];e.hp=1;e.sh=0;f.orbs=Array(9).fill("goldorb");f.stun=9;tapOrb(0);return f.wave})()''')
        check('le second tombe : dernière vague',r==2,r)
        # ---- grand plateau
        await ev('fight=null;startBattle({mode:"nightmare",n:1})');await pg.wait_for_timeout(100)
        check('Cauchemar : plateau de 16 orbes',await ev('fight.big4')==1 and await ev('document.querySelectorAll("#battleArea .orbboard.n4 .orb").length')==16)
        r=await ev('(()=>{const f=fight;f.orbs.length=0;for(let i=0;i<16;i++)f.orbs.push(i<8?"redorb":"blueorb");return [f.orbs.filter(x=>x==="redorb").length,Array.prototype.filter.call(f.orbs,x=>x==="redorb").length]})()')
        check('boost : 8 orbes de même couleur sur 16 comptent comme 5 sur 9',r==[5,8],r)
        await ev('fight.stun=9;renderBattle()');await pg.locator('#battleArea .orbboard .orb').nth(15).click();await pg.wait_for_timeout(50)
        r=await ev('[fight.orbs.length,fight.turn,fight.log]');check('toucher la 16e orbe (vrai clic) : le plateau reste à 16',r[0]==16 and r[2].startswith('Orbe'),r)
        await ev('fight=null;startBattle({mode:"story",n:5})')
        check('histoire : plateau de 9',not await ev('fight.big4') and await ev('document.querySelectorAll("#battleArea .orbboard .orb").length')==9)
        await ev('fight=null;startBattle({mode:"far",n:1})');check('Grand Nord : plateau de 16',await ev('fight.big4')==1)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
