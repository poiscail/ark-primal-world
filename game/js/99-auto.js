/* Auto-combat et vitesse du combat (réglages propres à l'appareil : PREFS.auto, PREFS.spd).
   AUTO : l'IA joue à ta place — super dès qu'elle est prête, compétences quand elles servent, sinon la meilleure orbe.
   Vitesse ×1/×2/×3 : animations (Web Animations et CSS) et délais d'enchaînement (fxd) accélérés pendant le combat. */
const SPDS=[1,2,3];
const spdNow=()=>screen==="battle"&&SPDS.includes(PREFS.spd)?PREFS.spd:1;
function spdSync(){FX_SPEED=spdNow()}
const fxScope=el=>!!(el&&el.closest&&el.closest("#fxLayer,#battleArea"));
(function(){const an=Element.prototype.animate;Element.prototype.animate=function(k,o){const a=an.call(this,k,o);if(FX_SPEED>1&&fxScope(this))a.playbackRate=FX_SPEED;return a}})();
["animationstart","transitionrun"].forEach(t=>document.addEventListener(t,e=>{const el=e.target;if(FX_SPEED<=1||!fxScope(el)||!el.getAnimations)return;
 for(const a of el.getAnimations()){const it=a.effect&&a.effect.getTiming?a.effect.getTiming().iterations:1;if(it!==Infinity&&a.playbackRate!==FX_SPEED)a.playbackRate=FX_SPEED}},true));
/* ---- IA ---- */
const AUTO_PRIO=[["heal","selfheal"],["shield","stun"],["roar","focus","charge"],["strike","cleave","drain","burn","execute","poison"],["reorb"]];
function autoWant(id,f,e,t){const r=t.map((d,k)=>alive(k)?f.hp[k]/f.mx[k]:1),low=Math.min(...r),big=!f.stun&&3-f.turn%3===1,eLow=e.hp<e.max*.3;
 switch(id){
  case"heal":return low<.6;
  case"selfheal":return low<.5;
  case"shield":return f.buff.shield<=0&&(big||low<.4);
  case"stun":return!f.stun&&(big||low<.35);
  case"roar":return f.buff.atk<=0;
  case"focus":return!f.crit;
  case"charge":return f.sp<=60;
  case"execute":return eLow||!e.boss;
  case"poison":return!f.dots.length&&!eLow;
  case"reorb":{let best=null,bv=-1;f.orbs.forEach(c=>{const v=orbPreview(c);if(v>bv){bv=v;best=c}});const els=new Set(t.filter((d,k)=>alive(k)).map(d=>sp(d).element));return!els.has(best)&&best!=="goldorb"}
  default:return true}}
function autoSkill(){const f=fight,t=T3(),e=f.enemies[f.wave],ready=t.map((d,k)=>alive(k)&&f.cd[k]<=0);if(!ready.some(Boolean))return-1;
 for(const g of AUTO_PRIO)for(const id of g)for(let k=0;k<t.length;k++)if(ready[k]&&SK_of(t[k])===id&&autoWant(id,f,e,t))return k;return-1}
function autoPlay(){const f=fight;if(f.sp>=100){special();return}const k=autoSkill();if(k>=0){useSkill(k);return}
 let best=0,bv=-1;f.orbs.forEach((c,i)=>{const v=orbPreview(c);if(v>bv){bv=v;best=i}});tapOrb(best)}
