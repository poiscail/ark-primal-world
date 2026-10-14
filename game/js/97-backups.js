/* Sauvegardes automatiques de secours : 5 copies tournantes dans le navigateur, restaurables depuis les Réglages */
const BK_KEY="arkPrimalBackups",BK_MAX=5,BK_EVERY=10*60*1000;
function bkRead(){try{const a=JSON.parse(localStorage.getItem(BK_KEY)||"[]");return Array.isArray(a)?a.filter(b=>b&&typeof b.s==="string"&&b.at):[]}catch(e){return[]}}
function bkWrite(a){for(;;){try{localStorage.setItem(BK_KEY,JSON.stringify(a));return true}catch(e){if(a.length<=1)return false;a.shift()}}}
function bkInfo(js){try{const s=JSON.parse(js);return(s.team||[]).length+" dino · histoire "+(s.stage||0)+"/100"+(s.tower&&s.tower.best?" · tour "+s.tower.best:"")}catch(e){return"?"}}
let bkLast=(bkRead().slice(-1)[0]||{}).at||0;
function takeBackup(label,force){const now=Date.now();if(!force&&now-bkLast<BK_EVERY)return false;let js;try{js=JSON.stringify(S)}catch(e){return false}
 if(!S||!S.team||!S.team.length)return false;const a=bkRead(),prev=a.slice(-1)[0];if(prev&&prev.s===js&&!label)return false;
 a.push({at:now,l:label||"auto",s:js});while(a.length>BK_MAX){const i=a.findIndex(b=>b.l==="auto");a.splice(i>=0?i:0,1)}
 if(!bkWrite(a))return false;bkLast=now;return true}
const _save97=save;save=function(){_save97();try{takeBackup()}catch(e){}};
function bkList(){return bkRead().map((b,i)=>({i,at:b.at,l:b.l,info:bkInfo(b.s)})).reverse()}
function bkRestore(at){const a=bkRead(),b=a.find(x=>x.at===at);if(!b){toast("Sauvegarde introuvable.");return}
 if(!confirm("Restaurer la sauvegarde du "+new Date(b.at).toLocaleString("fr-FR")+" ("+bkInfo(b.s)+") ?\nLa progression actuelle sera d'abord sauvegardée."))return;
 takeBackup("avant restauration",true);try{localStorage.setItem("arkPrimalMobile",b.s)}catch(e){toast("Restauration impossible (stockage).");return}window.__noSaveOnUnload=true;location.reload()}
function bkDelete(at){bkWrite(bkRead().filter(b=>b.at!==at));setRender()}
const _setR97=setRender;setRender=function(){_setR97();const box=$$("setBody");if(!box)return;const l=bkList();
 box.insertAdjacentHTML("beforeend",`<div class="panel"><b>Sauvegardes de secours</b><div class="muted tiny" style="margin:4px 0">Une copie automatique toutes les 10 minutes de jeu (5 conservées), plus avant chaque import. Stockées dans ce navigateur.</div>${l.length?l.map(b=>`<div class="row tiny" style="padding:4px 0"><div class="grow"><b>${esc(new Date(b.at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}))}</b> · ${esc(b.l)}<br><span class="muted">${esc(b.info)}</span></div><button style="padding:6px 8px;font-size:12px" onclick="bkRestore(${b.at})">RESTAURER</button><button class="secondary" style="padding:6px 8px;font-size:12px" onclick="bkDelete(${b.at})">✕</button></div>`).join(""):'<div class="muted tiny">Aucune copie pour l\'instant.</div>'}<button class="wide secondary" style="margin-top:6px" onclick="takeBackup('manuel',true);toast('Copie créée.');setRender()">CRÉER UNE COPIE MAINTENANT</button></div>`)};
try{takeBackup("démarrage")}catch(e){}
