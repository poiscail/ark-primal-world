/* Modes II (0.35) : Expédition dans le brouillard (grille 5×5 du jour, case par case), Traque de la semaine (3 pistes puis
   l'apprivoisement d'un dino rare), Tournoi de la semaine (8 équipes, élimination directe), saisons de l'Arène (ligues,
   récompense de fin de saison), Défi de la semaine (deux règles du Défi du jour à la fois), mini-jeux (course de dinos,
   pêche dans les abysses) et outils de fouille (pinceau, dynamite). État : S.m3. */
const M3_MODES=new Set(["fog","trk","tour"]);
const m3On=(f,m)=>!!(f&&f.o&&(m?f.o.mode===m:M3_MODES.has(f.o.mode)));
const _ensM3=ens;ens=function(){_ensM3();let M=S.m3;if(!M||typeof M!=="object")M=S.m3={};const d=todayK(),w=wkNow();
 if(!M.fog||M.fog.day!==d)M.fog={day:d,pos:0,vis:{0:1},done:{0:1}};if(!M.trk||M.trk.wk!==w)M.trk={wk:w,step:0};if(!M.tour||M.tour.wk!==w)M.tour={wk:w,round:0,out:0};
 if(!M.wch||M.wch.wk!==w)M.wch={wk:w,done:0};if(!M.mini||M.mini.day!==d)M.mini={day:d,race:3,fish:5,brush:3};if(!M.fish||typeof M.fish!=="object")M.fish={};
 if(!(M.sea>=0))M.sea=m3Season();if(!(M.seaBest>=0))M.seaBest=0;if(!M.tours)M.tours=0};
/* ---- Expédition dans le brouillard ---- */
const FOG_W=5,FOG_N=25,FOG_BOSS=24;
function fogCell(i){if(i===0)return"start";if(i===FOG_BOSS)return"boss";const r=rng(dayHash("fog"+S.m3.fog.day)+i*7919)();return r<.55?"fight":r<.72?"chest":r<.84?"spring":"empty"}
const FOG_IC={start:"🏁",boss:"👹",fight:"⚔️",chest:"🎁",spring:"💧",empty:"·"};
const fogAdj=(a,b)=>{const ax=a%FOG_W,ay=a/FOG_W|0,bx=b%FOG_W,by=b/FOG_W|0;return Math.abs(ax-bx)+Math.abs(ay-by)===1};
function fogGo(i){ens();const F=S.m3.fog;if(!fogAdj(F.pos,i)&&!F.done[i])return toast("Avance d'une case à la fois (haut, bas, gauche, droite).");const c=fogCell(i);
 if(F.done[i]||c==="empty"||c==="start"){F.pos=i;F.done[i]=1;fogReveal(i);save();return render()}
 if(c==="chest"){const R={stone:120,essence:8};const m=Object.keys(MATS);R[m[rnd(m.length)]]=3;give(R);toast("🎁 Coffre : "+fmt(R),2600)}
 if(c==="spring"){give({essence:12});toast("💧 Source pure : +12 🔮",2200)}
 if(c==="fight"||c==="boss"){fight=null;return startBattle({mode:"fog",i})}
 F.pos=i;F.done[i]=1;fogReveal(i);save();render()}
function fogReveal(i){const F=S.m3.fog;for(let j=0;j<FOG_N;j++)if(fogAdj(i,j)||j===i)F.vis[j]=1}
MODES.fog=function(o){const i=o.i|0,boss=i===FOG_BOSS,eq=m2Eq()+(i/5|0),z=ZONES[(dayHash("fogz"+S.m3.fog.day))%4];
 return{eq,label:"Expédition · "+(boss?"repaire du gardien":"case "+(i+1))+" · "+z[0],enemies:mkEnemies(eq,{emo:[z[1][0],z[1][1],boss?"👹":z[1][2]],name:z[0],boss,el:null,els:[EL[rnd(3)],EL[rnd(3)],z[2]]}).map(e=>(e.tr="",e))}};
