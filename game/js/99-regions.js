/* Nouvelles régions (0.34) : moteur commun (écran « Régions », carte à 10 niveaux par chapitre, étoiles, gardiens) pour
   le chapitre 5 de l'histoire (archipel volcanique, niveaux 101-150), les Badlands (tempêtes de sable : orbes cachées),
   les grottes de cristal (obscurité : seules quelques orbes sont éclairées), les îles célestes (ptérosaures +30 %, rafales
   qui mélangent les orbes) et la Nouvelle partie + (histoire 1-100 rejouée, ennemis renforcés, dialogues différents).
   Combats par MODES.region ({r,n}), victoire par eventWin. État : S.rg[r] = {stage, stars}. */
const RG={
 arch:{i:"🌋",n:"L'archipel volcanique",sub:"Chapitre 5 de l'histoire",N:50,off:100,need:()=>(S.stage||0)>=100,needT:"Termine l'histoire (niveau 100).",eq:n=>Math.round(100+n*1.15),
  lab:"Archipel · Volcan",em:["🦂","🔥","🐲","🐆","🐷"],el:"redorb",bm:["eruption"],mats:["amber","crystal"],
  boss:{10:"Roi des Cendres",20:"Hydre de magma",30:"Titan d'obsidienne",40:"Phénix noir",50:"Cœur de l'archipel"},desc:"Cinquante niveaux sur des îles de feu, au-delà de l'horizon. La suite de l'histoire."},
 bad:{i:"🏜️",n:"Les Badlands",sub:"Canyons et tempêtes de sable",N:20,need:()=>(S.stage||0)>=30,needT:"Termine le niveau 30 de l'histoire.",eq:n=>Math.round(30+n*1.6),
  lab:"Badlands · Canyon",em:["🦂","🐍","🪲","🦴","🐃"],el:"redorb",bm:["rune"],mats:["bone","hide"],mech:"sand",
  boss:{10:"Scorpion des dunes",20:"Le Vent rouge"},desc:"Tous les 3 tours, une tempête de sable cache 3 orbes : touche-les à l'aveugle ou attends qu'elle passe."},
 cave:{i:"💎",n:"Les grottes de cristal",sub:"Sans lumière",N:20,need:()=>(S.stage||0)>=60,needT:"Termine le niveau 60 de l'histoire.",eq:n=>Math.round(60+n*1.6),
  lab:"Grotte · abysse de cristal",em:["🧊","🕷️","🦇","👁️","🗿"],el:"blueorb",bm:["saisie"],mats:["crystal","bone"],mech:"dark",
  boss:{10:"Mère-araignée",20:"Le Cristal vivant"},desc:"Dans le noir, seules quelques orbes sont éclairées à chaque tour."},
 sky:{i:"☁️",n:"Les îles célestes",sub:"Le royaume des ptérosaures",N:20,need:()=>(S.stage||0)>=80,needT:"Termine le niveau 80 de l'histoire.",eq:n=>Math.round(80+n*1.6),
  lab:"Îles célestes · jungle des nuages",em:["🦅","🦟","🦇","🐉","🐝"],el:"purpleorb",bm:["lianes"],mats:["amber","hide"],mech:"wind",
  boss:{10:"Roi des vents",20:"Le Grand Quetzal"},desc:"Les ptérosaures y frappent 30 % plus fort. Tous les 4 tours, une rafale mélange les orbes."},
 ngp:{i:"♾️",n:"Nouvelle partie +",sub:"L'histoire, en plus dur",N:100,need:()=>(S.stage||0)>=100,needT:"Termine l'histoire (niveau 100).",eq:n=>Math.round(30+n*1.25),
  lab:null,el:null,bm:null,mats:["bone","hide"],boss:{},desc:"Les 100 niveaux de l'île, avec des ennemis bien plus forts et des dialogues différents. Récompenses ×1,5."}};
