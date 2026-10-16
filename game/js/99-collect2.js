/* Collection II (0.36) : couleurs (teintes) et accessoires cosmétiques par dino, galerie 3D (portrait qui suit la souris),
   espèces de saison (boutique saisonnière), évolutions ramifiées (2 choix) et par fossile rare, dinos mythiques obtenus
   par quêtes, albums par famille, fiche de taille réelle, faits scientifiques, mode photo, portraits animés, cris de famille. */
const _ensCl2=ens;ens=function(){_ensCl2();let C=S.col2;if(!C||typeof C!=="object")C=S.col2={};if(!C.acc||typeof C.acc!=="object")C.acc={};if(!C.alb||typeof C.alb!=="object")C.alb={};if(!C.myth||typeof C.myth!=="object")C.myth={};if(!(S.fossil>=0))S.fossil=0};
if(typeof XNAME!=="undefined")XNAME.fossil="fossiles rares";
/* ---- couleurs et accessoires ---- */
const SKINS2=[["Naturel",0],["Ambre",35],["Émeraude",95],["Lagon",160],["Nuit",220],["Rubis",320]];
const ACCS=[["collar","📿","Collier"],["helmet","⛑️","Casque"],["saddle","🪑","Selle"],["crown","👑","Couronne"],["scarf","🧣","Écharpe"],["glasses","🕶️","Lunettes"]];
const ACC_COST=30;
const c2Style=d=>d&&d.skin?` style="filter:hue-rotate(${SKINS2[d.skin][1]}deg)"`:"";
const c2Acc=d=>{const a=d&&d.acc&&ACCS.find(x=>x[0]===d.acc);return a?`<span class="c2acc">${a[1]}</span>`:""};
function c2Wrap(d,inner){return `<span class="c2pt"${c2Style(d)}>${inner}</span>${c2Acc(d)}`}
const _cardCl2=card;card=function(d,a){let h=_cardCl2(d,a);if(!d||!S.team.some(x=>x.id===d.id))return h;
 h=h.replace(/<div class="bigicon">([\s\S]*?)<\/div>/,(m,inner)=>`<div class="bigicon c2big" onclick="c2Cry(${d.id})" title="Touche pour l'entendre">${c2Wrap(d,inner)}</div>`);
 if(a===false)return h;const i=h.lastIndexOf("</div>");return h.slice(0,i)+`<div class="btns c2btn"><button class="secondary" onclick="c2Gallery(${d.id})">🔍 GALERIE & STYLE</button></div>`+h.slice(i)};
/* en combat : couleurs et accessoires des dinos de l'équipe */
const _rbCl2=renderBattle;renderBattle=function(){_rbCl2();try{const t=T3();document.querySelectorAll("#battleArea .sTeam .sFig").forEach((el,k)=>{const d=t[k];if(!d)return;const pt=el.querySelector(".pt,svg");if(pt&&d.skin)pt.style.filter=`hue-rotate(${SKINS2[d.skin][1]}deg)`;if(d.acc&&!el.querySelector(".c2acc"))el.insertAdjacentHTML("beforeend",c2Acc(d))})}catch(e){}};
function c2SetSkin(id,i){const d=S.team.find(x=>x.id===id);if(!d)return;d.skin=i||0;if(!d.skin)delete d.skin;save();c2Gallery(id);render()}
function c2SetAcc(id,k){ens();const d=S.team.find(x=>x.id===id);if(!d)return;if(k&&!S.col2.acc[k]){if((S.essence||0)<ACC_COST){toast("Débloquer cet accessoire coûte "+ACC_COST+" 🔮.");return}S.essence-=ACC_COST;S.col2.acc[k]=1;toast("Accessoire débloqué pour tous tes dinos !")}
 if(k)d.acc=k;else delete d.acc;save();c2Gallery(id);render()}
