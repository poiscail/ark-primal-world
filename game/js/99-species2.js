/* La grande migration (0.24) : 26 nouvelles espèces (surtout dans les familles qui en manquaient : stégosaures, cératopsiens,
   ankylosaures, ptérosaures, sauropodes, hadrosaures, reptiles marins), 8 compétences actives et 6 attributs passifs nouveaux,
   7 chaînes d'évolution. Chargé avant 99-maze/99-nightmare/99-trials (leurs règles, ex. « sans compétences », restent prioritaires).
   Les compétences nouvelles passent par useSkill : le moteur de base règle recharge, compteur et fin d'action ; ce module ajoute
   l'effet et les dégâts (f._skx, repris par le wrapper d'afterAction). */
/* ---- compétences ---- */
Object.assign(SK,{
 multi:{n:"Ruée frénétique",i:"🌪️",cd:5,d:"Trois coups de 0,9× l'attaque (2,7× au total)."},
 pierce:{n:"Coup perforant",i:"🗡️",cd:4,d:"Inflige 2× l'attaque, brise le bouclier de l'ennemi et ignore sa carapace."},
 quake:{n:"Piétinement",i:"🦶",cd:5,d:"Inflige 1,6× l'attaque ; une chance sur deux d'étourdir l'ennemi."},
 weaken:{n:"Hurlement de terreur",i:"😱",cd:5,d:"L'ennemi perd 35 % d'attaque pendant 3 tours."},
 fortify:{n:"Ancrage",i:"⛰️",cd:5,d:"Le lanceur attire toutes les attaques ciblées et en subit 60 % de moins pendant 2 tours."},
 revive:{n:"Cri de ralliement",i:"📯",cd:6,d:"Ranime un dino KO avec 40 % de ses PV ; sinon, soigne toute l'équipe de 20 %."},
 convert:{n:"Éclat élémentaire",i:"💠",cd:4,d:"4 orbes prennent l'élément du lanceur."},
 rally:{n:"Danse de guerre",i:"🥁",cd:5,d:"Toute l'équipe : +20 % d'attaque pendant 3 tours, et la super attaque monte de 25 %."}});
/* ---- attributs passifs ---- */
Object.assign(PA,{
 counter:{n:"Contre-attaque",i:"↩️",d:"25 % de chances de riposter (0,8× l'attaque) quand il est touché."},
 scavenger:{n:"Charognard",i:"🍖",d:"Récupère 15 % de ses PV quand un ennemi est vaincu."},
 pack:{n:"Instinct de meute",i:"🐾",d:"+6 % d'attaque par allié vivant de la même famille (+12 % au plus)."},
 armor:{n:"Écailles épaisses",i:"🧱",d:"Subit 30 % de dégâts en moins des attaques puissantes et de zone."},
 charger:{n:"Énergie primordiale",i:"🔋",d:"Chaque orbe jouée remplit la super attaque de 6 % en plus."},
 ambush:{n:"Embuscade",i:"🥷",d:"+35 % de dégâts contre un ennemi à plus de 80 % de ses PV."}});
