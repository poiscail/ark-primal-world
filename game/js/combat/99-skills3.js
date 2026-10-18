/* Compétences II (0.32) : arbre de talents (idée 32), ordre de l'auto-combat (35), super prismatique (39), 5 nouvelles
   compétences (40 Cri de meute, 41 Appel du petit, 42 Morsure vampirique, 43 Défi, 44 Pluie d'or), cible de soin au clic
   (46) et mise en scène des compétences légendaires (49).
   Chargé AVANT 99-mastery : les nouvelles compétences passent ainsi par ses niveaux de maîtrise (useSkill enveloppé).
   - d.tal={a,d,s} : rangs 0 à 5 ; points = niveau ÷ 10. a : +2 % ATQ/rang, d : +3 % PV/rang, s : +1 % de super par orbe et par rang.
   - d.auto : "first" (en priorité) / "off" (jamais) pour l'auto-combat.
   - f.minion {dmg,t}, f.defy {k,t}, f.healT (dino visé par les soins ciblés). */
Object.assign(SK,{cry:{n:"Cri de meute",i:"📯",cd:4,d:"Les deux autres dinos récupèrent 2 tours de recharge."},
 minion:{n:"Appel du petit",i:"🦖",cd:5,d:"Un petit allié attaque pendant 3 tours (0,7× l'attaque du lanceur par tour)."},
 vamp:{n:"Morsure vampirique",i:"🧛",cd:4,d:"Inflige 1,6× l'attaque et soigne l'équipe de 25 % des dégâts."},
 defy:{n:"Défi",i:"🗯️",cd:5,d:"Attire les coups pendant 2 tours et renvoie 40 % des dégâts reçus."},
 gild:{n:"Pluie d'or",i:"🌟",cd:3,d:"Les orbes de la couleur la plus faible deviennent dorées, +10 % de super."}});
if(typeof ES_MAP!=="undefined")Object.assign(ES_MAP,{cry:"roar",minion:"strike",vamp:"heal",defy:"shield",gild:"reorb"});
if(typeof MS_SK2!=="undefined"){MS_SK2.T.push("vamp");MS_SK2.C.push("defy");MS_SK2.A.push("defy");MS_SK2.G.push("cry");MS_SK2.F.push("gild");MS_SK2.S.push("minion");MS_SK2.H.push("cry");MS_SK2.M.push("vamp","gild")}
if(typeof AUTO_PRIO!=="undefined"){AUTO_PRIO[1].push("defy");AUTO_PRIO[2].push("cry","gild");AUTO_PRIO[3].push("vamp","minion")}
const S3NEW=["cry","minion","vamp","defy","gild"];
const s3On=f=>!!(f&&f.mx&&!f.over);
/* ---- nouvelles compétences ---- */
const _usS3=useSkill;useSkill=function(k){const f=fight;if(!s3On(f)||!alive(k)||f.cd[k]>0)return _usS3(k);const t=T3(),d=t[k],id=SK_of(d);
 if(id==="selfheal"&&f.healT!=null&&f.healT!==k&&alive(f.healT)){const keep=f.hp.slice();t.forEach((x,j)=>{if(j!==f.healT&&alive(j))f.hp[j]=f.mx[j]});try{return _usS3(k)}finally{t.forEach((x,j)=>{if(j!==f.healT&&alive(j))f.hp[j]=keep[j]})}}
 if(!S3NEW.includes(id)){s3Cut(d,id);return _usS3(k)}
 const e=f.enemies[f.wave],A=atkOf(k),adv=BEAT[sp(d).element]===e.el?1.3:1;let dmg=0,x="";
 if(id==="cry"){t.forEach((y,j)=>{if(j!==k)f.cd[j]=Math.max(0,f.cd[j]-2)});x=" · recharges −2"}
 else if(id==="minion"){f.minion={dmg:Math.round(A*.7),t:3};x=" · un petit allié arrive (3 tours)"}
 else if(id==="vamp"){dmg=Math.round(A*1.6*adv);const h=Math.round(dmg*.25);let alv=t.map((y,j)=>alive(j)?j:-1).filter(j=>j>=0);alv.forEach(j=>f.hp[j]=Math.min(f.mx[j],f.hp[j]+Math.round(h/alv.length)));x=" · soin "+h}
 else if(id==="defy"){f.defy={k,t:2};x=" · attire les coups et renvoie 40 %"}
 else if(id==="gild"){const cs=[...new Set(f.orbs.filter(c=>c!=="goldorb"))];if(cs.length){let lo=cs[0],lv=1e18;cs.forEach(c=>{const v=orbPreview(c);if(v<lv){lv=v;lo=c}});f.orbs=f.orbs.map(c=>c===lo?"goldorb":c);x=" · orbes "+(ICO[lo]||"")+" → ☀️"}f.sp=Math.min(100,f.sp+10)}
 f.cd[k]=skCd(d);ens();bump("skills");if(dmg)f.pop=dmg;s3Cut(d,id);save();afterAction(dmg,"✨ "+sp(d).name+" : "+SK[id].n+(dmg?" : "+dmg+" dégâts":"")+x,false);s3Fx(k,id)};
