/* Réglage d'équilibrage v0.11 : compense le boost d'orbes (mesuré par simulation, voir tests/test_balance*.py) */
const TUNE={h:1.3,a:1.15};
const _Ht=H,_At=A;H=n=>Math.round(_Ht(n)*TUNE.h);A=n=>_At(n)*TUNE.a;
/* Réglage 0.13 : en Arène, les équipes « Redoutable » sont renforcées. Avec les compétences ennemies seules, une équipe préparée
   (bot de simulation) y gagnait encore 100 % des combats ; cible ≈ 80 % (Équilibré reste ≈ 100 %), voir CHANGELOG.
   Réglage 0.20 : avec le chef d'équipe et les liens, une équipe de 3 théropodes repassait à 100 % au classement 1700 ;
   Redoutable +20 % PV / +10 % ATQ (au lieu de +10 / +5), Équilibré +5 % PV ; l'adversaire a aussi son chef et ses liens (99-leader). */
const ARENA_TUNE={hp:[1,1.05,1.2],atk:[1,1,1.1]};
const _maT=MODES.arena;MODES.arena=function(o){const r=_maT(o),d=o.d||0;r.enemies.forEach(e=>{e.hp=e.max=Math.round(e.max*(ARENA_TUNE.hp[d]||1));e.atk=Math.round(e.atk*(ARENA_TUNE.atk[d]||1))});return r};
