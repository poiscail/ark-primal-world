/* Chasses (0.33) : mini-boss errant du jour sur la carte d'histoire, boss secret de chaque chapitre (débloqué en finissant
   ses 10 niveaux sans perdre de dino), duels de champions (un seul dino contre un champion), raid en 3 phases sur la semaine,
   boss final secret après le Grand Nord (la Graine originelle). Combats par MODES (wander, secret, duel, seed), victoire par
   eventWin, défaite par settleLose. S.hunt garde l'état. */
const HU={wHp:1.3,wAtk:1.1,sHp:1.45,sAtk:1.15,dHp:1.9,dAtk:1.05,gHp:1.5,gAtk:1.1,duelTries:3};
const SECRET_N=["Spectre des Fougères","Mère des Lianes","Gardien Englouti","Roi des Ossements","Cœur de Magma","Dragon de Cendre","Œil du Néant","Colosse Runique","Avatar de l'Obélisque","Le Dernier Écho"];
const DUEL_CH=[{n:"Krâne-Noir",pt:"tyranno",el:"redorb"},{n:"Lame-d'Écume",pt:"spino",el:"blueorb"},{n:"Griffe-Sylve",pt:"carnota",el:"greenorb"},{n:"Tonnerre-Gris",pt:"giga",el:"purpleorb"},
 {n:"Sang-de-Braise",pt:"carcharo",el:"redorb"},{n:"Écaille-Givre",pt:"allo",el:"blueorb"},{n:"Ronce-Vive",pt:"utah",el:"greenorb"}];
const HU_ROT=["redorb","greenorb","blueorb"];
const _ensHU=ens;ens=function(){_ensHU();let H=S.hunt;if(!H||typeof H!=="object")H=S.hunt={};for(const k of ["clean","sec"])if(!H[k]||typeof H[k]!=="object")H[k]={};
 if(typeof H.wd!=="string")H.wd="";if(!H.du||typeof H.du!=="object")H.du={day:"",left:HU.duelTries,won:""};if(typeof H.seed!=="number")H.seed=0;if(typeof H.seedWk!=="number")H.seedWk=-1;
 const t=todayK();if(H.du.day!==t){H.du.day=t;H.du.left=HU.duelTries}};
/* ---- sprite de la Graine originelle ---- */
Object.assign(BEAST,{seed(c){let r="";for(let i=0;i<7;i++){const x=10+i*7.5;r+=S_(`M32 46 Q${(32+x)/2} ${52+i%3*2} ${x} ${56-i%2*2}`,c.dark,1.6,.85)}
 return{b:r+EL_(32,32,17,19,c.dark)+EL_(32,31,14,16,c.main)+P("M32 13 Q38 4 46 6 Q40 10 36 16Z",c.light)+P("M32 13 Q26 4 18 7 Q24 10 28 16Z",c.light)
  +S_("M24 24 Q32 30 40 24 M22 34 Q32 40 42 34",c.dark,1.2,.7)+C(32,32,6.5,c.glow,.85)+C(32,32,3,"#fff",.9),g:GEYE(26,28,1.2,c.eye)+GEYE(38,28,1.2,c.eye)}}});
BNAME.seed="La Graine originelle";EN_SPR["🌱"]="seed";BSC.seed=1.3;BHOME.seed=["Cœur de l'île","greenorb"];
/* ---- conditions ---- */
const huClean=n=>!!(S.hunt.clean[n]||(S.stars&&S.stars[n]>=3));
const huChClean=c=>{let k=0;for(let i=1;i<=10;i++)if(huClean(c*10+i))k++;return k};
const huSecOpen=c=>c>=0&&c<10&&(S.stage||0)>=c*10+10&&huChClean(c)>=10;
function huWanderN(){ens();if((S.stage||0)<5)return 0;return 1+dayHash("errant"+todayK())%Math.min(100,S.stage)}
const huWanderDone=()=>S.hunt.wd===todayK();
const huDuelCh=()=>DUEL_CH[dayHash("duel"+todayK())%DUEL_CH.length];
const huSeedOpen=()=>(S.stage||0)>=100&&typeof FAR_N!=="undefined"&&S.far&&S.far.stage>=FAR_N;
/* ---- combats ---- */
MODES.wander=function(o){const n=Math.max(1,Math.min(100,o.n||1)),z=zoneOf(n),zk=stageZone(z[0]),fo=(typeof FOES2!=="undefined"&&FOES2[zk])||[z[1][0]],eq=n+2,big=fo[n%fo.length];
 const en=mkEnemies(eq,{emo:[z[1][rnd(3)],z[1][rnd(3)],big],names:[z[0]+" · Ennemi",z[0]+" · Ennemi","Errant · "+(BNAME[EN_SPR[big]]||"Bête")],boss:true,hp:HU.wHp,atk:HU.wAtk,els:[EL[rnd(3)],EL[rnd(3)],z[2]]});
 en.forEach(e=>{e.tr="";e.hu=1});en[2].wander=1;en[2]._nm=1;return{eq,label:"Mini-boss errant · "+z[0]+" · niv. "+n,enemies:en}};