function renderFog(){ens();const F=S.m3.fog;return `<div class="panel m3fog"><div class="todohead"><b>🗺️ Expédition dans le brouillard</b><span class="chip">${Object.keys(F.done).length}/${FOG_N} cases · gardien ${F.done[FOG_BOSS]?"vaincu ✅":"👹"}</span></div>
 <div class="tiny muted">Une nouvelle carte chaque jour. Avance case par case ; le brouillard se lève autour de toi. Le gardien attend dans le coin opposé.</div>
 <div class="fogg">${[...Array(FOG_N)].map((_,i)=>{const v=F.vis[i],d=F.done[i],c=fogCell(i),here=F.pos===i,can=!d&&fogAdj(F.pos,i);return `<button class="fogc ${v?"vis":""} ${d?"done":""} ${here?"here":""} ${can?"can":""}" data-i="${i}" ${can||d&&!here?"":"disabled"} onclick="fogGo(${i})">${here?"🦖":v?FOG_IC[c]:"☁️"}</button>`}).join("")}</div></div>`}
/* ---- Traque de la semaine ---- */
const TRK_STEPS=4;
function trkSpecies(){const L=Object.keys(SPEC).filter(k=>!SPEC[k].ex&&/^(Rare|Épi)/.test(SPEC[k].r||""));return L[hashS("trk"+wkNow())%L.length]||"raptor"}
MODES.trk=function(o){const st=S.m3.trk.step,last=st===TRK_STEPS-1,k=trkSpecies(),eq=m2Eq()+2*st,z=zoneOf(Math.min(100,Math.max(1,eq)));
 const en=mkEnemies(eq,{emo:[z[1][0],z[1][1],"🦖"],names:[z[0]+" · Ennemi",z[0]+" · Ennemi",last?SPEC[k].name+" sauvage":"Piste · "+z[0]],pts:[null,null,last?k:null],boss:last,el:null,els:[EL[rnd(3)],EL[rnd(3)],last?SPEC[k].element:z[2]]});
 en.forEach(e=>{e.tr=""});if(last){en[2]._nm=1;en[2].e="🐾"}return{eq,label:"Traque · "+(last?"le "+SPEC[k].name+" !":"piste "+(st+1)+"/"+(TRK_STEPS-1)),enemies:en}};
/* ---- Tournoi de la semaine ---- */
const TOUR_N=["Les Crocs d'Acier","La Meute du Volcan","Les Ombres Grises","Le Clan des Fougères","Les Brise-Roc","Les Ailes du Nord","La Horde Rouge"];
function tourOpp(r){const L=Object.keys(SPEC).filter(k=>!SPEC[k].ex);let h=hashS("tour"+wkNow()+"r"+r);const t=[];for(let g=0;g<30&&t.length<3;g++){const k=L[h%L.length];if(!t.includes(k))t.push(k);h=(h*31+11)>>>0}return{n:TOUR_N[(hashS("tn"+wkNow())+r)%TOUR_N.length],t}}
MODES.tour=function(o){const r=S.m3.tour.round,O=tourOpp(r),eq=m2Eq()+3*r;const en=mkEnemies(eq,{emo:O.t.map(k=>SPEC[k].e),names:O.t.map(k=>SPEC[k].name+" · "+O.n),els:O.t.map(k=>SPEC[k].element),pts:O.t,boss:r===2,hp:1.15+.1*r,atk:1.05});
 en.forEach(e=>{e.tr="";e._nm=1});return{eq,label:"Tournoi · "+["quart de finale","demi-finale","finale"][r]+" · "+O.n,enemies:en}};
const _elM3=enemyLook;enemyLook=function(e,f){f=f||fight;if(m3On(f,"tour")&&e&&e.pt&&SPEC[e.pt])return null;if(m3On(f,"trk")&&e&&e.pt&&SPEC[e.pt])return null;return _elM3(e,f)};
function renderTour(){ens();const T=S.m3.tour,lbl=["Quarts","Demies","Finale"];
 return `<div class="panel m3tour"><div class="todohead"><b>🏆 Tournoi de la semaine</b><span class="chip">${T.out?"éliminé":T.round>=3?"🏆 champion !":lbl[T.round]}</span></div>
 <div class="tbrk">${[0,1,2].map(r=>{const O=tourOpp(r),st=T.round>r?"won":T.round===r&&!T.out?"cur":T.out&&T.round===r?"lost":"";return `<div class="tr ${st}"><small>${lbl[r]}</small><b>${esc(O.n)}</b><span>${O.t.map(k=>SPEC[k].e).join("")}</span></div>`}).join("")}</div>
 ${T.out?'<div class="tiny muted">Éliminé cette semaine. Nouveau tournoi lundi.</div>':T.round>=3?'<div class="tiny ok">Tu as gagné le tournoi de la semaine !</div>':`<button class="wide red" onclick="fight=null;startBattle({mode:'tour'})">⚔ JOUER ${lbl[T.round].toUpperCase()}</button>`}</div>`}
