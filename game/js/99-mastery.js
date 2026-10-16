/* Maîtrise (0.31) : niveaux de compétence (idée 29), 2e compétence à l'éveil ★★★ (30), ouverture du chef (31),
   terrain natal (34), paliers de passif aux niveaux 20/40/60 (48), fiche « comment le jouer » (50).
   - d.skx : utilisations de la compétence → niveau 1 à 5 (MS_LV) : +5 % de dégâts par niveau, recharge −1 au niveau 5.
   - d.sk2 : 2e compétence choisie parmi 4 selon la famille (MS_SK2), touches Q/S/D, recharge propre f.cd2. Utilisée en
     échangeant un instant SPEC[type].sk (SK_of est const) et la recharge.
   - Ouverture du chef : effet de début de combat selon la famille du chef (MS_OPEN), décidé au premier rendu par f.o. */
const MS_LV=[0,10,30,60,100];
const msLv=d=>{const n=(d&&d.skx)||0;let l=1;MS_LV.forEach((t,i)=>{if(n>=t)l=i+1});return l};
const MS_SK2={T:["strike","execute","roar","focus"],C:["stun","cleave","shield","charge"],A:["shield","stun","selfheal","cleave"],G:["poison","cleave","shield","selfheal"],
 F:["focus","charge","reorb","strike"],S:["stun","heal","shield","roar"],H:["heal","selfheal","roar","charge"],M:["drain","heal","poison","reorb"]};
const MS_OPEN={T:{i:"🩸",n:"Embuscade",d:"l'ennemi saigne 2 tours"},C:{i:"🪨",n:"Charge d'ouverture",d:"brise la carapace du premier ennemi"},A:{i:"🛡️",n:"Formation tortue",d:"−50 % de dégâts au premier tour ennemi"},
 G:{i:"🌵",n:"Hérisson",d:"le premier coup ennemi lui renvoie 30 %"},F:{i:"🪶",n:"Repérage",d:"super à 20 % dès le début"},S:{i:"💫",n:"Pas lourd",d:"un ennemi normal est étourdi au premier tour"},
 H:{i:"🎵",n:"Chœur",d:"+5 % de PV max pour l'équipe"},M:{i:"🌊",n:"Ressac",d:"retire le trait du premier ennemi"}};
const MS_ZONE={jungle:"greenorb",volcan:"redorb",ruines:"blueorb",obelisque:"purpleorb",toundra:"blueorb",abysses:"purpleorb"};
const MS_ZN={jungle:"la jungle",volcan:"le volcan",ruines:"les ruines",obelisque:"l'obélisque",toundra:"la toundra",abysses:"les abysses"};
const msFam=d=>(PORT[d.type]||["T"])[0];
const msOn=f=>!!(f&&f.mx&&!f.over);
/* ---- niveaux de compétence ---- */
const _usMS=useSkill;useSkill=function(k){const f=fight;if(!msOn(f))return _usMS(k);const d=T3()[k],cd0=f.cd[k];if(!d||!alive(k)||cd0>0)return _usMS(k);
 f._msLv=msLv(d);let r;try{r=_usMS(k)}finally{f._msLv=0}
 if(f.cd[k]>0&&!f._ms2){d.skx=(d.skx||0)+1;if(msLv(d)>=5)f.cd[k]=Math.max(1,f.cd[k]-1);const l=msLv(d);if(l>(f._msUp||{})[k]){}}return r};
const _aaMS=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(msOn(f)){if(f._msLv>1){const m=1+.05*(f._msLv-1);if(dmg>0)dmg=Math.round(dmg*m);if(f._skx&&f._skx.dmg)f._skx.dmg=Math.round(f._skx.dmg*m);if(dmg>0)f.pop=dmg}
  if(endTurn&&f.cd2)f.cd2=f.cd2.map(v=>Math.max(0,v-1))}return _aaMS(dmg,msg,endTurn)};
