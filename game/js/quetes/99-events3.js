/* Événements II (0.38) : calendrier des 4 prochaines semaines, événements spéciaux datés (Halloween, Noël, Invasion, œufs dorés,
   pêche, course, Migration, Éclipse, Âge de glace, Volcan, Nostalgie), défis du week-end, mission de lancement de version,
   boss d'événement avec classement personnel, boutique d'événement tournante (jetons de fête 🎉), récompense de participation,
   jetons de la semaine convertis au lieu d'être perdus, notification et bandeau animé sur l'accueil. État : S.ev3.
   Sous un navigateur automatisé, aucun événement spécial n'est actif sauf window.__forceEv="clé" (tests déterministes). */
const SPEV=[{k:"halloween",i:"🎃",n:"Halloween",d:"Des dinos squelettes hantent l'histoire. Jetons de fête doublés.",on:(m,d)=>(m===9&&d>=25)||(m===10&&d<=2)},
 {k:"noel",i:"🎄",n:"Noël des neiges",d:"Des créatures des neiges envahissent l'île. Un cadeau chaque jour.",on:(m,d)=>(m===11&&d>=15)||(m===0&&d<=2)},
 {k:"invasion",i:"👾",n:"Invasion",d:"10 niveaux d'histoire sont envahis : rejoue-les pour les libérer.",on:(m,d)=>d>=1&&d<=4},
 {k:"eclipse",i:"🌑",n:"Éclipse",d:"Tous les ennemis sont des Ombres (+10 % ATQ) ; +20 % d'essence.",on:(m,d)=>d>=7&&d<=9},
 {k:"goldegg",i:"🥚",n:"Chasse aux œufs dorés",d:"Les victoires rapportent des œufs dorés : 10, 25 et 50 donnent des récompenses.",on:(m,d)=>d>=10&&d<=14},
 {k:"fishing",i:"🎣",n:"Grande pêche",d:"Les prises rapportent le double et des jetons de fête.",on:(m,d)=>d>=15&&d<=17},
 {k:"race",i:"🏁",n:"Course contre la montre",d:"Termine un Sprint le plus vite possible : récompenses sous 3 et 2 minutes.",on:(m,d)=>d>=18&&d<=19},
 {k:"iceage",i:"🧊",n:"Âge de glace",d:"La toundra recouvre toute l'île (décor) ; les orbes 💧 frappent 15 % plus fort.",on:(m,d)=>d>=20&&d<=22},
 {k:"volcano",i:"🌋",n:"Éveil des volcans",d:"Les dégâts de feu (orbes 🔥 et ennemis de feu) sont multipliés par 1,5.",on:(m,d)=>d>=25&&d<=27},
 {k:"migration",i:"🦬",n:"Grande migration",d:"Les dinos corrompus et les bêtes s'apprivoisent bien plus facilement.",on:(m,d)=>d>=28},
 {k:"nostalgia",i:"📼",n:"Nostalgie",d:"L'événement de la semaine dernière revient pour deux jours.",on:(m,d)=>d>=5&&d<=6}];
function evAct(k){if(typeof navigator!=="undefined"&&navigator.webdriver)return window.__forceEv===k||(Array.isArray(window.__forceEv)&&window.__forceEv.includes(k));const t=new Date(),E=SPEV.find(x=>x.k===k);return!!E&&E.on(t.getMonth(),t.getDate())}
const evActive=()=>SPEV.filter(e=>evAct(e.k));
const _ensE3=ens;ens=function(){_ensE3();let E=S.ev3;if(!E||typeof E!=="object")E=S.ev3={};if(!(E.tok>=0))E.tok=0;for(const k of ["seen","best","eggC","shop"])if(!E[k]||typeof E[k]!=="object")E[k]={};if(!(E.eggs>=0))E.eggs=0;
 const mo=todayK().slice(0,7);if(E.eggMo!==mo){E.eggMo=mo;E.eggs=0;E.eggC={}}if(!E.inv||E.inv.mo!==mo)E.inv={mo,lv:[],freed:{}};const w=wkNow();if(E.shop.wk!==w)E.shop={wk:w,b:{}};
 if(E.ver!==ARK_VERSION){E.ver=ARK_VERSION;E.verDay=todayK();E.launch={base:(S.cnt||{}).wins||0,done:0}}};
