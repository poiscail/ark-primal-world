/* Interface II (0.40) : raccourcis clavier partout, infobulles des chiffres, recherche dans la collection, équipe mémorisée
   par mode, « meilleure équipe » selon l'ennemi, aperçu des ennemis avant un niveau, XP de chaque dino en fin de combat,
   notifications regroupées et centre de notifications, raccourcis favoris sur l'accueil, molette sur la carte d'histoire,
   glisser-déposer dans la collection, confirmation « ne plus demander » et annulation pendant 10 s (recyclage), « où obtenir »
   pour chaque ressource, mode compact, taille du texte, menu pause, reprise du dernier mode, historique des combats, pastilles
   discrètes, tutoriels par mode, écran « Quoi de neuf ». État : S.ui2. Réglages : PREFS.fsz, PREFS.compact, PREFS.dots,
   PREFS.resume. */
if(!(PREFS.fsz>=80&&PREFS.fsz<=140))PREFS.fsz=100;
if(!["auto","on","off"].includes(PREFS.compact))PREFS.compact="auto";
if(!["on","calm","off"].includes(PREFS.dots))PREFS.dots="on";
if(typeof PREFS.resume!=="boolean")PREFS.resume=true;
const U2_WD=typeof navigator!=="undefined"&&!!navigator.webdriver;
const _ensU2=ens;ens=function(){_ensU2();let U=S.ui2;if(!U||typeof U!=="object")U=S.ui2={};for(const k of ["teamBy","noAsk"])if(!U[k]||typeof U[k]!=="object")U[k]={};
 for(const k of ["hist","fav"])if(!Array.isArray(U[k]))U[k]=k==="fav"?["story","summon","team","arena"]:[]};
/* ---- affichage : taille du texte, mode compact, pastilles ---- */
function u2Apply(){const H=document.documentElement;H.style.setProperty("--u2z",PREFS.fsz/100);H.classList.toggle("u2zoom",PREFS.fsz!==100);
 H.classList.toggle("u2compact",PREFS.compact==="on"||(PREFS.compact==="auto"&&innerHeight<=700));H.dataset.dots=PREFS.dots}
const _apU2=applyPrefs;applyPrefs=function(){_apU2();try{u2Apply()}catch(e){}};
let u2RsT=0;addEventListener("resize",()=>{clearTimeout(u2RsT);u2RsT=setTimeout(()=>{try{u2Apply();if(screen==="battle"&&fight)renderBattle()}catch(e){}},150)});
/* ---- notifications : regroupées, gardées dans un centre consultable ---- */
let u2Last={m:"",t:0,el:null,n:1};
/* les notifications vivent à part de la sauvegarde (localStorage « arkPrimalNotes ») : un toast ne doit jamais modifier la partie */
const U2N=(()=>{try{const o=JSON.parse(localStorage.getItem("arkPrimalNotes")||"{}");return{notes:Array.isArray(o.notes)?o.notes:[],unread:+o.unread||0}}catch(e){return{notes:[],unread:0}}})();
function u2NSave(){try{localStorage.setItem("arkPrimalNotes",JSON.stringify(U2N))}catch(e){}}
const _toU2=toast;toast=function(m,ms){try{const now=Date.now(),s=String(m);U2N.notes.unshift({m:s.replace(/<[^>]*>/g,""),t:now});if(U2N.notes.length>60)U2N.notes.length=60;U2N.unread++;u2NSave();u2Bell();
  if(s===u2Last.m&&now-u2Last.t<4000&&u2Last.el&&u2Last.el.isConnected){u2Last.n++;u2Last.t=now;let b=u2Last.el.querySelector(".u2x");if(!b){b=document.createElement("b");b.className="u2x";u2Last.el.appendChild(b)}b.textContent=" ×"+u2Last.n;return}
  const r=_toU2(m,ms);const box=$$("toasts");u2Last={m:s,t:now,el:box&&box.lastElementChild,n:1};return r}catch(e){return _toU2(m,ms)}};
function u2Bell(){const b=$$("u2bell");if(!b)return;const n=U2N.unread;b.querySelector("i").textContent=n?Math.min(99,n):"";b.classList.toggle("on",n>0)}
function u2Notes(){U2N.unread=0;u2NSave();u2Bell();const L=U2N.notes,t=x=>new Date(x).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
 openModal(`<h3 style="margin:0 0 6px">🔔 Notifications</h3><div class="u2notes">${L.length?L.map(n=>`<div class="u2note"><small>${t(n.t)}</small> ${esc(n.m)}</div>`).join(""):'<div class="tiny muted">Aucune notification.</div>'}</div><div class="btns"><button class="secondary" onclick="u2Hist()">📜 COMBATS RÉCENTS</button><button class="secondary" onclick="U2N.notes=[];u2NSave();u2Notes()">EFFACER</button><button onclick="closeModal()">OK</button></div>`)}
