/* Histoire 100 niveaux, donjons, matériaux, éveil, gacha de base, missions */
const RARS=["Commun","Rare","Épique","Légendaire"],MATS={bone:["🦴","Os"],hide:["🟤","Cuir"],crystal:["💎","Cristal"],amber:["🟠","Ambre"]},
ICON={stone:"🪨",essence:"🔮",tickets:"🎟️",bone:"🦴",hide:"🟤",crystal:"💎",amber:"🟠"},LBL={stone:"pierres",essence:"essences",tickets:"tickets",bone:"os",hide:"cuir",crystal:"cristaux",amber:"ambre"};
const NEWD={compsog:{name:"Compsognathus",e:"🦎",r:"Commun",hp:78,atk:19,def:8,element:"greenorb"},dilopho:{name:"Dilophosaure",e:"🐍",r:"Commun",hp:92,atk:17,def:10,element:"purpleorb"},
ankylo:{name:"Ankylosaure",e:"🐢",r:"Rare",hp:160,atk:19,def:26,element:"greenorb"},carnota:{name:"Carnotaure",e:"🐂",r:"Rare",hp:120,atk:30,def:12,element:"redorb"},quetzal:{name:"Quetzalcoatlus",e:"🦅",r:"Rare",hp:100,atk:28,def:10,element:"blueorb"},
giga:{name:"Giganotosaure",e:"🐊",r:"Épique",hp:190,atk:39,def:19,element:"redorb"},mosa:{name:"Mosasaure",e:"🐋",r:"Épique",hp:210,atk:34,def:22,element:"blueorb"},
argento:{name:"Argentinosaure",e:"🐘",r:"Légendaire",hp:270,atk:38,def:28,element:"greenorb"},dracorex:{name:"Dracorex ancestral",e:"👑",r:"Légendaire",hp:215,atk:46,def:22,element:"purpleorb"}};
for(const k in NEWD){if(!SPEC[k])SPEC[k]=NEWD[k];if(!SPEC_DEFAULT[k])SPEC_DEFAULT[k]=NEWD[k]}
const DAILY=[{id:"d1",t:"wins",g:3,n:"Gagner 3 combats",r:{stone:60}},{id:"d2",t:"wins",g:8,n:"Gagner 8 combats",r:{tickets:1,bone:3}},{id:"d3",t:"dungeons",g:1,n:"Terminer 1 donjon",r:{hide:3}},{id:"d4",t:"dungeons",g:3,n:"Terminer 3 donjons",r:{crystal:2,essence:2}},{id:"d5",t:"stories",g:2,n:"Réussir 2 niveaux d'histoire",r:{stone:80,tickets:1}},{id:"d6",t:"summons",g:5,n:"Faire 5 invocations",r:{amber:2}},{id:"d7",t:"trains",g:3,n:"Entraîner 3 fois",r:{stone:40,bone:2}},{id:"d8",t:"supers",g:3,n:"Utiliser 3 super attaques",r:{essence:2}},{id:"d9",t:"bosses",g:1,n:"Vaincre un boss",r:{tickets:1,crystal:1}}];
const PERM=[];[["wins","combats gagnés",[10,50,100,300]],["stage","niveaux d'histoire terminés",[10,25,50,75,100]],["summons","invocations",[20,100,300]],["awaken","éveils",[3,10,25]],["dungeons","donjons terminés",[10,50,150]],["bosses","boss vaincus",[5,25,75]]].forEach(([t,l,gs])=>gs.forEach((g,i)=>PERM.push({id:"p_"+t+g,t,g,n:g+" "+l,r:{tickets:i+1,crystal:i+1,stone:100*(i+1)}})));
const DUN=[{n:"Crypte des Os",e:"🦴",mat:"bone",el:"redorb",en:["💀","🦴","🐺"]},{n:"Antre du Cuir",e:"🟤",mat:"hide",el:"greenorb",en:["🐗","🐃","🦏"]},{n:"Caverne de Cristal",e:"💎",mat:"crystal",el:"blueorb",en:["🧊","🦇","🐙"]},{n:"Nid d'Ambre",e:"🟠",mat:"amber",el:"purpleorb",en:["🐝","🦂","🕷️"]},{n:"Temple Primordial",e:"🔮",mat:null,el:"goldorb",en:["👁️","🗿","🐉"]}];
const TIERS=[["Facile",3,0],["Normal",15,10],["Difficile",35,30],["Extrême",60,55],["Cauchemar",90,80]];
let H=n=>Math.round(60+n*28+n*n*1.1),A=n=>8+n*1.3,zoneOf=n=>ZONES[Math.min(3,Math.floor((n-1)/25))],$$=id=>document.getElementById(id);
let lastB=null;
function ens(){S.mat=S.mat||{bone:0,hide:0,crystal:0,amber:0};S.stage=S.stage||0;S.cnt=S.cnt||{};S.pity=S.pity||0;S.claimed=S.claimed||{};const d=new Date().toISOString().slice(0,10);if(S.day!==d){S.day=d;S.dcnt={};S.dclaimed={}}S.dcnt=S.dcnt||{};S.dclaimed=S.dclaimed||{}}
let bump=(t,n=1)=>{ens();S.cnt[t]=(S.cnt[t]||0)+n;S.dcnt[t]=(S.dcnt[t]||0)+n},prog=(m,d)=>m.t==="stage"?S.stage:((d?S.dcnt:S.cnt)[m.t]||0),
fmt=r=>Object.entries(r).filter(([k,v])=>v>0).map(([k,v])=>ICON[k]+v).join(" "),
give=r=>{for(const [k,v] of Object.entries(r)){if(!v)continue;if(MATS[k])S.mat[k]+=v;else S[k]+=v}},
allM=()=>[...DAILY.map(m=>[m,1]),...PERM.map(m=>[m,0])],
snap=()=>{ens();const o={};allM().forEach(([m,d])=>o[m.id]=prog(m,d));return o};
// stats : éveil (+10 % par étoile)
const _st=stats;stats=function(d){const v=_st(d),m=1+.1*(d.star||0);return{hp:Math.round(v.hp*m),atk:Math.round(v.atk*m),def:Math.round(v.def*m)}};
// combat
/* Histoire avec moins de 3 dinos (début de partie) : ennemis affaiblis. Sans ça, le tout premier combat (un raptor seul)
   était perdu 1 fois sur 3 même en jouant parfaitement. Une équipe de 3 reste toujours plus forte (pas d'abus possible). */
