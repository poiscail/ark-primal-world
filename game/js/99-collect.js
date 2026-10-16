/* Collection I (0.35) : deux familles jouables (Mammifères W, Insectes I : 9 espèces dessinées avec les sprites des
   créatures), 4 variantes (Fossile, Cristal, Lave, Spectral), surnoms, favoris épinglés, affection (petits bonus et
   répliques), statistiques d'utilisation, verrou anti-recyclage, recyclage intelligent des doublons, comparateur de deux
   dinos, filtres (famille, élément, compétence, passif), tris (gènes, génération, affection), statistiques de collection. */
/* ---- familles et espèces ---- */
Object.assign(FAMFX,{W:"charge",I:"spikes"});Object.assign(FAMN3,{W:"mammifères",I:"insectes"});Object.assign(FAMNAME,{W:"Mammifères",I:"Insectes"});Object.assign(LINKNAME,{W:"Horde",I:"Essaim"});
Object.assign(SUPER_FAM,{W:{i:"🦣",n:"Piétinement",d:"dégâts +20 % et étourdit l'ennemi 1 tour"},I:{i:"🐝",n:"Essaim",d:"empoisonne l'ennemi 3 tours (12 % des dégâts de la super par tour)"}});
Object.assign(MS_SK2,{W:["stun","charge","roar","selfheal"],I:["poison","cleave","focus","drain"]});
Object.assign(MS_OPEN,{W:{i:"🦣",n:"Charge de horde",d:"brise la carapace du premier ennemi"},I:{i:"🐝",n:"Nuée",d:"le premier coup ennemi lui renvoie 30 %"}});
if(typeof WD_FAMT!=="undefined")Object.assign(WD_FAMT,{W:["géant à fourrure","chasseur des steppes"],I:["arthropode géant","bâtisseur infatigable"]});
const famBeast=(c,o)=>{const f=BEAST[o.b];if(!f)return"";const p={...bpal("greenorb",o.b),main:c.main,dark:c.dark,light:c.light};const r=f(p);return `<g transform="translate(0 2)">${r.b}${r.g}</g>`};
FAM.W=famBeast;FAM.I=famBeast;
const NEWSP3=[["mammoth","Mammouth laineux","🦣","Épique","blueorb",210,34,26,"stun","tank","W","platy"],["smilo","Smilodon","🐈","Rare","redorb",140,30,16,"execute","crit","W","gorgon"],
 ["megalo","Mégacéros","🫎","Commun","greenorb",104,18,14,"charge","swift","W","bison"],["megath","Mégathérium","🦫","Rare","greenorb",170,22,24,"selfheal","regen","W","andrew"],
 ["cbear","Ours des cavernes","🐻","Épique","purpleorb",200,36,22,"roar","berserk","W","boar"],["arthrop","Arthropleura","🪱","Épique","greenorb",190,30,28,"poison","thorns","I","arthro"],
 ["meganeu","Meganeura","🪰","Rare","blueorb",120,28,12,"focus","swift","I","meganeura"],["titanom","Titanomyrma","🐜","Commun","redorb",92,19,14,"cleave","leech","I","beetle"],
 ["mantis","Mante géante","🦗","Légendaire","purpleorb",240,48,22,"execute","crit","I","wasp"]];
NEWSP3.forEach(a=>{const k=a[0];if(Object.values(SPEC).some(s=>s.e===a[2]&&s!==SPEC[k]))return;const o={name:a[1],e:a[2],r:a[3],element:a[4],hp:a[5],atk:a[6],def:a[7],sk:a[8],pa:a[9]};
 if(!SPEC_DEFAULT[k])SPEC_DEFAULT[k]={...o};if(!SPEC[k])SPEC[k]={...o};SPEC[k].sk=SPEC[k].sk||a[8];SPEC[k].pa=SPEC[k].pa||a[9];PORT[k]=[a[10],{b:a[11],sc:.95}]});
/* effets de famille : ouverture du chef (99-mastery) et super (99-combat2) */
if(typeof msOpen==="function"){const _moCo=msOpen;msOpen=function(f){const was=f&&f.msOpenO;_moCo(f);try{if(!f||f.msOpenO===was||f.raid)return;const L=T3()[0];if(!L)return;const fam=msFam(L),e=f.enemies[f.wave];
 if(fam==="W"){if(e)e.sh=0}else if(fam==="I")f.thorn=Math.max(f.thorn||0,1)}catch(x){}}}
