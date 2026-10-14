/* Modes de jeu : navigation en hub, Tour infinie, Arène, Événements hebdomadaires */
const ORBS=["redorb","blueorb","greenorb","purpleorb","goldorb"];
const SUBS=[["story","📜","Histoire"],["dungeon","🕳️","Donjons"],["tower","🗼","Tour"],["arena","🏟️","Arène"],["events","🎪","Événements"]];
const ADV=new Set(["story","dungeon","tower","arena","events","battle"]);
const _ens8=ens;ens=function(){_ens8();S.tower=S.tower||{floor:1,best:0,claimed:{}};S.arena=S.arena||{r:1000,best:1000,wins:0,losses:0,day:"",left:5,medals:0,opp:null,log:[]};S.ev=S.ev||{wk:-1,tokens:0,clears:0,bought:{},claimed:{}}};
const wkNow=()=>Math.floor((Date.now()/864e5+3)/7);
const wkLeft=()=>{const ms=((wkNow()+1)*7-3)*864e5-Date.now(),d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5);return d+" j "+h+" h"};
/* ---- navigation ---- */
const nav=document.querySelector(".bottomnav");
nav.innerHTML='<button class="active" data-screen="home"><span>🏠</span>Accueil</button><button data-screen="team"><span>🦖</span>Équipe</button><button data-screen="story" data-grp="adv"><span>🗺️</span>Aventure</button><button data-screen="summon"><span>🔮</span>Invocation</button><button data-screen="missions"><span>📋</span>Missions</button>';
document.querySelector("main").insertAdjacentHTML("afterbegin",'<div id="subnav" class="subnav hide"></div>');
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="tower" class="screen"></section><section id="arena" class="screen"></section><section id="events" class="screen"></section>');
let lastAdv="story";
const _go8=go;go=function(s){if(ADV.has(s)&&s!=="battle")lastAdv=s;if(s==="adv")s=lastAdv;_go8(s);
 nav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.grp==="adv"?ADV.has(s):b.dataset.screen===s));
 const sn=$$("subnav");sn.classList.toggle("hide",!ADV.has(s)||s==="battle");sn.innerHTML=SUBS.map(x=>`<button class="${x[0]===s?"on":""}" onclick="go('${x[0]}')"><span>${x[1]}</span>${x[2]}</button>`).join("")};
nav.addEventListener("click",e=>{const b=e.target.closest('[data-grp="adv"]');if(b){e.stopImmediatePropagation();go(lastAdv)}},true);
/* ---- ennemis et combats personnalisés ---- */
function mkEnemies(n,o){const hp=H(n)*(o.hp||1),at=A(n)*(o.atk||1);return[0,1,2].map(i=>{const last=i===2,boss=last&&!!o.boss,h=Math.round(hp*[1,1.2,boss?2.2:1.5][i]);return{hp:h,max:h,e:o.emo[i],name:o.names?o.names[i]:o.name+" "+(last?"· Élite":"· Ennemi"),el:o.els?o.els[i]:o.el||ORBS[rnd(3)],atk:Math.round(at*[1,1.08,boss?1.4:1.2][i]),boss,regen:o.regen?o.regen:0,pt:o.pts?o.pts[i]:undefined}})}
const eqLv=f=>Math.round(8+f*1.15);
const MODES={
 tower(o){const fl=S.tower.floor,n=eqLv(fl),boss=fl%10===0,mods=[];let hp=1,atk=1,regen=0;
  if(boss){mods.push("Gardien");hp*=1.3}else{if(fl%7===0){mods.push("Colosse");hp*=1.4}if(fl%5===0){mods.push("Frénésie");atk*=1.3}if(fl%9===0){mods.push("Régénérant");regen=.06}}
  const th=["🦴","🐗","🦂","🐙","🦇","🗿","🐉"],emo=[th[fl%7],th[(fl+2)%7],boss?"👹":th[(fl+4)%7]];
  return{eq:n,label:"Tour · Étage "+fl+(mods.length?" ("+mods.join(", ")+")":""),enemies:mkEnemies(n,{emo,name:"Tour",hp,atk,boss,regen,el:null})}},
 arena(o){const n=o.n,els=o.sp.map(k=>SPEC[k].element),emo=o.sp.map(k=>SPEC[k].e),names=o.sp.map(k=>SPEC[k].name+" · "+o.team);
  return{eq:n,label:"Arène · "+o.team,enemies:mkEnemies(n,{emo,names,els,pts:o.sp,boss:o.d===2})}},
 event(o){const e=EVENTS[wkNow()%EVENTS.length],t=EVT[o.t],n=t[1];
  return{eq:n,label:e.n+" · "+t[0],enemies:mkEnemies(n,{emo:e.en,name:e.n,el:e.el,boss:true,hp:1+.1*o.t,atk:1})}}};
