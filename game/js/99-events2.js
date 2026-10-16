/* Événements et défis (0.26).
   - 4 nouveaux événements de la semaine (EVENTS passe de 4 à 8 ; ajoutés à la fin pour que l'événement de la semaine en
     cours ne change pas) : Grand Froid et Nuit des Abysses (créatures du Grand Nord, décors propres via zn), Saison des
     amours (nest:2 → incubation ×2 au Nid, œufs à gagner), Pluie de météores (ess:2 → essence doublée).
   - Défi du jour : une règle du jour en plus du trait (DRULES, choisie par dayHash ; DRULE_FORCE pour les tests) :
     Colosse solitaire, Surcharge, Coups critiques, Blessures profondes. Effets gardés par drRule(fight). */
EVENTS.push({n:"Grand Froid",e:"❄️",mat:"hide",el:"blueorb",zn:"toundra",en:["⛄","🐻","🐯"],d:"Les bêtes du Grand Nord descendent sur l'île : cuir 🟤 en abondance."},
 {n:"Saison des amours",e:"💞",mat:"amber",el:"greenorb",zn:"jungle",nest:2,en:["🐥","🐗","🐺"],d:"Le Nid d'élevage s'active : incubation deux fois plus rapide, et des œufs à gagner à chaque épreuve."},
 {n:"Nuit des Abysses",e:"🌊",mat:"crystal",el:"purpleorb",zn:"abysses",en:["🦑","🎐","🔦"],d:"Les créatures des profondeurs remontent à la surface : cristaux 💎 et équipement plus fréquent."},
 {n:"Pluie de météores",e:"☄️",mat:"bone",el:"redorb",zn:"volcan",ess:2,en:["🔥","🐲","🗿"],d:"Des éclats d'étoile tombent du ciel : essence 🔮 doublée."});
const evOfZone=z=>{const s=z||"";return EVENTS.find(e=>e.zn&&s.indexOf(e.n)===0)};
const _szEv2=stageZone;stageZone=function(z){const e=evOfZone(z);return e?e.zn:_szEv2(z)};
if(typeof BZONE!=="undefined"&&BZONE.events){const _bzEv2=BZONE.events;BZONE.events=()=>{const e=EVENTS[wkNow()%EVENTS.length];return e&&e.zn||_bzEv2()}}
const _ewEv2=eventWin;eventWin=function(f,n){const r=_ewEv2(f,n);if(!f||!f.o||f.o.mode!=="event"||!r||!r.R)return r;const ev=EVENTS[wkNow()%EVENTS.length],t=f.o.t||0;
 if(ev.ess>1&&r.R.essence)r.R.essence*=ev.ess;
 if(ev.nest>1&&Math.random()<.3+.15*t){const k=t>=2?"rare":"common";if(addEgg(k))r.extra=(r.extra||"")+`<div class="tiny ok">🥚 ${EGGS[k].n} trouvé : il rejoint l'incubateur.</div>`}
 if(ev.n==="Nuit des Abysses"&&Array.isArray(r.loot)&&!r.loot.length&&Math.random()<.4)r.loot.push(rollItem(n,1));
 return r};
/* ---- Défi du jour : règle du jour ---- */
let DR_TUNE={giantHp:.8,giantAtk:1.1,chargeAtk:1.1,chargeSp:1.25,deepHp:.95};   // réglé par tests/test_balance_daily.py
const DRULES=[{k:"giant",i:"🦣",n:"Colosse solitaire",d:"Un seul ennemi, géant : il réunit 80 % des PV des trois et frappe 10 % plus fort"},
 {k:"charge",i:"⚡",n:"Surcharge",d:"La jauge de super se remplit deux fois plus vite et tes supers frappent 25 % plus fort, mais les ennemis frappent 10 % plus fort"},
 {k:"crit",i:"💥",n:"Coups critiques",d:"Chaque coup, le tien comme celui des ennemis, a 25 % de chances d'être critique (×1,8)"},
 {k:"deep",i:"🩸",n:"Blessures profondes",d:"Aucun soin possible (compétences, super, sacoche, attributs), mais les ennemis ont 5 % de PV en moins"}];
let DRULE_FORCE=null;
const _dchI2=dchInfo;dchInfo=function(){const I=_dchI2();I.rule=(DRULE_FORCE&&DRULES.find(r=>r.k===DRULE_FORCE))||DRULES[(dayHash()>>6)%DRULES.length];return I};
const drRule=f=>f&&!f.over&&f.daily&&f.daily.rule?f.daily.rule.k:"";
const _ensEv2=ens;ens=function(){_ensEv2();if(S.dch&&(!S.dch.rules||typeof S.dch.rules!=="object"))S.dch.rules={}};
const _sbEv2=startBattle;startBattle=function(o){const r=_sbEv2(o),f=fight;if(f&&f.daily&&f.daily.rule&&!f.drSet){f.drSet=1;const R=f.daily.rule.k;
  if(R==="giant"){const e=f.enemies[2];e.hp=e.max=Math.round(f.enemies.reduce((t,x)=>t+x.max,0)*DR_TUNE.giantHp);e.atk=Math.round(e.atk*DR_TUNE.giantAtk);if(e.a0)e.a0=e.atk;if(e.tr==="shield")e.sh=Math.round(e.max*.2);f.wave=2;f.turn=0;f._lw=2;document.querySelectorAll("#fxLayer .wavebn").forEach(x=>x.remove())}
  else if(R==="charge")f.enemies.forEach(e=>{e.atk=Math.round(e.atk*DR_TUNE.chargeAtk);if(e.a0)e.a0=e.atk});
  else if(R==="deep")f.enemies.forEach(e=>{e.hp=e.max=Math.round(e.max*DR_TUNE.deepHp);if(e.tr==="shield")e.sh=Math.round(e.max*.2)});
  f.log+=" · "+f.daily.rule.i+" "+f.daily.rule.n+" : "+f.daily.rule.d+".";renderBattle()}return r};
