/* Grand Nord II (0.37) : chapitre 3 « volcan sous-glaciaire » (20 niveaux, moteur des régions), mode difficile avec étoiles
   noires, gardien de la semaine qui revient plus fort à chaque victoire, expédition vers le Grand Nord (cristaux), blizzard
   (orbes cachées), équipement de froid (+15 % dans le Grand Nord), faune apprivoisable (mammifères), aurore boréale animée,
   sons d'ambiance de vent, bestiaire du Grand Nord avec récompenses. */
const _ensF2=ens;ens=function(){_ensF2();const F=S.far;if(!F)return;let X=F.x;if(!X||typeof X!=="object")X=F.x={};if(!X.hs||typeof X.hs!=="object")X.hs={};if(!(X.hard>=0))X.hard=0;if(!(X.gw>=0))X.gw=0;if(typeof X.gwk!=="number")X.gwk=-1;if(!X.cx||typeof X.cx!=="object")X.cx={}};
const farOn=f=>!!(f&&f.o&&(f.o.mode==="far"||(f.o.mode==="region"&&f.o.r==="subglac")));
/* ---- chapitre 3 : volcan sous-glaciaire (moteur des régions, 99-regions) ---- */
if(typeof RG!=="undefined"){RG.subglac={i:"🌋",n:"Le volcan sous-glaciaire",sub:"Grand Nord · chapitre 3",N:20,off:40,need:()=>!!(S.far&&S.far.stage>=(typeof FAR_N!=="undefined"?FAR_N:40)),needT:"Termine les 40 niveaux du Grand Nord.",eq:n=>Math.round(112+n*1.6),
 lab:"Grand Nord · volcan sous-glaciaire",em:["🔥","🧊","🐲","⛄","🦂"],el:"redorb",bm:["eruption","lianes"],mats:["crystal","amber"],mech:"blizzard",boss:{10:"Wyrm de magma gelé",20:"Le Cœur du Nord"},desc:"Sous la banquise, la lave et la glace s'affrontent. Un blizzard brouille parfois les orbes."};
 if(!RG_K.includes("subglac"))RG_K.push("subglac");try{ens()}catch(e){}}
