// 0.45 · Décors peints des zones (FLUX.1 [schnell], Black Forest Labs, Apache 2.0 ; images créées par le joueur).
// Posés au fond de chaque scène (combat, bannières, cartes, camp) des zones Jungle, Ruines, Volcan, Obélisque, Toundra et Abysses, sous le décor
// dessiné par le code (dont on garde le sol et, en transparence, le plan du milieu). Images : css/97-aibg-img.css (tools/aibg_build.py).
// Réglage : Réglages > Affichage > Décors (peints / dessinés), PREFS.aiBg. Les dinos restent dessinés par le code.
const AIBG={jungle:1,ruines:1,volcan:1,obelisque:1,toundra:1,abysses:1};
const aiOn=()=>PREFS.aiBg!==false;
const _shAi=sceneHTML;sceneHTML=function(z){const h=_shAi(z);if(!aiOn()||!AIBG[z])return h;return h.replace('<div class="scene">',`<div class="scene aibg aibg-${z}"><i class="sc-ai" aria-hidden="true"></i>`)};
function aiSet(v){setPref("aiBg",v);document.querySelectorAll(".bscene").forEach(e=>e.remove());try{render()}catch(e){}}
const _srAi=setRender;setRender=function(){_srAi();const box=$$("setBody");if(!box||box.querySelector("#aiOpts"))return;const af=[...box.querySelectorAll(".panel")].find(p=>(p.querySelector("b")||{}).textContent==="Affichage");if(!af)return;
 af.insertAdjacentHTML("beforeend",`<div id="aiOpts" class="row" style="padding:6px 0"><div class="grow"><b>Décors</b><div class="muted tiny">« Peints » : Jungle, Ruines, Volcan, Obélisque, Toundra et Abysses ont un fond illustré. « Dessinés » : les décors d'avant, faits par le code.</div></div><div class="eltabs"><button class="${aiOn()?"on":""}" onclick="aiSet(true)">Peints</button><button class="${aiOn()?"":"on"}" onclick="aiSet(false)">Dessinés</button></div></div>`)};
if(typeof GUIDE!=="undefined")GUIDE.push(["Décors peints","Jungle, Ruines, Volcan, Obélisque, Toundra et Abysses ont un fond illustré derrière les combats, les bannières et les cartes. Réglages > Affichage > Décors : « Dessinés » pour revenir aux décors faits par le code."]);
