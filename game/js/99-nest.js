/* Le Nid d'élevage (0.26) : Quêtes > 🥚 Nid, dès le niveau 15 de l'histoire (2e nid au niveau 40).
   Deux dinos de la même famille (niveau 10 ou plus, hors espèces exclusives du Grand Nord) pondent un œuf de couvée.
   Le petit, de l'une des deux espèces, hérite des gènes (d.gn={hp,atk} : +2 % par point, 5 au plus par statistique ;
   le meilleur parent l'emporte à 70 %), avec une chance de mutation (+1 point : 20 %, 35 % si les parents sont de la même
   espèce), parfois de la variante d'un parent (20 %, sinon 3 % de variante spontanée), et une génération de plus (d.gen).
   Il gagne l'empreinte (d.imp : +3 % PV et ATQ, 3 au plus) à chaque victoire où il fait partie de l'équipe (d.baby).
   Le résultat est fixé à la ponte (S.nest.slots) ; les parents veillent sur l'œuf (d.nestT) jusqu'à l'éclosion.
   La durée dépend de la rareté du petit, divisée par EVENTS[…].nest pendant la Saison des amours (99-events2). */
const NEST_UNLOCK=15,NEST_SLOT2=40,NEST_LV=10,GENE_MAX=5,GENE_PCT=.02,IMP_MAX=3,IMP_PCT=.03;
const NEST_R={Commun:{m:20,c:{hide:3,bone:3}},Rare:{m:60,c:{hide:5,bone:5,amber:1}},"Épique":{m:180,c:{hide:8,bone:8,amber:3}},"Légendaire":{m:360,c:{hide:12,bone:12,amber:5,crystal:3}}};
const nestFam=k=>(PORT[k]||["T"])[0];
const geneOf=d=>({hp:(d&&d.gn&&d.gn.hp)||0,atk:(d&&d.gn&&d.gn.atk)||0}),geneSum=d=>{const g=geneOf(d);return g.hp+g.atk};
const nestSpeed=()=>{try{const e=EVENTS[wkNow()%EVENTS.length];return e&&e.nest>1?e.nest:1}catch(e){return 1}};
let nestSel={a:null,b:null};
const _ensNest=ens;ens=function(){_ensNest();let N=S.nest;if(!N||typeof N!=="object")N=S.nest={};if(!Array.isArray(N.slots))N.slots=[];while(N.slots.length<2)N.slots.push(null);for(const k of ["hatched","mut"])if(!(N[k]>=0))N[k]=0};
const nestSlots=()=>(S.stage||0)>=NEST_SLOT2?2:1;
const nestLeft=e=>Math.max(0,e.t1-Date.now());
const nestBusy=d=>!!(d&&d.nestT&&d.nestT>Date.now());
const nestWhy=d=>!d?"":SPEC[d.type]&&SPEC[d.type].ex?"Les gardiens du Grand Nord ne pondent pas en captivité.":d.level<NEST_LV?"Niveau "+NEST_LV+" requis.":nestBusy(d)?"Veille déjà sur un œuf.":"";
const nestOk=d=>!!d&&!nestWhy(d);
const nestName=d=>esc((SPEC[d.type]||sp(d)).name);
const nestRar=(A,B)=>RAR5.indexOf(sp(A).r)>=RAR5.indexOf(sp(B).r)?sp(A).r:sp(B).r;
function nestPair(){const A=S.team.find(d=>d.id===nestSel.a),B=S.team.find(d=>d.id===nestSel.b);return{A,B,ok:!!(A&&B&&A.id!==B.id&&nestOk(A)&&nestOk(B)&&nestFam(A.type)===nestFam(B.type))}}
function nestDur(ms){const m=Math.ceil(ms/60000);if(ms<60000)return Math.max(0,Math.ceil(ms/1000))+" s";if(m<60)return m+" min";const h=Math.floor(m/60),r=m%60;return h+" h"+(r?" "+String(r).padStart(2,"0"):"")}
/* 0.41 (idée 449) : le prix dépend aussi de la rareté de l'œuf (1/1/2/3 🔮 par quart d'heure restant) ; avant, un œuf légendaire de 6 h
   coûtait 24 🔮, soit à peine quelques victoires. */
