/* Gacha étendu, incubateur, connexion quotidienne, notifications, journal */
/* ===== v0.6 : gacha étendu, connexion quotidienne, HUD ===== */
ICON.shards="🧩";LBL.shards="fragments";
const _ens6=ens;ens=function(){_ens6();S.shards=S.shards||0;S.eggs=S.eggs||[];S.hist=S.hist||[];S.fpity=S.fpity||0;S.login=S.login||{last:"",streak:0,ready:false};S.gstat=S.gstat||{total:0,r:[0,0,0,0]};S.freeDay=S.freeDay||""};
const todayStr=()=>new Date().toISOString().slice(0,10),yestStr=()=>new Date(Date.now()-864e5).toISOString().slice(0,10);
function rollW(w){let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){r-=w[i];if(r<0)return i}return w.length-1}
rollVariant=function(b){b=b||1;let r=Math.random()*100;for(const k of ["alpha","shadow","albino","golden","prism"]){r-=VAR[k].w*b;if(r<0)return k}return "normal"};
/* notifications non bloquantes */
document.body.insertAdjacentHTML("beforeend",'<div id="toasts"></div><div id="gachaVeil" class="authveil hide"><div class="authbox" id="gachaBody"></div></div>');
function toast(m,ms){ms=ms||2600;const box=$$("toasts");while(box.children.length>=3)box.firstChild.remove();const e=document.createElement("div");e.className="toast";e.textContent=m;box.appendChild(e);setTimeout(()=>e.classList.add("out"),ms);setTimeout(()=>e.remove(),ms+450)}
window.alert=m=>toast(String(m));
const _log6=log;log=function(s){_log6(s);if(/^(Niveau joueur|Mission|Forge|Recyclage|Connexion|Fusion)/.test(s))toast(s)};
/* vedette du jour */
function featured(){const d=Math.floor(Date.now()/864e5),by=r=>Object.keys(SPEC).filter(k=>SPEC[k].r===r).sort(),pk=(a,s)=>a.length?a[(d*7+s)%a.length]:null;return{leg:pk(by("Légendaire"),1),epic:pk(by("Épique"),3),rare:pk(by("Rare"),5)}}
const FEAT_RATES=[40,36,17,7];
function pullFeat(minEpic){const f=featured();let i=rollW(FEAT_RATES);if(S.fpity>=59||S.pity>=39)i=3;else if(minEpic&&i<2)i=2;let key;
 if(i===3){const forced=S.fpity>=59;key=f.leg&&(forced||Math.random()<.6)?f.leg:pickType("Légendaire");S.pity=0;S.fpity=key===f.leg?0:S.fpity+1}
 else{S.pity++;S.fpity++;key=i===2?(f.epic&&Math.random()<.5?f.epic:pickType("Épique")):i===1?(f.rare&&Math.random()<.4?f.rare:pickType("Rare")):pickType("Commun")}return key}
function pullEl(el,minEpic){const av=RAR5.map(r=>Object.keys(SPEC).some(k=>SPEC[k].r===r&&SPEC[k].element===el)),w=RATE_STD().slice(0,4).map((v,i)=>av[i]?v:0);let i=rollW(w.some(x=>x>0)?w:av.map(x=>x?1:0));
 if(S.pity>=39&&av[3])i=3;else if(minEpic&&i<2)i=av[2]?2:(av[3]?3:i);S.pity=i===3?0:S.pity+1;const pool=Object.keys(SPEC).filter(k=>SPEC[k].r===RAR5[i]&&SPEC[k].element===el);return pool.length?pool[rnd(pool.length)]:pickType(RAR5[i])}
function pullStd(minEpic){return pull(RATE_STD(),minEpic)}
/* moteur gacha unique */
function gachaRun(n,key,cost,fn,guar,vb){ens();const bal=MATS[key]?S.mat[key]:S[key];if(bal<cost){toast("Pas assez de "+LBL[key]+" (il en faut "+cost+").");return false}
 give({[key]:-cost});const got=[],news=new Set(),had=new Set(S.team.map(d=>d.type));
 for(let i=0;i<n;i++){const top=got.some(d=>["Épique","Légendaire"].includes(sp(d).r)),type=fn(!!guar&&i===n-1&&!top),d={id:S.nextId++,type,level:1,xp:0,v:rollVariant(vb||1)};if(!had.has(type)){news.add(d.id);had.add(type)}S.team.push(d);got.push(d)}
 finishGacha(got,news,true);return true}
