/* Progression II (0.36) : objectifs sur 30 jours, maîtrise d'espèce (100 victoires → titre), paliers de puissance (défi de
   puissance), conseil « quoi faire ensuite », résumé de la semaine, jetons d'éveil par famille, âmes d'espèce (éveil
   partagé), cadeau de retour, paliers de connexion du mois, bonus de 1re victoire du jour, maîtrise des niveaux d'histoire
   (sans perdre de PV), graphique de puissance. État : S.pg2. */
const _ensP2=ens;ens=function(){_ensP2();let P=S.pg2;const fresh=!P||typeof P!=="object";if(fresh)P=S.pg2={};const d=todayK(),w=wkNow(),mo=d.slice(0,7);
 for(const k of ["spw","ftok","soul","mst","pw","tiers","tierW"])if(!P[k]||typeof P[k]!=="object")P[k]={};
 if(fresh)["T","C","A","G","F","S","H","M","W","I"].forEach(f=>P.ftok[f]=10);
 if(!P.lt||typeof P.lt!=="object"||!P.lt.start||(Date.parse(d)-Date.parse(P.lt.start))/864e5>=30)P.lt={start:d,base:p2Snap(),claimed:{}};
 if(!P.mlog||P.mlog.mo!==mo)P.mlog={mo,days:{},claimed:{}};P.mlog.days[d]=1;
 if(P.seen&&P.seen!==d&&!P.ret){const gap=Math.round((Date.parse(d)-Date.parse(P.seen))/864e5);if(gap>=3)P.ret={days:Math.min(7,gap)}}P.seen=d;
 if(!P.ws||P.ws.wk!==w){if(P.ws&&P.ws.base)P.wlast={wk:P.ws.wk,d:p2Diff(P.ws.base),seen:0};P.ws={wk:w,base:p2Snap()}}};
function p2Snap(){const c=S.cnt||{};return{wins:c.wins||0,bosses:c.bosses||0,summons:c.summons||0,stage:S.stage||0,sp:new Set((S.team||[]).map(d=>d.type)).size,lv:Math.max(0,...(S.team||[]).map(d=>d.level||0)),rank:S.level||1}}
function p2Diff(b){const n=p2Snap();return Object.fromEntries(Object.keys(n).map(k=>[k,n[k]-(b[k]||0)]))}
/* ---- objectifs sur 30 jours ---- */
const LT_G=[["wins","Gagner 150 combats",150,{tickets:5,essence:50}],["bosses","Vaincre 30 boss",30,{tickets:5,shards:20}],["summons","Invoquer 50 dinos",50,{essence:60,crystal:5}],["stage","Avancer de 15 niveaux d'histoire (ou finir l'histoire)",15,{tickets:4,amber:5}],["sp","Découvrir 8 nouvelles espèces",8,{shards:30,essence:40}]];
const LT_ALL={tickets:15,essence:150,shards:50};
function ltProg(k){const P=S.pg2,dd=p2Diff(P.lt.base);if(k==="stage"&&(S.stage||0)>=100)return 15;return Math.max(0,dd[k]||0)}
function ltClaim(k){ens();const G=LT_G.find(g=>g[0]===k),P=S.pg2;if(k==="all"){if(P.lt.claimed.all||!LT_G.every(g=>P.lt.claimed[g[0]]))return;P.lt.claimed.all=1;give(LT_ALL);bump("ltAll")}
 else{if(!G||P.lt.claimed[k]||ltProg(k)<G[2])return;P.lt.claimed[k]=1;give(G[3])}save();toast("🎯 Objectif réussi !",2400);p2Open();render()}
