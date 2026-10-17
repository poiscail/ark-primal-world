/* Partage et rejouabilité (0.41) : codes d'équipe (affronter l'équipe d'un ami, en local), défis à partager (niveau + règle +
   graine du hasard), comparaison du Défi du jour avec un ami, mode spectateur, relecture du dernier combat, résumé du mois,
   galerie de fan-art importée, décorations du camp, compagnon non combattant, mini-encyclopédie et quiz, musée, profils de
   joueur (et duel entre profils), défi « nuzlocke », cadeau de mise à jour, crédits (avec l'avertissement sur le nom « ARK »).
   État : S.sh ; profils dans localStorage « arkPrimalProfiles », fan-art dans « arkPrimalArt ». */
const _ensSh=ens;ens=function(){_ensSh();let H=S.sh;if(!H||typeof H!=="object")H=S.sh={};for(const k of ["deco","museum","quiz","mo"])if(!H[k]||typeof H[k]!=="object")H[k]=Array.isArray(H[k])?H[k]:(k==="museum"||k==="deco"?[]:{});
 if(!Array.isArray(H.deco))H.deco=[];if(!Array.isArray(H.museum))H.museum=[];if(!H.mo.k){H.mo={k:todayK().slice(0,7),base:{...(S.cnt||{})}}}};
const SH_B64=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))),SH_UN=s=>JSON.parse(decodeURIComponent(escape(atob(s))));
function shCode(pfx,o){const s=SH_B64(o);return pfx+s+"."+(hashS(s)%9973).toString(36)}
function shRead(pfx,code){code=String(code||"").trim();if(!code.startsWith(pfx))return null;const b=code.slice(pfx.length),i=b.lastIndexOf(".");if(i<0)return null;const s=b.slice(0,i);if((hashS(s)%9973).toString(36)!==b.slice(i+1))return null;try{return SH_UN(s)}catch(e){return null}}
function shCopy(t){try{navigator.clipboard.writeText(t).catch(()=>{})}catch(e){}}
/* ---- codes d'équipe : affronter l'équipe d'un ami ---- */
function shTeamCode(){ens();const t=S.team.slice(0,3).map(d=>({t:d.type,l:d.level,s:d.star||0,v:d.v||"normal"}));return shCode("ARKT1.",{n:(S.player&&S.player.name)||"Dresseur",t})}
function shTeamOk(o){return o&&Array.isArray(o.t)&&o.t.length>=1&&o.t.length<=3&&o.t.every(x=>SPEC[x.t]&&x.l>=1&&x.l<=120)}
MODES.friend=function(o){const T=o.team.t,L=Math.round(T.reduce((a,x)=>a+x.l,0)/T.length),st=T.reduce((a,x)=>a+(x.s||0),0)/T.length,eq=Math.max(1,Math.min(150,2*(L-1)));
 const en=mkEnemies(eq,{emo:T.map(x=>SPEC[x.t].e),names:T.map(x=>SPEC[x.t].name+" · "+String(o.team.n).slice(0,16)),els:T.map(x=>SPEC[x.t].element),pts:T.map(x=>x.t),boss:false,hp:1.2*(1+.08*st),atk:1.1*(1+.06*st)});
 en.forEach(e=>{e.tr="";e._nm=1});while(en.length<3)en.unshift({...en[0]});return{eq,label:"Duel amical · équipe de "+String(o.team.n).slice(0,16),enemies:en}};
const _elSh=enemyLook;enemyLook=function(e,f){f=f||fight;if(f&&f.o&&f.o.mode==="friend"&&e&&e.pt&&SPEC[e.pt])return null;return _elSh(e,f)};
function shFriendFight(code){const o=shRead("ARKT1.",code);if(!shTeamOk(o)){toast("Code d'équipe invalide.");return false}ens();fight=null;startBattle({mode:"friend",team:o,go:true});return true}
/* ---- défis à partager : niveau + règle + graine ---- */
function shRng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shDrawsFor(seed){const r=shRng(seed),a=[];for(let i=0;i<4000;i++)a.push(r());return a}
function shChalCode(n,rule,seed){return shCode("ARKC1.",{n:Math.max(1,Math.min(100,n|0)),r:rule||"",s:(seed>>>0)||1})}
function shChalPlay(code){const o=shRead("ARKC1.",code);if(!o||!(o.n>=1)){toast("Code de défi invalide.");return false}ens();S.sh.chal={code,best:(S.sh.chal&&S.sh.chal.code===code?S.sh.chal.best:null)};
 fight=null;const opt={mode:"story",n:o.n,rev:shDrawsFor(o.s),shChal:code};if(o.r&&typeof DRULES!=="undefined"&&DRULES.some(r=>r[0]===o.r||r.k===o.r))opt.daily=undefined;startBattle(opt);if(fight){fight.shChal=code;fight.shRule=o.r}return true}
