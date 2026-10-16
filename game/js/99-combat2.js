/* Combat I (0.28) : super attaque renforcée (SUPER_TUNE) avec effet de famille du chef (SUPER_FAM), Ruée (3 orbes de la même
   couleur d'affilée), Coup final (achever avec l'élément qui bat l'ennemi), jauge de rage ennemie (frapper sans avantage
   l'énerve ; pleine, sa prochaine attaque fait ×1,5), Garde (touche G : pas de dégâts ni de super, le prochain coup ennemi
   est divisé par deux, et le plateau change), frise des prochains tours ennemis, recharge des compétences en cercle,
   jauge de super « presque prête », infobulles chiffrées des orbes et des compétences.
   Drapeaux de combat : f._sup2 (super en cours), f._tap (couleur de l'orbe touchée), f.guard, f._furie, f.thorn, e.rage. */
let SUPER_TUNE=1.7;   // la super ne faisait que 1,1 à 1,4 fois la meilleure orbe (mesuré en 0.26)
const C2={rageHit:20,rageAdv:10,rageMul:1.5,rueeN:3,rueeMul:1.3,rueeSp:10,finalSp:20,guardMul:.5};
const SUPER_FAM={T:{i:"🩸",n:"Saignement",d:"l'ennemi saigne 3 tours (10 % des dégâts de la super par tour)"},
 C:{i:"🪨",n:"Brise-carapace",d:"brise la carapace de l'ennemi, dégâts +15 %"},A:{i:"🛡️",n:"Rempart",d:"l'équipe subit −50 % de dégâts pendant 2 tours"},
 G:{i:"🌵",n:"Épines",d:"les 2 prochains coups ennemis lui renvoient 30 % des dégâts"},F:{i:"🪶",n:"Piqué",d:"rend 25 % de jauge de super"},
 S:{i:"💫",n:"Séisme",d:"étourdit l'ennemi 1 tour"},H:{i:"🎵",n:"Chant de harde",d:"soigne l'équipe de 15 %"},M:{i:"🌊",n:"Raz-de-marée",d:"retire le trait de l'ennemi et soigne l'équipe de 10 %"}};
const c2Fam=()=>{const t=T3();return t[0]?(PORT[t[0].type]||["T"])[0]:"T"};
const c2On=f=>!!(f&&f.mx&&!f.over);
/* ---- super attaque renforcée + effet de famille ---- */
const _spC2=special;special=function(){const f=fight;if(f&&f.sp>=100&&!f.over)f._sup2=1;try{return _spC2.apply(this,arguments)}finally{if(f)f._sup2=0}};
const _toC2=tapOrb;tapOrb=function(i){const f=fight;if(c2On(f)&&!(typeof CUT!=="undefined"&&CUT)&&f.orbs)f._tap=f.orbs[i];try{return _toC2(i)}finally{if(f)f._tap=null}};
const _aaC2=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(!c2On(f))return _aaC2(dmg,msg,endTurn);const e=f.enemies[f.wave];
 if(f._sup2){f._sup2=0;const k=c2Fam(),F=SUPER_FAM[k],t=T3();dmg=Math.round(dmg*SUPER_TUNE);
  if(k==="C"){e.sh=0;dmg=Math.round(dmg*1.15)}else if(k==="T")f.dots.push({dmg:Math.max(1,Math.round(dmg*.1)),t:3});else if(k==="A")f.buff.shield=Math.max(f.buff.shield||0,2);
  else if(k==="G")f.thorn=2;else if(k==="F")f.sp=Math.min(100,(f.sp||0)+25);else if(k==="S")f.stun=Math.max(f.stun||0,1);
  else if(k==="H"||k==="M"){const p=k==="H"?.15:.1;t.forEach((d,j)=>{if(f.hp[j]>0)f.hp[j]=Math.min(f.mx[j],f.hp[j]+Math.round(f.mx[j]*p))});if(k==="M"&&e.tr){e.tr="";e.sh=0}}
  f.pop=dmg;msg=msg.replace(/: \d+ dégâts/,": "+dmg+" dégâts")+" · "+F.i+" "+F.n}
 else if(f._tap){const c=f._tap;
  if(f.combo>=C2.rueeN-1&&(f.combo+1)%C2.rueeN===0){dmg=Math.round(dmg*C2.rueeMul);f.sp=Math.min(100,f.sp+C2.rueeSp);f.pop=dmg;msg+=" · ⚡ RUÉE ! ×1,3";c2Pop("RUÉE !","ruee")}
  if(e&&e.hp>0){if(BEAT[c]===e.el)e.rage=Math.max(0,(e.rage||0)-C2.rageAdv);else e.rage=Math.min(100,(e.rage||0)+C2.rageHit)}}
 return _aaC2(dmg,msg,endTurn)};