const evTok=n=>{ens();const m=evAct("halloween")?2:1;S.ev3.tok+=n*m};
/* ---- jetons de la semaine convertis au lieu d'être perdus ---- */
if(typeof evSync==="function"){const _esE3=evSync;evSync=function(){const E=S.ev||{},old=E.wk,left=E.tokens||0;const r=_esE3();try{if(old!==undefined&&old!==-1&&old!==r.wk&&left>0){ens();S.ev3.tok+=left;S.ev3.conv=(S.ev3.conv||0)+left;toast("🎉 Tes "+left+" jetons de la semaine dernière deviennent des jetons de fête.",3200)}}catch(e){}return r}}
/* ---- effets en combat ---- */
const _rbE3=renderBattle;renderBattle=function(){const f=fight;if(f&&f.mx&&!f.over&&f.enemies&&f.e3O!==f.o){f.e3O=f.o;const m=f.o&&f.o.mode||"story",norm=/^(story|dungeon|far|nightmare|region)$/.test(m)&&!(f.o&&(f.o.daily||f.o.raid))&&!f.raid;
  if(norm){if(evAct("halloween"))f.enemies.forEach((e,i)=>{if(i<2&&!e.boss&&!e._nm&&Math.random()<.5){e.e=Math.random()<.5?"💀":"🦴";e.name="Halloween · Ennemi"}});
   if(evAct("noel"))f.enemies.forEach((e,i)=>{if(i<2&&!e.boss&&!e._nm&&Math.random()<.5){e.e="⛄";e.name="Neige · Ennemi"}});
   if(evAct("eclipse"))f.enemies.forEach(e=>{e.atk=Math.round(e.atk*1.1);e.ecl=1})}}
 _rbE3();const g=fight,st=document.querySelector("#battleArea .battlestage");if(!g||!st)return;[["eclipse","ev-ecl"],["iceage","ev-ice"],["volcano","ev-vol"],["halloween","ev-hal"],["noel","ev-noel"]].forEach(([k,c])=>{if(evAct(k))st.classList.add(c)})};
const _atE3=atkOf;atkOf=function(k){let v=_atE3(k);const f=fight;if(f&&f._tap){if(evAct("volcano")&&f._tap==="redorb")v*=1.5;if(evAct("iceage")&&f._tap==="blueorb")v*=1.15}return v};
const _hdE3=hitDino;hitDino=function(k,raw,e){if(evAct("volcano")&&e&&e.el==="redorb")raw*=1.5;return _hdE3(k,raw,e)};
let E3_WIN=false,E3_FISH=false;
const _giveE3=give;give=function(r){if(E3_WIN&&r&&r.essence>0&&evAct("eclipse"))r.essence=Math.round(r.essence*1.2);if(E3_FISH&&r)for(const k in r)if(r[k]>0)r[k]*=2;return _giveE3(r)};
/* ---- victoires : jetons, œufs dorés, invasion, défis du week-end, mission de lancement ---- */
const _winE3=win;win=function(){const f=fight,was=f&&f.over;E3_WIN=true;try{_winE3()}finally{E3_WIN=false}if(!f||was||f.over!=="win")return;try{ens();const E=S.ev3,act=evActive();if(act.length)evTok(2);
 if(evAct("goldegg")){const n=(f.enemies[2]&&f.enemies[2].boss?2:0)+(Math.random()<.4?1:0);if(n){E.eggs+=n;f.log+=" · 🥚 +"+n+" œuf(s) doré(s)"}}
 if(evAct("invasion")&&f.o&&f.o.mode==="story"&&E.inv.lv.includes(f.n)&&!E.inv.freed[f.n]){E.inv.freed[f.n]=1;give({essence:10});evTok(3);f.log+=" · 👾 Niveau libéré de l'invasion !";if(E.inv.lv.every(n=>E.inv.freed[n])){give({tickets:5,shards:15});toast("👾 Invasion repoussée : +5 🎟️ +15 🧩",3600)}}
 if(evAct("race")&&f.o&&f.o.mode==="sprint"&&(f.o.k||0)===9&&typeof S.m2!=="undefined"){const t=Date.now()-S.m2.sprT0,b=E.best.race||Infinity;if(t<b)E.best.race=t;if(t<180000&&!E.raceA){E.raceA=1;give({tickets:2})}if(t<120000&&!E.raceB){E.raceB=1;give({tickets:4,shards:10})}}
 save()}catch(e){}};
