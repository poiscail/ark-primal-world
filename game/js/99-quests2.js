/* Missions et succès II (0.42) : missions hebdomadaires (une à renouveler par jour), missions de défi (sans super, sans perte,
   en 5 actions), missions par famille, parcours du débutant sur 7 jours, chaîne de missions racontée par le Dr Elara, missions
   « découvre une fonction », tout récupérer en un clic, suivi de mission en combat, objectif du moment sur l'accueil ;
   succès cachés, drôles, de vitesse, de variantes, du bestiaire complet, d'élevage, du Labyrinthe par relique, de série du
   Défi du jour ; points de succès et paliers, récompense de catégorie complète, vitrine de badges sur le profil, notification
   quand un succès est proche ; statistiques globales et records personnels (écran animé). État : S.q2. */
const _ensQ2=ens;ens=function(){_ensQ2();let Q=S.q2;if(!Q||typeof Q!=="object")Q=S.q2={};
 for(const k of ["st","rec","fam","seen","relics","cat","tier","near","chain","newbie","wclaim","feat","bdg"])if(!Q[k]||typeof Q[k]!=="object")Q[k]=k==="bdg"?[]:{};
 if(!Array.isArray(Q.bdg))Q.bdg=[];const w=wkNow();if(!Q.wk||Q.wk.w!==w)Q.wk={w,cnt:{},claimed:{},pick:null,rr:""};if(!(Q.t0>0))Q.t0=Date.now()};
/* ---- compteurs : semaine, familles, défis, statistiques globales ---- */
const _bumpQ2=bump;bump=function(t,n){_bumpQ2(t,n);try{ens();const c=S.q2.wk.cnt;c[t]=(c[t]||0)+(n===undefined?1:n)}catch(e){}};
const q2St=(k,v)=>{const s=S.q2.st;s[k]=(s[k]||0)+v};
const q2Rec=(k,v,txt)=>{const r=S.q2.rec;if(!r[k]||v>r[k].v){r[k]={v,t:Date.now(),x:txt||""};return true}return false};
const q2Hp=f=>f&&f.enemies?f.enemies.reduce((a,e)=>a+Math.max(0,e.hp||0),0):0;
function q2Act(fn,kind,a){const f=fight;let h0=0,w0=0,live=false;try{if(f&&!f.over){h0=q2Hp(f);w0=f.wave;live=true;f.q2a=(f.q2a||0)+1}}catch(e){}const r=fn(a);
 try{if(f&&f.mx&&live){ens();if(kind==="s")f.q2s=1;const dm=Math.max(0,h0-q2Hp(f));if(dm>0){q2St("dmg",dm);if(q2Rec("hit",Math.round(dm),sp(S.team[0]).name))f.q2hit=1}
  if(kind==="o")q2St("orbs",1);else if(kind==="k")q2St("skills",1);else q2St("supers",1);if((f.combo||0)>1)q2Rec("combo",f.combo);if(f.wave>w0)q2St("kills",f.wave-w0)}}catch(e){}return r}
const _toQ2=tapOrb;tapOrb=function(i){return q2Act(_toQ2,"o",i)};
const _usQ2=useSkill;useSkill=function(k){return q2Act(_usQ2,"k",k)};
const _spQ2=special;special=function(){return q2Act(_spQ2,"s")};
const _winQ2=win;win=function(){const f=fight,was=f&&f.over;const r=_winQ2.apply(this,arguments);try{if(f&&!was&&f.over==="win"&&!f.q2w){f.q2w=1;ens();q2St("kills",1);const a=f.q2a||0,lost=(f.hp||[]).some(h=>h<=0),t=S.team.slice(0,3);
  if(!f.q2s)bump("nosuper");if(!lost)bump("flawless");if(a>0&&a<=5)bump("quick");if(a>0&&a<=3)bump("blitz");if(a>0)q2Rec("fast",-a,f.zone);
  const fams={};t.forEach(d=>{const k=msFam(d);fams[k]=(fams[k]||0)+1});Object.keys(fams).forEach(k=>{if(fams[k]>=2)S.q2.fam[k]=(S.q2.fam[k]||0)+1});
  S.q2.streak=(S.q2.streak||0)+1;q2Rec("streak",S.q2.streak);save()}}catch(e){}return r};
