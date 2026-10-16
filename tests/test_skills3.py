"""Compétences II (0.32) : 5 nouvelles compétences (effets), maîtrise appliquée, talents (vrais clics, points, plafonds,
réinitialisation, effets), ordre de l'auto-combat, super prismatique, cible de soin au clic sur la scène, mise en scène légendaire."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
TEAM='(o)=>{S.team=[{id:1,type:o.t||"rex",level:o.l||30,xp:0,star:3,sk2:o.k},{id:2,type:o.t2||"giga",level:30,xp:0},{id:3,type:o.t3||"raptor",level:30,xp:0}];S.stage=40;ens();fight=null;startBattle({mode:"story",n:5});const f=fight;f.enemies.forEach(e=>{e.tr="";e.sh=0;e.hp=e.max=1e7;e.st={};e.rage=0});f.stun=9;f.dots=[];f.cd=[0,0,0];f.cd2=[0,0,0];f.ter="";f.item=null;return true}'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};ens();go("battle")')
        # ---- nouvelles compétences (en 2e compétence)
        await ev(TEAM,{'k':'cry'})
        r=await ev('(()=>{const f=fight;f.cd=[0,4,3];useSkill2(0);return f.cd.slice(1)})()');check('Cri de meute : −2 tours aux deux autres',r==[2,1],r)
        await ev(TEAM,{'k':'minion'})
        r=await ev('(()=>{const f=fight,e=f.enemies[f.wave];useSkill2(0);const m=f.minion&&f.minion.dmg;const h=e.hp;f.orbs=Array(9).fill("goldorb");tapOrb(0);return [m,f.minion&&f.minion.t,/petit allié/.test(f.log)]})()')
        check('Appel du petit : un allié frappe 3 tours',r[0]>0 and r[1]==2 and r[2],r)
        await ev(TEAM,{'k':'vamp'})
        r=await ev('(()=>{const f=fight,e=f.enemies[f.wave];f.hp=f.mx.map(m=>Math.round(m*.5));const h0=f.hp.reduce((a,b)=>a+b,0),e0=e.hp;useSkill2(0);return [e0-e.hp,f.hp.reduce((a,b)=>a+b,0)-h0]})()')
        check('Morsure vampirique : dégâts et soin de l\'équipe',r[0]>0 and r[1]>0,r)
        await ev(TEAM,{'k':'defy'})
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave],r0=Math.random;useSkill2(0);const ts=[];for(let i=0;i<20;i++){Math.random=()=>((i*37)%100)/100;ts.push(pickTarget())}Math.random=r0;const e0=e.hp;f.stun=0;f.turn=1;f.hp=f.mx.slice();enemyTurn();return [ts.every(k=>k===0),e0-e.hp,f.defy.t]})()''')
        check('Défi : attire les coups et renvoie 40 %',r[0] and r[1]>0 and r[2]==1,r)
        await ev(TEAM,{'k':'gild'})
        r=await ev('(()=>{const f=fight;f.orbs=["redorb","redorb","blueorb","blueorb","greenorb","purpleorb","purpleorb","purpleorb","goldorb"];f.sp=0;useSkill2(0);return [f.orbs.filter(c=>c==="goldorb").length,f.sp]})()')
        check('Pluie d\'or : la couleur la plus faible devient dorée, +10 % de super',r[0]>1 and r[1]==10,r)
        r=await ev('(()=>{S.team[0].skx=100;const f=fight;f.cd2=[0,0,0];f.cd=[0,0,0];return true})()')
        # ---- talents (vrais clics)
        await ev(TEAM,{'l':45});await ev('go("team")');await pg.wait_for_timeout(100)
        await pg.locator('#collection button:has-text("TALENTS")').first.click();await pg.wait_for_timeout(100)
        for _ in range(3):await pg.locator('#modalBody .s3row').nth(0).locator('button.blue').click();await pg.wait_for_timeout(30)
        await pg.locator('#modalBody .s3row').nth(1).locator('button.blue').click();await pg.wait_for_timeout(30)
        t=await ev('S.team[0].tal');check('talents : 4 points au niveau 45, répartis par vrais clics',t=={'a':3,'d':1,'s':0},t)
        check('pas plus de points que le niveau ne le permet',await ev('[0,1,2].every(i=>document.querySelectorAll("#modalBody .s3row")[i].querySelector("button.blue").disabled)'))
        r=await ev('(()=>{const d=S.team[0],t=d.tal;d.tal=null;const a=stats(d);d.tal=t;const b=stats(d);return [b.atk/a.atk,b.hp/a.hp]})()')
        check('effets : +6 % ATQ (3 rangs), +3 % PV (1 rang)',abs(r[0]-1.06)<.01 and abs(r[1]-1.03)<.01,r)
        await pg.click('#modalBody button:has-text("RÉINITIALISER")');await pg.wait_for_timeout(50)
        check('réinitialisation gratuite',await ev('JSON.stringify(S.team[0].tal)')=='{"a":0,"d":0,"s":0}')
        await ev('S.team[0].tal={a:0,d:0,s:4};closeModal()');await ev(TEAM,{'l':45})
        await ev('S.team[0].tal={a:0,d:0,s:4}')
        r=await ev('(()=>{const f=fight;f.sp=0;f.combo=0;f.last=null;f.orbs=Array(9).fill("goldorb");tapOrb(0);return f.sp})()')
        check('Soutien : +4 % de super par orbe (4 rangs)',r==19,r)
        # ---- ordre de l'auto-combat
        await ev(TEAM,{})
        r=await ev('(()=>{const t=T3();t.forEach(d=>d.auto=undefined);const a=autoSkill();t[a>=0?a:0].auto="off";const b=autoSkill();t.forEach(d=>d.auto=undefined);t[2].auto="first";const c=autoSkill();t.forEach(d=>d.auto=undefined);return [a,b,c]})()')
        check('auto-combat : « jamais » écarte un dino, « en priorité » le fait passer devant',r[1]!=r[0] and r[2]==2,r)
        # ---- super prismatique
        await ev(TEAM,{'t':'rex','t2':'giga','t3':'trike'})
        r=await ev('(()=>{const els=new Set(T3().map(d=>sp(d).element));const f=fight;f.sp=100;special();return [els.size,/Prisme/.test(f.log)]})()')
        check('super prismatique avec 3 éléments différents',(r[0]>=3)==r[1],r)
        # ---- cible de soin
        await ev(TEAM,{'t2':'maia'});await ev('(()=>{const f=fight;f.hp=[Math.round(f.mx[0]*.9),f.mx[1],Math.round(f.mx[2]*.3)];renderBattle()})()')
        await pg.locator('#battleArea .row > .bigicon.s3pick').nth(0).click();await pg.wait_for_timeout(50)
        check('clic sur le portrait d\'un dino : cible de soin',await ev('fight.healT')==0 and await ev('!!document.querySelector("#battleArea .s3heal")'))
        r=await ev('(()=>{const f=fight,h=f.hp.slice();S.team[1].type="maia";const id=SK_of(S.team[1]);const s=SPEC.maia.sk;SPEC.maia.sk="selfheal";f.cd=[0,0,0];useSkill(1);SPEC.maia.sk=s;return [f.hp[0]>h[0],f.hp[2]===h[2]]})()')
        check('Régénération soigne la cible choisie (et pas le plus blessé)',r==[True,True],r)
        # ---- légendaire
        r=await ev('(()=>{const L=[];const o=new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains("lgcut"))L.push(1)})));o.observe(document.getElementById("fxLayer"),{childList:true});setPref("anim",true);const k=Object.keys(SPEC).find(k=>SPEC[k].r==="Légendaire"&&!SPEC[k].ex);S.team[0].type=k;fight.cd=[0,0,0];useSkill(0);setPref("anim",false);return new Promise(r=>setTimeout(()=>{o.disconnect();r(L.length)},50))})()')
        check('compétence légendaire mise en scène',r>=1,r)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