let SMALL_TEAM=[null,{h:.45,a:.55},{h:.75,a:.8}];
function startBattle(o){ens();if(o&&o.mode)lastB=o;o=lastB||(lastB={mode:"story",n:Math.min(100,S.stage+1)});
 const n=o.n,dg=o.mode==="dungeon"?DUN[o.d]:null,z=zoneOf(n),bossLv=dg?true:n%10===0,lab=dg?dg.n+" · "+TIERS[o.tier-1][0]:"Niv. "+n+" · "+z[0],
 mk=i=>{const last=i===2,boss=last&&bossLv,ad=!dg&&SMALL_TEAM[t.length]||{h:1,a:1},hp=Math.round(H(n)*[1,1.25,boss?2.4:1.5][i]*ad.h),el=dg?dg.el:(i===1?EL[rnd(3)]:z[2]);
  return{hp,max:hp,e:last?(boss?"👹":"🦖"):(dg?dg.en[i]:z[1][i]),name:last&&boss?"Gardien · "+lab:(dg?dg.n:z[0])+" · "+(last?"Élite":"Ennemi"),el,atk:Math.round(A(n)*[1,1.1,boss?1.5:1.2][i]*ad.a),boss}},
 t=S.team.slice(0,3);
 fight={wave:0,enemies:[mk(0),mk(1),mk(2)],hp:t.map(d=>stats(d).hp),sp:0,combo:0,last:null,log:"Choisis une orbe : la couleur de ton dino donne x1.8 !",orbs:newOrbs(),over:null,turn:0,stun:0,zone:lab,o,n,snap:snap()};
 go("battle");renderBattle()}
function missHTML(before){const now=snap(),rows=[];allM().forEach(([m,d])=>{const a=Math.min(now[m.id],m.g);if(now[m.id]>before[m.id]&&!(d?S.dclaimed:S.claimed)[m.id])rows.push(`<div class="tiny" style="margin:6px 0">${d?"📅":"🏆"} ${esc(m.n)} — <b class="${a>=m.g?"ok":""}">${a}/${m.g}${a>=m.g?" ✅ à récupérer":""}</b><div class="progress mbar"><i style="width:${a/m.g*100}%"></i></div></div>`)});
 return `<div class="panel"><b>📋 Suivi des missions</b>${rows.length?rows.slice(0,10).join(""):'<div class="tiny muted">Aucune progression sur ce combat.</div>'}<button class="wide secondary" onclick="go('missions')">VOIR LES MISSIONS</button></div>`}
