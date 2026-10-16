"""Élevage II (0.37) : gènes de défense et de super hérités, mutation de couleur, arbre généalogique (vrai clic), soins des
œufs (vrai clic → empreinte de départ), croisement entre familles proches, 3e nid, bébé plus petit, nom de lignée, classement,
échange par code (envoi puis réception, code à usage unique), quêtes et statistiques, œufs au camp."""
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
        await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};S.team=[["rex",{hp:2,atk:1,def:3,sp:2}],["giga",{}],["raptor",{}],["rex",{hp:1,atk:1,def:3,sp:2}],["trike",{}],["ankylo",{}]].map(([t,g],i)=>({id:i+1,type:t,level:30,xp:0,gn:g,gen:2}));S.nextId=50;S.stage=60;S.mat={bone:999,hide:999,crystal:999,amber:999};ens();S.nest.slots=[null,null,null];save()')
        r=await ev('(()=>{const A=S.team[0],B=S.team[3];const out=[];for(let i=0;i<200;i++){const b=nestBaby(A,B);out.push([b.gn.def,b.gn.sp,!!b.hue,b.par.join()])}return [out.filter(x=>x[0]>=3).length,out.filter(x=>x[1]>=2).length,out.filter(x=>x[2]).length,out[0][3]]})()')
        check('gènes DÉF et SUPER hérités, mutation de couleur possible, parents notés',r[0]>150 and r[1]>150 and r[2]>0 and r[3]=='rex,rex',r)
        h=await ev('(()=>{const d=S.team[0],v=stats(d).def;const g=d.gn.def;d.gn.def=0;const w=stats(d).def;d.gn.def=g;return [v,w]})()')
        check('gène de défense : +3 % par point',abs(h[0]/h[1]-1.09)<.02,h)
        # ponte, soins, éclosion
        await ev('nestSel={a:1,b:4};nestLay();go("nest")')
        check('œuf pondu',await ev('!!S.nest.slots[0]'))
        await pg.click('#nest .n2care button:has-text("TOURNER")');await pg.click('#nest .n2care button:has-text("RÉCHAUFFER")');await pg.wait_for_timeout(50)
        check('vrai clic : 2 soins de l\'œuf',await ev('S.nest.slots[0].care')==2)
        await ev('n2Care(0,"turn")');check('pas deux fois le même soin dans l\'heure',await ev('S.nest.slots[0].care')==2)
        await ev('S.nest.slots[0].t1=Date.now()-1;S.nest.slots[0].hue=120;nestHatch(0);closeGacha&&closeGacha()')
        r=await ev('(()=>{const d=S.team[S.team.length-1];return [d.imp,d.gn.def,d.mhue,d.par&&d.par.join(),d.baby]})()')
        check('petit né : empreinte de départ (soins), gènes DÉF, couleur, parents',r[0]==2 and r[1]>=3 and r[2]==120 and r[3]=='rex,rex' and r[4]==1,r)
        bid=await ev('S.team[S.team.length-1].id')
        await ev('closeModal&&closeModal();document.querySelectorAll("#gachaVeil").forEach(x=>x.classList.add("hide"));go("team");subSet("team","pack");colSet("lim",999)')
        check('bébé plus petit (échelle < 1) et teinte mutée sur la carte',await ev(f'(()=>{{const c=document.querySelector(\'.cocard[data-id="{bid}"] .bigicon\');return !!c&&c.classList.contains("n2b")&&c.classList.contains("n2hue")}})()'))
        await pg.click(f'.cocard[data-id="{bid}"] button:has-text("ARBRE")');await pg.wait_for_timeout(50)
        check('vrai clic : arbre généalogique (3 générations)',await pg.locator('#modalBody .n2g').count()==3)
        await ev('closeModal()')
        await pg.click(f'.cocard[data-id="{bid}"] button:has-text("LIGNÉE")');await pg.fill('#askIn','Crocs d\'acier');await pg.click('#modalBody button:has-text("OK")');await pg.wait_for_timeout(50)
        check('vrai clic : lignée nommée',await ev(f'S.team.find(d=>d.id==={bid}).lin')=="Crocs d'acier")
        # croisement
        r=await ev('(()=>{const A=S.team.find(d=>d.type==="trike"),B=S.team.find(d=>d.type==="ankylo");nestSel={a:A.id,b:B.id};const P=nestPair();const out=[];for(let i=0;i<60;i++){const b=nestBaby(A,B);out.push(SPEC[b.type].r+":"+b.cross)}return [P.ok,FAMNAME[nestFam(A.type)],FAMNAME[nestFam(B.type)],[...new Set(out)]]})()')
        check('croisement Cératopsien × Ankylosaure : accepté, petit épique ou légendaire',r[0] and all(x.split(':')[1]=='1' and x.split(':')[0] in ('Épique','Légendaire') for x in r[3]),r)
        # 3e nid
        await ev('S.nest.hatched=10;nestSel={a:1,b:4};S.team[0].nestT=0;S.team[3].nestT=0;nestLay();nestSel={a:5,b:6};nestLay()')
        r=await ev('S.nest.slots.map(x=>!!x)');check('deux nids occupés',r[:2]==[True,True],r)
        await ev('S.team.push({id:90,type:"rex",level:30,xp:0},{id:91,type:"rex",level:30,xp:0});nestSel={a:90,b:91};go("nest")')
        await pg.click('#nest button:has-text("3E NID")');await pg.wait_for_timeout(50)
        check('vrai clic : ponte dans le 3e nid',await ev('S.nest.slots.map(x=>!!x).join()')=='true,true,true')
        # échange
        await ev('go("team");subSet("team","pack")');await pg.click(f'.cocard[data-id="{bid}"] button:has-text("ÉCHANGER")');await pg.wait_for_timeout(50)
        code=await ev('document.getElementById("n2code").value');await pg.click('#modalBody button.red');await pg.wait_for_timeout(50)
        check('envoi : le dino quitte la meute, code ARKD1',code.startswith('ARKD1.') and await ev(f'!S.team.some(d=>d.id==={bid})'))
        n0=await ev('S.team.length');await ev('n2Recv()');await pg.fill('#askIn',code);await pg.click('#modalBody button:has-text("OK")');await pg.wait_for_timeout(50)
        r=await ev('(()=>{const d=S.team[S.team.length-1];return [S.team.length,d.type,d.gn.def,d.lin,d.mhue]})()')
        check('réception : le dino revient avec gènes, lignée et couleur',r[0]==n0+1 and r[2]>=3 and r[3]=="Crocs d'acier" and r[4]==120,r)
        await ev('n2Recv()');await pg.fill('#askIn',code);await pg.click('#modalBody button:has-text("OK")');await pg.wait_for_timeout(50)
        check('code à usage unique',await ev('S.team.length')==n0+1)
        bad=code[:-2]+('aa' if not code.endswith('aa') else 'bb');await ev('n2Recv()');await pg.fill('#askIn',bad);await pg.click('#modalBody button:has-text("OK")');await pg.wait_for_timeout(50)
        check('code abîmé refusé',await ev('S.team.length')==n0+1)
        # écran, camp
        await ev('go("nest")');check('quêtes, statistiques, classement',await pg.locator('#nest .n2q').count()==1 and await pg.locator('#nest .n2stats').count()==1 and await pg.locator('#nest .n2rank').count()==1)
        check('quête « mutation de couleur » validée',await ev('S.nest.x.q.color')==1)
        await ev('go("camp")');check('œufs visibles au camp',await pg.locator('#camp .campscene .n2egg').count()==3)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
