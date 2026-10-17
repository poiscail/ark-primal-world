"""Progression I (0.36) : niveau max 100/120, éveil 6★ (vrai clic), XP : rattrapage, courbe 40-60, entraînement passif,
partage, objets d'XP (vrai clic), récompenses de rang, arbre du dresseur, prestige, plafond de puissance, défense lisible,
niveau d'équipe."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor","trike","stego"].map((t,i)=>({id:i+1,type:t,level:[30,30,20,10,10][i],xp:0}));S.stage=40;S.level=12;ens();delete S.prog;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        # niveau max
        await ev('S.team[0].level=99;S.team[0].xp=need(99)*5;pgLvUp(S.team[0])')
        check('niveau max 100 sans l\'éveil ultime',await ev('[S.team[0].level,S.team[0].xp]')==[100,0])
        await ev('S.team[0].star=5;S.mat.amber=99;S.mat.crystal=99;S.mat.bone=99;S.essence=999;if(S.pg2)S.pg2.ftok.T=99;go("team");subSet("team","pack")')
        await pg.click('.cocard[data-id="1"] .pgaw6>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic : éveil ultime ★★★★★★',await ev('S.team[0].star')==6 and await ev('S.essence')==799)
        await ev('S.team[0].xp=need(100)*3;pgLvUp(S.team[0])');check('après l\'éveil ultime : au-delà de 100',await ev('S.team[0].level')>100)
        await ev('go("team");subSet("team","pack")');check('aura d\'éveil sur la carte',await ev('!!document.querySelector(\'.cocard[data-id="1"] .bigicon.aw6\')'))
        # XP
        await ev('S.team[0].level=30;S.team[0].star=0;S.team.forEach(d=>d.xp=0)')
        x=await ev('(()=>{fight=null;startBattle({mode:"story",n:10});const r=('+WIN+');return [r,S.team.map(d=>d.xp+":"+d.level)]})()')
        check('victoire : le dino en retard gagne plus (rattrapage), les dinos hors équipe un peu (entraînement passif)',x[0]=='win',x)
        r=await ev('[S.team[2].xp>S.team[0].xp||S.team[2].level>20, S.team[3].xp>0]')
        check('rattrapage et entraînement passif',r==[True,True],[r,x])
        # objets d'XP
        await ev('S.prog.xpi={berry:2,meat:1};go("team");subSet("team","pack")')
        x0=await ev('S.team[3].xp+":"+S.team[3].level');await pg.click('.cocard[data-id="4"] .pgfeed button:has-text("NOURRIR")>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic : nourrir avec des baies',await ev('S.prog.xpi.berry')==1 and await ev('S.team[3].xp+":"+S.team[3].level')!=x0)
        # rang et arbre
        await ev('go("home");pgOpen()')
        check('récompenses de rang 5 et 10 à réclamer',await pg.locator('#modalBody button:has-text("RANG 5")').count()==1 and await pg.locator('#modalBody button:has-text("RANG 10")').count()==1)
        t0=await ev('S.tickets');await pg.click('#modalBody button:has-text("RANG 10")');await pg.wait_for_timeout(50)
        check('vrai clic : rang 10 → +4 tickets',await ev('S.tickets')==t0+4 and await ev('S.prog.rk[10]')==1)
        h0=await ev('stats(S.team[0]).hp');await pg.click('#modalBody button[data-tree="vig"]');await pg.wait_for_timeout(50)
        check('arbre : Vigueur +1 % de PV',await ev('S.prog.tree.vig')==1 and abs(await ev('stats(S.team[0]).hp')/h0-1.01)<.006)
        check('points : 1 tous les 5 rangs (rang 12 → 2)',await ev('treePts()')==2)
        await ev('closeModal()')
        # partage
        await ev('S.prog.share="weak";S.team.forEach(d=>d.xp=0);S.team[0].level=30;S.team[1].level=30;S.team[2].level=29;fight=null;startBattle({mode:"story",n:10})');await ev(WIN)
        r=await ev('S.team.slice(0,3).map(d=>d.xp)')
        check('partage « priorité au plus faible »',r[2]>r[0] and r[2]>r[1],r)
        # prestige
        await ev('S.stage=100;pgPrestige()');await pg.click('#modalBody button.red');await pg.wait_for_timeout(50)
        check('vrai clic : prestige (histoire à 0, bonus, +2 points)',await ev('[S.stage,S.prog.prest,treePts()]')==[0,1,4])
        # plafond
        r=await ev('(()=>{const d={id:999,type:"rex",level:60,xp:0,star:6,v:"prism",gn:{hp:5,atk:5},imp:100,tal:{a:5,d:5,s:5},aff:200};S.team.push(d);S.gear=20;S.level=100;const v=stats(d),c=pgCore(d);S.team.pop();S.gear=0;S.level=12;return [v.atk/c.atk,v.hp/c.hp]})()')
        check('plafond de puissance : un dino « tout au maximum » (rang 100, forge 20) reste sous ×5',r[0]<5 and r[1]<5.5,r)
        # défense, niveau d'équipe
        await ev('go("team");subSet("team","pack")');check('défense lisible sur la carte (−X %)','DÉFENSE · −' in await pg.inner_text('.cocard[data-id="1"] .stats') and '%' in await pg.inner_text('.cocard[data-id="1"] .stats'))
        check('niveau d\'équipe dans la barre du haut',(await ev('document.getElementById("powerM").textContent')).startswith('Niv. '))
        check('3 succès',await ev('ACH.filter(a=>/^pg/.test(a[0])).length')==3)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
