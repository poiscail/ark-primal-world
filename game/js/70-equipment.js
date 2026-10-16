/* Équipement : armes, armures, talismans (butin, amélioration, démontage, auto-équipement) */
const SLOTS={w:{n:"Arme",i:"⚔️"},a:{n:"Armure",i:"🛡️"},c:{n:"Talisman",i:"📿"}};
const ITEMN={w:["Croc","Griffe","Corne","Queue épineuse","Mâchoire"],a:["Carapace","Cuirasse d'écailles","Peau durcie","Plastron fossile"],c:["Totem","Fossile gravé","Plume sacrée","Ambre taillé"]};
const IRAR=["Commun","Rare","Épique","Légendaire"],ICOL=["#aab6d1","#67e5ff","#bd8aff","#ffd15c"];
const CHARM_PA=["crit","regen","swift","guard","leech","firstblood","thorns","lucky","berserk","elemental"],CHARM_PA_L=[...CHARM_PA,"tank","leader","lastbreath"];
const MAX_ITEMS=120,MAX_ILVL=10;
const _ens7=ens;ens=function(){_ens7();S.items=S.items||[];S.nextItem=S.nextItem||1};
const findItem=id=>(S.items||[]).find(x=>x.id===id);
const itemOwner=id=>S.team.find(d=>d.eq&&Object.values(d.eq).includes(id));
function itemStats(it){const m=1+.2*it.lvl;if(it.s==="w")return{atk:Math.round([5,9,15,24][it.r]*m)};if(it.s==="a")return{hp:Math.round([25,45,75,120][it.r]*m),def:Math.round([2,4,6,9][it.r]*(1+.15*it.lvl))};return{hp:Math.round([10,18,30,48][it.r]*m),atk:Math.round([2,4,6,10][it.r]*m)}}
const statTxt=it=>{const s=itemStats(it);return[s.hp?"PV +"+s.hp:"",s.atk?"ATQ +"+s.atk:"",s.def?"DÉF +"+s.def:""].filter(Boolean).join(" · ")};
function eqBonus(d){const o={hp:0,atk:0,def:0};if(!d.eq||!S.items)return o;for(const k of ["w","a","c"]){const it=d.eq[k]?findItem(d.eq[k]):null;if(it){const s=itemStats(it);o.hp+=s.hp||0;o.atk+=s.atk||0;o.def+=s.def||0}}return o}
/* attribut d'un objet : sûr même si l'attribut est déclaré par un module chargé plus tard (ex. 99-species2) */
const paOf=k=>PA[k]||{i:"✨",n:k,d:""};
function charmPA(d){const it=d.eq&&d.eq.c?findItem(d.eq.c):null;return it&&PA[it.pa]?it.pa:""}
const hasPA=(d,id)=>PA_of(d)===id||charmPA(d)===id;
const _st7=stats;stats=function(d){const v=_st7(d),b=eqBonus(d);return{hp:v.hp+b.hp,atk:v.atk+b.atk,def:v.def+b.def}};
/* génération */
function newItem(s,r){ens();const pool=r===3?CHARM_PA_L:CHARM_PA;return{id:S.nextItem++,s,r,lvl:0,n:ITEMN[s][rnd(ITEMN[s].length)],pa:s==="c"&&r>=1?pool[rnd(pool.length)]:""}}
function addItem(it){ens();if(S.items.length>=MAX_ITEMS){toast("Sac plein ("+MAX_ITEMS+") : démonte des objets.");return false}S.items.push(it);bump("loot");return true}
function lootRar(level,boost){const w=[Math.max(10,62-level*.55),28,8+level*.18,2+level*.14];for(let i=0;i<(boost||0);i++){w[0]*=.4;w[2]*=1.4;w[3]*=1.8}return rollW(w)}
function rollItem(level,boost,slot){return newItem(slot||["w","a","c"][rnd(3)],lootRar(level,boost))}
const itemName=it=>`${SLOTS[it.s].i} <b style="color:${ICOL[it.r]}">${esc(it.n)}</b>${it.lvl?" +"+it.lvl:""} <span class="muted tiny">(${IRAR[it.r]})</span>`;
const lootPanel=items=>`<div class="panel"><b>🎒 Butin</b>${items.map(it=>`<div class="tiny" style="margin-top:4px">${itemName(it)} — ${statTxt(it)}${it.pa?" · "+paOf(it.pa).i+" "+paOf(it.pa).n:""}</div>`).join("")}</div>`;
/* butin des combats d'histoire et de donjon (les autres modes appellent giveLoot eux-mêmes) */
function giveLoot(items){const got=items.filter(addItem);return got}
const _win7=win;win=function(){_win7();const f=fight;if(!f||f.over!=="win"||f.lootDone||!["story","dungeon"].includes(f.o.mode))return;f.lootDone=true;ens();const items=[];
 if(f.o.mode==="story"){const boss=f.n%10===0;if(boss||Math.random()<.2)items.push(rollItem(f.n,boss?1:0));if(f.n%50===0)items.push(rollItem(f.n,2))}
 else{const t=f.o.tier,sl=["w","a","c",null,null][f.o.d];if(Math.random()<.5+.1*t)items.push(rollItem(f.n,t>=3?1:0,sl));if(t>=4)items.push(rollItem(f.n,1,sl))}
 const got=giveLoot(items);if(got.length){f.report=lootPanel(got)+f.report;save();if(screen==="battle")renderBattle()}};