doGacha=function(n,rt,key,cost,guar){gachaRun(n,key,cost,m=>pull(rt,m),guar)};
function finishGacha(got,news,counts){ens();const nvar=got.filter(d=>d.v&&d.v!=="normal").length;
 got.forEach(d=>{const ri=RAR5.indexOf(sp(d).r);S.gstat.r[ri]=(S.gstat.r[ri]||0)+1;S.hist.unshift({t:d.type,v:d.v,r:ri})});S.gstat.total+=got.length;S.hist=S.hist.slice(0,30);
 if(counts)bump("summons",got.length);if(nvar)bump("variants",nvar);log("Invocation : "+got.length+" dinosaure(s)"+(nvar?" dont "+nvar+" variante(s) !":"."));save();showGacha(got,news);render()}
function showGacha(got,news,title){const rc={Commun:"c",Rare:"r","Épique":"e","Légendaire":"l"},nv=got.filter(d=>d.v&&d.v!=="normal").length,best=got.reduce((m,d)=>Math.max(m,RAR5.indexOf(sp(d).r)),0);
 $$("gachaBody").innerHTML=`<div class="rarity" style="text-align:center">${title||"RÉSULTAT DE L'INVOCATION"}</div><div class="gres" style="grid-template-columns:repeat(${Math.min(5,got.length)},minmax(0,1fr))">${got.map((d,i)=>`<div class="gc gl-${rc[sp(d).r]}" style="animation-delay:${i*.12}s"><div class="art">${art(sp(d).e)}</div><strong>${esc(SPEC[d.type].name)}</strong>${d.v&&d.v!=="normal"?`<div class="vtag" style="color:${(VAR[d.v]||VAR.normal).col};border-color:${(VAR[d.v]||VAR.normal).col}">${(VAR[d.v]||VAR.normal).n.toUpperCase()}</div>`:""}<div class="rarity ${rarityClass(sp(d).r)}" style="font-size:8px">${esc(sp(d).r)}</div>${news.has(d.id)?'<div class="newtag">NOUVEAU !</div>':""}</div>`).join("")}</div><div class="tiny muted" style="text-align:center;margin-bottom:8px">${best===3?"✨ Légendaire ! ":""}${nv?nv+" variante(s) · ":""}${news.size?news.size+" nouvelle(s) espèce(s)":""}</div><button class="wide" onclick="closeGacha()">OK</button>`;$$("gachaVeil").classList.remove("hide")}
function closeGacha(){$$("gachaVeil").classList.add("hide")}
/* bannières */
const SHOP_COST={Commun:20,Rare:60,"Épique":180,"Légendaire":450};let gEl="redorb",shopR="Légendaire",histOpen=false;
function freePull(){ens();if(S.freeDay===todayStr()){toast("Tirage gratuit déjà pris aujourd'hui.");return}S.freeDay=todayStr();gachaRun(1,"tickets",0,pullStd,false)}
function featPull(n,key,cost){gachaRun(n,key,cost,pullFeat,n>=10)}
function elPull(n){gachaRun(n,"crystal",n>=10?27:3,m=>pullEl(gEl,m),n>=10)}
function varPull(n){gachaRun(n,"amber",n>=10?36:4,pullStd,n>=10,2.5)}
function setGEl(e){gEl=e;render()}function setShop(r){shopR=r;render()}function toggleHist(){histOpen=!histOpen;render()}
function shopBuy(k){ens();const c=SHOP_COST[SPEC[k].r];if(S.shards<c){toast("Pas assez de fragments (il en faut "+c+").");return}S.shards-=c;S.team.push({id:S.nextId++,type:k,level:1,xp:0,v:"normal"});log("Boutique : "+SPEC[k].name+" obtenu pour "+c+" fragments.");save();toast(SPEC[k].name+" obtenu !");render()}
const _rv6=recycleValue;recycleValue=function(d){const o=_rv6(d),m=(1+(d.level-1)*.1)*((d.v&&d.v!=="normal")?1.5:1);o.shards=Math.round(({Commun:1,Rare:4,"Épique":14,"Légendaire":40})[sp(d).r]*m);return o};
/* œufs */
const EGGS={common:{n:"Œuf commun",i:"🥚",need:3,rt:[70,25,5,0],vb:1},rare:{n:"Œuf rare",i:"🪺",need:6,rt:[20,55,22,3],vb:1.5},epic:{n:"Œuf épique",i:"🌟",need:10,rt:[0,35,50,15],vb:2}};
function addEgg(t){ens();if(S.eggs.length>=30)return false;S.eggs.push({t,left:EGGS[t].need,inc:S.eggs.filter(e=>e.inc).length<3});return true}
function hatch(i){ens();const e=S.eggs[i];if(!e||!e.inc||e.left>0)return;const E=EGGS[e.t],had=new Set(S.team.map(d=>d.type)),type=pickType(RAR5[rollW(E.rt)]),d={id:S.nextId++,type,level:1,xp:0,v:rollVariant(E.vb)},news=new Set();
 if(!had.has(type))news.add(d.id);S.team.push(d);S.eggs.splice(i,1);const w=S.eggs.find(x=>!x.inc);if(w)w.inc=true;bump("hatched");finishGacha([d],news,false)}
