"""Combat I (0.28) : super renforcée (×1,7) et effet de famille du chef, Ruée, Coup final, rage ennemie (furie ×1,5),
Garde (vrai clic et touche G), frise des tours ennemis, recharges en cercle, infobulles, super presque prête."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
TEAM='(k)=>{S.team=[k,"rex","raptor"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.stage=40;fight=null;startBattle({mode:"story",n:12});const f=fight;f.enemies.forEach(e=>{e.tr="";e.sh=0;e.hp=e.max=1e9});f.stun=0;f.dots=[];return true}'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1280,'height':800});ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400);await ev('setPref("anim",false);setPref("lore",false);WX_ON=false;S.tut={off:true,seen:{}};ens()')
        # ---- super renforcée (chef ankylosaure : rempart, sans dégâts en plus)
        await ev(TEAM,'nodo')
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave],hit=()=>{f.sp=100;f.stun=9;f.dots=[];f.buff.shield=0;e.hp=1e9;special();return 1e9-e.hp};SUPER_TUNE=1;const a=hit();SUPER_TUNE=1.7;const b=hit();return [a,b,f.buff.shield]})()''')
        check('super ×1,7 par rapport à l\'ancienne',abs(r[1]/r[0]-1.7)<.03,r)
        check('famille ankylosaure : Rempart (−50 % pendant 2 tours)',r[2]>=1,r)
        fx={'coelo':'f.dots.length===1','proto':'e.sh===0','huayang':'f.thorn>=1','rhampho':'f.sp>=25','argento':'f.stun>=0&&f._st===1','maia':'f.hp[1]>h1','notho':'e.tr===""'}
        for k,cond in fx.items():
            await ev(TEAM,k)
            ok=await ev('''(()=>{const f=fight,e=f.enemies[f.wave];e.sh=500;e.tr="heal";f.hp[1]=Math.round(f.mx[1]*.5);const h1=f.hp[1];f.sp=100;f.stun=0;const st0=f.stun;
              const _et=enemyTurn;let seen=0;enemyTurn=function(){if(f.stun>0)seen=1;return _et()};special();enemyTurn=_et;f._st=seen;return %s})()'''%cond)
            check('super de famille : '+k+' ('+fx[k].split('.')[1][:6]+')',ok)
        # ---- Ruée
        await ev(TEAM,'rex')
        r=await ev('''(()=>{const f=fight,L=[];f.combo=0;f.last=null;for(let i=0;i<3;i++){f.orbs=Array(9).fill("redorb");tapOrb(0);L.push(/RUÉE/.test(f.log))}return L})()''')
        check('Ruée : la 3e orbe de la même couleur d\'affilée (pas avant)',r==[False,False,True],r)
        # ---- Coup final
        r=await ev('''(()=>{const f=fight;f.wave=0;const e=f.enemies[0];e.el="greenorb";e.hp=1;e.max=1000;f.sp=0;f.combo=0;f.last=null;f.orbs=Array(9).fill("redorb");tapOrb(0);return [f.wave,f.sp,/COUP FINAL/.test(f.log)]})()''')
        check('Coup final : achever avec l\'élément qui bat l\'ennemi donne +20 % de super',r[0]==1 and r[1]>=35 and r[2],r)
        r=await ev('''(()=>{const f=fight,e=f.enemies[1];e.el="redorb";e.hp=1;e.max=1000;f.sp=0;f.combo=0;f.last=null;f.orbs=Array(9).fill("greenorb");tapOrb(0);return /COUP FINAL/.test(f.log)})()''')
        check('pas de coup final sans avantage',r is False)
        # ---- rage
        await ev(TEAM,'rex')
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave];e.el="greenorb";e.rage=0;f.orbs=Array(9).fill("blueorb");f.combo=0;f.last=null;tapOrb(0);const a=e.rage;f.orbs=Array(9).fill("redorb");f.combo=0;f.last=null;tapOrb(0);return [a,e.rage]})()''')
        check('rage : +20 sans avantage, −10 avec l\'élément qui bat l\'ennemi',r==[20,10],r)
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave],r0=Math.random;Math.random=()=>0;const hit=rg=>{f.hp=f.mx.slice();f.turn=1;f.stun=0;f.buff.shield=0;f.guard=0;e.rage=rg;enemyTurn();return f.mx.reduce((s,m,k)=>s+m-f.hp[k],0)};const a=hit(0),b=hit(100),c=e.rage;Math.random=r0;return [a,b,c]})()''')
        check('rage pleine : FURIE ×1,5, puis la rage retombe à 0',r[1]>r[0]*1.3 and r[2]==0,r)
        # ---- garde (vrai clic) et touche G
        await ev('go("battle")');await ev('renderBattle()')
        r=await ev('''(()=>{const f=fight,e=f.enemies[f.wave],r0=Math.random;Math.random=()=>0;f.hp=f.mx.slice();f.turn=1;f.stun=0;e.rage=0;f.buff.shield=0;const o0=f.orbs.join(),sp0=f.sp,eh=e.hp;window.__g={o0,sp0,eh};Math.random=r0;return 1})()''')
        await ev('window.__r0=Math.random;Math.random=()=>0')
        await pg.click('#battleArea button.c2guard');await pg.wait_for_timeout(50)
        g=await ev('(()=>{Math.random=window.__r0;const f=fight,e=f.enemies[f.wave];return {lost:f.mx.reduce((s,m,k)=>s+m-f.hp[k],0),sp:f.sp,eh:e.hp,guard:f.guard,log:f.log}})()')
        await ev('(()=>{const f=fight,r0=Math.random;Math.random=()=>0;f.hp=f.mx.slice();f.turn=1;f.stun=0;f.enemies[f.wave].rage=0;enemyTurn();window.__n=f.mx.reduce((s,m,k)=>s+m-f.hp[k],0);Math.random=r0})()')
        n=await ev('window.__n');w=await ev('window.__g')
        check('Garde (vrai clic) : dégâts subis divisés par deux, ni dégâts ni super, garde retirée ensuite',g['lost']<=n*.6 and g['sp']==w['sp0'] and g['eh']==w['eh'] and g['guard']==0,(g,n))
        c0=await ev('(S.cnt||{}).guards||0');await ev('renderBattle()');await pg.keyboard.press('g')
        check('touche G : garde',await ev('(S.cnt||{}).guards')==c0+1)
        # ---- affichage
        await ev('(()=>{const f=fight;f.turn=1;f.stun=1;f.sp=95;renderBattle()})()')
        t=await ev('[...document.querySelectorAll("#battleArea .etl .etl-t")].map(x=>x.textContent)')
        check('frise : 4 tours, étourdi puis attaque puissante au 3e tour',len(t)==4 and t[0]=='💫' and t[1] in ('⚠️','🌋'),t)
        check('jauge de rage dans le HUD',await ev('!!document.querySelector("#battleArea .sHud .rage")'))
        check('super presque prête (95 %) : jauge animée',await ev('document.getElementById("battleArea").classList.contains("spnear")'))
        check('recharge en cercle et infobulle des compétences',await ev('[...document.querySelectorAll("#battleArea button.skbtn.cdr")].length===3&&/recharge/.test(document.querySelector("#battleArea button.skbtn.cdr").title)'))
        check('infobulle des orbes : dégâts estimés',await ev('/≈ \\d+ dégâts/.test(document.querySelector("#battleArea .orbboard button.orb").title)'))
        check('bouton de super : effet de famille affiché',await ev('/Saignement|Rempart|Séisme|Épines|Piqué|Chant|Raz|Brise/.test(document.querySelector("#battleArea button[onclick=\\"special()\\"]").textContent)'))
        check('succès « Furie maîtrisée » à suivre',await ev('ACH.some(a=>a[0]==="c2a")'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
