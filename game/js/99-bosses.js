/* Boss (0.32) : mécanique propre à chaque zone (idée 51), parties à viser (52), décor qui change à chaque phase (56),
   répliques des boss (66), entrée en scène (71), variantes corrompues du Cauchemar avec deux mécaniques (62).
   Mécaniques (f.bm = liste) : lianes (jungle : 3 orbes enlacées tous les 3 tours, une orbe verte les libère),
   rune (ruines : seule la couleur de la rune frappe fort, ×0,6 sinon ; change tous les 3 tours), eruption (volcan :
   tout le monde perd 6 % de ses PV tous les 3 tours), saisie (obélisque : le boss saisit un dino tous les 4 tours ;
   2 orbes de l'élément qui le bat le libèrent). Parties : Mâchoire (brisée : ATQ −20 %) et Queue (brisée : plus
   d'attaque de zone), 20 % des PV du boss chacune ; les dégâts sur une partie comptent aussi pour le boss. */
const BM={lianes:{i:"🌿",n:"Lianes",d:"tous les 3 tours, 3 orbes sont enlacées ; une orbe 🌿 les libère toutes, toucher une orbe enlacée l'arrache mais coûte un tour"},rune:{i:"🔷",n:"Bouclier runique",d:"seules les orbes de la couleur de la rune frappent fort (×0,6 sinon) ; la rune change tous les 3 tours"},
 eruption:{i:"🌋",n:"Éruption",d:"tous les 3 tours, toute l'équipe perd 6 % de ses PV"},saisie:{i:"🦑",n:"Saisie",d:"tous les 4 tours, le boss saisit un dino (plus de compétence, −4 % de PV par tour) ; 2 orbes de l'élément qui le bat le libèrent"}};
const BM_ZONE={jungle:"lianes",ruines:"rune",volcan:"eruption",obelisque:"saisie"},BM_NEXT={lianes:"rune",rune:"eruption",eruption:"saisie",saisie:"lianes"};
const BLINES={jungle:["La jungle entière se dresse contre toi !","Mes racines t'étoufferont…","Assez joué !"],ruines:["Ces ruines sont mon royaume.","Les runes me protègent !","Je ne tomberai pas !"],
 volcan:["Brûle avec mon volcan !","La lave coule dans mes veines !","Tout finira en cendres !"],obelisque:["L'obélisque m'a éveillé…","Rien n'échappe à mon étreinte !","Je suis éternel !"],neutre:["Tu n'iras pas plus loin.","Impressionnant… mais vain.","C'est la fin !"]};
const bmOn=f=>!!(f&&f.mx&&!f.over);
const bmBoss=f=>{const e=f&&f.enemies&&f.enemies[f.wave];return e&&e.boss&&f.wave===2&&!f.raid?e:null};
const bmCol=e=>Object.keys(BEAT).find(c=>BEAT[c]===e.el)||"blueorb";
function bmSetup(f){const e=bmBoss(f);if(!e||e.bmSet)return;e.bmSet=1;const m=f.o&&f.o.mode||"story";if(!/^(story|nightmare|dungeon|secret|seed)$/.test(m)||f.daily||(f.o&&f.o.daily))return;
 const z=stageZone(f.zone||""),k=BM_ZONE[z];f.bm=k?[k]:[];if(m==="nightmare"&&k){f.bm.push(BM_NEXT[k]);e.corr=1}
 const P=Math.round(e.max*.2);f.parts={jaw:{n:"Mâchoire",i:"🦷",hp:P,max:P,d:"brisée : ATQ −20 %"},tail:{n:"Queue",i:"🦎",hp:P,max:P,d:"brisée : plus d'attaque de zone"}};f.part=null;
 if(f.bm.includes("rune"))f.rune=["redorb","blueorb","greenorb","purpleorb"][rnd(4)];
 bmSay(f,0);if(typeof PREFS!=="undefined"&&PREFS.anim)bmEntrance(e)}
