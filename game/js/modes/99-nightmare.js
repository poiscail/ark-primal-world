/* Histoire Cauchemar (0.22) : les 100 niveaux de l'histoire rejoués sur une île corrompue (bouton « 🌑 Cauchemar » de l'écran Histoire).
   Un chapitre de 10 niveaux s'ouvre quand son gardien a été vaincu en mode normal. Ennemis bien plus forts (niveau ×1,2 + 6),
   chacun avec un trait (Carapace, Venimeux, Régénérant, Berserker) et une compétence annoncée dans le HUD ; gardiens à compétence
   et à 3 phases. Étoiles et paliers séparés ; Éclats d'ombre 🌑 (surtout à la première victoire) pour la boutique de l'ombre :
   Rite d'ombre (variante Ombre au choix), œuf épique, talisman légendaire, tickets. Combats via MODES.nightmare (80-modes). */
let NM_LV={k:1.2,b:6},NM_TUNE={hp:1,atk:1},nmView=false,nmCh=null;/* niveau des ennemis = niveau × k + b ; NM_TUNE : PV/ATQ (réglés par simulation) */
const NM_EQ=n=>Math.round(n*NM_LV.k)+NM_LV.b,NM_STEP=30;
const _ensNm=ens;ens=function(){_ensNm();let N=S.nm;if(!N||typeof N!=="object")N=S.nm={};if(!N.stars||typeof N.stars!=="object")N.stars={};for(const k of ["stage","starCl","shards","rites"])if(!(N[k]>=0))N[k]=0};
/* chapitre c (niveaux 10c-9 … 10c) ouvert quand le gardien du niveau 10c est vaincu en mode normal */
const nmOpen=n=>{ens();return n>=1&&n<=100&&n<=S.nm.stage+1&&Math.ceil(n/10)*10<=(S.stage||0)};
function nmStarTotal(){ens();return Object.values(S.nm.stars).reduce((a,b)=>a+b,0)}
MODES.nightmare=function(o){const n=Math.max(1,Math.min(100,o.n||1)),eq=NM_EQ(n),z=zoneOf(n),boss=n%10===0;
 const en=mkEnemies(eq,{emo:[z[1][rnd(3)],z[1][rnd(3)],boss?"👹":"🦖"],names:["Cauchemar · Ennemi","Cauchemar · Ennemi",boss?"Gardien du cauchemar · "+z[0]:"Cauchemar · Élite"],hp:NM_TUNE.hp,atk:NM_TUNE.atk,boss,els:[EL[rnd(3)],EL[rnd(3)],z[2]]});
 en.forEach((e,i)=>{e.tr="";if(!e.boss){e.tr=TKEYS[rnd(TKEYS.length)];if(e.tr==="shield")e.sh=Math.round(e.max*.2);if(e.tr==="berserk")e.a0=e.atk}
  if(typeof ES_TOWER!=="undefined"){e.esk=ES_TOWER[rnd(ES_TOWER.length)];e.skcd=ES_FIRST+i%2}});
 return{eq,label:"Cauchemar · Niv. "+n+" · "+z[0],enemies:en}};
const _sbNm=startBattle;startBattle=function(o){const t=o||lastB;if(t&&t.mode==="nightmare"&&!nmOpen(t.n)){toast("Ce niveau Cauchemar est encore verrouillé.");nmView=true;go("story");return}return _sbNm(o)};
/* victoire (appelée par 80-modes : win → eventWin) */
function nmWin(f){ens();const N=S.nm,lv=f.o.n,boss=lv%10===0,first=lv>N.stage,R={stone:25+3*lv,bone:2+rnd(3),hide:1+rnd(3)};if(boss){R.crystal=1+rnd(2);R.amber=1+rnd(2)}
 const sh=first?(boss?12:3)+Math.floor(lv/20):(boss?2:1);if(first){N.stage=lv;if(boss)R.tickets=2;else if(lv%5===0)R.tickets=1}
 N.shards+=sh;bump("nightmares");if(boss)bump("bosses");const st=starsOf(f);if(st>(N.stars[lv]||0))N.stars[lv]=st;
 return{R,extra:`<div class="tiny ok" style="margin-top:4px">🌑 +${sh} éclat${sh>1?"s":""} d'ombre${first?" · première victoire !":""}</div>`+(lv<100&&nmOpen(lv+1)?`<button class="wide purple" onclick="startBattle({mode:'nightmare',n:${lv+1}})">CAUCHEMAR SUIVANT (${lv+1})</button>`:""),
  loot:boss&&Math.random()<.5?[rollItem(f.n,1)]:[]}}