MODES.secret=function(o){const c=Math.max(0,Math.min(9,o.c||0)),n=c*10+10,z=zoneOf(n),eq=Math.min(115,n+4);
 const en=mkEnemies(eq,{emo:[z[1][0],z[1][1],"👹"],names:[z[0]+" · Spectre",z[0]+" · Spectre","Secret · "+SECRET_N[c]],boss:true,hp:HU.sHp,atk:HU.sAtk,els:[EL[rnd(3)],EL[rnd(3)],z[2]]});
 en.forEach(e=>{e.tr=""});en[2]._nm=1;return{eq,label:"Boss secret · "+z[0]+" · chapitre "+(c+1),enemies:en}};
MODES.duel=function(o){const C=DUEL_CH[o.ch]||DUEL_CH[0],d=S.team[o.k]||S.team[0],eq=Math.max(1,2*((d&&d.level)||1)-2),hp=Math.round(H(eq)*2.4*.45*HU.dHp),pt=SPEC[C.pt]?C.pt:"rex";
 const en=[0,1].map(()=>({hp:0,max:1,e:"🦴",name:"—",el:C.el,atk:1,boss:false})).concat([{hp,max:hp,e:"🥊",pt,name:"Champion · "+C.n,el:C.el,atk:Math.round(A(eq)*1.4*.55*HU.dAtk),boss:true,tr:"",_nm:1}]);
 return{eq,label:"Duel de champions · "+C.n,enemies:en}};
MODES.seed=function(o){const eq=(typeof FAR_EQ==="function"?FAR_EQ(FAR_N):110)+10;
 const en=mkEnemies(eq,{emo:["🐛","🦅","🌱"],names:["Racine originelle","Racine originelle","La Graine originelle"],boss:true,hp:HU.gHp,atk:HU.gAtk,els:["redorb","blueorb","greenorb"]});
 en.forEach(e=>{e.tr=""});en[2]._nm=1;return{eq,label:"Cœur de la jungle · La Graine originelle",enemies:en}};
const HU_MODES=new Set(["wander","secret","duel","seed"]);
const _sbHU=startBattle;startBattle=function(o){const t=o||lastB;if(t&&t.mode==="duel"){ens();if(S.hunt.du.left<=0){toast("Plus de duel aujourd'hui (3 par jour).");go("arena");return}if(!S.team[t.k]){toast("Choisis un dino de ton équipe.");return}}
 if(t&&t.mode==="secret"&&!huSecOpen(t.c)){toast("Termine les 10 niveaux de ce chapitre sans perdre de dino pour réveiller son boss secret.");return}
 if(t&&t.mode==="seed"&&!huSeedOpen()){toast("La Graine originelle se réveille après le Grand Nord.");return}
 const r=_sbHU(o);const f=fight;if(f&&f.o&&f.o.mode==="duel"&&!f.duSet){f.duSet=1;S.hunt.du.left--;save();f.duel={k:f.o.k};f.wave=2;document.querySelectorAll("#fxLayer .wavebn").forEach(x=>x.remove());f._lw=undefined;f.hp=f.hp.map((h,j)=>j===f.o.k?h:0);f.log="⚔ Duel : "+sp(S.team[f.o.k]).name+" affronte seul le champion !";renderBattle()}
 return r};
/* La Graine : deux mécaniques de boss (lianes + éruption) ; les boss secrets gardent celle de leur zone */
const _rbHU=renderBattle;renderBattle=function(){_rbHU();const f=fight;if(!f||!f.o||!HU_MODES.has(f.o.mode))return;
 if(f.o.mode==="seed"&&f.bm&&!f.sdBm){f.sdBm=1;f.bm=["lianes","eruption"]}
 const box=$$("battleArea"),st=box&&box.querySelector(".battlestage");if(st)st.classList.add("hu-"+f.o.mode);
 if(f.duel&&box)box.querySelectorAll(".sTeam .sFig").forEach((el,j)=>{if(j!==f.duel.k)el.classList.add("huout")})};
