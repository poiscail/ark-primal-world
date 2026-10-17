/* Événements IV (0.42) : une musique et un décor de menu pour chaque événement de la semaine, défi communautaire simulé
   (« l'île a vaincu 10 000 ennemis »), anniversaire du jeu (du 15 au 21 octobre), mini-histoire de 3 dialogues par événement,
   titres exclusifs par événement ; et une attaque animée unique pour chaque dino légendaire. État : S.e4. */
const _ensE4=ens;ens=function(){_ensE4();let E=S.e4;if(!E||typeof E!=="object")E=S.e4={};for(const k of ["w","lore","comm"])if(!E[k]||typeof E[k]!=="object")E[k]={};const w=wkNow();if(E.comm.w!==w)E.comm={w,mine:0,got:{}}};
const evIdx=()=>wkNow()%EVENTS.length;
/* ---- anniversaire du jeu : 15-21 octobre ---- */
if(typeof SPEV!=="undefined"&&!SPEV.some(x=>x.k==="anniv"))SPEV.push({k:"anniv",i:"🎂",n:"Anniversaire du jeu",d:"L'île fête son anniversaire : un gâteau chaque jour (+2 🎟️ +20 🔮), musique de fête et titre « Invité d'honneur ».",on:(m,d)=>m===9&&d>=15&&d<=21});
function annivCake(){ens();if(typeof evAct!=="function"||!evAct("anniv")||S.e4.cake===todayK())return false;S.e4.cake=todayK();S.e4.cakes=(S.e4.cakes||0)+1;give({tickets:2,essence:20});save();toast("🎂 Joyeux anniversaire ! +2 🎟️ +20 🔮",3000);render();return true}
/* ---- musique propre à chaque événement ---- */
const E4_SCALES=[[196,220,247,262,294,330,370,392],[220,247,277,294,330,370,415,440],[174,196,220,233,262,294,330,349],[247,277,311,330,370,415,466,494],[208,233,262,277,311,349,392,415],[262,294,330,349,392,440,494,524],[185,208,233,247,277,311,349,370],[233,262,294,311,349,392,440,466]];
EVENTS.forEach((ev,i)=>{if(typeof MSC==="undefined")return;const sc=E4_SCALES[i%E4_SCALES.length],h=hashS(ev.n);const seq=Array.from({length:16},(_,j)=>((h>>(j%12))+j*3)%8);
 MSC["ev"+i]={ms:260+(h%5)*30,root:sc,seq,lead:["triangle","square","sine","sawtooth"][h%4],lv:.07,bass:1+(h%2),perc:true,dark:ev.el==="purpleorb"}});
if(typeof MSC!=="undefined")MSC.anniv={ms:300,root:[262,294,330,349,392,440,494,524],seq:[0,0,1,0,3,2,0,0,1,0,4,3,0,0,7,5],lead:"triangle",lv:.09,bass:1,perc:true};
if(typeof musicMode==="function"){const _mmE4=musicMode;musicMode=function(){const m=_mmE4();try{if(typeof SND!=="undefined"&&SND.jbx)return m;const f=fight,md=f&&f.o&&f.o.mode;
 if(typeof evAct==="function"&&evAct("anniv")&&m==="menu")return"anniv";if(/halloween|noel/.test(m))return m;
 if((screen==="events"&&m!=="boss")||(screen==="battle"&&f&&!f.over&&(md==="event"||md==="evboss"))){const k="ev"+evIdx();if(MSC[k]){try{S.snd&&(S.snd.heard[k]=1)}catch(e){}return k}}}catch(e){}return m}}
if(typeof JUKE!=="undefined"){EVENTS.forEach((ev,i)=>JUKE.push(["ev"+i,(ev.e||"🎪")+" "+ev.n]));JUKE.push(["anniv","🎂 Anniversaire"])}
/* ---- mini-histoires d'événement (3 dialogues), une fois par semaine ---- */
const E4_STORY=[["🧑‍🔬","Dr Elara",["Les os remontent à la surface… quelque chose remue sous l'île.","Ces squelettes ne sont pas anciens : ils ont été déterrés cette semaine.","Ramène-m'en le plus possible, je veux comprendre qui les déterre."]],
 ["🧕","Mira",["Le cuir se fait rare au marché, et les bêtes sont nerveuses.","Les chasseurs disent qu'une meute descend des collines.","Si tu les calmes, je te garde mes plus belles peaux."]],
 ["👴","Oto",["Les cristaux chantent quand la lune est pleine, tu le savais ?","Mon grand-père disait qu'ils retiennent la mémoire des anciens.","Écoute-les bien en combattant : ils te guideront."]],
 ["🧑‍🔬","Dr Elara",["L'ambre de cette semaine contient des insectes intacts.","Avec un peu de chance, de l'ADN que la Graine n'a jamais vu.","Chaque fragment compte : ne laisse rien derrière toi."]],
 ["🧔","Kael",["Hé, tu croyais être le seul à chasser cette semaine ?","Le froid descend du Nord, et avec lui des bêtes énormes.","Que le meilleur gagne. Ce sera moi, évidemment."]],
 ["🧕","Mira",["Les volcans grondent : ma boutique tremble à chaque secousse.","Les créatures de feu sortent des fissures.","Rapporte-moi des braises froides, si ça existe."]],
 ["👴","Oto",["La marée est étrange : elle ne redescend plus.","Les abysses envoient leurs gardiens sur la plage.","Garde ta meute près de toi, l'eau est traîtresse."]],
 ["🧑‍🔬","Dr Elara",["L'obélisque brille comme jamais. La Graine s'agite.","Ses éclats attirent des créatures de partout.","Si nous comprenons ce signal, nous comprendrons l'île."]]];
