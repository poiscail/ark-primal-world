"""Collection I (0.35) : familles Mammifères/Insectes (9 espèces, portraits SVG valides, effets de chef), 4 variantes, surnom
(vrai clic), favori épinglé, verrou anti-recyclage, affection (victoires, bonus), statistiques d'utilisation, recyclage
intelligent, comparateur, filtres et tris, statistiques de collection."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["mammoth","giga","raptor","raptor","raptor","mantis"].map((t,i)=>({id:i+1,type:t,level:20+i,xp:0}));S.stage=40;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        r=await ev('["mammoth","smilo","megalo","megath","cbear","arthrop","meganeu","titanom","mantis"].map(k=>[k,!!SPEC[k],PORT[k]&&PORT[k][0]])')
        check('9 nouvelles espèces (5 mammifères, 4 insectes)',all(x[1] for x in r) and [x[2] for x in r].count('W')==5 and [x[2] for x in r].count('I')==4,r)
        bad=await ev('''(()=>{const P=new DOMParser(),out=[];for(const k of ["mammoth","smilo","megalo","megath","cbear","arthrop","meganeu","titanom","mantis"]){for(const s of [portrait(k),corruptSVG(k,"redorb",{})]){if(/undefined|NaN/.test(s)||P.parseFromString(s,"image/svg+xml").querySelector("parsererror")||s.length<400)out.push(k)}}return out})()''')
        check('portraits et versions corrompues valides',bad==[],bad)
        check('émojis uniques (le portrait suit l\'émoji)',await ev('(()=>{e2t();return ["🦣","🐈","🫎","🦫","🐻","🪱","🪰","🐜","🦗"].every(e=>E2T[e]&&SPEC[E2T[e]].e===e)})()'))
        # chef mammifère : ouverture et super
        await ev('fight=null;startBattle({mode:"story",n:12});renderBattle()')
        r=await ev('[fight.msOpen,/Charge de horde/.test(fight.log)]')
        check('chef Mammouth : ouverture « Charge de horde »',r==['W',True],r)
        r=await ev('(()=>{const f=fight;f.sp=100;f.stun=0;f.turn=0;f.enemies[f.wave].hp=1e9;f.enemies[f.wave].max=1e9;const h=f.hp.join();special();return [f.hp.join()===h,/Piétinement/.test(f.log)]})()')
        check('super des Mammifères : Piétinement (l\'ennemi étourdi ne frappe pas)',r==[True,True],r)
        # variantes
        r=await ev('(()=>{const c={};const _r=Math.random;for(let i=0;i<20000;i++){const v=rollVariant();c[v]=(c[v]||0)+1}return ["fossil","crystal","lava","spectral"].map(k=>c[k]||0)})()')
        check('4 nouvelles variantes tirées (≈1 %)',all(80<x<350 for x in r),r)
        # carte : surnom, favori, verrou
        await ev('fight=null;go("team");subSet("team","pack")')
        await pg.click('.cocard[data-id="4"] button:has-text("SURNOM")');await pg.fill('#askIn','Croquette');await pg.click('#modalBody button:has-text("OK")');await pg.wait_for_timeout(50)
        check('vrai clic : surnom affiché sur la carte',await ev('S.team[3].nick')=='Croquette' and 'Croquette' in await pg.inner_text('.cocard[data-id="4"]'))
        await pg.click('.cocard[data-id="5"] button:has-text("FAVORI")');await pg.wait_for_timeout(50)
        check('vrai clic : favori épinglé en haut',await ev('S.team[4].fav')==True and await pg.locator('#colTools .cofavs button').count()==1)
        await pg.click('.cocard[data-id="6"] button:has-text("VERROUILLER")');await pg.wait_for_timeout(50)
        n0=await ev('S.team.length');await ev('recycle(6)')
        check('verrou : recyclage refusé',await ev('S.team.length')==n0)
        # affection et statistiques
        await ev('S.team[0].aff=9;fight=null;startBattle({mode:"story",n:5})');await ev(WIN)
        r=await ev('[S.team[0].aff,affLv(S.team[0]),S.team[0].us]')
        check('victoire : affection +1 (niveau 1), statistiques',r[0]==10 and r[1]==1 and r[2]['b']==1 and r[2]['w']==1,r)
        h=await ev('(()=>{const d=S.team[0],a=d.aff;d.aff=0;const x=stats(d).hp;d.aff=a;return [x,stats(d).hp]})()')
        check('affection 1 : +1 % de PV',abs(h[1]/h[0]-1.01)<.006,h)
        # recyclage intelligent : 3 raptors hors équipe (id 4 surnommé, id 5 favori) → aucun ; on en ajoute 2
        await ev('S.team.push({id:20,type:"raptor",level:2,xp:0},{id:21,type:"raptor",level:1,xp:0},{id:22,type:"megalo",level:1,xp:0})')
        r=await ev('coSmartList().map(d=>d.id).sort((a,b)=>a-b)')
        check('recyclage intelligent : seulement les doublons non protégés',r==[20,21],r)
        await ev('go("team");subSet("team","pack")');await pg.click('#colTools button:has-text("RECYCLAGE INTELLIGENT")');await pg.click('#modalBody button.red');await pg.wait_for_timeout(50)
        check('vrai clic : doublons recyclés, le meilleur gardé',await ev('S.team.some(d=>d.id===20)||S.team.some(d=>d.id===21)')==False and await ev('S.team.some(d=>d.id===22)'))
        # comparateur
        await pg.click('.cocard[data-id="1"] button:has-text("COMPARER")');await pg.click('.cocard[data-id="6"] button:has-text("COMPARER")');await pg.wait_for_timeout(50)
        check('vrai clic : comparateur à deux colonnes',await pg.locator('#modalBody .cocmp tr').count()>=10)
        await ev('closeModal()')
        # filtres
        await pg.select_option('#colTools select[data-co="fam"]','I');await pg.wait_for_timeout(50)
        vis=await ev('[...document.querySelectorAll("#collection > .cocard")].filter(c=>!c.classList.contains("subhide2")).map(c=>S.team.find(d=>d.id==c.dataset.id).type)')
        check('filtre famille Insectes',vis==['mantis'],vis)
        await ev('coSet("fam","all")')
        # stats
        await pg.click('#colTools button:has-text("STATISTIQUES")');await pg.wait_for_timeout(50)
        check('statistiques de collection (raretés, familles, variantes)',await pg.locator('#modalBody .costat').count()>=14 and await pg.locator('#modalBody .covars span').count()==9)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
