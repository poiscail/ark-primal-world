"""Épreuves de la meute (0.23) : verrou, écran (18 épreuves, 4 groupes), conformité de l'équipe, « Former l'équipe » et
« Rétablir mon équipe » (vrais clics), paliers successifs, récompenses de première victoire, ennemis de l'élément qui bat
l'équipe, règles (sans super, sans compétences, nombre d'actions limité), succès, sauvegarde."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
SETUP='S.team=["rex","giga","raptor","trike","parasau","maia","mosa","stego","ptera"].map((t,i)=>({id:i+1,type:t,level:30,xp:0,star:1}));S.nextId=20;S.stage=%d;S.level=10;S.items=[];S.tut={off:true,seen:{}};S.trial=null;ens();save();go("trials")'
WIN='''()=>{let g=0;while(fight&&!fight.over&&g++<20){const e=fight.enemies[fight.wave];e.hp=1;e.sh=0;tapOrb(0)}return fight.over}'''
card=lambda n:'#trials .trc:has-text("%s")'%n
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false')
        await ev(SETUP%5);check('verrouillé avant le niveau 10',await ev('document.getElementById("trials").innerText.includes("verrouillées")'))
        await ev('startBattle({mode:"trial",id:"rule_sp",t:0})');check('pas de combat avant le niveau 10',await ev('!fight||fight.o.mode!=="trial"'))
        await ev(SETUP%40);await ev('go("story")');await pg.click('#subnav button:has-text("Épreuves")');await pg.wait_for_timeout(150)
        check('onglet Aventure > Épreuves (vrai clic)',await ev('screen')=='trials')
        check('18 épreuves en 4 groupes',await ev('document.querySelectorAll("#trials .trc").length')==18 and await ev('document.querySelectorAll("#trials .sectionhead").length')==4)
        # ---- conformité et formation de l'équipe
        TRC='[...document.querySelectorAll("#trials .trc")].find(c=>c.querySelector("b").textContent==="%s")'
        check('équipe de théropodes conforme (Meute)',await ev('!!%s.querySelector(".ok")'%(TRC%"Meute des théropodes")))
        check('épreuve non conforme : paliers désactivés',await ev('[...%s.querySelectorAll(".trbtns button")].every(b=>b.disabled)'%(TRC%"Les humbles")))
        await ev('startBattle({mode:"trial",id:"rar_c",t:0})');check('équipe non conforme : combat refusé',await ev('!fight||fight.o.mode!=="trial"'))
        t0=await ev('S.team.slice(0,3).map(d=>d.id)')
        await pg.locator(card("Les humbles")+' button.trform').click();await pg.wait_for_timeout(100)
        team=await ev('S.team.slice(0,3).map(d=>sp(d).r)')
        check('« Former l\'équipe » (vrai clic) : 3 communs en tête',team==['Commun']*3,team)
        check('ancienne équipe mémorisée',await ev('S.trial.prev')==t0)
        # ---- palier bronze puis argent
        await pg.locator(card("Les humbles")+' .trbtns button:has-text("BRONZE")').click();await pg.wait_for_timeout(100)
        f=await ev('fight&&{mode:fight.o.mode,t:fight.o.t,zone:fight.zone,boss:fight.enemies[2].boss}')
        check('palier bronze lancé (vrai clic) : 3 ennemis, gardien à la fin',f and f['mode']=='trial' and f['t']==0 and f['boss'],f)
        check('palier argent verrouillé avant le bronze',await ev('(()=>{const f0=fight;startBattle({mode:"trial",id:"rar_c",t:1});return fight===f0})()'))
        await ev('go("battle")');tk=await ev('S.tickets');es=await ev('S.essence');await ev(WIN)
        check('bronze réussi : 1 ticket et 15 essences',await ev('S.trial.done.rar_c')==0 and await ev('S.tickets')==tk+1 and await ev('S.essence')>=es+15)
        check('bouton « palier argent » après la victoire',await ev('!!document.querySelector("#battleArea button[onclick*=\'t:1\']")'))
        tk=await ev('S.tickets');await ev('fight=null;startBattle({mode:"trial",id:"rar_c",t:0})');await ev(WIN)
        check('rejouer un palier déjà réussi : pas de nouvelle récompense',await ev('S.tickets')==tk)
        await ev('fight=null;startBattle({mode:"trial",id:"rar_c",t:1})');check('palier argent lancé',await ev('fight.o.t')==1 and await ev('fight.n')==45)
        await ev(WIN);check('argent réussi',await ev('S.trial.done.rar_c')==1)
        # ---- éléments : l'ennemi a l'élément qui bat l'équipe
        await ev('go("trials")');await pg.locator(card("Marée")+' button.trform').click();await pg.wait_for_timeout(100)
        await ev('fight=null;startBattle({mode:"trial",id:"el_blueorb",t:0})')
        check('Marée : ennemis 🌿 (l\'élément qui bat 💧)',await ev('fight.enemies.every(e=>e.el==="greenorb")'))
        # ---- règles
        await ev('fight=null;startBattle({mode:"trial",id:"rule_sp",t:0})');await ev('fight.sp=100;renderBattle()')
        check('sans super : jauge bloquée, bouton désactivé',await ev('fight.sp')==0 and await ev('[...document.querySelectorAll("#battleArea button")].find(x=>/SUPER/.test(x.textContent)).disabled'))
        await ev('fight=null;startBattle({mode:"trial",id:"rule_sk",t:0})');cd=await ev('fight.cd.slice()');await ev('useSkill(0)')
        check('sans compétences : compétences bloquées',all(c>=90 for c in cd) and await ev('fight.cd[0]')>=90 and await ev('document.querySelector("#battleArea .skbtn small").textContent')=='🚫')
        await ev('fight=null;startBattle({mode:"trial",id:"rule_t",t:0})')
        check('contre la montre : compteur d\'actions dans le HUD',await ev('document.querySelector("#battleArea .trchip").textContent.includes("12 actions")'))
        await ev('fight.enemies.forEach(e=>{e.hp=e.max=9999999});for(let i=0;i<12&&!fight.over;i++)tapOrb(0)')
        check('contre la montre : défaite à la 12e action',await ev('fight.over')=='lose' and await ev('fight.trAct')==12)
        await ev('fight=null;S.trial.done.rule_t=1;startBattle({mode:"trial",id:"rule_t",t:2})');check('palier or : 20 actions permises',await ev('trLimit(fight)')==20)
        # ---- rétablir l'équipe
        await ev('fight=null;go("trials")');await pg.click('#trials .trtop button:has-text("RÉTABLIR")');await pg.wait_for_timeout(100)
        check('« Rétablir mon équipe » (vrai clic)',await ev('S.team.slice(0,3).map(d=>d.id)')==t0 and await ev('S.trial.prev')==None)
        # ---- médailles, succès, sauvegarde
        check('médailles comptées',await ev('trMedals()')==await ev('Object.values(S.trial.done).reduce((a,b)=>a+b+1,0)'))
        await ev('"TCAGFSHM".split("").forEach(k=>S.trial.done["fam_"+k]=1)');check('succès « Toutes familles » atteignable',await ev('ACH.find(a=>a[0]==="tr2")[3]()')==8)
        await ev('save()');await pg.reload();await pg.wait_for_timeout(400)
        check('progression conservée après rechargement',await ev('S.trial.done.rar_c')==1)
        await ev('setPref("anim",false);go("trials")')
        check('pas de défilement horizontal',await ev('document.documentElement.scrollWidth<=innerWidth+1'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