/* ---- relecture du dernier combat et mode spectateur ---- */
let SH_REC=null;
for(const[nm,tag]of [["tapOrb","o"],["useSkill","k"],["special","s"],["guard","g"]]){const fn=window[nm];if(typeof fn!=="function")continue;window[nm]=function(a){const f=fight;try{if(f&&!f.over&&!f.shReplay){f.shActs=f.shActs||[];f.shActs.push([tag,a])}}catch(e){}return fn.apply(this,arguments)}}
const _rbSh=renderBattle;renderBattle=function(){_rbSh();try{const f=fight;if(!f||!f.over||f.shSaved||f.shReplay||!f.shActs||!f.m2Rec)return;f.shSaved=1;
 SH_REC={o:{...f.o,go:false},team:JSON.parse(JSON.stringify(S.team.slice(0,3))),draws:f.m2Rec.slice(0,20000),acts:f.shActs.slice(0,400),res:f.over,zone:f.zone};try{sessionStorage.setItem("arkShRec",JSON.stringify(SH_REC))}catch(e){}}catch(e){}};
let shPlayT=0;
function shReplay(){const R=SH_REC||(()=>{try{return JSON.parse(sessionStorage.getItem("arkShRec")||"null")}catch(e){return null}})();if(!R){toast("Aucun combat à revoir pour l'instant.");return false}
 const keep=S.team.slice(0,3);S.team.splice(0,3,...R.team.map(d=>({...d})));fight=null;startBattle({...R.o,rev:R.draws.slice(),go:true});const f=fight;if(!f){S.team.splice(0,3,...keep);return false}
 f.shReplay=1;f.shKeep=keep;let i=0;clearInterval(shPlayT);
 shPlayT=setInterval(()=>{const g=fight;if(g!==f||f.over||i>=R.acts.length){clearInterval(shPlayT);return}const[t,a]=R.acts[i++];try{if(t==="o")tapOrb(a);else if(t==="k")useSkill(a);else if(t==="s")special();else if(t==="g"&&typeof guard==="function")guard()}catch(e){}},fxd(650));return true}
/* pendant une relecture : aucune récompense, aucune pénalité, l'équipe d'origine revient */
function shEndReplay(f,res){clearInterval(shPlayT);if(f.shKeep){S.team.splice(0,3,...f.shKeep);f.shKeep=null}f.over=res;f.settled=true;f.log+=" · 🎞️ Fin de la relecture";try{renderBattle()}catch(e){}}
const _winSh=win;win=function(){const f=fight;if(f&&f.shReplay){shEndReplay(f,"win");return}return _winSh.apply(this,arguments)};
const _slSh=settleLose;settleLose=function(){const f=fight;if(f&&f.shReplay){shEndReplay(f,"lose");return}return _slSh.apply(this,arguments)};
const _etSh=enemyTurn;enemyTurn=function(){const f=fight;const r=_etSh.apply(this,arguments);try{if(f&&f.shReplay&&f.over==="lose"&&!f.settled)shEndReplay(f,"lose")}catch(e){}return r};
function shSpectate(){if(!PREFS.auto)setPref("auto",true);if(PREFS.spd!==3)setPref("spd",3);document.body.classList.add("shspect");toast("👀 Mode spectateur : l'auto-combat joue en accéléré (Échap pour reprendre la main).",3000);if(typeof autoKick==="function")autoKick(200)}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("shspect")){e.stopImmediatePropagation();document.body.classList.remove("shspect");setPref("auto",false)}},true);/* avant le menu pause */
/* ---- Défi du jour : comparer avec un ami ---- */
function shDailyCode(){ens();const D=S.dch||{};return shCode("ARKJ1.",{d:todayK(),w:D.won?1:0,t:D.turns||D.best||0,n:(S.player&&S.player.name)||"Dresseur"})}
function shDailyCmp(code){const o=shRead("ARKJ1.",code);if(!o){toast("Code invalide.");return null}const D=S.dch||{},me={w:D.won?1:0,t:D.turns||D.best||0};const same=o.d===todayK();
 const msg=!same?"Ce code date du "+o.d+" : il faut comparer le même jour.":o.w&&!me.w?esc(o.n)+" a réussi le défi, pas encore toi.":me.w&&!o.w?"Tu as réussi le défi, pas encore "+esc(o.n)+".":o.w&&me.w?(me.t&&o.t?(me.t<o.t?"Tu gagnes : "+me.t+" actions contre "+o.t+".":me.t>o.t?esc(o.n)+" gagne : "+o.t+" actions contre "+me.t+".":"Égalité parfaite !"):"Vous avez tous les deux réussi."):"Personne n'a encore réussi aujourd'hui.";
 openModal(`<h3 style="margin:0 0 6px">📅 Défi du jour : toi contre ${esc(o.n)}</h3><div>${msg}</div><div class="btns"><button onclick="closeModal()">OK</button></div>`);return{same,o,me}}