if(typeof CHARM_PA!=="undefined"){CHARM_PA.push("counter","ambush","charger","scavenger");if(typeof CHARM_PA_L!=="undefined")CHARM_PA_L.push("counter","ambush","charger","scavenger","pack","armor")}
/* ---- espèces : [clé, nom, image, rareté, élément, PV, ATQ, DÉF, compétence, attribut, portrait] ---- */
const NEWSP2=[
 ["huayang","Huayangosaure","🦓","Commun","redorb",98,17,15,"pierce","armor",["G",{sc:.85}]],
 ["dacentru","Dacentrurus","🍂","Rare","redorb",148,25,21,"pierce","counter",["G",{sc:1.02}]],
 ["wuerho","Wuerhosaure","🏔️","Légendaire","redorb",252,45,27,"fortify","counter",["G",{sc:1.15,fx:"lava"}]],
 ["miragaia","Miragaia","🦒","Épique","goldorb",196,35,24,"weaken","armor",["G",{sc:1.08,fx:"star"}]],
 ["proto","Protocératops","🦡","Commun","blueorb",100,16,15,"fortify","counter",["C",{sc:.8}]],
 ["chasmo","Chasmosaure","🌺","Rare","blueorb",150,24,21,"weaken","armor",["C",{}]],
 ["kosmo","Kosmocératops","🎋","Épique","blueorb",200,35,24,"pierce","counter",["C",{nb:1,sc:1.05,fx:"frill"}]],
 ["titano","Titanocératops","🗻","Légendaire","blueorb",262,43,29,"fortify","pack",["C",{nb:1,sc:1.15,fx:"wave"}]],
 ["nodo","Nodosaure","🐚","Commun","purpleorb",115,14,22,"fortify","armor",["A",{sc:.85}]],
 ["euoplo","Euoplocéphale","🦀","Rare","purpleorb",162,21,26,"weaken","counter",["A",{sp:1}]],
 ["zuul","Zuul","🦞","Épique","purpleorb",215,31,30,"pierce","armor",["A",{sp:1,sc:1.1,fx:"bolt"}]],
 ["rhampho","Rhamphorhynchus","🐦","Commun","goldorb",76,20,7,"multi","ambush",["F",{sc:.8}]],
 ["tapejara","Tapejara","🦩","Rare","goldorb",105,29,10,"convert","charger",["F",{cr:1}]],
 ["hatzeg","Hatzegopteryx","🦢","Épique","goldorb",172,41,15,"multi","ambush",["F",{sc:1.12,cr:1}]],
 ["tropeo","Tropéognathe","🌠","Légendaire","goldorb",222,49,19,"convert","charger",["F",{sc:1.18,fe:1,fx:"sun"}]],
 ["brachio","Brachiosaure","🌴","Rare","blueorb",175,22,22,"revive","armor",["S",{sc:.95}]],
 ["diplo","Diplodocus","🌲","Épique","blueorb",225,30,26,"revive","counter",["S",{sp:1}]],
 ["dread","Dreadnoughtus","🪐","Légendaire","blueorb",295,38,31,"fortify","armor",["S",{sc:1.1,fx:"wave"}]],
 ["lambeo","Lambéosaure","🦃","Rare","greenorb",140,22,18,"revive","pack",["H",{cr:1,sc:1.02}]],
 ["edmonto","Edmontosaure","🐓","Épique","greenorb",205,32,23,"rally","pack",["H",{sc:1.1}]],
 ["shanto","Shantungosaure","🍁","Légendaire","greenorb",275,41,28,"revive","pack",["H",{sc:1.18,cr:1,fx:"leaf"}]],
 ["notho","Nothosaure","🐟","Commun","purpleorb",84,19,9,"multi","ambush",["M",{k:"plesio",sc:.85}]],
 ["lioplo","Liopleurodon","🐡","Épique","purpleorb",200,40,18,"pierce","scavenger",["M",{k:"mosa"}]],
 ["krono","Kronosaure","🐳","Légendaire","purpleorb",248,50,20,"multi","scavenger",["M",{k:"mosa",sc:1.1,fx:"storm"}]],
 ["majunga","Majungasaure","🦝","Rare","purpleorb",128,30,12,"quake","scavenger",["T",{h:1,hs:1.05,cr:1}]],
 ["yuty","Yutyrannus","🐾","Épique","greenorb",192,38,19,"rally","pack",["T",{fe:2,hs:1.25}]]];
NEWSP2.forEach(a=>{const k=a[0],o={name:a[1],e:a[2],r:a[3],element:a[4],hp:a[5],atk:a[6],def:a[7],sk:a[8],pa:a[9]};if(!SPEC_DEFAULT[k])SPEC_DEFAULT[k]={...o};if(!SPEC[k])SPEC[k]={...o};SPEC[k].sk=SPEC[k].sk||a[8];SPEC[k].pa=SPEC[k].pa||a[9];PORT[k]=a[10]});
Object.assign(EVO,{huayang:"dacentru",dacentru:"wuerho",proto:"chasmo",chasmo:"kosmo",kosmo:"titano",nodo:"euoplo",euoplo:"zuul",rhampho:"tapejara",tapejara:"hatzeg",hatzeg:"tropeo",
 brachio:"diplo",diplo:"dread",hypsi:"lambeo",lambeo:"edmonto",edmonto:"shanto",notho:"lioplo",lioplo:"krono"});
