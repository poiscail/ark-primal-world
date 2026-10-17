/* Application II (0.41) : vérification de la dernière version sur GitHub, copies de sauvegarde dans un dossier choisi
   (OneDrive, clé USB… : toutes les 10 min, en quittant, et une copie datée par semaine), sauvegarde portable à côté de l'exe,
   capture d'écran (F12), fenêtre sans bordure, économie d'énergie, journal local des erreurs et des plantages, copie de secours
   dans IndexedDB, manette, mode développeur (journal du combat), étiquettes pour lecteur d'écran, et un petit système de
   crochets déclarés (hook) pour les prochains modules. Les fonctions de bureau n'existent que dans l'application (arkDesktop). */
/* ---- crochets déclarés : hook("renderBattle", après, {avant}) au lieu d'écrire le wrapper à la main ---- */
const HOOKS={};
function hook(name,after,o){o=o||{};const prev=window[name];if(typeof prev!=="function")throw new Error("hook : "+name+" n'est pas une fonction");
 const w=function(){if(o.before&&o.before.apply(this,arguments)===false)return;const r=prev.apply(this,arguments);if(after)try{after.call(this,r,...arguments)}catch(e){appErr(e,"hook "+name)}return r};
 window[name]=w;(HOOKS[name]=HOOKS[name]||[]).push(o.id||"?");return w}
/* ---- journal local des erreurs ---- */
const appErrs=()=>{try{return JSON.parse(localStorage.getItem("arkPrimalErrors")||"[]")}catch(e){return[]}};
function appErr(e,where){try{const L=appErrs();L.unshift({t:Date.now(),v:ARK_VERSION,w:String(where||"").slice(0,80),m:String(e&&e.message||e).slice(0,300),s:String(e&&e.stack||"").slice(0,800)});L.length=Math.min(L.length,30);localStorage.setItem("arkPrimalErrors",JSON.stringify(L))}catch(x){}}
addEventListener("error",ev=>appErr(ev.error||ev.message,(ev.filename||"").split("/").pop()+":"+ev.lineno));
addEventListener("unhandledrejection",ev=>appErr(ev.reason,"promesse"));
function appErrView(){const L=appErrs(),cr=window.arkDesktop&&arkDesktop.crashLog?(()=>{try{return arkDesktop.crashLog()}catch(e){return""}})():"";const d=t=>new Date(t).toLocaleString("fr-FR");
 openModal(`<h3 style="margin:0 0 6px">🩺 Rapport d'erreurs (sur cet ordinateur)</h3><div class="tiny muted">Rien n'est envoyé : copie ce rapport si tu veux le signaler.</div><div class="aperrs">${L.length?L.map(e=>`<div><small>${d(e.t)} · v${esc(e.v)} · ${esc(e.w)}</small><br>${esc(e.m)}</div>`).join(""):'<div class="tiny muted">Aucune erreur enregistrée. 👍</div>'}${cr?`<pre>${esc(cr)}</pre>`:""}</div>
 <div class="btns"><button class="secondary" onclick="appErrCopy()">COPIER</button><button class="secondary" onclick="localStorage.removeItem('arkPrimalErrors');appErrView()">EFFACER</button><button onclick="closeModal()">OK</button></div>`)}
function appErrCopy(){const t=JSON.stringify({version:ARK_VERSION,erreurs:appErrs()},null,1);try{navigator.clipboard.writeText(t).catch(()=>{})}catch(e){}toast("Rapport copié.")}
/* ---- dernière version sur GitHub ---- */
const APP_API="https://api.github.com/repos/poiscail/ark-primal-world/releases/latest";
const verCmp=(a,b)=>{const A=String(a).replace(/^v/,"").split(".").map(Number),B=String(b).replace(/^v/,"").split(".").map(Number);for(let i=0;i<3;i++){if((A[i]||0)!==(B[i]||0))return(A[i]||0)>(B[i]||0)?1:-1}return 0};
let APP_UPD=null;
async function appCheckUpdate(force){try{const last=+localStorage.getItem("arkPrimalUpdT")||0;if(!force&&Date.now()-last<6*36e5)return APP_UPD;localStorage.setItem("arkPrimalUpdT",String(Date.now()));
 const r=await fetch(APP_API,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)return null;const j=await r.json(),v=String(j.tag_name||"").replace(/^v/,"");if(!v)return null;
 APP_UPD={v,newer:verCmp(v,ARK_VERSION)>0,url:j.html_url||ARK_RELEASES};if(APP_UPD.newer&&!force)toast("⬆️ La version "+v+" est disponible (Réglages > Application).",5000);return APP_UPD}catch(e){return null}}
