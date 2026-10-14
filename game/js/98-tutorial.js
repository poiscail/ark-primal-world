/* Tutoriel contextuel (conseils affichés une seule fois, au bon moment) et guide du jeu */
const _ens98=ens;ens=function(){const fresh=!S.tut;_ens98();if(fresh){/* sauvegarde existante : pas de tutoriel */const old=(S.stage||0)>0||(S.cnt&&(S.cnt.battles||0)>0)||(S.team&&S.team.length>3);S.tut={off:!!old,seen:{}}}if(!S.tut.seen)S.tut.seen={}};
const ELN={redorb:"🔥 Feu",blueorb:"💧 Eau",greenorb:"🌿 Plante",purpleorb:"⚡ Foudre",goldorb:"☀️ Lumière"};
const TIPS={
 welcome:{t:"👋 Bienvenue dans ARK: Primal World !",d:"Monte les 100 niveaux de l'histoire, collectionne des dinosaures et renforce-les. Commence par ton premier combat.",btn:["PREMIER COMBAT","startBattle({mode:'story',n:1})"],on:()=>screen==="home"},
 orbs:{t:"🎯 Les orbes",d:"Tape une orbe pour attaquer. Si sa couleur est celle d'un de tes dinosaures, il frappe plus fort (x1,8). Le chiffre « ~ » sous l'orbe estime les dégâts. Taper plusieurs fois la même couleur crée un combo.",on:()=>screen==="battle"&&fight&&!fight.over&&fight.turn===0&&!fight.o.mode.startsWith("x")},
 elements:{t:"🔥 Les éléments",d:()=>"Avantages : "+Object.entries(BEAT).map(([a,b])=>ELN[a].split(" ")[0]+" bat "+ELN[b].split(" ")[0]).join(" · ")+". Un dinosaure dont l'élément bat celui de l'ennemi inflige +30 %. La lumière ☀️ est neutre mais donne un bonus fixe à tous.",on:()=>screen==="battle"&&fight&&!fight.over&&fight.turn>=1},
 skills:{t:"✨ Compétences et super attaque",d:"Le bouton à droite de chaque dinosaure lance sa compétence (temps de recharge en tours). Les compétences et la super attaque ne prennent PAS ton tour : seule une orbe fait attaquer l'ennemi. La jauge de super monte à chaque coup ; à 100 %, 💥 SUPER.",on:()=>screen==="battle"&&fight&&!fight.over&&fight.turn>=2},
 win:{t:"🏆 Victoire !",d:"Les récompenses et le suivi des missions sont plus bas. Ensuite : Équipe (entraîner, forge, éveil, équipement) et Invocation (nouveaux dinosaures) pour te renforcer.",on:()=>screen==="battle"&&fight&&fight.over==="win"},
 lose:{t:"💀 Défaite",d:"Pas de panique. Entraîne tes dinosaures dans l'onglet Équipe, utilise leurs compétences (elles sont gratuites), ou rejoue un niveau plus facile pour farmer des pierres.",on:()=>screen==="battle"&&fight&&fight.over==="lose"},
 team:{t:"🦖 Ton équipe",d:"Les 3 premiers dinosaures forment l'équipe de combat. Tu peux les entraîner, les éveiller (★), leur donner un équipement et enregistrer jusqu'à 5 équipes pour changer en un clic.",on:()=>screen==="team"},
 summon:{t:"🔮 Invocation",d:"Dépense des tickets (gagnés en combat) pour obtenir des dinosaures. Tirage gratuit chaque jour, bannière vedette, garantie légendaire. Les doublons se recyclent en fragments.",on:()=>screen==="summon"},
 missions:{t:"📋 Missions",d:"Les missions quotidiennes se renouvellent chaque jour, les permanentes restent. Pense à récupérer tes récompenses (pastille rouge).",on:()=>screen==="missions"},
 modes:{t:"🗺️ Modes de jeu",d:"Histoire et Donjons donnent matériaux et objets. La Tour monte sans fin, l'Arène classe ton équipe contre l'IA (5 combats/jour), les Événements changent chaque semaine.",on:()=>ADV.has(screen)&&screen!=="battle"&&screen!=="story"}};