const _win6=win;win=function(){_win6();const f=fight;if(!f||f.over!=="win")return;ens();let ready=0;S.eggs.forEach(e=>{if(e.inc&&e.left>0){e.left--;if(e.left===0)ready++}});
 const dr=[];if(f.o.mode==="story"){if(f.n%50===0)dr.push("epic");else if(f.n%10===0)dr.push("rare");if(Math.random()<.12)dr.push("common")}else{const k=f.o.tier;if(Math.random()<.15+.05*k)dr.push("common");if(k>=3&&Math.random()<.25)dr.push("rare");if(k===5&&Math.random()<.1)dr.push("epic")}
 const got=dr.filter(addEgg);if(got.length||ready){f.report=`<div class="panel"><b>🥚 Incubateur</b>${got.map(t=>`<div class="tiny">${EGGS[t].i} ${EGGS[t].n} obtenu !</div>`).join("")}${ready?`<div class="tiny ok">🐣 ${ready} œuf(s) prêt(s) à éclore (onglet Invocation) !</div>`:""}</div>`+f.report;save();if(screen==="battle")renderBattle()}};
/* connexion quotidienne */
const LOGIN=[{stone:100},{tickets:1},{bone:5,hide:5},{stone:300},{shards:10,tickets:1},{crystal:2},{tickets:3,crystal:3,egg:"epic"}];
const loginTxt=d=>{const r={...LOGIN[d-1]},e=r.egg;delete r.egg;return fmt(r)+(e?" 🌟":"")};
function checkLogin(){ens();const L=S.login,t=todayStr();if(L.last===t)return;L.streak=L.last===yestStr()?L.streak+1:1;L.last=t;L.ready=true;save()}
function claimLogin(){ens();if(!S.login.ready)return;const day=((S.login.streak-1)%7)+1,r={...LOGIN[day-1]},egg=r.egg;delete r.egg;give(r);if(egg)addEgg(egg);S.login.ready=false;log("Connexion jour "+day+" : "+fmt(r)+(egg?" + œuf épique":""));save();render()}
/* mission supplémentaires */
[["hatched","œufs éclos",[3,10,30]],["gacha","tirages au total",[50,200,1000]]].forEach(([t,l,gs])=>gs.forEach((g,i)=>PERM.push({id:"p_"+t+g,t,g,n:g+" "+l,r:{tickets:i+1,crystal:i+1,stone:100*(i+1)}})));
const _prog6=prog;prog=function(m,d){return m.t==="gacha"?(S.gstat?S.gstat.total:0):_prog6(m,d)};
/* rendu des nouveaux panneaux */
const artOf=(t,v)=>{const s=SPEC[t];if(!s)return "❓";return art(v&&v!=="normal"?"\u0001"+v+"\u0002"+s.e:s.e)};
function tile(k,tag){const s=SPEC[k];if(!s)return "";return `<div class="dx"><div class="a">${artOf(k)}</div><b style="font-size:10px">${esc(s.name)}</b><div class="rarity ${rarityClass(s.r)}" style="font-size:8px">${esc(s.r)}</div><div class="newtag">${tag}</div></div>`}
function renderGacha(){const f=featured(),free=S.freeDay!==todayStr(),inc=S.eggs.filter(e=>e.inc),wait=S.eggs.length-inc.length,els=[["redorb","🔥"],["blueorb","💧"],["greenorb","🌿"],["purpleorb","⚡"],["goldorb","☀️"]];
 const pool=Object.keys(SPEC).filter(k=>SPEC[k].element===gEl).length,oc=new Set(S.team.map(d=>d.type));
 let h=`<div class="panel"><div class="row"><div class="grow"><b>🎁 Tirage gratuit du jour</b><div class="muted tiny">1 invocation offerte chaque jour</div></div><button ${free?"":"disabled"} onclick="freePull()">${free?"GRATUIT":"DÉJÀ PRIS"}</button></div></div>
 <div class="sectionhead"><h2>⭐ Bannière vedette</h2><span class="muted tiny">change chaque jour</span></div><div class="panel"><div class="dex3">${tile(f.leg,"VEDETTE LÉGENDAIRE")}${tile(f.epic,"VEDETTE ÉPIQUE")}${tile(f.rare,"VEDETTE RARE")}</div><div class="tiny muted" style="margin:8px 0">Taux : Commun 40 % · Rare 36 % · Épique 17 % · Légendaire 7 % (dont 60 % pour la vedette). Vedette légendaire garantie : ${S.fpity}/60 · Garantie légendaire générale : ${S.pity}/40</div>
 <div class="btns"><button class="purple" onclick="featPull(1,'tickets',2)">x1 · 2 🎟️</button><button class="purple" onclick="featPull(10,'tickets',18)">x10 · 18 🎟️ (Épique+ garanti)</button><button class="blue" style="grid-column:1/-1" onclick="featPull(10,'stone',800)">x10 · 800 🪨 (Épique+ garanti)</button></div></div>
 <div class="sectionhead"><h2>🌈 Bannière élémentaire</h2><span class="muted tiny">${pool} espèces</span></div><div class="panel"><div class="eltabs">${els.map(e=>`<button class="${gEl===e[0]?"on":""}" onclick="setGEl('${e[0]}')">${e[1]}</button>`).join("")}</div><div class="tiny muted">Uniquement des dinosaures de l'élément choisi, taux standard.</div><div class="btns"><button class="red" onclick="elPull(1)">x1 · 3 💎</button><button class="red" onclick="elPull(10)">x10 · 27 💎 (Épique+ garanti)</button></div></div>
 <div class="sectionhead"><h2>🧬 Bannière des variantes</h2><span class="muted tiny">variantes x2,5</span></div><div class="panel"><div class="tiny muted">Alpha 22,5 % · Ombre 12,5 % · Albinos 12,5 % · Doré 5 % · Prismatique 1,25 % (≈54 % de variantes).</div><div class="btns"><button class="red" onclick="varPull(1)">x1 · 4 🟠</button><button class="red" onclick="varPull(10)">x10 · 36 🟠 (Épique+ garanti)</button></div></div>
 <div class="sectionhead"><h2>🥚 Incubateur</h2><span class="muted tiny">${S.eggs.length} œuf(s)</span></div><div class="panel">${inc.length?S.eggs.map((e,i)=>e.inc?`<div class="row" style="margin:6px 0"><div class="bigicon" style="width:44px;height:44px;flex-basis:44px;font-size:26px">${EGGS[e.t].i}</div><div class="grow"><b>${EGGS[e.t].n}</b><div class="muted tiny">${e.left>0?e.left+" victoire(s) restante(s)":"Prêt à éclore !"} · ${EGGS[e.t].rt.map((v,k)=>RAR5[k][0]+v).join(" ")}</div><div class="progress"><i style="width:${(1-e.left/EGGS[e.t].need)*100}%"></i></div></div><button ${e.left>0?"disabled":""} onclick="hatch(${i})">ÉCLORE</button></div>`:"").join(""):'<div class="muted tiny">Aucun œuf. Les boss, les donjons et la connexion quotidienne en donnent.</div>'}${wait?`<div class="tiny muted">${wait} œuf(s) en attente d'une place (3 en incubation max).</div>`:""}<div class="tiny muted" style="margin-top:6px">Chaque victoire fait avancer tous les œufs en incubation.</div></div>`;
 $$("gachaX").innerHTML=h;
 const shop=Object.keys(SPEC).filter(k=>SPEC[k].r===shopR).sort((a,b)=>SPEC[a].name.localeCompare(SPEC[b].name));
 const hs=S.gstat,hist=S.hist.slice(0,12).map(x=>`<span class="chip" style="border-color:${["#aab6d1","#67e5ff","#bd8aff","#ffd15c"][x.r]}">${artOf(x.t,x.v)}</span>`).join("");
 $$("gachaY").innerHTML=`<div class="sectionhead"><h2>🧩 Boutique de fragments</h2><span class="muted tiny">${S.shards} 🧩</span></div><div class="panel"><div class="tiny muted">Les fragments viennent du recyclage et de la connexion quotidienne. Choisis l'espèce que tu veux.</div><div class="eltabs">${RAR5.map(r=>`<button class="${shopR===r?"on":""}" style="font-size:10px" onclick="setShop('${r}')">${r}</button>`).join("")}</div>${shop.map(k=>`<div class="row" style="margin:6px 0"><div class="bigicon" style="width:44px;height:44px;flex-basis:44px;font-size:26px">${artOf(k)}</div><div class="grow"><b>${esc(SPEC[k].name)}</b> <span class="chip">${ICO[SPEC[k].element]||""}</span><div class="muted tiny">${oc.has(k)?"Possédé":"Pas encore découvert"} · ${SK[SPEC[k].sk]?SK[SPEC[k].sk].i+" "+SK[SPEC[k].sk].n:""}</div></div><button style="padding:8px" ${S.shards>=SHOP_COST[shopR]?"":"disabled"} onclick="shopBuy('${esc(k)}')">${SHOP_COST[shopR]} 🧩</button></div>`).join("")}</div>
 <div class="sectionhead"><h2>📊 Historique</h2><button class="secondary" style="padding:6px 10px;font-size:11px" onclick="toggleHist()">${histOpen?"MASQUER":"VOIR"}</button></div>${histOpen?`<div class="panel"><div class="tiny">Total : <b>${hs.total}</b> tirages · Communs ${hs.r[0]||0} · Rares ${hs.r[1]||0} · Épiques ${hs.r[2]||0} · Légendaires ${hs.r[3]||0}${hs.total?" ("+((hs.r[3]||0)/hs.total*100).toFixed(1)+" % légendaires)":""}</div><div class="hrow" style="margin-top:8px">${hist||'<span class="muted tiny">Aucun tirage.</span>'}</div></div>`:""}`}
