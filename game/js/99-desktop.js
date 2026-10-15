/* Version de bureau (.exe, Electron) : réglages « Application » (plein écran, quitter, dossier de sauvegarde).
   Ne fait rien dans un navigateur (window.arkDesktop n'existe que dans l'application). */
if(window.arkDesktop){document.body.classList.add("desktop");
 const dInfo=()=>{try{return arkDesktop.info()||{}}catch(e){return{}}};
 const _setRD=setRender;setRender=function(){_setRD();const box=$$("setBody");if(!box)return;const i=dInfo();
  box.insertAdjacentHTML("beforeend",`<div class="panel" id="setDesktop"><b>Application Windows</b><div class="muted tiny" style="margin:4px 0">Version ${esc(ARK_VERSION)}${i.portable?" (portable)":""}. Ta sauvegarde est enregistrée sur cet ordinateur${i.data?" : "+esc(i.data):""}. Exporte-la (Accueil > Sauvegarde) pour la passer sur un autre appareil.</div><div class="btns"><button class="secondary" onclick="arkDesktop.toggleFullscreen()">PLEIN ÉCRAN (F11)</button><button class="red" onclick="arkDesktop.quit()">QUITTER LE JEU</button></div></div>`)};
 const _rD=render;render=function(){_rD();const t=document.querySelector(".savebox .muted.tiny");if(t&&!t.dataset.d){t.dataset.d=1;t.textContent=t.textContent.replace("Version PC","Version Windows (.exe)")}};
 render()}