/* ---- victoires / défaites ---- */
function m3Win(f){ens();const m=f.o.mode,R={stone:40+3*f.n};let extra="",loot=[];
 if(m==="fog"){const F=S.m3.fog,i=f.o.i|0;F.done[i]=1;F.pos=i;fogReveal(i);R.essence=4;if(i===FOG_BOSS){Object.assign(R,{tickets:3,essence:30});loot.push(rollItem(f.n,1));extra='<div class="tiny ok">🗺️ Gardien de l\'expédition vaincu !</div>';bump("fogs")}extra+=`<button class="wide blue" onclick="go('modes2')">RETOUR À LA CARTE</button>`}
 if(m==="trk"){const T=S.m3.trk;if(T.step===TRK_STEPS-1){const k=trkSpecies();S.team.push({id:S.nextId++,type:k,level:Math.max(1,Math.round(f.n/2)),xp:0,v:"normal"});extra=`<div class="tiny ok">🐾 ${esc(SPEC[k].name)} est apprivoisé et rejoint ta meute !</div>`;bump("tracks")}else extra=`<div class="tiny ok">🐾 Piste ${T.step+1} suivie : le ${esc(SPEC[trkSpecies()].name)} n'est plus loin…</div><button class="wide blue" onclick="fight=null;startBattle({mode:'trk'})">SUIVRE LA PISTE</button>`;T.step++}
 if(m==="tour"){const T=S.m3.tour;R.tickets=[1,2,4][T.round];T.round++;if(T.round>=3){Object.assign(R,{essence:50,shards:15});S.m3.tours++;bump("tourW");extra='<div class="tiny ok">🏆 Champion du tournoi de la semaine !</div>'}else extra=`<button class="wide red" onclick="fight=null;startBattle({mode:'tour'})">TOUR SUIVANT</button>`}
 save();return{R,extra,loot}}
const _ewM3=eventWin;eventWin=function(f,n){return m3On(f)?m3Win(f):_ewM3(f,n)};
const _slM3=settleLose;settleLose=function(){const f=fight;_slM3();if(m3On(f,"tour")){S.m3.tour.out=1;save();f.report=`<div class="panel tiny muted">🏆 Éliminé du tournoi de la semaine. Reviens lundi !</div>`}};
const _sbM3=startBattle;startBattle=function(o){const t=o||lastB;ens();if(t&&t.mode==="tour"&&(S.m3.tour.out||S.m3.tour.round>=3)){toast("Tournoi de la semaine terminé.");return}
 if(t&&t.mode==="trk"&&S.m3.trk.step>=TRK_STEPS){toast("Traque de la semaine terminée.");return}
 if(t&&t.mode==="fog"){const F=S.m3.fog;if(F.done[t.i]||!fogAdj(F.pos,t.i)){toast("Case inaccessible.");return}}return _sbM3(o)};