function bmSay(f,i){const z=stageZone(f.zone||""),L=BLINES[z]||BLINES.neutre;f.bline=L[i]||L[0];f.blineT=f.turn+2}
function bmEntrance(e){try{const el=document.createElement("div");el.className="bossin"+(e.corr?" corr":"");el.innerHTML=`<small>⚠ BOSS</small><b>${esc(String(e.name).split(" · ").pop())}</b>`;fxAdd(el,typeof fxd==="function"?fxd(1500):1500)}catch(x){}}
/* ---- orbes : lianes, rune, saisie ---- */
const _toBM=tapOrb;tapOrb=function(i){const f=fight;if(bmOn(f)&&f.orbs&&!(typeof CUT!=="undefined"&&CUT)){const c=f.orbs[i];
  if(f.locked&&f.locked.includes(i)&&c!=="greenorb"){f.locked=f.locked.filter(x=>x!==i);if(!f.locked.length)f.locked=null;f.combo=0;f.last=null;return afterAction(0,"🌿 Tu arraches une liane (tour perdu). Une orbe 🌿 libère toutes les lianes d'un coup.",true)}
  if(f.locked&&c==="greenorb"){f.locked=null;f._bmFree=1}
  if(f.grab&&c===f.grab.col){f.grab.need--;if(f.grab.need<=0){f._bmFreed=sp(T3()[f.grab.k]).name;f.grab=null}}}
 return _toBM(i)};
const _opBM=orbPreview;orbPreview=function(c){const v=_opBM(c),f=fight;return f&&f.rune&&bmBoss(f)&&c!==f.rune?Math.round(v*.6):v};
const _aaBM=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(bmOn(f)){const e=bmBoss(f);
  if(f._bmFree){f._bmFree=0;msg+=" · 🌿 lianes libérées"}if(f._bmFreed){msg+=" · 🦑 "+f._bmFreed+" est libéré !";f._bmFreed=null}
  if(e&&f.rune&&f._tap&&f._tap!==f.rune&&dmg>0){dmg=Math.round(dmg*.6);f.pop=dmg;msg+=" · 🔷 la rune "+(ICO[f.rune]||"")+" bloque (×0,6)"}
  if(e&&f.part&&f.parts&&dmg>0){const P=f.parts[f.part];if(P&&P.hp>0){P.hp=Math.max(0,P.hp-dmg);if(P.hp===0){msg+=" · 💥 "+P.n+" BRISÉE ("+P.d+")";if(f.part==="jaw")e.atk=Math.round(e.atk*.8);if(e.a0&&f.part==="jaw")e.a0=Math.round(e.a0*.8);f.part=null;if(typeof banner==="function")banner(P.n.toUpperCase()+" BRISÉE",P.d,"boss")}}}}
 return _aaBM(dmg,msg,endTurn)};
const _usBM=useSkill;useSkill=function(k){const f=fight;if(bmOn(f)&&f.grab&&f.grab.k===k){f.log="🦑 "+sp(T3()[k]).name+" est saisi : il ne peut pas utiliser sa compétence.";renderBattle();return}return _usBM(k)};
/* ---- tour du boss ---- */
const _etBM=enemyTurn;enemyTurn=function(){const f=fight;const e=bmOn(f)&&bmBoss(f);if(!e)return _etBM();const t=T3(),bm=f.bm||[],T=f.turn,stun=f.stun>0;
 const tailOff=f.parts&&f.parts.tail&&f.parts.tail.hp===0&&T%3===0;if(tailOff)e.boss=false;let r;try{r=_etBM()}finally{if(tailOff)e.boss=true}
 if(f.over||stun)return r;
 if(bm.includes("lianes")&&T%3===1){const idx=[...Array(f.orbs.length).keys()].sort(()=>Math.random()-.5).slice(0,3);f.locked=idx;f.log+=" · 🌿 Lianes : 3 orbes enlacées"}
 if(bm.includes("rune")&&T%3===0){const cs=["redorb","blueorb","greenorb","purpleorb"].filter(c=>c!==f.rune);f.rune=cs[rnd(cs.length)];f.log+=" · 🔷 Nouvelle rune "+(ICO[f.rune]||"")}
 if(bm.includes("eruption")&&T%3===2){f.hp=f.hp.map((h,j)=>h>0?Math.max(1,h-Math.round(f.mx[j]*.06)):h);f.log+=" · 🌋 Éruption : −6 % de PV"}
 if(bm.includes("saisie")){if(f.grab){const g=f.grab;if(f.hp[g.k]>0)f.hp[g.k]=Math.max(1,f.hp[g.k]-Math.round(f.mx[g.k]*.04));if(f.cd[g.k]<1)f.cd[g.k]=1}
  else if(T%4===3){const al=t.map((d,j)=>f.hp[j]>0?j:-1).filter(j=>j>=0);if(al.length){const k=al[rnd(al.length)];f.grab={k,need:2,col:bmCol(e)};f.log+=" · 🦑 Saisie : "+sp(t[k]).name+" est pris ! (2 orbes "+(ICO[f.grab.col]||"")+" pour le libérer)"}}}
 if(e.p1&&!f.bl1){f.bl1=1;bmSay(f,1)}if(e.p2&&!f.bl2){f.bl2=1;bmSay(f,2)}return r};