/* ---- galerie 3D ---- */
function c2Gallery(id){ens();const d=S.team.find(x=>x.id===id);if(!d)return;const s=SPEC[d.type];
 openModal(`<h3 style="margin:0 0 4px">🔍 ${esc(d.nick||s.name)}</h3><div class="c2stage" id="c2stage" onmousemove="c2Tilt(event)" onmouseleave="c2Tilt(null)"><div class="c2bg"></div><div class="c2fig" id="c2fig">${c2Wrap(d,PREFS.art==="svg"?`<span class="pt">${portrait(d.type)}</span>`:art(s.e))}</div><div class="c2shine"></div></div>
 <div class="tiny muted">Bouge la souris sur le portrait. Touche-le pour entendre son cri.</div>
 <b>Couleur</b><div class="c2row">${SKINS2.map(([n,h],i)=>`<button class="${(d.skin||0)===i?"blue":"secondary"}" onclick="c2SetSkin(${d.id},${i})"><i style="background:hsl(${(130+h)%360} 60% 50%)"></i>${n}</button>`).join("")}</div>
 <b>Accessoire</b> <span class="tiny muted">(${ACC_COST} 🔮 pour débloquer chacun, ensuite gratuit pour tous)</span><div class="c2row"><button class="${d.acc?"secondary":"blue"}" onclick="c2SetAcc(${d.id},'')">Aucun</button>${ACCS.map(([k,i,n])=>`<button class="${d.acc===k?"blue":"secondary"}" onclick="c2SetAcc(${d.id},'${k}')">${i} ${n}${S.col2.acc[k]?"":" 🔒"}</button>`).join("")}</div>
 ${c2SizeHTML(d)}${c2FactsHTML(d)}<div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button></div>`);const f=$$("c2fig");if(f)f.onclick=()=>c2Cry(d.id)}
function c2Tilt(e){const st=$$("c2stage"),f=$$("c2fig");if(!st||!f)return;if(!e){f.style.transform="";st.style.setProperty("--mx","50%");st.style.setProperty("--my","50%");return}const r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
 f.style.transform=`rotateY(${x*30}deg) rotateX(${-y*24}deg) translateZ(30px)`;st.style.setProperty("--mx",(50+x*60)+"%");st.style.setProperty("--my",(50+y*60)+"%")}
/* ---- cris de famille (synthétisés) ---- */
const CRY={T:[220,90,"sawtooth",.45],C:[140,70,"square",.4],A:[110,60,"triangle",.5],G:[180,120,"triangle",.35],F:[880,1400,"sine",.35],S:[70,45,"sine",.8],H:[330,520,"triangle",.5],M:[260,140,"sine",.6],W:[160,80,"sawtooth",.6],I:[1800,2600,"square",.18]};
let c2Ac=null;
function c2Cry(id){try{const d=S.team.find(x=>x.id===id);if(!d)return;const el=document.querySelector(`.cocard[data-id="${id}"] .c2big`);if(el){el.classList.remove("c2shake");void el.offsetWidth;el.classList.add("c2shake")}
 if(PREFS.sound===false)return;const[f0,f1,w,du]=CRY[msFam(d)]||CRY.T;c2Ac=c2Ac||new (window.AudioContext||window.webkitAudioContext)();const ac=c2Ac,o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime,v=Math.min(.25,.3*((PREFS.vol??70)/100));
 o.type=w;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+du*.7);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+du);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+du+.05);window.__cry=(window.__cry||0)+1}catch(e){}}
/* ---- taille réelle et faits scientifiques ---- */
const SIZE_FAM={T:8,C:7,A:6,G:8,F:7,S:24,H:9,M:12,W:4,I:1.6};
const SIZE_SP={rex:12.3,raptor:1.8,compsog:1,trike:9,stego:9,ptera:7,spino:15,mosa:15,ankylo:7,diplo:26,brachio:25,argento:35,giga:13,dilopho:7,quetzal:11,carnota:8,mammoth:5.5,smilo:2.2,megalo:3,megath:6,cbear:3.5,arthrop:2.5,meganeu:.7,titanom:.06,mantis:.3};
const c2Size=d=>SIZE_SP[d.type]||Math.round(SIZE_FAM[msFam(d)]*(.7+(hashS(d.type)%60)/100)*10)/10;
function c2SizeHTML(d){const m=c2Size(d),hu=1.8,mx=Math.max(m,hu),w=v=>Math.max(3,v/mx*100);
 return `<div class="panel c2size"><b>📏 Taille réelle : ${String(m).replace(".",",")} m</b><div class="c2bars"><div><span style="width:${w(m)}%">${art(SPEC[d.type].e)}</span><small>${esc(SPEC[d.type].name)}</small></div><div><span class="hu" style="width:${w(hu)}%">🧍</span><small>Humain (1,8 m)</small></div></div></div>`}
