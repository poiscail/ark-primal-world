/* Accessibilité (0.41) : palette daltonienne (symboles déjà sur les orbes + couleurs distinctes), contraste élevé, réduction
   des mouvements dans tous les menus, lecture à voix haute des textes, combat jouable au clavier (flèches entre les orbes,
   focus visible), aucune limite de temps par défaut (la pêche n'échappe plus), modes « Histoire » (−30 %) et « Expert »
   (meilleures récompenses), vitesse des dialogues, sous-titres des sons importants, taille des orbes, flashs et secousses
   coupés partout séparément, rappel de pause après 1 h (option). Réglages : PREFS.cb, hc, rm, tts, txtSpd, subs, orbSz,
   noTimer, breakRem. */
for(const[k,v]of [["cb",false],["hc",false],["tts",false],["subs",false],["breakRem",false],["noTimer",true]])if(typeof PREFS[k]!=="boolean")PREFS[k]=v;
if(typeof PREFS.rm!=="boolean")PREFS.rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!["instant","fast","normal","slow"].includes(PREFS.txtSpd))PREFS.txtSpd="normal";
if(!["s","m","l"].includes(PREFS.orbSz))PREFS.orbSz="m";
/* ---- difficulté : Histoire (−30 %) et Expert (meilleures récompenses), dans l'ordre ---- */
(function(){const old={...DIFFS};for(const k in DIFFS)delete DIFFS[k];Object.assign(DIFFS,{story:{n:"Histoire",h:.7,a:.7,r:.75}},old,{expert:{n:"Expert",h:1.6,a:1.45,r:1.6}})})();
function axApply(){const H=document.documentElement;H.classList.toggle("axcb",!!PREFS.cb);H.classList.toggle("axhc",!!PREFS.hc);H.classList.toggle("axrm",!!PREFS.rm);
 H.classList.toggle("axnoflash",PREFS.flash===false);H.classList.toggle("axnoshake",PREFS.shake===false);H.dataset.orb=PREFS.orbSz}
const _apAx=applyPrefs;applyPrefs=function(){_apAx();try{axApply()}catch(e){}};
/* ---- lecture à voix haute ---- */
function axSay(txt,force){try{if(!(PREFS.tts||force)||!window.speechSynthesis||!txt)return false;const u=new SpeechSynthesisUtterance(String(txt).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,500));u.lang="fr-FR";u.volume=Math.min(1,(PREFS.vVoice??.9)*(PREFS.vol??1));speechSynthesis.cancel();speechSynthesis.speak(u);window.__say=(window.__say||0)+1;return true}catch(e){return false}}
const _toAx=toast;toast=function(m,ms){const r=_toAx(m,ms);if(PREFS.tts)axSay(m);return r};
const _omAx=openModal;openModal=function(h){_omAx(h);if(PREFS.tts){const b=$$("modalBody");if(b)axSay(b.innerText.slice(0,400))}};
/* ---- dialogues : vitesse du texte (et lecture si demandée) ---- */
const AX_SPD={fast:12,normal:28,slow:55};
loreType=function(){const t=document.getElementById("loreTxt"),s=loreCur.lines[loreCur.i];clearInterval(loreTimer);const b=document.getElementById("loreBtn");if(b)b.textContent=loreCur.i>=loreCur.lines.length-1?(loreCur.cb?"⚔ COMBATTRE":"FERMER"):"SUIVANT ▶";
 if(PREFS.tts)axSay(s);if(!PREFS.anim||PREFS.txtSpd==="instant"){t.textContent=s;loreTimer=null;return}let i=0;t.textContent="";loreTimer=setInterval(()=>{i+=2;t.textContent=s.slice(0,i);if(i>=s.length){clearInterval(loreTimer)}},AX_SPD[PREFS.txtSpd]||28)};
/* ---- sous-titres des sons importants ---- */
let axSubT=0;
function axSub(txt){if(!PREFS.subs)return;let el=$$("axSubs");if(!el){document.body.insertAdjacentHTML("beforeend",'<div id="axSubs" role="status" aria-live="polite"></div>');el=$$("axSubs")}el.textContent="["+txt+"]";el.classList.add("on");window.__sub=txt;clearTimeout(axSubT);axSubT=setTimeout(()=>el.classList.remove("on"),2200)}
for(const[k,t]of [["win","Fanfare de victoire"],["lose","Musique de défaite"],["legend","Son légendaire"],["special","Super attaque"],["cutin","Super attaque"]]){const o=SFX[k];if(o)SFX[k]=function(){axSub(t);return o.apply(this,arguments)}}
if(typeof mutSnd==="function"){const _mAx=mutSnd;mutSnd=function(){axSub("Son de mutation");return _mAx()}}
if(typeof seedMotif==="function"){const _smAx=seedMotif;seedMotif=function(){axSub("Thème de la Graine");return _smAx()}}
const _rbAx=renderBattle;renderBattle=function(){_rbAx();try{const f=fight;if(!f||f.over||!f.enemies)return;if(3-(f.turn||0)%3===1&&f.axAl!==f.turn){f.axAl=f.turn;axSub("⚠ Alerte : attaque puissante au prochain tour")}
 const e=f.enemies[f.wave];if(e&&e.boss&&f.axBoss!==f.wave){f.axBoss=f.wave;axSub("Rugissement du boss")}
 const low=f.hp&&f.mx&&f.hp.some((h,k)=>h>0&&h/f.mx[k]<.25);if(low&&!f.axLow){f.axLow=1;axSub("Battement de cœur : un dino a peu de PV")}else if(!low)f.axLow=0;axFocus()}catch(e){}};