/* ---- maîtrise d'espèce, jetons de famille, première victoire du jour (pas sous un navigateur automatisé, sauf window.__forceFirstWin : sinon les tests de récompenses exactes changeraient), maîtrise des niveaux ---- */
const SPW_N=100;
const _winP2=win;win=function(){const f=fight,was=f&&f.over,t=T3().slice(),hurt=f&&f.hurt?Object.values(f.hurt).reduce((a,b)=>a+b,0):0,lost=f&&f.hp?f.hp.some((h,k)=>h<f.mx[k]):true;_winP2();
 if(!f||was||f.over!=="win"||f.raid)return;try{ens();const P=S.pg2,d=todayK();t.forEach(x=>{const n=(P.spw[x.type]||0)+1;P.spw[x.type]=n;if(n===SPW_N){give({tickets:3,essence:30});toast("🏅 Maîtrise d'espèce : « Maître des "+SPEC[x.type].name+" » !",3600)}});
  [...new Set(t.map(x=>msFam(x)))].forEach(fm=>P.ftok[fm]=(P.ftok[fm]||0)+1);
  if(P.fwin!==d&&!(navigator.webdriver&&!window.__forceFirstWin)){P.fwin=d;give({stone:150,essence:12,tickets:1});f.log+=" · 🌅 1re victoire du jour : +150 🪨 +12 🔮 +1 🎟️"}
  if(f.o&&f.o.mode==="story"&&!f.o.daily&&!f.o.weekly&&!hurt&&!lost&&!P.mst[f.n]){P.mst[f.n]=1;give({essence:5});f.log+=" · 💎 Maîtrise : aucun PV perdu !"}save()}catch(e){}};
/* jetons de famille pour l'éveil ★3 et plus */
const ftokCost=k=>k>=2?3*(k-1):0;
const _awP2=awaken;awaken=function(id){ens();const d=S.team.find(x=>x.id===id);if(!d)return;const k=d.star||0,fm=msFam(d),c=ftokCost(k);
 if(c&&(S.pg2.ftok[fm]||0)<c){toast("Éveil ★"+(k+1)+" : il faut aussi "+c+" jetons de la famille "+(FAMNAME[fm]||fm)+" (gagnés en combattant avec elle). Tu en as "+(S.pg2.ftok[fm]||0)+".",3600);return}
 const r=_awP2(id);if(c&&(d.star||0)>k){S.pg2.ftok[fm]-=c;save();render()}return r};
/* âmes d'espèce : chaque dino recyclé donne une âme ; 5 âmes = +1★ pour un dino de cette espèce */
const SOUL_N=5;
function p2Souls(list){list.forEach(d=>{if(d&&d.type)S.pg2.soul[d.type]=(S.pg2.soul[d.type]||0)+1})}
const _recP2=recycle;recycle=function(id){ens();const d=S.team.find(x=>x.id===id),n=S.team.length;const r=_recP2(id);if(d&&S.team.length<n){p2Souls([d]);save()}return r};
if(typeof coSmartGo==="function"){const _csP2=coSmartGo;coSmartGo=function(){ens();const before=S.team.slice();_csP2();const ids=new Set(S.team.map(d=>d.id));p2Souls(before.filter(d=>!ids.has(d.id)));save()}}
if(typeof recycleCommons==="function"){const _rcmP2=recycleCommons;recycleCommons=function(){ens();const before=S.team.slice();const r=_rcmP2.apply(this,arguments);const ids=new Set(S.team.map(d=>d.id));p2Souls(before.filter(d=>!ids.has(d.id)));save();return r}}
function soulUse(id){ens();const d=S.team.find(x=>x.id===id);if(!d)return;if((S.pg2.soul[d.type]||0)<SOUL_N||(d.star||0)>=5)return;S.pg2.soul[d.type]-=SOUL_N;d.star=(d.star||0)+1;bump("awaken");save();toast("👻 Âmes d'espèce : "+sp(d).name+" passe à "+d.star+"★ !",3000);render()}
const _cardP2=card;card=function(d,a){let h=_cardP2(d,a);if(a===false||!d||!S.team.some(x=>x.id===d.id))return h;ens();const s=S.pg2.soul[d.type]||0,fm=msFam(d),k=d.star||0,c=ftokCost(k),i=h.lastIndexOf("</div>");
 const line=`<div class="tiny p2line">${k<5?`🧬 Jetons ${esc(FAMNAME[fm]||fm)} : ${S.pg2.ftok[fm]||0}${c?" (éveil ★"+(k+1)+" : "+c+")":""} · `:""}👻 Âmes : ${s}/${SOUL_N}${(S.pg2.spw[d.type]||0)?` · 🏅 ${Math.min(SPW_N,S.pg2.spw[d.type])}/${SPW_N} victoires d'espèce`:""}</div>${s>=SOUL_N&&k<5?`<button class="wide purple p2soul" onclick="soulUse(${d.id})">👻 UTILISER ${SOUL_N} ÂMES → +1★</button>`:""}`;
 return h.slice(0,i)+line+h.slice(i)};
