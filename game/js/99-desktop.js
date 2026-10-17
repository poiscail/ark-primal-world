/* Version de bureau (.exe, Electron) : réglages « Application » (plein écran, quitter, dossier de sauvegarde, dernière version).
   Dans un navigateur (développement), seul le lien vers la dernière version est proposé. */
function openReleases(){window.open(ARK_RELEASES,"_blank","noopener")}
if(window.arkDesktop)document.body.classList.add("desktop");
const _setRD=setRender;setRender=function(){_setRD();const box=$$("setBody");if(!box)return;
 const lk=`<button class="secondary" onclick="openReleases()" title="${esc(ARK_RELEASES)}">🌐 DERNIÈRE VERSION</button>`;
 if(window.arkDesktop){let i={};try{i=arkDesktop.info()||{}}catch(e){}
  box.insertAdjacentHTML("beforeend",`<div class="panel" id="setDesktop"><b>Application Windows</b><div class="muted tiny" style="margin:4px 0">Version ${esc(ARK_VERSION)}${i.portable?" (portable)":""}. Ta sauvegarde est enregistrée sur cet ordinateur${i.data?" : "+esc(i.data):""}. Exporte-la (Accueil > Profil > Sauvegarde) pour la mettre à l'abri ou la passer sur un autre PC.</div><div class="btns"><button class="secondary" onclick="arkDesktop.toggleFullscreen()">PLEIN ÉCRAN (F11)</button>${lk}<button class="red" onclick="arkDesktop.quit()">QUITTER LE JEU</button></div></div>`)}
 else box.insertAdjacentHTML("beforeend",`<div class="panel" id="setDesktop"><b>Version ${esc(ARK_VERSION)}</b><div class="muted tiny" style="margin:4px 0">Le jeu se télécharge pour Windows (.exe) sur sa page GitHub, avec toutes les versions et leurs nouveautés.</div><div class="btns">${lk}</div></div>`)};
/* 0.47 · Jouer en arrière-plan (PREFS.bgRun, oui par défaut) : l'auto-combat et l'enchaînement continuent quand la fenêtre
   est réduite ou cachée (avant, autoReady s'arrêtait dès que la page était cachée). Dans l'application, desktop/main.js
   coupe aussi le ralentissement des minuteries par Chromium (option « bgRun » de options.json, envoyée par arkDesktop.setOpt). */
function bgRunOn(){return PREFS.bgRun!==false}
autoReady=function(){const f=fight;return!!(PREFS.auto&&screen==="battle"&&f&&f.mx&&!f.over&&(bgRunOn()||!document.hidden)&&!document.querySelector(".authveil:not(.hide)"))};
function bgRunSet(v){setPref("bgRun",v);try{if(window.arkDesktop&&arkDesktop.setOpt)arkDesktop.setOpt("bgRun",v)}catch(e){}if(v&&typeof autoKick==="function")autoKick()}
try{if(window.arkDesktop&&arkDesktop.opts){const o=arkDesktop.opts()||{};if((o.bgRun!==false)!==bgRunOn())arkDesktop.setOpt("bgRun",bgRunOn())}}catch(e){}
const _srBg=setRender;setRender=function(){_srBg();const p=$$("setDesktop");if(!p||p.querySelector("#bgRunOpt"))return;
 p.insertAdjacentHTML("beforeend",`<div id="bgRunOpt" class="row" style="padding:8px 0 2px"><div class="grow"><b>Jouer en arrière-plan</b><div class="muted tiny">${window.arkDesktop?"Le jeu continue quand sa fenêtre est réduite ou derrière une autre : l'auto-combat et l'enchaînement ne s'arrêtent pas, les minuteries ne sont pas ralenties.":"L'auto-combat continue quand l'onglet est caché (le navigateur peut quand même le ralentir : l'application Windows, elle, ne ralentit pas)."}</div></div><div class="eltabs"><button class="${bgRunOn()?"on":""}" onclick="bgRunSet(true)">Oui</button><button class="${bgRunOn()?"":"on"}" onclick="bgRunSet(false)">Non</button></div></div>`)};
if(typeof GUIDE!=="undefined")GUIDE.push(["Arrière-plan","Le jeu continue quand sa fenêtre est réduite : l'auto-combat et l'enchaînement tournent tout seuls. Réglages > Application Windows > Jouer en arrière-plan (Oui/Non). Les expéditions, le nid et le camp avancent de toute façon, même jeu fermé (ils suivent l'heure réelle)."]);
