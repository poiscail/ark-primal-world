"""Portraits II (0.44) : théropodes en 3 postures et 5 têtes, motifs sur le corps de toutes les familles, toutes les espèces
dessinées sans erreur (portraits, portraits en volume, dinos corrompus des ennemis), versions (variantes) décorées chacune
d'un dessin différent, visibles dans la collection (vrai écran)."""
import asyncio,pathlib,sys,os
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
VS=["alpha","shadow","albino","golden","prism","fossil","crystal","lava","spectral"]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};save()')
        T=await ev('Object.keys(PORT).filter(k=>PORT[k][0]==="T")')
        poses=await ev('[...new Set(Object.keys(PORT).filter(k=>PORT[k][0]==="T").map(k=>PORT[k][1].pose||0))]')
        heads=await ev('[...new Set(Object.keys(PORT).filter(k=>PORT[k][0]==="T").map(k=>PORT[k][1].hd||"slim"))]')
        check('théropodes : 3 postures utilisées',sorted(poses)==[0,1,2],poses)
        check('théropodes : au moins 4 sortes de tête',len(heads)>=4,heads)
        combos=await ev('new Set(Object.keys(PORT).filter(k=>PORT[k][0]==="T").map(k=>{const o=PORT[k][1];return [o.pose||0,o.hd||"slim",o.pt,o.open?1:0,o.tl||"",o.arm||""].join()})).size')
        check('théropodes : silhouettes variées (≥ 70 % de combinaisons différentes)',combos>=len(T)*.7,(combos,len(T)))
        check('motif choisi pour toutes les espèces dessinées',await ev('Object.keys(PORT).filter(k=>!["W","I"].includes(PORT[k][0])).every(k=>PORT[k][1].pt&&PORT[k][1]._k===k)'))
        pts=await ev('[...new Set(Object.keys(PORT).map(k=>PORT[k][1].pt).filter(Boolean))]')
        check('5 motifs utilisés (aucun, rayures, taches, bande, tigré)',len(pts)==5,pts)
        r=await ev('''(()=>{const bad=[];for(const k of Object.keys(SPEC)){try{const a=portrait(k),b=portraitFull(k),c=corruptSVG(k,"redorb",{boss:1});if(!a.startsWith("<svg")||!b.startsWith("<svg")||!c.includes("<svg"))bad.push(k)}catch(e){bad.push(k+":"+e.message)}}return bad})()''')
        check('toutes les espèces dessinées sans erreur (portrait, volume, corrompu)',r==[],r[:5])
        u=await ev('new Set(Object.keys(SPEC).map(k=>portrait(k))).size==Object.keys(SPEC).length')
        check('aucun portrait identique à un autre',u)
        ids=await ev('''(()=>{const m={};for(const k of Object.keys(SPEC)){const s=portrait(k);for(const x of s.matchAll(/clipPath id="([^"]+)"/g)){if(m[x[1]]&&m[x[1]]!==k)return x[1];m[x[1]]=k}}return ""})()''')
        check('identifiants de découpe propres à chaque espèce',ids=='',ids)
        # versions
        r=await ev('%s.map(v=>[v,artOf("rex",v).includes("vxo-"+v)])'%VS)
        check('9 versions : chacune a son décor',all(x[1] for x in r),r)
        check('version normale : pas de décor',not await ev('artOf("rex","normal").includes("vxo")'))
        bg=await ev('''(()=>{document.body.insertAdjacentHTML("beforeend",'<div id="vt">'+%s.map(v=>'<span style="display:inline-block;width:80px;height:80px">'+artOf("rex",v)+'</span>').join("")+'</div>');
          const r=[...document.querySelectorAll("#vt .vxo")].map(i=>{const c=getComputedStyle(i);return c.backgroundImage+"|"+c.boxShadow});document.getElementById("vt").remove();return r})()'''%VS)
        check('décors tous différents',len(set(bg))==9,len(set(bg)))
        await ev('setPref("art","emoji")');check('mode émojis : pas de décor',not await ev('artOf("rex","golden").includes("vxo")'));await ev('setPref("art","svg")')
        # collection : vraie carte
        await ev('S.team=[{id:1,type:"rex",level:10,xp:0,v:"golden"},{id:2,type:"trike",level:10,xp:0,v:"lava"},{id:3,type:"raptor",level:10,xp:0}];save();go("team")');await pg.wait_for_timeout(300)
        check('collection : décor Doré et Lave visibles',await pg.locator('#team .vxo-golden').count()>=1 and await pg.locator('#team .vxo-lava').count()>=1)
        box=await ev('(()=>{const i=document.querySelector("#team .vxo-golden"),p=i.parentElement.getBoundingClientRect(),r=i.getBoundingClientRect();return [Math.round(r.width-p.width),Math.round(r.height-p.height),getComputedStyle(i).pointerEvents]})()')
        check('décor posé exactement sur le portrait, sans bloquer les clics',box==[0,0,'none'],box)
        await ev('F2.newP=F2.goldP=F2.callP=0;fight=null;startBattle({mode:"story",n:3});go("battle")');await pg.wait_for_timeout(200)
        check('combat : la version se voit sur la scène',await pg.locator('#battleArea .vxo-golden').count()>=1)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
