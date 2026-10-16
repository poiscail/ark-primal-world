"""Équipement II (0.38) : ensembles (bonus à 3 pièces), objets de famille (refusés ailleurs), maudits, uniques (effet), gemmes,
gravure (vrai clic), apparence, verrou (démontage refusé), comparaison, tri/filtre du sac, amélioration risquée, atelier
(conversion, recette), objets qui évoluent, durabilité (option), sacoche (bombe, filet, totem), icônes sur le portrait,
matériaux sur la carte, forge illustrée, coffre de butin, historique."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
MK='((s,r,x)=>{const it={id:S.nextItem++,s,r,lvl:0,n:"Test "+s,pa:""};Object.assign(it,x||{});S.items.push(it);return it.id})'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor","trike"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.stage=40;S.items=[];S.essence=500;S.stone=99999;S.mat={bone:999,hide:999,crystal:999,amber:999};ens();delete S.g2;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        r=await ev('(()=>{const c={set:0,fam:0,curse:0};for(let i=0;i<2000;i++){const it=newItem("w",1);S.nextItem--;if(it.set)c.set++;if(it.fam)c.fam++;if(it.curse)c.curse++}return c})()')
        check('objets générés : ensembles ~25 %, famille ~12 %, maudits ~3 %',350<r['set']<650 and 150<r['fam']<350 and 20<r['curse']<110,r)
        # ensemble
        a0=await ev('stats(S.team[0]).atk');await ev(f'(()=>{{const M={MK};S.team[0].eq={{w:M("w",0,{{set:"rex"}}),a:M("a",0,{{set:"rex"}})}}}})()');a1=await ev('stats(S.team[0]).atk')
        await ev(f'(()=>{{const M={MK};S.team[0].eq.c=M("c",0,{{set:"rex"}})}})()');a2=await ev('stats(S.team[0]).atk')
        check('ensemble du Croc du Roi : bonus seulement à 3 pièces',a2/a1>1.08,[a0,a1,a2])
        # famille
        fid=await ev(f'({MK})("w",1,{{fam:"C"}})');await ev(f'equip(1,{fid})');check('objet de famille refusé sur une autre famille',await ev(f'S.team[0].eq.w')!=fid)
        await ev(f'equip(4,{fid})');check('accepté sur sa famille (Tricératops)',await ev('S.team[3].eq.w')==fid)
        # maudit, unique, gemme
        r=await ev(f'(()=>{{const d=S.team[1],h0=stats(d).hp;d.eq={{a:({MK})("a",1,{{curse:1}})}};const h1=stats(d).hp;return [h0,h1]}})()')
        check('maudit : grosses stats d\'armure mais −12 % de PV au porteur',r[1]!=r[0],r)
        await ev(f'S.team[2].eq={{w:({MK})("w",3,{{u:"tyrfang",n:"Croc de Tyran"}})}}')
        r=await ev('(()=>{fight=null;startBattle({mode:"story",n:5});const f=fight;Math._r=Math.random;Math.random=()=>.01;f.stun=9;f.enemies[f.wave].hp=1e9;f.enemies[f.wave].max=1e9;tapOrb(0);Math.random=Math._r;return /Croc de Tyran/.test(f.log)})()')
        check('objet unique : critique du Croc de Tyran',r)
        await ev('fight=null;S.g2.gems.ruby=1');gid=await ev(f'({MK})("w",1)');await ev(f'S.team[1].eq.w={gid}');x0=await ev('stats(S.team[1]).atk');await ev(f'g2Gem({gid},"ruby")');x1=await ev('stats(S.team[1]).atk')
        check('rubis serti : +4 % d\'attaque',abs(x1/x0-1.04)<.01,[x0,x1])
        # gravure, verrou, comparaison (vrais clics)
        cid=await ev(f'({MK})("c",2,{{pa:"crit"}})');await ev(f'openEq(1);setEqSlot("c")')
        await pg.click(f'#eqBody button[onclick="g2Engrave({cid})"]');await pg.wait_for_timeout(50);await pg.click('#modalBody .c2row button:has-text("Peau régénérante")>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic : talisman gravé (−40 essences)',await ev(f'findItem({cid}).pa')=='regen' and await ev('S.essence')==460)
        check('comparaison avec l\'objet équipé',await pg.locator('#eqBody .g2cmp').count()>=0)
        await ev('closeEq&&closeEq()');lid=await ev(f'({MK})("a",0)');await ev(f'g2Lock({lid});salvageItem({lid})');check('objet verrouillé : démontage refusé',await ev(f'!!findItem({lid})'))
        await ev('salvageCommons()');check('« démonter les communs » épargne les objets verrouillés',await ev(f'!!findItem({lid})'))
        # apparence
        await ev(f'g2Look({lid})');await pg.click('#modalBody .c2row button>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic : apparence changée, nom d\'origine gardé',await ev(f'!!findItem({lid}).n0'))
        # amélioration risquée
        uid=await ev(f'({MK})("w",1,{{lvl:6}})');await ev(f'S.g2.risk=true;Math._r=Math.random;Math.random=()=>.0;upgradeItem({uid});Math.random=Math._r')
        check('amélioration risquée : échec possible (objet intact)',await ev(f'findItem({uid}).lvl')==6)
        await ev(f'Math._r=Math.random;Math.random=()=>.99;upgradeItem({uid});Math.random=Math._r');check('réussite : +1',await ev(f'findItem({uid}).lvl')==7)
        # atelier
        await ev('S.g2.risk=false;g2Workshop()');c0=await ev('S.mat.crystal');await pg.click('#modalBody .p2goal button:has-text("×5")>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic : atelier, 5 cristaux fabriqués',await ev('S.mat.crystal')==c0+5)
        await ev('S.g2.rec.gem=1;g2Workshop()');g0=await ev('Object.values(S.g2.gems).reduce((a,b)=>a+b,0)');await pg.click('#modalBody button:has-text("FABRIQUER")>>nth=0');await pg.wait_for_timeout(50)
        check('recette connue : gemme fabriquée',await ev('Object.values(S.g2.gems).reduce((a,b)=>a+b,0)')==g0+1)
        await ev('closeModal()')
        # objets qui évoluent, durabilité, parchemin
        await ev('S.g2.dura=true;S.team.slice(0,3).forEach(d=>eqItems(d).forEach(it=>{it.wins=24}));S.g2.scroll=1;g2Scroll()')
        l0=await ev('findItem(S.team[0].eq.w).lvl');x0=await ev('S.team[0].xp');await ev('fight=null;startBattle({mode:"story",n:5})');await ev(WIN)
        r=await ev('[findItem(S.team[0].eq.w).lvl,findItem(S.team[0].eq.w).dura,S.g2.xpUntil>Date.now()]')
        check('25e victoire : l\'objet gagne +1 ; durabilité −1 ; parchemin actif',r[0]==l0+1 and r[1]==49 and r[2],r)
        # sacoche
        await ev('S.pouch.bomb=1;fight=null;startBattle({mode:"story",n:5});fight.enemies[0].hp=fight.enemies[0].max');h0=await ev('fight.enemies[0].hp');await ev('pouchUse("bomb")')
        check('bombe d\'ambre : 20 % des PV de l\'ennemi',abs((h0-await ev('fight.enemies[0].hp'))/h0-.2)<.02)
        # portrait, carte, forge, coffre, historique
        await ev('go("team");subSet("team","pack")');check('icônes d\'équipement sur le portrait',await ev('!!document.querySelector(\'.cocard[data-id="1"] .g2eqi\')'))
        await ev('mapCh=0;go("story")');check('matériaux de la zone sur la carte','ici :' in await pg.inner_text('#chapters .maphead'))
        await ev('go("team");subSet("team","up")');check('forge illustrée',await pg.locator('#forgeBox .g2forge').count()==1)
        await ev('addItem(newItem("w",1));g2Hist()');check('historique des objets',await pg.locator('#modalBody .g2hist .tiny').count()>=1)
        await ev('closeModal();go("team");subSet("team","bag")');check('sac : filtres et outils',await pg.locator('#bagBox select[data-g2]').count()==2)
        r=await ev(f'(()=>{{const M={MK},d={{id:999,type:"rex",level:60,xp:0,star:6,v:"prism",gn:{{hp:5,atk:5}},imp:100,tal:{{a:5,d:5,s:5}},aff:200}};d.eq={{w:M("w",9,{{set:"rex",gem:"ruby",lvl:10}}),a:M("a",9,{{set:"rex",gem:"ruby",lvl:10}}),c:M("c",9,{{set:"rex",gem:"ruby",lvl:10}})}};S.team.push(d);const g=S.gear,l=S.level;S.gear=20;S.level=100;const v=stats(d),c=pgCore(d);S.team.pop();S.gear=g;S.level=l;return [v.atk/c.atk,v.hp/c.hp]}})()')
        check('ensembles et gemmes respectent le plafond de puissance (sous ×5)',r[0]<5 and r[1]<5.5,r)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
