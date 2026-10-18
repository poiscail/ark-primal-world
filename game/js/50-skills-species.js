/* 46 espèces, compétences, attributs, variantes, moteur de combat, collection */
/* ===== Compétences actives, attributs passifs, variantes, nouvelles espèces ===== */
const RAR5=["Commun","Rare","Épique","Légendaire"];
const SK={
 strike:{n:"Morsure brutale",i:"💢",cd:4,d:"Inflige 2,2× l'attaque du dinosaure."},
 cleave:{n:"Coup de queue",i:"🌀",cd:4,d:"Inflige 1,8× l'attaque et ajoute 10 % de super."},
 roar:{n:"Rugissement",i:"📣",cd:5,d:"Toute l'équipe : attaque +30 % pendant 3 tours."},
 heal:{n:"Souffle vital",i:"💚",cd:5,d:"Soigne toute l'équipe de 30 % de ses PV max."},
 selfheal:{n:"Régénération",i:"🩹",cd:4,d:"Soigne le dino le plus blessé de 45 % de ses PV max."},
 shield:{n:"Carapace",i:"🛡️",cd:5,d:"Dégâts subis -50 % pendant 2 attaques ennemies."},
 stun:{n:"Choc sismique",i:"💫",cd:5,d:"Étourdit l'ennemi 1 tour et inflige 1× l'attaque."},
 burn:{n:"Souffle brûlant",i:"🔥",cd:4,d:"Inflige 0,8× l'attaque puis brûle : 0,6× l'attaque par tour pendant 3 tours."},
 poison:{n:"Venin",i:"☠️",cd:4,d:"Poison : 5 % des PV max par tour pendant 4 tours (2,5 % sur un boss)."},
 drain:{n:"Dévoration",i:"🩸",cd:5,d:"Inflige 1,8× l'attaque et soigne le lanceur de 50 % des dégâts."},
 focus:{n:"Concentration",i:"🎯",cd:4,d:"Le prochain coup d'orbe est critique (×2)."},
 charge:{n:"Appel primordial",i:"⚡",cd:5,d:"Remplit la super attaque de 50 %."},
 reorb:{n:"Orbes changeantes",i:"🔄",cd:2,d:"Change toutes les orbes et augmente le combo."},
 execute:{n:"Coup fatal",i:"⚔️",cd:6,d:"Inflige 2× l'attaque, ×2,5 si l'ennemi a moins de 30 % de PV."}
};
const PA={
 crit:{n:"Instinct de chasseur",i:"🎯",d:"15 % de coups critiques (×1,8) sur les orbes."},
 regen:{n:"Peau régénérante",i:"🌱",d:"Récupère 3 % de ses PV max à chaque tour."},
 thorns:{n:"Piquants",i:"🦔",d:"Renvoie 25 % des dégâts reçus à l'ennemi."},
 berserk:{n:"Fureur",i:"😡",d:"+40 % d'attaque sous 50 % de PV."},
 tank:{n:"Provocation",i:"🛡️",d:"Attire les attaques ennemies (×3 de chances d'être ciblé)."},
 lucky:{n:"Pillard",i:"💰",d:"+20 % de pierres gagnées en victoire (cumulable)."},
 firstblood:{n:"Premier sang",i:"🩸",d:"+60 % de dégâts au premier coup de chaque vague."},
 lastbreath:{n:"Dernier souffle",i:"🕊️",d:"Survit une fois par combat à un coup fatal (1 PV)."},
 swift:{n:"Agilité",i:"💨",d:"20 % de chances d'esquiver une attaque."},
 leader:{n:"Alpha de meute",i:"👑",d:"Toute l'équipe : +8 % d'attaque tant qu'il est debout."},
 guard:{n:"Armure naturelle",i:"🧱",d:"Subit 15 % de dégâts en moins."},
 elemental:{n:"Maître élémentaire",i:"🌈",d:"Ses orbes de couleur donnent ×2,3 au lieu de ×1,8."},
 leech:{n:"Appétit",i:"🍖",d:"Se soigne de 8 % des dégâts qu'il inflige avec les orbes."}
};
const DEFSK={redorb:"strike",blueorb:"stun",greenorb:"heal",purpleorb:"poison",goldorb:"roar"};
const VAR={
 normal:{n:"",hp:1,atk:1,def:1,w:0,col:"#aab6d1"},
 alpha:{n:"Alpha",hp:1.15,atk:1.15,def:1.05,w:9,col:"#ff647b"},
 shadow:{n:"Ombre",hp:.95,atk:1.3,def:.9,w:5,col:"#bd8aff"},
 albino:{n:"Albinos",hp:1.25,atk:.95,def:1.3,w:5,col:"#ffffff"},
 golden:{n:"Doré",hp:1.25,atk:1.25,def:1.25,w:2,col:"#ffd15c"},
 prism:{n:"Prismatique",hp:1.4,atk:1.4,def:1.4,w:.5,col:"#67e5ff"}
};

