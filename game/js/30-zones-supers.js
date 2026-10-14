/* Zones, attaque puissante, super attaques par élément */
const ZONES=[["Jungle",["🐊","🦎","🐍"],"greenorb"],["Ruines",["☠️","🦴","🪲"],"blueorb"],["Volcan",["🦂","🔥","🐲"],"redorb"],["Obélisque",["👾","🗿","⚡"],"purpleorb"]];
const _sb=startBattle;startBattle=function(){_sb();const z=ZONES[Math.min(S.chapter,3)];fight.zone=z[0];fight.enemies.forEach((e,i)=>{e.e=i===2?"👹":z[1][i];e.name=i===2?"Gardien · "+z[0]:"Prédateur · "+z[0];e.el=i===1?EL[rnd(3)]:z[2]});fight.turn=0;fight.stun=0;renderBattle()};
function hit(dmg,msg){const e=fight.enemies[fight.wave];fight.pop=dmg;e.hp-=dmg;fight.log=msg;fight.orbs=newOrbs();
if(e.hp<=0){if(fight.wave===2)return win();fight.wave++;fight.turn=0;fight.stun=0;fight.log+=" · Ennemi vaincu ! Vague suivante.";return renderBattle()}
fight.turn++;if(fight.stun>0){fight.stun--;fight.log+=" · l'ennemi est étourdi !";return renderBattle()}
const t=S.team.slice(0,3),al=t.map((d,k)=>k).filter(k=>fight.hp[k]>0),k=al[rnd(al.length)],d=t[k],big=fight.turn%3===0;
let dm=Math.max(1,Math.round((e.atk+rnd(5))*(BEAT[e.el]===sp(d).element?1.3:1)*(big?2.2:1)-stats(d).def/2));fight.hp[k]=Math.max(0,fight.hp[k]-dm);fight.log+=(big?" · ⚠ ATTAQUE PUISSANTE sur ":" · ")+sp(d).name+" subit "+dm;
if(fight.hp.every(h=>h<=0)){fight.over="lose";log("Défaite. Entraîne tes dinosaures puis réessaie.");save()}renderBattle()}
function special(){if(!fight||fight.over||fight.sp<100)return;fight.sp=0;const t=S.team.slice(0,3),el=sp(t[0]).element;let dmg=Math.round(2.5*t.reduce((s,d,k)=>s+(fight.hp[k]>0?stats(d).atk:0),0)),x="";
if(el==="greenorb"){t.forEach((d,k)=>{if(fight.hp[k]>0)fight.hp[k]=Math.min(stats(d).hp,fight.hp[k]+Math.round(stats(d).hp*.35))});dmg=Math.round(dmg*.8);x=" · équipe soignée de 35%"}
else if(el==="blueorb"){fight.stun=1;x=" · ennemi étourdi"}else if(el==="goldorb")dmg=Math.round(dmg*1.4);else if(el==="purpleorb"){dmg=Math.round(dmg*1.2);fight.spKeep=30}else dmg=Math.round(dmg*1.25);
hit(dmg,"💥 SUPER "+ICO[el]+" : "+dmg+" dégâts"+x);if(fight.spKeep){fight.sp=fight.spKeep;fight.spKeep=0;renderBattle()}}
const _rb2=renderBattle;renderBattle=function(){_rb2();if(!fight)return;const T=document.getElementById("battleTitle");T.textContent=fight.zone+" · "+T.textContent;
if(!fight.over){const n=3-fight.turn%3,b=document.querySelector("#battleArea .panel .grow");if(b)b.insertAdjacentHTML("beforeend",`<div class="tiny" style="color:${n===1?"#ff8095":"#aab6d1"}">${n===1?"⚠ Prochaine attaque PUISSANTE !":"Attaque puissante dans "+n+" tours"}${fight.stun?" · étourdi":""}</div>`)}};
const _w=win;win=function(){_w();if(Math.random()<.25){S.tickets++;log("Le gardien laisse tomber un ticket !");save();render()}};