/* coup final : l'ennemi tombe sous une orbe de l'élément qui le bat */
const _keC2=killEnemy;killEnemy=function(){const f=fight;if(c2On(f)&&f._tap&&f.wave<2){const e=f.enemies[f.wave];if(e&&BEAT[f._tap]===e.el){f.sp=Math.min(100,f.sp+C2.finalSp);f.log+=" · 🎯 COUP FINAL : +"+C2.finalSp+" % de super";c2Pop("COUP FINAL !","final")}}return _keC2()};
/* ---- tour ennemi : rage, garde, épines ---- */
const _etC2=enemyTurn;enemyTurn=function(){const f=fight;if(!c2On(f))return _etC2();const e=f.enemies[f.wave],stun=f.stun>0;
 if(!stun&&e&&(e.rage||0)>=100){f._furie=1;f.log+=" · 😤 FURIE : attaque ×1,5"}
 try{return _etC2()}finally{if(f._furie){f._furie=0;if(e)e.rage=0}f.guard=0;if(f.thorn>0)f.thorn--}};
const _hdC2=hitDino;hitDino=function(k,base,e){const f=fight;if(c2On(f)){if(f._furie)base*=C2.rageMul;if(f.guard)base*=C2.guardMul;if(f.thorn>0&&e&&e.hp>0){const r=Math.round(base*.3);e.hp-=r;f.log+=" · 🌵 renvoi "+r}}return _hdC2(k,base,e)};
/* ---- garde ---- */
function guard(){const f=fight;if(!c2On(f)||screen!=="battle"||(typeof CUT!=="undefined"&&CUT))return;f.guard=1;f.combo=0;f.last=null;bump("guards");
 afterAction(0,"🛡️ Garde : le prochain coup ennemi est divisé par deux, le plateau change",true)}
document.addEventListener("keydown",e=>{if(e.ctrlKey||e.metaKey||e.altKey||screen!=="battle"||!fight||fight.over||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||""))return;if(e.key&&e.key.toLowerCase()==="g")guard()});
/* ---- effets courts ---- */
function c2Pop(txt,kind){if(typeof PREFS!=="undefined"&&PREFS.anim===false)return;const L=$$("fxLayer");if(!L)return;const el=document.createElement("div");el.className="c2pop "+kind;el.textContent=txt;fxAdd(el,typeof fxd==="function"?fxd(1100):1100)}
/* ---- affichage : frise, rage, garde, recharges, super ---- */
function c2Timeline(f,e){const out=[];let stun=f.stun||0,sk=e.esk?e.skcd:99;for(let i=1;i<=4;i++){const t=f.turn+i;let c="n",ic="⚔️",tt="attaque";
  if(stun>0){stun--;c="s";ic="💫";tt="étourdi"}else{sk--;if(t%3===0){c="b";ic=e.boss?"🌋":"⚠️";tt=e.boss?"attaque de zone":"attaque puissante"}else if(e.esk&&sk<=0){c="k";ic="✨";tt="compétence"}}
  if(i===1&&(e.rage||0)>=100&&c!=="s"){c+=" r";tt+=" + furie"}out.push(`<span class="etl-t ${c}" title="Tour ${i} : ${tt}">${ic}</span>`)}
 return `<div class="etl" title="Prochains tours de l'ennemi"><span class="etl-l">Ennemi :</span>${out.join("")}</div>`}