/* [clé, nom, image, rareté, élément, PV, ATQ, DÉF, compétence, attribut] */
const SPECIES=[
["raptor",0,0,0,0,0,0,0,"strike","crit"],["trike",0,0,0,0,0,0,0,"shield","tank"],["stego",0,0,0,0,0,0,0,"cleave","thorns"],["ptera",0,0,0,0,0,0,0,"focus","swift"],
["rex",0,0,0,0,0,0,0,"strike","berserk"],["spino",0,0,0,0,0,0,0,"execute","elemental"],["compsog",0,0,0,0,0,0,0,"reorb","swift"],["dilopho",0,0,0,0,0,0,0,"poison","lucky"],
["ankylo",0,0,0,0,0,0,0,"shield","guard"],["carnota",0,0,0,0,0,0,0,"cleave","berserk"],["quetzal",0,0,0,0,0,0,0,"focus","crit"],["giga",0,0,0,0,0,0,0,"execute","firstblood"],
["mosa",0,0,0,0,0,0,0,"stun","guard"],["argento",0,0,0,0,0,0,0,"heal","tank"],["dracorex",0,0,0,0,0,0,0,"roar","leader"],
["ovi","Oviraptor","🥚","Commun","greenorb",85,16,11,"selfheal","regen"],["gallim","Gallimimus","🦤","Commun","redorb",80,19,8,"reorb","swift"],
["parasau","Parasaurolophus","🦆","Commun","blueorb",100,15,12,"heal","regen"],["pachy","Pachycéphalosaure","🐏","Commun","goldorb",95,17,13,"stun","guard"],
["psitta","Psittacosaure","🦜","Commun","purpleorb",82,18,9,"focus","crit"],["hypsi","Hypsilophodon","🐇","Commun","greenorb",78,17,9,"charge","lucky"],
["coelo","Coelophysis","🦊","Commun","redorb",76,20,7,"strike","firstblood"],["iguano","Iguanodon","🐸","Commun","blueorb",118,15,15,"shield","guard"],
["maia","Maiasaura","🐔","Commun","greenorb",108,14,14,"heal","tank"],["micro","Microraptor","🪶","Commun","purpleorb",74,21,6,"burn","swift"],
["allo","Allosaure","🐅","Rare","redorb",135,27,14,"strike","crit"],["cerato","Cératosaure","🐃","Rare","redorb",128,28,13,"cleave","berserk"],
["sauropel","Sauropelta","🦔","Rare","greenorb",150,20,25,"shield","thorns"],["pachyrh","Pachyrhinosaure","🦬","Rare","goldorb",148,24,20,"stun","tank"],
["utah","Utahraptor","🐺","Rare","purpleorb",118,31,10,"poison","firstblood"],["plesio","Plésiosaure","🦭","Rare","blueorb",140,24,17,"heal","regen"],
["ichthyo","Ichtyosaure","🐬","Rare","blueorb",110,29,11,"drain","leech"],["therizi","Thérizinosaure","🦥","Rare","greenorb",145,26,16,"cleave","thorns"],
["carcharo","Carcharodontosaure","🦈","Épique","redorb",188,38,17,"execute","crit"],["bary","Baryonyx","🐠","Épique","blueorb",185,35,20,"drain","leech"],
["deino","Deinonychus","🦉","Épique","purpleorb",170,40,14,"poison","firstblood"],["tyranno","Tyrannotitan","🦁","Épique","redorb",195,37,19,"roar","berserk"],
["amarga","Amargasaure","🦌","Épique","greenorb",200,30,25,"shield","guard"],["cryolo","Cryolophosaure","❄️","Épique","blueorb",178,36,19,"stun","elemental"],
["pyro","Pyroraptor","🔥","Épique","redorb",168,41,13,"burn","crit"],
["magma","Magmasaure","🌋","Légendaire","redorb",240,47,22,"burn","elemental"],["levia","Léviathan primordial","🌊","Légendaire","blueorb",255,41,25,"stun","lastbreath"],
["gaia","Titanosaure Gaïa","🌳","Légendaire","greenorb",285,36,30,"heal","lastbreath"],["tonner","Tonnerrosaure","⚡","Légendaire","purpleorb",225,49,20,"execute","crit"],
["helio","Héliosaure","☀️","Légendaire","goldorb",235,45,24,"roar","leader"],["nyx","Nyxosaure","🌑","Légendaire","purpleorb",220,50,18,"drain","berserk"]
];
SPECIES.forEach(a=>{const k=a[0];if(!SPEC_DEFAULT[k]&&a[1])SPEC_DEFAULT[k]={name:a[1],e:a[2],r:a[3],element:a[4],hp:a[5],atk:a[6],def:a[7]};
 if(SPEC_DEFAULT[k]){SPEC_DEFAULT[k].sk=SPEC_DEFAULT[k].sk||a[8];SPEC_DEFAULT[k].pa=SPEC_DEFAULT[k].pa||a[9]}
 if(!SPEC[k])SPEC[k]={...SPEC_DEFAULT[k]};SPEC[k].sk=SPEC[k].sk||a[8];SPEC[k].pa=SPEC[k].pa||a[9]});