(function(){const top=document.querySelector("header .meters");if(top&&!$$("u2bell"))top.insertAdjacentHTML("beforebegin",'<button id="u2bell" class="u2bell" title="Notifications (N)" onclick="u2Notes()">🔔<i></i></button>')})();
/* ---- barre de ressources cliquable : où obtenir ---- */
const U2_WHERE={stone:["🪨 Pierres",[["Combats (toutes les victoires)","story"],["Expéditions","exped"],["Fouilles","dig"],["Recyclage de dinos","team"]]],
 essence:["🔮 Essence",[["Victoires et boss","story"],["Défi du jour","daily"],["Combats de nuit (+3)","story"],["Événements","events"]]],
 tickets:["🎟️ Tickets",[["Quêtes et succès","missions"],["Connexion quotidienne","home"],["Événements et jetons de fête","events"],["Paliers d'étoiles de l'histoire","story"]]],
 level:["⭐ Rang du survivant",[["Chaque victoire donne de l'XP de rang","story"],["Récompenses tous les 5 rangs","home"]]],
 bone:["🦴 Os",[["Combats d'histoire","story"],["Donjons","dungeon"],["Recyclage","team"]]],hide:["🧶 Cuir",[["Donjons","dungeon"],["Expéditions","exped"],["Recyclage","team"]]],
 crystal:["💎 Cristaux",[["Tour","tower"],["Expéditions vers le Grand Nord","exped"],["Atelier (conversion)","team"]]],amber:["🟠 Ambre",[["Fouilles","dig"],["Grand Nord","far"],["Boss de zone","story"]]],
 shards:["🧩 Fragments",[["Doublons d'invocation","summon"],["Marché du jour","home"],["Événements","events"]]]};
function u2Where(k){const W=U2_WHERE[k];if(!W)return;openModal(`<h3 style="margin:0 0 6px">Où obtenir : ${W[0]} ?</h3><div class="u2where">${W[1].map(([t,s])=>`<button class="secondary wide" onclick="closeModal();go('${s}')">${esc(t)} ➜</button>`).join("")}</div>
 <div class="btns"><button class="secondary" onclick="u2Mats()">📦 TOUS LES MATÉRIAUX</button><button onclick="closeModal()">OK</button></div>`)}
function u2Mats(){openModal(`<h3 style="margin:0 0 6px">📦 Où obtenir chaque matériau</h3><div class="u2mats">${Object.entries(U2_WHERE).map(([k,[n,L]])=>`<div class="u2mat"><b>${n}</b> <span class="tiny muted">${(MATS&&MATS[k]?"("+(S.mat[k]||0)+") ":"")}${L.map(x=>esc(x[0])).join(" · ")}</span></div>`).join("")}</div><div class="btns"><button onclick="closeModal()">OK</button></div>`)}
function u2Meters(){document.querySelectorAll("header .meters .meter").forEach(m=>{const b=m.querySelector("b[id]");if(!b||!U2_WHERE[b.id]||m.dataset.u2)return;m.dataset.u2=1;m.classList.add("u2click");m.title=U2_WHERE[b.id][0]+" — clic : où en obtenir ?";m.addEventListener("click",()=>u2Where(b.id))})}
u2Meters();
/* ---- infobulles sur les chiffres ---- */
function u2Tips(root){(root||document).querySelectorAll(".sHud .grow>div.muted.tiny:not([title]),#battleArea .row .tiny:not([title])").forEach(el=>{const t=el.textContent;
 if(/PV/.test(t)&&/ATQ/.test(t))el.title="PV : points de vie actuels / maximum · ATQ : attaque (dégâts de base d'une orbe de sa couleur)";else if(/PV/.test(t))el.title="Points de vie de l'ennemi : actuels / maximum"})}