const NEST_RUSH={Commun:1,Rare:1,"Épique":2,"Légendaire":3};
const nestRushCost=e=>{const l=nestLeft(e);if(!l)return 0;return Math.ceil(l/900000)*(NEST_RUSH[(SPEC[e.type]||{}).r]||1)};
/* ---- hérédité ---- */
function nestVar(A,B){const pv=[A.v,B.v].filter(x=>x&&x!=="normal");if(pv.length&&Math.random()<.2)return pv[rnd(pv.length)];
 if(Math.random()<.03){const ks=["alpha","shadow","albino","golden","prism"];let r=Math.random()*ks.reduce((s,k)=>s+VAR[k].w,0);for(const k of ks){r-=VAR[k].w;if(r<0)return k}return "alpha"}return "normal"}
function nestBaby(A,B){const ga=geneOf(A),gb=geneOf(B),gn={},same=A.type===B.type;
 for(const s of ["hp","atk"])gn[s]=Math.random()<.7?Math.max(ga[s],gb[s]):Math.min(ga[s],gb[s]);
 let mut=false;if(Math.random()<(same?.35:.2)){const s=(Math.random()<.5?["hp","atk"]:["atk","hp"]).find(x=>gn[x]<GENE_MAX);if(s){gn[s]++;mut=true}}
 return{type:Math.random()<.5?A.type:B.type,gn,mut,v:nestVar(A,B),gen:Math.max(A.gen||1,B.gen||1)+1,lv:Math.max(1,Math.floor(Math.min(A.level,B.level)/2))}}
/* ---- statistiques : gènes et empreinte ---- */
const _stNest=stats;stats=function(d){const v=_stNest(d);if(!d||(!d.gn&&!d.imp))return v;const g=geneOf(d),im=Math.min(IMP_MAX,d.imp||0);
 return{hp:Math.round(v.hp*(1+GENE_PCT*g.hp+IMP_PCT*im)),atk:Math.round(v.atk*(1+GENE_PCT*g.atk+IMP_PCT*im)),def:v.def}};
function geneTag(d){if(!d)return "";const g=geneOf(d),gen=d.gen||1;if(gen<2&&!g.hp&&!g.atk&&!d.baby)return "";const p=n=>Math.round(n*GENE_PCT*100);
 return `<span class="gtag">🧬 G${gen}</span> <span class="gtag ${g.hp?"on":""}">PV +${p(g.hp)} %</span> <span class="gtag ${g.atk?"on":""}">ATQ +${p(g.atk)} %</span>`+(d.baby?` <span class="gtag imp ${(d.imp||0)>=IMP_MAX?"on":""}" title="Empreinte : +${Math.round(IMP_PCT*100)} % PV et ATQ par victoire avec ce petit dans l'équipe (${IMP_MAX} au plus)">🤲 ${d.imp||0}/${IMP_MAX}</span>`:"")}
const _cardNest=card;card=function(d,a){const h=_cardNest(d,a),t=geneTag(d);return t?h.replace(/(⚔ Puissance [^<]*<\/div>)/,`$1<div class="tiny genes">${t}</div>`):h};
/* empreinte : chaque victoire avec le petit dans l'équipe */
const _winNest=win;win=function(){const f=fight,was=f&&f.over;_winNest();if(!f||f.over!=="win"||was)return;const m=[];
 T3().forEach(d=>{if(d&&d.baby&&(d.imp||0)<IMP_MAX){d.imp=(d.imp||0)+1;m.push(SPEC[d.type].name+" "+d.imp+"/"+IMP_MAX)}});if(m.length){save();toast("🤲 Empreinte : "+m.join(", "),2600)}};
