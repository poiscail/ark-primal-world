/* Élevage II (0.37) : mutations de couleur visibles, gènes de défense et de super, arbre généalogique, 3e nid (succès),
   mutations plus fréquentes avec la Couveuse du camp, croisements spéciaux entre familles proches, soins des œufs
   (empreinte de départ), bébés plus petits qui grandissent, nom de lignée, classement des lignées, échange par code,
   « Ponte record » (3 premiers jours du mois : mutations ×2), quêtes d'élevage du Dr Elara, statistiques, œufs au camp. */
const _ensN2=ens;ens=function(){_ensN2();const N=S.nest;if(N){while(N.slots.length<3)N.slots.push(null);let X=N.x;if(!X||typeof X!=="object")X=N.x={};for(const k of ["cross","color","sent","got"])if(!(X[k]>=0))X[k]=0;if(!X.q||typeof X.q!=="object")X.q={};if(!X.codes||typeof X.codes!=="object")X.codes={}}};
const N2_CLOSE=[["C","A"],["A","G"],["S","H"],["T","F"],["M","F"],["W","C"],["I","G"]];
const n2Close=(a,b)=>a===b||N2_CLOSE.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
const n2Record=()=>new Date().getDate()<=3;
/* ---- 3e nid ---- */
const n2Third=()=>{try{return(S.nest.hatched||0)>=10}catch(e){return false}};
/* ---- croisements : la paire peut venir de familles proches ---- */
const _npN2=nestPair;nestPair=function(){const r=_npN2();if(r.ok||!r.A||!r.B)return r;const{A,B}=r;const ok=A.id!==B.id&&nestOk(A)&&nestOk(B)&&n2Close(nestFam(A.type),nestFam(B.type));return{A,B,ok}};
/* ---- bébé : gènes de défense et de super, couleur, croisement, mutations ×2 ---- */
const _nbN2=nestBaby;nestBaby=function(A,B){const b=_nbN2(A,B),ga=A.gn||{},gb=B.gn||{};
 for(const s of ["def","sp"]){const x=ga[s]||0,y=gb[s]||0;b.gn[s]=Math.random()<.7?Math.max(x,y):Math.min(x,y)}
 const camp=typeof campLv==="function"?campLv("nid"):0,mulP=(.05+.01*camp)*(n2Record()?2:1);
 if(Math.random()<mulP||(n2Record()&&!b.mut&&Math.random()<.2)){const s=["hp","atk","def","sp"].filter(k=>(b.gn[k]||0)<GENE_MAX);if(s.length){const k=s[rnd(s.length)];b.gn[k]=(b.gn[k]||0)+1;b.mut=true}}
 if(Math.random()<(b.mut?.35:.08))b.hue=20+rnd(320);
 const fa=nestFam(A.type),fb=nestFam(B.type);if(fa!==fb){const L=Object.keys(SPEC).filter(k=>!SPEC[k].ex&&[fa,fb].includes(nestFam(k))&&/^(Épi|Lég)/.test(SPEC[k].r||""));if(L.length){const lg=L.filter(k=>/^Lég/.test(SPEC[k].r));b.type=lg.length&&Math.random()<.1?lg[rnd(lg.length)]:L.filter(k=>/^Épi/.test(SPEC[k].r))[rnd(Math.max(1,L.filter(k=>/^Épi/.test(SPEC[k].r)).length))]||L[0];b.cross=1}}
 b.par=[A.type,B.type];b.gpar=[A.par||null,B.par||null];b.lin=A.lin||B.lin||"";return b};
/* ---- éclosion : champs supplémentaires, soins ---- */
const _nhN2=nestHatch;nestHatch=function(i){ens();const e=S.nest.slots[i];if(!e||nestLeft(e)>0)return _nhN2(i);const n0=S.team.length,X=S.nest.x;_nhN2(i);const d=S.team.length>n0?S.team[S.team.length-1]:null;if(!d)return;
 Object.assign(d.gn,{def:(e.gn&&e.gn.def)||0,sp:(e.gn&&e.gn.sp)||0});if(e.hue){d.mhue=e.hue;X.color++}if(e.cross)X.cross++;if(e.par)d.par=e.par;if(e.gpar)d.gpar=e.gpar;if(e.lin)d.lin=e.lin;if(e.care)d.imp=Math.min(IMP_MAX,(d.imp||0)+e.care);n2Quests();save();render()};