/* ---- collection : recherche par nom, glisser-déposer ---- */
let u2Q="";
function u2Filter(){const box=$$("collection");if(!box)return;const q=u2Q.trim().toLowerCase();let n=0;box.querySelectorAll(":scope > .cocard").forEach(c=>{const d=S.team.find(x=>x.id===+c.dataset.id);const nm=d?(sp(d).name+" "+(d.nick||"")).toLowerCase():"";const ok=!q||nm.includes(q);c.classList.toggle("u2hide",!ok);if(ok)n++});const c=$$("u2qn");if(c)c.textContent=q?n+" trouvé(s)":""}
function u2Drag(box){box.querySelectorAll(":scope > .cocard").forEach(c=>{if(c.dataset.u2d)return;c.dataset.u2d=1;c.draggable=true;
 c.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",c.dataset.id);c.classList.add("u2drag")});c.addEventListener("dragend",()=>c.classList.remove("u2drag"));
 c.addEventListener("dragover",e=>{e.preventDefault();c.classList.add("u2over")});c.addEventListener("dragleave",()=>c.classList.remove("u2over"));
 c.addEventListener("drop",e=>{e.preventDefault();c.classList.remove("u2over");u2Swap(+e.dataTransfer.getData("text/plain"),+c.dataset.id)})})}
function u2Swap(a,b){const i=S.team.findIndex(x=>x.id===a),j=S.team.findIndex(x=>x.id===b);if(i<0||j<0||i===j)return false;[S.team[i],S.team[j]]=[S.team[j],S.team[i]];save();render();toast("↔️ "+sp(S.team[j]).name+" et "+sp(S.team[i]).name+" échangés"+(i<3||j<3?" (équipe modifiée)":"")+".",1800);return true}
const _rcU2=renderCollection;renderCollection=function(){_rcU2();try{const box=$$("collection"),tools=$$("colTools");if(!box)return;
 if(tools&&!$$("u2q")){tools.insertAdjacentHTML("afterbegin",`<div class="u2search"><input id="u2q" type="search" placeholder="🔎 Chercher un dino par nom…" autocomplete="off"><small id="u2qn"></small></div>`);const i=$$("u2q");i.value=u2Q;i.addEventListener("input",()=>{u2Q=i.value;u2Filter()})}
 u2Filter();u2Drag(box)}catch(e){}};
