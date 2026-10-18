/* Histoire : dialogues d'intro des niveaux clés + journal de l'île */
const LORE={
 1:["🧑‍🔬","Dr Elara","Tu es réveillé ! Ton bateau s'est brisé sur les récifs… Cette île n'est sur aucune carte. Prends cet éclat : il réagit aux créatures d'ici.","Les dinosaures ne sont pas hostiles par nature. Quelque chose les rend furieux. Allons voir."],
 5:["🦖","Raptor","*grogne doucement* Les orbes de couleur t'obéissent… elles ne le font que pour les élus de l'île.","Ta meute grandit. L'obélisque, au cœur de l'île, te sent venir."],
 10:["👹","Gardien de la Jungle","TU ES ENTRÉ SUR MES TERRES. Les anciens m'ont chargé de garder la première porte.","Montre-moi que tu es digne de la seconde."],
 15:["🧑‍🔬","Dr Elara","J'ai retrouvé des carnets : l'obélisque émet une énergie qui éveille les dinosaures… et qui les rend agressifs.","Chaque zone abrite un gardien. Les vaincre affaiblit l'obélisque."],
 20:["👹","Gardien des Ruines","Ces pierres ont vu naître ta civilisation avant la mienne. Pourtant tu oses fouler la poussière des rois.","Prouve ta valeur, petit mammifère."],
 25:["🗿","Voix de l'obélisque","…Survivant… Tu portes l'éclat de la Première Graine. Il y a longtemps, nous l'avons brisé pour sauver ce monde.","Rassemble les fragments. Ne laisse pas la fureur gagner."],
 30:["👹","Gardien du Volcan","Le feu purifie ! Seuls ceux qui supportent la braise méritent d'avancer.","Je ne retiendrai pas mes flammes !"],
 40:["🧑‍🔬","Dr Elara","Les fragments sont partout : dans les œufs, dans les dungeons… Les créatures légendaires en gardent la mémoire.","Continue d'invoquer. Chaque dino est un allié de plus."],
 50:["🗿","Voix de l'obélisque","Mi-chemin. Sens-tu la colère refluer ? Les dinosaures reprennent leurs esprits grâce à toi.","Mais un autre pouvoir s'éveille, plus profond… plus ancien."],
 60:["👹","Gardien de l'Obélisque","Je suis le premier-né, celui qui a vu la Graine se briser. Je ne te laisserai pas la réunir.","Tu ne comprends pas ce que tu risques de libérer."],
 70:["🧑‍🔬","Dr Elara","J'ai déchiffré la dernière tablette : la Graine ne donne pas la fureur, elle l'absorbe. L'obélisque la libère pour protéger l'île.","Si nous la réunissons, l'équilibre sera rétabli."],
 80:["🦖","Meute sauvage","*rugissements unis* Les dinosaures de l'île t'ont reconnu. Ils combattront à tes côtés jusqu'au bout.","Plus rien ne les retient : c'est ta meute."],
 90:["🗿","Voix de l'obélisque","Tu touches au but. La dernière épreuve n'est pas un combat de force, mais de lien.","Montre que ta meute et toi ne faites qu'un."],
 100:["🌟","La Première Graine","…Enfin. La Graine brisée s'unifie. La fureur se dissipe, l'île respire.","Merci, survivant. L'île est à nouveau en paix… et pour toujours ta demeure.","(Les Donjons, la Tour, l'Arène et les Expéditions t'attendent encore.)"]};
const _ens99s=ens;ens=function(){_ens99s();S.lore=S.lore||{}};
let loreTimer=null,loreCur=null;
function loreSkipAnim(){const t=document.getElementById("loreTxt");if(!t||!loreCur)return;clearInterval(loreTimer);t.textContent=loreCur.lines[loreCur.i]}
function loreNext(){if(!loreCur)return;const t=document.getElementById("loreTxt");if(loreTimer&&t&&t.textContent!==loreCur.lines[loreCur.i]){loreSkipAnim();return}
 loreCur.i++;if(loreCur.i>=loreCur.lines.length){const cb=loreCur.cb;loreClose();cb&&cb();return}loreType()}

function loreClose(){clearInterval(loreTimer);loreTimer=null;loreCur=null;const v=document.getElementById("loreVeil");if(v)v.classList.add("hide")}
function loreShow(n,cb){const L=LORE[n];if(!L){cb&&cb();return}if(!document.getElementById("loreVeil"))document.body.insertAdjacentHTML("beforeend",'<div id="loreVeil" class="authveil hide" onclick="loreNext()"><div class="authbox lorebox"><div class="loreface" id="loreFace"></div><div class="lorewho" id="loreWho"></div><p id="loreTxt"></p><button class="wide" id="loreBtn">SUIVANT ▶</button><div class="tiny muted" style="text-align:center;margin-top:6px">Touche pour continuer</div></div></div>');
 loreCur={i:0,lines:L.slice(2),cb};document.getElementById("loreFace").textContent=L[0];document.getElementById("loreWho").textContent=L[1];document.getElementById("loreVeil").classList.remove("hide");loreType()}
const _sb99=startBattle;startBattle=function(o){const tgt=o||lastB;const n=tgt&&tgt.mode==="story"?tgt.n:0;
 const auto=typeof navigator!=="undefined"&&navigator.webdriver&&!window.__forceLore;
 if(n&&LORE[n]&&PREFS.lore!==false&&!auto){ens();if(!S.lore[n]){S.lore[n]=1;save();return loreShow(n,()=>_sb99(o))}}
 return _sb99(o)};

const _ra99=renderAch;renderAch=function(){_ra99();const el=$$("achs");if(el)el.insertAdjacentHTML("beforeend",loreJournal())};
