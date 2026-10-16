/* Camp de base (0.33) : écran « Camp » (groupe Quêtes) avec les dinos de l'équipe qui s'y promènent, 5 bâtiments à
   améliorer (bonus permanents ou production), personnages : Dr Elara (lettre de la semaine avec un choix qui change le cadeau),
   Kael le rival (revient tous les 10 niveaux d'histoire avec une équipe qui progresse ; pari possible), Mira la marchande
   (offres de la semaine), Oto le vieux chercheur (quête en plusieurs étapes). État : S.camp. */
const CAMP_UNLOCK=3,CAMP_MAX=5,CAMP_CAP=12;
const CAMP_B={pal:{i:"🛡️",n:"Palissade",d:l=>"+"+2*l+" % de PV pour tous tes dinos"},cui:{i:"🍖",n:"Garde-manger",d:l=>"+"+2*l+" % d'attaque pour tous tes dinos"},
 car:{i:"⛏️",n:"Carrière",d:l=>"+"+25*l+" 🪨 par heure (jusqu'à "+CAMP_CAP+" h)"},bib:{i:"📚",n:"Bibliothèque",d:l=>"+"+l+" 🔮 par heure (jusqu'à "+CAMP_CAP+" h)"},
 nid:{i:"🪺",n:"Couveuse",d:l=>"incubation du Nid −"+6*l+" %"}};
const campCost=l=>({stone:300*l*l,bone:4*l,hide:4*l});
const ELARA_L=[
 {t:"Les fougères géantes ont fleuri cette nuit : je n'avais jamais vu ça. Les dinos herbivores en raffolent.",q:"Que faire des fleurs ?",a:[["En cueillir pour la meute",{essence:25}],["Les étudier au labo",{shards:6}]]},
 {t:"Un orage a mis au jour une couche de fossiles près des ruines. Il y en a trop pour moi seule !",q:"Tu m'aides ?",a:[["Fouiller avec toi",{bone:10,hide:6}],["Garder la balise",{tickets:1}]]},
 {t:"J'ai trouvé un œuf abandonné, encore tiède. Sa mère ne revient pas…",q:"On le garde au chaud ?",a:[["Oui, au camp",{amber:3}],["Le rendre à la jungle",{essence:30}]]},
 {t:"Kael est passé au labo. Il dit qu'il te battra au prochain tournoi. Il est têtu, mais pas méchant.",q:"Ta réponse ?",a:[["« Qu'il vienne ! »",{tickets:1,stone:200}],["« On verra bien »",{essence:20,crystal:2}]]},
 {t:"Mira a ramené de drôles de cristaux du marché du nord. Elle jure qu'ils chantent la nuit.",q:"On en achète ?",a:[["Un ou deux, pour voir",{crystal:4}],["Non, trop cher",{stone:500}]]},
 {t:"Le vieil Oto m'a confié ses carnets. Il a cartographié l'île bien avant nous, à la main.",q:"On les lit ensemble ?",a:[["Ce soir, au feu de camp",{shards:5,essence:10}],["Je préfère explorer",{bone:12}]]},
 {t:"La balise capte un signal faible, au large. Peut-être d'autres naufragés ?",q:"On répond ?",a:[["Envoyer un message",{tickets:2}],["Écouter encore",{essence:35}]]},
 {t:"Je crois que la Graine rêve. Ses pulsations ressemblent à une respiration endormie.",q:"Ça t'inquiète ?",a:[["Un peu",{amber:2,crystal:2}],["Non, elle veille sur nous",{essence:25,tickets:1}]]}];