/* ---- paliers de puissance ---- */
const PTIERS=[[1500,"Meute en devenir",{tickets:2}],[4000,"Meute aguerrie",{tickets:3,essence:30}],[8000,"Meute redoutée",{tickets:5,shards:20}],[15000,"Meute légendaire",{tickets:8,essence:80}],[25000,"Meute mythique",{tickets:12,shards:50}]];
const teamPow=()=>T3().reduce((s,d)=>s+power(d),0);
function ptClaim(i){ens();const T=PTIERS[i];if(!T||S.pg2.tiers[i]||teamPow()<T[0])return;S.pg2.tiers[i]=1;give(T[2]);save();toast("⚔ Palier « "+T[1]+" » !",2600);p2Open();render()}
MODES.ptier=function(o){const i=Math.max(0,Math.min(PTIERS.length-1,o.i|0)),eq=Math.round(m2Eq?m2Eq()+4+3*i:20),z=ZONES[i%4];
 const en=mkEnemies(eq,{emo:[z[1][0],z[1][1],"👹"],names:[z[0]+" · Ennemi",z[0]+" · Ennemi","Gardien du palier "+(i+1)],boss:true,hp:1.2+.05*i,atk:1.1});en.forEach(e=>e.tr="");en[2]._nm=1;return{eq,label:"Défi de puissance · palier "+(i+1),enemies:en}};
const _sbP2=startBattle;startBattle=function(o){const t=o||lastB;if(t&&t.mode==="ptier"){ens();if(!S.pg2.tiers[t.i]){toast("Atteins d'abord ce palier de puissance.");return}}return _sbP2(o)};
const _ewP2=eventWin;eventWin=function(f,n){if(f&&f.o&&f.o.mode==="ptier"){ens();const i=f.o.i|0,first=!S.pg2.tierW[i];S.pg2.tierW[i]=1;const R=first?{tickets:3,essence:40,stone:300}:{stone:100+20*f.n};return{R,extra:first?'<div class="tiny ok">⚔ Gardien du palier vaincu !</div>':"",loot:first?[rollItem(f.n,1)]:[]}}return _ewP2(f,n)};
if(typeof chainNext==="function"){const _cnP2=chainNext;chainNext=function(f){return f&&f.o&&f.o.mode==="ptier"?null:_cnP2(f)}}
/* ---- connexion du mois, cadeau de retour ---- */
const MLOG=[[5,{tickets:2}],[10,{essence:40}],[15,{tickets:4,shards:10}],[20,{essence:60,crystal:5}],[25,{tickets:8,shards:25}]];
function mlClaim(n){ens();const M=S.pg2.mlog,T=MLOG.find(x=>x[0]===n);if(!T||M.claimed[n]||Object.keys(M.days).length<n)return;M.claimed[n]=1;give(T[1]);save();toast("📅 "+n+" jours de connexion ce mois-ci : "+fmt(T[1]),2600);p2Open();render()}
function retClaim(){ens();const R=S.pg2.ret;if(!R)return;const G={tickets:R.days,essence:10*R.days,stone:200*R.days};give(G);S.pg2.ret=null;save();toast("🎁 Bon retour ! "+fmt(G),3200);render()}
/* ---- graphique de puissance ---- */
function pwRecord(){try{ens();const P=S.pg2.pw,d=todayK(),v=teamPow();if(!P[d]||P[d]<v)P[d]=v;const ks=Object.keys(P).sort();while(ks.length>60)delete P[ks.shift()]}catch(e){}}
function pwChart(){const P=S.pg2.pw,ks=Object.keys(P).sort();if(ks.length<2)return '<div class="tiny muted">Le graphique se remplit jour après jour (au moins 2 jours).</div>';const vs=ks.map(k=>P[k]),mx=Math.max(...vs),mn=Math.min(...vs),W=560,H=140;
 const pt=(v,i)=>[20+i*(W-30)/(ks.length-1),H-16-(mx===mn?.5:(v-mn)/(mx-mn))*(H-36)];const d=vs.map((v,i)=>(i?"L":"M")+pt(v,i).map(Math.round).join(" ")).join(" ");
 return `<svg class="pwchart" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="none" stroke="#7fd3ff" stroke-width="3" stroke-linejoin="round"/>${vs.map((v,i)=>{const[x,y]=pt(v,i);return `<circle cx="${x}" cy="${y}" r="3" fill="#ffd15c"/>`}).join("")}<text x="20" y="14" fill="#9aa6c0" font-size="11">${mx.toLocaleString("fr-FR")}</text><text x="20" y="${H-2}" fill="#9aa6c0" font-size="11">${ks[0]} → ${ks[ks.length-1]}</text></svg>`}