/* ---- résumé du mois ---- */
function shMonth(force){ens();const M=S.sh.mo,k=todayK().slice(0,7),c=S.cnt||{},b=M.base||{},d=x=>Math.max(0,(c[x]||0)-(b[x]||0));
 const R={wins:d("wins"),bosses:d("bosses"),battles:d("battles"),summons:d("summons")||d("pulls"),legend:d("legend")};
 if(M.k!==k){const prev=M.k;S.sh.mo={k,base:{...c},last:{k:prev,R}};save();if(!U_WD())shMonthShow(prev,R);return R}if(force)shMonthShow(k,R,true);return R}
const U_WD=()=>typeof navigator!=="undefined"&&!!navigator.webdriver;
function shMonthShow(k,R,cur){openModal(`<h3 style="margin:0 0 6px">📊 ${cur?"Ce mois-ci":"Ton mois de "+esc(k)}</h3><div class="shstats"><div><b>${R.wins}</b><small>victoires</small></div><div><b>${R.bosses}</b><small>boss</small></div><div><b>${R.battles}</b><small>combats</small></div><div><b>${R.summons}</b><small>invocations</small></div></div><div class="btns"><button onclick="closeModal()">OK</button></div>`)}
/* ---- galerie de fan-art (images locales, réduites) ---- */
const shArt=()=>{try{return JSON.parse(localStorage.getItem("arkPrimalArt")||"[]")}catch(e){return[]}};
function shArtAdd(file,cb){if(!file||!/^image\//.test(file.type)){toast("Choisis une image.");return}const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,480/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);
  const L=shArt();L.unshift({t:Date.now(),src:c.toDataURL("image/jpeg",.82)});while(L.length>12)L.pop();try{localStorage.setItem("arkPrimalArt",JSON.stringify(L))}catch(e){toast("Galerie pleine : supprime une image.");return}cb&&cb();shGallery()};im.src=r.result};r.readAsDataURL(file)}
function shArtDel(i){const L=shArt();L.splice(i,1);localStorage.setItem("arkPrimalArt",JSON.stringify(L));shGallery()}
function shGallery(){const L=shArt();openModal(`<h3 style="margin:0 0 6px">🖼️ Galerie de fan-art</h3><div class="tiny muted">Tes dessins et captures, gardés sur cet ordinateur seulement (12 au plus).</div><div class="shart">${L.map((a,i)=>`<figure><img src="${a.src}" alt="fan-art ${i+1}"><button class="secondary" onclick="shArtDel(${i})">✖</button></figure>`).join("")||'<div class="tiny muted">Aucune image.</div>'}</div>
 <label class="btn secondary shartadd">➕ AJOUTER UNE IMAGE<input type="file" accept="image/*" style="display:none" onchange="shArtAdd(this.files[0])"></label><div class="btns"><button onclick="closeModal()">OK</button></div>`)}
