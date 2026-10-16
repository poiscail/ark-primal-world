"""Collection II (0.36) : galerie 3D (vrai clic, inclinaison), couleur et accessoire (débloqué une fois), cri de famille,
taille réelle et faits, espèces de saison (prix de saison / hors saison, exclues des invocations), dinos mythiques (quêtes),
albums par famille, évolutions ramifiées et par fossile rare, mode photo (PNG)."""
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
        await ev('setPref("anim",false);setPref("lore",false);setPref("sound",true);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor","megalo","coelo"].map((t,i)=>({id:i+1,type:t,level:30,xp:0,star:2}));S.stage=40;S.essence=500;S.shards=1000;ens();save()')
        check('7 nouvelles espèces (4 de saison, 3 mythiques) bien enregistrées',await ev('["seedwyrm","abyssking","firstfang","pumpkin","frosty","blossom","sunny"].every(k=>SPEC[k]&&SPEC[k].ex)'))
        await ev('go("team");subSet("team","pack")')
        await pg.click('.cocard[data-id="1"] button:has-text("GALERIE")');await pg.wait_for_timeout(100)
        check('vrai clic : galerie 3D avec taille réelle et faits',await pg.locator('#modalBody .c2stage').count()==1 and await pg.locator('#modalBody .c2size').count()==1 and await pg.locator('#modalBody .c2facts .tiny').count()>=2)
        bx=await pg.locator('#c2stage').bounding_box();await pg.mouse.move(bx['x']+bx['width']*.9,bx['y']+bx['height']*.2);await pg.wait_for_timeout(50)
        check('la figure s\'incline avec la souris','rotateY' in await ev('document.getElementById("c2fig").style.transform'))
        await pg.click('#modalBody .c2row button:has-text("Rubis")');await pg.wait_for_timeout(50)
        e0=await ev('S.essence');await pg.click('#modalBody .c2row button:has-text("Couronne")');await pg.wait_for_timeout(50)
        check('couleur et accessoire (30 essences la 1re fois)',await ev('[S.team[0].skin,S.team[0].acc]')==[5,'crown'] and await ev('S.essence')==e0-30)
        await ev('closeModal()');await pg.wait_for_timeout(50)
        check('carte : teinte et accessoire affichés',await ev('!!document.querySelector(\'.cocard[data-id="1"] .c2pt[style*="hue-rotate(320deg)"]\')&&!!document.querySelector(\'.cocard[data-id="1"] .c2acc\')'))
        await ev('S.team[1].acc="crown"');e0=await ev('S.essence');await ev('c2SetAcc(2,"crown");closeModal()');check('accessoire déjà débloqué : gratuit',await ev('S.essence')==e0)
        c0=await ev('window.__cry||0');await pg.click('.cocard[data-id="2"] .c2big');await pg.wait_for_timeout(50)
        check('vrai clic sur le portrait : cri de famille',await ev('window.__cry||0')==c0+1)
        await ev('fight=null;startBattle({mode:"story",n:5})')
        check('en combat : teinte et accessoire du chef',await ev('!!document.querySelector("#battleArea .sTeam .sFig .c2acc")'))
        # saison
        await ev('fight=null;WD_SEASON="automne";go("team");subSet("team","pack")')
        r=await ev('[seasCost("pumpkin"),seasCost("frosty"),SPEC.pumpkin.ex]')
        check('espèce de saison : 120 en automne, 300 hors saison, exclue des invocations',r==[120,300,1],r)
        n0=await ev('S.team.length');await pg.click('#colTools .c2seas .on button');await pg.wait_for_timeout(50)
        check('vrai clic : Citrouillosaure acheté (120 fragments)',await ev('S.team.length')==n0+1 and await ev('S.team[S.team.length-1].type')=='pumpkin' and await ev('S.shards')==880)
        check('jamais tirée en invocation',await ev('(()=>{for(let i=0;i<3000;i++){const k=pickType("Épique");if(SPEC[k]&&(SPEC[k].season||SPEC[k].myth))return false}return true})()'))
        # mythiques
        await ev('S.hunt.seed=1;S.stage=100');await pg.click('#colTools button:has-text("ALBUMS")');await pg.wait_for_timeout(50)
        check('albums par famille affichés',await pg.locator('#modalBody .c2alb').count()>=8)
        await pg.click('#modalBody .c2myths button.red');await pg.wait_for_timeout(50)
        check('vrai clic : dino mythique réclamé',await ev('S.team.some(d=>d.type==="seedwyrm")') and await ev('S.col2.myth.seedwyrm')==1)
        await ev('closeModal();go("team");subSet("team","pack")')
        check('carte mythique',await ev('!!document.querySelector(".mythcard .rarity.myth")'))
        # album
        r=await ev('(()=>{const A=albList().find(x=>x.f==="W");A.L.forEach(k=>{if(!S.team.some(d=>d.type===k))S.team.push({id:S.nextId++,type:k,level:1,xp:0})});const t=S.tickets;albClaim("W");closeModal();return [S.col2.alb.W,S.tickets-t]})()')
        check('album des Mammifères complet : +5 tickets',r==[1,5],r)
        # évolutions
        alt=await ev('evoAlt("coelo")');r=await ev('[EVO.coelo,SPEC[evoAlt("coelo")]&&SPEC[evoAlt("coelo")].r,SPEC[EVO.coelo].r]')
        check('évolution ramifiée : autre espèce de même rareté et famille',alt and alt!=r[0] and r[1]==r[2],[alt,r])
        await ev('S.mat.bone=99;S.mat.hide=99;S.shards=999;S.essence=999;go("team");subSet("team","up")')
        await pg.click('#evoBox .c2evo button[onclick^="c2Evolve(5,"]');await pg.wait_for_timeout(50)
        r=await ev('S.team.map(d=>d.type)')
        check('vrai clic : évolution spéciale',alt in r or 'mammoth' in r,r)
        await ev('S.fossil=1;S.team.push({id:90,type:"megalo",level:5,xp:0});S.essence=100');await ev('c2Evolve(90,"mammoth","fos")')
        check('évolution par fossile rare (Mégacéros → Mammouth)',await ev('S.team.find(d=>d.id===90).type')=='mammoth' and await ev('S.fossil')==0 and await ev('S.essence')==60)
        # photo
        await ev('photoOpen()');check('mode photo : aperçu SVG',await pg.locator('#c2phot svg').count()==1)
        async with pg.expect_download() as dl:await pg.click('#modalBody button:has-text("ENREGISTRER")')
        d=await dl.value;check('photo enregistrée en PNG',d.suggested_filename.endswith('.png') and await ev('window.__phLast||0')>5000,d.suggested_filename)
        check('3 succès',await ev('ACH.filter(a=>/^cl2/.test(a[0])).length')==3)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