function q2Lose(f){if(!f||f.q2l)return;f.q2l=1;try{ens();S.q2.streak=0;const e=f.enemies&&f.enemies[f.wave];if(e&&e.max&&e.hp>0&&e.hp/e.max<=.02)bump("closeLoss");if(f.q2a===1)bump("fastLoss");save()}catch(e){}}
const _rbQ2=renderBattle;renderBattle=function(){_rbQ2();try{const f=fight;if(f&&f.over==="lose")q2Lose(f);q2Track()}catch(e){}};
/* ---- missions hebdomadaires (une peut être renouvelée chaque jour) ---- */
const WKPOOL=[{id:"w_wins",t:"wins",g:30,n:"Gagner 30 combats",r:{tickets:3,stone:300}},{id:"w_boss",t:"bosses",g:5,n:"Vaincre 5 boss",r:{tickets:2,crystal:3}},{id:"w_sum",t:"summons",g:20,n:"Faire 20 invocations",r:{essence:30,amber:3}},
 {id:"w_sup",t:"supers",g:15,n:"Lancer 15 super attaques",r:{essence:25}},{id:"w_dun",t:"dungeons",g:8,n:"Terminer 8 donjons",r:{hide:8,bone:8}},{id:"w_flaw",t:"flawless",g:10,n:"Gagner 10 combats sans perdre de dino",r:{tickets:2,essence:20}},
 {id:"w_nosup",t:"nosuper",g:8,n:"Gagner 8 combats sans super",r:{tickets:2}},{id:"w_quick",t:"quick",g:5,n:"Gagner 5 combats en 5 actions ou moins",r:{tickets:2,shards:8}},{id:"w_story",t:"stories",g:10,n:"Réussir 10 niveaux d'histoire",r:{tickets:2,stone:200}},
 {id:"w_skill",t:"skills",g:30,n:"Utiliser 30 compétences",r:{essence:20,crystal:2}}];
function q2Weekly(){ens();const W=S.q2.wk;if(!W.pick){const L=WKPOOL.map((m,i)=>i).sort((a,b)=>hashS("wk"+W.w+a)-hashS("wk"+W.w+b));W.pick=L.slice(0,5)}return W.pick.map(i=>WKPOOL[i])}
const q2WP=m=>Math.min(m.g,S.q2.wk.cnt[m.t]||0);
function q2WClaim(id){ens();const W=S.q2.wk,m=q2Weekly().find(x=>x.id===id);if(!m||W.claimed[id]||q2WP(m)<m.g)return false;W.claimed[id]=1;give(m.r);save();toast("📅 Mission de la semaine : "+fmt(m.r),2400);render();return true}
function q2Reroll(id){ens();const W=S.q2.wk;if(W.rr===todayK()){toast("Une seule mission renouvelée par jour.");return false}const pos=W.pick.indexOf(WKPOOL.findIndex(m=>m.id===id));if(pos<0||W.claimed[id])return false;
 const free=WKPOOL.map((m,i)=>i).filter(i=>!W.pick.includes(i));if(!free.length)return false;W.pick[pos]=free[hashS(todayK()+id)%free.length];W.rr=todayK();save();toast("🔄 Mission renouvelée.");render();return true}
/* ---- missions par famille, de défi, découvertes, débutant, chaîne racontée ---- */
const FAMQ=["T","S","C","A","G","F","H","M","W","I"];
const famN=k=>(typeof FAMNAME!=="undefined"&&FAMNAME[k])||({W:"Mammifères",I:"Insectes"}[k])||k;
const CHALQ=[{id:"c_nosup",t:"nosuper",g:10,n:"Gagner 10 combats sans super attaque",r:{tickets:2,essence:15}},{id:"c_flaw",t:"flawless",g:25,n:"Gagner 25 combats sans perdre un dino",r:{tickets:3,shards:10}},{id:"c_quick",t:"quick",g:15,n:"Gagner 15 combats en 5 actions ou moins",r:{tickets:3,crystal:3}},{id:"c_blitz",t:"blitz",g:3,n:"Gagner 3 combats en 3 actions ou moins",r:{tickets:4}}];
const FEATQ=[["maze","🌀","Labyrinthe"],["trials","⚔️","Épreuves de la meute"],["nest","🥚","Nid d'élevage"],["camp","🏕️","Camp de base"],["world","🗺️","Carte du monde"],["regions","🧭","Régions"],["dig","⛏️","Fouilles"],["exped","🧭","Expéditions"],["far","❄️","Grand Nord"],["modes2","🎯","Modes"],["achs","🏅","Succès"],["tower","🗼","Tour"]];
const NEWBIE=[[{t:"wins",g:3,n:"Gagner 3 combats"},{t:"summons",g:1,n:"Faire une invocation"}],[{t:"stories",g:3,n:"Réussir 3 niveaux d'histoire"},{t:"trains",g:1,n:"Entraîner un dino"}],[{t:"skills",g:5,n:"Utiliser 5 compétences"},{t:"supers",g:2,n:"Lancer 2 super attaques"}],
 [{t:"dungeons",g:1,n:"Terminer un donjon"},{t:"upgrades",g:1,n:"Renforcer un objet"}],[{t:"bosses",g:1,n:"Vaincre un boss"},{t:"wins",g:15,n:"Gagner 15 combats"}],[{t:"awaken",g:1,n:"Éveiller un dino"},{t:"summons",g:10,n:"Faire 10 invocations"}],[{t:"stories",g:12,n:"Réussir 12 niveaux d'histoire"},{t:"wins",g:30,n:"Gagner 30 combats"}]];