const _ewNm=eventWin;eventWin=function(f,n){return f&&f.o&&f.o.mode==="nightmare"?nmWin(f):_ewNm(f,n)};
if(typeof chainNext==="function"){const _cnNm=chainNext;chainNext=function(f){if(f&&f.o&&f.o.mode==="nightmare"){const n=f.o.n+1;return nmOpen(n)?{mode:"nightmare",n}:null}return _cnNm(f)}}
if(typeof balKey==="function"){const _bkNm=balKey;balKey=function(f){return f&&f.o&&f.o.mode==="nightmare"?"cauchemar n"+f.o.n:_bkNm(f)}}
/* scène : île corrompue */
const _rbNm=renderBattle;renderBattle=function(){_rbNm();const f=fight;if(!f||!f.o||f.o.mode!=="nightmare")return;const st=document.querySelector("#battleArea .battlestage");if(st)st.classList.add("nm")};
/* ---- paliers d'étoiles et boutique de l'ombre ---- */
function nmStarClaim(){ens();const t=nmStarTotal(),N=S.nm;if(t<(N.starCl+1)*NM_STEP)return;N.starCl++;give({tickets:2,essence:25,shards:8});N.shards+=10;save();toast("🌑 Palier "+N.starCl*NM_STEP+" étoiles noires : +2 🎟️ +25 🔮 +8 🧩 +10 🌑",3800);sfx&&sfx("win");render()}
const NM_SHOP=[{k:"rite",i:"🌑",n:"Rite d'ombre",d:"Un dino de ta collection (sans variante) devient une variante Ombre : ATQ ×1,3, PV ×0,95.",c:60},
 {k:"egg",i:"🌟",n:"Œuf épique",d:"Pour ton incubateur.",c:35,fx:()=>addEgg("epic")},
 {k:"charm",i:"🧿",n:"Talisman légendaire",d:"Objet d'équipement légendaire avec un attribut spécial.",c:45,fx:()=>addItem(newItem("c",3))},
 {k:"tix",i:"🎟️",n:"3 tickets d'invocation",d:"",c:15,fx:()=>give({tickets:3})}];
function nmBuy(k){ens();const it=NM_SHOP.find(x=>x.k===k);if(!it)return;if(S.nm.shards<it.c){toast("Il faut "+it.c+" 🌑");return}
 if(k==="rite"){nmRitePick();return}if(it.fx()===false){toast("Impossible pour l'instant (incubateur ou sac plein).");return}S.nm.shards-=it.c;save();sfx&&sfx("buy");toast(it.i+" "+it.n,2400);render()}
const nmRiteList=()=>S.team.filter(d=>!d.v||d.v==="normal").sort((a,b)=>power(b)-power(a));
function nmRitePick(){ens();const L=nmRiteList();if(!L.length){toast("Aucun dino sans variante.");return}
 openModal(`<div class="row"><div class="grow"><h2 style="margin:0">🌑 Rite d'ombre</h2><div class="muted tiny">Choisis le dino qui deviendra une variante Ombre (ATQ ×1,3, PV ×0,95, DÉF ×0,9). Coût : ${NM_SHOP[0].c} 🌑. Définitif.</div></div><button class="secondary" onclick="closeModal()">FERMER</button></div>
 <div class="nmrite">${L.slice(0,24).map(d=>`<button class="nmr" onclick="nmRite(${d.id})"><span class="nmp">${PREFS.art==="svg"?`<span class="pt">${portrait(d.type,true)}</span>`:art(sp(d).e)}</span><b>${esc(sp(d).name)}</b><small>Niv. ${d.level}${d.star?" · "+d.star+"★":""} · ⚔ ${power(d)}</small></button>`).join("")}</div>`)}
function nmRite(id){ens();const d=S.team.find(x=>x.id===id),c=NM_SHOP[0].c;if(!d||(d.v&&d.v!=="normal"))return;if(S.nm.shards<c){toast("Il faut "+c+" 🌑");return}
 S.nm.shards-=c;d.v="shadow";S.nm.rites++;bump("variants");log(SPEC[d.type].name+" devient une variante Ombre (Rite d'ombre).");save();closeModal();sfx&&sfx("legend");toast("🌑 "+SPEC[d.type].name+" Ombre !",3000);render()}