const FACT_FAM={T:["Les théropodes marchaient sur deux pattes ; les oiseaux d'aujourd'hui sont leurs descendants.","Leurs os étaient creux, comme ceux des oiseaux, ce qui les allégeait."],
 C:["Les cératopsiens avaient un bec comme celui d'un perroquet pour couper les plantes dures.","Leur collerette servait peut-être à se reconnaître entre eux autant qu'à se défendre."],
 A:["Les ankylosaures étaient couverts de plaques osseuses appelées ostéodermes.","Certains avaient une massue au bout de la queue, assez solide pour briser un os."],
 G:["Les plaques du dos des stégosaures étaient parcourues de vaisseaux sanguins.","Leur cerveau était à peine plus gros qu'une noix."],
 F:["Les ptérosaures n'étaient pas des dinosaures, mais leurs proches cousins volants.","Leur aile était une membrane de peau tendue par un quatrième doigt très long."],
 S:["Les sauropodes étaient les plus grands animaux terrestres de tous les temps.","Ils avalaient des pierres (gastrolithes) qui aidaient peut-être à broyer les plantes."],
 H:["Les hadrosaures, ou dinosaures à bec de canard, avaient des centaines de dents en rangées.","Certains avaient une crête creuse qui servait de caisse de résonance."],
 M:["Les reptiles marins comme les mosasaures n'étaient pas des dinosaures.","Les ichtyosaures donnaient naissance à des petits vivants, sans pondre d'œufs."],
 W:["Les mammouths laineux vivaient encore il y a environ 4 000 ans sur l'île Wrangel.","Les mammifères préhistoriques géants ont vécu bien après la disparition des dinosaures."],
 I:["Il y a 300 millions d'années, l'air contenait plus d'oxygène : les insectes pouvaient devenir géants.","Arthropleura, un mille-pattes géant, mesurait jusqu'à 2,5 mètres."]};
const FACT_SP={rex:"Le Tyrannosaure avait une des morsures les plus puissantes jamais mesurées chez un animal terrestre.",raptor:"Le vrai Velociraptor avait la taille d'une dinde et portait des plumes.",
 trike:"Le Tricératops pouvait peser autant que deux éléphants.",stego:"Le Stégosaure vivait 80 millions d'années avant le Tyrannosaure.",spino:"Le Spinosaure était probablement semi-aquatique et chassait les poissons.",
 ptera:"Le Ptéranodon n'avait pas de dents : son nom veut dire « aile sans dent ».",mosa:"Le Mosasaure avait une double rangée de dents sur le palais.",ankylo:"L'Ankylosaure avait même des paupières blindées.",
 brachio:"Le Brachiosaure tenait la tête à plus de 12 mètres de haut.",argento:"L'Argentinosaure pesait peut-être plus de 70 tonnes.",compsog:"Le Compsognathus avait la taille d'une poule.",
 mammoth:"Le mammouth laineux avait une couche de graisse de 10 cm et de petites oreilles pour garder la chaleur.",smilo:"Les canines du Smilodon mesuraient jusqu'à 28 cm.",megath:"Le Mégathérium, paresseux géant, pouvait se dresser à 6 mètres de haut.",
 meganeu:"Meganeura avait une envergure de 70 cm : la plus grande « libellule » connue.",cbear:"L'ours des cavernes était surtout végétarien."};
function c2FactsHTML(d){const fam=FACT_FAM[msFam(d)]||[],sp=FACT_SP[d.type];const L=[sp,...fam].filter(Boolean).slice(0,3);return L.length?`<div class="panel c2facts"><b>🔬 Le saviez-vous ?</b>${L.map(x=>`<div class="tiny">• ${esc(x)}</div>`).join("")}</div>`:""}
if(typeof msHowTo==="function"){const _mhCl2=msHowTo;msHowTo=function(id){_mhCl2(id);try{const d=S.team.find(x=>x.id===id),mb=$$("modalBody");if(!d||!mb)return;const box=mb.querySelector(".btns");const h=c2SizeHTML(d)+c2FactsHTML(d);if(box)box.insertAdjacentHTML("beforebegin",h);else mb.insertAdjacentHTML("beforeend",h)}catch(e){}}}
/* ---- espèces de saison ---- */
const SEASONAL=[["pumpkin","Citrouillosaure","🎃","Épique","redorb",205,37,22,"burn","crit","automne",["T",{fx:"flame",hs:1.05}]],["frosty","Givrosaure","⛄","Épique","blueorb",215,33,26,"stun","tank","hiver",["C",{fx:"ice"}]],
 ["blossom","Fleurosaure","🌸","Épique","greenorb",200,32,24,"heal","regen","printemps",["H",{fx:"tree"}]],["sunny","Solarosaure","🌞","Épique","goldorb",205,36,22,"focus","swift","ete",["F",{fx:"sun"}]]];