const NEWBIE_R=[{tickets:2},{tickets:2,stone:150},{essence:30},{tickets:3},{tickets:3,crystal:3},{tickets:4,essence:30},{tickets:6,shards:20}];
const CHAIN=[["Le carnet du Dr Elara","« J'ai retrouvé mon vieux carnet de terrain. Aide-moi à vérifier mes notes : gagne 5 combats dans la jungle. »",{t:"wins",g:5},{stone:150}],
 ["Les ruines parlent","« Ces ruines cachent des gardiens. Bats un boss, et note bien comment il se défend. »",{t:"bosses",g:1},{tickets:1}],
 ["Échantillons","« Il me faut de l'ADN frais : invoque 5 dinos, je ferai des prélèvements. »",{t:"summons",g:5},{essence:20}],
 ["Sur la piste","« Les traces mènent vers le volcan. Réussis 10 niveaux d'histoire de plus. »",{t:"stories",g:10},{tickets:2}],
 ["Sans filet","« Montre-moi ce que ta meute vaut vraiment : gagne 5 combats sans perdre un seul dino. »",{t:"flawless",g:5},{crystal:3,essence:20}],
 ["La forge des anciens","« Les anciens renforçaient leurs talismans. Renforce 5 objets. »",{t:"upgrades",g:5},{tickets:2,amber:3}],
 ["Le cœur de l'obélisque","« Nous y sommes presque. Vaincs 5 boss pour ouvrir le passage. »",{t:"bosses",g:5},{tickets:3,shards:15}],
 ["Ce que la Graine voulait","« Tout est noté. Merci, survivant. Une dernière chose : gagne 50 combats, pour l'île. »",{t:"wins",g:50},{tickets:5,shards:25}]];
