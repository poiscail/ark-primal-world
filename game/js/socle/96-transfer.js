/* Sauvegarde : export / import par fichier ou par code (même format que les anciennes versions navigateur et téléphone).
   Enveloppe : {game, fmt, ver, at, from, S, cfg}. Codes : "ARK2." + gzip/base64, ou "ARK1." + base64. L'ancien code (base64 brut de S) reste lisible. */
const SAVE_GAME="ark-primal-world";
const _save96=save;save=function(){if(window.__noSaveOnUnload)return;_save96()};
document.body.classList.add(ARK_PLATFORM);
const b64e=u8=>{let s="";for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)};
const b64d=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
function envelope(withCfg){ens();let cfg=null;if(withCfg){try{cfg=JSON.parse(localStorage.getItem("arkPrimalConfig")||"null")}catch(e){}}
 return{game:SAVE_GAME,fmt:SAVE_FORMAT,ver:ARK_VERSION,at:new Date().toISOString(),from:ARK_PLATFORM,S:JSON.parse(JSON.stringify(S)),cfg}}
async function gz(txt){const cs=new Blob([new TextEncoder().encode(txt)]).stream().pipeThrough(new CompressionStream("gzip"));return new Uint8Array(await new Response(cs).arrayBuffer())}
async function gunz(u8){const ds=new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"));return new TextDecoder().decode(await new Response(ds).arrayBuffer())}
async function makeCode(){const json=JSON.stringify(envelope(false));if(typeof CompressionStream==="function")try{return "ARK2."+b64e(await gz(json))}catch(e){}return "ARK1."+btoa(unescape(encodeURIComponent(json)))}
async function parseCode(txt){txt=String(txt||"").trim().replace(/\s+/g,"");if(!txt)throw new Error("Aucun code.");let json;
 if(txt.startsWith("ARK2."))json=await gunz(b64d(txt.slice(5)));else if(txt.startsWith("ARK1."))json=decodeURIComponent(escape(atob(txt.slice(5))));else json=decodeURIComponent(escape(atob(txt)));
 return JSON.parse(json)}
/* validation : renvoie {S, cfg, info} ou lève une erreur lisible */
function validate(o){if(!o||typeof o!=="object")throw new Error("Fichier illisible.");let st=o,cfg=null,info={from:"ancienne version",ver:"?",at:""};
 if(o.game){if(o.game!==SAVE_GAME)throw new Error("Ce fichier n'est pas une sauvegarde d'ARK Primal World.");if(!(o.fmt>=1))throw new Error("Format de sauvegarde inconnu.");if(o.fmt>SAVE_FORMAT)throw new Error("Cette sauvegarde vient d'une version plus récente du jeu. Mets à jour cette version avant d'importer.");st=o.S;cfg=o.cfg||null;info={from:o.from==="phone"?"téléphone":"PC",ver:o.ver,at:o.at}}
 if(!st||!Array.isArray(st.team)||!st.team.length)throw new Error("La sauvegarde ne contient aucun dinosaure.");
 const known=t=>SPEC[t]||(cfg&&cfg.dinos&&cfg.dinos[t]);if(!st.team.every(d=>d&&typeof d.type==="string"&&known(d.type)&&Number.isFinite(d.level)))throw new Error("La sauvegarde contient des dinosaures inconnus ou invalides.");
 for(const k of ["stone","essence","tickets"])if(st[k]!==undefined&&!Number.isFinite(st[k]))throw new Error("Valeurs de ressources invalides.");
 return{S:st,cfg,info}}
function summary(S2){const n=S2.team.length,pw=S2.stage||0;return n+" dinosaures · histoire "+pw+"/100"+(S2.tower?" · tour "+(S2.tower.best||0):"")+(S2.arena?" · arène "+S2.arena.r:"")}
function applyImport(v){if(!confirm("Importer la sauvegarde ("+v.info.from+", v"+v.info.ver+(v.info.at?", "+v.info.at.slice(0,10):"")+") ?\n"+summary(v.S)+"\n\nElle REMPLACERA la progression de cet appareil ("+summary(S)+"). Exporte d'abord celle-ci si tu veux la garder."))return false;
 const nv={...initial,...v.S};try{takeBackup("avant import",true)}catch(e){}
 try{localStorage.setItem("arkPrimalMobile",JSON.stringify(nv));if(v.cfg&&v.cfg.dinos)localStorage.setItem("arkPrimalConfig",JSON.stringify(v.cfg))}catch(e){toast("Stockage plein ou refusé : import impossible.");return false}
 window.__noSaveOnUnload=true;location.reload();return true}
/* actions */
async function trExportCode(){try{const c=await makeCode();$$("trCode").value=c;try{await navigator.clipboard.writeText(c);toast("Code copié ("+c.length+" caractères).")}catch(e){$$("trCode").select();toast("Copie le code affiché.")}}catch(e){toast("Export impossible : "+e.message)}}
async function trImportCode(){try{applyImport(validate(await parseCode($$("trCode").value)))}catch(e){toast("Code invalide : "+(e.message||"illisible"))}}
function trExportFile(){const json=JSON.stringify(envelope(true),null,0),blob=new Blob([json],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="ark-primal-world-"+new Date().toISOString().slice(0,10)+".arksave";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast("Fichier de sauvegarde créé.")}
function trImportFile(inp){const f=inp.files&&inp.files[0];if(!f)return;if(f.size>8e6){toast("Fichier trop gros.");inp.value="";return}const rd=new FileReader();rd.onload=()=>{try{applyImport(validate(JSON.parse(rd.result)))}catch(e){toast("Import impossible : "+(e.message||"fichier illisible"))}inp.value=""};rd.readAsText(f)}
function trRestoreBackup(){const l=bkList().filter(b=>b.l==="avant import");if(!l.length){toast("Aucune sauvegarde d'avant import.");return}bkRestore(l[0].at)}
/* interface : remplace l'ancien bloc « Sauvegarde » de l'accueil */
(function(){const old=document.querySelector(".savebox");if(old){const h=old.previousElementSibling;if(h&&h.classList.contains("sectionhead"))h.remove();old.remove()}
 $$("home").insertAdjacentHTML("beforeend",`<div class="sectionhead"><h2>Sauvegarde</h2><span class="muted tiny">fichier ou code</span></div><div class="panel savebox"><div class="muted tiny" style="margin-bottom:6px">${window.arkDesktop?"Application Windows":"Version navigateur"} · v${ARK_VERSION}. Exporte ta progression pour la mettre à l'abri ou la passer sur un autre PC. Les sauvegardes des anciennes versions (navigateur, téléphone) s'importent ici.</div>
 <div class="btns"><button class="blue" onclick="trExportFile()">EXPORTER UN FICHIER</button><label class="filebtn">IMPORTER UN FICHIER<input type="file" accept=".arksave,.json,application/json" onchange="trImportFile(this)"></label></div>
 <div class="muted tiny" style="margin:8px 0 4px">Ou par code (à copier / coller) :</div><textarea id="trCode" placeholder="Code de sauvegarde"></textarea><div class="btns"><button class="secondary" onclick="trExportCode()">COPIER LE CODE</button><button class="secondary" onclick="trImportCode()">IMPORTER CE CODE</button></div>
 <button class="wide secondary" style="margin-top:6px" onclick="trRestoreBackup()">ANNULER LE DERNIER IMPORT</button><div class="muted tiny" style="margin-top:6px">Le fichier inclut aussi tes réglages d'admin (noms, images). Le code, plus court, n'inclut que la progression.</div></div>`)})();
/* clavier (version PC) */
if(ARK_PLATFORM==="pc")document.addEventListener("keydown",e=>{if(e.ctrlKey||e.metaKey||e.altKey||screen!=="battle"||!fight||fight.over||!$$("setVeil").classList.contains("hide")||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||""))return;
 const k=e.key.toLowerCase(),d=/^(?:Digit|Numpad)([1-9])$/.exec(e.code||"");/* chiffres par position de touche : marche aussi en AZERTY sans Maj */
 if(d){const i=+d[1]-1;if(fight.orbs&&i<fight.orbs.length)tapOrb(i)}else if("aze".includes(k)&&k.length===1)useSkill("aze".indexOf(k));else if(k===" "){e.preventDefault();special()}});
const _rbT=renderBattle;renderBattle=function(){_rbT();if(ARK_PLATFORM==="pc"&&fight&&!fight.over)$$("battleArea").insertAdjacentHTML("beforeend",'<div class="tiny muted" style="margin-top:6px">⌨ Clavier : 1 à 9 orbes · A-Z-E compétences · Espace super attaque · R auto · T vitesse</div>')};
