"""Mode Cauchemar (0.22) : bouton Normal / Cauchemar (vrais clics), ouverture des chapitres, ennemis (trait + compétence),
gardiens, récompenses (éclats d'ombre, tickets, étoiles), niveau suivant, verrous, paliers d'étoiles, boutique de l'ombre,
Rite d'ombre, enchaînement, sauvegarde."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
SETUP='S.team=["rex","giga","raptor","trike","ptera"].map((t,i)=>({id:i+1,type:t,level:40,xp:0,star:2,v:i===4?"alpha":"normal"}));S.nextId=20;S.stage=%d;S.level=10;S.items=[];S.eggs=[];S.tut={off:true,seen:{}};S.nm=null;ens();save();nmView=false;go("story")'
WIN='''()=>{let g=0;while(fight&&!fight.over&&g++<20){const e=fight.enemies[fight.wave];e.hp=1;e.sh=0;tapOrb(0)}return fight.over}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false')
        # ---- verrou
        await ev(SETUP%5);await pg.wait_for_timeout(100)
        check('bouton Cauchemar présent mais verrouillé avant le niveau 10',await ev('!!document.querySelector("#chapters .nmswitch")&&document.querySelectorAll("#chapters .nmswitch button")[1].disabled'))
        await ev(SETUP%40);await pg.wait_for_timeout(100)
        h0=await ev('document.querySelector("#story .banner h1").textContent')
        await pg.click('#chapters .nmswitch button:has-text("Cauchemar")');await pg.wait_for_timeout(150)
        check('passage en mode Cauchemar (vrai clic)',await ev('nmView===true&&!!document.querySelector("#chapters .smap.nm")'))
        check('bannière de l\'île corrompue',await ev('document.querySelector("#story .banner h1").textContent')=="L'île corrompue")
        check('niveau 1 ouvert, 2 à 10 verrouillés',await ev('!document.querySelectorAll("#chapters .smap.nm .mnode")[0].disabled&&[...document.querySelectorAll("#chapters .smap.nm .mnode")].slice(1).every(b=>b.disabled)'))
        check('ouverture : chapitre suivant après son gardien normal',await ev('(()=>{S.nm.stage=10;S.stage=15;const a=nmOpen(11);S.stage=20;const b=nmOpen(11),c=nmOpen(12);S.stage=40;S.nm.stage=0;return !a&&b&&!c})()'))
        # ---- combat
        await pg.click('#chapters .nmhead button.purple');await pg.wait_for_timeout(150)
        f=await ev('fight&&{mode:fight.o.mode,n:fight.o.n,zone:fight.zone,tr:fight.enemies.map(e=>e.tr),sk:fight.enemies.map(e=>e.esk)}')
        check('combat Cauchemar 1 (vrai clic)',f and f['mode']=='nightmare' and f['n']==1 and 'Cauchemar' in f['zone'],f)
        check('chaque ennemi a un trait et une compétence',f and all(f['tr']) and all(f['sk']),f)
        check('scène corrompue',await ev('document.querySelector("#battleArea .battlestage").classList.contains("nm")'))
        check('intention de la compétence ennemie dans le HUD',await ev('!!document.querySelector("#battleArea .eskchip")'))
        e1=await ev('fight.enemies[0].max');await ev('fight=null;startBattle({mode:"story",n:1})');s1=await ev('fight.enemies[0].max')
        check('ennemis bien plus solides qu\'en histoire normale',e1>s1*2,(e1,s1))
        await ev('fight=null;startBattle({mode:"nightmare",n:1})');t0=await ev('S.tickets')
        await ev(WIN);N=await ev('S.nm')
        check('victoire : niveau 1 validé, 3 éclats d\'ombre, étoiles',N['stage']==1 and N['shards']==3 and N['stars'].get('1',0)>=1,N)
        check('bouton « Cauchemar suivant »',await ev('!!document.querySelector("#battleArea button.purple[onclick*=\'nightmare\']")'))
        await pg.locator('#battleArea button:has-text("CAUCHEMAR SUIVANT")').click();await pg.wait_for_timeout(100)
        check('cauchemar suivant : niveau 2 lancé (vrai clic)',await ev('fight.o.mode==="nightmare"&&fight.o.n===2'))
        await ev('fight=null;startBattle({mode:"nightmare",n:1})');await ev(WIN)
        check('rejouer : 1 éclat, progression inchangée',await ev('S.nm.shards===4&&S.nm.stage===1'))
        # ---- gardien
        await ev('S.nm.stage=9;fight=null;startBattle({mode:"nightmare",n:10})')
        check('gardien du cauchemar : boss sans trait, avec compétence',await ev('fight.enemies[2].boss===true&&!fight.enemies[2].tr&&!!fight.enemies[2].esk&&/Gardien du cauchemar/.test(fight.enemies[2].name)'))
        sh0=await ev('S.nm.shards');t0=await ev('S.tickets');await ev(WIN)
        check('gardien vaincu (1re fois) : 12 éclats et 2 tickets',await ev('S.nm.shards')==sh0+12 and await ev('S.tickets')>=t0+2 and await ev('S.nm.stage')==10,(await ev('S.nm.shards'),sh0))
        check('enchaînement : niveau suivant si ouvert',await ev('JSON.stringify(chainNext(fight))')=='{"mode":"nightmare","n":11}')
        await ev('S.nm.stage=40;fight.o.n=40')
        check('enchaînement : rien si le chapitre suivant est fermé',await ev('chainNext(fight)')==None)
        await ev('S.nm.stage=10;go("story")')
        # ---- verrou au lancement
        await ev('fight=null;startBattle({mode:"nightmare",n:50})')
        check('niveau verrouillé : pas de combat',await ev('fight===null&&screen==="story"'))
        # ---- paliers d'étoiles
        await ev('S.nm.stars={};for(let i=1;i<=10;i++)S.nm.stars[i]=3;S.nm.shards=0;render()')
        t0=await ev('S.tickets');await pg.locator('#chapters .starbar button').click()
        check('palier de 30 étoiles noires (vrai clic)',await ev('S.nm.starCl')==1 and await ev('S.nm.shards')==10 and await ev('S.tickets')==t0+2)
        # ---- boutique de l'ombre
        await ev('S.nm.shards=14;render()');t0=await ev('S.tickets')
        await pg.locator('#chapters .nmshop .pprow:has-text("3 tickets") button').click()
        check('pas assez d\'éclats : rien acheté',await ev('S.tickets')==t0 and await ev('S.nm.shards')==14)
        await ev('S.nm.shards=200;render()')
        await pg.locator('#chapters .nmshop .pprow:has-text("3 tickets") button').click()
        check('3 tickets (vrai clic)',await ev('S.tickets')==t0+3 and await ev('S.nm.shards')==185)
        await pg.locator('#chapters .nmshop .pprow:has-text("Œuf épique") button').click()
        check('œuf épique',await ev('S.eggs.length')==1 and await ev('S.eggs[0].t')=='epic' and await ev('S.nm.shards')==150)
        n0=await ev('S.items.length');await pg.locator('#chapters .nmshop .pprow:has-text("Talisman") button').click()
        check('talisman légendaire',await ev('S.items.length')==n0+1 and await ev('S.items[S.items.length-1].r')==3 and await ev('S.items[S.items.length-1].s')=='c')
        # ---- Rite d'ombre
        await pg.locator('#chapters .nmshop .pprow:has-text("Rite") button').click();await pg.wait_for_timeout(100)
        check('Rite d\'ombre : choix des dinos sans variante',await ev('document.querySelectorAll("#modalBody .nmr").length')==4)
        await pg.locator('#modalBody .nmr').first.click();await pg.wait_for_timeout(100)
        check('Rite d\'ombre : variante Ombre (vrai clic), 60 éclats',await ev('S.team.filter(d=>d.v==="shadow").length')==1 and await ev('S.nm.shards')==45 and await ev('S.nm.rites')==1)
        check('Rite : fenêtre fermée',await ev('document.getElementById("modalVeil").classList.contains("hide")'))
        # ---- retour au mode normal
        await pg.click('#chapters .nmswitch button:has-text("Normal")');await pg.wait_for_timeout(100)
        check('retour au mode normal (vrai clic) : carte et bannière d\'origine',await ev('nmView===false&&!!document.querySelector("#chapters .smap:not(.nm)")')and await ev('document.querySelector("#story .banner h1").textContent')==h0)
        # ---- sauvegarde, missions, succès
        await ev('save()');await pg.reload();await pg.wait_for_timeout(400)
        check('progression conservée après rechargement',await ev('S.nm.stage===10&&S.nm.rites===1'))
        check('mission quotidienne et succès',await ev('DAILY.some(m=>m.t==="nightmares")&&ACH.some(a=>a[0]==="nm3")'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
