"""Le Grand Nord (0.25) : verrou (histoire 50), onglet (vrai clic), carte et chapitres, combats (décors toundra/abysses,
créatures, élites, gardiens à compétence), récompenses, gardiens qui rejoignent la meute, espèces exclusives absentes des
invocations et des boutiques, étoiles et paliers, niveau suivant, enchaînement, bestiaire des créatures, sauvegarde."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
SETUP='S.team=["rex","giga","carnota"].map((t,i)=>({id:i+1,type:t,level:45,xp:0,star:3}));S.gear=6;S.nextId=20;S.stage=%d;S.level=10;S.items=[];S.tut={off:true,seen:{}};S.far=null;ens();save();go("far")'
WIN='''()=>{let g=0;while(fight&&!fight.over&&g++<20){const e=fight.enemies[fight.wave];e.hp=1;e.sh=0;tapOrb(0)}return fight.over}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false')
        await ev(SETUP%40);check('verrouillé avant le niveau 50 de l\'histoire',await ev('document.getElementById("far").innerText.includes("inaccessible")'))
        await ev('startBattle({mode:"far",n:1})');check('pas de combat avant le niveau 50',await ev('!fight||fight.o.mode!=="far"'))
        await ev(SETUP%55);await ev('go("story")');await pg.click('#subnav button:has-text("Grand Nord")');await pg.wait_for_timeout(150)
        check('onglet Aventure > Grand Nord (vrai clic)',await ev('screen')=='far' and await ev('!!document.querySelector("#far .smap.farmap")'))
        check('carte : niveau 1 ouvert, 2 à 10 verrouillés',await ev('!document.querySelectorAll("#far .mnode")[0].disabled&&[...document.querySelectorAll("#far .mnode")].slice(1).every(b=>b.disabled)'))
        check('4 gardiens à rallier affichés',await ev('document.querySelectorAll("#far .farg").length')==4 and await ev('document.querySelectorAll("#far .farg.no").length')==4)
        await pg.click('#far .farhead button.blue');await pg.wait_for_timeout(150)
        f=await ev('fight&&{mode:fight.o.mode,n:fight.o.n,zone:fight.zone}')
        check('niveau 1 lancé (vrai clic)',f and f['mode']=='far' and f['n']==1,f)
        check('décor de la toundra',await ev('document.querySelector("#battleArea .battlestage").classList.contains("z-toundra")'))
        check('créature du Grand Nord dessinée',await ev('/b-(mammoth|smilodon|cavebear|terrorbird)/.test(document.querySelector("#battleArea .sEnemy").className)'))
        tk=await ev('S.tickets');await ev(WIN)
        check('victoire : niveau 1 validé, étoiles',await ev('S.far.stage')==1 and await ev('S.far.stars[1]')>=1)
        check('bouton « niveau suivant »',await ev('!!document.querySelector("#battleArea button[onclick*=\'far\'][onclick*=\'n:2\']")'))
        check('enchaînement : niveau suivant',await ev('JSON.stringify(chainNext(fight))')=='{"mode":"far","n":2}')
        # ---- gardien du niveau 10 : rejoint la meute
        await ev('S.far.stage=9;fight=null;startBattle({mode:"far",n:10})')
        check('gardien : Mammouth ancestral, boss à compétence',await ev('fight.enemies[2].boss===true&&fight.enemies[2].name==="Gardien · Mammouth ancestral"&&!!fight.enemies[2].esk'))
        n0=await ev('S.team.length');tk=await ev('S.tickets');await ev(WIN)
        check('gardien vaincu : le Cryostégosaure rejoint la meute',await ev('S.team.length')==n0+1 and await ev('S.team[S.team.length-1].type')=='cryostego' and await ev('S.tickets')>=tk+3)
        check('annonce dans le rapport de victoire',await ev('!!document.querySelector("#battleArea .farjoin")'))
        await ev('fight=null;startBattle({mode:"far",n:10})');n0=await ev('S.team.length');await ev(WIN)
        check('rejouer le gardien : pas de nouveau dino',await ev('S.team.length')==n0)
        # ---- abysses
        await ev('S.far.stage=20;fight=null;startBattle({mode:"far",n:21})')
        check('niveau 21 : décor des abysses',await ev('document.querySelector("#battleArea .battlestage").classList.contains("z-abysses")'))
        check('créature des abysses',await ev('/b-(squid|angler|jelly|megalodon)/.test(document.querySelector("#battleArea .sEnemy").className)'))
        await ev('fight.wave=2;renderBattle()');check('élite des abysses : dino corrompu',await ev('document.querySelector("#battleArea .sEnemy").classList.contains("corrupt")'))
        check('niveau verrouillé refusé',await ev('(()=>{const f0=fight;startBattle({mode:"far",n:30});return fight===f0})()'))
        # ---- exclusives
        check('exclusives : jamais tirées en invocation',await ev('(()=>{for(let i=0;i<800;i++){const k=pickType(i%2?"Légendaire":"Épique");if(SPEC[k].ex)return false}return true})()'))
        check('exclusives : jamais en vedette ni par élément',await ev('(()=>{const f=featured();if([f.leg,f.epic,f.rare].some(k=>k&&SPEC[k].ex))return false;for(let i=0;i<300;i++){const k=pullEl(i%2?"blueorb":"purpleorb");if(SPEC[k].ex)return false}return true})()'))
        await ev('go("summon");subSet("summon","shop");setShop("Légendaire")');await pg.wait_for_timeout(150)
        check('boutique de fragments : exclusives absentes',await ev('![...document.querySelectorAll("#gachaY [onclick^=\'shopBuy(\']")].some(b=>/boreal|megathal/.test(b.getAttribute("onclick")))'))
        await ev('S.shards=999;shopBuy("boreal")');check('achat direct refusé',await ev('!S.team.some(d=>d.type==="boreal")'))
        await ev('S.tickets=200;offerBuy("leg")');check('appel au choix : exclusives absentes',await ev('S.offer&&S.offer.keys.length===3&&!S.offer.keys.some(k=>SPEC[k].ex)'));await ev('S.offer=null;closeModal()')
        # ---- paliers d'étoiles
        await ev('S.far.stars={};for(let i=1;i<=10;i++)S.far.stars[i]=3;go("far")');tk=await ev('S.tickets')
        await pg.locator('#far .starbar button').click()
        check('palier de 30 étoiles (vrai clic)',await ev('S.far.starCl')==1 and await ev('S.tickets')==tk+3)
        # ---- bestiaire des créatures, succès, sauvegarde
        check('bestiaire : 8 créatures de plus',await ev('CX_ALL().length')==38)
        check('succès « Gardiens ralliés » à 1/4',await ev('ACH.find(a=>a[0]==="far4")[3]()')==1)
        # ---- journaux : celui de l'île ne compte que ses 14 pages, le Grand Nord a le sien
        await ev('S.far.lore={far1:1,far10:1};go("achs")');await pg.wait_for_timeout(150)
        txt=await ev('document.getElementById("achs").innerText')
        check('journal de l\'île : 14 pages, journal du Grand Nord : 2 / 8',' / 14 pages' in txt and '2 / 8 pages' in txt,txt[-400:])
        await pg.locator('#achs .farjournal button').nth(1).click();await pg.wait_for_timeout(100)
        check('relire une page du Grand Nord (vrai clic)',await ev('!document.getElementById("loreVeil").classList.contains("hide")&&document.getElementById("loreWho").textContent==="Mammouth ancestral"'))
        await ev('loreClose()')
        await ev('save()');await pg.reload();await pg.wait_for_timeout(400)
        check('progression conservée après rechargement',await ev('S.far.stage')==20 and await ev('S.team.some(d=>d.type==="cryostego")'))
        await ev('setPref("anim",false);go("far")');check('pas de défilement horizontal',await ev('document.documentElement.scrollWidth<=innerWidth+1'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