/* ---- copies de sauvegarde dans un dossier choisi (application) ; rappel hebdomadaire d'export (navigateur) ---- */
function appBackupNow(quiet){if(!window.arkDesktop||!arkDesktop.backup)return false;try{const o=arkDesktop.opts()||{};if(!o.backupDir)return false;const json=JSON.stringify(envelope(true));let ok=arkDesktop.backup("ARK-sauvegarde.json",json);
 const wk=+localStorage.getItem("arkPrimalWeekly")||0;if(ok&&Date.now()-wk>7*864e5){if(arkDesktop.backup("ARK-sauvegarde-"+todayK()+".json",json))localStorage.setItem("arkPrimalWeekly",String(Date.now()))}
 if(!quiet)toast(ok?"💾 Copie enregistrée dans "+o.backupDir:"Copie impossible dans ce dossier.");return ok}catch(e){appErr(e,"copie");return false}}
async function appPickDir(){if(!window.arkDesktop)return;const d=await arkDesktop.pickDir();if(d){toast("📁 Copies dans : "+d);appBackupNow()}setRender()}
if(window.arkDesktop&&arkDesktop.backup){setInterval(()=>appBackupNow(true),6e5);addEventListener("beforeunload",()=>appBackupNow(true))}
function appWeeklyReminder(now){if(window.arkDesktop)return false;const wk=+localStorage.getItem("arkPrimalWeekly")||0;now=now||Date.now();if(!wk){localStorage.setItem("arkPrimalWeekly",String(now));return false}
 if(now-wk<7*864e5)return false;localStorage.setItem("arkPrimalWeekly",String(now));toast("💾 Ça fait une semaine : pense à exporter ta sauvegarde (Accueil > Profil > Sauvegarde).",6000);return true}