function win(){const f=fight;f.over="win";ens();const t=S.team.slice(0,3),n=f.n,R={};
 if(f.o.mode==="story"){const boss=n%10===0,first=n>S.stage;R.stone=CONFIG.battleStone+2*n;R.essence=boss?CONFIG.battleEssence*2:(n%5===0?CONFIG.battleEssence:0);R.bone=1+rnd(3);R.hide=rnd(3);if(boss){R.crystal=1+rnd(2);R.amber=1+rnd(2)}
  if(first){S.stage=n;R.tickets=boss?3:1;if(n%5===0)R.crystal=(R.crystal||0)+2;if(n===100)R.tickets+=10}f.first=first;bump("stories");if(boss)bump("bosses")}
 else{const dg=DUN[f.o.d],k=f.o.tier;R.stone=30*k+n;R.essence=k;if(dg.mat){R[dg.mat]=3+2*k+rnd(2*k+1);const o=Object.keys(MATS).filter(x=>x!==dg.mat);R[o[rnd(3)]]=rnd(k+1)}else{R.tickets=k;R.essence=2*k}bump("dungeons");bump("bosses")}
 give(R);S.stone+=0;addXP(CONFIG.battleXP+n);bump("wins");bump("battles");
 t.forEach(d=>{d.xp+=20+3*n;while(d.xp>=need(d.level)){d.xp-=need(d.level);d.level++;log(sp(d).name+" passe niveau "+d.level+".")}});
 f.report=`<div class="panel"><b>🎁 Récompenses</b><div style="margin-top:6px;font-size:15px">${fmt(R)}</div>${f.first?'<div class="tiny ok">Première victoire !</div>':""}</div>`+missHTML(f.snap)+(f.o.mode==="story"&&n<100?`<button class="wide blue" onclick="startBattle({mode:'story',n:${n+1}})">NIVEAU SUIVANT (${n+1})</button>`:"");
 log("Victoire · "+f.zone+" : "+fmt(R));save();render()}
const _special=special;special=function(){const ok=fight&&!fight.over&&fight.sp>=100;_special();if(ok){bump("supers");save()}};
const _rb4=renderBattle;renderBattle=function(){_rb4();if(!fight||!fight.over)return;
 if(fight.over==="lose"&&!fight.report){ens();bump("battles");fight.report='<div class="panel tiny muted">Défaite : aucune récompense. Entraîne, éveille ou renforce ton équipe.</div>'+missHTML(fight.snap);save()}
 if(fight.report)$$("battleArea").insertAdjacentHTML("beforeend",fight.report)};
// entraînement suivi
const _train=train;train=function(id){const s=S.stone;_train(id);if(S.stone<s){bump("trains");save()}};
// éveil
const awCost=k=>({bone:10*(k+1),hide:6*(k+1),amber:k>=2?3*(k-1):0});
const _card2=card;card=function(d,a=true){const h=_card2(d,a);if(!a)return h;const k=d.star||0;return h.replace(/<\/div>$/,k>=5?`<div class="tiny muted" style="margin-top:8px">${"★".repeat(5)} éveil maximum</div></div>`:`<button class="wide purple" onclick="awaken(${d.id})">ÉVEIL ${"★".repeat(k)||"☆"} → +10 % stats · ${fmt(awCost(k))}</button></div>`)};
function awaken(id){ens();const d=S.team.find(x=>x.id===id);if(!d)return;const k=d.star||0,c=awCost(k);if(k>=5)return;if(Object.entries(c).some(([m,v])=>S.mat[m]<v)){alert("Matériaux insuffisants : "+fmt(c));return}
 Object.entries(c).forEach(([m,v])=>S.mat[m]-=v);d.star=k+1;bump("awaken");log(sp(d).name+" : éveil "+d.star+"★.");save();render()}
// gacha
function pickType(rar){let pool=Object.keys(SPEC).filter(k=>SPEC[k].r===rar);if(!pool.length)pool=Object.keys(SPEC);return pool[Math.floor(Math.random()*pool.length)]}
const RATE_STD=()=>[CONFIG.commonRate,CONFIG.rareRate,CONFIG.epicRate,CONFIG.legendRate];
function pull(rt,minEpic){let r=Math.random()*(rt.reduce((a,b)=>a+b,0)||100),i=0,acc=0;for(;i<3;i++){acc+=rt[i];if(r<acc)break}
 if(S.pity>=39)i=3;else if(minEpic&&i<2)i=2;S.pity=i===3?0:S.pity+1;return pickType(RARS[i])}