/* ---- actions ---- */
function nestLay(){ens();const N=S.nest;if((S.stage||0)<NEST_UNLOCK){toast("Le Nid s'ouvre au niveau "+NEST_UNLOCK+" de l'histoire.");return}
 const i=N.slots.findIndex((x,j)=>!x&&j<nestSlots());if(i<0){toast("Tous les nids sont occupés.");return}
 const{A,B,ok}=nestPair();if(!ok){toast("Choisis deux dinos compatibles : même famille, niveau "+NEST_LV+" ou plus.");return}
 const c=NEST_R[nestRar(A,B)].c;if(Object.entries(c).some(([m,v])=>(S.mat[m]||0)<v)){toast("Matériaux insuffisants : "+fmt(c));return}
 Object.entries(c).forEach(([m,v])=>S.mat[m]-=v);const b=nestBaby(A,B),now=Date.now(),t1=now+Math.round(NEST_R[SPEC[b.type].r].m*60000/nestSpeed());
 N.slots[i]={...b,a:A.id,b:B.id,ta:A.type,tb:B.type,t0:now,t1};A.nestT=B.nestT=t1;nestSel={a:null,b:null};bump("nestLay");
 log("Nid : "+SPEC[A.type].name+" × "+SPEC[B.type].name+" ont pondu un œuf.");save();try{sfx("buy")}catch(e){}render()}
function nestRush(i){ens();const e=S.nest.slots[i];if(!e)return;const c=nestRushCost(e);if(!c)return;if((S.essence||0)<c){toast("Il faut "+c+" 🔮 pour accélérer.");return}
 S.essence-=c;const now=Date.now();e.t1=now;[e.a,e.b].forEach(id=>{const p=S.team.find(x=>x.id===id);if(p&&p.nestT>now)p.nestT=now});save();render()}
function nestHatch(i){ens();const N=S.nest,e=N.slots[i];if(!e||nestLeft(e)>0)return;const had=new Set(S.team.map(d=>d.type));
 const d={id:S.nextId++,type:e.type,level:e.lv,xp:0,v:e.v||"normal",gn:{hp:e.gn.hp,atk:e.gn.atk},gen:e.gen,baby:1,imp:0};S.team.push(d);N.slots[i]=null;N.hatched++;if(e.mut)N.mut++;
 bump("nestHatch");log("Nid : un petit "+SPEC[d.type].name+" est né (génération "+d.gen+")"+(e.mut?", avec une mutation !":"."));save();
 showGacha([d],had.has(d.type)?new Set():new Set([d.id]),"🐣 UN PETIT EST NÉ !");
 const ok=document.querySelector("#gachaBody > button.wide");if(ok)ok.insertAdjacentHTML("beforebegin",`<div class="nestborn">${geneTag(d)}${e.mut?'<div class="nmut">🧬 MUTATION !</div>':""}</div>`);render()}
function nestPick(w){ens();const A=w==="b"?S.team.find(d=>d.id===nestSel.a):null,B=w==="a"?S.team.find(d=>d.id===nestSel.b):null;
 const L=S.team.filter(d=>nestOk(d)&&(!A||(d.id!==A.id&&nestFam(d.type)===nestFam(A.type)))&&(!B||d.id!==B.id)).sort((x,y)=>geneSum(y)-geneSum(x)||(y.gen||1)-(x.gen||1)||y.level-x.level);
 openModal(`<h3 style="margin:0 0 4px">${w==="a"?"Premier parent":"Second parent"}</h3><div class="tiny muted">${A?"Même famille que "+nestName(A)+" ("+esc(FAMNAME[nestFam(A.type)]||"")+")":"Niveau "+NEST_LV+" ou plus"} · les meilleurs gènes en premier</div>
  <div class="nestlist">${L.slice(0,60).map(d=>`<button class="nprow" onclick="nestSet('${w}',${d.id})"><span class="a">${art(sp(d).e)}</span><span class="grow"><b>${nestName(d)}</b><span class="tiny muted"> niv. ${d.level}${d.v&&d.v!=="normal"?" · "+esc(VAR[d.v].n):""} · ${esc(FAMNAME[nestFam(d.type)]||"")}</span><br><span class="tiny">${geneTag(d)||'<span class="muted">sans gènes</span>'}</span></span></button>`).join("")||'<div class="muted tiny" style="margin:8px 0">Aucun dino compatible pour l\'instant.</div>'}</div>
  <button class="wide secondary" onclick="closeModal()">FERMER</button>`)}