function renderLogin(){const L=S.login,day=((Math.max(1,L.streak)-1)%7)+1,f=featured();
 $$("loginBox").innerHTML=`<div class="row"><div class="grow"><b>📅 Connexion · série de ${L.streak} jour${L.streak>1?"s":""}</b><div class="muted tiny">Jour ${day}/7 : ${loginTxt(day)}</div></div><button ${L.ready?"":"disabled"} onclick="claimLogin()">${L.ready?"RÉCUPÉRER":"✅ PRIS"}</button></div><div class="fchips">${LOGIN.map((r,i)=>`<span class="chip ${i+1<day||(i+1===day&&!L.ready)?"good":""}">J${i+1} ${loginTxt(i+1)}</span>`).join("")}</div><div class="tiny muted">⭐ Vedette du jour : ${f.leg?esc(SPEC[f.leg].name):"—"} (légendaire) · tirage gratuit : ${S.freeDay===todayStr()?"pris":"disponible"} · œufs : ${S.eggs.length}</div>`}
function renderProfile(){const c=S.cnt||{},T=[["⚔️","Victoires",c.wins],["🎯","Combats",c.battles],["📜","Histoire",S.stage],["🕳️","Donjons",c.dungeons],["👹","Boss",c.bosses],["✨","Compétences",c.skills],["💥","Supers",c.supers],["🔮","Invocations",S.gstat.total],["🌈","Variantes",c.variants],["🥚","Œufs éclos",c.hatched],["★","Éveils",c.awaken],["🧬","Fusions",c.fusions]];
 $$("profileBox").innerHTML=`<b>👤 Profil du survivant</b><div class="dex3" style="margin-top:8px">${T.map(t=>`<div class="dx"><div style="font-size:18px">${t[0]}</div><b>${t[2]||0}</b>${t[1]}</div>`).join("")}</div>`}
