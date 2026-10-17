// 0.46 · Onglets plus clairs :
// - sous-onglets de l'Aventure et des Quêtes rangés par thème, avec une étiquette par groupe (les boutons restent les mêmes) ;
// - sous la barre, une ligne « où suis-je » : chemin (Aventure › Défis › Tour) + une phrase qui explique l'écran ;
// - Missions et Succès (des centaines de cadres empilés) affichés en grille, avec des filtres (Succès : à récupérer, en cours, obtenus ;
//   Missions : sections repliables ; les « Objectifs » de long terme sont repliés tant qu'aucun n'est à récupérer).
const T2_GRP={adv:[["Histoire",["world","story","regions","far"]],["Défis",["dungeon","tower","maze","trials","modes2"]],["Compétition",["arena","raid","events"]]],
 quest:[["Chaque jour",["missions","daily","dig"]],["Ma base",["camp","nest","exped"]],["Collection",["achs"]]]};
const T2_NAME={home:"Accueil",team:"Équipe",adv:"Aventure",summon:"Invocation",quest:"Quêtes"};
const T2_DESC={world:"La carte de l'île : chaque zone, ce qu'il reste à découvrir, le jour et la nuit.",story:"Les 100 niveaux de l'histoire, zone par zone, avec un gardien tous les 10 niveaux. Le mode Cauchemar s'ouvre chapitre par chapitre.",
 regions:"L'archipel et les régions secrètes (Badlands, grottes, îles célestes) : la suite de l'histoire après le niveau 100.",far:"Le Grand Nord : 40 niveaux de toundra et d'abysses, des gardiens qui rejoignent ta meute.",
 dungeon:"Des donjons de 5×5 cases à explorer : coffres, pièges, combats et un boss au bout.",tower:"Monte étage par étage : chaque étage est plus dur, les récompenses aussi.",
 maze:"Le Labyrinthe des reliques : une course en 3 actes, des reliques qui changent les règles, et on recommence à zéro.",trials:"Les épreuves de la meute : des combats à contraintes (sans super, une seule famille…), en bronze, argent et or.",
 modes2:"Les modes à part : Survie, Sprint, énigmes, Miroir, Sans orbes, Entraînement, Découverte.",arena:"Combats contre les équipes d'autres dresseurs (simulés) pour monter au classement.",
 raid:"Le boss de la semaine en 3 phases : inflige le plus de dégâts possible.",events:"L'événement de la semaine : épreuves, jetons, boutique et défi de l'île.",
 missions:"Missions du jour et de la semaine, défis et objectifs : tout récupérer en un clic.",daily:"Un combat par jour avec une règle spéciale, et une série à ne pas rompre.",dig:"Des fouilles du jour : creuse les cases pour trouver fossiles et trésors.",
 camp:"Ton camp : construis les bâtiments (bonus pour toute l'équipe) et parle aux habitants.",nest:"Le nid d'élevage : fais pondre deux dinos, l'œuf hérite de leurs gènes.",exped:"Envoie des dinos en expédition : ils reviennent avec des ressources.",
 achs:"Tous les succès, leurs points, tes titres et le journal de l'île.",
 "home:main":"Ton résumé : objectif du moment, choses à faire aujourd'hui et raccourcis.","home:profile":"Ton dresseur : pseudo, apparence, carte de profil.",
 "team:pack":"Ta collection de dinos : choisis l'équipe, le chef et les liens.","team:up":"Fais progresser tes dinos : forge, évolutions, éveil.","team:bag":"La sacoche de combat et l'équipement.","team:dex":"Le bestiaire : toutes les espèces et les créatures rencontrées.",
 "summon:ban":"Les bannières d'invocation : dépense tes tickets pour obtenir de nouveaux dinos.","summon:bonus":"La roue de la chance et les œufs.","summon:shop":"Échange tes fragments contre l'espèce de ton choix.","summon:market":"Le marché du jour : des offres qui changent chaque jour."};
function t2Where(){const g=typeof grpOf==="function"?grpOf(screen):"",G=GRP[g];if(!G||screen==="battle")return null;
 if(G.screens){const it=G.screens.find(x=>x[0]===screen);const gr=(T2_GRP[g]||[]).find(x=>x[1].includes(screen));return it&&{path:[T2_NAME[g]||g,gr&&gr[0]].filter(Boolean),name:it[2],ico:it[1],desc:T2_DESC[screen]||""}}
 const k=(typeof subOn!=="undefined"&&subOn[g])||(G.sub[0]||[])[0],it=G.sub.find(x=>x[0]===k);return it&&{path:[T2_NAME[g]||g],name:it[2],ico:it[1],desc:T2_DESC[g+":"+k]||""}}