const _rbC2=renderBattle;renderBattle=function(){_rbC2();const f=fight,box=$$("battleArea");if(!box)return;box.classList.toggle("spnear",!!(f&&!f.over&&f.sp>=90&&f.sp<100));if(!c2On(f))return;const e=f.enemies[f.wave],hud=box.querySelector(".sHud");
 if(hud&&e&&!hud.querySelector(".etl")){const r=Math.round(e.rage||0);hud.insertAdjacentHTML("beforeend",c2Timeline(f,e)+`<div class="rage ${r>=100?"full":""}" title="Rage : frapper sans l'élément qui bat l'ennemi l'énerve (+${C2.rageHit}). Pleine, sa prochaine attaque fait ×1,5. L'élément avantageux la calme (−${C2.rageAdv}).">😤<i style="width:${r}%"></i><b>${r>=100?"FURIE":"Rage "+r+" %"}</b></div>`+(f.guard?'<span class="chip good c2g">🛡️ Garde</span>':"")+(f.thorn>0?`<span class="chip good c2g">🌵 Épines (${f.thorn})</span>`:""))}
 const t=T3();box.querySelectorAll('button.skbtn[onclick^="useSkill("]').forEach(b=>{const k=+(/useSkill\((\d)/.exec(b.getAttribute("onclick"))||[])[1];const d=t[k];if(!d)return;const tot=skCd(d),cd=f.cd[k]||0,s=SK[SK_of(d)]||{};
  b.style.setProperty("--p",cd>0?Math.round((tot-cd)/Math.max(1,tot)*100):100);b.classList.add("cdr");b.title=`${s.n||""} : ${s.d||""} · recharge ${tot} tour(s)${cd>0?" (encore "+cd+")":" · prête"} · ATQ ${Math.round(atkOf(k))}`});
 box.querySelectorAll('.orbboard button.orb[onclick^="tapOrb("]').forEach(b=>{const i=+(/tapOrb\((\d+)/.exec(b.getAttribute("onclick"))||[])[1],c=f.orbs[i];if(!c)return;const adv=BEAT[c]===e.el,nx=c===f.last&&(f.combo+2)%C2.rueeN===0;
  b.title=`≈ ${orbPreview(c)} dégâts${adv?" · avantage d'élément (calme la rage)":c==="goldorb"?"":" · sans avantage (+rage)"}${nx?" · déclenche une RUÉE !":""}`;if(nx)b.classList.add("ruee")});
 const sb=box.querySelector('button[onclick="special()"]');if(sb&&!sb.querySelector(".c2f")){const F=SUPER_FAM[c2Fam()];sb.insertAdjacentHTML("beforeend",` <small class="c2f">${F.i} ${esc(F.n)}</small>`);sb.title=`Super de famille du chef : ${F.n}, ${F.d}.`}
 const bt=box.querySelector(".btns button[onclick=\"escapeFight()\"]");if(bt&&!box.querySelector(".c2guard"))bt.insertAdjacentHTML("beforebegin",`<button class="secondary c2guard" onclick="guard()" title="Pas de dégâts ni de super ; le prochain coup ennemi est divisé par deux et le plateau change (touche G)">🛡️ GARDE</button>`);
 box.querySelectorAll(".tiny.muted").forEach(x=>{if(/⌨ Clavier/.test(x.textContent)&&!/ G garde/.test(x.textContent))x.textContent+=" · G garde"})};
ACH.push(["c2a","Furie maîtrisée","Utiliser la Garde 25 fois",()=>(S.cnt||{}).guards||0,25,{tickets:2,essence:20}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Ruée, Garde, rage et super de famille","Toucher 3 orbes de la même couleur d'affilée déclenche une Ruée (×1,3 et +10 % de super). Achever un ennemi avec l'élément qui le bat donne +20 % de super (Coup final). Frapper sans avantage remplit la rage de l'ennemi : pleine, sa prochaine attaque fait ×1,5. La Garde (touche G) passe le tour sans attaquer : le prochain coup est divisé par deux et le plateau change. La super attaque, plus forte, ajoute un effet selon la famille du chef (saignement, brise-carapace, rempart, épines, piqué, séisme, chant, raz-de-marée). La frise en haut montre les prochains tours de l'ennemi."]);