const MIRA_O=[[{tickets:1},{stone:900}],[{essence:30},{stone:700}],[{amber:3},{bone:15}],[{shards:6},{essence:30}],[{crystal:4},{hide:15}],[{tickets:2},{essence:45}],[{bone:12,hide:12},{stone:600}],[{amber:5},{essence:40}]];
const OTO_Q=[{n:"Les premiers pas",d:"Gagne 10 combats",k:"wins",g:10,r:{essence:20,stone:300}},{n:"Le goût de la victoire",d:"Bats 3 boss",k:"bosses",g:3,r:{tickets:2}},
 {n:"Les bâtisseurs",d:"Améliore 3 fois un bâtiment du camp",k:"campUp",g:3,r:{shards:8,bone:10}},{n:"La meute s'agrandit",d:"Invoque 10 fois",k:"gacha",g:10,r:{essence:30,crystal:3}},
 {n:"Le chasseur",d:"Vaincs 3 mini-boss errants ou boss secrets",f:()=>((S.cnt||{}).wanders||0)+((S.cnt||{}).secrets||0),g:3,r:{tickets:3,amber:3}},
 {n:"La relève",d:"Fais éclore 1 œuf au Nid",k:"nestHatch",g:1,r:{essence:40}},{n:"Le rival",d:"Bats Kael 2 fois",k:"rivalW",g:2,r:{tickets:4,shards:10}},
 {n:"Le dernier carnet",d:"Gagne 25 combats de plus",k:"wins",g:25,r:{tickets:5,essence:60,crystal:6}}];
const RIVAL_N=10;
const _ensCamp=ens;ens=function(){_ensCamp();let C=S.camp;if(!C||typeof C!=="object")C=S.camp={};if(!C.b||typeof C.b!=="object")C.b={};Object.keys(CAMP_B).forEach(k=>{if(!(C.b[k]>=0))C.b[k]=0});
 if(!(C.t>0))C.t=Date.now();if(!C.let||typeof C.let!=="object")C.let={wk:-1,ch:-1};if(!C.mira||typeof C.mira!=="object")C.mira={wk:-1,b:{}};
 if(!C.oto||typeof C.oto!=="object")C.oto={s:0,base:null};if(!(C.rival>=0))C.rival=0;const w=wkNow();if(C.mira.wk!==w){C.mira.wk=w;C.mira.b={}}};
const campLv=k=>{try{return(S.camp&&S.camp.b[k])||0}catch(e){return 0}};
/* ---- bonus permanents ---- */
const _stCamp=stats;stats=function(d){const v=_stCamp(d),p=campLv("pal"),c=campLv("cui");if(!p&&!c)return v;return{...v,hp:Math.round(v.hp*(1+.02*p)),atk:Math.round(v.atk*(1+.02*c))}};
if(typeof nestLay==="function"){const _nlCamp=nestLay;nestLay=function(){const r=_nlCamp.apply(this,arguments);try{const l=campLv("nid"),now=Date.now();if(l)S.nest.slots.forEach(e=>{if(e&&!e.camp&&now-e.t0<3000){e.camp=1;e.t1=e.t0+Math.round((e.t1-e.t0)*(1-.06*l));[e.a,e.b].forEach(id=>{const p=S.team.find(x=>x.id===id);if(p&&p.nestT>e.t1)p.nestT=e.t1})}});save()}catch(x){}return r}}
/* ---- production ---- */
function campProd(){ens();const C=S.camp,h=Math.min(CAMP_CAP,(Date.now()-C.t)/36e5);return{stone:Math.floor(h*25*campLv("car")),essence:Math.floor(h*campLv("bib")),h}}
function campCollect(){const p=campProd();if(!p.stone&&!p.essence){toast("Rien à récolter pour l'instant.");return}const R={};if(p.stone)R.stone=p.stone;if(p.essence)R.essence=p.essence;give(R);S.camp.t=Date.now();save();toast("🏕️ Récolte du camp : "+fmt(R),2600);sfx&&sfx("win");render()}
function campUp(k){ens();const l=campLv(k);if(!CAMP_B[k]||l>=CAMP_MAX)return;const c=campCost(l+1);if((S.stone||0)<c.stone||(S.mat.bone||0)<c.bone||(S.mat.hide||0)<c.hide){toast("Il faut "+fmt(c)+".");return}
 if((k==="car"||k==="bib")&&(campProd().stone||campProd().essence))campCollect();
 S.stone-=c.stone;S.mat.bone-=c.bone;S.mat.hide-=c.hide;S.camp.b[k]=l+1;bump("campUp");save();toast(CAMP_B[k].i+" "+CAMP_B[k].n+" niveau "+(l+1)+" !",2600);sfx&&sfx("win");render()}
