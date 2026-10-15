"""Transfert de sauvegarde entre la version PC (dossier) et la version téléphone (fichier unique)."""
import asyncio,pathlib,subprocess,sys,json,base64,tempfile
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
subprocess.run([sys.executable,str(ROOT/'tools'/'build.py')],check=True,stdout=subprocess.DEVNULL)
PC=(ROOT/'dist'/'ARK_PC'/'index.html').as_uri();PH=(ROOT/'dist'/'ARK_Telephone'/'ARK_Primal_World.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
SETUP='''()=>{S.team=[{id:1,type:"rex",level:44,xp:12,star:3,v:"golden",eq:{w:1}},{id:2,type:"gaia",level:31,xp:0,v:"shadow"},{id:3,type:"raptor",level:5,xp:0}];S.nextId=40;S.stage=37;S.stone=12345;S.essence=77;S.tickets=9;S.gear=4;S.mat={bone:11,hide:22,crystal:33,amber:44};
 S.items=[{id:1,s:"w",r:3,lvl:6,n:"Croc",pa:""},{id:2,s:"c",r:2,lvl:1,n:"Totem",pa:"thorns"}];S.nextItem=3;S.tower={floor:13,best:12,claimed:{10:1}};S.arena={r:1137,best:1200,wins:9,losses:4,day:"",left:3,medals:21,opp:null,log:[]};S.shards=8;S.bal={"histoire n5 [Normal]":{w:2,l:1,turns:9,hp:150}};save()}'''
SNAP='()=>{const o=JSON.parse(JSON.stringify(S));["day","dcnt","dclaimed","login","freeDay","ev"].forEach(k=>delete o[k]);return JSON.stringify(o,Object.keys(o).sort())}'
async def newpage(b,url,phone):
    ctx=await b.new_context(viewport={'width':390,'height':844} if phone else {'width':1200,'height':900},has_touch=phone,is_mobile=phone,accept_downloads=True)
    pg=await ctx.new_page();pg.errs=[];pg.on('pageerror',lambda e:pg.errs.append((e.stack or str(e))[:300]));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
    await pg.goto(url);await pg.wait_for_timeout(300);return pg
async def canon(pg):  # état canonique (clés triées récursivement)
    return await pg.evaluate('()=>{ens();const s=o=>Array.isArray(o)?o.map(s):o&&typeof o==="object"?Object.fromEntries(Object.keys(o).sort().map(k=>[k,s(o[k])])):o;const o=JSON.parse(JSON.stringify(S));["day","dcnt","dclaimed","login","freeDay","ev","hist","gstat"].forEach(k=>delete o[k]);return JSON.stringify(s(o))}')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pc=await newpage(b,PC,False);ph=await newpage(b,PH,True)
        check('plateforme PC / téléphone',await pc.evaluate('[ARK_PLATFORM,document.body.className.includes("pc")]')==['pc',True] and await ph.evaluate('[ARK_PLATFORM,document.body.className.includes("phone")]')==['phone',True])
        check('même version et même format',await pc.evaluate('[ARK_VERSION,SAVE_FORMAT]')==await ph.evaluate('[ARK_VERSION,SAVE_FORMAT]'))
        reqs=[];ph.on('request',lambda r:reqs.append(r.url));await ph.reload();await ph.wait_for_timeout(300)
        check('téléphone: un seul fichier (aucune autre ressource)',all(u.startswith('file://') and u.endswith('ARK_Primal_World.html') or u.startswith('data:') for u in reqs),reqs)
        # PC -> fichier -> téléphone
        await pc.evaluate(SETUP);ref=await canon(pc)
        async with pc.expect_download() as dl:await pc.evaluate('trExportFile()')
        d=await dl.value;f=pathlib.Path(tempfile.mkdtemp())/d.suggested_filename;await d.save_as(str(f))
        check('fichier .arksave nommé',f.name.startswith('ark-primal-world-') and f.name.endswith('.arksave'),f.name)
        env=json.loads(f.read_text());check('enveloppe valide (game/fmt/ver/from)',env['game']=='ark-primal-world' and env['fmt']==1 and env['from']=='pc' and 'S' in env)
        await ph.evaluate('go("home")')
        async with ph.expect_navigation():await ph.set_input_files('.savebox input[type=file]',str(f))
        await ph.wait_for_timeout(500)
        check('PC -> téléphone par fichier: progression identique',await canon(ph)==ref)
        check('téléphone: état persistant après rechargement',(await ph.reload(),await ph.wait_for_timeout(300),await canon(ph))[2]==ref)
        # téléphone -> code -> PC
        await ph.evaluate('S.stage=52;S.stone+=1000;S.tower.best=20;S.items.push({id:9,s:"a",r:1,lvl:0,n:"Carapace",pa:""});save()');ref2=await canon(ph)
        await ph.evaluate('trExportCode()');code=await ph.evaluate('document.getElementById("trCode").value')
        check('code ARK2 (compressé)',code.startswith('ARK2.') and len(code)<9000,len(code))
        await pc.evaluate('document.getElementById("trCode").value=%s'%json.dumps(code))
        async with pc.expect_navigation():await pc.evaluate('trImportCode()')
        await pc.wait_for_timeout(500);check('téléphone -> PC par code: progression identique',await canon(pc)==ref2)
        # PC -> téléphone par code, avec retours à la ligne ajoutés (copier/coller)
        await pc.evaluate('trExportCode()');code=await pc.evaluate('document.getElementById("trCode").value')
        await ph.evaluate('document.getElementById("trCode").value=%s'%json.dumps(code[:60]+"\n "+code[60:]))
        async with ph.expect_navigation():await ph.evaluate('trImportCode()')
        await ph.wait_for_timeout(500);check('code collé avec espaces/retours',await canon(ph)==ref2)
        # ancien format (base64 brut de S) toujours accepté
        legacy=base64.b64encode(json.dumps(json.loads(await pc.evaluate('JSON.stringify(S)'))).encode()).decode()
        await pc.evaluate('S.stage=1;save()')
        await pc.evaluate('document.getElementById("trCode").value=%s'%json.dumps(legacy))
        async with pc.expect_navigation():await pc.evaluate('trImportCode()')
        await pc.wait_for_timeout(400);check('ancien code accepté',await pc.evaluate('S.stage')==52)
        # sauvegarde de secours
        async with pc.expect_navigation():await pc.evaluate('trRestoreBackup()')
        await pc.wait_for_timeout(400);check('annuler le dernier import',await pc.evaluate('S.stage')==1)
        # rejets : l'état ne bouge pas
        before=await canon(pc)
        bad={'code absurde':'ARK2.@@@','vide':'','mauvais jeu':'ARK1.'+base64.b64encode(json.dumps({"game":"autre","fmt":1,"S":{}}).encode()).decode(),
             'format futur':'ARK1.'+base64.b64encode(json.dumps({"game":"ark-primal-world","fmt":99,"S":{"team":[{"type":"rex","level":1}]}}).encode()).decode(),
             'équipe vide':'ARK1.'+base64.b64encode(json.dumps({"game":"ark-primal-world","fmt":1,"S":{"team":[]}}).encode()).decode(),
             'espèce inconnue':'ARK1.'+base64.b64encode(json.dumps({"game":"ark-primal-world","fmt":1,"S":{"team":[{"type":"licorne","level":3}]}}).encode()).decode(),
             'ressource NaN':'ARK1.'+base64.b64encode(json.dumps({"game":"ark-primal-world","fmt":1,"S":{"team":[{"type":"rex","level":3}],"stone":"beaucoup"}}).encode()).decode()}
        for k,v in bad.items():
            await pc.evaluate('document.getElementById("trCode").value=%s'%json.dumps(v));await pc.evaluate('trImportCode()');await pc.wait_for_timeout(250)
            check('rejet: '+k,await canon(pc)==before and await pc.evaluate('!!document.querySelector(".toast")'))
        # fichier invalide
        bf=pathlib.Path(tempfile.mkdtemp())/'x.arksave';bf.write_text('pas du json')
        await pc.set_input_files('.savebox input[type=file]',str(bf));await pc.wait_for_timeout(300);check('rejet: fichier illisible',await canon(pc)==before)
        # réglages d'admin transférés par fichier
        await pc.evaluate('SPEC.raptor.name="Raptor Perso";localStorage.setItem("arkPrimalConfig",JSON.stringify({dinos:SPEC,economy:CONFIG}))')
        async with pc.expect_download() as dl:await pc.evaluate('trExportFile()')
        d=await dl.value;f2=pathlib.Path(tempfile.mkdtemp())/'a.arksave';await d.save_as(str(f2))
        async with ph.expect_navigation():await ph.set_input_files('.savebox input[type=file]',str(f2))
        await ph.wait_for_timeout(500);check('nom personnalisé (admin) transféré',await ph.evaluate('SPEC.raptor.name')=='Raptor Perso')
        # clavier PC
        await pc.evaluate('S.team=[{id:1,type:"rex",level:30,xp:0},{id:2,type:"spino",level:30,xp:0},{id:3,type:"trike",level:30,xp:0}];startBattle({mode:"story",n:1})')
        t0=await pc.evaluate('fight.turn');await pc.keyboard.press('1');await pc.wait_for_timeout(100)
        check('PC: touche 1 joue une orbe',await pc.evaluate('fight.turn')!=t0 or await pc.evaluate('fight.combo>=0&&fight.log.length>0'))
        check('PC: aide clavier affichée',await pc.evaluate('document.getElementById("battleArea").innerText.includes("Clavier")'))
        check('téléphone: pas d\'aide clavier',await ph.evaluate('(startBattle({mode:"story",n:1}),!document.getElementById("battleArea").innerText.includes("Clavier"))'))
        check('aucune erreur JS',not pc.errs and not ph.errs,(pc.errs,ph.errs))
        await b.close()
    print('ECHECS:',FAILS) if FAILS else print('TOUT OK')
asyncio.run(main())
sys.exit(1 if FAILS else 0)  # échec visible pour tools/run_tests.sh