if(typeof chainNext==="function"){const _cnM3=chainNext;chainNext=function(f){return m3On(f)?null:_cnM3(f)}}
if(typeof balKey==="function"){const _bkM3=balKey;balKey=function(f){return m3On(f)?"mode "+f.o.mode:_bkM3(f)}}
/* ---- saisons de l'Arène (2 semaines) ---- */
function m3Season(){return Math.floor(wkNow()/2)}
const LEAGUES=[[0,"🥉 Bronze",{tickets:1}],[1100,"🥈 Argent",{tickets:2,essence:20}],[1300,"🥇 Or",{tickets:4,essence:40}],[1500,"💠 Platine",{tickets:6,essence:60,shards:10}],[1700,"💎 Diamant",{tickets:8,essence:80,shards:20}],[1900,"👑 Légende",{tickets:12,essence:120,shards:40}]];
const leagueOf=r=>{let L=LEAGUES[0];for(const x of LEAGUES)if(r>=x[0])L=x;return L};
function m3SeaCheck(){ens();if(!S.arena)return;const M=S.m3,s=m3Season();M.seaBest=Math.max(M.seaBest,S.arena.r||0);if(M.sea===s)return;const L=leagueOf(M.seaBest);give(L[2]);toast("🏟️ Fin de la saison d'Arène : "+L[1]+" → "+fmt(L[2]),4200);
 S.arena.r=Math.round(1000+((S.arena.r||1000)-1000)/2);M.sea=s;M.seaBest=S.arena.r;save()}
if(typeof renderArena==="function"){const _raM3=renderArena;renderArena=function(){m3SeaCheck();_raM3();const el=$$("arena");if(!el)return;const L=leagueOf(S.arena.r),B=leagueOf(S.m3.seaBest),nx=LEAGUES.find(x=>x[0]>S.arena.r),end=((m3Season()+1)*2*7-3)*864e5-Date.now();
 const h=`<div class="panel m3sea"><div class="row"><span class="bigicon">${L[1].split(" ")[0]}</span><div class="grow"><b>Saison ${m3Season()} · ligue ${L[1]}</b><div class="tiny muted">Fin dans ${Math.max(0,Math.floor(end/864e5))} j · meilleure ligue de la saison : ${B[1]} → récompense ${fmt(B[2])}${nx?" · prochaine ligue à "+nx[0]+" pts":""}</div></div></div></div>`;
 const b=el.querySelector(".banner");if(b)b.insertAdjacentHTML("afterend",h)}}
/* ---- Défi de la semaine : deux règles ---- */
function wchRules(){const L=DRULES,h=hashS("wch"+wkNow()),a=h%L.length,b=(a+1+((h>>4)%(L.length-1)))%L.length;return[L[a],L[b]]}
function wchStart(){ens();if(S.m3.wch.done){toast("Défi de la semaine déjà réussi.");return}const n=Math.max(5,Math.min(100,S.stage||5));fight=null;startBattle({mode:"story",n,weekly:1})}
const _sbM3b=startBattle;startBattle=function(o){const r=_sbM3b(o);const f=fight;if(f&&f.o&&f.o.weekly&&!f.wSet){f.wSet=1;const[a,b]=wchRules(),I=dchInfo();f.daily={...I,rule:a,rule2:b,week:1};
  f.enemies.forEach(e=>{e.hp=e.max=Math.round(e.max*1.1)});if(typeof drSetup==="function"){drSetup(f,a.k);drSetup(f,b.k)}f.zone="Défi de la semaine · "+zoneOf(f.n)[0];f.log="Défi de la semaine : "+a.i+" "+a.n+" + "+b.i+" "+b.n+".";renderBattle()}return r};
const _winM3=win;win=function(){const f=fight;if(f&&f.daily&&f.daily.week&&!f.over){const D=f.daily;f.daily=null;try{_winM3()}finally{f.daily=D}ens();if(!S.m3.wch.done){S.m3.wch.done=1;give({tickets:5,essence:50,shards:15});bump("weekly");save();toast("🗓️ Défi de la semaine réussi ! +5 🎟️ +50 🔮 +15 🧩",4000)}return}return _winM3()};
const _rbM3=renderBattle;renderBattle=function(){_rbM3();const f=fight;if(!f||!f.daily||!f.daily.rule2||f.over)return;const ch=document.querySelector("#battleArea .sHud .fchips");if(ch&&!ch.querySelector(".drchip2"))ch.insertAdjacentHTML("beforeend",`<span class="chip hot drchip2" title="${esc(f.daily.rule2.d)}">${f.daily.rule2.i} ${esc(f.daily.rule2.n)}</span>`)};
if(typeof renderDaily==="function"){const _rdM3=renderDaily;renderDaily=function(){_rdM3();const el=$$("daily");if(!el)return;ens();const[a,b]=wchRules(),done=S.m3.wch.done;
 el.insertAdjacentHTML("beforeend",`<div class="panel m3wch"><b>🗓️ Défi de la semaine</b> <span class="chip">${done?"réussi ✅":"+5 🎟️ +50 🔮 +15 🧩"}</span><div class="tiny">Deux règles à la fois : <b>${a.i} ${esc(a.n)}</b> (${esc(a.d)}) et <b>${b.i} ${esc(b.n)}</b> (${esc(b.d)}).</div>${done?"":'<button class="wide red" onclick="wchStart()">RELEVER LE DÉFI DE LA SEMAINE</button>'}</div>`)}}