const _sb8=startBattle;
startBattle=function(o){o=o||lastB;if(!o||!MODES[o.mode])return _sb8(o);ens();
 if(o.mode==="arena"&&!o.go){toast("Choisis un adversaire dans l'Arène.");go("arena");return}
 if(o.mode==="event"&&o.wk!==wkNow()){toast("Cet événement est terminé.");go("events");return}
 const sp8=MODES[o.mode](o);_sb8({mode:"story",n:sp8.eq});
 const o2={...o,go:false};lastB=o2;const f=fight;f.o=o2;f.n=sp8.eq;f.zone=sp8.label;f.enemies=sp8.enemies;f.lootDone=true;
 const t=document.getElementById("battleTitle");if(t)t.textContent=sp8.label;renderBattle()};
const _et8=enemyTurn;enemyTurn=function(){const f=fight;if(f&&MODES[f.o.mode]){const e=f.enemies[f.wave];if(e&&e.regen&&e.hp>0)e.hp=Math.min(e.max,e.hp+Math.round(e.max*e.regen))}
 _et8();if(f&&f.over==="lose"&&MODES[f.o.mode]&&!f.settled)settleLose()};
/* règlement commun */
function xpTeam(n){const t=S.team.slice(0,3);addXP(CONFIG.battleXP+n);t.forEach(d=>{d.xp+=20+3*n;while(d.xp>=need(d.level)){d.xp-=need(d.level);d.level++;log(sp(d).name+" passe niveau "+d.level+".")}})}
function rewardPanel(R,extra,loot){return `<div class="panel"><b>🎁 Récompenses</b><div style="margin-top:6px;font-size:15px">${fmt(R)}${extra||""}</div></div>`+(loot&&loot.length?lootPanel(loot):"")}
const _win8=win;win=function(){const f=fight;if(!f||!MODES[f.o.mode])return _win8();if(f.settled)return;f.settled=true;f.over="win";ens();const n=f.n;let R={},extra="",loot=[];
 if(f.o.mode==="tower")({R,extra,loot}=towerWin(f,n));else if(f.o.mode==="arena")({R,extra,loot}=arenaWin(f,n));else({R,extra,loot}=eventWin(f,n));
 give(R);xpTeam(n);bump("wins");bump("battles");loot=giveLoot(loot);
 f.report=rewardPanel(R,extra,loot)+missHTML(f.snap);log("Victoire · "+f.zone+" : "+fmt(R));save();render()};
function settleLose(){const f=fight;f.settled=true;ens();bump("battles");let t="Défaite : aucune récompense.";
 if(f.o.mode==="arena"){const d=ARENA_D[f.o.d],lo=d[2];S.arena.r=Math.max(0,S.arena.r+lo);S.arena.losses++;S.arena.log.unshift("❌ "+f.o.team+" ("+lo+")");S.arena.log.length=Math.min(8,S.arena.log.length);S.arena.opp=null;t="Défaite : "+lo+" points de classement."}
 if(f.o.mode==="tower")t="Défaite à l'étage "+S.tower.floor+" : réessaie après avoir renforcé ton équipe (équipement, éveil, compétences).";
 f.report=`<div class="panel tiny muted">${t}</div>`+missHTML(f.snap);log("Défaite · "+f.zone);save()}