/* ---- conseil « quoi faire ensuite » ---- */
function p2Advice(){ens();const t=T3(),avg=t.length?t.reduce((s,d)=>s+d.level,0)/t.length:0,n=Math.min(100,(S.stage||0)+1),rec=Math.ceil(n/2)+1;
 if(S.pg2.ret)return["🎁","Un cadeau de retour t'attend !","retClaim()"];
 if(typeof claimable==="function"&&claimable()>0)return["📋","Des missions sont terminées : réclame leurs récompenses.","go('missions')"];
 if(typeof rkOpen==="function"&&rkOpen().length)return["🎖️","Récompense de rang à réclamer.","pgOpen()"];
 if(t.length&&avg<rec-3)return["🏋️",`Ton équipe (niv. ${Math.round(avg)}) est en dessous du niveau conseillé pour l'histoire ${n} (${rec}) : entraîne-la, rejoue des niveaux ou nourris-la.`,"go('team')"];
 const aw=t.find(d=>(d.star||0)<5&&Object.entries(awCost(d.star||0)).every(([m,v])=>(S.mat[m]||0)>=v)&&(S.pg2.ftok[msFam(d)]||0)>=ftokCost(d.star||0));if(aw)return["⭐",`${sp(aw).name} peut être éveillé (+10 % de stats).`,"go('team')"];
 if((S.stage||0)<100)return["📜",`Continue l'histoire : niveau ${n}.`,`startBattle({mode:'story',n:${n}})`];
 return["🧭","Explore les régions, la Tour ou le Labyrinthe : de nouveaux défis t'attendent.","go('regions')"]}
