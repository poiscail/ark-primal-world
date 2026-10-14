/* Installation sur téléphone et mode hors ligne (uniquement en http/https : le service worker est inactif en file://) */
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;if(!$$("setVeil").classList.contains("hide"))setRender()});
window.addEventListener("appinstalled",()=>{deferredInstall=null;toast("Application installée.")});
const isStandalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
let swState="inactif";
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register("sw.js").then(r=>{swState="enregistré";if(r.active)swState="actif (hors ligne prêt)";r.addEventListener("updatefound",()=>{const w=r.installing;if(w)w.addEventListener("statechange",()=>{if(w.state==="activated"){swState="actif (hors ligne prêt)";if(!$$("setVeil").classList.contains("hide"))setRender()}})})}).catch(e=>{swState="erreur : "+e.message})}
else swState=/^https?:$/.test(location.protocol)?"non pris en charge":"inactif (fichier ouvert directement)";
function installApp(){if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.finally(()=>{deferredInstall=null;setRender()})}}
const _setRender=setRender;setRender=function(){_setRender();const box=$$("setBody");if(!box)return;
 box.insertAdjacentHTML("beforeend",`<div class="panel"><b>Application et hors ligne</b><div class="muted tiny" style="margin:4px 0">Version ${ARK_VERSION} · Mode hors ligne : ${esc(swState)}${isStandalone()?" · lancée comme application":""}</div>${deferredInstall&&!isStandalone()?'<button class="wide blue" onclick="installApp()">INSTALLER SUR CET APPAREIL</button>':""}<div class="muted tiny">${isStandalone()?"":"Pour installer : ouvre le jeu depuis une adresse https ou localhost, puis « Ajouter à l'écran d'accueil » (Android : menu ⋮ · iPhone : bouton Partager). Ouvert directement comme fichier, le jeu fonctionne mais l'installation et le cache hors ligne sont indisponibles."}</div></div>`)};