/* ---- TOUR INFINIE ---- */
const TMILE=[[10,{tickets:2,stone:500}],[25,{tickets:3,crystal:5,essence:5}],[50,{tickets:5,crystal:10,essence:10},"epic"],[75,{tickets:6,amber:8,essence:12}],[100,{tickets:10,crystal:20,essence:20},"leg"],[150,{tickets:12,crystal:30,essence:30},"leg"],[200,{tickets:20,crystal:50,essence:50},"leg"],[300,{tickets:30,crystal:80,essence:80},"leg"]];
function towerWin(f,n){const fl=S.tower.floor,R={stone:40+9*fl,bone:1+rnd(3),hide:rnd(3)},boss=fl%10===0;let extra="";const loot=[];
 if(fl%5===0){R.essence=1+Math.floor(fl/25);R.crystal=1+Math.floor(fl/20)}if(boss){R.tickets=1+Math.floor(fl/50);R.amber=1+rnd(2)}
 if(fl>S.tower.best){S.tower.best=fl;R.stone+=20*fl;extra='<div class="tiny ok">Nouveau record : étage '+fl+' !</div>'}
 if(boss||Math.random()<.12)loot.push(rollItem(n,boss?1+(fl>=50?1:0):0));
 S.tower.floor=fl+1;bump("tower");if(boss)bump("bosses");return{R,extra,loot}}
function milePay(m){const R={...m[1]};let loot=[];give(R);if(m[2])loot.push(newItem(["w","a","c"][rnd(3)],m[2]==="leg"?3:2));return giveLoot(loot)}
function claimTower(fl){ens();const m=TMILE.find(x=>x[0]===fl);if(!m||S.tower.best<fl||S.tower.claimed[fl])return;S.tower.claimed[fl]=1;milePay(m);log("Tour : palier "+fl+" récupéré.");toast("Palier "+fl+" : "+fmt(m[1]));save();render()}
function renderTower(){const T=S.tower;$$("tower").innerHTML=`<div class="banner"><div class="eyebrow">TOUR INFINIE</div><h1>Étage ${T.floor}</h1><p>Aucune limite : chaque étage est plus dur que le précédent. Record : étage ${T.best}.</p><div class="heroDino">🗼</div></div>
 <div class="panel"><div class="row"><div class="bigicon">🗼</div><div class="grow"><b>Étage ${T.floor}</b><div class="muted tiny">${towerPreview(T.floor)} · équipe conseillée ~${Math.ceil(eqLv(T.floor)/2)+1}</div></div></div><button class="wide red" onclick="startBattle({mode:'tower'})">MONTER À L'ÉTAGE ${T.floor}</button><div class="muted tiny" style="margin-top:6px">Tous les 5 étages : cristaux et essences · tous les 10 : boss et objet d'équipement garanti.</div></div>
 <div class="sectionhead"><h2>Paliers de récompenses</h2></div>${TMILE.map(m=>{const ok=T.best>=m[0],c=T.claimed[m[0]];return `<div class="panel" style="margin:6px 0;padding:10px"><div class="row"><div class="grow"><b class="tiny">Étage ${m[0]}</b><div class="muted tiny">${fmt(m[1])}${m[2]?" + objet "+(m[2]==="leg"?"légendaire":"épique"):""}</div></div>${c?'<span class="tag">✅</span>':`<button style="padding:8px" ${ok?"":"disabled"} onclick="claimTower(${m[0]})">${ok?"RÉCUPÉRER":"🔒"}</button>`}</div></div>`}).join("")}`}
