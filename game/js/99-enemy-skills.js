/* Compétences ennemies : en Arène, chaque dinosaure adverse utilise la compétence de son espèce ; les gardiens de la Tour
   (tous les 10 étages) en ont une aussi. Première utilisation au 2e tour ennemi, puis tous les 4 tours ; jamais sur un tour
   d'attaque puissante. L'intention est affichée dans le HUD. Les compétences offensives remplacent l'attaque normale. */
const ES_CD=4,ES_FIRST=2;
const ES_TXT={strike:"frappe fort une cible (×2)",cleave:"frappe toute l'équipe (×0,9)",stun:"choc : bloque la compétence d'un dino (+2 tours)",burn:"brûle une cible (3 tours)",poison:"empoisonne toute l'équipe (3 tours)",
 drain:"dévore une cible et se soigne",execute:"achève le dino le plus faible",roar:"ATQ +30 % pendant 3 tours",heal:"se soigne de 20 %",selfheal:"se soigne de 25 %",shield:"bouclier de 15 % de ses PV",
 focus:"sa prochaine attaque est critique",charge:"vole 30 % de ta jauge de super",reorb:"brouille tes orbes"};
const ES_DMG=new Set(["strike","cleave","stun","burn","drain","execute"]);
/* Tour : pas de soin ni de bouclier pour les gardiens (ils rallongeaient trop les combats : 60 % de victoires à l'étage 40 en simulation) */
const ES_TOWER=["strike","cleave","burn","roar","focus","charge","stun","drain","execute","poison","reorb"];
function esOf(e,f){if(e.esk!==undefined)return e.esk;let id="";
 if(f&&f.o&&f.o.mode==="arena"&&e.pt&&SPEC[e.pt]){const s=SPEC[e.pt].sk;id=SK[s]?s:(DEFSK[SPEC[e.pt].element]||"strike")}
 else if(f&&f.o&&f.o.mode==="tower"&&e.boss)id=ES_TOWER[(S.tower.floor/10|0)%ES_TOWER.length];
 e.esk=id;e.skcd=ES_FIRST;return id}
function esHit(k,mul,e){if(k<0)return 0;const b=fight.hp[k];hitDino(k,(e.atk+rnd(5))*mul,e);return Math.max(0,b-fight.hp[k])}
function esWeak(){const f=fight;let b=-1,bv=2;f.hp.forEach((h,k)=>{if(h>0){const r=h/f.mx[k];if(r<bv){bv=r;b=k}}});return b}
function enemySkill(e,f){const id=e.esk,s=SK[id];f.log+=" · ✨ "+e.name.split(" · ")[0]+" : "+s.n;f.esUsed=(f.esUsed||0)+1;f.pz=f.pz||[0,0,0];
 switch(id){
  case"strike":esHit(pickTarget(),2,e);break;
  case"cleave":T3().forEach((d,k)=>{if(alive(k))esHit(k,.9,e)});break;
  case"stun":{const k=pickTarget();esHit(k,1,e);if(k>=0&&alive(k)){f.cd[k]+=2;f.log+=" ("+sp(T3()[k]).name+" : compétence bloquée)"}break}
  case"burn":{const k=pickTarget();esHit(k,.8,e);if(k>=0&&alive(k))f.pz[k]=Math.max(f.pz[k]||0,3);break}
  case"drain":{const got=esHit(pickTarget(),1.6,e),h=Math.round(got*.5);if(h>0){e.hp=Math.min(e.max,e.hp+h);f.log+=" · 🩸 +"+h}break}
  case"execute":{const k=esWeak();if(k>=0)esHit(k,f.hp[k]<f.mx[k]*.3?3.2:1.6,e);break}
  case"poison":T3().forEach((d,k)=>{if(alive(k))f.pz[k]=Math.max(f.pz[k]||0,3)});break;
  case"roar":if(!e._roar){e._atk0=e.atk;e.atk=Math.round(e.atk*1.3)}e._roar=3;break;
  case"heal":case"selfheal":{const h=Math.round(e.max*(id==="heal"?.2:.25));e.hp=Math.min(e.max,e.hp+h);f.log+=" · 💚 +"+h;break}
  case"shield":e.sh=(e.sh||0)+Math.round(e.max*.15);break;
  case"focus":e._crit=1;break;
  case"charge":f.sp=Math.max(0,f.sp-30);break;
  case"reorb":f.orbs=newOrbs();f.combo=0;f.last=null;break}
 if(typeof banner==="function")banner(s.i+" "+s.n,esc(e.name.split(" · ")[0]),"eskill");return ES_DMG.has(id)}
