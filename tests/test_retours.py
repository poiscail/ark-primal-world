"""Retours de l'utilisateur (0.42) : l'œuf de l'invocation disparaît (même avec les animations réduites de Windows),
notifications plus grosses (cloche, pastille « 99+ », liste, messages), scène du camp redessinée (cabanes, feu, ombres,
dinos répartis sur le sol quand les animations sont réduites)."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for rm in (False,True):
            pg=await b.new_page(viewport={'width':1366,'height':800},reduced_motion='reduce' if rm else 'no-preference');ev=pg.evaluate
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
            await pg.goto(GAME);await pg.wait_for_timeout(400)
            tag=' (animations réduites)' if rm else ''
            await ev('setPref("lore",false);setPref("anim",true);S.tut={off:true,seen:{}};S.stage=60;S.tickets=50;S.team=["rex","giga","trike","raptor","stego"].filter(k=>SPEC[k]).map((t,i)=>({id:i+1,type:t,level:40,xp:0}));ens();save()')
            # œuf de l'invocation
            await ev('go("summon")');await ev('showGacha([{id:900,type:"rex",level:1,xp:0}],new Set([900]),"Test")')
            n0=await pg.locator('#gachaBody .ga2egg').count()
            check('œuf affiché au début'+tag,n0==(0 if rm else 1),n0)
            await pg.wait_for_function('!document.querySelector("#gachaBody .ga2egg")',timeout=3000)
            check('œuf retiré ensuite'+tag,await pg.locator('#gachaBody .ga2egg').count()==0)
            await pg.click('#gachaBody button.wide');await pg.wait_for_timeout(100)
            # notifications
            await ev('U2N.unread=150;u2Bell()')
            bx=await pg.locator('#u2bell').bounding_box();check('cloche plus grosse (≥ 50 px)'+tag,bx['width']>=50 and bx['height']>=50,bx)
            check('pastille « 99+ »'+tag,await ev('document.querySelector("#u2bell i").textContent')=='99+')
            fs=await ev('parseFloat(getComputedStyle(document.querySelector("#u2bell i")).fontSize)');check('chiffre de la pastille lisible (≥ 13 px)'+tag,fs>=13,fs)
            await ev('U2N.notes=[{t:Date.now(),m:"Test"}];u2NSave()');await pg.click('#u2bell')
            fs=await ev('parseFloat(getComputedStyle(document.querySelector("#modalBody .u2note")).fontSize)');check('texte des notifications ≥ 15 px'+tag,fs>=15,fs);await ev('closeModal()')
            await ev('toast("Bonjour")');fs=await ev('parseFloat(getComputedStyle([...document.querySelectorAll(".toast")].pop()).fontSize)');check('messages (toasts) ≥ 15 px'+tag,fs>=15,fs)
            # camp
            await ev('Object.keys(CAMP_B).forEach((k,i)=>S.camp.b[k]=i===2?0:3);save();go("camp")');await pg.wait_for_timeout(300)
            check('camp : 5 bâtiments dessinés'+tag,await pg.locator('#camp .campscene .cbld .chut svg').count()==5)
            check('camp : bâtiment à construire marqué'+tag,await pg.locator('#camp .campscene .cbld.off').count()==1)
            check('camp : feu, ombres, habitants nommés'+tag,await pg.locator('#camp .cfire .cflame').count()==1 and await pg.locator('#camp .campscene .cshadow').count()>=10 and await pg.locator('#camp .cchar small').count()==3)
            xs=await ev('[...document.querySelectorAll("#camp .cwalk")].map(e=>Math.round(e.getBoundingClientRect().left))')
            check('camp : dinos répartis sur le sol (pas empilés)'+tag,len(xs)==5 and max(xs)-min(xs)>300,xs)
            check('aucune erreur JS'+tag,errs==[],errs)
            await pg.close()
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