let tipNow=null;
function tipActive(){ens();if(S.tut.off)return null;for(const id of Object.keys(TIPS)){if(S.tut.seen[id])continue;let ok=false;try{ok=TIPS[id].on()}catch(e){}if(ok)return id}return null}
function tipHTML(id){const T=TIPS[id],d=typeof T.d==="function"?T.d():T.d;return `<div class="tip" id="tipCard"><b>${T.t}</b><div class="tiny" style="margin:4px 0 8px">${d}</div><div class="btns">${T.btn?`<button onclick="tipDone('${id}');${T.btn[1]}">${T.btn[0]}</button>`:""}<button class="${T.btn?"secondary":""}" onclick="tipDone('${id}')">COMPRIS</button><button class="secondary" onclick="tipSkip()">PASSER LE TUTORIEL</button></div></div>`}
function tipDone(id){ens();S.tut.seen[id]=1;save();render()}
function tipSkip(){ens();S.tut.off=true;save();render()}
function tutReset(){ens();S.tut={off:false,seen:{}};save();render();toast("Tutoriel réactivé.")}
function tipShow(host){const old=$$("tipCard");if(old)old.remove();ens();const id=tipActive();if(id&&host)host.insertAdjacentHTML("afterbegin",tipHTML(id))}
const _r98=render;render=function(){_r98();if(screen!=="battle")tipShow($$(screen))};
const _rb98=renderBattle;renderBattle=function(){_rb98();if(screen==="battle")tipShow($$("battleArea"))};
/* guide du jeu */
const GUIDE=[["Combat","Tape une orbe : toute l'équipe attaque, puis l'ennemi riposte. La couleur d'orbe égale à l'élément d'un dinosaure lui donne x1,8 ; l'avantage d'élément ajoute +30 %. Les combos (même couleur d'affilée) augmentent les dégâts."],
 ["Compétences et super","Chaque espèce a une compétence active (gratuite, avec recharge en tours) et un attribut passif. La super attaque se charge en frappant et dépend de l'élément du premier dinosaure."],
 ["Progression","Entraîne (pierres), forge (essences, bonus pour toute l'équipe), éveille jusqu'à 5★ (matériaux, +10 % par étoile), fusionne les doublons (+1★)."],
 ["Équipement","Armes, armures et talismans trouvés sur les boss, donjons et modes. Améliore-les jusqu'à +10 ; un talisman donne un passif en plus. « Auto-équiper » choisit les meilleurs objets."],
 ["Invocation","Tickets, pierres ou cristaux. Bannières : standard, vedette (garantie à 60), élémentaire, variantes. Un tirage gratuit par jour, des œufs à faire éclore, des fragments pour acheter l'espèce voulue."],
 ["Modes","Histoire (100 niveaux), Donjons (matériaux), Tour infinie (paliers), Arène (classement et médailles), Événements (semaine en cours, jetons et boutique)."],
 ["Équipes","Enregistre jusqu'à 5 équipes (écran Équipe) et change-les en un clic depuis la barre au-dessus des modes."],
 ["Sauvegarde","Accueil > Sauvegarde : exporte un fichier ou un code pour passer du PC au téléphone. Le jeu garde aussi 5 copies automatiques (Réglages)."]];
document.body.insertAdjacentHTML("beforeend",'<div id="guideVeil" class="authveil hide"><div class="authbox" id="guideBody"></div></div>');
function openGuide(){$$("guideBody").innerHTML=`<div class="row"><div class="grow"><h2 style="margin:0">Guide du jeu</h2></div><button class="secondary" onclick="closeGuide()">FERMER</button></div>`+GUIDE.map(g=>`<div class="panel"><b>${g[0]}</b><div class="tiny" style="margin-top:4px">${g[1]}</div></div>`).join("")+`<button class="wide secondary" onclick="tutReset();closeGuide()">REVOIR LE TUTORIEL</button>`;$$("guideVeil").classList.remove("hide")}
function closeGuide(){$$("guideVeil").classList.add("hide")}
const _setR98=setRender;setRender=function(){_setR98();const box=$$("setBody");if(box)box.insertAdjacentHTML("afterbegin",'<button class="wide blue" style="margin:8px 0" onclick="closeSettings();openGuide()">📖 GUIDE DU JEU</button>')};
render();
