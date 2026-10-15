/* Version de bureau (.exe, Electron) : réglages « Application » (plein écran, quitter, dossier de sauvegarde, dernière version).
   Dans un navigateur (développement), seul le lien vers la dernière version est proposé. */
function openReleases(){window.open(ARK_RELEASES,"_blank","noopener")}
if(window.arkDesktop)document.body.classList.add("desktop");
const _setRD=setRender;setRender=function(){_setRD();const box=$$("setBody");if(!box)return;
 const lk=`<button class="secondary" onclick="openReleases()" title="${esc(ARK_RELEASES)}">🌐 DERNIÈRE VERSION</button>`;
 if(window.arkDesktop){let i={};try{i=arkDesktop.info()||{}}catch(e){}
  box.insertAdjacentHTML("beforeend",`<div class="panel" id="setDesktop"><b>Application Windows</b><div class="muted tiny" style="margin:4px 0">Version ${esc(ARK_VERSION)}${i.portable?" (portable)":""}. Ta sauvegarde est enregistrée sur cet ordinateur${i.data?" : "+esc(i.data):""}. Exporte-la (Accueil > Profil > Sauvegarde) pour la mettre à l'abri ou la passer sur un autre PC.</div><div class="btns"><button class="secondary" onclick="arkDesktop.toggleFullscreen()">PLEIN ÉCRAN (F11)</button>${lk}<button class="red" onclick="arkDesktop.quit()">QUITTER LE JEU</button></div></div>`)}
 else box.insertAdjacentHTML("beforeend",`<div class="panel" id="setDesktop"><b>Version ${esc(ARK_VERSION)}</b><div class="muted tiny" style="margin:4px 0">Le jeu se télécharge pour Windows (.exe) sur sa page GitHub, avec toutes les versions et leurs nouveautés.</div><div class="btns">${lk}</div></div>`)};