function towerPreview(fl){const m=[];if(fl%10===0)m.push("👹 Gardien");else{if(fl%7===0)m.push("Colosse");if(fl%5===0)m.push("Frénésie");if(fl%9===0)m.push("Régénérant")}return m.length?m.join(" · "):"Étage standard"}
/* ---- ARÈNE ---- */
const ARENA_D=[["Facile",-6,-8,1,14],["Équilibré",6,-12,2,22],["Redoutable",24,-18,3,34]];
const RANKS=[[0,"Bronze","🥉"],[1100,"Argent","🥈"],[1400,"Or","🥇"],[1700,"Platine","💠"],[2000,"Diamant","💎"],[2400,"Apex","👑"]];
const rankOf=r=>RANKS.filter(x=>r>=x[0]).pop();
const NAMES=["Kaïra","Brontos","Zéphyr","Mara","Ôrin","Titan","Luma","Rex Club","Néo","Safran","Bastien","Ysoline","Gorgo","Tamia","Vulcain","Ombre","Alizé","Pyro","Sélène","Drago"];
function arenaDay(){ens();const A=S.arena,d=new Date().toISOString().slice(0,10);if(A.day!==d){A.day=d;A.left=5}}
function arenaOpp(){arenaDay();const A=S.arena;if(A.opp)return A.opp;const keys=Object.keys(SPEC);A.opp=ARENA_D.map((d,i)=>({d:i,n:Math.max(3,Math.min(130,Math.round((A.r-700)/10+d[1]))),team:NAMES[rnd(NAMES.length)],sp:[0,1,2].map(()=>keys[rnd(keys.length)])}));return A.opp}
function arenaFight(i){arenaDay();const A=S.arena;if(A.left<=0){toast("Plus de combat aujourd'hui : reviens demain (5 par jour).");return}const o=arenaOpp()[i];if(!o)return;A.left--;save();startBattle({mode:"arena",go:true,...o})}
function arenaWin(f,n){const o=f.o,d=ARENA_D[o.d],A=S.arena;A.r+=d[4];A.best=Math.max(A.best,A.r);A.wins++;A.medals+=d[3];A.log.unshift("✅ "+o.team+" (+"+d[4]+")");A.log.length=Math.min(8,A.log.length);A.opp=null;bump("arena");
 const R={stone:30+6*n,essence:o.d>=1?1:0};const loot=[];if(Math.random()<.1+.1*o.d)loot.push(rollItem(n,o.d));
 return{R,extra:`<div class="tiny ok" style="margin-top:4px">Classement +${d[4]} · 🏅 +${d[3]}</div>`,loot}}