function nestSet(w,id){nestSel[w]=id;if(w==="a"){const A=S.team.find(d=>d.id===id),B=S.team.find(d=>d.id===nestSel.b);if(B&&A&&(B.id===A.id||nestFam(B.type)!==nestFam(A.type)))nestSel.b=null}closeModal();render()}
/* ---- écran ---- */
function nestEggHTML(e,i){const left=nestLeft(e),tot=Math.max(1,e.t1-e.t0),pc=Math.round(Math.min(100,100-left/tot*100)),A=SPEC[e.ta]||{name:"?"},B=SPEC[e.tb]||{name:"?"},fam=nestFam(e.ta);
 return `<div class="panel nestslot ${left?"":"ready"}" data-egg="${i}"><div class="row"><div class="negg f-${fam}"><span>${left?"🥚":"🐣"}</span></div><div class="grow"><b>Nid ${i+1} : ${esc(A.name)} × ${esc(B.name)}</b><div class="muted tiny">${esc(FAMNAME[fam]||"")} · ${left?`éclosion dans <span class="nleft">${nestDur(left)}</span>`:"prêt à éclore !"}</div><div class="progress"><i style="width:${pc}%"></i></div></div></div>
  ${left?`<button class="wide secondary nrush" onclick="nestRush(${i})">⚡ ACCÉLÉRER · ${nestRushCost(e)} 🔮</button>`:`<button class="wide nesthatch" onclick="nestHatch(${i})">🐣 FAIRE ÉCLORE</button>`}</div>`}
function nestNewHTML(){const{A,B,ok}=nestPair(),pick=(w,d)=>`<button class="nestpar ${d?"on":""}" onclick="nestPick('${w}')">${d?`<span class="a">${art(sp(d).e)}</span><b>${nestName(d)}</b><span class="tiny muted">niv. ${d.level}${d.v&&d.v!=="normal"?" · "+esc(VAR[d.v].n):""}</span>${geneTag(d)?`<span class="tiny">${geneTag(d)}</span>`:""}`:`<span class="nq">＋</span><b>${w==="a"?"Premier parent":"Second parent"}</b><span class="tiny muted">${w==="b"&&A?"famille : "+esc(FAMNAME[nestFam(A.type)]||""):"touche pour choisir"}</span>`}</button>`;
 let info=`<div class="muted tiny" style="margin-top:8px">Choisis deux dinos de la même famille, niveau ${NEST_LV} ou plus. Le petit naît au niveau de la moitié du plus faible des parents.</div>`;
 if(ok){const c=NEST_R[nestRar(A,B)].c,same=A.type===B.type,ga=geneOf(A),gb=geneOf(B),ms=[A,B].map(d=>NEST_R[sp(d).r].m*60000/nestSpeed()),afford=Object.entries(c).every(([m,v])=>(S.mat[m]||0)>=v),pv=[A,B].some(d=>d.v&&d.v!=="normal");
  info=`<div class="nestinfo tiny"><div>🐣 Espèce : ${same?nestName(A)+" (lignée pure)":nestName(A)+" ou "+nestName(B)+" (une chance sur deux)"} · génération ${Math.max(A.gen||1,B.gen||1)+1}</div>
   <div>🧬 Gènes des parents : PV +${ga.hp*2} % / +${gb.hp*2} %, ATQ +${ga.atk*2} % / +${gb.atk*2} % (le meilleur l'emporte à 70 %)</div>
   <div>✨ Mutation : ${same?35:20} % · variante : ${pv?"20 % (celle d'un parent)":"3 %"}</div>
   <div>⏳ Incubation : ${nestDur(Math.min(...ms))}${ms[0]!==ms[1]?" à "+nestDur(Math.max(...ms)):""} · coût : ${fmt(c)}</div></div>
   <button class="wide blue" ${afford?"":"disabled"} onclick="nestLay()">🥚 PONDRE ${afford?"":"(matériaux insuffisants)"}</button>`}
 return `<div class="panel nestnew"><b>Nouvelle couvée</b><div class="nestpair">${pick("a",A)}<span class="nheart">💞</span>${pick("b",B)}</div>${info}</div>`}
