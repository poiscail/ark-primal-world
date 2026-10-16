/* Nouveaux modes (0.34) : écran « Modes » (Aventure) avec Survie (vagues infinies, PV conservés), Sprint (10 combats
   chronométrés), Combats-énigmes (plateau imposé, nombre d'actions limité), Miroir (ta propre équipe), Sans orbes
   (compétences, super et garde seulement), Entraînement (mannequin, compteur de dégâts), Découverte (histoire courte en
   10 niveaux). Dans tous les combats : Apprivoisement (purifier un dino corrompu affaibli) et Revanche (rejouer un
   combat perdu avec le même tirage). État : S.m2. */
const M2_MODES=new Set(["surv","sprint","puzzle","mirror","noorb","train","short"]);
const m2On=(f,m)=>!!(f&&f.o&&(m?f.o.mode===m:M2_MODES.has(f.o.mode)));
const m2Eq=()=>{const t=S.team.slice(0,3);const a=t.reduce((s,d)=>s+(d.level||1),0)/(t.length||1);return Math.max(3,Math.round(2*(a-1)))};
const _ensM2=ens;ens=function(){_ensM2();let M=S.m2;if(!M||typeof M!=="object")M=S.m2={};for(const k of ["puz","short","day"])if(!M[k]||typeof M[k]!=="object")M[k]={};
 for(const k of ["svBest","sprBest","shortSt"])if(!(M[k]>=0))M[k]=0;if(!M.tame||typeof M.tame!=="object")M.tame={day:"",n:0};if(M.tame.day!==todayK())M.tame={day:todayK(),n:0}};
const m2Daily=k=>{ens();if(S.m2.day[k]===todayK())return false;S.m2.day[k]=todayK();return true};
const m2Zone=k=>ZONES[((k%4)+4)%4];
/* ---- Survie ---- */
function m2SurvEnemies(t,eq0){const z=m2Zone(t),eq=eq0+3*t,boss=(t+1)%5===0;return mkEnemies(eq,{emo:[z[1][rnd(3)],z[1][rnd(3)],boss?"👹":z[1][rnd(3)]],name:z[0],boss,el:null,els:[EL[rnd(3)],EL[rnd(3)],z[2]]}).map(e=>(e.tr="",e))}
MODES.surv=function(o){const eq=m2Eq();return{eq,label:"Survie · série 1",enemies:m2SurvEnemies(0,eq)}};
const _keM2=killEnemy;killEnemy=function(){const f=fight;if(m2On(f,"surv")&&f.wave===2&&!f.over){f.sv=(f.sv||0)+1;const eq0=f.svEq||(f.svEq=f.n);f.enemies=m2SurvEnemies(f.sv,eq0);f.wave=0;f.turn=0;f.stun=0;f.dots=[];f.firstTap=true;f.enrage=false;
  f.hp=f.hp.map((h,j)=>h>0?Math.min(f.mx[j],h+Math.round(f.mx[j]*.1)):h);f.zone="Survie · série "+(f.sv+1);f.log+=" · 🔥 Série "+f.sv+" franchie ! +10 % de PV. La suivante arrive…";const t=$$("battleTitle");if(t)t.textContent=f.zone;renderBattle();return}
 return _keM2()};
/* ---- Sprint (10 combats chronométrés) ---- */
const SPR_N=10;
MODES.sprint=function(o){const k=Math.max(0,Math.min(SPR_N-1,o.k||0)),base=Math.max(3,Math.round((S.stage||1)*.6)),n=base+k,z=zoneOf(Math.min(100,n));
 return{eq:n,label:"Sprint · "+(k+1)+"/"+SPR_N,enemies:mkEnemies(n,{emo:z[1],name:z[0],el:null,els:[EL[rnd(3)],EL[rnd(3)],z[2]],boss:k===SPR_N-1,hp:.85}).map(e=>(e.tr="",e))}};