function q2ChainCur(){ens();const C=S.q2.chain;if(!(C.i>=0))Object.assign(C,{i:0,base:{...S.cnt}});return C}
const q2ChainP=()=>{const C=q2ChainCur(),M=CHAIN[C.i];if(!M)return 0;return Math.min(M[2].g,((S.cnt||{})[M[2].t]||0)-((C.base||{})[M[2].t]||0))};
function q2ChainClaim(){const C=q2ChainCur(),M=CHAIN[C.i];if(!M||q2ChainP()<M[2].g)return false;give(M[3]);C.i++;C.base={...S.cnt};save();toast("📜 "+M[0]+" : "+fmt(M[3]),2600);if(CHAIN[C.i]&&typeof loreShow==="function"&&PREFS.lore!==false){}render();return true}
const q2Day=()=>Math.floor((Date.now()-S.q2.t0)/864e5);
function q2NewbieClaim(i){ens();const N=S.q2.newbie;if(N[i]||i>q2Day()||i>6)return false;if(!NEWBIE[i].every(m=>((S.cnt||{})[m.t]||0)>=m.g))return false;N[i]=1;give(NEWBIE_R[i]);save();toast("🌱 Jour "+(i+1)+" du débutant : "+fmt(NEWBIE_R[i]),2600);render();return true}
const famWins=k=>S.q2.fam[k]||0;
function q2FamClaim(k){ens();const F=S.q2.fam;if(famWins(k)<10||S.q2.feat["fam_"+k])return false;S.q2.feat["fam_"+k]=1;give({tickets:2,essence:15});save();toast("🦖 Mission "+famN(k)+" réussie !");render();return true}
function q2ChalClaim(id){ens();const m=CHALQ.find(x=>x.id===id);if(!m||S.q2.feat[id]||((S.cnt||{})[m.t]||0)<m.g)return false;S.q2.feat[id]=1;give(m.r);save();toast("🎯 Défi réussi : "+fmt(m.r));render();return true}
function q2FeatClaim(s){ens();if(!S.q2.seen[s]||S.q2.feat["see_"+s])return false;S.q2.feat["see_"+s]=1;give({tickets:1,stone:100});save();toast("🔍 Découverte : +1 🎟️ +100 🪨");render();return true}
const _goQ2=go;go=function(s){const r=_goQ2(s);try{ens();if(FEATQ.some(x=>x[0]===s)&&!S.q2.seen[s]){S.q2.seen[s]=1;save()}}catch(e){}return r};
/* ---- tout récupérer en un clic, partout ---- */
function q2ClaimAll(){ens();let n=0;const c0=JSON.stringify([S.claimed,S.dclaimed]);try{claimAll()}catch(e){}if(JSON.stringify([S.claimed,S.dclaimed])!==c0)n++;
 q2Weekly().forEach(m=>{if(q2WClaim(m.id))n++});CHALQ.forEach(m=>{if(q2ChalClaim(m.id))n++});FAMQ.forEach(k=>{if(q2FamClaim(k))n++});FEATQ.forEach(x=>{if(q2FeatClaim(x[0]))n++});
 for(let i=0;i<7;i++)if(q2NewbieClaim(i))n++;while(q2ChainClaim())n++;ACH.forEach(a=>{if(!S.ach.got[a[0]]&&achOk(a)){achClaim(a[0]);n++}});q2CatAll();q2TierAll();
 toast(n?"🎁 Tout est récupéré ("+n+").":"Rien à récupérer pour l'instant.",2400);render();return n}
/* ---- nouveaux succès : cachés, drôles, vitesse, variantes, bestiaire, élevage, Labyrinthe, série du Défi du jour ---- */
const VARS_ALL=["alpha","shadow","albino","golden","prism","fossil","crystal","lava","spectral"];
const hasVar=v=>S.team.some(d=>d.v===v);
const _arQ2=typeof mzAddRelic==="function"?mzAddRelic:null;if(_arQ2)mzAddRelic=function(run,k){const r=_arQ2(run,k);try{ens();if(r||RELICS[k])S.q2.relics[k]=1}catch(e){}return r};
const relN=()=>Object.keys((S.q2||{}).relics||{}).length;
const maxGen=()=>S.team.reduce((m,d)=>Math.max(m,d.gen||1),1);
const maxGenes=()=>S.team.some(d=>{try{const g=geneOf(d);return["hp","atk","def","sp"].filter(k=>g[k]!==undefined).every(k=>g[k]>=GENE_MAX)}catch(e){return false}})?1:0;
const dchBest=()=>{const D=S.dch||{};S.q2&&(S.q2.dbest=Math.max(S.q2.dbest||0,D.streak||0));return(S.q2&&S.q2.dbest)||D.streak||0};
const ACH_HIDE=new Set(["q2h1","q2h2","q2h3","q2h4"]);
ACH.push(["q2h1","Presque !","Perdre alors que l'ennemi n'a plus que 2 % de ses PV",()=>(S.cnt||{}).closeLoss||0,1,{essence:20},"Presque !"],["q2h2","Trop pressé","Perdre un combat après une seule action",()=>(S.cnt||{}).fastLoss||0,1,{stone:100}],
 ["q2h3","Collectionneur de cailloux","Avoir 9 999 pierres en même temps",()=>S.stone||0,9999,{tickets:2}],["q2h4","Noctambule","Jouer entre minuit et 5 h du matin",()=>(S.q2&&S.q2.night)||0,1,{essence:15},"Noctambule"],
 ["q2v1","Éclair","Gagner un combat en 3 actions ou moins",()=>(S.cnt||{}).blitz||0,1,{tickets:2},"Éclair"],["q2v2","Foudroyant","Gagner 25 combats en 5 actions ou moins",()=>(S.cnt||{}).quick||0,25,{tickets:3}],
 ...VARS_ALL.map((v,i)=>["q2c"+i,"Variante : "+((typeof VAR!=="undefined"&&VAR[v]&&VAR[v].n)||v),"Posséder un dino "+((typeof VAR!=="undefined"&&VAR[v]&&VAR[v].n)||v),()=>hasVar(v)?1:0,1,{essence:15}]),
 ["q2c9","Arc-en-ciel","Posséder les 9 variantes",()=>VARS_ALL.filter(hasVar).length,9,{tickets:5,shards:25},"Arc-en-ciel"],
 ["q2b1","Bestiaire complet","Vaincre toutes les créatures du bestiaire",()=>typeof cxSeen==="function"?cxSeen():0,typeof CX_ALL==="function"?CX_ALL().length:99,{tickets:6,shards:30},"Naturaliste"],
 ["q2n1","Lignée ancienne","Faire naître un dino de 10e génération",maxGen,10,{tickets:4,essence:40},"Généticien"],["q2n2","Gènes parfaits","Avoir un dino aux gènes au maximum",maxGenes,1,{tickets:3}],
 ["q2m1","Antiquaire","Trouver 10 reliques différentes au Labyrinthe",relN,10,{tickets:2}],["q2m2","Conservateur des reliques","Trouver 20 reliques différentes",relN,20,{tickets:3}],["q2m3","Toutes les reliques","Trouver toutes les reliques",relN,typeof RELICS!=="undefined"?Object.keys(RELICS).length:30,{tickets:5,shards:25},"Maître des reliques"],
 ["q2d1","Habitué","Série de 7 Défis du jour",dchBest,7,{tickets:2}],["q2d2","Assidu","Série de 30 Défis du jour",dchBest,30,{tickets:6,shards:30},"Infatigable"]);