/* ---- lettre du Dr Elara (une par semaine, un choix) ---- */
const campLetter=()=>ELARA_L[wkNow()%ELARA_L.length];
const campLetterNew=()=>{try{ens();return(S.stage||0)>=CAMP_UNLOCK&&S.camp.let.wk!==wkNow()}catch(e){return false}};
function campRead(){ens();const L=campLetter(),done=!campLetterNew();
 openModal(`<div class="cletter"><div class="clhead">🧑‍🔬 <b>Lettre du Dr Elara</b><span class="tiny muted">semaine ${wkNow()}</span></div><p>« ${esc(L.t)} »</p><p><b>${esc(L.q)}</b></p>
  <div class="clans">${L.a.map(([t,R],i)=>`<button class="${done?(S.camp.let.ch===i?"blue":"secondary"):"blue"}" ${done?"disabled":""} onclick="campAnswer(${i})">${esc(t)}<small>${fmt(R)}</small></button>`).join("")}</div>
  ${done?'<div class="tiny muted">Tu as déjà répondu cette semaine. Une nouvelle lettre arrive chaque lundi.</div>':""}<div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button></div></div>`)}
function campAnswer(i){ens();if(!campLetterNew())return;const L=campLetter(),a=L.a[i];if(!a)return;S.camp.let={wk:wkNow(),ch:i};give(a[1]);save();closeModal();toast("💌 Cadeau d'Elara : "+fmt(a[1]),3000);sfx&&sfx("win");render()}
/* ---- Mira la marchande ---- */
const miraOffers=()=>{const w=wkNow();return[0,1,2].map(j=>(w*3+j)%MIRA_O.length)};
const campHas=c=>Object.entries(c).every(([k,v])=>(MATS[k]?(S.mat[k]||0):(S[k]||0))>=v);
function miraBuy(o){ens();if(!miraOffers().includes(o)||S.camp.mira.b[o])return;const[G,C]=MIRA_O[o];if(!campHas(C)){toast("Il te faut "+fmt(C)+".");return}
 Object.entries(C).forEach(([k,v])=>{if(MATS[k])S.mat[k]-=v;else S[k]-=v});give(G);S.camp.mira.b[o]=1;bump("market");save();toast("🧺 Mira : "+fmt(G),2400);render()}
/* ---- Oto : quête en plusieurs étapes ---- */
const otoVal=q=>q.f?q.f():((S.cnt||{})[q.k]||0);
function otoStep(){ens();const O=S.camp.oto,q=OTO_Q[O.s];if(!q)return null;if(O.base===null||O.base===undefined){O.base=otoVal(q);save()}return{q,p:Math.max(0,Math.min(q.g,otoVal(q)-O.base))}}
function otoClaim(){const st=otoStep();if(!st||st.p<st.q.g)return;give(st.q.r);S.camp.oto.s++;S.camp.oto.base=null;save();toast("📜 Oto : « "+st.q.n+" » terminée ! "+fmt(st.q.r),3000);sfx&&sfx("win");otoStep();render()}
/* ---- Kael le rival : une manche tous les 10 niveaux d'histoire ---- */
const rivalOpen=()=>{ens();const k=S.camp.rival+1;return k<=RIVAL_N&&(S.stage||0)>=k*10?k:0};
function rivalTeam(k){const want=k<=3?/^(Comm|Rare)/:k<=6?/^(Rare|Épi)/:/^(Épi|Lég)/,L=Object.keys(SPEC).filter(s=>!(SPEC[s].ex)&&want.test(SPEC[s].r||""));const t=[];let h=hashS("kael"+k);
 for(let g=0;g<40&&t.length<3&&L.length;g++){const s=L[h%L.length];if(!t.includes(s))t.push(s);h=(h*31+7)>>>0}while(t.length<3)t.push(["raptor","rex","giga"][t.length]);return t}