/* ---- équipe mémorisée par mode, meilleure équipe selon l'ennemi ---- */
const U2_MODES={arena:"🏟️ Arène",tower:"🗼 Tour",far:"❄️ Grand Nord",maze:"🌀 Labyrinthe",nightmare:"🌑 Cauchemar",region:"🧭 Régions",dungeon:"🏰 Donjons",story:"📖 Histoire"};
const _sbU2=startBattle;startBattle=function(o){try{ens();const m=o&&o.mode;if(m&&U2_MODES[m])S.ui2.teamBy[m]=S.team.slice(0,3).map(d=>d.id)}catch(e){}return _sbU2(o)};
function u2TeamLoad(m){ens();const ids=S.ui2.teamBy[m];if(!ids)return false;const D=ids.map(id=>S.team.find(d=>d.id===id)).filter(Boolean);if(!D.length)return false;S.team=D.concat(S.team.filter(d=>!D.includes(d)));save();render();toast("👥 Équipe "+U2_MODES[m]+" reprise.",1800);return true}
const U2_BEAT={redorb:"greenorb",greenorb:"blueorb",blueorb:"redorb"};
function u2Score(d,el){const v=stats(d),e=sp(d).element;return v.atk*(U2_BEAT[e]===el?1.5:U2_BEAT[el]===e?.7:1)+v.hp*.12}
function u2Best(el){ens();const L=S.team.slice().sort((a,b)=>u2Score(b,el)-u2Score(a,el)).slice(0,3);S.team=L.concat(S.team.filter(d=>!L.includes(d)));save();render();toast("⚡ Meilleure équipe contre "+(ICO[el]||"")+" : "+L.map(d=>sp(d).name).join(", "),2600);return L.map(d=>d.id)}
/* ---- aperçu des ennemis d'un niveau d'histoire ---- */
function u2Foes(n){const z=zoneOf(n),boss=n%10===0;return[0,1,2].map(i=>({e:i===2?(boss?"👹":"🦖"):z[1][i],el:i===1?"?":z[2],hp:Math.round(H(n)*[1,1.25,boss?2.4:1.5][i]),atk:Math.round(A(n)*[1,1.1,boss?1.5:1.2][i]),boss:i===2&&boss}))}
function u2Preview(n){n=n||Math.min(100,(S.stage||0)+1);const z=zoneOf(n),F=u2Foes(n);
 openModal(`<h3 style="margin:0 0 6px">👁️ Aperçu : niveau ${n} · ${esc(z[0])}</h3><div class="u2foes">${F.map((f,i)=>`<div class="u2foe ${f.boss?"boss":""}"><span>${f.e}</span><b>${i===2?(f.boss?"Gardien":"Élite"):"Vague "+(i+1)}</b><small>${f.el==="?"?"élément au hasard":ICO[f.el]||""} · ≈${f.hp.toLocaleString("fr-FR")} PV · ≈${f.atk} ATQ</small></div>`).join("")}</div>
 <div class="tiny muted">Valeurs de base (traits, météo et terrain s'ajoutent en combat). Élément dominant : ${ICO[z[2]]||""} — prends des dinos ${ICO[Object.keys(U2_BEAT).find(k=>U2_BEAT[k]===z[2])]||""}.</div>
 <div class="btns"><button class="secondary" onclick="u2Best('${z[2]}');u2Preview(${n})">⚡ MEILLEURE ÉQUIPE</button><button class="red" onclick="closeModal();fight=null;startBattle({mode:'story',n:${n}})">▶ LANCER</button><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
const _rsU2=renderStory;renderStory=function(){_rsU2();try{const ch=$$("chapters");if(!ch||(typeof nmView!=="undefined"&&nmView))return;
 const n=Math.min(100,(S.stage||0)+1),old=$$("u2prev");if(old)old.remove();ch.insertAdjacentHTML("beforebegin",`<div class="panel u2prev" id="u2prev"><div class="grow"><b>👁️ Prochain niveau : ${n}</b> <span class="tiny muted">${esc(zoneOf(n)[0])} · ${u2Foes(n).map(f=>f.e).join(" ")}</span></div><button class="secondary" onclick="u2Preview(${n})">APERÇU</button></div>`);
 const map=ch.querySelector(".smap");if(map&&!map.dataset.u2w){map.dataset.u2w=1;let last=0;map.addEventListener("wheel",e=>{const r=map.getBoundingClientRect(),full=r.top>=-2&&r.bottom<=innerHeight+2,dl=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
  if(!(full||e.shiftKey)||Math.abs(dl)<8)return;e.preventDefault();const now=Date.now();if(now-last<350)return;last=now;if(typeof mapSet==="function"&&typeof mapCh!=="undefined")mapSet(mapCh+(dl>0?1:-1))},{passive:false})}
 ch.querySelectorAll(".smap .mnode").forEach(b=>{if(b.dataset.u2c)return;b.dataset.u2c=1;b.addEventListener("contextmenu",e=>{const m=/n:(\d+)/.exec(b.getAttribute("onclick")||"");if(m){e.preventDefault();u2Preview(+m[1])}})})}catch(e){}};
/* ---- fin de combat : XP de chaque dino ; historique des combats ---- */
const _winU2=win;win=function(){const f=fight;let snap=null;try{if(f&&!f.over)snap=S.team.slice(0,3).map(d=>({id:d.id,l:d.level,x:d.xp}))}catch(e){}const r=_winU2.apply(this,arguments);
 try{if(snap&&f.over==="win"){f.u2xp=snap.map(s=>{const d=S.team.find(x=>x.id===s.id);if(!d)return null;let g=0;if(d.level===s.l)g=d.xp-s.x;else{g=need(s.l)-s.x;for(let l=s.l+1;l<d.level;l++)g+=need(l);g+=d.xp}return{n:sp(d).name,e:sp(d).e,g:Math.max(0,Math.round(g)),l:d.level,up:d.level-s.l}}).filter(Boolean);u2Log(f,"win")}}catch(e){}return r};
const _slU2=settleLose;settleLose=function(){const f=fight;const r=_slU2.apply(this,arguments);try{if(f&&!f.u2Logged)u2Log(f,"lose")}catch(e){}return r};
const _rbU2=renderBattle;renderBattle=function(){_rbU2();try{const f=fight;if(f&&f.over==="lose"&&!f.u2Logged)u2Log(f,"lose");if(!f||!f.u2xp||f.over!=="win")return;const R=[...document.querySelectorAll("#battleArea .result")].pop();if(!R||R.querySelector(".u2xp"))return;
  const ref=R.querySelector(".rarity");R.insertAdjacentHTML("beforeend",`<div class="u2xp" style="order:${ref?getComputedStyle(ref).order:0}">${f.u2xp.map(x=>`<div class="u2xr"><span>${art(x.e)}</span><b>${esc(x.n)}</b><small>+${x.g} XP · niv. ${x.l}${x.up?` <em>▲ +${x.up}</em>`:""}</small></div>`).join("")}</div>`)}catch(e){}u2Tips(document.getElementById("battleArea"))};
function u2Log(f,res){if(f.u2Logged)return;f.u2Logged=1;ens();S.ui2.hist.unshift({t:Date.now(),m:(f.o&&f.o.mode)||"story",z:String(f.zone||"").slice(0,60),r:res,turns:f.turn||0});if(S.ui2.hist.length>25)S.ui2.hist.length=25;save()}
function u2Hist(){ens();const L=S.ui2.hist,d=x=>new Date(x).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
 openModal(`<h3 style="margin:0 0 6px">📜 Combats récents</h3><div class="u2hist">${L.length?L.map(h=>`<div class="u2h ${h.r}"><b>${h.r==="win"?"✅":"❌"}</b><span>${esc(h.z||h.m)}</span><small>${d(h.t)}</small></div>`).join(""):'<div class="tiny muted">Aucun combat enregistré.</div>'}</div><div class="btns"><button onclick="closeModal()">OK</button></div>`)}
/* ---- recyclage : confirmation avec « ne plus demander », annulation pendant 10 s ---- */
const U2_UNDO_K=["team","items","mat","stone","essence","tickets","shards"];let U2_UNDO=null;
function u2Snap(){const o={};U2_UNDO_K.forEach(k=>{if(S[k]!==undefined)o[k]=JSON.parse(JSON.stringify(S[k]))});if(S.pg2&&S.pg2.souls)o._souls=JSON.parse(JSON.stringify(S.pg2.souls));return o}
function u2Undo(){if(!U2_UNDO||Date.now()>U2_UNDO.until){toast("Trop tard pour annuler.");return false}const o=U2_UNDO.s;U2_UNDO_K.forEach(k=>{if(o[k]!==undefined)S[k]=o[k]});if(o._souls&&S.pg2)S.pg2.souls=o._souls;U2_UNDO=null;save();render();const b=$$("u2undo");if(b)b.remove();toast("↩️ Action annulée.",1800);return true}
function u2Offer(txt){const old=$$("u2undo");if(old)old.remove();document.body.insertAdjacentHTML("beforeend",`<div id="u2undo" class="u2undo"><span>${esc(txt)}</span><button onclick="u2Undo()">↩️ ANNULER</button><i></i></div>`);const el=$$("u2undo");setTimeout(()=>{if(el.isConnected)el.remove()},10000)}
function u2Guard(name,label){const fn=window[name];if(typeof fn!=="function")return;window[name]=function(){const args=arguments,s=u2Snap(),n0=S.team.length,i0=(S.items||[]).length;
  const run=()=>{const c0=window.confirm;if(S.ui2.noAsk[name]||!U2_WD||window.__u2Ask)window.confirm=()=>true;let r;try{r=fn.apply(this,args)}finally{window.confirm=c0}
   if(S.team.length!==n0||(S.items||[]).length!==i0){U2_UNDO={s,until:Date.now()+10000};u2Offer(label+" effectué(e).")}return r};
  ens();if(S.ui2.noAsk[name]||(U2_WD&&!window.__u2Ask))return run();
  const d=name==="recycle"?S.team.find(x=>x.id===args[0]):null;if(name==="recycle"&&(!d||S.team.indexOf(d)<3||d.lock||d.fav))return run();
  const what=d?sp(d).name+" contre "+fmt(recycleValue(d)):label;window.__u2Run=run;
  openModal(`<h3 style="margin:0 0 6px">♻️ ${esc(label)}</h3><div>${esc(what)} ?</div><label class="u2ask"><input type="checkbox" id="u2no"> Ne plus demander</label><div class="tiny muted">Tu pourras annuler pendant 10 secondes.</div>
   <div class="btns"><button class="red" onclick="if($$('u2no').checked){S.ui2.noAsk['${name}']=1;save()}closeModal();window.__u2Run()">CONFIRMER</button><button class="secondary" onclick="closeModal()">ANNULER</button></div>`)}}
u2Guard("recycle","Recyclage");if(typeof recycleCommons==="function")u2Guard("recycleCommons","Recyclage des communs");if(typeof salvageCommons==="function")u2Guard("salvageCommons","Recyclage des objets communs");
/* ---- menu pause ---- */
function u2Pause(){if(screen!=="battle"||!fight||fight.over||$$("u2pause"))return;document.body.insertAdjacentHTML("beforeend",`<div id="u2pause" class="authveil u2pause"><div class="panel"><h2>⏸ Pause</h2><div class="tiny muted">${esc(fight.zone||"")}</div>
 <button class="wide" onclick="u2Resume()">▶ REPRENDRE</button><button class="wide secondary" onclick="u2Resume();openSettings()">⚙️ RÉGLAGES</button><button class="wide secondary" onclick="u2Resume();toggleHelp&&toggleHelp()">ℹ️ AIDE</button><button class="wide secondary" onclick="u2Keys()">⌨️ RACCOURCIS</button><button class="wide red" onclick="u2Resume();escapeFight()">🏳️ ABANDONNER</button></div></div>`)}
function u2Resume(){const p=$$("u2pause");if(p)p.remove();try{if(typeof autoKick==="function")autoKick(300)}catch(e){}}
const _toPU2=tapOrb;tapOrb=function(i){if($$("u2pause"))return;return _toPU2(i)};
/* ---- raccourcis clavier ---- */
const U2_NAV={h:"home",c:"team",i:"summon",v:"story",q:"missions",n:"__notes"};
function u2Keys(){openModal(`<h3 style="margin:0 0 6px">⌨️ Raccourcis clavier</h3><div class="u2keys">
 <div><b>Partout</b></div><div><kbd>Échap</kbd> fermer la fenêtre / revenir à l'accueil · en combat : pause</div><div><kbd>H</kbd> accueil · <kbd>C</kbd> collection · <kbd>I</kbd> invocation · <kbd>V</kbd> aventure · <kbd>Q</kbd> quêtes · <kbd>N</kbd> notifications · <kbd>F1</kbd> cette aide</div>
 <div><b>En combat</b></div><div><kbd>1</kbd>…<kbd>9</kbd> orbes · <kbd>A</kbd> <kbd>Z</kbd> <kbd>E</kbd> compétences · <kbd>Q</kbd> <kbd>S</kbd> <kbd>D</kbd> 2es compétences · <kbd>Espace</kbd> super · <kbd>G</kbd> garde · <kbd>R</kbd> auto · <kbd>T</kbd> vitesse · <kbd>P</kbd> pause</div>
 <div class="tiny muted">A, Z et E sont déjà les compétences : la super reste sur Espace et l'auto sur R.</div></div><div class="btns"><button onclick="closeModal()">OK</button></div>`)}
document.addEventListener("keydown",e=>{if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||""))return;const k=e.key;
 if(k==="F1"){e.preventDefault();u2Keys();return}
 const modal=!$$("modalVeil").classList.contains("hide"),sett=!$$("setVeil").classList.contains("hide");
 if(k==="Escape"){if($$("u2pause")){u2Resume();return}if(modal){closeModal();return}if(sett){closeSettings();return}if(screen==="battle"&&fight&&!fight.over){u2Pause();return}if(screen!=="home"&&screen!=="battle")go("home");return}
 if(screen==="battle"){if((k==="p"||k==="P")&&fight&&!fight.over){u2Pause()}return}
 if(modal||sett)return;const t=U2_NAV[k.toLowerCase()];if(!t)return;if(t==="__notes")u2Notes();else go(t)});
