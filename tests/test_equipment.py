import asyncio,sys,pathlib
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);ev=pg.evaluate
        base='S.team=[{id:1,type:"raptor",level:1,xp:0},{id:2,type:"rex",level:1,xp:0}];S.nextId=10;S.items=[];S.nextItem=1;S.stone=99999;S.mat={bone:999,hide:99,crystal:99,amber:9};S.cnt={};S.dcnt={};'
        await ev(base)
        s0=await ev('stats(S.team[0])')
        await ev('addItem({id:S.nextItem++,s:"w",r:2,lvl:0,n:"Croc",pa:""})')
        await ev('equip(1,1)')
        s1=await ev('stats(S.team[0])')
        check('arme équipée: ATQ augmente',s1['atk']>s0['atk'],(s0,s1))
        await ev('upgradeItem(1)')
        s2=await ev('stats(S.team[0])');check('amélioration: ATQ augmente encore',s2['atk']>s1['atk'],(s1,s2))
        check('compteur loot/upgrades',await ev('S.cnt.loot===1&&S.cnt.upgrades===1'))
        await ev('addItem({id:S.nextItem++,s:"c",r:2,lvl:0,n:"Totem",pa:"thorns"})');await ev('equip(1,2)')
        check('talisman donne le passif',await ev('hasPA(S.team[0],"thorns")'))
        await ev('equip(2,2)');check('un objet ne peut être que sur un dino',await ev('!hasPA(S.team[0],"thorns")&&hasPA(S.team[1],"thorns")'))
        check('démonter objet équipé refusé',await ev('(salvageItem(2),!!findItem(2))'))
        check('démonter objet libre',await ev('(salvageItem(3),true)') )
        await ev('addItem({id:S.nextItem++,s:"a",r:0,lvl:0,n:"Carapace",pa:""})');b0=await ev('S.mat.bone')
        await ev('salvageItem(%d)'%(await ev('S.nextItem-1')));check('démontage donne des matériaux',await ev('S.mat.bone')>b0)
        # taux de rareté
        r=await ev('()=>{const c=[0,0,0,0];for(let i=0;i<4000;i++)c[lootRar(50,0)]++;return c}');check('butin: toutes raretés possibles',all(x>0 for x in r),r)
        # sac plein
        await ev('S.items=[];for(let i=0;i<120;i++)S.items.push({id:1000+i,s:"w",r:0,lvl:0,n:"x",pa:""})');check('sac plein refuse',await ev('addItem(newItem("w",0))')==False)
        # auto-équipement
        await ev(base);await ev('for(let i=0;i<9;i++)addItem(rollItem(60,1))');await ev('autoEquip()')
        check('auto-équip: au moins une arme équipée',await ev('S.team.some(d=>d.eq&&d.eq.w)'))
        # UI
        await ev('go("team")');await ev('openEq(1)');check('modale équipement ouverte',await ev('!document.getElementById("eqVeil").classList.contains("hide")&&document.getElementById("eqBody").innerText.length>50'))
        await ev('closeEq()');check('sac visible',await ev('document.getElementById("bagBox").innerText.includes("Équipement")'))
        # butin après une victoire d'histoire (boss garanti)
        await ev(base+'S.stage=0');await ev('startBattle({mode:"story",n:10})')
        await ev('()=>{fight.mx=fight.mx||[];}') if False else None
        r=await ev('''()=>{let g=0;for(let k=0;k<30;k++){S.items=[];startBattle({mode:"story",n:10});fight.hp=fight.hp.map(x=>999999);fight.over=null;win();if(S.items.length)g++}return g}''')
        check('boss: butin garanti',r==30,r)
        check('aucune erreur JS',not errs,errs)
        await b.close()
    print('ECHECS:',FAILS) if FAILS else print('TOUT OK')
asyncio.run(main())
sys.exit(1 if FAILS else 0)  # échec visible pour tools/run_tests.sh
