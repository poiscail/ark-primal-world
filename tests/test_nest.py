"""Nid d'élevage, événements et règles du Défi du jour (0.26) : verrou, onglet Quêtes > Nid (vrais clics), choix des parents
(famille, niveau, exclusives, parents occupés), ponte (coût, durée), accélération, éclosion, hérédité (gènes, mutations,
variantes, générations), statistiques (gènes + empreinte), empreinte en combat, badge et rappel, Saison des amours,
8 événements (décors, créatures, essence doublée, œufs), 4 règles du jour (Colosse, Surcharge, Critiques, Blessures),
succès, sauvegarde."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
SETUP='''S.team=[{id:1,type:"rex",level:30,xp:0},{id:2,type:"giga",level:24,xp:0,v:"alpha"},{id:3,type:"raptor",level:20,xp:0},{id:4,type:"trike",level:12,xp:0},
 {id:5,type:"proto",level:8,xp:0},{id:6,type:"cryostego",level:20,xp:0},{id:7,type:"maia",level:15,xp:0}];S.nextId=20;S.stage=%d;S.level=10;
 S.mat={bone:60,hide:60,crystal:20,amber:20};S.essence=200;S.items=[];S.eggs=[];S.tut={off:true,seen:{}};S.nest=null;nestSel={a:null,b:null};ens();save();go("nest")'''
WIN='''()=>{let g=0;while(fight&&!fight.over&&g++<20){const e=fight.enemies[fight.wave];e.hp=1;e.sh=0;tapOrb(0)}return fight.over}'''
SWAP='''(name)=>{const i=wkNow()%EVENTS.length,j=EVENTS.findIndex(e=>e.n===name);const t=EVENTS[i];EVENTS[i]=EVENTS[j];EVENTS[j]=t;return [i,j]}'''
UNSWAP='''([i,j])=>{const t=EVENTS[i];EVENTS[i]=EVENTS[j];EVENTS[j]=t}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false')
        # ---- verrou
        await ev(SETUP%10)
        check('verrouillé avant le niveau 15',"s'ouvre au niveau 15" in await ev('document.getElementById("nest").innerText'))
        await ev('nestSel={a:1,b:2};nestLay()');check('ponte refusée avant le niveau 15',await ev('!S.nest.slots.some(Boolean)'))
        # ---- onglet et choix des parents (vrais clics)
        await ev(SETUP%20);await ev('go("missions")');await pg.click('#subnav button:has-text("Nid")');await pg.wait_for_timeout(150)
        check('Quêtes > Nid (vrai clic)',await ev('screen')=='nest' and await ev('!!document.querySelector("#nest .nestnew")'))
        await pg.locator('#nest .nestpar').nth(0).click();await pg.wait_for_timeout(100)
        rows=await ev('[...document.querySelectorAll("#modalBody .nprow")].map(b=>b.innerText.split("\\n")[0].toLowerCase())')
        check('parent 1 : niveau 10 ou plus, sans les exclusives du Grand Nord',len(rows)==5 and not any('protocératops' in r or 'cryostégosaure' in r for r in rows),rows)
        await pg.locator('#modalBody .nprow:has-text("Tyrannosaure")').click();await pg.wait_for_timeout(100)
        check('parent 1 choisi (vrai clic)',await ev('nestSel.a')==1 and await ev('document.getElementById("modalVeil").classList.contains("hide")'))
        await pg.locator('#nest .nestpar').nth(1).click();await pg.wait_for_timeout(100)
        rows=await ev('[...document.querySelectorAll("#modalBody .nprow")].map(b=>b.innerText.split("\\n")[0].toLowerCase())')
        check('parent 2 : même famille seulement (théropodes), sans le parent 1',len(rows)==2 and all(('giganotosaure' in r or 'raptor' in r) for r in rows),rows)
        await pg.locator('#modalBody .nprow:has-text("Giganotosaure")').click();await pg.wait_for_timeout(100)
        info=await ev('document.querySelector("#nest .nestnew").innerText')
        check('résumé : espèces possibles, gènes, mutation, variante, durée, coût','Tyrannosaure ou Giganotosaure' in info and 'Mutation : 20 %' in info and 'variante : 20 %' in info and '3 h' in info,info[-400:])
        check('changer le parent 1 pour une autre famille efface le parent 2',await ev('(()=>{nestSet("a",4);const r=nestSel.b===null;nestSet("a",1);nestSet("b",2);return r})()'))
        check('exclusive refusée comme parent',(await ev('nestWhy(S.team.find(d=>d.type==="cryostego"))')).startswith('Les gardiens'))
        m0=await ev('({...S.mat})');sp0=await ev('nestSpeed()')
        await pg.locator('#nest .nestnew button.blue').click();await pg.wait_for_timeout(100)
        sl=await ev('S.nest.slots[0]')
        check('ponte (vrai clic) : œuf dans le nid 1',sl is not None and sl['a']==1 and sl['b']==2 and sl['type'] in ('rex','giga'),sl)
        m1=await ev('S.mat');check('coût épique prélevé (8 cuir, 8 os, 3 ambre)',m0['hide']-m1['hide']==8 and m0['bone']-m1['bone']==8 and m0['amber']-m1['amber']==3,(m0,m1))
        check('incubation : 3 h pour un petit épique (÷ Saison des amours)',sl and abs((sl['t1']-sl['t0'])-180*60000/sp0)<1000,sl and sl['t1']-sl['t0'])
        check('les parents veillent sur l\'œuf (occupés)',await ev('nestBusy(S.team[0])&&nestBusy(S.team[1])&&!nestOk(S.team[0])'))
        check('compte à rebours et un seul nid avant le niveau 40',await ev('!!document.querySelector("#nest [data-egg=\'0\'] .nleft")')and 'Tous les nids sont occupés' in await ev('document.getElementById("nest").innerText'))
        es0=await ev('S.essence');c=await ev('nestRushCost(S.nest.slots[0])')
        await pg.locator('#nest .nrush').click();await pg.wait_for_timeout(100)
        check('accélérer (vrai clic) : 1 essence par quart d\'heure restant',await ev('S.essence')==es0-c and c==-(-int(180/sp0)//15) and await ev('nestLeft(S.nest.slots[0])')==0,(es0,c))
        n0=await ev('S.team.length')
        await pg.locator('#nest button.nesthatch').click();await pg.wait_for_timeout(150)
        bb=await ev('S.team[S.team.length-1]')
        check('éclosion (vrai clic) : un petit rejoint la meute',await ev('S.team.length')==n0+1 and bb['baby']==1 and bb['gen']==2 and bb['level']==12 and bb['type'] in ('rex','giga'),bb)
        check('révélation « un petit est né » avec ses gènes',await ev('!document.getElementById("gachaVeil").classList.contains("hide")&&/UN PETIT EST NÉ/.test(document.getElementById("gachaBody").innerText)&&!!document.querySelector("#gachaBody .nestborn .gtag")'))
        await pg.locator('#gachaBody > button.wide').click();await pg.wait_for_timeout(100)
        check('nid libéré, compteur, mission',await ev('S.nest.slots[0]===null&&S.nest.hatched===1&&S.dcnt.nestHatch===1&&!nestBusy(S.team[0])'))
        # ---- hérédité (4000 tirages)
        r=await ev('''(()=>{const A={type:"rex",gn:{hp:3,atk:0},gen:2,level:30,v:"normal"},B={type:"giga",gn:{hp:1,atk:4},gen:4,level:21,v:"alpha"},N=4000;let mut=0,rex=0,va=0,hp3=0,ok=true;
          for(let i=0;i<N;i++){const x=nestBaby(A,B);if(x.mut)mut++;if(x.type==="rex")rex++;if(x.v==="alpha")va++;if(x.gn.hp>=3)hp3++;if(x.gn.hp>5||x.gn.atk>5||x.gen!==5||x.lv!==10)ok=false}
          let mut2=0;for(let i=0;i<N;i++)if(nestBaby(A,{...A}).mut)mut2++;
          const M={type:"rex",gn:{hp:5,atk:5},gen:9,level:40,v:"normal"};let cap=true;for(let i=0;i<500;i++){const x=nestBaby(M,{...M});if(x.mut||x.gn.hp!==5||x.gn.atk!==5)cap=false}
          return {mut:mut/N,rex:rex/N,va:va/N,hp3:hp3/N,ok,mut2:mut2/N,cap}})()''')
        check('hérédité : espèce d\'un parent (≈ 50 %)',abs(r['rex']-.5)<.04,r)
        check('hérédité : meilleur gène à 70 %',abs(r['hp3']-.7)<.04,r)
        check('mutation : 20 % (35 % en lignée pure)',abs(r['mut']-.2)<.03 and abs(r['mut2']-.35)<.035,r)
        check('variante d\'un parent : ≈ 20 %',abs(r['va']-.21)<.035,r)
        check('génération = max + 1, niveau = moitié du plus faible, 5 points au plus',r['ok'] and r['cap'],r)
        # ---- statistiques
        r=await ev('''(()=>{const a={id:99,type:"rex",level:30,xp:0},b={...a,gn:{hp:5,atk:2}},c={...b,imp:3},s=[a,b,c].map(stats);return [s[1].hp/s[0].hp,s[1].atk/s[0].atk,s[2].hp/s[0].hp,s[2].def===s[0].def]})()''')
        check('gènes : +10 % PV (5 points), +4 % ATQ (2 points) ; empreinte 3 : +9 %',abs(r[0]-1.10)<.004 and abs(r[1]-1.04)<.004 and abs(r[2]-1.19)<.004 and r[3],r)
        await ev('go("team")');await pg.wait_for_timeout(100)
        check('fiche du dino : ligne des gènes et de l\'empreinte',await ev('[...document.querySelectorAll("#collection .genes")].some(x=>/G2/.test(x.textContent)&&/0\\/3/.test(x.textContent))'))
        # ---- empreinte en combat
        await ev('const bb=S.team.pop();S.team.unshift(bb);fight=null;startBattle({mode:"story",n:3})');await ev(WIN)
        check('empreinte : +1 après une victoire dans l\'équipe',await ev('S.team[0].imp')==1)
        for _ in range(3):await ev('fight=null;startBattle({mode:"story",n:3})');await ev(WIN)
        check('empreinte plafonnée à 3',await ev('S.team[0].imp')==3)
        # ---- badge, rappel
        await ev('nestSel={a:S.team[0].id,b:3};nestLay();S.nest.slots[0].t1=Date.now()-1;go("nest")');await pg.wait_for_timeout(100)
        check('œuf prêt : badge sur le Nid et rappel « À faire »',await ev('badge("nest")')==1 and await ev('!!document.querySelector("#subnav button.on .nb")') and await ev('todoItems().some(x=>/éclore/.test(x.t))'))
        await ev('nestHatch(0);closeGacha()')
        # ---- 2e nid au niveau 40
        await ev('S.stage=40;go("nest")');check('2e nid au niveau 40',await ev('nestSlots()')==2)
        # ---- Saison des amours
        sw=await ev(SWAP,'Saison des amours');await ev('go("nest")')
        check('Saison des amours : incubation ×2, bandeau',await ev('nestSpeed()')==2 and await ev('!!document.querySelector("#nest .nestev")'))
        e0=await ev('S.eggs.length');await ev('''(()=>{const r=Math.random;Math.random=()=>0;window.__ew=eventWin({o:{mode:"event",t:0}},20);Math.random=r})()''')
        check('Saison des amours : œuf gagné à l\'épreuve',await ev('S.eggs.length')==e0+1 and 'trouvé' in await ev('window.__ew.extra'),e0)
        await ev(UNSWAP,sw)
        # ---- 8 événements
        check('8 événements, les 4 anciens inchangés en tête',await ev('EVENTS.length')==8 and await ev('EVENTS.slice(0,4).map(e=>e.n).join()')=="Ruée des Os,Marée de Cristal,Tempête d'Ambre,Chasse au Colosse")
        for name,zn,cr in [('Grand Froid','toundra','mammoth|cavebear|smilodon'),('Nuit des Abysses','abysses','squid|jelly|angler'),('Saison des amours','jungle','terrorbird|boar|wolf'),('Pluie de météores','volcan','salamander|wyvern|golem')]:
            sw=await ev(SWAP,name);await ev('fight=null;startBattle({mode:"event",t:0,wk:wkNow()})');await pg.wait_for_timeout(50)
            st=await ev('document.querySelector("#battleArea .battlestage").className');en=await ev('document.querySelector("#battleArea .sEnemy").className')
            import re
            check(f'événement {name} : décor et créature',('z-'+zn) in st and re.search('b-('+cr+')',en) is not None,(st,en))
            if name=='Pluie de météores':
                check('Pluie de météores : essence doublée',await ev('eventWin({o:{mode:"event",t:1}},45).R.essence')==4)
            await ev(UNSWAP,sw)
        check('autre événement : essence normale',await ev('(()=>{const e=EVENTS[wkNow()%EVENTS.length];return e.ess?4:eventWin({o:{mode:"event",t:1}},45).R.essence})()')in(2,4))
        # ---- Défi du jour : règle du jour
        await ev('DRULE_FORCE=null;go("daily")');await pg.wait_for_timeout(100)
        check('règle du jour affichée',await ev('DRULES.some(r=>r.k===dchInfo().rule.k)') and 'Règle du jour' in await ev('document.querySelector("#daily .dmods").innerText'))
        DS='S.team=[{id:7,type:"maia",level:40,xp:0},{id:1,type:"rex",level:40,xp:0},{id:3,type:"raptor",level:40,xp:0},{id:8,type:"giga",level:12,xp:0,baby:1,imp:3,gen:2,gn:{hp:1,atk:2}}];S.stage=20;fight=null;DRULE_FORCE="%s";dchStart()'
        await ev(DS%'crit');base=await ev('fight.enemies.map(e=>({max:e.max,atk:e.atk}))');T=await ev('DR_TUNE')
        await ev(DS%'giant');g=await ev('({w:fight.wave,e:fight.enemies[2],chip:!!document.querySelector("#battleArea .drchip")})')
        check('Colosse solitaire : un seul ennemi qui réunit 80 % des PV des trois, ATQ +10 %',g['w']==2 and abs(g['e']['max']/sum(x['max'] for x in base)-T['giantHp'])<.01 and abs(g['e']['atk']/base[2]['atk']-T['giantAtk'])<.02 and g['chip'],(g,base))
        await ev(DS%'charge');ch=await ev('fight.enemies[0].atk')
        check('Surcharge : ennemis +10 % d\'ATQ',abs(ch/base[0]['atk']-T['chargeAtk'])<.03,(ch,base[0]))
        r=await ev('''(()=>{const f=fight,t=()=>{f.sp=0;f.combo=0;f.last=null;f.enemies[f.wave].hp=f.enemies[f.wave].max;tapOrb(0);return f.sp};const a=t(),R=f.daily.rule;f.daily.rule={k:"none"};const b=t();f.daily.rule=R;return [a,b]})()''')
        check('Surcharge : la super se remplit deux fois plus vite',r[1]>0 and r[0]==min(100,2*r[1]),r)
        r=await ev('''(()=>{const f=fight;f.sp=100;f.stun=9;f.enemies[f.wave].hp=f.enemies[f.wave].max;special();return f.log})()''')
        check('Surcharge : la super frappe 25 % plus fort','surcharge ×1,25' in r,r)
        await ev(DS%'crit')
        r=await ev('''(()=>{const r=Math.random;Math.random=()=>0;fight.enemies[fight.wave].hp=fight.enemies[fight.wave].max=1e9;tapOrb(0);Math.random=r;return fight.log})()''')
        check('Coups critiques : pour toi et pour les ennemis','CRITIQUE ×1,8' in r and 'critique ennemi' in r,r)
        await ev(DS%'deep');dp=await ev('fight.enemies[0].max')
        check('Blessures profondes : ennemis −5 % de PV',abs(dp/base[0]['max']-T['deepHp'])<.01,(dp,base[0]))
        r=await ev('''(()=>{const f=fight,h=Math.round(f.mx[1]*.5);f.hp[1]=h;renderBattle();f.hp[1]=f.mx[1];renderBattle();const a=f.hp[1];f.cd[0]=0;f.stun=9;useSkill(0);const b=f.hp[1];return [h,a,b]})()''')
        check('Blessures profondes : les PV ne remontent pas (même avec une compétence de soin)',r[1]==r[0] and r[2]<=r[0],r)
        await ev('go("battle");S.pouch=S.pouch||{};S.pouch.heal=2;pouchUse("heal")')
        check('Blessures profondes : herbe de soin refusée',await ev('S.pouch.heal')==2)
        await ev('fight.stun=0');await ev(WIN)
        check('règle réussie notée, succès « Maître des règles » à 1/4',await ev('S.dch.rules.deep')==1 and await ev('ACH.find(a=>a[0]==="dch4")[3]()')==1)
        # ---- sauvegarde
        await ev('DRULE_FORCE=null;save()');await pg.reload();await pg.wait_for_timeout(400)
        check('conservé après rechargement (nid, petit, gènes, règles)',await ev('S.nest.hatched===2&&S.team.some(d=>d.baby&&d.imp===3&&d.gen===2)&&S.dch.rules.deep===1'))
        await ev('setPref("anim",false);go("nest")');check('pas de défilement horizontal',await ev('document.documentElement.scrollWidth<=innerWidth+1'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