/* récompense de participation : une défaite pendant un événement rapporte quand même un jeton */
const _rbE3b=renderBattle;renderBattle=function(){_rbE3b();const f=fight;if(f&&f.over==="lose"&&!f.e3Lose&&evActive().length){f.e3Lose=1;evTok(1);save()}};
/* invasion : 10 niveaux déjà terminés choisis au début du mois */
function invPick(){ens();const I=S.ev3.inv;if(I.lv.length||(S.stage||0)<5)return;const L=[];for(let n=1;n<=Math.min(100,S.stage);n++)L.push(n);L.sort((a,b)=>hashS("inv"+I.mo+a)-hashS("inv"+I.mo+b));I.lv=L.slice(0,10).sort((a,b)=>a-b);save()}
const _rsE3=renderStory;renderStory=function(){_rsE3();try{if(!evAct("invasion")||(typeof nmView!=="undefined"&&nmView))return;invPick();const I=S.ev3.inv;document.querySelectorAll("#chapters .smap .mnode").forEach(b=>{const m=/n:(\d+)/.exec(b.getAttribute("onclick")||"");if(m&&I.lv.includes(+m[1])&&!I.freed[+m[1]])b.classList.add("ev3inv")})}catch(e){}};
/* œufs dorés */
const EGGT=[[10,{tickets:2}],[25,{essence:60,shards:15}],[50,{tickets:8,amber:5}]];
function eggClaim(n){ens();const T=EGGT.find(x=>x[0]===n),E=S.ev3;if(!T||E.eggC[n]||E.eggs<n)return;E.eggC[n]=1;give(T[1]);save();toast("🥚 "+n+" œufs dorés : "+fmt(T[1]),2600);render()}
/* pêche */
if(typeof fishAct==="function"){const _faE3=fishAct;fishAct=function(){const bite=typeof FISHING!=="undefined"&&FISHING&&FISHING.st==="bite";E3_FISH=bite&&evAct("fishing");try{return _faE3()}finally{if(E3_FISH)evTok(2);E3_FISH=false}}}
/* migration : apprivoisement facilité */
if(typeof TAME!=="undefined"){const T0={...TAME};setInterval(()=>{try{if(evAct("migration")){TAME.p=.9;TAME.cost=15;TAME.day=6}else Object.assign(TAME,T0)}catch(e){}},1000)}
/* nostalgie : l'événement de la semaine dernière */
const _meE3=MODES.event;MODES.event=function(o){if(o&&o.nost){const prev=EVENTS[(wkNow()-1+EVENTS.length*99)%EVENTS.length],t=EVT[o.t]||EVT[0],n=t[1];return{eq:n,label:"Nostalgie · "+prev.n+" · "+t[0],enemies:mkEnemies(n,{emo:prev.en,name:prev.n,el:prev.el,boss:true,hp:1+.1*o.t,atk:1})}}return _meE3(o)};
/* ---- boss d'événement : 10 tours, score = dégâts, classement personnel ---- */
const EVB_T=10;
MODES.evboss=function(o){const eq=typeof m2Eq==="function"?m2Eq()+6:30,E=evActive()[0]||{i:"🎪",n:"Fête"};const en=[0,1].map(()=>({hp:0,max:1,e:"🦴",name:"—",el:"redorb",atk:1})).concat([{hp:9e6,max:9e6,e:"👹",name:"Boss d'événement · "+E.n,el:EL[rnd(3)],atk:Math.round(A(eq)*1.3),boss:true,tr:"",_nm:1}]);return{eq,label:E.i+" Boss d'événement · "+E.n,enemies:en}};
const _sbE3=startBattle;startBattle=function(o){const r=_sbE3(o);const f=fight;if(f&&f.o&&f.o.mode==="evboss"&&!f.ebSet){f.ebSet=1;f.wave=2;f._lw=undefined;f.ebT=0;document.querySelectorAll("#fxLayer .wavebn").forEach(x=>x.remove());renderBattle()}return r};
const _etE3=enemyTurn;enemyTurn=function(){const f=fight;const r=_etE3();if(f&&f.o&&f.o.mode==="evboss"&&!f.over){f.ebT=(f.ebT||0)+1;if(f.ebT>=EVB_T){f.over="lose";f.log+=" · ⏱️ Temps écoulé !";if(!f.settled)settleLose()}}return r};
const _slE3=settleLose;settleLose=function(){const f=fight;_slE3();if(!f||!f.o||f.o.mode!=="evboss")return;ens();const e=f.enemies[2],sc=Math.max(0,e.max-Math.max(0,e.hp)),key=(evActive()[0]||{k:"fete"}).k,L=S.ev3.best[key]=(S.ev3.best[key]||[]);L.push({s:sc,t:Date.now()});L.sort((a,b)=>b.s-a.s);L.length=Math.min(10,L.length);
 const rank=L.findIndex(x=>x.s===sc)+1;evTok(Math.min(20,3+Math.floor(sc/20000)));save();f.report=`<div class="panel"><b>🏆 Boss d'événement : ${sc.toLocaleString("fr-FR")} dégâts</b><div class="tiny muted">Ton classement personnel : ${rank}${rank===1?"er":"e"} sur ${L.length}.</div></div>`};
