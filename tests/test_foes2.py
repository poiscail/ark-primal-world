"""Ennemis II (0.33) : 10 nouvelles créatures (dessins valides, apparition dans leur zone), ennemis dorés (PV, butin),
meneurs et renforts, traits combinés dès le niveau 80, élites surnommées, récompense à la première victoire par créature."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:50,xp:0}));S.stage=99;S.foes={};ens();C4.duoP=0;go("battle")')
        r=await ev('["arthro","meganeura","quetzal","ammonite","trilobite","eurypt","gorgon","andrew","dunkle","platy"].map(k=>{const s=beastSVG(k,"redorb",false);return s.length>300&&!/NaN|undefined/.test(s)&&!!BNAME[k]&&!!BHOME[k]})')
        check('10 nouvelles créatures dessinées (SVG valides, nom, lieu)',all(r),r)
        r=await ev('(()=>{const seen={};F2.newP=1;for(let i=0;i<40;i++){fight=null;startBattle({mode:"story",n:3+(i%2)});renderBattle();fight.enemies.slice(0,2).forEach(e=>{const L=enemyLook(e,fight);if(L&&L.k)seen[L.k]=1})}F2.newP=.35;return Object.keys(seen)})()')
        check('jungle : les nouvelles créatures apparaissent',all(k in r for k in ('arthro','meganeura','quetzal')),r)
        r=await ev('(()=>{let n=0;for(let i=0;i<200;i++){fight=null;startBattle({mode:"arena",go:true,d:0,n:10,team:"T",sp:["raptor","trike","rex"]});renderBattle();if(fight.enemies.some(e=>FOES2.jungle.includes(e.e)))n++}return n})()')
        check('pas de nouvelles créatures en Arène',r==0,r)
        # dorés
        await ev('F2.goldP=1;fight=null;startBattle({mode:"story",n:12});renderBattle();F2.goldP=.01')
        r=await ev('(()=>{const e=fight.enemies[0];return [e.gold,e.max]})()');await ev('F2.goldP=0;fight=null;startBattle({mode:"story",n:12});renderBattle()');m=await ev('fight.enemies[0].max');await ev('F2.goldP=.01')
        check('ennemi doré : PV ×2,5',r[0]==1 and abs(r[1]/m-2.5)<.05,(r,m))
        await ev('F2.goldP=1;fight=null;startBattle({mode:"story",n:12});renderBattle();F2.goldP=.01')
        st=await ev('[S.stone,S.tickets]')
        await ev('(()=>{const f=fight,e=f.enemies[0];e.hp=1;e.sh=0;e.tr="";f.orbs=Array(9).fill("goldorb");f.stun=9;tapOrb(0)})()')
        st2=await ev('[S.stone,S.tickets]');check('ennemi doré vaincu : +300 pierres, +1 ticket',st2[0]-st[0]>=300 and st2[1]-st[1]>=1,(st,st2))
        check('apparence dorée',await ev('(fight.wave=0,fight.enemies[0].hp=fight.enemies[0].max,fight.enemies[0].gold=1,renderBattle(),document.querySelector("#battleArea .sEnemy").classList.contains("gold"))'))
        # meneurs
        r=await ev('''(()=>{fight=null;startBattle({mode:"story",n:20});const f=fight,e=f.enemies[0];e.caller=1;e.called=0;e.tr="";e.sh=0;e.hp=Math.round(e.max*.4);f.stun=0;f.turn=1;f.hp=f.mx.slice();let n=0;const _h=hitDino;hitDino=function(k,b,x){n++;return _h(k,b,x)};enemyTurn();hitDino=_h;return [f.reinf,n,/renforts/.test(f.log)]})()''')
        check('meneur à mi-vie : renforts (une attaque en plus)',r[0]==2 and r[1]==2 and r[2],r)
        # traits combinés
        r=await ev('(()=>{F2.comboP=1;let ok=0,tot=0;for(let i=0;i<30;i++){fight=null;startBattle({mode:"story",n:85});const f=fight;f.enemies.forEach(e=>{e.f2=0;e.tr=e.boss?"":"venom";e.sh=0});f.f2O=null;renderBattle();f.enemies.forEach(e=>{if(!e.boss){tot++;if(e.tr2==="shield"&&e.sh>0)ok++}})}F2.comboP=.5;return [ok,tot]})()')
        check('dès le niveau 80 : carapace en plus du trait',r[0]==r[1] and r[1]>0,r)
        # élites
        r=await ev('(fight=null,startBattle({mode:"story",n:13}),renderBattle(),fight.enemies[2].elite)')
        check('élite avec surnom',isinstance(r,str) and len(r)>2,r)
        # première victoire
        await ev('S.foes={};fight=null;startBattle({mode:"story",n:5});renderBattle()');es=await ev('S.essence')
        await ev('(()=>{const f=fight,e=f.enemies[0];e.hp=1;e.sh=0;e.tr="";e.gold=0;f.orbs=Array(9).fill("goldorb");f.stun=9;tapOrb(0)})()')
        check('première victoire contre une créature : +10 essence',await ev('S.essence')-es>=10)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