/* ---- mini-jeux ---- */
let RACE=null;
function raceOpen(){ens();if(S.m3.mini.race<=0){toast("Plus de course aujourd'hui.");return}S.m3.mini.race--;save();const t=S.team.slice(0,3),d=t[0]||{type:"raptor"};
 RACE={p:0,r:[0,0,0],t0:Date.now(),per:1100,over:0,me:d.type,tm:null};openModal(`<h3 style="margin:0 0 4px">🏁 Course de dinos</h3><div class="tiny muted">Clique (ou Espace) quand le curseur est dans la zone verte : ton dino bondit en avant !</div><div id="raceTrack"></div><div class="racebar"><i class="rz"></i><i class="rc" id="raceCur"></i></div><div class="btns"><button class="blue" id="raceBtn" onclick="raceHit()">⚡ BONDIR</button></div>`);
 RACE.tm=setInterval(raceTick,60);raceDraw()}
function raceCurPos(){const ph=((Date.now()-RACE.t0)%RACE.per)/RACE.per;return ph<.5?ph*2:2-ph*2}
function raceTick(){if(!RACE||RACE.over)return;const c=$$("raceCur");if(!c){clearInterval(RACE.tm);RACE=null;return}c.style.left=(raceCurPos()*100)+"%";RACE.r=RACE.r.map((x,i)=>x+(.25+Math.random()*.55)*(1+i*.08));raceDraw();raceEnd()}
function raceHit(){if(!RACE||RACE.over)return;const x=raceCurPos(),d=Math.abs(x-.5);RACE.p+=d<.08?9:d<.18?5:1;raceDraw();raceEnd()}
function raceDraw(){const el=$$("raceTrack");if(!el||!RACE)return;const lane=(n,e,v)=>`<div class="rlane"><span style="left:${Math.min(100,v)}%">${e}</span><small>${n}</small></div>`;
 el.innerHTML=lane("Toi",SPEC[RACE.me]?SPEC[RACE.me].e:"🦖",RACE.p)+["🦎","🐊","🦕"].map((e,i)=>lane("Rival "+(i+1),e,RACE.r[i])).join("")}
function raceEnd(){if(!RACE||RACE.over)return;const all=[RACE.p,...RACE.r];if(Math.max(...all)<100)return;RACE.over=1;clearInterval(RACE.tm);const place=1+RACE.r.filter(x=>x>RACE.p).length,R=[{tickets:1,essence:15},{essence:12,stone:150},{stone:120},{stone:50}][place-1];
 give(R);bump("races");if(place===1)bump("raceW");save();const b=$$("raceBtn");if(b){b.textContent=["🥇","🥈","🥉","4e"][place-1]+" place · "+fmt(R)+" · FERMER";b.onclick=()=>{closeModal();render()}}}
