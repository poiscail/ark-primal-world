"""Onglets II (0.46) : sous-onglets de l'Aventure et des Quêtes rangés par thème (tous les boutons gardés), ligne « où suis-je »
(chemin + explication) sur chaque écran, filtres des Succès et sections repliables des Missions par vrais clics, grilles affichées
seulement sur l'écran ouvert."""
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
        await ev('setPref("anim",false);setPref("lore",false);S.tut={off:true,seen:{}};S.stage=40;save()')
        await ev('go("story")')
        check('Aventure : 3 groupes (Histoire, Défis, Compétition)',await ev('[...document.querySelectorAll("#subnav .sngrp")].map(x=>x.textContent)')==['Histoire','Défis','Compétition'])
        check('Aventure : les 12 sous-onglets sont toujours là',await ev('document.querySelectorAll("#subnav button").length')==12)
        await pg.click('#subnav button[onclick="go(\'tower\')"]');await pg.wait_for_timeout(150)
        t=await ev('document.getElementById("t2where").textContent')
        check('vrai clic sur Tour : « Aventure › Défis › Tour » et son explication',await ev('screen')=='tower' and 'Défis' in t and 'Tour' in t and 'étage' in t,t)
        await ev('go("missions")')
        check('Quêtes : 3 groupes, 7 sous-onglets',await ev('[...document.querySelectorAll("#subnav .sngrp")].map(x=>x.textContent)')==['Chaque jour','Ma base','Collection'] and await ev('document.querySelectorAll("#subnav button").length')==7)
        miss=await ev('''(()=>{const r=[];for(const g of Object.keys(GRP)){const G=GRP[g];if(G.screens)G.screens.forEach(x=>{if(!T2_DESC[x[0]])r.push(x[0])});else G.sub.forEach(x=>{if(!T2_DESC[g+":"+x[0]])r.push(g+":"+x[0])})}return r})()''')
        check('chaque onglet et sous-onglet a son explication',miss==[],miss)
        await ev('go("team")');await pg.click('#subnav button:has-text("Améliorer")');await pg.wait_for_timeout(100)
        t=await ev('document.getElementById("t2where").textContent');check('sous-onglet Équipe › Améliorer',('Équipe' in t) and ('Améliorer' in t),t)
        # succès
        await ev('ACH.slice(0,3).forEach(a=>S.ach.got[a[0]]=1);save();go("achs")');await pg.wait_for_timeout(100)
        n=await ev('document.querySelectorAll("#achs>.panel.ach").length')
        await pg.click('#t2achbar button:has-text("Obtenus")')
        check('vrai clic : filtre « Obtenus »',await ev('[...document.querySelectorAll("#achs>.panel.ach")].filter(p=>p.offsetParent).every(p=>p.classList.contains("done"))') and await ev('[...document.querySelectorAll("#achs>.panel.ach")].filter(p=>p.offsetParent).length')==3)
        await pg.click('#t2achbar button:has-text("Tous")');check('vrai clic : « Tous » remet tout',await ev('[...document.querySelectorAll("#achs>.panel.ach")].filter(p=>p.offsetParent).length')==n)
        check('succès en grille de 3 colonnes',await ev('getComputedStyle(document.getElementById("achs")).gridTemplateColumns.split(" ").length')==3)
        # missions
        await ev('go("missions")');await pg.wait_for_timeout(100)
        qd=await ev('(()=>{const s=[...document.querySelectorAll("#missions>.sectionhead")].find(x=>x.dataset.t2==="Quotidiennes");let n=0,p=s.nextElementSibling;while(p&&!p.classList.contains("sectionhead")){if(p.classList.contains("panel")&&p.offsetParent)n++;p=p.nextElementSibling}return n})()')
        await pg.click('#missions .sectionhead[data-t2="Quotidiennes"] .t2tog')
        qd2=await ev('(()=>{const s=[...document.querySelectorAll("#missions>.sectionhead")].find(x=>x.dataset.t2==="Quotidiennes");let n=0,p=s.nextElementSibling;while(p&&!p.classList.contains("sectionhead")){if(p.classList.contains("panel")&&p.offsetParent)n++;p=p.nextElementSibling}return n})()')
        check('vrai clic : la section Quotidiennes se replie',qd>=10 and qd2==0,(qd,qd2))
        await pg.click('#missions .sectionhead[data-t2="Quotidiennes"] .t2tog');check('et se déplie',(await ev('document.querySelector("#missions .sectionhead[data-t2=Quotidiennes] .t2tog").textContent')).startswith('Replier'))
        await ev('go("tower")');check('écrans en grille cachés quand on est ailleurs',await ev('getComputedStyle(document.getElementById("missions")).display')=='none' and await ev('getComputedStyle(document.getElementById("achs")).display')=='none')
        await ev('F2.newP=F2.goldP=F2.callP=0;fight=null;startBattle({mode:"story",n:3});go("battle")')
        check('combat : pas de ligne « où suis-je » au-dessus de la scène',await pg.locator('#t2where').count()==0)
        await ev('fight=null;go("tower")');check('elle revient hors combat',await pg.locator('#t2where').count()==1)
        check('aucune erreur JS',errs==[],errs)
        await b.close()
asyncio.run(main())
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