/* ---- accueil : raccourcis favoris ---- */
const U2_SCR=[["story","📖 Histoire"],["summon","🔮 Invocation"],["team","🦖 Équipe"],["missions","🎯 Quêtes"],["arena","🏟️ Arène"],["tower","🗼 Tour"],["dungeon","🏰 Donjons"],["events","🎪 Événements"],["daily","📅 Défi du jour"],["raid","🐉 Raid"],["maze","🌀 Labyrinthe"],["trials","⚔️ Épreuves"],["far","❄️ Grand Nord"],["nest","🥚 Nid"],["camp","🏕️ Camp"],["world","🗺️ Monde"],["regions","🧭 Régions"],["exped","🧭 Expéditions"],["dig","⛏️ Fouilles"],["modes2","🎯 Modes"]];
function u2FavEdit(){ens();const F=S.ui2.fav;openModal(`<h3 style="margin:0 0 6px">⭐ Raccourcis de l'accueil (6 au plus)</h3><div class="u2favs">${U2_SCR.filter(([s])=>$$(s)).map(([s,n])=>`<button class="${F.includes(s)?"":"secondary"}" onclick="u2FavTog('${s}')">${n}</button>`).join("")}</div><div class="btns"><button onclick="closeModal();render()">OK</button></div>`)}
function u2FavTog(s){ens();const F=S.ui2.fav,i=F.indexOf(s);if(i>=0)F.splice(i,1);else{if(F.length>=6){toast("6 raccourcis au plus.");return}F.push(s)}save();u2FavEdit()}
/* ---- tutoriels courts par mode (relisibles) ---- */
const U2_TUTO={story:["Avance de niveau en niveau ; un boss tous les 10.","Les étoiles (★ à ★★★) dépendent des PV restants : elles débloquent des coffres.","Clic droit sur un niveau de la carte : aperçu de ses ennemis."],
 arena:["Affronte les équipes d'autres dresseurs (simulés).","Chaque victoire fait monter ton classement de la saison.","L'adversaire a aussi son chef et ses liens."],tower:["Monte les étages, de plus en plus durs.","Les gardiens ont des compétences.","Ton équipe de la Tour est mémorisée."],
 dungeon:["5 donjons, 5 difficultés chacun.","Ils donnent surtout des matériaux d'éveil et de forge."],events:["Un événement par semaine, avec sa boutique de jetons.","Des événements datés reviennent chaque mois (calendrier)."],
 maze:["Rogue-lite en 3 actes : choisis ta route.","Les reliques s'additionnent ; les PV restent d'un combat à l'autre.","Plus la profondeur est haute, plus les marques 🌀 sont nombreuses."],trials:["Des défis à contraintes (familles, éléments, sans super…).","« Former l'équipe » prend automatiquement des dinos éligibles."],
 far:["Le Grand Nord s'ouvre au niveau 50 de l'histoire.","Les gardiens vaincus rejoignent la meute.","Le blizzard voile des orbes un tour sur deux."],nest:["Deux dinos de la même famille pondent un œuf.","Gènes, mutations et générations s'héritent.","Soigne l'œuf pour une meilleure empreinte."],
 camp:["Construis et améliore les bâtiments : bonus permanents.","Récolte la production régulièrement."],world:["La carte de toutes les régions découvertes.","Jour, nuit et saisons suivent l'heure réelle."],regions:["Nouvelles terres après l'histoire.","Chaque région a une mécanique (sable, obscurité, vent)."],
 summon:["Invoque avec des tickets ou des cristaux.","Légendaire garanti au bout de 40 invocations.","Liste de souhaits : 3 espèces plus probables."],team:["Les 3 premiers dinos forment l'équipe.","Glisse une carte sur une autre pour les échanger.","Cherche un dino par son nom en haut de la collection."]};