function doGacha(n,rt,key,cost,guar){ens();const bal=MATS[key]?S.mat[key]:S[key];if(bal<cost){alert("Pas assez de "+LBL[key]+" (il en faut "+cost+").");return}
 give({[key]:-cost});const got=[];for(let i=0;i<n;i++){const top=got.some(d=>["Épique","Légendaire"].includes(sp(d).r)),d={id:S.nextId++,type:pull(rt,guar&&i===n-1&&!top),level:1,xp:0};S.team.push(d);got.push(d)}
 bump("summons",n);log("Invocation : "+n+" dinosaure(s).");save();
 $$("summonResult").innerHTML=`<div class="result"><div class="rarity">RÉSULTAT DE L'INVOCATION</div><div class="teamlead" style="justify-content:center;flex-wrap:wrap">${got.map(d=>`<div class="dino"><div class="art">${art(sp(d).e)}</div><strong>${esc(sp(d).name)}</strong><div class="rarity ${rarityClass(sp(d).r)}">${esc(sp(d).r)}</div></div>`).join("")}</div></div>`;render()}
function summon(n){doGacha(n,RATE_STD(),"tickets",n===1?CONFIG.summonCost1:CONFIG.summonCost5)}
$$("summonResult").insertAdjacentHTML("beforebegin",`<div class="sectionhead"><h2>Autres bannières</h2><span class="muted tiny" id="pityTxt"></span></div><div class="panel">
<div class="row"><div class="grow"><b>Invocation de pierres</b><div class="muted tiny">Taux standard · 40 🪨</div></div><button class="blue" onclick="doGacha(1,RATE_STD(),'stone',40)">x1</button><button class="blue" onclick="doGacha(10,RATE_STD(),'stone',380)">x10</button></div>
<div class="row" style="margin-top:12px"><div class="grow"><b>Multi garanti</b><div class="muted tiny">9 🎟️ · 10 tirages · 1 Épique+ garanti</div></div><button class="purple" onclick="doGacha(10,RATE_STD(),'tickets',9,true)">x10</button></div>
<div class="row" style="margin-top:12px"><div class="grow"><b>Bannière cristal</b><div class="muted tiny">Rare 40 % · Épique 35 % · Légendaire 12 % · 5 💎</div></div><button class="red" onclick="doGacha(1,[13,40,35,12],'crystal',5)">x1</button><button class="red" onclick="doGacha(10,[13,40,35,12],'crystal',45,true)">x10</button></div></div>`);
// écrans
$$("story").querySelector(".banner h1").textContent="Les 100 niveaux de l'île";
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="dungeon" class="screen"></section><section id="missions" class="screen"></section>');
document.querySelector(".bottomnav").insertAdjacentHTML("beforeend",'<button data-screen="dungeon"><span>🕳️</span>Donjons</button><button data-screen="missions"><span>📋</span>Missions</button>');
document.querySelector(".meters").insertAdjacentHTML("beforeend",Object.keys(MATS).map(k=>`<div class="meter">${MATS[k][0]} <b id="m_${k}">0</b></div>`).join(""));
function renderStory(){ens();const cur=Math.min(100,S.stage+1),rec=n=>Math.ceil(n/2)+1;let rows="";
 for(let n=1;n<=100;n++){const boss=n%10===0;rows+=`<div class="lvl ${boss?"boss":""} ${n===cur?"cur":""} ${n>cur?"lock":""}"><b style="width:28px">${n}</b><div class="grow">${boss?"👹 Boss · ":""}${zoneOf(n)[0]}<div class="muted tiny">Niveau d'équipe conseillé ~${rec(n)}</div></div>${n<=cur?`<button onclick="startBattle({mode:'story',n:${n}})">${n<cur?"REJOUER":"JOUER"}</button>`:"🔒"}</div>`}
 $$("chapters").innerHTML=`<div class="panel"><b>Progression : ${S.stage}/100</b><div class="progress"><i style="width:${S.stage}%"></i></div><div class="muted tiny">Chaque boss tous les 10 niveaux. Première victoire = tickets et cristaux.</div>${S.stage>=100?'<div class="ok">Histoire terminée ! 🎉</div>':`<button class="wide" onclick="startBattle({mode:'story',n:${cur}})">JOUER LE NIVEAU ${cur}</button>`}</div><div class="panel scrollbox">${rows}</div>`}