/* tour ennemi : la compétence remplace l'attaque (offensive) ou s'y ajoute (soutien) */
const _hdES=hitDino;hitDino=function(k,raw,e){const f=fight;if(f&&f._noHit)return;if(e&&e._crit&&!f._esIn){raw*=1.6;e._crit=0;f.log+=" · 🎯 critique"}return _hdES(k,raw,e)};
const _etES=enemyTurn;enemyTurn=function(){const f=fight,e=f&&!f.over&&f.enemies?f.enemies[f.wave]:null;
 if(!e||e.hp<=0||!esOf(e,f)||f.stun>0)return _etES();
 if(e._roar&&--e._roar<=0){e.atk=e._atk0||e.atk;e._roar=0}
 e.skcd--;if(e.skcd>0||f.turn%3===0)return _etES();
 e.skcd=ES_CD;f._esIn=1;let dmg;try{dmg=enemySkill(e,f)}finally{f._esIn=0}
 if(!dmg)return _etES();const n0=f.log.length;f._noHit=1;try{_etES()}finally{f._noHit=0}
 f.log=f.log.slice(0,n0)+f.log.slice(n0).replace(" · 🌋 ATTAQUE DE ZONE","").replace(" · ⚠ ATTAQUE PUISSANTE","")};
/* intention dans le HUD */
const _rbES=renderBattle;renderBattle=function(){_rbES();const f=fight;if(!f||!f.mx||f.over||!f.enemies)return;const e=f.enemies[f.wave];if(!e||!esOf(e,f))return;
 const ch=document.querySelector("#battleArea .sHud .fchips")||document.querySelector("#battleArea .panel .fchips");if(!ch)return;const s=SK[e.esk],n=Math.max(1,e.skcd+(f.stun>0?1:0));
 ch.insertAdjacentHTML("beforeend",`<span class="chip ${n<=1?"hot":""} eskchip" title="${esc(s.n)} : ${esc(ES_TXT[e.esk]||s.d)}">${s.i} ${esc(s.n)} ${n<=1?"au prochain tour !":"dans "+n+" tours"}</span>`)};
/* l'IA d'auto-combat se protège aussi avant une compétence ennemie offensive */
if(typeof autoWant==="function"){const _awES=autoWant;autoWant=function(id,f,e,t){if((id==="shield"||id==="stun")&&e.esk&&ES_DMG.has(e.esk)&&e.skcd<=1&&!f.stun&&(id!=="shield"||f.buff.shield<=0))return true;return _awES(id,f,e,t)}}
if(typeof GUIDE!=="undefined")GUIDE.push(["Compétences ennemies","En Arène, chaque dinosaure adverse utilise la compétence de son espèce (les gardiens de la Tour aussi) : première fois au 2e tour, puis tous les 4 tours. Le HUD annonce laquelle et quand : protège-toi (Carapace, Choc sismique) ou garde tes soins pour après."]);
/* écran Arène : le rappeler */
const _raES=renderArena;renderArena=function(){_raES();const p=document.querySelector("#arena .banner+.panel");if(p&&!p.querySelector(".esnote")){const t=typeof ARENA_TUNE!=="undefined"?Math.round((ARENA_TUNE.hp[2]-1)*100):0;
 p.insertAdjacentHTML("beforeend",`<div class="tiny muted esnote" style="margin-top:6px">✨ Les adversaires utilisent la compétence de leur espèce (annoncée pendant le combat).${t>0?" Équipes Redoutable renforcées : +"+t+" % de PV.":""}</div>`)}};
