/* Enchaînement automatique des combats (jusqu'à une défaite) + animations de plateau */
let chainCount=0,chainT=null;
function chainNext(f){if(!f||!f.o||f.daily)return null;const m=f.o.mode;
 if(m==="story"){const n=f.n+1;return n<=100&&n<=S.stage+1?{mode:"story",n}:null}
 if(m==="tower")return{mode:"tower"};
 if(m==="dungeon")return f.o;
 return null}
function chainStop(msg){clearInterval(chainT);chainT=null;const c=document.getElementById("chainBar");if(c)c.remove();if(msg)toast(msg)}
function chainToggle(){setPref("chain",!PREFS.chain);if(!PREFS.chain)chainStop();if(fight)renderBattle()}
let chainS=null;
function chainBar(res){const {nx,left}=chainS;res.insertAdjacentHTML("afterbegin",`<div id="chainBar" class="chainbar"><div class="cring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" class="cbg"/><circle cx="18" cy="18" r="15.9" class="cfg" style="animation-duration:${left}s"/></svg><b id="chainN">${left}</b></div><div class="grow"><b>Combat suivant…</b><div class="tiny muted">🔁 Série : ${chainCount} victoire(s)${nx.mode==="story"?" · niveau "+nx.n:nx.mode==="tower"?" · étage "+S.tower.floor:""}</div></div><button class="secondary" onclick="chainStop('Enchaînement arrêté')">ARRÊTER</button></div>`)}
function chainArm(f){if(!PREFS.chain)return;const res=document.querySelector("#battleArea .result:not(.tiny)");if(!res)return;
 if(chainS&&chainS.f===f){if(chainT&&!document.getElementById("chainBar"))chainBar(res);return}
 chainCount++;const nx=chainNext(f);chainS={f,nx,left:PREFS.anim?3:1,done:!nx};if(!nx){if(chainCount>1)toast("🔁 Série terminée : "+chainCount+" victoire(s)");return}
 chainBar(res);chainT=setInterval(()=>{if(fight!==f||screen!=="battle"){chainStop();return}chainS.left--;const n=document.getElementById("chainN");if(n)n.textContent=Math.max(0,chainS.left);if(chainS.left<=0){chainStop();startBattle(nx)}},1000)}
const _et99c=enemyTurn;enemyTurn=function(){_et99c();if(fight&&fight.over==="lose"){if(PREFS.chain&&chainCount>0)toast("🔁 Série arrêtée après "+chainCount+" victoire(s)",3500);chainCount=0;chainStop()}};
const _ef99c=escapeFight;escapeFight=function(){chainStop();chainCount=0;return _ef99c.apply(this,arguments)};
/* rendu : bouton d'enchaînement, plateau animé, combo, super prête */
const _rb99c=renderBattle;renderBattle=function(){_rb99c();const f=fight;if(!f||!f.mx)return;const box=$$("battleArea");
 const tg=`<button class="chaintgl ${PREFS.chain?"on":""}" onclick="chainToggle()">🔁 Enchaînement auto : <b>${PREFS.chain?"OUI":"NON"}</b>${PREFS.chain&&chainCount?` · série ${chainCount}`:""}</button>`;
 if(f.over){const res=box.querySelector(".result:not(.tiny)");if(res&&!res.querySelector(".chaintgl"))res.insertAdjacentHTML("beforeend",tg);if(f.over==="win")chainArm(f)}
 else{const g=box.querySelector(".gauge");if(g&&!box.querySelector(".chaintgl"))g.insertAdjacentHTML("beforebegin",tg);
  if(PREFS.anim){const sig=f.orbs.join(",");if(sig!==f._osig){const first=f._osig===undefined;f._osig=sig;box.querySelectorAll(".orbboard .orb").forEach((o,i)=>{o.classList.add("drop");o.style.animationDelay=(first?i*45:i*30)+"ms"})}
   if(f.combo>0&&f.combo!==f._lc){const ob=box.querySelector(".orbboard");if(ob){const r=ob.getBoundingClientRect(),d=document.createElement("div");d.className="combopop";d.innerHTML=`COMBO <b>×${f.combo+1}</b>`;d.style.left=(r.left+r.width/2)+"px";d.style.top=(r.top+20)+"px";fxAdd(d,1100)}}}
  f._lc=f.combo;const sp=[...box.querySelectorAll("button.red")].find(b=>/SUPER/.test(b.textContent));if(sp&&!sp.disabled)sp.classList.add("ready")}};
