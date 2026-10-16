"""Boss (0.32) : mécanique par zone (lianes, rune, éruption, saisie), parties à viser (vrai clic, brisées : effets), décor
par phase, répliques, boss corrompus du Cauchemar (deux mécaniques), entrée en scène."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BOSS='(n)=>{fight=null;startBattle({mode:"story",n});const f=fight;f.wave=2;f.turn=0;f.stun=0;f.ter="";f.item=null;const e=f.enemies[2];e.tr="";e.sh=0;e.st={};renderBattle();return f.bm||[]}'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:45,xp:0}));S.stage=99;S.nm={stage:40,stars:{},shards:0};ens();C4.duoP=0;go("battle")')
        r={n:await ev(BOSS,n) for n in (10,30,60,90)}
        check('une mécanique par zone : jungle, ruines, volcan, obélisque',r=={10:['lianes'],30:['rune'],60:['eruption'],90:['saisie']},r)
        check('pas de mécanique hors boss',await ev('(fight=null,startBattle({mode:"story",n:12}),fight.wave=2,renderBattle(),!(fight.bm&&fight.bm.length))'))
        # ---- lianes
        await ev(BOSS,10);await ev('(()=>{const f=fight;f.turn=1;f.stun=0;enemyTurn();f.orbs=["redorb","blueorb","greenorb","redorb","blueorb","purpleorb","redorb","blueorb","purpleorb"];f.locked=[0,1,3];renderBattle()})()')
        check('lianes : orbes enlacées affichées',await ev('document.querySelectorAll("#battleArea .orbboard .orb.locked").length')==3)
        t0=await ev('fight.turn');await pg.locator('#battleArea .orbboard .orb').nth(0).click();await pg.wait_for_timeout(50)
        check('une orbe enlacée : arrachée, tour perdu sans dégâts (vrai clic)',await ev('fight.turn')==t0+1 and 'arraches' in await ev('fight.log') and await ev('fight.locked.length')==2)
        await ev('(()=>{const f=fight;f.orbs[2]="greenorb";f.locked=f.locked||[1,3];f.stun=9;renderBattle()})()')
        await pg.locator('#battleArea .orbboard .orb').nth(2).click();await pg.wait_for_timeout(50)
        check('une orbe verte libère les lianes',await ev('fight.locked')==None and 'libérées' in await ev('fight.log'))
        # ---- rune
        await ev(BOSS,30)
        r=await ev('''(()=>{const f=fight,e=f.enemies[2];e.hp=e.max=1e7;e.p1=e.p2=1;f.rune="redorb";const hit=c=>{e.hp=e.max;f.orbs=Array(9).fill(c);f.combo=0;f.last=null;f.stun=9;tapOrb(0);return e.max-e.hp};const r0=Math.random;Math.random=()=>.99;const a=hit("redorb"),b=hit("blueorb");Math.random=r0;return [a,b,orbPreview("blueorb")>0]})()''')
        check('rune : les autres couleurs frappent ×0,6 (et l\'estimation le montre)',r[1]<r[0]*.75 and r[2],r)
        # ---- éruption
        await ev(BOSS,60)
        r=await ev('(()=>{const f=fight;f.hp=f.mx.slice();f.turn=2;f.stun=0;const _h=hitDino;hitDino=function(){};enemyTurn();hitDino=_h;return f.mx.map((m,k)=>Math.round((m-f.hp[k])/m*100))})()')
        check('éruption : −6 % de PV pour toute l\'équipe',all(x==6 for x in r),r)
        # ---- saisie
        await ev(BOSS,90)
        r=await ev('(()=>{const f=fight;f.turn=3;f.stun=0;enemyTurn();const g=f.grab;return g?[g.k,g.need,g.col]:null})()')
        check('saisie : un dino est pris',r is not None and r[1]==2,r)
        k=r[0] if r else 0
        await ev(f'(()=>{{const f=fight;f.cd[{k}]=0;useSkill({k})}})()')
        check('dino saisi : pas de compétence','saisi' in await ev('fight.log'))
        r=await ev('(()=>{const f=fight,c=f.grab.col;for(let i=0;i<2;i++){f.orbs=Array(9).fill(c);f.stun=9;tapOrb(0)}return [f.grab,/libéré/.test(f.log)]})()')
        check('2 orbes de l\'élément qui bat le boss le libèrent',r[0] is None and r[1],r)
        # ---- parties
        await ev(BOSS,40)
        await pg.click('#battleArea .bmpart >> nth=0');await pg.wait_for_timeout(50)
        check('viser la Mâchoire (vrai clic)',await ev('fight.part')=='jaw')
        r=await ev('''(()=>{const f=fight,e=f.enemies[2],a0=e.atk;f.parts.jaw.hp=1;f.orbs=Array(9).fill("goldorb");f.stun=9;const h=e.hp;tapOrb(0);return [f.parts.jaw.hp,e.atk/a0,h>e.hp,f.part]})()''')
        check('Mâchoire brisée : ATQ −20 %, les dégâts comptent pour le boss',r[0]==0 and abs(r[1]-.8)<.01 and r[2] and r[3] is None,r)
        r=await ev('''(()=>{const f=fight,e=f.enemies[2];f.parts.tail.hp=0;f.hp=f.mx.slice();f.turn=3;f.stun=0;let n=0;const _h=hitDino;hitDino=function(k,b,x){n++;return _h(k,b,x)};enemyTurn();hitDino=_h;return [n,e.boss]})()''')
        check('Queue brisée : plus d\'attaque de zone (un seul dino touché), le boss reste boss',r==[1,True],r)
        # ---- phases, répliques, corrompus
        await ev(BOSS,10);await ev('(()=>{const e=fight.enemies[2];e.p1=1;renderBattle()})()')
        check('phase 2 : décor changé',await ev('document.querySelector("#battleArea .battlestage").classList.contains("bph2")'))
        await ev('(()=>{const e=fight.enemies[2];e.p2=1;renderBattle()})()')
        check('phase 3 : décor changé',await ev('document.querySelector("#battleArea .battlestage").classList.contains("bph3")'))
        check('réplique du boss',await ev('!!fight.bline'))
        await ev('fight=null;startBattle({mode:"nightmare",n:10});fight.wave=2;renderBattle()')
        r=await ev('[fight.bm,fight.enemies[2].corr]');check('Cauchemar : boss corrompu à deux mécaniques',len(r[0])==2 and r[1]==1,r)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