function rivalAsk(){const k=rivalOpen();if(!k)return;const st=100*k;
 openModal(`<div class="cletter"><div class="clhead">🧢 <b>Kael, ton rival</b><span class="tiny muted">manche ${k}/${RIVAL_N}</span></div><p>« ${esc(k===1?"Alors c'est toi, le naufragé qui dresse des dinos ? Montre-moi ce que tu vaux !":k>=RIVAL_N?"Dernière manche. Cette fois, je donne tout.":"Je me suis entraîné depuis la dernière fois. Prépare-toi !")} »</p>
  <div class="rteam">${rivalTeam(k).map(s=>`<span>${art(SPEC[s].e)}<small>${esc(SPEC[s].name)}</small></span>`).join("")}</div>
  <div class="clans"><button class="blue" onclick="closeModal();startBattle({mode:'rival',k:${k},bet:0})">Combat amical<small>récompense normale</small></button><button class="red" ${(S.stone||0)>=st?"":"disabled"} onclick="closeModal();startBattle({mode:'rival',k:${k},bet:1})">Parier ${st} 🪨<small>gagné : mise doublée + récompense ×1,5</small></button></div>
  <div class="btns"><button class="secondary" onclick="closeModal()">PLUS TARD</button></div></div>`)}
MODES.rival=function(o){const k=Math.max(1,Math.min(RIVAL_N,o.k||1)),eq=k*10+6,t=rivalTeam(k);
 const en=mkEnemies(eq,{emo:t.map(s=>SPEC[s].e),names:t.map(s=>SPEC[s].name+" · Kael"),els:t.map(s=>SPEC[s].element),pts:t,boss:k%5===0,hp:1.5,atk:1.2});en.forEach(e=>{e.tr="";e._nm=1});if(typeof ES_TOWER!=="undefined"&&k>=3){en[2].esk=ES_TOWER[k%ES_TOWER.length];en[2].skcd=ES_FIRST}
 return{eq,label:"Kael, ton rival · manche "+k,enemies:en}};
const _elCamp=enemyLook;enemyLook=function(e,f){f=f||fight;if(f&&f.o&&f.o.mode==="rival"&&e&&e.pt&&SPEC[e.pt])return null;return _elCamp(e,f)};
const _sbCamp=startBattle;startBattle=function(o){const t=o||lastB;if(t&&t.mode==="rival"){if(rivalOpen()!==t.k){toast("Kael n'est pas là pour l'instant.");return}if(t.bet&&!t.paid){if((S.stone||0)<100*t.k){toast("Pas assez de pierres pour parier.");return}S.stone-=100*t.k;save();o={...t,paid:1}}}return _sbCamp(o)};
function rivalWin(f){ens();const k=f.o.k,R={stone:150+30*k,essence:15+3*k,tickets:k%5===0?3:1};if(f.o.bet){R.stone=Math.round(R.stone*1.5)+200*k;R.essence=Math.round(R.essence*1.5)}
 if(S.camp.rival<k)S.camp.rival=k;bump("rivalW");return{R,extra:`<div class="tiny ok">🧢 Kael : « ${k>=RIVAL_N?"Tu es le meilleur dresseur de l'île. Je l'admets.":"Pas mal… mais la prochaine fois, je gagne !"} »${f.o.bet?" · pari gagné !":""}</div>`,loot:k%5===0?[rollItem(f.n,1)]:[]}}