/* paiement générique */
const bal=k=>MATS[k]?S.mat[k]:S[k]||0;
const canPay=c=>Object.entries(c).every(([k,v])=>bal(k)>=v);
const pay=c=>{const n={};Object.keys(c).forEach(k=>n[k]=-c[k]);give(n)};
const upCost=it=>({stone:60*(it.lvl+1)*(it.r+1),bone:2*(it.lvl+1),...(it.lvl>=4?{crystal:it.r+1}:{})});
function upgradeItem(id){ens();const it=findItem(id);if(!it)return;if(it.lvl>=MAX_ILVL){toast("Niveau maximum.");return}const c=upCost(it);if(!canPay(c)){toast("Il faut : "+fmt(c));return}pay(c);it.lvl++;bump("upgrades");log("Forge : "+it.n+" passe +"+it.lvl+".");save();render();if(eqOpen)eqRender()}
const salvageVal=it=>{const b=[{bone:2},{bone:4,hide:2},{bone:6,hide:4,crystal:1},{bone:8,crystal:3,amber:2}][it.r],o={...b};o.bone=(o.bone||0)+it.lvl*(it.r+1);return o};
function salvageItem(id){ens();const it=findItem(id);if(!it)return;if(itemOwner(id)){toast("Déséquipe d'abord cet objet.");return}const v=salvageVal(it);S.items=S.items.filter(x=>x.id!==id);give(v);log("Recyclage : "+it.n+" → "+fmt(v));save();render();if(eqOpen)eqRender()}
function salvageCommons(){ens();const l=S.items.filter(it=>it.r===0&&!itemOwner(it.id));if(!l.length){toast("Aucun objet commun à démonter.");return}const tot={};l.forEach(it=>{const v=salvageVal(it);Object.keys(v).forEach(k=>tot[k]=(tot[k]||0)+v[k])});if(!confirm("Démonter "+l.length+" objets communs contre "+fmt(tot)+" ?"))return;const ids=new Set(l.map(x=>x.id));S.items=S.items.filter(x=>!ids.has(x.id));give(tot);log("Recyclage de "+l.length+" objets communs → "+fmt(tot));save();render()}
/* équiper */
function equip(did,iid){const d=S.team.find(x=>x.id===did),it=findItem(iid);if(!d||!it)return;S.team.forEach(x=>{if(x.eq)for(const k in x.eq)if(x.eq[k]===iid)delete x.eq[k]});d.eq=d.eq||{};d.eq[it.s]=iid;save();render();if(eqOpen)eqRender()}
function unequip(did,slot){const d=S.team.find(x=>x.id===did);if(!d||!d.eq)return;delete d.eq[slot];save();render();if(eqOpen)eqRender()}
const iscore=it=>{const s=itemStats(it);return(s.hp||0)/4+(s.atk||0)*3+(s.def||0)*2+(it.pa?25*(it.r+1):0)};
function autoEquip(){ens();const team=T3(),inTeam=new Set(team.map(d=>d.id));team.forEach(d=>{d.eq={}});
 for(const s of ["w","a","c"]){const used=new Set();S.team.forEach(d=>{if(!inTeam.has(d.id)&&d.eq&&d.eq[s])used.add(d.eq[s])});
  const pool=S.items.filter(it=>it.s===s&&!used.has(it.id)).sort((a,b)=>iscore(b)-iscore(a));team.forEach((d,i)=>{if(pool[i])d.eq[s]=pool[i].id})}
 log("Équipement : équipe équipée automatiquement.");toast("Équipement optimisé pour l'équipe.");save();render()}