/* ---- 2e compétence ---- */
function useSkill2(k){const f=fight;if(!msOn(f)||screen!=="battle"||(typeof CUT!=="undefined"&&CUT))return;const d=T3()[k];if(!d||!d.sk2||(d.star||0)<3||!SK[d.sk2]||!alive(k))return;
 f.cd2=f.cd2||[0,0,0];if(f.cd2[k]>0)return;const s=sp(d),sk0=s.sk,cd0=f.cd[k];s.sk=d.sk2;f.cd[k]=0;f._ms2=1;let r;try{r=useSkill(k)}finally{f._ms2=0;s.sk=sk0;f.cd2[k]=f.cd[k]||SK[d.sk2].cd;f.cd[k]=cd0;if(fight===f&&!f.over)renderBattle()}return r}
document.addEventListener("keydown",e=>{if(e.ctrlKey||e.metaKey||e.altKey||screen!=="battle"||!fight||fight.over||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||""))return;const i="qsd".indexOf((e.key||"").toLowerCase());if(i>=0&&e.key.length===1)useSkill2(i)});
function msPick2(id){ens();const d=S.team.find(x=>x.id===id);if(!d)return;if((d.star||0)<3){toast("La 2e compétence se débloque à l'éveil ★★★.");return}const main=SK_of(d),L=MS_SK2[msFam(d)].filter(k=>k!==main&&SK[k]);
 openModal(`<h3 style="margin:0 0 6px">2e compétence : ${esc((SPEC[d.type]||sp(d)).name)}</h3><div class="tiny muted">Utilisable en combat avec son propre bouton (touches Q, S, D), en plus de ${esc(SK[main].n)}.</div><div class="nestlist">${L.map(k=>`<button class="nprow ${d.sk2===k?"on":""}" onclick="msSet2(${d.id},'${k}')"><span class="a">${SK[k].i}</span><span class="grow"><b>${esc(SK[k].n)}</b> <span class="tiny muted">recharge ${SK[k].cd}</span><br><span class="tiny">${esc(SK[k].d)}</span></span></button>`).join("")}</div><button class="wide secondary" onclick="closeModal()">FERMER</button>`)}
function msSet2(id,k){ens();const d=S.team.find(x=>x.id===id);if(!d||!SK[k])return;d.sk2=k;save();closeModal();toast(SK[k].i+" 2e compétence : "+SK[k].n);render()}
/* ---- ouverture du chef, terrain natal ---- */
function msOpen(f){if(f.msOpenO===f.o)return;const again=!!f.msOpenO;f.msOpenO=f.o;const t=T3(),L=t[0];if(!L||f.raid)return;const fam=msFam(L),e=f.enemies[f.wave],O=MS_OPEN[fam];f.msOpen=fam;
 /* les modes (80-modes) transforment un combat d'histoire déjà affiché : 2e passage = seulement les effets sur les nouveaux ennemis (sinon saignement, PV et message doublés) */
 if(again){if(fam==="C"){if(e)e.sh=0}else if(fam==="S"){if(e&&!e.boss)f.stun=Math.max(f.stun||0,1)}else if(fam==="M"){if(e){e.tr="";e.sh=0}}return}
 if(fam==="T")f.dots.push({dmg:Math.max(1,Math.round(atkOf(0)*.4)),t:2});else if(fam==="C"){if(e)e.sh=0}else if(fam==="A")f.buff.shield=Math.max(f.buff.shield||0,1);
 else if(fam==="G")f.thorn=Math.max(f.thorn||0,1);else if(fam==="F")f.sp=Math.max(f.sp||0,20);else if(fam==="S"){if(e&&!e.boss)f.stun=Math.max(f.stun||0,1)}
 else if(fam==="H"){f.mx=f.mx.map(m=>Math.round(m*1.05));f.hp=f.hp.map((h,j)=>h>0?Math.min(f.mx[j],Math.round(h*1.05)):h)}else if(fam==="M"){if(e){e.tr="";e.sh=0}}
 f.log=O.i+" Ouverture du chef : "+O.n+" ("+O.d+") · "+(f.log||"")}