const _ewCamp=eventWin;eventWin=function(f,n){return f&&f.o&&f.o.mode==="rival"?rivalWin(f):_ewCamp(f,n)};
if(typeof chainNext==="function"){const _cnCamp=chainNext;chainNext=function(f){return f&&f.o&&f.o.mode==="rival"?null:_cnCamp(f)}}
if(typeof balKey==="function"){const _bkCamp=balKey;balKey=function(f){return f&&f.o&&f.o.mode==="rival"?"rival "+f.o.k:_bkCamp(f)}}
/* ---- écran ---- */
function campScene(){const t=S.team.slice(0,6),ks=Object.keys(CAMP_B),pos={pal:[8,30],cui:[30,18],car:[56,14],bib:[78,22],nid:[90,48]};
 return `<div class="campscene">${typeof sceneHTML==="function"?sceneHTML("jungle"):""}<div class="cfire">🔥</div>
  ${ks.map(k=>`<div class="cbld ${campLv(k)?"":"off"}" style="left:${pos[k][0]}%;top:${pos[k][1]}%"><span>${CAMP_B[k].i}</span><small>${CAMP_B[k].n} ${campLv(k)?"· "+campLv(k):""}</small></div>`).join("")}
  ${t.map((d,i)=>`<div class="cwalk" style="--d:${14+i*3}s;--y:${58+(i%3)*11}%;--dl:-${i*2.3}s"><span class="cbob">${PREFS.art==="svg"&&typeof portrait==="function"?`<span class="pt">${portrait(d.type,true)}</span>`:art(sp(d).e)}</span></div>`).join("")}
  <div class="cchar" style="left:44%;top:46%" title="Dr Elara">🧑‍🔬</div><div class="cchar" style="left:66%;top:44%" title="Mira">🧕</div><div class="cchar" style="left:20%;top:50%" title="Oto">👴</div></div>`}