const _szF2=stageZone;stageZone=function(z){return/sous-glaciaire/i.test(z||"")?"volcan":_szF2(z)};
/* ---- blizzard : dans le Grand Nord (35 % des combats) et tout le chapitre 3 ---- */
const _rbF2b=renderBattle;renderBattle=function(){const f=fight;if(f&&f.mx&&!f.over&&farOn(f)&&f.bzO!==f.o){f.bzO=f.o;f.bliz=f.o.mode==="region"||Math.random()<.35||!!f.o.hard}
 _rbF2b();const g=fight;if(!g||!g.bliz||g.over)return;const box=$$("battleArea");if(!box)return;const st=box.querySelector(".battlestage");if(st)st.classList.add("fzbliz");
 if(g.bzHide)box.querySelectorAll('.orbboard button.orb[onclick^="tapOrb("]').forEach(b=>{const i=+(/tapOrb\((\d+)/.exec(b.getAttribute("onclick"))||[])[1];if(g.bzHide.includes(i))b.classList.add("fzhide")});
 const ch=box.querySelector(".sHud .fchips");if(ch&&!ch.querySelector(".fzb"))ch.insertAdjacentHTML("beforeend",'<span class="chip fzb">🌨️ Blizzard</span>')};
const _etF2b=enemyTurn;enemyTurn=function(){const f=fight;const r=_etF2b();if(f&&f.bliz&&!f.over){const T=f.turn||0,N=f.orbs.length;if(T%4===2){f.bzHide=[...Array(N).keys()].sort(()=>Math.random()-.5).slice(0,Math.round(N/3));f.log+=" · 🌨️ Le blizzard voile des orbes"}else if(T%4===0)f.bzHide=null}return r};
/* ---- équipement de froid : objets « ❄️ » trouvés dans le Grand Nord, +15 % d'attaque et −15 % de dégâts reçus là-bas ---- */
const coldOf=d=>{try{return Object.values((d&&d.eq)||{}).some(id=>{const it=findItem(id);return!!(it&&it.cold)})}catch(e){return false}};
if(typeof rollItem==="function"){const _riF2=rollItem;rollItem=function(level,boost,slot){const it=_riF2(level,boost,slot);try{if(it&&farOn(fight)&&Math.random()<.4){it.cold=1;it.n="❄️ "+(it.n||"")}}catch(e){}return it}}
const _atF2=atkOf;atkOf=function(k){const v=_atF2(k),f=fight;if(!farOn(f))return v;const d=T3()[k];return d&&coldOf(d)?v*1.15:v};
const _hdF2=hitDino;hitDino=function(k,raw,e){const f=fight;if(farOn(f)){const d=T3()[k];if(d&&coldOf(d))raw*=.85}return _hdF2(k,raw,e)};
/* ---- mode difficile (étoiles noires) ---- */
const FH={hp:1.45,atk:1.2};
const farHardOpen=n=>{ens();return(S.far.stage||0)>=FAR_N&&n>=1&&n<=FAR_N&&n<=S.far.x.hard+1};
const _mfF2=MODES.far;MODES.far=function(o){const r=_mfF2(o);if(o.hard){r.enemies.forEach(e=>{e.hp=e.max=Math.round(e.max*FH.hp);e.atk=Math.round(e.atk*FH.atk);if(e.tr==="shield")e.sh=Math.round(e.max*.2)});r.label=r.label.replace("Grand Nord","Grand Nord ✦ difficile")}
 if(o.gw){const w=S.far.x.gw;r.enemies.forEach(e=>{e.hp=e.max=Math.round(e.max*(1.2+.15*w));e.atk=Math.round(e.atk*(1.1+.08*w))});r.label="Gardien de la semaine · niveau de menace "+(w+1)}return r};
const _sbF2=startBattle;startBattle=function(o){const t=o||lastB;if(t&&t.mode==="far"&&t.hard&&!farHardOpen(t.n)){toast("Mode difficile : termine le Grand Nord, puis avance niveau par niveau.");return}
 if(t&&t.mode==="far"&&t.gw){ens();if(S.far.x.gwk===wkNow()){toast("Le gardien de la semaine a déjà été vaincu. Il revient lundi, plus fort.");return}if((S.far.stage||0)<FAR_N){toast("Termine d'abord le Grand Nord.");return}}return _sbF2(o)};
const _ewF2=eventWin;eventWin=function(f,n){if(f&&f.o&&f.o.mode==="far"&&(f.o.hard||f.o.gw)){ens();const X=S.far.x,lv=f.o.n,R={stone:80+6*lv,essence:6+Math.floor(lv/3),crystal:2};let extra="";
  if(f.o.hard){const st=starsOf(f);if(st>(X.hs[lv]||0))X.hs[lv]=st;if(lv>X.hard){X.hard=lv;R.tickets=lv%10===0?3:1;extra='<div class="tiny ok">✦ Première victoire en mode difficile !</div>'}bump("farHard");
   if(lv<FAR_N&&farHardOpen(lv+1))extra+=`<button class="wide blue" onclick="startBattle({mode:'far',n:${lv+1},hard:1})">NIVEAU DIFFICILE SUIVANT (${lv+1})</button>`}
  if(f.o.gw){X.gw++;X.gwk=wkNow();Object.assign(R,{tickets:3,essence:40,amber:3});extra='<div class="tiny ok">🧊 Gardien de la semaine vaincu : il reviendra plus fort (menace '+(X.gw+1)+').</div>'}
  save();return{R,extra,loot:Math.random()<.5?[rollItem(f.n,1)]:[]}}return _ewF2(f,n)};
if(typeof chainNext==="function"){const _cnF2=chainNext;chainNext=function(f){if(f&&f.o&&f.o.mode==="far"&&f.o.gw)return null;if(f&&f.o&&f.o.mode==="far"&&f.o.hard){const n=f.o.n+1;return farHardOpen(n)?{mode:"far",n,hard:1}:null}return _cnF2(f)}}
const farGwN=()=>[10,20,30,40][wkNow()%4];
/* ---- faune apprivoisable : bêtes du Grand Nord affaiblies → mammifères ---- */
if(typeof m2TameTarget==="function"){const _ttF2=m2TameTarget;m2TameTarget=function(f){const k=_ttF2(f);if(k)return k;try{if(!farOn(f)||f.over)return null;const e=f.enemies[f.wave];if(!e||e.boss||e.hp<=0||e.hp>e.max*.15)return null;
 const L=["mammoth","smilo","megalo","cbear"].filter(x=>SPEC[x]);return L.length?L[hashS(String(e.e)+e.name)%L.length]:null}catch(x){return null}}}
/* ---- expédition vers le Grand Nord ---- */
if(typeof XZ!=="undefined"&&!XZ.some(z=>z.k==="nord")){XZ.push({k:"nord",n:"Grand Nord",i:"🧊",el:"blueorb",m:["crystal","amber"]})}
if(typeof xStart==="function"){const _xsF2=xStart;xStart=function(slot){if(XZ[xDraft.z]&&XZ[xDraft.z].k==="nord"&&(S.stage||0)<FAR_UNLOCK){toast("Expéditions vers le Grand Nord : histoire "+FAR_UNLOCK+" requise.");return}return _xsF2(slot)}}
/* ---- bestiaire du Grand Nord ---- */
const farFoes=()=>{const s=new Set();FAR_Z.forEach(z=>z.em.forEach(e=>{const k=typeof EN_SPR!=="undefined"&&EN_SPR[e];if(k)s.add(k)}));return[...s]};
const FAR_CXR=[[50,{tickets:3,crystal:5}],[100,{tickets:6,shards:20,essence:50}]];
function farCxClaim(p){ens();const L=farFoes(),n=L.filter(k=>S.foes&&S.foes[k]).length,pc=L.length?n/L.length*100:0,T=FAR_CXR.find(x=>x[0]===p);if(!T||S.far.x.cx[p]||pc<p)return;S.far.x.cx[p]=1;give(T[1]);save();toast("📘 Bestiaire du Grand Nord "+p+" % : "+fmt(T[1]),2800);render()}
/* ---- écran du Grand Nord : ajouts ---- */
const _rfF2=renderFar;renderFar=function(){_rfF2();const el=$$("far");if(!el)return;ens();const X=S.far.x,done=(S.far.stage||0)>=FAR_N,bn=el.querySelector(".banner");if(bn&&!bn.querySelector(".aurora"))bn.insertAdjacentHTML("afterbegin",'<div class="aurora"></div>');
 const L=farFoes(),n=L.filter(k=>S.foes&&S.foes[k]).length,cur=Math.min(FAR_N,X.hard+1),gn=farGwN(),B=FAR_BOSS[gn];
 el.insertAdjacentHTML("beforeend",`<div class="sectionhead"><h2>Au-delà du Grand Nord</h2></div><div class="m2grid">
 <div class="panel fz2"><b>✦ Mode difficile</b><div class="tiny muted">Les 40 niveaux, ennemis +45 % PV et +20 % ATQ, toujours sous le blizzard. Étoiles noires : ${Object.values(X.hs).reduce((a,b)=>a+b,0)} · progression ${X.hard}/${FAR_N}.</div>${done?`<button class="wide red" onclick="startBattle({mode:'far',n:${cur},hard:1})">✦ JOUER LE NIVEAU ${cur} EN DIFFICILE</button>`:'<div class="tiny">🔒 Termine le Grand Nord.</div>'}</div>
 <div class="panel fz2"><b>🧊 Gardien de la semaine : ${esc(B?B.n:"")}</b><div class="tiny muted">Il revient chaque semaine, plus fort à chaque défaite (menace ${X.gw+1}).</div>${done?(X.gwk===wkNow()?'<div class="tiny ok">Vaincu cette semaine ✅</div>':`<button class="wide red" onclick="startBattle({mode:'far',n:${gn},gw:1})">AFFRONTER (+3 🎟️ +40 🔮)</button>`):'<div class="tiny">🔒 Termine le Grand Nord.</div>'}</div>
 <div class="panel fz2"><b>🌋 Chapitre 3 : le volcan sous-glaciaire</b><div class="tiny muted">20 niveaux de plus (41 à 60), dans les régions.</div><button class="wide ${done?"blue":"secondary"}" ${done?"":"disabled"} onclick="rgCur='subglac';go('regions')">${done?"Y ALLER":"🔒 GRAND NORD 40"}</button></div>
 <div class="panel fz2"><b>📘 Bestiaire du Grand Nord</b><div class="tiny muted">${n}/${L.length} créatures vaincues</div><div class="progress"><i style="width:${L.length?n/L.length*100:0}%"></i></div><div class="c2row">${FAR_CXR.map(([p,R])=>`<button class="${X.cx[p]?"secondary":(L.length&&n/L.length*100>=p)?"blue":"secondary"}" ${!X.cx[p]&&L.length&&n/L.length*100>=p?"":"disabled"} onclick="farCxClaim(${p})">${X.cx[p]?"✅ ":""}${p} % : ${fmt(R)}</button>`).join("")}</div></div></div>
 <div class="panel tiny muted fz2i">❄️ Les objets trouvés dans le Grand Nord sont parfois des <b>équipements de froid</b> (+15 % d'attaque et −15 % de dégâts reçus dans le Grand Nord). Les bêtes du Grand Nord affaiblies (moins de 15 % de PV) peuvent être <b>apprivoisées</b> (💠) : elles rejoignent ta meute sous forme de mammifère. Les expéditions peuvent aussi partir vers le Grand Nord (cristaux).</div>`)};
/* ---- sons d'ambiance : vent glacé (bruit filtré) dans le Grand Nord ---- */
let FZA=null;
function fzAmb(on){try{if(on&&!FZA){if(PREFS.sound===false||PREFS.music===false)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ac=new C(),n=ac.createBufferSource(),b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}
  n.buffer=b;n.loop=true;const f=ac.createBiquadFilter();f.type="bandpass";f.frequency.value=500;f.Q.value=.7;const g=ac.createGain();g.gain.value=.05*((PREFS.vol??70)/100);const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.15;lg.gain.value=280;lfo.connect(lg).connect(f.frequency);
  n.connect(f).connect(g).connect(ac.destination);n.start();lfo.start();FZA={ac};window.__amb=1}
 else if(!on&&FZA){FZA.ac.close();FZA=null;window.__amb=0}}catch(e){}}