/* nouveaux effets de portrait */
const _fxL2=fxLayer;fxLayer=function(c,fx){switch(fx){
 case"wave":return Q("M40 10 Q46 2 54 8 Q60 12 62 6 Q62 16 54 16 Q46 16 44 12 Q42 14 40 10Z","#7fd8ff",' opacity=".95"')+Q("M44 12 Q50 8 56 12","none",' stroke="#fff" stroke-width="1.2"');
 case"star":return Q("M55 3 L57.5 9 L64 9.5 L59 13.5 L60.5 20 L55 16.5 L49.5 20 L51 13.5 L46 9.5 L52.5 9Z","#ffe45c")+`<circle cx="46" cy="22" r="1.2" fill="#fff"/>`;
 case"leaf":return Q("M48 6 Q60 2 62 14 Q50 18 48 6Z","#7dff9b")+Q("M48 6 Q55 9 62 14","none",' stroke="#2f8e49" stroke-width="1"')+Q("M40 14 Q46 8 50 16 Q44 20 40 14Z","#4ecb6e");
 case"storm":return Q("M44 10 Q44 4 50 4 Q53 0 58 3 Q63 3 63 8 Q63 12 58 12 L47 12 Q44 12 44 10Z","#9aa6c4")+Q("M53 12 L49 20 H53 L50 27 L58 16 H54 L57 12Z","#ffe45c");
 default:return _fxL2(c,fx)}};
Object.keys(PCACHE).forEach(k=>delete PCACHE[k]);try{e2t()}catch(e){}
/* ---- effets des nouvelles compétences ---- */
const famOf2=d=>(PORT[d.type]||["T"])[0];
const _usNw=useSkill;useSkill=function(k){const f=fight;if(!f||f.over||!f.mx||!alive(k)||f.cd[k]>0)return _usNw(k);const t=T3(),d=t[k],id=SK_of(d);if(!["multi","pierce","quake","weaken","fortify","revive","convert","rally"].includes(id))return _usNw(k);
 const e=f.enemies[f.wave],A=atkOf(k),adv=BEAT[sp(d).element]===e.el?1.3:1;let dmg=0,x="";
 switch(id){
  case"multi":dmg=A*2.7*adv;x=" (3 coups)";break;
  case"pierce":dmg=A*2*adv;if(e.sh>0){x=" · 🛡️ bouclier brisé";e.sh=0}break;
  case"quake":dmg=A*1.6*adv;if(Math.random()<.5){f.stun=Math.max(f.stun||0,1);x=" · ennemi étourdi"}break;
  case"weaken":f.ewk=3;x=" · l'ennemi perd 35 % d'attaque (3 tours)";break;
  case"fortify":f.taunt={k,t:2};x=" · "+sp(d).name+" attire les coups (−60 % de dégâts)";break;
  case"revive":{const j=f.hp.findIndex(h=>h<=0);if(j>=0){f.hp[j]=Math.max(1,Math.round(f.mx[j]*.4));x=" · "+sp(t[j]).name+" revient au combat !";if(f.lb)f.lb[j]=false}
   else{t.forEach((y,j)=>{if(alive(j))f.hp[j]=Math.min(f.mx[j],f.hp[j]+Math.round(f.mx[j]*.2))});x=" · équipe soignée de 20 %"}break}
  case"convert":{const el=sp(d).element,idx=f.orbs.map((c,i)=>c===el?-1:i).filter(i=>i>=0);for(let n=0;n<4&&idx.length;n++)f.orbs[idx.splice(rnd(idx.length),1)[0]]=el;x=" · orbes "+(ICO[el]||"");break}
  case"rally":f.rly=3;f.sp=Math.min(100,f.sp+25);x=" · équipe +20 % ATQ (3 tours), super +25 %";break}
 dmg=Math.round(dmg);f._skx={dmg,msg:(dmg?" : "+dmg+" dégâts":"")+x};const hp0=f.hp.slice();const r=_usNw(k);if(f._skx)f._skx=null;
 if(PREFS.anim&&typeof fxCtr==="function")try{nwFx(id,k,hp0)}catch(err){}return r};
