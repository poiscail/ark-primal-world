/* Le monde (0.34) : carte du monde (écran « Monde »), cycle jour/nuit réel (créatures nocturnes, +essence), saisons réelles
   (décor), résumés de chapitre du narrateur, épilogues des régions, fins multiples (choix des lettres d'Elara), histoire de
   chaque espèce (dino niveau 30), énigmes dont les lettres se trouvent dans les fouilles, archives de la Graine (succès),
   journal illustré des découvertes (12 artefacts), cinématique d'introduction en 5 cases, événement du jour sur la carte.
   État : S.wd. */
/* sous un navigateur automatisé (tests, simulations) : toujours le jour, sauf réglage explicite de WD_FORCE */
let WD_FORCE=typeof navigator!=="undefined"&&navigator.webdriver?false:null,WD_SEASON=null;
const wdNight=()=>WD_FORCE!==null?WD_FORCE:(h=>h>=20||h<6)(new Date().getHours());
const wdSeason=()=>WD_SEASON||["hiver","hiver","printemps","printemps","printemps","ete","ete","ete","automne","automne","automne","hiver"][new Date().getMonth()];
const WD_SEASONS={printemps:"🌸 Printemps",ete:"☀️ Été",automne:"🍂 Automne",hiver:"❄️ Hiver"};
const _ensWd=ens;ens=function(){_ensWd();let W=S.wd;if(!W||typeof W!=="object")W=S.wd={};for(const k of ["art","sum","arch"])if(!W[k]||typeof W[k]!=="object")W[k]={};
 if(!(W.rd>=0))W.rd=0;if(!(W.rl>=0))W.rl=0;if(typeof W.ev!=="string")W.ev="";if(!Array.isArray(W.hist))W.hist=[];if(typeof W.intro!=="number")W.intro=(S.stage||0)>0?1:0};
function wdApplyEnv(){try{const h=document.documentElement;h.dataset.season=wdSeason();h.dataset.daytime=wdNight()?"night":"day"}catch(e){}}
wdApplyEnv();setInterval(wdApplyEnv,60000);
/* ---- nuit : créatures nocturnes et essence en plus ---- */
const WD_NIGHT_E=["🦇","🐺","🕷️","👁️"];
const _rbWd=renderBattle;renderBattle=function(){const f0=fight;if(f0&&f0.mx&&!f0.over&&f0.enemies&&f0.wdO!==f0.o){f0.wdO=f0.o;const m=f0.o&&f0.o.mode||"story";f0.night=0;
  if(wdNight()&&/^(story|far|nightmare|dungeon)$/.test(m)&&!(f0.o&&(f0.o.raid||f0.o.daily))&&!f0.raid){f0.night=1;f0.enemies.forEach((e,i)=>{if(i<2&&!e.boss&&e.hp===e.max&&!e._nm&&Math.random()<.4){e.e=WD_NIGHT_E[rnd(WD_NIGHT_E.length)];e.name="Nuit · Ennemi"}})}}
 _rbWd();const f=fight;if(!f||!f.night)return;const st=document.querySelector("#battleArea .battlestage");if(st)st.classList.add("wdnight");
 const ch=document.querySelector("#battleArea .sHud .fchips");if(ch&&!ch.querySelector(".wdn"))ch.insertAdjacentHTML("beforeend",'<span class="chip wdn">🌙 Nuit : +3 🔮</span>')};
const _winWd=win;win=function(){const f=fight,pay=f&&f.night&&!f.wdPaid&&!f.over;if(pay)f.wdPaid=1;_winWd();if(pay){give({essence:3});save()}};
/* ---- résumés du narrateur, épilogues et fins ---- */
const WD_SUM=["Naufragé sur une île absente des cartes, tu as rencontré le Dr Elara et apprivoisé tes premiers dinos. Dans la jungle, le premier gardien est tombé.",
 "Les balises se sont rallumées une à une. La jungle t'a appris la patience : chaque victoire rapproche ta meute de l'obélisque.",
 "Les ruines englouties gardaient des tablettes oubliées. Les spectres fossiles t'ont mis à l'épreuve, mais la meute a tenu bon.",
 "Au cœur des ruines, Elara a compris que l'énergie de l'obélisque réveille les dinosaures… et la fureur des gardiens.",
 "Le volcan gronde. La chaleur a forgé ta meute ; les salamandres et les wyvernes n'ont pas suffi à l'arrêter.",
 "Le gardien de lave est tombé. Kael, ton rival, reconnaît à contrecœur que tu progresses plus vite que lui.",
 "L'obélisque se dresse enfin devant toi. Les créatures du vide surgissent de ses failles comme des souvenirs oubliés.",
 "Les runes de l'obélisque brillent au rythme de la Graine. Elara déchiffre la dernière tablette : la Graine absorbe la fureur.",
 "La corruption recule à chaque combat. L'île semble respirer de nouveau, mais un dernier gardien veille.",
 "Le dernier gardien est vaincu. La Graine s'apaise : l'île est sauvée… pour l'instant. Au nord, un éclat de glace pulse encore."];