const _rbE3c=renderBattle;renderBattle=function(){_rbE3c();const f=fight;if(!f||!f.o||f.o.mode!=="evboss"||f.over)return;const ch=document.querySelector("#battleArea .sHud .fchips");if(ch&&!ch.querySelector(".ebt"))ch.insertAdjacentHTML("beforeend",`<span class="chip hot ebt">⏱️ ${EVB_T-(f.ebT||0)} tours · ⚔ ${Math.max(0,f.enemies[2].max-f.enemies[2].hp).toLocaleString("fr-FR")}</span>`)};
if(typeof chainNext==="function"){const _cnE3=chainNext;chainNext=function(f){return f&&f.o&&f.o.mode==="evboss"?null:_cnE3(f)}}
/* ---- défis du week-end, mission de lancement, cadeau de Noël ---- */
const wkendKey=()=>{const t=new Date(),g=t.getDay();if(g!==0&&g!==6)return"";const s=new Date(t.getTime()-(g===0?1:0)*864e5);return s.toISOString().slice(0,10)};
function wkendInfo(){ens();const k=wkendKey();if(!k)return null;const E=S.ev3;if(!E.wkend||E.wkend.k!==k)E.wkend={k,w:(S.cnt||{}).wins||0,b:(S.cnt||{}).bosses||0,c:{}};const c=S.cnt||{};return{W:E.wkend,wins:(c.wins||0)-E.wkend.w,boss:(c.bosses||0)-E.wkend.b}}
const WKG=[["wins","Gagner 15 combats ce week-end",15,{tickets:3,essence:20}],["boss","Vaincre 3 boss ce week-end",3,{tickets:3,shards:10}]];
function wkendClaim(k){const I=wkendInfo();if(!I)return;const G=WKG.find(g=>g[0]===k);if(!G||I.W.c[k]||I[k]<G[2])return;I.W.c[k]=1;give(G[3]);save();toast("📅 Défi du week-end réussi : "+fmt(G[3]),2600);render()}
const launchOn=()=>{try{return(Date.parse(todayK())-Date.parse(S.ev3.verDay))/864e5<3}catch(e){return false}};
function launchClaim(){ens();const L=S.ev3.launch;if(!L||L.done||((S.cnt||{}).wins||0)-L.base<5)return;L.done=1;give({tickets:5,essence:30});save();toast("🚀 Mission de lancement réussie : +5 🎟️ +30 🔮",3000);render()}
function noelGift(){ens();if(!evAct("noel")||S.ev3.noel===todayK())return;S.ev3.noel=todayK();give({tickets:1,essence:15});evTok(3);save();toast("🎁 Cadeau de Noël : +1 🎟️ +15 🔮 +3 🎉",3000);render()}
/* ---- boutique d'événement tournante ---- */
const E3SHOP=[["Ticket",{tickets:1},8],["Ticket de variante garantie",{_vt:1},30],["Essence",{essence:25},6],["Ambre",{amber:3},10],["Accessoire : couronne",{_acc:"crown"},15],["Accessoire : écharpe",{_acc:"scarf"},12],["Fragments",{shards:10},10],["Gemme au hasard",{_gem:1},14]];
const e3Offers=()=>{const w=wkNow();return[0,1,2,3].map(i=>(w*4+i*3)%E3SHOP.length).filter((v,i,a)=>a.indexOf(v)===i)};
function e3Buy(i){ens();const O=E3SHOP[i];if(!O||!e3Offers().includes(i)||S.ev3.shop.b[i])return;if(S.ev3.tok<O[2]){toast("Il faut "+O[2]+" 🎉.");return}S.ev3.tok-=O[2];S.ev3.shop.b[i]=1;const G=O[1];
 if(G._vt){S.ga2&&(S.ga2.vt=(S.ga2.vt||0)+1)}else if(G._acc){S.col2&&(S.col2.acc[G._acc]=1)}else if(G._gem){if(S.g2){const k=["ruby","sapph","emer","topaz"][rnd(4)];S.g2.gems[k]=(S.g2.gems[k]||0)+1}}else give(G);save();toast("🎉 "+O[0]+" obtenu !",2200);render()}