const _aaNw=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(f&&f._skx){const x=f._skx;f._skx=null;dmg+=x.dmg;msg+=x.msg;if(x.dmg)f.pop=x.dmg}return _aaNw(dmg,msg,endTurn)};
function nwFx(id,k,hp0){const box=$$("battleArea");if(!box)return;const eI=box.querySelector(".bigicon.hit"),rows=box.querySelector(".sFig")?[...box.querySelectorAll(".sFig")]:[...box.querySelectorAll(".row .bigicon:not(.hit)")],me=rows[k];if(!eI)return;const E=fxCtr(eI),f=fight;
 const send=col=>projectile(me,eI,col,0);
 switch(id){
  case"multi":send("#ffd15c");[0,1,2].forEach(i=>setTimeout(()=>fxSlash(E.r,1,i===2?"#ffd15c":"#fff"),fxd(330+i*120)));break;
  case"pierce":send("#c8d4eb");setTimeout(()=>{fxSlash(E.r,1,"#c8d4eb",true);ring(E.x,E.y,"#67e5ff")},fxd(380));break;
  case"quake":setTimeout(()=>{ring(E.x,E.y+20,"#d9b98a");fxEmo(E.x,E.y+30,"🪨",5,{sp:80,dy:-30,fs:16})},fxd(200));break;
  case"weaken":fxEmo(E.x,E.y-10,"😱",1,{fs:30,dy:-30});ring(E.x,E.y,"#bd8aff");break;
  case"fortify":if(me){const c=fxCtr(me);ring(c.x,c.y,"#ffd15c");fxEmo(c.x,c.y,"⛰️",1,{fs:28,dy:-25})}break;
  case"revive":rows.forEach((r,j)=>{if(f.hp[j]>hp0[j]){const c=fxCtr(r);ring(c.x,c.y,"#8cffb0");fxEmo(c.x,c.y+8,hp0[j]<=0?"✨":"➕",4,{fs:18,dy:-50,sp:40})}});break;
  case"convert":box.querySelectorAll(".orbboard .orb").forEach((o,i)=>{o.style.animation="orbspin .5s ease-out";o.style.animationDelay=i*30+"ms"});break;
  case"rally":rows.forEach((r,j)=>{const c=fxCtr(r);setTimeout(()=>ring(c.x,c.y,"#ff9d3c"),fxd(j*80))});fxEmo(innerWidth/2,E.y+80,"🥁",1,{fs:34,dy:-40});break}}
/* durées : affaiblissement de l'ennemi, ancrage, danse de guerre ; attaques puissantes (pour « Écailles épaisses ») */
const _etNw=enemyTurn;enemyTurn=function(){const f=fight;if(!f||f.over)return _etNw();f._bigNow=!(f.stun>0)&&f.turn%3===0;try{return _etNw()}finally{f._bigNow=false;if(f.ewk>0)f.ewk--;if(f.taunt&&f.taunt.t>0)f.taunt.t--;if(f.rly>0)f.rly--}};
const _ptNw=pickTarget;pickTarget=function(){const f=fight;if(f&&f.taunt&&f.taunt.t>0&&alive(f.taunt.k))return f.taunt.k;return _ptNw()};
const _hdNw=hitDino;hitDino=function(k,raw,e){const f=fight;if(!f||!f.mx)return _hdNw(k,raw,e);const d=T3()[k];if(!d)return _hdNw(k,raw,e);
 if(f.ewk>0)raw*=.65;if(f.taunt&&f.taunt.t>0&&f.taunt.k===k)raw*=.4;if(f._bigNow&&hasPA(d,"armor"))raw*=.7;
 const b=f.hp[k],r=_hdNw(k,raw,e),dm=Math.max(0,b-f.hp[k]);
 if(dm>0&&f.hp[k]>0&&e&&e.hp>0&&hasPA(d,"counter")&&Math.random()<.25){const c=Math.round(atkOf(k)*.8);e.hp-=c;f.log+=" · ↩️ riposte de "+sp(d).name+" : "+c}
 return r};
const _atNw=atkOf;atkOf=function(k){const v=_atNw(k),f=fight;if(!f||!f.mx)return v;const t=T3(),d=t[k];if(!d)return v;const e=f.enemies&&f.enemies[f.wave];let m=1;
 if(f.rly>0)m*=1.2;
 if(hasPA(d,"pack")){const fk=famOf2(d),n=t.filter((x,j)=>j!==k&&alive(j)&&famOf2(x)===fk).length;m*=1+.06*Math.min(2,n)}
 if(hasPA(d,"ambush")&&e&&e.hp>e.max*.8)m*=1.35;return v*m};
