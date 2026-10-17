"""Application II (0.41) : crochets déclarés (hook), journal d'erreurs, comparaison de versions et vérification de mise à jour
(réponse GitHub simulée, vrai clic), copies de sauvegarde (pont de bureau simulé : fichier courant + copie datée hebdomadaire),
rappel d'export hebdomadaire (navigateur), économie d'énergie, copie de secours IndexedDB (restaurée après effacement du
localStorage), manette (boutons simulés), mode développeur (journal du combat), lecteur d'écran (arbre d'accessibilité)."""
import asyncio,pathlib,sys,os,json
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/os.environ.get('ARK_PAGE','index.html')).as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1280,'height':800});pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        async def gh(route):await route.fulfill(status=200,content_type='application/json',body=json.dumps({'tag_name':'v9.9.9','html_url':'https://github.com/poiscail/ark-primal-world/releases/tag/v9.9.9'}))
        await ctx.route('https://api.github.com/**',gh)
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=["rex","giga","raptor"].map((t,i)=>({id:i+1,type:t,level:30,xp:0}));S.stage=40;ens();save();localStorage.removeItem("arkPrimalErrors")')
        # crochets
        r=await ev('(()=>{window.__h=0;hook("closeModal",()=>{__h++},{id:"test"});closeModal();return [__h,HOOKS.closeModal.includes("test")]})()')
        check('hook : le crochet s\'exécute après la fonction',r==[1,True],r)
        r=await ev('(()=>{let n=0;window.__hf=function(x){n+=x;return n};hook("__hf",null,{before:x=>x>0});__hf(-5);__hf(2);return n})()')
        check('hook : « avant » peut annuler l\'appel',r==2,r)
        # journal d'erreurs
        await ev('setTimeout(()=>{throw new Error("boum test")},0)');await pg.wait_for_timeout(100);errs.clear()
        check('erreur enregistrée localement (version, message)',await ev('appErrs()[0].m.includes("boum test")&&appErrs()[0].v===ARK_VERSION'))
        await ev('appErrView()');check('rapport d\'erreurs lisible',await pg.locator('#modalBody .aperrs div').count()>=1);await ev('closeModal()')
        # versions et mise à jour
        check('comparaison de versions',await ev('[verCmp("0.41.0","0.40.9"),verCmp("v0.9.0","0.10.0"),verCmp("1.0.0","1.0.0")]')==[1,-1,0])
        await ev('openSettings()');await pg.click('#apOpts button:has-text("VÉRIFIER")');await pg.wait_for_timeout(300)
        check('vrai clic : nouvelle version détectée (réponse simulée)','9.9.9' in await pg.inner_text('#apUpd') and await ev('APP_UPD.newer')==True,await pg.inner_text('#apUpd'))
        await ev('closeSettings()')
        # copies de sauvegarde (pont simulé)
        await ev('window.__files={};window.arkDesktop={opts:()=>({backupDir:"/copies"}),backup:(n,c)=>{__files[n]=c;return true}};localStorage.setItem("arkPrimalWeekly","0")')
        check('copie de sauvegarde dans le dossier choisi',await ev('appBackupNow(true)')==True)
        f=await ev('Object.keys(__files)');check('fichier courant + copie datée de la semaine',('ARK-sauvegarde.json' in f) and any(x.startswith('ARK-sauvegarde-2') for x in f),f)
        check('la copie est une sauvegarde valide',await ev('(()=>{try{validate(JSON.parse(__files["ARK-sauvegarde.json"]));return true}catch(e){return String(e)}})()')==True)
        await ev('__files={}');await ev('appBackupNow(true)');check('pas de 2e copie datée la même semaine',await ev('Object.keys(__files).length')==1)
        await ev('delete window.arkDesktop')
        # rappel hebdomadaire (navigateur)
        await ev('localStorage.setItem("arkPrimalWeekly",String(Date.now()-8*864e5))');check('rappel d\'export après une semaine',await ev('appWeeklyReminder()')==True and await ev('appWeeklyReminder()')==False)
        # économie d'énergie
        await ev('setPref("eco",true);document.documentElement.classList.add("apidle")');await pg.mouse.move(200,200);await pg.mouse.move(220,230)
        check('économie d\'énergie : une action réveille les animations',not await ev('document.documentElement.classList.contains("apidle")'));await ev('setPref("eco",false)')
        # IndexedDB
        await ev('save()');await pg.wait_for_timeout(2600);n=await ev('S.team.length')
        check('copie de secours écrite dans IndexedDB',(await ev('appIdbGet("save")')) is not None)
        await ev('localStorage.removeItem("arkPrimalMobile");appIdbRestore()');await pg.wait_for_timeout(1500);await pg.wait_for_function('typeof S==="object"&&typeof appIdb==="function"')
        check('sauvegarde effacée du localStorage : restaurée depuis IndexedDB',await ev('!!localStorage.getItem("arkPrimalMobile")') and await ev('S.team.length')==n)
        # manette (boutons simulés)
        await ev('setPref("anim",false);fight=null;startBattle({mode:"story",n:3});go("battle")')
        await ev('padButton(13)');check('manette : la croix sélectionne une orbe',await ev('document.activeElement.classList.contains("orb")'))
        await ev('padButton(15)');check('manette : droite → orbe suivante',await ev('[...document.querySelectorAll("#battleArea .orbboard .orb")].indexOf(document.activeElement)')==1)
        a0=await ev('PREFS.auto');await ev('padButton(3)');check('manette : Y bascule l\'auto-combat',await ev('PREFS.auto')!=a0);await ev('setPref("auto",false)')
        await ev('padButton(9)');check('manette : Start met en pause',await pg.locator('#u2pause').count()==1);await ev('padButton(1)');check('manette : B reprend',await pg.locator('#u2pause').count()==0)
        # mode développeur
        await ev('setPref("dev",true);DEVLOG.length=0;fight=null;startBattle({mode:"story",n:3});tapOrb(0)')
        r=await ev('DEVLOG.map(x=>x.e)');check('mode développeur : début, orbe… dans le journal','début' in r and 'orbe' in r,r)
        await ev('devView()');check('journal du combat affiché',await pg.locator('#modalBody .apdev div').count()>=2);await ev('closeModal();setPref("dev",false);fight=null;go("home")')
        # lecteur d'écran
        snap=await pg.accessibility.snapshot(interesting_only=False)
        def walk(n,out):
            out.append((n.get('role'),n.get('name')));[walk(c,out) for c in n.get('children',[])];return out
        L=walk(snap,[])
        check('lecteur d\'écran : navigation principale nommée',('navigation','Navigation principale') in L,[x for x in L if x[0]=='navigation'][:3])
        nb=[x for x in L if x[0]=='button' and not (x[1] or '').strip()]
        check('lecteur d\'écran : aucun bouton sans nom à l\'accueil',nb==[],nb[:5])
        # admin : éditeur des zones et des ennemis
        await ev('buildAdmin()');check('admin : éditeur des zones (4) et de la force des ennemis',await pg.locator('#ad2Box .ad2z').count()==4 and await pg.locator('#ad2h').count()==1)
        await ev('(()=>{const r=document.querySelector("#ad2Box .ad2z");r.querySelector("[data-k=n]").value="Marais";r.querySelector("[data-k=e]").value="🐸 🦟 🐊";document.getElementById("ad2h").value="2"})()')
        await ev('saveAdmin()');await pg.wait_for_timeout(200)
        check('admin : zone renommée et ennemis plus robustes',await ev('[ZONES[0][0],ZONES[0][1][0],TUNE.h]')==['Marais','🐸',2])
        await ev('fight=null;startBattle({mode:"story",n:3})');check('admin : la zone renommée apparaît en combat','Marais' in await ev('fight.zone||""'),await ev('fight.zone'))
        await ev('fight=null;ad2Reset()');check('admin : retour aux valeurs par défaut',await ev('[ZONES[0][0],TUNE.h]')==['Jungle',1.3] and await ev('localStorage.getItem("arkPrimalAdmin2")')==None)
        # le guide « ajouter une espèce » fonctionne tel quel (ses 3 premiers blocs de code exécutés dans le jeu)
        import re as _re
        blocs=_re.findall(r"```js\n(.*?)```",(pathlib.Path(__file__).resolve().parent.parent/'docs'/'AJOUTER_UNE_ESPECE.md').read_text(),_re.S)[:3]
        await ev('(()=>{'+'\n'.join(blocs)+'})()')
        r=await ev('[!!SPEC.ourano,SPEC.ourano&&SPEC.ourano.r,/<svg/.test(portrait("ourano",true)),EVO.ourano,isEx("ourano")]')
        check('docs/AJOUTER_UNE_ESPECE.md : l\'exemple marche (espèce, portrait, évolution, exclusivité)',r==[True,'Rare',True,'parasau',True],r)
        dup=await ev('(()=>{const s={},d=[];ACH.forEach(a=>{if(s[a[0]])d.push(a[0]);s[a[0]]=1});return d})()');check('identifiants de succès uniques',dup==[],dup)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