setInterval(()=>{try{const h=new Date().getHours();if(h<5&&S.q2&&!S.q2.night&&!(navigator.webdriver)){S.q2.night=1;save()}}catch(e){}},60000);
/* ---- points de succès, paliers, catégories complètes ---- */
const achPts=a=>ACH_HIDE.has(a[0])?20:a[6]?25:10;
const achPoints=()=>ACH.filter(a=>S.ach.got[a[0]]).reduce((s,a)=>s+achPts(a),0);
const TIERS_A=[["🥉 Bronze",100,{tickets:2}],["🥈 Argent",300,{tickets:4,shards:10}],["🥇 Or",600,{tickets:6,shards:20}],["💠 Platine",1000,{tickets:10,shards:40}],["🌟 Légende",1600,{tickets:15,shards:60}]];
function q2TierAll(){ens();const p=achPoints();let n=0;TIERS_A.forEach(([t,g,r])=>{if(p>=g&&!S.q2.tier[t]){S.q2.tier[t]=1;give(r);toast("🏅 Palier "+t+" : "+fmt(r),2600);n++}});if(n)save();return n}
const CATS={b:"Victoires",s:"Histoire",g:"Invocation",d:"Collection",t:"Tour",a:"Arène",e:"Boss",u:"Combat",f:"Forge",x:"Expéditions",p:"Rang",q2c:"Variantes",q2m:"Reliques",q2d:"Défi du jour"};
const catOf=a=>{const k=Object.keys(CATS).sort((x,y)=>y.length-x.length).find(c=>a[0].startsWith(c)&&(c.length>1||/^[a-z]\d/.test(a[0])));return k||null};
function q2CatAll(){ens();let n=0;Object.keys(CATS).forEach(c=>{const L=ACH.filter(a=>catOf(a)===c);if(L.length>=2&&L.every(a=>S.ach.got[a[0]])&&!S.q2.cat[c]){S.q2.cat[c]=1;give({tickets:3,essence:20});toast("📚 Catégorie « "+CATS[c]+" » complète : +3 🎟️ +20 🔮",3000);n++}});if(n)save();return n}
const _acQ2=achClaim;achClaim=function(id){const r=_acQ2(id);try{q2TierAll();q2CatAll()}catch(e){}return r};
/* ---- succès presque atteint : notification discrète, une fois ---- */
function q2Near(){ens();for(const a of ACH){if(S.ach.got[a[0]]||S.q2.near[a[0]]||ACH_HIDE.has(a[0])||a[4]<5)continue;let v=0;try{v=a[3]()}catch(e){continue}if(v<a[4]&&v>=a[4]*.9){S.q2.near[a[0]]=1;save();toast("🔔 Presque : « "+a[1]+" » ("+Math.floor(v)+"/"+a[4]+")",3000);return a[0]}}return null}
/* ---- succès : cachés masqués, points, paliers, catégories ---- */
const _raQ2=renderAch;renderAch=function(){_raQ2();try{const el=$$("achs");if(!el)return;ens();
 el.querySelectorAll(".panel.ach").forEach(p=>{const b=p.querySelector("b");const a=b&&ACH.find(x=>x[1]===b.textContent);if(a&&ACH_HIDE.has(a[0])&&!S.ach.got[a[0]]){b.textContent="??? Succès caché";const d=p.querySelector(".muted.tiny");if(d)d.textContent="Il se débloque en jouant… d'une certaine façon.";p.classList.add("q2hidden")}});
 const p=achPoints(),next=TIERS_A.find(t=>p<t[1]),ban=el.querySelector(".banner");if(ban&&!el.querySelector("#q2pts"))ban.insertAdjacentHTML("afterend",`<div class="panel q2pts" id="q2pts"><b>⭐ ${p} points de succès</b> ${TIERS_A.filter(t=>p>=t[1]).map(t=>`<span class="chip">${t[0]}</span>`).join(" ")}
  <div class="progress"><i style="width:${next?Math.min(100,p/next[1]*100):100}%"></i></div><div class="tiny muted">${next?"Prochain palier : "+next[0]+" à "+next[1]+" points ("+fmt(next[2])+").":"Tous les paliers sont atteints !"} · Catégories complètes : ${Object.keys(S.q2.cat).length}/${Object.keys(CATS).length}</div>
  <div class="btns"><button class="secondary" onclick="q2Records()">📈 MES RECORDS</button><button class="secondary" onclick="q2Badges()">🎖️ VITRINE DE BADGES</button></div></div>`)}catch(e){}};
