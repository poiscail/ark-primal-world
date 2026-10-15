/* Thèmes : 7 ambiances complètes (couleurs + image de fond) */
const SKINS=[["neon","Néon",["#00e5ff","#ff3df2"]],["clair","Clair",["#0070d6","#c016b6"]],["jungle","Jungle",["#7dff9b","#d4ff6a"]],["volcan","Volcan",["#ff9a4c","#ff3c5c"]],["abysses","Abysses",["#4cd8ff","#3cffd1"]],["mystique","Mystique",["#c58bff","#ff7ad9"]],["desert","Désert",["#ffc24d","#ff7a3c"]]];
function skinNow(){if(PREFS.skin&&SKINS.some(s=>s[0]===PREFS.skin))return PREFS.skin;return document.documentElement.getAttribute("data-theme")==="light"?"clair":"neon"}
const _at99s=applyTheme;applyTheme=function(){_at99s();const H=document.documentElement;if(PREFS.skin){H.setAttribute("data-skin",PREFS.skin);H.setAttribute("data-theme",PREFS.skin==="clair"?"light":"dark")}else H.removeAttribute("data-skin");
 let bg=document.getElementById("skinBg");if(!bg){bg=document.createElement("div");bg.id="skinBg";document.body.prepend(bg)}bg.className="bg-"+skinNow();
 const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=getComputedStyle(H).getPropertyValue("--bg0").trim()||m.content};
function setSkin(k){PREFS.skin=k;if(!k)PREFS.theme="auto";savePrefs();applyPrefs();setRender()}
const _sr99s=setRender;setRender=function(){_sr99s();const p=[...document.querySelectorAll("#setVeil .panel")].find(x=>{const b=x.querySelector("b");return b&&b.textContent.trim()==="Thème"});if(!p)return;const cur=PREFS.skin||"";
 p.innerHTML=`<b>Thème</b><div class="muted tiny">Couleurs et image de fond de tout le jeu.</div><div class="skins">${SKINS.map(([k,n,c])=>`<button class="skc bg-${k} ${cur===k?"on":""}" onclick="setSkin('${k}')"><i>${c.map(x=>`<u style="background:${x}"></u>`).join("")}</i><b>${n}</b></button>`).join("")}</div><button class="wide secondary ${cur?"":"on"}" style="margin-top:8px" onclick="setSkin('')">🖥️ AUTOMATIQUE ${cur?"":"✓"} <span class="tiny">(Néon ou Clair selon l'appareil)</span></button>`};
applyTheme();
