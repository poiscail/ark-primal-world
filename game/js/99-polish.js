/* Finitions de l'interface : bannières illustrées, en-tête compact, entrées animées, retour tactile, écran titre */
const BZONE={home:()=>stageZone(zoneOf(Math.min(100,S.stage+1))[0]),team:()=>"neutre",summon:()=>"obelisque",story:()=>stageZone(zoneOf(Math.min(100,S.stage+1))[0]),dungeon:()=>"ruines",tower:()=>"obelisque",arena:()=>"ruines",events:()=>"volcan",exped:()=>"jungle",achs:()=>"neutre",missions:()=>"neutre"};
function bannerScenes(){const sc=document.getElementById(screen);if(!sc||!BZONE[screen])return;const b=sc.querySelector(".banner");if(!b)return;let z;try{z=BZONE[screen]()}catch(e){z="neutre"}
 const cur=b.querySelector(":scope>.bscene");if(cur&&cur.dataset.z===z)return;if(cur)cur.remove();b.insertAdjacentHTML("afterbegin",`<div class="bscene" data-z="${z}">${sceneHTML(z)}</div>`);b.classList.add("hasScene")}
const _r99p=render;render=function(){_r99p();try{bannerScenes()}catch(e){}};
const _go99p=go;go=function(s){_go99p(s);try{bannerScenes()}catch(e){}};
/* retour tactile : onde au point de contact */
document.addEventListener("pointerdown",e=>{if(!PREFS.anim)return;const b=e.target.closest&&e.target.closest("button");if(!b||b.disabled)return;const r=document.createElement("i");r.className="tapfx";r.style.left=e.clientX+"px";r.style.top=e.clientY+"px";const L=$$("fxLayer");if(L){L.appendChild(r);setTimeout(()=>r.remove(),500)}},{passive:true});
/* écran titre (n'intercepte aucun clic) */
(function(){if(navigator.webdriver||!PREFS.anim)return;const d=document.createElement("div");d.id="splash";d.innerHTML=`<div class="spl"><div class="splLogo">ARK<span>PRIMAL WORLD</span></div><div class="splBar"><i></i></div></div>`;document.body.appendChild(d);setTimeout(()=>d.classList.add("out"),1100);setTimeout(()=>d.remove(),1700)})();
/* ===== Carte de l'histoire (chapitres de 10 niveaux, chemin sinueux, étoiles) ===== */
const _ens99p=ens;ens=function(){_ens99p();S.stars=S.stars||{};S.starCl=S.starCl||0};
function starsOf(f){const t=S.team.slice(0,3),alv=t.filter((d,k)=>f.hp[k]>0).length,ratio=t.reduce((a,d,k)=>a+f.hp[k]/f.mx[k],0)/(t.length||1);return alv<t.length?1:ratio>.6?3:2}
const _win99p=win;win=function(){const f=fight,was=f&&f.over;_win99p();if(f&&f.over==="win"&&!was&&f.o&&f.o.mode==="story"&&f.mx){ens();const st=starsOf(f);if(st>(S.stars[f.n]||0)){S.stars[f.n]=st;save()}}};
const STAR_STEP=25;function starTotal(){ens();return Object.values(S.stars).reduce((a,b)=>a+b,0)}
function starClaim(){ens();const t=starTotal();if(t<(S.starCl+1)*STAR_STEP)return;S.starCl++;give({tickets:2,essence:20,shards:5});save();toast("⭐ Palier d'étoiles "+S.starCl*STAR_STEP+" : +2 🎟️ +20 🔮 +5 🧩",3500);sfx&&sfx("win");render()}
let mapCh=null;
function mapSet(c){mapCh=Math.max(0,Math.min(9,c));renderStory()}
renderStory=function(){ens();const cur=Math.min(100,S.stage+1);if(mapCh===null)mapCh=Math.floor((cur-1)/10);const c0=mapCh*10+1,zn=zoneOf(c0)[0],z=stageZone(zn),tot=starTotal(),next=(S.starCl+1)*STAR_STEP;
 const pos=i=>{const xs=[50,24,44,74,56,26,42,72,66,42];return{x:xs[i],y:92-i*9.2}};
 let path="";for(let i=0;i<10;i++){const p=pos(i);path+=(i?" L":"M")+p.x+" "+p.y}
 const nodes=[...Array(10)].map((_,i)=>{const n=c0+i,p=pos(i),boss=n%10===0,done=n<cur,isCur=n===cur,lock=n>cur,st=S.stars[n]||0;
  return `<button class="mnode ${boss?"boss":""} ${done?"done":""} ${isCur?"cur":""} ${lock?"lock":""}" style="left:${p.x}%;top:${p.y}%" ${lock?"disabled":""} onclick="startBattle({mode:'story',n:${n}})"><span class="mn">${boss?"👹":n}</span>${done?`<span class="mst">${[1,2,3].map(k=>`<i class="${k<=st?"on":""}">★</i>`).join("")}</span>`:""}${isCur&&S.team[0]&&PREFS.art==="svg"?`<span class="mlead pt">${portrait(S.team[0].type,true)}</span>`:""}${boss?`<span class="mbl">BOSS ${n}</span>`:""}</button>`}).join("");
 const chStars=[...Array(10)].reduce((a,_,i)=>a+(S.stars[c0+i]||0),0);
 $$("chapters").innerHTML=`<div class="panel"><b>Progression : ${S.stage}/100</b><div class="progress"><i style="width:${S.stage}%"></i></div><div class="muted tiny">Termine un niveau avec toute ton équipe en vie (et plus de 60 % de PV) pour obtenir ★★★.</div>${S.stage>=100?'<div class="ok">Histoire terminée ! 🎉</div>':`<button class="wide" onclick="startBattle({mode:'story',n:${cur}})">JOUER LE NIVEAU ${cur}</button>`}
  <div class="starbar"><span>⭐ ${tot} étoiles</span><div class="progress"><i style="width:${Math.min(100,(tot-S.starCl*STAR_STEP)/STAR_STEP*100)}%;background:linear-gradient(90deg,#ffd15c,#ff9d3c)"></i></div><button ${tot>=next?"":"disabled"} onclick="starClaim()">${tot>=next?"🎁 Palier "+next:"Palier "+next}</button></div></div>
  <div class="panel mapwrap"><div class="maphead"><button class="secondary" ${mapCh?"":"disabled"} onclick="mapSet(${mapCh-1})">‹</button><div><b>Chapitre ${mapCh+1} · ${esc(zn)}</b><div class="muted tiny">Niveaux ${c0}–${c0+9} · ★ ${chStars}/30</div></div><button class="secondary" ${mapCh<9?"":"disabled"} onclick="mapSet(${mapCh+1})">›</button></div>
  <div class="smap z-${z}">${sceneHTML(z)}<svg class="mpath" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${path}" class="mp1"/><path d="${path}" class="mp2"/></svg>${nodes}</div></div>`};
/* fin de combat sur la scène : l'équipe saute de joie ou s'effondre */
const _rb99p=renderBattle;renderBattle=function(){_rb99p();const f=fight;if(!f||!f.over)return;const st=document.querySelector("#battleArea .battlestage");if(!st)return;st.classList.add(f.over==="win"?"won":"lost")};
/* réglages : interrupteurs */
const _sr99p=setRender;setRender=function(){_sr99p();document.querySelectorAll("#setVeil button").forEach(b=>{const t=b.textContent.trim();if(t==="OUI"||t==="NON"){b.classList.add("tgl",t==="OUI"?"on":"off");b.setAttribute("aria-label",t);b.innerHTML="<i></i>"}})};
