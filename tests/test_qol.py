"""Équipes enregistrées, sauvegardes automatiques, tutoriel et guide."""
import asyncio,sys,pathlib,json
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
TEAM='S.team=[1,2,3,4,5,6,7].map((i,k)=>({id:i,type:["rex","spino","trike","raptor","giga","mosa","argento"][k],level:10+i,xp:0}));'
WIN='()=>{for(let k=0;k<300&&!fight.over;k++){fight.enemies[fight.wave].hp=1;tapOrb(0)}return fight.over}'
async def fresh(b):
    ctx=await b.new_context(viewport={'width':1280,'height':800});pg=await ctx.new_page();pg.errs=[];pg.on('pageerror',lambda e:pg.errs.append(str(e)))
    pg.on('dialog',lambda d:asyncio.ensure_future(d.accept(pg.promptv if d.type=='prompt' and hasattr(pg,'promptv') else None) if d.type=='prompt' else d.accept()))
    await pg.goto(GAME);await pg.wait_for_timeout(300);return pg
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await fresh(b);ev=pg.evaluate
        # ---------- tutoriel (partie neuve)
        check('tutoriel actif sur une partie neuve',await ev('ens();S.tut.off===false'))
        await ev('go("home")');check('conseil de bienvenue affiché',await ev('!!document.getElementById("tipCard")&&document.getElementById("tipCard").innerText.includes("Bienvenue")'))
        await pg.click('#tipCard button:has-text("PREMIER COMBAT")');await pg.wait_for_timeout(200)
        check('bouton « premier combat » lance le niveau 1',await ev('screen==="battle"&&fight.n===1'))
        await ev('fight.enemies.forEach(e=>{e.tr="";e.sh=0;e.hp=e.max=99999})')  # le combat dure assez pour voir les 3 conseils
        check('conseil orbes en combat',await ev('document.getElementById("tipCard").innerText.includes("orbes")'))
        await ev('tipDone("orbs")');check('conseil non réaffiché',await ev('!document.getElementById("tipCard")'))
        await ev('tapOrb(0)');check('conseil éléments au tour suivant',await ev('!!document.getElementById("tipCard")&&document.getElementById("tipCard").innerText.includes("éléments")'))
        await ev('tipDone("elements");tapOrb(1)');check('conseil compétences ensuite',await ev('!!document.getElementById("tipCard")&&document.getElementById("tipCard").innerText.includes("Compétences")'))
        await ev('tipDone("skills")');await ev(WIN);check('conseil victoire',await ev('!!document.getElementById("tipCard")&&document.getElementById("tipCard").innerText.includes("Victoire")'))
        await ev('tipDone("win");go("team")');check('conseil équipe',await ev('!!document.getElementById("tipCard")'))
        await pg.click('#tipCard button:has-text("PASSER")');check('passer le tutoriel',await ev('S.tut.off===true&&!document.getElementById("tipCard")'))
        await pg.reload();await pg.wait_for_timeout(300);await ev('go("summon")');check('« passer » persiste',await ev('!document.getElementById("tipCard")'))
        await ev('tutReset();go("summon")');check('revoir le tutoriel',await ev('!!document.getElementById("tipCard")'))
        # partie existante : pas de tutoriel
        await ev('localStorage.setItem("arkPrimalMobile",JSON.stringify({...S,tut:undefined,stage:12}));');await pg.reload();await pg.wait_for_timeout(300)
        check('partie existante: tutoriel désactivé',await ev('ens();S.tut.off===true'))
        # guide
        await ev('openSettings()');await ev('openGuide()');check('guide du jeu complet (11 rubriques depuis la 0.13)',await ev('(t=>t.includes("Équipement")&&t.includes("Auto-combat")&&t.includes("Compétences ennemies")&&t.includes("Bestiaires"))(document.getElementById("guideBody").innerText)&&document.querySelectorAll("#guideBody .panel").length===GUIDE.length&&GUIDE.length>=11'))
        await ev('closeGuide();closeSettings()')
        # ---------- équipes enregistrées
        await ev(TEAM+'S.presets=[];save();render()')
        await ev('presetSave()');await pg.fill('#askIn','Ma meute');await pg.click('#modalBody button:has-text("OK")');check('enregistrer une équipe (nom demandé dans une fenêtre du jeu)',await ev('S.presets.length===1&&S.presets[0].n==="Ma meute"&&S.presets[0].ids.join()==="1,2,3"'))
        await ev('S.team=[S.team[3],S.team[4],S.team[5],...S.team.filter((d,i)=>i<3||i>5)];render()')
        await ev('presetSave()');await pg.fill('#askIn','Boss');await pg.press('#askIn','Enter');check('deuxième équipe (validée avec Entrée)',await ev('S.presets.length===2&&S.presets[1].ids.join()==="4,5,6"'))
        await ev('presetRename(1)');await pg.fill('#askIn','Boss final');await pg.click('#modalBody button:has-text("OK")');check('renommer une équipe',await ev('S.presets[1].n==="Boss final"'))
        await ev('presetRename(1)');await pg.click('#modalBody button:has-text("ANNULER")');check('annuler le renommage',await ev('S.presets[1].n==="Boss final"&&document.getElementById("modalVeil").classList.contains("hide")'))
        await ev('presetLoad(0)');check('charger: les 3 premiers sont les bons',await ev('S.team.slice(0,3).map(d=>d.id).join()==="1,2,3"&&S.team.length===7'))
        check('équipe active marquée',await ev('document.getElementById("presetBox").innerText.includes("ACTIVE")'))
        await ev('go("tower")');check('barre d\'équipes visible dans les modes',await ev('!document.getElementById("presetBar").classList.contains("hide")&&document.querySelectorAll("#presetBar button").length===2'))
        await pg.click('#presetBar button:has-text("Boss final")');check('chargement depuis la barre',await ev('S.team.slice(0,3).map(d=>d.id).join()==="4,5,6"'))
        await ev('go("home")');check('barre cachée hors modes',await ev('document.getElementById("presetBar").classList.contains("hide")'))
        await ev('S.team=S.team.filter(d=>d.id!==5);presetLoad(1)');check('dino supprimé: chargement partiel sans plantage',await ev('S.team.length===6&&S.team[0].id===4&&S.team[1].id===6'))
        await ev('S.presets=[1,2,3,4,5].map(i=>({n:"E"+i,ids:[1,2,3]}));presetSave()');check('limite de 5 équipes',await ev('S.presets.length===5'))
        await ev('presetDelete(4)');check('suppression',await ev('S.presets.length===4'))
        await ev('S.presets=[{n:"x",ids:[900,901,902]}];presetLoad(0)');check('équipe entièrement disparue: refus propre',await ev('S.team[0].id===1||S.team[0].id===4'))
        # ---------- sauvegardes automatiques
        await ev('localStorage.removeItem("arkPrimalBackups");bkLast=0;S.stone=111;takeBackup("test",true)');check('copie créée',await ev('bkList().length===1&&bkList()[0].l==="test"'))
        check('pas de copie auto avant 10 min',await ev('(S.stone=222,save(),bkList().length)')==1)
        await ev('bkLast=0;S.stone=333;save()');check('copie auto après 10 min',await ev('bkList().length===2'))
        await ev('for(let i=0;i<9;i++){S.stone=1000+i;takeBackup("auto"+i,true)}');check('maximum 5 copies',await ev('bkList().length===5'))
        await ev('S.stone=999;takeBackup("garde",true)');await ev('for(let i=0;i<6;i++){S.stone=5000+i;takeBackup("auto",true)}');check('les copies manuelles sont gardées plus longtemps que les auto',await ev('bkList().some(b=>b.l==="garde")'))
        await ev('localStorage.removeItem("arkPrimalBackups");bkLast=0;S.stone=4242;takeBackup("avant test",true);S.stone=1')
        at=await ev('bkList()[0].at')
        async with pg.expect_navigation():await ev(f'bkRestore({at})')
        await pg.wait_for_timeout(400);check('restauration: ressources rétablies après rechargement',await ev('S.stone')==4242)
        check('restauration crée une copie « avant restauration »',await ev('bkList().some(b=>b.l==="avant restauration")'))
        await ev('openSettings()');check('copies listées dans les Réglages',await ev('document.getElementById("setBody").innerText.includes("Sauvegardes de secours")&&document.querySelectorAll("#setBody button").length>5'))
        # stockage plein : jamais d'erreur
        await ev('(()=>{const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="arkPrimalBackups")throw new Error("quota");return o.call(this,k,v)};window.__o=o})()')
        r=await ev('(()=>{try{bkLast=0;S.stone=7;save();takeBackup("x",true);return "ok"}catch(e){return e.message}})()');check('quota dépassé: aucune exception',r=='ok',r)
        await ev('Storage.prototype.setItem=window.__o;0')
        check('copie avant import',await ev('(S.team.length>0,true)'))
        # le transfert utilise les copies
        await ev('localStorage.removeItem("arkPrimalBackups");bkLast=0;S.stone=55;save()')
        code=await ev('makeCode()');await ev('S.stone=77;save()')
        await ev('document.getElementById("trCode").value=%s'%json.dumps(code))
        async with pg.expect_navigation():await ev('trImportCode()')
        await pg.wait_for_timeout(400);check('import: progression remplacée',await ev('S.stone')==55)
        check('import: copie « avant import » créée',await ev('bkList().some(b=>b.l==="avant import")'))
        async with pg.expect_navigation():await ev('trRestoreBackup()')
        await pg.wait_for_timeout(400);check('annuler le dernier import',await ev('S.stone')==77)
        check('aucune erreur JS',not pg.errs,pg.errs)
        await b.close()
    print('ECHECS:',FAILS) if FAILS else print('TOUT OK')
asyncio.run(main())
sys.exit(1 if FAILS else 0)  # échec visible pour tools/run_tests.sh
