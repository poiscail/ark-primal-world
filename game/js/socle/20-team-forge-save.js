/* Forge, tête d'équipe, export/import de sauvegarde */

function lead(id){const i=S.team.findIndex(d=>d.id===id);if(i>0){S.team.unshift(S.team.splice(i,1)[0]);log("Nouvelle tête d'équipe : "+sp(S.team[0]).name+".");save();render()}}
document.querySelector("#team .banner").insertAdjacentHTML("afterend",'<div class="panel" id="forgeBox"></div>');
function forge(){const c=5*(S.gear+1);if(S.essence<c){alert("Il faut "+c+" essences (gagnées en battant des boss).");return}S.essence-=c;S.gear++;log("Forge niveau "+S.gear+" : équipe renforcée.");save();render()}