function s3Fx(k,id){try{if(!PREFS.anim)return;const box=$$("battleArea"),eI=box.querySelector(".bigicon.hit"),rows=box.querySelector(".sFig")?[...box.querySelectorAll(".sFig")]:[...box.querySelectorAll(".row .bigicon:not(.hit)")],me=rows[k];if(!eI)return;const E=fxCtr(eI),M=me?fxCtr(me):E;
 if(id==="cry"){ring(M.x,M.y,"#ffd15c");rows.forEach((r,j)=>{if(j!==k&&r){const R=fxCtr(r);fxEmo(R.x,R.y-10,"⏩",2,{dy:-40})}})}
 else if(id==="minion")fxEmo(M.x,M.y,"🦖",3,{dy:-30,sp:40});
 else if(id==="vamp"){if(me)projectile(me,eI,"#c8213c",0);setTimeout(()=>fxEmo(E.x,E.y,"🩸",5,{sp:50}),fxd(380))}
 else if(id==="defy"){ring(M.x,M.y,"#ff8a3c");fxEmo(M.x,M.y-10,"🗯️",2,{dy:-40})}
 else if(id==="gild")fxEmo(M.x,M.y,"🌟",6,{sp:80,dy:-60})}catch(e){}}
const _ptS3=pickTarget;pickTarget=function(){const f=fight;if(s3On(f)&&f.defy&&f.defy.t>0&&alive(f.defy.k))return f.defy.k;return _ptS3()};
const _hdS3=hitDino;hitDino=function(k,base,e){const f=fight;if(s3On(f)&&f.defy&&f.defy.t>0&&f.defy.k===k&&e&&e.hp>0){const r=Math.round(base*.4);e.hp-=r;f.log+=" · 🗯️ renvoi "+r}return _hdS3(k,base,e)};
const _etS3=enemyTurn;enemyTurn=function(){const f=fight;try{return _etS3()}finally{if(f&&f.defy&&f.defy.t>0)f.defy.t--}};
const _aaS3=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(s3On(f)){const t=T3();
  if(f._sup2){const els=new Set(t.filter((d,j)=>alive(j)).map(d=>sp(d).element));if(els.size>=3){dmg=Math.round(dmg*1.2);f.pop=dmg;msg+=" · 🌈 Prisme ×1,2"}}
  if(f._tap){const s=t.reduce((a,d,j)=>a+(alive(j)?((d.tal&&d.tal.s)||0):0),0);if(s)f.sp=Math.min(100,f.sp+s)}
  if(endTurn&&f.minion&&f.minion.t>0){dmg+=f.minion.dmg;msg+=" · 🦖 petit allié "+f.minion.dmg;f.minion.t--;if(!f.minion.t)f.minion=null}}
 return _aaS3(dmg,msg,endTurn)};
