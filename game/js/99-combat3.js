/* Combat II (0.29) : états ennemis (Brûlure, Gel, Saignement, Peur) déclenchés par les orbes, résistances selon l'élément
   et la créature, faiblesse propre à chaque créature (une famille de dinos lui fait +25 %, connue après l'avoir vaincue
   une fois : fiche d'ennemi et bestiaire), fiche d'ennemi au clic, terrains de combat (Boue, Lave, Glace, Brume) et
   objets qui tombent pendant le combat (plume, viande, éclat), à ramasser d'un clic sans perdre son tour.
   État : e.st={burn,bleed,fear} (tours restants), f.ter (terrain), f.item ({k,t}), f.c3boost (éclat). */
const C3={burn:.2,frz:.12,bleed:.2,fear:.15,burnPct:.03,bleedPct:.025,bossPct:.5,fearMul:.75,weak:1.25,terP:.3,itemP:.12};
const ST3={burn:{i:"🔥",n:"Brûlure",d:"perd 3 % de ses PV par tour (moitié pour un boss), 3 tours",orb:"redorb"},
 frz:{i:"🧊",n:"Gel",d:"saute son prochain tour",orb:"blueorb"},bleed:{i:"🩸",n:"Saignement",d:"perd 2,5 % de ses PV par tour (moitié pour un boss), 3 tours",orb:"greenorb"},
 fear:{i:"😱",n:"Peur",d:"frappe 25 % moins fort pendant 2 tours",orb:"purpleorb"}};
const TER3={boue:{i:"🟫",n:"Boue",d:"orbes 🌿 +20 %, orbes 🔥 −10 %",up:"greenorb",down:"redorb"},lave:{i:"🌋",n:"Coulée de lave",d:"orbes 🔥 +15 % ; chaque tour, tout le monde perd 2 % de ses PV",up:"redorb",mul:1.15},
 glace:{i:"🧊",n:"Sol gelé",d:"orbes 💧 +20 %, Gel deux fois plus fréquent",up:"blueorb"},brume:{i:"🌫️",n:"Brume",d:"orbes ⚡ +20 %, Peur deux fois plus fréquente",up:"purpleorb"}};
const ITEM3={plume:{i:"🪶",n:"Plume",d:"+15 % de super"},viande:{i:"🍖",n:"Viande",d:"soigne de 12 % le dino le plus blessé"},eclat:{i:"💎",n:"Éclat",d:"la prochaine orbe frappe ×1,5"}};
const FAMN3={T:"théropodes",C:"cératopsiens",A:"ankylosaures",G:"stégosaures",F:"ptérosaures",S:"sauropodes",H:"hadrosaures",M:"reptiles marins"};
/* faiblesse et résistances par créature */
function c3Key(e){try{return cxKey(e,fight)||""}catch(x){return ""}}
const c3Weak=e=>{const k=c3Key(e);return k?"TCAGFSHM"[hashS(k)%8]:""};
const c3Known=e=>{const k=c3Key(e);try{ens();return !!(k&&S.foes&&S.foes[k])}catch(x){return false}};
function c3Res(e){const r=new Set(),k=c3Key(e);if(e.el==="redorb")r.add("burn");if(e.el==="blueorb")r.add("frz");
 if(/golem|skull|bones|jelly|crystal|void/.test(k))r.add("bleed");if(/skull|bones|golem|void|eye/.test(k))r.add("fear");if(/mammoth|cavebear|smilodon/.test(k))r.add("frz");if(/salamander|wyvern/.test(k))r.add("burn");return r}
const c3On=f=>!!(f&&f.mx&&!f.over);
const c3Ter=f=>f&&f.ter?TER3[f.ter]:null;
/* ---- terrain (décidé au premier rendu : les modes remplacent le combat d'histoire) ---- */
function c3PickTer(f){if(f.terSet)return;f.terSet=1;const m=f.o&&f.o.mode||"story";if(f.raid||f.daily||!/^(story|dungeon|event|far|nightmare|maze|tower)$/.test(m)||Math.random()>=C3.terP)return;
 const z=stageZone(f.zone||"");f.ter=z==="jungle"?"boue":z==="volcan"?"lave":/toundra|glace/.test(z)?"glace":"brume"}
/* ---- dégâts : terrain (par couleur d'orbe), faiblesse (par famille), éclat ---- */
const _toC3=tapOrb;tapOrb=function(i){const f=fight;if(c3On(f)&&f.orbs&&!(typeof CUT!=="undefined"&&CUT)){const c=f.orbs[i],T=c3Ter(f);let m=1;if(T){if(T.up===c)m*=T.mul||1.2;if(T.down===c)m*=.9}if(f.c3boost){m*=1.5;f.c3boost=0;f._c3eclat=1}f.c3Now=m}
 try{return _toC3(i)}finally{if(f){f.c3Now=1;f._c3eclat=0}}};
