"""Maîtrise (0.31) : niveaux de compétence (dégâts, recharge), 2e compétence à l'éveil ★★★ (choix par vrai clic, bouton en
combat, touche Q, recharge propre), ouverture du chef par famille, terrain natal, paliers de passif, fiche « comment le jouer »."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
TEAM='(o)=>{S.team=[{id:1,type:o.t||"rex",level:o.l||30,xp:0,star:o.s||0,skx:o.x||0,sk2:o.k||undefined},{id:2,type:"giga",level:30,xp:0},{id:3,type:"raptor",level:30,xp:0}];S.stage=40;ens();fight=null;startBattle({mode:"story",n:o.n||12});const f=fight;f.enemies.forEach(e=>{e.tr="";e.sh=0;e.hp=e.max=1e7;e.st={};e.rage=0});f.stun=9;f.dots=[];return true}'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};ens();go("battle")')
        # ---- niveaux de compétence
        check('niveaux : 1 à 5 selon les utilisations (0/10/30/60/100)',await ev('[0,9,10,30,59,60,100,500].map(n=>msLv({skx:n})).join()')=='1,1,2,3,3,4,5,5')
        dm=[]
        for x in (0,100):
            await ev(TEAM,{'x':x,'n':5})
            dm.append(await ev('(()=>{const f=fight,e=f.enemies[f.wave];f.cd=[0,0,0];const h=e.hp;useSkill(0);return [h-e.hp,f.cd[0],S.team[0].skx]})()'))
        check('niveau 5 : +20 % de dégâts et recharge −1',abs(dm[1][0]/dm[0][0]-1.2)<.05 and dm[1][1]==dm[0][1]-1,dm)
        check('chaque utilisation compte',dm[0][2]==1 and dm[1][2]==101,dm)
        # ---- 2e compétence
        await ev(TEAM,{'s':2});await ev('go("team")');await pg.wait_for_timeout(100)
        check('pas de 2e compétence avant ★★★',await ev('!document.querySelector("#collection button[onclick^=\'msPick2(1)\']")'))
        await ev('S.team[0].star=3;render()');await pg.wait_for_timeout(100)
        await pg.click('#collection button[onclick^="msPick2(1)"]');await pg.wait_for_timeout(100)
        opts=await ev('[...document.querySelectorAll("#modalBody .nprow")].length')
        await pg.click('#modalBody .nprow:has-text("Rugissement")');await pg.wait_for_timeout(100)
        check('★★★ : 2e compétence choisie (vrai clic) parmi celles de la famille',opts>=3 and await ev('S.team[0].sk2')=='roar',opts)
        await ev('fight=null;startBattle({mode:"story",n:12});fight.stun=9;fight.cd=[0,0,0];go("battle")');await pg.wait_for_timeout(100)
        check('bouton de 2e compétence en combat',await ev('!!document.querySelector("#battleArea button.skbtn2")'))
        await pg.click('#battleArea button.skbtn2');await pg.wait_for_timeout(50)
        r=await ev('[fight.buff.atk,fight.cd2[0],fight.cd[0],S.team[0].skx||0,SPEC.rex.sk]')
        check('2e compétence (vrai clic) : effet, recharge propre, la 1re reste prête, pas comptée dans la maîtrise',r[0]>0 and r[1]>0 and r[2]==0 and r[3]==0 and r[4]!='roar',r)
        await ev('fight.cd2=[0,0,0];fight.buff.atk=0;renderBattle()');await pg.keyboard.press('q')
        check('touche Q : 2e compétence du 1er dino',await ev('fight.buff.atk')>0)
        await ev('(()=>{const f=fight;f.orbs=Array(9).fill("goldorb");f.stun=9;const c=f.cd2[0];tapOrb(0);window.__c2=[c,f.cd2[0]]})()')
        c=await ev('window.__c2');check('la recharge de la 2e compétence baisse à chaque tour',c[1]==c[0]-1,c)
        # ---- ouverture du chef
        r=await ev('''(()=>{const o={};for(const [fam,t] of Object.entries({T:"rex",C:"proto",A:"nodo",F:"rhampho",S:"argento",H:"maia",M:"notho",G:"huayang"})){S.team[0].type=t;fight=null;startBattle({mode:"story",n:5});const f=fight,e=f.enemies[0];
          o[fam]=fam==="T"?f.dots.length>0:fam==="A"?f.buff.shield>=1:fam==="F"?f.sp>=20:fam==="S"?f.stun>=1:fam==="G"?f.thorn>=1:fam==="M"?e.tr==="":fam==="C"?e.sh===0:fam==="H"?f.mx[1]>Math.round(stats(S.team[1]).hp):null}S.team[0].type="rex";return o})()''')
        check('ouverture du chef : un effet par famille',all(r.values()),r)
        check('ouverture annoncée',await ev('(fight=null,startBattle({mode:"story",n:5}),/Ouverture du chef/.test(fight.log))'))
        # ---- terrain natal
        r=await ev('''(()=>{S.team[0].type="maia";fight=null;startBattle({mode:"story",n:3});const f=fight;f.zone="Niv. 3 · Jungle";const a=atkOf(0);f.zone="Niv. 33 · Volcan";const b=atkOf(0);S.team[0].type="rex";return [a,b,sp({type:"maia"}).element]})()''')
        check('terrain natal : +10 % d\'attaque (dino vert dans la jungle)',abs(r[0]/r[1]-1.1)<.01,r)
        # ---- paliers de passif
        r=await ev('(()=>{const s=l=>stats({id:99,type:"rex",level:l,xp:0});const a=s(19),b=s(20),c=s(39),d=s(40),e=s(59),g=s(60);return [b.hp/a.hp,d.atk/c.atk,g.hp/e.hp,g.atk/e.atk]})()')
        check('paliers 20/40/60 : +3 % PV, +3 % ATQ, +4 % PV et ATQ',r[0]>1.03 and r[1]>1.03 and r[2]>1.04 and r[3]>1.04,r)
        # ---- comment le jouer
        await ev('go("team")');await pg.wait_for_timeout(100)
        await pg.locator('#collection button:has-text("COMMENT LE JOUER")').first.click();await pg.wait_for_timeout(100)
        t=await ev('document.getElementById("modalBody").innerText')
        check('fiche « comment le jouer » (vrai clic) : rôle, orbes, compétence, chef','Rôle' in t and 'Orbes' in t and 'Compétence' in t and 'Comme chef' in t,t[:200])
        await ev('closeModal();save()');await pg.reload();await pg.wait_for_timeout(400)
        check('maîtrise et 2e compétence conservées',await ev('S.team[0].sk2')=='roar' and await ev('(S.team[0].skx||0)')>=0)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
