/* Navigation épurée : 5 onglets + sous-onglets ; nouvelles activités (Défi du jour, Fouilles) ; « À faire aujourd'hui » */
const todayK=()=>new Date().toISOString().slice(0,10),dayHash=s=>hashS(s||todayK());
const _ens99n=ens;ens=function(){_ens99n();const t=todayK();S.dch=S.dch||{day:"",done:false,streak:0,last:""};if(S.dch.day!==t){S.dch.day=t;S.dch.done=false}S.dig=S.dig||{day:"",picks:3,bought:0,open:{}};if(S.dig.day!==t){S.dig={day:t,picks:3,bought:0,open:{}}}};
/* ---------- groupes d'onglets ---------- */
const GRP={
 home:{sub:[["main","🏠","Accueil"],["profile","👤","Profil"]]},
 team:{sub:[["pack","🦖","Meute"],["up","🧬","Améliorer"],["bag","🎒","Sac"],["dex","📖","Bestiaire"]]},
 adv:{screens:[["story","📜","Histoire"],["dungeon","🕳️","Donjons"],["tower","🗼","Tour"],["arena","🏟️","Arène"],["events","🎪","Événements"]]},
 summon:{sub:[["ban","⭐","Bannières"],["bonus","🎡","Bonus"],["shop","🧩","Boutique"]]},
 quest:{screens:[["missions","📋","Missions"],["daily","⚔️","Défi"],["dig","⛏️","Fouilles"],["exped","🧭","Expéditions"],["achs","🏅","Succès"]]}};
const SCR2G={home:"home",team:"team",summon:"summon",battle:"adv"};Object.entries(GRP).forEach(([g,v])=>(v.screens||[]).forEach(s=>SCR2G[s[0]]=g));
const SUBSEL={home:{profile:["Journal d'exp","Profil","Sauvegarde"],ids:{feed:"profile",profileBox:"profile"},cls:{savebox:"profile"}},
 team:{ids:{forgeBox:"up",evoBox:"up",bagBox:"bag",colTools:"pack",presetBox:"pack",collection:"pack"}},
 summon:{ids:{gachaX:"ban",gachaZ:"bonus",gachaY:"shop",dropRates:"ban",summonResult:"ban"}}};
let subOn={home:"main",team:"pack",summon:"ban"},lastQuest="missions";
function markSubs(scr){const el=document.getElementById(scr),cfg=SUBSEL[scr];if(!el||!cfg)return;let cur="main";const kids=[...el.children];
 kids.forEach((c,i)=>{if(c.classList.contains("banner")){c.dataset.sub="*";return}let s=cfg.ids&&cfg.ids[c.id];if(!s&&cfg.cls)for(const k in cfg.cls)if(c.classList.contains(k))s=cfg.cls[k];
  if(!s&&c.classList.contains("sectionhead")){const t=c.textContent;if(scr==="home")s=/Journal|Profil|Sauvegarde/.test(t)?"profile":"main";if(scr==="summon")s=/Taux|Autres/.test(t)?"ban":"ban"}
  if(!s){const nx=kids[i-1];s=scr==="summon"?(nx&&nx.dataset.sub&&nx.dataset.sub!=="*"?nx.dataset.sub:"ban"):scr==="home"?"main":(GRP[scr].sub[0][0])}
  if(scr==="home"&&c.id==="todoBox")s="main";c.dataset.sub=s});
 const on=subOn[scr];kids.forEach(c=>c.classList.toggle("subhide",c.dataset.sub!=="*"&&c.dataset.sub!==on));
 if(scr==="team"){const ct=$$("colTools");if(ct)ct.classList.remove("subhide");if(on==="dex"){ct.dataset.sub="dex"}else if(on!=="pack"&&ct)ct.classList.add("subhide")}}
