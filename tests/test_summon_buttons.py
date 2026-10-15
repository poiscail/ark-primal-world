"""Écran Invocation : chaque bouton cliqué pour de vrai (animations actives, deux tailles d'écran PC) donne un résultat qu'on
peut refermer d'un clic (régression : un calque d'effets restait par-dessus la fenêtre et bloquait le bouton OK).
Les boutons sont répartis en sous-onglets (Bannières, Bonus, Boutique) : le test ouvre le bon sous-onglet par un clic."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
RICH='S.tut={off:true,seen:{}};S.tickets=500;S.stone=99999;S.essence=500;S.shards=999;ens();S.mat={bone:99,hide:99,crystal:999,amber:999};S.freeDay="";save();go("summon")'
# bouton -> (fenêtre attendue, texte du bouton de fermeture)
GACHA=['summon(1)','summon(5)',"doGacha(1,RATE_STD(),'stone',40)","doGacha(10,RATE_STD(),'stone',380)","doGacha(10,RATE_STD(),'tickets',9,true)",
       "doGacha(1,[13,40,35,12],'crystal',5)","freePull()","featPull(1,'tickets',2)","featPull(10,'tickets',18)","elPull(1)","varPull(10)"]
MODAL=[("gearPull(1)","SUPER"),("gearPull(10)","SUPER"),("eggPull(1)","OK"),("eggPull(5)","OK")]
async def show(pg,oc):
    """ouvre (vrai clic) le sous-onglet qui contient le bouton, puis renvoie le bouton"""
    sub=await pg.evaluate('o=>{const b=[...document.querySelectorAll("#summon button[onclick]")].find(x=>x.getAttribute("onclick")===o);const c=b&&b.closest("[data-sub]");return c?c.dataset.sub:null}',oc)
    if sub and sub!='*':
        tab=pg.locator(f"#subnav button[onclick=\"subSet('summon','{sub}')\"]")
        if await tab.count() and not await pg.evaluate('o=>{const b=[...document.querySelectorAll("#summon button[onclick]")].find(x=>x.getAttribute("onclick")===o);return !!b&&b.offsetParent!==null}',oc):
            await tab.click(timeout=3000);await pg.wait_for_timeout(150)
    btn=pg.locator(f'#summon button[onclick="{oc}"]').first;await btn.scroll_into_view_if_needed(timeout=3000);return btn
async def close_gacha(pg):
    # laisser l'animation se dérouler, puis cliquer sur OK comme un joueur
    await pg.wait_for_timeout(300)
    for _ in range(80):
        if not await pg.evaluate('document.getElementById("gachaVeil").classList.contains("summoning")'):break
        await pg.wait_for_timeout(100)
    await pg.locator('#gachaBody button',has_text='OK').click(timeout=4000)
    return await pg.evaluate('document.getElementById("gachaVeil").classList.contains("hide")')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h in ((1280,800),(1920,1080)):
            tag=f'{w}×{h}'
            ctx=await b.new_context(viewport={'width':w,'height':h});pg=await ctx.new_page();ev=pg.evaluate
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
            await pg.goto(GAME);await pg.wait_for_timeout(300);await ev(RICH);await pg.wait_for_timeout(300)
            check(tag+' : animations actives',await ev('PREFS.anim===true'))
            for oc in GACHA:
                n0=await ev('S.team.length')
                try:
                    btn=await show(pg,oc);await btn.click(timeout=4000);closed=await close_gacha(pg)
                    check(f'{tag} : {oc} -> résultat refermé par OK',closed and await ev('S.team.length')>n0,(await ev('S.team.length'),n0))
                except Exception as e:check(f'{tag} : {oc}',False,str(e).split('\n')[0][:140])
            for oc,lbl in MODAL:
                try:
                    btn=await show(pg,oc);await btn.click(timeout=4000);await pg.wait_for_timeout(300)
                    await pg.locator('#modalBody button',has_text=lbl).click(timeout=4000)
                    check(f'{tag} : {oc} -> fenêtre refermée',await ev('document.getElementById("modalVeil").classList.contains("hide")'))
                except Exception as e:check(f'{tag} : {oc}',False,str(e).split('\n')[0][:140])
            # appel au choix : choisir un dino puis refermer le résultat
            try:
                await (await show(pg,"offerBuy('epic')")).click(timeout=4000);await pg.wait_for_timeout(300)
                await pg.locator('#modalBody button',has_text='CHOISIR').first.click(timeout=4000)
                check(f'{tag} : appel au choix -> résultat refermé par OK',await close_gacha(pg))
            except Exception as e:check(f'{tag} : appel au choix',False,str(e).split('\n')[0][:140])
            # roue de la chance (tour gratuit)
            try:
                await (await show(pg,'spinWheel()')).click(timeout=4000);await pg.wait_for_timeout(3500)
                check(f'{tag} : roue de la chance',await ev('S.wheel.free===false&&!spinning'))
            except Exception as e:check(f'{tag} : roue',False,str(e).split('\n')[0][:140])
            # boutique de fragments
            try:
                k=await ev('Object.keys(SPEC).filter(k=>SPEC[k].r===shopR)[0]');n0=await ev('S.team.length')
                await (await show(pg,f"shopBuy('{k}')")).click(timeout=4000)
                check(f'{tag} : boutique de fragments',await ev('S.team.length')==n0+1)
            except Exception as e:check(f'{tag} : boutique',False,str(e).split('\n')[0][:140])
            check(tag+' : aucune erreur JS',errs==[],errs)
            await ctx.close()
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