const msNative=(f,d)=>{if(!f||!d)return false;const z=stageZone(f.zone||"");return MS_ZONE[z]===sp(d).element};
const _atMS=atkOf;atkOf=function(k){const f=fight,a=_atMS(k);if(!f||!f.zone)return a;const d=T3()[k];return msNative(f,d)?a*1.1:a};
/* ---- paliers de passif (niveaux 20, 40, 60) ---- */
const msTier=d=>d?(d.level>=60?3:d.level>=40?2:d.level>=20?1:0):0;
const _stMS=stats;stats=function(d){const v=_stMS(d),t=msTier(d);if(!t)return v;const hp=1+(t>=1?.03:0)+(t>=3?.04:0),atk=1+(t>=2?.03:0)+(t>=3?.04:0);return{hp:Math.round(v.hp*hp),atk:Math.round(v.atk*atk),def:v.def}};
/* ---- fiche « comment le jouer » ---- */
const MS_TIP={strike:"garde-la pour finir un ennemi ou briser une vague forte",cleave:"utilise-la souvent : elle remplit aussi la super",roar:"lance-la avant une salve d'orbes boostées",heal:"attends que l'équipe ait perdu au moins un tiers de ses PV",
 selfheal:"sauve le dino le plus blessé juste avant une attaque puissante",shield:"active-la quand la frise annonce une attaque puissante ⚠️",stun:"utilise-la juste avant l'attaque puissante pour l'annuler",burn:"lance-la tôt sur les ennemis à beaucoup de PV",
 poison:"idéale contre les boss et les ennemis Régénérants",drain:"sert à la fois d'attaque et de soin pour le lanceur",focus:"fais-la suivre d'une orbe très boostée",charge:"rapproche la super : combine-la avec une Ruée",reorb:"change un mauvais plateau sans perdre de tour",
 execute:"garde-la pour un ennemi sous 30 % de PV (×2,5)"};
function msHowTo(id){ens();const d=S.team.find(x=>x.id===id);if(!d)return;const s=sp(d),sk=SK_of(d),pa=PA_of(d),fam=msFam(d),el=s.element,beat=BEAT[el],z=Object.keys(MS_ZONE).filter(k=>MS_ZONE[k]===el);
 const L=[`<b>Rôle</b> : ${s.hp>s.atk*7?"robuste, il encaisse":"offensif, il frappe fort"} (PV ${stats(d).hp}, ATQ ${stats(d).atk}).`,`<b>Orbes</b> : ses orbes ${ICO[el]||""} frappent ×1,8${beat?` ; elles battent les ennemis ${ICO[beat]||""}`:""}.`,
  `<b>Compétence</b> : ${SK[sk].i} ${esc(SK[sk].n)} : ${MS_TIP[sk]||esc(SK[sk].d)}. Niveau de maîtrise ${msLv(d)}/5 (${d.skx||0} utilisations).`,
  pa?`<b>Passif</b> : ${PA[pa].i} ${esc(PA[pa].n)} : ${esc(PA[pa].d)}`:"",`<b>Comme chef</b> : ouverture ${MS_OPEN[fam].i} ${MS_OPEN[fam].n} (${MS_OPEN[fam].d}) et super ${typeof SUPER_FAM!=="undefined"?SUPER_FAM[fam].i+" "+SUPER_FAM[fam].n:""}.`,
  z.length?`<b>Terrain natal</b> : +10 % d'attaque dans ${z.map(k=>MS_ZN[k]).join(" et ")}.`:"",(d.star||0)>=3?`<b>2e compétence</b> : ${d.sk2&&SK[d.sk2]?SK[d.sk2].i+" "+esc(SK[d.sk2].n):"à choisir"}.`:`<b>À l'éveil ★★★</b> : une 2e compétence à choisir.`].filter(Boolean);
 openModal(`<h3 style="margin:0 0 6px">📘 Comment jouer ${esc((SPEC[d.type]||s).name)}</h3>${L.map(x=>`<div class="mshow">${x}</div>`).join("")}<button class="wide secondary" onclick="closeModal()">FERMER</button>`)}