function nestBest(){const L=S.team.filter(d=>(d.gen||1)>1||geneSum(d)).sort((x,y)=>geneSum(y)-geneSum(x)||(y.gen||1)-(x.gen||1)).slice(0,5);if(!L.length)return "";
 return `<div class="sectionhead"><h2>Tes meilleures lignées</h2></div><div class="panel">${L.map(d=>`<div class="row nbest"><span class="a">${art(sp(d).e)}</span><div class="grow"><b>${nestName(d)}</b> <span class="tiny muted">niv. ${d.level}</span><div class="tiny">${geneTag(d)}</div></div></div>`).join("")}</div>`}
function nestRules(){return `<div class="panel tiny muted nestrules"><b>Comment ça marche</b><div>• Deux dinos de la <b>même famille</b> (niveau ${NEST_LV} ou plus) pondent un œuf ; ils veillent sur lui jusqu'à l'éclosion.</div><div>• Le petit hérite des <b>gènes</b> de ses parents : chaque point donne +${Math.round(GENE_PCT*100)} % de PV ou d'ATQ (${GENE_MAX} au plus par statistique).</div><div>• <b>Mutation</b> : +1 point de gène (20 %, 35 % si les parents sont de la même espèce). Lignée après lignée, les gènes s'accumulent.</div><div>• <b>Variante</b> : 20 % d'hériter de celle d'un parent, sinon 3 % d'une variante spontanée.</div><div>• <b>Empreinte</b> : +${Math.round(IMP_PCT*100)} % PV et ATQ à chacune des ${IMP_MAX} premières victoires du petit dans l'équipe.</div><div>• Incubation : 20 min (commun), 1 h (rare), 3 h (épique), 6 h (légendaire) ; elle continue jeu fermé.</div></div>`}
function renderNest(){const el=$$("nest");if(!el)return;ens();const N=S.nest,sl=nestSlots();
 let h=`<div class="banner"><div class="eyebrow">LE NID D'ÉLEVAGE</div><h1>Nid d'élevage</h1><p>Deux dinos de la même famille pondent un œuf : le petit hérite de leurs gènes, parfois d'une mutation ou d'une variante. Lignée après lignée, élève des dinos plus forts.</p><div class="heroDino">🥚</div></div>`;
 if((S.stage||0)<NEST_UNLOCK){el.innerHTML=h+`<div class="panel"><b>🔒 Le Nid s'ouvre au niveau ${NEST_UNLOCK} de l'histoire</b><div class="muted tiny">Termine le niveau ${NEST_UNLOCK} pour accoupler tes dinos.</div></div>`+nestRules();try{bannerScenes()}catch(e){}return}
 const k=nestSpeed();if(k>1)h+=`<div class="panel nestev"><b>💞 Saison des amours</b> <span class="tiny">: incubation ${k} fois plus rapide pour les œufs pondus cette semaine.</span></div>`;
 N.slots.forEach((e,i)=>{if(e)h+=nestEggHTML(e,i)});
 h+=N.slots.some((x,j)=>!x&&j<sl)?nestNewHTML():`<div class="panel muted tiny">Tous les nids sont occupés : fais éclore un œuf pour en pondre un autre.</div>`;
 if(sl<2)h+=`<div class="panel tiny muted">🔒 2e nid au niveau ${NEST_SLOT2} de l'histoire.</div>`;
 el.innerHTML=h+nestBest()+nestRules();try{bannerScenes()}catch(e){}}
