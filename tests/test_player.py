"""Mon dresseur (0.27) : pseudo, apparence (vrais clics), pièces verrouillées, nom de l'île, compagnon, emote de victoire,
photo de groupe après un boss, carte de dresseur en PNG, pseudo dans les dialogues et l'Arène, sauvegarde."""
import asyncio,pathlib,sys
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
WIN='''()=>{let g=0;while(fight&&!fight.over&&g++<20){const e=fight.enemies[fight.wave];e.hp=1;e.sh=0;tapOrb(0)}return fight.over}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1280,'height':800},accept_downloads=True);pg=await ctx.new_page();ev=pg.evaluate
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(400)
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.team=[{id:1,type:"rex",level:30,xp:0},{id:2,type:"giga",level:28,xp:0},{id:3,type:"raptor",level:25,xp:0},{id:4,type:"spino",level:20,xp:0}];S.nextId=10;S.stage=35;S.nm=null;S.far=null;S.player=null;ens();save();go("home")')
        check('barre du haut : « Choisir un pseudo » mis en avant',await ev('document.getElementById("plChip").classList.contains("new")&&/Choisir un pseudo/.test(document.getElementById("plChip").textContent)'))
        check('rappel « À faire » pour choisir son pseudo',await ev('todoItems().some(x=>/pseudo/.test(x.t))'))
        await pg.click('#plChip');await pg.wait_for_timeout(150)
        check('éditeur ouvert (vrai clic)',await ev('!!document.querySelector("#modalBody .pledit")'))
        check('pièces verrouillées : cape (Cauchemar 10) et couronne (histoire 100)',await ev('[...document.querySelectorAll(".plopts button.lock")].map(b=>b.textContent).join("|")').__contains__('Cape') if False else ('Cape' in await ev('[...document.querySelectorAll(".plopts button.lock")].map(b=>b.textContent).join("|")') and 'Couronne' in await ev('[...document.querySelectorAll(".plopts button.lock")].map(b=>b.textContent).join("|")')))
        check('armure d\'os débloquée (histoire 30)',await ev('!document.querySelector(".plopts button[onclick*=\\"\'os\'\\"]").disabled'))
        await pg.fill('#plName','Lé');await pg.click('.pledit button.blue');await pg.wait_for_timeout(100)
        check('pseudo trop court refusé',await ev('S.player.name')=='' and await ev('!!document.querySelector("#modalBody .pledit")'))
        await pg.fill('#plName','Léo<b>Rex');await pg.fill('#plIsland','Île Tonnerre')
        await pg.click('.plopts button:has-text("Hérissés")');await pg.click('.plopts button:has-text("Armure")');await pg.click('.plopts button:has-text("Volcan")');await pg.click('.plopts button:has-text("RAAAWR")')
        await pg.click('.plcols .plc >> nth=3');await pg.wait_for_timeout(100)
        check('l\'aperçu suit les choix (vrais clics), le texte saisi est gardé',await ev('plDraft.hair==="pique"&&plDraft.out==="os"&&plDraft.bg==="volcan"&&plDraft.emo==="🦖"&&document.getElementById("plName").value==="Léo<b>Rex"'))
        await pg.click('.pledit button.blue');await pg.wait_for_timeout(150)
        P=await ev('S.player')
        check('enregistré : pseudo nettoyé, île, apparence',P['name']=='LéobRex' and P['island']=='Île Tonnerre' and P['hair']=='pique' and P['out']=='os' and P['skin']==3,P)
        check('barre du haut et accueil affichent le pseudo',await ev('/LéobRex/.test(document.getElementById("plChip").textContent)&&!document.getElementById("plChip").classList.contains("new")&&/Bienvenue, LéobRex/.test(document.querySelector("#home .plwel").textContent)'))
        check('succès « Un nom pour l\'histoire »',await ev('ACH.find(a=>a[0]==="pl1")[3]()')==1)
        r=await ev('(()=>{plEdit();for(let i=0;i<40;i++){plRandom();if(!plFree(plDraft.out)||!plFree(plDraft.acc)||!plFree(plDraft.bg))return false}plDraft=null;closeModal();return true})()')
        check('« au hasard » ne choisit que des pièces débloquées',r)
        await ev('S.player.out="cape";S.player.acc="couronne";plEdit();plSave()')
        check('une pièce verrouillée n\'est jamais gardée',await ev('S.player.out')=='gilet' and await ev('S.player.acc')=='chapeau')
        # ---- dialogues, Arène
        await ev('setPref("lore",true);loreShow(100)');t=await ev('loreCur.lines.join(" ")');await ev('loreClose()')
        check('dialogues : « survivant » remplacé par le pseudo','Merci, LéobRex.' in t and 'survivant' not in t,t[:200])
        check('Arène : le pseudo dans le classement',await ev('board().find(r=>r.me).n')=='LéobRex (toi)')
        # ---- profil, compagnon, carte PNG
        await ev('setPref("lore",false);go("home");subSet("home","profile")');await pg.wait_for_timeout(150)
        check('profil : carte du dresseur',await ev('!!document.querySelector("#playerBox .plbig svg")&&/Île Tonnerre/.test(document.getElementById("playerBox").textContent)'))
        await pg.click('#playerBox button:has-text("COMPAGNON")');await pg.wait_for_timeout(100);await pg.click('#modalBody .nprow:has-text("Spinosaurus")');await pg.wait_for_timeout(100)
        check('compagnon choisi (vrai clic) et affiché sur l\'accueil',await ev('S.player.pet')==4 and await ev('!!document.querySelector("#home .plwel .plpet svg")'))
        async with pg.expect_download() as d:await pg.click('#playerBox button:has-text("EXPORTER")')
        dl=await d.value;path=await dl.path();data=open(path,'rb').read()
        check('carte de dresseur exportée en PNG',dl.suggested_filename=='carte-dresseur-LéobRex.png' and data[:8]==b'\x89PNG\r\n\x1a\n' and len(data)>20000,(dl.suggested_filename,len(data)))
        # ---- victoire : emote, photo de groupe après un boss
        await ev('fight=null;startBattle({mode:"story",n:9})');await ev(WIN);await ev('go("battle")')
        check('victoire : emote du dresseur','RAAAWR' in (await ev('document.querySelector("#battleArea .pemote").textContent')))
        check('pas de photo de groupe sans boss',await ev('!document.querySelector("#battleArea .plphoto")'))
        await ev('fight=null;startBattle({mode:"story",n:10})');await ev(WIN);await ev('go("battle")');await pg.wait_for_timeout(100)
        async with pg.expect_download() as d:await pg.click('#battleArea .plphoto')
        dl=await d.value
        check('boss vaincu : photo de groupe (vrai clic, PNG)',dl.suggested_filename.startswith('photo-de-groupe-'),dl.suggested_filename)
        # ---- sauvegarde
        await ev('save()');await pg.reload();await pg.wait_for_timeout(400)
        check('conservé après rechargement',await ev('S.player.name==="LéobRex"&&S.player.pet===4&&S.player.emo==="🦖"'))
        check('aucune erreur JS',errs==[],errs)
        await b.close()
    print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
asyncio.run(main())