/* ---- camp : décorations ---- */
const SH_DECO=[["flag","🚩","Drapeau",20],["torch","🔥","Torches",25],["totem","🗿","Totem",40],["tent","⛺","Tente",30],["bones","🦴","Squelette exposé",50],["flowers","🌺","Fleurs",15],["lantern","🏮","Lanternes",35],["statue","🗽","Statue",80]];
function shDecoBuy(k){ens();const D=SH_DECO.find(x=>x[0]===k);if(!D||S.sh.deco.includes(k))return;if((S.essence||0)<D[3]){toast("Il faut "+D[3]+" 🔮.");return}S.essence-=D[3];S.sh.deco.push(k);save();toast(D[1]+" "+D[2]+" installé(e) au camp !");render()}
if(typeof campScene==="function"){const _csSh=campScene;campScene=function(){const h=_csSh();try{ens();const pos=[[14,64],[38,70],[62,66],[84,70],[26,40],[50,36],[72,38],[6,46]];const add=S.sh.deco.map((k,i)=>{const D=SH_DECO.find(x=>x[0]===k);return D?`<div class="shdeco" style="left:${pos[i%8][0]}%;top:${pos[i%8][1]}%">${D[1]}</div>`:""}).join("");
 const pet=shPet();return h.replace(/<\/div>\s*$/,add+(pet?`<div class="shpetcamp">${art(SPEC[pet].e)}</div>`:"")+"</div>")}catch(e){return h}}}
function shDecoShop(){ens();openModal(`<h3 style="margin:0 0 6px">🏕️ Décorer le camp</h3><div class="shdecos">${SH_DECO.map(([k,i,n,c])=>`<button class="${S.sh.deco.includes(k)?"secondary":""}" ${S.sh.deco.includes(k)?"disabled":""} onclick="shDecoBuy('${k}');shDecoShop()">${i} ${esc(n)} ${S.sh.deco.includes(k)?"✅":"· "+c+" 🔮"}</button>`).join("")}</div><div class="btns"><button onclick="closeModal()">OK</button></div>`)}
/* ---- compagnon non combattant ---- */
function shPet(){ens();const k=S.sh.pet;return k&&SPEC[k]&&S.team.some(d=>d.type===k)?k:null}
function shPetSet(k){ens();S.sh.pet=k||null;save();render()}
function shPetPick(){ens();const L=[...new Set(S.team.map(d=>d.type))].filter(k=>SPEC[k]&&/^(Commun|Rare)$/.test(SPEC[k].r)).slice(0,24);openModal(`<h3 style="margin:0 0 6px">🐾 Compagnon</h3><div class="tiny muted">Un petit dino (commun ou rare) qui suit l'équipe en combat et au camp, sans combattre.</div><div class="shdecos">${L.map(k=>`<button class="${S.sh.pet===k?"":"secondary"}" onclick="shPetSet('${k}');shPetPick()">${esc(SPEC[k].e)} ${esc(SPEC[k].name)}</button>`).join("")}<button class="secondary" onclick="shPetSet(null);shPetPick()">Aucun</button></div><div class="btns"><button onclick="closeModal()">OK</button></div>`)}
const _rbSh2=renderBattle;renderBattle=function(){_rbSh2();try{if(fight&&fight.over)shNuzKo(fight)}catch(e){}try{const k=shPet(),st=document.querySelector("#battleArea .battlestage .sTeam");if(k&&st&&!st.querySelector(".shpet"))st.insertAdjacentHTML("beforeend",`<div class="shpet" title="${esc(SPEC[k].name)} (compagnon)">${PREFS.art==="svg"&&typeof portrait==="function"?`<span class="pt">${portrait(k,true)}</span>`:art(SPEC[k].e)}</div>`)}catch(e){}};
/* ---- mini-encyclopédie et quiz ---- */
const PALEO=[["Trias (−252 à −201 Ma)","Les premiers dinosaures apparaissent vers −230 Ma ; ils sont petits et bipèdes. Les mammifères naissent à la même époque."],
 ["Jurassique (−201 à −145 Ma)","L'âge des géants : les sauropodes comme le Brachiosaure dépassent 20 m ; les premiers oiseaux (Archaeopteryx) apparaissent."],
 ["Crétacé (−145 à −66 Ma)","Tyrannosaure, Tricératops, Spinosaure… et les plantes à fleurs. Il se termine par l'impact de Chicxulub."],
 ["L'extinction","Il y a 66 millions d'années, un astéroïde d'environ 10 km frappe le Mexique actuel : les trois quarts des espèces disparaissent."],
 ["Les oiseaux","Les oiseaux sont des dinosaures théropodes : la poule est plus proche parente du T. rex que le crocodile."],
 ["Les ptérosaures","Les ptérosaures (Quetzalcoatlus, Ptéranodon) ne sont pas des dinosaures, mais leurs cousins volants."],
 ["Les reptiles marins","Mosasaures et plésiosaures ne sont pas des dinosaures non plus : ce sont des reptiles marins."],
 ["Les plumes","Beaucoup de théropodes avaient des plumes, y compris de grands comme le Yutyrannus (9 m)."],
 ["Les fossiles","Un fossile se forme quand les restes sont vite recouverts de sédiments ; les minéraux remplacent peu à peu les os."],
 ["Le Spinosaure","Il est probablement semi-aquatique : il se nourrissait de poissons et sa voile servait peut-être de parade."],
 ["Le Tricératops","Ses cornes et sa collerette servaient à se défendre et à se faire reconnaître ; il pesait jusqu'à 12 tonnes."],
 ["Le Mammouth","Il vivait encore il y a 4 000 ans sur l'île Wrangel : bien après la construction des premières pyramides."]];
