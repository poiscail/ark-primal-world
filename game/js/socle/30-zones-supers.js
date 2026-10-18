/* Zones, attaque puissante, super attaques par élément */
const ZONES=[["Jungle",["🐊","🦎","🐍"],"greenorb"],["Ruines",["☠️","🦴","🪲"],"blueorb"],["Volcan",["🦂","🔥","🐲"],"redorb"],["Obélisque",["👾","🗿","⚡"],"purpleorb"]];

function hit(dmg,msg){const e=fight.enemies[fight.wave];fight.pop=dmg;e.hp-=dmg;fight.log=msg;fight.orbs=newOrbs();
if(e.hp<=0){if(fight.wave===2)return win();fight.wave++;fight.turn=0;fight.stun=0;fight.log+=" · Ennemi vaincu ! Vague suivante.";return renderBattle()}
fight.turn++;if(fight.stun>0){fight.stun--;fight.log+=" · l'ennemi est étourdi !";return renderBattle()}
const t=S.team.slice(0,3),al=t.map((d,k)=>k).filter(k=>fight.hp[k]>0),k=al[rnd(al.length)],d=t[k],big=fight.turn%3===0;
let dm=Math.max(1,Math.round((e.atk+rnd(5))*(BEAT[e.el]===sp(d).element?1.3:1)*(big?2.2:1)-stats(d).def/2));fight.hp[k]=Math.max(0,fight.hp[k]-dm);fight.log+=(big?" · ⚠ ATTAQUE PUISSANTE sur ":" · ")+sp(d).name+" subit "+dm;
if(fight.hp.every(h=>h<=0)){fight.over="lose";log("Défaite. Entraîne tes dinosaures puis réessaie.");save()}renderBattle()}



