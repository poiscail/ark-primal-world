"""Sauvegarde (version PC) : export / import par fichier et par code entre deux ordinateurs (deux profils de navigateur
séparés), anciennes sauvegardes acceptées (code base64, fichier de l'ancienne version téléphone), rejets, clavier du combat."""
import asyncio,pathlib,sys,json,base64,tempfile
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
SETUP='''()=>{S.team=[{id:1,type:"rex",level:44,xp:12,star:3,v:"golden",eq:{w:1}},{id:2,type:"gaia",level:31,xp:0,v:"shadow"},{id:3,type:"raptor",level:5,xp:0}];S.nextId=40;S.stage=37;S.stone=12345;S.essence=77;S.tickets=9;S.gear=4;S.mat={bone:11,hide:22,crystal:33,amber:44};
 S.items=[{id:1,s:"w",r:3,lvl:6,n:"Croc",pa:""},{id:2,s:"c",r:2,lvl:1,n:"Totem",pa:"thorns"}];S.nextItem=3;S.tower={floor:13,best:12,claimed:{10:1}};S.arena={r:1137,best:1200,wins:9,losses:4,day:"",left:3,medals:21,opp:null,log:[]};S.shards=8;S.bal={"histoire n5 [Normal]":{w:2,l:1,turns:9,hp:150}};save()}'''
async def newpage(b,name):
    """un « ordinateur » = un contexte de navigateur séparé (stockage local à part)"""
    ctx=await b.new_context(viewport={'width':1280,'height':800},accept_downloads=True)
    pg=await ctx.new_page();pg.name=name;pg.errs=[];pg.dialogs=[]
    pg.on('pageerror',lambda e:pg.errs.append((e.stack or str(e))[:300]))
    def dlg(d):pg.dialogs.append(d.message);asyncio.ensure_future(d.accept())
    pg.on('dialog',dlg)
    await pg.goto(GAME);await pg.wait_for_timeout(300);await pg.evaluate('S.tut={off:true,seen:{}};ens();save()');return pg
async def canon(pg):  # état canonique (clés triées récursivement)
    return await pg.evaluate('()=>{ens();const s=o=>Array.isArray(o)?o.map(s):o&&typeof o==="object"?Object.fromEntries(Object.keys(o).sort().map(k=>[k,s(o[k])])):o;const o=JSON.parse(JSON.stringify(S));["day","dcnt","dclaimed","login","freeDay","ev","hist","gstat","dch","dig","mkt"].forEach(k=>delete o[k]);return JSON.stringify(s(o))}')
async def export_file(pg):
    async with pg.expect_download() as dl:await pg.evaluate('trExportFile()')
    d=await dl.value;f=pathlib.Path(tempfile.mkdtemp())/d.suggested_filename;await d.save_as(str(f));return f
async def import_file(pg,f):
    await pg.evaluate('go("home");subSet("home","profile")')
    async with pg.expect_navigation():await pg.set_input_files('.savebox input[type=file]',str(f))
    await pg.wait_for_timeout(500)