function e3Convert(){ens();if(S.ev3.tok<10){toast("Il faut 10 🎉.");return}S.ev3.tok-=10;give({tickets:1});save();toast("🎉 10 jetons → 1 🎟️",1800);render()}
/* ---- écran des événements : calendrier, spéciaux, boutique ---- */
function e3Cal(){const out=[];for(let i=0;i<4;i++){const w=wkNow()+i,E=EVENTS[w%EVENTS.length];out.push(`<div class="e3w ${i?"":"on"}"><small>${i?"dans "+i+" sem.":"cette semaine"}</small><b>${esc(E.n)}</b></div>`)}const sp=[];const t=new Date();for(let d=0;d<28;d++){const x=new Date(t.getTime()+d*864e5);SPEV.forEach(e=>{if(e.on(x.getMonth(),x.getDate())&&!sp.some(s=>s.k===e.k))sp.push({k:e.k,i:e.i,n:e.n,d})})}
 return `<div class="panel e3cal"><b>📅 Calendrier des 4 prochaines semaines</b><div class="e3ws">${out.join("")}</div><div class="tiny">${sp.map(s=>`<span class="chip">${s.i} ${esc(s.n)} ${s.d?"dans "+s.d+" j":"aujourd'hui"}</span>`).join(" ")||"Aucun événement spécial dans les 28 jours."}</div></div>`}