document.addEventListener("keydown",e=>{if(RACE&&!RACE.over&&e.code==="Space"&&$$("raceTrack")){e.preventDefault();raceHit()}});
const FISH=[["🐟","Poisson argenté",.4,{stone:60}],["🐠","Poisson-lanterne",.25,{essence:6}],["🦐","Crevette géante",.15,{hide:3}],["🐡","Poisson-globe",.1,{essence:12}],["🦑","Calmar des abysses",.06,{crystal:2}],["🐙","Pieuvre luminescente",.03,{tickets:1}],["🦈","Requin ancien",.01,{tickets:2,essence:20}]];
let FISHING=null;
function fishOpen(){ens();if((S.stage||0)<50){toast("La pêche s'ouvre avec le Grand Nord (histoire 50).");return}openModal(`<h3 style="margin:0 0 4px">🎣 Pêche dans les abysses</h3><div class="tiny muted">Lance ta ligne, attends que ça morde, puis ferre vite ! (${S.m3.mini.fish} lancers aujourd'hui)</div><div id="fishSea" class="fishsea"><span class="bob">🎣</span></div><div class="tiny" id="fishMsg">Prêt.</div><div class="btns"><button class="blue" id="fishBtn" onclick="fishAct()">LANCER</button><button class="secondary" onclick="fishStop();closeModal();render()">FERMER</button></div>`)}
function fishStop(){if(FISHING&&FISHING.tm)clearTimeout(FISHING.tm);FISHING=null}
function fishAct(){ens();const m=$$("fishMsg"),b=$$("fishBtn"),sea=$$("fishSea");if(!m||!b)return;
 if(!FISHING){if(S.m3.mini.fish<=0){m.textContent="Plus de lancer aujourd'hui.";return}S.m3.mini.fish--;save();FISHING={st:"wait"};m.textContent="La ligne descend dans le noir…";b.textContent="FERRER !";sea&&sea.classList.remove("bite");
  FISHING.tm=setTimeout(()=>{if(!FISHING)return;FISHING.st="bite";FISHING.t=Date.now();m.textContent="‼️ Ça mord !";sea&&sea.classList.add("bite");FISHING.tm=setTimeout(()=>{if(FISHING&&FISHING.st==="bite"){FISHING=null;m.textContent="Raté, il s'est échappé…";b.textContent="LANCER";sea&&sea.classList.remove("bite")}},typeof PREFS!=="undefined"&&PREFS.noTimer?2147e6:900)},1500+Math.random()*2500);return}
 if(FISHING.st==="wait"){fishStop();m.textContent="Trop tôt ! Le poisson a fui.";b.textContent="LANCER";return}
 fishStop();sea&&sea.classList.remove("bite");let r=Math.random(),k=0;for(;k<FISH.length-1;k++){if(r<FISH[k][2])break;r-=FISH[k][2]}const F=FISH[k];S.m3.fish[k]=(S.m3.fish[k]||0)+1;give(F[3]);bump("fish");save();m.textContent="Pris : "+F[0]+" "+F[1]+" ! "+fmt(F[3]);b.textContent="LANCER"}
function renderMini(){ens();const M=S.m3;return `<div class="sectionhead"><h2>Mini-jeux</h2></div><div class="m2grid">
 <div class="panel m2card"><div class="row"><span class="bigicon">🏁</span><div class="grow"><b>Course de dinos</b><div class="tiny muted">Un jeu de réflexes : clique au bon moment pour faire bondir ton chef d'équipe. 3 courses par jour.</div></div></div><button class="wide blue m3race" ${M.mini.race>0?"":"disabled"} onclick="raceOpen()">COURIR (${M.mini.race}/3)</button></div>
 <div class="panel m2card"><div class="row"><span class="bigicon">🎣</span><div class="grow"><b>Pêche dans les abysses</b><div class="tiny muted">Ferre au bon moment. Collection : ${FISH.map((F,k)=>M.fish[k]?F[0]:"❔").join("")}</div></div></div><button class="wide blue m3fish" onclick="fishOpen()">${(S.stage||0)>=50?"PÊCHER ("+M.mini.fish+"/5)":"🔒 HISTOIRE 50"}</button></div></div>`}