/* ---- capture d'écran (F12, application) ---- */
if(window.arkDesktop&&arkDesktop.onShot)arkDesktop.onShot(f=>toast(f?"📸 Capture enregistrée : "+f:"Capture impossible.",3500));
/* ---- économie d'énergie : animations décoratives en pause après 60 s sans action ---- */
if(typeof PREFS.eco!=="boolean")PREFS.eco=false;
let appIdleT=0;function appWake(){document.documentElement.classList.remove("apidle");clearTimeout(appIdleT);if(PREFS.eco)appIdleT=setTimeout(()=>document.documentElement.classList.add("apidle"),60000)}
["pointermove","keydown","pointerdown","wheel"].forEach(t=>addEventListener(t,appWake,{passive:true}));
/* ---- copie de secours de la sauvegarde dans IndexedDB ---- */
const APP_IDB={db:null,t:0};
function appIdb(){return new Promise(res=>{if(APP_IDB.db)return res(APP_IDB.db);try{const r=indexedDB.open("arkPrimalWorld",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>{APP_IDB.db=r.result;res(r.result)};r.onerror=()=>res(null)}catch(e){res(null)}})}
async function appIdbPut(k,v){const db=await appIdb();if(!db)return false;return new Promise(res=>{try{const tx=db.transaction("kv","readwrite");tx.objectStore("kv").put(v,k);tx.oncomplete=()=>res(true);tx.onerror=()=>res(false)}catch(e){res(false)}})}
async function appIdbGet(k){const db=await appIdb();if(!db)return null;return new Promise(res=>{try{const q=db.transaction("kv").objectStore("kv").get(k);q.onsuccess=()=>res(q.result??null);q.onerror=()=>res(null)}catch(e){res(null)}})}
const _svApp=save;save=function(){const r=_svApp.apply(this,arguments);clearTimeout(APP_IDB.t);APP_IDB.t=setTimeout(()=>{try{const v=localStorage.getItem("arkPrimalMobile");if(v)appIdbPut("save",v)}catch(e){}},2000);return r};
async function appIdbRestore(){try{if(localStorage.getItem("arkPrimalMobile"))return false;const v=await appIdbGet("save");if(!v)return false;JSON.parse(v);localStorage.setItem("arkPrimalMobile",v);location.reload();return true}catch(e){return false}}
appIdbRestore();
/* ---- manette (API Gamepad) : flèches = orbes / boutons, A = valider, B = retour, X = super, Y = auto, Start = pause ---- */
const PAD={on:false,prev:[],raf:0};
function padKey(key){document.dispatchEvent(new KeyboardEvent("keydown",{key,bubbles:true}))}
function padFocus(dir){const L=screen==="battle"?[...document.querySelectorAll("#battleArea .orbboard .orb")]:[...document.querySelectorAll(".screen.active button:not([disabled]),#modalVeil:not(.hide) #modalBody button:not([disabled])")].filter(b=>b.offsetParent);if(!L.length)return;
 const a=document.activeElement;if(!L.includes(a)){L[0].focus();return}if(screen==="battle"){padKey("Arrow"+dir);return}const i=L.indexOf(a),n=dir==="Down"||dir==="Right"?1:-1;L[(i+n+L.length)%L.length].focus()}
function padButton(i){const a=document.activeElement;
 if(i===0){if(a&&a.click&&a!==document.body)a.click()}else if(i===1)padKey("Escape");else if(i===2){if(screen==="battle"&&typeof special==="function")special()}else if(i===3){if(screen==="battle")setPref("auto",!PREFS.auto)}
 else if(i===9){if(screen==="battle")padKey("p")}else if(i===12)padFocus("Up");else if(i===13)padFocus("Down");else if(i===14)padFocus("Left");else if(i===15)padFocus("Right");
 else if(i===4||i===5||i===6){if(screen==="battle"&&typeof useSkill==="function")useSkill(i-4)}}
function padPoll(){const G=(navigator.getGamepads?[...navigator.getGamepads()]:[]).filter(Boolean);if(!G.length){PAD.raf=0;return}const g=G[0],b=g.buttons.map(x=>x.pressed);
 b.forEach((p,i)=>{if(p&&!PAD.prev[i])padButton(i)});PAD.prev=b;PAD.raf=requestAnimationFrame(padPoll)}
addEventListener("gamepadconnected",()=>{PAD.on=true;toast("🎮 Manette détectée : flèches, A pour valider, B pour revenir, X super, Y auto.",3500);if(!PAD.raf)PAD.raf=requestAnimationFrame(padPoll)});
/* ---- mode développeur : journal des événements du combat ---- */
if(typeof PREFS.dev!=="boolean")PREFS.dev=false;
const DEVLOG=[];
function devLog(t,d){if(!PREFS.dev)return;const f=fight;DEVLOG.push({t:Math.round(performance.now()),e:t,d,wave:f&&f.wave,hp:f&&f.hp&&f.hp.slice(),foe:f&&f.enemies&&f.enemies[f.wave]&&f.enemies[f.wave].hp});if(DEVLOG.length>600)DEVLOG.shift()}
hook("tapOrb",(r,i)=>devLog("orbe",i),{id:"dev"});hook("useSkill",(r,k)=>devLog("compétence",k),{id:"dev"});hook("special",()=>devLog("super"),{id:"dev"});
hook("enemyTurn",()=>devLog("tour ennemi"),{id:"dev"});hook("killEnemy",()=>devLog("ennemi vaincu"),{id:"dev"});hook("startBattle",(r,o)=>devLog("début",o&&o.mode),{id:"dev"});
function devView(){openModal(`<h3 style="margin:0 0 6px">🛠️ Journal du combat (${DEVLOG.length})</h3><div class="apdev">${DEVLOG.slice(-80).reverse().map(x=>`<div><small>${x.t} ms</small> <b>${esc(x.e)}</b> ${x.d!==undefined?esc(String(x.d)):""} · vague ${x.wave??"-"} · PV ${esc(String(x.hp||"-"))} · ennemi ${x.foe??"-"}</div>`).join("")||'<div class="tiny muted">Rien pour l\'instant : joue un combat.</div>'}</div>
 <div class="btns"><button class="secondary" onclick="devExport()">EXPORTER (JSON)</button><button class="secondary" onclick="DEVLOG.length=0;devView()">VIDER</button><button onclick="closeModal()">OK</button></div>`)}
function devExport(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({version:ARK_VERSION,log:DEVLOG},null,1)],{type:"application/json"}));a.download="ark-journal-combat.json";document.body.appendChild(a);a.click();a.remove()}
/* ---- lecteur d'écran : noms pour les boutons à émoji seul, rôles des zones ---- */
function a11yLabels(root){(root||document).querySelectorAll("button:not([aria-label])").forEach(b=>{const t=(b.textContent||"").trim();if(b.title&&(!t||/^[\p{Extended_Pictographic}\s✏️❓✖]+$/u.test(t)))b.setAttribute("aria-label",b.title)});
 const nav=document.querySelector(".bottomnav");if(nav&&!nav.getAttribute("role")){nav.setAttribute("role","navigation");nav.setAttribute("aria-label","Navigation principale")}
 document.querySelectorAll(".screen").forEach(s=>{if(!s.getAttribute("role")){s.setAttribute("role","region");const h=s.querySelector("h1,h2");s.setAttribute("aria-label",(h&&h.textContent.trim())||s.id)}});
 const ob=document.querySelector("#battleArea .orbboard");if(ob&&!ob.getAttribute("role")){ob.setAttribute("role","group");ob.setAttribute("aria-label","Plateau d'orbes")}
 const t=$$("toasts");if(t&&!t.getAttribute("aria-live")){t.setAttribute("aria-live","polite");t.setAttribute("role","status")}}