SEASONAL.forEach(a=>{const k=a[0];if(Object.values(SPEC).some(s=>s.e===a[2]&&s!==SPEC[k]))return;const o={name:a[1],e:a[2],r:a[3],element:a[4],hp:a[5],atk:a[6],def:a[7],sk:a[8],pa:a[9],ex:1,season:a[10]};
 if(!SPEC_DEFAULT[k])SPEC_DEFAULT[k]={...o};if(!SPEC[k])SPEC[k]={...o};Object.assign(SPEC[k],{ex:1,season:a[10]});PORT[k]=a[11]});
const SEAS_COST={on:120,off:300};
const seasCost=k=>typeof wdSeason==="function"&&SPEC[k].season===wdSeason()?SEAS_COST.on:SEAS_COST.off;
function seasBuy(k){ens();if(!SPEC[k]||!SPEC[k].season)return;const c=seasCost(k);if((S.shards||0)<c){toast("Il faut "+c+" 🧩.");return}S.shards-=c;S.team.push({id:S.nextId++,type:k,level:1,xp:0,v:"normal"});bump("seasonal");save();toast(SPEC[k].e+" "+SPEC[k].name+" rejoint ta meute !",3000);render()}
function seasHTML(){const cur=typeof wdSeason==="function"?wdSeason():"";return `<div class="panel c2seas"><b>🍂 Boutique saisonnière</b><div class="tiny muted">Chaque saison, une espèce à prix réduit (${SEAS_COST.on} 🧩). Les autres restent disponibles toute l'année à ${SEAS_COST.off} 🧩.</div><div class="c2seasg">${SEASONAL.filter(a=>SPEC[a[0]]).map(a=>{const k=a[0],on=a[10]===cur;return `<div class="${on?"on":""}">${art(SPEC[k].e)}<b>${esc(SPEC[k].name)}</b><small>${on?"de saison !":"hors saison"}</small><button class="${on?"blue":"secondary"}" onclick="seasBuy('${k}')">${seasCost(k)} 🧩</button></div>`}).join("")}</div></div>`}
if(typeof renderEvents==="function"){const _reCl2=renderEvents;renderEvents=function(){_reCl2();const el=$$("events");if(el)el.insertAdjacentHTML("beforeend",seasHTML())}}
/* ---- dinos mythiques (quêtes) ---- */
const MYTHS=[["seedwyrm","Wyrm de la Graine","🪴","greenorb",300,56,34,"heal","regen",["G",{fx:"tree",sc:1.1}],"Apaiser la Graine originelle et finir l'histoire",()=>!!(S.hunt&&S.hunt.seed)&&(S.stage||0)>=100],
 ["abyssking","Roi des Abysses","🪸","blueorb",310,58,32,"drain","leech",["M",{fx:"moon",sc:1.1}],"Terminer les 5 nouvelles régions",()=>((S.cnt||{}).regions||0)>=5],
 ["firstfang","Premier Croc","🗡️","redorb",290,62,28,"execute","firstblood",["T",{fx:"crown",hs:1.2}],"Battre Kael dans ses 10 manches et vaincre les 10 boss secrets",()=>((S.camp||{}).rival||0)>=10&&Object.keys((S.hunt||{}).sec||{}).length>=10]];
MYTHS.forEach(a=>{const k=a[0];if(Object.values(SPEC).some(s=>s.e===a[2]&&s!==SPEC[k]))return;const o={name:a[1],e:a[2],r:"Légendaire",element:a[3],hp:a[4],atk:a[5],def:a[6],sk:a[7],pa:a[8],ex:1,myth:1};
 if(!SPEC_DEFAULT[k])SPEC_DEFAULT[k]={...o};if(!SPEC[k])SPEC[k]={...o};Object.assign(SPEC[k],{ex:1,myth:1});PORT[k]=a[9]});
