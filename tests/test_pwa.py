import asyncio,pathlib,subprocess,re,json,time,sys
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent/'game';PORT=8765
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='()=>{for(let k=0;k<300&&!fight.over;k++){fight.enemies[fight.wave].hp=1;tapOrb(0)}return fight.over}'
async def main():
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--directory',str(ROOT)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
    try:
        # cohérence liste de préchargement / fichiers
        sw=(ROOT/'sw.js').read_text();listed=set(re.findall(r'"([^"]+\.(?:html|json|png|css|js))"',sw.split('const FILES=')[1].split(';')[0]))
        html=(ROOT/'index.html').read_text();used=set(re.findall(r'(?:src|href)="([^"]+\.(?:css|js|png|json))"',html))
        check('sw: tous les fichiers de index.html sont préchargés',used<=listed|{'sw.js'},used-listed)
        check('sw: tous les fichiers préchargés existent',all((ROOT/f).exists() for f in listed if f!='./'),[f for f in listed if f!='./' and not (ROOT/f).exists()])
        allfiles={str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and p.name!='sw.js'}
        check('sw: aucun fichier du jeu oublié',allfiles<=listed,allfiles-listed)
        man=json.loads((ROOT/'manifest.json').read_text());check('manifest: icônes existantes 192/512',all((ROOT/i['src']).exists() for i in man['icons']) and {'192x192','512x512'}<={i['sizes'] for i in man['icons']})
        async with async_playwright() as p:
            b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844});pg=await ctx.new_page()
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
            await pg.goto(f'http://localhost:{PORT}/index.html');await pg.wait_for_timeout(1500)
            await pg.evaluate('navigator.serviceWorker.ready');await pg.wait_for_timeout(500)
            keys=await pg.evaluate('caches.keys()');check('cache créé avec la version',keys==['ark-primal-0.7.0'],keys)
            n=await pg.evaluate('caches.open("ark-primal-0.7.0").then(c=>c.keys()).then(k=>k.length)');check('cache: tous les fichiers',n>=len(listed)-1,(n,len(listed)))
            await pg.reload();await pg.wait_for_timeout(800);check('page contrôlée par le service worker',await pg.evaluate('!!navigator.serviceWorker.controller'))
            await ctx.set_offline(True)
            await pg.reload();await pg.wait_for_timeout(800)
            check('hors ligne: le jeu se charge',await pg.evaluate('typeof startBattle==="function"&&document.querySelectorAll(".bottomnav button").length===5'))
            await pg.evaluate('S.team=[{id:1,type:"rex",level:30,xp:0},{id:2,type:"spino",level:30,xp:0},{id:3,type:"trike",level:30,xp:0}];S.stage=0;startBattle({mode:"story",n:1})')
            check('hors ligne: combat jouable',await pg.evaluate(WIN)=='win')
            await pg.evaluate('go("tower");go("arena");go("events");openSettings()')
            check('hors ligne: réglages affichent version et statut',await pg.evaluate('document.getElementById("setBody").innerText.includes("0.7.0")&&document.getElementById("setBody").innerText.includes("actif")'))
            await ctx.set_offline(False)
            check('aucune erreur JS',not errs,errs)
            await b.close()
        print('ECHECS:',FAILS) if FAILS else print('TOUT OK')
    finally:srv.terminate()
asyncio.run(main())