function bmPart(k){const f=fight;if(!bmOn(f)||!f.parts||!f.parts[k]||f.parts[k].hp<=0)return;f.part=f.part===k?null:k;f.log=f.part?"🎯 Tu vises : "+f.parts[k].n+" ("+f.parts[k].d+")":"🎯 Tu vises le corps du boss";renderBattle()}
/* ---- affichage ---- */
const _rbBM=renderBattle;renderBattle=function(){const f0=fight;if(f0&&f0.mx&&!f0.over)bmSetup(f0);_rbBM();const f=fight,box=$$("battleArea");if(!box||!bmOn(f))return;const e=bmBoss(f),stage=box.querySelector(".battlestage");
 if(stage){stage.classList.toggle("bph2",!!(e&&e.p1&&!e.p2));stage.classList.toggle("bph3",!!(e&&e.p2));stage.classList.toggle("bcorr",!!(e&&e.corr))}
 if(f.locked)box.querySelectorAll('.orbboard button.orb[onclick^="tapOrb("]').forEach(b=>{const i=+(/tapOrb\((\d+)/.exec(b.getAttribute("onclick"))||[])[1];if(f.locked.includes(i)&&f.orbs[i]!=="greenorb")b.classList.add("locked")});
 if(!e)return;const hud=box.querySelector(".sHud"),ch=box.querySelector(".sHud .fchips");
 if(ch&&!ch.querySelector(".bmchip")){const a=(f.bm||[]).map(k=>`<span class="chip hot bmchip" title="${esc(BM[k].d)}">${BM[k].i} ${esc(BM[k].n)}${k==="rune"&&f.rune?" "+(ICO[f.rune]||""):""}</span>`);if(f.grab)a.push(`<span class="chip hot bmchip">🦑 ${esc(sp(T3()[f.grab.k]).name)} saisi (${f.grab.need} ${ICO[f.grab.col]||""})</span>`);if(e.corr)a.push('<span class="chip hot bmchip">🌑 Corrompu</span>');ch.insertAdjacentHTML("beforeend",a.join("")||'<span class="bmchip"></span>')}
 if(hud&&f.parts&&!hud.querySelector(".bmparts"))hud.insertAdjacentHTML("beforeend",`<div class="bmparts"><span class="tiny muted">Viser :</span>${Object.entries(f.parts).map(([k,P])=>`<button class="bmpart ${f.part===k?"on":""} ${P.hp<=0?"broken":""}" ${P.hp<=0?"disabled":""} onclick="bmPart('${k}')" title="${esc(P.d)}">${P.i} ${esc(P.n)} ${P.hp<=0?"💥":Math.round(P.hp/P.max*100)+" %"}</button>`).join("")}</div>`);
 const se=box.querySelector(".sEnemy");if(se&&f.bline&&f.blineT>=f.turn&&!se.querySelector(".bbub"))se.insertAdjacentHTML("beforeend",`<span class="bbub">${esc(f.bline)}</span>`)};
if(typeof GUIDE!=="undefined")GUIDE.push(["Boss de zone et parties","Chaque boss de l'histoire a une mécanique liée à sa zone : Lianes (jungle), Bouclier runique (ruines), Éruption (volcan), Saisie (obélisque). Dans le Cauchemar, les boss corrompus en ont deux. Vise la Mâchoire (ATQ −20 % une fois brisée) ou la Queue (plus d'attaque de zone) avec les boutons sous la frise : les dégâts comptent aussi pour le boss. Le décor change à chaque phase."]);
