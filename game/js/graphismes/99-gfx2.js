/* Graphismes II (0.39) : portraits ombrés et texturés (écailles), décor à 4 plans, éclairage selon l'élément de l'attaque,
   météo visible (pluie, sable, cendres, orage, aurore, brume, neige), feuillage animé des bannières, thèmes Fossile / Aurore /
   Rubis, icônes dessinées pour les ressources, cadres de rareté distincts, vitrine de musée pour la collection, carte d'histoire
   en relief, écran titre animé avec astuce, HUD de combat plus lisible, emblème de chaque mode, silhouettes du bestiaire,
   ombres au sol, reflets dans l'eau, brume du Cauchemar, lucioles la nuit, ciel selon l'heure réelle, transitions de page,
   police du titre par zone, cartes légendaires holographiques, option « graphismes simples ». Réglage : PREFS.gfx. */
if(PREFS.gfx!=="full"&&PREFS.gfx!=="simple")PREFS.gfx="full";
const g2Simple=()=>PREFS.gfx==="simple";
const g2Fancy=()=>!!PREFS.anim&&!g2Simple();
/* ---- ciel selon l'heure réelle (aube, jour, crépuscule, nuit) ---- */
function g2Sky(){if(typeof WD_FORCE!=="undefined"&&WD_FORCE!==null)return WD_FORCE?"night":"day";const h=new Date().getHours();return h>=5&&h<8?"dawn":h<18&&h>=8?"day":h>=18&&h<21?"dusk":"night"}
function g2Apply(){const H=document.documentElement;H.classList.toggle("g2simple",g2Simple());H.dataset.sky=g2Sky()}
const _apGx2=applyPrefs;applyPrefs=function(){_apGx2();try{g2Apply()}catch(e){}};
setInterval(()=>{try{g2Apply()}catch(e){}},300000);
/* ---- filtres SVG : ombrage et écailles des portraits ---- */
document.body.insertAdjacentHTML("beforeend",`<svg id="g2defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
 <filter id="g2skin" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/><feOffset in="b" dx="-3" dy="-4" result="o"/>
  <feComposite in="SourceAlpha" in2="o" operator="arithmetic" k2="1" k3="-1" result="rim"/><feFlood flood-color="#000" flood-opacity=".42"/><feComposite in2="rim" operator="in" result="shade"/>
  <feTurbulence type="turbulence" baseFrequency="1.1" numOctaves="1" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.3 -0.62" result="sp"/>
  <feComposite in="sp" in2="SourceAlpha" operator="in" result="tex"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="tex"/><feMergeNode in="shade"/></feMerge></filter></defs></svg>`);
/* ---- 4e plan du décor : crêtes lointaines et vol de ptérosaures ---- */
function g2L0(z){const R=rng(hashS("l0"+z));let p="M0 220 L0 120";for(let x=0;x<=780;x+=30)p+=` L${x} ${80+R()*45}`;p+=" L780 220Z";const col={volcan:"#7a2a12",jungle:"#2b6e52",ruines:"#3c4290",obelisque:"#3d2373",toundra:"#6f8fae",abysses:"#123e66"}[z]||"#25467a";
 const birds=[0,1,2].map(i=>`<path class="g2bird" style="animation-delay:-${i*7+R()*5}s" d="M${100+i*40} ${40+i*12} q6 -6 12 0 q6 -6 12 0" stroke="#0008" stroke-width="2" fill="none"/>`).join("");
 return `<div class="sc-layer l0"><svg viewBox="0 0 780 220" preserveAspectRatio="none"><path d="${p}" fill="${col}" opacity=".55"/>${birds}</svg></div>`}