/* compte à rebours sans redessiner l'écran (les clics restent fiables) ; redessin complet quand un œuf devient prêt */
setInterval(()=>{if(typeof screen==="undefined"||screen!=="nest"||!S.nest)return;let full=false;
 document.querySelectorAll("#nest [data-egg]").forEach(x=>{const e=S.nest.slots[+x.dataset.egg];if(!e)return;const left=nestLeft(e);if(!left){if(!x.classList.contains("ready"))full=true;return}
  const t=x.querySelector(".nleft"),b=x.querySelector(".progress i"),r=x.querySelector(".nrush");if(t)t.textContent=nestDur(left);if(b)b.style.width=Math.round(Math.min(100,100-left/Math.max(1,e.t1-e.t0)*100))+"%";if(r)r.textContent="⚡ ACCÉLÉRER · "+nestRushCost(e)+" 🔮"});
 if(full)render()},1000);
/* ---- navigation, rappels, missions, succès, guide ---- */
GRP.quest.screens.splice(Math.max(0,GRP.quest.screens.findIndex(s=>s[0]==="achs")),0,["nest","🥚","Nid"]);SCR2G.nest="quest";BZONE.nest=()=>"jungle";
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="nest" class="screen"></section>');
const nestReady=()=>{try{ens();return(S.stage||0)>=NEST_UNLOCK?S.nest.slots.filter(e=>e&&nestLeft(e)===0).length:0}catch(e){return 0}};
const _bdNest=badge;badge=function(k){return k==="nest"?nestReady():_bdNest(k)};
const _nuNest=navUpdate;navUpdate=function(){_nuNest();const n=nestReady(),qb=document.querySelector('.bottomnav [data-screen="missions"]');if(!qb||!n)return;const dot=qb.querySelector("b.dot"),c=(dot?parseInt(dot.textContent,10)||0:0)+n;qb.innerHTML=`<span>🎯</span>Quêtes<b class="dot">${c>9?"9+":c}</b>`};
const _rNest=render;render=function(){_rNest();if(screen==="nest")renderNest()};
const _tdNest=todoItems;todoItems=function(){const L=_tdNest();try{ens();if((S.stage||0)>=NEST_UNLOCK){const r=nestReady();if(r)L.push({i:"🐣",t:r+" œuf(s) prêt(s) à éclore au Nid",js:"go('nest')"});else if(!S.nest.hatched&&!S.nest.slots.some(Boolean))L.push({i:"🥚",t:"Nouveau : le Nid d'élevage",js:"go('nest')"})}}catch(e){}return L};
DAILY.push({id:"d_nest",t:"nestHatch",g:1,n:"Faire éclore 1 œuf au Nid d'élevage",r:{essence:4,amber:1}});
[3,15,40].forEach((g,i)=>PERM.push({id:"p_nest"+g,t:"nestHatch",g,n:g+" œufs éclos au Nid d'élevage",r:{tickets:i+1,amber:2*(i+1),stone:100*(i+1)}}));
ACH.push(["nest1","Premier œuf","Faire éclore un œuf au Nid d'élevage",()=>S.nest.hatched,1,{tickets:2,essence:20}],
 ["nest2","Éleveur","Faire éclore 15 œufs au Nid d'élevage",()=>S.nest.hatched,15,{tickets:5,amber:6}],
 ["nest3","Sang mutant","Posséder un dino avec 6 points de gènes",()=>S.team.reduce((m,d)=>Math.max(m,geneSum(d)),0),6,{tickets:5,shards:30}],
 ["nest4","Lignée royale","Faire naître un dino de 5e génération",()=>S.team.reduce((m,d)=>Math.max(m,d.gen||1),1),5,{tickets:8,essence:60},"Grand éleveur"]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Le Nid d'élevage","Quêtes > Nid (dès le niveau "+NEST_UNLOCK+" de l'histoire) : deux dinos de la même famille pondent un œuf. Le petit hérite des gènes de ses parents (+2 % PV ou ATQ par point), parfois d'une mutation ou d'une variante, et gagne l'empreinte en remportant ses 3 premières victoires dans l'équipe. Accélère l'incubation avec de l'essence ; pendant la Saison des amours, elle est deux fois plus rapide."]);