hook("render",()=>a11yLabels(),{id:"a11y"});hook("renderBattle",()=>a11yLabels(document.getElementById("battleArea")),{id:"a11y"});
/* ---- réglages : panneau « Application » complété ---- */
hook("setRender",()=>{const box=$$("setBody");if(!box||box.querySelector("#apOpts"))return;const D=window.arkDesktop,o=D&&D.opts?(()=>{try{return D.opts()||{}}catch(e){return{}}})():{};
 const tg=(k,n,d)=>`<div class="row" style="padding:5px 0"><div class="grow"><b>${n}</b>${d?`<div class="muted tiny">${d}</div>`:""}</div><button class="${PREFS[k]?"":"secondary"} apt-${k}" style="min-width:70px" onclick="setPref('${k}',${!PREFS[k]})">${PREFS[k]?"OUI":"NON"}</button></div>`;
 const u=APP_UPD;const h=`<div class="panel" id="apOpts"><b>Application et outils</b>
  <div class="row" style="padding:5px 0"><div class="grow"><b>Mises à jour</b><div class="muted tiny" id="apUpd">${u?(u.newer?"⬆️ La version "+esc(u.v)+" est disponible.":"✅ Tu as la dernière version ("+esc(ARK_VERSION)+")."):"Version "+esc(ARK_VERSION)+" — vérifie sur GitHub."}</div></div><button class="secondary" onclick="appCheckUpdate(true).then(()=>{const e=$$('apUpd');if(e)e.textContent=APP_UPD?(APP_UPD.newer?'⬆️ La version '+APP_UPD.v+' est disponible.':'✅ Tu as la dernière version.'):'Vérification impossible (pas de réseau ?)'})">VÉRIFIER</button></div>
  ${D?`<div class="row" style="padding:5px 0"><div class="grow"><b>Copies de sauvegarde</b><div class="muted tiny">${o.backupDir?"Dans "+esc(o.backupDir)+" : toutes les 10 min, en quittant, et une copie datée par semaine.":"Choisis un dossier (OneDrive, clé USB…) pour y copier ta sauvegarde automatiquement."}</div></div><button class="secondary" onclick="appPickDir()">${o.backupDir?"CHANGER":"CHOISIR"}</button>${o.backupDir?`<button class="secondary" onclick="appBackupNow()">COPIER</button>`:""}</div>
  <div class="row" style="padding:5px 0"><div class="grow"><b>Fenêtre sans bordure</b><div class="muted tiny">Plein écran fenêtré (au prochain lancement)</div></div><button class="${o.borderless?"":"secondary"}" onclick="arkDesktop.setOpt('borderless',${!o.borderless});setRender()">${o.borderless?"OUI":"NON"}</button><button class="secondary" onclick="arkDesktop.relaunch()">RELANCER</button></div>
  ${o.canPortable?`<div class="row" style="padding:5px 0"><div class="grow"><b>Sauvegarde à côté de l'exe</b><div class="muted tiny">Version portable : la sauvegarde voyage avec le jeu (clé USB). Prend effet au prochain lancement.</div></div><button class="${o.portableSave?"":"secondary"}" onclick="appPortable(${!o.portableSave})">${o.portableSave?"OUI":"NON"}</button></div>`:""}
  <div class="tiny muted">F12 : capture d'écran dans Images\\ARK Primal World.</div>`:""}
  ${tg("eco","Économie d'énergie","Animations décoratives en pause après 1 minute sans action")}${tg("dev","Mode développeur","Journal des événements du combat")}
  <div class="btns">${PREFS.dev?`<button class="secondary" onclick="devView()">🛠️ JOURNAL DU COMBAT</button>`:""}<button class="secondary" onclick="appErrView()">🩺 RAPPORT D'ERREURS</button></div></div>`;
 const ref=$$("setDesktop");if(ref)ref.insertAdjacentHTML("beforebegin",h);else box.insertAdjacentHTML("beforeend",h)},{id:"app2"});