const eqSummary=d=>["w","a","c"].map(k=>{const it=d.eq&&d.eq[k]?findItem(d.eq[k]):null;return it?SLOTS[k].i+(it.lvl?"+"+it.lvl:""):"▫️"}).join(" ");
function eqLine(d){let h="";for(const k of ["w","a","c"]){const it=d.eq&&d.eq[k]?findItem(d.eq[k]):null;if(it)h+=`<div class="tiny" style="margin-top:3px">${itemName(it)} — ${statTxt(it)}${it.pa?" · "+paOf(it.pa).i+" "+paOf(it.pa).n:""}</div>`}return h}
/* fenêtre d'équipement d'un dinosaure */
let eqOpen=false,eqDino=0,eqSlot="w",bagF="all",bagLim=10;
document.body.insertAdjacentHTML("beforeend",'<div id="eqVeil" class="authveil hide"><div class="authbox" id="eqBody"></div></div>');
function openEq(id){eqDino=id;eqOpen=true;eqRender();$$("eqVeil").classList.remove("hide")}
function closeEq(){eqOpen=false;$$("eqVeil").classList.add("hide")}
function setEqSlot(s){eqSlot=s;eqRender()}
function itemRow(it,btns){const o=itemOwner(it.id);return `<div class="it" style="border-color:${ICOL[it.r]}"><div>${itemName(it)}</div><div class="tiny">${statTxt(it)}${it.pa?`<br>${paOf(it.pa).i} <b>${paOf(it.pa).n}</b> : ${paOf(it.pa).d}`:""}</div>${o?`<div class="tiny muted">Équipé sur ${esc(SPEC[o.type]?SPEC[o.type].name:"?")}</div>`:""}<div class="btns">${btns}</div></div>`}
function eqRender(){const d=S.team.find(x=>x.id===eqDino);if(!d){closeEq();return}const cur=d.eq&&d.eq[eqSlot]?findItem(d.eq[eqSlot]):null,v=stats(d),b=eqBonus(d);
 const cand=S.items.filter(it=>it.s===eqSlot&&(!cur||it.id!==cur.id)).sort((a,b2)=>iscore(b2)-iscore(a)).slice(0,12);
 $$("eqBody").innerHTML=`<div class="row"><div class="grow"><h2 style="margin:0">Équipement</h2><div class="muted tiny">${esc(sp(d).name)} · PV ${v.hp} · ATQ ${v.atk} · DÉF ${v.def}<br>Bonus d'équipement : PV +${b.hp} · ATQ +${b.atk} · DÉF +${b.def}</div></div><button class="secondary" onclick="closeEq()">FERMER</button></div>
 <div class="eltabs">${["w","a","c"].map(k=>{const it=d.eq&&d.eq[k]?findItem(d.eq[k]):null;return `<button class="${eqSlot===k?"on":""}" style="font-size:12px" onclick="setEqSlot('${k}')">${SLOTS[k].i} ${SLOTS[k].n}<br><span style="font-size:9px">${it?esc(it.n)+(it.lvl?" +"+it.lvl:""):"vide"}</span></button>`}).join("")}</div>
 <div class="sectionhead"><h2>Équipé</h2></div>${cur?itemRow(cur,`<button class="secondary" onclick="unequip(${d.id},'${eqSlot}')">DÉSÉQUIPER</button><button class="purple" ${cur.lvl>=MAX_ILVL?"disabled":""} onclick="upgradeItem(${cur.id})">${cur.lvl>=MAX_ILVL?"MAX":"AMÉLIORER · "+fmt(upCost(cur))}</button>`):'<div class="muted tiny">Aucun objet équipé dans cet emplacement.</div>'}
 <div class="sectionhead"><h2>Sac (${S.items.filter(it=>it.s===eqSlot).length})</h2></div>${cand.length?cand.map(it=>itemRow(it,`<button onclick="equip(${d.id},${it.id})">ÉQUIPER</button><button class="red" ${itemOwner(it.id)?"disabled":""} onclick="salvageItem(${it.id})">DÉMONTER</button>`)).join(""):'<div class="muted tiny">Aucun autre objet de ce type. Combats des boss et des donjons pour en trouver.</div>'}`}