/* 3e nid : ponte dans la 3e place quand les deux premières sont prises */
function n2Lay3(){ens();const N=S.nest;if(!n2Third()){toast("3e nid : fais éclore 10 œufs.");return}if(N.slots[2]){toast("Le 3e nid est occupé.");return}if(!N.slots[0]||!N.slots[1]){toast("Utilise d'abord les nids 1 et 2.");return}
 const keep=N.slots[0];N.slots[0]=null;try{nestLay();const laid=N.slots[0];if(laid)N.slots[2]=laid}finally{N.slots[0]=keep}save();render()}
/* ---- soins des œufs (une fois par heure chacun, 3 au plus) ---- */
function n2Care(i,k){ens();const e=S.nest.slots[i];if(!e||nestLeft(e)<=0)return;e.cr=e.cr||{};const now=Date.now();if(e.cr[k]&&now-e.cr[k]<36e5){toast("Déjà fait il y a moins d'une heure.");return}if((e.care||0)>=3){toast("Cet œuf est déjà parfaitement soigné.");return}
 e.cr[k]=now;e.care=(e.care||0)+1;bump("eggCare");save();toast(k==="turn"?"🔄 Tu tournes doucement l'œuf.":"🔥 Tu réchauffes l'œuf.",1800);render()}
/* ---- stats : gènes de défense ; super : gènes de super ---- */
const _stN2=stats;stats=function(d){const v=_stN2(d),g=d&&d.gn&&d.gn.def;return g?{...v,def:Math.round(v.def*(1+.03*g))}:v};
const _aaN2=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;try{if(f&&f._tap&&!f._sup2){const s=T3().reduce((a,d)=>a+((d&&d.gn&&d.gn.sp)||0),0);if(s)f.sp=Math.min(100,(f.sp||0)+Math.round(s*.4))}}catch(e){}return _aaN2(dmg,msg,endTurn)};
const _gtN2=geneTag;geneTag=function(d){let h=_gtN2(d);if(!d)return h;const g=d.gn||{},p=n=>Math.round(n*3);if(g.def||g.sp)h+=` <span class="gtag on">DÉF +${p(g.def||0)} %</span> <span class="gtag on">SUPER +${((g.sp||0)*.4).toString().replace(".",",")}/orbe</span>`;
 if(d.mhue)h+=` <span class="gtag on" title="Mutation de couleur">🎨</span>`;if(d.lin)h=`<span class="gtag lin">🏷️ ${esc(d.lin)}</span> `+h;return h};
/* ---- portraits : couleur mutée et bébés plus petits ---- */
const n2Scale=d=>d&&d.baby?Math.min(1,.72+.28*Math.min(1,(d.level||1)/30)):1;
const _cardN2=card;card=function(d,a){let h=_cardN2(d,a);if(!d||!S.team.some(x=>x.id===d.id))return h;const sc=n2Scale(d),hue=d.mhue&&!d.skin?d.mhue:0;if(sc===1&&!hue)return h;
 h=h.replace(/<div class="bigicon([^"]*)"/,`<div class="bigicon$1 n2b" style="--bs:${sc.toFixed(2)};${hue?`--mh:${hue}deg`:""}"`);if(hue)h=h.replace('class="bigicon','class="n2hue bigicon');
 if(a===false)return h;const i=h.lastIndexOf("</div>");return h.slice(0,i)+`<div class="btns n2btn">${d.par?`<button class="secondary" onclick="n2Tree(${d.id})">🌳 ARBRE</button>`:""}${(d.gen||1)>1?`<button class="secondary" onclick="n2Lin(${d.id})">🏷️ LIGNÉE</button><button class="secondary" onclick="n2Send(${d.id})">📤 ÉCHANGER</button>`:""}</div>`+h.slice(i)};