/* ---- affichage : fiches et combat ---- */
const _cardMS=card;card=function(d,a){const h=_cardMS(d,a);if(!d||!S.team.some(x=>x.id===d.id))return h;const l=msLv(d),t=msTier(d),nx=MS_LV[l]||null;
 const line=`<div class="tiny msline">📈 Maîtrise Nv. ${l}/5${nx?` (${d.skx||0}/${nx})`:" (max)"} · Paliers ${["I","II","III"].map((r,i)=>`<span class="${t>i?"on":""}">${r}</span>`).join(" ")}${(d.star||0)>=3?` · 2e : ${d.sk2&&SK[d.sk2]?SK[d.sk2].i+" "+esc(SK[d.sk2].n):"—"}`:""}</div><div class="btns msbtns"><button class="secondary" onclick="msHowTo(${d.id})">📘 COMMENT LE JOUER</button>${(d.star||0)>=3?`<button class="secondary" onclick="msPick2(${d.id})">✨ 2E COMPÉTENCE</button>`:""}</div>`;
 return h.replace(/(⚔ Puissance [^<]*<\/div>)/,"$1"+line)};
const _rbMS=renderBattle;renderBattle=function(){const f0=fight;if(f0&&f0.mx&&!f0.over&&f0.enemies)msOpen(f0);_rbMS();const f=fight,box=$$("battleArea");if(!box||!msOn(f))return;const t=T3();f.cd2=f.cd2||[0,0,0];
 box.querySelectorAll('button.skbtn[onclick^="useSkill("]').forEach(b=>{const k=+(/useSkill\((\d)/.exec(b.getAttribute("onclick"))||[])[1],d=t[k];if(!d)return;const l=msLv(d);if(l>1&&!b.querySelector(".mslv"))b.insertAdjacentHTML("beforeend",`<i class="mslv">Nv${l}</i>`);
  if(d.sk2&&(d.star||0)>=3&&SK[d.sk2]&&!(b.nextElementSibling&&b.nextElementSibling.classList.contains("skbtn2"))){const cd=f.cd2[k],ok=cd<=0&&alive(k);b.insertAdjacentHTML("afterend",`<button class="skbtn2 ${ok?"":"off"}" ${ok?"":"disabled"} onclick="useSkill2(${k})" title="${esc(SK[d.sk2].n)} : ${esc(SK[d.sk2].d)} (touche ${"QSD"[k]})">${SK[d.sk2].i}<small>${cd>0?cd+"t":"QSD"[k]}</small></button>`)}});
 const ch=box.querySelector(".sHud .fchips");if(ch&&!ch.querySelector(".mschip")){const a=[];if(f.msOpen&&f.turn<=1)a.push(`<span class="chip good mschip" title="${esc(MS_OPEN[f.msOpen].d)}">🚩 ${MS_OPEN[f.msOpen].i} ${esc(MS_OPEN[f.msOpen].n)}</span>`);const nat=t.filter(d=>msNative(f,d));if(nat.length)a.push(`<span class="chip good mschip" title="+10 % d'attaque dans leur terrain natal">🏞️ Terrain natal ×${nat.length}</span>`);ch.insertAdjacentHTML("beforeend",a.join("")||'<span class="mschip"></span>')}
 box.querySelectorAll(".tiny.muted").forEach(x=>{if(/⌨ Clavier/.test(x.textContent)&&!/Q-S-D/.test(x.textContent))x.textContent+=" · Q-S-D 2es compétences"})};
ACH.push(["ms1","Maître d'armes","Amener une compétence au niveau 5 de maîtrise",()=>S.team.reduce((m,d)=>Math.max(m,msLv(d)),1),5,{tickets:4,essence:40}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Maîtrise des compétences","Chaque compétence progresse en l'utilisant (niveaux 1 à 5 : +5 % de dégâts par niveau, recharge −1 au niveau 5). À l'éveil ★★★, un dino gagne une 2e compétence au choix (touches Q, S, D en combat). Le chef ouvre chaque combat avec un effet de sa famille. Un dino gagne +10 % d'attaque dans son terrain natal (jungle 🌿, volcan 🔥, ruines et toundra 💧, obélisque et abysses ⚡). Aux niveaux 20, 40 et 60, des paliers donnent des PV et de l'attaque. Le bouton « Comment le jouer » de chaque fiche donne des conseils."]);
