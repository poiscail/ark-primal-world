/* Combat III (0.30) : duos d'ennemis (idées 13-14) et grand plateau 4×4 (idée 20).
   - Duo : dans certains combats, les deux premiers ennemis arrivent ensemble ; on choisit sa cible d'un clic (gauche ou
     droit) sur l'autre ennemi, sans perdre son tour ; les deux attaquent à chaque tour (le second décalé d'un tour pour ne
     pas cumuler deux attaques puissantes). Compensation : PV ×C4.duoHp, ATQ ×C4.duoAtk. La cible courante est f.wave
     (0 ou 1) ; quand l'une tombe, killEnemy est appelé avec les ennemis rangés pour que la vague suivante soit la survivante.
   - Grand plateau 4×4 : Cauchemar, Grand Nord et Tour dès l'étage 30. Le boost d'orbes compte les orbes de même couleur
     ramenés à un plateau de 9 (sinon 16 orbes donneraient des boosts bien plus forts).
   Décidés au premier rendu (les modes remplacent le combat d'histoire). */
const C4={duoP:.3,duoMin:20,duoHp:.9,duoAtk:.7};
const c4On=f=>!!(f&&f.mx&&!f.over);
function c4Setup(f){if(f.c4Set)return;f.c4Set=1;const m=f.o&&f.o.mode||"story";
 if(m==="nightmare"||m==="far"||(m==="tower"&&S.tower&&S.tower.floor>=30))f.big4=1;
 const lvl=m==="story"?(f.o.n||0):m==="far"||m==="nightmare"?99:0;
 if(!f.raid&&!f.daily&&f.wave===0&&lvl>=C4.duoMin&&/^(story|far|nightmare)$/.test(m)&&Math.random()<C4.duoP){const a=f.enemies[0],b=f.enemies[1];
  if(a&&b&&!a.boss&&!b.boss&&a.hp===a.max&&b.hp===b.max){f.duo=1;[a,b].forEach(e=>{e.max=Math.round(e.max*C4.duoHp);e.hp=e.max;e.atk=Math.round(e.atk*C4.duoAtk);if(e.a0)e.a0=e.atk;if(e.tr==="shield")e.sh=Math.round(e.max*.2)})}}}
const c4Other=f=>{if(!f||!f.duo||f.wave>1)return -1;const o=1-f.wave,e=f.enemies[o];return e&&e.hp>0?o:-1};
function c4Target(i){const f=fight;if(!c4On(f)||!f.duo||f.wave>1||i===f.wave||!(i===0||i===1))return;const e=f.enemies[i];if(!e||e.hp<=0)return;if(typeof CUT!=="undefined"&&CUT)return;
 f.wave=i;f.log="🎯 Cible : "+e.name;try{sfx("tap")}catch(x){}renderBattle()}
/* tour ennemi : l'autre ennemi du duo attaque aussi, un tour plus tard dans le cycle des attaques puissantes */
const _etC4=enemyTurn;enemyTurn=function(){const f=fight;const r=_etC4();if(c4On(f)&&f.duo){const cur=f.wave,o=c4Other(f);
  if(o>=0&&cur<2){const t0=f.turn,st=f.stun;f.wave=o;f.turn=t0+1;f.stun=0;try{_etC4()}finally{if(f.wave===o)f.wave=cur;f.turn=t0;f.stun=st}}}return r};
/* un ennemi du duo tombe : la vague suivante est l'autre (s'il vit) puis la dernière */
const _keC4=killEnemy;killEnemy=function(){const f=fight;if(f&&f.duo&&f.wave<2){const cur=f.wave,o=1-cur,alive=f.enemies[o]&&f.enemies[o].hp>0;
  if(alive&&cur===1){[f.enemies[0],f.enemies[1]]=[f.enemies[1],f.enemies[0]];f.wave=0}
  else if(!alive&&cur===0){[f.enemies[0],f.enemies[1]]=[f.enemies[1],f.enemies[0]];f.wave=1}
  const r=_keC4();if(alive&&!f.over)f.log+=" · il reste "+f.enemies[1].name;return r}return _keC4()};
/* grand plateau : 16 orbes ; le boost compte les orbes de même couleur ramenées à un plateau de 9 */
function c4Orbs(f){if(!f||!f.big4||!f.orbs)return;while(f.orbs.length<16)f.orbs.push(EL[rnd(5)]);
 if(!f.orbs.__c4){Object.defineProperty(f.orbs,"filter",{value:function(fn){const r=Array.prototype.filter.call(this,fn);return r.slice(0,Math.round(r.length*9/16))},enumerable:false});Object.defineProperty(f.orbs,"__c4",{value:1,enumerable:false})}}
const _toC4=tapOrb;tapOrb=function(i){c4Orbs(fight);return _toC4(i)};
const _opC4=orbPreview;orbPreview=function(c){c4Orbs(fight);return _opC4(c)};
/* affichage */
const _rbC4=renderBattle;renderBattle=function(){const f0=fight;if(f0&&f0.mx&&!f0.over&&f0.enemies){c4Setup(f0);c4Orbs(f0)}_rbC4();const f=fight,box=$$("battleArea");if(!box||!c4On(f))return;
 const ob=box.querySelector(".orbboard");if(ob&&f.big4){ob.classList.remove("n3");ob.classList.add("n4")}
 const o=c4Other(f),stage=box.querySelector(".battlestage");if(!stage)return;stage.classList.toggle("duo",o>=0);if(o<0||stage.querySelector(".sEnemy2"))return;const e=f.enemies[o];
 try{bnName(e,f)}catch(x){}let art="";try{art=PREFS.art==="svg"&&typeof enemySVG==="function"?enemySVG(e,f):""}catch(x){}if(!art)art=`<span class="emo">${esc(e.e)}</span>`;else art=`<span class="pt">${art}</span>`;
 stage.insertAdjacentHTML("beforeend",`<div class="sEnemy2" role="button" tabindex="0" onclick="c4Target(${o})" oncontextmenu="event.preventDefault();c4Target(${o})" title="Clic : viser ${esc(e.name)}"><div class="s2a">${art}</div><div class="s2n">${esc(String(e.name).split(" · ").pop())}</div><div class="s2b"><i style="width:${Math.max(0,e.hp/e.max*100)}%"></i></div></div>`);
 const se=stage.querySelector(".sEnemy");if(se)se.insertAdjacentHTML("beforeend",'<b class="c4tgt">🎯</b>');
 const ch=box.querySelector(".sHud .fchips");if(ch&&!ch.querySelector(".c4chip"))ch.insertAdjacentHTML("beforeend",'<span class="chip hot c4chip" title="Deux ennemis attaquent en même temps. Clique sur l\'autre ennemi pour le viser.">👥 Duo</span>')};
if(typeof GUIDE!=="undefined")GUIDE.push(["Duos et grand plateau","Dès le niveau 20 de l'histoire (et dans le Grand Nord et le Cauchemar), deux ennemis arrivent parfois ensemble : ils attaquent tous les deux, chacun à son rythme. Clique sur l'autre ennemi pour le viser, sans perdre ton tour. Dans le Cauchemar, le Grand Nord et la Tour dès l'étage 30, le plateau passe à 16 orbes : plus de choix, même force de boost."]);
