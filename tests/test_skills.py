import asyncio,sys,pathlib,json
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
        await pg.goto(GAME);await pg.wait_for_timeout(300);await pg.evaluate('setPref("anim",false);setPref("lore",false)')
        ev=pg.evaluate
        # --- données
        n=await ev('Object.keys(SPEC).length');check('80 espèces',n==80,n)
        bad=await ev('Object.keys(SPEC).filter(k=>!SK[SPEC[k].sk]||(SPEC[k].pa&&!PA[SPEC[k].pa]))');check('toutes les espèces ont compétence+attribut valides',bad==[],bad)
        used=await ev('[...new Set(Object.values(SPEC).map(s=>s.sk))].length');check('22 compétences utilisées',used==22,used)
        pas=await ev('[...new Set(Object.values(SPEC).map(s=>s.pa))].length');check('19 attributs utilisés',pas==19,pas)
        rar=await ev('Object.values(SPEC).reduce((a,s)=>(a[s.r]=(a[s.r]||0)+1,a),{})');print('raretés',rar)
        # --- chaque compétence, effet vérifié
        setup='S.team=[{id:1,type:"raptor",level:10,xp:0},{id:2,type:"trike",level:10,xp:0},{id:3,type:"stego",level:10,xp:0}];S.nextId=10;'
        async def fresh(sk):
            await ev(setup+f'SPEC.raptor.sk="{sk}";SPEC.raptor.pa="";SPEC.trike.pa="";SPEC.stego.pa="";startBattle({{mode:"story",n:30}});fight.enemies.forEach(e=>{{e.tr="";e.sh=0}});fight.cd=[0,0,0];fight.hp=fight.hp.map(h=>Math.round(h*.5))')
        res={}
        for sk in ['strike','cleave','roar','heal','selfheal','shield','stun','burn','poison','drain','focus','charge','reorb','execute']:
            await fresh(sk)
            before=await ev('({e:fight.enemies[0].hp,hp:[...fight.hp],sp:fight.sp,orbs:fight.orbs.join()})')
            await ev('useSkill(0)')
            a=await ev('({e:fight.enemies[0].hp,hp:[...fight.hp],sp:fight.sp,buff:fight.buff,stun:fight.stun,dots:fight.dots.length,crit:fight.crit,cd:fight.cd[0],orbs:fight.orbs.join(),combo:fight.combo,over:fight.over})')
            ok={'strike':a['e']<before['e'],'cleave':a['e']<before['e'] and a['sp']==before['sp']+10,'roar':a['buff']['atk']==3,
             'heal':all(x>y for x,y in zip(a['hp'],before['hp'])),'selfheal':sum(a['hp'])>sum(before['hp']),'shield':a['buff']['shield']==2,
             'stun':a['stun']==1 and a['e']<before['e'],'burn':a['dots']==1 and a['e']<before['e'],'poison':a['dots']==1,
             'drain':a['e']<before['e'] and a['hp'][0]>before['hp'][0],'focus':a['crit']==True,'charge':a['sp']==before['sp']+50,
             'reorb':a['combo']==1,'execute':a['e']<before['e']}[sk]
            check('compétence '+sk,ok and a['cd']>=2,(before,a))
            await ev('useSkill(0)');b2=await ev('fight.cd[0]');check('  cooldown bloque la réutilisation '+sk,b2==a['cd'])
        # --- passifs
        await fresh('strike')
        await ev('SPEC.raptor.pa="lastbreath";fight.hp[0]=5;fight.lb=[false,false,false];hitDino(0,9999,fight.enemies[0])');h=await ev('fight.hp[0]');check('dernier souffle -> 1 PV',h==1,h)
        await ev('hitDino(0,9999,fight.enemies[0])');h=await ev('fight.hp[0]');check('dernier souffle une seule fois',h==0,h)
        await fresh('strike');await ev('SPEC.raptor.pa="thorns";fight.hp[0]=500;fight.mx[0]=500;fight.buff.shield=0');e0=await ev('fight.enemies[0].hp');await ev('hitDino(0,100,fight.enemies[0])');e1=await ev('fight.enemies[0].hp');check('piquants renvoient des dégâts',e1<e0)
        await fresh('strike');await ev('fight.hp[0]=Math.floor(fight.mx[0]*.4)');a0=await ev('atkOf(0)');await ev('SPEC.raptor.pa="berserk"');a1=await ev('atkOf(0)');check('fureur +40% sous 50% PV',abs(a1/a0-1.4)<.02,(a0,a1))
        await ev('SPEC.raptor.pa="";SPEC.trike.pa="leader"');a2=await ev('atkOf(0)');check('alpha de meute +8%',abs(a2/a0-1.08)<.02,(a0,a2))
        await ev('SPEC.trike.pa="";SPEC.raptor.pa="tank";SPEC.stego.pa="";fight.hp=[1e9,1e9,1e9]');c=await ev('(()=>{let n=0;for(let i=0;i<3000;i++)if(pickTarget()===0)n++;return n/3000})()');check('provocation ~60% des cibles',.5<c<.7,c)
        await ev('SPEC.raptor.pa="swift";fight.hp=[1e9,1e9,1e9];fight.buff.shield=0');await ev('let n=0;for(let i=0;i<2000;i++){const b=fight.hp[0];hitDino(0,50,fight.enemies[0]);if(fight.hp[0]===b)n++}window.__d=n/2000');d=await ev('window.__d');check('agilité ~20% d\'esquive',.14<d<.26,d)
        await ev('SPEC.raptor.pa="";SPEC.trike.pa="guard";fight.buff.shield=0;fight.hp=[1e9,1e9,1e9];fight.hurt={}');await ev('const b=fight.hp[1];hitDino(1,1000,fight.enemies[0]);window.__g=b-fight.hp[1]');g=await ev('window.__g');await ev('SPEC.trike.pa="";const c=fight.hp[1];hitDino(1,1000,fight.enemies[0]);window.__n=c-fight.hp[1]');nrm=await ev('window.__n');check('armure -15%',g<nrm and abs(g/nrm-.85)<.05,(g,nrm))
        # pillard : +20% pierres
        await ev(setup+'SPEC.raptor.pa="lucky";S.stage=0;startBattle({mode:"story",n:1});const s0=S.stone;fight.enemies.forEach(e=>e.hp=1);fight.wave=2;tapOrb(0);window.__s=S.stone-s0;window.__over=fight.over');
        s=await ev('window.__s');ov=await ev('window.__over');expected=await ev('Math.round((CONFIG.battleStone+2)*1.2)');check('pillard +20% de pierres',ov=='win' and s==expected,(s,expected,ov))
        # --- variantes
        await ev('window.__c={};for(let i=0;i<20000;i++){const v=rollVariant();__c[v]=(__c[v]||0)+1}');c=await ev('window.__c')
        check('variantes: ~78,5% normal',.76<c['normal']/20000<.81,c);check('variantes: alpha ~9%',.07<c['alpha']/20000<.11,c);check('variantes: prismatique rare',0<c.get('prism',0)/20000<.015,c)
        await ev('S.team=[{id:1,type:"raptor",level:5,xp:0,v:"shadow"}];S.nextId=5');
        r=await ev('({n:sp(S.team[0]).name,e:sp(S.team[0]).e.length>2,html:art(sp(S.team[0]).e)})');check('variante: nom + rendu coloré',r['n']=='Raptor Ombre' and 'v-shadow' in r['html'],r)
        st=await ev('(()=>{const a=stats({type:"raptor",level:5,xp:0}),b=stats({type:"raptor",level:5,xp:0,v:"shadow"});return b.atk>a.atk&&b.def<a.def})()');check('ombre: +ATQ -DÉF',st)
        await ev('S.team=[{id:1,type:"raptor",level:1,xp:0}];S.cnt={};S.dcnt={};S.tickets=200;S.stone=5000;S.mat.crystal=100;for(let i=0;i<6;i++)doGacha(10,RATE_STD(),"tickets",9,true)');
        k=await ev('({n:S.team.length,v:S.team.filter(d=>d.v&&d.v!=="normal").length,cnt:S.cnt.variants||0,html:document.getElementById("summonResult").innerHTML.includes("rarity")})');check('gacha crée des variantes + compteur',k['n']>=60 and k['v']==k['cnt'] and k['v']>0,k)
        # --- fusion / recyclage / slots
        await ev('S.team=[{id:1,type:"rex",level:1,xp:0},{id:2,type:"trike",level:1,xp:0},{id:3,type:"stego",level:1,xp:0},{id:4,type:"rex",level:1,xp:0},{id:5,type:"raptor",level:4,xp:0}];S.nextId=9;render()')
        await ev('fuse(1)');r=await ev('({n:S.team.length,s:S.team[0].star,has4:S.team.some(d=>d.id===4)})');check('fusion: +1★ et doublon consommé',r['n']==4 and r['s']==1 and not r['has4'],r)
        await ev('fuse(1)');r=await ev('S.team.length');check('fusion sans doublon: rien ne se passe',r==4,r)
        v=await ev('recycleValue(S.team[3])');await ev('S.stone=0;recycle(5)');r=await ev('({n:S.team.length,st:S.stone})');check('recyclage: dino retiré + pierres',r['n']==3 and r['st']==v['stone'] and v['stone']>0,(r,v))
        await ev('recycle(1)');r=await ev('S.team.length');check('recyclage: équipe protégée',r==3,r)
        await ev('setSlot(3,0)');r=await ev('S.team[0].id');check('setSlot échange les places',r==3,r)
        # --- collection / bestiaire / filtres
        await ev('S.team=[];for(let i=0;i<30;i++)S.team.push({id:i+1,type:Object.keys(SPEC)[i%46],level:1+i%7,xp:0});S.nextId=100;colF.lim=12;colF.r="all";colF.book=false;go("team")')
        r=await ev('document.querySelectorAll("#collection > .panel").length');check('collection: pagination à 12',r==12,r)
        await ev('colSet("lim",24)');r=await ev('document.querySelectorAll("#collection > .panel").length');check('collection: voir plus',r==24,r)
        await ev('colSet("r","Légendaire")');r=await ev('[...document.querySelectorAll("#collection .rarity")].every(e=>e.textContent=="Légendaire"||!e.closest(".panel"))');check('collection: filtre rareté',r)
        await ev('colSet("r","all");colSet("book",true)');r=await ev('document.querySelectorAll("#colTools .dx").length');check('bestiaire affiche 80 espèces',r==80,r)
        r=await ev('document.querySelectorAll("#colTools .dx.no").length');print('espèces non découvertes (attendu 16):',r)
        # --- admin
        await ev('S.team=[{id:1,type:"raptor",level:1,xp:0}];go("home");openAdmin();addAdminDino()');
        await ev('(()=>{const el=[...document.querySelectorAll(".adminitem")].pop();el.querySelector("[data-field=name]").value="Test-saure";el.querySelector("[data-field=sk]").value="execute";el.querySelector("[data-field=pa]").value="crit"})()')
        await ev('saveAdmin()');r=await ev('Object.values(SPEC).find(s=>s.name==="Test-saure")');check('admin: nouvel dino avec compétence/attribut',r and r['sk']=='execute' and r['pa']=='crit',r)
        r=await ev('JSON.parse(localStorage.getItem("arkPrimalConfig")).dinos');check('admin: sauvegardé en local',any(v['name']=='Test-saure' for v in r.values()))
        # --- robustesse : chaque espèce en combat, actions aléatoires
        await pg.reload();await pg.wait_for_timeout(300)
        bad=[]
        for key in await ev('Object.keys(SPEC)'):
            for tier in (10,60):
                r=await ev('''(k,n)=>{S.team=[{id:1,type:k,level:Math.ceil(n/2)+1,xp:0,v:["normal","alpha","shadow","albino","golden","prism"][Math.floor(Math.random()*6)]},{id:2,type:"trike",level:Math.ceil(n/2)+1,xp:0},{id:3,type:"stego",level:Math.ceil(n/2)+1,xp:0}];S.stage=99;
                  startBattle({mode:"story",n});let g=0,nan=false;while(!fight.over&&g++<600){const a=Math.random();
                   if(fight.sp>=100&&a<.5)special();else{const rd=[0,1,2].filter(i=>fight.hp[i]>0&&fight.cd[i]<=0);if(rd.length&&a<.7)useSkill(rd[0]);else tapOrb(Math.floor(Math.random()*9))}
                   if(fight.hp.some(h=>!Number.isFinite(h))||!Number.isFinite(fight.enemies[fight.wave].hp))nan=true}
                  return {over:fight.over,nan,g}}''',[key,tier]) if False else await pg.evaluate('''([k,n])=>{S.team=[{id:1,type:k,level:Math.ceil(n/2)+1,xp:0,v:["normal","alpha","shadow","albino","golden","prism"][Math.floor(Math.random()*6)]},{id:2,type:"trike",level:Math.ceil(n/2)+1,xp:0},{id:3,type:"stego",level:Math.ceil(n/2)+1,xp:0}];S.stage=99;
                  startBattle({mode:"story",n});let g=0,nan=false;while(!fight.over&&g++<600){const a=Math.random();
                   if(fight.sp>=100&&a<.5)special();else{const rd=[0,1,2].filter(i=>fight.hp[i]>0&&fight.cd[i]<=0);if(rd.length&&a<.7)useSkill(rd[0]);else tapOrb(Math.floor(Math.random()*9))}
                   if(fight.hp.some(h=>!Number.isFinite(h))||!Number.isFinite(fight.enemies[fight.wave].hp))nan=true}
                  return {over:fight.over,nan,g}}''',[key,tier])
            if r['nan'] or not r['over']:bad.append((key,tier,r))
        check('80 espèces × 2 niveaux: combats terminés, aucun NaN',bad==[],bad[:3])
        # --- captures HUD
        await ev(setup+'S.stage=30;startBattle({mode:"story",n:31});useSkill(0);tapOrb(0)');await pg.screenshot(path='/tmp/ark_hud_battle.png',full_page=True)
        await ev('go("team")');await pg.screenshot(path='/tmp/ark_hud_team.png')
        check('aucune erreur JavaScript',errs==[],errs)
        print('ÉCHECS:',FAILS if FAILS else 'aucun');await b.close()
asyncio.run(main())
sys.exit(1 if FAILS else 0)  # échec visible pour tools/run_tests.sh
