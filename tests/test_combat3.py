"""Combat II (0.29) : états (Brûlure, Gel, Saignement, Peur) et leurs effets, résistances, faiblesse par créature (cachée puis
révélée), fiche d'ennemi au clic, terrains (Boue, Lave), objets à ramasser (vrai clic, sans perdre son tour), bestiaire."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
START='''(()=>{S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.stage=40;S.foes={};fight=null;startBattle({mode:"story",n:12});const f=fight;f.ter="";f.item=null;
 f.enemies.forEach(e=>{e.tr="";e.sh=0;e.hp=e.max=1e6;e.st={};e.boss=false;e.rage=0});f.stun=0;return true})()'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};ens();go("battle")')
        await ev(START)
        # ---- états (hasard forcé)
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave],r0=Math.random;Math.random=()=>0;const tap=(c,el)=>{e.el=el;e.st={};f.stun=0;f.orbs=Array(9).fill(c);f.combo=0;f.last=null;f.hp=f.mx.slice();tapOrb(0);return JSON.stringify(e.st)+"|"+f.stun};
          const o={burn:tap("redorb","greenorb"),bleed:tap("greenorb","blueorb"),fear:tap("purpleorb","goldorb")};e.el="redorb";e.st={};f.stun=0;f.orbs=Array(9).fill("blueorb");f.combo=0;f.last=null;
          const _et=enemyTurn;let skipped=0;enemyTurn=function(){if(f.stun>0)skipped=1;return _et()};tapOrb(0);enemyTurn=_et;o.frz=skipped;Math.random=r0;return o})()''')
        check('Brûlure : orbe rouge avec avantage',r['burn'].startswith('{"burn":'),r)
        check('Saignement : orbe verte avec avantage',r['bleed'].startswith('{"bleed":'),r)
        check('Peur : orbe violette',r['fear'].startswith('{"fear":'),r)
        check('Gel : l\'ennemi saute son tour',r['frz']==1,r)
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave],r0=Math.random;Math.random=()=>0;e.el="redorb";e.st={};f.orbs=Array(9).fill("greenorb");f.combo=0;f.last=null;tapOrb(0);Math.random=r0;return JSON.stringify(e.st)})()''')
        check('orbe sans avantage : aucun état',r=='{}',r)
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave];e.el="greenorb";e.st={burn:3};e.hp=e.max;f.stun=0;f.turn=1;enemyTurn();return [e.max-e.hp,e.st.burn]})()''')
        check('Brûlure : −3 % des PV par tour, décompte',r[0]==30000 and r[1]==2,r)
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave],r0=Math.random;Math.random=()=>0;const hit=fe=>{e.st={fear:fe};f.hp=f.mx.slice();f.turn=1;f.stun=0;e.rage=0;enemyTurn();return f.mx.reduce((s,m,k)=>s+m-f.hp[k],0)};const a=hit(0),b=hit(2);Math.random=r0;return [a,b]})()''')
        check('Peur : l\'ennemi frappe moins fort',r[1]<r[0]*.85,r)
        # ---- résistances
        r=await ev('(()=>{const e={el:"redorb",e:"🗿",name:"x · Ennemi"};const a=[...c3Res(e)];const b=[...c3Res({el:"blueorb",e:"🐍",name:"x · Ennemi"})];return [a,b]})()')
        check('résistances : élément rouge → brûlure, élément bleu → gel',('burn' in r[0]) and ('frz' in r[1]),r)
        # ---- faiblesse
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave];const w=c3Weak(e),t=T3();const fam=k=>(PORT[t[k].type]||["T"])[0];const a=atkOf(0);const old=t[0].type;
          const sp2=Object.keys(SPEC).find(k=>(PORT[k]||["?"])[0]===w&&!SPEC[k].ex);S.team[0].type=sp2;fight.c3Now=1;const a2=atkOf(0);S.team[0].type=old;return [w,fam(0),!!sp2,a,a2]})()''')
        check('faiblesse : une famille précise par créature',len(r[0])==1 and r[2],r)
        await ev('renderBattle()')
        check('faiblesse cachée tant que la créature n\'a pas été vaincue',await ev('!/\\+25 %/.test(document.querySelector("#battleArea .sHud").textContent)'))
        await pg.click('#battleArea .sEnemy');await pg.wait_for_timeout(100)
        t=await ev('document.getElementById("modalBody").innerText')
        check('fiche d\'ennemi au clic (vrai clic) : faiblesse inconnue, résistances, trait, états','inconnue' in t and 'Résistances' in t and 'Trait' in t,t[:300])
        await ev('closeModal();S.foes[cxKey(fight.enemies[fight.wave],fight)]=1;renderBattle()')
        check('faiblesse révélée après une victoire contre la créature (HUD et fiche)',await ev('/\\+25 %/.test(document.querySelector("#battleArea .sHud").textContent)') and await ev('(c3Sheet(),/\\+25 % de dégâts/.test(document.getElementById("modalBody").textContent))'))
        await ev('closeModal()')
        # ---- terrains
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave];e.el="purpleorb";const hit=t=>{f.ter=t;e.hp=e.max;f.orbs=Array(9).fill("greenorb");f.combo=0;f.last=null;f.stun=9;f.c3boost=0;tapOrb(0);return e.max-e.hp};const r0=Math.random;Math.random=()=>.99;const a=hit(""),b=hit("boue");Math.random=r0;f.ter="";return [a,b]})()''')
        check('Boue : orbes vertes +20 %',abs(r[1]/r[0]-1.2)<.03,r)
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave];f.ter="lave";f.hp=f.mx.slice();e.hp=e.max;e.st={};f.stun=1;enemyTurn();const lost=f.mx.map((m,k)=>m-f.hp[k]);f.ter="";return [e.max-e.hp,lost]})()''')
        check('Lave : tout le monde perd 2 % de ses PV par tour',r[0]==20000 and all(x>0 for x in r[1]),r)
        await ev('fight.ter="glace";renderBattle()')
        check('terrain affiché (puce et décor)',await ev('document.querySelector("#battleArea .battlestage").classList.contains("ter-glace")&&/Sol gelé/.test(document.querySelector("#battleArea .sHud").textContent)'))
        r=await ev('(()=>{let n=0;for(let i=0;i<400;i++){const f={o:{mode:"story"},zone:"Niv. 3 · Jungle",mx:[1]};c3PickTer(f);if(f.ter)n++}return n})()')
        check('terrain dans environ 30 % des combats',60<r<180,r)
        r=await ev('(()=>{const f={o:{mode:"arena"},zone:"Arène",mx:[1]};for(let i=0;i<50;i++){f.terSet=0;c3PickTer(f);if(f.ter)return false}return true})()')
        check('pas de terrain en Arène',r)
        # ---- objets
        await ev('(()=>{const f=fight;f.ter="";f.item={k:"plume",t:3};f.sp=0;f.turn=5;renderBattle()})()');t0=await ev('fight.turn')
        await pg.click('#battleArea .c3item');await pg.wait_for_timeout(50)
        check('objet ramassé (vrai clic) : plume +15 % de super, sans perdre son tour',await ev('fight.sp')==15 and await ev('fight.turn')==t0 and await ev('!fight.item'))
        await ev('(()=>{const f=fight;f.item={k:"eclat",t:3};c3Pick()})()')
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave];e.el="purpleorb";const r0=Math.random;Math.random=()=>.99;const hit=()=>{e.hp=e.max;f.orbs=Array(9).fill("greenorb");f.combo=0;f.last=null;f.stun=9;tapOrb(0);return e.max-e.hp};const a=hit(),b=hit();Math.random=r0;return [a,b]})()''')
        check('éclat : la prochaine orbe frappe ×1,5 (une seule fois)',abs(r[0]/r[1]-1.5)<.05,r)
        await ev('(()=>{const f=fight;f.hp=f.mx.map((m,k)=>k===1?Math.round(m*.3):m);f.item={k:"viande",t:3};c3Pick()})()')
        check('viande : soigne le dino le plus blessé',await ev('fight.hp[1]>Math.round(fight.mx[1]*.3)'))
        await ev('(()=>{const f=fight;f.item={k:"plume",t:1};f.stun=0;f.turn=1;const r0=Math.random;Math.random=()=>.99;enemyTurn();Math.random=r0})()')
        check('un objet disparaît au bout de ses tours',await ev('fight.item')==None)
        # ---- bestiaire
        await ev('S.foes={croc:1};go("achs");cxOpen=true;renderAch()');await pg.wait_for_timeout(100)
        check('bestiaire : faiblesse des créatures vaincues',await ev('document.querySelectorAll("#codexBox .cxw").length')==1)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