EVENTS.forEach((ev,i)=>{if(typeof LORE==="undefined")return;const S3=E4_STORY[i%E4_STORY.length];LORE["ev4_"+i]=[S3[0],S3[1]+" · "+ev.n,...S3[2]]});
function e4Story(force){ens();const i=evIdx(),k="ev4_"+i,w=wkNow();if(!force&&(S.e4.lore[i]===w||PREFS.lore===false))return false;S.e4.lore[i]=w;save();if(typeof loreShow==="function")loreShow(k,null);return true}
/* ---- défi communautaire simulé : l'île doit vaincre 10 000 ennemis dans la semaine ---- */
const COMM_G=10000,COMM_T=[[25,{stone:200}],[50,{tickets:2}],[75,{essence:30,crystal:2}],[100,{tickets:4,shards:15}]];
function commProg(now){ens();const w=wkNow(),wk0=(w*7-3)*864e5,el=Math.max(0,Math.min(1,((now||Date.now())-wk0)/(7*864e5))),h=(hashS("comm"+w)%30)/100;
 const sim=Math.round(COMM_G*(.75+h)*el),mine=S.e4.comm.mine*20;return{total:Math.min(COMM_G*1.5,sim+mine),mine:S.e4.comm.mine,pct:Math.min(100,Math.floor((sim+mine)/COMM_G*100))}}
function commClaim(p){ens();const C=S.e4.comm,T=COMM_T.find(t=>t[0]===p),P=commProg();if(!T||C.got[p]||P.pct<p)return false;if(C.mine<5){toast("Participe d'abord : gagne 5 combats cette semaine.");return false}C.got[p]=1;give(T[1]);save();toast("🌍 Défi de l'île "+p+" % : "+fmt(T[1]),2600);render();return true}
/* ---- victoires : contribution, compte par événement ---- */
const _winE4=win;win=function(){const f=fight,was=f&&f.over;const r=_winE4.apply(this,arguments);try{if(f&&!was&&f.over==="win"&&!f.e4w){f.e4w=1;ens();S.e4.comm.mine++;const md=f.o&&f.o.mode;if(md==="event"||md==="evboss"){const i=evIdx();S.e4.w[i]=(S.e4.w[i]||0)+1}save()}}catch(e){}return r};
/* ---- titres exclusifs par événement ---- */
EVENTS.forEach((ev,i)=>ACH.push(["e4t"+i,"Héros : "+ev.n,"Gagner 10 combats de l'événement « "+ev.n+" »",()=>((S.e4||{}).w||{})[i]||0,10,{tickets:2},"Champion · "+ev.n]));
ACH.push(["e4a","Invité d'honneur","Fêter l'anniversaire du jeu",()=>(S.e4||{}).cakes||0,1,{tickets:3},"Invité d'honneur"],["e4c","Pilier de l'île","Atteindre 100 % du défi de l'île",()=>Object.keys(((S.e4||{}).comm||{}).got||{}).includes("100")?1:0,1,{tickets:3}]);
/* ---- écran des événements : décor, histoire, défi de l'île, anniversaire ---- */
const _reE4=renderEvents;renderEvents=function(){_reE4();try{const el=$$("events");if(!el)return;ens();const i=evIdx(),ev=EVENTS[i],b=el.querySelector(".banner");
 if(b&&!b.querySelector(".e4deco")){b.classList.add("e4b","e4b-"+i);b.insertAdjacentHTML("beforeend",`<div class="e4deco" aria-hidden="true">${Array.from({length:10},(_,j)=>`<i style="left:${(hashS(ev.n+j)%95)}%;animation-delay:-${j*.7}s;font-size:${14+hashS(ev.e+j)%14}px">${ev.e||"🎪"}</i>`).join("")}</div>`)}
 const P=commProg(),C=S.e4.comm;const h=`<div class="panel e4comm"><b>🌍 Défi de l'île : ${P.total.toLocaleString("fr-FR")} / ${COMM_G.toLocaleString("fr-FR")} ennemis vaincus</b><div class="tiny muted">Toute l'île combat cette semaine (simulé sur ton ordinateur). Ta part : ${P.mine} victoire(s).</div><div class="progress"><i style="width:${P.pct}%"></i></div>
  <div class="btns">${COMM_T.map(([p,r])=>`<button class="${C.got[p]?"secondary":P.pct>=p?"blue":"secondary"}" ${!C.got[p]&&P.pct>=p?"":"disabled"} onclick="commClaim(${p})">${p} % · ${fmt(r)}${C.got[p]?" ✅":""}</button>`).join("")}</div></div>
  <div class="panel e4story"><b>📖 L'histoire de la semaine : ${esc(ev.n)}</b> <button class="secondary" onclick="e4Story(true)">LIRE (3 dialogues)</button> <span class="tiny muted">Titre à gagner : « Champion · ${esc(ev.n)} » (10 victoires, ${Math.min(10,S.e4.w[i]||0)}/10)</span></div>
  ${typeof evAct==="function"&&evAct("anniv")?`<div class="panel e4anniv"><b>🎂 Anniversaire du jeu</b> <span class="tiny">Un gâteau par jour pendant la semaine d'anniversaire.</span> <button class="${S.e4.cake===todayK()?"secondary":"blue"}" ${S.e4.cake===todayK()?"disabled":""} onclick="annivCake()">${S.e4.cake===todayK()?"DÉJÀ MANGÉ 😋":"🎂 PRENDRE LE GÂTEAU"}</button></div>`:""}`;
 const ref=$$("e3box")||b;if(ref)ref.insertAdjacentHTML(ref.id==="e3box"?"afterbegin":"afterend",h);
 if(screen==="events")setTimeout(()=>{try{if(screen==="events"&&!document.querySelector("#loreVeil:not(.hide)"))e4Story()}catch(e){}},400)}catch(e){appErr&&appErr(e,"events4")}};