const _aaCo=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(f&&f._sup2&&dmg>0&&typeof c2Fam==="function"){const k=c2Fam(),e=f.enemies[f.wave];
 if(k==="W"){dmg=Math.round(dmg*1.2);f.stun=Math.max(f.stun||0,1)}else if(k==="I"&&e)f.dots.push({dmg:Math.max(1,Math.round(dmg*SUPER_TUNE*.12)),t:3})}return _aaCo(dmg,msg,endTurn)};
/* ---- variantes ---- */
Object.assign(VAR,{fossil:{n:"Fossile",hp:1.2,atk:1,def:1.35,w:1.2,col:"#d8c49a"},crystal:{n:"Cristal",hp:1.1,atk:1.15,def:1.2,w:1,col:"#9fe8ff"},
 lava:{n:"Lave",hp:1,atk:1.35,def:1,w:1,col:"#ff7a3c"},spectral:{n:"Spectral",hp:1.05,atk:1.25,def:.95,w:.8,col:"#c9b8ff"}});
const _rvCo=rollVariant;rollVariant=function(b){const v=_rvCo(b);if(v!=="normal")return v;let r=Math.random()*100;for(const k of ["fossil","crystal","lava","spectral"]){r-=VAR[k].w*(b||1);if(r<0)return k}return "normal"};
/* ---- état par dino : surnom, favori, verrou, affection, statistiques ---- */
const findD=id=>S.team.find(x=>x.id===id);
const AFF_LV=[0,10,30,60,100];
const affLv=d=>{const a=d&&d.aff||0;let l=0;AFF_LV.forEach((v,i)=>{if(a>=v)l=i});return l};
const AFF_LINES=["… (il t'observe encore avec méfiance)","Il vient se frotter contre ta jambe.","Il te suit partout dans le camp.","Il dort roulé en boule à côté de toi.","Il donnerait tout pour toi. Vraiment tout."];
const _stCo=stats;stats=function(d){const v=_stCo(d),l=affLv(d);if(!l)return v;return{...v,hp:Math.round(v.hp*(1+.01*l)),atk:Math.round(v.atk*(1+.01*l))}};
function coEnd(f,won){try{if(!f||f.coDone||!f.mx)return;f.coDone=1;const t=T3();t.forEach((d,k)=>{if(!d)return;const u=d.us||(d.us={b:0,w:0,ko:0});u.b++;if(won)u.w++;if(f.hp[k]<=0)u.ko++;if(won&&f.hp[k]>0)d.aff=Math.min(999,(d.aff||0)+1)})}catch(x){}}
const _winCo=win;win=function(){const f=fight,was=f&&f.over;_winCo();if(f&&!was&&f.over==="win")coEnd(f,true)};
const _rbCo=renderBattle;renderBattle=function(){_rbCo();const f=fight;if(f&&f.over==="lose")coEnd(f,false)};
function coNick(id){const d=findD(id);if(!d)return;askText("Surnom de ton "+SPEC[d.type].name,d.nick||"",v=>{v=String(v||"").trim().slice(0,16);if(v)d.nick=v;else delete d.nick;save();render()},16)}
function coFav(id){const d=findD(id);if(!d)return;d.fav=!d.fav;save();render()}
function coLock(id){const d=findD(id);if(!d)return;d.lock=!d.lock;save();render()}
const _recCo=recycle;recycle=function(id){const d=findD(id);if(d&&(d.lock||d.fav)){toast("🔒 Ce dino est verrouillé"+(d.fav?" (favori)":"")+" : déverrouille-le d'abord.");return}return _recCo(id)};
/* recyclage intelligent : garde le meilleur exemplaire de chaque espèce */
function coSmartList(){const t=S.team.map((d,i)=>({d,i})).filter(o=>o.i>=3&&!o.d.lock&&!o.d.fav&&!(o.d.star>0)&&(!o.d.v||o.d.v==="normal")&&!o.d.nick&&!o.d.gn&&!o.d.baby);
 const best={};S.team.forEach(d=>{const p=power(d);if(!best[d.type]||p>best[d.type].p)best[d.type]={id:d.id,p}});return t.filter(o=>best[o.d.type].id!==o.d.id).map(o=>o.d)}