Object.assign(LORE,WD_SUM.reduce((o,t,i)=>(o["sum"+(i+1)]=["📜","Le narrateur · chapitre "+(i+1),t],o),{}));
Object.assign(LORE,{epiIle:["🏝️","Épilogue · L'île","Les balises éclairent la côte. Des bateaux répondent enfin au signal.","Tu pourrais partir… mais ta meute, elle, est chez elle ici. Et toi aussi, peut-être."],
 epiNm:["🌑","Épilogue · Le Cauchemar","L'ombre de l'île s'est dissipée. Les dinos corrompus dorment, apaisés.","Il reste des éclats d'ombre au fond des grottes : un rappel que la Graine peut encore souffrir."],
 epiMaze:["🌀","Épilogue · Le Labyrinthe","Les reliques ont retrouvé leur place dans les murs du labyrinthe.","On raconte qu'il change de forme chaque nuit, pour qui ose y retourner."],
 epiSeed:["🌱","Épilogue · La Graine","La Graine originelle ne gronde plus. Elle pousse doucement, une jeune pousse au cœur de la jungle.","Elara y a planté une balise : « Ici est née la vie de l'île. Ici, elle a été sauvée. »"],
 endN:["🌿","Fin · Le gardien de l'île","Tu as toujours choisi la jungle et ses créatures. La meute te suit comme l'un des siens.","Quand les bateaux arrivent, tu restes. Quelqu'un doit veiller sur l'île."],
 endS:["🔬","Fin · Le savant de la balise","Tu as toujours choisi de comprendre. Avec Elara, tu as percé les secrets de la Graine.","Votre laboratoire devient le premier centre d'étude des dinosaures vivants du monde."],
 endL:["👑","Fin · Le dresseur légendaire","Kael est battu, la Graine apaisée : il n'y a plus de défi à ta hauteur sur l'île.","Ta meute et toi partez vers l'archipel volcanique. On murmure que d'autres îles attendent…"]});
const wdEnd=()=>{if((S.stage||0)<100)return null;if(S.hunt&&S.hunt.seed&&S.camp&&S.camp.rival>=10)return"endL";const h=S.wd.hist,n=h.filter(x=>x===0).length,s=h.length-n;return s>n?"endS":"endN"};
const wdEpis=()=>{const L=[];if((S.stage||0)>=100)L.push("epiIle");if(S.nm&&S.nm.stage>=100)L.push("epiNm");if(S.far&&S.far.stage>=(typeof FAR_N!=="undefined"?FAR_N:40)&&LORE.farEnd)L.push("farEnd");if(S.maze&&S.maze.wins>=1)L.push("epiMaze");if(S.hunt&&S.hunt.seed)L.push("epiSeed");return L};
if(typeof campAnswer==="function"){const _caWd=campAnswer;campAnswer=function(i){const was=campLetterNew();_caWd(i);if(was&&!campLetterNew()){S.wd.hist.push(i);save()}}}
const _winWd2=win;win=function(){const f=fight,n=f&&f.o&&f.o.mode==="story"&&!f.raid&&!(f.o.daily)?f.n:0,before=S.stage||0;_winWd2();
 try{if(n&&n%10===0&&(S.stage||0)>=n&&before<n){ens();const k=n/10;S.wd.sum[k]=1;save();toast("📜 Résumé du chapitre "+k+" ajouté au journal",3000)}}catch(e){}};