/* ---- vitrine de badges (profil) ---- */
function q2Badges(){ens();const G=ACH.filter(a=>S.ach.got[a[0]]);openModal(`<h3 style="margin:0 0 6px">🎖️ Vitrine de badges (3 au plus)</h3><div class="tiny muted">Ils s'affichent sur ton profil et sur l'accueil.</div><div class="q2bdgs">${G.map(a=>`<button class="${S.q2.bdg.includes(a[0])?"":"secondary"}" onclick="q2BdgTog('${a[0]}')">🏅 ${esc(a[1])}</button>`).join("")||'<div class="tiny muted">Aucun succès pour l\'instant.</div>'}</div><div class="btns"><button onclick="closeModal();render()">OK</button></div>`)}
function q2BdgTog(id){ens();const B=S.q2.bdg,i=B.indexOf(id);if(i>=0)B.splice(i,1);else{if(B.length>=3){toast("3 badges au plus.");return}if(!S.ach.got[id])return;B.push(id)}save();q2Badges()}
const q2BdgHTML=()=>{ens();const L=S.q2.bdg.map(id=>ACH.find(a=>a[0]===id)).filter(Boolean);return L.length?`<div class="q2bdgrow">${L.map(a=>`<span class="q2bdg" title="${esc(a[2])}">🏅 ${esc(a[6]||a[1])}</span>`).join("")}</div>`:""};
if(typeof renderPlayer==="function"){const _rpQ2=renderPlayer;renderPlayer=function(){const r=_rpQ2.apply(this,arguments);try{const el=$$("player")||document.querySelector("#player");if(el&&!el.querySelector(".q2bdgrow"))(el.querySelector(".banner")||el).insertAdjacentHTML("afterend",`<div class="panel"><b>🎖️ Badges</b>${q2BdgHTML()||'<div class="tiny muted">Choisis tes badges dans Succès > Vitrine de badges.</div>'}</div>`)}catch(e){}return r}}
/* ---- statistiques globales et records (écran animé) ---- */
const REC_N={hit:["💥","Plus gros coup"],combo:["🔗","Plus long combo"],fast:["⚡","Victoire la plus rapide (actions)"],streak:["🔥","Plus longue série de victoires"]};
const ST_N={dmg:["⚔️","Dégâts infligés"],orbs:["🔴","Orbes jouées"],skills:["✨","Compétences utilisées"],supers:["💫","Super attaques"],kills:["☠️","Ennemis vaincus"]};
function q2Records(){ens();const R=S.q2.rec,T=S.q2.st;
 openModal(`<h3 style="margin:0 0 6px">📈 Mes records</h3><div class="q2recs">${Object.entries(REC_N).map(([k,[i,n]])=>{const r=R[k],v=r?Math.abs(r.v):0;return `<div class="q2rec"><span>${i}</span><b class="q2num" data-v="${v}">0</b><small>${n}${r&&r.x?" · "+esc(r.x):""}</small></div>`}).join("")}</div>
 <h4 style="margin:10px 0 4px">Statistiques globales</h4><div class="q2recs">${Object.entries(ST_N).map(([k,[i,n]])=>`<div class="q2rec"><span>${i}</span><b class="q2num" data-v="${Math.round(T[k]||0)}">0</b><small>${n}</small></div>`).join("")}</div><div class="btns"><button onclick="closeModal()">OK</button></div>`);
 const L=[...document.querySelectorAll("#modalBody .q2num")],t0=performance.now(),D=PREFS.anim?900:0;const step=t=>{const k=D?Math.min(1,(t-t0)/D):1;L.forEach(e=>{e.textContent=Math.round(+e.dataset.v*(1-Math.pow(1-k,3))).toLocaleString("fr-FR")});if(k<1)requestAnimationFrame(step)};step(t0+(D?0:1))}