function subSet(scr,k){subOn[scr]=k;if(scr==="team"){const want=k==="dex";if(colF.book!==want){colF.book=want}}render();navUpdate();window.scrollTo(0,0)}
function grpOf(s){return SCR2G[s]||null}
function badge(k){try{ens();switch(k){case"missions":return claimable();case"daily":return S.dch.done?0:1;case"dig":return S.dig.picks;case"exped":return S.exp.slots.filter(x=>x&&xLeft(x)===0).length;case"achs":return achReady();case"bonus":return S.wheel&&S.wheel.free?1:0;case"ban":return S.freeDay!==todayStr()?1:0;case"main":return 0}}catch(e){}return 0}
function navUpdate(){const g=grpOf(screen),sn=$$("subnav");if(!sn)return;const G=GRP[g];
 if(!G||screen==="battle"){sn.classList.add("hide");}else{sn.classList.remove("hide");
  const items=G.screens?G.screens.map(([k,i,l])=>({on:screen===k,i,l,b:badge(k),js:`go('${k}')`})):G.sub.map(([k,i,l])=>({on:subOn[g]===k,i,l,b:badge(k),js:`subSet('${g}','${k}')`}));
  sn.innerHTML=`<div class="snwrap">${items.map(x=>`<button class="${x.on?"on":""}" onclick="${x.js}"><span>${x.i}</span>${x.l}${x.b?`<i class="nb">${x.b>9?"9+":x.b}</i>`:""}</button>`).join("")}</div>`}
 document.querySelectorAll(".bottomnav button").forEach(b=>{const bg=b.dataset.grp||({home:"home",team:"team",summon:"summon",missions:"quest"})[b.dataset.screen];b.classList.toggle("active",bg===g)});
 document.querySelectorAll('.bottomnav [data-grp="adv"] i.dot').forEach(x=>x.remove());const qb=document.querySelector('.bottomnav [data-screen="missions"]');if(qb){const n=["missions","daily","dig","exped","achs"].reduce((a,k)=>a+(k==="dig"?0:badge(k)),0);qb.dataset.grp="quest";qb.innerHTML=`<span>🎯</span>Quêtes${n?`<b class="dot">${n>9?"9+":n}</b>`:""}`}}
SUBS.length=0;GRP.adv.screens.forEach(x=>SUBS.push(x));ADV.delete("exped");ADV.delete("achs");
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="daily" class="screen"></section><section id="dig" class="screen"></section>');
document.querySelector(".bottomnav").addEventListener("click",e=>{const b=e.target.closest('[data-screen="missions"]');if(b){e.stopImmediatePropagation();go(lastQuest)}},true);
const _go99n=go;go=function(s){if(GRP.quest.screens.some(x=>x[0]===s))lastQuest=s;_go99n(s);if(SUBSEL[s])markSubs(s);navUpdate()};
const _r99n=render;render=function(){_r99n();ens();if(screen==="home")todoRender();if(SUBSEL[screen])markSubs(screen);if(screen==="daily")renderDaily();if(screen==="dig")renderDig();if(screen==="missions")tidyMissions();try{bannerScenes()}catch(e){}navUpdate()};
BZONE.daily=()=>stageZone(zoneOf(dchInfo().n)[0]);BZONE.dig=()=>"jungle";
/* ---------- missions épurées ---------- */
let showDone=false;
function tidyMissions(){const el=$$("missions");if(!el)return;const rows=[...el.querySelectorAll(":scope>.panel")];let hid=0;rows.forEach(p=>{const done=!!p.querySelector(".tag");p.classList.toggle("subhide",done&&!showDone);if(done)hid++});
 if(hid&&!el.querySelector("#doneTog"))el.insertAdjacentHTML("beforeend",`<button id="doneTog" class="wide secondary" onclick="showDone=!showDone;render()">${showDone?"MASQUER":"AFFICHER"} LES ${hid} MISSIONS TERMINÉES</button>`)}
/* ---------- À faire aujourd'hui ---------- */
function todoItems(){ens();const L=[];const add=(i,t,js,n)=>L.push({i,t,js,n});
 if(S.login&&S.login.ready)add("📅","Récompense de connexion à récupérer","go('home');document.getElementById('loginBox').scrollIntoView({behavior:'smooth'})");
 if(S.freeDay!==todayStr())add("🎁","Tirage gratuit disponible","go('summon');subSet('summon','ban')");
 if(S.wheel&&S.wheel.free)add("🎡","Tour de roue gratuit","go('summon');subSet('summon','bonus')");
 const c=claimable();if(c)add("📋",c+" mission(s) à récupérer","go('missions')",c);
 if(!S.dch.done)add("⚔️","Défi du jour à relever","go('daily')");
 if(S.dig.picks>0)add("⛏️",S.dig.picks+" pioche(s) de fouille","go('dig')");
 const er=S.exp.slots.filter(x=>x&&xLeft(x)===0).length,ef=S.exp.slots.filter(x=>!x).length;if(er)add("🧭",er+" expédition(s) terminée(s)","go('exped')");else if(ef)add("🧭",ef+" emplacement(s) d'expédition libre(s)","go('exped')");
 const a=achReady();if(a)add("🏅",a+" succès à réclamer","go('achs')");
 if(S.arena&&S.arena.left>0)add("🏟️",S.arena.left+" combat(s) d'arène","go('arena')");
 return L}