$$("homeNext").insertAdjacentHTML("afterend",'<div class="panel" id="loginBox"></div>');
$$("home").insertAdjacentHTML("beforeend",'<div class="sectionhead"><h2>Profil</h2></div><div class="panel" id="profileBox"></div>');
$$("summon").querySelector(".banner").insertAdjacentHTML("afterend",'<div id="gachaX"></div>');
$$("summonResult").insertAdjacentHTML("afterend",'<div id="gachaY"></div>');
document.querySelector(".meters").insertAdjacentHTML("beforeend",'<div class="meter">🧩 <b id="m_shards">0</b></div>');
const _r6=render;render=function(){_r6();checkLogin();renderLogin();renderGacha();renderProfile();$$("m_shards").textContent=S.shards};
/* journal de combat */
const _rb6=renderBattle;renderBattle=function(){_rb6();const f=fight;if(!f||!f.mx)return;f.jr=f.jr||[];if(f.log&&f.jr[0]!==f.log)f.jr.unshift(f.log);f.jr=f.jr.slice(0,12);
 const box=$$("battleArea"),b=box.querySelector(".btns");if(b)b.insertAdjacentHTML("beforeend",`<button class="secondary" style="grid-column:1/-1" onclick="toggleJr()">📜 ${f.jrOpen?"MASQUER":"VOIR"} LE JOURNAL</button>`);
 if(f.jrOpen)box.insertAdjacentHTML("beforeend",`<div class="panel tiny">${f.jr.map(x=>"• "+esc(x)).join("<br>")}</div>`)};
function toggleJr(){if(fight){fight.jrOpen=!fight.jrOpen;renderBattle()}}