/* ---- victoires ---- */
function huWin(f){ens();const H=S.hunt,m=f.o.mode,R={stone:60+4*f.n},loot=[];let extra="";
 if(m==="wander"){if(!huWanderDone()){H.wd=todayK();R.stone+=60+8*f.o.n;R.essence=15;R.tickets=1;if(Math.random()<.5)loot.push(rollItem(f.n,1));extra='<div class="tiny ok">🐾 Mini-boss errant vaincu ! Un autre rôdera demain.</div>'}else extra='<div class="tiny muted">Récompense de l\'errant déjà reçue aujourd\'hui.</div>';bump("wanders")}
 if(m==="secret"){const c=f.o.c;if(!H.sec[c]){H.sec[c]=1;Object.assign(R,{tickets:5,shards:20,essence:50,crystal:5});loot.push(rollItem(f.n,2));extra=`<div class="tiny ok">💀 Boss secret vaincu : ${esc(SECRET_N[c])} !</div>`}else R.stone+=10*f.n;bump("secrets")}
 if(m==="duel"){if(H.du.won!==todayK()){H.du.won=todayK();R.tickets=2;R.essence=25;extra='<div class="tiny ok">🏆 Duel gagné : récompense du jour !</div>'}bump("duels")}
 if(m==="seed"){const w=wkNow();if(!H.seed){H.seed=1;H.seedWk=w;Object.assign(R,{tickets:10,shards:50,essence:100,crystal:20,amber:10});loot.push(rollItem(f.n,2));
   extra='<div class="panel huepi"><b>🌱 La Graine originelle s\'apaise</b><div class="tiny">« Ce n\'était pas une ennemie… seulement le cœur de l\'île, blessé par la corruption. Grâce à toi, la jungle respire de nouveau. » — Dr Elara</div></div>'}
  else if(H.seedWk!==w){H.seedWk=w;Object.assign(R,{tickets:3,essence:40});extra='<div class="tiny ok">🌱 Récompense de la semaine reçue.</div>'}else R.stone+=10*f.n;bump("seeds")}
 bump("bosses");return{R,extra,loot}}
const _ewHU=eventWin;eventWin=function(f,n){return f&&f.o&&HU_MODES.has(f.o.mode)?huWin(f):_ewHU(f,n)};
if(typeof chainNext==="function"){const _cnHU=chainNext;chainNext=function(f){return f&&f.o&&HU_MODES.has(f.o.mode)?null:_cnHU(f)}}
if(typeof balKey==="function"){const _bkHU=balKey;balKey=function(f){return f&&f.o&&HU_MODES.has(f.o.mode)?"chasse "+f.o.mode:_bkHU(f)}}
/* niveaux d'histoire gagnés sans perdre de dino */
const _winHU=win;win=function(){const f=fight,ok=f&&f.o&&f.o.mode==="story"&&!f.o.raid&&!f.o.daily&&!f.raid&&!f.daily&&f.hp&&f.hp.every(h=>h>0);const n=f&&f.n;
 _winHU();if(ok&&n){ens();S.hunt.clean[n]=1;const c=Math.floor((n-1)/10);if(huSecOpen(c)&&!S.hunt.sec[c]&&!S.hunt["ann"+c]){S.hunt["ann"+c]=1;toast("💀 Un boss secret s'éveille au chapitre "+(c+1)+" !",3600)}save()}};
/* ---- raid en 3 phases (la phase dépend de la part des PV détruits dans la semaine) ---- */
const huRaidPh=()=>{const p=100-S.raid.hp/S.raid.max*100;return p<34?1:p<67?2:3};
const HU_RPH=[null,{n:"Éveil",d:"le boss découvre ses forces"},{n:"Mue",d:"change d'élément, ATQ +20 %"},{n:"Furie",d:"change encore d'élément, ATQ +45 %"}];
const huRaidEl=(el,ph)=>{const i=HU_ROT.indexOf(el);return i<0?el:HU_ROT[(i+ph-1)%3]};
const _sbHU2=startBattle;startBattle=function(o){const r=_sbHU2(o);const f=fight;if(f&&f.raid&&!f.rPh){const ph=huRaidPh(),e=f.enemies[2];f.rPh=ph;
  if(ph>1){e.el=huRaidEl(e.el,ph);e.atk=Math.round(e.atk*(ph===2?1.2:1.45));f.log+=" · Phase "+ph+" : "+HU_RPH[ph].n+" ("+(ICO[e.el]||"")+")";renderBattle()}}return r};