/* ---- écran : bouton Normal / Cauchemar dans Histoire, carte des chapitres corrompus ---- */
function nmToggle(v){nmView=!!v;mapCh=null;nmCh=null;render();window.scrollTo(0,0)}
const NM_BN=["MODE CAUCHEMAR","L'île corrompue","Les 100 niveaux, dans une version corrompue de l'île : ennemis plus forts, tous dotés d'un trait et d'une compétence."];
let nmBn0=null;
function nmBanner(){const b=document.querySelector("#story .banner");if(!b)return;const ey=b.querySelector(".eyebrow"),h=b.querySelector("h1"),p=b.querySelector("p");if(!ey||!h||!p)return;
 if(!nmBn0)nmBn0=[ey.textContent,h.textContent,p.textContent];const t=nmView?NM_BN:nmBn0;ey.textContent=t[0];h.textContent=t[1];p.textContent=t[2];b.classList.toggle("nmbn",nmView)}
function nmSwitchHTML(){const ok=(S.stage||0)>=10;return `<div class="nmswitch"><button class="${nmView?"secondary":"on"}" onclick="nmToggle(false)">📜 Normal</button><button class="${nmView?"on":"secondary"}" ${ok?"":"disabled"} onclick="nmToggle(true)" title="${ok?"Les 100 niveaux sur l'île corrompue":"Bats le gardien du niveau 10 pour ouvrir le Cauchemar"}">🌑 Cauchemar${ok?"":" 🔒"}</button></div>`}
function renderNmStory(){ens();const N=S.nm,cur=Math.min(100,N.stage+1),maxCh=Math.max(0,Math.floor((S.stage||0)/10)-1);if(nmCh===null)nmCh=Math.min(maxCh,Math.floor((cur-1)/10));
 const c0=nmCh*10+1,zn=zoneOf(c0)[0],z=stageZone(zn),tot=nmStarTotal(),next=(N.starCl+1)*NM_STEP,chOpen=nmCh<=maxCh;
 const pos=i=>{const xs=[50,24,44,74,56,26,42,72,66,42];return{x:xs[i],y:92-i*9.2}};let path="";for(let i=0;i<10;i++){const p=pos(i);path+=(i?" L":"M")+p.x+" "+p.y}
 const nodes=[...Array(10)].map((_,i)=>{const n=c0+i,p=pos(i),boss=n%10===0,done=n<=N.stage,isCur=n===cur&&chOpen,lock=!nmOpen(n),st=N.stars[n]||0;
  return `<button class="mnode ${boss?"boss":""} ${done?"done":""} ${isCur?"cur":""} ${lock?"lock":""}" style="left:${p.x}%;top:${p.y}%" ${lock?"disabled":""} onclick="startBattle({mode:'nightmare',n:${n}})"><span class="mn">${boss?"👹":n}</span>${done?`<span class="mst">${[1,2,3].map(k=>`<i class="${k<=st?"on":""}">★</i>`).join("")}</span>`:""}${boss?`<span class="mbl">GARDIEN ${n}</span>`:""}</button>`}).join("");
 const chSt=[...Array(10)].reduce((a,_,i)=>a+(N.stars[c0+i]||0),0);
 const shop=NM_SHOP.map(x=>`<div class="pprow"><span class="ppi">${x.i}</span><div class="grow"><b>${esc(x.n)}</b>${x.d?`<div class="muted tiny">${esc(x.d)}</div>`:""}</div><button class="${N.shards>=x.c?"purple":"secondary"}" onclick="nmBuy('${x.k}')">${x.c} 🌑</button></div>`).join("");
 $$("chapters").innerHTML=nmSwitchHTML()+`<div class="panel nmhead"><div class="todohead"><b>🌑 Cauchemar : ${N.stage}/100</b><span class="chip nmshards">🌑 ${N.shards} éclats d'ombre</span></div><div class="progress"><i style="width:${N.stage}%;background:linear-gradient(90deg,#7a1fd1,#ff2f6d)"></i></div>
  <div class="muted tiny">Chaque chapitre s'ouvre quand son gardien est vaincu en mode normal. Ennemis de niveau ${NM_EQ(c0)} à ${NM_EQ(c0+9)} dans ce chapitre, tous avec un trait et une compétence. Première victoire : 🌑 éclats d'ombre et tickets.</div>
  ${cur<=100&&nmOpen(cur)?`<button class="wide purple" onclick="startBattle({mode:'nightmare',n:${cur}})">🌑 JOUER LE CAUCHEMAR ${cur}</button>`:N.stage>=100?'<div class="ok">Cauchemar terminé ! 🌑</div>':`<div class="tiny muted" style="margin-top:6px">🔒 Prochain chapitre : bats le gardien du niveau ${Math.ceil(cur/10)*10} en mode normal.</div>`}
  <div class="starbar"><span>🌑 ${tot} étoiles noires</span><div class="progress"><i style="width:${Math.min(100,(tot-N.starCl*NM_STEP)/NM_STEP*100)}%;background:linear-gradient(90deg,#c58bff,#ff2f6d)"></i></div><button ${tot>=next?"":"disabled"} onclick="nmStarClaim()">${tot>=next?"🎁 Palier "+next:"Palier "+next}</button></div></div>
  <div class="panel mapwrap nmmapwrap"><div class="maphead"><button class="secondary" ${nmCh?"":"disabled"} onclick="nmCh=${nmCh-1};render()">‹</button><div><b>Chapitre ${nmCh+1} · ${esc(zn)} corrompu${zn==="Ruines"?"es":""}</b><div class="muted tiny">Niveaux ${c0}–${c0+9} · 🌑 ${chSt}/30</div></div><button class="secondary" ${nmCh<9?"":"disabled"} onclick="nmCh=${nmCh+1};render()">›</button></div>
  <div class="smap nm z-${z}">${sceneHTML(z)}<svg class="mpath" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${path}" class="mp1"/><path d="${path}" class="mp2"/></svg>${nodes}</div></div>
  <div class="sectionhead"><h2>Boutique de l'ombre</h2><span class="tag">🌑 ${N.shards}</span></div><div class="panel nmshop">${shop}</div>`}
