"""Invocations II (0.38) : garanties affichées, bannière de famille (vrai clic, une seule famille), bannière de choix
(vedette choisie), liste de souhaits, ticket de variante garantie, élément Épique+, échange de doublons, récapitulatif
(nouveautés d'abord), « invoquer encore », cartes et historique, 100e invocation, week-end, bestiaire, simulation admin."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.stage=40;S.tickets=500;S.mat.crystal=500;S.mat.amber=500;S.pity=0;S.fpity=0;ens();delete S.ga2;ens();save()')
        await ev('go("summon");subSet("summon","ban")')
        check('garanties partagées affichées','Légendaire garanti dans' in await pg.inner_text('#gachaX .ga2pity'))
        # famille
        await pg.click('#gachaX .ga2fam .eltabs button:has-text("Sauropodes")');await pg.wait_for_timeout(50)
        n0=await ev('S.team.length');await pg.click('#gachaX .ga2fam button:has-text("x10")');await pg.wait_for_timeout(100)
        r=await ev(f'S.team.slice({n0}).map(d=>(PORT[d.type]||["T"])[0])')
        check('vrai clic : bannière de famille ×10 (que des sauropodes)',len(r)==10 and set(r)=={'S'},r)
        check('récapitulatif : boutons « invoquer encore »',await pg.locator('#gachaBody .ga2again').count()==1)
        await pg.click('#gachaBody .ga2again');await pg.wait_for_timeout(100);check('vrai clic : invoquer encore (10 de plus)',await ev('S.team.length')==n0+20)
        await ev('closeGacha()')
        # choix
        k=await ev('choiceList()[2]');await ev('render()');await pg.click(f'#gachaX .ga2choice .ga2wish button>>nth=2');await pg.wait_for_timeout(50)
        check('vedette de la bannière de choix sélectionnée',await ev('S.ga2.pick')==k)
        r=await ev('(()=>{let c=0,l=0;for(let i=0;i<4000;i++){const t=pullChoice(false);if(SPEC[t].r==="Légendaire"){l++;if(t===S.ga2.pick)c++}}S.pity=0;return [l,c]})()')
        check('bannière de choix : ~70 % des légendaires sont la vedette',r[0]>50 and .6<r[1]/r[0]<.85,r)
        # liste de souhaits
        await ev('S.ga2.wish=["dilopho"]');r=await ev('(()=>{let c=0;for(let i=0;i<4000;i++)if(pickType(SPEC.dilopho.r)==="dilopho")c++;return c/4000})()')
        check('liste de souhaits : l\'espèce souhaitée sort bien plus souvent',r>.2,r)
        # ticket de variante
        await ev('S.ga2.vt=1');n0=await ev('S.team.length');await ev('varTicket();closeGacha()')
        check('ticket de variante : une variante garantie',await ev(f'S.team[{n0}].v')!='normal')
        # élément Épique+
        await ev('gEl="blueorb";render()');n0=await ev('S.team.length');await pg.click('#gachaX .ga2elmin');await pg.wait_for_timeout(100);await ev('closeGacha()')
        check('vrai clic : élément Épique+ (bleu, épique ou mieux)',await ev(f'(()=>{{const d=S.team[{n0}];return SPEC[d.type].element==="blueorb"&&RAR5.indexOf(SPEC[d.type].r)>=2}})()'))
        # échange
        await ev('S.team.push(...[1,2,3,4].map(i=>({id:900+i,type:"compsog",level:1,xp:0})))')
        r=await ev('exDups("Commun").length');await ev('exOpen("Commun")');await pg.click('#modalBody .ga2wish button>>nth=0');await pg.wait_for_timeout(50)
        check('vrai clic : 3 doublons communs échangés contre une espèce choisie',r>=3 and await ev('(S.cnt.exchanges||0)')==1)
        # nouveautés d'abord
        await ev('S.team=S.team.slice(0,3);S.ga2.hist=[]');await ev('featPull(10,"tickets",18)')
        r=await ev('[...document.querySelectorAll("#gachaBody .gc")].map(c=>!!c.querySelector(".newtag"))');await ev('closeGacha()')
        check('récapitulatif ×10 : nouveautés en premier',r==sorted(r,reverse=True),r)
        check('historique et cartes enregistrés',await ev('S.ga2.hist.length')>=10 and await ev('Object.keys(S.ga2.cards).length')>=1)
        await ev('ga2Cards()');check('album des cartes',await pg.locator('#modalBody .ga2card').count()>50);await ev('closeModal()')
        # 100e invocation
        await ev('S.gstat.total=99;S.ga2.c100={}');t0=await ev('S.tickets');await ev('featPull(1,"tickets",2);closeGacha()')
        check('100e invocation : +5 tickets et un ticket de variante',await ev('S.ga2.vt')>=1 and await ev('S.tickets')>=t0-2+5)
        # bestiaire
        await ev('Object.keys(SPEC).filter(k=>!SPEC[k].ex).forEach(k=>{if(!S.team.some(d=>d.type===k))S.team.push({id:S.nextId++,type:k,level:1,xp:0})});render()');t0=await ev('S.tickets')
        await pg.click('#gachaX .ga2pity button:has-text("100 %")');await pg.wait_for_timeout(50);check('vrai clic : bestiaire 100 % → +15 tickets',await ev('S.tickets')==t0+15)
        # admin
        r=await ev('adminSim()');check('simulation des taux (≈ réglages)',abs(r[3]*100-await ev('RATE_STD()[3]'))<2.5,r)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