const _rbHU2=renderBattle;renderBattle=function(){_rbHU2();const f=fight;if(!f||!f.raid||!f.rPh||f.over)return;const st=document.querySelector("#battleArea .battlestage");if(st)st.classList.add("rph"+f.rPh);
 const ch=document.querySelector("#battleArea .sHud .fchips");if(ch&&!ch.querySelector(".huph"))ch.insertAdjacentHTML("beforeend",`<span class="chip huph">Phase ${f.rPh}/3</span>`)};
if(typeof renderRaid==="function"){const _rrHU=renderRaid;renderRaid=function(){_rrHU();const el=$$("raid");if(!el||!S.raid)return;const ph=huRaidPh(),B=raidBoss(),e=huRaidEl(B.el,ph);
 const bn=el.querySelector(".banner");if(bn)bn.classList.add("rph"+ph);
 const p=el.querySelector(".panel");if(p)p.insertAdjacentHTML("afterend",`<div class="panel hurph"><b>Phase ${ph}/3 · ${HU_RPH[ph].n}</b> <span class="chip">${ICO[e]||""} élément actuel</span><div class="huphs">${[1,2,3].map(k=>`<span class="${k<ph?"done":k===ph?"on":""}">${k}. ${HU_RPH[k].n}<small>${HU_RPH[k].d}</small></span>`).join("")}</div><div class="tiny muted">La phase avance avec les dégâts de toute la semaine (34 % et 67 % détruits).</div></div>`)}}
/* ---- carte d'histoire : errant et boss secret ---- */
const _rsHU=renderStory;renderStory=function(){_rsHU();if(typeof nmView!=="undefined"&&nmView)return;const c=$$("chapters");if(!c||typeof mapCh!=="number")return;ens();
 const map=c.querySelector(".smap"),wn=huWanderN(),done=huWanderDone(),ch=mapCh,sec=huSecOpen(ch),k=huChClean(ch);
 if(map&&wn&&Math.floor((wn-1)/10)===ch){const i=(wn-1)%10,xs=[50,24,44,74,56,26,42,72,66,42],x=xs[i],y=92-i*9.2;
  map.insertAdjacentHTML("beforeend",`<button class="huwand ${done?"done":""}" style="left:${Math.min(92,x+9)}%;top:${y-4}%" ${done?"disabled":""} onclick="startBattle({mode:'wander',n:${wn}})" title="Mini-boss errant">${done?"✅":"🐾"}</button>`)}
 if(map&&(S.stage||0)>=ch*10+1)map.insertAdjacentHTML("beforeend",`<button class="husec ${sec?"open":""} ${S.hunt.sec[ch]?"won":""}" ${sec?"":"disabled"} onclick="startBattle({mode:'secret',c:${ch}})" title="${sec?"Boss secret : "+esc(SECRET_N[ch]):"Boss secret : "+k+"/10 niveaux sans perte"}">${S.hunt.sec[ch]?"🏅":sec?"💀":"❔"}<small>${sec?"SECRET":k+"/10"}</small></button>`);
 const mw=c.querySelector(".mapwrap");if(mw&&(S.stage||0)>=5)mw.insertAdjacentHTML("beforebegin",`<div class="panel huhint"><div class="row"><span class="bigicon">🐾</span><div class="grow"><b>Mini-boss errant du jour</b><div class="tiny muted">${done?"Vaincu aujourd'hui : un autre rôdera demain.":"Il rôde près du niveau "+wn+" (chapitre "+(Math.floor((wn-1)/10)+1)+")."}</div></div>${done?"":`<button class="red" onclick="startBattle({mode:'wander',n:${wn}})">TRAQUER</button>`}</div>
  <div class="row"><span class="bigicon">${S.hunt.sec[ch]?"🏅":sec?"💀":"❔"}</span><div class="grow"><b>Boss secret du chapitre ${ch+1}</b><div class="tiny muted">${S.hunt.sec[ch]?esc(SECRET_N[ch])+" vaincu.":sec?esc(SECRET_N[ch])+" t'attend !":"Termine chaque niveau du chapitre sans perdre de dino ("+k+"/10)."}</div></div>${sec?`<button class="${S.hunt.sec[ch]?"secondary":"red"}" onclick="startBattle({mode:'secret',c:${ch}})">${S.hunt.sec[ch]?"REJOUER":"RÉVEILLER"}</button>`:""}</div></div>`)};
