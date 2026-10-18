/* Panneau d'administration local */
/* (0.14) l'ancien écran de connexion (comptes de démonstration) a été retiré : on efface ses restes */
try{localStorage.removeItem("arkPrimalAccounts");localStorage.removeItem("arkPrimalUserSaves")}catch(e){}
function openAdmin(){buildAdmin();document.getElementById("adminVeil").classList.remove("hide")}
function closeAdmin(){document.getElementById("adminVeil").classList.add("hide")}
const econLabels={trainCost:"Coût d'entraînement (pierres)",summonCost1:"Coût invocation x1 (tickets)",summonCost5:"Coût invocation x5 (tickets)",exploreStoneMin:"Pierres minimum en exploration",exploreStoneMax:"Pierres maximum en exploration",battleStone:"Pierres gagnées par victoire",battleEssence:"Essences gagnées par victoire",firstBattleTickets:"Tickets bonus au premier combat",chapterStone:"Pierres par chapitre",chapterTickets:"Tickets par chapitre",chapterXP:"XP joueur par chapitre",battleXP:"XP joueur par victoire"};


function resetAdmin(){if(!confirm("Réinitialiser les noms, images, statistiques, coûts, taux et récompenses ?"))return;SPEC=JSON.parse(JSON.stringify(SPEC_DEFAULT));CONFIG={...DEFAULT_CONFIG};localStorage.removeItem("arkPrimalConfig");buildAdmin();render()}
document.getElementById("rateCommon").addEventListener("input",updateRateTotal);
["rateRare","rateEpic","rateLegend"].forEach(id=>document.getElementById(id).addEventListener("input",updateRateTotal));
function updateRateTotal(){let n=["rateCommon","rateRare","rateEpic","rateLegend"].reduce((s,id)=>s+Number(document.getElementById(id).value||0),0);let el=document.getElementById("rateTotal");if(el)el.textContent="Total actuel : "+n+" %"+(n===100?" — valide":" — doit être égal à 100 %")}
