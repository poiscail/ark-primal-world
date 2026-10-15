"""Bestiaire des ennemis : chaque ennemi d'histoire, de donjon, de Tour et d'événement a un sprite dédié (créature) ou un
dinosaure corrompu ; SVG valides ; noms affichés ; l'Arène garde les portraits d'espèces ; mode emoji respecté."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"spino",level:60,xp:0},{id:2,type:"trike",level:60,xp:0},{id:3,type:"raptor",level:60,xp:0}];S.stage=99;S.nextId=10;S.items=[];S.tut={off:true,seen:{}};ens();render();'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await ev(BASE)
        # tous les emojis d'ennemis utilisés par le jeu
        emos=await ev('[...new Set([...ZONES.flatMap(z=>z[1]),...DUN.flatMap(d=>d.en),...EVENTS.flatMap(e=>e.en),"🦴","🐗","🦂","🐙","🦇","🗿","🐉","👹","🦖"])]')
        miss=await ev('(l=>l.filter(x=>{const L=enemyLook({e:x,el:"redorb",name:"Test · Ennemi"},{o:{mode:"story"},zone:"Niv. 1 · Jungle"});return !L||!(L.k?BEAST[L.k]:SPEC[L.cor])}))',emos)
        check('chaque ennemi a un sprite dédié ou un dino corrompu (%d emojis)'%len(emos),miss==[],miss)
        beasts=await ev('Object.keys(BEAST)')
        check('au moins 18 créatures dessinées',len(beasts)>=18,len(beasts))
        bad=await ev('''(()=>{const P=new DOMParser(),out=[];for(const k of Object.keys(BEAST))for(const el of ["redorb","blueorb","greenorb","purpleorb","goldorb"]){const s=beastSVG(k,el,false);const d=P.parseFromString(s,"image/svg+xml");if(!s.startsWith("<svg")||d.querySelector("parsererror"))out.push(k+"/"+el)}
          for(const t of ["raptor","dilopho","allo","giga","spino","trike","stego","mosa","argento","ptera"]){const s=corruptSVG(t,"blueorb",{boss:true});const d=P.parseFromString(s,"image/svg+xml");if(!s.startsWith("<svg")||d.querySelector("parsererror"))out.push("cor:"+t)}return out})()''')
        check('SVG bien formés (créatures × 5 éléments, dinos corrompus)',bad==[],bad)
        check('teinte selon l\'élément',await ev('beastSVG("wolf","redorb")!==beastSVG("wolf","blueorb")'))
        # le correctif des yeux n'altère pas les portraits des dinos du joueur
        same=await ev('(()=>{Object.keys(PCACHE).forEach(k=>delete PCACHE[k]);const a=portrait("raptor");corruptSVG("raptor","redorb",{});Object.keys(PCACHE).forEach(k=>delete PCACHE[k]);const b=portrait("raptor");return a===b&&!a.includes("eglow")})()')
        check('portraits du joueur inchangés',same)
        # scène : histoire, donjon, tour, événement
        for js,want,cls in [('startBattle({mode:"story",n:3})','Sarcosuchus','beast'),('startBattle({mode:"story",n:4});fight.wave=2;renderBattle()','corrompu (élite)','corrupt'),
                            ('startBattle({mode:"story",n:40});fight.wave=2;renderBattle()','Gardien','crown'),('startBattle({mode:"dungeon",d:2,tier:1,n:3})','Golem de cristal','beast'),
                            ('startBattle({mode:"dungeon",d:3,tier:2,n:15});fight.wave=2;renderBattle()','Gardien','crown'),('S.tower.floor=3;startBattle({mode:"tower"})','Tour · ','beast'),
                            ('startBattle({mode:"event",t:0,wk:wkNow()});fight.wave=2;renderBattle()','(gardien)','crown')]:
            await ev(js);await pg.wait_for_timeout(150)
            nm=await ev('fight.enemies[fight.wave].name');hud=await ev('document.querySelector(".sHud .grow>b").textContent');c=await ev('document.querySelector(".battlestage .sEnemy").className')
            check('scène %s : %s'%(js.split('(')[1][:24],nm),want in nm and hud==nm and cls in c and await ev('!!document.querySelector(".battlestage .sEnemy .sEart svg")'),(nm,hud,c))
        # arène : les équipes adverses restent des dinosaures (portraits d'espèces)
        await ev('startBattle({mode:"arena",go:true,d:0,n:20,team:"Test",sp:["raptor","trike","rex"]})');await pg.wait_for_timeout(150)
        c=await ev('document.querySelector(".battlestage .sEnemy").className');nm=await ev('fight.enemies[0].name')
        check('arène : portrait d\'espèce, nom inchangé',not any(x in c for x in ('beast','corrupt')) and nm.startswith('Raptor'),(c,nm))
        # mode emoji
        await ev('setPref("art","emoji");startBattle({mode:"story",n:3})');await pg.wait_for_timeout(150)
        check('mode emoji : emoji conservé',await ev('!document.querySelector(".battlestage .sEnemy svg")&&document.querySelector(".battlestage .sEnemy .emo").textContent.includes("🐊")'))
        await ev('setPref("art","svg")')
        # un combat complet (la mort de l'ennemi copie son sprite en fantôme)
        await ev('startBattle({mode:"story",n:5})')
        for _ in range(60):
            if await ev('fight.over'):break
            await ev('tapOrb(0)');await pg.wait_for_timeout(60)
        check('combat complet avec les nouveaux sprites',await ev('fight.over')=='win')
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
