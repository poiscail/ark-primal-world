"""Modes II (0.35) : expédition dans le brouillard (vrais clics, déplacement, coffre, combat, gardien), traque (pistes puis
apprivoisement), tournoi (3 tours, élimination), saisons d'Arène (ligue, récompense, remise à niveau), Défi de la semaine
(deux règles actives, récompense sans toucher au Défi du jour), course (vrai clic), pêche, outils de fouille."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='(()=>{const f=fight;for(let w=0;w<3&&!f.over;w++){f.stun=9;f.locked=null;f.rune=null;f.grab=null;const e=f.enemies[f.wave];e.hp=1;e.tr="";e.sh=0;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
DIE='(()=>{const f=fight;for(let i=0;i<15&&!f.over;i++){f.hp=f.hp.map(h=>h>0?1:0);f.stun=0;f.guard=0;const e=f.enemies[f.wave];e.atk=1e9;e.hp=e.max=1e9;f.orbs=Array(f.orbs.length).fill("goldorb");tapOrb(0)}return f.over})()'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.stage=60;ens();delete S.m3;ens();C4.duoP=0;F2.newP=0;F2.goldP=0;F2.callP=0;save()')
        # brouillard
        await ev('go("modes2")')
        check('expédition : grille 5×5, départ visible',await pg.locator('#modes2 .fogg .fogc').count()==25 and await pg.locator('#modes2 .fogg .fogc.here').count()==1)
        check('2 cases accessibles au départ',await pg.locator('#modes2 .fogg .fogc.can').count()==2)
        r=await ev('(()=>{for(const i of [1,5]){const c=fogCell(i);if(c!=="fight"&&c!=="boss")return [i,c]}return [1,fogCell(1)]})()')
        i=r[0];await pg.click(f'#modes2 .fogg .fogc[data-i="{i}"]');await pg.wait_for_timeout(100)
        if r[1] in ('fight','boss'):
            check('vrai clic : case de combat → combat',await ev('fight&&fight.o.mode')=='fog');await ev(WIN)
        else:check('vrai clic : case sans combat franchie',await ev('S.m3.fog.pos')==i,r)
        check('on avance sur la case, le brouillard se lève',await ev(f'S.m3.fog.pos')==i and await ev(f'Object.keys(S.m3.fog.vis).length')>3)
        await ev('S.m3.fog.pos=19;S.m3.fog.done[19]=1;fight=null;startBattle({mode:"fog",i:24})')
        t0=await ev('S.tickets');r=await ev(WIN)
        check('gardien de l\'expédition : +3 tickets',r=='win' and await ev('S.tickets')>=t0+3 and await ev('S.m3.fog.done[24]')==1)
        await ev('fight=null;startBattle({mode:"fog",i:0})');check('case non adjacente refusée',await ev('!fight'))
        # traque
        k=await ev('trkSpecies()')
        for s in range(3):
            await ev('fight=null;startBattle({mode:"trk"})');await ev(WIN)
        await ev('fight=null;startBattle({mode:"trk"})')
        check('traque : dernier combat contre le dino sauvage',await ev('fight.enemies[2].pt')==k and await ev('enemyLook(fight.enemies[2],fight)') is None)
        n0=await ev('S.team.length');await ev(WIN)
        check('dino traqué apprivoisé',await ev('S.team.length')==n0+1 and await ev('S.team[S.team.length-1].type')==k)
        await ev('fight=null;startBattle({mode:"trk"})');check('une seule traque par semaine',await ev('!fight'))
        # tournoi
        await ev('go("modes2")');await pg.click('#modes2 .m3tour button.red');await pg.wait_for_timeout(100)
        check('vrai clic : quart de finale',await ev('fight.o.mode')=='tour' and 'quart' in await ev('fight.zone'))
        t0=await ev('S.tickets');await ev(WIN);check('quart gagné : +1 ticket, demi-finale',await ev('S.m3.tour.round')==1 and await ev('S.tickets')>=t0+1)
        await ev('fight=null;startBattle({mode:"tour"})');await ev(DIE)
        check('défaite : éliminé',await ev('S.m3.tour.out')==1)
        await ev('fight=null;startBattle({mode:"tour"})');check('plus de combat après élimination',await ev('!fight'))
        # saisons d'arène
        await ev('S.arena.r=1550;S.m3.seaBest=1550;S.m3.sea=m3Season()-1');t0=await ev('S.tickets');await ev('go("arena")')
        r=await ev('[S.arena.r,S.m3.sea===m3Season(),S.tickets]')
        check('fin de saison : récompense Platine (+6 tickets), classement ramené vers 1000',r[0]==1275 and r[1] and r[2]>=t0+6,r)
        check('panneau de saison dans l\'Arène',await pg.locator('#arena .m3sea').count()==1)
        # défi de la semaine
        await ev('go("daily")');check('défi de la semaine affiché',await pg.locator('#daily .m3wch button').count()==1)
        d0=await ev('!!S.dch.done');await pg.click('#daily .m3wch button');await pg.wait_for_timeout(100)
        r=await ev('(()=>{const[a,b]=wchRules();return [a.k,b.k,drHas(fight,a.k),drHas(fight,b.k),!!document.querySelector("#battleArea .drchip2")]})()')
        check('vrai clic : deux règles actives à la fois',r[0]!=r[1] and r[2] and r[3] and r[4],r)
        t0=await ev('S.tickets');await ev(WIN)
        check('défi de la semaine réussi : +5 tickets, Défi du jour inchangé',await ev('S.m3.wch.done')==1 and await ev('S.tickets')>=t0+5 and await ev('!!S.dch.done')==d0)
        # course
        await ev('go("modes2")');await pg.click('#modes2 .m3race');await pg.wait_for_timeout(100)
        check('course : 4 couloirs',await pg.locator('#raceTrack .rlane').count()==4)
        await ev('RACE.per=1e8;RACE.t0=Date.now()-RACE.per*.25');await pg.click('#raceBtn');p1=await ev('RACE.p')
        check('vrai clic au milieu de la barre : grand bond',p1>=9,p1)
        await ev('RACE.p=99;RACE.r=[50,50,50]');await pg.click('#raceBtn');await pg.wait_for_timeout(100)
        check('course gagnée : 1re place',await ev('RACE.over')==1 and '🥇' in await pg.inner_text('#raceBtn'))
        await ev('closeModal()')
        # pêche
        await ev('fishOpen()');await pg.click('#fishBtn');await ev('FISHING.st="bite";FISHING.t=Date.now()');await ev('Math._r=Math.random;Math.random=()=>.995')
        await pg.click('#fishBtn');await ev('Math.random=Math._r')
        check('pêche : poisson rare attrapé et noté',await ev('S.m3.fish[6]')==1 and 'Requin' in await pg.inner_text('#fishMsg'))
        await ev('fishStop();closeModal()')
        # fouilles : pinceau, dynamite
        await ev('S.dig.picks=5;S.dig.open={};S.dig.peek={};go("dig")')
        await pg.click('#dig .digtools button[data-t="brush"]');await pg.click('#dig .digtile[data-i="0"]');await pg.wait_for_timeout(50)
        check('pinceau : case vue sans creuser',await ev('!S.dig.open[0]&&S.dig.peek[0]===1&&S.dig.picks===5'))
        await pg.click('#dig .digtools button[data-t="dyn"]');await pg.click('#dig .digtile[data-i="5"]');await pg.wait_for_timeout(50)
        check('dynamite : 5 cases pour 3 pioches',await ev('[1,4,5,6,9].every(i=>S.dig.open[i])&&S.dig.picks===2'),await ev('[Object.keys(S.dig.open),S.dig.picks]'))
        check('5 succès',await ev('ACH.filter(a=>/^m3/.test(a[0])).length')==5)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