function u2Tuto(s){const T=U2_TUTO[s];if(!T)return;openModal(`<h3 style="margin:0 0 6px">❓ Comment ça marche</h3><ol class="u2tuto">${T.map(x=>`<li>${esc(x)}</li>`).join("")}</ol><div class="btns"><button onclick="closeModal()">COMPRIS</button></div>`)}
/* ---- rendu : accueil (favoris), boutons de tutoriel, équipe du mode, infobulles ---- */
const U2_TEAMSCR={arena:"arena",tower:"tower",far:"far",maze:"maze",regions:"region",dungeon:"dungeon"};
const _rU2=render;render=function(){_rU2();try{ens();u2Bell();u2Meters();const sc=document.getElementById(screen);if(!sc)return;
 if(screen==="home"){const old=$$("u2fav");if(old)old.remove();const ref=sc.querySelector(".banner");const F=S.ui2.fav.filter(s=>$$(s));
  if(ref)ref.insertAdjacentHTML("afterend",`<div class="panel u2fav" id="u2fav"><b>⭐ Raccourcis</b><div class="u2favrow">${F.map(s=>`<button class="secondary" onclick="go('${s}')">${(U2_SCR.find(x=>x[0]===s)||[,s])[1]}</button>`).join("")}<button class="secondary u2edit" title="Modifier les raccourcis" onclick="u2FavEdit()">✏️</button></div></div>`)}
 const b=sc.querySelector(".banner");if(b&&U2_TUTO[screen]&&!b.querySelector(".u2tbtn"))b.insertAdjacentHTML("beforeend",`<button class="secondary u2tbtn" title="Comment ça marche ?" onclick="event.stopPropagation();u2Tuto('${screen}')">❓</button>`);
 const m=U2_TEAMSCR[screen],old2=sc.querySelector(".u2team");if(old2)old2.remove();if(m&&S.ui2.teamBy[m]){const ids=S.ui2.teamBy[m],same=ids.join()===S.team.slice(0,3).map(d=>d.id).join();
  if(!same&&b)b.insertAdjacentHTML("afterend",`<div class="panel u2team"><div class="grow"><b>👥 Ton équipe ${esc(U2_MODES[m])}</b> <span class="tiny muted">${ids.map(id=>{const d=S.team.find(x=>x.id===id);return d?esc(sp(d).name):""}).filter(Boolean).join(", ")}</span></div><button class="secondary" onclick="u2TeamLoad('${m}')">REPRENDRE</button></div>`)}
 if(!["home","battle"].includes(screen)){ens();S.ui2.last=screen}}catch(e){}};
