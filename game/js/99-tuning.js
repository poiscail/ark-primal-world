/* Réglage d'équilibrage v0.11 : compense le boost d'orbes (mesuré par simulation, voir tests/test_balance*.py) */
const TUNE={h:1.3,a:1.15};
const _Ht=H,_At=A;H=n=>Math.round(_Ht(n)*TUNE.h);A=n=>_At(n)*TUNE.a;
/* Réglage 0.13 : en Arène, les équipes « Redoutable » sont renforcées. Avec les compétences ennemies seules, une équipe préparée
   (bot de simulation) y gagnait encore 100 % des combats ; cible ≈ 80 % (Équilibré reste ≈ 100 %), voir CHANGELOG. */
const ARENA_TUNE={hp:[1,1,1.1],atk:[1,1,1.05]};
const _maT=MODES.arena;MODES.arena=function(o){const r=_maT(o),d=o.d||0;r.enemies.forEach(e=>{e.hp=e.max=Math.round(e.max*(ARENA_TUNE.hp[d]||1));e.atk=Math.round(e.atk*(ARENA_TUNE.atk[d]||1))});return r};
