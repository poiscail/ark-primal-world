"""Décors peints (0.45) : fond illustré (FLUX.1 schnell) derrière les scènes des zones Jungle, Volcan, Toundra et Abysses
(combat, bannière, carte), décor dessiné gardé pour les autres zones, réglage Peints/Dessinés par vrai clic, crédits."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BG='(()=>{const i=document.querySelector("#battleArea .scene .sc-ai");return i?getComputedStyle(i).backgroundImage.slice(0,30):""})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","trike"].map((t,i)=>({id:i+1,type:t,level:60,xp:0}));S.stage=60;save();F2.newP=F2.goldP=F2.callP=0;if(typeof C4!=="undefined")C4.duoP=0')
        for z,n in [("jungle",12),("ruines",35),("volcan",60),("obelisque",85)]:
            await ev(f'fight=null;startBattle({{mode:"story",n:{n}}});go("battle")');await pg.wait_for_timeout(150)
            check(f'combat {z} : fond peint',await ev('document.querySelector("#battleArea .scene").classList.contains("aibg-%s")'%z) and 'data:image/webp' in await ev(BG))
        check('le ciel dessiné est caché sous le fond peint',await ev('getComputedStyle(document.querySelector("#battleArea .scene .sc-sky")).display')=='none')
        check('zone sans image (neutre) : décor dessiné',not await ev('sceneHTML("neutre").includes("aibg")'))
        for z in ['ruines','obelisque','toundra','abysses']:
            check(f'{z} : image prête',await ev('(()=>{document.body.insertAdjacentHTML("beforeend",\'<div id="tz" style="position:relative;width:300px;height:150px">\'+sceneHTML("%s")+\'</div>\');const i=document.querySelector("#tz .sc-ai"),r=i&&getComputedStyle(i).backgroundImage.includes("data:image/webp");document.getElementById("tz").remove();return r})()'%z))
        await ev('fight=null;go("story")');await pg.wait_for_timeout(200)
        check('bannière et carte de l\'histoire : fond peint',await pg.locator('#story .scene.aibg').count()>=1)
        # réglage
        await ev('openSettings()');await pg.click('#aiOpts button[onclick="aiSet(false)"]')
        check('vrai clic : décors dessinés',await ev('PREFS.aiBg')==False)
        await ev('closeSettings();go("story")');await pg.wait_for_timeout(200)
        check('plus de fond peint dans l\'écran Histoire (bannière, carte)',await pg.locator('#story .scene.aibg').count()==0)
        await ev('fight=null;startBattle({mode:"story",n:12});go("battle")');await pg.wait_for_timeout(150)
        check('combat : décor dessiné',await ev('document.querySelector("#battleArea .scene").className')=='scene')
        await ev('fight=null;openSettings()');await pg.click('#aiOpts button[onclick="aiSet(true)"]');await ev('closeSettings()')
        check('vrai clic : de nouveau peints',await ev('PREFS.aiBg')==True)
        await ev('shCredits()');t=await ev('document.getElementById("modalBody").textContent')
        check('crédits : FLUX.1 schnell (Apache 2.0)','FLUX.1' in t and 'Apache' in t);await ev('closeModal()')
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