const _atC3=atkOf;atkOf=function(k){const f=fight;let a=_atC3(k);if(!f||!f.enemies)return a;a*=f.c3Now||1;const e=f.enemies[f.wave],d=T3()[k];if(e&&d&&c3Weak(e)===(PORT[d.type]||["T"])[0])a*=C3.weak;return a};
/* ---- états : déclenchés par les orbes ---- */
const _aaC3=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(c3On(f)&&f._tap&&dmg>0){const e=f.enemies[f.wave],c=f._tap,R=c3Res(e),T=c3Ter(f);e.st=e.st||{};
  if(f._c3eclat)msg+=" · 💎 éclat ×1,5";
  const tryS=(k,p)=>{if(R.has(k)){return}if(Math.random()<p){if(k==="frz"){f.stun=Math.max(f.stun||0,1);msg+=" · 🧊 GEL : l'ennemi saute son tour"}else{e.st[k]=k==="fear"?2:3;msg+=" · "+ST3[k].i+" "+ST3[k].n}}};
  if(c==="redorb"&&BEAT[c]===e.el)tryS("burn",C3.burn);
  else if(c==="blueorb"&&BEAT[c]===e.el)tryS("frz",C3.frz*(T&&f.ter==="glace"?2:1)*(e.boss?C3.bossPct:1));
  else if(c==="greenorb"&&BEAT[c]===e.el)tryS("bleed",C3.bleed);
  else if(c==="purpleorb")tryS("fear",C3.fear*(f.ter==="brume"?2:1)*(e.boss?C3.bossPct:1))}
 return _aaC3(dmg,msg,endTurn)};
const _etC3=enemyTurn;enemyTurn=function(){const f=fight;if(!c3On(f))return _etC3();const e=f.enemies[f.wave],st=e&&e.st||{};
 for(const k of ["burn","bleed"])if(st[k]>0&&e.hp>0){const d=Math.max(1,Math.round(e.max*(k==="burn"?C3.burnPct:C3.bleedPct)*(e.boss?C3.bossPct:1)));e.hp-=d;st[k]--;f.log+=" · "+ST3[k].i+" "+d}
 if(f.ter==="lave"){if(e.hp>0)e.hp-=Math.max(1,Math.round(e.max*.02));f.hp=f.hp.map((h,j)=>h>0?Math.max(1,h-Math.round(f.mx[j]*.02)):h);f.log+=" · 🌋 lave"}
 if(e.hp<=0)return;try{return _etC3()}finally{if(st.fear>0)st.fear--;if(f.item){f.item.t--;if(f.item.t<=0)f.item=null}
  if(!f.over&&!f.item&&Math.random()<C3.itemP){const ks=Object.keys(ITEM3);f.item={k:ks[rnd(ks.length)],t:3}}}};
const _hdC3=hitDino;hitDino=function(k,base,e){const f=fight;if(c3On(f)&&e&&e.st&&e.st.fear>0)base*=C3.fearMul;return _hdC3(k,base,e)};
/* ---- objets à ramasser ---- */
function c3Pick(){const f=fight;if(!c3On(f)||!f.item)return;const k=f.item.k;f.item=null;
 if(k==="plume")f.sp=Math.min(100,f.sp+15);else if(k==="eclat")f.c3boost=1;else{let j=-1,lo=2;f.hp.forEach((h,i)=>{if(h>0&&h/f.mx[i]<lo){lo=h/f.mx[i];j=i}});if(j>=0)f.hp[j]=Math.min(f.mx[j],f.hp[j]+Math.round(f.mx[j]*.12))}
 f.log=ITEM3[k].i+" "+ITEM3[k].n+" ramassée : "+ITEM3[k].d;bump("items3");try{sfx("tap")}catch(e){}renderBattle()}