/* sac d'équipement (écran Équipe) */
function bagList(){return S.items.filter(it=>bagF==="all"||it.s===bagF).sort((a,b)=>b.r-a.r||b.lvl-a.lvl||iscore(b)-iscore(a))}
function setBagF(f){bagF=f;bagLim=10;render()}
function renderBag(){const l=bagList(),nW=S.items.filter(i=>i.s==="w").length,nA=S.items.filter(i=>i.s==="a").length,nC=S.items.filter(i=>i.s==="c").length;
 $$("bagBox").innerHTML=`<b>🎒 Équipement : ${S.items.length}/${MAX_ITEMS}</b><div class="muted tiny">⚔️ ${nW} · 🛡️ ${nA} · 📿 ${nC} — équipe-les depuis la carte d'un dinosaure.</div><div class="eltabs">${[["all","Tout"],["w","⚔️"],["a","🛡️"],["c","📿"]].map(x=>`<button class="${bagF===x[0]?"on":""}" style="font-size:12px" onclick="setBagF('${x[0]}')">${x[1]}</button>`).join("")}</div><div class="btns"><button class="blue" onclick="autoEquip()">AUTO-ÉQUIPER L'ÉQUIPE</button><button class="red" onclick="salvageCommons()">DÉMONTER LES COMMUNS</button></div>${l.slice(0,bagLim).map(it=>itemRow(it,`<button class="purple" ${it.lvl>=MAX_ILVL?"disabled":""} onclick="upgradeItem(${it.id})">${it.lvl>=MAX_ILVL?"MAX":"⬆ "+fmt(upCost(it))}</button><button class="red" ${itemOwner(it.id)?"disabled":""} onclick="salvageItem(${it.id})">DÉMONTER</button>`)).join("")}${l.length>bagLim?`<button class="wide secondary" onclick="bagLim+=10;render()">VOIR PLUS (${l.length-bagLim})</button>`:""}${l.length?"":'<div class="muted tiny" style="margin-top:8px">Aucun objet. Les boss, les donjons et les modes spéciaux en donnent.</div>'}`}
$$("colTools").insertAdjacentHTML("afterend",'<div class="panel" id="bagBox"></div>');
const _r7=render;render=function(){_r7();renderBag()};
/* missions */
[["loot","objets trouvés",[5,25,100]],["upgrades","améliorations d'objets",[5,25,100]]].forEach(([t,l,gs])=>gs.forEach((g,i)=>PERM.push({id:"p_"+t+g,t,g,n:g+" "+l,r:{tickets:i+1,crystal:i+1,stone:100*(i+1)}})));
render();