function coSmart(){const L=coSmartList();if(!L.length){toast("Aucun doublon à recycler (les dinos verrouillés, favoris, éveillés, variantes, surnommés et issus du Nid sont gardés).");return}
 const R={};L.forEach(d=>Object.entries(recycleValue(d)).forEach(([k,v])=>R[k]=(R[k]||0)+v));
 openModal(`<h3 style="margin:0 0 6px">♻️ Recyclage intelligent</h3><div class="tiny">${L.length} doublon(s) seront recyclés ; le meilleur exemplaire de chaque espèce est gardé, ainsi que les dinos verrouillés, favoris, éveillés, variantes, surnommés et issus du Nid.</div><div class="tiny" style="margin:8px 0">${[...new Set(L.map(d=>d.type))].map(k=>art(SPEC[k].e)+" ×"+L.filter(d=>d.type===k).length).join(" · ")}</div><div><b>Récupéré : ${fmt(R)}</b></div>
 <div class="btns"><button class="secondary" onclick="closeModal()">ANNULER</button><button class="red" onclick="coSmartGo()">RECYCLER ${L.length}</button></div>`)}
function coSmartGo(){const L=new Set(coSmartList().map(d=>d.id)),R={};S.team.filter(d=>L.has(d.id)).forEach(d=>Object.entries(recycleValue(d)).forEach(([k,v])=>R[k]=(R[k]||0)+v));
 S.team=S.team.filter(d=>!L.has(d.id));give(R);bump("recycled",L.size);save();closeModal();toast("♻️ "+L.size+" doublons recyclés : "+fmt(R),3200);render()}