const _rsNm=renderStory;renderStory=function(){if(nmView&&(S.stage||0)>=10)renderNmStory();else{if(nmView)nmView=false;_rsNm();const c=$$("chapters");if(c&&(S.stage||0)>=1)c.insertAdjacentHTML("afterbegin",nmSwitchHTML())}nmBanner()};
/* ---- missions, succès, guide, « À faire » ---- */
DAILY.push({id:"d_nm",t:"nightmares",g:2,n:"Réussir 2 niveaux Cauchemar",r:{essence:4,crystal:1}});
[10,50,150].forEach((g,i)=>PERM.push({id:"p_nm"+g,t:"nightmares",g,n:g+" niveaux Cauchemar réussis",r:{tickets:i+1,crystal:i+1,stone:100*(i+1)}}));
ACH.push(["nm1","Rêveur éveillé","Réussir le niveau 10 du Cauchemar",()=>S.nm.stage,10,{tickets:3,essence:30}],
 ["nm2","Briseur de cauchemars","Réussir le niveau 50 du Cauchemar",()=>S.nm.stage,50,{tickets:5,shards:30}],
 ["nm3","Seigneur des cauchemars","Réussir le niveau 100 du Cauchemar",()=>S.nm.stage,100,{tickets:10,shards:60},"Seigneur des Cauchemars"],
 ["nm4","Étoiles noires","Obtenir 90 étoiles en Cauchemar",()=>nmStarTotal(),90,{essence:50,tickets:2}]);
const _tdNm=todoItems;todoItems=function(){const L=_tdNm();try{ens();if(S.nm.stage===0&&nmOpen(1))L.push({i:"🌑",t:"Nouveau : l'histoire en mode Cauchemar",js:"nmToggle(true);go('story')"})}catch(e){}return L};
if(typeof GUIDE!=="undefined")GUIDE.push(["Mode Cauchemar","Histoire > 🌑 Cauchemar : les 100 niveaux sur une île corrompue. Un chapitre s'ouvre quand son gardien est vaincu en mode normal. Tous les ennemis ont un trait et une compétence annoncée dans le HUD (protège-toi avant leurs coups). Étoiles noires et paliers séparés ; les éclats d'ombre 🌑 (surtout à la première victoire) s'échangent contre un Rite d'ombre (variante Ombre au choix), des œufs épiques, des talismans légendaires et des tickets."]);
