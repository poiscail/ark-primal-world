"""Compétences ennemies : en Arène (compétence de l'espèce adverse) et chez les gardiens de la Tour ; cadence (2e tour puis tous les 4),
jamais sur une attaque puissante, intention affichée, effets (frappe, bouclier, soin, poison, blocage, jauge, orbes), absentes ailleurs."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
BASE='S.team=[{id:1,type:"gaia",level:60,xp:0},{id:2,type:"argento",level:60,xp:0},{id:3,type:"amarga",level:60,xp:0}];S.stage=99;S.nextId=10;S.items=[];S.tut={off:true,seen:{}};ens();render();'
ARENA='startBattle({mode:"arena",go:true,d:2,n:40,team:"Test",sp:%s});fight.enemies.forEach(e=>{e.hp=e.max=999999});fight.mx=fight.mx.map(x=>x*50);fight.hp=fight.mx.slice();renderBattle()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await ev(BASE+'setPref("anim",false)')
        await ev(ARENA%'["raptor","trike","dracorex"]');await pg.wait_for_timeout(100)
        check('arène : compétence de l\'espèce adverse (Raptor → Morsure brutale)',await ev('fight.enemies[0].esk')=='strike')
        chip=await ev('(document.querySelector("#battleArea .eskchip")||{}).textContent||""')
        check('intention affichée dans le HUD',('Morsure brutale' in chip) and (' tour' in chip),chip)  # l'ouverture du chef (0.31) peut décaler le compte
        await ev('fight.stun=0;tapOrb(0)')
        check('1er tour ennemi : pas encore de compétence',not await ev('fight.esUsed'))
        check('intention : au prochain tour',('au prochain tour' in (await ev('document.querySelector("#battleArea .eskchip").textContent'))))
        hp0=await ev('fight.hp.slice()');await ev('fight.stun=0;tapOrb(0)')
        check('2e tour ennemi : compétence utilisée',await ev('fight.esUsed')==1 and 'Morsure brutale' in await ev('fight.log'),await ev('fight.log'))
        hp1=await ev('fight.hp.slice()');lost=[a-b for a,b in zip(hp0,hp1)]
        check('frappe forte sur une seule cible (remplace l\'attaque)',sum(1 for x in lost if x>0)==1,lost)
        # cadence : pas avant 4 tours, jamais sur une attaque puissante
        used=[]
        for i in range(9):
            await ev('fight.stun=0;tapOrb(0)');used.append((await ev('fight.turn'),await ev('fight.esUsed')))
        turns=[t for (t,u),(t0,u0) in zip(used,[(2,1)]+used[:-1]) if u>u0]
        check('tous les 4 tours ensuite, jamais sur un tour d\'attaque puissante',len(turns)>=2 and all(t%3!=0 for t in turns) and all(b-a>=4 for a,b in zip([2]+turns,turns)),turns)
        # effets des compétences de soutien et de contrôle
        async def force(sk,js_before=''):
            await ev('(()=>{const e=fight.enemies[fight.wave];e.esk="%s";e.skcd=1;fight.stun=0;fight.turn=1;%s})()'%(sk,js_before));await ev('tapOrb(0)')
        await force('shield');check('Carapace : bouclier ennemi',await ev('fight.enemies[fight.wave].sh')>0)
        await ev('fight.stun=5;tapOrb(0)');check('le bouclier absorbe les dégâts',('absorbé' in await ev('fight.log')))
        await force('heal','fight.enemies[fight.wave].hp=500000');check('Souffle vital : l\'ennemi se soigne de 20 %',await ev('fight.enemies[fight.wave].hp')>=500000+0.19*999999-200000)
        await force('poison','fight.pz=[0,0,0]');check('Venin : toute l\'équipe empoisonnée',await ev('fight.pz.every(x=>x>=2)'),await ev('fight.pz'))
        await force('stun','fight.cd=[0,0,0]');check('Choc sismique : compétence d\'un dino bloquée',await ev('fight.cd.some(x=>x>=1)'),await ev('fight.cd'))
        await force('charge','fight.sp=80');check('Appel primordial : jauge de super volée',await ev('fight.sp')<=80-30+40)
        await force('roar');check('Rugissement : ATQ ennemie +30 %',await ev('fight.enemies[fight.wave]._roar')==3)
        await force('reorb','fight.combo=4');check('Orbes changeantes : combo remis à zéro',await ev('fight.combo')==0)
        # ailleurs : pas de compétence ; gardiens de la Tour : oui
        await ev('startBattle({mode:"story",n:30})');check('histoire : aucune compétence ennemie',await ev('fight.enemies.every(e=>!esOf(e,fight))'))
        await ev('S.tower.floor=20;startBattle({mode:"tower"})');check('Tour : seul le gardien a une compétence',await ev('!esOf(fight.enemies[0],fight)&&!!esOf(fight.enemies[2],fight)'))
        # bannière quand les animations sont actives
        await ev('setPref("anim",true)');await ev(ARENA%'["trike","trike","trike"]');await ev('fight.enemies[0].skcd=1;fight.stun=0;fight.turn=1;tapOrb(0)');await pg.wait_for_timeout(150)
        check('bannière de compétence ennemie',await ev('document.querySelectorAll("#fxLayer .wavebn.eskill").length')>=1)
        # l'auto-combat se protège avant une compétence offensive
        await ev('setPref("anim",false);S.team=[{id:1,type:"ankylo",level:60,xp:0},{id:2,type:"raptor",level:60,xp:0},{id:3,type:"trike",level:60,xp:0}];render()')
        await ev(ARENA%'["raptor","raptor","raptor"]');await ev('fight.enemies[0].skcd=1;fight.cd=[0,9,9];fight.turn=4;fight.buff.shield=0')
        check('auto : Carapace avant la frappe ennemie annoncée',await ev('autoSkill()')==0)
        # Arène : équipes Redoutable renforcées, mention dans l'écran Arène
        hp=await ev('(()=>{const a=MODES.arena({d:0,n:40,team:"T",sp:["raptor","trike","rex"]}),b=MODES.arena({d:2,n:40,team:"T",sp:["raptor","trike","rex"]});return [a.enemies[0].max,b.enemies[0].max]})()')
        check('Redoutable : PV renforcés selon ARENA_TUNE',abs(hp[1]/hp[0]-await ev('ARENA_TUNE.hp[2]'))<0.01,hp)
        await ev('go("arena")');await pg.wait_for_timeout(100)
        check('écran Arène : compétences et renfort annoncés',('compétence de leur espèce' in await ev('(document.querySelector("#arena .esnote")||{}).textContent||""')))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