function todoRender(){const h=document.querySelector("#home .banner");if(!h)return;let box=$$("todoBox");if(!box){h.insertAdjacentHTML("afterend",'<div class="panel" id="todoBox"></div>');box=$$("todoBox")}
 const L=todoItems();box.innerHTML=`<div class="todohead"><b>✅ À faire aujourd'hui</b><span class="chip">${L.length?L.length+" activité"+(L.length>1?"s":""):"tout est fait !"}</span></div>${L.length?`<div class="todolist">${L.map(x=>`<button class="todo" onclick="${x.js}"><span class="ti">${x.i}</span><span class="tt">${x.t}</span><span class="tg">›</span></button>`).join("")}</div>`:'<div class="muted tiny">Bravo, survivant. Reviens demain ou grimpe la Tour !</div>'}`}
/* ---------- Défi du jour ---------- */
const DMODS=[{k:"shield",n:"Carapaces",d:"Tous les ennemis ont une carapace"},{k:"venom",n:"Venin",d:"Tous les ennemis sont venimeux"},{k:"heal",n:"Régénération",d:"Tous les ennemis se soignent"},{k:"berserk",n:"Furie",d:"Les ennemis frappent de plus en plus fort"}];
function dchInfo(){const h=dayHash(),el=EL[h%3],mod=DMODS[(h>>3)%DMODS.length],n=Math.max(3,Math.min(100,S.stage||3));return{el,mod,n,hp:1.5}}
function dchStart(){ens();const I=dchInfo();startBattle({mode:"story",n:I.n,daily:1})}
const _sb99n=startBattle;startBattle=function(o){const r=_sb99n(o);const f=fight;if(f&&f.o&&f.o.daily&&!f.dSet){f.dSet=1;const I=dchInfo();f.daily=I;f.zone="Défi du jour · "+zoneOf(I.n)[0];f.enemies.forEach(e=>{e.hp=e.max=Math.round(e.max*I.hp);if(!e.boss){e.tr=I.mod.k;if(e.tr==="shield")e.sh=Math.round(e.max*.2);if(e.tr==="berserk")e.a0=e.atk}});f.log="Défi du jour : orbes "+ICO[I.el]+" ×1,5 · "+I.mod.d+".";renderBattle()}return r};
const _aa99n=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(f&&f.daily&&endTurn&&f.last===f.daily.el){dmg=Math.round(dmg*1.5);msg+=" · bonus du défi ×1,5"}return _aa99n(dmg,msg,endTurn)};
const _win99n=win;win=function(){const f=fight,was=f&&f.over;_win99n();if(f&&f.over==="win"&&!was&&f.daily){ens();if(!S.dch.done){S.dch.done=true;const y=new Date(Date.now()-864e5).toISOString().slice(0,10);S.dch.streak=S.dch.last===y?S.dch.streak+1:1;S.dch.last=todayK();const R={tickets:2,essence:25,shards:6};if(S.dch.streak%7===0){R.tickets+=5;R.shards+=20}give(R);bump("daily");save();toast("⚔️ Défi du jour réussi ! +"+R.tickets+" 🎟️ +"+R.essence+" 🔮 +"+R.shards+" 🧩 · série "+S.dch.streak,4200);render()}}};
function renderDaily(){const el=$$("daily");if(!el)return;ens();const I=dchInfo(),z=stageZone(zoneOf(I.n)[0]);
 el.innerHTML=`<div class="banner"><div class="eyebrow">DÉFI DU JOUR</div><h1>${esc(I.mod.n)}</h1><p>Un combat spécial qui change chaque jour. Réussis-le pour une grosse récompense, une fois par jour.</p><div class="heroDino">⚔️</div></div>
 <div class="panel"><b>Règles d'aujourd'hui</b><div class="dmods"><div class="dmod"><span>${ICO[I.el]}</span><div><b>Orbes du jour ×1,5</b><div class="muted tiny">Les orbes de cette couleur frappent plus fort.</div></div></div><div class="dmod"><span>${TRAITS[I.mod.k].i}</span><div><b>${esc(I.mod.n)}</b><div class="muted tiny">${esc(I.mod.d)}.</div></div></div><div class="dmod"><span>❤️</span><div><b>Ennemis +50 % PV</b><div class="muted tiny">Niveau ${I.n} · ${esc(zoneOf(I.n)[0])}</div></div></div></div>
 <div class="fchips" style="margin:8px 0"><span class="chip">🎟️ 2</span><span class="chip">🔮 25</span><span class="chip">🧩 6</span><span class="chip">Série de 7 jours : +5 🎟️ +20 🧩</span></div>
 ${S.dch.done?`<div class="ok" style="text-align:center;margin:8px 0">✅ Défi réussi aujourd'hui · série ${S.dch.streak} jour(s)</div><button class="wide secondary" onclick="dchStart()">REJOUER (sans récompense)</button>`:`<button class="wide red" onclick="dchStart()">⚔ RELEVER LE DÉFI</button>`}
 <div class="muted tiny" style="margin-top:6px">Série actuelle : ${S.dch.streak} jour(s). Nouveau défi chaque jour à minuit (UTC).</div></div>`}
/* ---------- Fouilles ---------- */
const DIGN=16;
function digReward(i){const r=rng(dayHash(S.dig.day)+i*7919)();const R=rng(dayHash(S.dig.day)+i*104729);const m=Object.keys(MATS);
 if(r<.03)return{k:"jack",i:"💀",n:"Fossile légendaire !",R:{tickets:3,shards:20,essence:30}};if(r<.11)return{k:"t",i:"🎟️",n:"Ticket",R:{tickets:1}};if(r<.18)return{k:"s",i:"🧩",n:"Fragments",R:{shards:5}};
 if(r<.40){const k=m[Math.floor(R()*m.length)];return{k:"m",i:MATS[k][0],n:MATS[k][1],R:{[k]:3+Math.floor(R()*4)}}}if(r<.62)return{k:"e",i:"🔮",n:"Essence",R:{essence:5+Math.floor(R()*8)}};return{k:"st",i:"🪨",n:"Pierres",R:{stone:20+Math.floor(R()*40)}}}
function digTap(i){ens();if(S.dig.open[i]||S.dig.picks<=0)return;S.dig.picks--;const w=digReward(i);S.dig.open[i]=1;give(w.R);bump("digs");save();
 const el=document.querySelector(`.digtile[data-i="${i}"]`);if(el&&PREFS.anim){const r=el.getBoundingClientRect();typeof tex==="function"&&tex("smoke",r.left+r.width/2,r.top+r.height/2,{size:110,color:"#d9b98a",glow:false,s0:.4,s1:1.4,dur:600});if(w.k==="jack"){typeof tex==="function"&&tex("flare",r.left+r.width/2,r.top+r.height/2,{size:220,color:"#ffd15c",dur:700});vib&&vib([60,40,120])}}
 toast("⛏️ "+w.n+" : "+Object.entries(w.R).map(([k,v])=>"+"+v+" "+(XNAME[k]||k)).join(" "),2600);sfx&&sfx(w.k==="jack"?"legend":"buy");render()}
function digBuy(){ens();const c=60*(S.dig.bought+1);if(S.dig.bought>=3||S.stone<c){toast(S.dig.bought>=3?"Maximum de pioches achetées aujourd'hui":"Pas assez de pierres");return}S.stone-=c;S.dig.bought++;S.dig.picks++;save();render()}
function renderDig(){const el=$$("dig");if(!el)return;ens();const c=60*(S.dig.bought+1),opened=Object.keys(S.dig.open).length;
 el.innerHTML=`<div class="banner"><div class="eyebrow">FOUILLES</div><h1>Le site de fouilles</h1><p>Creuse le sable pour déterrer des trésors. Le terrain change chaque jour.</p><div class="heroDino">⛏️</div></div>
 <div class="panel"><div class="todohead"><b>⛏️ Pioches : ${S.dig.picks}</b><span class="chip">${opened}/${DIGN} cases fouillées</span></div>
 <div class="diggrid">${[...Array(DIGN)].map((_,i)=>{const o=S.dig.open[i],w=o?digReward(i):null;return `<button class="digtile ${o?"open "+w.k:""}" data-i="${i}" ${o||S.dig.picks<=0?"disabled":""} onclick="digTap(${i})">${o?`<span>${w.i}</span>`:""}</button>`}).join("")}</div>
 <button class="wide secondary" ${S.dig.bought>=3?"disabled":""} onclick="digBuy()">ACHETER UNE PIOCHE · ${c} 🪨 (${S.dig.bought}/3)</button>
 <div class="muted tiny" style="margin-top:6px">3 pioches gratuites par jour. Trésors : pierres, essence, matériaux, fragments, tickets… et parfois un fossile légendaire.</div></div>`}
ACH.push(["dg1","Archéologue","Fouiller 30 cases",()=>S.cnt.digs||0,30,{tickets:2,essence:20}],["dc1","Défieur","Réussir 7 défis du jour",()=>S.cnt.daily||0,7,{tickets:3,shards:15},"Défieur Quotidien"]);
