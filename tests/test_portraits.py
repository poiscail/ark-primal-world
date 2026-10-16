import asyncio,sys,pathlib,base64,tempfile
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
PNG=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);ev=pg.evaluate
        n=await ev('Object.keys(SPEC).length')
        r=await ev('(()=>{const bad=[],seen=new Set();for(const k of Object.keys(SPEC)){const s=portrait(k);if(!s.startsWith("<svg")||s.includes("undefined")||s.includes("NaN"))bad.push(k);seen.add(s)}return [bad,seen.size]})()')
        check('80 portraits SVG valides (sans undefined/NaN)',r[0]==[] and n==80,r)
        check('portraits tous différents',r[1]==n,r)
        check('SVG bien formé (DOMParser)',await ev('(()=>{for(const k of Object.keys(SPEC)){const d=new DOMParser().parseFromString(portrait(k),"image/svg+xml");if(d.querySelector("parsererror"))return k}return true})()')==True)
        check('émojis uniques par espèce',await ev('new Set(Object.values(SPEC).map(s=>s.e)).size')==n)
        await ev('S.team=[{id:1,type:"rex",level:1,xp:0,v:"golden"},{id:2,type:"raptor",level:1,xp:0},{id:3,type:"trike",level:1,xp:0}];render()')
        check('illustrations utilisées sur l\'accueil',await ev('document.querySelectorAll("#leadTeam .pt svg").length')==3)
        check('variante appliquée autour du SVG',await ev('!!document.querySelector("#leadTeam .v-golden .pt svg")'))
        await ev('setPref("art","emoji")');check('mode emoji: plus de SVG',await ev('document.querySelectorAll("#leadTeam .pt").length')==0 and await ev('document.getElementById("leadTeam").innerText.includes("🐲")'))
        await ev('setPref("art","svg")')
        # bestiaire / invocation / combat
        await ev('go("team");colSet("book",true)');check('bestiaire: portraits',await ev('document.querySelectorAll("#collection .pt").length')>=3)
        await ev('startBattle({mode:"story",n:1})');check('combat: portraits équipe',await ev('document.querySelectorAll("#battleArea .pt").length')>=3)
        await ev('escapeFight();arenaFight(0)');check('arène: ennemi en portrait',await ev('!!document.querySelector("#battleArea .bigicon.hit .pt")'))
        # image personnalisée via l'admin
        await ev('buildAdmin()')
        f=pathlib.Path(tempfile.mkdtemp())/'t.png';f.write_bytes(PNG)
        await pg.set_input_files('.adminitem[data-dino="raptor"] input[type=file]',str(f));await pg.wait_for_timeout(500)
        v=await ev('document.querySelector(\'.adminitem[data-dino="raptor"] [data-field="e"]\').value');check('upload: data URL image',v.startswith('data:image/'),v[:30])
        await ev('saveAdmin()');check('upload enregistré dans SPEC',await ev('SPEC.raptor.e.startsWith("data:image/")'))
        await ev('S.team[1].type="raptor";render()');check('image personnalisée affichée (img)',await ev('document.querySelectorAll("#leadTeam img").length')>=1)
        await ev('buildAdmin();resetDinoImg("raptor");saveAdmin()');check('image par défaut rétablie',await ev('SPEC.raptor.e')=='🦖')
        check('rejet des schémas dangereux',await ev('isImg("javascript:alert(1)")||isImg("data:text/html;base64,AAAA")')==False)
        await ev('resetAdmin()')
        check('aucune erreur JS',not errs,errs)
        await b.close()
    print('ECHECS:',FAILS) if FAILS else print('TOUT OK')
asyncio.run(main())
sys.exit(1 if FAILS else 0)  # échec visible pour tools/run_tests.sh