function e3Panel(){ens();const E=S.ev3,act=evActive(),W=wkendInfo();let h=e3Cal();
 h+=`<div class="panel e3act"><b>🎉 Événements spéciaux en cours</b> <span class="chip">${E.tok} 🎉 jetons de fête</span>${act.length?act.map(e=>`<div class="e3e"><span>${e.i}</span><div><b>${esc(e.n)}</b><div class="tiny">${esc(e.d)}</div></div></div>`).join(""):'<div class="tiny muted">Aucun pour l\'instant : regarde le calendrier.</div>'}
  ${act.length?`<button class="wide red e3boss" onclick="fight=null;startBattle({mode:'evboss'})">🏆 BOSS D'ÉVÉNEMENT (10 tours · record : ${((E.best[(act[0]||{}).k]||[])[0]||{s:0}).s.toLocaleString("fr-FR")})</button>`:""}
  ${evAct("goldegg")?`<div class="tiny">🥚 Œufs dorés : ${E.eggs} ${EGGT.map(([n,R])=>`<button class="${E.eggC[n]?"secondary":E.eggs>=n?"blue":"secondary"}" ${!E.eggC[n]&&E.eggs>=n?"":"disabled"} onclick="eggClaim(${n})">${n} : ${fmt(R)}</button>`).join(" ")}</div>`:""}
  ${evAct("invasion")?(invPick(),`<div class="tiny">👾 Invasion : ${Object.keys(E.inv.freed).length}/${E.inv.lv.length} niveaux libérés (${E.inv.lv.filter(n=>!E.inv.freed[n]).join(", ")||"tous !"})</div>`):""}
  ${evAct("noel")&&E.noel!==todayK()?'<button class="blue" onclick="noelGift()">🎁 CADEAU DE NOËL DU JOUR</button>':""}
  ${evAct("nostalgia")?`<div class="tiny">📼 ${esc(EVENTS[(wkNow()-1+EVENTS.length*99)%EVENTS.length].n)} revient :</div><div class="btns">${EVT.map((t,i)=>`<button class="secondary" onclick="fight=null;startBattle({mode:'event',t:${i},wk:wkNow(),nost:1,go:true})">${t[0]}</button>`).join("")}</div>`:""}
  ${evAct("race")?`<div class="tiny">🏁 Meilleur Sprint pendant la course : ${E.best.race?sprFmt(E.best.race):"—"} (sous 3 min : +2 🎟️ · sous 2 min : +4 🎟️ +10 🧩)</div>`:""}</div>`;
 if(W)h+=`<div class="panel e3wk"><b>📅 Défis du week-end</b>${WKG.map(([k,n,g,R])=>`<div class="p2goal"><div class="grow">${esc(n)} <span class="tiny muted">${Math.min(g,W[k])}/${g} · ${fmt(R)}</span></div>${W.W.c[k]?"✅":`<button class="${W[k]>=g?"blue":"secondary"}" ${W[k]>=g?"":"disabled"} onclick="wkendClaim('${k}')">OK</button>`}</div>`).join("")}</div>`;
 if(launchOn()&&E.launch&&!E.launch.done){const p=Math.min(5,((S.cnt||{}).wins||0)-E.launch.base);h+=`<div class="panel e3launch"><b>🚀 Mission de lancement de la version ${esc(ARK_VERSION)}</b><div class="tiny">Gagne 5 combats pendant les 3 jours qui suivent la mise à jour (${p}/5) : +5 🎟️ +30 🔮.</div><button class="${p>=5?"blue":"secondary"}" ${p>=5?"":"disabled"} onclick="launchClaim()">RÉCLAMER</button></div>`}
 h+=`<div class="panel e3shop"><b>🛍️ Boutique d'événement (change chaque semaine)</b> <span class="chip">${E.tok} 🎉</span><div class="c2row">${e3Offers().map(i=>{const O=E3SHOP[i];return `<button class="${E.shop.b[i]?"secondary":"blue"}" ${E.shop.b[i]?"disabled":""} onclick="e3Buy(${i})">${esc(O[0])} · ${O[2]} 🎉${E.shop.b[i]?" ✅":""}</button>`}).join("")}<button class="secondary" onclick="e3Convert()">10 🎉 → 1 🎟️</button></div><div class="tiny muted">Les jetons de fête ne se perdent pas ; les jetons de la semaine non dépensés deviennent des jetons de fête.</div></div>`;return h}
const _reE3=renderEvents;renderEvents=function(){_reE3();const el=$$("events");if(!el)return;const b=el.querySelector(".banner");const h=`<div id="e3box">${e3Panel()}</div>`;if(b)b.insertAdjacentHTML("afterend",h);else el.insertAdjacentHTML("afterbegin",h)};
/* ---- accueil : bandeau animé et notification ---- */
const _rE3=render;render=function(){_rE3();try{ens();const act=evActive();act.forEach(e=>{if(S.ev3.seen[e.k]!==todayK().slice(0,7)){S.ev3.seen[e.k]=todayK().slice(0,7);toast(e.i+" Événement : "+e.n+" commence !",3600);save()}});
 if(screen!=="home")return;const old=document.getElementById("e3Home");if(old)old.remove();if(!act.length)return;const ref=document.querySelector("#home .banner");if(ref)ref.insertAdjacentHTML("afterend",`<div class="panel e3home" id="e3Home" onclick="go('events')"><div class="e3marq">${act.map(e=>`<span>${e.i} ${esc(e.n)} — ${esc(e.d)}</span>`).join("")}</div></div>`)}catch(e){}};
ACH.push(["ev3a","Fêtard","Gagner 100 jetons de fête au total",()=>((S.ev3||{}).tok||0)+((S.cnt||{}).e3spent||0),100,{tickets:5}],["ev3b","Libérateur","Repousser une invasion",()=>{try{const I=S.ev3.inv;return I.lv.length&&I.lv.every(n=>I.freed[n])?1:0}catch(e){return 0}},1,{tickets:3,essence:30}],["ev3c","Chasseur d'œufs","Trouver 50 œufs dorés",()=>((S.ev3||{}).eggs||0),50,{tickets:4}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Événements spéciaux","En plus de l'événement de la semaine, des événements datés reviennent chaque mois (Invasion du 1er au 4, Nostalgie les 5-6, Éclipse du 7 au 9, œufs dorés du 10 au 14, Grande pêche du 15 au 17, Course les 18-19, Âge de glace du 20 au 22, Volcans du 25 au 27, Migration à partir du 28), plus Halloween et Noël. Écran Événements : calendrier, boss d'événement (record personnel), défis du week-end, mission de lancement, boutique de jetons de fête 🎉 (gagnés en combattant pendant un événement, même en cas de défaite)."]);