/* Surcharge : la super gagnée par une orbe compte double et la super frappe plus fort (special enveloppé avant 99-juice, qui la diffère) */
const _spEv2=special;special=function(){const f=fight;if(drRule(f)==="charge")f._spX=1;try{return _spEv2.apply(this,arguments)}finally{if(f)f._spX=0}};
const _toEv2=tapOrb;tapOrb=function(i){const f=fight;if(drRule(f)==="charge")f._sp0=f.sp;try{return _toEv2(i)}finally{if(f)f._sp0=null}};
const _aaEv2=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight,R=drRule(f);
 if(R==="charge"&&f._sp0!=null){const d=f.sp-f._sp0;if(d>0)f.sp=Math.min(100,f.sp+d);f._sp0=null}
 if(R==="charge"&&f._spX&&dmg>0){dmg=Math.round(dmg*DR_TUNE.chargeSp);f.pop=dmg;msg+=" · ⚡ surcharge ×"+String(DR_TUNE.chargeSp).replace(".",",")}
 if(R==="crit"&&(dmg>0||(f._skx&&f._skx.dmg>0))&&Math.random()<.25){dmg=Math.round(dmg*1.8);if(f._skx)f._skx.dmg=Math.round(f._skx.dmg*1.8);f.pop=dmg;msg+=" · 💥 CRITIQUE ×1,8"}
 return _aaEv2(dmg,msg,endTurn)};
const _hdEv2=hitDino;hitDino=function(k,base,e){const f=fight;if(drRule(f)==="crit"&&Math.random()<.25){base*=1.8;f.log+=" · 💥 critique ennemi"}return _hdEv2(k,base,e)};
/* Blessures profondes : les PV ne remontent jamais (plafond = plus bas niveau atteint), vérifié avant le tour ennemi et à chaque rendu.
   Le plafond est posé après le premier rendu (chef et liens appliqués par tmApply). */
const drDeep=f=>{if(drRule(f)!=="deep"||!f.hpCap)return;f.hp=f.hp.map((h,k)=>Math.min(h,f.hpCap[k]));f.hpCap=f.hp.slice()};
const _etEv2=enemyTurn;enemyTurn=function(){drDeep(fight);return _etEv2()};
const _rbEv2=renderBattle;renderBattle=function(){const f=fight;drDeep(f);_rbEv2();if(!f||!f.daily||!f.daily.rule||f.over)return;if(f.daily.rule.k==="deep"&&!f.hpCap&&f.mx)f.hpCap=f.hp.slice();
 const ch=document.querySelector("#battleArea .sHud .fchips");if(ch&&!ch.querySelector(".drchip"))ch.insertAdjacentHTML("beforeend",`<span class="chip hot drchip" title="${esc(f.daily.rule.d)}">${f.daily.rule.i} ${esc(f.daily.rule.n)}</span>`)};
if(typeof pouchUse==="function"){const _puEv2=pouchUse;pouchUse=function(k){if(k==="heal"&&drRule(fight)==="deep"){toast("🩸 Blessures profondes : aucun soin possible aujourd'hui.");return}return _puEv2(k)}}
/* une règle réussie est notée (succès « Toutes les règles ») */
const _winEv2=win;win=function(){const f=fight,was=f&&f.over;_winEv2();if(f&&f.over==="win"&&!was&&f.daily&&f.daily.rule){ens();if(!S.dch.rules[f.daily.rule.k]){S.dch.rules[f.daily.rule.k]=1;save()}}};
const _rdEv2=renderDaily;renderDaily=function(){_rdEv2();const I=dchInfo(),m=document.querySelector("#daily .dmods");if(m&&I.rule&&!m.querySelector(".drule"))m.insertAdjacentHTML("beforeend",`<div class="dmod drule"><span>${I.rule.i}</span><div><b>Règle du jour : ${esc(I.rule.n)}</b><div class="muted tiny">${esc(I.rule.d)}.</div></div></div>`)};
ACH.push(["dch4","Maître des règles","Réussir le Défi du jour avec chacune des 4 règles du jour",()=>{ens();return DRULES.filter(r=>S.dch.rules[r.k]).length},4,{tickets:4,essence:40}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Règles du Défi du jour","Chaque jour, le Défi du jour ajoute une règle : Colosse solitaire (un seul ennemi géant), Surcharge (super deux fois plus rapide, ennemis plus forts), Coups critiques (pour tout le monde) ou Blessures profondes (aucun soin, ennemis plus fragiles). Les événements de la semaine passent à 8, dont la Saison des amours (incubation ×2 au Nid) et la Pluie de météores (essence doublée)."]);