async def import_code(pg,code):
    await pg.evaluate('go("home");subSet("home","profile");document.getElementById("trCode").value=%s'%json.dumps(code))
    async with pg.expect_navigation():await pg.evaluate('trImportCode()')
    await pg.wait_for_timeout(500)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        A=await newpage(b,'PC A');B=await newpage(b,'PC B')
        check('plateforme PC',await A.evaluate('[ARK_PLATFORM,document.body.classList.contains("pc")]')==['pc',True])
        check('même version et même format',await A.evaluate('[ARK_VERSION,SAVE_FORMAT]')==await B.evaluate('[ARK_VERSION,SAVE_FORMAT]'))
        check('bloc Sauvegarde sans mention du téléphone',await A.evaluate('!document.querySelector(".savebox").closest("section").innerText.includes("PC ↔ téléphone")'))
        # PC A -> fichier -> PC B
        await A.evaluate(SETUP);ref=await canon(A)
        f=await export_file(A)
        check('fichier .arksave nommé',f.name.startswith('ark-primal-world-') and f.name.endswith('.arksave'),f.name)
        env=json.loads(f.read_text());check('enveloppe valide (game/fmt/ver/from)',env['game']=='ark-primal-world' and env['fmt']==1 and env['from']=='pc' and 'S' in env)
        await import_file(B,f)
        check('PC A -> PC B par fichier : progression identique',await canon(B)==ref)
        check('PC B : état persistant après rechargement',(await B.reload(),await B.wait_for_timeout(300),await canon(B))[2]==ref)
        # PC B -> code -> PC A
        await B.evaluate('S.stage=52;S.stone+=1000;S.tower.best=20;S.items.push({id:9,s:"a",r:1,lvl:0,n:"Carapace",pa:""});save()');ref2=await canon(B)
        await B.evaluate('trExportCode()');code=await B.evaluate('document.getElementById("trCode").value')
        check('code ARK2 (compressé)',code.startswith('ARK2.') and len(code)<9000,len(code))
        await import_code(A,code);check('PC B -> PC A par code : progression identique',await canon(A)==ref2)
        # code collé avec espaces et retours à la ligne
        await A.evaluate('trExportCode()');code=await A.evaluate('document.getElementById("trCode").value')
        await import_code(B,code[:60]+"\n "+code[60:]);check('code collé avec espaces/retours',await canon(B)==ref2)
        # ancien format (base64 brut de S) toujours accepté
        legacy=base64.b64encode(json.dumps(json.loads(await A.evaluate('JSON.stringify(S)'))).encode()).decode()
        await A.evaluate('S.stage=1;save()');await import_code(A,legacy);check('ancien code accepté',await A.evaluate('S.stage')==52)
        # sauvegarde de secours
        async with A.expect_navigation():await A.evaluate('trRestoreBackup()')
        await A.wait_for_timeout(400);check('annuler le dernier import',await A.evaluate('S.stage')==1)
        # fichier de l'ancienne version téléphone : accepté, origine annoncée
        old=json.loads(f.read_text());old.update({'from':'phone','ver':'0.12.0'});old['S']['stage']=61
        fo=pathlib.Path(tempfile.mkdtemp())/'ancienne-version-telephone.arksave';fo.write_text(json.dumps(old))
        B.dialogs.clear();await import_file(B,fo)
        check('ancienne sauvegarde téléphone importée',await B.evaluate('S.stage')==61)
        check('origine « téléphone » annoncée avant l\'import',any('téléphone' in m for m in B.dialogs),B.dialogs)
        # rejets : l'état ne bouge pas
        before=await canon(A)
        bad={'code absurde':'ARK2.@@@','vide':'','mauvais jeu':'ARK1.'+base64.b64encode(json.dumps({"game":"autre","fmt":1,"S":{}}).encode()).decode(),
             'format futur':'ARK1.'+base64.b64encode(json.dumps({"game":"ark-primal-world","fmt":99,"S":{"team":[{"type":"rex","level":1}]}}).encode()).decode(),
             'équipe vide':'ARK1.'+base64.b64encode(json.dumps({"game":"ark-primal-world","fmt":1,"S":{"team":[]}}).encode()).decode(),
             'espèce inconnue':'ARK1.'+base64.b64encode(json.dumps({"game":"ark-primal-world","fmt":1,"S":{"team":[{"type":"licorne","level":3}]}}).encode()).decode(),
             'ressource NaN':'ARK1.'+base64.b64encode(json.dumps({"game":"ark-primal-world","fmt":1,"S":{"team":[{"type":"rex","level":3}],"stone":"beaucoup"}}).encode()).decode()}
        for k,v in bad.items():
            await A.evaluate('document.getElementById("trCode").value=%s'%json.dumps(v));await A.evaluate('trImportCode()');await A.wait_for_timeout(250)
            check('rejet: '+k,await canon(A)==before and await A.evaluate('!!document.querySelector(".toast")'))
        bf=pathlib.Path(tempfile.mkdtemp())/'x.arksave';bf.write_text('pas du json')
        await A.set_input_files('.savebox input[type=file]',str(bf));await A.wait_for_timeout(300);check('rejet: fichier illisible',await canon(A)==before)
        # réglages d'admin transférés par fichier
        await A.evaluate('SPEC.raptor.name="Raptor Perso";localStorage.setItem("arkPrimalConfig",JSON.stringify({dinos:SPEC,economy:CONFIG}))')
        f2=await export_file(A);await import_file(B,f2)
        check('nom personnalisé (admin) transféré',await B.evaluate('SPEC.raptor.name')=='Raptor Perso')
        # clavier du combat : touches 1 à 9 par position (AZERTY : la touche « 5 » donne « ( » sans Maj)
        await A.evaluate('S.team=[{id:1,type:"rex",level:30,xp:0},{id:2,type:"spino",level:30,xp:0},{id:3,type:"trike",level:30,xp:0}];setPref("lore",false);startBattle({mode:"story",n:1});fight.enemies.forEach(e=>{e.hp=e.max=999999});renderBattle()')
        t0=await A.evaluate('fight.turn');await A.keyboard.press('Digit9');await A.wait_for_timeout(100)
        check('touche 9 : joue la 9e orbe',await A.evaluate('fight.turn')==t0+1,(t0,await A.evaluate('fight.turn')))
        t1=await A.evaluate('fight.turn')
        await A.evaluate('document.dispatchEvent(new KeyboardEvent("keydown",{key:"(",code:"Digit5",bubbles:true}))');await A.wait_for_timeout(100)
        check('AZERTY : touche 5 sans Maj (« ( ») joue une orbe',await A.evaluate('fight.turn')==t1+1)
        t2=await A.evaluate('fight.turn');await A.keyboard.press('Numpad3');await A.wait_for_timeout(100)
        check('pavé numérique : 3 joue une orbe',await A.evaluate('fight.turn')==t2+1)
        check('aide clavier : 1 à 9',await A.evaluate('document.getElementById("battleArea").innerText.includes("1 à 9 orbes")'))
        check('aucune erreur JS',not A.errs and not B.errs,(A.errs,B.errs))
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