function renderDungeons(){$$("dungeon").innerHTML=`<div class="banner"><div class="eyebrow">DONJONS</div><h1>Matériaux & récompenses</h1><p>5 difficultés par donjon, débloquées en avançant dans l'histoire.</p><div class="heroDino">🕳️</div></div>`+DUN.map((d,i)=>`<div class="panel"><div class="row"><div class="bigicon">${d.e}</div><div class="grow"><b>${d.n}</b><div class="muted tiny">${d.mat?"Matériau : "+MATS[d.mat][0]+" "+MATS[d.mat][1]:"Récompense : 🎟️ tickets + 🔮 essences"}</div></div></div>${TIERS.map((t,j)=>S.stage>=t[2]?`<button class="wide ${j>2?"red":"secondary"}" onclick="startBattle({mode:'dungeon',d:${i},tier:${j+1},n:${t[1]}})">${t[0].toUpperCase()} · équipe conseillée ~${Math.ceil(t[1]/2)+1}</button>`:`<button class="wide secondary" disabled>🔒 ${t[0]} · histoire niv. ${t[2]}</button>`).join("")}</div>`).join("")}
function renderMissions(){const row=(m,d)=>{const p=Math.min(prog(m,d),m.g),c=(d?S.dclaimed:S.claimed)[m.id];return `<div class="panel" style="margin:6px 0;padding:10px"><div class="row"><div class="grow"><b class="tiny">${esc(m.n)}</b><div class="muted tiny">${fmt(m.r)} · ${p}/${m.g}</div><div class="progress mbar"><i style="width:${p/m.g*100}%"></i></div></div>${c?'<span class="tag">✅</span>':`<button style="padding:8px" ${p>=m.g?"":"disabled"} onclick="claim('${m.id}',${d})">RÉCUPÉRER</button>`}</div></div>`};
 $$("missions").innerHTML=`<div class="banner"><div class="eyebrow">MISSIONS</div><h1>Quotidiennes & objectifs</h1><p>Les quotidiennes se renouvellent chaque jour.</p><div class="heroDino">📋</div></div><button class="wide blue" onclick="claimAll()">TOUT RÉCUPÉRER</button><div class="sectionhead"><h2>Quotidiennes</h2></div>${DAILY.map(m=>row(m,1)).join("")}<div class="sectionhead"><h2>Objectifs</h2></div>${PERM.map(m=>row(m,0)).join("")}`}
function claim(id,d){ens();const m=(d?DAILY:PERM).find(x=>x.id===id),c=d?S.dclaimed:S.claimed;if(!m||c[id]||prog(m,d)<m.g)return;c[id]=1;give(m.r);log("Mission : "+m.n+" → "+fmt(m.r));save();render()}
function claimAll(){allM().forEach(([m,d])=>claim(m.id,d?1:0))}
const _r4=render;render=function(){ens();_r4();renderDungeons();renderMissions();Object.keys(MATS).forEach(k=>$$("m_"+k).textContent=S.mat[k]);
 const done=DAILY.filter(m=>prog(m,1)>=m.g).length;$$("dailyText").textContent="Missions du jour : "+done+"/"+DAILY.length+" terminées";$$("dailyBar").style.width=done/DAILY.length*100+"%";
 const p=$$("pityTxt");if(p)p.textContent="Garantie légendaire : "+S.pity+"/40"};
// correctif admin local : la validation bloque réellement
function saveAdmin(){const ids=["rateCommon","rateRare","rateEpic","rateLegend"],rt=ids.map(i=>Number($$(i).value));
 if(rt.some(n=>!Number.isFinite(n)||n<0)||Math.round(rt.reduce((a,b)=>a+b,0))!==100)return alert("Les taux de rareté doivent totaliser exactement 100 %.");
 const eco={};for(const k of Object.keys(econLabels)){const v=Number($$("econ_"+k).value);if(!Number.isFinite(v)||v<0)return alert("Les coûts et récompenses doivent être positifs ou nuls.");eco[k]=v}
 const dn={};for(const el of document.querySelectorAll(".adminitem")){const d={...SPEC[el.dataset.dino]};el.querySelectorAll("[data-field]").forEach(i=>{const f=i.dataset.field;d[f]=["hp","atk","def"].includes(f)?Number(i.value):i.value});
  if(!d.name.trim()||!d.e.trim()||!(d.hp>=1)||!(d.atk>=1)||!(d.def>=0))return alert("Vérifie les noms, images et statistiques des dinosaures.");dn[el.dataset.dino]=d}
 Object.assign(CONFIG,eco,{commonRate:rt[0],rareRate:rt[1],epicRate:rt[2],legendRate:rt[3]});SPEC={...SPEC,...dn};
 localStorage.setItem("arkPrimalConfig",JSON.stringify({dinos:SPEC,economy:CONFIG}));save();render();buildAdmin();alert("Paramètres enregistrés sur cet appareil.")}
render();