const AREN_SHOP=[{n:"🎟️ Ticket ×2",c:12,fx:()=>give({tickets:2})},{n:"🔮 Essence ×8",c:10,fx:()=>give({essence:8})},{n:"💎 Cristal ×3",c:15,fx:()=>give({crystal:3})},{n:"🧩 Fragments ×10",c:20,fx:()=>{S.shards+=10}},{n:"Objet épique",c:45,fx:()=>addItem(newItem(["w","a","c"][rnd(3)],2))},{n:"Objet légendaire",c:120,fx:()=>addItem(newItem(["w","a","c"][rnd(3)],3))}];
function buyArena(i){ens();const it=AREN_SHOP[i],A=S.arena;if(A.medals<it.c){toast("Il faut "+it.c+" 🏅");return}if(it.fx()===false)return;A.medals-=it.c;toast("Acheté : "+it.n);save();render()}
function board(){const wk=wkNow(),rv=NAMES.slice(0,9).map((nm,i)=>({n:nm,r:Math.round(850+((wk*37+i*173)%1200))}));rv.push({n:"Toi",r:S.arena.r,me:1});return rv.sort((a,b)=>b.r-a.r)}
function renderArena(){arenaDay();const A=S.arena,rk=rankOf(A.r),opp=arenaOpp(),pw=T3().reduce((s,d)=>s+power(d),0);
 $$("arena").innerHTML=`<div class="banner"><div class="eyebrow">ARÈNE</div><h1>${rk[2]} ${rk[1]} · ${A.r} pts</h1><p>Affronte des équipes d'IA. Gagne des points de classement et des médailles 🏅.</p><div class="heroDino">🏟️</div></div>
 <div class="panel"><div class="row"><div class="grow"><b>Combats restants aujourd'hui : ${A.left}/5</b><div class="muted tiny">Record ${A.best} pts · ${A.wins} victoires · ${A.losses} défaites · 🏅 ${A.medals} · Puissance de ton équipe ${pw}</div></div></div></div>
 <div class="sectionhead"><h2>Adversaires</h2></div>${opp.map((o,i)=>{const d=ARENA_D[o.d];return `<div class="panel"><div class="row"><div class="trio">${o.sp.map(k=>`<span>${art(SPEC[k].e)}</span>`).join("")}</div><div class="grow"><b>Équipe de ${esc(o.team)}</b><div class="muted tiny">${d[0]} · niv. équivalent ${o.n} · +${d[4]} / ${d[2]} pts · 🏅 +${d[3]}</div></div></div><button class="wide ${o.d===2?"red":o.d===1?"blue":"secondary"}" ${A.left<=0?"disabled":""} onclick="arenaFight(${i})">COMBATTRE</button></div>`}).join("")}
 <div class="sectionhead"><h2>Classement</h2><span class="muted tiny">rivaux simulés par l'IA, sur ton appareil</span></div><div class="panel">${board().map((x,i)=>`<div class="row tiny" style="padding:3px 0${x.me?";color:#ffd15c;font-weight:800":""}"><span style="width:24px">${i+1}.</span><span class="grow">${esc(x.n)}</span><span>${x.r}</span></div>`).join("")}</div>
 ${A.log.length?`<div class="panel tiny"><b>Derniers combats</b><br>${A.log.join("<br>")}</div>`:""}
 <div class="sectionhead"><h2>Boutique de l'arène</h2><span class="tag">🏅 ${A.medals}</span></div>${AREN_SHOP.map((it,i)=>`<div class="panel" style="margin:6px 0;padding:10px"><div class="row"><div class="grow"><b class="tiny">${it.n}</b></div><button style="padding:8px" ${A.medals>=it.c?"":"disabled"} onclick="buyArena(${i})">🏅 ${it.c}</button></div></div>`).join("")}`}
/* ---- ÉVÉNEMENTS HEBDOMADAIRES ---- */
const EVENTS=[{n:"Ruée des Os",e:"🦴",mat:"bone",el:"redorb",en:["💀","🦴","🐺"],d:"Les os pleuvent : matériaux 🦴 en abondance."},
 {n:"Marée de Cristal",e:"💎",mat:"crystal",el:"blueorb",en:["🧊","🦇","🐙"],d:"Cristaux et objets d'équipement rares."},
 {n:"Tempête d'Ambre",e:"🟠",mat:"amber",el:"purpleorb",en:["🐝","🦂","🕷️"],d:"L'ambre ruisselle dans le nid."},
 {n:"Chasse au Colosse",e:"🦣",mat:"hide",el:"greenorb",en:["🐗","🐃","🦏"],d:"Colosses du cuir et butin amélioré."}];
const EVT=[["Initié",20],["Maître",45],["Mythique",75]];
const EV_SHOP=[{n:"🎟️ Ticket ×3",c:20,lim:5,fx:()=>give({tickets:3})},{n:"🔮 Essence ×10",c:15,lim:5,fx:()=>give({essence:10})},{n:"🧩 Fragments ×15",c:25,lim:3,fx:()=>{S.shards+=15}},{n:"Objet épique",c:40,lim:3,fx:()=>addItem(newItem(["w","a","c"][rnd(3)],2))},{n:"Objet légendaire",c:130,lim:1,fx:()=>addItem(newItem(["w","a","c"][rnd(3)],3))}];
const EV_MILE=[[3,{tickets:2,stone:400}],[10,{tickets:4,crystal:6}],[25,{tickets:8,crystal:15,essence:12}]];
function evSync(){ens();const E=S.ev,w=wkNow();if(E.wk!==w){E.wk=w;E.tokens=0;E.clears=0;E.bought={};E.claimed={}}return E}
function eventWin(f,n){const E=evSync(),ev=EVENTS[wkNow()%EVENTS.length],t=f.o.t,R={stone:40*(t+1)+n},tk=[5,10,18][t];E.tokens+=tk;E.clears++;
 R[ev.mat]=6+8*t+rnd(4*t+3);R.essence=1+t;const loot=[];if(Math.random()<.35+.25*t||t===2)loot.push(rollItem(n,1+(ev.n==="Chasse au Colosse"||ev.n==="Marée de Cristal"?1:0)));bump("events");bump("dungeons");
 return{R,extra:`<div class="tiny ok" style="margin-top:4px">🎫 +${tk} jetons d'événement</div>`,loot}}
function buyEv(i){const E=evSync(),it=EV_SHOP[i];if(E.tokens<it.c){toast("Il faut "+it.c+" 🎫");return}if((E.bought[i]||0)>=it.lim){toast("Limite hebdomadaire atteinte.");return}if(it.fx()===false)return;E.tokens-=it.c;E.bought[i]=(E.bought[i]||0)+1;toast("Acheté : "+it.n);save();render()}
function claimEv(c){const E=evSync(),m=EV_MILE.find(x=>x[0]===c);if(!m||E.clears<c||E.claimed[c])return;E.claimed[c]=1;give({...m[1]});toast("Récompense d'événement : "+fmt(m[1]));save();render()}
function renderEvents(){const E=evSync(),ev=EVENTS[wkNow()%EVENTS.length],next=EVENTS[(wkNow()+1)%EVENTS.length];
 $$("events").innerHTML=`<div class="banner"><div class="eyebrow">ÉVÉNEMENT DE LA SEMAINE · ${wkLeft()} restants</div><h1>${ev.e} ${ev.n}</h1><p>${ev.d} Le contenu change chaque lundi (UTC).</p><div class="heroDino">${ev.e}</div></div>
 <div class="panel"><b>Jetons 🎫 ${E.tokens}</b><div class="muted tiny">${E.clears} épreuves réussies cette semaine · Prochain événement : ${next.e} ${next.n}</div></div>
 ${EVT.map((t,i)=>`<div class="panel"><div class="row"><div class="bigicon">${ev.e}</div><div class="grow"><b>${t[0]}</b><div class="muted tiny">niv. équivalent ${t[1]} · équipe conseillée ~${Math.ceil(t[1]/2)+1} · 🎫 +${[5,10,18][i]}</div></div></div><button class="wide ${i>1?"red":i?"blue":"secondary"}" onclick="startBattle({mode:'event',t:${i},wk:${wkNow()}})">${t[0].toUpperCase()}</button></div>`).join("")}
 <div class="sectionhead"><h2>Objectifs de la semaine</h2></div>${EV_MILE.map(m=>{const ok=E.clears>=m[0],c=E.claimed[m[0]];return `<div class="panel" style="margin:6px 0;padding:10px"><div class="row"><div class="grow"><b class="tiny">${m[0]} épreuves (${Math.min(E.clears,m[0])}/${m[0]})</b><div class="muted tiny">${fmt(m[1])}</div></div>${c?'<span class="tag">✅</span>':`<button style="padding:8px" ${ok?"":"disabled"} onclick="claimEv(${m[0]})">RÉCUPÉRER</button>`}</div></div>`}).join("")}
 <div class="sectionhead"><h2>Boutique d'événement</h2><span class="tag">🎫 ${E.tokens}</span></div>${EV_SHOP.map((it,i)=>{const b=E.bought[i]||0;return `<div class="panel" style="margin:6px 0;padding:10px"><div class="row"><div class="grow"><b class="tiny">${it.n}</b><div class="muted tiny">${b}/${it.lim} cette semaine</div></div><button style="padding:8px" ${E.tokens>=it.c&&b<it.lim?"":"disabled"} onclick="buyEv(${i})">🎫 ${it.c}</button></div></div>`}).join("")}`}
/* ---- rendu, missions ---- */
const _r8=render;render=function(){_r8();if(screen==="tower")renderTower();if(screen==="arena")renderArena();if(screen==="events")renderEvents()};
[["tower","étages de la Tour",[5,20,50,100]],["arena","victoires en Arène",[3,15,50]],["events","épreuves d'événement",[5,20,60]]].forEach(([t,l,gs])=>gs.forEach((g,i)=>PERM.push({id:"p_"+t+g,t,g,n:g+" "+l,r:{tickets:i+1,crystal:i+1,stone:100*(i+1)}})));
DAILY.push({id:"d_tower",t:"tower",g:3,n:"Monter 3 étages de la Tour",r:{stone:120,crystal:1}},{id:"d_arena",t:"arena",g:2,n:"Gagner 2 combats d'Arène",r:{essence:3,stone:100}});
go(screen);
