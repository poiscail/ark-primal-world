"""Mise en page du combat sur PC (1280x800, portable 1366x700, Full HD 1920x1080) : la scène, les orbes, la super attaque et
les compétences sont visibles sans défiler ; PV de l'équipe sur la scène ; cliquer sur un dino dont la compétence est prête la lance."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"spino",level:40,xp:0},{id:2,type:"trike",level:40,xp:0},{id:3,type:"raptor",level:40,xp:0},{id:4,type:"rex",level:10,xp:0}];S.stage=34;S.nextId=10;S.items=[];S.tut={off:true,seen:{}};ens();render();'
RECT='''s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{t:r.top,b:r.bottom,l:r.left,r:r.right,h:r.height}}'''
async def page(b,w,h):
    ctx=await b.new_context(viewport={'width':w,'height':h})
    pg=await ctx.new_page();pg.errs=[];pg.on('pageerror',lambda e:pg.errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
    await pg.goto(GAME);await pg.wait_for_timeout(300);await pg.evaluate(BASE);return pg
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h in ((1280,800),(1366,700),(1920,1080)):
            pg=await page(b,w,h);ev=pg.evaluate;tag=f'{w}×{h}'
            await ev('startBattle({mode:"story",n:30})');await pg.wait_for_timeout(400)
            # bas de l'espace visible : la fenêtre (navigation en colonne à gauche) ou le haut de la barre du bas (fenêtre étroite)
            nav=await ev('(()=>{const r=document.querySelector(".bottomnav").getBoundingClientRect();return r.height>r.width?innerHeight:r.top})()')
            st=await ev(RECT,'#battleArea .battlestage');ob=await ev(RECT,'#battleArea .orbboard');su=await ev(RECT,'#battleArea .bl-super');tm=await ev(RECT,'#battleArea .bl-team')
            check(tag+' : mise en page de combat active',await ev('document.getElementById("battleArea").classList.contains("bl")&&document.body.classList.contains("inbattle")'))
            check(tag+' : scène en haut',st and st['t']>=0 and st['t']<80,st)
            check(tag+' : orbes entièrement visibles sans défiler',ob and ob['b']<=nav+1,(ob,nav))
            check(tag+' : bouton de super visible',su and su['b']<=nav+1,(su,nav))
            check(tag+' : compétences visibles',tm and tm['b']<=nav+1,(tm,nav))
            check(tag+' : 3 cases d\'équipe étiquetées',await ev('document.querySelectorAll("#battleArea>.bl-team").length')==3)
            await pg.click('#setFab');check(tag+' : réglages accessibles pendant le combat',await ev('!document.getElementById("setVeil").classList.contains("hide")'));await ev('closeSettings()')
            check(tag+' : équipe à droite des orbes',tm['l']>=ob['r']-2,(tm,ob))
            check(tag+' : en-tête réduit (ressources masquées, réglages gardés)',await ev('[...document.querySelectorAll(".top .meters>*")].filter(e=>getComputedStyle(e).display!="none").map(e=>e.id).join()')=='setFab')
            check(tag+' : zone et vague dans le HUD','Vague 1/3' in (await ev('(document.querySelector(".sHud .sZone")||{}).textContent||""')))
            check(tag+' : PV de l\'équipe sur la scène',await ev('document.querySelectorAll(".battlestage .sFig .sHp u").length')==3)
            # compétence prête : toucher le dino sur la scène
            await ev('fight.cd=[0,0,0];renderBattle()');await pg.wait_for_timeout(100)
            check(tag+' : dinos prêts mis en valeur',await ev('document.querySelectorAll(".battlestage .sFig.skready .sSk").length')==3)
            await pg.click('.battlestage .sFig[data-k="1"]',force=True);await pg.wait_for_timeout(150)
            check(tag+' : toucher le dino lance sa compétence',await ev('fight.cd[1]')>0 and await ev('fight.cd[0]')==0)
            # dégâts : barre de PV de scène réduite
            await ev('fight.hp[0]=Math.round(fight.mx[0]*.2);renderBattle()');await pg.wait_for_timeout(900)
            w=await ev('parseFloat(document.querySelector(\'.battlestage .sFig[data-k="0"] .sHp u\').style.width)')
            check(tag+' : barre de PV de scène à jour (20 %)',19<=w<=21,w)
            check(tag+' : barre basse en rouge',await ev('document.querySelector(\'.battlestage .sFig[data-k="0"] .sHp\').classList.contains("lo")'))
            # bannière de vague centrée sur la scène
            bt=await ev('parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bnTop"))')
            check(tag+' : bannière de vague placée sur la scène',st['t']<=bt<=st['b'],(bt,st))
            # victoire : résultat juste sous la scène
            await ev('fight.wave=2;fight.enemies[2].hp=1;fight.stun=0;renderBattle()');await ev('tapOrb(0)');await pg.wait_for_timeout(300)
            check(tag+' : victoire',await ev('fight.over')=='win')
            gap=await ev('(()=>{const r=document.querySelector("#battleArea .bl-res"),s=document.querySelector("#battleArea .battlestage");return r&&s?r.offsetTop-(s.offsetTop+s.offsetHeight):null})()')
            check(tag+' : résultat affiché juste sous la scène',gap is not None and 0<=gap<40,gap)
            # sortie du combat
            await ev('go("home")');await pg.wait_for_timeout(200)
            check(tag+' : en-tête rétabli hors combat',not await ev('document.body.classList.contains("inbattle")') and await ev('getComputedStyle(document.querySelector(".top .meters>.meter")).display')!='none')
            await ev('fight=null;go("battle")');await pg.wait_for_timeout(200)
            check(tag+' : écran « prêt pour le combat » sans mise en page de combat',not await ev('document.getElementById("battleArea").classList.contains("bl")') and not await ev('document.body.classList.contains("inbattle")'))
            check(tag+' : aucune erreur JS',pg.errs==[],pg.errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