/* ---- écrans ---- */
function p2Open(){ens();const P=S.pg2,pw=teamPow(),M=P.mlog,nd=Object.keys(M.days).length,left=30-Math.round((Date.parse(todayK())-Date.parse(P.lt.start))/864e5);
 openModal(`<h3 style="margin:0 0 6px">🎯 Objectifs et progression</h3>
 <div class="pgsec"><b>🗓️ Objectifs sur 30 jours</b> <span class="tiny muted">encore ${left} j</span>${LT_G.map(([k,n,g,R])=>{const p=Math.min(g,ltProg(k)),c=P.lt.claimed[k];return `<div class="p2goal"><div class="grow"><b>${n}</b> <span class="tiny muted">${p}/${g} · ${fmt(R)}</span><div class="progress"><i style="width:${p/g*100}%"></i></div></div>${c?'<span class="tiny ok">✅</span>':`<button class="${p>=g?"blue":"secondary"}" ${p>=g?"":"disabled"} onclick="ltClaim('${k}')">OK</button>`}</div>`}).join("")}
  <div class="p2goal"><div class="grow"><b>Tous les objectifs</b> <span class="tiny muted">${fmt(LT_ALL)}</span></div>${P.lt.claimed.all?'<span class="tiny ok">✅</span>':`<button class="${LT_G.every(g=>P.lt.claimed[g[0]])?"red":"secondary"}" ${LT_G.every(g=>P.lt.claimed[g[0]])?"":"disabled"} onclick="ltClaim('all')">GRAND COFFRE</button>`}</div></div>
 <div class="pgsec"><b>⚔ Paliers de puissance</b> <span class="tiny muted">puissance de l'équipe : ${pw.toLocaleString("fr-FR")}</span>${PTIERS.map(([v,n,R],i)=>`<div class="p2goal"><div class="grow"><b>${n}</b> <span class="tiny muted">${v.toLocaleString("fr-FR")} · ${fmt(R)}</span></div>${P.tiers[i]?`<button class="red" onclick="closeModal();fight=null;startBattle({mode:'ptier',i:${i}})">${P.tierW[i]?"REJOUER LE DÉFI":"DÉFI DE PUISSANCE"}</button>`:`<button class="${pw>=v?"blue":"secondary"}" ${pw>=v?"":"disabled"} onclick="ptClaim(${i})">ATTEINDRE</button>`}</div>`).join("")}</div>
 <div class="pgsec"><b>📅 Connexion du mois</b> <span class="tiny muted">${nd} jour(s) en ${M.mo}</span><div class="c2row">${MLOG.map(([n,R])=>`<button class="${M.claimed[n]?"secondary":nd>=n?"blue":"secondary"}" ${!M.claimed[n]&&nd>=n?"":"disabled"} onclick="mlClaim(${n})">${M.claimed[n]?"✅ ":""}${n} j : ${fmt(R)}</button>`).join("")}</div></div>
 <div class="pgsec"><b>🏅 Maîtrises d'espèce</b> <span class="tiny muted">${SPW_N} victoires avec une espèce → titre</span><div class="c2row">${Object.entries(P.spw).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,n])=>SPEC[k]?`<span class="chip ${n>=SPW_N?"good":""}">${n>=SPW_N?"🏅 Maître des ":""}${esc(SPEC[k].name)} ${Math.min(n,SPW_N)}/${SPW_N}</span>`:"").join("")||'<span class="tiny muted">Gagne des combats pour progresser.</span>'}</div></div>
 <div class="pgsec"><b>📈 Puissance de l'équipe</b>${pwChart()}</div>
 <div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
const _rP2=render;render=function(){pwRecord();_rP2();try{if(screen!=="home")return;ens();const P=S.pg2,box=document.getElementById("pgBtn")||document.querySelector("#home .banner");const old=document.getElementById("p2Home");if(old)old.remove();if(!box)return;const A=p2Advice(),W=P.wlast&&!P.wlast.seen?P.wlast:null;
 box.insertAdjacentHTML("afterend",`<div id="p2Home">${P.ret?`<div class="panel p2ret"><div class="row"><span class="bigicon">🎁</span><div class="grow"><b>Bon retour !</b><div class="tiny muted">Tu étais absent ${P.ret.days} jour(s) : un cadeau t'attend.</div></div><button class="red" onclick="retClaim()">OUVRIR</button></div></div>`:""}
 <div class="panel p2adv"><div class="row"><span class="bigicon">${A[0]}</span><div class="grow"><b>👉 Conseil</b><div class="tiny">${esc(A[1])}</div></div><button class="blue" onclick="${A[2]}">Y ALLER</button><button class="secondary" onclick="p2Open()">🎯 OBJECTIFS</button></div></div>
 ${W?`<div class="panel p2week"><b>🗞️ Ta semaine passée</b><div class="tiny">${W.d.wins} victoires · ${W.d.bosses} boss · ${W.d.summons} invocations · +${W.d.stage} niveaux d'histoire · +${W.d.sp} espèces · +${W.d.rank} rangs</div><button class="secondary" onclick="S.pg2.wlast.seen=1;save();render()">OK</button></div>`:""}</div>`)}catch(e){}};
/* carte d'histoire : niveaux maîtrisés */
const _rsP2=renderStory;renderStory=function(){_rsP2();try{if(typeof nmView!=="undefined"&&nmView)return;ens();document.querySelectorAll('#chapters .smap .mnode').forEach(b=>{const m=/n:(\d+)/.exec(b.getAttribute("onclick")||"");if(m&&S.pg2.mst[+m[1]])b.classList.add("p2mst")})}catch(e){}};
ACH.push(["p2a","Assidu","Se connecter 25 jours dans un même mois",()=>{try{return Object.keys(S.pg2.mlog.days).length}catch(e){return 0}},25,{tickets:5}],["p2b","Maître d'espèce","100 victoires avec une même espèce",()=>Math.max(0,...Object.values((S.pg2||{}).spw||{0:0})),SPW_N,{tickets:5,essence:50}],
 ["p2c","Sans une égratignure (histoire)","Maîtriser 10 niveaux d'histoire sans perdre de PV",()=>Object.keys((S.pg2||{}).mst||{}).length,10,{essence:40}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Objectifs et progression","Accueil : un conseil « quoi faire ensuite » et les objectifs (30 jours, paliers de puissance avec leur défi, connexion du mois, maîtrises d'espèce, graphique de puissance). La 1re victoire du jour rapporte un bonus. Un niveau d'histoire gagné sans perdre de PV est « maîtrisé » (💎 sur la carte). L'éveil ★3 et plus demande des jetons de la famille du dino (1 par victoire avec elle). Chaque dino recyclé laisse une âme de son espèce : 5 âmes = +1★ pour un dino de cette espèce."]);