if(typeof autoPlay==="function"){const _apC3=autoPlay;autoPlay=function(){const f=fight;if(c3On(f)&&f.item)c3Pick();return _apC3()}}
/* ---- fiche d'ennemi ---- */
function c3Sheet(){const f=fight;if(!f||!f.enemies)return;const e=f.enemies[f.wave],R=c3Res(e),w=c3Weak(e),kn=c3Known(e),st=e.st||{},T=c3Ter(f);
 const tr=e.tr&&typeof TRAITS!=="undefined"&&TRAITS[e.tr]?TRAITS[e.tr]:null,sk=e.esk&&typeof SK!=="undefined"&&SK[e.esk]?SK[e.esk]:null;
 openModal(`<div class="c3sheet"><h3 style="margin:0 0 4px">${esc(e.name)} ${ICO[e.el]||""}</h3><div class="tiny muted">${e.boss?"Boss · ":""}PV ${Math.max(0,Math.round(e.hp))} / ${e.max} · ATQ ${Math.round(e.atk)} · rage ${Math.round(e.rage||0)} %</div>
  <div class="c3rows"><div><b>Faiblesse</b> ${w?(kn?`🎯 ${esc(FAMN3[w])} : +25 % de dégâts`:"❓ inconnue : bats cette créature une fois pour la découvrir"):"aucune"}</div>
  <div><b>Résistances</b> ${R.size?[...R].map(k=>ST3[k].i+" "+ST3[k].n).join(", "):"aucune"}</div>
  <div><b>Trait</b> ${tr?tr.i+" "+esc(tr.n)+" — "+esc(tr.d):"aucun"}</div><div><b>Compétence</b> ${sk?sk.i+" "+esc(sk.n):"aucune"}</div>
  <div><b>États</b> ${Object.keys(ST3).filter(k=>st[k]>0).map(k=>ST3[k].i+" "+ST3[k].n+" ("+st[k]+")").join(", ")||(f.stun>0?"💫 étourdi":"aucun")}</div>
  ${T?`<div><b>Terrain</b> ${T.i} ${esc(T.n)} — ${esc(T.d)}</div>`:""}</div>
  <div class="tiny muted" style="margin:6px 0">États : 🔥 orbes rouges (avec avantage), 🧊 orbes bleues (avec avantage), 🩸 orbes vertes (avec avantage), 😱 orbes violettes.</div>
  <button class="wide secondary" onclick="closeModal()">FERMER</button></div>`)}
document.addEventListener("click",ev=>{const t=ev.target&&ev.target.closest&&ev.target.closest("#battleArea .sEnemy");if(t&&fight&&fight.enemies&&screen==="battle")c3Sheet()});
/* ---- affichage ---- */
const _rbC3=renderBattle;renderBattle=function(){const f0=fight;if(f0&&f0.mx&&!f0.over)c3PickTer(f0);_rbC3();const f=fight,box=$$("battleArea");if(!box||!c3On(f))return;const e=f.enemies[f.wave],st=e&&e.st||{},hud=box.querySelector(".sHud"),stage=box.querySelector(".battlestage");
 if(stage)Object.keys(TER3).forEach(k=>stage.classList.toggle("ter-"+k,f.ter===k));
 const ch=box.querySelector(".sHud .fchips");if(ch&&!ch.querySelector(".c3chip")){const a=[];Object.keys(ST3).forEach(k=>{if(st[k]>0)a.push(`<span class="chip hot c3chip" title="${esc(ST3[k].d)}">${ST3[k].i} ${ST3[k].n} (${st[k]})</span>`)});
  const T=c3Ter(f);if(T)a.push(`<span class="chip c3chip" title="${esc(T.d)}">${T.i} ${esc(T.n)}</span>`);const w=c3Weak(e);if(w&&c3Known(e))a.push(`<span class="chip good c3chip" title="Faiblesse de cette créature">🎯 ${esc(FAMN3[w])} +25 %</span>`);
  ch.insertAdjacentHTML("beforeend",a.join("")||'<span class="c3chip"></span>')}
 if(hud&&f.item&&!hud.querySelector(".c3item")){const I=ITEM3[f.item.k];hud.insertAdjacentHTML("beforeend",`<button class="c3item" onclick="c3Pick()" title="${esc(I.d)} · disparaît dans ${f.item.t} tour(s) · ne coûte pas de tour">${I.i} ${esc(I.n)} <small>${f.item.t}</small></button>`)}
 const se=box.querySelector(".sEnemy");if(se){se.style.cursor="pointer";se.title="Fiche de l'ennemi (clic)"}};
/* bestiaire : faiblesse des créatures déjà vaincues */
const _raC3=renderAch;renderAch=function(){_raC3();try{const all=CX_ALL(),cards=document.querySelectorAll("#codexBox .cx");if(cards.length!==all.length)return;all.forEach((x,i)=>{if(!S.foes[x.id]||cards[i].querySelector(".cxw"))return;const w="TCAGFSHM"[hashS(x.id)%8];cards[i].insertAdjacentHTML("beforeend",`<small class="cxw">🎯 faible : ${esc(FAMN3[w])}</small>`)})}catch(e){}};
ACH.push(["c3a","Pilleur de terrain","Ramasser 30 objets pendant les combats",()=>(S.cnt||{}).items3||0,30,{tickets:2,essence:20}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["États, faiblesses et terrains","Les orbes peuvent infliger des états : 🔥 Brûlure (orbes rouges avec avantage), 🧊 Gel (orbes bleues avec avantage : l'ennemi saute son tour), 🩸 Saignement (orbes vertes avec avantage), 😱 Peur (orbes violettes : −25 % d'attaque). Certaines créatures y résistent. Chaque créature est faible face à une famille de dinos (+25 %), révélée après l'avoir vaincue une fois. Clique sur l'ennemi pour voir sa fiche. Certains combats ont un terrain (Boue, Lave, Sol gelé, Brume) et des objets tombent parfois : clique dessus pour les ramasser sans perdre ton tour."]);