/* ---- boucle : une action à la fois, en pause si une fenêtre est ouverte, l'écran quitté ou la page cachée ---- */
let autoT=null;
const autoDelay=()=>Math.round((PREFS.anim?1150:450)/spdNow());
function autoReady(){const f=fight;return!!(PREFS.auto&&screen==="battle"&&f&&f.mx&&!f.over&&!document.hidden&&!document.querySelector(".authveil:not(.hide)"))}
function autoKick(ms){if(autoT||!autoReady())return;autoT=setTimeout(autoStep,ms===undefined?autoDelay():ms)}
function autoStep(){autoT=null;if(!autoReady())return;autoPlay();autoKick()}
document.addEventListener("visibilitychange",()=>{if(!document.hidden)autoKick(600)});
/* ---- commandes ---- */
function autoBtns(){const on=!!PREFS.auto,s=SPDS.includes(PREFS.spd)?PREFS.spd:1;document.querySelectorAll(".abtn").forEach(b=>{b.classList.toggle("on",on);b.innerHTML=on?"⏸ AUTO":"▶ AUTO"});document.querySelectorAll(".sbtn").forEach(b=>{b.textContent="×"+s;b.classList.toggle("on",s>1)});document.querySelectorAll(".cbtn").forEach(b=>b.classList.toggle("on",!!PREFS.chain))}
function autoToggle(){PREFS.auto=!PREFS.auto;savePrefs();autoBtns();if(PREFS.auto)autoKick(250);toast(PREFS.auto?"Auto-combat activé":"Auto-combat désactivé",1400)}
function spdCycle(){const s=SPDS.includes(PREFS.spd)?PREFS.spd:1;PREFS.spd=SPDS[(SPDS.indexOf(s)+1)%SPDS.length];savePrefs();spdSync();autoBtns()}
const _rbA=renderBattle;renderBattle=function(){spdSync();_rbA();const f=fight,box=$$("battleArea");if(!f||!f.mx||!box)return;
 if(!f.over){const h=box.querySelector(":scope>.sectionhead");if(h&&!h.querySelector(".actl"))h.insertAdjacentHTML("beforeend",'<div class="actl"><button class="abtn" onclick="autoToggle()" title="Auto-combat (touche R)"></button><button class="sbtn" onclick="spdCycle()" title="Vitesse du combat (touche T)"></button><button class="cbtn" onclick="chainToggle()" title="Enchaîner : après une victoire en auto, le combat suivant démarre seul">🔁</button></div>');autoBtns();
  const kh=[...box.children].find(x=>x.textContent.startsWith("⌨"));if(kh&&!kh.dataset.a){kh.dataset.a=1;kh.textContent+=" · R auto · T vitesse"}}
 if(f.over==="win"&&PREFS.auto&&PREFS.chain&&chainNext(f)){const r=box.querySelector(".result:not(.tiny)");if(r&&!r.querySelector(".chainmsg"))r.insertAdjacentHTML("beforeend",'<div class="chainmsg tiny">🔁 Combat suivant dans quelques secondes… <button class="secondary" onclick="chainStop()">ARRÊTER</button></div>');chainCheck()}
 autoKick()};
/* ---- enchaîner : après une victoire en auto, le combat suivant démarre seul (niveau suivant en Histoire, étage suivant en Tour,
   même donjon / même épreuve) ; jamais en Arène (combats limités), arrêt sur défaite ---- */
let chainT=null,chainN=0;const CHAIN_MAX=100,chainDelay=()=>Math.round((PREFS.anim?2600:900)/spdNow());
function chainNext(f){const o=f&&f.o;if(!o||o.mode==="arena")return null;if(o.mode==="story")return{mode:"story",n:Math.min(100,f.n+1)};return o}
function chainCheck(){const f=fight;if(!f||f.over!=="win"||f._chain||!PREFS.auto||!PREFS.chain||screen!=="battle")return;const nx=chainNext(f);if(!nx)return;
 if(chainN>=CHAIN_MAX){toast("Enchaînement en pause après "+CHAIN_MAX+" combats.",2600);return}f._chain=1;
 chainT=setTimeout(()=>{chainT=null;if(fight!==f||!PREFS.auto||!PREFS.chain||screen!=="battle")return;
  if(document.hidden||document.querySelector(".authveil:not(.hide)")){f._chain=0;setTimeout(chainCheck,1000);return}chainN++;startBattle(nx)},chainDelay())}