function appPortable(on){const r=arkDesktop.portable(on);if(r&&r.ok){toast(on?"Sauvegarde copiée à côté de l'exe : relance le jeu.":"Sauvegarde ramenée dans le dossier habituel : relance le jeu.",4000);setTimeout(()=>arkDesktop.relaunch(),1500)}else toast("Impossible : "+((r&&r.why)||"erreur"))}
hook("setPref",(r,k,v)=>{if(k==="eco")appWake()},{id:"app2"});
if(!(typeof navigator!=="undefined"&&navigator.webdriver))setTimeout(()=>{appCheckUpdate();appWeeklyReminder()},5000);
a11yLabels();
if(typeof GUIDE!=="undefined")GUIDE.push(["Application","Réglages > Application et outils : vérifier les mises à jour, copies automatiques de la sauvegarde dans un dossier (OneDrive, clé USB), fenêtre sans bordure, sauvegarde portable, économie d'énergie, rapport d'erreurs. F12 : capture d'écran. La manette fonctionne (flèches, A, B, X super, Y auto)."]);
/* ---- outil d'administration : éditeur des zones et des ennemis (enregistré dans « arkPrimalAdmin2 ») ---- */
const AD2_DEF={zones:JSON.parse(JSON.stringify(ZONES)),tune:{...TUNE}};
function ad2Apply(){try{const o=JSON.parse(localStorage.getItem("arkPrimalAdmin2")||"null");if(!o)return;if(Array.isArray(o.zones))o.zones.forEach((z,i)=>{if(ZONES[i]&&z&&typeof z[0]==="string"&&Array.isArray(z[1])&&z[1].length===3&&/orb$/.test(z[2]))ZONES[i]=[z[0].slice(0,24),z[1].map(e=>String(e).slice(0,8)),z[2]]});
 if(o.tune&&o.tune.h>0&&o.tune.h<=5&&o.tune.a>0&&o.tune.a<=5){TUNE.h=+o.tune.h;TUNE.a=+o.tune.a}}catch(e){appErr(e,"admin2")}}
ad2Apply();
hook("buildAdmin",()=>{const box=document.getElementById("adminDinos");if(!box||document.getElementById("ad2Box"))return;const els=["greenorb","blueorb","redorb","purpleorb","goldorb"];
 box.insertAdjacentHTML("beforebegin",`<div class="ad2box" id="ad2Box"><b>ZONES ET ENNEMIS</b><div class="tiny muted">Nom des 4 zones de l'histoire, émojis des ennemis (vague 1, vague 2, vague 3) et élément ; force globale des ennemis.</div>
 ${ZONES.map((z,i)=>`<div class="grid2 ad2z" data-z="${i}"><div><label>Zone ${i+1}</label><input data-k="n" value="${esc(z[0])}"></div><div><label>Ennemis</label><input data-k="e" value="${esc(z[1].join(" "))}"></div><div><label>Élément</label><select data-k="el">${els.map(e=>`<option value="${e}" ${z[2]===e?"selected":""}>${ICO[e]||e}</option>`).join("")}</select></div></div>`).join("")}
 <div class="grid2"><div><label>PV des ennemis (×)</label><input id="ad2h" type="number" step="0.05" min="0.2" max="5" value="${TUNE.h}"></div><div><label>Attaque des ennemis (×)</label><input id="ad2a" type="number" step="0.05" min="0.2" max="5" value="${TUNE.a}"></div></div>
 <button class="secondary" type="button" onclick="ad2Reset()">Zones et ennemis par défaut</button></div>`)},{id:"admin2"});
function ad2Read(){const zones=[...document.querySelectorAll("#ad2Box .ad2z")].map(r=>{const q=k=>r.querySelector(`[data-k="${k}"]`).value;const e=q("e").trim().split(/\s+/).slice(0,3);while(e.length<3)e.push(e[0]||"🦖");return[q("n").trim()||"Zone",e,q("el")]});
 return{zones,tune:{h:Math.min(5,Math.max(.2,+$$("ad2h").value||1.3)),a:Math.min(5,Math.max(.2,+$$("ad2a").value||1.15))}}}
hook("saveAdmin",null,{id:"admin2",before:()=>{try{if($$("ad2Box")){localStorage.setItem("arkPrimalAdmin2",JSON.stringify(ad2Read()));ad2Apply()}}catch(e){appErr(e,"admin2")}}});
function ad2Reset(){localStorage.removeItem("arkPrimalAdmin2");AD2_DEF.zones.forEach((z,i)=>ZONES[i]=JSON.parse(JSON.stringify(z)));Object.assign(TUNE,AD2_DEF.tune);const b=$$("ad2Box");if(b)b.remove();buildAdmin()}
