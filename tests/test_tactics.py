"""Contenu 0.20 : chef d'équipe (famille ou élément, selon la rareté), liens entre voisins, météo de zone (bonus d'orbes, puce,
effet visuel), sacoche de combat (fabrication, limites, 4 effets, 3 par combat, sans prendre le tour, vrais clics), panneaux d'Équipe."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
def team(types):return 'S.team=%s.map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.nextId=20;S.stage=40;S.items=[];S.tut={off:true,seen:{}};ens();render()'%str(types).replace("'",'"')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_FORCE=null')
        # ---- chef d'équipe
        await ev(team(['rex','giga','raptor']))   # rex épique théropode ⚡ ; giga théropode 🔥 ; raptor théropode 🔥
        li=await ev('leaderInfo()');check('chef épique : +12 %',abs(li['pct']-.12)<1e-9,li['pct'])
        check('chef : tout l\'équipe de sa famille reçoit le bonus complet',li['per']==[.12,.12,.12],li['per'])
        await ev(team(['aurora','raptor','mosa']))  # aurorasaure légendaire sauropode 🌿 ; raptor 🔥 théropode ; mosa 💧 marin
        li=await ev('leaderInfo()');check('chef légendaire : +15 %, un tiers aux autres',abs(li['pct']-.15)<1e-9 and abs(li['per'][1]-.05)<1e-9 and abs(li['per'][2]-.05)<1e-9,li['per'])
        await ev(team(['ankylo','stego','kentro']))  # ankylo 🌿 (A), stego 💧 (G), kentro 🌿 (G)
        li=await ev('leaderInfo()');check('chef : même élément suffit (ankylo 🌿 -> kentro 🌿)',abs(li['per'][2]-li['pct'])<1e-9 and li['per'][1]<li['pct'],li['per'])
        # ---- liens
        lk=await ev('linksOf()');check('liens : stégosaures voisins (2-3) = lien de famille',any(l['i']==1 and l['k']=='fam' for l in lk),lk)
        await ev(team(['rex','giga','raptor']));lk=await ev('linksOf()')
        check('liens : 2 liens de famille + harmonie 🔥 (2-3)',sum(1 for l in lk if l['k']=='fam')==2 and any(l['k']=='el' and l['i']==1 for l in lk),lk)
        # ---- application au combat (PV et attaque)
        base=await ev('S.team.slice(0,3).map(d=>stats(d).hp)');mods=await ev('teamMods(S.team.slice(0,3))')
        await ev('startBattle({mode:"story",n:20})')
        mx=await ev('fight.mx');syn=await ev('fight.syn.hp')
        check('PV de combat = PV × synergie × bonus chef/liens',all(abs(mx[k]-round(round(base[k]*(1+syn))*mods[k]['hp']))<=1 for k in range(3)),(base,mx,mods))
        a1=await ev('atkOf(0)');a0=await ev('(()=>{const s=fight._tm;fight._tm=null;const v=atkOf(0);fight._tm=s;return v})()')
        check('attaque multipliée par le bonus',abs(a1/a0-mods[0]['atk'])<1e-6,(a0,a1,mods[0]['atk']))
        chips=await ev('[...document.querySelectorAll("#battleArea .ldchips .chip")].map(c=>c.textContent)')
        check('puces du chef et des liens en combat',any('Chef' in c for c in chips) and sum('🔗' in c for c in chips)==3,chips)
        # ---- météo
        await ev('WX_FORCE="pluie";startBattle({mode:"story",n:5});fight.enemies.forEach(e=>{e.tr="";e.sh=0});renderBattle()')
        check('météo appliquée en histoire',await ev('fight._wx')=='pluie')
        check('puce météo + effet sur la scène',await ev('!!document.querySelector("#battleArea .wxchip")&&document.querySelector("#battleArea .battlestage").classList.contains("wx-pluie")&&!!document.querySelector("#battleArea .battlestage .sWx")'))
        r=await ev('(()=>{const b=orbPreview("blueorb"),f=fight._wx;fight._wx=null;const n=orbPreview("blueorb"),rn=orbPreview("redorb");fight._wx=f;return [b/n,orbPreview("redorb")/rn]})()')
        check('pluie : orbes 💧 +20 %, 🔥 −15 % (aperçu)',abs(r[0]-1.2)<.01 and abs(r[1]-.85)<.01,r)
        await ev('fight.orbs[0]="blueorb";fight.combo=0;fight.last=null;fight.crit=false')
        e0=await ev('fight.enemies[fight.wave].hp');pv=await ev('orbPreview("blueorb")');await ev('tapOrb(0)');d=e0-await ev('fight.enemies[0].hp')
        check('pluie : dégâts réels ≈ aperçu (± passifs aléatoires)',d>=pv*.97,(d,pv))
        await ev('WX_FORCE="clair";startBattle({mode:"story",n:5})');check('ciel clair : ni puce ni effet',await ev('!fight._wx&&!document.querySelector("#battleArea .wxchip")'))
        await ev('WX_FORCE="pluie";startBattle({mode:"tower"})');check('pas de météo dans la Tour',await ev('!fight._wx'))
        await ev('WX_FORCE=null;WX_ON=false;startBattle({mode:"story",n:5})');check('WX_ON=false coupe la météo (simulations)',await ev('!fight._wx'));await ev('WX_ON=true')
        # ---- sacoche : fabrication
        await ev('S.mat={bone:6,hide:4,crystal:0,amber:1};S.pouch={heal:0,rage:0,smoke:0,prism:0};save();go("team");subSet("team","bag")');await pg.wait_for_timeout(200)
        check('Équipe > Sac : atelier de la sacoche visible',await ev('!!document.getElementById("pouchBox")&&document.getElementById("pouchBox").offsetParent!==null'))
        await pg.locator('#pouchBox button[onclick="pouchCraft(\'heal\')"]').click()
        check('fabriquer une herbe (vrai clic) : matériaux retirés',await ev('S.pouch.heal===1&&S.mat.hide===0&&S.mat.bone===4'),await ev('[S.pouch,S.mat]'))
        await pg.locator('#pouchBox button[onclick="pouchCraft(\'smoke\')"]').click()
        check('matériaux manquants : rien fabriqué',await ev('S.pouch.smoke===0&&S.mat.amber===1'))
        await ev('S.mat={bone:99,hide:99,crystal:99,amber:99};S.pouch.rage=9;pouchCraft("rage")');check('9 au maximum',await ev('S.pouch.rage===9&&S.mat.bone===99'))
        await ev('S.pouch={heal:2,rage:2,smoke:2,prism:2};save()')
        # ---- sacoche : combat
        await ev(team(['rex','giga','raptor'])+';S.pouch={heal:2,rage:2,smoke:2,prism:2};save();startBattle({mode:"story",n:20});fight.enemies.forEach(e=>{e.tr="";e.sh=0;e.hp=e.max=999999});renderBattle()')
        check('bouton 🎒 dans l\'en-tête du combat',await ev('!!document.querySelector("#battleArea .actl .bagbtn")'))
        await pg.click('#battleArea .bagbtn');check('fenêtre de la sacoche (vrai clic)',await ev('!!document.getElementById("pouchPop")'))
        await ev('fight.hp=fight.hp.map(h=>Math.round(h*.4))');h0=await ev('fight.hp.slice()');t0=await ev('fight.turn')
        await pg.locator('#pouchPop button[onclick="pouchUse(\'heal\')"]').click()
        h1=await ev('fight.hp');mx=await ev('fight.mx')
        check('herbe de soin : +35 % PV',all(abs(h1[k]-min(mx[k],h0[k]+round(mx[k]*.35)))<=1 for k in range(3)),(h0,h1))
        check('objet : ne prend pas le tour',await ev('fight.turn')==t0 and await ev('S.pouch.heal')==1 and await ev('fight.bagUsed')==1)
        await ev('pouchUse("rage")');check('tonique : +30 % ATQ (2 tours)',await ev('fight.buff.atk')>=2)
        await ev('fight.stun=0;pouchUse("smoke")');check('fumigène : l\'ennemi perd un tour',await ev('fight.stun')>=1)
        await ev('pouchUse("prism")');check('3 objets maximum par combat',await ev('fight.bagUsed')==3 and await ev('S.pouch.prism')==2)
        await ev('startBattle({mode:"story",n:20});fight.orbs=["redorb","redorb","goldorb","goldorb","greenorb","greenorb","blueorb","blueorb","goldorb"];pouchUse("prism")')
        check('éclat d\'orbe : au moins 5 orbes de l\'élément du chef (⚡)',await ev('fight.orbs.filter(c=>c==="purpleorb").length')>=5,await ev('fight.orbs'))
        check('sacoche conservée dans la sauvegarde',await ev('JSON.parse(localStorage.getItem("arkPrimalMobile")).pouch.prism')==1)
        # ---- écran Équipe : chef et liens
        await ev('go("team");subSet("team","pack")');await pg.wait_for_timeout(200)
        check('Équipe > Meute : panneau chef et liens',await ev('!!document.getElementById("leadBox")&&document.getElementById("leadBox").offsetParent!==null&&document.getElementById("leadBox").innerText.includes("Chef")'))
        await ev('subSet("team","bag")');check('le panneau chef est rangé dans Meute (caché dans Sac)',await ev('document.getElementById("leadBox").offsetParent===null'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