const _rF2=render;render=function(){_rF2();try{fzAmb(screen==="far"||(screen==="battle"&&farOn(fight)&&!fight.over))}catch(e){}};
ACH.push(["fz1","Blizzard","Terminer le Grand Nord en mode difficile",()=>((S.far||{}).x||{}).hard||0,FAR_N,{tickets:15,shards:40}],["fz2","Chasseur du froid","Vaincre 3 fois le gardien de la semaine",()=>((S.far||{}).x||{}).gw||0,3,{tickets:5,amber:5}],["fz3","Naturaliste polaire","Compléter le bestiaire du Grand Nord",()=>{const L=farFoes();return L.length?Math.round(L.filter(k=>S.foes&&S.foes[k]).length/L.length*100):0},100,{essence:50}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Au-delà du Grand Nord","Après les 40 niveaux : mode difficile (étoiles noires), gardien de la semaine (plus fort à chaque défaite), chapitre 3 sous-glaciaire (niveaux 41 à 60, dans les Régions). Le blizzard voile parfois des orbes. Les objets ❄️ du Grand Nord renforcent leur porteur là-bas. Les bêtes affaiblies peuvent être apprivoisées. Expéditions vers le Grand Nord pour des cristaux. Le bestiaire du Grand Nord donne des récompenses à 50 % et 100 %."]);