if(typeof autoWant==="function"){const _awS3=autoWant;autoWant=function(id,f,e,t){if(id==="cry")return t.some((d,j)=>alive(j)&&f.cd[j]>=2&&SK_of(d)!=="cry");if(id==="defy")return!(f.defy&&f.defy.t>0);if(id==="minion")return!f.minion;return _awS3(id,f,e,t)}}
/* ---- ordre de l'auto-combat ---- */
if(typeof autoSkill==="function"){const _asS3=autoSkill;autoSkill=function(){const f=fight,t=T3();if(!s3On(f))return _asS3();const e=f.enemies[f.wave];
  const fst=t.findIndex((d,j)=>d.auto==="first"&&alive(j)&&f.cd[j]<=0&&(typeof autoWant!=="function"||autoWant(SK_of(d),f,e,t)));if(fst>=0)return fst;
  const cd0=f.cd.slice();t.forEach((d,j)=>{if(d.auto==="off")f.cd[j]=99});try{return _asS3()}finally{f.cd=cd0}}}
function s3Auto(id,v){ens();const d=S.team.find(x=>x.id===id);if(!d)return;d.auto=v==="normal"?undefined:v;save();render()}
/* ---- talents ---- */
const S3T={a:{i:"⚔️",n:"Attaque",d:"+2 % d'ATQ par rang"},d:{i:"🛡️",n:"Défense",d:"+3 % de PV par rang"},s:{i:"⚡",n:"Soutien",d:"+1 % de super par orbe touchée, par rang"}};
const s3Pts=d=>Math.min(10,Math.floor((d.level||1)/10)),s3Used=d=>{const t=d.tal||{};return(t.a||0)+(t.d||0)+(t.s||0)};
const _stS3=stats;stats=function(d){const v=_stS3(d),t=d&&d.tal;if(!t)return v;return{hp:Math.round(v.hp*(1+.03*(t.d||0))),atk:Math.round(v.atk*(1+.02*(t.a||0))),def:v.def}};
function s3Tal(id){ens();const d=S.team.find(x=>x.id===id);if(!d)return;d.tal=d.tal||{a:0,d:0,s:0};const free=s3Pts(d)-s3Used(d);
 openModal(`<h3 style="margin:0 0 4px">🌳 Talents : ${esc((SPEC[d.type]||sp(d)).name)}</h3><div class="tiny muted">1 point tous les 10 niveaux (niveau ${d.level} : ${s3Pts(d)} points, ${free} libre${free>1?"s":""}). 5 rangs au plus par branche. Réinitialisation gratuite.</div>
  ${Object.keys(S3T).map(k=>{const r=d.tal[k]||0;return `<div class="s3row"><span class="s3i">${S3T[k].i}</span><div class="grow"><b>${S3T[k].n}</b> <span class="tiny muted">${S3T[k].d}</span><div class="s3pips">${[0,1,2,3,4].map(i=>`<i class="${i<r?"on":""}"></i>`).join("")}</div></div><button class="secondary" ${r<=0?"disabled":""} onclick="s3TalSet(${d.id},'${k}',-1)">−</button><button class="blue" ${r>=5||free<=0?"disabled":""} onclick="s3TalSet(${d.id},'${k}',1)">+</button></div>`}).join("")}
  <div class="s3row"><span class="s3i">🤖</span><div class="grow"><b>Auto-combat</b> <span class="tiny muted">quand utiliser sa compétence</span></div>${[["first","En priorité"],["normal","Normal"],["off","Jamais"]].map(([v,n])=>`<button class="${(d.auto||"normal")===v?"blue":"secondary"}" onclick="s3Auto(${d.id},'${v}');s3Tal(${d.id})">${n}</button>`).join("")}</div>
  <div class="btns"><button class="secondary" onclick="s3TalReset(${d.id})">RÉINITIALISER</button><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
function s3TalSet(id,k,n){ens();const d=S.team.find(x=>x.id===id);if(!d||!S3T[k])return;d.tal=d.tal||{a:0,d:0,s:0};const r=(d.tal[k]||0)+n;if(r<0||r>5)return;if(n>0&&s3Used(d)>=s3Pts(d))return;d.tal[k]=r;save();s3Tal(id);render()}
function s3TalReset(id){ens();const d=S.team.find(x=>x.id===id);if(!d)return;d.tal={a:0,d:0,s:0};save();s3Tal(id);render()}
const _cardS3=card;card=function(d,a){const h=_cardS3(d,a);if(!d||!S.team.some(x=>x.id===d.id))return h;const free=s3Pts(d)-s3Used(d),t=d.tal||{};
 const b=`<button class="secondary ${free>0?"s3free":""}" onclick="s3Tal(${d.id})">🌳 TALENTS${free>0?" ("+free+")":""}</button>`;
 return h.includes('class="btns msbtns"')?h.replace('<div class="btns msbtns">','<div class="btns msbtns">'+b):h.replace(/(⚔ Puissance [^<]*<\/div>)/,`$1<div class="btns msbtns">${b}</div>`)};
/* ---- cible de soin (clic sur un dino de la scène) et mise en scène des légendaires ---- */
/* (les dinos de la scène lancent déjà leur compétence quand elle est prête : la cible se choisit sur le portrait de la liste) */
const s3RowK=el=>{const row=el&&el.closest&&el.closest("#battleArea .row");const b=row&&row.querySelector('button.skbtn[onclick^="useSkill("]');return b?+(/useSkill\((\d)/.exec(b.getAttribute("onclick"))||[])[1]:-1};
document.addEventListener("click",ev=>{const ic=ev.target&&ev.target.closest&&ev.target.closest("#battleArea .row > .bigicon");if(!ic||!fight||fight.over||screen!=="battle")return;const k=s3RowK(ic);if(k<0||!alive(k))return;
 fight.healT=fight.healT===k?null:k;fight.log=fight.healT==null?"💚 Soins : au plus blessé":"💚 Soins ciblés : "+sp(T3()[k]).name;renderBattle()});
function s3Cut(d,id){try{if(!d||sp(d).r!=="Légendaire"||!PREFS.anim||PREFS.cutin===false)return;const el=document.createElement("div");el.className="lgcut";el.innerHTML=`<span class="lgp">${portrait(d.type)}</span><b>${esc((SPEC[d.type]||sp(d)).name)}</b><i>${SK[id].i} ${esc(SK[id].n)}</i>`;fxAdd(el,typeof fxd==="function"?fxd(950):950)}catch(e){}}
const _rbS3=renderBattle;renderBattle=function(){_rbS3();const f=fight,box=$$("battleArea");if(!box||!s3On(f))return;
 if(f.healT!=null){const figs=[...box.querySelectorAll(".sTeam .sFig")];const fg=figs[f.healT];if(fg&&!fg.querySelector(".s3heal"))fg.insertAdjacentHTML("beforeend",'<b class="s3heal" title="Soins ciblés">💚</b>')}
 box.querySelectorAll("#battleArea .row > .bigicon").forEach(ic=>{const k=s3RowK(ic);if(k<0)return;ic.classList.add("s3pick");ic.title="Clic : diriger les soins ciblés vers ce dino";if(k===f.healT&&!ic.querySelector(".s3heal"))ic.insertAdjacentHTML("beforeend",'<b class="s3heal">💚</b>')});
 const ch=box.querySelector(".sHud .fchips");if(ch&&!ch.querySelector(".s3chip")){const a=[];if(f.minion)a.push(`<span class="chip good s3chip">🦖 Petit allié (${f.minion.t})</span>`);if(f.defy&&f.defy.t>0)a.push(`<span class="chip good s3chip">🗯️ Défi (${f.defy.t})</span>`);ch.insertAdjacentHTML("beforeend",a.join("")||'<span class="s3chip"></span>')}};
ACH.push(["s3a","Arbre de vie","Dépenser 10 points de talent sur un même dino",()=>S.team.reduce((m,d)=>Math.max(m,s3Used(d)),0),10,{tickets:4,essence:40}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Talents et nouvelles compétences","Chaque fiche a un arbre de talents (1 point tous les 10 niveaux) : Attaque, Défense ou Soutien (super plus rapide), avec réinitialisation gratuite, et le réglage de l'auto-combat pour ce dino (en priorité, normal, jamais). Nouvelles compétences, aussi en 2e compétence : Cri de meute, Appel du petit, Morsure vampirique, Défi, Pluie d'or. Une équipe de 3 éléments différents rend la super prismatique (+20 %). Clique sur le portrait d'un de tes dinos (liste sous la scène) pour diriger les soins ciblés vers lui."]);