/* ---- attaque unique pour chaque légendaire ---- */
const LG_SHAPES=["comet","ring","pillar","spiral","crown","shards","wave","star"],LG_GLYPH=["✦","❖","✸","✺","❂","✹","❋","✷","☄","✧"];
function lgSig(type){const h=hashS("lg"+type),s=SPEC[type]||{};return{shape:LG_SHAPES[h%LG_SHAPES.length],glyph:LG_GLYPH[(h>>3)%LG_GLYPH.length],hue:(h>>6)%360,name:(["Frappe","Rugissement","Éclat","Fureur","Colère","Souffle","Courroux","Marque"][(h>>9)%8])+" de "+(s.name||type)}}
function lgFx(type,x,y){if(!PREFS.anim||(typeof a2Lv==="function"&&a2Lv()<1))return null;const g=lgSig(type),d=document.createElement("div");d.className="lgfx lg-"+g.shape;d.style.left=x+"px";d.style.top=y+"px";d.style.setProperty("--h",g.hue);
 d.innerHTML=`<b>${Array.from({length:8},(_,i)=>`<i style="--i:${i}">${g.glyph}</i>`).join("")}</b><span>${(SPEC[type]||{}).e||""}</span><em>${esc(g.name)}</em>`;fxAdd(d,fxd(1300));window.__lg=(window.__lg||0)+1;return g}
const _toE4=tapOrb;tapOrb=function(i){const f=fight,c=f&&f.orbs&&f.orbs[i];const r=_toE4(i);try{if(c&&f&&!(typeof CUT!=="undefined"&&CUT)&&screen==="battle"){const t=S.team.slice(0,3),k=t.findIndex((d,j)=>f.hp[j]>0&&sp(d).element===c&&sp(d).r==="Légendaire");
 if(k>=0){f.lgN=(f.lgN||0)+1;if(f.lgN%3===1){const e=document.querySelector("#battleArea .sEnemy .sEart");if(e){const R=e.getBoundingClientRect();lgFx(t[k].type,R.left+R.width/2,R.top+R.height/2)}}}}}catch(e){}return r};
if(typeof GUIDE!=="undefined")GUIDE.push(["Événements (suite)","Chaque événement de la semaine a sa musique, son décor, sa mini-histoire et son titre (10 victoires). Défi de l'île : toute l'île combat pour 10 000 ennemis (simulé) — tes victoires comptent. Du 15 au 21 octobre : anniversaire du jeu. Les légendaires ont chacun leur attaque animée."]);