/* ---- histoire de chaque espèce (débloquée quand un dino de l'espèce atteint le niveau 30) ---- */
const WD_FAMT={T:["chasseur redoutable","prédateur rapide"],C:["cuirassé paisible","herbivore à cornes"],A:["colosse à carapace","marcheur blindé"],G:["géant au long cou","titan des plaines"],F:["planeur des falaises","maître du ciel"],S:["éclaireur agile","pisteur discret"],H:["chanteur des marais","brouteur à crête"],M:["seigneur des profondeurs","nageur des abysses"]};
const WD_ELT={redorb:"les coulées du volcan",blueorb:"les lagunes des ruines",greenorb:"les fougères de la jungle",purpleorb:"l'ombre de l'obélisque",goldorb:"les plateaux ensoleillés"};
function wdSpeciesTale(t){const s=SPEC[t];if(!s)return"";const h=hashS("tale"+t),fam=typeof msFam==="function"?msFam({type:t}):"T",F=WD_FAMT[fam]||WD_FAMT.T,el=WD_ELT[s.element]||"l'île";
 const A=[`On raconte que le ${s.name} est né dans ${el}, bien avant l'arrivée des hommes.`,`Les carnets d'Oto décrivent le ${s.name} comme un ${F[h%2]} que rien n'effraie.`,`Le Dr Elara a observé un ${s.name} veiller toute une nuit sur un nid qui n'était pas le sien.`];
 const B=[`Sa rareté (${String(s.r||"").toLowerCase()}) vient de la Graine : seuls quelques œufs éclosent chaque saison.`,`Ses traces fossiles marquent encore les pierres des ruines.`,`Il reconnaît son dresseur à l'odeur, même après des semaines d'absence.`,`Les anciens habitants de l'île le peignaient sur les murs de l'obélisque.`];
 const C=[`Approche-le calmement : il juge d'abord, puis il protège.`,`Dans la meute, il prend volontiers la tête quand le danger approche.`,`Il adore les fruits de cycas, qu'il partage rarement.`];
 return A[h%3]+" "+B[(h>>3)%4]+" "+C[(h>>6)%3]}
const wdTaleOpen=t=>S.team.some(d=>d.type===t&&d.level>=30);
if(typeof msHowTo==="function"){const _mhWd=msHowTo;msHowTo=function(id){_mhWd(id);try{const d=S.team.find(x=>x.id===id),mb=$$("modalBody");if(!d||!mb)return;const nm=(SPEC[d.type]||sp(d)).name,ok=wdTaleOpen(d.type);
 const box=mb.querySelector(".btns");const h=`<div class="panel wdtale"><b>📜 Histoire de l'espèce</b><div class="tiny">${ok?esc(wdSpeciesTale(d.type)):"🔒 Atteins le niveau 30 avec un "+esc(nm)+" pour la lire."}</div></div>`;if(box)box.insertAdjacentHTML("beforebegin",h);else mb.insertAdjacentHTML("beforeend",h)}catch(e){}}}
/* ---- énigmes (lettres trouvées dans les fouilles) ---- */
const WD_RID=[{q:"Je dors dans l'ambre depuis des millions d'années et je garde le sang des géants. Qui suis-je ?",a:"MOUSTIQUE"},
 {q:"On me cherche dans les ruines, je suis faite de pierre et je parle sans bouche.",a:"TABLETTE"},{q:"Plus je grandis, moins on me voit : je suis la nuit du volcan.",a:"FUMEE"},
 {q:"J'ai trois cornes et je ne recule jamais.",a:"TRICERATOPS"},{q:"Je bats comme un cœur au centre de l'île.",a:"GRAINE"},{q:"Je relie toutes les îles, mais je ne suis pas un pont.",a:"OCEAN"}];