const _shGx2=sceneHTML;sceneHTML=function(z){const h=_shGx2(z);return h.replace('<div class="sc-layer l1">',g2L0(z)+'<div class="sc-layer l1">')};
/* ---- effets de la scène de combat (refaits à chaque rendu, sans saut grâce aux délais négatifs) ---- */
const G2WX={pluie:["rain",34],orage:["rain",40],sable:["sand",26],cendres:["ash",26],aurore:["aur",1],brume:["mist",3],neige:["snow",30]};
const g2Rand=(k,i)=>((hashS(k+i)%1000)/1000);
function g2Parts(cls,n){let h="";for(let i=0;i<n;i++)h+=`<i style="left:${(g2Rand(cls,i)*100).toFixed(1)}%;animation-delay:-${(g2Rand(cls+"d",i)*4).toFixed(2)}s;--r:${g2Rand(cls+"r",i).toFixed(2)}"></i>`;return h}
const _rbGx2=renderBattle;renderBattle=function(){_rbGx2();try{const f=fight,st=document.querySelector("#battleArea .battlestage");if(!f||!st||!f.enemies)return;
 const z=stageZone(f.zone||""),t=$$("battleTitle");if(t)t.dataset.zone=z;
 if(!g2Fancy())return;
 let wx=typeof wxOf==="function"?wxOf(f):null;if(!wx&&/toundra|glac/i.test(f.zone||""))wx="neige";const W=G2WX[wx];
 if(W&&!st.querySelector(".g2wx"))st.insertAdjacentHTML("beforeend",`<div class="g2wx g2wx-${W[0]}">${g2Parts(W[0],W[1])}</div>`);
 if(f.o&&f.o.mode==="nightmare"&&!st.querySelector(".g2fog"))st.insertAdjacentHTML("beforeend",'<div class="g2fog"><i></i><i></i><i></i></div>');
 if((st.classList.contains("wdnight")||document.documentElement.dataset.sky==="night")&&!st.querySelector(".g2ffly"))st.insertAdjacentHTML("beforeend",`<div class="g2ffly">${g2Parts("ff",12)}</div>`);
 if(z==="abysses")st.classList.add("g2water")}catch(e){}};
/* éclairage selon l'élément de l'attaque */
const _toGx2=tapOrb;tapOrb=function(i){const f=fight,c=f&&f.orbs&&f.orbs[i];const r=_toGx2(i);try{if(c&&g2Fancy()&&screen==="battle"){const st=document.querySelector("#battleArea .battlestage");if(st){const R=st.getBoundingClientRect(),d=document.createElement("div");d.className="g2lit";
  Object.assign(d.style,{left:R.left+"px",top:R.top+"px",width:R.width+"px",height:R.height+"px"});d.style.setProperty("--c",ELC[c]||"#fff");fxAdd(d,fxd(520))}}}catch(e){}return r};
/* ---- thèmes : Fossile, Aurore, Rubis ---- */
SKINS.push(["fossile","Fossile",["#d9b77a","#8fa37a"]],["aurore","Aurore",["#6dffc8","#b48cff"]],["rubis","Rubis",["#ff4d6d","#ffb3c1"]]);
/* ---- icônes dessinées pour les ressources de la barre du haut ---- */
const G2ICO={stone:'<svg viewBox="0 0 24 24"><path d="M4 16 L7 7 L14 4 L20 9 L19 17 L11 20Z" fill="#9aa6b8"/><path d="M7 7 L14 4 L13 11 L4 16Z" fill="#c7d0dc"/><path d="M13 11 L20 9 L19 17Z" fill="#6f7b8e"/></svg>',
 essence:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#9a5cff"/><circle cx="12" cy="12" r="8" fill="url(#g2ess)"/><defs><radialGradient id="g2ess" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#d6b8ff" stop-opacity=".7"/><stop offset="1" stop-color="#5a1fb0" stop-opacity="0"/></radialGradient></defs><path d="M12 6 Q15 10 12 12 Q9 14 12 18" stroke="#fff8" stroke-width="1.4" fill="none"/></svg>',
 tickets:'<svg viewBox="0 0 24 24"><path d="M3 7 H21 V10 A2 2 0 0 0 21 14 V17 H3 V14 A2 2 0 0 0 3 10Z" fill="#ffcf4d"/><path d="M15 7 V17" stroke="#b07a10" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><path d="M7 10 L9 12 L7 14 M10 14 H12" stroke="#7a4f00" stroke-width="1.4" fill="none"/></svg>',
 level:'<svg viewBox="0 0 24 24"><path d="M12 2 L14.6 8.6 L21.5 9 L16.2 13.4 L18 20.2 L12 16.4 L6 20.2 L7.8 13.4 L2.5 9 L9.4 8.6Z" fill="#ffd15c" stroke="#b07a10" stroke-width="1"/></svg>'};
