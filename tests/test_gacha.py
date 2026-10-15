import asyncio,sys,pathlib
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);ev=pg.evaluate
        base='S.team=[{id:1,type:"raptor",level:1,xp:0}];S.nextId=10;S.pity=0;S.fpity=0;S.eggs=[];S.hist=[];S.gstat={total:0,r:[0,0,0,0]};S.freeDay="";S.cnt={};S.dcnt={};S.tickets=500;S.stone=99999;S.mat={bone:99,hide:99,crystal:999,amber:999};S.shards=0;'
        # --- vedette
        f=await ev('featured()');check('vedette: 3 espèces valides de la bonne rareté',f['leg'] and f['epic'] and f['rare'],f)
        r=await ev('[SPEC[featured().leg].r,SPEC[featured().epic].r,SPEC[featured().rare].r]');check('vedette: raretés Légendaire/Épique/Rare',r==['Légendaire','Épique','Rare'],r)
        # taux de la bannière vedette sur 30000 tirages
        r=await ev('''()=>{S.pity=0;S.fpity=0;const f=featured(),c={r:[0,0,0,0],fl:0,fe:0,fr:0,n:30000};for(let i=0;i<c.n;i++){const k=pullFeat(false),ri=["Commun","Rare","Épique","Légendaire"].indexOf(SPEC[k].r);c.r[ri]++;if(k===f.leg)c.fl++;if(k===f.epic)c.fe++;if(k===f.rare)c.fr++}return c}''')
        leg=r['r'][3]/r['n'];check('vedette: ~7-9% de légendaires (pity incluse)',.065<leg<.095,leg)
        check('vedette: ~60% des légendaires sont la vedette',.55<r['fl']/r['r'][3]<.75,r['fl']/r['r'][3])
        check('vedette: communs ~35-45%',.33<r['r'][0]/r['n']<.45,r['r'][0]/r['n'])
        # garantie vedette
        r=await ev('''()=>{S.fpity=59;S.pity=0;const k=pullFeat(false);return [k===featured().leg,S.fpity]}''');check('garantie vedette à 59 -> vedette légendaire, compteur remis à 0',r==[True,0],r)
        r=await ev('S.pity=39;S.fpity=0;SPEC[pullFeat(false)].r');check('garantie légendaire générale à 39',r=='Légendaire',r)
        # multi garanti épique+
        r=await ev('''()=>{let bad=0;for(let i=0;i<500;i++){S.pity=0;const got=[];for(let j=0;j<10;j++)got.push(SPEC[pullFeat(j===9&&!got.some(r=>r==="Épique"||r==="Légendaire"))].r);if(!got.some(r=>r==="Épique"||r==="Légendaire"))bad++}return bad}''');check('x10 garantit Épique+',r==0,r)
        # --- achat vedette via UI
        await ev(base+'go("summon")');await ev('featPull(10,"tickets",18)')
        r=await ev('({t:S.tickets,n:S.team.length,h:S.hist.length,g:S.gstat.total,veil:!document.getElementById("gachaVeil").classList.contains("hide"),cards:document.querySelectorAll("#gachaBody .gc").length,sum:S.cnt.summons})');check('x10 vedette: -18 tickets, 10 dinos, modale de résultat',r['t']==482 and r['n']==11 and r['g']==10 and r['veil'] and r['cards']==10 and r['sum']==10,r)
        await ev('closeGacha()');r=await ev('document.getElementById("gachaVeil").classList.contains("hide")');check('modale se ferme',r)
        await ev('S.tickets=1;featPull(1,"tickets",2)');r=await ev('S.team.length');check('fonds insuffisants: aucun tirage',r==11,r)
        # --- élémentaire
        await ev(base);r=await ev('''()=>{let bad=0;S.mat.crystal=9999;for(const el of ["redorb","blueorb","greenorb","purpleorb","goldorb"]){gEl=el;for(let i=0;i<300;i++){const k=pullEl(el,false);if(SPEC[k].element!==el)bad++}}return bad}''');check('bannière élémentaire: 0 intrus sur 1500 tirages',r==0,r)
        await ev(base+'gEl="blueorb"');await ev('elPull(10)');r=await ev('({c:S.mat.crystal,ok:S.team.slice(1).every(d=>SPEC[d.type].element==="blueorb")})');check('x10 élémentaire: -27 cristaux, tous bleus',r['c']==972 and r['ok'],r)
        # --- variantes x2,5
        r=await ev('''()=>{let n=0,m=0;for(let i=0;i<20000;i++){if(rollVariant(2.5)!=="normal")n++;if(rollVariant(1)!=="normal")m++}return [n/20000,m/20000]}''');check('bannière variantes: ~54% vs ~21,5% de base',.5<r[0]<.58 and .19<r[1]<.24,r)
        await ev(base);await ev('varPull(10)');r=await ev('({a:S.mat.amber,n:S.team.length})');check('x10 variantes: -36 ambre',r['a']==963 and r['n']==11,r)
        # --- tirage gratuit
        await ev(base);await ev('freePull()');r=await ev('({n:S.team.length,t:S.tickets,d:S.freeDay})');check('tirage gratuit: 1 dino, 0 ticket dépensé',r['n']==2 and r['t']==500,r)
        await ev('freePull()');r=await ev('S.team.length');check('tirage gratuit: une seule fois par jour',r==2,r)
        await ev('S.freeDay="2000-01-01";freePull()');r=await ev('S.team.length');check('tirage gratuit: de nouveau le lendemain',r==3,r)
        # --- historique
        await ev(base);await ev('doGacha(10,RATE_STD(),"tickets",9,true)');r=await ev('({h:S.hist.length,tot:S.gstat.total,sum:S.gstat.r.reduce((a,b)=>a+b,0)})');check('historique + stats cohérents',r['h']==10 and r['tot']==10 and r['sum']==10,r)
        await ev('for(let i=0;i<5;i++)doGacha(10,RATE_STD(),"tickets",9,true)');r=await ev('S.hist.length');check('historique limité à 30',r==30,r)
        await ev('toggleHist()');r=await ev('document.querySelectorAll(".hrow .chip").length');check('historique affiche 12 derniers',r==12,r)
        # --- œufs
        await ev(base);await ev('addEgg("common");addEgg("rare");addEgg("epic");addEgg("common")');r=await ev('({n:S.eggs.length,inc:S.eggs.filter(e=>e.inc).length})');check('œufs: 3 en incubation max, le 4e attend',r==dict(n=4,inc=3),r)
        await ev('S.stage=0;S.team=[{id:1,type:"rex",level:40,xp:0},{id:2,type:"spino",level:40,xp:0},{id:3,type:"giga",level:40,xp:0}];startBattle({mode:"story",n:1});for(let g=0;g<200&&!fight.over;g++)tapOrb(0)')
        r=await ev('({over:fight.over,left:S.eggs.slice(0,3).map(e=>e.left)})');check('victoire fait avancer les œufs',r['over']=='win' and r['left'][0]<=2 and r['left'][1]==5 and r['left'][2]==9,r)
        await ev(base+'addEgg("epic");S.eggs[0].left=0;');n0=await ev('S.team.length');await ev('hatch(0)');r=await ev('({n:S.team.length,e:S.eggs.length,h:S.cnt.hatched,veil:!document.getElementById("gachaVeil").classList.contains("hide")})');check('éclosion: dino ajouté, œuf retiré, modale',r['n']==n0+1 and r['e']==0 and r['h']==1 and r['veil'],r)
        await ev(base+'addEgg("rare");hatch(0)');r=await ev('S.eggs.length');check('œuf pas prêt: ne s\'ouvre pas',r==1,r)
        r=await ev('''()=>{const c={Commun:0,Rare:0,"Épique":0,"Légendaire":0};for(let i=0;i<4000;i++){c[SPEC[pickType(RAR5[rollW(EGGS.epic.rt)])].r]++}return c}''');check('œuf épique: aucun commun, ~50% épiques',r['Commun']==0 and .44<r['Épique']/4000<.56,r)
        await ev(base+'for(let i=0;i<40;i++)addEgg("common")');r=await ev('S.eggs.length');check('stock d\'œufs plafonné à 30',r==30,r)
        # drop d'œufs : boss histoire => œuf rare
        await ev(base+'S.team=[{id:1,type:"rex",level:80,xp:0},{id:2,type:"spino",level:80,xp:0},{id:3,type:"giga",level:80,xp:0}];S.stage=9;startBattle({mode:"story",n:10});for(let g=0;g<300&&!fight.over;g++){if(fight.sp>=100)special();else tapOrb(0)}')
        r=await ev('({over:fight.over,rare:S.eggs.some(e=>e.t==="rare"),rep:fight.report.includes("Incubateur")})');check('boss niveau 10: œuf rare + encart incubateur',r['over']=='win' and r['rare'] and r['rep'],r)
        # --- fragments / boutique
        await ev(base+'S.team=[{id:1,type:"raptor",level:1,xp:0},{id:2,type:"raptor",level:1,xp:0},{id:3,type:"raptor",level:1,xp:0},{id:4,type:"spino",level:1,xp:0},{id:5,type:"rex",level:1,xp:0}]');await ev('recycle(4);recycle(5)');r=await ev('S.shards');check('recyclage donne des fragments (légendaire 40 + épique 14)',r==54,r)
        await ev('S.shards=0;shopBuy("spino")');r=await ev('({s:S.shards,n:S.team.length})');check('boutique: fonds insuffisants',r['s']==0 and r['n']==3,r)
        await ev('S.shards=450;shopBuy("spino")');r=await ev('({s:S.shards,has:S.team.some(d=>d.type==="spino")})');check('boutique: légendaire pour 450 fragments',r['s']==0 and r['has'],r)
        await ev('setShop("Commun");');r=await ev('document.querySelectorAll("#gachaY .row").length');nc=await ev('Object.values(SPEC).filter(s=>s.r==="Commun").length');check(f'boutique: liste filtrée par rareté ({nc} communs)',r==nc,(r,nc))
        # --- connexion quotidienne
        await ev(base+'S.login={last:"",streak:0,ready:false};render()');r=await ev('({s:S.login.streak,r:S.login.ready})');check('connexion: 1er jour, série 1',r==dict(s=1,r=True),r)
        st0=await ev('S.stone');await ev('claimLogin()');r=await ev('({st:S.stone,r:S.login.ready})');check('connexion jour 1: +100 pierres',r['st']==st0+100 and not r['r'],r)
        await ev('claimLogin()');r=await ev('S.stone');check('connexion: pas de double récompense',r==st0+100,r)
        await ev('S.login={last:(new Date(Date.now()-864e5)).toISOString().slice(0,10),streak:6,ready:false};render()');r=await ev('({s:S.login.streak,r:S.login.ready})');check('connexion consécutive: série 7',r==dict(s=7,r=True),r)
        await ev('claimLogin()');r=await ev('({e:S.eggs.some(e=>e.t==="epic"),c:S.mat.crystal})');check('jour 7: œuf épique + cristaux',r['e'] and r['c']>=1002,r)
        await ev('S.login={last:"2000-01-01",streak:5,ready:false};render()');r=await ev('S.login.streak');check('série brisée: retour à 1',r==1,r)
        # --- toasts
        await ev('alert("test toast")');r=await ev('document.querySelectorAll(".toast").length');check('alert() devient une notification non bloquante',r>=1,r)
        # --- missions gacha
        await ev(base+'for(let i=0;i<6;i++)doGacha(10,RATE_STD(),"tickets",9,true)');r=await ev('prog(PERM.find(m=>m.id==="p_gacha50"),0)');check('mission « 50 tirages » progresse',r==60,r)
        # --- captures
        await ev(base+'S.shards=120;addEgg("rare");addEgg("common");S.eggs[0].left=0;go("summon")');await pg.screenshot(path='/tmp/ark_summon.png',full_page=True)
        await ev('go("home")');await pg.screenshot(path='/tmp/ark_home.png')
        await ev('doGacha(10,RATE_STD(),"tickets",9,true)');await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/ark_modal.png')
        check('aucune erreur JavaScript',errs==[],errs)
        print('ÉCHECS:',FAILS if FAILS else 'aucun');await b.close()
asyncio.run(main())
sys.exit(1 if FAILS else 0)  # échec visible pour tools/run_tests.sh
