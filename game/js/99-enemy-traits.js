/* Traits d'ennemis (bouclier, venin, soin, rage) et phases de boss */
const TRAITS={shield:{i:"🛡️",n:"Carapace",d:"Absorbe les premiers dégâts (20 % de ses PV)"},venom:{i:"☠️",n:"Venimeux",d:"Ses attaques empoisonnent (3 tours)"},heal:{i:"💚",n:"Régénérant",d:"Récupère 5 % de ses PV par tour"},berserk:{i:"🩸",n:"Berserker",d:"Frappe de plus en plus fort chaque tour"}};
const TKEYS=Object.keys(TRAITS),BOSSLINES=[["Le sol tremble…","Le boss se couvre d'une carapace d'énergie !"],["Rrrrraaaah !","Le boss libère un venin mortel !"]];
function traitOf(e){const f=fight;if(e.tr!==undefined)return e.tr;e.tr="";if(!f||!f.o||!["story","dungeon","event"].includes(f.o.mode)||e.boss)return e.tr;const n=f.n||0;if(n>=8&&Math.random()<Math.min(.55,.2+n/200)){e.tr=TKEYS[rnd(TKEYS.length)];if(e.tr==="shield")e.sh=Math.round(e.max*.2);if(e.tr==="berserk")e.a0=e.atk}return e.tr}
const _aa99=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(f&&!f.over){const e=f.enemies[f.wave];traitOf(e);if(e.sh>0&&dmg>0){const ab=Math.min(e.sh,dmg);e.sh-=ab;dmg-=ab;msg+=" · 🛡️ absorbé "+ab}}
 const e0=f&&f.enemies[f.wave];const r=_aa99(dmg,msg,endTurn);
 if(f&&!f.over&&f.enemies[f.wave]===e0&&e0.boss&&e0.hp>0){if(!e0.p1&&e0.hp<=e0.max*.66){e0.p1=1;e0.sh=Math.round(e0.max*.15);f.log+=" · "+BOSSLINES[0][1];if(typeof banner==="function")banner("PHASE 2",BOSSLINES[0][0],"boss");renderBattle()}
  if(!e0.p2&&e0.hp<=e0.max*.33){e0.p2=1;e0.a0=e0.a0||e0.atk;e0.atk=Math.round(e0.atk*1.2);f.pz=f.pz||[0,0,0];S.team.slice(0,3).forEach((d,k)=>{if(f.hp[k]>0)f.pz[k]=3});f.log+=" · "+BOSSLINES[1][1];if(typeof banner==="function")banner("PHASE 3",BOSSLINES[1][0],"boss");renderBattle()}}
 return r};
const _et99=enemyTurn;enemyTurn=function(){const f=fight,e=f.enemies[f.wave];f.pz=f.pz||[0,0,0];const tr=traitOf(e);
 const dead=f.hp.map(h=>h<=0);
 f.pz.forEach((n,k)=>{if(n>0&&f.hp[k]>0){const dm=Math.max(1,Math.round(f.mx[k]*.03));f.hp[k]=Math.max(1,f.hp[k]-dm);f.hurt=f.hurt||{};f.hurt[k]=(f.hurt[k]||0)+dm;f.pz[k]--;f.log+=" · ☠️ poison "+dm}});
 _et99();
 if(f.over)return;
 if(tr==="venom"){Object.keys(f.hurt||{}).forEach(k=>{if(f.hp[k]>0)f.pz[k]=3})}
 if(tr==="heal"&&e.hp>0&&e.hp<e.max){const h=Math.round(e.max*.05);e.hp=Math.min(e.max,e.hp+h);f.log+=" · 💚 +"+h}
 if(tr==="berserk"&&e.a0)e.atk=Math.min(Math.round(e.a0*1.5),Math.round(e.atk+e.a0*.06))};
const _rb99=renderBattle;renderBattle=function(){_rb99();const f=fight;if(!f||!f.mx||!f.enemies)return;const e=f.enemies[f.wave];traitOf(e);const ch=document.querySelector("#battleArea .panel .fchips");
 if(ch){const add=[];if(e.tr)add.push(`<span class="chip hot" title="${TRAITS[e.tr].d}">${TRAITS[e.tr].i} ${TRAITS[e.tr].n}</span>`);if(e.sh>0)add.push(`<span class="chip good">🛡️ bouclier ${e.sh}</span>`);if(e.boss)add.push(`<span class="chip hot">Phase ${e.p2?3:e.p1?2:1}/3</span>`);ch.insertAdjacentHTML("beforeend",add.join(""))}
 if(f.pz)document.querySelectorAll("#battleArea .row .bigicon:not(.hit)").forEach((el,k)=>{if(f.pz[k]>0)el.insertAdjacentHTML("beforeend",'<i class="pzico">☠️</i>')})};