/* ---- réglages ---- */
const _srU2=setRender;setRender=function(){_srU2();const box=$$("setBody");if(!box||box.querySelector("#u2Opts"))return;const af=[...box.querySelectorAll(".panel")].find(p=>(p.querySelector("b")||{}).textContent==="Affichage");if(!af)return;
 const tabs=(k,L)=>`<div class="eltabs u2${k}">${L.map(([v,n])=>`<button class="${PREFS[k]===v?"on":""}" onclick="setPref('${k}',${typeof v==="number"?v:`'${v}'`})">${n}</button>`).join("")}</div>`;
 af.insertAdjacentHTML("beforeend",`<div id="u2Opts"><div class="row" style="padding:6px 0"><div class="grow"><b>Taille du texte</b></div>${tabs("fsz",[[90,"90 %"],[100,"100 %"],[115,"115 %"],[130,"130 %"]])}</div>
 <div class="row" style="padding:6px 0"><div class="grow"><b>Mode compact</b><div class="muted tiny">Marges réduites ; « Auto » pour les fenêtres de 700 px de haut ou moins</div></div>${tabs("compact",[["auto","Auto"],["on","Oui"],["off","Non"]])}</div>
 <div class="row" style="padding:6px 0"><div class="grow"><b>Pastilles de nouveauté</b></div>${tabs("dots",[["on","Normales"],["calm","Discrètes"],["off","Cachées"]])}</div>
 <div class="row" style="padding:6px 0"><div class="grow"><b>Reprendre le dernier mode au lancement</b></div><button class="${PREFS.resume?"":"secondary"} u2res" style="min-width:70px" onclick="setPref('resume',${!PREFS.resume})">${PREFS.resume?"OUI":"NON"}</button></div>
 <div class="row" style="padding:6px 0"><div class="grow"><b>Confirmations</b><div class="muted tiny">Réactiver les questions « ne plus demander »</div></div><button class="secondary" onclick="ens();S.ui2.noAsk={};save();toast('Confirmations réactivées.')">RÉACTIVER</button></div>
 <div class="row" style="padding:6px 0"><div class="grow"><b>Raccourcis clavier</b></div><button class="secondary" onclick="u2Keys()">VOIR (F1)</button></div></div>`)};