function mythClaim(k){ens();const M=MYTHS.find(a=>a[0]===k);if(!M||S.col2.myth[k]||!M[11]())return;S.col2.myth[k]=1;S.team.push({id:S.nextId++,type:k,level:30,xp:0,v:"normal"});bump("myths");save();toast("🌟 Dino MYTHIQUE : "+SPEC[k].name+" rejoint ta meute !",4000);try{evoFx(SPEC[k],SPEC[k])}catch(e){}render()}
const _cardCl2b=card;card=function(d,a){let h=_cardCl2b(d,a);if(d&&SPEC[d.type]&&SPEC[d.type].myth)h=h.replace(/<span class="rarity [^"]*">Légendaire<\/span>/,'<span class="rarity myth">Mythique</span>').replace('class="cocard','class="mythcard cocard');return h};
/* ---- albums par famille ---- */
const ALB_R={tickets:5,essence:40,shards:15};
function albList(){const own=new Set(S.team.map(d=>d.type));const fams=[...new Set(Object.keys(SPEC).filter(k=>!SPEC[k].ex).map(k=>(PORT[k]||["T"])[0]))].filter(f=>FAMNAME[f]);
 return fams.map(f=>{const L=Object.keys(SPEC).filter(k=>!SPEC[k].ex&&(PORT[k]||["T"])[0]===f);return{f,L,n:L.filter(k=>own.has(k)).length}})}
function albClaim(f){ens();const A=albList().find(x=>x.f===f);if(!A||A.n<A.L.length||S.col2.alb[f])return;S.col2.alb[f]=1;give(ALB_R);bump("albums");save();toast("📚 Album des "+FAMNAME[f]+" complet : "+fmt(ALB_R),3200);c2Albums();render()}
function c2Albums(){ens();const own=new Set(S.team.map(d=>d.type));openModal(`<h3 style="margin:0 0 6px">📚 Albums et dinos mythiques</h3><div class="tiny muted">Complète l'album d'une famille (toutes ses espèces, hors exclusives) pour ${fmt(ALB_R)}.</div>
 <div class="c2albs">${albList().map(A=>`<div class="c2alb"><b>${esc(FAMNAME[A.f])}</b> <span class="tiny">${A.n}/${A.L.length}</span><div class="c2albg">${A.L.map(k=>`<span class="${own.has(k)?"":"no"}" title="${own.has(k)?esc(SPEC[k].name):"???"}">${own.has(k)?art(SPEC[k].e):"❔"}</span>`).join("")}</div>${S.col2.alb[A.f]?'<div class="tiny ok">Récompense reçue ✅</div>':`<button class="${A.n>=A.L.length?"blue":"secondary"}" ${A.n>=A.L.length?"":"disabled"} onclick="albClaim('${A.f}')">RÉCLAMER</button>`}</div>`).join("")}</div>
 <b>🌟 Dinos mythiques</b><div class="c2myths">${MYTHS.filter(a=>SPEC[a[0]]).map(a=>{const k=a[0],got=S.col2.myth[k],ok=a[11]();return `<div class="${got?"got":""}">${got||ok?art(SPEC[k].e):`<span class="sil"><span class="pt">${PREFS.art==="svg"?portrait(k):"❓"}</span></span>`}<b>${got||ok?esc(SPEC[k].name):"???"}</b><small>${esc(a[10])}</small>${got?'<span class="tiny ok">obtenu ✅</span>':`<button class="${ok?"red":"secondary"}" ${ok?"":"disabled"} onclick="mythClaim('${k}')">${ok?"RÉCLAMER":"🔒 QUÊTE"}</button>`}</div>`}).join("")}</div>
 <div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
/* ---- évolutions ramifiées et par fossile rare ---- */
const famK=k=>(PORT[k]||["T"])[0];
function evoAlt(from){const to=EVO[from];if(!to||!SPEC[to])return null;const L=Object.keys(SPEC).filter(k=>k!==to&&k!==from&&!SPEC[k].ex&&SPEC[k].r===SPEC[to].r&&famK(k)===famK(from));return L.length?L[hashS("alt"+from)%L.length]:null}
const EVO_FOS={megalo:["mammoth",1],titanom:["arthrop",1],meganeu:["mantis",2],smilo:["cbear",1],megath:["mammoth",1],compsog:["raptor",1]};
function c2EvoList(){ens();const out=[];S.team.forEach(d=>{const alt=evoAlt(d.type);if(alt){const i=evoInfo(d);if(i)out.push({d,to:alt,kind:"alt",ok:i.ok,i})}
 const F=EVO_FOS[d.type];if(F&&SPEC[F[0]])out.push({d,to:F[0],kind:"fos",need:F[1],ok:(S.fossil||0)>=F[1]&&(S.essence||0)>=40})});return out}
function c2Evolve(id,to,kind){ens();const d=S.team.find(x=>x.id===id);if(!d||!SPEC[to])return;const from=sp(d);
 if(kind==="alt"){if(evoAlt(d.type)!==to)return;const i=evoInfo(d);if(!i||!i.ok){toast("Conditions d'évolution non remplies");return}Object.entries(i.q.c).forEach(([k,v])=>{if(MATS[k])S.mat[k]-=v;else S[k]-=v})}
 else{const F=EVO_FOS[d.type];if(!F||F[0]!==to)return;if((S.fossil||0)<F[1]||(S.essence||0)<40){toast("Il faut "+F[1]+" fossile(s) rare(s) et 40 🔮.");return}S.fossil-=F[1];S.essence-=40}
 d.type=to;bump("evolve");log(from.name+" évolue en "+sp(d).name+" !");save();try{evoFx(from,sp(d));sfx("legend")}catch(e){}render()}
if(typeof renderEvo==="function"){const _reCl2b=renderEvo;renderEvo=function(){_reCl2b();const el=$$("evoBox");if(!el)return;const L=c2EvoList().sort((a,b)=>b.ok-a.ok).slice(0,10);
 el.insertAdjacentHTML("beforeend",`<div class="panel c2evo"><b>🧬 Évolutions spéciales</b> <span class="chip">🦴 ${S.fossil||0} fossile(s) rare(s)</span><div class="tiny muted">Certaines espèces peuvent évoluer autrement (mêmes conditions) ; d'autres évoluent grâce à un fossile rare (fouilles : fossile légendaire ; boss : 1 chance sur 10).</div>${L.map(x=>`<div class="row c2er"><div class="bigicon">${art(SPEC[x.d.type].e)}</div><div class="grow"><b>${esc(SPEC[x.d.type].name)}</b> → <b>${esc(SPEC[x.to].name)}</b> <span class="chip">${x.kind==="alt"?"autre branche":"🦴 ×"+x.need+" + 40 🔮"}</span><div class="tiny muted">Niv. ${x.d.level}${x.kind==="alt"?" · même coût que l'évolution normale ("+esc(SPEC[EVO[x.d.type]].name)+")":""}</div></div><button class="${x.ok?"blue":"secondary"}" ${x.ok?"":"disabled"} onclick="c2Evolve(${x.d.id},'${x.to}','${x.kind}')">ÉVOLUER</button></div>`).join("")||'<div class="tiny muted">Aucune évolution spéciale possible pour l\'instant.</div>'}</div>`)}}
/* fossiles rares : fossile légendaire des fouilles, boss */
if(typeof digTap==="function"){const _dtCl2=digTap;digTap=function(i){const was=S.dig&&S.dig.open&&S.dig.open[i];_dtCl2(i);try{if(!was&&S.dig.open[i]&&digReward(i).k==="jack"){S.fossil=(S.fossil||0)+1;save();toast("🦴 Fossile rare trouvé !",2600)}}catch(e){}}}
const _winCl2=win;win=function(){const f=fight,boss=f&&!f.over&&f.enemies&&f.enemies[2]&&f.enemies[2].boss&&!f.raid;_winCl2();if(boss&&Math.random()<.1){S.fossil=(S.fossil||0)+1;save();try{toast("🦴 Le boss laisse un fossile rare !",2600)}catch(e){}}};
/* ---- mode photo ---- */
const PH_BG={jungle:["#1f4a2a","#7fcf6a","#2c5e2a"],ruines:["#1d2f55","#6fb3d8","#3a4a5e"],volcan:["#3a1010","#ff8a3c","#4a2a1a"],obelisque:["#1a1030","#9b7bff","#2a2040"],toundra:["#2a4058","#e8f4ff","#cfe3ef"],plage:["#3a6b8a","#ffe0a0","#e8d79b"]};
let phBg="jungle";
function photoSVG(){const t=S.team.slice(0,3),B=PH_BG[phBg],nm=typeof plName==="function"?plName():"";const inner=s=>s.replace(/^<svg[^>]*>/,"").replace(/<\/svg>\s*$/,"");
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720"><defs><linearGradient id="phs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${B[0]}"/><stop offset="1" stop-color="${B[1]}"/></linearGradient></defs><rect width="1280" height="720" fill="url(#phs)"/><circle cx="1050" cy="150" r="90" fill="#fff" opacity=".35"/><path d="M0 520 Q320 470 640 520 T1280 510 V720 H0Z" fill="${B[2]}"/>
 ${t.map((d,i)=>{const x=[230,520,810][i],y=[250,200,250][i],s=4.2;return `<g transform="translate(${x} ${y}) scale(${s})"><g${d.skin?` style="filter:hue-rotate(${SKINS2[d.skin][1]}deg)"`:""}>${inner(portrait(d.type))}</g></g><text x="${x+134}" y="${y+300}" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="800" fill="#fff" stroke="#0008" stroke-width="5" paint-order="stroke">${esc(d.nick||SPEC[d.type].name)}</text>`}).join("")}
 <text x="40" y="690" font-family="sans-serif" font-size="28" font-weight="800" fill="#fff" stroke="#0008" stroke-width="4" paint-order="stroke">${esc(nm?"La meute de "+nm:"Ma meute")} · ARK: Primal World · ${new Date().toLocaleDateString("fr-FR")}</text></svg>`}
function photoOpen(){openModal(`<h3 style="margin:0 0 6px">📸 Mode photo</h3><div class="c2phot" id="c2phot">${photoSVG()}</div><div class="c2row">${Object.keys(PH_BG).map(k=>`<button class="${phBg===k?"blue":"secondary"}" onclick="phBg='${k}';photoOpen()">${{jungle:"🌿 Jungle",ruines:"🏛️ Ruines",volcan:"🌋 Volcan",obelisque:"🗿 Obélisque",toundra:"🧊 Toundra",plage:"🏝️ Plage"}[k]}</button>`).join("")}</div>
 <div class="tiny muted">Ton équipe (les 3 premiers dinos), avec leurs couleurs et surnoms.</div><div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button><button class="blue" onclick="photoSave()">💾 ENREGISTRER L'IMAGE</button></div>`)}
function photoSave(){const svg=photoSVG(),img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=1280;c.height=720;c.getContext("2d").drawImage(img,0,0,1280,720);let png;try{png=c.toDataURL("image/png")}catch(e){toast("Impossible de créer l'image.");return}
 const a=document.createElement("a");a.href=png;a.download="photo-meute-"+todayK()+".png";document.body.appendChild(a);a.click();a.remove();window.__phLast=png.length;toast("📸 Photo enregistrée : "+a.download)};img.onerror=()=>toast("Impossible de créer l'image.");img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}
/* boutons dans la collection */
const _rcCl2=renderCollection;renderCollection=function(){_rcCl2();const t=$$("colTools");if(t&&!t.querySelector(".c2tools"))t.insertAdjacentHTML("beforeend",`<div class="btns c2tools"><button class="secondary" onclick="c2Albums()">📚 ALBUMS & MYTHIQUES</button><button class="secondary" onclick="photoOpen()">📸 MODE PHOTO</button></div>${seasHTML()}`)};
ACH.push(["cl2a","Styliste","Donner une couleur et un accessoire à un dino",()=>S.team.some(d=>d.skin&&d.acc)?1:0,1,{essence:20}],["cl2b","Paléontologue","Compléter un album de famille",()=>Object.keys((S.col2||{}).alb||{}).length,1,{tickets:3}],
 ["cl2c","Légende vivante","Obtenir un dino mythique",()=>Object.keys((S.col2||{}).myth||{}).length,1,{tickets:10,shards:30}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Galerie, style et albums","Sur chaque carte, « Galerie & style » ouvre une vue 3D du dino (bouge la souris), sa taille réelle, des faits scientifiques, et permet de choisir sa couleur et un accessoire (30 🔮 pour débloquer chacun). Touche un portrait pour entendre le cri de sa famille. Collection : albums par famille (récompense), 3 dinos mythiques obtenus par des quêtes, mode photo, boutique saisonnière (une espèce de saison moins chère). Évolutions : certaines espèces ont une 2e branche, d'autres évoluent avec un fossile rare."]);