const wdRid=()=>WD_RID[S.wd.rd]||null;
const wdNorm=s=>String(s||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Z]/g,"");
function wdRidShown(){const R=wdRid();if(!R)return"";return R.a.split("").map((c,i)=>i<S.wd.rl?c:"_").join(" ")}
function wdRidAnswer(){const R=wdRid();if(!R)return;askText("Ta réponse à l'énigme","",v=>{if(wdNorm(v)===R.a){S.wd.rd++;S.wd.rl=0;give({tickets:2,essence:20});bump("riddles");save();toast("🔐 Bonne réponse ! +2 🎟️ +20 🔮",3000);sfx&&sfx("win")}else toast("Ce n'est pas ça… cherche d'autres lettres dans les fouilles.");render()},16)}
/* ---- découvertes (12 artefacts) ---- */
const WD_ART=[["🦴","Fémur de sauropode"],["🦷","Dent de tyrannosaure"],["🐚","Ammonite irisée"],["🟠","Moustique dans l'ambre"],["🪶","Plume de ptérosaure"],["🥚","Coquille fossile"],["🗿","Tête de l'obélisque"],["📜","Tablette des runes"],["💎","Cristal chantant"],["🧭","Boussole du naufrage"],["🌋","Pierre de lave figée"],["🌱","Pousse de la Graine"]];
function wdFind(p,src){ens();const miss=WD_ART.map((_,i)=>i).filter(i=>!S.wd.art[i]);if(!miss.length||Math.random()>=p)return null;const i=miss[rnd(miss.length)];S.wd.art[i]=1;save();toast("🔎 Découverte ("+src+") : "+WD_ART[i][0]+" "+WD_ART[i][1],3200);return i}
if(typeof digTap==="function"){const _dtWd=digTap;digTap=function(i){const was=S.dig&&S.dig.open&&S.dig.open[i];_dtWd(i);try{if(!was&&S.dig.open[i]){const R=wdRid();if(R&&S.wd.rl<R.a.length&&Math.random()<.35){S.wd.rl++;save();toast("🔐 Une lettre de l'énigme : "+R.a[S.wd.rl-1],2600)}wdFind(.15,"fouilles");render()}}catch(e){}}}
const _winWd3=win;win=function(){const f=fight,boss=f&&f.enemies&&f.enemies[2]&&f.enemies[2].boss&&!f.over&&!f.raid;_winWd3();if(boss)try{wdFind(.1,"boss")}catch(e){}};
function wdArtClaim(){ens();if(WD_ART.some((_,i)=>!S.wd.art[i])||S.wd.artDone)return;S.wd.artDone=1;give({tickets:5,essence:50,crystal:5});save();toast("🏺 Collection complète : +5 🎟️ +50 🔮 +5 💎",3200);render()}
/* ---- archives de la Graine (une page tous les 5 succès) ---- */
const WD_ARCH=["La Graine n'est pas une plante : c'est une mémoire. Elle se souvient de chaque créature qui a vécu ici.","Les premiers habitants l'appelaient « le cœur qui écoute ».","L'obélisque fut bâti pour l'endormir, pas pour la vénérer.","Quand la Graine souffre, sa fureur s'échappe dans les gardiens.","Les éclats de glace du nord sont des larmes de la Graine, emportées par les courants.","Les dinos dressés avec douceur la calment plus que mille combats.","Une seconde Graine dormirait sous l'archipel volcanique.","Kael descend d'une lignée de gardiens. Il ne le sait pas encore.","Les reliques du labyrinthe sont des fragments d'anciennes balises.","La Graine t'a choisi le jour du naufrage. Ce n'était pas un accident."];
const wdArchN=()=>{try{ens();return Math.min(WD_ARCH.length,Math.floor(Object.keys(S.ach.got||{}).length/5))}catch(e){return 0}};
Object.assign(LORE,WD_ARCH.reduce((o,t,i)=>(o["arch"+(i+1)]=["🌱","Archives de la Graine · page "+(i+1),t],o),{}));
/* ---- journal ---- */
const _ljWd=loreJournal;loreJournal=function(){let h=_ljWd();try{ens();const sums=Object.keys(S.wd.sum).map(Number).sort((a,b)=>a-b),ep=wdEpis(),end=wdEnd(),an=wdArchN(),na=WD_ART.filter((_,i)=>S.wd.art[i]).length;
 h+=`<div class="panel wdjour"><b>📜 Résumés du narrateur</b><div class="muted tiny">${sums.length} / 10 chapitres</div>${sums.map(k=>`<button class="secondary" style="margin-top:4px" onclick="loreShow('sum${k}')">Chapitre ${k}</button>`).join("")||'<div class="tiny muted">Bats le gardien d\'un chapitre pour obtenir son résumé.</div>'}</div>
 <div class="panel wdjour"><b>🏁 Épilogues et fin</b>${ep.map(k=>`<button class="secondary" style="margin-top:4px" onclick="loreShow('${k}')">${LORE[k][0]} ${esc(LORE[k][1])}</button>`).join("")||'<div class="tiny muted">Termine une région (histoire, Cauchemar, Grand Nord, Labyrinthe…) pour lire son épilogue.</div>'}${end?`<button class="blue wide" style="margin-top:6px" onclick="loreShow('${end}')">Ta fin : ${esc(LORE[end][1].replace("Fin · ",""))}</button><div class="tiny muted">Elle dépend de tes réponses aux lettres d'Elara et de tes exploits.</div>`:""}</div>
 <div class="panel wdjour"><b>🌱 Archives de la Graine</b><div class="muted tiny">${an} / ${WD_ARCH.length} pages (une tous les 5 succès)</div>${[...Array(an)].map((_,i)=>`<button class="secondary" style="margin-top:4px" onclick="loreShow('arch${i+1}')">Page ${i+1}</button>`).join("")}</div>
 <div class="panel wdjour"><b>🏺 Découvertes</b><div class="muted tiny">${na} / ${WD_ART.length} artefacts (fouilles et boss)</div><div class="wdart">${WD_ART.map(([i,n],k)=>`<span class="${S.wd.art[k]?"on":""}" title="${S.wd.art[k]?esc(n):"???"}">${S.wd.art[k]?i:"❔"}<small>${S.wd.art[k]?esc(n):"???"}</small></span>`).join("")}</div>${na>=WD_ART.length&&!S.wd.artDone?`<button class="wide blue" onclick="wdArtClaim()">COLLECTION COMPLÈTE : +5 🎟️ +50 🔮</button>`:""}</div>
 <div class="panel wdjour"><b>🎬 Introduction</b><button class="secondary" style="margin-top:4px" onclick="closeModal&&closeModal();wdIntro(true)">Revoir la cinématique</button></div>`}catch(e){}return h};
/* ---- énigme : panneau des fouilles ---- */
if(typeof renderDig==="function"){const _rdWd=renderDig;renderDig=function(){_rdWd();const el=$$("dig");if(!el)return;ens();const R=wdRid();
 el.insertAdjacentHTML("beforeend",`<div class="panel wdrid"><b>🔐 Énigme d'Oto ${R?(S.wd.rd+1)+"/"+WD_RID.length:""}</b>${R?`<div class="tiny">« ${esc(R.q)} »</div><div class="wdletters">${wdRidShown()}</div><div class="tiny muted">Chaque fouille peut révéler une lettre. Tu peux répondre quand tu veux.</div><button class="blue" onclick="wdRidAnswer()">RÉPONDRE</button>`:'<div class="tiny ok">Toutes les énigmes sont résolues !</div>'}</div>`)}}
/* ---- cinématique d'introduction ---- */
const WD_INTRO=[{bg:"linear-gradient(#0b1630,#1d2f55)",e:["⛈️","🚢","🌊"],t:"Une nuit de tempête. Ton bateau lutte contre des vagues immenses…"},{bg:"linear-gradient(#1d2f55,#2d4a6b)",e:["💥","🪨","🛟"],t:"Les récifs ! La coque se brise. Tout devient noir."},
 {bg:"linear-gradient(#6fb3d8,#e8d79b)",e:["🏝️","👣","🌴"],t:"Tu te réveilles sur une plage inconnue. Des empreintes géantes mènent vers la jungle."},{bg:"linear-gradient(#1f4a2a,#0f2a14)",e:["🥚","✨","🌿"],t:"Dans un nid abandonné, un œuf brille d'une lumière étrange…"},
 {bg:"linear-gradient(#24324f,#0f1830)",e:["🧑‍🔬","📡","🦖"],t:"« Tu es réveillé ! Je suis le Dr Elara. Bienvenue sur l'île… et prends soin de ce petit. »"}];
let wdIntroI=0;
function wdIntro(force){ens();if(!force&&(S.wd.intro||PREFS.lore===false||(navigator.webdriver&&!window.__forceLore)))return;wdIntroI=0;S.wd.intro=1;save();if(!document.getElementById("wdIntro"))document.body.insertAdjacentHTML("beforeend",'<div id="wdIntro" class="wdintro"></div>');wdIntroDraw()}
function wdIntroDraw(){const el=document.getElementById("wdIntro");if(!el)return;const P=WD_INTRO[wdIntroI];if(!P){el.remove();return}
 el.innerHTML=`<div class="wdpanel" style="background:${P.bg}"><div class="wdemo">${P.e.map((x,i)=>`<span style="--i:${i}">${x}</span>`).join("")}</div><p>${esc(P.t)}</p><div class="wddots">${WD_INTRO.map((_,i)=>`<i class="${i===wdIntroI?"on":""}"></i>`).join("")}</div>
  <div class="btns"><button class="secondary" onclick="wdIntroI=99;wdIntroDraw()">PASSER</button><button class="blue" onclick="wdIntroI++;wdIntroDraw()">${wdIntroI<WD_INTRO.length-1?"SUIVANT ▶":"COMMENCER"}</button></div></div>`}
setTimeout(()=>{try{wdIntro(false)}catch(e){}},300);
/* couper les dialogues ferme aussi l'intro (et le test de lancement de l'application les coupe avant de cliquer) */
const _spWd=setPref;setPref=function(k,v){_spWd(k,v);if(k==="lore"&&v===false){const el=document.getElementById("wdIntro");if(el)el.remove()}};
/* ---- événement du jour sur la carte d'histoire ---- */
const WD_EV=[{i:"🛒",n:"Marchand ambulant",d:"Un marchand propose un ticket contre 500 pierres.",a:[["Acheter",{tickets:1},{stone:500}],["Passer son chemin",null,null]]},
 {i:"🩹",n:"Dino blessé",d:"Un jeune dino s'est blessé dans les fougères.",a:[["Le soigner (10 🔮)",{amber:2,bone:6},{essence:10}],["Prévenir Elara",{essence:5},null]]},
 {i:"🧰",n:"Coffre échoué",d:"Un coffre du naufrage s'est échoué sur la rive.",a:[["L'ouvrir",{stone:300,hide:4},null],["Le rapporter au camp",{shards:3},null]]},
 {i:"🥚",n:"Œuf perdu",d:"Un œuf tiède roule hors d'un nid.",a:[["Le remettre au nid",{essence:15},null],["L'apporter au Nid d'élevage",{amber:3},null]]}];
const wdEvToday=()=>{if((S.stage||0)<5)return null;const h=dayHash("wdev"+todayK());return{E:WD_EV[h%WD_EV.length],n:1+(h>>4)%Math.min(100,S.stage)}};
function wdEvOpen(){const x=wdEvToday();if(!x||S.wd.ev===todayK())return;const E=x.E;openModal(`<div class="cletter"><div class="clhead">${E.i} <b>${esc(E.n)}</b></div><p>${esc(E.d)}</p><div class="clans">${E.a.map(([t,G,C],i)=>`<button class="${i?"secondary":"blue"}" onclick="wdEvDo(${i})">${esc(t)}<small>${G?fmt(G):"rien"}${C?" · coûte "+fmt(C):""}</small></button>`).join("")}</div></div>`)}
function wdEvDo(i){const x=wdEvToday();if(!x||S.wd.ev===todayK())return;const[,G,C]=x.E.a[i]||[];if(C){const ok=Object.entries(C).every(([k,v])=>(MATS[k]?S.mat[k]:S[k])>=v);if(!ok){toast("Il te faut "+fmt(C)+".");return}Object.entries(C).forEach(([k,v])=>{if(MATS[k])S.mat[k]-=v;else S[k]-=v})}
 S.wd.ev=todayK();if(G)give(G);save();closeModal();toast(x.E.i+" "+x.E.n+(G?" : "+fmt(G):""),2600);render()}
const _rsWd=renderStory;renderStory=function(){_rsWd();if(typeof nmView!=="undefined"&&nmView)return;const c=$$("chapters"),map=c&&c.querySelector(".smap"),x=wdEvToday();if(!map||!x||typeof mapCh!=="number"||Math.floor((x.n-1)/10)!==mapCh)return;
 const i=(x.n-1)%10,xs=[50,24,44,74,56,26,42,72,66,42],done=S.wd.ev===todayK();map.insertAdjacentHTML("beforeend",`<button class="wdev ${done?"done":""}" style="left:${Math.max(6,xs[i]-9)}%;top:${92-i*9.2-4}%" ${done?"disabled":""} onclick="wdEvOpen()" title="${esc(x.E.n)}">${done?"✔️":x.E.i}</button>`)};
/* ---- carte du monde ---- */
const WD_REG=[{k:"story",i:"🏝️",n:"L'île",x:44,y:56,p:()=>(S.stage||0)/100,go:"story"},{k:"nm",i:"🌑",n:"Le Cauchemar",x:30,y:70,p:()=>((S.nm&&S.nm.stage)||0)/100,go:"story",need:10,js:"nmView=true;"},
 {k:"far",i:"🧊",n:"Le Grand Nord",x:52,y:16,p:()=>((S.far&&S.far.stage)||0)/(typeof FAR_N!=="undefined"?FAR_N:40),go:"far",need:typeof FAR_UNLOCK!=="undefined"?FAR_UNLOCK:50},
 {k:"maze",i:"🌀",n:"Le Labyrinthe",x:66,y:46,p:()=>Math.min(1,((S.maze&&S.maze.wins)||0)/3),go:"maze",need:20},{k:"camp",i:"🏕️",n:"Le camp",x:40,y:44,p:()=>{try{return Object.values(S.camp.b).reduce((a,b)=>a+b,0)/25}catch(e){return 0}},go:"camp",need:3},
 {k:"arch",i:"🌋",n:"L'archipel volcanique",x:80,y:76,p:()=>0,soon:1}];
function renderWorld(){const el=$$("world");if(!el)return;ens();const st=S.stage||0;
 el.innerHTML=`<div class="banner"><div class="eyebrow">CARTE DU MONDE · ${WD_SEASONS[wdSeason()]} · ${wdNight()?"🌙 nuit":"☀️ jour"}</div><h1>Le monde</h1><p>Toutes les régions découvertes depuis le naufrage. Clique sur une région pour t'y rendre.</p></div>
 <div class="wdmap"><svg viewBox="0 0 100 100" preserveAspectRatio="none" class="wdsea"><defs><radialGradient id="wdg" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#1d5f86"/><stop offset="1" stop-color="#0a2236"/></radialGradient></defs><rect width="100" height="100" fill="url(#wdg)"/>
  <path d="M30 50 Q36 38 48 42 Q60 40 60 54 Q58 66 46 66 Q32 66 30 50Z" fill="#3f8a3a" stroke="#e8d79b" stroke-width="1.2"/><path d="M40 6 Q52 2 66 8 Q70 20 56 24 Q42 24 40 6Z" fill="#dfeaf2" stroke="#9fc4dc" stroke-width="1"/>
  <path d="M74 70 Q80 64 88 70 Q90 80 82 84 Q74 82 74 70Z" fill="#6b3a2a" stroke="#ff9d3c" stroke-width="1" opacity=".7"/><path d="M62 42 Q70 38 72 48 Q68 54 62 50Z" fill="#4a3d6b"/>
  <path d="M44 56 Q48 36 52 16 M44 56 Q60 64 80 76 M44 56 Q55 50 66 46" stroke="#fff6" stroke-width=".5" stroke-dasharray="1.5 1.5" fill="none"/></svg>
  ${WD_REG.map(R=>{const lock=R.soon||st<(R.need||0),p=Math.round(R.p()*100);return `<button class="wdreg ${lock?"lock":""}" style="left:${R.x}%;top:${R.y}%" ${lock?"disabled":""} onclick="${R.js||""}go('${R.go}')"><span>${R.i}</span><b>${R.n}</b><small>${R.soon?"bientôt":lock?"🔒 histoire "+R.need:p+" %"}</small></button>`}).join("")}</div>`}
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="world" class="screen"></section>');
GRP.adv.screens.unshift(["world","🌍","Monde"]);SCR2G.world="adv";SUBS.unshift(["world","🌍","Monde"]);ADV.add("world");BZONE.world=()=>"jungle";
const _rWd=render;render=function(){_rWd();if(screen==="world")renderWorld()};
ACH.push(["wd1","Archéologue","Trouver les 12 découvertes",()=>WD_ART.filter((_,i)=>((S.wd||{}).art||{})[i]).length,12,{tickets:3}],["wd2","Esprit vif","Résoudre 3 énigmes",()=>(S.wd||{}).rd||0,3,{essence:30}],["wd3","Oiseau de nuit","Gagner un combat de nuit",()=>(S.cnt||{}).nightW||0,1,{essence:15}]);
const _winWd4=win;win=function(){const f=fight,n=f&&f.night&&!f.over;_winWd4();if(n)bump("nightW")};
if(typeof GUIDE!=="undefined")GUIDE.push(["Le monde","La carte du monde (Aventure > Monde) relie toutes les régions. Le jeu suit l'heure et la saison réelles : la nuit (20 h - 6 h), des créatures nocturnes apparaissent et chaque victoire donne +3 🔮 ; le décor change avec la saison. Le journal réunit les résumés de chapitre, les épilogues, ta fin (selon tes réponses aux lettres d'Elara), les archives de la Graine (une page tous les 5 succès) et les 12 découvertes (fouilles et boss). Les fouilles révèlent aussi les lettres des énigmes d'Oto. Chaque jour, un événement apparaît sur la carte de l'histoire."]);