/* ---- écran : ajouts à l'écran Modes ---- */
if(typeof renderModes2==="function"){const _rmM3=renderModes2;renderModes2=function(){_rmM3();const el=$$("modes2");if(!el)return;ens();const T=S.m3.trk,k=trkSpecies();
 el.insertAdjacentHTML("beforeend",`<div class="sectionhead"><h2>Aventures de la semaine</h2></div>${renderFog()}<div class="m2grid">${renderTour()}
 <div class="panel m3trk"><div class="row"><span class="bigicon">${PREFS.art==="svg"&&typeof portrait==="function"?`<span class="pt">${portrait(k,true)}</span>`:SPEC[k].e}</span><div class="grow"><b>🐾 Traque : ${esc(SPEC[k].name)}</b><div class="tiny muted">Suis ${TRK_STEPS-1} pistes, puis affronte le dino sauvage pour l'apprivoiser (une fois par semaine).</div><div class="progress"><i style="width:${T.step/TRK_STEPS*100}%"></i></div></div></div>${T.step>=TRK_STEPS?'<div class="tiny ok">Apprivoisé cette semaine ✅</div>':`<button class="wide blue" onclick="fight=null;startBattle({mode:'trk'})">${T.step===TRK_STEPS-1?"AFFRONTER LE DINO":"SUIVRE LA PISTE "+(T.step+1)}</button>`}</div></div>${renderMini()}`)}}
/* ---- outils de fouille ---- */
let digTool="pick";
if(typeof digTap==="function"){const _dtM3=digTap;digTap=function(i){ens();if(digTool==="brush"){if(S.dig.open[i])return;if(S.m3.mini.brush<=0){toast("Plus de coup de pinceau aujourd'hui.");return}S.m3.mini.brush--;S.dig.peek=S.dig.peek||{};S.dig.peek[i]=1;save();const w=digReward(i);toast("🖌️ Sous le sable : "+w.i+" "+w.n,2400);return render()}
 if(digTool==="dyn"){if(S.dig.picks<3){toast("La dynamite coûte 3 pioches.");return}const N=[i,i-4,i+4,(i%4)?i-1:-1,(i%4<3)?i+1:-1].filter(j=>j>=0&&j<DIGN&&!S.dig.open[j]);if(!N.length)return;S.dig.picks-=3;N.forEach(j=>{S.dig.picks++;_dtM3(j)});digTool="pick";bump("dynamite");save();return render()}
 return _dtM3(i)}}
if(typeof renderDig==="function"){const _rdgM3=renderDig;renderDig=function(){_rdgM3();const el=$$("dig");if(!el)return;ens();const g=el.querySelector(".diggrid");if(!g)return;
 const pk=S.dig.peek||{};g.querySelectorAll(".digtile").forEach(b=>{const i=+b.dataset.i;if(pk[i]&&!S.dig.open[i]){b.classList.add("peek");b.innerHTML=`<span>${digReward(i).i}</span>`}});
 g.insertAdjacentHTML("beforebegin",`<div class="digtools">${[["pick","⛏️","Pioche","1 case"],["brush","🖌️","Pinceau","voir sans creuser · "+S.m3.mini.brush+"/3"],["dyn","🧨","Dynamite","une croix de 5 cases · 3 pioches"]].map(([k,i,n,d])=>`<button class="${digTool===k?"on":""}" data-t="${k}" onclick="digTool='${k}';render()">${i} ${n}<small>${d}</small></button>`).join("")}</div>`)}}
ACH.push(["m3a","Éclaireur","Vaincre le gardien d'une expédition",()=>(S.cnt||{}).fogs||0,1,{tickets:2}],["m3b","Champion","Gagner un tournoi de la semaine",()=>(S.cnt||{}).tourW||0,1,{tickets:5,shards:10}],
 ["m3c","Pisteur","Apprivoiser un dino traqué",()=>(S.cnt||{}).tracks||0,1,{essence:30}],["m3d","Pêcheur","Attraper les 7 poissons",()=>Object.keys((S.m3||{}).fish||{}).length,7,{tickets:4}],["m3e","Fusée","Gagner une course",()=>(S.cnt||{}).raceW||0,1,{essence:15}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Aventures de la semaine et mini-jeux","Aventure > Modes : l'expédition dans le brouillard (une carte 5×5 par jour), la traque (un dino rare à apprivoiser chaque semaine), le tournoi (3 tours, élimination directe), la course de dinos (réflexes) et la pêche (dès l'histoire 50). L'Arène a des saisons de 2 semaines avec des ligues (Bronze à Légende). Le Défi du jour propose aussi un Défi de la semaine à deux règles. Aux Fouilles : pinceau (voir sans creuser) et dynamite (5 cases)."]);