/* ---- écran des missions : nouvelles sections ---- */
const _rmQ2=renderMissions;renderMissions=function(){_rmQ2();try{const el=$$("missions");if(!el)return;ens();const W=S.q2.wk,day=q2Day(),C=q2ChainCur(),M=CHAIN[C.i];
 const row=(n,p,g,r,done,btn,extra)=>`<div class="panel q2m ${done?"done":""}"><div class="row"><div class="grow"><b class="tiny">${n}</b><div class="muted tiny">${fmt(r)} · ${Math.min(p,g)}/${g}</div><div class="progress mbar"><i style="width:${Math.min(100,p/g*100)}%"></i></div></div>${done?'<span class="tag">✅</span>':btn}${extra||""}</div></div>`;
 let h=`<button class="wide blue q2all" onclick="q2ClaimAll()">🎁 TOUT RÉCUPÉRER (missions, succès, paliers)</button>`;
 h+=`<div class="sectionhead"><h2>📅 Missions de la semaine</h2></div><div class="tiny muted">Une mission peut être renouvelée chaque jour (🔄).</div>`+q2Weekly().map(m=>row(esc(m.n),q2WP(m),m.g,m.r,W.claimed[m.id],`<button style="padding:8px" ${q2WP(m)>=m.g?"":"disabled"} onclick="q2WClaim('${m.id}')">RÉCUPÉRER</button>`,W.claimed[m.id]?"":`<button class="secondary q2rr" title="Renouveler (1 fois par jour)" ${W.rr===todayK()?"disabled":""} onclick="q2Reroll('${m.id}')">🔄</button>`)).join("");
 if(M)h+=`<div class="sectionhead"><h2>📜 Le carnet du Dr Elara (${C.i+1}/${CHAIN.length})</h2></div><div class="panel q2chain"><b>${esc(M[0])}</b><div class="tiny"><i>${esc(M[1])}</i></div><div class="progress mbar"><i style="width:${q2ChainP()/M[2].g*100}%"></i></div><div class="row"><div class="grow tiny muted">${q2ChainP()}/${M[2].g} · ${fmt(M[3])}</div><button ${q2ChainP()>=M[2].g?"":"disabled"} onclick="q2ChainClaim()">SUITE ▶</button></div></div>`;
 else h+=`<div class="panel q2chain"><b>📜 Carnet du Dr Elara terminé</b> <span class="tiny muted">Merci pour l'île !</span></div>`;
 if(day<10&&Object.keys(S.q2.newbie).length<7)h+=`<div class="sectionhead"><h2>🌱 Parcours du débutant (jour ${Math.min(7,day+1)}/7)</h2></div><div class="q2newbie">${NEWBIE.map((L,i)=>{const ok=L.every(m=>((S.cnt||{})[m.t]||0)>=m.g),done=S.q2.newbie[i],lock=i>day;return `<div class="panel q2nb ${done?"done":lock?"lock":""}"><b>Jour ${i+1}</b>${L.map(m=>`<div class="tiny">${((S.cnt||{})[m.t]||0)>=m.g?"✅":"▫️"} ${esc(m.n)}</div>`).join("")}<div class="tiny muted">${fmt(NEWBIE_R[i])}</div>${done?'<span class="tag">✅</span>':lock?`<span class="tiny muted">🔒 dans ${i-day} j</span>`:`<button ${ok?"":"disabled"} onclick="q2NewbieClaim(${i})">OK</button>`}</div>`}).join("")}</div>`;
 h+=`<div class="sectionhead"><h2>🎯 Défis</h2></div>`+CHALQ.map(m=>row(esc(m.n),(S.cnt||{})[m.t]||0,m.g,m.r,S.q2.feat[m.id],`<button style="padding:8px" ${((S.cnt||{})[m.t]||0)>=m.g?"":"disabled"} onclick="q2ChalClaim('${m.id}')">RÉCUPÉRER</button>`)).join("");
 h+=`<div class="sectionhead"><h2>🦖 Missions par famille</h2></div><div class="tiny muted">Gagner 10 combats avec au moins 2 dinos de la famille dans l'équipe.</div><div class="q2fams">${FAMQ.map(k=>{const p=famWins(k),d=S.q2.feat["fam_"+k];return `<div class="q2fam ${d?"done":""}"><b>${esc(famN(k))}</b><small>${Math.min(10,p)}/10</small>${d?"✅":`<button class="${p>=10?"":"secondary"}" ${p>=10?"":"disabled"} onclick="q2FamClaim('${k}')">OK</button>`}</div>`}).join("")}</div>`;
 const F=FEATQ.filter(x=>$$(x[0])&&!S.q2.feat["see_"+x[0]]);if(F.length)h+=`<div class="sectionhead"><h2>🔍 Découvre une fonction</h2></div><div class="q2fams">${F.map(([s,i,n])=>`<div class="q2fam"><b>${i} ${esc(n)}</b>${S.q2.seen[s]?`<button onclick="q2FeatClaim('${s}')">+1 🎟️</button>`:`<button class="secondary" onclick="go('${s}')">OUVRIR</button>`}</div>`).join("")}</div>`;
 const ban=el.querySelector(".banner");if(ban)ban.insertAdjacentHTML("afterend",`<div id="q2box">${h}</div>`);else el.insertAdjacentHTML("afterbegin",`<div id="q2box">${h}</div>`)}catch(e){appErr&&appErr(e,"missions2")}};