/* ---- combat au clavier : flèches entre les orbes, focus visible ---- */
function axFocus(){document.querySelectorAll("#battleArea .orbboard .orb").forEach((o,i)=>{o.setAttribute("aria-label","Orbe "+(i+1)+" "+({redorb:"feu",blueorb:"eau",greenorb:"plante",purpleorb:"foudre",goldorb:"lumière"}[[...o.classList].find(c=>/orb$/.test(c)&&c!=="orb")]||""))})}
document.addEventListener("keydown",e=>{if(screen!=="battle"||!/^Arrow/.test(e.key))return;const a=document.activeElement,L=[...document.querySelectorAll("#battleArea .orbboard .orb")];if(!L.length)return;let i=L.indexOf(a);
 const n=Math.round(Math.sqrt(L.length));if(i<0){L[0].focus();e.preventDefault();return}const c=i%n,r=Math.floor(i/n);
 if(e.key==="ArrowRight")i=r*n+(c+1)%n;else if(e.key==="ArrowLeft")i=r*n+(c+n-1)%n;else if(e.key==="ArrowDown")i=((r+1)%n)*n+c;else if(e.key==="ArrowUp")i=((r+n-1)%n)*n+c;e.preventDefault();(L[i]||L[0]).focus()});
/* ---- rappel de pause après 1 h ---- */
const AX_T0=Date.now();let axBreakN=0;
function axBreakCheck(now){if(!PREFS.breakRem)return false;const h=Math.floor(((now||Date.now())-AX_T0)/36e5);if(h>axBreakN){axBreakN=h;toast("☕ Tu joues depuis "+h+" h : pense à faire une pause !",6000);return true}return false}
setInterval(()=>{try{axBreakCheck()}catch(e){}},60000);
/* ---- réglages : panneau « Accessibilité » ---- */
const _srAx=setRender;setRender=function(){_srAx();const box=$$("setBody");if(!box||box.querySelector("#axPanel"))return;
 const tg=(k,n,d)=>`<div class="row" style="padding:5px 0"><div class="grow"><b>${n}</b>${d?`<div class="muted tiny">${d}</div>`:""}</div><button class="${PREFS[k]?"":"secondary"} axt-${k}" style="min-width:70px" onclick="setPref('${k}',${!PREFS[k]})">${PREFS[k]?"OUI":"NON"}</button></div>`;
 const tabs=(k,n,L)=>`<div class="row" style="padding:5px 0"><div class="grow"><b>${n}</b></div><div class="eltabs ax-${k}">${L.map(([v,t])=>`<button class="${PREFS[k]===v?"on":""}" onclick="setPref('${k}','${v}')">${t}</button>`).join("")}</div></div>`;
 const ref=[...box.querySelectorAll(".panel")].find(p=>(p.querySelector("b")||{}).textContent==="Affichage");const h=`<div class="panel" id="axPanel"><b>Accessibilité</b>
  ${tg("cb","Mode daltonien","Couleurs d'orbes très distinctes (en plus de leurs symboles)")}${tg("hc","Contraste élevé")}${tg("rm","Réduire les mouvements","Coupe les animations des menus et des fonds")}
  ${tg("tts","Lire les textes à voix haute","Notifications, fenêtres et dialogues (voix de l'ordinateur)")}${tg("subs","Sous-titres des sons importants")}${tg("noTimer","Pas de limite de temps","Les mini-jeux attendent (la pêche ne s'échappe plus)")}
  ${tabs("txtSpd","Vitesse des dialogues",[["instant","Immédiate"],["fast","Rapide"],["normal","Normale"],["slow","Lente"]])}${tabs("orbSz","Taille des orbes",[["s","Petites"],["m","Normales"],["l","Grandes"]])}
  ${tg("breakRem","Rappel de pause","Un message après chaque heure de jeu")}<div class="muted tiny">Combat au clavier : Tab ou les flèches pour choisir une orbe, Entrée pour la jouer (F1 : tous les raccourcis). Flashs et secousses : panneau Affichage.</div></div>`;
 if(ref)ref.insertAdjacentHTML("afterend",h);else box.insertAdjacentHTML("beforeend",h)};
axApply();
if(typeof GUIDE!=="undefined")GUIDE.push(["Accessibilité","Réglages > Accessibilité : mode daltonien, contraste élevé, réduction des mouvements, lecture à voix haute, sous-titres des sons, vitesse des dialogues, taille des orbes, pas de limite de temps, rappel de pause. Difficulté « Histoire » (ennemis −30 %) et « Expert » (récompenses ×1,6). Le combat se joue entièrement au clavier."]);
