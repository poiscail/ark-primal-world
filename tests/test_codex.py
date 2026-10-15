"""Bestiaire des créatures : ennemis vaincus notés (pas en Arène), toutes les créatures rencontrables (2e vague variée),
panneau dans Succès (silhouettes, compteur), succès associés, sauvegarde compatible (champ foes)."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"spino",level:80,xp:0},{id:2,type:"gaia",level:80,xp:0},{id:3,type:"giga",level:80,xp:0}];S.stage=99;S.nextId=10;S.items=[];S.tut={off:true,seen:{}};ens();render();setPref("anim",false);'
PLAY='''(o=>{startBattle(o);let g=0;while(!fight.over&&g++<300){if(fight.sp>=100)special();else tapOrb(0)}return fight.over})'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await ev(BASE)
        check('champ foes initialisé',await ev('typeof S.foes==="object"&&Object.keys(S.foes).length===0'))
        check('30 entrées (20 créatures + 10 dinos corrompus)',await ev('CX_ALL().length')==30)
        # toutes les créatures sont rencontrables : on parcourt les sources d'ennemis
        reach=await ev('''(()=>{const seen=new Set(),add=(e,f)=>{const L=enemyLook(e,f);if(L)seen.add(L.k||"c:"+L.cor)};
          for(let n=1;n<=100;n++){const f={o:{mode:"story"},n,zone:"Niv. "+n+" · "+zoneOf(n)[0],enemies:[]};const z=zoneOf(n);
           [z[1][0],z[1][1],n%10===0?"👹":"🦖"].forEach((x,i)=>{const e={e:x,el:"redorb",name:"x · Ennemi",boss:i===2&&n%10===0};f.enemies[i]=e;f.wave=i;cxVary(e,f);add(e,f)})}
          DUN.forEach((d,di)=>[1,2].forEach(t=>{const f={o:{mode:"dungeon",d:di,tier:t},zone:d.n,enemies:[]};[d.en[0],d.en[1],"👹"].forEach((x,i)=>{const e={e:x,el:d.el,name:"x · Ennemi",boss:i===2};f.enemies[i]=e;f.wave=i;cxVary(e,f);add(e,f)})}));
          ["🦴","🐗","🦂","🐙","🦇","🗿","🐉","👹"].forEach(x=>add({e:x,el:"redorb",name:"Tour · Ennemi",boss:x==="👹"},{o:{mode:"tower"},zone:"Tour · Étage 1"}));
          EVENTS.forEach(ev=>ev.en.forEach(x=>add({e:x,el:ev.el,name:"x · Ennemi"},{o:{mode:"event"},zone:ev.n})));
          return CX_ALL().filter(x=>!seen.has(x.id)).map(x=>x.id)})()''')
        check('toutes les créatures du bestiaire sont rencontrables',reach==[],reach)
        r=await ev(PLAY,{'mode':'story','n':3});check('victoire (histoire 3)',r=='win')
        f=await ev('JSON.stringify(S.foes)');check('ennemis vaincus notés (dont le Sarcosuchus)','"croc"' in f and await ev('Object.values(S.foes).reduce((a,b)=>a+b,0)')==3,f)
        await ev(PLAY,{'mode':'story','n':4})
        check('niveau pair : 2e vague = dilophosaure, impair = Titanoboa',await ev('!!S.foes["c:dilopho"]&&!!S.foes.snake'),await ev('JSON.stringify(S.foes)'))
        n0=await ev('Object.values(S.foes).reduce((a,b)=>a+b,0)')
        await ev(PLAY,{'mode':'arena','go':True,'d':0,'n':10,'team':'Test','sp':['raptor','trike','rex']})
        check('arène : non comptée',await ev('Object.values(S.foes).reduce((a,b)=>a+b,0)')==n0)
        # panneau
        await ev('go("achs");cxToggle()');await pg.wait_for_timeout(150)
        check('panneau du bestiaire dans Succès',await ev('!!document.getElementById("codexBox")&&document.querySelectorAll("#codexBox .cx").length===30'))
        check('silhouettes pour les créatures non vaincues',await ev('document.querySelectorAll("#codexBox .cx.no").length')==30-await ev('cxSeen()'))
        check('compteur affiché',('%d / 30'%await ev('cxSeen()')) in await ev('document.getElementById("codexBox").textContent'))
        check('succès Naturaliste et Encyclopédie vivante',await ev("ACH.some(a=>a[0]==='cx1')&&ACH.some(a=>a[0]==='cx2'&&a[6]===\"Naturaliste de l'île\")"))
        await ev('save()');await pg.reload();await pg.wait_for_timeout(300)
        check('bestiaire conservé après rechargement',await ev('(ens(),Object.keys(S.foes).length)')>=4)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