const sprFmt=ms=>{const s=Math.round(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const _sbM2=startBattle;startBattle=function(o){const t=o||lastB;if(t&&t.mode==="sprint"&&!(t.k>0)){ens();S.m2.sprT0=Date.now();save()}
 if(t&&t.mode==="short"){ens();if((t.k||1)>S.m2.shortSt+1){toast("Termine d'abord le niveau précédent.");return}}
 /* Revanche : enregistre les tirages du hasard du combat (ou rejoue ceux d'un combat perdu) */
 M2R.rec=[];M2R.play=t&&t.rev&&Array.isArray(t.rev)?t.rev.slice():null;const r=_sbM2(o);const f=fight;if(f&&f.mx&&!f.m2Rec){f.m2Rec=M2R.rec;f.m2Rev=!!M2R.play}return r};
/* ---- Combats-énigmes ---- */
const PUZ=[{n:"Le trio rouge",orbs:["redorb","redorb","blueorb","greenorb","redorb","purpleorb","blueorb","greenorb","goldorb"],el:"greenorb",acts:4,k:3.2},
 {n:"Marée montante",orbs:["blueorb","greenorb","blueorb","redorb","blueorb","redorb","goldorb","blueorb","purpleorb"],el:"redorb",acts:4,k:3.4},
 {n:"La forêt patiente",orbs:["greenorb","greenorb","purpleorb","greenorb","redorb","greenorb","blueorb","goldorb","greenorb"],el:"blueorb",acts:3,k:2.4},
 {n:"Orage d'or",orbs:["goldorb","purpleorb","goldorb","purpleorb","goldorb","purpleorb","redorb","blueorb","greenorb"],el:"purpleorb",acts:5,k:4},
 {n:"Le grand mélange",orbs:["redorb","blueorb","greenorb","purpleorb","goldorb","redorb","blueorb","greenorb","purpleorb"],el:"redorb",acts:5,k:4.2},
 {n:"Coup de grâce",orbs:["blueorb","blueorb","blueorb","blueorb","redorb","greenorb","purpleorb","goldorb","redorb"],el:"redorb",acts:2,k:2},
 {n:"Le marathon",orbs:["greenorb","redorb","blueorb","greenorb","redorb","blueorb","greenorb","redorb","blueorb"],el:"purpleorb",acts:7,k:5.6},
 {n:"Le défi final",orbs:["purpleorb","goldorb","redorb","goldorb","purpleorb","blueorb","greenorb","goldorb","purpleorb"],el:"goldorb",acts:6,k:4.6}];
MODES.puzzle=function(o){const P=PUZ[o.p]||PUZ[0],eq=m2Eq();return{eq,label:"Énigme · "+P.n,enemies:[0,1].map(()=>({hp:0,max:1,e:"🦴",name:"—",el:P.el,atk:1})).concat(mkEnemies(eq,{emo:["🗿","🗿","🗿"],name:"Énigme",el:P.el}).slice(2).map(e=>(e.tr="",e.boss=false,e.name="Gardien de l'énigme",e._nm=1,e)))}};
function m2PuzSetup(f){if(!m2On(f,"puzzle")||f.pzO===f.o)return;f.pzO=f.o;const P=PUZ[f.o.p]||PUZ[0];f.wave=2;f._lw=undefined;document.querySelectorAll("#fxLayer .wavebn").forEach(x=>x.remove());
 const N=f.orbs.length;f.orbs=Array.from({length:N},(_,i)=>P.orbs[i%P.orbs.length]);if(f.big4&&typeof c4Orbs==="function")try{c4Orbs(f)}catch(e){}
 const best=Math.max(...["redorb","blueorb","greenorb","purpleorb","goldorb"].map(c=>orbPreview(c)||0),1),e=f.enemies[2];e.max=e.hp=Math.round(best*P.k);e.atk=Math.round(e.atk*.6);f.pzAct=0;f.pzMax=P.acts}
/* ---- Miroir, Sans orbes, Entraînement, Découverte ---- */
MODES.mirror=function(o){const t=S.team.slice(0,3),eq=m2Eq();const en=mkEnemies(eq,{emo:t.map(d=>SPEC[d.type].e),names:t.map(d=>"Reflet · "+SPEC[d.type].name),els:t.map(d=>SPEC[d.type].element),pts:t.map(d=>d.type),boss:true,hp:1.1,atk:1.05});
 en.forEach(e=>{e.tr="";e._nm=1});return{eq,label:"Miroir · ta propre meute",enemies:en}};
MODES.noorb=function(o){const eq=Math.max(3,m2Eq()-4),z=zoneOf(Math.min(100,Math.max(1,eq)));return{eq,label:"Sans orbes · compétences seulement",enemies:mkEnemies(eq,{emo:z[1],name:z[0],el:null,els:[EL[rnd(3)],EL[rnd(3)],z[2]],hp:.7,atk:.8}).map(e=>(e.tr="",e))}};
MODES.train=function(o){const eq=m2Eq();return{eq,label:"Entraînement · mannequin",enemies:[0,1].map(()=>({hp:0,max:1,e:"🦴",name:"—",el:"goldorb",atk:0})).concat([{hp:9999999,max:9999999,e:"🗿",name:"Mannequin d'entraînement",el:"goldorb",atk:0,boss:false,tr:"",_nm:1}])}};
const SHORT_L=["Naufragé sur une île inconnue, tu apprivoises tes premiers dinos.","La jungle cache des créatures sauvages : ta meute grandit.","Le Dr Elara te confie une balise : il faut rallumer les autres.",
 "Les ruines englouties murmurent le nom de la Graine.","Le premier gardien se dresse devant toi !","Le volcan gronde : la fureur de l'île monte.","Les wyvernes gardent le chemin de l'obélisque.",
 "Kael, un autre dresseur, te défie en chemin.","L'obélisque s'ouvre : la Graine est tout près.","Le dernier gardien. Calme la fureur de l'île !"];
MODES.short=function(o){const k=Math.max(1,Math.min(10,o.k||1)),eq=k*2+1,z=ZONES[Math.min(3,Math.floor((k-1)/2.5))];
 return{eq,label:"Découverte · "+k+"/10 · "+z[0],enemies:mkEnemies(eq,{emo:[z[1][0],z[1][1],k%5===0?"👹":z[1][2]],name:z[0],el:null,els:[EL[rnd(3)],EL[rnd(3)],z[2]],boss:k%5===0,hp:.8,atk:.8}).map(e=>(e.tr="",e))}};
/* ---- règles en combat ---- */
const _rbM2=renderBattle;renderBattle=function(){const f0=fight;if(f0&&f0.mx&&!f0.over){m2PuzSetup(f0);if(m2On(f0,"train")&&f0.wave!==2){f0.wave=2;f0._lw=undefined}if(m2On(f0,"short")&&f0.shO!==f0.o){f0.shO=f0.o;f0.log="📖 "+SHORT_L[(f0.o.k||1)-1]+" · "+(f0.log||"")}}
 _rbM2();const f=fight,box=$$("battleArea");if(!f||!box)return;const ch=box.querySelector(".sHud .fchips");
 if(m2On(f)){const st=box.querySelector(".battlestage");if(st)st.classList.add("m2-"+f.o.mode)}
 if(ch&&!f.over){let h="";if(m2On(f,"surv"))h=`<span class="chip hot m2c">🔥 Série ${(f.sv||0)+1} · record ${S.m2.svBest}</span>`;
  if(m2On(f,"sprint"))h=`<span class="chip m2c m2clock">⏱️ ${sprFmt(Date.now()-(S.m2.sprT0||Date.now()))}</span>`;
  if(m2On(f,"puzzle"))h=`<span class="chip hot m2c">🧩 Actions : ${f.pzAct||0}/${f.pzMax}</span>`;
  if(m2On(f,"noorb"))h=`<span class="chip m2c">🚫 Sans orbes : compétences, super, Garde</span>`;
  if(m2On(f,"train")){const T=f.trn||{d:0,n:0,b:0};h=`<span class="chip good m2c">🎯 ${T.d.toLocaleString("fr-FR")} dégâts · ${T.n} actions · moy. ${T.n?Math.round(T.d/T.n).toLocaleString("fr-FR"):0} · record ${T.b.toLocaleString("fr-FR")}</span>`}
  if(m2On(f,"surv")||m2On(f,"mirror")||m2On(f,"short")||m2On(f,"train")||m2On(f,"sprint")||m2On(f,"puzzle")||m2On(f,"noorb"))ch.insertAdjacentHTML("beforeend",h)}
 m2TameBtn(f,box,ch);m2RevBtn(f,box)};
const _aaM2=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(m2On(f,"train")&&dmg>0){const T=f.trn||(f.trn={d:0,n:0,b:0});T.d+=dmg;T.n++;T.b=Math.max(T.b,dmg)}
 const r=_aaM2(dmg,msg,endTurn);if(m2On(f,"puzzle")&&!f.over&&dmg>=0){f.pzAct=(f.pzAct||0)+1;if(f.pzAct>=f.pzMax&&f.enemies[2].hp>0&&!f.over){f.over="lose";f.log+=" · 🧩 Plus d'action : l'énigme résiste.";if(!f.settled)settleLose();renderBattle()}}return r};
const _toM2=tapOrb;tapOrb=function(i){const f=fight;if(m2On(f,"noorb")&&!f.over){if(typeof guard==="function")return guard();return}return _toM2(i)};
const _etM2=enemyTurn;enemyTurn=function(){const f=fight;const r=_etM2();if(m2On(f,"noorb")&&!f.over){f.cd=f.cd.map(c=>Math.max(0,c-1));f.sp=Math.min(100,(f.sp||0)+25)}return r};
/* ---- victoires et défaites ---- */
function m2Win(f){ens();const m=f.o.mode,R={stone:30+3*f.n};let extra="";const M=S.m2;
 if(m==="sprint"){const k=f.o.k||0;if(k<SPR_N-1){extra=`<div class="tiny">⏱️ ${sprFmt(Date.now()-M.sprT0)}</div><button class="wide blue" onclick="startBattle({mode:'sprint',k:${k+1}})">COMBAT SUIVANT (${k+2}/${SPR_N})</button>`}
  else{const t=Date.now()-M.sprT0,rec=!M.sprBest||t<M.sprBest;if(rec)M.sprBest=t;extra=`<div class="tiny ok">🏁 Sprint terminé en ${sprFmt(t)}${rec?" : nouveau record !":" (record "+sprFmt(M.sprBest)+")"}</div>`;if(m2Daily("sprint"))Object.assign(R,{tickets:2,essence:20});bump("sprints")}}
 if(m==="puzzle"){const p=f.o.p;if(!M.puz[p]){M.puz[p]=1;Object.assign(R,{tickets:1,essence:15});extra='<div class="tiny ok">🧩 Énigme résolue pour la première fois !</div>'}bump("puzzles")}
 if(m==="mirror"){if(m2Daily("mirror"))Object.assign(R,{tickets:1,essence:20});extra='<div class="tiny ok">🪞 Tu as vaincu ton propre reflet.</div>';bump("mirrors")}
 if(m==="noorb"){if(m2Daily("noorb"))Object.assign(R,{tickets:1,essence:15});bump("noorbs")}
 if(m==="short"){const k=f.o.k||1;if(k>M.shortSt){M.shortSt=k;R.essence=5+k;if(k===10){Object.assign(R,{tickets:5,essence:50});extra='<div class="tiny ok">📖 Découverte terminée : bienvenue sur l\'île ! L\'histoire complète t\'attend.</div>'}}
  if(k<10)extra+=`<button class="wide blue" onclick="startBattle({mode:'short',k:${k+1}})">NIVEAU SUIVANT (${k+1}/10)</button>`}
 return{R,extra,loot:[]}}
const _ewM2=eventWin;eventWin=function(f,n){return m2On(f)?m2Win(f):_ewM2(f,n)};
const _slM2=settleLose;settleLose=function(){const f=fight;_slM2();if(!m2On(f))return;ens();
 if(m2On(f,"surv")){const n=f.sv||0,rec=n>S.m2.svBest;if(rec)S.m2.svBest=n;const R={stone:60*n,essence:4*n};if(n>=5)R.tickets=Math.floor(n/5);give(R);bump("survs");save();
  f.report=`<div class="panel"><b>🔥 Survie : ${n} série${n>1?"s":""} franchie${n>1?"s":""}${rec?" — nouveau record !":""}</b><div class="tiny muted">Record : ${S.m2.svBest} · récompense : ${fmt(R)||"rien"}</div></div>`}
 if(m2On(f,"sprint"))f.report=`<div class="panel tiny muted">⏱️ Sprint interrompu au combat ${(f.o.k||0)+1}/${SPR_N}. Recommence depuis le début.</div>`};
if(typeof chainNext==="function"){const _cnM2=chainNext;chainNext=function(f){if(m2On(f,"sprint")){const k=(f.o.k||0)+1;return k<SPR_N?{mode:"sprint",k}:null}if(m2On(f,"short")){const k=(f.o.k||1)+1;return k<=10?{mode:"short",k}:null}return m2On(f)?null:_cnM2(f)}}
if(typeof balKey==="function"){const _bkM2=balKey;balKey=function(f){return m2On(f)?"mode "+f.o.mode:_bkM2(f)}}
const _elM2=enemyLook;enemyLook=function(e,f){f=f||fight;if(m2On(f,"mirror")&&e&&e.pt&&SPEC[e.pt])return{cor:e.pt,boss:!!e.boss};return _elM2(e,f)};
/* ---- Apprivoisement : purifier un dino corrompu affaibli ---- */
const TAME={cost:30,p:.6,day:3,hp:.15};
function m2TameTarget(f){if(!f||f.over||!f.enemies||m2On(f)||f.raid||(f.o&&(f.o.mode==="arena"||f.o.mode==="rival"||f.o.mode==="duel")))return null;const e=f.enemies[f.wave];if(!e||e.boss||e.hp<=0||e.hp>e.max*TAME.hp)return null;
 let L=null;try{L=enemyLook(e,f)}catch(x){}const k=L&&L.cor;return k&&SPEC[k]&&!SPEC[k].ex?k:null}
function m2TameBtn(f,box,ch){const k=m2TameTarget(f);if(!k||!ch||ch.querySelector(".m2tame"))return;ens();const left=TAME.day-S.m2.tame.n;
 ch.insertAdjacentHTML("beforeend",`<button class="m2tame" ${left>0?"":"disabled"} onclick="m2Tame()">💠 Purifier (${TAME.cost} 🔮 · ${left}/${TAME.day})</button>`)}
function m2Tame(){const f=fight,k=m2TameTarget(f);if(!k)return;ens();if(S.m2.tame.n>=TAME.day){toast("Plus de purification aujourd'hui.");return}if((S.essence||0)<TAME.cost){toast("Il faut "+TAME.cost+" essences.");return}
 S.essence-=TAME.cost;S.m2.tame.n++;if(Math.random()<TAME.p){const lv=Math.max(1,Math.round((f.n||2)/2));S.team.push({id:S.nextId++,type:k,level:lv,xp:0,v:"normal"});bump("tamed");save();
  toast("💠 "+SPEC[k].name+" est purifié et rejoint ta meute !",3200);try{sfx&&sfx("win")}catch(x){}f.enemies[f.wave].hp=0;f.log="💠 Purification réussie : "+SPEC[k].name+" rejoint ta meute (niv. "+lv+").";killEnemy();if(!f.over)renderBattle()}
 else{save();f.combo=0;f.last=null;afterAction(0,"💠 La purification échoue… le dino corrompu se débat.",true)}}
/* ---- Revanche : même tirage du hasard ---- */
const M2R={rec:null,play:null};
(()=>{const _mr=Math.random;Math.random=function(){let v;if(M2R.play&&M2R.play.length)v=M2R.play.shift();else v=_mr();if(M2R.rec&&M2R.rec.length<20000)M2R.rec.push(v);return v}})();
function m2RevBtn(f,box){if(!f||f.over!=="lose"||!f.m2Rec||!f.m2Rec.length||!f.o||f.raid||m2On(f,"surv")||m2On(f,"sprint")||box.querySelector(".m2rev"))return;
 box.insertAdjacentHTML("beforeend",`<div class="panel m2rev"><b>🔁 Revanche</b><div class="tiny muted">Rejoue ce combat avec exactement le même tirage (orbes, ennemis, coups critiques) : à toi de jouer mieux !</div><button class="wide blue" onclick="m2Revenge()">REJOUER AVEC LE MÊME TIRAGE</button></div>`)}
function m2Revenge(){const f=fight;if(!f||!f.m2Rec)return;const o={...f.o,rev:f.m2Rec.slice()};delete o.go;if(o.mode==="arena")o.go=true;fight=null;startBattle(o)}
/* le tirage enregistré s'arrête quand le combat se termine */
const _rbM2b=renderBattle;renderBattle=function(){_rbM2b();const f=fight;if(f&&f.over&&M2R.rec===f.m2Rec){M2R.rec=null;M2R.play=null}};
/* ---- écran ---- */
const M2_CARDS=[["surv","🔥","Survie","Vagues infinies avec une seule équipe ; les PV restent d'une série à l'autre (+10 % entre deux séries). Récompense selon le nombre de séries.",()=>"Record : "+S.m2.svBest+" séries"],
 ["sprint","⏱️","Sprint","10 combats d'affilée, chronométrés. Bats ton record !",()=>"Record : "+(S.m2.sprBest?sprFmt(S.m2.sprBest):"—")],
 ["puzzle","🧩","Combats-énigmes","Un plateau imposé et un nombre d'actions limité : trouve le bon ordre.",()=>Object.keys(S.m2.puz).length+" / "+PUZ.length+" résolues"],
 ["mirror","🪞","Miroir","Affronte le reflet corrompu de ta propre meute.",()=>S.m2.day.mirror===todayK()?"Récompense du jour reçue":"Récompense du jour : +1 🎟️ +20 🔮"],
 ["noorb","🚫","Sans orbes","Aucune orbe : compétences, super et Garde seulement. Les recharges et la super vont plus vite.",()=>S.m2.day.noorb===todayK()?"Récompense du jour reçue":"Récompense du jour : +1 🎟️ +15 🔮"],
 ["train","🎯","Entraînement","Un mannequin qui ne riposte pas : teste tes dégâts (total, moyenne, meilleur coup).",()=>"Sans récompense"],
 ["short","📖","Découverte","L'histoire de l'île en 10 niveaux courts, pour découvrir le jeu.",()=>S.m2.shortSt+" / 10"]];
function m2Go(m){ens();if(m==="puzzle")return m2PuzPick();if(m==="short")return startBattle({mode:"short",k:Math.min(10,S.m2.shortSt+1)});fight=null;startBattle({mode:m})}
function m2PuzPick(){ens();openModal(`<h3 style="margin:0 0 6px">🧩 Combats-énigmes</h3><div class="m2puz">${PUZ.map((P,i)=>`<button class="${S.m2.puz[i]?"secondary":"blue"}" onclick="closeModal();fight=null;startBattle({mode:'puzzle',p:${i}})"><b>${S.m2.puz[i]?"✅ ":""}${esc(P.n)}</b><small>${P.acts} actions · ennemi ${ICO[P.el]||""}</small></button>`).join("")}</div><div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
function renderModes2(){const el=$$("modes2");if(!el)return;ens();
 el.innerHTML=`<div class="banner"><div class="eyebrow">MODES DE JEU</div><h1>Défis et entraînements</h1><p>Des façons différentes de jouer avec ta meute. Pendant les combats, tu peux aussi <b>purifier</b> un dino corrompu affaibli (💠) et prendre ta <b>revanche</b> après une défaite (🔁).</p></div>
 <div class="m2grid">${M2_CARDS.map(([k,i,n,d,sub])=>`<div class="panel m2card"><div class="row"><span class="bigicon">${i}</span><div class="grow"><b>${n}</b><div class="tiny muted">${d}</div><div class="tiny">${sub()}</div></div></div><button class="wide ${k==="train"?"secondary":"blue"}" data-m="${k}" onclick="m2Go('${k}')">${k==="puzzle"?"CHOISIR":"JOUER"}</button></div>`).join("")}</div>`}
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="modes2" class="screen"></section>');
GRP.adv.screens.push(["modes2","🎮","Modes"]);SCR2G.modes2="adv";SUBS.push(["modes2","🎮","Modes"]);ADV.add("modes2");BZONE.modes2=()=>"ruines";
const _rM2=render;render=function(){_rM2();if(screen==="modes2")renderModes2();if(screen==="battle"&&m2On(fight,"sprint")&&!fight.over){}};
setInterval(()=>{try{const c=document.querySelector("#battleArea .m2clock");if(c&&m2On(fight,"sprint")&&!fight.over)c.textContent="⏱️ "+sprFmt(Date.now()-(S.m2.sprT0||Date.now()))}catch(e){}},1000);
ACH.push(["m2a","Survivant","Franchir 10 séries en Survie",()=>(S.m2||{}).svBest||0,10,{tickets:5}],["m2b","Casse-tête","Résoudre les 8 combats-énigmes",()=>Object.keys((S.m2||{}).puz||{}).length,8,{tickets:5,essence:40}],
 ["m2c","Dresseur bienveillant","Purifier 3 dinos corrompus",()=>(S.cnt||{}).tamed||0,3,{essence:40}],["m2d","Éclair","Finir un Sprint",()=>(S.cnt||{}).sprints||0,1,{tickets:2}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Modes de jeu","Aventure > Modes : Survie (vagues infinies, PV conservés), Sprint (10 combats chronométrés), Combats-énigmes (plateau imposé, actions limitées), Miroir (ta propre meute), Sans orbes, Entraînement (mannequin) et Découverte (histoire courte). En combat, un dino corrompu (non boss) à moins de 15 % de PV peut être purifié (30 🔮, 60 % de réussite, 3 fois par jour) : il rejoint ta meute. Après une défaite, « Revanche » rejoue le combat avec le même tirage."]);