const QUIZ=[["Quel animal actuel est un dinosaure ?",["La poule","Le crocodile","Le lézard"],0],["Quand les dinosaures non aviens ont-ils disparu ?",["−66 millions d'années","−6 millions d'années","−660 millions d'années"],0],["Le Ptéranodon est…",["un ptérosaure","un dinosaure","un oiseau"],0],
 ["Quelle période voit apparaître les dinosaures ?",["Le Trias","Le Crétacé","Le Quaternaire"],0],["Le Mosasaure est…",["un reptile marin","un dinosaure","un poisson"],0],["Le Spinosaure mangeait surtout…",["des poissons","des feuilles","des insectes"],0],
 ["Le Mammouth a vécu jusqu'à il y a environ…",["4 000 ans","40 millions d'années","400 000 ans"],0],["Où l'astéroïde est-il tombé ?",["Au Mexique actuel","En Sibérie","En Australie"],0],["Le Tyrannosaure vivait au…",["Crétacé","Jurassique","Trias"],0],["Les sauropodes étaient…",["herbivores","carnivores","insectivores"],0]];
function shEncy(){openModal(`<h3 style="margin:0 0 6px">📚 Mini-encyclopédie</h3><div class="shency">${PALEO.map(([t,x])=>`<details><summary><b>${esc(t)}</b></summary><div class="tiny">${esc(x)}</div></details>`).join("")}</div><div class="btns"><button onclick="shQuiz()">❓ QUIZ DU JOUR</button><button class="secondary" onclick="closeModal()">OK</button></div>`)}
function shQuizSet(){const d=todayK(),L=QUIZ.map((q,i)=>i).sort((a,b)=>hashS(d+a)-hashS(d+b)).slice(0,3);return L}
function shQuiz(){ens();const d=todayK(),Q=S.sh.quiz;if(Q.d!==d){S.sh.quiz={d,a:{},done:0};save()}const A=S.sh.quiz.a;
 openModal(`<h3 style="margin:0 0 6px">❓ Quiz du jour</h3><div class="tiny muted">3 questions par jour · 1 🎟️ par bonne réponse.</div>${shQuizSet().map((qi,n)=>{const q=QUIZ[qi],ord=[0,1,2].sort((a,b)=>hashS(d+qi+"o"+a)-hashS(d+qi+"o"+b));return `<div class="shq"><b>${n+1}. ${esc(q[0])}</b><div class="shqa">${ord.map(j=>`<button class="${A[qi]===undefined?"secondary":j===q[2]?"":A[qi]===j?"red":"secondary"}" ${A[qi]===undefined?"":"disabled"} onclick="shAnswer(${qi},${j})">${esc(q[1][j])}</button>`).join("")}</div></div>`}).join("")}<div class="btns"><button onclick="closeModal()">OK</button></div>`)}
