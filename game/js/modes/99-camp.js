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
/* scène du camp (0.42) : sol, clairière, cabanes dessinées (taille selon le niveau), feu de camp éclairant, fumée,
   habitants avec ombre et nom, dinos répartis sur le sol (positions fixes si les animations sont réduites), lucioles la nuit */
const CAMP_POS={pal:[9,34],cui:[28,44],car:[52,48],bib:[72,44],nid:[88,30]};
function campHut(k){const W="#6b4a2b",D="#4a321c",L="#8a6238";
 if(k==="pal")return `<svg viewBox="0 0 120 80">${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${6+i*14} 80V${22+(i%2)*6}l7-12 7 12V80z" fill="${i%2?W:L}" stroke="${D}" stroke-width="2"/>`).join("")}<rect x="2" y="40" width="116" height="7" rx="3" fill="${D}"/><rect x="2" y="62" width="116" height="7" rx="3" fill="${D}"/></svg>`;
 if(k==="cui")return `<svg viewBox="0 0 120 90"><rect x="18" y="40" width="84" height="50" fill="${W}" stroke="${D}" stroke-width="3"/><path d="M8 44 60 6l52 38z" fill="#c79a3e" stroke="#7d5a1c" stroke-width="3"/><path d="M20 36h80M30 28h60M42 19h36" stroke="#a37a2a" stroke-width="3"/><rect x="50" y="58" width="22" height="32" rx="10" fill="#2a1a0c"/><path d="M84 46v12" stroke="#2a1a0c" stroke-width="2"/><ellipse cx="84" cy="64" rx="7" ry="9" fill="#b84a3a"/><circle cx="84" cy="72" r="3" fill="#f1e3c8"/></svg>`;
 if(k==="car")return `<svg viewBox="0 0 120 80"><path d="M4 80 22 40l18-10 16 14 18-22 22 12 20 46z" fill="#7b8794" stroke="#4a535e" stroke-width="3"/><path d="M30 80 44 56l18 4 14 20z" fill="#9aa6b2" stroke="#4a535e" stroke-width="2"/><path d="M60 30l8 6M84 40l8 4M24 52l6 4" stroke="#5c6672" stroke-width="3"/><path d="M92 74 70 46" stroke="${W}" stroke-width="5" stroke-linecap="round"/><path d="M62 50q8-12 20-6" fill="none" stroke="#cfd6de" stroke-width="5" stroke-linecap="round"/></svg>`;
 if(k==="bib")return `<svg viewBox="0 0 120 92"><rect x="16" y="38" width="88" height="54" fill="${L}" stroke="${D}" stroke-width="3"/><path d="M16 50h88M16 64h88M16 78h88" stroke="${W}" stroke-width="2"/><path d="M6 42 60 4l54 38z" fill="#3e6b8a" stroke="#22465e" stroke-width="3"/><rect x="28" y="52" width="22" height="18" fill="#ffd77a" stroke="${D}" stroke-width="3" class="cwin"/><path d="M39 52v18M28 61h22" stroke="${D}" stroke-width="2"/><rect x="66" y="58" width="22" height="34" fill="#2a1a0c"/><rect x="54" y="10" width="12" height="16" fill="#7b8794"/></svg>`;
 return `<svg viewBox="0 0 120 70"><ellipse cx="60" cy="50" rx="56" ry="18" fill="#7a5530" stroke="#4a321c" stroke-width="3"/><ellipse cx="60" cy="44" rx="44" ry="10" fill="#3a2614"/><path d="M8 48q20 8 40 0M50 56q20-8 40 2M70 44q20 8 44 2" stroke="#a37a4a" stroke-width="3" fill="none"/><ellipse cx="46" cy="36" rx="10" ry="13" fill="#f3ead8" stroke="#bfae90" stroke-width="2"/><ellipse cx="66" cy="34" rx="10" ry="13" fill="#d9ecff" stroke="#9db6cc" stroke-width="2"/><ellipse cx="82" cy="38" rx="8" ry="11" fill="#f6dfe6" stroke="#c9a8b2" stroke-width="2"/></svg>`}
function campScene(){const t=S.team.slice(0,6),ks=Object.keys(CAMP_B),pos=CAMP_POS,st=i=>10+((i*37)%78);
 return `<div class="campscene cs2">${typeof sceneHTML==="function"?sceneHTML("jungle"):""}
  <svg class="cground" viewBox="0 0 1000 400" preserveAspectRatio="none"><defs><linearGradient id="cgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f7a3a"/><stop offset="1" stop-color="#1d3d1f"/></linearGradient><radialGradient id="cgD" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#9a7448"/><stop offset=".7" stop-color="#7a5a36"/><stop offset="1" stop-color="#7a5a3600"/></radialGradient></defs>
   <path d="M0 175Q160 150 330 168T660 160T1000 172V400H0z" fill="url(#cgG)"/><ellipse cx="500" cy="318" rx="380" ry="74" fill="url(#cgD)"/><path d="M470 400Q480 360 500 330Q520 360 540 400z" fill="#8a6640" opacity=".7"/>
   ${[60,140,230,780,860,950,330,690].map((x,i)=>`<path d="M${x} ${200+(i%3)*40}l6-16 4 16 6-12 3 12" fill="none" stroke="#5fa04f" stroke-width="3"/>`).join("")}</svg>
  <div class="cglow"></div>
  ${ks.map(k=>{const l=campLv(k);return `<div class="cbld ${l?"":"off"}" style="left:${pos[k][0]}%;bottom:${pos[k][1]}%;--s:${(.85+Math.min(l,10)*.03).toFixed(2)}"><div class="chut">${campHut(k)}</div><i class="cshadow"></i><small>${CAMP_B[k].i} ${CAMP_B[k].n}${l?` <b>niv. ${l}</b>`:" · à construire"}</small></div>`}).join("")}
  <div class="cfire"><i class="cshadow"></i><svg viewBox="0 0 80 40" class="clogs"><path d="M6 34 70 18M10 18l64 16" stroke="#5a3a1c" stroke-width="9" stroke-linecap="round"/><circle cx="40" cy="27" r="9" fill="#ff8a2a" opacity=".8"/></svg><span class="cflame">🔥</span>${[0,1,2,3,4].map(i=>`<i class="cspark" style="--x:${(i*13)%30-15}px;--dl:-${(i*.37).toFixed(2)}s"></i>`).join("")}<i class="csmoke"></i><i class="csmoke b"></i></div>
  ${[["Dr Elara","🧑‍🔬",40,18],["Mira","🧕",63,20],["Oto","👴",21,14]].map(([n,e,x,y])=>`<div class="cchar" style="left:${x}%;bottom:${y}%" title="${n}"><i class="cshadow"></i><span>${e}</span><small>${n}</small></div>`).join("")}
  ${t.map((d,i)=>`<div class="cwalk" style="--d:${14+i*3}s;--y:${3+(i%3)*5}%;--x:${st(i)}%;--dl:-${((14+i*3)*(st(i)-6)/78).toFixed(1)}s"><i class="cshadow"></i><span class="cbob">${PREFS.art==="svg"&&typeof portrait==="function"?`<span class="pt">${portrait(d.type,true)}</span>`:art(sp(d).e)}</span></div>`).join("")}
  ${[0,1,2,3,4,5,6,7].map(i=>`<i class="cfly" style="left:${(i*29+7)%96}%;top:${20+(i*17)%45}%;--dl:-${i*.8}s"></i>`).join("")}</div>`}
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
