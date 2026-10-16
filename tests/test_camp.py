"""Camp de base (0.33) : écran et onglet, bâtiments (vrais clics, bonus de PV, production à récolter, couveuse), lettre du
Dr Elara (choix → cadeau, une fois par semaine), Mira (offres), Oto (quête en étapes), Kael le rival (pari, combat, manche)."""
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
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:40,xp:0}));S.stage=2;ens();delete S.camp;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        await ev('go("camp")')
        check('camp verrouillé avant le niveau 3','niveau 3' in await pg.inner_text('#camp'))
        await ev('S.stage=30;go("camp")')
        check('onglet Camp dans les Quêtes',await pg.locator('#subnav button:has-text("Camp")').count()==1)
        check('scène du camp : dinos qui se promènent',await pg.locator('#camp .campscene .cwalk').count()==3)
        # ---- bâtiments
        await ev('S.stone=99999;S.mat.bone=99;S.mat.hide=99;go("camp")')
        h0=await ev('stats(S.team[0]).hp')
        await pg.click('#camp button[data-b="pal"]');await pg.wait_for_timeout(50)
        h1=await ev('stats(S.team[0]).hp')
        check('vrai clic : Palissade niveau 1, +2 % de PV',await ev('S.camp.b.pal')==1 and abs(h1/h0-1.02)<.01,[h0,h1])
        check('coût payé',await ev('S.stone')==99999-300 and await ev('S.mat.bone')==95)
        await ev('S.camp.b.car=2;S.camp.b.bib=1;S.camp.t=Date.now()-3*36e5;go("camp")')
        r=await ev('campProd()')
        check('production : 3 h → 150 pierres et 3 essences',r['stone']==150 and r['essence']==3,r)
        s0=await ev('S.stone');await pg.click('#camp button:has-text("RÉCOLTER")');await pg.wait_for_timeout(50)
        check('vrai clic : récolte',await ev('S.stone')==s0+150 and await ev('campProd().stone')==0)
        await ev('S.camp.t=Date.now()-48*36e5')
        check('production plafonnée à 12 h',await ev('campProd().stone')==600)
        # ---- couveuse
        r=await ev('''(()=>{S.camp.b.nid=5;S.team.push({id:50,type:"rex",level:40,xp:0},{id:51,type:"rex",level:40,xp:0});S.mat.bone=999;S.mat.hide=999;S.mat.crystal=999;S.mat.amber=999;S.nest.slots=[];nestSel={a:50,b:51};nestLay();const e=S.nest.slots.find(Boolean);if(!e)return null;return [e.t1-e.t0,NEST_R[SPEC[e.type].r].m*60000/nestSpeed()]})()''')
        check('couveuse niveau 5 : incubation −30 %',r is not None and abs(r[0]/r[1]-.7)<.01,r)
        await ev('S.team=S.team.filter(d=>d.id<50);S.nest.slots=[]')
        # ---- lettre d'Elara
        await ev('S.camp.let={wk:-1,ch:-1};go("camp")')
        check('lettre de la semaine signalée',await ev('campLetterNew()') and await pg.locator('#camp .celara.red').count()==1)
        await pg.click('#camp .celara');await pg.wait_for_timeout(50)
        check('lettre : deux choix',await pg.locator('#modalBody .clans button').count()==2)
        g=await ev('campLetter().a[1][1]');k=list(g.keys())[0]
        v0=await ev(f'(MATS["{k}"]?S.mat["{k}"]:S["{k}"])||0')
        await pg.locator('#modalBody .clans button').nth(1).click();await pg.wait_for_timeout(50)
        v1=await ev(f'(MATS["{k}"]?S.mat["{k}"]:S["{k}"])||0')
        check('vrai clic : le 2e choix donne son cadeau',v1==v0+g[k] and await ev('S.camp.let.ch')==1,[k,v0,v1,g])
        check('une seule réponse par semaine',await ev('!campLetterNew()'))
        # ---- Mira
        o=await ev('miraOffers()[0]');await ev('go("camp")')
        await pg.locator('#camp .cmira button').nth(0).click();await pg.wait_for_timeout(50)
        check('vrai clic : offre de Mira achetée une fois',await ev(f'S.camp.mira.b[{o}]')==1 and await ev('document.querySelector("#camp .cmira button").disabled'))
        # ---- Oto
        await ev('S.camp.oto={s:0,base:null};go("camp")')
        check('Oto : 1re étape, réclamer désactivé',await ev('document.querySelector("#camp .coto").disabled'))
        await ev('S.cnt.wins=(S.cnt.wins||0)+10;go("camp")')
        e0=await ev('S.essence');await pg.click('#camp .coto');await pg.wait_for_timeout(50)
        check('vrai clic : étape 1 terminée, étape 2 commencée',await ev('S.camp.oto.s')==1 and await ev('S.essence')==e0+20)
        # ---- Kael
        await ev('S.camp.rival=0;S.stone=5000;go("camp")')
        check('Kael : manche 1 ouverte',await ev('rivalOpen()')==1 and await pg.locator('#camp .ckael').count()==1)
        await pg.click('#camp .ckael');await pg.wait_for_timeout(50)
        check('choix : amical ou pari',await pg.locator('#modalBody .clans button').count()==2)
        await pg.locator('#modalBody .clans button').nth(1).click();await pg.wait_for_timeout(150)
        r=await ev('[fight.o.mode,fight.o.bet,S.stone,fight.enemies.every(e=>e.pt&&SPEC[e.pt]),enemyLook(fight.enemies[0],fight)]')
        check('vrai clic : pari (−100 pierres), équipe de vrais dinos',r[0]=='rival' and r[1]==1 and r[2]==4900 and r[3] and r[4] is None,r)
        r=await ev('(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return [f.over,S.camp.rival,S.stone]})()')
        check('Kael battu : manche gagnée, pari remboursé et doublé',r[0]=='win' and r[1]==1 and r[2]>=4900+200+225,r)
        check('manche 2 seulement après le niveau 20',await ev('rivalOpen()')==2)
        check('3 succès du camp',await ev('ACH.filter(a=>/^cp/.test(a[0])).length')==3)
        check('sauvegarde : S.camp',await ev('(()=>{save();const x=JSON.parse(localStorage.arkPrimalMobile);return !!(x.camp&&x.camp.b.pal===1&&x.camp.rival===1)})()'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