function g2Icons(){document.querySelectorAll("header .meters .meter").forEach(m=>{const b=m.querySelector("b[id]");if(!b||!G2ICO[b.id]||m.querySelector(".g2ico"))return;const tn=[...m.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(tn)tn.textContent=b.id==="level"?" Niv. ":" ";
 m.insertAdjacentHTML("afterbegin",`<i class="g2ico" title="${{stone:"Pierres",essence:"Essence",tickets:"Tickets",level:"Rang du survivant"}[b.id]}">${G2ICO[b.id]}</i>`)})}
g2Icons();
/* ---- cartes : rareté mythique distincte ---- */
const _cdGx2=card;card=function(d,a){const h=_cdGx2(d,a);try{if((SPEC[d.type]||{}).myth)return h.replace("dcard rar-l","dcard rar-l rar-m")}catch(e){}return h};
/* ---- écran titre : dinos qui passent au loin et astuce illustrée ---- */
const G2TIPS=[["🔴","Rouge bat vert, vert bat bleu, bleu bat rouge : vise la faiblesse de l'ennemi."],["⚡","Plusieurs orbes de la même couleur boostent le coup (jusqu'à ×3)."],["🛡️","La Garde (touche G) divise par deux les dégâts du prochain tour ennemi."],["🥚","Au Nid, deux dinos de la même famille pondent un œuf aux gènes hérités."],["🌙","La nuit, des créatures nocturnes rôdent : elles rapportent de l'essence."],["🧬","Un dino peut évoluer : regarde l'onglet Équipe > Évolutions."]];
(function(){const sp=document.getElementById("splash");if(!sp)return;const T=G2TIPS[rnd(G2TIPS.length)];sp.insertAdjacentHTML("beforeend",`<div class="g2walk"><i>🦕</i><i>🦖</i><i>🦕</i></div><div class="g2tip"><b>${T[0]}</b> ${esc(T[1])}</div>`)})();
/* ---- transitions de page (animation d'entrée de l'écran : go() reste synchrone) ---- */
const _goGx2=go;go=function(s){const prev=screen;const r=_goGx2(s);try{if(s!==prev&&g2Fancy()){const el=document.getElementById(s);if(el){el.classList.remove("g2pg");void el.offsetWidth;el.classList.add("g2pg");setTimeout(()=>el.classList.remove("g2pg"),400)}}}catch(e){}return r};
/* ---- réglages : graphismes complets ou simples ---- */
function g2SetGfx(v){setPref("gfx",v)}
const _srGx2=setRender;setRender=function(){_srGx2();const box=$$("setBody");if(!box||box.querySelector("#g2Opts"))return;const af=[...box.querySelectorAll(".panel")].find(p=>(p.querySelector("b")||{}).textContent==="Affichage");if(!af)return;
 af.insertAdjacentHTML("beforeend",`<div id="g2Opts" class="row" style="padding:6px 0"><div class="grow"><b>Graphismes</b><div class="muted tiny">« Simples » retire textures, météo, brume, lucioles, reflets et flous : pour les petits ordinateurs.</div></div><div class="eltabs g2gfx"><button class="${PREFS.gfx==="full"?"on":""}" onclick="g2SetGfx('full')">Complets</button><button class="${PREFS.gfx==="simple"?"on":""}" onclick="g2SetGfx('simple')">Simples</button></div></div>`)};
g2Apply();
if(typeof GUIDE!=="undefined")GUIDE.push(["Graphismes","Le décor du combat a 4 plans, la météo se voit (pluie, sable, cendres, neige…), la nuit a ses lucioles et le ciel suit l'heure réelle. 3 thèmes de plus (Fossile, Aurore, Rubis). Réglages > Affichage > Graphismes « Simples » pour les petits ordinateurs."]);