function shAnswer(qi,j){ens();const Q=S.sh.quiz;if(Q.a[qi]!==undefined||!shQuizSet().includes(qi))return;Q.a[qi]=j;if(j===QUIZ[qi][2]){give({tickets:1});toast("✅ Bonne réponse : +1 🎟️")}else toast("❌ C'était : "+QUIZ[qi][1][QUIZ[qi][2]]);save();shQuiz()}
/* ---- musée ---- */
function shMuseumTog(id){ens();const M=S.sh.museum,i=M.indexOf(id);if(i>=0)M.splice(i,1);else{if(M.length>=6){toast("6 vitrines au plus.");return}M.push(id)}save();shMuseum(true)}
function shMuseum(edit){ens();const M=S.sh.museum.map(id=>S.team.find(d=>d.id===id)).filter(Boolean);
 openModal(`<h3 style="margin:0 0 6px">🏛️ Mon musée</h3><div class="shmuseum">${M.map(d=>`<div class="shvit"><div class="shped">${PREFS.art==="svg"&&typeof portrait==="function"?`<span class="pt">${portrait(d.type,true)}</span>`:art(sp(d).e)}</div><b>${esc(d.nick||sp(d).name)}</b><small>Niv. ${d.level}${d.star?" · "+"★".repeat(Math.min(6,d.star)):""}${d.v&&d.v!=="normal"?" · "+esc((VAR[d.v]||{}).n||d.v):""}</small></div>`).join("")||'<div class="tiny muted">Aucune vitrine : choisis tes plus beaux dinos.</div>'}</div>
 ${edit?`<div class="shdecos">${S.team.slice().sort((a,b)=>RAR5.indexOf(sp(b).r)-RAR5.indexOf(sp(a).r)||b.level-a.level).slice(0,30).map(d=>`<button class="${S.sh.museum.includes(d.id)?"":"secondary"}" onclick="shMuseumTog(${d.id})">${art(sp(d).e)} ${esc(d.nick||sp(d).name)} ${d.level}</button>`).join("")}</div>`:""}
 <div class="btns">${edit?"":`<button class="secondary" onclick="shMuseum(true)">✏️ CHOISIR LES VITRINES</button>`}<button onclick="closeModal()">OK</button></div>`)}
/* ---- profils de joueur (et duel entre profils) ---- */
const shProfs=()=>{try{const o=JSON.parse(localStorage.getItem("arkPrimalProfiles")||"null");if(o&&Array.isArray(o.list))return o}catch(e){}return{list:[{id:"p1",name:"Profil 1"}],cur:"p1"}};
function shProfSave(P){localStorage.setItem("arkPrimalProfiles",JSON.stringify(P))}
function shProfSwitch(id,noReload){const P=shProfs(),to=P.list.find(p=>p.id===id);if(!to||id===P.cur)return false;save();const me=P.list.find(p=>p.id===P.cur);if(me)me.data=localStorage.getItem("arkPrimalMobile");
 if(to.data)localStorage.setItem("arkPrimalMobile",to.data);else localStorage.removeItem("arkPrimalMobile");delete to.data;P.cur=id;shProfSave(P);if(!noReload)location.reload();return true}
function shProfNew(name){const P=shProfs(),id="p"+Date.now().toString(36);P.list.push({id,name:String(name||"Profil "+(P.list.length+1)).slice(0,20),data:null});shProfSave(P);return id}
function shProfDuel(id){const P=shProfs(),p=P.list.find(x=>x.id===id);if(!p||!p.data){toast("Ce profil n'a pas encore d'équipe.");return false}try{const s=JSON.parse(p.data),t=(s.team||[]).slice(0,3).map(d=>({t:d.type,l:d.level,s:d.star||0,v:d.v}));const o={n:p.name,t};if(!shTeamOk(o))throw 0;closeModal();fight=null;startBattle({mode:"friend",team:o,go:true});return true}catch(e){toast("Équipe de ce profil illisible.");return false}}
function shProfiles(){const P=shProfs();openModal(`<h3 style="margin:0 0 6px">👥 Profils sur cet ordinateur</h3><div class="shprofs">${P.list.map(p=>`<div class="row"><div class="grow"><b>${esc(p.name)}</b>${p.id===P.cur?' <span class="chip">actif</span>':""}</div>${p.id===P.cur?"":`<button class="secondary" onclick="shProfDuel('${p.id}')">⚔️ DUEL</button><button onclick="shProfSwitch('${p.id}')">CHANGER</button>`}</div>`).join("")}</div>
 <div class="btns"><button class="secondary" onclick="askText('Nom du nouveau profil','',v=>{if(v){shProfNew(v);shProfiles()}})">➕ NOUVEAU PROFIL</button><button onclick="closeModal()">OK</button></div><div class="tiny muted">Chaque profil a sa propre sauvegarde. Changer de profil recharge le jeu.</div>`)}
