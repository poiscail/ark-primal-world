/* Forge, tête d'équipe, export/import de sauvegarde */
const _card=card;card=function(d,a=true){const h=_card(d,a);return a?h.replace(/<\/div>$/,`<button class="wide blue" onclick="lead(${d.id})">⭐ METTRE EN TÊTE D'ÉQUIPE</button></div>`):h};
function lead(id){const i=S.team.findIndex(d=>d.id===id);if(i>0){S.team.unshift(S.team.splice(i,1)[0]);log("Nouvelle tête d'équipe : "+sp(S.team[0]).name+".");save();render()}}
document.querySelector("#team .banner").insertAdjacentHTML("afterend",'<div class="panel" id="forgeBox"></div>');
function updForge(){const c=5*(S.gear+1),e=document.getElementById("forgeBox");if(e)e.innerHTML=`<div class="row"><div class="bigicon">⚒️</div><div class="grow"><b>Forge primordiale · Niv. ${S.gear}</b><div class="muted tiny">Chaque niveau : +8 PV, +2 ATQ, +1 DÉF pour toute l'équipe.</div></div></div><button class="wide purple" onclick="forge()">AMÉLIORER · ${c} 🔮</button>`}
function forge(){const c=5*(S.gear+1);if(S.essence<c){alert("Il faut "+c+" essences (gagnées en battant des boss).");return}S.essence-=c;S.gear++;log("Forge niveau "+S.gear+" : équipe renforcée.");save();render()}
const _r=render;render=function(){_r();updForge()};
const _h=hit;hit=function(d,m){if(fight)fight.pop=d;_h(d,m)};
const _rb=renderBattle;renderBattle=function(){_rb();if(fight&&fight.pop){const b=document.querySelector("#battleArea .bigicon");if(b){b.style.position="relative";b.insertAdjacentHTML("beforeend",`<span class="pop">-${fight.pop}</span>`)}fight.pop=0}};
render();
