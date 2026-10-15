/* Boost d'orbes identiques, effets de combat, compteurs animés, rang du survivant */
/* ---- boutons génériques : fenêtre modale ---- */
document.body.insertAdjacentHTML("beforeend",'<div id="modalVeil" class="authveil hide" onclick="if(event.target===this)closeModal()"><div class="authbox" id="modalBody"></div></div><div id="fxLayer"></div>');
function openModal(h){$$("modalBody").innerHTML=h;$$("modalVeil").classList.remove("hide")}
function closeModal(){$$("modalVeil").classList.add("hide")}
/* saisie de texte dans une fenêtre du jeu (prompt() n'existe pas dans la version .exe) */
let askCb=null;
function askText(title,def,cb,max){askCb=cb;openModal(`<h2 style="margin:0 0 8px">${esc(title)}</h2><input id="askIn" maxlength="${max||18}" value="${esc(def||"")}" style="width:100%;padding:10px;margin:4px 0 10px;font-size:16px"><div class="btns"><button class="secondary" onclick="askCb=null;closeModal()">ANNULER</button><button onclick="askOk()">OK</button></div>`);
 const i=$$("askIn");if(i){i.focus();i.select();i.onkeydown=e=>{if(e.key==="Enter")askOk();else if(e.key==="Escape"){askCb=null;closeModal()}}}}