/* ---- défi « nuzlocke » : un dino K.O. est perdu tant que le défi dure ---- */
function shNuz(on){ens();if(on){S.sh.nuz={t0:Date.now(),lost:[]};toast("☠️ Défi nuzlocke : un dino K.O. en histoire est perdu jusqu'à la fin du défi.",3600)}else if(S.sh.nuz){const n=S.sh.nuz.lost.length;S.team.forEach(d=>delete d.nzDead);S.sh.nuzBest=Math.max(S.sh.nuzBest||0,(S.stage||0));S.sh.nuz=null;toast("Défi terminé : "+n+" dino(s) perdu(s) reviennent dans la meute.",3200)}save();render()}
const _winNz=win;win=function(){const f=fight;const r=_winNz.apply(this,arguments);try{shNuzKo(f)}catch(e){}return r};
const _slNz=settleLose;settleLose=function(){const f=fight;const r=_slNz.apply(this,arguments);try{shNuzKo(f)}catch(e){}return r};
function shNuzKo(f){if(!S.sh||!S.sh.nuz||!f||f.shNz||!f.o||f.o.mode!=="story"||f.shReplay)return;f.shNz=1;S.team.slice(0,3).forEach((d,k)=>{if(f.hp[k]<=0&&!d.nzDead){d.nzDead=1;S.sh.nuz.lost.push(d.id)}});
 const alive=S.team.filter(d=>!d.nzDead),dead=S.team.filter(d=>d.nzDead);S.team=alive.concat(dead);save()}
const _sbNz=startBattle;startBattle=function(o){try{const t=o||lastB;if(S.sh&&S.sh.nuz&&t&&t.mode==="story"&&S.team.slice(0,3).some(d=>d.nzDead)){toast("☠️ Nuzlocke : il te faut 3 dinos encore debout.");return}}catch(e){}return _sbNz(o)};
/* ---- cadeau de mise à jour ---- */
function shUpdGift(){ens();if(S.sh.gift===ARK_VERSION)return false;const first=!S.sh.gift&&!(S.cnt&&S.cnt.wins);S.sh.gift=ARK_VERSION;if(first){save();return false}give({tickets:3,essence:20});save();toast("🎁 Merci de revenir pour la version "+ARK_VERSION+" : +3 🎟️ +20 🔮",4000);return true}
/* ---- crédits ---- */
function shCredits(){openModal(`<h3 style="margin:0 0 6px">🎬 Crédits</h3><div class="shcred">
 <p><b>ARK: Primal World</b> — jeu de fan, 100 % local, fait avec HTML, CSS et JavaScript, livré par Electron.</p>
 <p><b>Ressources libres</b> : polices Orbitron et Exo 2 (SIL Open Font License), Bangers (OFL) ; textures « Particle Pack » et pièces du « UI Pack Sci-Fi » de Kenney (CC0 : curseur, viseur, style des cadres) ; icônes de la navigation et des ressources : game-icons.net (CC BY 3.0) par Lorc, Delapouite, Sbed ; portraits, décors, musiques et bruitages générés par le jeu lui-même.</p>
 <p><b>Outils</b> : Electron et electron-builder (MIT), Playwright (Apache 2.0) pour les tests.</p>
 <p class="tiny muted">⚠️ « ARK » est une marque de Studio Wildcard. Ce nom est provisoire : il faudra vérifier ses droits ou choisir un autre nom avant toute diffusion publique.</p></div><div class="btns"><button onclick="closeModal()">OK</button></div>`)}
