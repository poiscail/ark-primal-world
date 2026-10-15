/* Panneau d'administration local */
/* (0.14) l'ancien écran de connexion (comptes de démonstration) a été retiré : on efface ses restes */
try{localStorage.removeItem("arkPrimalAccounts");localStorage.removeItem("arkPrimalUserSaves")}catch(e){}
function openAdmin(){buildAdmin();document.getElementById("adminVeil").classList.remove("hide")}
function closeAdmin(){document.getElementById("adminVeil").classList.add("hide")}
const econLabels={trainCost:"Coût d'entraînement (pierres)",summonCost1:"Coût invocation x1 (tickets)",summonCost5:"Coût invocation x5 (tickets)",exploreStoneMin:"Pierres minimum en exploration",exploreStoneMax:"Pierres maximum en exploration",battleStone:"Pierres gagnées par victoire",battleEssence:"Essences gagnées par victoire",firstBattleTickets:"Tickets bonus au premier combat",chapterStone:"Pierres par chapitre",chapterTickets:"Tickets par chapitre",chapterXP:"XP joueur par chapitre",battleXP:"XP joueur par victoire"};
function buildAdmin(){
 let eco=document.getElementById("economyFields");eco.innerHTML=Object.keys(econLabels).map(k=>`<div><label>${econLabels[k]}</label><input id="econ_${k}" type="number" min="0" value="${CONFIG[k]}"></div>`).join("");
 document.getElementById("rateCommon").value=CONFIG.commonRate;document.getElementById("rateRare").value=CONFIG.rareRate;document.getElementById("rateEpic").value=CONFIG.epicRate;document.getElementById("rateLegend").value=CONFIG.legendRate;
 document.getElementById("adminDinos").innerHTML=Object.keys(SPEC).map(k=>{let d=SPEC[k];return `<div class="adminitem" data-dino="${k}"><b>${k.toUpperCase()}</b><div class="grid2"><div><label>Nom affiché</label><input data-field="name" value="${esc(d.name)}"></div><div><label>Image (emoji ou URL)</label><input data-field="e" value="${esc(d.e)}"></div><div><label>Rareté</label><select data-field="r">${["Commun","Rare","Épique","Légendaire"].map(r=>`<option ${d.r===r?"selected":""}>${r}</option>`).join("")}</select></div><div><label>Type d'orbe</label><select data-field="element">${["redorb","blueorb","greenorb","purpleorb","goldorb"].map(r=>`<option ${d.element===r?"selected":""}>${r}</option>`).join("")}</select></div><div><label>PV de base</label><input type="number" min="1" data-field="hp" value="${d.hp}"></div><div><label>Attaque de base</label><input type="number" min="1" data-field="atk" value="${d.atk}"></div><div><label>Défense de base</label><input type="number" min="0" data-field="def" value="${d.def}"></div></div></div>`}).join("");
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function saveAdmin(){
 let rates=["rateCommon","rateRare","rateEpic","rateLegend"].map(id=>Number(document.getElementById(id).value));
 if(rates.some(n=>!Number.isFinite(n)||n<0)||Math.round(rates.reduce((a,b)=>a+b,0))!==100){alert("Les taux de rareté doivent totaliser exactement 100 %.");return}
 Object.keys(econLabels).forEach(k=>{let v=Number(document.getElementById("econ_"+k).value);if(!Number.isFinite(v)||v<0){alert("Les coûts et récompenses doivent être positifs ou nuls.");return}CONFIG[k]=v});
 CONFIG.commonRate=rates[0];CONFIG.rareRate=rates[1];CONFIG.epicRate=rates[2];CONFIG.legendRate=rates[3];
 document.querySelectorAll(".adminitem").forEach(el=>{let key=el.dataset.dino,d={...SPEC[key]};el.querySelectorAll("[data-field]").forEach(inp=>{let f=inp.dataset.field;d[f]=["hp","atk","def"].includes(f)?Number(inp.value):inp.value});if(!d.name.trim()||!d.e.trim()||d.hp<1||d.atk<1||d.def<0){alert("Vérifie les noms, images et statistiques des dinosaures.");return}SPEC[key]=d});
 localStorage.setItem("arkPrimalConfig",JSON.stringify({dinos:SPEC,economy:CONFIG}));save();render();buildAdmin();alert("Paramètres enregistrés sur cet appareil.");
}
function resetAdmin(){if(!confirm("Réinitialiser les noms, images, statistiques, coûts, taux et récompenses ?"))return;SPEC=JSON.parse(JSON.stringify(SPEC_DEFAULT));CONFIG={...DEFAULT_CONFIG};localStorage.removeItem("arkPrimalConfig");buildAdmin();render()}
document.getElementById("rateCommon").addEventListener("input",updateRateTotal);
["rateRare","rateEpic","rateLegend"].forEach(id=>document.getElementById(id).addEventListener("input",updateRateTotal));
function updateRateTotal(){let n=["rateCommon","rateRare","rateEpic","rateLegend"].reduce((s,id)=>s+Number(document.getElementById(id).value||0),0);let el=document.getElementById("rateTotal");if(el)el.textContent="Total actuel : "+n+" %"+(n===100?" — valide":" — doit être égal à 100 %")}
