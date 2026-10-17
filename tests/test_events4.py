"""Événements IV (0.42) : musique propre à chaque événement (écran et combats d'événement, jukebox), décor du menu,
mini-histoire de 3 dialogues (une fois par semaine), défi communautaire simulé (progression, paliers, participation exigée),
anniversaire du jeu (forcé : gâteau une fois par jour, titre), titres exclusifs par événement ; attaque unique de chaque
légendaire (signatures toutes différentes, effet lancé par un vrai clic)."""
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
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","trike"].map((t,i)=>({id:i+1,type:t,level:40,xp:0}));S.stage=40;delete S.e4;ens();save();F2.newP=F2.goldP=F2.callP=0')
        # musique
        check('une musique par événement (8)',await ev('EVENTS.every((e,i)=>!!MSC["ev"+i])') and await ev('new Set(EVENTS.map((e,i)=>JSON.stringify(MSC["ev"+i].seq))).size')>=6)
        await ev('go("events")');check('écran des événements : musique de l\'événement',await ev('musicMode()')==await ev('"ev"+evIdx()'))
        await ev('fight=null;startBattle({mode:"event",t:0,wk:wkNow(),go:true});go("battle")');check('combat d\'événement : même musique',await ev('musicMode()')==await ev('"ev"+evIdx()'),await ev('[musicMode(),fight.o.mode]'))
        await ev('fight=null;go("home")');check('jukebox : musiques d\'événement ajoutées',await ev('JUKE.filter(j=>/^ev\\d/.test(j[0])).length')==8)
        # décor et histoire
        await ev('go("events")');check('décor du menu propre à l\'événement',await pg.locator('#events .banner.e4b .e4deco i').count()==10 and await ev('document.querySelector("#events .banner").classList.contains("e4b-"+evIdx())'))
        check('3 dialogues par événement',await ev('EVENTS.every((e,i)=>LORE["ev4_"+i]&&LORE["ev4_"+i].length===5)'))
        check('pas d\'histoire si les dialogues sont coupés',await ev('e4Story()')==False)
        await ev('PREFS.lore=true');check('histoire de la semaine affichée une fois',await ev('e4Story()')==True and await ev('loreCur&&loreCur.lines.length')==3 and await ev('e4Story()')==False)
        await ev('setPref("lore",false);document.querySelectorAll("#loreVeil").forEach(v=>v.classList.add("hide"))')
        # défi communautaire
        p1=await ev('commProg().total');await ev('S.e4.comm.mine+=5');p2=await ev('commProg().total')
        check('défi de l\'île : tes victoires comptent (+20 par victoire)',p2-p1==100,(p1,p2))
        r=await ev('[commProg(Date.now()).total<=commProg(Date.now()+864e5).total]');check('l\'île progresse avec le temps',r==[True])
        await ev('S.e4.comm.mine=0;S.e4.comm.got={}');await ev('const _cp=commProg;window.__cp=_cp');await ev('commProg=()=>({total:6000,mine:0,pct:60})')
        check('palier refusé sans participation',await ev('commClaim(25)')==False)
        await ev('S.e4.comm.mine=5;commProg=()=>({total:6000,mine:5,pct:60})');t0=await ev('S.stone')
        check('palier 25 % récupéré',await ev('commClaim(25)')==True and await ev('S.stone')==t0+200)
        check('palier 75 % pas encore atteint',await ev('commClaim(75)')==False);await ev('commProg=__cp')
        # victoires d'événement et titres
        await ev('fight=null;startBattle({mode:"event",t:0,wk:wkNow(),go:true})');r=await ev(WIN)
        check('victoire d\'événement comptée pour le titre',r=='win' and await ev('S.e4.w[evIdx()]')==1)
        await ev('S.e4.w[evIdx()]=10');check('titre exclusif « Champion · … »',await ev('achOk(ACH.find(a=>a[0]==="e4t"+evIdx()))') and await ev('ACH.find(a=>a[0]==="e4t"+evIdx())[6].startsWith("Champion")'))
        # anniversaire
        check('anniversaire : pas actif sous un navigateur automatisé',await ev('evAct("anniv")')==False)
        await ev('window.__forceEv="anniv";go("events")');t0=await ev('S.tickets');await pg.click('#events .e4anniv button')
        check('vrai clic : gâteau d\'anniversaire (+2 🎟️), une fois par jour',await ev('S.tickets')==t0+2 and await ev('annivCake()')==False)
        check('musique de fête à l\'accueil',await ev('(go("home"),musicMode())')=='anniv')
        check('titre « Invité d\'honneur »',await ev('achOk(ACH.find(a=>a[0]==="e4a"))'));await ev('window.__forceEv=undefined')
        # attaque unique des légendaires
        L=await ev('Object.keys(SPEC).filter(k=>SPEC[k].r==="Légendaire")')
        sig=await ev('Object.keys(SPEC).filter(k=>SPEC[k].r==="Légendaire").map(k=>{const g=lgSig(k);return g.shape+g.glyph+g.hue})')
        check('chaque légendaire a une attaque différente',len(set(sig))==len(L),(len(set(sig)),len(L)))
        await ev('setPref("anim",true);setPref("fxLv",1);window.__lg=0;S.team=["rex","giga","trike"].map((t,i)=>({id:i+1,type:t,level:40,xp:0}))')
        lg=await ev('S.team.slice(0,3).find(d=>SPEC[d.type].r==="Légendaire")')
        if not lg:
            await ev('(()=>{const k=Object.keys(SPEC).find(k=>SPEC[k].r==="Légendaire"&&!SPEC[k].ex);S.team[0]={id:1,type:k,level:40,xp:0}})()')
        await ev('fight=null;startBattle({mode:"story",n:3});go("battle");fight.enemies.forEach(e=>{e.hp=e.max=1e7});const el=SPEC[S.team[0].type].element;fight.orbs=Array(fight.orbs.length).fill(el);renderBattle()')
        await pg.click('#battleArea .orbboard .orb>>nth=0');await pg.wait_for_timeout(100)
        check('vrai clic : attaque unique du légendaire (nom affiché)',await ev('__lg')==1 and await pg.locator('#fxLayer .lgfx em').count()==1,await ev('[__lg,S.team[0].type]'))
        await ev('setPref("anim",false)')
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