const _toNw=tapOrb;tapOrb=function(i){const f=fight;const r=_toNw(i);if(f&&!f.over&&f.mx){const n=T3().filter((d,k)=>alive(k)&&hasPA(d,"charger")).length;if(n)f.sp=Math.min(100,f.sp+6*n)}return r};
const _keNw=killEnemy;killEnemy=function(){const f=fight;if(f&&f.mx){T3().forEach((d,k)=>{if(f.hp[k]>0&&hasPA(d,"scavenger"))f.hp[k]=Math.min(f.mx[k],f.hp[k]+Math.round(f.mx[k]*.15))});f.ewk=0}return _keNw()};
const _rbNw=renderBattle;renderBattle=function(){_rbNw();const f=fight;if(!f||!f.mx||f.over)return;const ch=document.querySelector("#battleArea .sHud .fchips");if(!ch||ch.querySelector(".nwchip"))return;const t=T3(),a=[];
 if(f.ewk>0)a.push(`<span class="chip good nwchip" title="${esc(SK.weaken.d)}">😱 Ennemi affaibli (${f.ewk})</span>`);
 if(f.taunt&&f.taunt.t>0&&t[f.taunt.k])a.push(`<span class="chip good nwchip" title="${esc(SK.fortify.d)}">⛰️ Ancrage : ${esc(sp(t[f.taunt.k]).name)} (${f.taunt.t})</span>`);
 if(f.rly>0)a.push(`<span class="chip good nwchip" title="${esc(SK.rally.d)}">🥁 Danse de guerre (${f.rly})</span>`);if(a.length)ch.insertAdjacentHTML("beforeend",a.join(""))};
/* ---- auto-combat et compétences ennemies ---- */
if(typeof AUTO_PRIO!=="undefined"){AUTO_PRIO[0].push("revive");AUTO_PRIO[1].push("fortify","weaken","quake");AUTO_PRIO[2].push("rally");AUTO_PRIO[3].push("pierce","multi");AUTO_PRIO[4].push("convert")}
if(typeof autoWant==="function"){const _awNw=autoWant;autoWant=function(id,f,e,t){const r=t.map((d,k)=>alive(k)?f.hp[k]/f.mx[k]:1),low=Math.min(...r),big=!f.stun&&3-f.turn%3===1;
 switch(id){case"revive":return f.hp.some(h=>h<=0)||low<.5;case"fortify":return!(f.taunt&&f.taunt.t>0)&&(big||low<.45);case"weaken":return!(f.ewk>0)&&(big||e.boss||low<.5);case"quake":return!f.stun;case"rally":return!(f.rly>0);
  case"convert":{let best=null,bv=-1;f.orbs.forEach(c=>{const v=orbPreview(c);if(v>bv){bv=v;best=c}});const els=new Set(t.filter((d,k)=>alive(k)).map(d=>sp(d).element));return!els.has(best)}}return _awNw(id,f,e,t)}}
const ES_MAP={multi:"cleave",pierce:"strike",quake:"stun",weaken:"roar",fortify:"shield",revive:"heal",convert:"reorb",rally:"roar"};
if(typeof esOf==="function"){const _esNw=esOf;esOf=function(e,f){const fresh=e&&e.esk===undefined,id=_esNw(e,f);if(fresh&&ES_MAP[id]){e.esk=ES_MAP[id];return e.esk}return id}}
/* ---- succès, guide ---- */
ACH.push(["sp60","Arche vivante","Posséder 60 espèces différentes",T0,60,{tickets:6,shards:40},"Arche Vivante"],["sp80","Encyclopédie primordiale","Posséder 80 espèces différentes",T0,80,{tickets:10,shards:80},"Encyclopédiste"],
 ["sk8","Nouvelles techniques","Utiliser 200 compétences",()=>S.cnt.skills||0,200,{essence:40,tickets:2}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["La grande migration","26 nouvelles espèces (stégosaures, cératopsiens, ankylosaures, ptérosaures, sauropodes, hadrosaures, reptiles marins, théropodes) et 7 nouvelles chaînes d'évolution. Nouvelles compétences : Ruée frénétique (3 coups), Coup perforant (brise les boucliers), Piétinement (peut étourdir), Hurlement de terreur (l'ennemi perd 35 % d'attaque), Ancrage (attire les coups, −60 % de dégâts), Cri de ralliement (ranime un dino KO), Éclat élémentaire (4 orbes de son élément), Danse de guerre (+20 % ATQ et super). Nouveaux attributs : Contre-attaque, Charognard, Instinct de meute, Écailles épaisses, Énergie primordiale, Embuscade."]);