/* ---- suivi de mission en combat et objectif du moment sur l'accueil ---- */
function q2Next(){ens();const L=[];DAILY.forEach(m=>{if(!S.dclaimed[m.id]){const p=prog(m,1);if(p<m.g)L.push({n:m.n,p,g:m.g,k:p/m.g})}});q2Weekly().forEach(m=>{if(!S.q2.wk.claimed[m.id]){const p=q2WP(m);if(p<m.g)L.push({n:m.n,p,g:m.g,k:p/m.g})}});
 const M=CHAIN[q2ChainCur().i];if(M){const p=q2ChainP();if(p<M[2].g)L.push({n:M[0],p,g:M[2].g,k:p/M[2].g})}L.sort((a,b)=>b.k-a.k);return L[0]||null}
function q2Track(){const f=fight;if(!f||f.over)return;const ch=document.querySelector("#battleArea .sHud .fchips");if(!ch||ch.querySelector(".q2track"))return;const m=q2Next();if(m)ch.insertAdjacentHTML("beforeend",`<span class="chip q2track" title="Mission la plus proche">📋 ${esc(m.n)} ${m.p}/${m.g}</span>`)}
const _rQ2=render;render=function(){_rQ2();try{if(screen!=="home")return;const old=$$("q2obj");if(old)old.remove();const m=q2Next(),ref=document.querySelector("#home .banner");if(!ref)return;
 ref.insertAdjacentHTML("afterend",`<div class="panel q2obj" id="q2obj" onclick="go('missions')"><b>🎯 Objectif du moment</b> <span>${m?esc(m.n)+" · "+m.p+"/"+m.g:"Tout est accompli pour l'instant 🎉"}</span>${q2BdgHTML()}${m?`<div class="progress"><i style="width:${m.k*100}%"></i></div>`:""}</div>`);q2Near()}catch(e){}};
if(typeof GUIDE!=="undefined")GUIDE.push(["Missions et succès","Missions : quotidiennes, de la semaine (une à renouveler par jour), défis, familles, parcours du débutant (7 jours), carnet du Dr Elara, découvertes. « Tout récupérer » prend tout d'un coup. Succès : points et paliers, catégories complètes, succès cachés, vitrine de badges, records personnels."]);