const _rbN2=renderBattle;renderBattle=function(){_rbN2();try{const t=T3();document.querySelectorAll("#battleArea .sTeam .sFig").forEach((el,k)=>{const d=t[k];if(!d)return;const pt=el.querySelector(".pt");if(!pt)return;const sc=n2Scale(d);if(sc<1)pt.style.scale=sc.toFixed(2);if(d.mhue&&!d.skin)pt.style.filter=`hue-rotate(${d.mhue}deg) saturate(1.3)`})}catch(e){}};
/* ---- arbre généalogique, nom de lignée ---- */
function n2Tree(id){const d=S.team.find(x=>x.id===id);if(!d)return;const node=(t,cls)=>t?`<div class="n2n ${cls||""}">${art(SPEC[t]?SPEC[t].e:"❓")}<small>${esc(SPEC[t]?SPEC[t].name:"?")}</small></div>`:`<div class="n2n no">❔<small>inconnu</small></div>`,gp=d.gpar||[];
 openModal(`<h3 style="margin:0 0 6px">🌳 Arbre généalogique</h3><div class="n2tree"><div class="n2g">${[0,1].map(i=>(gp[i]||[null,null]).map(t=>node(t)).join("")).join("")}</div><div class="n2g">${(d.par||[]).map(t=>node(t)).join("")}</div><div class="n2g">${node(d.type,"me")}</div></div><div class="tiny muted">Génération ${d.gen||1}${d.lin?" · lignée « "+esc(d.lin)+" »":""}</div><div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
function n2Lin(id){const d=S.team.find(x=>x.id===id);if(!d)return;askText("Nom de la lignée",d.lin||("Lignée des "+(SPEC[d.type]?SPEC[d.type].name:"")),v=>{v=String(v||"").trim().slice(0,28);if(v)d.lin=v;else delete d.lin;save();render()},28)}
/* ---- classement des lignées ---- */
const n2Score=d=>{const g=d.gn||{};return((g.hp||0)+(g.atk||0)+(g.def||0)+(g.sp||0))*10+(d.gen||1)*5+(d.imp||0)*3+(d.mhue?5:0)+(d.v&&d.v!=="normal"?8:0)};
if(typeof nestBest==="function"){nestBest=function(){const L=S.team.filter(d=>(d.gen||1)>1||geneSum(d)).sort((x,y)=>n2Score(y)-n2Score(x)).slice(0,10);if(!L.length)return "";
 return `<div class="sectionhead"><h2>Classement de tes lignées</h2></div><div class="panel n2rank">${L.map((d,i)=>`<div class="row nbest"><span class="n2pos">${["🥇","🥈","🥉"][i]||i+1}</span><span class="a">${art(sp(d).e)}</span><div class="grow"><b>${esc(d.nick||nestName(d))}</b> <span class="tiny muted">niv. ${d.level} · score ${n2Score(d)}</span><div class="tiny">${geneTag(d)}</div></div></div>`).join("")}</div>`}}
/* ---- échange par code ---- */
const n2Sum=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h.toString(36)};
function n2Send(id){const d=S.team.find(x=>x.id===id);if(!d)return;const i=S.team.findIndex(x=>x.id===id);if(i<3){toast("Retire d'abord ce dino de l'équipe.");return}if(d.lock||d.fav){toast("Ce dino est verrouillé.");return}
 const o={t:d.type,l:d.level,v:d.v||"normal",g:d.gn||{},n:d.gen||1,h:d.mhue||0,li:d.lin||"",p:d.par||null,r:Date.now()%1e9},j=JSON.stringify(o),code="ARKD1."+btoa(unescape(encodeURIComponent(j)))+"."+n2Sum(j);
 openModal(`<h3 style="margin:0 0 6px">📤 Échanger ${esc(SPEC[d.type].name)}</h3><div class="tiny">Ce code permet à une autre sauvegarde d'accueillir ce dino. <b>Il quittera ta meute</b> quand tu confirmes.</div><textarea id="n2code" readonly rows="4" style="width:100%;margin:8px 0">${code}</textarea>
 <div class="btns"><button class="secondary" onclick="closeModal()">ANNULER</button><button class="red" onclick="n2SendGo(${d.id})">CONFIRMER L'ENVOI</button></div>`)}
function n2SendGo(id){const i=S.team.findIndex(x=>x.id===id);if(i<3)return;const c=$$("n2code");try{navigator.clipboard&&navigator.clipboard.writeText(c.value).catch(()=>{})}catch(e){}S.team.splice(i,1);S.nest.x.sent++;save();toast("📤 Code copié : ton dino part vers sa nouvelle meute.",3000);closeModal();render()}
function n2Recv(){askText("Code d'échange (ARKD1.…)","",v=>{v=String(v||"").trim();const m=/^ARKD1\.([A-Za-z0-9+/=]+)\.([a-z0-9]+)$/.exec(v);if(!m){toast("Code invalide.");return}let j;try{j=decodeURIComponent(escape(atob(m[1])))}catch(e){toast("Code illisible.");return}
 if(n2Sum(j)!==m[2]){toast("Code abîmé (somme de contrôle).");return}ens();if(S.nest.x.codes[m[2]]){toast("Ce code a déjà été utilisé ici.");return}let o;try{o=JSON.parse(j)}catch(e){toast("Code illisible.");return}
 if(!SPEC[o.t]||SPEC[o.t].ex||SPEC[o.t].myth){toast("Espèce inconnue ou non échangeable.");return}const cl=(x,a,b)=>Math.max(a,Math.min(b,x|0)),g={};for(const k of ["hp","atk","def","sp"])g[k]=cl((o.g||{})[k],0,GENE_MAX);
 const d={id:S.nextId++,type:o.t,level:cl(o.l,1,100),xp:0,v:VAR[o.v]?o.v:"normal",gn:g,gen:cl(o.n,1,99)};if(o.h)d.mhue=cl(o.h,0,360);if(o.li)d.lin=String(o.li).slice(0,28);if(Array.isArray(o.p))d.par=o.p.filter(t=>SPEC[t]).slice(0,2);
 S.team.push(d);S.nest.x.codes[m[2]]=1;S.nest.x.got++;save();toast("📥 "+SPEC[d.type].name+" rejoint ta meute !",3000);render()},400)}
/* ---- quêtes d'élevage du Dr Elara ---- */
const N2Q=[["g3","Élever un dino de 3e génération",()=>Math.max(1,...S.team.map(d=>d.gen||1))>=3,{essence:30,amber:3}],["mut","Obtenir une mutation",()=>(S.nest.mut||0)>=1,{tickets:2}],
 ["imp","Un petit avec une empreinte de 3",()=>S.team.some(d=>d.baby&&(d.imp||0)>=3),{essence:40}],["hp5","Un dino avec 5 gènes de PV",()=>S.team.some(d=>d.gn&&d.gn.hp>=5),{tickets:4,crystal:4}],
 ["cross","Réussir un croisement spécial",()=>(S.nest.x.cross||0)>=1,{tickets:3,shards:10}],["color","Obtenir une mutation de couleur",()=>(S.nest.x.color||0)>=1,{essence:30}]];
function n2Quests(){try{ens();N2Q.forEach(([k,n,ok,R])=>{if(!S.nest.x.q[k]&&ok()){S.nest.x.q[k]=1;give(R);toast("🧑‍🔬 Quête d'élevage : « "+n+" » ! "+fmt(R),3200)}})}catch(e){}}
/* ---- écran du Nid : ajouts ---- */
const _rnN2=renderNest;renderNest=function(){_rnN2();const el=$$("nest");if(!el||(S.stage||0)<NEST_UNLOCK)return;ens();n2Quests();const N=S.nest,X=N.x;
 el.querySelectorAll("[data-egg]").forEach(p=>{const i=+p.dataset.egg,e=N.slots[i];if(!e||nestLeft(e)<=0)return;p.insertAdjacentHTML("beforeend",`<div class="btns n2care"><button class="secondary" onclick="n2Care(${i},'turn')">🔄 TOURNER</button><button class="secondary" onclick="n2Care(${i},'warm')">🔥 RÉCHAUFFER</button><span class="tiny muted">soins ${e.care||0}/3 → empreinte de départ</span></div>`)});
 const banner=el.querySelector(".banner");if(banner&&n2Record())banner.insertAdjacentHTML("afterend",`<div class="panel n2rec"><b>🥚 Ponte record !</b> <span class="tiny">Les 3 premiers jours du mois, les mutations sont deux fois plus fréquentes.</span></div>`);
 const full=N.slots[0]&&N.slots[1];el.insertAdjacentHTML("beforeend",`<div class="panel n2x"><b>🧪 Croisements et 3e nid</b><div class="tiny muted">Deux familles proches (${N2_CLOSE.map(([a,b])=>(FAMNAME[a]||a)+" × "+(FAMNAME[b]||b)).join(", ")}) peuvent aussi s'accoupler : le petit est une espèce épique (parfois légendaire) de l'une des deux familles. Choisis le 1er parent puis le 2e : les familles proches sont acceptées.</div>
  <div class="btns"><button class="secondary" onclick="n2CrossPick()">🧪 CHOISIR UN CROISEMENT</button>${n2Third()?(full&&!N.slots[2]?`<button class="blue" onclick="n2Lay3()">🥚 PONDRE DANS LE 3E NID</button>`:""):`<span class="tiny muted">🔒 3e nid : fais éclore 10 œufs (${N.hatched||0}/10).</span>`}<button class="secondary" onclick="n2Recv()">📥 RECEVOIR UN DINO (CODE)</button></div></div>
 <div class="panel n2q"><b>🧑‍🔬 Quêtes d'élevage du Dr Elara</b>${N2Q.map(([k,n,ok,R])=>`<div class="tiny">${X.q[k]?"✅":"⬜"} ${esc(n)} <span class="muted">· ${fmt(R)}</span></div>`).join("")}</div>
 <div class="panel n2stats"><b>📊 Statistiques d'élevage</b><div class="tiny">${N.hatched||0} éclosions · ${N.mut||0} mutations · ${X.color} mutations de couleur · ${X.cross} croisements · génération max ${Math.max(1,...S.team.map(d=>d.gen||1))} · ${X.sent} envoyés · ${X.got} reçus</div></div>`)};
function n2CrossPick(){const A=S.team.find(d=>d.id===nestSel.a);if(!A)return nestPick("a");const L=S.team.filter(d=>d.id!==A.id&&nestOk(d)&&nestFam(d.type)!==nestFam(A.type)&&n2Close(nestFam(A.type),nestFam(d.type)));
 openModal(`<h3 style="margin:0 0 4px">🧪 Croisement avec ${nestName(A)}</h3><div class="tiny muted">Familles proches de ${esc(FAMNAME[nestFam(A.type)]||"")}</div><div class="nestlist">${L.slice(0,60).map(d=>`<button class="nprow" onclick="nestSel.b=${d.id};closeModal();render()"><span class="a">${art(sp(d).e)}</span><span class="grow"><b>${nestName(d)}</b><span class="tiny muted"> niv. ${d.level} · ${esc(FAMNAME[nestFam(d.type)]||"")}</span></span></button>`).join("")||'<div class="tiny muted">Aucun dino compatible.</div>'}</div><button class="wide secondary" onclick="closeModal()">FERMER</button>`)}
/* ---- œufs visibles au camp ---- */
if(typeof campScene==="function"){const _csN2=campScene;campScene=function(){let h=_csN2();try{ens();const eggs=(S.nest&&S.nest.slots||[]).map((e,i)=>e?`<span class="n2egg" style="left:${84+i*4}%">${nestLeft(e)?"🥚":"🐣"}</span>`:"").join("");h=h.replace(/<\/div>$/,eggs+"</div>")}catch(e){}return h}}
ACH.push(["n2a","Généalogiste","Obtenir une mutation de couleur",()=>((S.nest||{}).x||{}).color||0,1,{essence:30}],["n2b","Apprenti sorcier","Réussir 3 croisements spéciaux",()=>((S.nest||{}).x||{}).cross||0,3,{tickets:5}],["n2c","Nourrice","Soigner 10 œufs",()=>(S.cnt||{}).eggCare||0,10,{amber:5}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Élevage avancé","Les petits héritent aussi de gènes de défense (+3 %/point) et de super (+0,4 de jauge par orbe et par point), et parfois d'une mutation de couleur. Soigne les œufs (tourner, réchauffer : 1 fois par heure, 3 soins) pour une empreinte de départ. Croisements spéciaux entre familles proches : un petit épique (parfois légendaire). 3e nid après 10 éclosions. Les 3 premiers jours du mois : Ponte record (mutations ×2). Nomme tes lignées, consulte l'arbre généalogique, échange un dino d'élevage par code avec une autre sauvegarde."]);
