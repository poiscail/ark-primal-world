// 0.43 · Interface : pièces du Kenney UI Pack Sci-Fi (CC0) et icônes game-icons.net (CC BY 3.0).
// Les images sont dans css/97-hud-assets.css (généré par tools/hud_assets.py), le style dans css/97-hud.css.
// Trois réglages (Réglages > Affichage) : icônes dessinées ou émojis (PREFS.hudIco), curseur du jeu (PREFS.hudCur),
// cadres sci-fi : vis des panneaux, boutons en relief, barres brillantes, viseur sur les ennemis (PREFS.hudK).
const HUD_MET=["m_bone","m_hide","m_crystal","m_amber","powerM","m_shards","setFab"];
function hudOn(k){return PREFS[k]!==false}
function hudApply(){const h=document.documentElement;h.classList.toggle("hud-ico",hudOn("hudIco"));h.classList.toggle("hud-cur",hudOn("hudCur"));h.classList.toggle("hud-k",hudOn("hudK"))}
// Compteurs de l'en-tête : l'émoji reste dans le texte (caché quand les icônes sont dessinées), l'icône est ajoutée devant.
function hudMeters(){HUD_MET.forEach(id=>{const el=document.getElementById(id);if(!el)return;const m=id==="setFab"?el:el.closest(".meter");if(!m||m.querySelector(".hudico"))return;
 const tn=[...m.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(tn){const mt=tn.textContent.trim().match(/^(\S+)\s*(.*)$/),s=document.createElement("span");s.className="hudemo";s.textContent=mt[1];tn.textContent=" "+(mt[2]?mt[2]+" ":"");m.insertBefore(s,tn)}
 m.insertAdjacentHTML("afterbegin",`<i class="hudico" data-for="${id}" aria-hidden="true"></i>`)})}
// Viseur Kenney sur les ennemis (visible au survol : un clic ouvre la fiche de l'ennemi).
function hudCross(){document.querySelectorAll("#battleArea .sEnemy").forEach(e=>{if(!e.querySelector(".hudx"))e.insertAdjacentHTML("beforeend",'<i class="hudx" aria-hidden="true"></i>')})}
// Curseur « bouton » : seuls les éléments qui montrent déjà la main (cursor:pointer) prennent le curseur cyan du jeu.
document.addEventListener("mouseover",e=>{if(!document.documentElement.classList.contains("hud-cur"))return;let t=e.target;for(let i=0;t&&t.nodeType===1&&i<4;i++,t=t.parentElement){if(t.classList.contains("hudp"))return;if(getComputedStyle(t).cursor==="pointer"){t.classList.add("hudp");return}}},{passive:true});
function hudSet(k,v){setPref(k,v)}
const _apHud=applyPrefs;applyPrefs=function(){_apHud();try{hudApply()}catch(e){}};
const _rHud=render;render=function(){_rHud.apply(this,arguments);try{hudMeters()}catch(e){}};
const _rbHud=renderBattle;renderBattle=function(){_rbHud.apply(this,arguments);try{if(hudOn("hudK"))hudCross()}catch(e){}};
const _srHud=setRender;setRender=function(){_srHud();const box=$$("setBody");if(!box||box.querySelector("#hudOpts"))return;const af=[...box.querySelectorAll(".panel")].find(p=>(p.querySelector("b")||{}).textContent==="Affichage");if(!af)return;
 const row=(k,t,d,a,b)=>`<div class="row" style="padding:6px 0"><div class="grow"><b>${t}</b><div class="muted tiny">${d}</div></div><div class="eltabs"><button class="${hudOn(k)?"on":""}" onclick="hudSet('${k}',true)">${a}</button><button class="${hudOn(k)?"":"on"}" onclick="hudSet('${k}',false)">${b}</button></div></div>`;
 af.insertAdjacentHTML("beforeend",`<div id="hudOpts">${row("hudIco","Icônes","Icônes dessinées (game-icons.net) dans la navigation et les ressources, ou les émojis d'avant.","Dessinées","Émojis")}${row("hudCur","Curseur","Curseur de la souris aux couleurs du jeu (Kenney), ou celui de Windows.","Du jeu","Windows")}${row("hudK","Cadres","Vis des panneaux, boutons en relief, barres brillantes et viseur sur les ennemis.","Sci-fi","Simples")}</div>`)};
hudApply();hudMeters();
if(typeof GUIDE!=="undefined")GUIDE.push(["Interface","Les icônes de la navigation et des ressources sont dessinées (game-icons.net), le curseur et les cadres viennent du pack sci-fi de Kenney. Réglages > Affichage : Icônes (dessinées ou émojis), Curseur (du jeu ou Windows), Cadres (sci-fi ou simples)."]);