function renderCamp(){const el=$$("camp");if(!el)return;ens();if((S.stage||0)<CAMP_UNLOCK){el.innerHTML=`<div class="banner"><div class="eyebrow">CAMP DE BASE</div><h1>Le camp</h1><p>Termine le niveau ${CAMP_UNLOCK} de l'histoire pour installer ton camp.</p></div>`;return}
 const C=S.camp,p=campProd(),L=campLetter(),st=otoStep(),rk=rivalOpen(),M=miraOffers();
 el.innerHTML=`<div class="banner"><div class="eyebrow">CAMP DE BASE</div><h1>Ton camp</h1><p>Tes dinos s'y reposent. Améliore les bâtiments, discute avec les habitants et récolte la production.</p></div>
 ${campScene()}
 <div class="panel"><div class="row"><span class="bigicon">🧺</span><div class="grow"><b>Production</b><div class="tiny muted">${p.stone} 🪨 · ${p.essence} 🔮 en attente (${Math.floor(p.h)} h / ${CAMP_CAP} h)</div></div><button class="blue" ${p.stone||p.essence?"":"disabled"} onclick="campCollect()">RÉCOLTER</button></div></div>
 <div class="sectionhead"><h2>Bâtiments</h2></div><div class="cgrid">${Object.keys(CAMP_B).map(k=>{const l=campLv(k),c=campCost(l+1);return `<div class="panel cb"><div class="row"><span class="bigicon">${CAMP_B[k].i}</span><div class="grow"><b>${CAMP_B[k].n}</b> <span class="chip">niv. ${l}/${CAMP_MAX}</span><div class="tiny muted">${l?CAMP_B[k].d(l):"pas encore construit"}${l<CAMP_MAX?" → "+CAMP_B[k].d(l+1):""}</div></div></div>${l<CAMP_MAX?`<button class="wide" data-b="${k}" onclick="campUp('${k}')">${l?"AMÉLIORER":"CONSTRUIRE"} · ${fmt(c)}</button>`:'<div class="tiny ok">Niveau maximum</div>'}</div>`}).join("")}</div>
 <div class="sectionhead"><h2>Habitants</h2></div><div class="cgrid">
  <div class="panel cp"><div class="row"><span class="bigicon">🧑‍🔬</span><div class="grow"><b>Dr Elara</b><div class="tiny muted">${campLetterNew()?"💌 Une nouvelle lettre t'attend !":"Lettre de la semaine lue. La suivante arrive lundi."}</div></div><button class="${campLetterNew()?"red":"secondary"} celara" onclick="campRead()">${campLetterNew()?"LIRE":"RELIRE"}</button></div></div>
  <div class="panel cp"><div class="row"><span class="bigicon">🧢</span><div class="grow"><b>Kael, ton rival</b><div class="tiny muted">${rk?"Il t'attend pour la manche "+rk+" !":C.rival>=RIVAL_N?"Tu as gagné toutes les manches.":"Prochaine manche après le niveau "+(C.rival+1)*10+" de l'histoire."} Manches gagnées : ${C.rival}/${RIVAL_N}.</div></div>${rk?`<button class="red ckael" onclick="rivalAsk()">DÉFIER</button>`:""}</div></div>
  <div class="panel cp"><div class="row"><span class="bigicon">👴</span><div class="grow"><b>Oto, le vieux chercheur</b>${st?`<div class="tiny"><b>Carnet ${C.oto.s+1}/${OTO_Q.length} : ${esc(st.q.n)}</b> — ${esc(st.q.d)} (${st.p}/${st.q.g}) · ${fmt(st.q.r)}</div><div class="progress"><i style="width:${st.p/st.q.g*100}%"></i></div>`:'<div class="tiny ok">Tous les carnets d\'Oto sont complétés. Merci !</div>'}</div>${st?`<button class="blue coto" ${st.p>=st.q.g?"":"disabled"} onclick="otoClaim()">RÉCLAMER</button>`:""}</div></div>
  <div class="panel cp"><div class="row"><span class="bigicon">🧕</span><div class="grow"><b>Mira, la marchande</b><div class="tiny muted">Offres de la semaine (une fois chacune)</div></div></div><div class="cmira">${M.map(o=>{const[G,Cc]=MIRA_O[o],b=C.mira.b[o];return `<button class="secondary" ${b?"disabled":""} onclick="miraBuy(${o})"><b>${fmt(G)}</b><small>${b?"vendu":"contre "+fmt(Cc)}</small></button>`}).join("")}</div></div></div>`}
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="camp" class="screen"></section>');
GRP.quest.screens.unshift(["camp","🏕️","Camp"]);SCR2G.camp="quest";BZONE.camp=()=>"jungle";
const _rCamp=render;render=function(){_rCamp();if(screen==="camp")renderCamp()};
const campBadge=()=>{try{ens();if((S.stage||0)<CAMP_UNLOCK)return 0;const st=otoStep();return(campLetterNew()?1:0)+(rivalOpen()?1:0)+(st&&st.p>=st.q.g?1:0)}catch(e){return 0}};
const _bdCamp=badge;badge=function(k){return k==="camp"?campBadge():_bdCamp(k)};
const _tdCamp=todoItems;todoItems=function(){const L=_tdCamp();try{if((S.stage||0)>=CAMP_UNLOCK){if(campLetterNew())L.push({i:"💌",t:"Nouvelle lettre du Dr Elara au camp",js:"go('camp')"});const k=rivalOpen();if(k)L.push({i:"🧢",t:"Kael te défie (manche "+k+")",js:"go('camp')"});const p=campProd();if(p.h>=CAMP_CAP&&(p.stone||p.essence))L.push({i:"🧺",t:"Production du camp pleine",js:"go('camp')"})}}catch(e){}return L};
ACH.push(["cp1","Bâtisseur","Améliorer 10 fois un bâtiment du camp",()=>(S.cnt||{}).campUp||0,10,{tickets:3,essence:20}],["cp2","Rival respecté","Battre Kael dans toutes les manches",()=>(S.camp||{}).rival||0,RIVAL_N,{tickets:8,shards:20}],
 ["cp3","Les carnets d'Oto","Terminer la quête d'Oto",()=>((S.camp||{}).oto||{}).s||0,OTO_Q.length,{essence:60,crystal:5}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Camp de base","Le camp (onglet Quêtes) s'ouvre au niveau "+CAMP_UNLOCK+". Bâtiments : Palissade (+PV), Garde-manger (+ATQ), Carrière et Bibliothèque (production à récolter, jusqu'à "+CAMP_CAP+" h), Couveuse (incubation plus rapide). Habitants : la lettre hebdomadaire du Dr Elara (ton choix change le cadeau), Kael le rival (une manche tous les 10 niveaux d'histoire, avec pari possible), Mira la marchande (offres de la semaine) et Oto (quête en 8 carnets)."]);