/* ---- accueil : panneau « Partage et collection » ---- */
const _rSh=render;render=function(){_rSh();try{if(screen!=="home")return;const old=$$("shHome");if(old)old.remove();const ref=$$("u2fav")||document.querySelector("#home .banner");if(!ref)return;ens();
 ref.insertAdjacentHTML("afterend",`<div class="panel shhome" id="shHome"><b>🤝 Partage et extras</b><div class="shrow">
  <button class="secondary" onclick="shShare()">🔗 CODES ET DÉFIS</button><button class="secondary" onclick="shReplay()">🎞️ REVOIR LE DERNIER COMBAT</button><button class="secondary" onclick="shMuseum()">🏛️ MUSÉE</button><button class="secondary" onclick="shEncy()">📚 ENCYCLOPÉDIE</button>
  <button class="secondary" onclick="shGallery()">🖼️ FAN-ART</button><button class="secondary" onclick="shPetPick()">🐾 COMPAGNON</button><button class="secondary" onclick="shDecoShop()">🏕️ DÉCORER LE CAMP</button><button class="secondary" onclick="shProfiles()">👥 PROFILS</button>
  <button class="secondary" onclick="shMonth(true)">📊 MON MOIS</button><button class="secondary" onclick="shNuz(!S.sh.nuz)">☠️ ${S.sh.nuz?"FINIR LE NUZLOCKE ("+S.sh.nuz.lost.length+" perdus)":"DÉFI NUZLOCKE"}</button><button class="secondary" onclick="shCredits()">🎬 CRÉDITS</button></div></div>`)}catch(e){}};
function shShare(){ens();const tc=shTeamCode(),cc=shChalCode(Math.min(100,(S.stage||0)+1),"",(Date.now()%1e9));
 openModal(`<h3 style="margin:0 0 6px">🔗 Codes et défis</h3>
 <div class="panel"><b>Mon équipe</b><div class="tiny muted">Donne ce code à un ami : il affrontera ton équipe en duel amical (sur son ordinateur).</div><input class="shcode" readonly value="${tc}" onclick="this.select()"><button class="secondary" onclick="shCopy('${tc}');toast('Code copié.')">COPIER</button></div>
 <div class="panel"><b>Défi à partager</b><div class="tiny muted">Même niveau, même hasard : qui le gagne avec le moins d'actions ?</div><input class="shcode" readonly value="${cc}" onclick="this.select()"><button class="secondary" onclick="shCopy('${cc}');toast('Code copié.')">COPIER</button></div>
 <div class="panel"><b>Défi du jour</b><button class="secondary" onclick="shCopy(shDailyCode());toast('Ton résultat du jour est copié.')">COPIER MON RÉSULTAT</button></div>
 <div class="panel"><b>Entrer un code</b><input id="shIn" class="shcode" placeholder="ARKT1… / ARKC1… / ARKJ1…"><button onclick="shEnter($$('shIn').value)">VALIDER</button></div>
 <div class="btns"><button class="secondary" onclick="closeModal();go('battle');shSpectate()">👀 MODE SPECTATEUR</button><button onclick="closeModal()">FERMER</button></div>`)}
function shEnter(c){c=String(c||"").trim();closeModal();if(c.startsWith("ARKT1."))return shFriendFight(c);if(c.startsWith("ARKC1."))return shChalPlay(c);if(c.startsWith("ARKJ1."))return !!shDailyCmp(c);toast("Code inconnu.");return false}
if(!U_WD())setTimeout(()=>{try{shUpdGift();shMonth()}catch(e){}},2600);
ACH.push(["sh1","Ami des dinos","Gagner un duel amical",()=>(S.cnt||{}).shFriend||0,1,{tickets:2}],["sh2","Savant","Répondre juste à 10 questions du quiz",()=>(S.cnt||{}).shQuiz||0,10,{tickets:3}],["sh3","Conservateur","Exposer 6 dinos au musée",()=>((S.sh||{}).museum||[]).length,6,{essence:30}]);
const _winSh2=win;win=function(){const f=fight;const r=_winSh2.apply(this,arguments);try{if(f&&f.o&&f.o.mode==="friend"&&f.over==="win"&&!f.shCnt){f.shCnt=1;bump("shFriend")}}catch(e){}return r};
const _anSh=shAnswer;shAnswer=function(qi,j){const ok=S.sh&&S.sh.quiz&&S.sh.quiz.a[qi]===undefined&&j===QUIZ[qi][2];_anSh(qi,j);if(ok){bump("shQuiz");save()}};
if(typeof GUIDE!=="undefined")GUIDE.push(["Partage et extras","Accueil > Partage et extras : code de ton équipe (un ami l'affronte en duel amical), défis à partager (même niveau, même hasard), comparaison du Défi du jour, relecture du dernier combat, mode spectateur, musée, encyclopédie et quiz, fan-art, compagnon, décorations du camp, profils (avec duel entre profils), défi nuzlocke, résumé du mois, crédits."]);
