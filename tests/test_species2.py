"""La grande migration (0.24) : 26 espèces (portraits, images uniques, statistiques dans les fourchettes de leur rareté),
7 chaînes d'évolution, 8 compétences (effets et dégâts), 6 attributs passifs, talismans, compétences ennemies en Arène,
auto-combat, bestiaire, évolution réelle, invocation."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
def team(types):return 'S.team=%s.map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.nextId=50;S.stage=40;S.level=10;S.gear=0;S.items=[];S.tut={off:true,seen:{}};ens();render()'%str(types).replace("'",'"')
FIGHT='if(typeof F2!=="undefined"){F2.newP=F2.goldP=F2.callP=0}fight=null;startBattle({mode:"story",n:5});fight.enemies.forEach(e=>{e.tr="";e.sh=0;e.hp=e.max=999999});fight.cd=[0,0,0];fight.stun=0;renderBattle()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false')
        # ---- espèces
        check('100 espèces',await ev('Object.keys(SPEC).length')==100)
        check('images toutes différentes',await ev('(()=>{const s=new Set(Object.values(SPEC).map(x=>x.e));return s.size===Object.keys(SPEC).length})()'))
        check('portraits SVG pour les 26 nouvelles',await ev('NEWSP2.every(a=>/<svg/.test(portrait(a[0])))'))
        bad=await ev('''(()=>{const R={"Commun":[74,125,14,21],"Rare":[90,175,19,31],"Épique":[168,225,30,41],"Légendaire":[205,295,36,50]};return NEWSP2.filter(a=>{const r=R[a[3]];return !r||a[5]<r[0]||a[5]>r[1]||a[6]<r[2]||a[6]>r[3]}).map(a=>a[0])})()''')
        check('statistiques dans les fourchettes de leur rareté',bad==[],bad)
        check('familles complétées (≥ 4 espèces chacune)',await ev('(()=>{const n={};Object.keys(SPEC).forEach(k=>{const f=(PORT[k]||["T"])[0];n[f]=(n[f]||0)+1});return Object.values(n).every(v=>v>=4)})()'))
        ch=await ev('''(()=>{const RO=["Commun","Rare","Épique","Légendaire"];return Object.entries(EVO).filter(([a,b])=>!SPEC[a]||!SPEC[b]||RO.indexOf(SPEC[b].r)<=RO.indexOf(SPEC[a].r)).map(x=>x.join(">"))})()''')
        check('chaînes d\'évolution valides (rareté croissante)',ch==[],ch)
        check('7 nouvelles chaînes (37 évolutions au total)',await ev('Object.keys(EVO).length')==37)
        # ---- compétences
        await ev(team(['hatzeg','rhampho','majunga']))  # multi, multi, quake
        await ev(FIGHT);a=await ev('(()=>{const e=fight.enemies[fight.wave];e.el="purpleorb";return atkOf(0)})()');h0=await ev('fight.enemies[fight.wave].hp')
        await ev('useSkill(0)');d=h0-await ev('fight.enemies[fight.wave].hp')
        check('Ruée frénétique : 2,7× l\'attaque',abs(d-round(a*2.7))<=2,(d,a))
        check('compétence : recharge et compteur',await ev('fight.cd[0]')>0 and await ev('S.cnt.skills')>=1)
        await ev('Math.random=()=>0.1;useSkill(2)');check('Piétinement : étourdit (une chance sur deux)',await ev('fight.stun')>=1)
        await ev('location.reload()');await pg.wait_for_timeout(300);await pg.wait_for_function('typeof setPref==="function"&&typeof F2!=="undefined"&&document.readyState!=="loading"');await ev('setPref("anim",false);setPref("lore",false);WX_ON=false')
        await ev(team(['kosmo','proto','nodo']))  # pierce, fortify, fortify
        await ev(FIGHT);await ev('(()=>{const e=fight.enemies[fight.wave];e.sh=5000;e.el="purpleorb"})()');a=await ev('atkOf(0)');h0=await ev('fight.enemies[fight.wave].hp')
        await ev('useSkill(0)');d=h0-await ev('fight.enemies[fight.wave].hp')
        check('Coup perforant : brise le bouclier, 2× l\'attaque sans absorption',await ev('fight.enemies[fight.wave].sh')==0 and abs(d-round(a*2))<=2,(d,a))
        await ev('useSkill(1)');check('Ancrage : le lanceur attire les attaques',await ev('fight.taunt.k')==1 and await ev('[0,1,2,3,4,5].every(()=>pickTarget()===1)'))
        HIT='(()=>{fight.hp[%d]=fight.mx[%d];const b=fight.hp[%d];hitDino(%d,%d,fight.enemies[fight.wave]);return b-fight.hp[%d]})()'
        d1=await ev(HIT%(1,1,1,1,300,1));await ev('fight.taunt=null');d0=await ev(HIT%(1,1,1,1,300,1))
        check('Ancrage : −60 % de dégâts pour le lanceur',d1<d0*.6,(d1,d0))
        await ev(team(['miragaia','diplo','tapejara']))  # weaken, revive, convert
        await ev(FIGHT);await ev('useSkill(0)');check('Hurlement de terreur : ennemi affaibli 3 tours',await ev('fight.ewk')==3)
        HIT='(()=>{fight.hp[%d]=fight.mx[%d];const b=fight.hp[%d];hitDino(%d,%d,fight.enemies[fight.wave]);return b-fight.hp[%d]})()'
        d1=await ev(HIT%(2,2,2,2,300,2));await ev('fight.ewk=0');d0=await ev(HIT%(2,2,2,2,300,2))
        check('Hurlement : l\'ennemi frappe moins fort',d1<d0*.75,(d1,d0))
        await ev('fight.ewk=3;fight.stun=0;enemyTurn()');check('Hurlement : la durée diminue à chaque tour ennemi',await ev('fight.ewk')==2)
        await ev('fight.hp[2]=0;useSkill(1)');r=await ev('fight.hp[2]/fight.mx[2]')
        check('Cri de ralliement : ranime un dino KO à 40 %',abs(r-.4)<.02,r)
        await ev('fight.cd[1]=0;fight.hp=fight.hp.map((h,k)=>Math.round(fight.mx[k]*.5));useSkill(1)');r=await ev('fight.hp[0]/fight.mx[0]')
        check('Cri de ralliement : sinon soigne l\'équipe de 20 %',abs(r-.7)<.02,r)
        await ev('fight.orbs=["redorb","redorb","redorb","redorb","redorb","redorb","greenorb","blueorb","purpleorb"];useSkill(2)')
        check('Éclat élémentaire : 4 orbes ☀️',await ev('fight.orbs.filter(c=>c==="goldorb").length')==4)
        await ev(team(['edmonto','yuty','lambeo']))  # rally, rally, revive ; pack x3 (H, T, H)
        await ev(FIGHT);a0=await ev('atkOf(0)');sp0=await ev('fight.sp');await ev('useSkill(0)')
        check('Danse de guerre : +20 % ATQ et +25 % de super',abs(await ev('atkOf(0)')/a0-1.2)<.005 and await ev('fight.sp')==min(100,sp0+25) and await ev('fight.rly')==3)
        check('puces d\'état dans le HUD',await ev('[...document.querySelectorAll("#battleArea .nwchip")].some(c=>c.textContent.includes("Danse"))'))
        # ---- passifs
        await ev('fight.rly=0');p0=await ev('atkOf(0)');await ev('fight.hp[2]=0');p1=await ev('atkOf(0)')
        check('Instinct de meute : +6 % par allié vivant de la même famille',abs(p0/p1-1.06/1.0)<.005,(p0,p1))
        await ev(team(['rhampho','hatzeg','tapejara']))  # ambush, ambush, charger
        await ev(FIGHT);a1=await ev('atkOf(0)');await ev('fight.enemies[fight.wave].hp=Math.round(fight.enemies[fight.wave].max*.5)');a0=await ev('atkOf(0)')
        check('Embuscade : +35 % contre un ennemi à plus de 80 % de PV',abs(a1/a0-1.35)<.005,(a1,a0))
        await ev('fight.sp=0;fight.combo=0;fight.last=null');await ev('tapOrb(0)');sp=await ev('fight.sp')
        check('Énergie primordiale : +6 % de super par orbe',sp==15+6,sp)
        await ev(team(['dacentru','lioplo','dread']))  # counter, scavenger, armor
        await ev(FIGHT);await ev('Math.random=()=>0.1');e0=await ev('fight.enemies[fight.wave].hp');await ev('hitDino(0,300,fight.enemies[fight.wave])')
        check('Contre-attaque : riposte',await ev('fight.enemies[fight.wave].hp')<e0)
        HIT='(()=>{fight.hp[%d]=fight.mx[%d];const b=fight.hp[%d];hitDino(%d,%d,fight.enemies[fight.wave]);return b-fight.hp[%d]})()'
        await ev('fight._bigNow=true');d1=await ev(HIT%(2,2,2,2,400,2));await ev('fight._bigNow=false');d0=await ev(HIT%(2,2,2,2,400,2))
        check('Écailles épaisses : −30 % sur les attaques puissantes',d1<d0*.8,(d1,d0))
        await ev('fight.hp[1]=Math.round(fight.mx[1]*.5);const e=fight.enemies[fight.wave];e.hp=1;tapOrb(0)');r=await ev('fight.hp[1]/fight.mx[1]')
        check('Charognard : +15 % de PV quand un ennemi tombe',r>.64,r)
        check('nouveaux attributs disponibles sur les talismans',await ev('["counter","ambush","charger","scavenger"].every(x=>CHARM_PA.includes(x))&&["pack","armor"].every(x=>CHARM_PA_L.includes(x))'))
        # ---- Arène : compétence ennemie adaptée
        await ev('location.reload()');await pg.wait_for_timeout(300);await pg.wait_for_function('typeof setPref==="function"&&typeof F2!=="undefined"&&document.readyState!=="loading"');await ev('setPref("anim",false);setPref("lore",false);WX_ON=false')
        await ev(team(['rex','giga','carnota']))
        await ev('S.arena.left=5;S.arena.opp=[{d:0,n:20,team:"Test",sp:["titano","diplo","krono"]}];arenaFight(0)')
        check('Arène : les compétences nouvelles deviennent des compétences ennemies connues',await ev('fight.enemies.map(e=>esOf(e,fight)).join()')=='shield,heal,cleave')
        # ---- auto-combat avec les nouvelles espèces
        await ev(team(['titano','diplo','yuty']))
        r=await ev('''(()=>{fight=null;startBattle({mode:"story",n:15});let g=0;fight.hp[1]=0;const w=autoWant("revive",fight,fight.enemies[fight.wave],T3());while(fight&&!fight.over&&g++<300)autoPlay();return [w,fight.over]})()''')
        check('auto-combat : ranime un allié KO et termine le combat',r[0] is True and r[1] in ('win','lose'),r)
        # ---- anti-enlisement : l'ennemi s'acharne après 40 actions (perd son trait, +20 % ATQ toutes les 5 actions)
        r=await ev('''(()=>{fight=null;startBattle({mode:"story",n:15});const f=fight,e=f.enemies[f.wave];e.tr="heal";e.hp=e.max*.5;f.stun=0;const a0=e.atk;
          f.turn=39;enemyTurn();const before=!!e.stall;f.turn=40;f.hp=f.mx.slice();enemyTurn();const a1=e.atk;f.turn=41;f.hp=f.mx.slice();enemyTurn();const a2=e.atk;
          f.turn=45;f.hp=f.mx.slice();enemyTurn();renderBattle();return [before,!!e.stall,e.tr,a1/a0,a2/a0,e.atk/a0,!!document.querySelector("#battleArea .nwchip.hot")]})()''')
        check('anti-enlisement : rien avant 40 actions',r[0] is False,r)
        check('anti-enlisement : à 40 actions, l\'ennemi perd son trait et frappe +20 %',r[1] is True and r[2]=='' and abs(r[3]-1.2)<.02,r)
        check('anti-enlisement : +20 % de nouveau 5 actions plus tard (pas avant)',abs(r[4]-1.2)<.02 and abs(r[5]-1.44)<.03,r)
        check('anti-enlisement : puce « Acharné » dans le HUD',r[6] is True,r)
        r=await ev('''(()=>{fight=null;S.stage=99;startBattle({mode:"story",n:60});let g=0;const f=fight;f.enemies.forEach(e=>{e.tr="heal";e.sh=0});
          while(!fight.over&&g++<2000){fight.hp=fight.hp.map((h,i)=>h>0?Math.min(fight.mx[i],h+40):h);tapOrb(g%9)}return [fight.over,g]})()''')
        check('anti-enlisement : un combat impossible à gagner finit quand même',r[0]=='lose' and r[1]<400,r)
        # ---- évolution réelle (vrai clic)
        await ev('S.team=[{id:1,type:"proto",level:15,xp:0,star:1},{id:2,type:"raptor",level:5,xp:0},{id:3,type:"trike",level:5,xp:0}];S.essence=100;S.shards=50;S.mat={bone:50,hide:50,crystal:50,amber:50};save();go("team");subSet("team","up")')
        await pg.wait_for_timeout(150);await pg.locator('#evoBox button:has-text("ÉVOLUER")').first.click()
        check('évolution : Protocératops → Chasmosaure (vrai clic)',await ev('S.team[0].type')=='chasmo')
        # ---- bestiaire et invocation
        await ev('subSet("team","dex")');await pg.wait_for_timeout(150)
        check('bestiaire : 100 entrées',await ev('document.querySelectorAll("#colTools .dx").length')==100)
        check('invocation : les nouvelles légendaires peuvent sortir',await ev('(()=>{const s=new Set();for(let i=0;i<600;i++)s.add(pickType("Légendaire"));return ["wuerho","titano","tropeo","dread","shanto","krono"].every(k=>s.has(k))})()'))
        check('administration : les nouvelles compétences sont proposées',await ev('(()=>{buildAdmin();return document.querySelectorAll("#adminDinos [data-field=\\"sk\\"]")[0].options.length})()')==await ev('Object.keys(SK).length'))
        # ---- chargement : talisman portant un nouvel attribut (déclaré par un module chargé après l'équipement)
        await ev('S.items=[{id:1,s:"c",r:3,lvl:0,n:"Test",pa:"counter"}];S.team=[{id:1,type:"titano",level:5,xp:0,eq:{c:1}},{id:2,type:"raptor",level:5,xp:0},{id:3,type:"trike",level:5,xp:0}];save()')
        await pg.reload();await pg.wait_for_timeout(500);await ev('setPref("anim",false);go("team");subSet("team","bag")')
        check('rechargement avec un talisman à nouvel attribut : sans erreur',errs==[] and await ev('charmPA(S.team[0])')=='counter',errs)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