const RG_K=Object.keys(RG),RG_TUNE={hp:1.1,atk:1.05};
const rgPick=(N,k)=>[...Array(N).keys()].sort(()=>Math.random()-.5).slice(0,k);
let rgCur="arch",rgCh={};
const _ensRg=ens;ens=function(){_ensRg();let R=S.rg;if(!R||typeof R!=="object")R=S.rg={};RG_K.forEach(k=>{let x=R[k];if(!x||typeof x!=="object")x=R[k]={};if(!(x.stage>=0))x.stage=0;if(!x.stars||typeof x.stars!=="object")x.stars={};if(!x.lore||typeof x.lore!=="object")x.lore={}})};
const rgOpen=(r,n)=>{ens();const G=RG[r];return!!G&&G.need()&&n>=1&&n<=G.N&&n<=S.rg[r].stage+1};
const rgNum=(r,n)=>(RG[r].off||0)+n;
const rgZoneLab=(r,n)=>RG[r].lab||zoneOf(n)[0];
/* ---- décors : les nouvelles régions empruntent un décor existant (teinté en CSS) ---- */
const _szRg=stageZone;stageZone=function(z){return/badlands/i.test(z||"")?"ruines":/c[ée]leste/i.test(z||"")?"jungle":_szRg(z)};
/* ---- combats ---- */
MODES.region=function(o){const r=RG[o.r]?o.r:"arch",G=RG[r],n=Math.max(1,Math.min(G.N,o.n||1)),eq=G.eq(n),boss=n%10===0,z=r==="ngp"?zoneOf(n):null;
 const em=z?z[1]:G.em,bn=G.boss[n]||(z?"Gardien · "+z[0]:"Gardien");
 const en=mkEnemies(eq,{emo:[em[rnd(em.length)],em[rnd(em.length)],boss?"👹":em[rnd(em.length)]],names:[rgZoneLab(r,n)+" · Ennemi",rgZoneLab(r,n)+" · Ennemi",boss?bn:rgZoneLab(r,n)+" · Élite"],boss,hp:RG_TUNE.hp,atk:RG_TUNE.atk,
  els:[EL[rnd(3)],EL[rnd(3)],(z?z[2]:G.el)||EL[rnd(3)]]});
 en.forEach(e=>{e.tr="";if(!e.boss&&Math.random()<.35){e.tr=TKEYS[rnd(TKEYS.length)];if(e.tr==="shield")e.sh=Math.round(e.max*.2);if(e.tr==="berserk")e.a0=e.atk}});if(boss){en[2]._nm=1;if(typeof ES_TOWER!=="undefined"){en[2].esk=ES_TOWER[(n/10)%ES_TOWER.length];en[2].skcd=ES_FIRST}}
 return{eq,label:G.n.replace(/^(L'|Les |La |Le )/,"")+" · "+(r==="arch"?"Niv. "+rgNum(r,n):"Niv. "+n)+" · "+rgZoneLab(r,n),enemies:en}};
const rgOn=f=>!!(f&&f.o&&f.o.mode==="region"&&RG[f.o.r]);
const _sbRg=startBattle;startBattle=function(o){const t=o||lastB;if(t&&t.mode==="region"){if(!rgOpen(t.r,t.n)){toast(RG[t.r]&&!RG[t.r].need()?RG[t.r].needT:"Ce niveau est encore verrouillé.");go("regions");return}
  const key=t.r+t.n;if(LORE["rg_"+key]&&!S.rg[t.r].lore[t.n]&&PREFS.lore!==false&&!(navigator.webdriver&&!window.__forceLore)){S.rg[t.r].lore[t.n]=1;save();return loreShow("rg_"+key,()=>_sbRg(o))}}return _sbRg(o)};
/* au premier rendu : mécanique de boss de la région, décor */
const _rbRg=renderBattle;renderBattle=function(){_rbRg();const f=fight;if(!rgOn(f))return;const G=RG[f.o.r];
 if(f.bm&&G.bm&&f.rgBmO!==f.o){f.rgBmO=f.o;f.bm=G.bm.slice();if(f.bm.includes("rune")&&!f.rune)f.rune=["redorb","blueorb","greenorb","purpleorb"][rnd(4)]}
 if(G.mech==="dark"&&!f.rgHide&&!f.over){const N=f.orbs.length,lit=new Set(rgPick(N,Math.ceil(N*.55)));f.rgHide=[...Array(N).keys()].filter(i=>!lit.has(i))}
 const box=$$("battleArea"),st=box&&box.querySelector(".battlestage");if(st)st.classList.add("rg-"+f.o.r);
 if(f.rgHide&&box)box.querySelectorAll('.orbboard button.orb[onclick^="tapOrb("]').forEach(b=>{const i=+(/tapOrb\((\d+)/.exec(b.getAttribute("onclick"))||[])[1];if(f.rgHide.includes(i))b.classList.add(G.mech==="dark"?"rgdark":"rgsand")});
 const ch=box&&box.querySelector(".sHud .fchips");if(ch&&G.mech&&!ch.querySelector(".rgm"))ch.insertAdjacentHTML("beforeend",`<span class="chip rgm">${G.mech==="sand"?"🌪️ Tempête de sable":G.mech==="dark"?"🔦 Obscurité":"🪶 Ptérosaures +30 %"}</span>`)};
const _etRg=enemyTurn;enemyTurn=function(){const f=fight;const r=_etRg();if(!rgOn(f)||f.over)return r;const G=RG[f.o.r],T=f.turn||0,N=f.orbs.length;
 if(G.mech==="sand"){if(T%3===1){f.rgHide=rgPick(N,Math.round(N/3));f.log+=" · 🌪️ Tempête de sable : des orbes sont cachées"}else if(T%3===0)f.rgHide=null}
 if(G.mech==="dark"){const lit=new Set(rgPick(N,Math.ceil(N*.55)));f.rgHide=[...Array(N).keys()].filter(i=>!lit.has(i))}
 if(G.mech==="wind"&&T%4===3){f.orbs=f.orbs.slice().sort(()=>Math.random()-.5);f.log+=" · 🌬️ Rafale : les orbes sont mélangées"}
 return r};
const _atRg=atkOf;atkOf=function(k){const v=_atRg(k),f=fight;if(!rgOn(f)||RG[f.o.r].mech!=="wind")return v;const d=T3()[k];return d&&typeof msFam==="function"&&msFam(d)==="F"?v*1.3:v};
function rgWin(f){ens();const r=f.o.r,G=RG[r],X=S.rg[r],n=f.o.n,boss=n%10===0,first=n>X.stage,eq=f.n,R={stone:40+4*eq,essence:2+Math.floor(eq/10)};R[G.mats[0]]=2+rnd(3);R[G.mats[1]]=1+rnd(2);let extra="";
 if(r==="ngp"){R.stone=Math.round(R.stone*1.5);R.essence=Math.round(R.essence*1.5)}if(boss){R.crystal=(R.crystal||0)+2;R.amber=(R.amber||0)+2}
 if(first){X.stage=n;R.tickets=boss?3:(n%5===0?1:0);R.essence+=boss?20:5;extra+='<div class="tiny ok">Première victoire !</div>';if(n===G.N){R.tickets+=5;R.shards=(R.shards||0)+30;extra+=`<div class="tiny ok">${G.i} ${esc(G.n)} : région terminée !</div>`;bump("regions")}}
 const st=starsOf(f);if(st>(X.stars[n]||0))X.stars[n]=st;bump("rg_"+r);if(boss)bump("bosses");
 if(n<G.N&&rgOpen(r,n+1))extra+=`<button class="wide blue" onclick="startBattle({mode:'region',r:'${r}',n:${n+1}})">NIVEAU SUIVANT (${r==="arch"?rgNum(r,n+1):n+1})</button>`;
 return{R,extra,loot:boss&&Math.random()<.6?[rollItem(eq,1)]:[]}}
const _ewRg=eventWin;eventWin=function(f,n){return rgOn(f)?rgWin(f):_ewRg(f,n)};
if(typeof chainNext==="function"){const _cnRg=chainNext;chainNext=function(f){if(rgOn(f)){const n=f.o.n+1;return rgOpen(f.o.r,n)?{mode:"region",r:f.o.r,n}:null}return _cnRg(f)}}
if(typeof balKey==="function"){const _bkRg=balKey;balKey=function(f){return rgOn(f)?"région "+f.o.r+" n"+f.o.n:_bkRg(f)}}
/* ---- dialogues (dont ceux, différents, de la Nouvelle partie +) ---- */
Object.assign(LORE,{rg_arch1:["🧑‍🔬","Dr Elara","Le signal venait d'ici : un chapelet d'îles volcaniques, au-delà de l'horizon.","On dit qu'une seconde Graine dort sous l'archipel. Sois prudent."],
 rg_arch50:["🧑‍🔬","Dr Elara","Le cœur de l'archipel bat comme celui de la Graine…","Si nous le calmons, toutes les îles seront enfin en paix."],
 rg_bad1:["🧢","Kael","Les Badlands ! Le sable entre partout. Tu ne verras pas la moitié de tes orbes.","Moi, j'ai l'habitude. À toi de voir si tu tiens le coup."],
 rg_cave1:["👴","Oto","Les grottes de cristal… J'y ai perdu ma lanterne il y a quarante ans.","Fie-toi aux orbes éclairées. Les autres te jouent des tours."],
 rg_sky1:["🧑‍🔬","Dr Elara","Des îles qui flottent dans les nuages ! Les ptérosaures y sont chez eux.","Emmène tes meilleurs volants : le vent est leur allié."],
 rg_ngp1:["🧢","Kael","Encore toi ? Tu recommences tout depuis le début ?","Cette fois, l'île ne te fera pas de cadeau. Moi non plus."],
 rg_ngp25:["🧑‍🔬","Dr Elara","Les ruines ont changé depuis ton premier passage… les gardiens se souviennent de toi.","Ils sont plus forts, plus méfiants."],
 rg_ngp50:["👴","Oto","Tu connais le chemin, mais pas ses nouveaux pièges.","Un vrai dresseur n'arrête jamais d'apprendre."],
 rg_ngp75:["🧕","Mira","Les marchands parlent de toi jusqu'au nord, tu sais ?","Une légende qui recommence tout… c'est bon pour les affaires !"],
 rg_ngp100:["🌱","La Graine","…tu es revenu…","…merci de veiller encore sur nous…"]});
/* ---- écran ---- */
function rgStars(r){ens();return Object.values(S.rg[r].stars).reduce((a,b)=>a+b,0)}
function renderRegions(){const el=$$("regions");if(!el)return;ens();const r=RG[rgCur]?rgCur:"arch",G=RG[r],X=S.rg[r],ok=G.need(),cur=Math.min(G.N,X.stage+1);if(rgCh[r]===undefined)rgCh[r]=Math.floor((cur-1)/10);const ch=rgCh[r],c0=ch*10+1,nch=Math.ceil(G.N/10);
 const tabs=`<div class="rgtabs">${RG_K.map(k=>`<button class="${k===r?"on":""} ${RG[k].need()?"":"lock"}" onclick="rgCur='${k}';render()"><span>${RG[k].i}</span>${esc(RG[k].n.replace(/^(L'|Les |La |Le )/,""))}<small>${RG[k].need()?S.rg[k].stage+"/"+RG[k].N:"🔒"}</small></button>`).join("")}</div>`;
 let h=`<div class="banner"><div class="eyebrow">RÉGIONS · ${esc(G.sub.toUpperCase())}</div><h1>${G.i} ${esc(G.n)}</h1><p>${esc(G.desc)}</p></div>`+tabs;
 if(!ok){el.innerHTML=h+`<div class="panel"><b>🔒 Région encore inaccessible</b><div class="muted tiny">${esc(G.needT)}</div></div>`;try{bannerScenes()}catch(e){}return}
 const pos=i=>{const xs=[50,24,44,74,56,26,42,72,66,42];return{x:xs[i],y:92-i*9.2}};let path="";for(let i=0;i<10;i++){const p=pos(i);path+=(i?" L":"M")+p.x+" "+p.y}
 const zk=stageZone(rgZoneLab(r,c0)),nodes=[...Array(10)].map((_,i)=>{const n=c0+i;if(n>G.N)return"";const p=pos(i),boss=n%10===0,done=n<=X.stage,isCur=n===cur&&X.stage<G.N,lock=!rgOpen(r,n),st=X.stars[n]||0;
  return `<button class="mnode ${boss?"boss":""} ${done?"done":""} ${isCur?"cur":""} ${lock?"lock":""}" style="left:${p.x}%;top:${p.y}%" ${lock?"disabled":""} onclick="startBattle({mode:'region',r:'${r}',n:${n}})"><span class="mn">${boss?"👹":rgNum(r,n)}</span>${done?`<span class="mst">${[1,2,3].map(k=>`<i class="${k<=st?"on":""}">★</i>`).join("")}</span>`:""}${boss?`<span class="mbl">${esc((G.boss[n]||"BOSS "+rgNum(r,n)).toUpperCase())}</span>`:""}</button>`}).join("");
 h+=`<div class="panel"><div class="todohead"><b>${G.i} ${X.stage}/${G.N}</b><span class="chip">ennemis niv. ${G.eq(c0)}–${G.eq(Math.min(G.N,c0+9))} · ⭐ ${rgStars(r)}</span></div><div class="progress"><i style="width:${X.stage/G.N*100}%"></i></div>
  ${X.stage<G.N?`<button class="wide blue rgplay" onclick="startBattle({mode:'region',r:'${r}',n:${cur}})">${G.i} JOUER LE NIVEAU ${rgNum(r,cur)}</button>`:'<div class="ok">Région terminée ! Rejoue les niveaux pour les étoiles.</div>'}</div>
  <div class="panel mapwrap"><div class="maphead"><button class="secondary" ${ch?"":"disabled"} onclick="rgCh['${r}']=${ch-1};render()">‹</button><div><b>Chapitre ${ch+1}/${nch}</b><div class="muted tiny">Niveaux ${rgNum(r,c0)}–${rgNum(r,Math.min(G.N,c0+9))}</div></div><button class="secondary" ${ch<nch-1?"":"disabled"} onclick="rgCh['${r}']=${ch+1};render()">›</button></div>
  <div class="smap z-${zk} rgmap-${r}">${sceneHTML(zk)}<svg class="mpath" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${path}" class="mp1"/><path d="${path}" class="mp2"/></svg>${nodes}</div></div>`;
 el.innerHTML=h;try{bannerScenes()}catch(e){}}
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="regions" class="screen"></section>');
GRP.adv.screens.push(["regions","🧭","Régions"]);SCR2G.regions="adv";SUBS.push(["regions","🧭","Régions"]);ADV.add("regions");BZONE.regions=()=>stageZone(rgZoneLab(RG[rgCur]?rgCur:"arch",1));
const _rRg=render;render=function(){_rRg();if(screen==="regions")renderRegions()};
/* carte du monde : l'archipel n'est plus « bientôt » */
if(typeof WD_REG!=="undefined"){const a=WD_REG.find(x=>x.k==="arch");if(a){delete a.soon;a.need=100;a.go="regions";a.js="rgCur='arch';";a.p=()=>(S.rg&&S.rg.arch.stage||0)/50}
 WD_REG.push({k:"bad",i:"🏜️",n:"Les Badlands",x:16,y:36,p:()=>(S.rg&&S.rg.bad.stage||0)/20,go:"regions",js:"rgCur='bad';",need:30},{k:"cave",i:"💎",n:"Les grottes",x:24,y:88,p:()=>(S.rg&&S.rg.cave.stage||0)/20,go:"regions",js:"rgCur='cave';",need:60},
  {k:"sky",i:"☁️",n:"Les îles célestes",x:84,y:20,p:()=>(S.rg&&S.rg.sky.stage||0)/20,go:"regions",js:"rgCur='sky';",need:80})}
ACH.push(["rg1","Explorateur","Terminer une nouvelle région",()=>(S.cnt||{}).regions||0,1,{tickets:5}],["rg2","Grand voyageur","Terminer les 5 nouvelles régions",()=>(S.cnt||{}).regions||0,5,{tickets:15,shards:40}],
 ["rg3","Recommencement","Terminer la Nouvelle partie +",()=>(((S.rg||{}).ngp||{}).stage||0)>=100?1:0,1,{essence:150,tickets:10}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Régions","Aventure > Régions : l'archipel volcanique (chapitre 5, niveaux 101 à 150, après l'histoire), les Badlands (histoire 30 : tempêtes de sable qui cachent des orbes), les grottes de cristal (histoire 60 : seules quelques orbes sont éclairées), les îles célestes (histoire 80 : ptérosaures +30 %, rafales qui mélangent les orbes) et la Nouvelle partie + (les 100 niveaux de l'île, ennemis renforcés, récompenses ×1,5, dialogues différents)."]);