/* ---- duels : panneau de l'Arène ---- */
function huDuelPick(){ens();const C=huDuelCh(),ci=DUEL_CH.indexOf(C),t=S.team.slice(0,3);
 openModal(`<h3 style="margin:0 0 4px">⚔ Duel contre ${esc(C.n)}</h3><div class="tiny muted">Un seul de tes dinos affronte le champion. Les deux autres restent sur la touche. Le champion s'adapte au niveau du dino choisi.</div>
  <div class="hudpick">${t.map((d,k)=>`<button class="secondary" onclick="closeModal();startBattle({mode:'duel',k:${k},ch:${ci}})">${art(sp(d).e)}<b>${esc(sp(d).name)}</b><small>Niv. ${d.level} · ${ICO[sp(d).element]||""}</small></button>`).join("")}</div><div class="btns"><button class="secondary" onclick="closeModal()">ANNULER</button></div>`)}
const _raHU=renderArena;renderArena=function(){_raHU();const el=$$("arena");if(!el)return;ens();const C=huDuelCh(),D=S.hunt.du,won=D.won===todayK(),pt=SPEC[C.pt]?C.pt:"rex";
 const h=`<div class="panel huduel"><div class="row"><span class="bigicon hudch">${PREFS.art==="svg"&&typeof corruptSVG==="function"?corruptSVG(pt,C.el,{boss:true}):"🥊"}</span><div class="grow"><b>⚔ Duel de champions : ${esc(C.n)}</b> <span class="chip">${ICO[C.el]||""}</span><div class="tiny muted">Un seul dino contre le champion du jour. ${won?"✅ Récompense du jour reçue.":"Victoire : +2 🎟️ +25 🔮."} Tentatives : ${D.left}/${HU.duelTries}.</div></div><button class="red" ${D.left>0?"":"disabled"} onclick="huDuelPick()">DÉFIER</button></div></div>`;
 const b=el.querySelector(".banner");if(b)b.insertAdjacentHTML("afterend",h);else el.insertAdjacentHTML("afterbegin",h)};
/* ---- la Graine originelle : panneau du Grand Nord ---- */
if(typeof renderFar==="function"){const _rfHU=renderFar;renderFar=function(){_rfHU();const el=$$("far");if(!el)return;ens();const ok=huSeedOpen(),H=S.hunt,wk=H.seedWk===wkNow();
 const h=`<div class="panel huseed ${ok?"open":""}"><div class="row"><span class="bigicon">${ok&&PREFS.art==="svg"&&typeof beastSVG==="function"?beastSVG("seed","greenorb",true):"🌱"}</span><div class="grow"><b>${ok?"La Graine originelle":"??? — un secret dort au cœur de l'île"}</b><div class="tiny muted">${ok?(H.seed?"Apaisée. Elle se réveille chaque semaine ("+(wk?"déjà affrontée cette semaine":"récompense de la semaine disponible")+").":"Le cœur de l'île, rongé par la corruption. Deux mécaniques de boss à la fois."):"Termine l'histoire (100) et le Grand Nord ("+(typeof FAR_N!=="undefined"?FAR_N:40)+") pour la réveiller."}</div></div>${ok?`<button class="red" onclick="startBattle({mode:'seed'})">${H.seed?"AFFRONTER":"RÉVEILLER"}</button>`:""}</div></div>`;
 const b=el.querySelector(".banner");if(b)b.insertAdjacentHTML("afterend",h);else el.insertAdjacentHTML("beforeend",h)}}
/* ---- succès et guide ---- */
ACH.push(["hu1","Chasseur d'errants","Vaincre 10 mini-boss errants",()=>(S.cnt||{}).wanders||0,10,{tickets:3,essence:20}],
 ["hu2","Sans une égratignure","Vaincre un boss secret",()=>Object.keys((S.hunt||{}).sec||{}).length,1,{shards:10,essence:20}],
 ["hu3","Champion des champions","Gagner 7 duels",()=>(S.cnt||{}).duels||0,7,{tickets:5}],
 ["hu4","Gardien de la Graine","Apaiser la Graine originelle",()=>(S.hunt||{}).seed||0,1,{essence:100,tickets:5}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Chasses : errants, secrets, duels","Chaque jour, un mini-boss errant 🐾 rôde près d'un niveau déjà terminé de l'histoire (carte). Chaque chapitre cache un boss secret 💀 : termine ses 10 niveaux sans perdre de dino pour le réveiller. Dans l'Arène, le duel de champions oppose un seul de tes dinos au champion du jour (3 essais par jour). Le boss du Raid change de phase pendant la semaine (34 % et 67 % détruits) : il change d'élément et frappe plus fort. Après l'histoire et le Grand Nord, la Graine originelle t'attend."]);
