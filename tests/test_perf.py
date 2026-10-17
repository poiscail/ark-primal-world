"""Performance (0.41, idée 463) : temps de chargement, rendu du combat, d'une orbe jouée, de l'accueil et de la collection.
Seuils larges (machine de test lente, Chromium sans carte graphique) : ils servent à repérer une régression grossière.
Les temps mesurés sont affichés à chaque lancement."""
import asyncio,pathlib,sys,os,json
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if info!='' else ''))
    if not cond:FAILS.append(name)
SEUIL={'chargement':6000,'renderBattle':80,'tapOrb':120,'accueil':150,'collection':900}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_load_state('load');await pg.wait_for_timeout(300)
        t=await ev('(()=>{const n=performance.getEntriesByType("navigation")[0];return Math.round(n.loadEventEnd||n.domContentLoadedEventEnd)})()')
        check('chargement de la page (ms)',t<SEUIL['chargement'],t)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=Object.keys(SPEC).filter(k=>!SPEC[k].ex).slice(0,60).map((k,i)=>({id:i+1,type:k,level:30,xp:0}));S.stage=40;ens();save()')
        r=await ev('''(()=>{F2.newP=F2.goldP=F2.callP=0;fight=null;startBattle({mode:"story",n:25});go("battle");const m=f=>{const a=performance.now();for(let i=0;i<20;i++)f();return (performance.now()-a)/20};
          const rb=m(()=>renderBattle());const to=m(()=>{const g=fight;if(g.over){fight=null;startBattle({mode:"story",n:25})}fight.enemies.forEach(e=>{e.hp=e.max=1e9});tapOrb(0)});
          fight=null;go("home");const ho=m(()=>render());go("team");const t0=performance.now();render();const co=performance.now()-t0;go("home");return {renderBattle:rb,tapOrb:to,accueil:ho,collection:co}})()''')
        for k,v in r.items():check('%s (ms, moyenne)'%k,v<SEUIL[k],round(v,1))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