function t2Nav(){const sn=$$("subnav");if(!sn||sn.classList.contains("hide"))return;const w=sn.querySelector(".snwrap");if(!w)return;const g=grpOf(screen),L=T2_GRP[g];
 if(L&&!w.querySelector(".sngrp")){const bt=[...w.querySelectorAll("button")],by=k=>bt.find(b=>b.getAttribute("onclick")===`go('${k}')`),used=new Set();
  L.forEach(([lab,ks])=>{const bs=ks.map(by).filter(Boolean);if(!bs.length)return;const gEl=document.createElement("div");gEl.className="snsec";gEl.innerHTML=`<span class="sngrp">${lab}</span>`;bs.forEach(b=>{gEl.appendChild(b);used.add(b)});w.appendChild(gEl)});
  const rest=bt.filter(b=>!used.has(b));if(rest.length){const gEl=document.createElement("div");gEl.className="snsec";gEl.innerHTML='<span class="sngrp">Autres</span>';rest.forEach(b=>gEl.appendChild(b));w.appendChild(gEl)}
  w.classList.add("t2grp")}
 const W=t2Where();let d=$$("t2where");if(!W){if(d)d.remove();return}
 if(!d){sn.insertAdjacentHTML("afterend",'<div id="t2where" class="t2where"></div>');d=$$("t2where")}
 d.innerHTML=`<span class="t2path">${W.path.map(esc).join(' <i>›</i> ')} <i>›</i> <b>${esc(W.name)}</b></span>${W.desc?`<span class="t2desc">${esc(W.desc)}</span>`:""}`}
const _nuT2=navUpdate;navUpdate=function(){_nuT2.apply(this,arguments);try{t2Nav()}catch(e){}};
// Succès : filtres (tous, à récupérer, en cours, obtenus) au-dessus de la grille
let T2_ACH="all";
function t2AchFilter(k){T2_ACH=k;t2Achs()}
function t2Achs(){const box=$$("achs");if(!box)return;const L=[...box.querySelectorAll(":scope>.panel.ach")];if(!L.length)return;
 const n={all:L.length,ready:L.filter(p=>p.classList.contains("ready")).length,done:L.filter(p=>p.classList.contains("done")).length};n.todo=n.all-n.ready-n.done;
 let bar=$$("t2achbar");if(!bar){L[0].insertAdjacentHTML("beforebegin",'<div id="t2achbar" class="t2filt"></div>');bar=$$("t2achbar")}
 bar.innerHTML=[["all","Tous"],["ready","🎁 À récupérer"],["todo","🔒 En cours"],["done","🏅 Obtenus"]].map(([k,l])=>`<button class="${T2_ACH===k?"on":""}" onclick="t2AchFilter('${k}')">${l} <i>${n[k]}</i></button>`).join("");
 L.forEach(p=>{const st=p.classList.contains("ready")?"ready":p.classList.contains("done")?"done":"todo";p.classList.toggle("t2off",T2_ACH!=="all"&&T2_ACH!==st)});box.classList.add("t2grid")}
// Missions : chaque section (« Quotidiennes », « Objectifs »…) se replie d'un clic ; « Objectifs » (70 cadres) est replié au départ s'il n'y a rien à y récupérer
const T2_FOLD={};
let T2_DEF={};
function t2Fold(k){T2_FOLD[k]=!t2Folded(k);t2Missions()}
function t2Folded(k){return k in T2_FOLD?T2_FOLD[k]:!!T2_DEF[k]}
function t2Missions(){const box=$$("missions");if(!box)return;box.classList.add("t2grid");let cur=null;
 [...box.children].forEach(el=>{if(el.classList.contains("sectionhead")){const h=el.querySelector("h2,h3,b");cur=(h?h.textContent:"").trim();el.classList.add("t2sh");el.dataset.t2=cur;
   if(!el.querySelector(".t2tog"))el.insertAdjacentHTML("beforeend",`<button class="t2tog secondary" onclick="t2Fold(this.parentElement.dataset.t2)"></button>`);
   const cnt=[];let s=el.nextElementSibling;while(s&&!s.classList.contains("sectionhead")){if(s.classList.contains("panel"))cnt.push(s);s=s.nextElementSibling}
   T2_DEF[cur]=/^Objectifs/.test(cur)&&!cnt.some(p=>[...p.querySelectorAll("button")].some(b=>!b.disabled));const f=t2Folded(cur);
   el.querySelector(".t2tog").textContent=(f?"Afficher":"Replier")+` (${cnt.length})`;return}
  if(cur&&el.classList.contains("panel"))el.classList.toggle("t2off",t2Folded(cur))})}
const _rT2=render;render=function(){_rT2.apply(this,arguments);try{if(screen==="achs")t2Achs();if(screen==="missions")t2Missions();t2Nav()}catch(e){}};
if(typeof GUIDE!=="undefined")GUIDE.push(["Onglets","Sous la barre des onglets, une ligne rappelle où tu es (Aventure › Défis › Tour) et à quoi sert l'écran. Les onglets de l'Aventure et des Quêtes sont rangés par thème. Les Succès ont des filtres (à récupérer, en cours, obtenus) et les sections des Missions se replient."]);