function askOk(){const i=$$("askIn"),v=(i?i.value:"").trim(),cb=askCb;askCb=null;closeModal();if(cb)cb(v)}
/* ---- boost d'orbes : x1,15 (2) · x1,3 (3) · x1,5 (4) · x1,8 (5) … x3 (9) selon le nombre d'orbes de la même couleur sur le plateau ---- */
const BOOST=[1,1,1.15,1.3,1.5,1.8,2.1,2.4,2.7,3],fmtB=b=>String(b).replace(".",",");
const boostOf=(f,c)=>BOOST[Math.min(9,f.orbs.filter(x=>x===c).length)]||1;
const _atk92=atkOf;atkOf=function(k){return _atk92(k)*((fight&&fight.orbBoost)||1)};
const _op92=orbPreview;orbPreview=function(c){const f=fight;if(!f)return _op92(c);const sv=f.orbBoost;f.orbBoost=1;try{return Math.round(_op92(c)*boostOf(f,c))}finally{f.orbBoost=sv}};
const _aa92=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(f&&f.orbBoost>1&&endTurn)msg+=" · ⚡ BOOST d'orbes ×"+fmtB(f.orbBoost);return _aa92(dmg,msg,endTurn)};
const _tap92=tapOrb;tapOrb=function(i){const f=fight;if(!f||f.over||!f.orbs)return _tap92(i);const c=f.orbs[i];f.orbBoost=boostOf(f,c);f.hitfx=true;orbBurst(i,c,f.orbBoost);try{_tap92(i)}finally{f.orbBoost=1}};
const OCOL={redorb:"#ff647b",blueorb:"#4cc9ff",greenorb:"#6dffa2",purpleorb:"#c58bff",goldorb:"#ffd15c"};
function orbBurst(i,c,b){if(!PREFS.anim)return;const el=document.querySelectorAll("#battleArea .orbboard .orb")[i];if(!el)return;const r=el.getBoundingClientRect(),n=b>1?18:9,L=$$("fxLayer");
 for(let k=0;k<n;k++){const s=document.createElement("i"),a=Math.random()*6.283,d=30+Math.random()*(b>1?80:50);s.className="part";s.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;background:${OCOL[c]||"#fff"};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px`;L.appendChild(s);setTimeout(()=>s.remove(),700)}
 if(b>1)ring(r.left+r.width/2,r.top+r.height/2,OCOL[c])}
function ring(x,y,col){if(!PREFS.anim)return;const s=document.createElement("i");s.className="ringfx";s.style.cssText=`left:${x}px;top:${y}px;border-color:${col||"#fff"}`;$$("fxLayer").appendChild(s);setTimeout(()=>s.remove(),700)}
const _rb92=renderBattle;renderBattle=function(){_rb92();const f=fight;if(!f||!f.orbs)return;
 if(!f.over){document.querySelectorAll("#battleArea .orbboard .orb").forEach((el,i)=>{const c=f.orbs[i];if(!c)return;const b=boostOf(f,c);if(b>1){if(b>=1.3)el.classList.add("boost"+(b>=1.5?3:2));el.insertAdjacentHTML("beforeend",`<i class="obadge">×${fmtB(b)}</i>`)}});
  const ob=document.querySelector("#battleArea .orbboard");if(ob&&!document.getElementById("obHint"))ob.insertAdjacentHTML("afterend",'<div id="obHint" class="tiny muted obhint">⚡ Plus il y a d’orbes de la même couleur, plus elles frappent fort : 2 → ×1,15 · 3 → ×1,3 · 4 → ×1,5 · 5 et + → ×1,8 et plus</div>')}
 if(f.hitfx){f.hitfx=false;const e=document.querySelector("#battleArea .bigicon.hit");if(e){e.classList.remove("enemyhit");void e.offsetWidth;e.classList.add("enemyhit")}}};
/* mort d'un ennemi : fondu du fantôme */
const _ke92=killEnemy;killEnemy=function(){const e=PREFS.anim&&document.querySelector("#battleArea .bigicon.hit");if(e){const r=e.getBoundingClientRect(),g=document.createElement("div");g.className="ghost";g.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;g.innerHTML=e.innerHTML;$$("fxLayer").appendChild(g);setTimeout(()=>g.remove(),800);ring(r.left+r.width/2,r.top+r.height/2,"#ffd15c")}_ke92()};
const _sp92=special;special=function(){const ok=fight&&!fight.over&&fight.sp>=100;_sp92();if(ok&&PREFS.anim){ring(innerWidth/2,innerHeight/2,"#ffd15c");setTimeout(()=>ring(innerWidth/2,innerHeight/2,"#ff647b"),120);document.body.classList.remove("bigshake");void document.body.offsetWidth;document.body.classList.add("bigshake");setTimeout(()=>document.body.classList.remove("bigshake"),500)}};
/* transitions d'écran */
const _go92=go;go=function(s){const prev=screen;_go92(s);if(PREFS.anim&&s!==prev){const el=$$(screen);if(el){el.classList.remove("enter");void el.offsetWidth;el.classList.add("enter")}}};
/* compteurs animés (ressources) */
const mo92=new MutationObserver(ms=>{const seen=new Set();ms.forEach(m=>{const n=m.target.nodeType===3?m.target.parentElement:m.target;const b=n&&n.closest&&n.closest(".meters b");if(b)seen.add(b)});
 seen.forEach(b=>{if(b._set===b.textContent)return;const v=Number(b.textContent),p=b._prev;b._prev=v;if(!Number.isFinite(v)||p===undefined||p===v||!PREFS.anim)return;tween(b,p,v)})});
function tween(b,from,to){cancelAnimationFrame(b._raf);const t0=performance.now(),d=500;b.classList.remove("pulse");void b.offsetWidth;b.classList.add("pulse");
 const step=t=>{const k=Math.min(1,(t-t0)/d),val=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));b._set=String(val);b.textContent=b._set;if(k<1)b._raf=requestAnimationFrame(step);else{b._set=String(to);b.textContent=b._set}};b._raf=requestAnimationFrame(step)}
mo92.observe(document.querySelector(".meters"),{subtree:true,childList:true,characterData:true});
document.querySelectorAll(".meters b").forEach(b=>b._prev=Number(b.textContent));
/* ---- rang du survivant : le niveau de joueur donne un bonus permanent ---- */
const RANK_BONUS=.005;
const rankMul=()=>1+RANK_BONUS*Math.max(0,(S.level||1)-1);
const _st92=stats;stats=function(d){const v=_st92(d),m=rankMul();return{hp:Math.round(v.hp*m),atk:Math.round(v.atk*m),def:v.def}};
function rankReward(L){const R={stone:50*L};if(L%5===0)R.crystal=2;if(L%10===0)R.tickets=2;if(L%20===0)R.amber=3;return R}
const _xp92=addXP;addXP=function(n){const before=S.level;_xp92(n);for(let L=before+1;L<=S.level;L++){const R=rankReward(L);give(R);let it="";if(L%10===0){const g=giveLoot([rollItem(L,1)]);if(g.length)it=" + objet d'équipement"}
  log("Rang "+L+" atteint : "+fmt(R)+it+" (stats d'équipe +"+(RANK_BONUS*100*(L-1)).toFixed(1).replace(".",",")+" %).");if(PREFS.anim){confetti();ring(innerWidth/2,innerHeight/3,"#67e5ff")}sfx("win")}};
function openRank(){const L=S.level,need2=need(L),pct=Math.min(100,Math.round(100*S.xp/need2));
 openModal(`<div class="row"><div class="grow"><h2 style="margin:0">⭐ Rang ${L}</h2><div class="muted tiny">Le niveau de joueur renforce toute ton équipe en permanence.</div></div><button class="secondary" onclick="closeModal()">FERMER</button></div>
 <div class="panel"><b>Bonus actuel : +${((rankMul()-1)*100).toFixed(1).replace(".",",")} % PV et ATQ</b><div class="muted tiny">+0,5 % par rang. XP : ${S.xp}/${need2}</div><div class="progress"><i style="width:${pct}%"></i></div></div>
 <div class="sectionhead"><h2>Prochaines récompenses</h2></div>${[1,2,3,4,5].map(i=>L+i).map(l=>`<div class="panel" style="margin:6px 0;padding:10px"><div class="row"><div class="grow"><b class="tiny">Rang ${l}</b><div class="muted tiny">${fmt(rankReward(l))}${l%10===0?" + objet d'équipement":""} · +${(RANK_BONUS*100).toFixed(1).replace(".",",")} % stats</div></div></div></div>`).join("")}<div class="muted tiny">Plus de XP : chaque victoire (histoire, donjons, tour, arène, événements) en donne.</div>`)}
const lvm=$$("level").closest(".meter");if(lvm){lvm.style.cursor="pointer";lvm.title="Rang du survivant";lvm.addEventListener("click",openRank)}
render();