function chainStop(){clearTimeout(chainT);chainT=null;PREFS.chain=false;savePrefs();autoBtns();document.querySelectorAll(".chainmsg").forEach(m=>m.remove());toast("Enchaînement arrêté",1400)}
function chainToggle(){PREFS.chain=!PREFS.chain;if(PREFS.chain&&!PREFS.auto){PREFS.auto=true;autoKick(250)}chainN=0;savePrefs();autoBtns();toast(PREFS.chain?"Enchaînement activé : après une victoire en auto, le combat suivant démarre seul":"Enchaînement désactivé",2200)}
const _goA=go;go=function(s){_goA(s);spdSync();if(s!=="battle"){if(autoT){clearTimeout(autoT);autoT=null}if(chainT){clearTimeout(chainT);chainT=null;if(fight)fight._chain=0}}};
const _spA=setPref;setPref=function(k,v){_spA(k,v);spdSync();if(k==="auto"&&v)autoKick(400)};
if(ARK_PLATFORM==="pc")document.addEventListener("keydown",e=>{if(e.ctrlKey||e.metaKey||e.altKey||screen!=="battle"||!fight||fight.over||!$$("setVeil").classList.contains("hide")||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||""))return;
 const k=e.key.toLowerCase();if(k==="r")autoToggle();else if(k==="t")spdCycle()});
/* réglages */
const _setRA=setRender;setRender=function(){_setRA();const box=$$("setBody");if(!box)return;const s=SPDS.includes(PREFS.spd)?PREFS.spd:1,af=[...box.querySelectorAll(".panel")].find(p=>(p.querySelector("b")||{}).textContent==="Affichage");
 const h=`<div class="panel" id="setCombat"><b>Combat</b><div class="row" style="padding:6px 0"><div class="grow"><b>Vitesse des combats</b><div class="muted tiny">Accélère les animations et l'auto-combat (aussi pendant un combat : bouton ×1 / ×2 / ×3).</div></div></div><div class="eltabs">${SPDS.map(v=>`<button class="${s===v?"on":""}" style="font-size:12px" onclick="setPref('spd',${v})">×${v}</button>`).join("")}</div>
 <div class="row" style="padding:6px 0"><div class="grow"><b>Auto-combat</b><div class="muted tiny">L'IA utilise la super, les compétences utiles et la meilleure orbe. Reste actif d'un combat à l'autre.</div></div><button class="${PREFS.auto?"":"secondary"}" style="min-width:70px" onclick="setPref('auto',${!PREFS.auto})">${PREFS.auto?"OUI":"NON"}</button></div>
 <div class="row" style="padding:6px 0"><div class="grow"><b>Enchaîner les combats</b><div class="muted tiny">Avec l'auto : après une victoire, le combat suivant démarre seul (niveau suivant, étage suivant, même donjon). Jamais en Arène ; s'arrête sur une défaite.</div></div><button class="${PREFS.chain?"":"secondary"}" style="min-width:70px" onclick="setPref('chain',${!PREFS.chain})">${PREFS.chain?"OUI":"NON"}</button></div></div>`;
 if(af)af.insertAdjacentHTML("afterend",h);else box.insertAdjacentHTML("beforeend",h)};
spdSync();
if(typeof GUIDE!=="undefined")GUIDE.push(["Auto-combat et vitesse","Bouton ▶ AUTO au-dessus des orbes : l'IA lance la super dès qu'elle est prête, les compétences quand elles servent (soins si besoin, Carapace avant une grosse attaque…) puis la meilleure orbe. ×1/×2/×3 accélère les animations. 🔁 Enchaîner : après une victoire en auto, le combat suivant démarre seul (niveau ou étage suivant, même donjon ; jamais en Arène, arrêt sur défaite). L'auto se met en pause si tu quittes l'écran ou ouvres une fenêtre. Sur PC : touches R et T."]);