/* ---- carte : surnom, favori, verrou, affection, statistiques ---- */
const _cardCo=card;card=function(d,a){let h=_cardCo(d,a);if(!d||!S.team.some(x=>x.id===d.id))return h;const s=SPEC[d.type]||sp(d),l=affLv(d),u=d.us||{b:0,w:0,ko:0};
 if(d.nick)h=h.replace(`<b>${esc(s.name)}</b>`,`<b>${esc(d.nick)}</b> <span class="tiny muted">(${esc(s.name)})</span>`);
 h=h.replace(/<div class="panel/,`<div data-id="${d.id}" class="cocard${d.fav?" fav":""} panel`);
 const tags=`<div class="cotags">${d.fav?'<span class="chip fav">⭐ favori</span>':""}${d.lock?'<span class="chip">🔒</span>':""}<span class="chip" title="${esc(AFF_LINES[l])}">💕 Affection ${l}/4${l?" (+"+l+" %)":""}</span><span class="chip" title="Combats · victoires · K.O.">📊 ${u.b} · ${u.w} V · ${u.ko} KO</span></div>`;
 const ins=x=>{const i=h.lastIndexOf("</div>");return i<0?h+x:h.slice(0,i)+x+h.slice(i)};
 if(a===false)return ins(tags);
 return ins(tags+`<div class="btns cobtn"><button class="secondary" onclick="coNick(${d.id})">✏️ SURNOM</button><button class="secondary ${d.fav?"on":""}" onclick="coFav(${d.id})">${d.fav?"★":"☆"} FAVORI</button><button class="secondary ${d.lock?"on":""}" onclick="coLock(${d.id})">${d.lock?"🔓 DÉVERROUILLER":"🔒 VERROUILLER"}</button><button class="secondary" onclick="coCmpPick(${d.id})">⚖️ COMPARER</button></div>`)};
/* ---- comparateur ---- */
let coCmpA=null;
function coCmpPick(id){if(coCmpA===null||coCmpA===id||!findD(coCmpA)){coCmpA=id;toast("⚖️ Choisis un 2e dino à comparer (bouton COMPARER).",2600);return}const A=findD(coCmpA),B=findD(id);coCmpA=null;if(A&&B)coCmp(A,B)}
function coCmp(A,B){const row=(n,a,b,hi)=>`<tr><td class="${hi&&a>b?"best":""}">${a}</td><th>${n}</th><td class="${hi&&b>a?"best":""}">${b}</td></tr>`,sa=stats(A),sb=stats(B),ka=SK[SK_of(A)],kb=SK[SK_of(B)],pa=PA_of(A),pb=PA_of(B),nm=d=>esc(d.nick||SPEC[d.type].name);
 openModal(`<h3 style="margin:0 0 6px">⚖️ Comparaison</h3><table class="cocmp"><tr><td>${art(SPEC[A.type].e)}<b>${nm(A)}</b></td><th></th><td>${art(SPEC[B.type].e)}<b>${nm(B)}</b></td></tr>
 ${row("Rareté",esc(SPEC[A.type].r),esc(SPEC[B.type].r))}${row("Famille",esc(FAMNAME[msFam(A)]||""),esc(FAMNAME[msFam(B)]||""))}${row("Élément",ICO[SPEC[A.type].element]||"",ICO[SPEC[B.type].element]||"")}
 ${row("Niveau",A.level,B.level,1)}${row("Éveil",A.star||0,B.star||0,1)}${row("PV",sa.hp,sb.hp,1)}${row("Attaque",sa.atk,sb.atk,1)}${row("Défense",sa.def,sb.def,1)}${row("Puissance",power(A),power(B),1)}
 ${row("Compétence",ka?ka.i+" "+esc(ka.n):"",kb?kb.i+" "+esc(kb.n):"")}${row("Passif",pa&&PA[pa]?PA[pa].i+" "+esc(PA[pa].n):"—",pb&&PA[pb]?PA[pb].i+" "+esc(PA[pb].n):"—")}${row("Affection",affLv(A),affLv(B),1)}</table><div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
/* ---- filtres et tris supplémentaires (appliqués sur les cartes affichées) ---- */
let coF={fam:"all",el:"all",sk:"all",pa:"all",so:""};
function coSet(k,v){coF[k]=v;colF.lim=(coF.fam+coF.el+coF.sk+coF.pa!=="allallallall"||coF.so)?9999:12;render()}
const coMatch=d=>(coF.fam==="all"||msFam(d)===coF.fam)&&(coF.el==="all"||SPEC[d.type].element===coF.el)&&(coF.sk==="all"||SK_of(d)===coF.sk)&&(coF.pa==="all"||PA_of(d)===coF.pa);
const coKey={gene:d=>-((d.gn&&Object.values(d.gn).reduce((a,b)=>a+(+b||0),0))||0),gen:d=>-(d.gen||0),aff:d=>-(d.aff||0),fav:d=>d.fav?0:1};
const _rcCo=renderCollection;renderCollection=function(){_rcCo();try{const box=$$("collection"),tools=$$("colTools");if(!box||!tools)return;const cards=[...box.querySelectorAll(":scope > .cocard")];
 cards.forEach(c=>{const d=findD(+c.dataset.id);c.classList.toggle("subhide2",!!d&&!coMatch(d))});
 if(coF.so&&coKey[coF.so]){cards.sort((a,b)=>coKey[coF.so](findD(+a.dataset.id)||{})-coKey[coF.so](findD(+b.dataset.id)||{})).forEach(c=>box.appendChild(c));const more=box.querySelector(":scope > button.wide");if(more)box.appendChild(more)}
 const favs=S.team.filter(d=>d.fav);
 const sel=(k,opts)=>`<select data-co="${k}" onchange="coSet('${k}',this.value)">${opts.map(([v,t])=>`<option value="${v}" ${coF[k]===v?"selected":""}>${t}</option>`).join("")}</select>`;
 const fams=[...new Set(Object.keys(PORT).map(k=>PORT[k][0]))].filter(k=>FAMNAME[k]);
 tools.insertAdjacentHTML("beforeend",`<div class="tools cotools">${sel("fam",[["all","Toutes familles"],...fams.map(k=>[k,FAMNAME[k]])])}${sel("el",[["all","Tous éléments"],...["redorb","blueorb","greenorb","purpleorb","goldorb"].map(e=>[e,ICO[e]])])}${sel("sk",[["all","Toutes compétences"],...Object.keys(SK).map(k=>[k,SK[k].i+" "+SK[k].n])])}${sel("pa",[["all","Tous passifs"],...Object.keys(PA).map(k=>[k,PA[k].i+" "+PA[k].n])])}${sel("so",[["","Tri du jeu"],["fav","Favoris d'abord"],["gene","Tri : gènes"],["gen","Tri : génération"],["aff","Tri : affection"]])}</div>
  <div class="btns"><button class="secondary" onclick="coStats()">📊 STATISTIQUES</button><button class="red" onclick="coSmart()">♻️ RECYCLAGE INTELLIGENT</button></div>
  ${favs.length?`<div class="cofavs"><b>⭐ Favoris épinglés</b> ${favs.map(d=>`<button class="secondary" onclick="msHowTo&&msHowTo(${d.id})">${art(SPEC[d.type].e)} ${esc(d.nick||SPEC[d.type].name)} · ${d.level}</button>`).join("")}</div>`:""}`)}catch(e){}};
/* ---- statistiques de collection ---- */
function coStats(){ens();const own=new Set(S.team.map(d=>d.type)),all=Object.keys(SPEC),fams=[...new Set(all.map(k=>(PORT[k]||["T"])[0]))].filter(k=>FAMNAME[k]);
 const bar=(n,a,b)=>`<div class="costat"><span>${n}</span><div class="progress"><i style="width:${b?a/b*100:0}%"></i></div><b>${a}/${b}</b></div>`;
 const vars=Object.keys(VAR).filter(k=>k!=="normal");
 openModal(`<h3 style="margin:0 0 6px">📊 Statistiques de collection</h3><div class="tiny muted">${S.team.length} dinos · ${own.size}/${all.length} espèces (${Math.round(own.size/all.length*100)} %)</div>
 <b>Par rareté</b>${RAR5.map(r=>{const L=all.filter(k=>SPEC[k].r===r);return bar(r,L.filter(k=>own.has(k)).length,L.length)}).join("")}
 <b>Par famille</b>${fams.map(f=>{const L=all.filter(k=>(PORT[k]||["T"])[0]===f);return bar(FAMNAME[f],L.filter(k=>own.has(k)).length,L.length)}).join("")}
 <b>Variantes possédées</b><div class="covars">${vars.map(v=>{const n=S.team.filter(d=>d.v===v).length;return `<span style="border-color:${VAR[v].col};color:${VAR[v].col}" class="${n?"":"no"}">${esc(VAR[v].n)} ×${n}</span>`}).join("")}</div>
 <div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
/* ---- fiche « Comment le jouer » : affection et statistiques ---- */
if(typeof msHowTo==="function"){const _mhCo=msHowTo;msHowTo=function(id){_mhCo(id);try{const d=findD(id),mb=$$("modalBody");if(!d||!mb)return;const l=affLv(d),u=d.us||{b:0,w:0,ko:0},nx=AFF_LV[l+1];
 const h=`<div class="panel coaff"><b>💕 Affection ${l}/4</b> <span class="tiny muted">${nx?(d.aff||0)+"/"+nx+" victoires ensemble":"maximum"}</span><div class="tiny">« ${esc(AFF_LINES[l])} »</div><div class="tiny muted">📊 ${u.b} combats · ${u.w} victoires (${u.b?Math.round(u.w/u.b*100):0} %) · ${u.ko} K.O.</div></div>`;
 const box=mb.querySelector(".wdtale")||mb.querySelector(".btns");if(box)box.insertAdjacentHTML("beforebegin",h);else mb.insertAdjacentHTML("beforeend",h)}catch(e){}}}
ACH.push(["co1","Compagnon fidèle","Un dino avec une affection de 4",()=>Math.max(0,...S.team.map(affLv)),4,{tickets:5,essence:30}],["co2","Grande famille","Posséder une espèce de chaque nouvelle famille (mammifère et insecte)",()=>["W","I"].filter(f=>S.team.some(d=>msFam(d)===f)).length,2,{tickets:3}],
 ["co3","Collection rare","Posséder 4 variantes différentes",()=>new Set(S.team.filter(d=>d.v&&d.v!=="normal").map(d=>d.v)).size,4,{shards:20}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Collection","Deux nouvelles familles : les Mammifères (Mammouth, Smilodon, Mégacéros, Mégathérium, Ours des cavernes) et les Insectes (Arthropleura, Meganeura, Titanomyrma, Mante géante). Nouvelles variantes : Fossile, Cristal, Lave, Spectral. Sur chaque carte : surnom, favori (épinglé en haut de la collection), verrou (empêche le recyclage), comparaison avec un autre dino, affection (monte à chaque victoire ensemble, jusqu'à +4 % de PV et d'attaque) et statistiques d'utilisation. Le recyclage intelligent garde le meilleur exemplaire de chaque espèce."]);