const TOTAL_SP=()=>Object.keys(SPEC).length;
/* sp / art / stats / prog */
sp=d=>{const b=SPEC[d.type]||SPEC_DEFAULT.raptor,v=VAR[d.v];if(!v||d.v==="normal")return b;return{...b,name:b.name+" "+v.n,e:"\u0001"+d.v+"\u0002"+b.e}};
art=e=>{let v="";e=String(e);if(e.charAt(0)==="\u0001"){const j=e.indexOf("\u0002");v=e.slice(1,j);e=e.slice(j+1)}
 const inner=/^https:\/\//i.test(e)?`<img src="${esc(e)}" alt="" style="max-width:100%;max-height:100%">`:esc(e);return v?`<span class="v-${v}">${inner}</span>`:inner};
const _st5=stats;stats=function(d){const v=_st5(d),m=VAR[d.v||"normal"]||VAR.normal;return{hp:Math.round(v.hp*m.hp),atk:Math.round(v.atk*m.atk),def:Math.round(v.def*m.def)}};
const SK_of=d=>{const s=sp(d);return SK[s.sk]?s.sk:(DEFSK[s.element]||"strike")},PA_of=d=>{const s=sp(d);return PA[s.pa]?s.pa:""},
 skCd=d=>Math.max(2,SK[SK_of(d)].cd-((d.star||0)>=3?1:0)-((d.star||0)>=5?1:0)),power=d=>{const v=stats(d);return Math.round(v.hp/4+v.atk*3+v.def*2)},
 T3=()=>S.team.slice(0,3),alive=k=>fight.hp[k]>0;
prog=function(m,d){if(m.t==="species")return new Set(S.team.map(x=>x.type)).size;if(m.t==="stage")return S.stage;return((d?S.dcnt:S.cnt)[m.t]||0)};
DAILY.push({id:"d10",t:"skills",g:10,n:"Utiliser 10 compétences",r:{bone:3,crystal:1}});
[["skills","compétences utilisées",[50,200,500]],["variants","variantes obtenues",[1,5,15]],["species","espèces découvertes",[10,25,40]],["fusions","fusions de doublons",[5,20]]].forEach(([t,l,gs])=>gs.forEach((g,i)=>PERM.push({id:"p_"+t+g,t,g,n:g+" "+l,r:{tickets:i+1,crystal:i+1,stone:100*(i+1)}})));
function synergy(){const el=T3().map(d=>sp(d).element);if(el.length<3)return{atk:0,hp:0,txt:""};const u=new Set(el).size;return u===1?{atk:.15,hp:0,txt:"Synergie : 3 éléments identiques +15 % ATQ"}:u===2?{atk:.05,hp:0,txt:"Synergie : 2 éléments identiques +5 % ATQ"}:{atk:0,hp:.1,txt:"Synergie : 3 éléments différents +10 % PV"}}
/* ===== Moteur de combat ===== */
function atkOf(k){const t=T3(),d=t[k];let a=stats(d).atk*(1+fight.syn.atk);if(hasPA(d,"berserk")&&fight.hp[k]<fight.mx[k]*.5)a*=1.4;if(fight.buff.atk>0)a*=1.3;t.forEach((x,j)=>{if(alive(j)&&hasPA(x,"leader"))a*=1.08});return a}
const _sb5=startBattle;startBattle=function(o){_sb5(o);const f=fight,t=T3(),sy=synergy();f.syn=sy;f.mx=t.map(d=>Math.round(stats(d).hp*(1+sy.hp)));f.hp=f.mx.slice();f.cd=t.map(d=>Math.ceil(skCd(d)/2));f.buff={atk:0,shield:0};f.crit=false;f.dots=[];f.lb=t.map(()=>false);f.firstTap=true;f.enrage=false;f.help=false;f.log="Choisis une orbe ou une compétence ! "+sy.txt;renderBattle()};
function orbPreview(c){const f=fight,e=f.enemies[f.wave];let s=0;T3().forEach((d,k)=>{if(!alive(k))return;const el=sp(d).element;let m=el===c?(hasPA(d,"elemental")?2.3:1.8):c==="goldorb"?1.3:.9;m*=1+(c===f.last?f.combo+1:0)*.15;if(BEAT[el]===e.el)m*=1.3;s+=atkOf(k)*m});return Math.round(s)}
tapOrb=function(i){if(!fight||fight.over)return;const f=fight,c=f.orbs[i],e=f.enemies[f.wave],t=T3();f.combo=c===f.last?f.combo+1:0;f.last=c;let tot=0,crits=0;
 t.forEach((d,k)=>{if(!alive(k))return;const el=sp(d).element,pa=PA_of(d);let m=el===c?(hasPA(d,"elemental")?2.3:1.8):c==="goldorb"?1.3:.9;m*=1+f.combo*.15;if(BEAT[el]===e.el)m*=1.3;
  if(f.crit)m*=2;else if(hasPA(d,"crit")&&Math.random()<.15){m*=1.8;crits++}
  if(hasPA(d,"firstblood")&&f.firstTap)m*=1.6;const dm=Math.round(atkOf(k)*m+rnd(6));tot+=dm;if(hasPA(d,"leech"))f.hp[k]=Math.min(f.mx[k],f.hp[k]+Math.round(dm*.08))});
 f.crit=false;f.firstTap=false;f.sp=Math.min(100,f.sp+15+f.combo*5);f.pop=tot;
 afterAction(tot,"Orbe "+ICO[c]+" : "+tot+" dégâts"+(f.combo?" · combo x"+(f.combo+1):"")+(crits?" · CRITIQUE !":""),true)};
function afterAction(dmg,msg,endTurn){const f=fight,e=f.enemies[f.wave];e.hp-=dmg;f.log=msg;if(endTurn)f.orbs=newOrbs();
 if(e.hp<=0)return killEnemy();if(!endTurn)return renderBattle();
 let dot=0;f.dots=f.dots.filter(x=>{dot+=x.dmg;x.t--;return x.t>0});if(dot){e.hp-=dot;f.log+=" · durée : "+dot+" dégâts";if(e.hp<=0)return killEnemy()}
 f.turn++;f.cd=f.cd.map(v=>Math.max(0,v-1));f.buff.atk=Math.max(0,f.buff.atk-1);
 T3().forEach((d,k)=>{if(alive(k)&&hasPA(d,"regen"))f.hp[k]=Math.min(f.mx[k],f.hp[k]+Math.round(f.mx[k]*.03))});
 enemyTurn();if(e.hp<=0)return killEnemy();renderBattle()}
function killEnemy(){const f=fight;if(f.wave===2)return win();f.wave++;f.turn=0;f.stun=0;f.dots=[];f.firstTap=true;f.enrage=false;f.log+=" · Ennemi vaincu ! Vague suivante.";renderBattle()}
function pickTarget(){const t=T3(),w=t.map((d,k)=>alive(k)?(hasPA(d,"tank")?3:1):0),s=w.reduce((a,b)=>a+b,0);let r=Math.random()*s;for(let k=0;k<t.length;k++){r-=w[k];if(r<0)return k}return Math.max(0,w.findIndex(x=>x>0))}
/* 0.41 (idée 450) : la défense réduit les dégâts en proportion (dégâts = b × K·b / (déf + K·b)) au lieu de les diminuer d'un montant fixe
   (b − déf/2) : avant, un tank était presque invulnérable au début (déf/2 ≥ attaque ennemie) et la défense ne valait plus grand-chose
   ensuite. K = 1,4 redonne les mêmes valeurs quand déf ≈ 0,6 × attaque (fin de partie). */
const DEF_K=1.4;function defHit(b,df){return b<=0?0:b*DEF_K*b/(Math.max(0,df)+DEF_K*b)}
function hitDino(k,raw,e){const f=fight,d=T3()[k],pa=PA_of(d);f.hurt=f.hurt||{};
 if(hasPA(d,"swift")&&Math.random()<.2){f.log+=" · "+sp(d).name+" esquive !";return}
 let dm=defHit(raw*(BEAT[e.el]===sp(d).element?1.3:1),stats(d).def);if(hasPA(d,"guard"))dm*=.85;if(f.buff.shield>0)dm*=.5;dm=Math.max(1,Math.round(dm));
 if(dm>=f.hp[k]&&hasPA(d,"lastbreath")&&!f.lb[k]){f.lb[k]=true;dm=Math.max(0,f.hp[k]-1);f.log+=" · 🕊️ "+sp(d).name+" survit de justesse !"}
 f.hp[k]=Math.max(0,f.hp[k]-dm);f.log+=" · "+sp(d).name+" subit "+dm;f.hurt[k]=(f.hurt[k]||0)+dm;
 if(hasPA(d,"thorns")){const r=Math.round(dm*.25);e.hp-=r;f.log+=" (renvoi "+r+")"}}
function enemyTurn(){const f=fight,e=f.enemies[f.wave];
 if(f.stun>0){f.stun--;f.log+=" · l'ennemi est étourdi !";return}
 const enr=e.boss&&e.hp<e.max*.3;if(enr&&!f.enrage){f.enrage=true;f.log+=" · 😡 Le boss ENRAGE !"}
 const big=f.turn%3===0,aoe=e.boss&&big,base=(e.atk+rnd(5))*(enr?1.5:1)*(big&&!aoe?2.2:1);
 if(aoe){f.log+=" · 🌋 ATTAQUE DE ZONE";T3().forEach((d,k)=>{if(alive(k))hitDino(k,base*.8,e)})}else{if(big)f.log+=" · ⚠ ATTAQUE PUISSANTE";hitDino(pickTarget(),base,e)}
 if(f.buff.shield>0)f.buff.shield--;
 if(f.hp.every(h=>h<=0)){f.over="lose";log("Défaite. Entraîne, éveille ou renforce ton équipe.");save()}}
function useSkill(k){const f=fight;if(!f||f.over||!alive(k)||f.cd[k]>0)return;const d=T3()[k],id=SK_of(d),e=f.enemies[f.wave],A=atkOf(k),adv=BEAT[sp(d).element]===e.el?1.3:1;let dmg=0,x="";
 switch(id){
  case"strike":dmg=A*2.2*adv;break;
  case"cleave":dmg=A*1.8*adv;f.sp=Math.min(100,f.sp+10);break;
  case"roar":f.buff.atk=3;x=" · attaque +30 % (3 tours)";break;
  case"heal":T3().forEach((y,j)=>{if(alive(j))f.hp[j]=Math.min(f.mx[j],f.hp[j]+Math.round(f.mx[j]*.3))});x=" · équipe soignée";break;
  case"selfheal":{let b=-1,bv=2;T3().forEach((y,j)=>{if(alive(j)){const r=f.hp[j]/f.mx[j];if(r<bv){bv=r;b=j}}});if(b>=0)f.hp[b]=Math.min(f.mx[b],f.hp[b]+Math.round(f.mx[b]*.45));x=" · soin";break}
  case"shield":f.buff.shield=2;x=" · dégâts -50 %";break;
  case"stun":dmg=A*adv;f.stun=1;x=" · ennemi étourdi";break;
  case"burn":dmg=A*.8*adv;f.dots.push({dmg:Math.max(1,Math.round(A*.6)),t:3});x=" · brûlure";break;
  case"poison":f.dots.push({dmg:Math.max(1,Math.round(e.max*(e.boss?.025:.05))),t:4});x=" · poison";break;
  case"drain":dmg=A*1.8*adv;f.hp[k]=Math.min(f.mx[k],f.hp[k]+Math.round(dmg*.5));x=" · vol de vie";break;
  case"focus":f.crit=true;x=" · prochain coup critique";break;
  case"charge":f.sp=Math.min(100,f.sp+50);x=" · super +50 %";break;
  case"reorb":f.orbs=newOrbs();f.combo=Math.min(f.combo+1,9);x=" · orbes changées";break;
  case"execute":dmg=A*2*adv*(e.hp<e.max*.3?2.5:1);break}
 dmg=Math.round(dmg);f.cd[k]=skCd(d);ens();bump("skills");f.pop=dmg;save();
 afterAction(dmg,"✨ "+sp(d).name+" : "+SK[id].n+(dmg?" : "+dmg+" dégâts":"")+x,false)}
special=function(){const f=fight;if(!f||f.over||f.sp<100)return;f.sp=0;const t=T3(),lead=sp(t[0]).element;let sum=0;t.forEach((d,k)=>{if(alive(k))sum+=atkOf(k)});let dmg=Math.round(2.5*sum),x="";
 if(lead==="greenorb"){t.forEach((d,k)=>{if(alive(k))f.hp[k]=Math.min(f.mx[k],f.hp[k]+Math.round(f.mx[k]*.35))});dmg=Math.round(dmg*.8);x=" · équipe soignée de 35 %"}
 else if(lead==="blueorb"){f.stun=1;x=" · ennemi étourdi"}else if(lead==="goldorb")dmg=Math.round(dmg*1.4);else if(lead==="purpleorb"){dmg=Math.round(dmg*1.2);f.sp=30}else dmg=Math.round(dmg*1.25);
 f.firstTap=false;ens();bump("supers");f.pop=dmg;afterAction(dmg,"💥 SUPER "+ICO[lead]+" : "+dmg+" dégâts"+x,true)};
const _win5=win;let inWin=false;win=function(){inWin=true;try{_win5()}finally{inWin=false}};
const _give5=give;give=function(r){if(inWin&&r.stone){const n=T3().filter(d=>hasPA(d,"lucky")).length;if(n)r.stone=Math.round(r.stone*(1+.2*n))}return _give5(r)};
function toggleHelp(){if(fight){fight.help=!fight.help;renderBattle()}}
renderBattle=function(){const box=$$("battleArea");
 if(!fight){box.innerHTML=`<div class="panel"><h3>Prêt pour le combat ?</h3><p class="muted">Choisis un niveau dans Histoire, un Donjon, ou reprends l'aventure.</p><button class="wide" onclick="startBattle({mode:'story',n:${Math.min(100,S.stage+1)}})">REPRENDRE L'AVENTURE</button></div>`;return}
 const f=fight;if(!f.mx)return;const e=f.enemies[f.wave],t=T3(),bar=(v,m,c)=>`<div class="progress"><i style="width:${Math.max(0,Math.min(100,v/m*100))}%;background:${c}"></i></div>`;
 $$("battleTitle").textContent=f.zone+" · Vague "+(f.wave+1)+"/3"+(e.boss&&f.wave===2?" · BOSS":"");
 const nx=3-f.turn%3,enr=e.boss&&e.hp<e.max*.3;
 const intent=f.stun>0?"💫 L'ennemi est étourdi":enr?"😡 ENRAGÉ (+50 % d'attaque)":nx===1?(e.boss?"🌋 Attaque de ZONE au prochain tour !":"⚠ Attaque PUISSANTE au prochain tour !"):"Attaque "+(e.boss?"de zone":"puissante")+" dans "+nx+" tours";
 const eChips=[f.stun>0?'<span class="chip hot">💫 étourdi</span>':"",...f.dots.map(x=>`<span class="chip hot">☠️🔥 ${x.dmg}/tour · ${x.t}t</span>`)].join("");
 const bChips=[f.buff.atk>0?`<span class="chip good">📣 ATQ +30 % (${f.buff.atk})</span>`:"",f.buff.shield>0?`<span class="chip good">🛡️ -50 % dégâts (${f.buff.shield})</span>`:"",f.crit?'<span class="chip good">🎯 critique prêt</span>':"",f.syn.txt?`<span class="chip">${esc(f.syn.txt)}</span>`:""].join("");
 const hurt=k=>f.hurt&&f.hurt[k]?`<span class="pop hurt">-${f.hurt[k]}</span>`:"";
 let h=`<div class="panel"><div class="row"><div class="bigicon hit" style="position:relative">${typeof enemyArt==="function"?enemyArt(e):esc(e.e)}${f.pop?`<span class="pop">-${f.pop}</span>`:""}</div><div class="grow"><b>${esc(e.name)}</b> <span class="chip">${ICO[e.el]||""}</span><div class="muted tiny">PV ${Math.max(0,e.hp)} / ${e.max}</div>${bar(e.hp,e.max,"linear-gradient(90deg,#ff536c,#ffb04d)")}<div class="tiny" style="color:${nx===1||enr?"#ff8095":"#aab6d1"}">${intent}</div><div class="fchips">${eChips}</div></div></div></div>`;
 h+=`<div class="result tiny" style="margin:8px 0">${esc(f.log)}</div>${bChips?`<div class="fchips">${bChips}</div>`:""}`;
 h+=t.map((d,k)=>{const id=SK_of(d),s=SK[id],pa=PA_of(d),cd=f.cd[k],ok=alive(k)&&cd<=0&&!f.over;
  return `<div class="row ${alive(k)?"":"dead"}" style="margin:8px 0"><div class="bigicon" style="position:relative;width:48px;height:48px;flex-basis:48px;font-size:28px">${art(sp(d).e)}${hurt(k)}</div><div class="grow"><b>${esc(sp(d).name)}</b> <span class="chip">${ICO[sp(d).element]||""}</span> <span class="muted tiny">Niv. ${d.level}${d.star?" · "+d.star+"★":""}</span>${pa?` <span class="chip" title="${esc(PA[pa].n)}">${PA[pa].i}</span>`:""}${typeof charmPA==="function"&&charmPA(d)?` <span class="chip" title="${esc(PA[charmPA(d)].n)}">${PA[charmPA(d)].i}</span>`:""}${bar(f.hp[k],f.mx[k],"linear-gradient(90deg,#62e7a0,#d4ff80)")}<div class="muted tiny">PV ${f.hp[k]}/${f.mx[k]} · ATQ ${Math.round(atkOf(k))}</div></div><button class="skbtn ${ok?"":"off"}" ${ok?"":"disabled"} onclick="useSkill(${k})">${s.i}<small>${cd>0?cd+" tour"+(cd>1?"s":""):esc(s.n)}</small></button></div>`}).join("");
 f.pop=0;f.hurt={};
 if(f.help)h+=`<div class="panel tiny">${t.map(d=>{const s=SK[SK_of(d)],pa=PA_of(d);return `<div style="margin:5px 0"><b>${esc(sp(d).name)}</b><br>${s.i} <b>${s.n}</b> (recharge ${skCd(d)}) : ${s.d}${pa?`<br>${PA[pa].i} <b>${PA[pa].n}</b> : ${PA[pa].d}`:""}</div>`}).join("")}</div>`;
 if(f.over){h+=`<div class="result"><div class="rarity">${f.over==="win"?"VICTOIRE !":"DÉFAITE"}</div><button class="wide" onclick="startBattle()">${f.o&&f.o.mode==="tower"?"ÉTAGE "+S.tower.floor:f.o&&f.o.mode==="arena"?"RETOUR À L'ARÈNE":"REJOUER"}</button>${f.over==="lose"?`<button class="wide purple" onclick="go('team')">RENFORCER MON ÉQUIPE</button>`:""}<button class="wide secondary" onclick="escapeFight()">ACCUEIL</button></div>`;
  box.innerHTML=h;
  if(f.over==="lose"&&!f.report){ens();bump("battles");f.report='<div class="panel tiny muted">Défaite : aucune récompense. Entraîne, éveille ou renforce ton équipe.</div>'+missHTML(f.snap);save()}
  if(f.report)box.insertAdjacentHTML("beforeend",f.report);return}
 h+=`<div class="sectionhead"><h2>Choisis une orbe</h2><span class="chip">Combo x${f.combo+1}</span></div><div class="orbboard n3">${f.orbs.map((c,i)=>`<button class="orb ${c}" onclick="tapOrb(${i})">${ICO[c]}<small>~${orbPreview(c)}</small></button>`).join("")}</div>`;
 h+=`<div class="tiny muted">Super attaque ${f.sp} %</div><div class="progress gauge"><i style="width:${f.sp}%"></i></div><button class="wide red" ${f.sp<100?"disabled":""} onclick="special()">💥 SUPER ATTAQUE</button><div class="btns"><button class="secondary" onclick="toggleHelp()">ℹ️ ${f.help?"MASQUER":"AIDE"} COMPÉTENCES</button><button class="secondary" onclick="escapeFight()">FUIR</button></div>`;
 box.innerHTML=h};
/* ===== Collection, équipe, fusion, recyclage ===== */
card=function(d,a=true){const p=sp(d),v=stats(d),sk=SK[SK_of(d)],pa=PA_of(d),vr=VAR[d.v||"normal"]||VAR.normal,idx=S.team.findIndex(x=>x.id===d.id),base=SPEC[d.type]||p,star=d.star||0,k5=idx>=3;
 let h=`<div class="panel"><div class="row"><div class="bigicon">${art(p.e)}</div><div class="grow"><b>${esc(base.name)}</b>${d.v&&d.v!=="normal"?`<span class="vtag" style="color:${vr.col};border-color:${vr.col}">${vr.n.toUpperCase()}</span>`:""} <span class="chip">${ICO[p.element]||""}</span> <span class="rarity ${rarityClass(p.r)}">${esc(p.r)}</span><div class="muted tiny">Niveau ${d.level} · XP ${d.xp}/${need(d.level)}${star?" · "+"★".repeat(star):""}${idx<3?" · ÉQUIPE "+(idx+1):""}</div><div class="progress"><i style="width:${Math.min(100,d.xp/need(d.level)*100)}%"></i></div></div></div><div class="stats"><div class="stat"><b>${v.hp}</b><span>PV</span></div><div class="stat"><b>${v.atk}</b><span>ATTAQUE</span></div><div class="stat"><b>${v.def}</b><span>DÉFENSE</span></div></div><div class="tiny" style="margin:6px 0"><b>${sk.i} ${sk.n}</b> (recharge ${skCd(d)}) — ${sk.d}</div>${pa?`<div class="tiny"><b>${PA[pa].i} ${PA[pa].n}</b> — ${PA[pa].d}</div>`:""}${typeof eqLine==="function"?`<div class="tiny" style="margin-top:4px">${eqSummary(d)}</div>${eqLine(d)}${charmPA(d)?`<div class="tiny"><b>${PA[charmPA(d)].i} ${PA[charmPA(d)].n}</b> (talisman) — ${PA[charmPA(d)].d}</div>`:""}`:""}<div class="tiny muted" style="margin-top:4px">⚔ Puissance ${power(d)}</div>`;
 if(!a)return h+"</div>";
 const dup=S.team.filter((x,i)=>i>=3&&x.id!==d.id&&x.type===d.type).length;
 h+=`<div class="btns"><button class="purple" onclick="openEq(${d.id})">ÉQUIPEMENT</button></div>`;h+=`<div class="btns">${[0,1,2].map(k=>`<button class="secondary ${idx===k?"on":""}" onclick="setSlot(${d.id},${k})">Place ${k+1}</button>`).join("")}<button class="secondary" onclick="train(${d.id})">ENTRAÎNER · ${CONFIG.trainCost} 🪨</button>${star>=5?'<button class="purple" disabled>ÉVEIL MAX ★★★★★</button>':`<button class="purple" onclick="awaken(${d.id})">ÉVEIL ${star+1}★ · ${fmt(awCost(star))}</button>`}<button class="blue" ${dup&&star<5?"":"disabled"} onclick="fuse(${d.id})">FUSION +1★ (${dup} doublon${dup>1?"s":""})</button>${k5?`<button class="red" onclick="recycle(${d.id})">RECYCLER</button>`:'<button class="red" disabled>RECYCLER (hors équipe)</button>'}</div></div>`;return h};
function setSlot(id,k){const i=S.team.findIndex(d=>d.id===id);if(i<0)return;k=Math.min(k,S.team.length-1);[S.team[i],S.team[k]]=[S.team[k],S.team[i]];save();render()}
function fuse(id){const d=S.team.find(x=>x.id===id);if(!d||(d.star||0)>=5)return;const c=S.team.map((x,i)=>({x,i})).filter(o=>o.i>=3&&o.x.id!==id&&o.x.type===d.type).sort((a,b)=>(+!!(a.x.v&&a.x.v!=="normal"))-(+!!(b.x.v&&b.x.v!=="normal"))||a.x.level-b.x.level)[0];
 if(!c){alert("Aucun doublon disponible hors de l'équipe.");return}if(!confirm("Fusionner un doublon (niveau "+c.x.level+") pour +1★ ?"))return;
 S.team.splice(c.i,1);d.star=(d.star||0)+1;ens();bump("fusions");log(sp(d).name+" : fusion, "+d.star+"★.");save();render()}
function recycleValue(d){const r=sp(d).r,b={Commun:{stone:20,bone:1},Rare:{stone:60,bone:3,hide:1},"Épique":{stone:200,crystal:1,amber:1},"Légendaire":{stone:600,crystal:3,amber:3}}[r]||{stone:10},m=(1+(d.level-1)*.1)*((d.v&&d.v!=="normal")?1.5:1),o={};Object.keys(b).forEach(k=>o[k]=Math.round(b[k]*m));return o}
function recycle(id){const i=S.team.findIndex(x=>x.id===id);if(i<3){alert("Un dinosaure de l'équipe ne peut pas être recyclé.");return}const d=S.team[i],r=recycleValue(d);if(!confirm("Recycler "+sp(d).name+" contre "+fmt(r)+" ?"))return;S.team.splice(i,1);give(r);log("Recyclage : "+sp(d).name+" → "+fmt(r));save();render()}
function recycleCommons(){const l=S.team.map((d,i)=>({d,i})).filter(o=>o.i>=3&&sp(o.d).r==="Commun"&&(!o.d.v||o.d.v==="normal")&&!(o.d.star)&&o.d.level<=3);if(!l.length){alert("Aucun doublon commun de bas niveau à recycler.");return}
 const tot={};l.forEach(o=>{const r=recycleValue(o.d);Object.keys(r).forEach(k=>tot[k]=(tot[k]||0)+r[k])});if(!confirm("Recycler "+l.length+" communs (niv. ≤3, sans variante ni étoile) contre "+fmt(tot)+" ?"))return;
 const ids=new Set(l.map(o=>o.d.id));S.team=S.team.filter((d,i)=>i<3||!ids.has(d.id));give(tot);log("Recyclage de "+l.length+" communs → "+fmt(tot));save();render()}
let colF={r:"all",s:"rar",lim:12,book:false};
function colSet(k,v){colF[k]=v;if(k!=="lim")colF.lim=12;render()}
function renderCollection(){const ro=r=>RAR5.indexOf(r);let l=S.team.map((d,i)=>({d,i}));if(colF.r!=="all")l=l.filter(o=>sp(o.d).r===colF.r);
 const key={rar:o=>-(ro(sp(o.d).r)*1000+o.d.level+(o.d.star||0)*10),lvl:o=>-o.d.level,pow:o=>-power(o.d),new:o=>-o.d.id}[colF.s];l.sort((a,b)=>key(a)-key(b));
 const owned=new Set(S.team.map(d=>d.type)),nv=S.team.filter(d=>d.v&&d.v!=="normal").length,sel=(k,opts)=>`<select onchange="colSet('${k}',this.value)">${opts.map(([v,t])=>`<option value="${v}" ${colF[k]===v?"selected":""}>${t}</option>`).join("")}</select>`;
 let dex="";if(colF.book){dex='<div class="dex">'+Object.keys(SPEC).sort((a,b)=>RAR5.indexOf(SPEC[a].r)-RAR5.indexOf(SPEC[b].r)).map(k=>{const s=SPEC[k],has=owned.has(k),c=S.team.filter(d=>d.type===k).length;return `<div class="dx ${has?"":"no"}"><div class="a">${has?art(s.e):"❓"}</div><b>${has?esc(s.name):"???"}</b><div class="rarity ${rarityClass(s.r)}" style="font-size:8px">${esc(s.r)}</div>${has?"×"+c:""}</div>`}).join("")+"</div>"}
 $$("colTools").innerHTML=`<b>Collection : ${S.team.length} dinosaures</b><div class="muted tiny">Espèces ${owned.size}/${TOTAL_SP()} · Variantes ${nv} · Puissance équipe ${T3().reduce((s,d)=>s+power(d),0)}</div><div class="tools">${sel("r",[["all","Toutes raretés"],...RAR5.map(r=>[r,r])])}${sel("s",[["rar","Tri : rareté"],["lvl","Tri : niveau"],["pow","Tri : puissance"],["new","Tri : récents"]])}</div><div class="btns"><button class="blue" onclick="colSet('book',${!colF.book})">${colF.book?"MASQUER":"VOIR"} LE BESTIAIRE (${owned.size}/${TOTAL_SP()})</button><button class="red" onclick="recycleCommons()">RECYCLER COMMUNS INUTILES</button></div>${dex}`;
 $$("collection").innerHTML=l.slice(0,colF.lim).map(o=>card(o.d)).join("")+(l.length>colF.lim?`<button class="wide secondary" onclick="colSet('lim',${colF.lim+12})">VOIR PLUS (${l.length-colF.lim} restants)</button>`:"")+(l.length?"":'<div class="panel muted">Aucun dinosaure ne correspond au filtre.</div>')}
document.getElementById("forgeBox").insertAdjacentHTML("afterend",'<div class="panel" id="colTools"></div>');
document.getElementById("home").querySelector(".banner").insertAdjacentHTML("afterend",'<div class="panel" id="homeNext"></div>');
document.querySelector(".meters").insertAdjacentHTML("beforeend",'<div class="meter">⚔ <b id="powerM">0</b></div>');
/* ===== Gacha avec variantes ===== */

/* ===== Rendu général ===== */
const claimable=()=>allM().filter(([m,d])=>prog(m,d)>=m.g&&!(d?S.dclaimed:S.claimed)[m.id]).length;
render=function(){ens();topbar();
 const sc=document.querySelectorAll("#summon .panel .row .muted.tiny");if(sc[0])sc[0].textContent=CONFIG.summonCost1+" ticket(s) · 1 dinosaure";if(sc[1])sc[1].textContent=CONFIG.summonCost5+" tickets · 5 dinosaures";
 const dr=$$("dropRates");if(dr)dr.innerHTML=`Commun <b>${CONFIG.commonRate} %</b> · Rare <b>${CONFIG.rareRate} %</b> · Épique <b>${CONFIG.epicRate} %</b> · Légendaire <b>${CONFIG.legendRate} %</b><p class="muted">Variantes (toutes raretés) : Alpha 9 % · Ombre 5 % · Albinos 5 % · Doré 2 % · Prismatique 0,5 %. 100 % gratuit.</p>`;
 $$("leadTeam").innerHTML=T3().map((d,i)=>`<div class="dino"><div class="art">${art(sp(d).e)}</div><strong>${esc(sp(d).name)}</strong><small>NIV. ${d.level}${d.star?" · "+d.star+"★":""}</small><div class="rarity ${rarityClass(sp(d).r)}">${esc(sp(d).r)}</div><div class="tiny">${SK[SK_of(d)].i} ${PA_of(d)?PA[PA_of(d)].i:""}</div></div>`).join("");
 $$("feed").innerHTML=S.log.map(x=>"• "+esc(x)).join("<br>");
 const done=DAILY.filter(m=>prog(m,1)>=m.g).length;$$("dailyText").textContent="Missions du jour : "+done+"/"+DAILY.length+" terminées";$$("dailyBar").style.width=done/DAILY.length*100+"%";
 const cur=Math.min(100,S.stage+1),P=T3().reduce((s,d)=>s+power(d),0),spn=new Set(S.team.map(d=>d.type)).size,cl=claimable();
 $$("homeNext").innerHTML=S.stage>=100?`<b>🎉 Histoire terminée !</b><div class="muted tiny">Continue les donjons Cauchemar et complète le bestiaire (${spn}/${TOTAL_SP()}).</div>`:`<div class="row"><div class="bigicon">📍</div><div class="grow"><b>Aventure : niveau ${cur}/100</b><div class="muted tiny">${zoneOf(cur)[0]} · Puissance équipe ${P}</div><div class="progress"><i style="width:${S.stage}%"></i></div></div></div><button class="wide blue" onclick="startBattle({mode:'story',n:${cur}})">JOUER LE NIVEAU ${cur}</button><div class="tiny muted" style="margin-top:6px">Espèces ${spn}/${TOTAL_SP()} · Missions à récupérer : ${cl}</div>`;
 $$("powerM").textContent=P;Object.keys(MATS).forEach(k=>$$("m_"+k).textContent=S.mat[k]);
 const mb=document.querySelector('.bottomnav [data-screen="missions"]');if(mb)mb.innerHTML=`<span>📋</span>Missions${cl?`<b class="dot">${cl}</b>`:""}`;
 const c5=5*(S.gear+1),fb=$$("forgeBox");if(fb)fb.innerHTML=`<div class="row"><div class="bigicon">⚒️</div><div class="grow"><b>Forge primordiale · Niv. ${S.gear}</b><div class="muted tiny">Chaque niveau : +8 PV, +2 ATQ, +1 DÉF pour toute l'équipe.</div></div></div><button class="wide purple" onclick="forge()">AMÉLIORER · ${c5} 🔮</button>`;
 const p=$$("pityTxt");if(p)p.textContent="Garantie légendaire : "+S.pity+"/40";
 renderCollection();renderStory();renderDungeons();renderMissions();if(screen==="battle")renderBattle()};
/* ===== Équilibrage (les compétences renforcent le joueur) ===== */
H=n=>Math.round((60+n*28+n*n*1.1)*1.3);
/* ===== Admin local : compétences / attributs / ajout d'espèces ===== */
buildAdmin=function(){$$("economyFields").innerHTML=Object.keys(econLabels).map(k=>`<div><label>${econLabels[k]}</label><input id="econ_${k}" type="number" min="0" value="${CONFIG[k]}"></div>`).join("");
 $$("rateCommon").value=CONFIG.commonRate;$$("rateRare").value=CONFIG.rareRate;$$("rateEpic").value=CONFIG.epicRate;$$("rateLegend").value=CONFIG.legendRate;
 $$("adminDinos").innerHTML=Object.keys(SPEC).map(k=>adminForm(k,SPEC[k])).join("");updateRateTotal()};
function adminForm(k,d){const opt=(arr,v)=>arr.map(r=>`<option value="${esc(r[0])}" ${v===r[0]?"selected":""}>${esc(r[1])}</option>`).join("");
 return `<div class="adminitem" data-dino="${esc(k)}"><b>${esc(k.toUpperCase())}</b><div class="grid2"><div><label>Nom affiché</label><input data-field="name" value="${esc(d.name)}"></div><div><label>Image (emoji ou URL)</label><input data-field="e" value="${esc(d.e)}"></div><div><label>Rareté</label><select data-field="r">${opt(RAR5.map(r=>[r,r]),d.r)}</select></div><div><label>Type d'orbe</label><select data-field="element">${opt([["redorb","🔥 rouge"],["blueorb","💧 bleue"],["greenorb","🌿 verte"],["purpleorb","⚡ violette"],["goldorb","☀️ dorée"]],d.element)}</select></div><div><label>PV de base</label><input type="number" min="1" data-field="hp" value="${d.hp}"></div><div><label>Attaque de base</label><input type="number" min="1" data-field="atk" value="${d.atk}"></div><div><label>Défense de base</label><input type="number" min="0" data-field="def" value="${d.def}"></div><div><label>Compétence</label><select data-field="sk">${opt(Object.keys(SK).map(x=>[x,SK[x].i+" "+SK[x].n]),d.sk)}</select></div><div><label>Attribut spécial</label><select data-field="pa">${opt([["","— aucun —"],...Object.keys(PA).map(x=>[x,PA[x].i+" "+PA[x].n])],d.pa||"")}</select></div></div></div>`}
function addAdminDino(){const w=document.createElement("div");w.innerHTML=adminForm("dino_"+Date.now().toString(36),{name:"Nouveau dinosaure",e:"🦖",r:"Commun",hp:100,atk:15,def:10,element:"redorb",sk:"strike",pa:""});const el=w.firstElementChild;$$("adminDinos").appendChild(el);el.scrollIntoView({block:"center"})}
$$("adminDinos").insertAdjacentHTML("afterend",'<button class="wide blue" onclick="addAdminDino()">+ AJOUTER UN DINOSAURE</button>');