/* ---- « Quoi de neuf » après une mise à jour ---- */
const U2_NEW=["⌨️ Raccourcis clavier partout (F1), menu pause (Échap ou P)","🔔 Centre de notifications et historique des combats","🔎 Recherche dans la collection, glisser-déposer pour réorganiser","👁️ Aperçu des ennemis et « meilleure équipe » avant un niveau","↩️ Annulation du recyclage pendant 10 secondes","🔠 Taille du texte et mode compact (Réglages > Affichage)"];
function u2WhatsNew(force){ens();const prev=S.ui2.seenVer;S.ui2.seenVer=ARK_VERSION;save();if(!force&&(!prev||prev===ARK_VERSION||PREFS.lore===false||U2_WD))return false;
 openModal(`<h3 style="margin:0 0 6px">✨ Quoi de neuf dans la version ${esc(ARK_VERSION)} ?</h3><ul class="u2new">${U2_NEW.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><div class="tiny muted">Toutes les nouveautés : bouton « Dernière version » des réglages.</div><div class="btns"><button onclick="closeModal()">C'EST PARTI !</button></div>`);$$("modalBody").classList.add("u2wn");return true}
const _spU2=setPref;setPref=function(k,v){_spU2(k,v);if(k==="lore"&&v===false&&$$("modalBody").classList.contains("u2wn")){$$("modalBody").classList.remove("u2wn");closeModal()}};
u2Apply();u2Bell();
if(!U2_WD)setTimeout(()=>{try{if(!u2WhatsNew()&&PREFS.resume&&S.ui2&&S.ui2.last&&screen==="home"&&$$(S.ui2.last)&&!document.getElementById("wdIntro"))go(S.ui2.last)}catch(e){}},1900);else{try{ens();S.ui2.seenVer=ARK_VERSION}catch(e){}}
if(typeof GUIDE!=="undefined")GUIDE.push(["Confort","F1 : raccourcis clavier ; Échap ferme une fenêtre ou met le combat en pause. 🔔 en haut : notifications et combats récents. Clic sur une ressource : où l'obtenir. Collection : recherche par nom et glisser-déposer. Histoire : aperçu des ennemis (clic droit sur un niveau) et « meilleure équipe ». Réglages > Affichage : taille du texte, mode compact, pastilles."]);
